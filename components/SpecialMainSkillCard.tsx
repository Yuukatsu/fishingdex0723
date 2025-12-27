
import React, { useState } from 'react';
import { SpecialMainSkill, SkillCategory } from '../types';

interface SpecialMainSkillCardProps {
  skill: SpecialMainSkill;
  isDevMode: boolean;
  onEdit: (skill: SpecialMainSkill) => void;
  onDelete: (id: string) => void;
  onClick: (skill: SpecialMainSkill) => void;
}

const SpecialMainSkillCard: React.FC<SpecialMainSkillCardProps> = ({ skill, isDevMode, onEdit, onDelete, onClick }) => {
  // 記錄使用者手動點選的類別，若無點選則為 null
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | '其他' | null>(null);

  // 核心邏輯：計算當前應顯示的「有效類別」
  // 1. 如果使用者有點選過，且該類別仍存在於目前的技能分類中 -> 使用使用者的選擇
  // 2. 否則，若技能有分類 -> 預設顯示第一個分類
  // 3. 若皆無 -> 顯示 '其他' (讀取根目錄資料)
  const activeCategory = (selectedCategory && skill.categories?.includes(selectedCategory as SkillCategory))
      ? selectedCategory
      : (skill.categories && skill.categories.length > 0 ? skill.categories[0] : '其他');

  // 資料讀取邏輯
  const getDisplayData = () => {
      // 1. 若為「其他」，強制讀取根目錄舊欄位
      if (activeCategory === '其他') {
          return {
              description: skill.description || '',
              levelEffects: skill.levelEffects || []
          };
      }

      // 2. 嘗試讀取該分類的專屬資料
      const data = skill.categoryData?.[activeCategory as SkillCategory];
      
      // 3. 若有專屬資料，直接使用 (即使內容為空字串，也代表這是該分類的設定)
      if (data) {
          return {
              description: data.description || '',
              levelEffects: data.levelEffects || []
          };
      }

      // 4. 若該分類完全無資料 (Fallback)，則讀取根目錄
      return {
          description: skill.description || '',
          levelEffects: skill.levelEffects || []
      };
  };

  const { description, levelEffects } = getDisplayData();

  // 判斷是否有有效的等級數值 (過濾掉空字串)
  const hasEffects = levelEffects && levelEffects.length > 0 && levelEffects.some(e => e && e.trim() !== '');
  
  const effectsString = hasEffects
      ? levelEffects.map(e => e || '-').join(' / ')
      : '無數值變化';

  return (
    <div 
        onClick={() => onClick(skill)}
        className="relative group bg-slate-800/80 border border-amber-500/30 hover:border-amber-500 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
    >
        <div className="flex items-start gap-4">
            {/* Large Partner Image */}
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                {skill.partner.imageUrl ? (
                    <img src={skill.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" title={skill.partner.note} />
                ) : (
                    <span className="text-2xl">👤</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate text-amber-200 mb-1">{skill.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-amber-400">SPECIAL</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                        {skill.type}
                    </span>
                </div>
            </div>
        </div>

        {/* Category Tabs (if multiple) */}
        {skill.categories && skill.categories.length > 0 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {skill.categories.map(cat => (
                    <button
                        key={cat}
                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); }}
                        className={`text-[9px] px-2 py-0.5 rounded transition-colors border ${activeCategory === cat ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        )}

        {/* Description */}
        <p className="text-[10px] text-slate-400 line-clamp-2 min-h-[1.5em]">{description}</p>

        {/* Level Effects Bar */}
        <div className="bg-slate-950/50 rounded px-2 py-1.5 border border-slate-700/50 flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 flex-shrink-0 uppercase tracking-wide">Lv.1~6</span>
            <div className="h-3 w-px bg-slate-700 flex-shrink-0"></div>
            <span className="text-[10px] font-mono truncate text-amber-100">
                {effectsString}
            </span>
        </div>

        {isDevMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 backdrop-blur-sm z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(skill); }} 
                className="p-1 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }} 
                className="p-1 bg-red-600/80 hover:bg-red-500 text-white rounded shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
        )}
    </div>
  );
};

export default SpecialMainSkillCard;
