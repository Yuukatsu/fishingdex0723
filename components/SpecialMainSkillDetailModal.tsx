
import React from 'react';
import { SpecialMainSkill } from '../types';

interface SpecialMainSkillDetailModalProps {
  skill: SpecialMainSkill;
  onClose: () => void;
}

const SpecialMainSkillDetailModal: React.FC<SpecialMainSkillDetailModalProps> = ({ skill, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-amber-600/50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-900/30 bg-amber-900/10 flex justify-between items-start">
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-amber-600/50 flex items-center justify-center shadow-lg overflow-hidden">
                    {skill.partner.imageUrl && <img src={skill.partner.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-amber-200">{skill.name}</h2>
                        <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">SPECIAL</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                        {skill.type}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">技能效果</h4>
                <p className="text-slate-200 text-sm leading-relaxed">{skill.description}</p>
            </div>

            {/* Level Effects Table */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {skill.levelEffects.map((effect, idx) => (
                        <div key={idx} className="flex items-center bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
                            <span className="w-12 text-xs font-mono text-amber-300 font-bold border-r border-slate-700 mr-3">Lv.{idx + 1}</span>
                            <span className="text-sm text-slate-300">{effect || '-'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialMainSkillDetailModal;
