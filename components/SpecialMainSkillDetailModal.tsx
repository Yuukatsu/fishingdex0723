
import React, { useState, useEffect } from 'react';
import { SpecialMainSkill, SkillCategory, SKILL_CATEGORIES } from '../types';

interface SpecialMainSkillDetailModalProps {
  skill: SpecialMainSkill;
  onClose: () => void;
}

const SpecialMainSkillDetailModal: React.FC<SpecialMainSkillDetailModalProps> = ({ skill, onClose }) => {
  // === 核心邏輯：決定預設顯示的類別 ===
  const resolveInitialCategory = (): SkillCategory | '其他' => {
      // 1. 若 categories 陣列有值，顯示第一個
      if (skill.categories && skill.categories.length > 0) {
          return skill.categories[0];
      }
      
      // 2. [強力救援] 若 categories 為空，自動掃描 categoryData 找出有效分類
      if (skill.categoryData) {
          const foundKey = Object.keys(skill.categoryData).find(key => 
              SKILL_CATEGORIES.includes(key as SkillCategory)
          );
          if (foundKey) return foundKey as SkillCategory;
      }

      return '其他';
  };

  const [activeTab, setActiveTab] = useState<SkillCategory | '其他'>(resolveInitialCategory);

  // 當 skill prop 更新時，重新校正 tab (例如從列表點擊不同卡片)
  useEffect(() => {
      setActiveTab(resolveInitialCategory());
  }, [skill]);

  const getCurrentData = () => {
      // Case A: 顯示 '其他' -> 只讀取根目錄欄位
      if (activeTab === '其他') {
          return {
              description: skill.description || '',
              levelEffects: skill.levelEffects || []
          };
      }

      // Case B: 顯示特定分類 -> 嚴格讀取 categoryData
      // 不做任何 Fallback，避免被根目錄的髒資料或舊資料混淆
      const data = skill.categoryData?.[activeTab as SkillCategory];
      
      return {
          description: data?.description || '',
          levelEffects: data?.levelEffects || []
      };
  };

  const { description, levelEffects } = getCurrentData();

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

        {/* Tabs */}
        {skill.categories && skill.categories.length > 0 && (
            <div className="flex bg-slate-950/50 border-b border-slate-800 px-6 pt-2 gap-2">
                {skill.categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
                            activeTab === cat 
                                ? 'bg-slate-800 text-amber-300 border-t border-x border-slate-700 relative top-[1px]' 
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
                <p className="text-slate-200 text-sm leading-relaxed">{description || <span className="text-slate-600 italic">無敘述資料</span>}</p>
            </div>

            {/* Level Effects Table */}
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {levelEffects.map((effect, idx) => (
                        <div key={idx} className="flex items-center bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
                            <span className="w-12 text-xs font-mono text-amber-300 font-bold border-r border-slate-700 mr-3">Lv.{idx + 1}</span>
                            <span className="text-sm text-slate-300">{effect || '-'}</span>
                        </div>
                    ))}
                    {(!levelEffects || levelEffects.length === 0) && (
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

export default SpecialMainSkillDetailModal;
