
import React, { useState } from 'react';
import { Fish, RARITY_COLORS, BattleAction } from '../types';

interface FishDetailModalProps {
  fish: Fish;
  onClose: () => void;
}

type VariantType = 'normalMale' | 'normalFemale' | 'shinyMale' | 'shinyFemale';

const FishDetailModal: React.FC<FishDetailModalProps> = ({ fish, onClose }) => {
  const [currentVariant, setCurrentVariant] = useState<VariantType>('normalMale');
  const colorClass = RARITY_COLORS[fish.rarity];
  
  const getImageUrl = (variant: VariantType) => {
    if (fish.variants && fish.variants[variant]) {
      return fish.variants[variant];
    }
    if (variant === 'normalMale') {
      return fish.imageUrl || `https://picsum.photos/seed/${fish.id + fish.name}/400/300`;
    }
    return undefined;
  };

  const displayImage = getImageUrl(currentVariant) || getImageUrl('normalMale');
  
  // Format Depth Display
  let depthDisplay = '0m 以上'; // Default
  if (fish.depthMin !== undefined && fish.depthMin !== null) {
      if (fish.depthMax !== undefined && fish.depthMax !== null) {
          depthDisplay = `${fish.depthMin}m - ${fish.depthMax}m`;
      } else {
          depthDisplay = `${fish.depthMin}m 以上`;
      }
  } else if (fish.location) {
      depthDisplay = fish.location;
  }

  // Battle Stats Logic
  const stats = fish.battleStats;
  const hasStats = stats && (stats.tensileStrength > 0 || stats.durability > 0 || stats.luck > 0 || !!stats.huanyeNote);
  const action = stats?.preferredAction || '無';

  const getActionColor = (a: BattleAction) => {
      switch (a) {
          case '拉': return 'bg-red-600 text-white border-red-500';
          case '放': return 'bg-blue-600 text-white border-blue-500';
          case '收': return 'bg-green-600 text-white border-green-500';
          default: return 'bg-slate-700 text-slate-300 border-slate-600';
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/80 transition">✕</button>

        <div className="w-full h-[45vh] min-h-[300px] bg-slate-950 relative border-b border-slate-800 flex flex-col items-center justify-center flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center p-2">
            {displayImage ? (
                <img src={displayImage} alt={fish.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            ) : <div className="text-slate-600">暫無此變種圖片</div>}
          </div>
          
           <div className="absolute top-4 left-4"><span className="px-2 py-1 text-sm font-bold bg-black/70 rounded text-white backdrop-blur-sm border border-white/10">No.{fish.id}</span></div>
          <div className="absolute bottom-4 right-4"><span className={`px-3 py-1 text-lg font-black bg-black/80 rounded backdrop-blur-md ${colorClass.split(' ')[0]}`}>{fish.rarity}</span></div>

          <div className="absolute bottom-4 left-4 flex gap-2 bg-black/50 p-1.5 rounded-lg backdrop-blur-sm">
             {(['normalMale', 'normalFemale', 'shinyMale', 'shinyFemale'] as VariantType[]).map(key => (
                 <button key={key} onClick={() => setCurrentVariant(key)} className={`px-3 py-1 text-xs rounded font-bold transition ${currentVariant === key ? 'bg-blue-600 text-white shadow' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
                     {key === 'normalMale' ? '一般♂' : key === 'normalFemale' ? '一般♀' : key === 'shinyMale' ? '異色♂' : '異色♀'}
                 </button>
             ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <h2 className={`text-3xl font-bold mb-2 ${colorClass.split(' ')[0]}`}>{fish.name}</h2>
          
           <div className="flex flex-wrap gap-2 mb-4">
            {fish.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full border border-slate-600">#{tag}</span>
            ))}
          </div>

          <p className="text-slate-300 italic mb-6 border-l-4 border-slate-700 pl-4 py-1">"{fish.description}"</p>

          <div className="grid grid-cols-1 gap-y-4 text-sm">
             <div className="flex border-b border-slate-800 pb-2">
                <span className="w-24 text-blue-400 flex-shrink-0 font-bold">🌊 水深範圍</span>
                <span className="flex-1 text-slate-200 text-base">{depthDisplay}</span>
             </div>
             <div className="flex border-b border-slate-800 pb-2">
                <span className="w-24 text-slate-500 flex-shrink-0">📍 目擊情報</span>
                <span className="flex-1 text-slate-200">
                  {fish.conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                       {fish.conditions.map((c, i) => <span key={i} className="text-xs bg-amber-900/40 text-amber-200 px-1.5 py-0.5 rounded border border-amber-900/50">{c}</span>)}
                    </div>
                  ) : '無紀錄'}
                </span>
             </div>
             {fish.specialNote && (
               <div className="flex border-b border-slate-800 pb-2">
                  <span className="w-24 text-slate-500 flex-shrink-0">📝 特殊要求</span>
                  <span className="flex-1 text-purple-300">{fish.specialNote}</span>
               </div>
             )}
             
             {/* Battle Stats / Requirements */}
             {(hasStats || fish.battleRequirements) && (
               <div className="flex pt-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
                  <span className="w-20 text-red-400 flex-shrink-0 font-bold flex items-center">
                      <span className="text-lg mr-1">⚔️</span> 屬性
                  </span>
                  <div className="flex-1">
                      {hasStats ? (
                          <div className="flex gap-4 items-center flex-wrap">
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-700" title="拉扯力">
                                  <span className="text-xs">💪</span>
                                  <span className="text-sm font-mono text-red-300 font-bold">{stats!.tensileStrength}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-700" title="耐久度">
                                  <span className="text-xs">🛡️</span>
                                  <span className="text-sm font-mono text-blue-300 font-bold">{stats!.durability}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-700" title="幸運值">
                                  <span className="text-xs">🍀</span>
                                  <span className="text-sm font-mono text-green-300 font-bold">{stats!.luck}</span>
                              </div>
                              
                              {action !== '無' && (
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded border shadow-sm ${getActionColor(action)}`}>
                                      <span className="text-[10px] uppercase font-bold">偏好</span>
                                      <span className="text-sm font-black">{action}</span>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <span className="text-red-300 font-medium">{fish.battleRequirements}</span>
                      )}
                      
                      {/* Add Huanye's Note Display */}
                      {stats?.huanyeNote && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <div className="flex gap-2">
                                  <span className="text-lg">🧐</span>
                                  <div>
                                      <span className="text-xs text-amber-500 font-bold block mb-0.5">歡也的備註</span>
                                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{stats.huanyeNote}</p>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishDetailModal;
