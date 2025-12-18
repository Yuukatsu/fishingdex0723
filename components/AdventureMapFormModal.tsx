
import React, { useState, useEffect, useRef } from 'react';
import { AdventureMap, Item, AdventureBuddy, AdventureMapItem, FieldEffect } from '../types';

interface AdventureMapFormModalProps {
  initialData?: AdventureMap | null;
  onSave: (map: AdventureMap) => void;
  onClose: () => void;
  itemList: Item[];
}

const AdventureMapFormModal: React.FC<AdventureMapFormModalProps> = ({ initialData, onSave, onClose, itemList }) => {
  const [formData, setFormData] = useState<AdventureMap>({
    id: '',
    name: '',
    imageUrl: '',
    description: '',
    unlockCondition: '',
    isEX: false,
    order: 0,
    recommendedLevel: 1, 
    requiredProgress: 0,
    fieldEffects: [],
    dropItemIds: [],
    rewardItemIds: [],
    buddies: []
  });

  // Map Image
  const mapFileInputRef = useRef<HTMLInputElement>(null);

  // Item Selection State
  const [itemSearchTerm, setItemSearchTerm] = useState(''); 
  const [newItemId, setNewItemId] = useState('');
  const [targetItemCollection, setTargetItemCollection] = useState<'drop' | 'reward'>('drop');

  // Buddy Input State
  const buddyFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      // Data Migration / Safety Check
      const safeDrops = (initialData.dropItemIds || []).map((item: any) => 
        typeof item === 'string' ? { id: item, isLowRate: false } : item
      );
      const safeRewards = (initialData.rewardItemIds || []).map((item: any) => 
        typeof item === 'string' ? { id: item, isLowRate: false } : item
      );

      setFormData({
          ...initialData,
          unlockCondition: initialData.unlockCondition || '',
          isEX: initialData.isEX || false,
          recommendedLevel: initialData.recommendedLevel || 1,
          requiredProgress: initialData.requiredProgress || 0,
          fieldEffects: initialData.fieldEffects || [],
          dropItemIds: safeDrops,
          rewardItemIds: safeRewards
      });
    } else {
      setFormData(prev => ({ ...prev, id: Date.now().toString(), order: 99, fieldEffects: [] }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('請輸入地圖名稱');
    onSave(formData);
  };

  // --- Map Image Upload ---
  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const TARGET_SIZE = 112; 
          
          let sx = 0, sy = 0, sWidth = width, sHeight = height;
          if (width > height) {
              sWidth = height;
              sx = (width - height) / 2;
          } else {
              sHeight = width;
              sy = (height - width) / 2;
          }

          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.imageSmoothingEnabled = false; 
             ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TARGET_SIZE, TARGET_SIZE);
             const dataUrl = canvas.toDataURL('image/png');
             setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
          }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (mapFileInputRef.current) mapFileInputRef.current.value = '';
  };

  // --- Field Effect Helpers ---
  const addFieldEffect = () => {
      const newEffect: FieldEffect = { name: '', chance: 100 };
      setFormData({ ...formData, fieldEffects: [...formData.fieldEffects, newEffect] });
  };

  const updateFieldEffect = (index: number, field: keyof FieldEffect, value: string | number) => {
      const updated = [...formData.fieldEffects];
      updated[index] = { ...updated[index], [field]: value };
      setFormData({ ...formData, fieldEffects: updated });
  };

  const removeFieldEffect = (index: number) => {
      setFormData({ 
          ...formData, 
          fieldEffects: formData.fieldEffects.filter((_, i) => i !== index) 
      });
  };

  // --- Item Helpers ---
  const addItem = () => {
      if (!newItemId) return;
      const targetListKey = targetItemCollection === 'drop' ? 'dropItemIds' : 'rewardItemIds';
      const currentList = formData[targetListKey];
      if (!currentList.some(i => i.id === newItemId)) {
          const newItem: AdventureMapItem = { id: newItemId, isLowRate: false };
          setFormData({ ...formData, [targetListKey]: [...currentList, newItem] });
      }
      setNewItemId('');
      setItemSearchTerm('');
  };

  const removeItem = (listKey: 'dropItemIds' | 'rewardItemIds', id: string) => {
      setFormData({ ...formData, [listKey]: formData[listKey].filter(item => item.id !== id) });
  };

  const toggleLowRate = (listKey: 'dropItemIds' | 'rewardItemIds', id: string) => {
      const updatedList = formData[listKey].map(item => {
          if (item.id === id) return { ...item, isLowRate: !item.isLowRate };
          return item;
      });
      setFormData({ ...formData, [listKey]: updatedList });
  };

  const filteredItemsForSelect = itemList.filter(i => 
      i.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  // --- Buddy Helpers ---
  const handleBuddyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 64; 
          if (width > MAX_SIZE || height > MAX_SIZE) {
              const ratio = width > height ? MAX_SIZE / width : MAX_SIZE / height;
              width *= ratio;
              height *= ratio;
          }
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.imageSmoothingEnabled = false; 
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             const imageUrl = canvas.toDataURL('image/png');
             const newBuddy: AdventureBuddy = { imageUrl };
             setFormData(prev => ({ ...prev, buddies: [...prev.buddies, newBuddy] }));
          }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (buddyFileInputRef.current) buddyFileInputRef.current.value = '';
  };

  const removeBuddy = (idx: number) => {
      const newBuddies = [...formData.buddies];
      newBuddies.splice(idx, 1);
      setFormData({ ...formData, buddies: newBuddies });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯地圖' : '新增地圖'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6">
              {/* Map Image Upload */}
              <div className="flex-shrink-0">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">地圖圖片 (112x112)</label>
                  <div 
                    className="w-28 h-28 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-700 transition relative overflow-hidden group"
                    onClick={() => mapFileInputRef.current?.click()}
                  >
                      {formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">更換</div>
                          </>
                      ) : (
                          <div className="text-center">
                              <span className="text-2xl">🖼️</span>
                              <div className="text-[10px] text-slate-400 mt-1">上傳圖片</div>
                          </div>
                      )}
                      <input type="file" ref={mapFileInputRef} onChange={handleMapImageUpload} accept="image/*" className="hidden" />
                  </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">地圖名稱</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                            placeholder="例如: 啟程草原"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">排序 (Order)</label>
                        <input 
                            type="number" 
                            value={formData.order} 
                            onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" 
                        />
                      </div>
                      <div className="flex items-end">
                        <label className={`w-full flex items-center justify-center gap-2 border rounded px-3 py-2 cursor-pointer transition-all ${formData.isEX ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                            <input 
                                type="checkbox" 
                                checked={formData.isEX || false} 
                                onChange={e => setFormData({ ...formData, isEX: e.target.checked })} 
                                className="w-4 h-4 rounded border-slate-600 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs font-bold uppercase">EX 地圖</span>
                        </label>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-3">
                         <label className="block text-xs font-bold text-slate-400 uppercase mb-1">解鎖條件 (選填)</label>
                         <input 
                             type="text" 
                             value={formData.unlockCondition || ''} 
                             onChange={e => setFormData({...formData, unlockCondition: e.target.value})} 
                             className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                             placeholder="例如: 通過第一章劇情"
                         />
                      </div>
                      <div className="md:col-span-1.5">
                        <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">推薦等級</label>
                        <input 
                            type="number" 
                            value={formData.recommendedLevel || ''} 
                            onChange={e => setFormData({...formData, recommendedLevel: parseInt(e.target.value) || 1})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-yellow-500" 
                            placeholder="Lv."
                        />
                      </div>
                      <div className="md:col-span-1.5">
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">所需進度點</label>
                        <input 
                            type="number" 
                            value={formData.requiredProgress || ''} 
                            onChange={e => setFormData({...formData, requiredProgress: parseInt(e.target.value) || 0})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500" 
                            placeholder="pt"
                        />
                      </div>
                  </div>
                  
                  {/* Multiple Field Effects Section */}
                  <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-purple-400 uppercase">⚡ 場地效果列表 (多個)</label>
                        <button 
                            type="button" 
                            onClick={addFieldEffect}
                            className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded font-bold transition shadow-sm"
                        >＋ 新增效果</button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.fieldEffects.map((effect, idx) => (
                            <div key={idx} className="flex gap-2 items-center animate-fadeIn bg-slate-900/50 p-2 rounded-lg border border-purple-500/10">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={effect.name} 
                                        onChange={e => updateFieldEffect(idx, 'name', e.target.value)} 
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none" 
                                        placeholder="場地名稱 (例如: 大晴天)"
                                    />
                                </div>
                                <div className="w-24 flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        min="0" max="100"
                                        value={effect.chance} 
                                        onChange={e => updateFieldEffect(idx, 'chance', parseInt(e.target.value) || 0)} 
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none text-right" 
                                        placeholder="%"
                                    />
                                    <span className="text-xs text-slate-500">%</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeFieldEffect(idx)}
                                    className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white rounded transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        {formData.fieldEffects.length === 0 && (
                            <p className="text-[10px] text-slate-500 italic text-center py-2">目前沒有場地效果</p>
                        )}
                      </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">描述</label>
                    <input 
                        type="text" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                        placeholder="關於這張地圖的簡介..."
                    />
                  </div>
              </div>
          </div>

          <div className="border-t border-slate-700"></div>

          {/* Item Management Section */}
          <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                   <span>📦 道具配置</span>
                   <span className="text-xs font-normal text-slate-500">(掉落: {formData.dropItemIds.length}, 獎勵: {formData.rewardItemIds.length})</span>
               </h3>
               
               {/* Search & Add Toolbar */}
               <div className="flex flex-col sm:flex-row gap-2 bg-slate-800 p-3 rounded-lg items-center border border-slate-700 shadow-sm">
                   <select 
                       value={targetItemCollection} 
                       onChange={e => setTargetItemCollection(e.target.value as any)}
                       className="w-full sm:w-auto bg-slate-900 border border-slate-600 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                   >
                       <option value="drop">設定為：掉落道具</option>
                       <option value="reward">設定為：通關獎勵</option>
                   </select>
                   
                   <div className="flex-1 flex gap-2 w-full">
                       <input 
                           type="text"
                           value={itemSearchTerm}
                           onChange={e => setItemSearchTerm(e.target.value)}
                           placeholder="搜尋道具名稱..."
                           className="w-1/3 min-w-[100px] bg-slate-900 border border-slate-600 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                       />
                       <select 
                           value={newItemId}
                           onChange={e => setNewItemId(e.target.value)}
                           className="flex-1 bg-slate-900 border border-slate-600 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                       >
                           <option value="">{filteredItemsForSelect.length === 0 ? '無符合道具' : '選擇道具...'}</option>
                           {filteredItemsForSelect.map(i => (
                               <option key={i.id} value={i.id}>{i.name}</option>
                           ))}
                       </select>
                   </div>
                   
                   <button type="button" onClick={addItem} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 transition shadow-lg">加入</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Drop List */}
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[150px] flex flex-col">
                       <label className="block text-xs font-bold text-blue-400 mb-3 border-b border-slate-700 pb-1">掉落道具列表 ({formData.dropItemIds.length})</label>
                       <div className="flex flex-col gap-2">
                           {formData.dropItemIds.map(mapItem => {
                               const item = itemList.find(i => i.id === mapItem.id);
                               return (
                                   <div key={mapItem.id} className="relative group bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-3 hover:border-blue-500 transition">
                                       <div className="w-8 h-8 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                           {item?.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <span className="text-[10px]">?</span>}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                            <span className="text-xs text-slate-300 truncate block">{item?.name || mapItem.id}</span>
                                            <label className="flex items-center gap-1.5 cursor-pointer mt-1 select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={mapItem.isLowRate || false} 
                                                    onChange={() => toggleLowRate('dropItemIds', mapItem.id)}
                                                    className="w-3 h-3 rounded border-slate-500 bg-slate-800 text-red-500 focus:ring-0"
                                                />
                                                <span className={`text-[10px] ${mapItem.isLowRate ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                                    {mapItem.isLowRate ? '低機率' : '一般機率'}
                                                </span>
                                            </label>
                                       </div>
                                       <button 
                                           type="button" 
                                           onClick={() => removeItem('dropItemIds', mapItem.id)} 
                                           className="w-6 h-6 bg-red-900/50 text-red-300 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center text-xs transition"
                                       >×</button>
                                   </div>
                               )
                           })}
                           {formData.dropItemIds.length === 0 && <span className="text-xs text-slate-600 italic p-2">尚未加入掉落物</span>}
                       </div>
                   </div>

                   {/* Reward List */}
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[150px] flex flex-col">
                       <label className="block text-xs font-bold text-amber-400 mb-3 border-b border-slate-700 pb-1">通關獎勵列表 ({formData.rewardItemIds.length})</label>
                       <div className="flex flex-col gap-2">
                           {formData.rewardItemIds.map(mapItem => {
                               const item = itemList.find(i => i.id === mapItem.id);
                               return (
                                   <div key={mapItem.id} className="relative group bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-3 hover:border-amber-500 transition">
                                       <div className="w-8 h-8 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                           {item?.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <span className="text-[10px]">?</span>}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                            <span className="text-xs text-slate-300 truncate block">{item?.name || mapItem.id}</span>
                                            <label className="flex items-center gap-1.5 cursor-pointer mt-1 select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={mapItem.isLowRate || false} 
                                                    onChange={() => toggleLowRate('rewardItemIds', mapItem.id)}
                                                    className="w-3 h-3 rounded border-slate-500 bg-slate-800 text-red-500 focus:ring-0"
                                                />
                                                <span className={`text-[10px] ${mapItem.isLowRate ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                                    {mapItem.isLowRate ? '低機率' : '一般機率'}
                                                </span>
                                            </label>
                                       </div>
                                       <button 
                                           type="button" 
                                           onClick={() => removeItem('rewardItemIds', mapItem.id)} 
                                           className="w-6 h-6 bg-red-900/50 text-red-300 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center text-xs transition"
                                       >×</button>
                                   </div>
                               )
                           })}
                           {formData.rewardItemIds.length === 0 && <span className="text-xs text-slate-600 italic p-2">尚未加入獎勵</span>}
                       </div>
                   </div>
               </div>
          </div>

          <div className="border-t border-slate-700 pt-4"></div>

          {/* Buddies Management */}
          <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <span>🤝 夥伴配置</span>
                  <span className="text-xs font-normal text-slate-500">({formData.buddies.length} 位夥伴)</span>
              </h3>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex-1 text-xs text-slate-400">
                          <p>點擊按鈕上傳夥伴圖片，上傳後將自動加入列表。</p>
                          <p className="mt-1 opacity-70">支援大量夥伴圖片展示，不需輸入名稱。</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => buddyFileInputRef.current?.click()} 
                        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition shadow-lg w-full sm:w-auto justify-center"
                      >
                          <span className="text-lg">＋</span> 上傳夥伴圖片
                      </button>
                      <input type="file" ref={buddyFileInputRef} onChange={handleBuddyImageUpload} accept="image/*" className="hidden" />
                  </div>

                  {/* Dense Grid for Buddies */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-1">
                      {formData.buddies.map((buddy, idx) => (
                          <div key={idx} className="relative group aspect-square bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center overflow-visible hover:border-blue-400 transition-colors">
                               {buddy.imageUrl ? (
                                   <img src={buddy.imageUrl} className="w-full h-full object-contain p-1 [image-rendering:pixelated]" />
                               ) : (
                                   <span className="text-xs">?</span>
                               )}
                               <button 
                                   type="button" 
                                   onClick={() => removeBuddy(idx)} 
                                   className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                               >×</button>
                          </div>
                      ))}
                      {formData.buddies.length === 0 && (
                          <div className="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                              尚未新增任何夥伴
                          </div>
                      )}
                  </div>
              </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-700 bg-slate-950 rounded-b-2xl flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition">取消</button>
            <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg">儲存地圖</button>
        </div>
      </div>
    </div>
  );
};

export default AdventureMapFormModal;
