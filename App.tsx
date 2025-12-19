
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
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fish' | 'items' | 'tackle' | 'adventure'>('fish');
  const [adventureSubTab, setAdventureSubTab] = useState<'map' | 'dispatch'>('map');

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [mapList, setMapList] = useState<AdventureMap[]>([]);
  const [dispatchList, setDispatchList] = useState<DispatchJob[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guideUrl, setGuideUrl] = useState<string>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
  const [isDispatchFormModalOpen, setIsDispatchFormModalOpen] = useState(false);
  const [isDispatchGuideOpen, setIsDispatchGuideOpen] = useState(false);

  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingMap, setEditingMap] = useState<AdventureMap | null>(null);
  const [editingDispatch, setEditingDispatch] = useState<DispatchJob | null>(null);

  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [selectedDetailMap, setSelectedDetailMap] = useState<AdventureMap | null>(null);
  const [selectedDetailDispatch, setSelectedDetailDispatch] = useState<DispatchJob | null>(null);

  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFoodCategoryModalOpen, setIsFoodCategoryModalOpen] = useState(false);
  const [isBundleListModalOpen, setIsBundleListModalOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const qF = query(collection(db, "fishes"));
    const unsubscribeF = onSnapshot(qF, (snapshot) => {
      const fetched: Fish[] = snapshot.docs.map(d => d.data() as Fish);
      setFishList(fetched.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })));
    });
    const qI = query(collection(db, "items"));
    const unsubscribeI = onSnapshot(qI, (snapshot) => {
      const fetched: Item[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Item));
      setItemList(fetched.sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    const qM = query(collection(db, "adventure_maps"));
    const unsubscribeM = onSnapshot(qM, (snapshot) => {
      const fetched: AdventureMap[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdventureMap));
      setMapList(fetched.sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    const qD = query(collection(db, "dispatch_jobs"));
    const unsubscribeD = onSnapshot(qD, (snapshot) => {
      const fetched: DispatchJob[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DispatchJob));
      setDispatchList(fetched.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });
    return () => { unsubscribeF(); unsubscribeI(); unsubscribeM(); unsubscribeD(); };
  }, []);

  const handleSaveDispatch = async (job: DispatchJob) => {
    if (!db || !currentUser) return;
    const id = job.id || Date.now().toString();
    await setDoc(doc(db, "dispatch_jobs", id), { ...job, id });
    setIsDispatchFormModalOpen(false);
  };

  const handleDeleteDispatch = async (id: string) => {
    if (!db || !currentUser || !window.confirm("確定刪除？")) return;
    await deleteDoc(doc(db, "dispatch_jobs", id));
  };

  const isDevMode = !!currentUser;

  return (
    <div className="min-h-screen pb-12 bg-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">MagikarpFishingWiki</h1>
            <div className="flex items-center gap-2">
               {isDevMode ? <button onClick={() => signOut(auth!)} className="text-slate-300 text-xs">登出</button> : <button onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())} className="text-slate-400 text-xs">🔒 登入</button>}
            </div>
          </div>
          <div className="flex gap-6 border-b border-slate-700/50 px-2 overflow-x-auto">
            <button onClick={() => setActiveTab('fish')} className={`pb-3 text-sm font-bold ${activeTab === 'fish' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}>魚類圖鑑</button>
            <button onClick={() => setActiveTab('items')} className={`pb-3 text-sm font-bold ${activeTab === 'items' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400'}`}>道具列表</button>
            <button onClick={() => setActiveTab('tackle')} className={`pb-3 text-sm font-bold ${activeTab === 'tackle' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>釣具列表</button>
            <button onClick={() => setActiveTab('adventure')} className={`pb-3 text-sm font-bold ${activeTab === 'adventure' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400'}`}>夥伴探索</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'adventure' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
               <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg">
                  <button onClick={() => setAdventureSubTab('map')} className={`px-4 py-2 text-xs font-bold rounded-md ${adventureSubTab === 'map' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>🗺️ 夥伴大冒險</button>
                  <button onClick={() => setAdventureSubTab('dispatch')} className={`px-4 py-2 text-xs font-bold rounded-md ${adventureSubTab === 'dispatch' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>🕒 派遣工作</button>
               </div>
               <div className="flex gap-2">
                  {adventureSubTab === 'dispatch' && (
                    <button onClick={() => setIsDispatchGuideOpen(true)} className="px-3 py-2 bg-blue-900/50 text-blue-200 text-xs font-bold rounded-lg border border-blue-700/50 hover:bg-blue-800 transition">派遣指南</button>
                  )}
                  {isDevMode && (
                    <button onClick={() => adventureSubTab === 'map' ? setIsMapFormModalOpen(true) : setIsDispatchFormModalOpen(true)} className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg">＋ 新增{adventureSubTab === 'map' ? '地圖' : '工作'}</button>
                  )}
               </div>
            </div>

            {adventureSubTab === 'map' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mapList.map(m => <AdventureMapCard key={m.id} mapData={m} isDevMode={isDevMode} onEdit={setEditingMap} onDelete={handleDeleteDispatch} onClick={setSelectedDetailMap} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dispatchList.map(job => (
                  <DispatchJobCard key={job.id} job={job} isDevMode={isDevMode} onEdit={(j) => { setEditingDispatch(j); setIsDispatchFormModalOpen(true); }} onDelete={handleDeleteDispatch} onClick={setSelectedDetailDispatch} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {isDispatchFormModalOpen && <DispatchJobFormModal initialData={editingDispatch} onSave={handleSaveDispatch} onClose={() => { setIsDispatchFormModalOpen(false); setEditingDispatch(null); }} itemList={itemList} />}
      {selectedDetailDispatch && <DispatchJobDetailModal job={selectedDetailDispatch} onClose={() => setSelectedDetailDispatch(null)} itemList={itemList} onItemClick={setSelectedDetailItem} />}
      {isDispatchGuideOpen && <DispatchGuideModal isOpen={isDispatchGuideOpen} onClose={() => setIsDispatchGuideOpen(false)} isDevMode={isDevMode} />}
      
      {selectedDetailItem && <ItemDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} isDevMode={isDevMode} itemList={itemList} />}
      {/* 其他地圖彈窗與魚種彈窗省略... */}
    </div>
  );
};

export default App;
