
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
  return (
    <div 
        onClick={() => onClick(skill)}
        className={`relative group bg-slate-800/80 border rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 ${skill.isSpecial ? 'border-amber-500/50 hover:border-amber-500' : 'border-slate-600 hover:border-blue-500'}`}
    >
        {/* Special Badge */}
        {skill.isSpecial && (
            <div className="absolute -top-2 -right-2 z-10">
                <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg border border-amber-400">特殊</span>
            </div>
        )}

        <div className="flex justify-between items-start">
            <h3 className={`text-lg font-bold truncate ${skill.isSpecial ? 'text-amber-200' : 'text-white'}`}>{skill.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                {skill.type}
            </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5em]">{skill.description}</p>

        {/* Partners Preview */}
        <div className="mt-auto pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">擁有者</span>
                <div className="flex -space-x-2">
                    {skill.partners.slice(0, 5).map((p, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 overflow-hidden flex items-center justify-center relative z-0 hover:z-10 transition-transform hover:scale-125">
                            {p.imageUrl ? (
                                <img src={p.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" title={p.note} />
                            ) : (
                                <span className="text-[8px]">?</span>
                            )}
                        </div>
                    ))}
                    {skill.partners.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] text-slate-400 z-0">
                            +{skill.partners.length - 5}
                        </div>
                    )}
                    {skill.partners.length === 0 && <span className="text-[10px] text-slate-600 italic">無</span>}
                </div>
            </div>
        </div>

        {isDevMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 backdrop-blur-sm z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(skill); }} 
                className="p-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }} 
                className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded shadow-sm"
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
