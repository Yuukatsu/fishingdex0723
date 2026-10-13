import React, { useState, useEffect, useRef } from 'react';
import { SpecialPartner, PartnerRank, PARTNER_RANKS, PARTNER_RANK_COLORS, ITEM_ATTRIBUTE_COLORS } from '../types';

const POKEMON_18_ATTRIBUTES = [
  "一般", "格鬥", "飛行", "毒", "地面", "岩石", "蟲", "幽靈", "鋼",
  "火", "水", "草", "電", "超能力", "冰", "龍", "惡", "妖精"
];

interface SpecialPartnerFormModalProps {
  initialData?: SpecialPartner | null;
  onSave: (partner: SpecialPartner) => void;
  onClose: () => void;
  defaultPokedexNumber?: number;
}

const SpecialPartnerFormModal: React.FC<SpecialPartnerFormModalProps> = ({
  initialData,
  onSave,
  onClose,
  defaultPokedexNumber = 1
}) => {
  const [formData, setFormData] = useState<Partial<SpecialPartner>>({
    name: '',
    pokedexNumber: defaultPokedexNumber,
    imageUrl: '',
    attribute: '一般',
    attributes: ['一般'],
    rank: 'C',
    possibleBattleSkills: [],
    possibleSubSkills: [],
    possibleMainSkills: [],
    acquisitionSource: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [newBattleSkill, setNewBattleSkill] = useState('');
  const [newSubSkill, setNewSubSkill] = useState('');
  const [newMainSkill, setNewMainSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      const initialAttrs = (initialData.attributes && initialData.attributes.length > 0)
        ? (initialData.attributes as string[])
        : (initialData.attribute ? [initialData.attribute as string] : ['一般']);

      setFormData({
        ...initialData,
        pokedexNumber: initialData.pokedexNumber ?? defaultPokedexNumber,
        possibleBattleSkills: initialData.possibleBattleSkills || [],
        possibleSubSkills: initialData.possibleSubSkills || [],
        possibleMainSkills: initialData.possibleMainSkills || [],
        attribute: initialAttrs[0] || '一般',
        attributes: initialAttrs,
        rank: initialData.rank || 'C',
        acquisitionSource: initialData.acquisitionSource || ''
      });
      setImagePreview(initialData.imageUrl || '');
    } else {
      setFormData(prev => ({
        ...prev,
        pokedexNumber: defaultPokedexNumber,
        attribute: '一般',
        attributes: ['一般']
      }));
    }
  }, [initialData, defaultPokedexNumber]);

  // Handle Image Upload & Resize to 64x64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // Pixel art preserve
          ctx.drawImage(img, 0, 0, 64, 64);
          const dataUrl = canvas.toDataURL('image/png');
          setImagePreview(dataUrl);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBattleSkill = () => {
    if (!newBattleSkill.trim()) return;
    setFormData(prev => ({
      ...prev,
      possibleBattleSkills: [...(prev.possibleBattleSkills || []), newBattleSkill.trim()]
    }));
    setNewBattleSkill('');
  };

  const handleRemoveBattleSkill = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      possibleBattleSkills: (prev.possibleBattleSkills || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddSubSkill = () => {
    if (!newSubSkill.trim()) return;
    setFormData(prev => ({
      ...prev,
      possibleSubSkills: [...(prev.possibleSubSkills || []), newSubSkill.trim()]
    }));
    setNewSubSkill('');
  };

  const handleRemoveSubSkill = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      possibleSubSkills: (prev.possibleSubSkills || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddMainSkill = () => {
    if (!newMainSkill.trim()) return;
    setFormData(prev => ({
      ...prev,
      possibleMainSkills: [...(prev.possibleMainSkills || []), newMainSkill.trim()]
    }));
    setNewMainSkill('');
  };

  const handleRemoveMainSkill = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      possibleMainSkills: (prev.possibleMainSkills || []).filter((_, i) => i !== idx)
    }));
  };

  const selectedAttributes: string[] = (formData.attributes && formData.attributes.length > 0)
    ? (formData.attributes as string[])
    : (formData.attribute ? [formData.attribute as string] : ['一般']);

  const handleToggleAttribute = (attr: string) => {
    let next: string[];
    if (selectedAttributes.includes(attr)) {
      next = selectedAttributes.filter(a => a !== attr);
      if (next.length === 0) next = [attr]; // 至少保留一個屬性
    } else {
      next = [...selectedAttributes, attr];
    }
    setFormData(prev => ({
      ...prev,
      attributes: next,
      attribute: next[0] || '一般'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("請輸入夥伴名稱");
      return;
    }

    const finalAttrs = (formData.attributes && formData.attributes.length > 0)
      ? (formData.attributes as string[])
      : (formData.attribute ? [formData.attribute as string] : ['一般']);

    const partnerToSave: SpecialPartner = {
      id: initialData?.id || '',
      name: formData.name.trim(),
      pokedexNumber: Number(formData.pokedexNumber) || 1,
      imageUrl: formData.imageUrl || '',
      attribute: finalAttrs[0] || '一般',
      attributes: finalAttrs,
      rank: formData.rank || 'C',
      possibleBattleSkills: formData.possibleBattleSkills || [],
      possibleSubSkills: formData.possibleSubSkills || [],
      possibleMainSkills: formData.possibleMainSkills || [],
      acquisitionSource: formData.acquisitionSource?.trim() || '',
      order: Number(formData.pokedexNumber) || 1
    };

    onSave(partnerToSave);
  };

  const currentRankColor = PARTNER_RANK_COLORS[formData.rank || 'C'] || PARTNER_RANK_COLORS['C'];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h3 className="text-lg font-bold text-white">
              {initialData ? '編輯特殊夥伴' : '新增特殊夥伴'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-lg">✕</button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Image & Basic Info Row */}
          <div className="flex gap-4 items-start">
            {/* 64x64 Clickable Image Box */}
            <div className="flex flex-col items-center">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                圖示 (64x64)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 bg-slate-950 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition relative group shadow-inner"
                title="點擊上傳圖片 (自動縮放為 64x64)"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-16 h-16 object-contain [image-rendering:pixelated]" 
                  />
                ) : (
                  <div className="text-center p-1 text-slate-500 group-hover:text-purple-300 transition">
                    <span className="text-2xl block">🖼️</span>
                    <span className="text-[9px] block">點擊上傳</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] text-white font-bold">
                  更換
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Name, Number & Rank */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    編號 #
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.pokedexNumber || ''} 
                    onChange={e => setFormData({ ...formData, pokedexNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white text-sm focus:border-purple-500 outline-none font-mono"
                    placeholder="例如: 1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    夥伴名稱
                  </label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:border-purple-500 outline-none"
                    placeholder="例如: 皮卡丘"
                    required
                  />
                </div>
              </div>

              {/* Image URL fallback */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-0.5">
                  或輸入圖片網址 (URL)
                </label>
                <input 
                  type="text" 
                  value={formData.imageUrl || ''} 
                  onChange={e => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:border-purple-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Rank Selection (F ~ S) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Rank 等級 (F ~ S)
              </label>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${currentRankColor.bg} ${currentRankColor.text} ${currentRankColor.border}`}>
                目前 Rank: {formData.rank}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {PARTNER_RANKS.map(rk => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => setFormData({ ...formData, rank: rk })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    formData.rank === rk
                      ? `${PARTNER_RANK_COLORS[rk].bg} ${PARTNER_RANK_COLORS[rk].text} ${PARTNER_RANK_COLORS[rk].border} ring-2 ring-purple-400/50 scale-105`
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {rk}
                </button>
              ))}
            </div>
          </div>

          {/* Attribute Selection (18 Attributes, Multi-Select) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase">
                屬性 (可選擇多個屬性，點擊切換)
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                {selectedAttributes.map(attr => {
                  const color = ITEM_ATTRIBUTE_COLORS[attr] || ITEM_ATTRIBUTE_COLORS['一般'];
                  return (
                    <span key={attr} className={`px-2 py-0.5 text-xs font-bold rounded border ${color.bg} ${color.text} ${color.border}`}>
                      {attr}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
              {POKEMON_18_ATTRIBUTES.map(attr => {
                const color = ITEM_ATTRIBUTE_COLORS[attr] || ITEM_ATTRIBUTE_COLORS['一般'];
                const isSelected = selectedAttributes.includes(attr);
                return (
                  <button
                    key={attr}
                    type="button"
                    onClick={() => handleToggleAttribute(attr)}
                    className={`py-1 px-1.5 text-xs font-bold rounded border transition-all text-center truncate ${
                      isSelected
                        ? `${color.bg} ${color.text} ${color.border} ring-2 ring-white/60 scale-105 shadow-md`
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                    title={isSelected ? `${attr} (已選取，點擊取消)` : `${attr} (點擊選取)`}
                  >
                    {isSelected ? `✓ ${attr}` : attr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Possible Battle Skills (文字輸入，可追加多項) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-rose-300 uppercase">
              ⚔️ 可能戰鬥特性 (可追加多項)
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleBattleSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增戰鬥特性</span>
              )}
              {formData.possibleBattleSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-rose-950/60 text-rose-200 border border-rose-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveBattleSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newBattleSkill}
                onChange={e => setNewBattleSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBattleSkill(); } }}
                placeholder="輸入戰鬥特性名稱..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:border-rose-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddBattleSkill}
                className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-bold transition shadow"
              >
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Possible Sub Skills (文字輸入，可追加多項) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-emerald-300 uppercase">
              🌱 可能副技能 (可追加多項)
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleSubSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增副技能</span>
              )}
              {formData.possibleSubSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newSubSkill}
                onChange={e => setNewSubSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubSkill(); } }}
                placeholder="輸入副技能名稱..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:border-emerald-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubSkill}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition shadow"
              >
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Possible Main Skills (文字輸入，可追加多項) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-blue-300 uppercase">
              ⚡ 可能主技能 (可追加多項)
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleMainSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增主技能</span>
              )}
              {formData.possibleMainSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-blue-950/60 text-blue-200 border border-blue-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveMainSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newMainSkill}
                onChange={e => setNewMainSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMainSkill(); } }}
                placeholder="輸入主技能名稱..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:border-blue-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMainSkill}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-bold transition shadow"
              >
                ＋ 新增
              </button>
            </div>
          </div>

          {/* Acquisition Source (獲得途徑，文字輸入) */}
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
              📍 獲得途徑 (文字輸入)
            </label>
            <textarea 
              rows={2}
              value={formData.acquisitionSource || ''}
              onChange={e => setFormData({ ...formData, acquisitionSource: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-400 outline-none"
              placeholder="例如: 於「迷霧森林」冒險低機率遭遇、特定活動兌換..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow-lg"
            >
              {initialData ? '儲存變更' : '新增夥伴'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialPartnerFormModal;
