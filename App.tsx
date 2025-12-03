import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_LABELS } from './types';
import { INITIAL_FISH } from './constants';
import FishCard from './components/FishCard';
import FishFormModal from './components/FishFormModal';
import FishDetailModal from './components/FishDetailModal';

const App: React.FC = () => {
  const [fishList, setFishList] = useState<Fish[]>(() => {
    // Try to load from local storage to persist discoveries
    const saved = localStorage.getItem('fishWiki_data');
    return saved ? JSON.parse(saved) : INITIAL_FISH;
  });

  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // Dev Mode States
  const [isDevMode, setIsDevMode] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);

  // Detail Modal State (For Simple Mode)
  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);

  // Save to local storage whenever list changes
  useEffect(() => {
    localStorage.setItem('fishWiki_data', JSON.stringify(fishList));
  }, [fishList]);

  // Filter Logic
  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      const matchesRarity = selectedRarity === 'ALL' || fish.rarity === selectedRarity;
      const matchesSearch = 
        fish.name.includes(searchTerm) || 
        fish.location.includes(searchTerm) || 
        fish.id.includes(searchTerm) ||
        (fish.tags && fish.tags.some(tag => tag.includes(searchTerm))); // Search by tags
      return matchesRarity && matchesSearch;
    }).sort((a, b) => {
        // Sort by ID naturally
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, [fishList, selectedRarity, searchTerm]);

  // CRUD Handlers
  const handleEditClick = (fish: Fish) => {
    setEditingFish(fish);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingFish(null);
    setIsFormModalOpen(true);
  };

  const handleSaveFish = (fish: Fish) => {
    if (editingFish) {
      // Update existing
      setFishList(prev => prev.map(f => f.id === fish.id ? fish : f));
    } else {
      // Create new
      setFishList(prev => [...prev, fish]);
    }
    setIsFormModalOpen(false);
    setEditingFish(null);
  };

  const handleDeleteFish = (id: string) => {
    if (window.confirm('確定要永久刪除此魚種資料嗎？')) {
      setFishList(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleCardClick = (fish: Fish) => {
    if (viewMode === 'simple') {
      setSelectedDetailFish(fish);
    }
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
                placeholder="搜尋編號、名稱、地點或標籤..."
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
               <label className="flex items-center gap-2 cursor-pointer group mr-2 border-l border-slate-700 pl-4">
                 <div className="relative">
                   <input type="checkbox" checked={isDevMode} onChange={() => setIsDevMode(!isDevMode)} className="sr-only" />
                   <div className={`block w-8 h-5 rounded-full transition-colors ${isDevMode ? 'bg-red-500/50 border-red-400' : 'bg-slate-700 border-slate-600'} border`}></div>
                   <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isDevMode ? 'translate-x-3' : 'translate-x-0'}`}></div>
                 </div>
                 <span className={`text-xs font-medium hidden sm:inline ${isDevMode ? 'text-red-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                   Dev
                 </span>
               </label>

              {/* Add Manual Button (Dev Only) */}
              {isDevMode && (
                 <button
                 onClick={handleCreateClick}
                 className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 border border-green-400/30"
               >
                 <span>＋</span>
                 <span className="hidden sm:inline">新增</span>
               </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Dashboard / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 text-xl">📚</div>
                <div>
                    <div className="text-2xl font-bold text-white">{totalCount}</div>
                    <div className="text-xs text-slate-400">總魚種數</div>
                </div>
            </div>
            {/* Show counts by rarity roughly */}
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full text-green-400 text-xl">🌱</div>
                <div>
                    <div className="text-2xl font-bold text-white">{fishList.filter(f => f.rarity === Rarity.OneStar || f.rarity === Rarity.TwoStar).length}</div>
                    <div className="text-xs text-slate-400">普通/稀有</div>
                </div>
            </div>
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400 text-xl">👑</div>
                <div>
                    <div className="text-2xl font-bold text-white">{fishList.filter(f => f.rarity === Rarity.ThreeStar || f.rarity === Rarity.FourStar).length}</div>
                    <div className="text-xs text-slate-400">高階魚種</div>
                </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-fuchsia-500/20 rounded-full text-fuchsia-400 text-xl">👾</div>
                <div>
                    <div className="text-2xl font-bold text-white">{fishList.filter(f => f.rarity === Rarity.Special).length}</div>
                    <div className="text-xs text-slate-400">異變種</div>
                </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                selectedRarity === rarity
                  ? 'bg-slate-700 border-slate-500 text-white shadow-lg scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className="mr-1">{rarity}</span>
              {RARITY_LABELS[rarity]}
            </button>
          ))}
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
          </div>
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