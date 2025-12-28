
import React from 'react';
import { SpecialMainSkill, SkillCategory } from '../types';

interface SpecialMainSkillCardProps {
  skill: SpecialMainSkill;
  isDevMode: boolean;
  onEdit: (skill: SpecialMainSkill) => void;
  onDelete: (id: string) => void;
  onClick: (skill: SpecialMainSkill) => void;
  onCategoryClick: (skill: SpecialMainSkill, category: SkillCategory) => void;
}

const SpecialMainSkillCard: React.FC<SpecialMainSkillCardProps> = ({ 
    skill, 
    isDevMode, 
    onEdit, 
    onDelete, 
    onClick,
    onCategoryClick
}) => {
  
  return (
    <div 
        onClick={() => onClick(skill)}
        className="relative group bg-slate-800/80 border border-amber-500/30 hover:border-amber-500 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-4 items-start"
    >
        {/* Left: Partner Info */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform relative">
                {skill.partner.imageUrl ? (
                    <img src={skill.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" alt="Partner" />
                ) : (
                    <span className="text-2xl">👤</span>
                )}
            </div>
            {/* Partner Name (Previously Note) - Enhanced Visibility */}
            {skill.partner.note && (
                <span className="text-[11px] font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded shadow-md border border-slate-400 text-center w-full truncate -mt-3 relative z-10">
                    {skill.partner.note}
                </span>
            )}
        </div>

        {/* Right: Skill Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
                <h3 className="text-lg font-bold truncate text-amber-200 leading-tight">{skill.name}</h3>
                <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                    {skill.type}
                </span>
            </div>

            {/* Category Chips - Acts as deep links */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {skill.categories && skill.categories.length > 0 ? (
                    skill.categories.map(cat => {
                        const isMega = skill.categoryData?.[cat]?.isMega && skill.partner.megaImageUrl;
                        return (
                            <button
                                key={cat}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onCategoryClick(skill, cat); 
                                }}
                                className={`text-[10px] px-2 py-1 rounded border hover:text-white transition-colors shadow-sm font-medium flex items-center gap-1 ${
                                    isMega 
                                    ? 'bg-fuchsia-900/40 border-fuchsia-700 text-fuchsia-200 hover:bg-fuchsia-600 hover:border-fuchsia-500' 
                                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-amber-600 hover:border-amber-500'
                                }`}
                            >
                                {isMega && <span className="text-[8px]">🧬</span>}
                                {cat}
                            </button>
                        );
                    })
                ) : (
                    <span className="text-[10px] text-slate-500 italic">無分類資料</span>
                )}
            </div>
        </div>

        {/* Dev Controls */}
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
