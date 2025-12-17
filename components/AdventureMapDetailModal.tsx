
import React from 'react';
import { AdventureMap, Item } from '../types';

interface AdventureMapDetailModalProps {
  mapData: AdventureMap;
  onClose: () => void;
  itemList: Item[];
}

const AdventureMapDetailModal: React.FC<AdventureMapDetailModalProps> = ({ mapData, onClose, itemList }) => {
  
  const renderItemList = (title: string, ids: string[], emptyText: string) => (
      <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 border-l-4 border-blue-500 pl-2">{title}</h4>
          {ids.length === 0 ? (
              <p className="text-slate-500 text-sm italic pl-2">{emptyText}</p>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ids.map(id => {
                      const item = itemList.find(i => i.id === id);
                      return (
                          <div key={id} className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-900 rounded flex-shrink-0 flex items-center justify-center border border-slate-600">
                                  {item?.imageUrl ? (
                                      <img src={item.imageUrl} className="w-6 h-6 object-contain [image-rendering:pixelated]" />
                                  ) : (
                                      <span className="text-xs">?</span>
                                  )}
                              </div>
                              <span className="text-xs text-slate-200 truncate font-medium">{item?.name || id}</span>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start">
             <div className="flex gap-4">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl border border-slate-700 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🗺️</span>
                 </div>
                 <div>
                     <h2 className="text-2xl font-bold text-white mb-1">{mapData.name}</h2>
                     <p className="text-slate-400 text-sm">{mapData.description || "探索這個區域來發現稀有的夥伴與寶藏。"}</p>
                 </div>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
            {/* Buddies Section */}
            <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 border-l-4 border-amber-500 pl-2">🤝 可遇見的夥伴</h4>
                {(!mapData.buddies || mapData.buddies.length === 0) ? (
                    <p className="text-slate-500 text-sm italic pl-2">此區域目前沒有發現夥伴</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {mapData.buddies.map((buddy, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition">
                                <div className="w-16 h-16 bg-slate-900 rounded-lg mb-2 flex items-center justify-center border border-slate-600 overflow-hidden">
                                    {buddy.imageUrl ? (
                                        <img src={buddy.imageUrl} alt={buddy.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                    ) : (
                                        <span className="text-2xl">👤</span>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-200 text-center">{buddy.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-slate-800 mb-6"></div>

            {/* Drop Items */}
            {renderItemList("📦 掉落道具", mapData.dropItemIds || [], "此區域沒有掉落物")}

            {/* Reward Items */}
            {renderItemList("🏆 通關獎勵", mapData.rewardItemIds || [], "此區域沒有通關獎勵")}
            
        </div>
      </div>
    </div>
  );
};

export default AdventureMapDetailModal;
