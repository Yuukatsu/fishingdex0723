import React, { useState, useEffect, useRef } from 'react';
import { Fish, Rarity, RARITY_ORDER, FishVariants } from '../types';
import { PRESET_TAGS, PRESET_CONDITIONS } from '../constants';

interface FishFormModalProps {
  initialData?: Fish | null;
  existingIds: string[];
  onSave: (fish: Fish) => void;
  onClose: () => void;
}

type VariantKey = keyof FishVariants;

const FishFormModal: React.FC<FishFormModalProps> = ({ initialData, existingIds, onSave, onClose }) => {
  const [formData, setFormData] = useState<Fish>({
    id: '',
    name: '',
    description: '',
    rarity: Rarity.OneStar,
    depth: '',
    conditions: [],
    battleRequirements: '',
    specialNote: '',
    tags: [],
    variants: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeVariantTab, setActiveVariantTab] = useState<VariantKey>('normalMale');
  
  // Tag Management State
  const [savedCustomTags, setSavedCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      // Migrate old data if necessary
      const variants = initialData.variants || {};
      if (!variants.normalMale && initialData.imageUrl) {
          variants.normalMale = initialData.imageUrl;
      }
      const depth = initialData.depth || initialData.location || '';

      setFormData({
          ...initialData,
          depth,
          variants
      });
    }

    // Load saved tags from localStorage
    const loadedTags = localStorage.getItem('fish_wiki_custom_tags');
    if (loadedTags) {
        try {
            setSavedCustomTags(JSON.parse(loadedTags));
        } catch (e) {
            console.error("Failed to parse saved tags", e);
        }
    }
  }, [initialData]);

  const saveCustomTagsToStorage = (tags: string[]) => {
      setSavedCustomTags(tags);
      localStorage.setItem('fish_wiki_custom_tags', JSON.stringify(tags));
  };

  const handleAddCustomTagToLibrary = () => {
      const tag = newTagInput.trim();
      if (!tag) return;
      if (!savedCustomTags.includes(tag) && !PRESET_TAGS.includes(tag)) {
          const newTags = [...savedCustomTags, tag];
          saveCustomTagsToStorage(newTags);
      }
      setNewTagInput('');
  };

  const handleRemoveCustomTagFromLibrary = (tagToRemove: string) => {
      if (window.confirm(`確定要從常用清單中移除標籤 "${tagToRemove}" 嗎?`)) {
          const newTags = savedCustomTags.filter(t => t !== tagToRemove);
          saveCustomTagsToStorage(newTags);
      }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = '請輸入編號';
    const isIdChanged = initialData && initialData.id !== formData.id;
    const isNew = !initialData;
    if ((isNew || isIdChanged) && existingIds.includes(formData.id)) {
      newErrors.id = '此編號已存在';
    }
    if (!formData.name.trim()) newErrors.name = '請輸入名稱';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 64; 
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; 
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL('image/png');
          setFormData(prev => ({
              ...prev,
              variants: {
                  ...prev.variants,
                  [activeVariantTab]: dataUrl
              }
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const currentImageUrl = formData.variants[activeVariantTab];

  // Tag Selector Component
  const TagSelector = ({ 
    title, 
    items, 
    setItems, 
    presets,
    savedCustoms = [],
    canManage = false
  }: { 
    title: string, 
    items: string[], 
    setItems: (val: string[]) => void, 
    presets: string[],
    savedCustoms?: string[],
    canManage?: boolean
  }) => {
    const [customInput, setCustomInput] = useState('');

    const toggleItem = (item: string) => {
      if (items.includes(item)) {
        setItems(items.filter(i => i !== item));
      } else {
        setItems([...items, item]);
      }
    };

    const addCustom = () => {
      const trimmed = customInput.trim();
      if (trimmed && !items.includes(trimmed)) {
        setItems([...items, trimmed]);
        setCustomInput('');
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-slate-300">{title}</label>
             {canManage && (
                 <div className="text-xs text-slate-500">
                     管理常用標籤 ↓
                 </div>
             )}
        </div>
        
        {/* Selected Chips */}
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700/50 min-h-[36px]">
          {items.map(item => (
            <span key={item} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-700">
              {item}
              <button 
                type="button"
                onClick={() => toggleItem(item)}
                className="ml-1.5 text-blue-400 hover:text-blue-100 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
          {items.length === 0 && <span className="text-xs text-slate-500 py-0.5 px-1">尚未選擇</span>}
        </div>

        {/* Presets & Saved */}
        <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-y-auto">
          {/* Default Presets */}
          {presets.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => toggleItem(preset)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                items.includes(preset)
                  ? 'bg-slate-700 border-slate-500 text-white opacity-50 cursor-default'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white'
              }`}
            >
              {preset}
            </button>
          ))}
          {/* Saved Custom Tags */}
          {savedCustoms.map(saved => (
             <div key={saved} className="relative group">
                <button
                type="button"
                onClick={() => toggleItem(saved)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                    items.includes(saved)
                    ? 'bg-slate-700 border-slate-500 text-white opacity-50 cursor-default'
                    : 'bg-indigo-900/30 border-indigo-700 text-indigo-300 hover:border-indigo-500 hover:text-white'
                }`}
                >
                {saved}
                </button>
                {canManage && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveCustomTagFromLibrary(saved); }}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="從常用庫移除"
                    >
                        ×
                    </button>
                )}
             </div>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder={`臨時新增${title}...`}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg border border-slate-600"
          >
            加入
          </button>
        </div>

        {/* Tag Management UI (Only for TagSelector with canManage=true) */}
        {canManage && (
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex gap-2 items-center">
                <span className="text-xs text-slate-500">新增至常用庫:</span>
                <input 
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="輸入標籤名稱..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
                <button
                    type="button"
                    onClick={handleAddCustomTagToLibrary}
                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-500"
                >
                    儲存
                </button>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl my-8">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? '編輯魚種資料' : '手動新增魚種'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">編號 (ID)</label>
              <input
                type="text"
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                className={`w-full bg-slate-900 border ${errors.id ? 'border-red-500' : 'border-slate-600'} rounded-lg p-2 text-white focus:outline-none focus:border-blue-500`}
                placeholder="例如: 001"
              />
              {errors.id && <p className="text-red-400 text-xs mt-1">{errors.id}</p>}
              {initialData && initialData.id !== formData.id && (
                <p className="text-yellow-500 text-xs mt-1">注意：修改編號將會移除舊資料。</p>
              )}
            </div>

            {/* Rarity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">稀有度</label>
              <select
                value={formData.rarity}
                onChange={e => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                {RARITY_ORDER.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">名稱</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg p-2 text-white focus:outline-none focus:border-blue-500`}
              placeholder="例如: 大眼草魚"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Depth (replaced Location) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">水深範圍</label>
            <input
                type="text"
                value={formData.depth}
                onChange={e => setFormData({ ...formData, depth: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="例如: 水深 5m - 10m"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">外觀/描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
              placeholder="描述魚的樣子..."
            />
          </div>

          {/* Tags Selector with Custom Manager */}
          <TagSelector 
            title="標籤 (Tags)" 
            items={formData.tags} 
            setItems={(tags) => setFormData({ ...formData, tags })} 
            presets={PRESET_TAGS}
            savedCustoms={savedCustomTags}
            canManage={true}
          />

          {/* Conditions Selector */}
          <TagSelector 
            title="目擊情報 (環境條件)" 
            items={formData.conditions} 
            setItems={(conditions) => setFormData({ ...formData, conditions })} 
            presets={PRESET_CONDITIONS} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">比拚需求 (選填)</label>
                <input
                type="text"
                value={formData.battleRequirements || ''}
                onChange={e => setFormData({ ...formData, battleRequirements: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="例如: 點擊頻率高"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">特殊要求 (選填)</label>
                <input
                type="text"
                value={formData.specialNote || ''}
                onChange={e => setFormData({ ...formData, specialNote: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="例如: 需要特定魚餌"
                />
             </div>
          </div>

          {/* Image Upload - Tabbed for Variants */}
          <div className="space-y-3 pt-2 border-t border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300">魚種圖片 (四種變體)</label>
            
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
                <button type="button" onClick={() => setActiveVariantTab('normalMale')} className={`flex-1 py-1.5 text-xs rounded transition ${activeVariantTab === 'normalMale' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>一般♂</button>
                <button type="button" onClick={() => setActiveVariantTab('normalFemale')} className={`flex-1 py-1.5 text-xs rounded transition ${activeVariantTab === 'normalFemale' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>一般♀</button>
                <button type="button" onClick={() => setActiveVariantTab('shinyMale')} className={`flex-1 py-1.5 text-xs rounded transition ${activeVariantTab === 'shinyMale' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>異色♂</button>
                <button type="button" onClick={() => setActiveVariantTab('shinyFemale')} className={`flex-1 py-1.5 text-xs rounded transition ${activeVariantTab === 'shinyFemale' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>異色♀</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              {/* Preview */}
              <div className="relative w-32 h-24 bg-slate-900 border border-slate-600 rounded-lg overflow-hidden flex-shrink-0 group">
                {currentImageUrl ? (
                   <>
                    <img 
                      src={currentImageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain [image-rendering:pixelated]" 
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                          ...prev,
                          variants: { ...prev.variants, [activeVariantTab]: '' }
                      }))}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
                    >
                      移除圖片
                    </button>
                   </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <span className="text-2xl">📷</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 w-full space-y-3">
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload} 
                   accept="image/png, image/jpeg, image/gif" 
                   className="hidden" 
                 />
                 
                 <div className="flex gap-2">
                   <button
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition"
                   >
                     上傳圖片 (本機)
                   </button>
                 </div>
                 
                 <div className="relative">
                   <input
                    type="text"
                    value={currentImageUrl && currentImageUrl.startsWith('data:') ? '(已使用上傳圖片)' : currentImageUrl || ''}
                    onChange={e => {
                       const val = e.target.value;
                       if (!currentImageUrl?.startsWith('data:')) {
                           setFormData(prev => ({
                               ...prev,
                               variants: { ...prev.variants, [activeVariantTab]: val }
                           }));
                       }
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    placeholder={`貼上 ${activeVariantTab} 的圖片連結...`}
                  />
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition shadow-lg shadow-green-900/20"
            >
              儲存變更
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FishFormModal;