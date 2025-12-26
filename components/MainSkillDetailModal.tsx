
import React, { useState, useEffect } from 'react';
import { MainSkill, SkillCategory } from '../types';

interface MainSkillDetailModalProps {
  skill: MainSkill;
  onClose: () => void;
}

const MainSkillDetailModal: React.FC<MainSkillDetailModalProps> = ({ skill, onClose }) => {
  // Use lazy initialization to set the correct tab immediately upon mount
  const [activeTab, setActiveTab] = useState<SkillCategory | '其他'>(() => {
      if (skill.categories && skill.categories.length > 0) {
          return skill.categories[0];
      }
      return '其他';
  });

  useEffect(() => {
      if (skill.categories && skill.categories.length > 0) {
          setActiveTab(skill.categories[0]);
      } else {
          setActiveTab('其他');
      }
  }, [skill]);

  const getCurrentData = () => {
      // Special handling for '其他':
      // The form writes '其他' category data to the root fields (legacy/fallback behavior).
      // So if activeTab is '其他', we should strictly read from root to match Card behavior.
      if (activeTab === '其他') {
          return {
              description: skill.description || '',
              levelEffects: skill.levelEffects || []
          };
      }

      const data = skill.categoryData?.[activeTab as SkillCategory];
      
      // Robust Fallback Logic for specific categories:
      // If specific category data is missing OR has empty effects array, use legacy root data
      let effects = data?.levelEffects;
      if (!effects || effects.length === 0) {
          effects = skill.levelEffects;
      }

      return {
          description: data?.description || skill.description || '',
          levelEffects: effects || []
      };
  };

  const { description, levelEffects } = getCurrentData();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">{skill.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded border ${skill.type === '常駐型' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-orange-900/40 text-orange-300 border-orange-700'}`}>
                    {skill.type}
                </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        {/* Tabs */}
        {skill.categories && skill.categories.length > 0 && (
            <div className="flex bg-slate-950/50 border-b border-slate-800 px-6 pt-2 gap-2">
                {skill.categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
                            activeTab === cat 
                                ? 'bg-slate-800 text-purple-300 border-t border-x border-slate-700 relative top-[1px]' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        )}

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">技能效果</h4>
                <p className="text-slate-200 text-sm leading-relaxed">{description}</p>
            </div>

            {/* Level Effects Table */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {levelEffects.map((effect, idx) => (
                        <div key={idx} className="flex items-center bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
                            <span className="w-12 text-xs font-mono text-purple-300 font-bold border-r border-slate-700 mr-3">Lv.{idx + 1}</span>
                            <span className="text-sm text-slate-300">{effect || '-'}</span>
                        </div>
                    ))}
                    {levelEffects.length === 0 && (
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

export default MainSkillDetailModal;
