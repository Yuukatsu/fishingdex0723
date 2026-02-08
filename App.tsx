
import React, { useState, useMemo, useEffect } from 'react';
import { Fish, Rarity, RARITY_ORDER, RARITY_COLORS, Item, ItemCategory, ITEM_CATEGORY_ORDER, TACKLE_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, AdventureMap, DispatchJob, DISPATCH_STATS, MainSkill, SpecialMainSkill, SubSkill, SkillCategory, SkillType, SKILL_CATEGORIES, SystemGuide, GuideCategory, GUIDE_CATEGORIES, GUIDE_CATEGORY_LABELS } from './types';
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
import MainSkillCard from './components/MainSkillCard';
import MainSkillFormModal from './components/MainSkillFormModal';
import MainSkillDetailModal from './components/MainSkillDetailModal';
import SpecialMainSkillCard from './components/SpecialMainSkillCard';
import SpecialMainSkillFormModal from './components/SpecialMainSkillFormModal';
import SpecialMainSkillDetailModal from './components/SpecialMainSkillDetailModal';
import SubSkillCard from './components/SubSkillCard'; // New
import SubSkillFormModal from './components/SubSkillFormModal'; // New
import SubSkillDetailModal from './components/SubSkillDetailModal'; // New
import ShopSettingsModal from './components/ShopSettingsModal';
import TackleRatesModal from './components/TackleRatesModal';
import SystemGuideCard from './components/SystemGuideCard'; 
import SystemGuideFormModal from './components/SystemGuideFormModal'; 
import SystemGuideDetailModal from './components/SystemGuideDetailModal'; 

