
import React, { useState, useEffect, useRef } from 'react';
import { Item, ItemCategory, ITEM_CATEGORY_ORDER, TACKLE_CATEGORY_ORDER, ItemType, ITEM_TYPE_ORDER, CraftingIngredient, LUNCHBOX_FLAVORS, LUNCHBOX_CATEGORIES } from '../types';

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
    // LunchBox defaults
    flavors: [],
    foodCategories: [],
    satiety: 0,
    // Tackle defaults
    tensileStrength: 0,
    durability: 0,
    luck: 0,
    extraEffect: '',
    // Bundle defaults
    bundleContentIds: [],
    bundleSubstituteIds: [],
    hasPerfectQuality: false,
    perfectQualityName: '',
    perfectQualityDescription: '',
    perfectQualityImageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [perfectQualityImagePreview, setPerfectQualityImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const perfectQualityFileInputRef = useRef<HTMLInputElement>(null);

  // Recipe State
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState(1);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState(''); // New search input
  
  // Bundle Selection State
  const [newBundleItemId, setNewBundleItemId] = useState('');
  const [newSubstituteItemId, setNewSubstituteItemId] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          type: initialData.type || ItemType.Material, // Backward compatibility
          // Ensure category is valid, if old data had 'Bundle' as type, move to category
          category: (initialData.type as any) === 'Bundle' ? ItemCategory.Bundle : initialData.category, 
          isRare: initialData.isRare || false,
          recipe: initialData.recipe || [],
          flavors: initialData.flavors || [],
          foodCategories: initialData.foodCategories || [],
          satiety: initialData.satiety || 0,
          tensileStrength: initialData.tensileStrength || 0,
          durability: initialData.durability || 0,
          luck: initialData.luck || 0,
          extraEffect: initialData.extraEffect || '',
          bundleContentIds: initialData.bundleContentIds || [],
          bundleSubstituteIds: initialData.bundleSubstituteIds || [],
          hasPerfectQuality: initialData.hasPerfectQuality || false,
          perfectQualityName: initialData.perfectQualityName || '',
          perfectQualityDescription: initialData.perfectQualityDescription || '',
          perfectQualityImageUrl: initialData.perfectQualityImageUrl || ''
      });
      setImagePreview(initialData.imageUrl || '');
      setPerfectQualityImagePreview(initialData.perfectQualityImageUrl || '');
    } else {
        // Generate a random ID for new items
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('請輸入名稱');
    
    // Cleanup: If type is NOT material and NOT tackle, set category to None
    const finalData = { ...formData };
    
    // Auto-correct type if category is Bundle
    if (finalData.category === ItemCategory.Bundle) {
        finalData.type = ItemType.Material;
    }

    if (finalData.type !== ItemType.Material && finalData.type !== ItemType.Tackle) {
        finalData.category = ItemCategory.None;
    }
    
    // Cleanup LunchBox fields
    if (finalData.type !== ItemType.LunchBox) {
        delete finalData.flavors;
        delete finalData.foodCategories;
        delete finalData.satiety;
    }

    // Cleanup Tackle fields
    if (finalData.type !== ItemType.Tackle) {
        delete finalData.tensileStrength;
        delete finalData.durability;
        delete finalData.luck;
        delete finalData.extraEffect;
    }

    // Cleanup Bundle fields
    if (finalData.category !== ItemCategory.Bundle) {
        delete finalData.bundleContentIds;
        delete finalData.bundleSubstituteIds;
    }

    // Cleanup Perfect Quality fields
    if (!finalData.hasPerfectQuality) {
        delete finalData.perfectQualityName;
        delete finalData.perfectQualityDescription;
        delete finalData.perfectQualityImageUrl;
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

  const handlePerfectQualityImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setPerfectQualityImagePreview(dataUrl);
          setFormData(prev => ({ ...prev, perfectQualityImageUrl: dataUrl }));
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
      setIngredientSearchQuery(''); // Reset search
  };

  const removeIngredient = (itemId: string) => {
      setFormData({ 
          ...formData, 
          recipe: (formData.recipe || []).filter(r => r.itemId !== itemId) 
      });
  };

  // Bundle List Handlers
  const addToBundleList = (targetList: 'bundleContentIds' | 'bundleSubstituteIds', itemId: string) => {
      if (!itemId) return;
      const currentList = formData[targetList] || [];
      if (!currentList.includes(itemId)) {
          setFormData({ ...formData, [targetList]: [...currentList, itemId] });
      }
      if (targetList === 'bundleContentIds') setNewBundleItemId('');
      if (targetList === 'bundleSubstituteIds') setNewSubstituteItemId('');
  };

  const removeFromBundleList = (targetList: 'bundleContentIds' | 'bundleSubstituteIds', itemId: string) => {
      const currentList = formData[targetList] || [];
      setFormData({ ...formData, [targetList]: currentList.filter(id => id !== itemId) });
  };


  // Helper for multi-select arrays
  const toggleArrayItem = (array: string[], item: string, key: keyof Item) => {
      const newArray = array.includes(item) 
          ? array.filter(i => i !== item)
          : [...array, item];
      setFormData({ ...formData, [key]: newArray });
  };

  // Render Item Select Options (Used for Bundles still)
  const renderItemOptions = () => {
      // 1. Separate Bundles
      const bundles = itemList.filter(i => i.category === ItemCategory.Bundle && i.id !== formData.id);

      // 2. Map standard types, excluding Bundles to avoid duplication
      const standardGroups = ITEM_TYPE_ORDER.map(type => {
            const itemsOfType = itemList.filter(i => 
                i.type === type && 
                i.id !== formData.id && 
                i.category !== ItemCategory.Bundle
            ); 
            if (itemsOfType.length === 0) return null;
            return (
                <optgroup key={type} label={type}>
                    {itemsOfType.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                </optgroup>
            )
    });

    return (
        <>
            {bundles.length > 0 && (
                <optgroup label="📦 集合 (Bundles)">
                    {bundles.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                </optgroup>
            )}
            {standardGroups}
        </>
    );
  };

  // Filter for Ingredient Search
  const ingredientSearchResults = ingredientSearchQuery 
    ? itemList.filter(i => 
        i.id !== formData.id && // exclude self
        i.name.toLowerCase().includes(ingredientSearchQuery.toLowerCase())
      )
    : [];

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
                    <span className="text-xs font-bold text-amber-400">✨ 設為稀有物品</span>
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
                        onClick={() => {
                            let defaultCategory = ItemCategory.None;
                            if (type === ItemType.Material) defaultCategory = ItemCategory.BallMaker;
                            if (type === ItemType.Tackle) defaultCategory = ItemCategory.Rod;
                            
                            setFormData({ ...formData, type: type, category: defaultCategory });
                        }}
                        className={`px-3 py-1.5 text-xs rounded border transition-all ${formData.type === type ? 'bg-indigo-600 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {type}
                    </button>
                ))}
             </div>
          </div>

          {/* Sub Category (For Material) */}
          {formData.type === ItemType.Material && (
            <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">素材分類</label>
                <div className="grid grid-cols-2 gap-2">
                    {/* Manually including Bundle here because it's removed from ITEM_CATEGORY_ORDER filter list */}
                    {[...ITEM_CATEGORY_ORDER, ItemCategory.Bundle].map(cat => (
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

          {/* Sub Category (For Tackle) */}
          {formData.type === ItemType.Tackle && (
            <div className="animate-fadeIn space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">釣具分類</label>
                    <div className="grid grid-cols-3 gap-2">
                        {TACKLE_CATEGORY_ORDER.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat })}
                                className={`py-2 text-xs rounded border transition-all ${formData.category === cat ? 'bg-cyan-600 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tackle Stats Input */}
                <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-700/50 space-y-3">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase">📊 釣具數值</h4>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">💪 拉扯力</label>
                            <input 
                                type="number"
                                value={formData.tensileStrength}
                                onChange={e => setFormData({ ...formData, tensileStrength: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">🛡️ 耐久度</label>
                            <input 
                                type="number"
                                value={formData.durability}
                                onChange={e => setFormData({ ...formData, durability: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">🍀 幸運值</label>
                            <input 
                                type="number"
                                value={formData.luck}
                                onChange={e => setFormData({ ...formData, luck: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-400 mb-1">⚡ 額外效果</label>
                        <input 
                            type="text"
                            value={formData.extraEffect}
                            onChange={e => setFormData({ ...formData, extraEffect: e.target.value })}
                            placeholder="例如: 海水魚咬鉤率提升 10%"
                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                </div>
            </div>
          )}
          
          {/* Bundle Specific Fields */}
          {formData.category === ItemCategory.Bundle && (
             <div className="space-y-4 animate-fadeIn">
                 {/* Bundle Contents */}
                 <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-700/50">
                    <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">📦 集合包含項目 (例如：所有樹果)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.bundleContentIds?.map(id => {
                             const item = itemList.find(i => i.id === id);
                             return (
                                 <div key={id} className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-600 rounded px-2 py-1 text-xs text-white">
                                     {item?.imageUrl && <img src={item.imageUrl} className="w-4 h-4 object-contain" />}
                                     <span>{item?.name || id}</span>
                                     <button type="button" onClick={() => removeFromBundleList('bundleContentIds', id)} className="text-red-300 hover:text-white ml-1">×</button>
                                 </div>
                             );
                        })}
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={newBundleItemId}
                            onChange={e => setNewBundleItemId(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        >
                            <option value="">選擇加入集合的道具...</option>
                            {renderItemOptions()}
                        </select>
                        <button type="button" onClick={() => addToBundleList('bundleContentIds', newBundleItemId)} className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs px-3 py-1 rounded">
                            +
                        </button>
                    </div>
                 </div>

                 {/* Bundle Substitutes */}
                 <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">🔄 可替換/補充項目</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.bundleSubstituteIds?.map(id => {
                             const item = itemList.find(i => i.id === id);
                             return (
                                 <div key={id} className="flex items-center gap-1 bg-slate-700 border border-slate-500 rounded px-2 py-1 text-xs text-white">
                                     {item?.imageUrl && <img src={item.imageUrl} className="w-4 h-4 object-contain" />}
                                     <span>{item?.name || id}</span>
                                     <button type="button" onClick={() => removeFromBundleList('bundleSubstituteIds', id)} className="text-red-300 hover:text-white ml-1">×</button>
                                 </div>
                             );
                        })}
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={newSubstituteItemId}
                            onChange={e => setNewSubstituteItemId(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        >
                            <option value="">選擇可替換的道具...</option>
                            {renderItemOptions()}
                        </select>
                        <button type="button" onClick={() => addToBundleList('bundleSubstituteIds', newSubstituteItemId)} className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-3 py-1 rounded">
                            +
                        </button>
                    </div>
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
                placeholder="例如: 鐵製釣鉤 或 樹果類"
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

            {/* Add New Ingredient - Improved Search Interface */}
            <div className="bg-slate-900 border border-slate-700 rounded p-2">
                <label className="block text-[10px] text-slate-500 mb-1">新增素材</label>
                <div className="flex gap-2 items-center mb-2">
                    <input 
                        type="text" 
                        value={ingredientSearchQuery}
                        onChange={e => setIngredientSearchQuery(e.target.value)}
                        placeholder="搜尋素材名稱..." 
                        className="flex-1 bg-black/30 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center bg-black/30 border border-slate-600 rounded px-1">
                        <span className="text-xs text-slate-400 px-1">x</span>
                        <input 
                            type="number" 
                            min="1"
                            value={newIngredientQty}
                            onChange={e => setNewIngredientQty(parseInt(e.target.value) || 1)}
                            className="w-10 bg-transparent py-1.5 text-xs text-white text-center focus:outline-none"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={addIngredient} 
                        disabled={!newIngredientId}
                        className={`text-xs px-3 py-1.5 rounded text-white font-bold transition-colors ${newIngredientId ? 'bg-green-700 hover:bg-green-600' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                    >
                        加入
                    </button>
                </div>

                {/* Selected Item Preview */}
                {newIngredientId && (
                    <div className="mb-2 px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-300">已選擇:</span>
                            {itemList.find(i => i.id === newIngredientId)?.imageUrl && (
                                <img src={itemList.find(i => i.id === newIngredientId)?.imageUrl} className="w-4 h-4 object-contain" />
                            )}
                            <span className="text-xs text-white font-bold">{itemList.find(i => i.id === newIngredientId)?.name}</span>
                        </div>
                        <button type="button" onClick={() => setNewIngredientId('')} className="text-xs text-slate-400 hover:text-white">更換</button>
                    </div>
                )}

                {/* Search Results List */}
                {ingredientSearchQuery && !newIngredientId && (
                    <div className="max-h-32 overflow-y-auto custom-scrollbar border border-slate-700 rounded bg-slate-900/80">
                        {ingredientSearchResults.length === 0 ? (
                            <div className="p-2 text-xs text-slate-500 text-center">無搜尋結果</div>
                        ) : (
                            ingredientSearchResults.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => { setNewIngredientId(item.id); setIngredientSearchQuery(''); }}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-700 cursor-pointer border-b border-slate-800/50 last:border-0"
                                >
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-5 h-5 object-contain" /> : <span className="w-5 h-5 flex items-center justify-center text-[10px]">📦</span>}
                                    <span className="text-xs text-slate-300">{item.name}</span>
                                    {item.type === ItemType.Tackle && <span className="ml-auto text-[9px] text-cyan-500 border border-cyan-900 px-1 rounded">釣具</span>}
                                    {item.category === ItemCategory.Bundle && <span className="ml-auto text-[9px] text-indigo-500 border border-indigo-900 px-1 rounded">集合</span>}
                                </div>
                            ))
                        )}
                    </div>
                )}
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

          {/* Perfect Quality Section */}
          <div className="bg-fuchsia-900/10 p-3 rounded-lg border border-fuchsia-800/30 animate-fadeIn">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input 
                      type="checkbox" 
                      checked={formData.hasPerfectQuality || false} 
                      onChange={e => setFormData({...formData, hasPerfectQuality: e.target.checked})} 
                      className="w-4 h-4 text-fuchsia-500 rounded focus:ring-fuchsia-500 border-slate-600 bg-slate-800"
                  />
                  <span className="text-xs font-bold text-fuchsia-400 uppercase">🌟 含有完美品質版本</span>
              </label>
              
              {formData.hasPerfectQuality && (
                  <div className="mt-3 animate-fadeIn space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-fuchsia-300 mb-1">完美品質圖示 (Perfect Quality Image)</label>
                          <div className="flex items-center gap-4">
                              <div 
                                  className="w-16 h-16 bg-slate-900 border border-fuchsia-700/50 rounded flex items-center justify-center cursor-pointer overflow-hidden hover:border-fuchsia-400 transition-colors"
                                  onClick={() => perfectQualityFileInputRef.current?.click()}
                              >
                                  {perfectQualityImagePreview ? (
                                      <img src={perfectQualityImagePreview} alt="Perfect Quality Preview" className="w-full h-full object-contain" />
                                  ) : (
                                      <span className="text-slate-500 text-xs text-center">點擊<br/>上傳</span>
                                  )}
                              </div>
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  ref={perfectQualityFileInputRef}
                                  onChange={handlePerfectQualityImageUpload}
                              />
                              <div className="text-xs text-slate-400">
                                  <p>建議尺寸: 128x128</p>
                                  <p>支援格式: PNG, JPG</p>
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-fuchsia-300 mb-1">完美品質名稱 (Perfect Quality Name)</label>
                          <input 
                              type="text" 
                              value={formData.perfectQualityName || ''} 
                              onChange={e => setFormData({...formData, perfectQualityName: e.target.value})} 
                              className="w-full bg-slate-900 border border-fuchsia-700/50 rounded px-3 py-2 text-white focus:border-fuchsia-500 outline-none" 
                              placeholder="完美品質版本的名稱..."
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-fuchsia-300 mb-1">完美品質說明 (Perfect Quality Description)</label>
                          <textarea 
                              value={formData.perfectQualityDescription || ''} 
                              onChange={e => setFormData({...formData, perfectQualityDescription: e.target.value})} 
                              className="w-full bg-slate-900 border border-fuchsia-700/50 rounded px-3 py-2 text-white focus:border-fuchsia-500 outline-none resize-none h-20" 
                              placeholder="完美品質版本的特殊功能或描述..."
                          />
                      </div>
                  </div>
              )}
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
