
import React, { useState, useEffect } from 'react';
import { MainSkill, SkillType, SkillCategory, SKILL_CATEGORIES, MainSkillCategoryData } from '../types';

interface MainSkillFormModalProps {
  initialData?: MainSkill | null;
  onSave: (skill: MainSkill) => void;
  onClose: () => void;
}

const MainSkillFormModal: React.FC<MainSkillFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<MainSkill>({
    id: '',
    name: '',
    type: '常駐型',
    categories: [],
    categoryData: {},
    // Legacy fields initialization
    description: '',
    levelEffects: ['', '', '', '', '', ''] 
  });

  const [activeTab, setActiveTab] = useState<SkillCategory | '其他'>('其他');

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          categories: initialData.categories || [],
          categoryData: initialData.categoryData || {},
      });
      // Set active tab to first category if available
      if (initialData.categories && initialData.categories.length > 0) {
          setActiveTab(initialData.categories[0]);
      }
    } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('請輸入技能名稱');
    if (formData.categories.length === 0) return alert('請至少選擇一個類別');
    onSave(formData);
  };

  const toggleCategory = (cat: SkillCategory) => {
      const currentCats = formData.categories || [];
      let newCats;
      
      if (currentCats.includes(cat)) {
          newCats = currentCats.filter(c => c !== cat);
          // If active tab is removed, switch to another available or default
          if (activeTab === cat) {
              setActiveTab(newCats.length > 0 ? newCats[0] : '其他');
          }
      } else {
          newCats = [...currentCats, cat];
          // Initialize data for new category if empty
          if (!formData.categoryData?.[cat]) {
              setFormData(prev => ({
                  ...prev,
                  categories: newCats,
                  categoryData: {
                      ...prev.categoryData,
                      [cat]: { description: '', levelEffects: ['', '', '', '', '', ''] }
                  }
              }));
              setActiveTab(cat); // Switch to newly added
              return;
          }
      }
      setFormData(prev => ({ ...prev, categories: newCats }));
  };

  // Helper to update nested data
  const updateCategoryData = (field: 'description' | 'levelEffects', value: any, index?: number) => {
      if (activeTab === '其他') {
          // Fallback to legacy root fields
          if (field === 'description') setFormData({ ...formData, description: value });
          
          if (field === 'levelEffects' && typeof index === 'number') {
              // Fix: Ensure array is size 6 before updating, preventing length-1 arrays causing display reset
              let currentArr = formData.levelEffects || [];
              if (!Array.isArray(currentArr) || currentArr.length !== 6) {
                  currentArr = ['', '', '', '', '', ''];
              }
              
              const newEffects = [...currentArr];
              newEffects[index] = value;
              setFormData({ ...formData, levelEffects: newEffects });
          }
          return;
      }

      const cat = activeTab as SkillCategory;
      const currentData = formData.categoryData?.[cat] || { description: '', levelEffects: ['', '', '', '', '', ''] };
      
      let updatedData: MainSkillCategoryData;

      if (field === 'description') {
          updatedData = { ...currentData, description: value };
      } else {
          // levelEffects
          let currentArr = currentData.levelEffects || [];
          if (!Array.isArray(currentArr) || currentArr.length !== 6) {
              currentArr = ['', '', '', '', '', ''];
          }

          const newEffects = [...currentArr];
          if (typeof index === 'number') newEffects[index] = value;
          updatedData = { ...currentData, levelEffects: newEffects };
      }

      setFormData(prev => ({
          ...prev,
          categoryData: {
              ...prev.categoryData,
              [cat]: updatedData
          }
      }));
  };

  // Get current values for inputs based on active tab
  const getCurrentValues = () => {
      let desc = '';
      let effects: string[] = [];

      if (activeTab === '其他') {
          desc = formData.description || '';
          effects = formData.levelEffects || [];
      } else {
          const data = formData.categoryData?.[activeTab as SkillCategory];
          desc = data?.description || '';
          effects = data?.levelEffects || [];
      }

      // Safety check: Ensure effects array has 6 elements to render inputs correctly
      if (!Array.isArray(effects) || effects.length !== 6) {
          effects = ['', '', '', '', '', ''];
      }

      return {
          description: desc,
          levelEffects: effects
      };
  };

  const { description, levelEffects } = getCurrentValues();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯主技能' : '新增主技能'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">技能名稱</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none" 
                        placeholder="例如: 全力一擊"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">類型</label>
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-600">
                        {(['常駐型', '機率型'] as SkillType[]).map(type => (
                            <button 
                                key={type}
                                type="button"
                                onClick={() => setFormData({...formData, type})}
                                className={`flex-1 py-1 text-xs rounded transition ${formData.type === type ? (type === '常駐型' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white') : 'text-slate-400'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Selector */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">技能適用類別 (可複選)</label>
                <div className="flex flex-wrap gap-2">
                    {SKILL_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 text-xs rounded border transition-all ${
                                formData.categories.includes(cat) 
                                    ? 'bg-purple-600 border-purple-500 text-white font-bold shadow' 
                                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-400'
                            }`}
                        >
                            {cat} {formData.categories.includes(cat) && '✓'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dynamic Content Area based on Category */}
            {formData.categories.length > 0 ? (
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex bg-slate-950 border-b border-slate-700">
                        {formData.categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 text-xs font-bold transition-all border-r border-slate-800 ${
                                    activeTab === cat 
                                        ? 'bg-slate-800 text-purple-300 border-b-2 border-b-purple-500' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                                }`}
                            >
                                {cat} 效果設定
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-4 bg-slate-900/50 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                [{activeTab}] 技能敘述
                            </label>
                            <textarea 
                                value={description} 
                                onChange={e => updateCategoryData('description', e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none h-20 resize-none text-sm" 
                                placeholder={`描述在「${activeTab}」時的技能效果...`}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                                [{activeTab}] 等級效果差異 (Lv1 - Lv6)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {levelEffects.map((effect, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-500 w-8">Lv.{idx + 1}</span>
                                        <input 
                                            type="text" 
                                            value={effect} 
                                            onChange={e => updateCategoryData('levelEffects', e.target.value, idx)} 
                                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500 outline-none" 
                                            placeholder={`數值...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                    請先選擇上方至少一個類別以設定效果
                </div>
            )}

        </form>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-700 bg-slate-950 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition">取消</button>
            <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default MainSkillFormModal;
