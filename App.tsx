
import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS, Item, ItemCategory, ITEM_CATEGORY_ORDER, TACKLE_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, AdventureMap, DispatchJob } from './types';
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
import DispatchJobCard from './components/DispatchJobCard';
import DispatchJobFormModal from './components/DispatchJobFormModal';
import DispatchJobDetailModal from './components/DispatchJobDetailModal';
import DispatchGuideModal from './components/DispatchGuideModal';

// Firebase imports
import { db, auth, initError } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch, getDoc, addDoc, orderBy } from 'firebase/firestore';
import * as firebaseAuthModule from 'firebase/auth';
const { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = firebaseAuthModule as any;

const App: React.FC = () => {
  // === Tabs ===
  const [activeTab, setActiveTab] = useState<'fish' | 'items' | 'tackle' | 'adventure'>('fish');
  const [adventureSubTab, setAdventureSubTab] = useState<'map' | 'dispatch'>('map');

  // === State ===
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [mapList, setMapList] = useState<AdventureMap[]>([]);
  const [dispatchList, setDispatchList] = useState<DispatchJob[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null);

  // === Detail/Editing ===
  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [selectedDetailMap, setSelectedDetailMap] = useState<AdventureMap | null>(null);
  const [selectedDetailDispatch, setSelectedDetailDispatch] = useState<DispatchJob | null>(null);

  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingMap, setEditingMap] = useState<AdventureMap | null>(null);
  const [editingDispatch, setEditingDispatch] = useState<DispatchJob | null>(null);

  // === Modals ===
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
  const [isDispatchFormOpen, setIsDispatchFormOpen] = useState(false);
  const [isDispatchGuideOpen, setIsDispatchGuideOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFoodCategoryModalOpen, setIsFoodCategoryModalOpen] = useState(false);
  const [isBundleListModalOpen, setIsBundleListModalOpen] = useState(false);

  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [selectedItemType, setSelectedItemType] = useState<ItemType>(ItemType.Material);
  const [filterItemCategory, setFilterItemCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user: any) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubF = onSnapshot(query(collection(db, "fishes")), (s) => setFishList(s.docs.map(d => d.data() as Fish).sort((a,b) => a.id.localeCompare(b.id, undefined, {numeric: true}))));
    const unsubI = onSnapshot(query(collection(db, "items")), (s) => setItemList(s.docs.map(d => ({ id: d.id, ...d.data() } as Item)).sort((a,b) => (a.order||0)-(b.order||0))));
    const unsubM = onSnapshot(query(collection(db, "adventure_maps")), (s) => setMapList(s.docs.map(d => ({ id: d.id, ...d.data() } as AdventureMap)).sort((a,b) => (a.order||0)-(b.order||0))));
    const unsubD = onSnapshot(query(collection(db, "dispatch_jobs")), (s) => {
      setDispatchList(s.docs.map(d => ({ id: d.id, ...d.data() } as DispatchJob)).sort((a,b) => (a.order||0)-(b.order||0)));
      setLoading(false);
    });
    return () => { unsubF(); unsubI(); unsubM(); unsubD(); };
  }, []);

  const isDevMode = !!currentUser;

  // --- Handlers (Dispatch) ---
  const handleSaveDispatch = async (job: DispatchJob) => {
    if (!db || !currentUser) return;
    const id = job.id || Date.now().toString();
    await setDoc(doc(db, "dispatch_jobs", id), { ...job, id });
    setIsDispatchFormOpen(false);
    setEditingDispatch(null);
  };

  // --- Handlers (Existing Fish/Item/Map simplified to maintain structure) ---
  const handleSaveFish = async (f: Fish) => { if(db) await setDoc(doc(db, "fishes", f.id), f); setIsFormModalOpen(false); };
  const handleSaveItem = async (i: Item) => { if(db) await setDoc(doc(db, "items", i.id || Date.now().toString()), i); setIsItemFormModalOpen(false); };
  const handleSaveMap = async (m: AdventureMap) => { if(db) await setDoc(doc(db, "adventure_maps", m.id || Date.now().toString()), m); setIsMapFormModalOpen(false); };

  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      if (selectedRarity !== 'ALL' && fish.rarity !== selectedRarity) return false;
      const term = fishSearchTerm.toLowerCase();
      return fish.name.toLowerCase().includes(term) || fish.id.toLowerCase().includes(term);
    });
  }, [fishList, selectedRarity, fishSearchTerm]);

  const filteredItems = useMemo(() => {
    let items = itemList;
    if (activeTab === 'tackle') items = items.filter(item => item.type === ItemType.Tackle);
    else if (activeTab === 'items') items = items.filter(item => item.type === (selectedItemType === ItemType.Tackle ? ItemType.Material : selectedItemType));
    if (itemSearchTerm) {
      const term = itemSearchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }
    return items;
  }, [itemList, itemSearchTerm, selectedItemType, activeTab]);

  return (
    <div className="min-h-screen pb-12 bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">🐟 MagikarpFishingWiki</h1>
            <div className="flex items-center gap-3">
               {isDevMode && <button onClick={() => setIsWeeklyModalOpen(true)} className="text-xs text-amber-400 font-bold">加倍管理</button>}
               {isDevMode ? <button onClick={() => signOut(auth!)} className="text-xs text-slate-500">登出</button> : <button onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())} className="text-xs text-slate-600">🔒 登入</button>}
            </div>
          </div>
          <nav className="flex gap-6 border-b border-slate-800 overflow-x-auto no-scrollbar">
            {['fish', 'items', 'tackle', 'adventure'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-sm font-bold whitespace-nowrap capitalize ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>
                {tab === 'fish' ? '魚類圖鑑' : tab === 'items' ? '素材列表' : tab === 'tackle' ? '釣具列表' : '夥伴探索'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'fish' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">所有魚種 ({fishList.length})</h2>
              {isDevMode && <button onClick={() => {setEditingFish(null); setIsFormModalOpen(true);}} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg">＋ 新增</button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFish.map(f => <FishCard key={f.id} fish={f} viewMode="simple" isDevMode={isDevMode} onEdit={(fish) => {setEditingFish(fish); setIsFormModalOpen(true);}} onDelete={(id) => deleteDoc(doc(db!, "fishes", id))} onClick={setSelectedDetailFish} />)}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-white">素材列表</h2>
               {isDevMode && <button onClick={() => {setEditingItem(null); setIsItemFormModalOpen(true);}} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg">＋ 新增</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems.map(i => <ItemCard key={i.id} item={i} isDevMode={isDevMode} onEdit={(item) => {setEditingItem(item); setIsItemFormModalOpen(true);}} onDelete={(id) => deleteDoc(doc(db!, "items", id))} onClick={setSelectedDetailItem} />)}
            </div>
          </div>
        )}

        {activeTab === 'tackle' && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-bold text-white mb-6">釣具清單</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems.map(i => <ItemCard key={i.id} item={i} isDevMode={isDevMode} onEdit={(item) => {setEditingItem(item); setIsItemFormModalOpen(true);}} onDelete={(id) => deleteDoc(doc(db!, "items", id))} onClick={setSelectedDetailItem} />)}
            </div>
          </div>
        )}

        {activeTab === 'adventure' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-slate-900 rounded-lg p-1">
                <button onClick={() => setAdventureSubTab('map')} className={`px-4 py-2 text-xs font-bold rounded ${adventureSubTab === 'map' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}>🗺️ 夥伴大冒險</button>
                <button onClick={() => setAdventureSubTab('dispatch')} className={`px-4 py-2 text-xs font-bold rounded ${adventureSubTab === 'dispatch' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}>🕒 派遣工作</button>
              </div>
              <div className="flex gap-2">
                {adventureSubTab === 'dispatch' && <button onClick={() => setIsDispatchGuideOpen(true)} className="px-3 py-2 bg-blue-900/40 text-blue-300 text-xs font-bold rounded border border-blue-700/50">派遣指南</button>}
                {isDevMode && <button onClick={() => adventureSubTab === 'map' ? setIsMapFormModalOpen(true) : setIsDispatchFormOpen(true)} className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded shadow-lg transition hover:bg-purple-500">＋ 新增</button>}
              </div>
            </div>

            {adventureSubTab === 'map' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mapList.map(m => <AdventureMapCard key={m.id} mapData={m} isDevMode={isDevMode} onEdit={(map) => {setEditingMap(map); setIsMapFormModalOpen(true);}} onDelete={(id) => deleteDoc(doc(db!, "adventure_maps", id))} onClick={setSelectedDetailMap} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dispatchList.map(job => <DispatchJobCard key={job.id} job={job} isDevMode={isDevMode} onEdit={(j) => {setEditingDispatch(j); setIsDispatchFormOpen(true);}} onDelete={(id) => deleteDoc(doc(db!, "dispatch_jobs", id))} onClick={setSelectedDetailDispatch} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals - Dispatch */}
      {isDispatchFormOpen && <DispatchJobFormModal initialData={editingDispatch} onSave={handleSaveDispatch} onClose={() => {setIsDispatchFormOpen(false); setEditingDispatch(null);}} itemList={itemList} />}
      {selectedDetailDispatch && <DispatchJobDetailModal job={selectedDetailDispatch} onClose={() => setSelectedDetailDispatch(null)} itemList={itemList} onItemClick={setSelectedDetailItem} />}
      {isDispatchGuideOpen && <DispatchGuideModal isOpen={isDispatchGuideOpen} onClose={() => setIsDispatchGuideOpen(false)} isDevMode={isDevMode} />}

      {/* Modals - Maps */}
      {isMapFormModalOpen && <AdventureMapFormModal initialData={editingMap} onSave={handleSaveMap} onClose={() => {setIsMapFormModalOpen(false); setEditingMap(null);}} itemList={itemList} />}
      {selectedDetailMap && <AdventureMapDetailModal mapData={selectedDetailMap} onClose={() => setSelectedDetailMap(null)} itemList={itemList} onItemClick={setSelectedDetailItem} />}

      {/* Modals - Fish & Item */}
      {isFormModalOpen && <FishFormModal initialData={editingFish} existingIds={fishList.map(f=>f.id)} onSave={handleSaveFish} onClose={() => setIsFormModalOpen(false)} />}
      {selectedDetailFish && <FishDetailModal fish={selectedDetailFish} onClose={() => setSelectedDetailFish(null)} />}
      {isItemFormModalOpen && <ItemFormModal initialData={editingItem} onSave={handleSaveItem} onClose={() => setIsItemFormModalOpen(false)} itemList={itemList} />}
      {selectedDetailItem && <ItemDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} isDevMode={isDevMode} itemList={itemList} />}

      {/* Utilities */}
      <WeeklyEventModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} isDevMode={isDevMode} fishList={fishList} onFishClick={setSelectedDetailFish} />
      <GuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} currentUrl="" onUpdate={()=>{}} />
      <FoodCategoryModal isOpen={isFoodCategoryModalOpen} onClose={() => setIsFoodCategoryModalOpen(false)} isDevMode={isDevMode} />
      {/* 
         Fix: Replaced handleEditItem with an inline handler that uses setEditingItem and opens the form modal.
         Added a real delete handler using Firestore's deleteDoc.
      */}
      <BundleListModal 
        isOpen={isBundleListModalOpen} 
        onClose={() => setIsBundleListModalOpen(false)} 
        itemList={itemList} 
        isDevMode={isDevMode} 
        onEdit={(item) => { setEditingItem(item); setIsItemFormModalOpen(true); }} 
        onDelete={(id) => deleteDoc(doc(db!, "items", id))} 
        onClick={setSelectedDetailItem} 
      />
    </div>
  );
};

export default App;
