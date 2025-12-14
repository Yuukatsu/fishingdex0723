
import React, { useState, useEffect, useRef } from 'react';
import { Item, ItemCategory, ITEM_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, CraftingIngredient, LUNCHBOX_FLAVORS, LUNCHBOX_CATEGORIES } from '../types';

interface ItemFormModalProps {
  initialData?: Item | null;
  onSave: (item: Item) => void;
  onClose: () => void;
  itemList?: Item[]; // List of available items to choose as ingredients
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ initialData, onSave, onClose, itemList = [] }) => {
  const [formData, setFormData] = useState<Item>({
    id: '',
    name: '',
    description: '',
    source: '',
    type: ItemType.Material, // Default to Material
    category: ItemCategory.BallMaker, // Default
    imageUrl: '',
    isRare: false,
    recipe: [],
    flavors: [],
    foodCategories: [],
    satiety: 0
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recipe State
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState(1);

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          type: initialData.type || ItemType.Material, // Backward compatibility
          isRare: initialData.isRare || false,
          recipe: initialData.recipe || [],
          flavors: initialData.flavors || [],
          foodCategories: initialData.foodCategories || [],
          satiety: initialData.satiety || 0
      });
      setImagePreview(initialData.imageUrl || '');
    } else {
        // Generate a random ID for new items
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('請輸入名稱');
    
    // Cleanup: If type is NOT material, set category to None or a default
    const finalData = { ...formData };
    if (finalData.type !== ItemType.Material) {
        finalData.category = ItemCategory.None;
    }
    
    // Cleanup LunchBox fields if not LunchBox
    if (finalData.type !== ItemType.LunchBox) {
        delete finalData.flavors;
        delete finalData.foodCategories;
        delete finalData.satiety;
    }

    onSave(finalData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 128; 
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
          const dataUrl = canvas.toDataURL('image/png');
          setImagePreview(dataUrl);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Recipe Handlers
  const addIngredient = () => {
      if (!newIngredientId) return;
      if (newIngredientQty <= 0) return alert("數量必須大於 0");
      
      const updatedRecipe = [...(formData.recipe || [])];
      // Check if item already exists in recipe
      const existingIndex = updatedRecipe.findIndex(r => r.itemId === newIngredientId);
      
      if (existingIndex >= 0) {
          updatedRecipe[existingIndex].quantity += newIngredientQty;
      } else {
          updatedRecipe.push({ itemId: newIngredientId, quantity: newIngredientQty });
      }

      setFormData({ ...formData, recipe: updatedRecipe });
      setNewIngredientId('');
      setNewIngredientQty(1);
  };

  const removeIngredient = (itemId: string) => {
      setFormData({ 
          ...formData, 
          recipe: (formData.recipe || []).filter(r => r.itemId !== itemId) 
      });
  };

  // Helper for multi-select arrays
  const toggleArrayItem = (array: string[], item: string, key: keyof Item) => {
      const newArray = array.includes(item) 
          ? array.filter(i => i !== item)
          : [...array, item];
      setFormData({ ...formData, [key]: newArray });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-md w-full shadow-2xl my-8">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯道具' : '新增道具'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Image Upload Section */}
          <div className="flex items-center gap-4">
             <div 
                className="w-20 h-20 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                onClick={() => fileInputRef.current?.click()}
             >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain [image-rendering:pixelated]" />
                ) : (
                    <span className="text-2xl">📷</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">更換</div>
             </div>
             <div className="flex-1 space-y-2">
                 <p className="text-xs text-slate-400">建議尺寸: 30x30 像素 (Pixel Art)</p>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded border border-slate-600">
                    選擇圖片
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                 
                 {/* Rare Checkbox */}
                 <label className="flex items-center gap-2 cursor-pointer mt-2 bg-amber-900/20 p-1.5 rounded border border-amber-900/50 hover:bg-amber-900/30 transition">
                    <input 
                        type="checkbox" 
                        checked={formData.isRare || false} 
                        onChange={e => setFormData({...formData, isRare: e.target.checked})} 
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-slate-600 bg-slate-800"
                    />
                    <span className="text-xs font-bold text-amber-400">✨ 設為稀有素材</span>
                 </label>
             </div>
          </div>

          {/* Type Selector (Main Category) */}
          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">道具類型 (Type)</label>
             <div className="flex flex-wrap gap-2">
                {ITEM_TYPE_ORDER.map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type })}
                        className={`px-3 py-1.5 text-xs rounded border transition-all ${formData.type === type ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {type}
                    </button>
                ))}
             </div>
          </div>

          {/* Sub Category (Only for Material) */}
          {formData.type === ItemType.Material && (
            <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">素材分類</label>
                <div className="grid grid-cols-2 gap-2">
                    {ITEM_CATEGORY_ORDER.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={`py-2 text-xs rounded border transition-all ${formData.category === cat ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
          )}

          {/* LunchBox Specific Fields */}
          {formData.type === ItemType.LunchBox && (
              <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-700/50 space-y-4 animate-fadeIn">
                  {/* Satiety */}
                  <div>
                      <label className="block text-xs font-bold text-orange-300 uppercase mb-1">飽腹感</label>
                      <input 
                        type="number"
                        value={formData.satiety}
                        onChange={e => setFormData({ ...formData, satiety: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      />
                  </div>

                  {/* Food Categories */}
                  <div>
                      <label className="block text-xs font-bold text-orange-300 uppercase mb-1">分類 (可複選)</label>
                      <div className="flex flex-wrap gap-2">
                          {LUNCHBOX_CATEGORIES.map(cat => (
                              <button
                                  key={cat}
                                  type="button"
                                  onClick={() => toggleArrayItem(formData.foodCategories || [], cat, 'foodCategories')}
                                  className={`px-2 py-1 text-xs rounded border transition-all ${
                                      formData.foodCategories?.includes(cat)
                                          ? 'bg-orange-600 border-orange-500 text-white'
                                          : 'bg-slate-800 border-slate-600 text-slate-400'
                                  }`}
                              >
                                  {cat}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Flavors */}
                  <div>
                      <label className="block text-xs font-bold text-orange-300 uppercase mb-1">口味 (可複選)</label>
                      <div className="flex flex-wrap gap-2">
                          {LUNCHBOX_FLAVORS.map(flavor => (
                              <button
                                  key={flavor}
                                  type="button"
                                  onClick={() => toggleArrayItem(formData.flavors || [], flavor, 'flavors')}
                                  className={`px-2 py-1 text-xs rounded border transition-all ${
                                      formData.flavors?.includes(flavor)
                                          ? 'bg-pink-600 border-pink-500 text-white'
                                          : 'bg-slate-800 border-slate-600 text-slate-400'
                                  }`}
                              >
                                  {flavor}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">道具名稱</label>
            <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                placeholder="例如: 鐵製釣鉤"
            />
          </div>

          {/* Crafting Recipe Section (For ALL Types now) */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 animate-fadeIn">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">🛠️ 合成公式 (Recipe)</label>
            
            {/* List Existing Ingredients */}
            <div className="space-y-2 mb-3">
                {(!formData.recipe || formData.recipe.length === 0) && (
                    <p className="text-xs text-slate-500 italic">尚無合成公式</p>
                )}
                {formData.recipe?.map((ingredient, idx) => {
                    const itemDetail = itemList.find(i => i.id === ingredient.itemId);
                    return (
                        <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded px-2 py-1">
                            <div className="flex items-center gap-2">
                                {itemDetail?.imageUrl ? (
                                    <img src={itemDetail.imageUrl} className="w-5 h-5 object-contain" />
                                ) : (
                                    <span className="text-xs">📦</span>
                                )}
                                <span className="text-xs text-slate-200">{itemDetail?.name || ingredient.itemId}</span>
                                <span className="text-xs text-yellow-400 font-bold">x{ingredient.quantity}</span>
                            </div>
                            <button type="button" onClick={() => removeIngredient(ingredient.itemId)} className="text-red-400 hover:text-red-300 text-xs px-2">移除</button>
                        </div>
                    );
                })}
            </div>

            {/* Add New Ingredient */}
            <div className="flex gap-2 items-center">
                <select 
                    value={newIngredientId}
                    onChange={e => setNewIngredientId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                    <option value="">選擇素材...</option>
                    {/* Group items by type for better organization */}
                    {ITEM_TYPE_ORDER.map(type => {
                            const itemsOfType = itemList.filter(i => i.type === type);
                            if (itemsOfType.length === 0) return null;
                            return (
                                <optgroup key={type} label={type}>
                                    {itemsOfType.map(i => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))}
                                </optgroup>
                            )
                    })}
                </select>
                <input 
                    type="number" 
                    min="1"
                    value={newIngredientQty}
                    onChange={e => setNewIngredientQty(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                />
                <button type="button" onClick={addIngredient} className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">
                    +
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">獲取方式 (Source)</label>
            <input 
                type="text" 
                value={formData.source} 
                onChange={e => setFormData({...formData, source: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                placeholder="例如: 商店購買、深海釣魚"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">說明 (Description)</label>
            <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none resize-none h-20" 
                placeholder="道具的功能或描述..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm text-slate-300 hover:text-white transition">取消</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
