
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
        className="relative group bg-slate-800/80 border border-slate-600 rounded-xl p-6 cursor-pointer hover:bg-slate-700 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                 <span className="text-4xl">🗺️</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{mapData.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{mapData.description || '未知區域'}</p>
            </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg">
            <div className="flex flex-col items-center">
                <span className="font-bold text-slate-300">{mapData.buddies?.length || 0}</span>
                <span>夥伴</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex flex-col items-center">
                <span className="font-bold text-slate-300">{mapData.dropItemIds?.length || 0}</span>
                <span>掉落物</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex flex-col items-center">
                <span className="font-bold text-slate-300">{mapData.rewardItemIds?.length || 0}</span>
                <span>通關獎勵</span>
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
