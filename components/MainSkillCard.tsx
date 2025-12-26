
import React from 'react';
import { MainSkill } from '../types';

interface MainSkillCardProps {
  skill: MainSkill;
  isDevMode: boolean;
  onEdit: (skill: MainSkill) => void;
  onDelete: (id: string) => void;
  onClick: (skill: MainSkill) => void;
}

const MainSkillCard: React.FC<MainSkillCardProps> = ({ skill, isDevMode, onEdit, onDelete, onClick }) => {
  // Join effects with slash, or show placeholder
  const effectsString = skill.levelEffects.every(e => !e) 
      ? '無數值變化' 
      : skill.levelEffects.map(e => e || '-').join(' / ');

  return (
    <div 
        onClick={() => onClick(skill)}
        className={`relative group bg-slate-800/80 border rounded-xl px-4 py-3 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2 ${skill.isSpecial ? 'border-amber-500/50 hover:border-amber-500' : 'border-slate-600 hover:border-blue-500'}`}
    >
        {/* Header Row */}
        <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <h3 className={`text-base font-bold truncate ${skill.isSpecial ? 'text-amber-200' : 'text-white'}`}>{skill.name}</h3>
                {skill.isSpecial && (
                    <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-amber-400">SP</span>
                )}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                {skill.type}
            </span>
        </div>

        {/* Description - Single line */}
        <p className="text-[10px] text-slate-400 line-clamp-1">{skill.description}</p>

        {/* Level Effects Bar - Compact String */}
        <div className="bg-slate-950/50 rounded px-2 py-1.5 border border-slate-700/50 flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 flex-shrink-0 uppercase tracking-wide">Lv.1~6</span>
            <div className="h-3 w-px bg-slate-700 flex-shrink-0"></div>
            <span className={`text-[10px] font-mono truncate ${skill.isSpecial ? 'text-amber-100' : 'text-blue-100'}`}>
                {effectsString}
            </span>
        </div>

        {/* Partners Footer - Icons Enlarged */}
        {skill.partners.length > 0 && (
            <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-700/30">
                {skill.partners.slice(0, 8).map((p, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 relative group/icon shadow-sm">
                        {p.imageUrl ? (
                            <img src={p.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" title={p.note} />
                        ) : (
                            <span className="text-[10px]">?</span>
                        )}
                    </div>
                ))}
                {skill.partners.length > 8 && (
                    <span className="text-[10px] text-slate-500 font-bold">+{skill.partners.length - 8}</span>
                )}
            </div>
        )}

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

export default MainSkillCard;
