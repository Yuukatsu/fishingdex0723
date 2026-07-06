import React, { useState, useRef } from 'react';
import { BattleFormSkill, BattleFormType, BattleTraitType } from '../types';

interface BattleFormSkillFormModalProps {
  initialData?: BattleFormSkill | null;
  defaultTraitType?: BattleTraitType;
  onClose: () => void;
  onSave: (skill: BattleFormSkill) => void;
}

const BattleFormSkillFormModal: React.FC<BattleFormSkillFormModalProps> = ({ initialData, defaultTraitType, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<BattleFormSkill, 'id'>>({
      name: initialData?.name || '',
      cardNumber: initialData?.cardNumber,
      formType: initialData?.formType || 'mega',
      description: initialData?.description || '',
      levelEffects: initialData?.levelEffects || ['', '', '', '', '', ''],
      partner: initialData?.partner || { imageUrl: '', note: '' },
      traitType: initialData?.traitType || defaultTraitType || '額外特性',
      hasAdaptedVersion: initialData?.hasAdaptedVersion || false,
      adaptedDescription: initialData?.adaptedDescription || '',
      adaptedAttributeImageUrl: initialData?.adaptedAttributeImageUrl || '',
      adaptedAttributeName: initialData?.adaptedAttributeName || '',
  });

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const megaFileInputRef = useRef<HTMLInputElement>(null);
  const primalFileInputRef = useRef<HTMLInputElement>(null);
  const adaptedAttributeFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'normal' | 'mega' | 'primal' | 'adaptedAttribute') => {
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
          
          if (type === 'adaptedAttribute') {
              setFormData(prev => ({ ...prev, adaptedAttributeImageUrl: dataUrl }));
          } else {
              let fieldName = 'imageUrl';
              if (type === 'mega') fieldName = 'megaImageUrl';
              if (type === 'primal') fieldName = 'primalImageUrl';

              setFormData(prev => ({ 
                  ...prev, 
                  partner: { 
                      ...prev.partner, 
                      [fieldName]: dataUrl 
                  } 
              }));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return alert("請輸入技能名稱");

      setSaving(true);
      try {
          const id = initialData?.id || '';
          onSave({
              ...formData,
              id
          });
      } catch (error: any) {
          console.error("Error saving battle form skill:", error);
          alert(`儲存失敗: ${error.message}`);
      } finally {
          setSaving(false);
      }
  };

  const isMega = formData.formType === 'mega';
  
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-fuchsia-600/50 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-fuchsia-800/50 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-fuchsia-100">{initialData ? '編輯戰鬥特性' : '新增戰鬥特性'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            <div className="flex gap-6 flex-col sm:flex-row">
                <div className="flex flex-wrap gap-4 flex-shrink-0 justify-center sm:justify-start max-w-[300px]">
                    {/* Normal Form Image */}
                    <div className="flex flex-col gap-2 items-center">
                        <label className="block text-xs font-bold text-slate-400 uppercase">一般型態</label>
                        <div 
                            className="w-20 h-20 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-slate-500 overflow-hidden relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {formData.partner?.imageUrl ? (
                                <img src={formData.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                            ) : (
                                <span className="text-xl">👤</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'normal')} accept="image/*" className="hidden" />
                        
                        <input 
                            type="text" 
                            value={formData.partner?.note || ''} 
                            onChange={e => setFormData({...formData, partner: { ...formData.partner, note: e.target.value }})}
                            placeholder="夥伴名稱..."
                            className="w-20 bg-slate-800 border border-slate-600 rounded px-1 py-1 text-[10px] text-white text-center font-bold"
                        />
                    </div>

                    {/* Transform Image */}
                    {formData.traitType === '額外特性' && (
                        isMega ? (
                            <div className="flex flex-col gap-2 items-center">
                                <label className="block text-xs font-bold text-fuchsia-400 uppercase">Mega型態</label>
                                <div 
                                    className="w-20 h-20 bg-slate-800 border-2 border-dashed border-fuchsia-900/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-fuchsia-500 overflow-hidden relative group"
                                    onClick={() => megaFileInputRef.current?.click()}
                                >
                                    {formData.partner?.megaImageUrl ? (
                                        <img src={formData.partner.megaImageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                    ) : (
                                        <span className="text-xl opacity-50">🧬</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                                </div>
                                <input type="file" ref={megaFileInputRef} onChange={(e) => handleImageUpload(e, 'mega')} accept="image/*" className="hidden" />
                                {formData.partner?.megaImageUrl && (
                                    <button type="button" onClick={() => setFormData({...formData, partner: {...formData.partner, megaImageUrl: ''}})} className="text-[10px] text-red-400 hover:underline">
                                        移除
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 items-center">
                                <label className="block text-xs font-bold text-red-400 uppercase">原始回歸</label>
                                <div 
                                    className="w-20 h-20 bg-slate-800 border-2 border-dashed border-red-900/50 rounded-xl flex items-center justify-center cursor-pointer hover:border-red-500 overflow-hidden relative group"
                                    onClick={() => primalFileInputRef.current?.click()}
                                >
                                    {formData.partner?.primalImageUrl ? (
                                        <img src={formData.partner.primalImageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                    ) : (
                                        <span className="text-xl opacity-50">🌋</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                                </div>
                                <input type="file" ref={primalFileInputRef} onChange={(e) => handleImageUpload(e, 'primal')} accept="image/*" className="hidden" />
                                {formData.partner?.primalImageUrl && (
                                    <button type="button" onClick={() => setFormData({...formData, partner: {...formData.partner, primalImageUrl: ''}})} className="text-[10px] text-red-400 hover:underline">
                                        移除
                                    </button>
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">圖鑑編號</label>
                            <input 
                                type="number" 
                                value={formData.cardNumber || ''} 
                                onChange={e => setFormData({...formData, cardNumber: e.target.value ? Number(e.target.value) : undefined})} 
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none" 
                                placeholder="例如: 1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">特性名稱</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none" 
                                placeholder="例如: 破壞死光"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">特性分類</label>
                            <select
                                value={formData.traitType}
                                onChange={e => setFormData({...formData, traitType: e.target.value as BattleTraitType})}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none"
                            >
                                <option value="常駐特性">常駐特性</option>
                                <option value="額外特性">額外特性</option>
                            </select>
                        </div>
                        {formData.traitType === '額外特性' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">型態選擇</label>
                                <select
                                    value={formData.formType}
                                    onChange={e => setFormData({...formData, formType: e.target.value as BattleFormType})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none"
                                >
                                    <option value="mega">Mega狀態</option>
                                    <option value="primal">原始回歸</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        技能敘述
                    </label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 min-h-[80px] text-white focus:border-fuchsia-500 outline-none text-sm leading-relaxed"
                        placeholder="輸入技能描述..."
                    />
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.hasAdaptedVersion}
                            onChange={(e) => setFormData({...formData, hasAdaptedVersion: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-600 text-fuchsia-500 bg-slate-800 focus:ring-fuchsia-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm font-bold text-slate-300">有適應的版本</span>
                    </label>
                    
                    {formData.hasAdaptedVersion && (
                        <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 items-center flex-shrink-0">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">適應屬性圖</label>
                                    <div 
                                        className="w-16 h-16 bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-500 overflow-hidden relative group"
                                        onClick={() => adaptedAttributeFileInputRef.current?.click()}
                                    >
                                        {formData.adaptedAttributeImageUrl ? (
                                            <img src={formData.adaptedAttributeImageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                        ) : (
                                            <span className="text-xl">✨</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                                    </div>
                                    <input type="file" ref={adaptedAttributeFileInputRef} onChange={(e) => handleImageUpload(e, 'adaptedAttribute')} accept="image/*" className="hidden" />
                                    
                                    <input 
                                        type="text" 
                                        value={formData.adaptedAttributeName || ''} 
                                        onChange={e => setFormData({...formData, adaptedAttributeName: e.target.value})}
                                        placeholder="屬性名稱..."
                                        className="w-20 bg-slate-800 border border-slate-600 rounded px-1 py-1 text-[10px] text-white text-center font-bold"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                        適應版本敘述
                                    </label>
                                    <textarea 
                                        value={formData.adaptedDescription} 
                                        onChange={e => setFormData({...formData, adaptedDescription: e.target.value})} 
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 min-h-[80px] text-white focus:border-fuchsia-500 outline-none text-sm leading-relaxed"
                                        placeholder="輸入適應版本的技能描述..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>

        <div className="p-4 border-t border-fuchsia-800/50 flex justify-end gap-3 bg-slate-950 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition">取消</button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold rounded shadow-lg transition-all disabled:opacity-50">
            {saving ? '儲存中...' : '儲存技能'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleFormSkillFormModal;
