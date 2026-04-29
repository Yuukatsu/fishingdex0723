import React from 'react';
import { EncounterPartner, Item } from '../types';
import ItemCard from './ItemCard';

interface EncounterDetailModalProps {
  partner: EncounterPartner;
  onClose: () => void;
  isDevMode: boolean;
  onEdit: (partner: EncounterPartner) => void;
  onDelete: (id: string) => void;
  itemList: Item[];
  onItemClick: (item: Item, tab?: 'normal' | 'perfect') => void;
}

const EncounterDetailModal: React.FC<EncounterDetailModalProps> = ({ partner, onClose, isDevMode, onEdit, onDelete, itemList, onItemClick }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image Area */}
        <div className="relative h-64 bg-slate-800 flex items-center justify-center p-6 border-b border-slate-700">
            {partner.imageUrl ? (
                <img src={partner.imageUrl} alt={partner.name} className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            ) : (
                <span className="text-6xl">❓</span>
            )}
            
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-sm z-10">✕</button>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-indigo-600/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-indigo-500 shadow-lg backdrop-blur-sm">
                    {partner.scene}
                </span>
                <span className="bg-slate-900/90 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-700 shadow-lg backdrop-blur-sm">
                    {partner.rarity}
                </span>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{partner.name}</h2>
                    {partner.partnerId && <div className="text-slate-400 font-mono text-sm tracking-wider">{partner.partnerId}</div>}
                </div>
            </div>

            <div className="space-y-4">
                {/* Egg Groups */}
                {((partner.eggGroups && partner.eggGroups.length > 0) || partner.eggGroup) && (
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">蛋群</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {partner.eggGroups && partner.eggGroups.map((egg, i) => (
                                <span key={`egg-${i}`} className="bg-slate-800/80 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{egg}</span>
                            ))}
                            {partner.eggGroup && !(partner.eggGroups && partner.eggGroups.includes(partner.eggGroup)) && (
                                <span className="bg-slate-800/80 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{partner.eggGroup}</span>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Flavors Grid */}
                {(partner.likedFlavors.length > 0 || partner.dislikedFlavors.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                        {partner.likedFlavors.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">喜歡的口味</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {partner.likedFlavors.map((flavor, i) => (
                                        <span key={i} className="bg-orange-900/30 text-orange-200 px-2 py-1 rounded text-xs border border-orange-700/30">{flavor}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {partner.dislikedFlavors.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">討厭的口味</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {partner.dislikedFlavors.map((flavor, i) => (
                                        <span key={i} className="bg-cyan-900/30 text-cyan-200 px-2 py-1 rounded text-xs border border-cyan-700/30">{flavor}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Drop Items */}
                {partner.dropItems.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 mt-2">可能會掉落</h3>
                        <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {partner.dropItems.map((drop, i) => {
                                    const foundBaseItem = itemList.find(it => it.name === drop.name || (it.hasPerfectQuality && it.perfectQualityName === drop.name));
                                    if (foundBaseItem) {
                                        let displayItem = foundBaseItem;
                                        let isPerfect = false;
                                        // If the user selected the perfect item name
                                        if (foundBaseItem.hasPerfectQuality && foundBaseItem.perfectQualityName === drop.name) {
                                            isPerfect = true;
                                            displayItem = {
                                                ...foundBaseItem,
                                                name: foundBaseItem.perfectQualityName,
                                                description: foundBaseItem.perfectQualityDescription || foundBaseItem.description,
                                                imageUrl: foundBaseItem.perfectQualityImageUrl || foundBaseItem.imageUrl
                                            };
                                        }

                                        return (
                                            <div key={i} onClick={() => onItemClick(foundBaseItem, isPerfect ? 'perfect' : 'normal')} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                                                <div className="w-8 h-8 bg-black/30 rounded flex items-center justify-center flex-shrink-0">
                                                    {displayItem.imageUrl ? (
                                                         <img src={displayItem.imageUrl} className="w-6 h-6 object-contain [image-rendering:pixelated]" />
                                                    ) : <span className="text-xs text-slate-500">?</span>}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs text-slate-300 truncate">{displayItem.name}</span>
                                                    <span className="text-xs text-yellow-500 font-bold">x {drop.quantity}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={i} className="bg-slate-800 rounded p-2 text-sm text-green-100 flex items-center justify-between border border-slate-700">
                                            <span>{drop.name}</span>
                                            <span className="text-green-400 font-bold text-xs">x{drop.quantity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dev Controls */}
            {isDevMode && (
                <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end gap-2">
                    <button onClick={() => { onEdit(partner); onClose(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm transition">
                        編輯
                    </button>
                    <button onClick={() => { onDelete(partner.id); onClose(); }} className="px-4 py-2 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white rounded font-bold text-sm transition border border-red-800 hover:border-red-600">
                        刪除
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EncounterDetailModal;
