
import React, { useState, useEffect, useRef } from 'react';
import { AdventureMap, Item, AdventureBuddy } from '../types';

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
    description: '',
    order: 0,
    dropItemIds: [],
    rewardItemIds: [],
    buddies: []
  });

  // Item Selection State
  const [newItemId, setNewItemId] = useState('');
  const [targetItemCollection, setTargetItemCollection] = useState<'drop' | 'reward'>('drop');

  // Buddy Input State
  const [newBuddyName, setNewBuddyName] = useState('');
  const [newBuddyImage, setNewBuddyImage] = useState('');
  const buddyFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({ ...prev, id: Date.now().toString(), order: 99 }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('請輸入地圖名稱');
    onSave(formData);
  };

  // --- Item Helpers ---
  const addItem = () => {
      if (!newItemId) return;
      const targetListKey = targetItemCollection === 'drop' ? 'dropItemIds' : 'rewardItemIds';
      const currentList = formData[targetListKey];
      
      if (!currentList.includes(newItemId)) {
          setFormData({ ...formData, [targetListKey]: [...currentList, newItemId] });
      }
      setNewItemId('');
  };

  const removeItem = (listKey: 'dropItemIds' | 'rewardItemIds', id: string) => {
      setFormData({ ...formData, [listKey]: formData[listKey].filter(itemId => itemId !== id) });
  };

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
          // Resize to 64x64 max
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
             setNewBuddyImage(canvas.toDataURL('image/png'));
          }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addBuddy = () => {
      if (!newBuddyName) return alert("請輸入夥伴名稱");
      const newBuddy: AdventureBuddy = {
          name: newBuddyName,
          imageUrl: newBuddyImage
      };
      setFormData({ ...formData, buddies: [...formData.buddies, newBuddy] });
      setNewBuddyName('');
      setNewBuddyImage('');
  };

  const removeBuddy = (idx: number) => {
      const newBuddies = [...formData.buddies];
      newBuddies.splice(idx, 1);
      setFormData({ ...formData, buddies: newBuddies });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl my-8">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯地圖' : '新增地圖'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="border-t border-slate-700 pt-4"></div>

          {/* Item Management Section */}
          <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-300">📦 道具配置 (掉落物 & 獎勵)</h3>
               <div className="flex gap-2 bg-slate-800 p-2 rounded-lg items-center">
                   <select 
                       value={targetItemCollection} 
                       onChange={e => setTargetItemCollection(e.target.value as any)}
                       className="bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1"
                   >
                       <option value="drop">設定為：掉落道具</option>
                       <option value="reward">設定為：通關獎勵</option>
                   </select>
                   <select 
                       value={newItemId}
                       onChange={e => setNewItemId(e.target.value)}
                       className="flex-1 bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1"
                   >
                       <option value="">選擇道具...</option>
                       {itemList.map(i => (
                           <option key={i.id} value={i.id}>{i.name}</option>
                       ))}
                   </select>
                   <button type="button" onClick={addItem} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500">加入</button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   {/* Drop List */}
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 min-h-[100px]">
                       <label className="block text-xs font-bold text-blue-400 mb-2">掉落道具列表</label>
                       <div className="flex flex-wrap gap-2">
                           {formData.dropItemIds.map(id => {
                               const item = itemList.find(i => i.id === id);
                               return (
                                   <span key={id} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs text-slate-300 border border-slate-600">
                                       {item?.imageUrl && <img src={item.imageUrl} className="w-4 h-4 object-contain" />}
                                       {item?.name || id}
                                       <button type="button" onClick={() => removeItem('dropItemIds', id)} className="ml-1 text-red-400 hover:text-white">×</button>
                                   </span>
                               )
                           })}
                           {formData.dropItemIds.length === 0 && <span className="text-xs text-slate-600 italic">無</span>}
                       </div>
                   </div>

                   {/* Reward List */}
                   <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 min-h-[100px]">
                       <label className="block text-xs font-bold text-amber-400 mb-2">通關獎勵列表</label>
                       <div className="flex flex-wrap gap-2">
                           {formData.rewardItemIds.map(id => {
                               const item = itemList.find(i => i.id === id);
                               return (
                                   <span key={id} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs text-slate-300 border border-slate-600">
                                       {item?.imageUrl && <img src={item.imageUrl} className="w-4 h-4 object-contain" />}
                                       {item?.name || id}
                                       <button type="button" onClick={() => removeItem('rewardItemIds', id)} className="ml-1 text-red-400 hover:text-white">×</button>
                                   </span>
                               )
                           })}
                           {formData.rewardItemIds.length === 0 && <span className="text-xs text-slate-600 italic">無</span>}
                       </div>
                   </div>
               </div>
          </div>

          <div className="border-t border-slate-700 pt-4"></div>

          {/* Buddies Management */}
          <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300">🤝 夥伴配置</h3>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex gap-3 items-end mb-4">
                      <div 
                        className="w-12 h-12 bg-slate-900 border border-slate-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden"
                        onClick={() => buddyFileInputRef.current?.click()}
                      >
                          {newBuddyImage ? <img src={newBuddyImage} className="w-full h-full object-contain [image-rendering:pixelated]" /> : <span className="text-xs text-slate-500">圖片</span>}
                          <input type="file" ref={buddyFileInputRef} onChange={handleBuddyImageUpload} accept="image/*" className="hidden" />
                      </div>
                      <div className="flex-1">
                          <label className="text-[10px] text-slate-400">夥伴名稱</label>
                          <input type="text" value={newBuddyName} onChange={e => setNewBuddyName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs" />
                      </div>
                      <button type="button" onClick={addBuddy} className="px-3 py-1.5 bg-green-700 text-white text-xs rounded hover:bg-green-600 h-8">新增夥伴</button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {formData.buddies.map((buddy, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-700">
                               <div className="w-8 h-8 bg-black/30 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                   {buddy.imageUrl ? <img src={buddy.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" /> : <span>?</span>}
                               </div>
                               <span className="text-xs text-slate-200 flex-1 truncate">{buddy.name}</span>
                               <button type="button" onClick={() => removeBuddy(idx)} className="text-red-400 hover:text-white px-1">×</button>
                          </div>
                      ))}
                      {formData.buddies.length === 0 && <p className="text-xs text-slate-500 italic col-span-full text-center py-2">尚未新增夥伴</p>}
                  </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm text-slate-300 hover:text-white transition">取消</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg">儲存地圖</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdventureMapFormModal;
