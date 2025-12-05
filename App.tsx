import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS } from './types';
import { INITIAL_FISH, PRESET_CONDITIONS } from './constants';
import FishCard from './components/FishCard';
import FishFormModal from './components/FishFormModal';
import FishDetailModal from './components/FishDetailModal';

// Firebase imports
import { db } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

const App: React.FC = () => {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Basic Filter
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterBattle, setFilterBattle] = useState<'all' | 'yes' | 'no'>('all');

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // Dev Mode States
  const [isDevMode, setIsDevMode] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);

  // Detail Modal State (For Simple Mode)
  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);

  // 1. Real-time Data Sync with Firebase
  useEffect(() => {
    setLoading(true);
    // Subscribe to the "fishes" collection
    const q = query(collection(db, "fishes")); 
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFish: Fish[] = [];
      snapshot.forEach((doc) => {
        // Handle potential missing fields from older data
        const data = doc.data() as any;
        fetchedFish.push({
            ...data,
            depth: data.depth || data.location || '', // Fallback for migration
            variants: data.variants || (data.imageUrl ? { normalMale: data.imageUrl } : {}) // Fallback
        } as Fish);
      });
      
      // Sort locally by ID
      fetchedFish.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      
      setFishList(fetchedFish);
      setLoading(false);
    }, (err) => {
      console.error("Firebase connection error:", err);
      if (err.message.includes("api-key")) {
        setError("請設定 Firebase API Key (請見 src/firebaseConfig.ts)");
      } else {
        setError("無法連接資料庫，請檢查網路或 Firebase 設定");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Extract all unique tags for filter UI
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fishList.forEach(fish => {
      fish.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [fishList]);

  // Extract all unique conditions for filter UI
  const allConditions = useMemo(() => {
    const conds = new Set<string>();
    PRESET_CONDITIONS.forEach(c => conds.add(c));
    fishList.forEach(fish => {
      fish.conditions.forEach(c => conds.add(c));
    });
    return Array.from(conds).sort();
  }, [fishList]);

  // Filter Logic
  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      // 1. Basic Rarity
      if (selectedRarity !== 'ALL' && fish.rarity !== selectedRarity) return false;

      // 2. Search Term (Name, ID, Depth)
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        fish.name.toLowerCase().includes(term) || 
        fish.depth.toLowerCase().includes(term) || 
        fish.id.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // 3. Advanced: Tags (Must match ALL selected tags)
      if (filterTags.length > 0) {
        const hasAllTags = filterTags.every(t => fish.tags.includes(t));
        if (!hasAllTags) return false;
      }

      // 4. Advanced: Conditions (Must match ALL selected conditions)
      if (filterConditions.length > 0) {
        const hasAllConds = filterConditions.every(c => fish.conditions.includes(c));
        if (!hasAllConds) return false;
      }

      // 5. Advanced: Battle Requirements
      if (filterBattle === 'yes' && (!fish.battleRequirements || fish.battleRequirements.trim() === '')) return false;
      if (filterBattle === 'no' && fish.battleRequirements && fish.battleRequirements.trim() !== '') return false;

      return true;
    });
  }, [fishList, selectedRarity, searchTerm, filterTags, filterConditions, filterBattle]);

  // CRUD Handlers
  const handleEditClick = (fish: Fish) => {
    setEditingFish(fish);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingFish(null);
    setIsFormModalOpen(true);
  };

  const handleSaveFish = async (fish: Fish) => {
    try {
      if (editingFish && editingFish.id !== fish.id) {
          await deleteDoc(doc(db, "fishes", editingFish.id));
      }
      
      // Clean up deprecated fields before saving if they exist in state but not in type
      const fishToSave = { ...fish };
      delete (fishToSave as any).location;
      delete (fishToSave as any).imageUrl;

      await setDoc(doc(db, "fishes", fish.id), fishToSave);
      
      setIsFormModalOpen(false);
      setEditingFish(null);
    } catch (e) {
      console.error("Error saving fish: ", e);
      alert("儲存失敗，請檢查控制台或權限設定");
    }
  };

  const handleDeleteFish = async (id: string) => {
    if (window.confirm('確定要永久刪除此魚種資料嗎？(此操作會同步至雲端)')) {
      try {
        await deleteDoc(doc(db, "fishes", id));
      } catch (e) {
        console.error("Error deleting fish: ", e);
        alert("刪除失敗");
      }
    }
  };

  // Upload Initial Data (Dev Mode Only)
  const handleUploadInitialData = async () => {
    if (!window.confirm(`確定要將 ${INITIAL_FISH.length} 筆預設資料匯入資料庫嗎？若編號重複將會覆蓋。`)) return;
    
    setLoading(true);
    try {
      // Need to map INITIAL_FISH to remove deprecated fields if they exist
      const promises = INITIAL_FISH.map(fish => {
          const fishToSave = { ...fish };
          delete (fishToSave as any).location;
          delete (fishToSave as any).imageUrl;
          return setDoc(doc(db, "fishes", fish.id), fishToSave);
      });
      await Promise.all(promises);
      alert("匯入成功！");
    } catch (e) {
      console.error(e);
      alert("匯入失敗，請檢查 Console");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (fish: Fish) => {
    if (viewMode === 'simple') {
      setSelectedDetailFish(fish);
    }
  };

  const handleDevToggle = () => {
    if (isDevMode) {
      setIsDevMode(false);
    } else {
      const password = prompt("請輸入開發者密碼以啟用編輯模式：");
      if (password === "fishdev") {
        setIsDevMode(true);
      } else if (password !== null) {
        alert("密碼錯誤，拒絕存取。");
      }
    }
  };

  const toggleFilter = (item: string, currentList: string[], setter: (val: string[]) => void) => {
    setter(currentList.includes(item) ? currentList.filter(t => t !== item) : [...currentList, item]);
  };

  // Statistics
  const totalCount = fishList.length;

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 bg-slate-950">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-20 py-4 md:py-0 gap-4">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-300 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-2xl">🐟</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  FishWiki 
                  {isDevMode && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/50 rounded uppercase tracking-wider">Dev Mode</span>}
                </h1>
                <p className="text-xs text-slate-400">釣魚遊戲官方圖鑑</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="搜尋編號、名稱或水深..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               {/* View Mode Toggle */}
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button 
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'simple' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    title="簡易模式 (圖片)"
                  >
                    🖼️ 簡易
                  </button>
                  <button 
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'detailed' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    title="詳細模式 (卡片)"
                  >
                    📋 詳細
                  </button>
               </div>

               {/* Dev Mode Toggle */}
               <button 
                 onClick={handleDevToggle}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isDevMode ? 'bg-red-900/30 border-red-500 text-red-300 hover:bg-red-900/50' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
               >
                 {isDevMode ? '🔓 開發者' : '🔒 訪客'}
               </button>

              {/* Dev Only Actions */}
              {isDevMode && (
                <div className="flex gap-2">
                   <button
                   onClick={handleUploadInitialData}
                   className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 border border-orange-400/30"
                   title="將 constants.ts 中的初始資料寫入資料庫"
                 >
                   <span>☁️</span>
                   <span className="hidden sm:inline">匯入預設</span>
                 </button>

                 <button
                   onClick={handleCreateClick}
                   className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 border border-green-400/30"
                 >
                   <span>＋</span>
                   <span className="hidden sm:inline">新增</span>
                 </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Loading / Error State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">正在同步雲端圖鑑...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl text-center mb-8">
            <h3 className="font-bold text-lg mb-1">連線錯誤</h3>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 opacity-70">如果您是網站管理員，請確認 src/firebaseConfig.ts 設定是否正確。</p>
          </div>
        )}

        {/* Dashboard / Stats (Only show if loaded) */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center">
                    <div className="text-xl">📚</div>
                    <div className="text-xl font-bold text-white mt-1">{totalCount}</div>
                    <div className="text-xs text-slate-400">總數</div>
                </div>
                
                {RARITY_ORDER.map(rarity => {
                  const count = fishList.filter(f => f.rarity === rarity).length;
                  const colorStyle = RARITY_COLORS[rarity].split(' ')[0]; // Extract text color
                  return (
                    <div key={rarity} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
                       <div className={`text-xl font-black ${colorStyle} drop-shadow-sm`}>{rarity}</div>
                       <div className="text-xl font-bold text-white mt-1">{count}</div>
                       <div className="text-xs text-slate-500">總數</div>
                    </div>
                  );
                })}
            </div>

            {/* Filter Section */}
            <div className="mb-8 space-y-4">
              {/* Rarity Tabs */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  onClick={() => setSelectedRarity('ALL')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedRarity === 'ALL'
                      ? 'bg-white text-slate-900 shadow-lg scale-105'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  全部
                </button>
                {RARITY_ORDER.map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      selectedRarity === rarity
                        ? 'bg-slate-700 border-slate-500 text-white shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
                
                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  <span>⚙️ 進階篩選</span>
                  <span className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Tags */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">標籤篩選 (多選)</label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.length > 0 ? allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleFilter(tag, filterTags, setFilterTags)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all ${
                              filterTags.includes(tag)
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {tag}
                          </button>
                        )) : <span className="text-slate-500 text-sm">無可用標籤</span>}
                      </div>
                    </div>

                    {/* 2. Conditions (Sighting Info) - Replaces Time/Weather */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">目擊情報/環境條件 (多選)</label>
                      <div className="flex flex-wrap gap-2">
                        {allConditions.length > 0 ? allConditions.map(cond => (
                          <button
                            key={cond}
                            onClick={() => toggleFilter(cond, filterConditions, setFilterConditions)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all ${
                              filterConditions.includes(cond)
                                ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {cond}
                          </button>
                        )) : <span className="text-slate-500 text-sm">無可用條件</span>}
                      </div>
                    </div>

                    {/* 3. Battle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">比拚需求</label>
                      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 max-w-xs">
                        <button 
                          onClick={() => setFilterBattle('all')} 
                          className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                        >全部</button>
                        <button 
                          onClick={() => setFilterBattle('yes')} 
                          className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'yes' ? 'bg-red-900/50 text-red-200' : 'text-slate-400'}`}
                        >需要</button>
                        <button 
                          onClick={() => setFilterBattle('no')} 
                          className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'no' ? 'bg-green-900/50 text-green-200' : 'text-slate-400'}`}
                        >不需要</button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Grid */}
            {filteredFish.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'simple' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredFish.map((fish) => (
                  <FishCard 
                    key={fish.id} 
                    fish={fish} 
                    viewMode={viewMode}
                    isDevMode={isDevMode}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteFish}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-50">
                <div className="text-6xl mb-4">🌊</div>
                <p className="text-xl">在這片海域找不到符合條件的魚...</p>
                {fishList.length === 0 && (
                   <div className="mt-4 text-sm text-yellow-400">
                      資料庫目前為空，請開啟開發者模式新增第一條魚！
                   </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Manual Form Modal */}
      {isFormModalOpen && (
        <FishFormModal
          initialData={editingFish}
          existingIds={fishList.map(f => f.id)}
          onSave={handleSaveFish}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {/* Detail View Modal (For Simple Mode) */}
      {selectedDetailFish && (
        <FishDetailModal
          fish={selectedDetailFish}
          onClose={() => setSelectedDetailFish(null)}
        />
      )}
    </div>
  );
};

export default App;