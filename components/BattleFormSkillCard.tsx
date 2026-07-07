import React from 'react';
import { BattleFormSkill } from '../types';

interface BattleFormSkillCardProps {
  skill: BattleFormSkill;
  isDevMode: boolean;
  onEdit: (skill: BattleFormSkill) => void;
  onDelete: (id: string) => void;
  onClick: (skill: BattleFormSkill) => void;
}

const BattleFormSkillCard: React.FC<BattleFormSkillCardProps> = ({ 
    skill, 
    isDevMode, 
    onEdit, 
    onDelete, 
    onClick 
}) => {
  
  const isPrimal = skill.formType === 'primal';
  const isMega = skill.formType === 'mega';
  const isPermanent = skill.traitType === '常駐特性';
  const isExclusive = skill.traitType === '專屬特性';
  const isRare = skill.traitType === '稀有特性';

  let displayImage = skill.partner?.imageUrl;
  if (isPrimal && skill.partner?.primalImageUrl && skill.traitType === '額外特性') displayImage = skill.partner.primalImageUrl;
  else if (isMega && skill.partner?.megaImageUrl && skill.traitType === '額外特性') displayImage = skill.partner.megaImageUrl;

  // Visual theming based on trait type and form
  let borderColor = (isPermanent || isRare) ? 'border-cyan-500/50 hover:border-cyan-500' : (isExclusive ? 'border-amber-500/50 hover:border-amber-500' : (isPrimal ? 'border-red-500/50 hover:border-red-500' : 'border-fuchsia-500/50 hover:border-fuchsia-500'));
  let imgBorderColor = (isPermanent || isRare) ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : (isExclusive ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : (isPrimal ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]'));
  let numBgColor = (isPermanent || isRare) ? 'text-cyan-400 bg-cyan-900/30 border-cyan-700/50' : (isExclusive ? 'text-amber-400 bg-amber-900/30 border-amber-700/50' : (isPrimal ? 'text-red-400 bg-red-900/30 border-red-700/50' : 'text-fuchsia-400 bg-fuchsia-900/30 border-fuchsia-700/50'));
  let titleColor = (isPermanent || isRare) ? 'text-cyan-200' : (isExclusive ? 'text-amber-200' : (isPrimal ? 'text-red-200' : 'text-fuchsia-200'));

  return (
    <div 
        onClick={() => onClick(skill)}
        className={`relative group bg-slate-800/80 border ${borderColor} rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-4 items-start`}
    >
        {!(isPermanent || isRare) && (
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                <div className={`w-16 h-16 rounded-xl bg-slate-900 border ${imgBorderColor} overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform relative`}>
                    {displayImage ? (
                        <img src={displayImage} className="w-full h-full object-contain [image-rendering:pixelated]" alt="Partner" />
                    ) : (
                        <span className="text-2xl">👤</span>
                    )}
                </div>
            </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
            {!(isPermanent || isRare) && (
                <div className="flex items-center gap-2 flex-wrap">
                    {skill.cardNumber !== undefined && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${numBgColor}`}>
                            #{skill.cardNumber.toString().padStart(3, '0')}
                        </span>
                    )}
                    {skill.partner?.note && (
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-600/50 flex items-center gap-1 max-w-full truncate">
                            👤 {skill.partner.note}
                        </span>
                    )}
                </div>
            )}
            <div>
                <h3 className={`text-lg font-bold truncate leading-tight ${titleColor}`}>
                    {!(isPermanent || isRare) && isPrimal && <span className="text-red-400 mr-1 text-sm font-serif">Ω</span>}
                    {!(isPermanent || isRare) && isMega && <span className="text-fuchsia-400 mr-1 text-sm">🧬</span>}
                    {skill.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{skill.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded border ${(isPermanent || isRare) ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700' : (isExclusive ? 'bg-amber-900/40 text-amber-300 border-amber-700' : (isPrimal ? 'bg-red-900/40 text-red-300 border-red-700' : 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700'))}`}>
                    {skill.traitType || '額外特性'} {(skill.traitType === '額外特性' && isPrimal) ? '(原始回歸)' : (skill.traitType === '額外特性' && isMega ? '(Mega)' : '')}
                 </span>
                 {skill.hasAdaptedVersion && (
                     <span className="text-[10px] font-bold px-2 py-1 rounded border bg-emerald-900/40 text-emerald-300 border-emerald-700 flex items-center gap-1">
                         ✨ 有強化條件
                     </span>
                 )}
            </div>
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

export default BattleFormSkillCard;
