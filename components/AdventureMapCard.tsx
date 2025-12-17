
import React from 'react';
import { AdventureMap } from '../types';

interface AdventureMapCardProps {
  mapData: AdventureMap;
  isDevMode: boolean;
  onEdit: (map: AdventureMap) => void;
  onDelete: (id: string) => void;
  onClick: (map: AdventureMap) => void;
}

const AdventureMapCard: React.FC<AdventureMapCardProps> = ({ mapData, isDevMode, onEdit, onDelete, onClick }) => {
  return (
    <div 
        onClick={() => onClick(mapData)}
        className="relative group bg-slate-800/80 border border-slate-600 rounded-xl p-4 cursor-pointer hover:bg-slate-700 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
    >
        {/* Top Section with Image and Info */}
        <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-slate-900 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden relative">
                 {/* Image */}
                 {mapData.imageUrl ? (
                     <img src={mapData.imageUrl} alt={mapData.name} className="w-full h-full object-cover" />
                 ) : (
                     <span className="text-4xl">🗺️</span>
                 )}
            </div>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-start">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{mapData.name}</h3>
                    {/* Recommended Level Badge - Text Version */}
                    <span className="px-1.5 py-0.5 bg-yellow-900/40 border border-yellow-600/50 text-yellow-200 text-[10px] font-bold rounded whitespace-nowrap">
                        推薦等級 Lv.{mapData.recommendedLevel ?? 1}
                    </span>
                </div>
                
                {/* Field Effect Display */}
                {mapData.fieldEffect && (
                    <div className="mb-1">
                        <span className="text-[10px] text-purple-300 bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-500/30 inline-flex items-center gap-1">
                            ⚡ {mapData.fieldEffect} {mapData.fieldEffectChance ? `(${mapData.fieldEffectChance}%)` : ''}
                        </span>
                    </div>
                )}

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-auto">{mapData.description || '未知區域'}</p>
            </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-slate-200 text-sm">{mapData.buddies?.length || 0}</span>
                <span className="text-[10px] mt-0.5">夥伴</span>
            </div>
            <div className="w-px h-6 bg-slate-700/80"></div>
            <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-slate-200 text-sm">{mapData.dropItemIds?.length || 0}</span>
                <span className="text-[10px] mt-0.5">掉落物</span>
            </div>
            <div className="w-px h-6 bg-slate-700/80"></div>
            <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-amber-200 text-sm">{mapData.rewardItemIds?.length || 0}</span>
                <span className="text-[10px] mt-0.5">獎勵</span>
            </div>
        </div>

        {isDevMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 backdrop-blur-sm z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(mapData); }} 
            className="p-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(mapData.id); }} 
            className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdventureMapCard;
