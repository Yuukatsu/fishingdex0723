
import React from 'react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  isDevMode: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isDevMode, onEdit, onDelete }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 flex gap-4 hover:bg-slate-800 transition-colors group relative shadow-sm">
      {/* Image Container - Pixel Art Optimized */}
      <div className="w-16 h-16 bg-slate-900 rounded-md border border-slate-600 flex-shrink-0 flex items-center justify-center p-1">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-contain [image-rendering:pixelated]" 
          />
        ) : (
          <span className="text-2xl">📦</span>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-slate-200 text-sm mb-0.5 truncate">{item.name}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-1 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-1 mt-auto">
             <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">來源</span>
             <span className="text-[10px] text-amber-200 truncate">{item.source || '未知'}</span>
        </div>
      </div>

      {/* Dev Controls */}
      {isDevMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 backdrop-blur-sm">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
            className="p-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
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

export default ItemCard;
