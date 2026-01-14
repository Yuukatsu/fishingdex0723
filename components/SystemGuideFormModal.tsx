
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
    updatedAt: Date.now()
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({ ...prev, id: Date.now().toString(), category: currentCategory }));
    }
  }, [initialData, currentCategory]);

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
