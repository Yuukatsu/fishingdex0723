
import React from 'react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  isDevMode: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onClick?: (item: Item) => void;
  onDragStart?: (e: React.DragEvent, item: Item) => void;
  onDrop?: (e: React.DragEvent, targetItem: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isDevMode, onEdit, onDelete, onClick, onDragStart, onDrop }) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDevMode || !onDragStart) return;
    onDragStart(e, item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDevMode) return;
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isDevMode || !onDrop) return;
    e.preventDefault();
    onDrop(e, item);
  };

  return (
    <div 
        draggable={isDevMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onClick && onClick(item)}
        className={`bg-slate-800/80 border rounded-xl p-4 flex gap-4 transition-all group relative shadow-sm hover:-translate-y-1 hover:shadow-lg hover:bg-slate-800 
        ${item.isRare ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-700'}
        ${isDevMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
    >
      {/* Image Container - Pixel Art Optimized */}
      <div className={`w-20 h-20 bg-slate-900 rounded-lg border flex-shrink-0 flex items-center justify-center p-2 relative ${item.isRare ? 'border-amber-500/40' : 'border-slate-600'}`}>
        {item.isRare && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse"></div>}
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-contain [image-rendering:pixelated] pointer-events-none" // prevent image drag interfering with card drag
          />
        ) : (
          <span className="text-3xl select-none">📦</span>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="mb-auto">
            <h3 className="font-bold text-slate-200 text-base mb-1 truncate flex items-center gap-2">
                {item.name}
                {item.isRare && (
                    <span className="px-1.5 py-0.5 text-[10px] leading-none font-bold bg-amber-500 text-black rounded shadow-sm flex-shrink-0">
                        稀有
                    </span>
                )}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        
        {/* Source Tag - Fixed layout to prevent squashing */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
             <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600 whitespace-nowrap flex-shrink-0">
                 來源
             </span>
             <span className="text-xs text-amber-200/90 truncate font-medium">
                 {item.source || '未知'}
             </span>
        </div>
      </div>

      {/* Dev Controls */}
      {isDevMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5 backdrop-blur-sm z-10">
          <div className="p-1.5 text-slate-400 cursor-grab" title="拖曳排序">
             ⋮⋮
          </div>
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
