import React from 'react';
import { Item, AdventureMap, EncounterPartner, Fish, DispatchJob, ShopSettings } from '../types';

interface ItemSourceModalProps {
    item: Item;
    onClose: () => void;
    mapList: AdventureMap[];
    encounterList: EncounterPartner[];
    fishList: Fish[];
    dispatchList: DispatchJob[];
    shopSettings: ShopSettings;
    onMapClick: (map: AdventureMap) => void;
    onEncounterClick: (encounter: EncounterPartner) => void;
    onFishClick: (fish: Fish) => void;
}

const ItemSourceModal: React.FC<ItemSourceModalProps> = ({ 
    item, 
    onClose, 
    mapList, 
    encounterList, 
    fishList, 
    dispatchList,
    shopSettings,
    onMapClick,
    onEncounterClick,
    onFishClick
}) => {
    // Determine sources
    const matchedMaps = mapList.filter(map => 
        map.dropItemIds?.some(i => i.id === item.id) || 
        map.rewardItemIds?.some(i => i.id === item.id) || 
        map.possibleHeldItems?.some(i => i.id === item.id)
    );

    const matchedEncounters = encounterList.filter(enc => 
        enc.dropItems?.some(d => d.name === item.name)
    );

    const matchedFishes = fishList.filter(f => 
        f.dropItemIds?.some(id => id === item.id)
    );

    // Dispatch needs to check requests
    const matchedDispatches = dispatchList.filter(d => {
        let match = false;
        if (d.normalDrops?.some(i => i.id === item.id) || d.greatDrops?.some(i => i.id === item.id) || d.specialDrops?.some(i => i.id === item.id) || d.hiddenDrops?.some(i => i.id === item.id) || d.badDrops?.some(i => i.id === item.id)) match = true;
        
        if (d.requests) {
            d.requests.forEach(r => {
                if (r.rewardsNormal?.some(i => i.id === item.id) || r.rewardsGreat?.some(i => i.id === item.id) || r.rewardsSuper?.some(i => i.id === item.id)) match = true;
            });
        }
        return match;
    });

    const goToExchange = () => {
        onClose();
        if (shopSettings?.exchange?.url) {
            window.open(shopSettings.exchange.url, '_blank');
        } else {
            alert("目前未設定交換所連結");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/80 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-200">
                        📍 獲取來源: <span className="text-amber-300">{item.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white">✕</button>
                </div>
                
                <div className="p-4 overflow-y-auto space-y-4">
                    {/* Maps */}
                    {matchedMaps.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-green-300 mb-2 border-b border-green-900/50 pb-1">🗺️ 夥伴大冒險</h3>
                            <div className="flex flex-wrap gap-2">
                                {matchedMaps.map(m => (
                                    <button 
                                        key={m.id} 
                                        onClick={() => { onClose(); onMapClick(m); }}
                                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-green-700 border border-slate-600 hover:border-green-500 rounded transition-colors text-slate-300 hover:text-white"
                                    >
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Encounters */}
                    {matchedEncounters.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-orange-300 mb-2 border-b border-orange-900/50 pb-1">🐾 隨機遭遇</h3>
                            <div className="flex flex-wrap gap-2">
                                {matchedEncounters.map(e => (
                                    <button 
                                        key={e.id} 
                                        onClick={() => { onClose(); onEncounterClick(e); }}
                                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-orange-700 border border-slate-600 hover:border-orange-500 rounded transition-colors text-slate-300 hover:text-white"
                                    >
                                        {e.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fish */}
                    {matchedFishes.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-blue-300 mb-2 border-b border-blue-900/50 pb-1">🎣 釣魚</h3>
                            <div className="flex flex-wrap gap-2">
                                {matchedFishes.map(f => (
                                    <button 
                                        key={f.id} 
                                        onClick={() => { onClose(); onFishClick(f); }}
                                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-blue-700 border border-slate-600 hover:border-blue-500 rounded transition-colors text-slate-300 hover:text-white"
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dispatch */}
                    {matchedDispatches.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-yellow-300 mb-2 border-b border-yellow-900/50 pb-1">📦 派遣委託</h3>
                            <div className="flex flex-wrap gap-2">
                                {matchedDispatches.map(d => (
                                    <div key={d.id} className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400">
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exchange */}
                    {item.hasExchangeSource && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-fuchsia-300 mb-2 border-b border-fuchsia-900/50 pb-1">🛒 交換所</h3>
                            <button 
                                onClick={goToExchange}
                                className="px-3 py-1.5 text-xs font-bold bg-fuchsia-900 hover:bg-fuchsia-800 border border-fuchsia-700 rounded transition-colors text-white"
                            >
                                重要道具交換所
                            </button>
                        </div>
                    )}

                    {/* Default Source Text */}
                    {item.source && item.source.trim() !== '' && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-sm font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">📝 其他獲取方式</h3>
                            <p className="text-sm text-slate-300">{item.source}</p>
                        </div>
                    )}

                    {matchedMaps.length === 0 && matchedEncounters.length === 0 && matchedFishes.length === 0 && matchedDispatches.length === 0 && !item.hasExchangeSource && (!item.source || item.source.trim() === '') && (
                        <div className="text-center py-8 text-slate-500">
                            目前沒有已知的獲取來源。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemSourceModal;
