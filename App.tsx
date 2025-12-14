
import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS } from './types';
import { INITIAL_FISH, PRESET_CONDITIONS } from './constants';
import FishCard from './components/FishCard';
import FishFormModal from './components/FishFormModal';
import FishDetailModal from './components/FishDetailModal';
import WeeklyEventModal from './components/WeeklyEventModal';
import GuideModal from './components/GuideModal';

// Firebase imports
import { db, auth, initError } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null); // Changed to ReactNode for rich error UI

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Guide URL State
  const [guideUrl, setGuideUrl] = useState<string>('');

  // Filter State
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterBattle, setFilterBattle] = useState<'all' | 'yes' | 'no'>('all');
  
  // Depth Filter (Numeric)
  const [filterDepthMin, setFilterDepthMin] = useState<string>('');
  const [filterDepthMax, setFilterDepthMax] = useState<string>('');

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // Dev Mode States (Now tied to Auth)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);

  // Detail Modal State (For Simple Mode)
  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);

  // Weekly Modal State
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);

  // Guide Modal State (For Editing)
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // 0. Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 1. Fetch Guide URL
  useEffect(() => {
      if (!db) return;
      const fetchGuideUrl = async () => {
          try {
              const docRef = doc(db, 'app_settings', 'guide');
              const docSnap = await getDoc(docRef);
              if (docSnap.exists() && docSnap.data().guideImageUrl) {
                  // Note: We are reusing the 'guideImageUrl' field to store the URL to avoid data migration issues
                  setGuideUrl(docSnap.data().guideImageUrl);
              }
          } catch (e) {
              console.error("Failed to fetch guide URL", e);
          }
      };
      fetchGuideUrl();
  }, []);

  // 2. Real-time Data Sync with Firebase
  useEffect(() => {
    // Priority Check: Initialization Error from config
    if (initError) {
      setLoading(false);
      setError(`Firebase 初始化失敗: ${initError}`);
      return;
    }

    // Secondary Check: DB object missing
    if (!db) {
      setLoading(false);
      setError("資料庫未連接。請檢查 .env 檔案是否已設定環境變數。");
      return;
    }

    setLoading(true);
    // Subscribe to the "fishes" collection
    try {
      const q = query(collection(db, "fishes")); 
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedFish: Fish[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as any;
          
          // Helper to safely parse numbers
          const parseNum = (val: any) => (typeof val === 'number' ? val : undefined);

          // Robust data mapping with fallbacks to prevent crashes on legacy data
          fetchedFish.push({
              id: data.id || doc.id,
              internalId: data.internalId, 
              name: data.name || 'Unknown',
              description: data.description || '',
              rarity: data.rarity || Rarity.OneStar,
              
              // Handle field migration: location -> depth -> depthMin/Max
              depthMin: parseNum(data.depthMin),
              depthMax: parseNum(data.depthMax),
              
              // CRITICAL FIX: Ensure arrays are initialized to avoid "forEach of undefined"
              conditions: Array.isArray(data.conditions) ? data.conditions : [], 
              tags: Array.isArray(data.tags) ? data.tags : [],
              
              battleRequirements: data.battleRequirements || '',
              specialNote: data.specialNote || '',
              
              // Handle field migration: imageUrl -> variants
              variants: data.variants || (data.imageUrl ? { normalMale: data.imageUrl } : {}),

              // New Field
              isNew: data.isNew || false
          } as Fish);
        });
        
        // Sort locally by ID
        fetchedFish.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        
        setFishList(fetchedFish);
        setLoading(false);
        setError(null); // Clear error on success
      }, (err) => {
        console.error("Firebase connection error:", err);
        // Improved error handling for App Check / Permissions
        if (err.code === 'permission-denied') {
          const currentDomain = window.location.hostname;
          setError(
            <div className="text-left space-y-4">
              <div className="font-bold text-xl border-b border-red-400/30 pb-2">⚠️ 存取被拒 (Permission Denied)</div>
              <p>Firestore 拒絕了您的請求。請依序檢查以下三點：</p>
              
              <ul className="list-decimal pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-bold text-amber-300">Firestore 安全規則 (最可能原因)</span>
                  <p className="text-slate-300">您的程式碼正在讀取 <code>fishes</code> 集合，但規則可能只允許 <code>pages</code>。請前往 Firebase Console 修改規則。</p>
                </li>
                <li>
                  <span className="font-bold text-amber-300">ReCAPTCHA App Check</span>
                  <p className="text-slate-300">確認 App Check 已啟用且網域 <code>{currentDomain}</code> 已在白名單中。</p>
                </li>
              </ul>
              <div className="mt-4 p-2 bg-black/30 rounded text-xs font-mono">
                目前網域: <span className="text-green-300">{currentDomain}</span>
              </div>
            </div>
          );
        } else if (err.message.includes("api-key")) {
          setError("無法連接資料庫：API Key 設定有誤。請檢查 Vercel 環境變數 VITE_FIREBASE_API_KEY。");
        } else {
          setError(`無法連接資料庫 (${err.code}): ${err.message}`);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e: any) {
      console.error("Query Error:", e);
      setError(`查詢建立失敗: ${e.message}`);
      setLoading(false);
    }
  }, []);

  // Extract all unique tags for filter UI
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fishList.forEach(fish => {
      if (Array.isArray(fish.tags)) {
        fish.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [fishList]);

  // Extract all unique conditions for filter UI
  const allConditions = useMemo(() => {
    const conds = new Set<string>();
    PRESET_CONDITIONS.forEach(c => conds.add(c));
    fishList.forEach(fish => {
      if (Array.isArray(fish.conditions)) {
        fish.conditions.forEach(c => conds.add(c));
      }
    });
    return Array.from(conds).sort();
  }, [fishList]);

  // Filter Logic
  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      // 1. Basic Rarity
      if (selectedRarity !== 'ALL' && fish.rarity !== selectedRarity) return false;

      // 2. Search Term (Name, ID)
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        fish.name.toLowerCase().includes(term) || 
        fish.id.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // 3. Advanced: Tags
      if (filterTags.length > 0) {
        if (!Array.isArray(fish.tags)) return false;
        const hasAllTags = filterTags.every(t => fish.tags.includes(t));
        if (!hasAllTags) return false;
      }

      // 4. Advanced: Conditions
      if (filterConditions.length > 0) {
        if (!Array.isArray(fish.conditions)) return false;
        const hasAllConds = filterConditions.every(c => fish.conditions.includes(c));
        if (!hasAllConds) return false;
      }

      // 5. Advanced: Battle Requirements
      if (filterBattle === 'yes' && (!fish.battleRequirements || fish.battleRequirements.trim() === '')) return false;
      if (filterBattle === 'no' && fish.battleRequirements && fish.battleRequirements.trim() !== '') return false;

      // 6. Advanced: Depth Range (Numeric)
      const fMin = filterDepthMin ? parseFloat(filterDepthMin) : null;
      const fMax = filterDepthMax ? parseFloat(filterDepthMax) : null;
      
      if (fMin !== null || fMax !== null) {
        const fishMin = fish.depthMin ?? 0;
        const fishMax = (fish.depthMax === undefined || fish.depthMax === null) ? Infinity : fish.depthMax;

        const filterLower = fMin ?? -Infinity;
        const filterUpper = fMax ?? Infinity;

        if (fishMax < filterLower) return false;
        if (fishMin > filterUpper) return false;
      }

      return true;
    });
  }, [fishList, selectedRarity, searchTerm, filterTags, filterConditions, filterBattle, filterDepthMin, filterDepthMax]);

  // Helper: Get Next ID
  const getNextId = useMemo(() => {
    if (fishList.length === 0) return '001';
    const ids = fishList.map(f => parseInt(f.id, 10)).filter(n => !isNaN(n));
    if (ids.length === 0) return '001';
    const maxId = Math.max(...ids);
    const nextIdVal = maxId + 1;
    const hasFourDigits = fishList.some(f => f.id.length >= 4);
    const padding = hasFourDigits ? 4 : 3;
    return nextIdVal.toString().padStart(padding, '0');
  }, [fishList]);

  // Helper: Get Next Internal ID
  const getNextInternalId = useMemo(() => {
    if (fishList.length === 0) return 0;
    const internalIds = fishList.map(f => f.internalId ?? -1);
    const max = Math.max(...internalIds);
    return max < 0 ? 0 : max + 1;
  }, [fishList]);

  // Batch Update: Upgrade 3-digit IDs to 4-digit IDs
  const handleUpgradeIds = async () => {
    if (!db || !currentUser) return;
    const targets = fishList.filter(f => f.id.length === 3 && !isNaN(Number(f.id)));
    if (targets.length === 0) {
      alert("目前沒有 3 位數的編號需要升級。");
      return;
    }
    if (!window.confirm(`⚠️ ID 結構升級\n\n偵測到 ${targets.length} 筆 3 位數編號的資料。\n是否要將它們全部升級為 4 位數格式 (例如 001 -> 0001)？\n\n此操作會刪除舊 ID 文件並建立新文件，請謹慎操作。`)) {
      return;
    }
    setLoading(true);
    try {
      const batchSize = 200; 
      for (let i = 0; i < targets.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = targets.slice(i, i + batchSize);
        chunk.forEach(fish => {
          const newId = fish.id.padStart(4, '0');
          const newRef = doc(db!, "fishes", newId);
          const oldRef = doc(db!, "fishes", fish.id);
          const newData = { ...fish, id: newId };
          delete (newData as any).location;
          delete (newData as any).imageUrl;
          batch.set(newRef, newData);
          batch.delete(oldRef);
        });
        await batch.commit();
      }
      alert("✅ 編號升級完成！");
    } catch (e: any) {
      console.error("Upgrade failed:", e);
      alert(`升級失敗: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    if (!db || !currentUser) {
        alert("權限不足，無法儲存");
        return;
    }
    try {
      if (editingFish && editingFish.id !== fish.id) {
          await deleteDoc(doc(db, "fishes", editingFish.id));
      }
      const fishToSave = { ...fish };
      
      delete (fishToSave as any).location;
      delete (fishToSave as any).imageUrl;
      delete (fishToSave as any).depth; 
      
      fishToSave.depthMin = fishToSave.depthMin ?? 0;
      
      if (fishToSave.depthMax === undefined || fishToSave.depthMax === null || isNaN(fishToSave.depthMax)) {
          delete fishToSave.depthMax;
      }

      await setDoc(doc(db, "fishes", fish.id), fishToSave);
      setIsFormModalOpen(false);
      setEditingFish(null);
    } catch (e: any) {
      console.error("Error saving fish: ", e);
      if (e.code === 'permission-denied') {
        alert("儲存失敗：您沒有寫入權限 (Permission Denied)");
      } else {
        alert("儲存失敗，請檢查控制台");
      }
    }
  };

  const handleDeleteFish = async (id: string) => {
    if (!db || !currentUser) return;
    if (window.confirm('確定要永久刪除此魚種資料嗎？(此操作會同步至雲端)')) {
      try {
        await deleteDoc(doc(db, "fishes", id));
      } catch (e: any) {
        console.error("Error deleting fish: ", e);
        if (e.code === 'permission-denied') {
            alert("刪除失敗：您沒有刪除權限");
        } else {
            alert("刪除失敗");
        }
      }
    }
  };

  // Upload Initial Data (Dev Mode Only)
  const handleUploadInitialData = async () => {
    if (!db || !currentUser) return;
    if (!window.confirm(`確定要將 ${INITIAL_FISH.length} 筆預設資料匯入資料庫嗎？若編號重複將會覆蓋。`)) return;
    setLoading(true);
    try {
      const promises = INITIAL_FISH.map((fish, index) => {
          const fishToSave = { ...fish, internalId: index };
          delete (fishToSave as any).location;
          delete (fishToSave as any).imageUrl;
          delete (fishToSave as any).depth;
          return setDoc(doc(db!, "fishes", fish.id), fishToSave);
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

  // Backup Data to JSON
  const handleDownloadBackup = () => {
    const dataStr = JSON.stringify(fishList, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fish_wiki_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = (fish: Fish) => {
    setSelectedDetailFish(fish);
  };

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Improved Login Error Handling
      if (error.code === 'auth/configuration-not-found') {
        alert("登入失敗：Google 登入功能尚未啟用。\n\n請前往 Firebase Console -> Authentication -> Sign-in method，將「Google」供應商啟用。");
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`登入失敗：網域未授權 (Unauthorized Domain)。\n\n目前網域為：${currentDomain}\n\n請前往 Firebase Console -> Authentication -> Settings -> Authorized domains，將此網域加入允許清單。`);
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed login popup");
      } else {
        alert(`登入失敗: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper for copy UID
  const handleCopyUid = () => {
      if (currentUser?.uid) {
          navigator.clipboard.writeText(currentUser.uid).then(() => {
              alert("UID 已複製到剪貼簿！");
          });
      }
  };

  const toggleFilter = (item: string, currentList: string[], setter: (val: string[]) => void) => {
    setter(currentList.includes(item) ? currentList.filter(t => t !== item) : [...currentList, item]);
  };

  const totalCount = fishList.length;
  // Is Dev Mode active? Now simply means "Is User Logged In"
  const isDevMode = !!currentUser;

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
                  {isDevMode && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/50 rounded uppercase tracking-wider flex items-center gap-1">
                    ● Admin
                  </span>}
                </h1>
                <p className="text-xs text-slate-400">釣魚遊戲官方圖鑑</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="搜尋編號、名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               <button
                  onClick={() => setIsWeeklyModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1 transition-transform hover:scale-105 active:scale-95"
               >
                 <span>📅</span>
                 <span className="hidden sm:inline">本周加倍</span>
               </button>

               {/* View Mode Toggle */}
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button 
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'simple' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    🖼️
                  </button>
                  <button 
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'detailed' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    📋
                  </button>
               </div>

               {/* Auth Button */}
               {isDevMode ? (
                 <div className="flex items-center gap-2 bg-slate-800/50 p-1 pr-2 rounded-full border border-slate-700">
                    <img 
                      src={currentUser?.photoURL || ''} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-slate-500" 
                      title={currentUser?.email || ''}
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 leading-none">Admin</span>
                        <button 
                           onClick={handleCopyUid}
                           className="text-[10px] text-blue-400 hover:text-blue-300 underline leading-none text-left"
                           title="點擊複製 UID 以設定 Firestore Rules"
                        >
                            複製 UID
                        </button>
                    </div>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-300 hover:text-white text-xs transition-colors"
                    >
                        登出
                    </button>
                 </div>
               ) : (
                 <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-600 rounded-lg hover:text-white hover:border-slate-400 transition-all text-xs font-medium"
                 >
                    🔒 登入管理
                 </button>
               )}

              {/* Dev Only Actions */}
              {isDevMode && (
                <div className="flex gap-2 border-l border-slate-700 pl-3 ml-2">
                  <button
                   onClick={handleUpgradeIds}
                   className={`px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-indigo-400/30 ${!db ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title="升級 ID 格式"
                   disabled={!db}
                  >
                    🔢
                  </button>
                   <button
                   onClick={handleUploadInitialData}
                   className={`px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-orange-400/30 ${!db ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title="匯入初始資料"
                   disabled={!db}
                 >
                   ☁️
                 </button>
                 <button
                   onClick={handleDownloadBackup}
                   className={`px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-cyan-400/30 ${!db ? 'opacity-50 cursor-not-allowed' : ''}`}
                   title="備份資料"
                   disabled={!db}
                 >
                   💾
                 </button>
                 <button
                   onClick={handleCreateClick}
                   className={`px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-green-400/30 ${!db ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!db}
                 >
                   ＋
                 </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">正在同步雲端圖鑑...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-8 rounded-xl text-center mb-8 max-w-2xl mx-auto">
            {/* If error is string, show it directly; if ReactNode, render it */}
             {typeof error === 'string' ? (
                <>
                  <h3 className="font-bold text-2xl mb-4">連線錯誤</h3>
                  <p className="text-lg mb-4 whitespace-pre-line">{error}</p>
                </>
             ) : (
                error
             )}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* INTERACTIVE STATS DASHBOARD (Replaces old tabs) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {/* Total / ALL Button */}
                <button 
                    onClick={() => setSelectedRarity('ALL')}
                    className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${selectedRarity === 'ALL' ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}
                >
                    <div className="text-xl">📚</div>
                    <div className="text-xl font-bold text-white mt-1">{totalCount}</div>
                    <div className="text-xs text-slate-400">總數</div>
                </button>
                
                {/* Rarity Buttons */}
                {RARITY_ORDER.map(rarity => {
                  const count = fishList.filter(f => f.rarity === rarity).length;
                  const hasNew = fishList.some(f => f.rarity === rarity && f.isNew);
                  const colorStyle = RARITY_COLORS[rarity].split(' ')[0];
                  const isActive = selectedRarity === rarity;
                  
                  return (
                    <button 
                        key={rarity} 
                        onClick={() => setSelectedRarity(rarity)}
                        className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-105 ${isActive ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}
                    >
                       {/* NEW Indicator */}
                       {hasNew && (
                           <span className="absolute top-2 right-2 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-sm border border-black/20"></span>
                           </span>
                       )}

                       <div className={`text-xl font-black ${colorStyle} drop-shadow-sm`}>{rarity}</div>
                       <div className="text-xl font-bold text-white mt-1">{count}</div>
                       <div className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>總數</div>
                    </button>
                  );
                })}
            </div>

            {/* Controls Bar */}
            <div className="mb-8 flex justify-end gap-3 items-center">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            if (guideUrl) {
                                window.open(guideUrl, '_blank');
                            } else {
                                alert("指南連結尚未設定！");
                            }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-700 text-emerald-100 border border-emerald-600 hover:bg-emerald-600 transition flex items-center gap-2 shadow"
                    >
                        <span>📖 釣魚指南</span>
                    </button>
                    {isDevMode && (
                        <button 
                            onClick={() => setIsGuideModalOpen(true)}
                            className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="設定指南連結"
                        >
                            ⚙️
                        </button>
                    )}
                </div>

                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  <span>⚙️ 進階篩選</span>
                  <span className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 animate-fadeIn mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* 1. Depth Filter */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">水深範圍 (m)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={filterDepthMin}
                                onChange={(e) => setFilterDepthMin(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                            <span className="text-slate-500">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={filterDepthMax}
                                onChange={(e) => setFilterDepthMax(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* 2. Tags */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">標籤篩選</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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

                    {/* 3. Battle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">比拚要點</label>
                      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 w-full">
                        <button onClick={() => setFilterBattle('all')} className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>全部</button>
                        <button onClick={() => setFilterBattle('yes')} className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'yes' ? 'bg-red-900/50 text-red-200' : 'text-slate-400'}`}>需要</button>
                        <button onClick={() => setFilterBattle('no')} className={`flex-1 py-1.5 text-xs rounded-md transition-all ${filterBattle === 'no' ? 'bg-green-900/50 text-green-200' : 'text-slate-400'}`}>不需要</button>
                      </div>
                      
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">目擊情報</label>
                      <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                        {allConditions.map(cond => (
                          <button
                            key={cond}
                            onClick={() => toggleFilter(cond, filterConditions, setFilterConditions)}
                            className={`px-2 py-1 text-[10px] rounded-full border transition-all ${
                              filterConditions.includes(cond)
                                ? 'bg-amber-600 border-amber-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
            )}

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
          </>
        )}
      </main>

      {/* Manual Form Modal */}
      {isFormModalOpen && (
        <FishFormModal
          initialData={editingFish}
          existingIds={fishList.map(f => f.id)}
          suggestedId={getNextId}
          suggestedInternalId={getNextInternalId}
          onSave={handleSaveFish}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {/* Detail View Modal */}
      {selectedDetailFish && (
        <FishDetailModal
          fish={selectedDetailFish}
          onClose={() => setSelectedDetailFish(null)}
        />
      )}

      {/* Weekly Event Modal */}
      <WeeklyEventModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        isDevMode={isDevMode}
        fishList={fishList}
        onFishClick={handleCardClick}
      />
      
      {/* Guide Modal (Now just a Settings Modal for URL) */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        currentUrl={guideUrl}
        onUpdate={setGuideUrl}
      />
    </div>
  );
};

export default App;

