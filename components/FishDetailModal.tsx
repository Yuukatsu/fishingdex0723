
import React, { useState } from 'react';
import { Fish, RARITY_COLORS } from '../types';

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
  
  // Format Depth Display (Logic aligned with FishCard)
  let depthDisplay = '0m 以上'; // Default
  
  if (fish.depthMin !== undefined && fish.depthMin !== null) {
      if (fish.depthMax !== undefined && fish.depthMax !== null) {
          depthDisplay = `${fish.depthMin}m - ${fish.depthMax}m`;
      } else {
          depthDisplay = `${fish.depthMin}m 以上`;
      }
  } else if (fish.location) {
      // Fallback for old data
      depthDisplay = fish.location;
  }

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

        <div className="p-6 overflow-y-auto">
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
             {fish.battleRequirements && (
               <div className="flex pt-2">
                  <span className="w-24 text-red-400 flex-shrink-0">⚔️ 比拚要點</span>
                  <span className="flex-1 text-red-300 font-medium">{fish.battleRequirements}</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishDetailModal;
