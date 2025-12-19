
import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS, Item, ItemCategory, ITEM_CATEGORY_ORDER, TACKLE_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, AdventureMap, DispatchJob } from './types';
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
import { db, auth } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fish' | 'items' | 'tackle' | 'adventure'>('fish');
  const [adventureSubTab, setAdventureSubTab] = useState<'map' | 'dispatch'>('map');

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [mapList, setMapList] = useState<AdventureMap[]>([]);
  const [dispatchList, setDispatchList] = useState<DispatchJob[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [isFishFormOpen, setIsFishFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isMapFormOpen, setIsMapFormOpen] = useState(false);
  const [isDispatchFormOpen, setIsDispatchFormOpen] = useState(false);
  const [isDispatchGuideOpen, setIsDispatchGuideOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isFoodCategoryModalOpen, setIsFoodCategoryModalOpen] = useState(false);
  const [isBundleListModalOpen, setIsBundleListModalOpen] = useState(false);

  // Detail/Edit data
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedMap, setSelectedMap] = useState<AdventureMap | null>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchJob | null>(null);
  
  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingMap, setEditingMap] = useState<AdventureMap | null>(null);
  const [editingDispatch, setEditingDispatch] = useState<DispatchJob | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
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

  const handleSaveDispatch = async (job: DispatchJob) => {
    if (!db || !currentUser) return;
    const id = job.id || Date.now().toString();
    await setDoc(doc(db, "dispatch_jobs", id), { ...job, id });
    setIsDispatchFormOpen(false);
    setEditingDispatch(null);
  };

  const handleSaveMap = async (map: AdventureMap) => {
    if (!db || !currentUser) return;
    const id = map.id || Date.now().toString();
    await setDoc(doc(db, "adventure_maps", id), { ...map, id });
    setIsMapFormOpen(false);
    setEditingMap(null);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">🐟 MagikarpFishingWiki</h1>
            <div className="flex items-center gap-3">
               {isDevMode && <button onClick={() => setIsWeeklyModalOpen(true)} className="text-xs text-amber-400 font-bold">加倍活動管理</button>}
               {isDevMode ? <button onClick={() => signOut(auth!)} className="text-xs text-slate-500">登出</button> : <button onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())} className="text-xs text-slate-600">🔒 管理登入</button>}
            </div>
          </div>
          <nav className="flex gap-6 border-b border-slate-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('fish')} className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === 'fish' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>魚類圖鑑</button>
            <button onClick={() => setActiveTab('items')} className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === 'items' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500'}`}>素材列表</button>
            <button onClick={() => setActiveTab('tackle')} className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === 'tackle' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}>釣具列表</button>
            <button onClick={() => setActiveTab('adventure')} className={`pb-3 text-sm font-bold whitespace-nowrap ${activeTab === 'adventure' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500'}`}>夥伴探索</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {/* FISH TAB */}
        {activeTab === 'fish' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-white">所有魚種 ({fishList.length})</h2>
               {isDevMode && <button onClick={() => setIsFishFormOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg">＋ 新增魚種</button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {fishList.map(f => <FishCard key={f.id} fish={f} viewMode="simple" isDevMode={isDevMode} onEdit={(fish) => {setEditingFish(fish); setIsFishFormOpen(true);}} onDelete={async (id) => {if(window.confirm("確定刪除？")) await deleteDoc(doc(db!, "fishes", id))}} onClick={setSelectedFish} />)}
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
               <div className="flex gap-2">
                 <h2 className="text-lg font-bold text-white">素材與集合</h2>
                 <button onClick={() => setIsBundleListModalOpen(true)} className="text-xs text-indigo-400 hover:underline">查看所有集合</button>
                 <button onClick={() => setIsFoodCategoryModalOpen(true)} className="text-xs text-orange-400 hover:underline">蛋群對照表</button>
               </div>
               {isDevMode && <button onClick={() => setIsItemFormOpen(true)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg">＋ 新增道具</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itemList.filter(i => i.type !== ItemType.Tackle).map(i => <ItemCard key={i.id} item={i} isDevMode={isDevMode} onEdit={(item) => {setEditingItem(item); setIsItemFormOpen(true);}} onDelete={async (id) => {if(window.confirm("確定刪除？")) await deleteDoc(doc(db!, "items", id))}} onClick={setSelectedItem} itemList={itemList} />)}
            </div>
          </div>
        )}

        {/* TACKLE TAB */}
        {activeTab === 'tackle' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-white">專業釣具清單</h2>
               {isDevMode && <button onClick={() => setIsItemFormOpen(true)} className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg">＋ 新增釣具</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {itemList.filter(i => i.type === ItemType.Tackle).map(i => <ItemCard key={i.id} item={i} isDevMode={isDevMode} onEdit={(item) => {setEditingItem(item); setIsItemFormOpen(true);}} onDelete={async (id) => {if(window.confirm("確定刪除？")) await deleteDoc(doc(db!, "items", id))}} onClick={setSelectedItem} />)}
            </div>
          </div>
        )}

        {/* ADVENTURE TAB */}
        {activeTab === 'adventure' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button onClick={() => setAdventureSubTab('map')} className={`px-4 py-2 text-xs font-bold rounded ${adventureSubTab === 'map' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>🗺️ 夥伴大冒險</button>
                <button onClick={() => setAdventureSubTab('dispatch')} className={`px-4 py-2 text-xs font-bold rounded ${adventureSubTab === 'dispatch' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>🕒 派遣工作</button>
              </div>
              <div className="flex gap-2">
                {adventureSubTab === 'dispatch' && <button onClick={() => setIsDispatchGuideOpen(true)} className="px-3 py-2 bg-blue-900/40 text-blue-300 text-xs font-bold rounded border border-blue-700/50 hover:bg-blue-800 transition">派遣指南</button>}
                {isDevMode && <button onClick={() => adventureSubTab === 'map' ? setIsMapFormOpen(true) : setIsDispatchFormOpen(true)} className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded shadow-lg transition hover:bg-purple-500">＋ 新增{adventureSubTab === 'map' ? '地圖' : '工作'}</button>}
              </div>
            </div>

            {adventureSubTab === 'map' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mapList.map(m => <AdventureMapCard key={m.id} mapData={m} isDevMode={isDevMode} onEdit={(map) => {setEditingMap(map); setIsMapFormOpen(true);}} onDelete={async (id) => {if(window.confirm("確定刪除？")) await deleteDoc(doc(db!, "adventure_maps", id))}} onClick={setSelectedMap} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dispatchList.map(job => <DispatchJobCard key={job.id} job={job} isDevMode={isDevMode} onEdit={(j) => {setEditingDispatch(j); setIsDispatchFormOpen(true);}} onDelete={async (id) => {if(window.confirm("確定刪除？")) await deleteDoc(doc(db!, "dispatch_jobs", id))}} onClick={setSelectedDispatch} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* DISPATCH MODALS */}
      {isDispatchFormOpen && <DispatchJobFormModal initialData={editingDispatch} onSave={handleSaveDispatch} onClose={() => {setIsDispatchFormOpen(false); setEditingDispatch(null);}} itemList={itemList} />}
      {selectedDispatch && <DispatchJobDetailModal job={selectedDispatch} onClose={() => setSelectedDispatch(null)} itemList={itemList} onItemClick={setSelectedItem} />}
      {isDispatchGuideOpen && <DispatchGuideModal isOpen={isDispatchGuideOpen} onClose={() => setIsDispatchGuideOpen(false)} isDevMode={isDevMode} />}

      {/* MAP MODALS */}
      {isMapFormOpen && <AdventureMapFormModal initialData={editingMap} onSave={handleSaveMap} onClose={() => {setIsMapFormOpen(false); setEditingMap(null);}} itemList={itemList} />}
      {selectedMap && <AdventureMapDetailModal mapData={selectedMap} onClose={() => setSelectedMap(null)} itemList={itemList} onItemClick={setSelectedItem} />}

      {/* FISH & ITEM MODALS */}
      {isFishFormOpen && <FishFormModal initialData={editingFish} existingIds={fishList.map(f=>f.id)} onSave={async (f) => {if(db) await setDoc(doc(db,"fishes",f.id), f); setIsFishFormOpen(false); setEditingFish(null);}} onClose={() => {setIsFishFormOpen(false); setEditingFish(null);}} />}
      {selectedFish && <FishDetailModal fish={selectedFish} onClose={() => setSelectedFish(null)} />}
      {isItemFormOpen && <ItemFormModal initialData={editingItem} onSave={async (i) => {if(db) await setDoc(doc(db,"items",i.id), i); setIsItemFormOpen(false); setEditingItem(null);}} onClose={() => {setIsItemFormOpen(false); setEditingItem(null);}} itemList={itemList} />}
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} isDevMode={isDevMode} itemList={itemList} />}

      {/* UTILITY MODALS */}
      {isWeeklyModalOpen && <WeeklyEventModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} isDevMode={isDevMode} fishList={fishList} onFishClick={setSelectedFish} />}
      {isFoodCategoryModalOpen && <FoodCategoryModal isOpen={isFoodCategoryModalOpen} onClose={() => setIsFoodCategoryModalOpen(false)} isDevMode={isDevMode} />}
      {isBundleListModalOpen && <BundleListModal isOpen={isBundleListModalOpen} onClose={() => setIsBundleListModalOpen(false)} itemList={itemList} isDevMode={isDevMode} onEdit={(i)=>{setEditingItem(i); setIsItemFormOpen(true);}} onDelete={()=>{}} onClick={setSelectedItem} />}
    </div>
  );
};

export default App;
