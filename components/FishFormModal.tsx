import React, { useState, useEffect, useRef } from 'react';
import { Fish, Rarity, RARITY_ORDER } from '../types';
import { PRESET_TAGS, PRESET_CONDITIONS } from '../constants';

interface FishFormModalProps {
  initialData?: Fish | null;
  existingIds: string[];
  onSave: (fish: Fish) => void;
  onClose: () => void;
}

const FishFormModal: React.FC<FishFormModalProps> = ({ initialData, existingIds, onSave, onClose }) => {
  const [formData, setFormData] = useState<Fish>({
    id: '',
    name: '',
    description: '',
    rarity: Rarity.OneStar,
    location: '',
    conditions: [],
    battleRequirements: '',
    specialNote: '',
    tags: [],
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = '請輸入編號';
    // Check duplication only if ID changed from initial, or if it's new
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
        
        const MAX_SIZE = 64; // Pixel art size limit
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
          ctx.imageSmoothingEnabled = false; // Pixel art scaling
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL('image/png');
          setFormData({ ...formData, imageUrl: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Helper component for Tag Selection
  const TagSelector = ({ 
    title, 
    items, 
    setItems, 
    presets 
  }: { 
    title: string, 
    items: string[], 
    setItems: (val: string[]) => void, 
    presets: string[] 
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
        <label className="block text-sm font-medium text-slate-300">{title}</label>
        
        {/* Selected Chips */}
        <div className="flex flex-wrap gap-2 mb-2">
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
          {items.length === 0 && <span className="text-xs text-slate-500 py-0.5">尚未選擇</span>}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-2">
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
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder={`新增自訂${title}...`}
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
            {/* ID - Now Editable */}
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
                <p className="text-yellow-500 text-xs mt-1">注意：修改編號將會移除舊資料並建立新資料。</p>
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">出沒地點</label>
            <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="例如: 新手村池塘"
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

          {/* Tags Selector */}
          <TagSelector 
            title="標籤 (Tags)" 
            items={formData.tags} 
            setItems={(tags) => setFormData({ ...formData, tags })} 
            presets={PRESET_TAGS} 
          />

          {/* Conditions Selector (New Sighting Info) */}
          <TagSelector 
            title="目擊情報 (環境條件)" 
            items={formData.conditions} 
            setItems={(conditions) => setFormData({ ...formData, conditions })} 
            presets={PRESET_CONDITIONS} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Battle Requirements - Optional */}
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

             {/* Special Note - New Field */}
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

          {/* Image Upload / URL */}
          <div className="space-y-3 pt-2 border-t border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300">魚種圖片</label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview */}
              <div className="relative w-32 h-24 bg-slate-900 border border-slate-600 rounded-lg overflow-hidden flex-shrink-0 group">
                {formData.imageUrl ? (
                   <>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain [image-rendering:pixelated]" 
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, imageUrl: ''})}
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
                     onClick={triggerFileUpload}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition shadow-md"
                   >
                     上傳圖片 (本機)
                   </button>
                 </div>
                 
                 <div className="relative">
                   <input
                    type="text"
                    value={formData.imageUrl && formData.imageUrl.startsWith('data:') ? '(已使用上傳圖片)' : formData.imageUrl || ''}
                    onChange={e => {
                       if (!formData.imageUrl?.startsWith('data:')) {
                         setFormData({ ...formData, imageUrl: e.target.value })
                       } else {
                         setFormData({ ...formData, imageUrl: e.target.value })
                       }
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    placeholder="或貼上圖片連結 URL..."
                  />
                 </div>
                 <p className="text-xs text-slate-500">
                   提示: 圖片將縮放至 64x64 (像素風格)，並保存為 PNG 格式以支援透明度。
                 </p>
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
