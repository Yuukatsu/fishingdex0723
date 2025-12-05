import React, { useState } from 'react';
import { Fish, RARITY_COLORS } from '../types';

interface FishCardProps {
  fish: Fish;
  viewMode: 'simple' | 'detailed';
  isDevMode: boolean;
  onEdit: (fish: Fish) => void;
  onDelete: (id: string) => void;
  onClick: (fish: Fish) => void;
}

type VariantType = 'normalMale' | 'normalFemale' | 'shinyMale' | 'shinyFemale';

const FishCard: React.FC<FishCardProps> = ({ fish, viewMode, isDevMode, onEdit, onDelete, onClick }) => {
  const [currentVariant, setCurrentVariant] = useState<VariantType>('normalMale');

  // Determine border and text colors based on rarity
  const colorClass = RARITY_COLORS[fish.rarity];
  
  // Backward compatibility: If no variants object, use imageUrl or placeholder
  const getImageUrl = (variant: VariantType) => {
    if (fish.variants && fish.variants[variant]) {
      return fish.variants[variant];
    }
    // Fallback for old data or if specific variant missing
    if (variant === 'normalMale') {
      return fish.imageUrl || `https://picsum.photos/seed/${fish.id + fish.name}/400/300`;
    }
    // Return undefined if variant missing, UI should handle this (e.g. show placeholder or generic)
    return undefined;
  };

  const displayImage = getImageUrl(currentVariant) || getImageUrl('normalMale');
  const depthDisplay = fish.depth || fish.location || '未知';

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  // Variant Buttons Component
  const VariantControls = () => (
    <div className="flex justify-center gap-1 mb-2 px-2" onClick={stopProp}>
       <button onClick={() => setCurrentVariant('normalMale')} className={`px-2 py-1 text-[10px] rounded ${currentVariant === 'normalMale' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>一般♂</button>
       <button onClick={() => setCurrentVariant('normalFemale')} className={`px-2 py-1 text-[10px] rounded ${currentVariant === 'normalFemale' ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-400'}`}>一般♀</button>
       <button onClick={() => setCurrentVariant('shinyMale')} className={`px-2 py-1 text-[10px] rounded ${currentVariant === 'shinyMale' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>異色♂</button>
       <button onClick={() => setCurrentVariant('shinyFemale')} className={`px-2 py-1 text-[10px] rounded ${currentVariant === 'shinyFemale' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}>異色♀</button>
    </div>
  );

  // --- SIMPLE MODE ---
  if (viewMode === 'simple') {
    return (
      <div 
        onClick={() => onClick(fish)}
        className={`relative group aspect-square rounded-xl border-2 bg-slate-800/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-opacity-100 border-opacity-40 ${colorClass.split(' ')[1]}`} 
      >
        {/* Hover Name Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end rounded-b-xl z-20">
           <span className={`text-sm font-bold text-center ${colorClass.split(' ')[0]}`}>{fish.name}</span>
        </div>

        {/* Rarity Indicator (Small dot) */}
        <div className="absolute top-2 right-2 z-10">
           <span className={`block w-3 h-3 rounded-full shadow-lg ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></span>
        </div>

        {/* Image - Fully contained */}
        <div className="w-full h-full p-2 flex items-center justify-center">
          <img 
            src={displayImage} 
            alt={fish.name} 
            className="max-w-full max-h-full object-contain [image-rendering:pixelated] drop-shadow-xl transition-transform group-hover:scale-110"
          />
        </div>

        {/* Dev Actions for Simple Mode (Top Left) */}
        {isDevMode && (
          <div className="absolute top-2 left-2 z-30 flex gap-1" onClick={e => e.stopPropagation()}>
             <button onClick={(e) => { e.stopPropagation(); onEdit(fish); }} className="p-1.5 bg-blue-600/80 rounded-full hover:bg-blue-500 text-white shadow"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(fish.id); }} className="p-1.5 bg-red-600/80 rounded-full hover:bg-red-500 text-white shadow"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        )}
      </div>
    );
  }

  // --- DETAILED MODE ---
  return (
    <div className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-slate-800 ${colorClass.replace('bg-', 'hover:bg-opacity-20 ')} border-opacity-60 flex flex-col`}>
      
      {/* Dev Mode Actions Overlay */}
      {isDevMode && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-none group-hover:pointer-events-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(fish); }}
            className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 hover:scale-110 transition shadow-lg"
            title="編輯"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(fish.id); }}
            className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 hover:scale-110 transition shadow-lg"
            title="刪除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Header / ID Badge */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <span className="px-2 py-1 text-xs font-bold bg-black/70 rounded text-white backdrop-blur-sm border border-white/10">
          No.{fish.id}
        </span>
      </div>

      {/* Rarity Badge */}
      <div className="absolute top-2 right-2 z-10 pointer-events-none">
        <span className={`px-2 py-1 text-sm font-black bg-black/60 rounded backdrop-blur-md ${colorClass.split(' ')[0]}`}>
          {fish.rarity}
        </span>
      </div>

      {/* Image Container - Enlarged */}
      <div className="w-full h-56 overflow-hidden relative bg-slate-900/80 p-6 flex flex-col items-center justify-between">
         <div className="flex-1 w-full flex items-center justify-center">
             {displayImage ? (
                <img 
                    src={displayImage} 
                    alt={`${fish.name} (${currentVariant})`} 
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 opacity-100 [image-rendering:pixelated]"
                    loading="lazy"
                />
             ) : (
                <span className="text-slate-600 text-xs">無圖片</span>
             )}
         </div>
      </div>
      
      {/* Variant Toggles */}
      <VariantControls />

      {/* Content */}
      <div className="p-4 relative flex-1 flex flex-col pt-2 border-t border-slate-700/50">
        <h3 className={`text-xl font-bold mb-1 ${colorClass.split(' ')[0]} drop-shadow-sm`}>
          {fish.name}
        </h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
            {fish.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300 border border-slate-600/50">
                    {tag}
                </span>
            ))}
        </div>

        <p className="text-slate-300 text-sm mb-4 line-clamp-2 italic opacity-80 h-10">
          "{fish.description}"
        </p>

        <div className="space-y-2 text-xs text-slate-400 mt-auto">
          
          <div className="flex items-start">
            <span className="w-4 mr-2 text-center text-blue-400">🌊</span>
            <span className="flex-1 text-slate-200">{depthDisplay}</span>
          </div>

          <div className="flex items-start">
             <span className="w-4 mr-2 text-center">👁️</span>
             <div className="flex-1 flex flex-wrap gap-1">
                {fish.conditions.map((cond, i) => (
                  <span key={i} className="text-amber-200/80 bg-amber-900/30 px-1 rounded">{cond}</span>
                ))}
                {fish.conditions.length === 0 && <span className="text-slate-600">-</span>}
             </div>
          </div>

          {fish.specialNote && (
            <div className="flex items-start">
              <span className="w-4 mr-2 text-center">📝</span>
              <span className="flex-1 text-purple-300">{fish.specialNote}</span>
            </div>
          )}

          {fish.battleRequirements && (
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-start">
                <span className="w-4 mr-2 text-center">⚔️</span>
                <span className="flex-1 text-red-300 font-medium">{fish.battleRequirements}</span>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FishCard;