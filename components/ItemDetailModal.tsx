
import React from 'react';
import { Item } from '../types';

interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  isDevMode: boolean; // Added prop
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, isDevMode }) => {
  // Determine border color based on rarity (using generic blue/slate if not rare)
  const borderColorClass = item.isRare 
    ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
    : 'border-slate-600';

  const glowClass = item.isRare
    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-900/20'
    : 'bg-slate-900';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`${glowClass} border ${borderColorClass} rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/80 transition">✕</button>

        {/* Image Section */}
        <div className="w-full h-64 bg-slate-950/50 relative border-b border-slate-700/50 flex items-center justify-center p-8">
            {item.isRare && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent pointer-events-none"></div>
            )}
            <div className={`w-32 h-32 flex items-center justify-center relative ${item.isRare ? 'drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''}`}>
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain [image-rendering:pixelated] scale-150" />
                ) : (
                    <span className="text-6xl">📦</span>
                )}
            </div>
            
            <div className="absolute bottom-4 left-4">
                <span className={`px-2 py-1 text-xs font-bold rounded border ${item.isRare ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                    {item.isRare ? '✨ 稀有素材' : '一般物品'}
                </span>
            </div>
        </div>

        {/* Info Section */}
        <div className="p-6">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{item.type} &gt; {item.category}</span>
                    <h2 className={`text-2xl font-bold ${item.isRare ? 'text-amber-200' : 'text-white'}`}>{item.name}</h2>
                </div>
            </div>
          
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-6">
                <p className="text-slate-300 italic leading-relaxed">"{item.description}"</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm border-t border-slate-800 pt-3">
                    <span className="w-20 text-slate-500 font-bold flex-shrink-0">📍 獲取來源</span>
                    <span className="text-blue-300">{item.source || '未知'}</span>
                </div>
                
                {/* ID Field - Only for Developers */}
                {isDevMode && (
                  <div className="flex items-center gap-3 text-sm border-t border-slate-800 pt-3">
                      <span className="w-20 text-slate-500 font-bold flex-shrink-0">🆔 物品編號</span>
                      <span className="text-slate-400 font-mono">{item.id}</span>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
