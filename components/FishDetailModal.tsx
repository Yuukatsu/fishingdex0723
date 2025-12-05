import React from 'react';
import { Fish, RARITY_COLORS } from '../types';

interface FishDetailModalProps {
  fish: Fish;
  onClose: () => void;
}

const FishDetailModal: React.FC<FishDetailModalProps> = ({ fish, onClose }) => {
  const colorClass = RARITY_COLORS[fish.rarity];
  const imageUrl = fish.imageUrl || `https://picsum.photos/seed/${fish.id + fish.name}/400/300`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/80 transition"
        >
          ✕
        </button>

        {/* Header Image - Enlarged and padded as requested */}
        <div className="w-full h-80 bg-slate-950 relative border-b border-slate-800 p-8 flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={fish.name} 
            className="w-full h-full object-contain [image-rendering:pixelated]" 
          />
           <div className="absolute top-4 left-4">
            <span className="px-2 py-1 text-sm font-bold bg-black/70 rounded text-white backdrop-blur-sm border border-white/10">
              No.{fish.id}
            </span>
          </div>
          <div className="absolute bottom-4 right-4">
             <span className={`px-3 py-1 text-lg font-black bg-black/80 rounded backdrop-blur-md ${colorClass.split(' ')[0]}`}>
              {fish.rarity}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className={`text-3xl font-bold mb-2 ${colorClass.split(' ')[0]}`}>{fish.name}</h2>
          
           {/* Tags */}
           <div className="flex flex-wrap gap-2 mb-4">
            {fish.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full border border-slate-600">
                #{tag}
              </span>
            ))}
          </div>

          <p className="text-slate-300 italic mb-6 border-l-4 border-slate-700 pl-4 py-1">
            "{fish.description}"
          </p>

          <div className="grid grid-cols-1 gap-y-4 text-sm">
             <div className="flex border-b border-slate-800 pb-2">
                <span className="w-24 text-slate-500 flex-shrink-0">📍 目擊情報</span>
                <span className="flex-1 text-slate-200">
                  {fish.location}
                  {fish.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                       {fish.conditions.map((c, i) => (
                         <span key={i} className="text-xs bg-amber-900/40 text-amber-200 px-1.5 py-0.5 rounded border border-amber-900/50">{c}</span>
                       ))}
                    </div>
                  )}
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
                  <span className="w-24 text-red-400 flex-shrink-0">⚔️ 比拚需求</span>
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
