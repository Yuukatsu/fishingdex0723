
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
        className={`relative group border rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 ${mapData.isEX ? 'bg-slate-900 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:border-red-500' : 'bg-slate-800/80 border-slate-600 hover:bg-slate-700 hover:border-blue-500'}`}
    >
        {/* EX Badge Overlay */}
        {mapData.isEX && (
            <div className="absolute top-[-8px] right-[-8px] z-20">
                <div className="bg-gradient-to-br from-red-600 to-red-800 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg border border-red-400 animate-pulse">
                    EX
                </div>
            </div>
        )}

        {/* Top Section with Image and Info */}
        <div className="flex items-start gap-4">
            <div className={`w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner overflow-hidden relative ${mapData.isEX ? 'bg-slate-950 border-red-900' : 'bg-slate-900 border-slate-700'}`}>
                 {/* Image */}
                 {mapData.imageUrl ? (
                     <img src={mapData.imageUrl} alt={mapData.name} className="w-full h-full object-cover" />
                 ) : (
                     <span className="text-4xl">🗺️</span>
                 )}
            </div>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-start">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-lg font-bold truncate ${mapData.isEX ? 'text-red-400' : 'text-white'}`}>{mapData.name}</h3>
                    {/* Recommended Level Badge - Text Version */}
                    <span className={`px-1.5 py-0.5 border text-[10px] font-bold rounded whitespace-nowrap ${mapData.isEX ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-yellow-900/40 border-yellow-600/50 text-yellow-200'}`}>
                        Lv.{mapData.recommendedLevel ?? 1}
                    </span>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-auto">{mapData.description || '未知區域'}</p>
            </div>
        </div>

        {/* Stats Row */}
        <div className={`flex justify-between items-center text-xs text-slate-400 p-3 rounded-lg border ${mapData.isEX ? 'bg-black/50 border-red-900/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
            <div className="flex flex-col items-center flex-1">
                <span className={`font-bold text-sm ${mapData.isEX ? 'text-red-300' : 'text-slate-200'}`}>{mapData.buddies?.length || 0}</span>
                <span className="text-[10px] mt-0.5">夥伴</span>
            </div>
            <div className="w-px h-6 bg-slate-700/80"></div>
            <div className="flex flex-col items-center flex-1">
                <span className={`font-bold text-sm ${mapData.isEX ? 'text-red-300' : 'text-slate-200'}`}>{mapData.dropItemIds?.length || 0}</span>
                <span className="text-[10px] mt-0.5">掉落物</span>
            </div>
            <div className="w-px h-6 bg-slate-700/80"></div>
            <div className="flex flex-col items-center flex-1">
                <span className={`font-bold text-sm ${mapData.isEX ? 'text-amber-400' : 'text-amber-200'}`}>{mapData.rewardItemIds?.length || 0}</span>
                <span className="text-[10px] mt-0.5">獎勵</span>
            </div>
        </div>

        {isDevMode && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 backdrop-blur-sm z-10">
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
