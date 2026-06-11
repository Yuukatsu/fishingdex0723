import React from 'react';
import { BattleFormSkill } from '../types';

interface BattleFormSkillDetailModalProps {
  skill: BattleFormSkill;
  onClose: () => void;
}

const BattleFormSkillDetailModal: React.FC<BattleFormSkillDetailModalProps> = ({ skill, onClose }) => {
  const isPrimal = skill.formType === 'primal';
  const isMega = skill.formType === 'mega';

  let currentImage = skill.partner.imageUrl || '';
  if (isPrimal && skill.partner.primalImageUrl) currentImage = skill.partner.primalImageUrl;
  else if (isMega && skill.partner.megaImageUrl) currentImage = skill.partner.megaImageUrl;

  let themeBorder = isPrimal ? 'border-red-500/60' : 'border-fuchsia-500/60';
  let themeShadow = isPrimal ? 'shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'shadow-[0_0_30px_rgba(217,70,239,0.2)]';
  let themeHeaderBg = isPrimal ? 'border-red-900/50 bg-gradient-to-br from-red-900/20 to-orange-900/20' : 'border-fuchsia-900/50 bg-fuchsia-900/10';
  let themeText = isPrimal ? 'text-red-200' : 'text-fuchsia-200';
  let themeProgress = isPrimal ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-fuchsia-500';
  let themeListBorder = isPrimal ? 'border-red-900/30' : 'border-fuchsia-900/30';
  let themeListText = isPrimal ? 'text-red-300' : 'text-fuchsia-300';
  let imgBorder = isPrimal ? 'border-red-500 scale-110' : 'border-fuchsia-500 scale-110';
  let badgeColor = isPrimal ? 'bg-gradient-to-r from-red-600 to-orange-600 border border-red-400' : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-fuchsia-400';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-slate-900 border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-colors duration-500 ${themeBorder} ${themeShadow}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b transition-colors duration-500 flex justify-between items-start ${themeHeaderBg}`}>
            <div className="flex gap-4 items-center">
                <div className={`w-20 h-20 rounded-xl bg-slate-900 border-2 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 transition-all duration-500 relative ${imgBorder}`}>
                    <div className={`absolute inset-0 ${isPrimal ? 'bg-red-500/10' : 'bg-fuchsia-500/10'} animate-pulse pointer-events-none`}></div>
                    
                    {currentImage && <img src={currentImage} className="w-full h-full object-contain [image-rendering:pixelated]" />}
                    
                    <div className="absolute bottom-0 right-0">
                        {isPrimal ? (
                            <span className="text-[10px] font-black bg-gradient-to-r from-red-600 to-orange-600 text-white px-1 leading-none rounded-tl shadow-sm">Ω</span>
                        ) : (
                            <span className="text-[8px] font-black bg-fuchsia-600 text-white px-1 leading-none rounded-tl">MEGA</span>
                        )}
                    </div>
                </div>
                <div>
                    {skill.partner.note && (
                        <div className="mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${isPrimal ? 'bg-red-950/50 text-red-200 border-red-800/50' : 'bg-fuchsia-950/50 text-fuchsia-200 border-fuchsia-800/50'}`}>
                                👤 {skill.partner.note}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className={`text-2xl font-bold transition-colors ${themeText}`}>{skill.name}</h2>
                        <span className={`${badgeColor} text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm animate-pulse`}>
                            {isPrimal ? 'PRIMAL REVERSION' : 'MEGA EVOLUTION'}
                        </span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className={`bg-slate-800/50 p-4 rounded-xl border transition-colors duration-500 ${isPrimal ? 'border-red-900/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 'border-fuchsia-900/50 shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]'}`}>
                <h4 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${isPrimal ? 'text-red-400' : 'text-fuchsia-400'}`}>
                    技能效果
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">{skill.description || <span className="text-slate-600 italic">無敘述資料</span>}</p>
            </div>

            <div>
                <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${isPrimal ? 'text-red-400' : 'text-fuchsia-400'}`}>
                    <span className={`w-1 h-4 rounded-full ${themeProgress}`}></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {skill.levelEffects.map((effect, idx) => (
                        <div key={idx} className={`flex items-center bg-slate-800/30 border rounded-lg p-2 transition-colors ${themeListBorder}`}>
                            <span className={`w-12 text-xs font-mono font-bold border-r border-slate-700 mr-3 ${themeListText}`}>Lv.{idx + 1}</span>
                            <span className="text-sm text-slate-300">{effect || '-'}</span>
                        </div>
                    ))}
                    {(!skill.levelEffects || skill.levelEffects.length === 0) && (
                        <div className="text-center py-4 text-slate-500 text-xs italic">
                            無等級變化資料
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BattleFormSkillDetailModal;
