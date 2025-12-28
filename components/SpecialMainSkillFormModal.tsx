
import React, { useState, useEffect, useRef } from 'react';
import { SpecialMainSkill, SkillType, SkillCategory, SKILL_CATEGORIES, MainSkillCategoryData } from '../types';

interface SpecialMainSkillFormModalProps {
  initialData?: SpecialMainSkill | null;
  onSave: (skill: SpecialMainSkill) => void;
  onClose: () => void;
}

const SpecialMainSkillFormModal: React.FC<SpecialMainSkillFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<SpecialMainSkill>({
    id: '',
    name: '',
    type: '常駐型',
    categories: [],
    categoryData: {},
    // Legacy fields initialization
    description: '',
    levelEffects: ['', '', '', '', '', ''],
    partner: { imageUrl: '', megaImageUrl: '', note: '' }
  });

  const [activeTab, setActiveTab] = useState<SkillCategory | '其他'>('其他');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const megaFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      let cats = initialData.categories || [];
      
      // === 自我修復機制 (Self-Healing) ===
      if (cats.length === 0 && initialData.categoryData) {
          const detectedCategories = Object.keys(initialData.categoryData).filter(key => 
              SKILL_CATEGORIES.includes(key as SkillCategory)
          ) as SkillCategory[];
          
          if (detectedCategories.length > 0) {
              cats = detectedCategories;
          }
      }
      // ================================

      setFormData({
          ...initialData,
          categories: cats,
          categoryData: initialData.categoryData || {},
          levelEffects: initialData.levelEffects || ['', '', '', '', '', ''],
          partner: {
              ...initialData.partner,
              megaImageUrl: initialData.partner.megaImageUrl || ''
          }
      });
      if (cats.length > 0) {
          setActiveTab(cats[0]);
      }
    } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('請輸入技能名稱');
    if (!formData.partner.imageUrl) return alert('請上傳夥伴圖片');
    if (formData.categories.length === 0) return alert('請至少選擇一個類別');
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMega: boolean = false) => {
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
          setFormData(prev => ({ 
              ...prev, 
              partner: { 
                  ...prev.partner, 
                  [isMega ? 'megaImageUrl' : 'imageUrl']: dataUrl 
              } 
          }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCategory = (cat: SkillCategory) => {
      const currentCats = formData.categories || [];
      let newCats;
      
      if (currentCats.includes(cat)) {
          newCats = currentCats.filter(c => c !== cat);
          if (activeTab === cat) {
              setActiveTab(newCats.length > 0 ? newCats[0] : '其他');
          }
      } else {
          newCats = [...currentCats, cat];
          if (!formData.categoryData?.[cat]) {
              setFormData(prev => ({
                  ...prev,
                  categories: newCats,
                  categoryData: {
                      ...prev.categoryData,
                      [cat]: { description: '', levelEffects: ['', '', '', '', '', ''], isMega: false }
                  }
              }));
              setActiveTab(cat); 
              return;
          }
      }
      setFormData(prev => ({ ...prev, categories: newCats }));
  };

  const updateCategoryData = (field: keyof MainSkillCategoryData, value: any, index?: number) => {
      if (activeTab === '其他') {
          // Fallback legacy support
          if (field === 'description') setFormData({ ...formData, description: value });
          if (field === 'levelEffects' && typeof index === 'number') {
              let currentArr = formData.levelEffects || ['', '', '', '', '', ''];
              const newEffects = [...currentArr];
              newEffects[index] = value;
              setFormData({ ...formData, levelEffects: newEffects });
          }
          return;
      }

      const cat = activeTab as SkillCategory;
      const currentData = formData.categoryData?.[cat] || { description: '', levelEffects: ['', '', '', '', '', ''], isMega: false };
      
      let updatedData: MainSkillCategoryData = { ...currentData };

      if (field === 'levelEffects') {
          let currentArr = currentData.levelEffects || ['', '', '', '', '', ''];
          const newEffects = [...currentArr];
          if (typeof index === 'number') newEffects[index] = value;
          updatedData.levelEffects = newEffects;
      } else {
          (updatedData as any)[field] = value;
      }

      setFormData(prev => ({
          ...prev,
          categoryData: {
              ...prev.categoryData,
              [cat]: updatedData
          }
      }));
  };

  const getCurrentValues = () => {
      if (activeTab === '其他') {
          return {
              description: formData.description || '',
              levelEffects: formData.levelEffects || ['', '', '', '', '', ''],
              isMega: false
          };
      }
      const data = formData.categoryData?.[activeTab as SkillCategory];
      return {
          description: data?.description || '',
          levelEffects: data?.levelEffects || ['', '', '', '', '', ''],
          isMega: data?.isMega || false
      };
  };

  const { description, levelEffects, isMega } = getCurrentValues();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-amber-600/50 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-amber-800/50 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-amber-100">{initialData ? '編輯特殊技能' : '新增特殊技能'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            <div className="flex gap-6 flex-col sm:flex-row">
                {/* Images Container */}
                <div className="flex gap-4 flex-shrink-0 justify-center sm:justify-start">
                    {/* Partner Image */}
                    <div className="flex flex-col gap-2 items-center">
                        <label className="block text-xs font-bold text-slate-400 uppercase">夥伴外觀 (一般)</label>
                        <div 
                            className="w-24 h-24 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-500 overflow-hidden relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {formData.partner.imageUrl ? (
                                <img src={formData.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                            ) : (
                                <span className="text-2xl">👤</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, false)} accept="image/*" className="hidden" />
                        
                        {/* Name Input underneath Base Image */}
                        <input 
                            type="text" 
                            value={formData.partner.note || ''} 
                            onChange={e => setFormData({...formData, partner: { ...formData.partner, note: e.target.value }})}
                            placeholder="夥伴名稱..."
                            className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center font-bold"
                        />
                    </div>

                    {/* Mega Image */}
                    <div className="flex flex-col gap-2 items-center">
                        <label className="block text-xs font-bold text-fuchsia-400 uppercase flex items-center gap-1">
                            Mega 型態 <span className="text-[10px] text-slate-500">(選填)</span>
                        </label>
                        <div 
                            className="w-24 h-24 bg-slate-800 border-2 border-dashed border-fuchsia-900/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-fuchsia-500 overflow-hidden relative group"
                            onClick={() => megaFileInputRef.current?.click()}
                        >
                            {formData.partner.megaImageUrl ? (
                                <img src={formData.partner.megaImageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                            ) : (
                                <span className="text-2xl opacity-50">🧬</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                        </div>
                        <input type="file" ref={megaFileInputRef} onChange={(e) => handleImageUpload(e, true)} accept="image/*" className="hidden" />
                        {formData.partner.megaImageUrl && (
                            <button type="button" onClick={() => setFormData({...formData, partner: {...formData.partner, megaImageUrl: ''}})} className="text-[10px] text-red-400 hover:underline">
                                移除 Mega 圖
                            </button>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">技能名稱</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none" 
                                placeholder="例如: 破壞死光"
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
                                            ? 'bg-amber-600 border-amber-500 text-white font-bold shadow' 
                                            : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-400'
                                    }`}
                                >
                                    {cat} {formData.categories.includes(cat) && '✓'}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                        ? 'bg-slate-800 text-amber-300 border-b-2 border-b-amber-500' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                                }`}
                            >
                                {cat} 效果設定
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-4 bg-slate-900/50 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-slate-400 uppercase">
                                [{activeTab}] 技能敘述
                            </label>
                            
                            {/* Mega Toggle */}
                            {activeTab !== '其他' && (
                                <label className={`flex items-center gap-2 cursor-pointer border px-2 py-1 rounded transition-all ${isMega ? 'bg-fuchsia-900/30 border-fuchsia-500' : 'border-slate-600 bg-slate-800'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={isMega} 
                                        onChange={e => updateCategoryData('isMega', e.target.checked)}
                                        className="w-3 h-3 text-fuchsia-500 focus:ring-0 rounded bg-slate-700 border-slate-500"
                                    />
                                    <span className={`text-xs font-bold ${isMega ? 'text-fuchsia-300' : 'text-slate-400'}`}>
                                        啟用 Mega 型態
                                    </span>
                                </label>
                            )}
                        </div>
                        
                        <textarea 
                            value={description} 
                            onChange={e => updateCategoryData('description', e.target.value)} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none h-20 resize-none text-sm" 
                            placeholder={`描述在「${activeTab}」時的技能效果...`}
                        />

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
                                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-amber-500 outline-none" 
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
            <button type="button" onClick={handleSubmit} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg shadow-lg">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default SpecialMainSkillFormModal;
