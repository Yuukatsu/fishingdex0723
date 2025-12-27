
import React, { useState, useEffect } from 'react';
import { SpecialMainSkill, SkillCategory } from '../types';

interface SpecialMainSkillCardProps {
  skill: SpecialMainSkill;
  isDevMode: boolean;
  onEdit: (skill: SpecialMainSkill) => void;
  onDelete: (id: string) => void;
  onClick: (skill: SpecialMainSkill) => void;
}

const SpecialMainSkillCard: React.FC<SpecialMainSkillCardProps> = ({ skill, isDevMode, onEdit, onDelete, onClick }) => {
  // Use lazy initialization to set the correct tab immediately upon mount
  const [activeCategory, setActiveCategory] = useState<SkillCategory | '其他'>(() => {
      if (skill.categories && skill.categories.length > 0) {
          return skill.categories[0];
      }
      return '其他';
  });

  useEffect(() => {
      if (skill.categories && skill.categories.length > 0) {
          setActiveCategory(skill.categories[0]);
      } else {
          setActiveCategory('其他');
      }
  }, [skill]);

  // Robust Data Retrieval Logic matching the DetailModal
  const getDisplayData = () => {
      // Special handling for '其他':
      // The form writes '其他' category data to the root fields.
      if (activeCategory === '其他') {
          return {
              description: skill.description || '',
              levelEffects: skill.levelEffects || []
          };
      }

      const data = skill.categoryData?.[activeCategory];
      
      // Fallback Logic:
      // If specific category data is missing OR has empty effects array, use legacy/root data
      let effects = data?.levelEffects;
      // Note: We check for undefined or empty array. 
      // If the array exists but contains empty strings (['', '', ...]), that is considered "valid but empty data", handled by effectsString logic.
      // However, if the field itself is missing (undefined), we fallback.
      if (!effects || effects.length === 0) {
          effects = skill.levelEffects;
      }

      return {
          description: data?.description || skill.description || '',
          levelEffects: effects || []
      };
  };

  const { description, levelEffects } = getDisplayData();

  const effectsString = (!levelEffects || levelEffects.length === 0 || levelEffects.every(e => !e))
      ? '無數值變化' 
      : levelEffects.map(e => e || '-').join(' / ');

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
                        onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
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
    