
import React, { useState, useEffect, useRef } from 'react';
import { MainSkill, SkillPartner, SkillType } from '../types';

interface MainSkillFormModalProps {
  initialData?: MainSkill | null;
  onSave: (skill: MainSkill) => void;
  onClose: () => void;
}

const MainSkillFormModal: React.FC<MainSkillFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<MainSkill>({
    id: '',
    name: '',
    description: '',
    type: '常駐型',
    isSpecial: false,
    levelEffects: ['', '', '', '', '', ''], // Lv1 to Lv6
    partners: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
          ...initialData,
          levelEffects: initialData.levelEffects || ['', '', '', '', '', ''],
          partners: initialData.partners || []
      });
    } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('請輸入技能名稱');
    onSave(formData);
  };

  const handlePartnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 64; 
                
                // Point-to-point scaling logic (retain pixel art)
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
                    const imageUrl = canvas.toDataURL('image/png');
                    
                    const newPartner: SkillPartner = { imageUrl, note: '' };
                    setFormData(prev => ({ ...prev, partners: [...prev.partners, newPartner] }));
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateLevelEffect = (index: number, text: string) => {
      const newEffects = [...formData.levelEffects];
      newEffects[index] = text;
      setFormData({ ...formData, levelEffects: newEffects });
  };

  const removePartner = (index: number) => {
      const newPartners = [...formData.partners];
      newPartners.splice(index, 1);
      setFormData({ ...formData, partners: newPartners });
  };

  const updatePartnerNote = (index: number, note: string) => {
      const newPartners = [...formData.partners];
      newPartners[index] = { ...newPartners[index], note };
      setFormData({ ...formData, partners: newPartners });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯主技能' : '新增主技能'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
            
            {/* Top Section: Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
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
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isSpecial} 
                                    onChange={e => setFormData({...formData, isSpecial: e.target.checked})} 
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                                />
                                <span className={`text-sm font-bold ${formData.isSpecial ? 'text-amber-400' : 'text-slate-400'}`}>特殊技能</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">技能敘述</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none h-24 resize-none" 
                            placeholder="描述技能的基本效果..."
                        />
                    </div>
                </div>

                {/* Level Effects */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-3">等級效果差異 (Lv1 - Lv6)</label>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {formData.levelEffects.map((effect, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500 w-8">Lv.{idx + 1}</span>
                                <input 
                                    type="text" 
                                    value={effect} 
                                    onChange={e => updateLevelEffect(idx, e.target.value)} 
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none" 
                                    placeholder={`Lv.${idx+1} 效果數值...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-700"></div>

            {/* Partners Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-sm font-bold text-slate-300">擁有此技能的夥伴</h3>
                        <p className="text-xs text-slate-500">上傳夥伴圖片，可多選上傳。點擊圖片可刪除。</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1"
                    >
                        <span>＋</span> 上傳圖片
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePartnerImageUpload} accept="image/*" multiple className="hidden" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700 min-h-[100px]">
                    {formData.partners.map((partner, idx) => (
                        <div key={idx} className="relative group bg-slate-900 border border-slate-600 rounded-lg flex flex-col items-center p-2 gap-2 hover:border-blue-400 transition-colors">
                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                <img src={partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                            </div>
                            <input 
                                type="text" 
                                value={partner.note || ''} 
                                onChange={(e) => updatePartnerNote(idx, e.target.value)}
                                placeholder="備註..." 
                                className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-white text-center focus:border-blue-500 outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={() => removePartner(idx)} 
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                            >×</button>
                        </div>
                    ))}
                    {formData.partners.length === 0 && (
                        <div className="col-span-full text-center text-slate-600 text-xs py-8">尚無夥伴資料</div>
                    )}
                </div>
            </div>

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
