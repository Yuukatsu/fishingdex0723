import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EncounterPartner, ENCOUNTER_RARITIES, ENCOUNTER_SCENES, Item } from '../types';

interface EncounterFormModalProps {
  initialData?: EncounterPartner | null;
  onSave: (partner: EncounterPartner) => void;
  onClose: () => void;
  currentScene: string;
  itemList: Item[];
}

const EncounterFormModal: React.FC<EncounterFormModalProps> = ({ initialData, onSave, onClose, currentScene, itemList }) => {
  const [formData, setFormData] = useState<EncounterPartner>({
      id: '',
      scene: currentScene,
      rarity: ENCOUNTER_RARITIES[0],
      name: '',
      partnerId: '',
      likedFlavors: [],
      dislikedFlavors: [],
      eggGroup: '',
      eggGroups: [],
      dropItems: [],
      imageUrl: '',
      order: 0
  });

  const [dropItemInput, setDropItemInput] = useState('');
  const [likedInput, setLikedInput] = useState('');
  const [dislikedInput, setDislikedInput] = useState('');
  const [eggGroupInput, setEggGroupInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (!dropItemInput) return [];
    
    const searchableItems: {name: string, category: string, id: string, isPerfect?: boolean}[] = [];
    itemList.forEach(item => {
        searchableItems.push({ name: item.name, category: item.category, id: item.id });
        if (item.hasPerfectQuality && item.perfectQualityName) {
            searchableItems.push({ 
                name: item.perfectQualityName, 
                category: item.category, 
                id: `${item.id}-perfect`,
                isPerfect: true
            });
        }
    });

    return searchableItems.filter(item => 
      item.name.toLowerCase().includes(dropItemInput.toLowerCase()) &&
      !formData.dropItems.some(drop => drop.name === item.name)
    ).slice(0, 5);
  }, [dropItemInput, itemList, formData.dropItems]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({ ...prev, scene: currentScene }));
    }
  }, [initialData, currentScene]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>, inputVal: string, setInputVal: React.Dispatch<React.SetStateAction<string>>, arrayName: 'dropItems' | 'likedFlavors' | 'dislikedFlavors' | 'eggGroups') => {
      if (e.key === 'Enter' && inputVal.trim() !== '') {
          e.preventDefault();
          setFormData({ ...formData, [arrayName]: [...(formData[arrayName] as string[]), inputVal.trim()] });
          setInputVal('');
      }
  };

  const removeItem = (index: number, arrayName: 'dropItems' | 'likedFlavors' | 'dislikedFlavors' | 'eggGroups') => {
      const newArray = [...(formData[arrayName] as string[])];
      newArray.splice(index, 1);
      setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("請填寫夥伴名稱");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{initialData ? '編輯遭遇夥伴' : '新增遭遇夥伴'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload */}
                <div className="col-span-full flex flex-col items-center justify-center bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-6 relative">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="max-h-48 object-contain rounded-lg" />
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center">
                        <span className="text-4xl mb-2">📸</span>
                        <span>上傳夥伴圖片</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">夥伴名稱 *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" required placeholder="如：皮卡丘" />
                </div>

                {/* Partner ID */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">夥伴編號</label>
                  <input type="text" value={formData.partnerId} onChange={e => setFormData({...formData, partnerId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="#025" />
                </div>

                {/* Scene */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">遭遇場景</label>
                  <select value={formData.scene} onChange={e => setFormData({...formData, scene: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                    {ENCOUNTER_SCENES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Rarity */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">稀有度</label>
                  <select value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                    {ENCOUNTER_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Egg Groups */}
                <div className={formData.scene === '限時活動' ? "col-span-full md:col-span-1" : "col-span-full"}>
                  <label className="block text-sm font-bold text-slate-300 mb-1">蛋群 (輸入後按 Enter)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.eggGroups || []).map((egg, index) => (
                          <span key={index} className="bg-slate-700 text-slate-200 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                              {egg}
                              <button type="button" onClick={() => removeItem(index, 'eggGroups')} className="text-slate-400 hover:text-red-400 focus:outline-none">✕</button>
                          </span>
                      ))}
                  </div>
                  <input type="text" value={eggGroupInput} onChange={e => setEggGroupInput(e.target.value)} onKeyDown={e => handleAddItem(e, eggGroupInput, setEggGroupInput, 'eggGroups')} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="輸入蛋群..." />
                </div>
                
                {/* Event Date (Only for Limited Event) */}
                {formData.scene === '限時活動' && (
                    <div className="col-span-full md:col-span-1">
                      <label className="block text-sm font-bold text-orange-300 mb-1">活動日期</label>
                      <input type="text" value={formData.eventDate || ''} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full bg-slate-900 border border-orange-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" placeholder="如：2024/01/01 - 2024/01/15" />
                    </div>
                )}

                {/* Liked Flavors */}
                <div className="col-span-full">
                  <label className="block text-sm font-bold text-orange-300 mb-1">喜歡的口味 (輸入後按 Enter)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {formData.likedFlavors.map((flavor, index) => (
                          <span key={index} className="bg-orange-900/40 text-orange-200 px-2 py-1 rounded-md text-sm border border-orange-700/50 flex items-center gap-1">
                              {flavor}
                              <button type="button" onClick={() => removeItem(index, 'likedFlavors')} className="text-orange-400 hover:text-orange-200 ml-1">✕</button>
                          </span>
                      ))}
                  </div>
                  <input type="text" value={likedInput} onChange={e => setLikedInput(e.target.value)} onKeyDown={e => handleAddItem(e, likedInput, setLikedInput, 'likedFlavors')} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="輸入口味..." />
                </div>

                {/* Disliked Flavors */}
                <div className="col-span-full">
                  <label className="block text-sm font-bold text-cyan-300 mb-1">討厭的口味 (輸入後按 Enter)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {formData.dislikedFlavors.map((flavor, index) => (
                          <span key={index} className="bg-cyan-900/40 text-cyan-200 px-2 py-1 rounded-md text-sm border border-cyan-700/50 flex items-center gap-1">
                              {flavor}
                              <button type="button" onClick={() => removeItem(index, 'dislikedFlavors')} className="text-cyan-400 hover:text-cyan-200 ml-1">✕</button>
                          </span>
                      ))}
                  </div>
                  <input type="text" value={dislikedInput} onChange={e => setDislikedInput(e.target.value)} onKeyDown={e => handleAddItem(e, dislikedInput, setDislikedInput, 'dislikedFlavors')} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="輸入口味..." />
                </div>

                {/* Drop Items */}
                <div className="col-span-full relative">
                  <label className="block text-sm font-bold text-green-300 mb-1">掉落道具清單 (搜尋道具並選擇)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                      {formData.dropItems.map((item, index) => (
                          <span key={index} className="bg-green-900/40 text-green-200 px-2 py-1 rounded-md text-sm border border-green-700/50 flex items-center gap-1">
                              {item.name} 
                              <input 
                                  type="text" 
                                  value={item.quantity} 
                                  onChange={e => {
                                      const newItems = [...formData.dropItems];
                                      newItems[index].quantity = e.target.value;
                                      setFormData({...formData, dropItems: newItems});
                                  }}
                                  className="w-12 ml-1 text-xs bg-green-950 border border-green-700 rounded px-1 py-0.5 text-center text-white focus:outline-none"
                                  placeholder="數量"
                              />
                              <button type="button" onClick={() => removeItem(index, 'dropItems')} className="text-green-400 hover:text-green-200 ml-1">✕</button>
                          </span>
                      ))}
                  </div>
                  <input 
                    type="text" 
                    value={dropItemInput} 
                    onChange={e => setDropItemInput(e.target.value)} 
                    onKeyDown={e => {
                        if (e.key === 'Enter' && filteredItems.length > 0) {
                            e.preventDefault();
                            setFormData({ ...formData, dropItems: [...formData.dropItems, { name: filteredItems[0].name, quantity: '1' }] });
                            setDropItemInput('');
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
                    placeholder="搜尋道具名稱..." 
                  />
                  {dropItemInput && filteredItems.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                          {filteredItems.map(item => (
                              <button 
                                key={item.id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center justify-between"
                                onClick={() => {
                                    setFormData({ ...formData, dropItems: [...formData.dropItems, { name: item.name, quantity: '1' }] });
                                    setDropItemInput('');
                                }}
                              >
                                  <span>{item.name}</span>
                                  <span className="text-slate-500 text-xs">{item.category}</span>
                              </button>
                          ))}
                      </div>
                  )}
                  {dropItemInput && filteredItems.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 text-sm text-slate-500 text-center">
                          找不到相符的道具
                      </div>
                  )}
                </div>
                
                {/* Order */}
                <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-300 mb-1">排序權重 (越少越前面)</label>
                    <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-slate-300 hover:bg-slate-700 transition">取消</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-900/50 transition">儲存夥伴</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EncounterFormModal;