// Firebase imports
import { db, auth, initError } from './src/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, writeBatch, getDoc, addDoc, orderBy } from 'firebase/firestore';
// Fix: Use module casting for firebase/auth to bypass "no exported member" errors
import * as firebaseAuth from 'firebase/auth';
const { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = firebaseAuth as any;
type User = any;

const App: React.FC = () => {
  // === Tabs ===
  const [activeTab, setActiveTab] = useState<'fish' | 'items' | 'tackle' | 'adventure' | 'guide'>('fish');
  const [adventureSubTab, setAdventureSubTab] = useState<'map' | 'dispatch' | 'skills'>('map');
  const [skillTab, setSkillTab] = useState<'main' | 'special' | 'sub'>('main');
  const [guideSubTab, setGuideSubTab] = useState<GuideCategory>('fishing'); // New Guide SubTab

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
  
  // === Dispatch State ===
  const [dispatchList, setDispatchList] = useState<DispatchJob[]>([]);

  // === Skill State ===
  const [mainSkillList, setMainSkillList] = useState<MainSkill[]>([]);
  const [specialMainSkillList, setSpecialMainSkillList] = useState<SpecialMainSkill[]>([]);
  const [subSkillList, setSubSkillList] = useState<SubSkill[]>([]); // New Sub Skills

  // === System Guide State ===
  const [systemGuides, setSystemGuides] = useState<SystemGuide[]>([]);

  const [loading, setLoading] = useState(true); // General loading
  const [error, setError] = useState<React.ReactNode | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Guide URL State
  const [guideUrl, setGuideUrl] = useState<string>('');
  
  // Huanye Icon State
  const [huanyeIconUrl, setHuanyeIconUrl] = useState<string>('');

  // Shop Settings State
  const [shopSettings, setShopSettings] = useState<any>(null);

  // === Filters ===
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  // Separate search terms for tabs
  const [fishSearchTerm, setFishSearchTerm] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [guideSearchTerm, setGuideSearchTerm] = useState(''); // New search term
  
  // Advanced Filters (Fish)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterConditions, setFilterConditions] = useState<string[]>([]);
  const [filterBattle, setFilterBattle] = useState<'all' | 'yes' | 'no'>('all');
  const [filterDepthMin, setFilterDepthMin] = useState<string>('');
  const [filterDepthMax, setFilterDepthMax] = useState<string>('');

  // Skill Filters
  const [skillFilterType, setSkillFilterType] = useState<SkillType | 'ALL'>('ALL');
  const [skillFilterCategory, setSkillFilterCategory] = useState<SkillCategory | 'ALL'>('ALL');

  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // === Modals ===
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFish, setEditingFish] = useState<Fish | null>(null);
  
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isMapFormModalOpen, setIsMapFormModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<AdventureMap | null>(null);
  
  const [isDispatchFormOpen, setIsDispatchFormOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<DispatchJob | null>(null);
  const [isDispatchGuideOpen, setIsDispatchGuideOpen] = useState(false);

  // Skill Modals
  const [isMainSkillFormOpen, setIsMainSkillFormOpen] = useState(false);
  const [editingMainSkill, setEditingMainSkill] = useState<MainSkill | null>(null);
  const [selectedDetailMainSkill, setSelectedDetailMainSkill] = useState<MainSkill | null>(null);

  const [isSpecialMainSkillFormOpen, setIsSpecialMainSkillFormOpen] = useState(false);
  const [editingSpecialMainSkill, setEditingSpecialMainSkill] = useState<SpecialMainSkill | null>(null);
  const [selectedDetailSpecialMainSkill, setSelectedDetailSpecialMainSkill] = useState<SpecialMainSkill | null>(null);
  const [selectedDetailSpecialMainSkillCategory, setSelectedDetailSpecialMainSkillCategory] = useState<SkillCategory | null>(null);

  const [isSubSkillFormOpen, setIsSubSkillFormOpen] = useState(false);
  const [editingSubSkill, setEditingSubSkill] = useState<SubSkill | null>(null);
  const [selectedDetailSubSkill, setSelectedDetailSubSkill] = useState<SubSkill | null>(null);

  // System Guide Modals
  const [isGuideFormOpen, setIsGuideFormOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<SystemGuide | null>(null);
  const [selectedDetailGuide, setSelectedDetailGuide] = useState<SystemGuide | null>(null);

  const [selectedDetailFish, setSelectedDetailFish] = useState<Fish | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [selectedDetailMap, setSelectedDetailMap] = useState<AdventureMap | null>(null);
  const [selectedDetailDispatch, setSelectedDetailDispatch] = useState<DispatchJob | null>(null);

  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFoodCategoryModalOpen, setIsFoodCategoryModalOpen] = useState(false);
  const [isBundleListModalOpen, setIsBundleListModalOpen] = useState(false); 
  const [isShopSettingsModalOpen, setIsShopSettingsModalOpen] = useState(false);
  const [isTackleRatesModalOpen, setIsTackleRatesModalOpen] = useState(false);

  // ... (Firebase effects unchanged) ...
  // ... (To save space, assuming the useEffects block is here as before) ...
  // 0. Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 1. Fetch Guide URL & Huanye Icon & Shop Settings
  const fetchAppSettings = async () => {
      if (!db) return;
      try {
          const guideRef = doc(db, 'app_settings', 'guide');
          const guideSnap = await getDoc(guideRef);
          if (guideSnap.exists() && guideSnap.data().guideImageUrl) {
              setGuideUrl(guideSnap.data().guideImageUrl);
          }
          const iconRef = doc(db, 'app_settings', 'icons');
          const iconSnap = await getDoc(iconRef);
          if (iconSnap.exists() && iconSnap.data().huanye) {
              setHuanyeIconUrl(iconSnap.data().huanye);
          }
          const shopRef = doc(db, 'app_settings', 'shops');
          const shopSnap = await getDoc(shopRef);
          if (shopSnap.exists()) {
              setShopSettings(shopSnap.data());
          }
      } catch (e) {
          console.error("Failed to fetch app settings", e);
      }
  };

  useEffect(() => { fetchAppSettings(); }, []);

  const handleUpdateHuanyeIcon = async (file: File) => {
      if (!db || !currentUser) return alert("權限不足");
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 60;
              canvas.height = 60;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  const ratio = Math.max(60 / img.width, 60 / img.height);
                  const centerShift_x = (60 - img.width * ratio) / 2;
                  const centerShift_y = (60 - img.height * ratio) / 2;
                  ctx.clearRect(0, 0, 60, 60);
                  ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                  const dataUrl = canvas.toDataURL('image/png');
                  setDoc(doc(db, 'app_settings', 'icons'), { huanye: dataUrl }, { merge: true }).then(() => { setHuanyeIconUrl(dataUrl); alert("備註圖示已更新"); }).catch(e => alert("更新失敗: " + e.message));
              }
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  // ... (Data Sync Effects 2-8 unchanged) ...
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
            id: data.id || doc.id, internalId: data.internalId, name: data.name || 'Unknown', description: data.description || '', rarity: data.rarity || Rarity.OneStar, depthMin: parseNum(data.depthMin), depthMax: parseNum(data.depthMax), conditions: Array.isArray(data.conditions) ? data.conditions : [], tags: Array.isArray(data.tags) ? data.tags : [],
            battleStats: data.battleStats || { tensileStrength: 0, durability: 0, luck: 0, preferredAction: '無', huanyeNote: '' },
            battleRequirements: data.battleRequirements || '', specialNote: data.specialNote || '', variants: data.variants || (data.imageUrl ? { normalMale: data.imageUrl } : {}), isNew: data.isNew || false
        } as Fish);
      });
      fetchedFish.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setFishList(fetchedFish);
      setLoadingFish(false);
      if(error && !loadingItems) setError(null);
    }, (err) => { console.error("Fish Query Error", err); handleFirebaseError(err); setLoadingFish(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    setLoadingItems(true);
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedItems: Item[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as any;
            fetchedItems.push({
                id: doc.id, name: data.name, description: data.description, source: data.source, type: data.type || ItemType.Material, category: data.category, imageUrl: data.imageUrl, isRare: data.isRare || false, order: data.order, recipe: data.recipe || [], flavors: data.flavors || [], foodCategories: data.foodCategories || [], satiety: data.satiety || 0,
                tensileStrength: data.tensileStrength || 0, durability: data.durability || 0, luck: data.luck || 0, extraEffect: data.extraEffect || '', bundleContentIds: data.bundleContentIds || [], bundleSubstituteIds: data.bundleSubstituteIds || []
            });
        });
        fetchedItems.sort((a, b) => { const orderA = a.order ?? 999999; const orderB = b.order ?? 999999; if (orderA !== orderB) return orderA - orderB; return a.id.localeCompare(b.id); });
        setItemList(fetchedItems);
        setLoadingItems(false);
    }, (err) => { console.error("Item Query Error", err); handleFirebaseError(err); setLoadingItems(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db) return;
      setLoadingMaps(true);
      const q = query(collection(db, "adventure_maps"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMaps: AdventureMap[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              const parseItems = (items: any[]) => { if (!items) return []; return items.map(i => { if (typeof i === 'string') return { id: i, isLowRate: false }; return i; }); };
              let effects = data.fieldEffects || [];
              if (effects.length === 0 && data.fieldEffect) { effects = [{ name: data.fieldEffect, chance: data.fieldEffectChance || 100 }]; }
              const buddies = (data.buddies || []).map((b: any) => ({ imageUrl: b.imageUrl, note: b.note || '' }));
              fetchedMaps.push({
                  id: doc.id, name: data.name, imageUrl: data.imageUrl, description: data.description, unlockCondition: data.unlockCondition || '', isEX: data.isEX || false, isLimitedTime: data.isLimitedTime || false, startDate: data.startDate || '', endDate: data.endDate || '', order: data.order ?? 99, recommendedLevel: data.recommendedLevel ?? 1, requiredProgress: data.requiredProgress ?? 0,
                  fieldEffects: effects, dropItemIds: parseItems(data.dropItemIds), rewardItemIds: parseItems(data.rewardItemIds), buddies: buddies
              });
          });
          fetchedMaps.sort((a, b) => a.order - b.order);
          setMapList(fetchedMaps);
          setLoadingMaps(false);
      }, (err) => { console.error("Maps Query Error", err); handleFirebaseError(err); setLoadingMaps(false); });
      return () => unsubscribe();
  }, []);
  
  useEffect(() => {
      if (!db) return;
      const q = query(collection(db, "dispatch_jobs"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedJobs: DispatchJob[] = [];
          snapshot.forEach((doc) => {
             const data = doc.data() as any;
             const parseItems = (items: any[]) => items ? items.map(i => typeof i === 'string' ? { id: i, isLowRate: false } : i) : [];
             let finalRequests = data.requests || [];
             if (finalRequests.length === 0 && (data.normalDrops || data.greatDrops)) {
                 finalRequests.push({
                     id: 'legacy_req', name: '一般委託', tags: data.tags || [], description: '', rewardsNormal: parseItems(data.normalDrops), rewardsGreat: parseItems(data.greatDrops), rewardsSuper: parseItems(data.specialDrops || [])
                 });
             } else {
                 finalRequests = finalRequests.map((req: any) => ({ ...req, tags: req.tags || [], description: req.description || '' }));
             }
             fetchedJobs.push({
                 id: doc.id, name: data.name || 'Unknown Enterprise', description: data.description || '', imageUrl: data.imageUrl || '', dropSummary: data.dropSummary || '', requests: finalRequests, order: data.order ?? 99, tags: data.tags, primaryStat: data.primaryStat, secondaryStat: data.secondaryStat, normalDrops: parseItems(data.normalDrops),
             });
          });
          fetchedJobs.sort((a, b) => a.order - b.order);
          setDispatchList(fetchedJobs);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db) return;
      const q = query(collection(db, "main_skills"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedSkills: MainSkill[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              fetchedSkills.push({
                  id: doc.id, name: data.name, type: data.type || '常駐型', categories: data.categories || [], categoryData: data.categoryData || {}, description: data.description || '', levelEffects: data.levelEffects || [],
              });
          });
          fetchedSkills.sort((a, b) => a.name.localeCompare(b.name));
          setMainSkillList(fetchedSkills);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db) return;
      const q = query(collection(db, "special_main_skills"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedSkills: SpecialMainSkill[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              fetchedSkills.push({
                  id: doc.id, name: data.name, description: data.description || '', type: data.type || '常駐型', levelEffects: data.levelEffects || ['', '', '', '', '', ''], partner: data.partner || { imageUrl: '' }, categories: data.categories || [], categoryData: data.categoryData || {}
              });
          });
          fetchedSkills.sort((a, b) => a.name.localeCompare(b.name));
          setSpecialMainSkillList(fetchedSkills);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db) return;
      const q = query(collection(db, "sub_skills"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedSkills: SubSkill[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              fetchedSkills.push({
                  id: doc.id, name: data.name, type: data.type || '常駐型', categories: data.categories || [], categoryData: data.categoryData || {}, description: data.description || '', levelEffects: data.levelEffects || [],
              });
          });
          fetchedSkills.sort((a, b) => a.name.localeCompare(b.name));
          setSubSkillList(fetchedSkills);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db) return;
      const q = query(collection(db, "system_guides"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedGuides: SystemGuide[] = [];
          snapshot.forEach((doc) => {
              const data = doc.data() as any;
              fetchedGuides.push({ id: doc.id, category: data.category, title: data.title, tags: data.tags || [], summary: data.summary || '', content: data.content || '', updatedAt: data.updatedAt || 0 });
          });
          fetchedGuides.sort((a, b) => b.updatedAt - a.updatedAt);
          setSystemGuides(fetchedGuides);
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => { setLoading(loadingFish || loadingItems || loadingMaps); }, [loadingFish, loadingItems, loadingMaps]);

  const handleFirebaseError = (err: any) => {
    if (err.code === 'permission-denied') {
        setError(
          <div className="text-left space-y-4">
            <div className="font-bold text-xl border-b border-red-400/30 pb-2">⚠️ 存取被拒 (Permission Denied)</div>
            <p>Firestore 拒絕了資料讀取請求。這通常是因為安全規則 (Security Rules) 未設定正確。</p>
            <p className="text-sm text-slate-300">請前往 Firebase Console {'>'} Firestore {'>'} Rules，確保已新增相關集合的讀取權限。</p>
          </div>
        );
    } else {
        setError(`無法連接資料庫 (${err.code}): ${err.message}`);
    }
  };

  // --- Filter Logic ---
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fishList.forEach(fish => fish.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [fishList]);

  const filteredFish = useMemo(() => {
    return fishList.filter(fish => {
      if (selectedRarity !== 'ALL' && fish.rarity !== selectedRarity) return false;
      const term = fishSearchTerm.toLowerCase();
      const matchesSearch = fish.name.toLowerCase().includes(term) || fish.id.toLowerCase().includes(term);
      if (!matchesSearch) return false;
      if (filterTags.length > 0 && !filterTags.every(t => fish.tags.includes(t))) return false;
      if (filterConditions.length > 0 && !filterConditions.every(c => fish.conditions.includes(c))) return false;
      
      if (filterBattle === 'yes') {
          const hasStats = fish.battleStats && (fish.battleStats.tensileStrength > 0 || fish.battleStats.durability > 0 || fish.battleStats.luck > 0);
          const hasReq = fish.battleRequirements && fish.battleRequirements.trim().length > 0;
          if (!hasStats && !hasReq) return false;
      }
      if (filterBattle === 'no') {
          const hasStats = fish.battleStats && (fish.battleStats.tensileStrength > 0 || fish.battleStats.durability > 0 || fish.battleStats.luck > 0);
          const hasReq = fish.battleRequirements && fish.battleRequirements.trim().length > 0;
          if (hasStats || hasReq) return false;
      }

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

  const filteredItems = useMemo(() => {
      let items = itemList;
      if (activeTab === 'tackle') items = items.filter(item => item.type === ItemType.Tackle);
      else if (activeTab === 'items') {
          const targetType = selectedItemType === ItemType.Tackle ? ItemType.Material : selectedItemType;
          items = items.filter(item => item.type === targetType);
      }
      if (activeTab === 'items' && selectedItemType === ItemType.Material) items = items.filter(item => item.category !== ItemCategory.Bundle);
      if (itemSearchTerm) {
         const term = itemSearchTerm.toLowerCase();
         items = items.filter(item => item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term) || item.source.toLowerCase().includes(term));
      }
      if (filterItemCategory !== 'ALL') items = items.filter(item => item.category === filterItemCategory);
      return items;
  }, [itemList, itemSearchTerm, selectedItemType, filterItemCategory, activeTab]);

  const filteredGuides = useMemo(() => {
      let guides = systemGuides.filter(g => g.category === guideSubTab);
      if (guideSearchTerm) {
          const term = guideSearchTerm.toLowerCase();
          guides = guides.filter(g => 
              g.title.toLowerCase().includes(term) || 
              g.tags.some(t => t.toLowerCase().includes(term)) ||
              g.summary.toLowerCase().includes(term)
          );
      }
      return guides;
  }, [systemGuides, guideSubTab, guideSearchTerm]);

  // Skill Filtering Logic
  const filteredMainSkills = useMemo(() => {
      return mainSkillList.filter(skill => {
          if (skillFilterType !== 'ALL' && skill.type !== skillFilterType) return false;
          if (skillFilterCategory !== 'ALL' && !skill.categories.includes(skillFilterCategory)) return false;
          return true;
      });
  }, [mainSkillList, skillFilterType, skillFilterCategory]);

  const filteredSpecialSkills = useMemo(() => {
      return specialMainSkillList.filter(skill => {
          if (skillFilterType !== 'ALL' && skill.type !== skillFilterType) return false;
          if (skillFilterCategory !== 'ALL' && !skill.categories.includes(skillFilterCategory)) return false;
          return true;
      });
  }, [specialMainSkillList, skillFilterType, skillFilterCategory]);

  const filteredSubSkills = useMemo(() => {
      return subSkillList.filter(skill => {
          // UPDATE: Ignore Type filter for Sub Skills, as they are effectively all 'Permanent'
          // if (skillFilterType !== 'ALL' && skill.type !== skillFilterType) return false; 
          
          if (skillFilterCategory !== 'ALL' && !skill.categories.includes(skillFilterCategory)) return false;
          return true;
      });
  }, [subSkillList, skillFilterType, skillFilterCategory]);


  // --- Helpers --- (getNextId, CRUD Handlers... same as before)
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

  const handleEditClick = (fish: Fish) => { setEditingFish(fish); setIsFormModalOpen(true); };
  const handleCreateClick = () => { setEditingFish(null); setIsFormModalOpen(true); };
  
  const handleSaveFish = async (fish: Fish) => {
    if (!db || !currentUser) return alert("權限不足：請先登入");
    try {
      if (editingFish && editingFish.id !== fish.id) await deleteDoc(doc(db, "fishes", editingFish.id));
      const fishToSave = { ...fish };
      delete (fishToSave as any).location; delete (fishToSave as any).imageUrl; delete (fishToSave as any).depth;
      fishToSave.depthMin = fishToSave.depthMin ?? 0;
      if (fishToSave.depthMax === undefined || fishToSave.depthMax === null || isNaN(fishToSave.depthMax)) delete fishToSave.depthMax;
      Object.keys(fishToSave).forEach(key => { if ((fishToSave as any)[key] === undefined) delete (fishToSave as any)[key]; });
      await setDoc(doc(db, "fishes", fish.id), fishToSave);
      setIsFormModalOpen(false); setEditingFish(null);
    } catch (e: any) { console.error(e); alert(`儲存失敗: ${e.code || 'Unknown Error'} - ${e.message}`); }
  };

  const handleDeleteFish = async (id: string) => {
    if (!db || !currentUser) return;
    if (window.confirm('確定要永久刪除此魚種資料嗎？')) { try { await deleteDoc(doc(db, "fishes", id)); } catch (e) { alert("刪除失敗"); } }
  };

  const handleEditItem = (item: Item) => { setEditingItem(item); setIsItemFormModalOpen(true); };
  const handleCreateItem = () => { 
      const defaultType = activeTab === 'tackle' ? ItemType.Tackle : ItemType.Material;
      const defaultCategory = activeTab === 'tackle' ? ItemCategory.Rod : ItemCategory.BallMaker;
      setEditingItem({ id: '', name: '', description: '', source: '', type: defaultType, category: defaultCategory, imageUrl: '', isRare: false, recipe: [] }); 
      setIsItemFormModalOpen(true); 
  };
  const handleCreateBundle = () => {
      setEditingItem({ id: '', name: '', description: '', source: '', type: ItemType.Material, category: ItemCategory.Bundle, imageUrl: '', isRare: false, recipe: [], bundleContentIds: [], bundleSubstituteIds: [] });
      setIsItemFormModalOpen(true);
  };
  const handleSaveItem = async (item: Item) => {
    if (!db || !currentUser) return alert("權限不足：請先登入");
    try {
        const itemToSave = { ...item };
        if (itemToSave.order === undefined) { const maxOrder = Math.max(...itemList.map(i => i.order || 0), 0); itemToSave.order = maxOrder + 1; }
        Object.keys(itemToSave).forEach(key => { if ((itemToSave as any)[key] === undefined) delete (itemToSave as any)[key]; });
        if (itemToSave.recipe) { itemToSave.recipe = itemToSave.recipe.map((r: any) => { const cleanR = { ...r }; if (cleanR.itemId === undefined) cleanR.itemId = ''; if (cleanR.quantity === undefined) cleanR.quantity = 1; return cleanR; }); }
        if (item.id) await setDoc(doc(db, "items", item.id), itemToSave); else await addDoc(collection(db, "items"), itemToSave);
        setIsItemFormModalOpen(false); setEditingItem(null);
    } catch (e: any) { console.error(e); alert(`儲存道具失敗: ${e.message}`); }
  };
  const handleDeleteItem = async (id: string) => { if (!db || !currentUser) return; if(window.confirm("確定要刪除此道具嗎？")) { try { await deleteDoc(doc(db, "items", id)); } catch(e) { alert("刪除失敗"); } } };
  const handleDragStart = (e: React.DragEvent, item: Item) => { e.dataTransfer.setData("text/plain", item.id); e.dataTransfer.effectAllowed = "move"; };
  const handleDropItem = async (e: React.DragEvent, targetItem: Item) => {
    if (!db || !currentUser) return;
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId === targetItem.id) return;
    const sourceItem = itemList.find(i => i.id === sourceId);
    if (!sourceItem) return;
    const sourceOrder = sourceItem.order ?? itemList.indexOf(sourceItem);
    const targetOrder = targetItem.order ?? itemList.indexOf(targetItem);
    try { const batch = writeBatch(db); batch.update(doc(db, "items", sourceItem.id), { order: targetOrder }); batch.update(doc(db, "items", targetItem.id), { order: sourceOrder }); await batch.commit(); } catch (e) { console.error("Swap failed", e); alert("排序更新失敗"); }
  };

  const handleEditMap = (map: AdventureMap) => { setEditingMap(map); setIsMapFormModalOpen(true); };
  const handleCreateMap = () => { setEditingMap(null); setIsMapFormModalOpen(true); };
  const handleSaveMap = async (map: AdventureMap) => {
      if (!db || !currentUser) return;
      try { await setDoc(doc(db, "adventure_maps", map.id || Date.now().toString()), map); setIsMapFormModalOpen(false); setEditingMap(null); } catch (e: any) { console.error("Save map error", e); alert("儲存失敗: " + e.message); }
  };
  const handleDeleteMap = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此地圖嗎？")) { try { await deleteDoc(doc(db, "adventure_maps", id)); } catch(e) { alert("刪除失敗"); } } };
  
  const handleMapDragStart = (e: React.DragEvent, map: AdventureMap) => { e.dataTransfer.setData("text/plain", map.id); e.dataTransfer.effectAllowed = "move"; };
  const handleMapDrop = async (e: React.DragEvent, targetMap: AdventureMap) => {
    if (!db || !currentUser) return;
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId === targetMap.id) return;
    const sourceIndex = mapList.findIndex(m => m.id === sourceId);
    const targetIndex = mapList.findIndex(m => m.id === targetMap.id);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const newMapList = [...mapList];
    const [movedItem] = newMapList.splice(sourceIndex, 1);
    newMapList.splice(targetIndex, 0, movedItem);
    try { const batch = writeBatch(db); newMapList.forEach((map, index) => { if (map.order !== index) { const mapRef = doc(db, "adventure_maps", map.id); batch.update(mapRef, { order: index }); } }); await batch.commit(); } catch (e) { console.error("Map Reorder failed", e); alert("排序更新失敗"); }
  };

  const handleSaveDispatch = async (job: DispatchJob) => {
    if (!db || !currentUser) return alert("權限不足：請先登入");
    try {
        const id = job.id || Date.now().toString();
        const jobToSave: any = { ...job, id };
        Object.keys(jobToSave).forEach(key => { if (jobToSave[key] === undefined) { delete jobToSave[key]; } });
        await setDoc(doc(db, "dispatch_jobs", id), jobToSave); setIsDispatchFormOpen(false); setEditingDispatch(null);
    } catch (e: any) { console.error("Save Dispatch Error:", e); alert(`儲存失敗: ${e.message}`); }
  };
  const handleDeleteDispatch = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此工作嗎？")) { try { await deleteDoc(doc(db, "dispatch_jobs", id)); } catch(e: any) { alert(`刪除失敗: ${e.message}`); } } };

  const handleSaveMainSkill = async (skill: MainSkill) => { if (!db || !currentUser) return alert("權限不足"); try { const id = skill.id || Date.now().toString(); await setDoc(doc(db, "main_skills", id), { ...skill, id }); setIsMainSkillFormOpen(false); setEditingMainSkill(null); } catch (e: any) { alert(`儲存失敗: ${e.message}`); } };
  const handleDeleteMainSkill = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此技能嗎？")) { try { await deleteDoc(doc(db, "main_skills", id)); } catch(e: any) { alert("刪除失敗"); } } };

  const handleSaveSpecialMainSkill = async (skill: SpecialMainSkill) => { if (!db || !currentUser) return alert("權限不足"); try { const id = skill.id || Date.now().toString(); await setDoc(doc(db, "special_main_skills", id), { ...skill, id }); setIsSpecialMainSkillFormOpen(false); setEditingSpecialMainSkill(null); } catch (e: any) { alert(`儲存失敗: ${e.message}`); } };
  const handleDeleteSpecialMainSkill = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此特殊技能嗎？")) { try { await deleteDoc(doc(db, "special_main_skills", id)); } catch(e: any) { alert("刪除失敗"); } } };

  const handleSaveSubSkill = async (skill: SubSkill) => { if (!db || !currentUser) return alert("權限不足"); try { const id = skill.id || Date.now().toString(); await setDoc(doc(db, "sub_skills", id), { ...skill, id }); setIsSubSkillFormOpen(false); setEditingSubSkill(null); } catch (e: any) { alert(`儲存失敗: ${e.message}`); } };
  const handleDeleteSubSkill = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此副技能嗎？")) { try { await deleteDoc(doc(db, "sub_skills", id)); } catch(e: any) { alert("刪除失敗"); } } };

  const handleSaveGuide = async (guide: SystemGuide) => { if (!db || !currentUser) return alert("權限不足"); try { const id = guide.id || Date.now().toString(); await setDoc(doc(db, "system_guides", id), { ...guide, id }); setIsGuideFormOpen(false); setEditingGuide(null); } catch (e: any) { alert(`儲存失敗: ${e.message}`); } };
  const handleDeleteGuide = async (id: string) => { if (!db || !currentUser) return; if (window.confirm("確定要刪除此說明嗎？")) { try { await deleteDoc(doc(db, "system_guides", id)); } catch(e: any) { alert("刪除失敗"); } } };

  const handleLogin = async () => { if (!auth) return; try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (error: any) { alert(`Login failed: ${error.message}`); } };
  const handleLogout = async () => { if (auth) await signOut(auth); };

  const toggleFilter = (item: string, currentList: string[], setter: (val: string[]) => void) => { setter(currentList.includes(item) ? currentList.filter(t => t !== item) : [...currentList, item]); };
  const isDevMode = !!currentUser;

  const getSearchTerm = () => { if (activeTab === 'fish') return fishSearchTerm; if (activeTab === 'items') return itemSearchTerm; if (activeTab === 'guide') return guideSearchTerm; return ''; };
  const setSearchTerm = (val: string) => { if (activeTab === 'fish') setFishSearchTerm(val); else if (activeTab === 'items') setItemSearchTerm(val); else if (activeTab === 'guide') setGuideSearchTerm(val); };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 bg-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        {/* ... Header content ... */}
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
                    <input type="text" placeholder={activeTab === 'fish' ? "搜尋魚類..." : activeTab === 'items' ? "搜尋道具..." : activeTab === 'guide' ? "搜尋標題或標籤..." : "搜尋..."} value={getSearchTerm()} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                   {activeTab === 'fish' && <button onClick={() => setIsWeeklyModalOpen(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1 transition-transform hover:scale-105 active:scale-95"><span>📅</span> <span className="hidden sm:inline">加倍</span></button>}
                   {isDevMode ? <button onClick={handleLogout} className="text-slate-300 hover:text-white text-xs">登出</button> : <button onClick={handleLogin} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-600 rounded-lg hover:text-white transition-all text-xs font-medium">🔒 登入</button>}
                </div>
            </div>
            {shopSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                    {shopSettings.sp?.imageUrl && (<a href={shopSettings.sp.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-blue-500/30 bg-slate-900 shadow-lg hover:shadow-blue-900/20 transition-all hover:scale-[1.01] hover:border-blue-500/60 h-20 md:h-24"><img src={shopSettings.sp.imageUrl} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition duration-300"><span className="text-xs font-bold text-white flex items-center gap-1">💎 前往 SP 商店 <span className="text-lg">↗</span></span></div></a>)}
                    {shopSettings.exchange?.imageUrl && (<a href={shopSettings.exchange.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-amber-500/30 bg-slate-900 shadow-lg hover:shadow-amber-900/20 transition-all hover:scale-[1.01] hover:border-amber-500/60 h-20 md:h-24"><img src={shopSettings.exchange.imageUrl} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition duration-300"><span className="text-xs font-bold text-white flex items-center gap-1">⚖️ 前往交換所 <span className="text-lg">↗</span></span></div></a>)}
                    {shopSettings.event?.isVisible && shopSettings.event?.imageUrl && (<a href={shopSettings.event.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-rose-500/30 bg-slate-900 shadow-lg hover:shadow-rose-900/20 transition-all hover:scale-[1.01] hover:border-rose-500/60 h-20 md:h-24"><img src={shopSettings.event.imageUrl} className="w-full h-full object-cover" /><div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-bl font-bold shadow-md">限時</div><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition duration-300"><span className="text-xs font-bold text-white flex items-center gap-1">⏳ 前往活動商店 <span className="text-lg">↗</span></span></div></a>)}
                </div>
            )}
            <div className="flex items-center gap-6 border-b border-slate-700/50 px-2 overflow-x-auto">
                <button onClick={() => setActiveTab('fish')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'fish' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🐟</span> 魚類圖鑑 {activeTab === 'fish' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}</button>
                <button onClick={() => setActiveTab('items')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'items' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🎒</span> 道具列表 {activeTab === 'items' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>}</button>
                <button onClick={() => { setActiveTab('tackle'); setFilterItemCategory('ALL'); }} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'tackle' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🎣</span> 釣具列表 {activeTab === 'tackle' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full"></span>}</button>
                <button onClick={() => setActiveTab('adventure')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'adventure' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}><span>🏕️</span> 夥伴系統 {activeTab === 'adventure' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></span>}</button>
                <button onClick={() => setActiveTab('guide')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap ${activeTab === 'guide' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}><span>📘</span> 系統說明 {activeTab === 'guide' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!loading && !error && (
            <>
                {activeTab === 'fish' && (
                    <div className="animate-fadeIn">
                       {/* Fish Tab Content */}
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                             <button onClick={() => setSelectedRarity('ALL')} className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${selectedRarity === 'ALL' ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}><div className="text-xl">📚</div><div className="text-xl font-bold text-white mt-1">{fishList.length}</div><div className="text-xs text-slate-400">總數</div></button>
                            {RARITY_ORDER.map(rarity => {
                                const count = fishList.filter(f => f.rarity === rarity).length;
                                const isActive = selectedRarity === rarity;
                                const colorStyle = RARITY_COLORS[rarity].split(' ')[0];
                                return (
                                    <button key={rarity} onClick={() => setSelectedRarity(rarity)} className={`bg-slate-800/50 border rounded-xl p-3 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${isActive ? 'border-white bg-slate-700 shadow-xl scale-105 ring-2 ring-white/20' : 'border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}><div className={`text-xl font-black ${colorStyle}`}>{rarity}</div><div className="text-xl font-bold text-white mt-1">{count}</div><div className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>總數</div></button>
                                );
                            })}
                        </div>
                        <div className="mb-8 flex justify-end gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-1">
                                <button onClick={() => guideUrl ? window.open(guideUrl, '_blank') : alert("尚未設定")} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-900/50 text-blue-200 border border-blue-700/50 hover:bg-blue-800 transition flex items-center gap-2"><span>📖 釣魚指南</span></button>
                                {isDevMode && <button onClick={() => setIsGuideModalOpen(true)} className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white">⚙️</button>}
                                {isDevMode && <button onClick={() => setIsShopSettingsModalOpen(true)} className="p-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-400 hover:text-white">🛒</button>}
                            </div>
                            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                <button onClick={() => setViewMode('simple')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'simple' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>🖼️</button>
                                <button onClick={() => setViewMode('detailed')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'detailed' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>📋</button>
                            </div>
                            <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}><span>⚙️ 進階篩選</span></button>
                            {isDevMode && (<div className="flex gap-2 border-l border-slate-700 pl-3 ml-2"><button onClick={handleCreateClick} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all border border-green-400/30">＋ 新增魚種</button></div>)}
                        </div>
                        {showAdvancedFilters && (
                           <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 animate-fadeIn mb-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-3">水深 (m)</label><div className="flex gap-2"><input type="number" placeholder="Min" value={filterDepthMin} onChange={e=>setFilterDepthMin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /><input type="number" placeholder="Max" value={filterDepthMax} onChange={e=>setFilterDepthMax(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div></div>
                                <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-3">標籤</label><div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">{allTags.map(t=><button key={t} onClick={()=>toggleFilter(t, filterTags, setFilterTags)} className={`px-3 py-1 text-xs rounded-full border ${filterTags.includes(t)?'bg-blue-600 border-blue-500 text-white':'bg-slate-900 border-slate-700 text-slate-400'}`}>{t}</button>)}</div></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">比拚</label><div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700"><button onClick={()=>setFilterBattle('all')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='all'?'bg-slate-700 text-white':'text-slate-400'}`}>All</button><button onClick={()=>setFilterBattle('yes')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='yes'?'bg-red-900/50 text-red-200':'text-slate-400'}`}>Yes</button><button onClick={()=>setFilterBattle('no')} className={`flex-1 py-1 text-xs rounded ${filterBattle==='no'?'bg-green-900/50 text-green-200':'text-slate-400'}`}>No</button></div></div>
                              </div>
                           </div>
                        )}
                       {filteredFish.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'simple' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                                {filteredFish.map((fish) => <FishCard key={fish.id} fish={fish} viewMode={viewMode} isDevMode={isDevMode} onEdit={handleEditClick} onDelete={handleDeleteFish} onClick={(f) => setSelectedDetailFish(f)} />)}
                            </div>
                       ) : <div className="text-center py-20 opacity-50"><div className="text-6xl mb-4">🌊</div><p>找不到魚...</p></div>}
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="animate-fadeIn pb-20">
                        {/* Items Tab Content */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div><h2 className="text-2xl font-bold text-white">道具列表</h2><p className="text-slate-400 text-sm mt-1">遊戲中出現的所有物品與獲取方式</p></div>
                                <div className="flex gap-2 ml-auto">
                                    {selectedItemType === ItemType.LunchBox && <button onClick={() => setIsFoodCategoryModalOpen(true)} className="px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 border border-orange-600 whitespace-nowrap"><span>🥚</span> 食物分類</button>}
                                    {selectedItemType === ItemType.Material && <button onClick={() => setIsBundleListModalOpen(true)} className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 border border-indigo-600 whitespace-nowrap"><span>🧺</span> 集合一覽</button>}
                                    {isDevMode && <><button onClick={handleCreateItem} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap"><span>＋</span> 新增</button></>}
                                </div>
                            </div>
                            <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
                                {ITEM_TYPE_ORDER.filter(t => t !== ItemType.Tackle).map(type => (
                                    <button key={type} onClick={() => { setSelectedItemType(type); setFilterItemCategory('ALL'); }} className={`px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-1 md:flex-none ${selectedItemType === type ? 'bg-slate-700 text-white shadow-lg ring-1 ring-slate-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{type}</button>
                                ))}
                            </div>
                            {selectedItemType === ItemType.Material && (
                                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar animate-fadeIn">
                                    <button onClick={() => setFilterItemCategory('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === 'ALL' ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>全部</button>
                                    {ITEM_CATEGORY_ORDER.map(cat => (
                                        <button key={cat} onClick={() => setFilterItemCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterItemCategory === cat ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{cat}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-12">
                            {selectedItemType === ItemType.Material ? (
                                ITEM_CATEGORY_ORDER.map(category => {
                                    if (filterItemCategory !== 'ALL' && filterItemCategory !== category) return null;
                                    const itemsInCategory = filteredItems.filter(i => i.category === category);
                                    if (itemsInCategory.length === 0 && !isDevMode) return null;
                                    return (
                                        <div key={category} className="animate-fadeIn">
                                            <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2"><span className="w-1 h-6 bg-emerald-500 rounded-full"></span>{category}<span className="text-xs font-normal text-slate-500 ml-2">({itemsInCategory.length})</span></h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{itemsInCategory.map(item => <ItemCard key={item.id} item={item} isDevMode={isDevMode} onEdit={handleEditItem} onDelete={handleDeleteItem} onClick={(i) => setSelectedDetailItem(i)} onDragStart={handleDragStart} onDrop={handleDropItem} itemList={itemList} />)}</div>
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
                         {/* Tackle Tab Content */}
                         <div className="flex flex-col gap-6 mb-8">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div><h2 className="text-2xl font-bold text-white">釣具列表</h2><p className="text-slate-400 text-sm mt-1">各種釣竿、捲線器與釣魚裝備</p></div>
                                <div className="flex gap-2 ml-auto">
                                    <button onClick={() => setIsTackleRatesModalOpen(true)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 border border-indigo-400/50">📊 機率分布</button>
                                    {isDevMode && <button onClick={handleCreateItem} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap"><span>＋</span> 新增釣具</button>}
                                </div>
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
                                 <div><h2 className="text-2xl font-bold text-white">夥伴系統</h2><p className="text-slate-400 text-sm mt-1">派遣你的夥伴去冒險，帶回珍貴的寶物！</p></div>
                                 <div className="flex gap-2">
                                     {adventureSubTab === 'dispatch' && <button onClick={() => setIsDispatchGuideOpen(true)} className="px-3 py-2 bg-blue-900/40 text-blue-300 text-xs font-bold rounded border border-blue-700/50 hover:bg-blue-800 transition">派遣指南</button>}
                                     {isDevMode && adventureSubTab === 'map' && <button onClick={handleCreateMap} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增地圖</button>}
                                     {isDevMode && adventureSubTab === 'dispatch' && <button onClick={() => setIsDispatchFormOpen(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增企業</button>}
                                     {isDevMode && adventureSubTab === 'skills' && skillTab === 'main' && <button onClick={() => { setEditingMainSkill(null); setIsMainSkillFormOpen(true); }} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增技能</button>}
                                     {isDevMode && adventureSubTab === 'skills' && skillTab === 'special' && <button onClick={() => { setEditingSpecialMainSkill(null); setIsSpecialMainSkillFormOpen(true); }} className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增特殊技能</button>}
                                     {isDevMode && adventureSubTab === 'skills' && skillTab === 'sub' && <button onClick={() => { setEditingSubSkill(null); setIsSubSkillFormOpen(true); }} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增副技能</button>}
                                 </div>
                             </div>
                             
                             <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-lg self-start border border-slate-800">
                                 <button onClick={() => setAdventureSubTab('map')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${adventureSubTab === 'map' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>🗺️ 夥伴大冒險</button>
                                 <button onClick={() => setAdventureSubTab('skills')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${adventureSubTab === 'skills' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>⚡ 夥伴技能</button>
                                 <button onClick={() => setAdventureSubTab('dispatch')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${adventureSubTab === 'dispatch' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>🕒 派遣工作</button>
                             </div>
                        </div>

                        {/* Sub-Tab Content */}
                        {adventureSubTab === 'map' ? (
                            <div className="animate-fadeIn">
                                {mapList.length === 0 ? (
                                    <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl"><div className="text-6xl mb-4">🗺️</div><p>目前還沒有開放的冒險地圖</p></div>
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
                                                onDragStart={handleMapDragStart}
                                                onDrop={handleMapDrop}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : adventureSubTab === 'skills' ? (
                            <div className="animate-fadeIn">
                                {/* Skill Sub-Tabs */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                    <div className="flex bg-slate-800 p-1 rounded-full border border-slate-700">
                                        <button onClick={() => setSkillTab('main')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${skillTab === 'main' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>主技能</button>
                                        <button onClick={() => setSkillTab('special')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${skillTab === 'special' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>特殊主技能</button>
                                        <button onClick={() => setSkillTab('sub')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${skillTab === 'sub' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>副技能</button>
                                    </div>

                                    {/* Skill Filters */}
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <select 
                                                value={skillFilterType}
                                                onChange={(e) => setSkillFilterType(e.target.value as SkillType | 'ALL')}
                                                className="appearance-none bg-slate-900 border border-slate-600 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                <option value="ALL">所有類型</option>
                                                <option value="常駐型">常駐型</option>
                                                <option value="機率型">機率型</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">▼</div>
                                        </div>
                                        <div className="relative">
                                            <select 
                                                value={skillFilterCategory}
                                                onChange={(e) => setSkillFilterCategory(e.target.value as SkillCategory | 'ALL')}
                                                className="appearance-none bg-slate-900 border border-slate-600 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                <option value="ALL">所有類別</option>
                                                {SKILL_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">▼</div>
                                        </div>
                                    </div>
                                </div>

                                {skillTab === 'main' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {filteredMainSkills.map(skill => (
                                            <MainSkillCard 
                                                key={skill.id} 
                                                skill={skill} 
                                                isDevMode={isDevMode} 
                                                onEdit={(s) => { setEditingMainSkill(s); setIsMainSkillFormOpen(true); }}
                                                onDelete={handleDeleteMainSkill}
                                                onClick={setSelectedDetailMainSkill}
                                            />
                                        ))}
                                        {filteredMainSkills.length === 0 && (
                                            <div className="col-span-full text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                                                <div className="text-6xl mb-4">⚔️</div>
                                                <p>沒有符合條件的主技能</p>
                                            </div>
                                        )}
                                    </div>
                                ) : skillTab === 'special' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {filteredSpecialSkills.map(skill => (
                                            <SpecialMainSkillCard
                                                key={skill.id}
                                                skill={skill}
                                                isDevMode={isDevMode}
                                                onEdit={(s) => { setEditingSpecialMainSkill(s); setIsSpecialMainSkillFormOpen(true); }}
                                                onDelete={handleDeleteSpecialMainSkill}
                                                onClick={(s) => { setSelectedDetailSpecialMainSkill(s); setSelectedDetailSpecialMainSkillCategory(null); }}
                                                onCategoryClick={(s, cat) => { setSelectedDetailSpecialMainSkill(s); setSelectedDetailSpecialMainSkillCategory(cat); }}
                                            />
                                        ))}
                                        {filteredSpecialSkills.length === 0 && (
                                            <div className="col-span-full text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                                                <div className="text-6xl mb-4">🌟</div>
                                                <p>沒有符合條件的特殊主技能</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {filteredSubSkills.map(skill => (
                                            <SubSkillCard 
                                                key={skill.id} 
                                                skill={skill} 
                                                isDevMode={isDevMode} 
                                                onEdit={(s) => { setEditingSubSkill(s); setIsSubSkillFormOpen(true); }}
                                                onDelete={handleDeleteSubSkill}
                                                onClick={setSelectedDetailSubSkill}
                                            />
                                        ))}
                                        {filteredSubSkills.length === 0 && (
                                            <div className="col-span-full text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                                                <div className="text-6xl mb-4">🛡️</div>
                                                <p>沒有符合條件的副技能</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                {dispatchList.length === 0 ? (
                                    <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl"><div className="text-6xl mb-4">📋</div><p>目前沒有派遣工作</p></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {dispatchList.map(job => <DispatchJobCard key={job.id} job={job} isDevMode={isDevMode} onEdit={(j) => {setEditingDispatch(j); setIsDispatchFormOpen(true);}} onDelete={handleDeleteDispatch} onClick={setSelectedDetailDispatch} />)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* === SYSTEM GUIDE TAB CONTENT === */}
                {activeTab === 'guide' && (
                    <div className="animate-fadeIn pb-20">
                        {/* Sub-Navigation for Guide */}
                        <div className="flex flex-col gap-6 mb-8">
                             <div className="flex justify-between items-center">
                                 <div><h2 className="text-2xl font-bold text-white">系統說明</h2><p className="text-slate-400 text-sm mt-1">各種遊戲機制的詳細說明筆記。</p></div>
                                 <div className="flex gap-2">
                                     {isDevMode && (
                                         <button onClick={() => { setEditingGuide(null); setIsGuideFormOpen(true); }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"><span>＋</span> 新增筆記</button>
                                     )}
                                 </div>
                             </div>
                             
                             <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-lg self-start border border-slate-800 overflow-x-auto max-w-full no-scrollbar">
                                 {GUIDE_CATEGORIES.map(cat => (
                                     <button 
                                        key={cat}
                                        onClick={() => setGuideSubTab(cat)} 
                                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${guideSubTab === cat ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                     >
                                         {GUIDE_CATEGORY_LABELS[cat]}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Guide Content Grid */}
                        <div className="animate-fadeIn">
                            {filteredGuides.length === 0 ? (
                                <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl"><div className="text-6xl mb-4">📓</div><p>此分類目前沒有說明筆記</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredGuides.map(guide => (
                                        <SystemGuideCard 
                                            key={guide.id}
                                            guide={guide}
                                            isDevMode={isDevMode}
                                            onEdit={(g) => { setEditingGuide(g); setIsGuideFormOpen(true); }}
                                            onDelete={handleDeleteGuide}
                                            onClick={(g) => setSelectedDetailGuide(g)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>
        )}
      </main>

      {/* Modals Injection - Unchanged */}
      {isFormModalOpen && <FishFormModal initialData={editingFish} existingIds={fishList.map(f => f.id)} suggestedId={getNextId} suggestedInternalId={getNextInternalId} onSave={handleSaveFish} onClose={() => setIsFormModalOpen(false)} />}
      {isItemFormModalOpen && <ItemFormModal initialData={editingItem} onSave={handleSaveItem} onClose={() => setIsItemFormModalOpen(false)} itemList={itemList} />}
      {isMapFormModalOpen && <AdventureMapFormModal initialData={editingMap} onSave={handleSaveMap} onClose={() => setIsMapFormModalOpen(false)} itemList={itemList} />}
      {isDispatchFormOpen && <DispatchJobFormModal initialData={editingDispatch} onSave={handleSaveDispatch} onClose={() => {setIsDispatchFormOpen(false); setEditingDispatch(null);}} itemList={itemList} />}
      {selectedDetailDispatch && <DispatchJobDetailModal job={selectedDetailDispatch} onClose={() => setSelectedDetailDispatch(null)} itemList={itemList} onItemClick={setSelectedDetailItem} />}
      {isDispatchGuideOpen && <DispatchGuideModal isOpen={isDispatchGuideOpen} onClose={() => setIsDispatchGuideOpen(false)} isDevMode={isDevMode} />}
      {isMainSkillFormOpen && <MainSkillFormModal initialData={editingMainSkill} onSave={handleSaveMainSkill} onClose={() => setIsMainSkillFormOpen(false)} />}
      {selectedDetailMainSkill && <MainSkillDetailModal skill={selectedDetailMainSkill} onClose={() => setSelectedDetailMainSkill(null)} />}
      {isSpecialMainSkillFormOpen && <SpecialMainSkillFormModal initialData={editingSpecialMainSkill} onSave={handleSaveSpecialMainSkill} onClose={() => setIsSpecialMainSkillFormOpen(false)} />}
      {selectedDetailSpecialMainSkill && <SpecialMainSkillDetailModal skill={selectedDetailSpecialMainSkill} initialCategory={selectedDetailSpecialMainSkillCategory} onClose={() => { setSelectedDetailSpecialMainSkill(null); setSelectedDetailSpecialMainSkillCategory(null); }} />}
      {isSubSkillFormOpen && <SubSkillFormModal initialData={editingSubSkill} onSave={handleSaveSubSkill} onClose={() => setIsSubSkillFormOpen(false)} />}
      {selectedDetailSubSkill && <SubSkillDetailModal skill={selectedDetailSubSkill} onClose={() => setSelectedDetailSubSkill(null)} />}
      {isGuideFormOpen && <SystemGuideFormModal initialData={editingGuide} currentCategory={guideSubTab} onSave={handleSaveGuide} onClose={() => { setIsGuideFormOpen(false); setEditingGuide(null); }} />}
      {selectedDetailGuide && <SystemGuideDetailModal guide={selectedDetailGuide} onClose={() => setSelectedDetailGuide(null)} />}
      {selectedDetailFish && <FishDetailModal fish={selectedDetailFish} onClose={() => setSelectedDetailFish(null)} huanyeIconUrl={huanyeIconUrl} onIconUpload={handleUpdateHuanyeIcon} isDevMode={isDevMode} />}
      {selectedDetailItem && <ItemDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} isDevMode={isDevMode} itemList={itemList} />}
      {selectedDetailMap && <AdventureMapDetailModal mapData={selectedDetailMap} onClose={() => setSelectedDetailMap(null)} itemList={itemList} onItemClick={(item) => setSelectedDetailItem(item)} />}
      <WeeklyEventModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} isDevMode={isDevMode} fishList={fishList} onFishClick={(f) => setSelectedDetailFish(f)} />
      <GuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} currentUrl={guideUrl} onUpdate={setGuideUrl} />
      <FoodCategoryModal isOpen={isFoodCategoryModalOpen} onClose={() => setIsFoodCategoryModalOpen(false)} isDevMode={isDevMode} />
      <BundleListModal isOpen={isBundleListModalOpen} onClose={() => setIsBundleListModalOpen(false)} itemList={itemList} isDevMode={isDevMode} onEdit={handleEditItem} onDelete={handleDeleteItem} onClick={(i) => setSelectedDetailItem(i)} onCreate={handleCreateBundle} />
      <ShopSettingsModal isOpen={isShopSettingsModalOpen} onClose={() => setIsShopSettingsModalOpen(false)} onUpdate={fetchAppSettings} />
      <TackleRatesModal isOpen={isTackleRatesModalOpen} onClose={() => setIsTackleRatesModalOpen(false)} isDevMode={isDevMode} />
    </div>
  );
};

export default App;
