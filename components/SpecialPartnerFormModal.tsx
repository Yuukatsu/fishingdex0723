import React, { useState, useEffect, useRef } from 'react';
import { 
  SpecialPartner, 
  PartnerRank, 
  PARTNER_RANKS, 
  PARTNER_RANK_COLORS, 
  ITEM_ATTRIBUTE_COLORS,
  BattleFormSkill,
  MainSkill,
  SpecialMainSkill,
  SubSkill
} from '../types';

const POKEMON_18_ATTRIBUTES = [
  "一般", "格鬥", "飛行", "毒", "地面", "岩石", "蟲", "幽靈", "鋼",
  "火", "水", "草", "電", "超能力", "冰", "龍", "惡", "妖精"
];

interface SpecialPartnerFormModalProps {
  initialData?: SpecialPartner | null;
  onSave: (partner: SpecialPartner) => void;
  onClose: () => void;
  defaultPokedexNumber?: number;
  battleFormSkills?: BattleFormSkill[];
  mainSkillList?: MainSkill[];
  specialMainSkillList?: SpecialMainSkill[];
  subSkillList?: SubSkill[];
  onSkillClick?: (name: string, category: 'battle' | 'sub' | 'main') => void;
}

const SpecialPartnerFormModal: React.FC<SpecialPartnerFormModalProps> = ({
  initialData,
  onSave,
  onClose,
  defaultPokedexNumber = 1,
  battleFormSkills = [],
  mainSkillList = [],
  specialMainSkillList = [],
  subSkillList = [],
  onSkillClick
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

  // Skill Picker & Autocomplete State
  type SkillTarget = 'battle' | 'sub' | 'main';
  type SkillCategoryTab = 'battle' | 'main' | 'sub';
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<SkillTarget>('battle');
  const [pickerTab, setPickerTab] = useState<SkillCategoryTab>('battle');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSubFilter, setPickerSubFilter] = useState('ALL');

  const [isBattleInputFocused, setIsBattleInputFocused] = useState(false);
  const [isSubInputFocused, setIsSubInputFocused] = useState(false);
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);

  // Helper to get description from any skill object
  const getSkillDesc = (s: any): string => {
    if (s.description) return s.description;
    if (s.categoryData) {
      for (const cat of (s.categories || [])) {
        if (s.categoryData[cat]?.description) return s.categoryData[cat].description;
      }
    }
    return '';
  };

  // Toggle a skill name in the active target list
  const toggleSkillInList = (target: SkillTarget, skillName: string) => {
    const clean = skillName.trim();
    if (!clean) return;
    if (target === 'battle') {
      const list = formData.possibleBattleSkills || [];
      if (list.includes(clean)) {
        setFormData(prev => ({ ...prev, possibleBattleSkills: list.filter(s => s !== clean) }));
      } else {
        setFormData(prev => ({ ...prev, possibleBattleSkills: [...list, clean] }));
      }
    } else if (target === 'sub') {
      const list = formData.possibleSubSkills || [];
      if (list.includes(clean)) {
        setFormData(prev => ({ ...prev, possibleSubSkills: list.filter(s => s !== clean) }));
      } else {
        setFormData(prev => ({ ...prev, possibleSubSkills: [...list, clean] }));
      }
    } else if (target === 'main') {
      const list = formData.possibleMainSkills || [];
      if (list.includes(clean)) {
        setFormData(prev => ({ ...prev, possibleMainSkills: list.filter(s => s !== clean) }));
      } else {
        setFormData(prev => ({ ...prev, possibleMainSkills: [...list, clean] }));
      }
    }
  };

  const openPicker = (target: SkillTarget) => {
    setPickerTarget(target);
    setPickerTab(target);
    setPickerSearch('');
    setPickerSubFilter('ALL');
    setIsPickerOpen(true);
  };

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
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-rose-300 uppercase flex items-center gap-1">
                <span>⚔️</span> 可能戰鬥特性 (可追加多項)
              </label>
              <button
                type="button"
                onClick={() => openPicker('battle')}
                className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/70 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
              >
                <span>🔍</span> 從特性庫選擇
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleBattleSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增戰鬥特性</span>
              )}
              {formData.possibleBattleSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-rose-950/60 text-rose-200 border border-rose-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => onSkillClick?.(skill, 'battle')}
                    className="hover:underline hover:text-white cursor-pointer font-medium flex items-center gap-1 text-left"
                    title="點擊查看特性詳細資訊"
                  >
                    <span>{skill}</span>
                    <span className="text-[10px] opacity-70">ℹ️</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveBattleSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                    title="移除"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newBattleSkill}
                  onChange={e => setNewBattleSkill(e.target.value)}
                  onFocus={() => setIsBattleInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsBattleInputFocused(false), 200)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBattleSkill(); } }}
                  placeholder="輸入或搜尋戰鬥特性名稱..."
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

              {/* Autocomplete Suggestions */}
              {isBattleInputFocused && newBattleSkill.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-rose-800/80 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto">
                  {battleFormSkills
                    .filter(s => s.name.toLowerCase().includes(newBattleSkill.trim().toLowerCase()) || (s.partner?.note && s.partner.note.toLowerCase().includes(newBattleSkill.trim().toLowerCase())))
                    .slice(0, 8)
                    .map(s => {
                      const isAdded = (formData.possibleBattleSkills || []).includes(s.name);
                      return (
                        <div 
                          key={s.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!isAdded) {
                              setFormData(prev => ({
                                ...prev,
                                possibleBattleSkills: [...(prev.possibleBattleSkills || []), s.name]
                              }));
                            }
                            setNewBattleSkill('');
                            setIsBattleInputFocused(false);
                          }}
                          className="px-3 py-1.5 hover:bg-rose-950/60 cursor-pointer flex items-center justify-between text-xs border-b border-slate-800 last:border-0"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-white">{s.name}</span>
                            <span className="px-1.5 py-0.2 text-[10px] bg-rose-950 text-rose-300 rounded border border-rose-800">
                              {s.traitType || '特性'}
                            </span>
                            {s.partner?.note && (
                              <span className="text-[10px] text-slate-400 truncate">
                                ({s.partner.note})
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${isAdded ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isAdded ? '✓ 已加入' : '＋ 選擇'}
                          </span>
                        </div>
                      );
                    })}
                  {battleFormSkills.filter(s => s.name.toLowerCase().includes(newBattleSkill.trim().toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400">
                      無完全符合特性，點擊「＋ 新增」可自訂此名稱
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Possible Sub Skills (文字輸入，可追加多項) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1">
                <span>🌱</span> 可能副技能 (可追加多項)
              </label>
              <button
                type="button"
                onClick={() => openPicker('sub')}
                className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/70 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
              >
                <span>🔍</span> 從副技能庫選擇
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleSubSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增副技能</span>
              )}
              {formData.possibleSubSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => onSkillClick?.(skill, 'sub')}
                    className="hover:underline hover:text-white cursor-pointer font-medium flex items-center gap-1 text-left"
                    title="點擊查看副技能詳細資訊"
                  >
                    <span>{skill}</span>
                    <span className="text-[10px] opacity-70">ℹ️</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSubSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                    title="移除"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newSubSkill}
                  onChange={e => setNewSubSkill(e.target.value)}
                  onFocus={() => setIsSubInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsSubInputFocused(false), 200)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubSkill(); } }}
                  placeholder="輸入或搜尋副技能名稱..."
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

              {/* Autocomplete Suggestions */}
              {isSubInputFocused && newSubSkill.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-emerald-800/80 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto">
                  {subSkillList
                    .filter(s => s.name.toLowerCase().includes(newSubSkill.trim().toLowerCase()))
                    .slice(0, 8)
                    .map(s => {
                      const isAdded = (formData.possibleSubSkills || []).includes(s.name);
                      return (
                        <div 
                          key={s.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!isAdded) {
                              setFormData(prev => ({
                                ...prev,
                                possibleSubSkills: [...(prev.possibleSubSkills || []), s.name]
                              }));
                            }
                            setNewSubSkill('');
                            setIsSubInputFocused(false);
                          }}
                          className="px-3 py-1.5 hover:bg-emerald-950/60 cursor-pointer flex items-center justify-between text-xs border-b border-slate-800 last:border-0"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-white">{s.name}</span>
                            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                              副技能
                            </span>
                            {s.categories && s.categories.length > 0 && (
                              <span className="text-[10px] text-slate-400 truncate">
                                ({s.categories.join('/')})
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${isAdded ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isAdded ? '✓ 已加入' : '＋ 選擇'}
                          </span>
                        </div>
                      );
                    })}
                  {subSkillList.filter(s => s.name.toLowerCase().includes(newSubSkill.trim().toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400">
                      無相符副技能，點擊「＋ 新增」可自訂此名稱
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Possible Main Skills (文字輸入，可追加多項) */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-blue-300 uppercase flex items-center gap-1">
                <span>⚡</span> 可能主技能 (可追加多項)
              </label>
              <button
                type="button"
                onClick={() => openPicker('main')}
                className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/70 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
              >
                <span>🔍</span> 從主技能庫選擇
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(formData.possibleMainSkills || []).length === 0 && (
                <span className="text-xs text-slate-500 italic py-1">尚未新增主技能</span>
              )}
              {formData.possibleMainSkills?.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-blue-950/60 text-blue-200 border border-blue-700/60 rounded-full text-xs flex items-center gap-1 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => onSkillClick?.(skill, 'main')}
                    className="hover:underline hover:text-white cursor-pointer font-medium flex items-center gap-1 text-left"
                    title="點擊查看主技能詳細資訊"
                  >
                    <span>{skill}</span>
                    <span className="text-[10px] opacity-70">ℹ️</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveMainSkill(idx)}
                    className="hover:text-red-400 text-slate-400 font-bold ml-0.5"
                    title="移除"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newMainSkill}
                  onChange={e => setNewMainSkill(e.target.value)}
                  onFocus={() => setIsMainInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsMainInputFocused(false), 200)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMainSkill(); } }}
                  placeholder="輸入或搜尋主技能名稱..."
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

              {/* Autocomplete Suggestions */}
              {isMainInputFocused && newMainSkill.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-blue-800/80 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto">
                  {[
                    ...specialMainSkillList.map(s => ({ ...s, isSpec: true })),
                    ...mainSkillList.map(s => ({ ...s, isSpec: false }))
                  ]
                    .filter(s => s.name.toLowerCase().includes(newMainSkill.trim().toLowerCase()) || (s.partner?.note && s.partner.note.toLowerCase().includes(newMainSkill.trim().toLowerCase())))
                    .slice(0, 8)
                    .map(s => {
                      const isAdded = (formData.possibleMainSkills || []).includes(s.name);
                      return (
                        <div 
                          key={s.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!isAdded) {
                              setFormData(prev => ({
                                ...prev,
                                possibleMainSkills: [...(prev.possibleMainSkills || []), s.name]
                              }));
                            }
                            setNewMainSkill('');
                            setIsMainInputFocused(false);
                          }}
                          className="px-3 py-1.5 hover:bg-blue-950/60 cursor-pointer flex items-center justify-between text-xs border-b border-slate-800 last:border-0"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-white">{s.name}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] rounded border ${s.isSpec ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-blue-950 text-blue-300 border-blue-800'}`}>
                              {s.isSpec ? '特殊主技能' : '一般主技能'}
                            </span>
                            {s.partner?.note && (
                              <span className="text-[10px] text-slate-400 truncate">
                                ({s.partner.note})
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${isAdded ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isAdded ? '✓ 已加入' : '＋ 選擇'}
                          </span>
                        </div>
                      );
                    })}
                  {[...specialMainSkillList, ...mainSkillList].filter(s => s.name.toLowerCase().includes(newMainSkill.trim().toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400">
                      無相符主技能，點擊「＋ 新增」可自訂此名稱
                    </div>
                  )}
                </div>
              )}
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

      {/* Skill Picker Modal Overlay */}
      {isPickerOpen && (() => {
        const currentTargetList: string[] = 
          pickerTarget === 'battle'
            ? (formData.possibleBattleSkills || [])
            : pickerTarget === 'main'
            ? (formData.possibleMainSkills || [])
            : (formData.possibleSubSkills || []);

        const lowerSearch = pickerSearch.trim().toLowerCase();

        let pickerItems: Array<{
          uniqueId: string;
          name: string;
          badgeLabel: string;
          badgeClass: string;
          partnerNote?: string;
          type?: string;
          description?: string;
        }> = [];

        if (pickerTab === 'battle') {
          pickerItems = battleFormSkills
            .filter(s => {
              if (pickerSubFilter !== 'ALL') {
                if (pickerSubFilter === '專屬特性' && s.traitType !== '專屬特性') return false;
                if (pickerSubFilter === '額外特性' && s.traitType !== '額外特性') return false;
                if (pickerSubFilter === '常駐特性' && (s.traitType !== '常駐特性' && s.traitType !== undefined)) return false;
                if (pickerSubFilter === '稀有特性' && s.traitType !== '稀有特性') return false;
              }
              if (!lowerSearch) return true;
              const nameMatch = s.name.toLowerCase().includes(lowerSearch);
              const descMatch = s.description?.toLowerCase().includes(lowerSearch);
              const partnerMatch = s.partner?.note?.toLowerCase().includes(lowerSearch);
              const typeMatch = s.traitType?.toLowerCase().includes(lowerSearch);
              const cardMatch = s.cardNumber?.toString().includes(lowerSearch);
              return nameMatch || descMatch || partnerMatch || typeMatch || cardMatch;
            })
            .map(s => {
              let badgeClass = 'bg-cyan-950/70 text-cyan-300 border-cyan-800';
              if (s.traitType === '專屬特性') badgeClass = 'bg-amber-950/70 text-amber-300 border-amber-800';
              else if (s.traitType === '額外特性') badgeClass = 'bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-800';
              else if (s.traitType === '稀有特性') badgeClass = 'bg-rose-950/70 text-rose-300 border-rose-800';

              return {
                uniqueId: `battle_${s.id}`,
                name: s.name,
                badgeLabel: s.traitType || '戰鬥特性',
                badgeClass,
                partnerNote: s.partner?.note,
                description: s.description
              };
            });
        } else if (pickerTab === 'main') {
          const generals = mainSkillList.map(s => ({
            uniqueId: `main_gen_${s.id}`,
            name: s.name,
            badgeLabel: '一般主技能',
            badgeClass: 'bg-blue-950/70 text-blue-300 border-blue-800',
            type: s.type,
            description: getSkillDesc(s),
            partnerNote: undefined,
            isSpecial: false,
            categories: s.categories || []
          }));

          const specials = specialMainSkillList.map(s => ({
            uniqueId: `main_spec_${s.id}`,
            name: s.name,
            badgeLabel: '特殊主技能',
            badgeClass: 'bg-amber-950/70 text-amber-300 border-amber-800',
            type: s.type,
            description: getSkillDesc(s),
            partnerNote: s.partner?.note,
            isSpecial: true,
            categories: s.categories || []
          }));

          pickerItems = [...specials, ...generals].filter(s => {
            if (pickerSubFilter === '一般主技能' && s.isSpecial) return false;
            if (pickerSubFilter === '特殊主技能' && !s.isSpecial) return false;
            if (!lowerSearch) return true;
            const nameMatch = s.name.toLowerCase().includes(lowerSearch);
            const descMatch = s.description?.toLowerCase().includes(lowerSearch);
            const partnerMatch = s.partnerNote?.toLowerCase().includes(lowerSearch);
            const catMatch = s.categories.some(c => c.toLowerCase().includes(lowerSearch));
            return nameMatch || descMatch || partnerMatch || catMatch;
          });
        } else if (pickerTab === 'sub') {
          pickerItems = subSkillList
            .filter(s => {
              if (pickerSubFilter !== 'ALL' && !(s.categories || []).includes(pickerSubFilter as any)) {
                return false;
              }
              if (!lowerSearch) return true;
              const nameMatch = s.name.toLowerCase().includes(lowerSearch);
              const descMatch = getSkillDesc(s).toLowerCase().includes(lowerSearch);
              const catMatch = (s.categories || []).some(c => c.toLowerCase().includes(lowerSearch));
              return nameMatch || descMatch || catMatch;
            })
            .map(s => ({
              uniqueId: `sub_${s.id}`,
              name: s.name,
              badgeLabel: (s.categories && s.categories.length > 0) ? `副技能·${s.categories.join('/')}` : '副技能',
              badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
              type: s.type,
              description: getSkillDesc(s)
            }));
        }

        return (
          <div 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn"
            onClick={() => setIsPickerOpen(false)}
          >
            <div 
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">選擇夥伴技能與特性</h4>
                    <p className="text-[11px] text-slate-400">支援快速搜尋、各類特性/技能庫切換與單擊選取</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsPickerOpen(false)}
                  className="text-slate-400 hover:text-white transition text-lg px-2 py-0.5 rounded hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Target Selector Bar */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/50 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-bold whitespace-nowrap">目標加入至：</span>
                <div className="flex gap-1.5 flex-wrap flex-1">
                  <button
                    type="button"
                    onClick={() => setPickerTarget('battle')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      pickerTarget === 'battle'
                        ? 'bg-rose-600 text-white shadow ring-2 ring-rose-400/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    ⚔️ 戰鬥特性 ({(formData.possibleBattleSkills || []).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTarget('main')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      pickerTarget === 'main'
                        ? 'bg-blue-600 text-white shadow ring-2 ring-blue-400/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    ⚡ 主技能 ({(formData.possibleMainSkills || []).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTarget('sub')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      pickerTarget === 'sub'
                        ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400/40'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    🌱 副技能 ({(formData.possibleSubSkills || []).length})
                  </button>
                </div>
              </div>

              {/* Skill Library Source Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2.5 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setPickerTab('battle'); setPickerSubFilter('ALL'); }}
                  className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    pickerTab === 'battle'
                      ? 'border-rose-500 text-rose-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚔️ 戰鬥特性庫</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{battleFormSkills.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPickerTab('main'); setPickerSubFilter('ALL'); }}
                  className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    pickerTab === 'main'
                      ? 'border-blue-500 text-blue-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡ 主技能庫</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{mainSkillList.length + specialMainSkillList.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPickerTab('sub'); setPickerSubFilter('ALL'); }}
                  className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                    pickerTab === 'sub'
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🌱 副技能庫</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">{subSkillList.length}</span>
                </button>
              </div>

              {/* Search & Sub-Filter Bar */}
              <div className="p-4 space-y-2.5 bg-slate-900/90 border-b border-slate-800">
                <div className="relative">
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    placeholder="搜尋名稱、專屬夥伴、特性類型或說明..."
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  {pickerSearch && (
                    <button
                      type="button"
                      onClick={() => setPickerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sub-filter chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-bold mr-1">類型篩選：</span>
                  {pickerTab === 'battle' && (
                    <>
                      {['ALL', '專屬特性', '額外特性', '常駐特性', '稀有特性'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPickerSubFilter(t)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                            pickerSubFilter === t
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {t === 'ALL' ? '全部' : t}
                        </button>
                      ))}
                    </>
                  )}
                  {pickerTab === 'main' && (
                    <>
                      {['ALL', '一般主技能', '特殊主技能'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPickerSubFilter(t)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                            pickerSubFilter === t
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {t === 'ALL' ? '全部' : t}
                        </button>
                      ))}
                    </>
                  )}
                  {pickerTab === 'sub' && (
                    <>
                      {['ALL', '戰鬥', '冒險', '釣魚', '其他'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPickerSubFilter(t)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                            pickerSubFilter === t
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {t === 'ALL' ? '全部' : t}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2">
                {pickerItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <p className="text-2xl mb-2">🔍</p>
                    <p>沒有找到符合條件的技能或特性</p>
                  </div>
                ) : (
                  pickerItems.map(item => {
                    const isAdded = currentTargetList.includes(item.name);
                    return (
                      <div 
                        key={item.uniqueId}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isAdded 
                            ? 'bg-purple-950/30 border-purple-500/60 shadow-sm' 
                            : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onSkillClick?.(item.name, pickerTarget)}
                              className="text-xs font-bold text-white hover:text-purple-300 hover:underline flex items-center gap-1 text-left cursor-pointer"
                              title="點擊查看詳細資訊"
                            >
                              <span>{item.name}</span>
                              <span className="text-[10px] text-purple-400">ℹ️</span>
                            </button>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeClass}`}>
                              {item.badgeLabel}
                            </span>
                            {item.partnerNote && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[160px]">
                                🐾 {item.partnerNote}
                              </span>
                            )}
                            {item.type && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({item.type})
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSkillClick?.(item.name, pickerTarget)}
                            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                            title="查看詳細資訊"
                          >
                            ℹ️ 詳情
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSkillInList(pickerTarget, item.name)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                              isAdded
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/60 hover:bg-red-900/40 hover:text-red-300 hover:border-red-600/60'
                                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-purple-600 border border-slate-700'
                            }`}
                          >
                            {isAdded ? '✓ 已選取' : '＋ 加入'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-5 py-3 border-t border-slate-800 bg-slate-950/80">
                <div className="text-xs text-slate-400">
                  已為【{pickerTarget === 'battle' ? '⚔️ 戰鬥特性' : pickerTarget === 'main' ? '⚡ 主技能' : '🌱 副技能'}】選取{' '}
                  <span className="font-bold text-purple-300">
                    {currentTargetList.length}
                  </span>{' '}
                  項
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow-lg"
                >
                  完成選取
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SpecialPartnerFormModal;
