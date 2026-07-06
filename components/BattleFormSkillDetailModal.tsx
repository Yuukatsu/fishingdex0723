import React from 'react';
import { BattleFormSkill } from '../types';

interface BattleFormSkillDetailModalProps {
  skill: BattleFormSkill;
  onClose: () => void;
}

const BattleFormSkillDetailModal: React.FC<BattleFormSkillDetailModalProps> = ({ skill, onClose }) => {
  const isPrimal = skill.formType === 'primal';
  const isMega = skill.formType === 'mega';
  const isPermanent = skill.traitType === '常駐特性';

  let currentImage = skill.partner?.imageUrl || '';
  if (isPrimal && skill.partner?.primalImageUrl) currentImage = skill.partner.primalImageUrl;
  else if (isMega && skill.partner?.megaImageUrl) currentImage = skill.partner.megaImageUrl;

  let themeBorder = isPermanent ? 'border-cyan-500/60' : (isPrimal ? 'border-red-500/60' : 'border-fuchsia-500/60');
  let themeShadow = isPermanent ? 'shadow-[0_0_30px_rgba(6,182,212,0.2)]' : (isPrimal ? 'shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'shadow-[0_0_30px_rgba(217,70,239,0.2)]');
  let themeHeaderBg = isPermanent ? 'border-cyan-900/50 bg-cyan-900/10' : (isPrimal ? 'border-red-900/50 bg-gradient-to-br from-red-900/20 to-orange-900/20' : 'border-fuchsia-900/50 bg-fuchsia-900/10');
  let themeText = isPermanent ? 'text-cyan-200' : (isPrimal ? 'text-red-200' : 'text-fuchsia-200');
  let themeProgress = isPermanent ? 'bg-cyan-500' : (isPrimal ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-fuchsia-500');
  let imgBorder = isPermanent ? 'border-cyan-500 scale-110' : (isPrimal ? 'border-red-500 scale-110' : 'border-fuchsia-500 scale-110');
  let badgeColor = isPermanent ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400' : (isPrimal ? 'bg-gradient-to-r from-red-600 to-orange-600 border border-red-400' : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-fuchsia-400');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-slate-900 border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-colors duration-500 ${themeBorder} ${themeShadow}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b transition-colors duration-500 flex justify-between items-start ${themeHeaderBg}`}>
            <div className="flex gap-4 items-center">
                {!isPermanent && (
                    <div className={`w-20 h-20 rounded-xl bg-slate-900 border-2 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 transition-all duration-500 relative ${imgBorder}`}>
                        <div className={`absolute inset-0 ${isPrimal ? 'bg-red-500/10' : 'bg-fuchsia-500/10'} animate-pulse pointer-events-none`}></div>
                        
                        {currentImage ? (
                            <img src={currentImage} className="w-full h-full object-contain [image-rendering:pixelated]" />
                        ) : (
                            <span className="text-3xl">👤</span>
                        )}
                        
                        <div className="absolute bottom-0 right-0">
                            {isPrimal ? (
                                <span className="text-[10px] font-black bg-gradient-to-r from-red-600 to-orange-600 text-white px-1 leading-none rounded-tl shadow-sm">Ω</span>
                            ) : (
                                <span className="text-[8px] font-black bg-fuchsia-600 text-white px-1 leading-none rounded-tl">MEGA</span>
                            )}
                        </div>
                    </div>
                )}
                <div>
                    {!isPermanent && skill.partner?.note && (
                        <div className="mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${isPrimal ? 'bg-red-950/50 text-red-200 border-red-800/50' : 'bg-fuchsia-950/50 text-fuchsia-200 border-fuchsia-800/50'}`}>
                                👤 {skill.partner.note}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className={`text-2xl font-bold transition-colors ${themeText}`}>{skill.name}</h2>
                        <span className={`${badgeColor} text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm`}>
                            {skill.traitType || '額外特性'} {(!isPermanent && isPrimal) ? '(原始回歸)' : (!isPermanent && isMega ? '(MEGA)' : '')}
                        </span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className={`bg-slate-800/50 p-4 rounded-xl border transition-colors duration-500 ${isPermanent ? 'border-cyan-900/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' : (isPrimal ? 'border-red-900/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 'border-fuchsia-900/50 shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]')}`}>
                <h4 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${isPermanent ? 'text-cyan-400' : (isPrimal ? 'text-red-400' : 'text-fuchsia-400')}`}>
                    <span className={`w-1 h-4 rounded-full ${themeProgress}`}></span>
                    特性效果
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{skill.description || <span className="text-slate-600 italic">無敘述資料</span>}</p>
            </div>

            {skill.hasAdaptedVersion && (
                <div className={`bg-slate-800/50 p-4 rounded-xl border transition-colors duration-500 border-emerald-900/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]`}>
                    <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2 text-emerald-400">
                        <span className="w-1 h-4 rounded-full bg-emerald-500"></span>
                        強化版本效果
                    </h4>
                    
                    <div className="flex flex-col gap-3 items-start">
                        {skill.enhanceCondition && (
                            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-2.5 w-full">
                                <span className="text-xs font-bold text-emerald-500 mb-1 block">強化條件</span>
                                <p className="text-emerald-200 text-sm leading-relaxed whitespace-pre-line">{skill.enhanceCondition}</p>
                            </div>
                        )}
                        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line flex-1 mt-1">
                            {skill.adaptedDescription || <span className="text-slate-600 italic">無敘述資料</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BattleFormSkillDetailModal;
