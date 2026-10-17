
import React, { useState, useEffect } from 'react';
import { SystemGuide, GuideCategory, GUIDE_CATEGORIES, GUIDE_CATEGORY_LABELS } from '../types';

interface SystemGuideFormModalProps {
  initialData?: SystemGuide | null;
  currentCategory: GuideCategory;
  onSave: (guide: SystemGuide) => void;
  onClose: () => void;
}

const SystemGuideFormModal: React.FC<SystemGuideFormModalProps> = ({ initialData, currentCategory, onSave, onClose }) => {
  const [formData, setFormData] = useState<SystemGuide>({
    id: '',
    category: currentCategory,
    title: '',
    tags: [],
    summary: '',
    content: '',
    images: [],
    updatedAt: Date.now()
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        images: initialData.images || []
      });
    } else {
      setFormData(prev => ({ ...prev, id: Date.now().toString(), category: currentCategory, images: [] }));
    }
  }, [initialData, currentCategory]);

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
        const MAX_WIDTH = 960;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), { url: dataUrl, caption: '' }]
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdateImageCaption = (index: number, caption: string) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      if (newImages[index]) {
        newImages[index] = { ...newImages[index], caption };
      }
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('請輸入標題');
    onSave({ ...formData, updatedAt: Date.now() });
  };

  const addTag = () => {
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
          setTagInput('');
      }
  };

  const removeTag = (tag: string) => {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <div className="flex items-center gap-2">
              <span className="text-xl">📓</span>
              <h2 className="text-xl font-bold text-white">{initialData ? '編輯筆記' : '新增筆記'} - {GUIDE_CATEGORY_LABELS[formData.category]}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            {/* Header: Title & Tags */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">標題</label>
                    <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-white font-bold text-lg focus:border-indigo-500 outline-none"
                        placeholder="輸入說明標題..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">標籤 (Tags)</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-800 rounded border border-slate-700 min-h-[40px]">
                        {formData.tags.map(tag => (
                            <span key={tag} className="text-xs bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded border border-indigo-700 flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                            </span>
                        ))}
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="bg-transparent text-xs text-white outline-none flex-1 min-w-[100px]"
                            placeholder="輸入標籤按 Enter..."
                        />
                    </div>
                </div>
            </div>

            {/* Category Switcher (Optional move) */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">所屬分類</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {GUIDE_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFormData({...formData, category: cat})}
                            className={`px-3 py-1 text-xs rounded border transition-all whitespace-nowrap ${formData.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'}`}
                        >
                            {GUIDE_CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">概述 (Summary)</label>
                <textarea 
                    value={formData.summary} 
                    onChange={e => setFormData({...formData, summary: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm h-20 resize-none placeholder-slate-500"
                    placeholder="簡短描述這篇說明的重點..."
                />
            </div>

            {/* Uploaded Images & Captions */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase">
                            說明圖片與圖說
                        </label>
                        <p className="text-[11px] text-slate-400">可上傳相關說明圖片，並針對每張圖片填寫說明文字</p>
                    </div>
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition">
                        <span>📷 上傳圖片</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload} 
                        />
                    </label>
                </div>

                {formData.images && formData.images.length > 0 ? (
                    <div className="space-y-3 pt-2">
                        {formData.images.map((imgItem, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-900/90 rounded-lg border border-slate-700 items-start">
                                <div className="w-full sm:w-36 h-28 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                                    <img src={imgItem.url} alt={`附圖 ${index + 1}`} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 w-full flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400">
                                        圖片說明 #{index + 1}
                                    </label>
                                    <textarea
                                        value={imgItem.caption}
                                        onChange={(e) => handleUpdateImageCaption(index, e.target.value)}
                                        placeholder="輸入此圖片的詳細說明文字..."
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none resize-none placeholder-slate-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="text-slate-500 hover:text-red-400 p-1 self-end sm:self-center transition text-sm"
                                    title="刪除此圖片"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs">
                        尚未上傳任何圖片。點擊上方「📷 上傳圖片」按鈕新增
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">主要內容 (Main Content)</label>
                <textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    className="w-full flex-1 bg-black/30 border border-slate-600 rounded-lg p-4 text-slate-200 focus:border-indigo-500 outline-none text-sm font-mono leading-relaxed resize-y placeholder-slate-600 shadow-inner"
                    placeholder="在此輸入詳細內容..."
                />
            </div>

        </form>

        <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm text-slate-500 hover:text-white font-medium transition">取消</button>
          <button type="button" onClick={handleSubmit} className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-xl hover:bg-indigo-500 transition">儲存筆記</button>
        </div>
      </div>
    </div>
  );
};

export default SystemGuideFormModal;
