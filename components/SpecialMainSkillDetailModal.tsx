
import React, { useState, useEffect } from 'react';
import { SpecialMainSkill, SkillCategory, SKILL_CATEGORIES } from '../types';

interface SpecialMainSkillDetailModalProps {
  skill: SpecialMainSkill;
  initialCategory?: SkillCategory | null;
  onClose: () => void;
}

const SpecialMainSkillDetailModal: React.FC<SpecialMainSkillDetailModalProps> = ({ skill, initialCategory, onClose }) => {
  // === 核心邏輯：決定預設顯示的類別 ===
  const resolveInitialCategory = (): SkillCategory | '其他' => {
      if (initialCategory && skill.categories?.includes(initialCategory)) {
          return initialCategory;
      }
      if (skill.categories && skill.categories.length > 0) {
          return skill.categories[0];
      }
      if (skill.categoryData) {
          const foundKey = Object.keys(skill.categoryData).find(key => 
              SKILL_CATEGORIES.includes(key as SkillCategory)
          );
          if (foundKey) return foundKey as SkillCategory;
      }
      return '其他';
  };

  const [activeTab, setActiveTab] = useState<SkillCategory | '其他'>(resolveInitialCategory);

  useEffect(() => {
      setActiveTab(resolveInitialCategory());
  }, [skill, initialCategory]);

  const getCurrentData = () => {
      if (activeTab === '其他') {
          return {
              description: skill.description || '',
              levelEffects: skill.levelEffects || [],
              isMega: false,
              isPrimal: false
          };
      }

      const data = skill.categoryData?.[activeTab as SkillCategory];
      
      return {
          description: data?.description || '',
          levelEffects: data?.levelEffects || [],
          isMega: data?.isMega || false,
          isPrimal: data?.isPrimal || false
      };
  };

  const { description, levelEffects, isMega, isPrimal } = getCurrentData();

  // Determine active form and image
  const showPrimalImage = isPrimal && skill.partner.primalImageUrl;
  const showMegaImage = !showPrimalImage && isMega && skill.partner.megaImageUrl;
  
  let currentImage = skill.partner.imageUrl;
  if (showPrimalImage) currentImage = skill.partner.primalImageUrl;
  else if (showMegaImage) currentImage = skill.partner.megaImageUrl;

  // Determine Theme Colors
  let themeBorder = 'border-amber-600/50';
  let themeShadow = '';
  let themeHeaderBg = 'border-amber-900/30 bg-amber-900/10';
  let themeText = 'text-amber-200';
  let themeTabActive = 'text-amber-300';
  let themeProgress = 'bg-amber-500';
  let themeListBorder = 'border-slate-700/50';
  let themeListText = 'text-amber-300';

  if (showPrimalImage) {
      themeBorder = 'border-red-500/60';
      themeShadow = 'shadow-[0_0_30px_rgba(239,68,68,0.3)]';
      themeHeaderBg = 'border-red-900/50 bg-gradient-to-br from-red-900/20 to-orange-900/20';
      themeText = 'text-red-200';
      themeTabActive = 'text-red-300 border-t-red-500';
      themeProgress = 'bg-gradient-to-r from-red-500 to-orange-500';
      themeListBorder = 'border-red-900/30';
      themeListText = 'text-red-300';
  } else if (showMegaImage) {
      themeBorder = 'border-fuchsia-500/60';
      themeShadow = 'shadow-[0_0_30px_rgba(217,70,239,0.2)]';
      themeHeaderBg = 'border-fuchsia-900/50 bg-fuchsia-900/10';
      themeText = 'text-fuchsia-200';
      themeTabActive = 'text-fuchsia-300 border-t-fuchsia-500';
      themeProgress = 'bg-fuchsia-500';
      themeListBorder = 'border-fuchsia-900/30';
      themeListText = 'text-fuchsia-300';
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-slate-900 border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-colors duration-500 ${themeBorder} ${themeShadow}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 border-b transition-colors duration-500 flex justify-between items-start ${themeHeaderBg}`}>
            <div className="flex gap-4 items-center">
                {/* Image Container */}
                <div className={`w-20 h-20 rounded-xl bg-slate-900 border-2 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 transition-all duration-500 relative ${showPrimalImage ? 'border-red-500 scale-110' : showMegaImage ? 'border-fuchsia-500 scale-110' : 'border-amber-600/50'}`}>
                    {showPrimalImage && (
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
                    )}
                    {showMegaImage && (
                        <div className="absolute inset-0 bg-fuchsia-500/10 animate-pulse pointer-events-none"></div>
                    )}
                    
                    {currentImage && <img src={currentImage} className="w-full h-full object-contain [image-rendering:pixelated]" />}
                    
                    {showPrimalImage && (
                        <div className="absolute bottom-0 right-0">
                            <span className="text-[10px] font-black bg-gradient-to-r from-red-600 to-orange-600 text-white px-1 leading-none rounded-tl shadow-sm">Ω</span>
                        </div>
                    )}
                    {showMegaImage && (
                        <div className="absolute bottom-0 right-0">
                            <span className="text-[8px] font-black bg-fuchsia-600 text-white px-1 leading-none rounded-tl">MEGA</span>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className={`text-2xl font-bold transition-colors ${themeText}`}>{skill.name}</h2>
                        {showPrimalImage ? (
                            <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-red-400 animate-pulse">PRIMAL REVERSION</span>
                        ) : showMegaImage ? (
                            <span className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-fuchsia-400 animate-pulse">MEGA EVOLUTION</span>
                        ) : (
                            <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">SPECIAL</span>
                        )}
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
                {skill.categories.map(cat => {
                    const isActive = activeTab === cat;
                    const catIsMega = skill.categoryData?.[cat]?.isMega;
                    const catIsPrimal = skill.categoryData?.[cat]?.isPrimal;
                    
                    // Determine tab specific styling
                    let tabStyle = 'text-slate-500 hover:text-slate-300 hover:bg-slate-900';
                    if (isActive) {
                        tabStyle = `bg-slate-800 border-t border-x border-slate-700 relative top-[1px] ${
                            catIsPrimal && skill.partner.primalImageUrl 
                                ? 'text-red-300 border-t-red-500' 
                                : catIsMega && skill.partner.megaImageUrl 
                                    ? 'text-fuchsia-300 border-t-fuchsia-500' 
                                    : 'text-amber-300'
                        }`;
                    }

                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1 ${tabStyle}`}
                        >
                            {catIsPrimal && skill.partner.primalImageUrl && <span className="text-[10px]">🌋</span>}
                            {!catIsPrimal && catIsMega && skill.partner.megaImageUrl && <span className="text-[10px]">🧬</span>}
                            {cat}
                        </button>
                    );
                })}
            </div>
        )}

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* Description */}
            <div className={`bg-slate-800/50 p-4 rounded-xl border transition-colors duration-500 ${showPrimalImage ? 'border-red-900/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : showMegaImage ? 'border-fuchsia-900/50 shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]' : 'border-slate-700'}`}>
                <h4 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${showPrimalImage ? 'text-red-400' : showMegaImage ? 'text-fuchsia-400' : 'text-slate-400'}`}>
                    技能效果
                    {showPrimalImage && <span className="text-[10px] border border-red-500 px-1 rounded text-red-300">Primal Bonus</span>}
                    {showMegaImage && <span className="text-[10px] border border-fuchsia-500 px-1 rounded text-fuchsia-300">Mega Bonus</span>}
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">{description || <span className="text-slate-600 italic">無敘述資料</span>}</p>
            </div>

            {/* Level Effects Table */}
            <div>
                <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${showPrimalImage ? 'text-red-400' : showMegaImage ? 'text-fuchsia-400' : 'text-slate-400'}`}>
                    <span className={`w-1 h-4 rounded-full ${themeProgress}`}></span>
                    等級效果差異
                </h4>
                <div className="grid gap-1">
                    {levelEffects.map((effect, idx) => (
                        <div key={idx} className={`flex items-center bg-slate-800/30 border rounded-lg p-2 transition-colors ${themeListBorder}`}>
                            <span className={`w-12 text-xs font-mono font-bold border-r border-slate-700 mr-3 ${themeListText}`}>Lv.{idx + 1}</span>
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
