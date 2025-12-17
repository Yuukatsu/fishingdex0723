
import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS, Item, ItemCategory, ITEM_CATEGORY_ORDER, TACKLE_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, AdventureMap } from './types';
import { INITIAL_FISH, INITIAL_ITEMS, PRESET_CONDITIONS } from './constants';
import FishCard from './components/FishCard';
import FishFormModal from './components/FishFormModal';
import FishDetailModal from './components/FishDetailModal';
import WeeklyEventModal from './components/WeeklyEventModal';
import GuideModal from './components/GuideModal';
import ItemCard from './components/ItemCard';
import ItemFormModal from './components/ItemFormModal';
import ItemDetailModal from './components/ItemDetailModal';
import FoodCategoryModal from './components/FoodCategoryModal';
import BundleListModal from './components/BundleListModal';
import AdventureMapCard from './components/AdventureMapCard';
import AdventureMapFormModal from './components/AdventureMapFormModal';
import AdventureMapDetailModal from './components/AdventureMapDetailModal';

// Firebase imports
import { db, auth, initError } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch, getDoc, addDoc, orderBy } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  // === Tabs ===
  const [activeTab, setActiveTab] = useState<'fish' | 'items' | 'tackle' | 'adventure'>('fish');
  const [adventureSubTab, setAdventureSubTab] = useState<'map' | 'dispatch'>('map');

  // === Fish State ===
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [loadingFish, setLoadingFish] = useState(true);
  
  // === Item State ===
  const [itemList, setItemList] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItemType, setSelectedItemType] = useState<ItemType>(ItemType.Material); // Level 1 Filter
  const [filterItemCategory, setFilterItemCategory] = useState<ItemCategory | 'ALL'>('ALL'); // Level 2 Filter (Material only)

  // === Adventure State ===
  const [mapList, setMapList] = useState<AdventureMap[]>([]);
  const [loadingMaps, setLoadingMaps] = useState(true);

  const [loading, setLoading] = useState(true); // General loading
  const [error, setError] = useState<React.ReactNode | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Guide URL State
  const [guideUrl, setGuideUrl] = useState<string>('');

  // === Filters ===
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  // Separate search terms for tabs
  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  
  // Advanced Filters (Fish)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterBattle, setFilterBattle] = useState<'all' | 'yes' | 'no'>('all');
  const [filterDepthMin, setFilterDepthMin] = useState<string>('');
  const [filterDepthMax, setFilterDepthMax] = useState<string>('');

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // === Modals ===
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<AdventureMap | null>(null);

  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [selectedDetailMap, setSelectedDetailMap] = useState<AdventureMap | null>(null);

  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFoodCategoryModalOpen, setIsFoodCategoryModalOpen] = useState(false);
  const [isBundleListModalOpen, setIsBundleListModalOpen] = useState(false); 

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
                  setGuideUrl(docSnap.data().guideImageUrl);
              }
          } catch (e) {
              console.error("Failed to fetch guide URL", e);
          }
      };
      fetchGuideUrl();
  }, []);

  // 2. Real-time Data Sync (Fish)
  useEffect(() => {
    if (initError) { setLoading(false); setError(`Firebase 初始化失敗: ${initError}`); return; }
    if (!db) { setLoading(false); setError("資料庫未連接。"); return; }

    setLoadingFish(true);
    const q = query(collection(db, "fishes")); 
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFish: Fish[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        const parseNum = (val: any) => (typeof val === 'number' ? val : undefined);
        fetchedFish.push({
            id: data.id || doc.id,
            internalId: data.internalId, 
            name: data.name || 'Unknown',
            description: data.description || '',
            rarity: data.rarity || Rarity.OneStar,
            depthMin: parseNum(data.depthMin),
            depthMax: parseNum(data.depthMax),
            conditions: Array.isArray(data.conditions) ? data.conditions : [], 
            tags: Array.isArray(data.tags) ? data.tags : [],
            battleRequirements: data.battleRequirements || '',
            specialNote: data.specialNote || '',
            variants: data.variants || (data.imageUrl ? { normalMale: data.imageUrl } : {}),
            isNew: data.isNew || false
        } as Fish);
      });
      fetchedFish.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setFishList(fetchedFish);
      setLoadingFish(false);
      // Clear error only if Items are also loaded or if we are just starting
      if(error && !loadingItems) setError(null);
    }, (err) => {
       console.error("Fish Query Error", err);
       handleFirebaseError(err);
       setLoadingFish(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time Data Sync (Items)
  useEffect(() => {
    if (!db) return;
    setLoadingItems(true);
    // Sort items implicitly if needed, but client-side sort is safer for drag/drop visual consistency
    const q = query(collection(db, "items"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems: Item[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as any;
            fetchedItems.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                source: data.source,
                type: data.type || ItemType.Material, 
                category: data.category,
                imageUrl: data.imageUrl,
                isRare: data.isRare || false,
                order: data.order, // Fetch order field
                recipe: data.recipe || [], // Fetch recipe
                flavors: data.flavors || [], // Fetch flavors
                foodCategories: data.foodCategories || [], // Fetch categories
                satiety: data.satiety || 0, // Fetch satiety
                // Tackle stats
                tensileStrength: data.tensileStrength || 0,
                durability: data.durability || 0,
                luck: data.luck || 0,
                extraEffect: data.extraEffect || '',
                // Bundle stats
                bundleContentIds: data.bundleContentIds || [],
                bundleSubstituteIds: data.bundleSubstituteIds || []
            });
        });
        
        // Sort items by order (if available), then by ID (for stability)
        fetchedItems.sort((a, b) => {
             const orderA = a.order ?? 999999;
             const orderB = b.order ?? 999999;
             if (orderA !== orderB) return orderA - orderB;
             return a.id.localeCompare(b.id);
        });

        setItemList(fetchedItems);
        setLoadingItems(false);
    }, (err) => {
        console.error("Item Query Error", err);
        handleFirebaseError(err); 
        setLoadingItems(false);
    });
    return () => unsubscribe();
  }, []);

  // 4. Real-time Data Sync (Adventure Maps)
  useEffect(() => {
      if (!db) return;
      setLoadingMaps(true);
      const q = query(collection(db, "adventure_maps"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMaps: AdventureMap[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              fetchedMaps.push({
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  order: data.order ?? 99,
                  dropItemIds: data.dropItemIds || [],
                  rewardItemIds: data.rewardItemIds || [],
                  buddies: data.buddies || []
              });
          });

          // Sort by Order
          fetchedMaps.sort((a, b) => a.order - b.order);
          setMapList(fetchedMaps);
          setLoadingMaps(false);
      }, (err) => {
          console.error("Maps Query Error", err);
          handleFirebaseError(err); // Changed: Added error handling
          setLoadingMaps(false);
      });

      return () => unsubscribe();
  }, []);


  // Consolidate loading state
  useEffect(() => {
      setLoading(loadingFish && loadingItems && loadingMaps);
  }, [loadingFish, loadingItems, loadingMaps]);

  const handleFirebaseError = (err: any) => {
    if (err.code === 'permission-denied') {
        setError(
          <div className="text-left space-y-4">
            <div className="font-bold text-xl border-b border-red-400/30 pb-2">⚠️ 存取被拒 (Permission Denied)</div>
            <p>Firestore 拒絕了資料讀取請求。這通常是因為安全規則 (Security Rules) 未設定正確。</p>
            <p className="text-sm text-slate-300">請前往 Firebase Console {'>'} Firestore {'>'} Rules，確保已新增 <code className="bg-red-900/50 px-1 rounded">items</code> 或 <code className="bg-red-900/50 px-1 rounded">adventure_maps</code> 集合的讀取權限。</p>
          </div>
        );
    } else {
        setError(`無法連接資料庫 (${err.code}): ${err.message}`);
    }
  };

  // --- Filter Logic (Fish) ---
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fishList.forEach(fish => fish.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [fishList]);

  const allConditions = useMemo(() => {
    const conds = new Set<string>(PRESET_CONDITIONS);
    fishList.forEach(fish => fish.conditions?.forEach(c => conds.add(c)));
    return Array.from(conds).sort();
  }, [fishList]);

  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      if (selectedRarity !== 'ALL' && fish.rarity !== selectedRarity) return false;
      const term = fishSearchTerm.toLowerCase();
      const matchesSearch = fish.name.toLowerCase().includes(term) || fish.id.toLowerCase().includes(term);
      if (!matchesSearch) return false;
      if (filterTags.length > 0 && !filterTags.every(t => fish.tags.includes(t))) return false;
      if (filterConditions.length > 0 && !filterConditions.every(c => fish.conditions.includes(c))) return false;
      if (filterBattle === 'yes' && (!fish.battleRequirements || !fish.battleRequirements.trim())) return false;
      if (filterBattle === 'no' && fish.battleRequirements && fish.battleRequirements.trim()) return false;
      
      const fMin = filterDepthMin ? parseFloat(filterDepthMin) : null;
      const fMax = filterDepthMax ? parseFloat(filterDepthMax) : null;
      if (fMin !== null || fMax !== null) {
        const fishMin = fish.depthMin ?? 0;
        const fishMax = (fish.depthMax === undefined || fish.depthMax === null) ? Infinity : fish.depthMax;
        if (fishMax < (fMin ?? -Infinity)) return false;
        if (fishMin > (fMax ?? Infinity)) return false;
      }
      return true;
    });
  }, [fishList, selectedRarity, fishSearchTerm, filterTags, filterConditions, filterBattle, filterDepthMin, filterDepthMax]);

  // --- Filter Logic (Items & Tackle) ---
  const filteredItems = useMemo(() => {
      let items = itemList;
      
      if (activeTab === 'tackle') {
          items = items.filter(item => item.type === ItemType.Tackle);
      } else if (activeTab === 'items') {
          // 顯示除了釣具以外的物品，並根據 selectedItemType 篩選
          const targetType = selectedItemType === ItemType.Tackle ? ItemType.Material : selectedItemType;
          items = items.filter(item => item.type === targetType);
      }
      
      // Filter out Bundles from the main grid view (since they have a dedicated button)
      // Only for Material type, as Bundles are categorized under Material
      if (activeTab === 'items' && selectedItemType === ItemType.Material) {
          items = items.filter(item => item.category !== ItemCategory.Bundle);
      }

      // Search filter
      if (itemSearchTerm) {
         const term = itemSearchTerm.toLowerCase();
         items = items.filter(item => 
            item.name.toLowerCase().includes(term) || 
            item.description.toLowerCase().includes(term) ||
            item.source.toLowerCase().includes(term)
         );
      }
      
      // Category Filter (Level 2)
      if (filterItemCategory !== 'ALL') {
          items = items.filter(item => item.category === filterItemCategory);
      }
      
      return items;
  }, [itemList, itemSearchTerm, selectedItemType, filterItemCategory, activeTab]);

  // --- Helpers ---
  const getNextId = useMemo(() => {
    if (fishList.length === 0) return '001';
    const ids = fishList.map(f => parseInt(f.id, 10)).filter(n => !isNaN(n));
    if (ids.length === 0) return '001';
    return (Math.max(...ids) + 1).toString().padStart(fishList.some(f => f.id.length >= 4) ? 4 : 3, '0');
  }, [fishList]);

  const getNextInternalId = useMemo(() => {
    if (fishList.length === 0) return 0;
    const max = Math.max(...fishList.map(f => f.internalId ?? -1));
    return max < 0 ? 0 : max + 1;
  }, [fishList]);

  // --- CRUD Handlers ---
  const handleEditClick = (fish: Fish) => { setEditingFish(fish); setIsFormModalOpen(true); };
  const handleCreateClick = () => { setEditingFish(null); setIsFormModalOpen(true); };
  
  const handleSaveFish = async (fish: Fish) => {
    if (!db || !currentUser) return alert("權限不足：請先登入");
    try {
      if (editingFish && editingFish.id !== fish.id) await deleteDoc(doc(db, "fishes", editingFish.id));
      const fishToSave = { ...fish };
      // Cleanup... (same as before)
      delete (fishToSave as any).location; delete (fishToSave as any).imageUrl; delete (fishToSave as any).depth;
      fishToSave.depthMin = fishToSave.depthMin ?? 0;
      if (fishToSave.depthMax === undefined || fishToSave.depthMax === null || isNaN(fishToSave.depthMax)) delete fishToSave.depthMax;
      
      Object.keys(fishToSave).forEach(key => {
        if ((fishToSave as any)[key] === undefined) delete (fishToSave as any)[key];
      });

      await setDoc(doc(db, "fishes", fish.id), fishToSave);
      setIsFormModalOpen(false); setEditingFish(null);
    } catch (e: any) { 
        console.error(e);
        alert(`儲存失敗: ${e.code || 'Unknown Error'} - ${e.message}`); 
    }
  };

  const handleDeleteFish = async (id: string) => {
    if (!db || !currentUser) return;
    if (window.confirm('確定要永久刪除此魚種資料嗎？')) {
      try { await deleteDoc(doc(db, "fishes", id)); } catch (e) { alert("刪除失敗"); }
    }
  };

  const handleEditItem = (item: Item) => { setEditingItem(item); setIsItemFormModalOpen(true); };
  
  const handleCreateItem = () => { 
      const defaultType = activeTab === 'tackle' ? ItemType.Tackle : ItemType.Material;
      const defaultCategory = activeTab === 'tackle' ? ItemCategory.Rod : ItemCategory.BallMaker;
      setEditingItem({
          id: '', name: '', description: '', source: '',
          type: defaultType, category: defaultCategory,
          imageUrl: '', isRare: false, recipe: []
      }); 
      setIsItemFormModalOpen(true); 
  };

  const handleCreateBundle = () => {
      setEditingItem({
          id: '', name: '', description: '', source: '',
          type: ItemType.Material, 
          category: ItemCategory.Bundle, // Pre-select Bundle
          imageUrl: '', isRare: false, recipe: [],
          bundleContentIds: [],
          bundleSubstituteIds: []
      });
      setIsItemFormModalOpen(true);
  };

  const handleSaveItem = async (item: Item) => {
    if (!db || !currentUser) return alert("權限不足：請先登入");
    try {
        const itemToSave = { ...item };
        if (itemToSave.order === undefined) {
             const maxOrder = Math.max(...itemList.map(i => i.order || 0), 0);
             itemToSave.order = maxOrder + 1;
        }
        Object.keys(itemToSave).forEach(key => {
             if ((itemToSave as any)[key] === undefined) delete (itemToSave as any)[key];
        });
        if (itemToSave.recipe) {
             itemToSave.recipe = itemToSave.recipe.map((r: any) => {
                 const cleanR = { ...r };
                 if (cleanR.itemId === undefined) cleanR.itemId = '';
                 if (cleanR.quantity === undefined) cleanR.quantity = 1;
                 return cleanR;
             });
        }
        if (item.id) await setDoc(doc(db, "items", item.id), itemToSave);
        else await addDoc(collection(db, "items"), itemToSave);
        
        setIsItemFormModalOpen(false); setEditingItem(null);
    } catch (e: any) { console.error(e); alert(`儲存道具失敗: ${e.message}`); }
  };

  const handleDeleteItem = async (id: string) => {
      if (!db || !currentUser) return;
      if(window.confirm("確定要刪除此道具嗎？")) {
          try { await deleteDoc(doc(db, "items", id)); } catch(e) { alert("刪除失敗"); }
      }
  };

  const handleDragStart = (e: React.DragEvent, item: Item) => {
      e.dataTransfer.setData("text/plain", item.id);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDropItem = async (e: React.DragEvent, targetItem: Item) => {
    if (!db || !currentUser) return;
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId === targetItem.id) return;
    const sourceItem = itemList.find(i => i.id === sourceId);
    if (!sourceItem) return;
    const sourceOrder = sourceItem.order ?? itemList.indexOf(sourceItem);
    const targetOrder = targetItem.order ?? itemList.indexOf(targetItem);
    try {
        const batch = writeBatch(db);
        batch.update(doc(db, "items", sourceItem.id), { order: targetOrder });
        batch.update(doc(db, "items", targetItem.id), { order: sourceOrder });
        await batch.commit();
    } catch (e) { console.error("Swap failed", e); alert("排序更新失敗"); }
  };

  // --- Adventure Map Handlers ---
  const handleEditMap = (map: AdventureMap) => { setEditingMap(map); setIsMapFormModalOpen(true); };
  const handleCreateMap = () => { 
      setEditingMap({
          id: '', name: '', description: '', order: 99,
          dropItemIds: [], rewardItemIds: [], buddies: []
      });
      setIsMapFormModalOpen(true);
  };
  
  const handleSaveMap = async (map: AdventureMap) => {
      if (!db || !currentUser) return;
      try {
          if (map.id && mapList.some(m => m.id === map.id)) {
             await setDoc(doc(db, "adventure_maps", map.id), map);
          } else {
             // New map or using ID as doc ID
             await setDoc(doc(db, "adventure_maps", map.id || Date.now().toString()), map);
          }
          setIsMapFormModalOpen(false); setEditingMap(null);
      } catch (e: any) {
          console.error("Save map error", e);
          alert("儲存失敗: " + e.message);
      }
  };

  const handleDeleteMap = async (id: string) => {
      if (!db || !currentUser) return;
      if (window.confirm("確定要刪除此地圖嗎？")) {
          try { await deleteDoc(doc(db, "adventure_maps", id)); } catch(e) { alert("刪除失敗"); }
      }
  };


  const handleImportDefaultItems = async () => { /* ... same as before ... */ }; // Kept concise for snippet
  const handleLogin = async () => { if (!auth) return; try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (error: any) { alert(`Login failed: ${error.message}`); } };
  const handleLogout = async () => { if (auth) await signOut(auth); };
  const handleCopyUid = () => { if (currentUser?.uid) navigator.clipboard.writeText(currentUser.uid).then(() => alert("UID Copied!")); };

  const toggleFilter = (item: string, currentList: string[], setter: (val: string[]) => void) => {
    setter(currentList.includes(item) ? currentList.filter(t => t !== item) : [...currentList, item]);
  };

  const isDevMode = !!currentUser;

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        {/* ... Header Content ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 self-start md:self-center">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-300 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30"><span className="text-2xl">🐟</span></div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">MagikarpFishingWiki {isDevMode && <span className="text-[10px] px-1.5 py-0.5 bg-green-900 text-green-300 border border-green-700 rounded uppercase">ADMIN</span>}</h1>
                        <p className="text-xs text-slate-400">鯉魚王釣魚遊戲圖鑑</p>
                    </div>
                </div>
                <div className="w-full md:w-96 relative">
                    <input type="text" placeholder={activeTab === 'fish' ? "搜尋魚類..." : activeTab === 'items' ? "搜尋道具..." : "搜尋..."} value={activeTab === 'fish' ? fishSearchTerm : itemSearchTerm} onChange={(e) => activeTab === 'fish' ? setFishSearchTerm(e.target.value) : setItemSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                   {activeTab === 'fish' && <button onClick={() => setIsWeeklyModalOpen(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1 transition-transform hover:scale-105 active:scale-95"><span>📅</span> <span className="hidden sm:inline">加倍</span></button>}
                   {isDevMode ? <button onClick={handleLogout} className="text-slate-300 hover:text-white text-xs">登出</button> : <button onClick={handleLogin} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-600 rounded-lg hover:text-white transition-all text-xs font-medium">🔒 登入</button>}
                </div>
            </div>
            <div className="flex items-center gap-6 border-b border-slate-700/50 px-2 overflow-x-auto">
                <button onClick={() => setActiveTab('fish')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'fish' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🐟</span> 魚類圖鑑 {activeTab === 'fish' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}</button>
                <button onClick={() => setActiveTab('items')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'items' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🎒</span> 道具列表 {activeTab === 'items' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>}</button>
                <button onClick={() => { setActiveTab('tackle'); setFilterItemCategory('ALL'); }} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'tackle' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🎣</span> 釣具列表 {activeTab === 'tackle' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full"></span>}</button>
                <button onClick={() => setActiveTab('adventure')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'adventure' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🏕️</span> 夥伴探索 {activeTab === 'adventure' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></span>}</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Loading / Error handling... */}
        {!loading && !error && (
            <>
                {activeTab === 'fish' && (
                    <div className="animate-fadeIn">
                       {/* Stats Dashboard */}
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                             <button onClick={() => setSelectedRarity('ALL')} className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${selectedRarity === 'ALL' ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}>
                                <div className="text-xl">📚</div>
                                <div className="text-xl font-bold text-white mt-1">{fishList.length}</div>
                                <div className="text-xs text-slate-400">總數</div>
                            </button>
                            {RARITY_ORDER.map(rarity => {
                                const count = fishList.filter(f => f.rarity === rarity).length;
                                const isActive = selectedRarity === rarity;
                                const colorStyle = RARITY_COLORS[rarity].split(' ')[0];
                                return (
                                    <button key={rarity} onClick={() => setSelectedRarity(rarity)} className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${isActive ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}>
                                        <div className={`text-xl font-black ${colorStyle}`}>{rarity}</div>
                                        <div className="text-xl font-bold text-white mt-1">{count}</div>
                                        <div className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>總數</div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Controls Bar */}
                        <div className="mb-8 flex justify-end gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-1">
                                <button onClick={() => guideUrl ? window.open(guideUrl, '_blank') : alert("尚未設定")} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-900/50 text-blue-200 border border-blue-700/50 hover:bg-blue-800 transition flex items-center gap-2"><span>📖 釣魚指南</span></button>
                                {isDevMode && <button onClick={() => setIsGuideModalOpen(true)} className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white">⚙️</button>}
                            </div>

                            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                <button onClick={() => setViewMode('simple')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'simple' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🖼️</button>
                                <button onClick={() => setViewMode('detailed')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'detailed' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>📋</button>
                            </div>

                            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}><span>⚙️ 進階篩選</span></button>
                            
                            {isDevMode && (
                                <div className="flex gap-2 border-l border-slate-700 pl-3 ml-2">
                                     <button onClick={handleCreateClick} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-green-400/30">＋ 新增魚種</button>
                                </div>
                            )}
                        </div>

                        {/* Advanced Filters Panel */}
                        {showAdvancedFilters && (
                           <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 animate-fadeIn mb-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-3">水深 (m)</label><div className="flex gap-2"><input type="number" placeholder="Min" value={filterDepthMin} onChange={e=>setFilterDepthMin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /><input type="number" placeholder="Max" value={filterDepthMax} onChange={e=>setFilterDepthMax(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div></div>
                                <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-3">標籤</label><div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">{allTags.map(t=><button key={t} onClick={()=>toggleFilter(t, filterTags, setFilterTags)} className={`px-3 py-1 text-xs rounded-full border ${filterTags.includes(t)?'bg-blue-600 border-blue-500 text-white':'bg-slate-900 border-slate-700 text-slate-400'}`}>{t}</button>)}</div></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">比拚</label><div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700"><button onClick={()=>setFilterBattle('all')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='all'?'bg-slate-700 text-white':'text-slate-400'}`}>All</button><button onClick={()=>setFilterBattle('yes')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='yes'?'bg-red-900/50 text-red-200':'text-slate-400'}`}>Yes</button><button onClick={()=>setFilterBattle('no')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='no'?'bg-green-900/50 text-green-200':'text-slate-400'}`}>No</button></div></div>
                              </div>
                           </div>
                        )}

                       {/* Fish Grid */}
                       {filteredFish.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'simple' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                                {filteredFish.map((fish) => (
                                    <FishCard key={fish.id} fish={fish} viewMode={viewMode} isDevMode={isDevMode} onEdit={handleEditClick} onDelete={handleDeleteFish} onClick={(f) => setSelectedDetailFish(f)} />
                                ))}
                            </div>
                       ) : (
                            <div className="text-center py-20 opacity-50"><div className="text-6xl mb-4">🌊</div><p>找不到魚...</p></div>
                       )}
                    </div>
                )}

                {/* === ITEMS TAB CONTENT === */}
                {activeTab === 'items' && (
                    <div className="animate-fadeIn pb-20">
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div><h2 className="text-2xl font-bold text-white">道具列表</h2><p className="text-slate-400 text-sm mt-1">遊戲中出現的所有物品與獲取方式</p></div>
                                <div className="flex gap-2 ml-auto">
                                    {/* Food Category Button */}
                                    {selectedItemType === ItemType.LunchBox && (
                                        <button onClick={() => setIsFoodCategoryModalOpen(true)} className="px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 border border-orange-600 whitespace-nowrap"><span>🥚</span> 食物分類</button>
                                    )}

                                    {/* Bundle List Button (New) - Only for Materials */}
                                    {selectedItemType === ItemType.Material && (
                                        <button 
                                            onClick={() => setIsBundleListModalOpen(true)}
                                            className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 border border-indigo-600 whitespace-nowrap"
                                        >
                                            <span>🧺</span> 集合一覽
                                        </button>
                                    )}

                                    {isDevMode && (
                                        <>
                                            <button onClick={handleCreateItem} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap"><span>＋</span> 新增</button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Type Tabs */}
                            <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
                                {ITEM_TYPE_ORDER.filter(t => t !== ItemType.Tackle).map(type => (
                                    <button key={type} onClick={() => { setSelectedItemType(type); setFilterItemCategory('ALL'); }} className={`px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-1 md:flex-none ${selectedItemType === type ? 'bg-slate-700 text-white shadow-lg ring-1 ring-slate-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{type}</button>
                                ))}
                            </div>
                            
                            {/* Category Filter Pills */}
                            {selectedItemType === ItemType.Material && (
                                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar animate-fadeIn">
                                    <button onClick={() => setFilterItemCategory('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === 'ALL' ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>全部</button>
                                    {ITEM_CATEGORY_ORDER.map(cat => (
                                        <button key={cat} onClick={() => setFilterItemCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === cat ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{cat}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Item Grid */}
                        <div className="space-y-12">
                            {selectedItemType === ItemType.Material ? (
                                ITEM_CATEGORY_ORDER.map(category => {
                                    if (filterItemCategory !== 'ALL' && filterItemCategory !== category) return null;
                                    const itemsInCategory = filteredItems.filter(i => i.category === category);
                                    if (itemsInCategory.length === 0 && !isDevMode) return null;
                                    return (
                                        <div key={category} className="animate-fadeIn">
                                            <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-emerald-500 rounded-full"></span>{category}<span className="text-xs font-normal text-slate-500 ml-2">({itemsInCategory.length})</span></h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {itemsInCategory.map(item => <ItemCard key={item.id} item={item} isDevMode={isDevMode} onEdit={handleEditItem} onDelete={handleDeleteItem} onClick={(i) => setSelectedDetailItem(i)} onDragStart={handleDragStart} onDrop={handleDropItem} itemList={itemList} />)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="animate-fadeIn">
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredItems.map(item => <ItemCard key={item.id} item={item} isDevMode={isDevMode} onEdit={handleEditItem} onDelete={handleDeleteItem} onClick={(i) => setSelectedDetailItem(i)} onDragStart={handleDragStart} onDrop={handleDropItem} itemList={itemList} />)}</div>
                                     {filteredItems.length === 0 && <div className="text-center py-20 opacity-50"><div className="text-6xl mb-4">🎒</div><p>此分類目前沒有道具</p></div>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {activeTab === 'tackle' && (
                     <div className="animate-fadeIn pb-20">
                        {/* ... Tackle Content ... */}
                         <div className="flex flex-col gap-6 mb-8">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div><h2 className="text-2xl font-bold text-white">釣具列表</h2><p className="text-slate-400 text-sm mt-1">各種釣竿、捲線器與釣魚裝備</p></div>
                                <div className="flex gap-2 ml-auto">{isDevMode && <button onClick={handleCreateItem} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap"><span>＋</span> 新增釣具</button>}</div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar animate-fadeIn"><button onClick={() => setFilterItemCategory('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === 'ALL' ? 'bg-cyan-600 border-cyan-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>全部</button>{TACKLE_CATEGORY_ORDER.map(cat => <button key={cat} onClick={() => setFilterItemCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === cat ? 'bg-cyan-600 border-cyan-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{cat}</button>)}</div>
                        </div>
                         <div className="space-y-12">{TACKLE_CATEGORY_ORDER.map(category => { if (filterItemCategory !== 'ALL' && filterItemCategory !== category) return null; const itemsInCategory = filteredItems.filter(i => i.category === category); if (itemsInCategory.length === 0 && !isDevMode) return null; return <div key={category} className="animate-fadeIn"><h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-cyan-500 rounded-full"></span>{category}<span className="text-xs font-normal text-slate-500 ml-2">({itemsInCategory.length})</span></h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{itemsInCategory.map(item => <ItemCard key={item.id} item={item} isDevMode={isDevMode} onEdit={handleEditItem} onDelete={handleDeleteItem} onClick={(i) => setSelectedDetailItem(i)} onDragStart={handleDragStart} onDrop={handleDropItem} itemList={itemList} />)}</div></div>; })}</div>
                         {filteredItems.length === 0 && <div className="text-center py-20 opacity-50"><div className="text-6xl mb-4">🎣</div><p>找不到符合條件的釣具...</p></div>}
                     </div>
                )}

                {/* === ADVENTURE TAB CONTENT === */}
                {activeTab === 'adventure' && (
                    <div className="animate-fadeIn pb-20">
                        {/* Adventure Sub-Navigation */}
                        <div className="flex flex-col gap-6 mb-8">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <h2 className="text-2xl font-bold text-white">夥伴探索</h2>
                                     <p className="text-slate-400 text-sm mt-1">派遣你的夥伴去冒險，帶回珍貴的寶物！</p>
                                 </div>
                                 {isDevMode && adventureSubTab === 'map' && (
                                     <button onClick={handleCreateMap} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增地圖</button>
                                 )}
                             </div>
                             
                             <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg self-start">
                                 <button onClick={() => setAdventureSubTab('map')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${adventureSubTab === 'map' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>🗺️ 夥伴大冒險</button>
                                 <button onClick={() => setAdventureSubTab('dispatch')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${adventureSubTab === 'dispatch' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>🚚 派遣工作</button>
                             </div>
                        </div>

                        {/* Sub-Tab Content */}
                        {adventureSubTab === 'map' ? (
                            <div className="animate-fadeIn">
                                {mapList.length === 0 ? (
                                    <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                                        <div className="text-6xl mb-4">🗺️</div>
                                        <p>目前還沒有開放的冒險地圖</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {mapList.map(map => (
                                            <AdventureMapCard 
                                                key={map.id} 
                                                mapData={map} 
                                                isDevMode={isDevMode} 
                                                onEdit={handleEditMap} 
                                                onDelete={handleDeleteMap} 
                                                onClick={(m) => setSelectedDetailMap(m)} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fadeIn text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                <div className="text-6xl mb-4 opacity-50">🚧</div>
                                <h3 className="text-xl font-bold text-slate-300 mb-2">派遣工作中心 建設中</h3>
                                <p className="text-slate-500">此功能即將開放，敬請期待！</p>
                            </div>
                        )}
                    </div>
                )}
            </>
        )}
      </main>

      {/* Modals */}
      {isFormModalOpen && <FishFormModal initialData={editingFish} existingIds={fishList.map(f => f.id)} suggestedId={getNextId} suggestedInternalId={getNextInternalId} onSave={handleSaveFish} onClose={() => setIsFormModalOpen(false)} />}
      {isItemFormModalOpen && <ItemFormModal initialData={editingItem} onSave={handleSaveItem} onClose={() => setIsItemFormModalOpen(false)} itemList={itemList} />}
      {isMapFormModalOpen && <AdventureMapFormModal initialData={editingMap} onSave={handleSaveMap} onClose={() => setIsMapFormModalOpen(false)} itemList={itemList} />}
      
      {selectedDetailFish && <FishDetailModal fish={selectedDetailFish} onClose={() => setSelectedDetailFish(null)} />}
      {selectedDetailItem && <ItemDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} isDevMode={isDevMode} itemList={itemList} />}
      {selectedDetailMap && <AdventureMapDetailModal mapData={selectedDetailMap} onClose={() => setSelectedDetailMap(null)} itemList={itemList} />}
      
      <WeeklyEventModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} isDevMode={isDevMode} fishList={fishList} onFishClick={(f) => setSelectedDetailFish(f)} />
      <GuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} currentUrl={guideUrl} onUpdate={setGuideUrl} />
      <FoodCategoryModal isOpen={isFoodCategoryModalOpen} onClose={() => setIsFoodCategoryModalOpen(false)} isDevMode={isDevMode} />
      <BundleListModal 
        isOpen={isBundleListModalOpen} 
        onClose={() => setIsBundleListModalOpen(false)} 
        itemList={itemList} 
        isDevMode={isDevMode} 
        onEdit={handleEditItem} 
        onDelete={handleDeleteItem} 
        onClick={(i) => setSelectedDetailItem(i)}
        onCreate={handleCreateBundle} 
      />
    </div>
  );
};

export default App;
