
import React from 'react';
import { MainSkill } from '../types';

interface MainSkillDetailModalProps {
  skill: MainSkill;
  onClose: () => void;
}

const MainSkillDetailModal: React.FC<MainSkillDetailModalProps> = ({ skill, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-slate-900 border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] ${skill.isSpecial ? 'border-amber-500/50' : 'border-slate-600'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b flex justify-between items-start ${skill.isSpecial ? 'bg-amber-900/10 border-amber-900/30' : 'bg-slate-950 border-slate-800'}`}>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className={`text-2xl font-bold ${skill.isSpecial ? 'text-amber-200' : 'text-white'}`}>{skill.name}</h2>
                    {skill.isSpecial && <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">SPECIAL</span>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                    {skill.type}
                </span>
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
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {skill.levelEffects.map((effect, idx) => (
                        <div key={idx} className="flex items-center bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
                            <span className="w-12 text-xs font-mono text-purple-300 font-bold border-r border-slate-700 mr-3">Lv.{idx + 1}</span>
                            <span className="text-sm text-slate-300">{effect || '-'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Partners Grid */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                    擁有夥伴 ({skill.partners.length})
                </h4>
                
                {skill.partners.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-xl border border-slate-700/50 border-dashed">
                        尚無資料
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                        {skill.partners.map((p, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative">
                                <div className="w-14 h-14 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center p-1 shadow-md group-hover:border-blue-400 transition-colors">
                                    <img src={p.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                </div>
                                {p.note && (
                                    <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 max-w-full truncate text-center">
                                        {p.note}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MainSkillDetailModal;
