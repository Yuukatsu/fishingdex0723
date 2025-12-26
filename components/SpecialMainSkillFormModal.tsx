
import React, { useState, useEffect, useRef } from 'react';
import { SpecialMainSkill, SkillType } from '../types';

interface SpecialMainSkillFormModalProps {
  initialData?: SpecialMainSkill | null;
  onSave: (skill: SpecialMainSkill) => void;
  onClose: () => void;
}

const SpecialMainSkillFormModal: React.FC<SpecialMainSkillFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<SpecialMainSkill>({
    id: '',
    name: '',
    description: '',
    type: '常駐型',
    levelEffects: ['', '', '', '', '', ''],
    partner: { imageUrl: '', note: '' }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('請輸入技能名稱');
    if (!formData.partner.imageUrl) return alert('請上傳夥伴圖片');
    onSave(formData);
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
          setFormData(prev => ({ ...prev, partner: { ...prev.partner, imageUrl: dataUrl } }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateLevelEffect = (index: number, text: string) => {
      const newEffects = [...formData.levelEffects];
      newEffects[index] = text;
      setFormData({ ...formData, levelEffects: newEffects });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-amber-600/50 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-amber-800/50 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-amber-100">{initialData ? '編輯特殊技能' : '新增特殊技能'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            <div className="flex gap-6 flex-col sm:flex-row">
                {/* Partner Image */}
                <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto items-center sm:items-start">
                    <label className="block text-xs font-bold text-slate-400 uppercase">夥伴外觀</label>
                    <div 
                        className="w-32 h-32 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-500 overflow-hidden relative group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.partner.imageUrl ? (
                            <img src={formData.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                        ) : (
                            <span className="text-3xl">👤</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">上傳</div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <input 
                        type="text" 
                        value={formData.partner.note || ''} 
                        onChange={e => setFormData({...formData, partner: { ...formData.partner, note: e.target.value }})}
                        placeholder="夥伴備註..."
                        className="w-32 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
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

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">技能敘述</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-amber-500 outline-none h-24 resize-none" 
                            placeholder="描述技能效果..."
                        />
                    </div>
                </div>
            </div>

            {/* Level Effects */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">等級效果差異 (Lv1 - Lv6)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.levelEffects.map((effect, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500 w-8">Lv.{idx + 1}</span>
                            <input 
                                type="text" 
                                value={effect} 
                                onChange={e => updateLevelEffect(idx, e.target.value)} 
                                className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-amber-500 outline-none" 
                                placeholder={`Lv.${idx+1} 效果數值...`}
                            />
                        </div>
                    ))}
                </div>
            </div>

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
