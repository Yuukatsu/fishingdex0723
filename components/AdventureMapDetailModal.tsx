
import React, { useState } from 'react';
import { AdventureMap, Item, AdventureMapItem } from '../types';

interface AdventureMapDetailModalProps {
  mapData: AdventureMap;
  onClose: () => void;
  itemList: Item[];
  onItemClick: (item: Item) => void;
}

const AdventureMapDetailModal: React.FC<AdventureMapDetailModalProps> = ({ mapData, onClose, itemList, onItemClick }) => {
  const [isBuddiesExpanded, setIsBuddiesExpanded] = useState(false);
  
  const renderItemList = (title: string, items: AdventureMapItem[], emptyText: string, borderColor: string) => (
      <div className="mb-8">
          <h4 className={`text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2`}>
              <span className={`w-1.5 h-6 rounded-full ${borderColor}`}></span>
              {title}
              <span className="text-xs font-normal text-slate-500 ml-1">({items.length})</span>
          </h4>
          {items.length === 0 ? (
              <div className="text-slate-500 text-sm italic pl-4 py-4 bg-slate-900/30 rounded-lg border border-slate-800/50">{emptyText}</div>
          ) : (
              // Dense Item Grid
              <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {items.map(mapItem => {
                      const id = typeof mapItem === 'string' ? mapItem : mapItem.id; // Compatibility check
                      const isLowRate = typeof mapItem === 'object' ? mapItem.isLowRate : false;
                      const item = itemList.find(i => i.id === id);

                      return (
                          <div 
                              key={id} 
                              onClick={() => item && onItemClick(item)}
                              className="bg-slate-800/60 p-2 rounded-lg border border-slate-700 flex flex-col items-center gap-1.5 hover:bg-slate-800 hover:border-slate-500 transition group cursor-pointer relative"
                          >
                              {isLowRate && (
                                  <div className="absolute top-1 right-1 z-10 px-1 py-0.5 bg-red-600/90 text-white text-[9px] rounded font-bold shadow-sm">
                                      低機率
                                  </div>
                              )}
                              <div className="w-10 h-10 bg-slate-900 rounded-md flex-shrink-0 flex items-center justify-center border border-slate-600/50 shadow-sm overflow-hidden mt-1">
                                  {item?.imageUrl ? (
                                      <img src={item.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                  ) : (
                                      <span className="text-xs text-slate-500">?</span>
                                  )}
                              </div>
                              <span className="text-[10px] text-slate-300 text-center leading-tight line-clamp-2 w-full h-8 flex items-center justify-center font-medium group-hover:text-white">
                                  {item?.name || id}
                              </span>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
  );

  // Normalize data for rendering (in case old data still exists in state before refresh)
  const safeDrops: AdventureMapItem[] = (mapData.dropItemIds || []).map((i: any) => 
    typeof i === 'string' ? { id: i, isLowRate: false } : i
  );
  const safeRewards: AdventureMapItem[] = (mapData.rewardItemIds || []).map((i: any) => 
    typeof i === 'string' ? { id: i, isLowRate: false } : i
  );

  // Buddy Logic
  const BUDDY_LIMIT = 20;
  const totalBuddies = mapData.buddies?.length || 0;
  const visibleBuddies = isBuddiesExpanded ? mapData.buddies : mapData.buddies.slice(0, BUDDY_LIMIT);
  const hiddenCount = totalBuddies - visibleBuddies.length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Keeps stable height */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-start relative overflow-hidden flex-shrink-0">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="flex gap-5 items-center relative z-10">
                 <div className="w-20 h-20 bg-slate-900 rounded-xl border-2 border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0 relative group">
                    {mapData.imageUrl ? (
                        <img src={mapData.imageUrl} alt={mapData.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl">🗺️</span>
                    )}
                 </div>
                 <div>
                     <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h2 className="text-3xl font-bold text-white tracking-tight">{mapData.name}</h2>
                        {/* Recommended Level Badge */}
                        <span className="px-2 py-0.5 bg-yellow-900/40 border border-yellow-600/50 text-yellow-200 text-xs font-bold rounded">
                            Lv.{mapData.recommendedLevel ?? 1}
                        </span>
                     </div>
                     
                     {/* Field Effect Display */}
                     {mapData.fieldEffect && (
                         <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                                 <span>⚡ 場地效果:</span>
                                 <span>{mapData.fieldEffect}</span>
                             </span>
                             {mapData.fieldEffectChance !== undefined && mapData.fieldEffectChance > 0 && (
                                 <span className="text-xs text-purple-300/80">
                                     (機率: {mapData.fieldEffectChance}%)
                                 </span>
                             )}
                         </div>
                     )}
                 </div>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center z-10">✕</button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Description Moved Here */}
            {mapData.description && (
                <div className="mb-6 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <p className="text-slate-300 text-sm leading-relaxed">{mapData.description}</p>
                </div>
            )}

            {/* Buddies Section */}
            <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-green-500"></span>
                    可遇見的夥伴
                    <span className="text-xs font-normal text-slate-500 ml-1">({totalBuddies})</span>
                </h4>
                
                {(!mapData.buddies || mapData.buddies.length === 0) ? (
                    <div className="text-slate-500 text-sm italic pl-4 py-4 bg-slate-900/30 rounded-lg border border-slate-800/50">此區域目前沒有發現夥伴</div>
                ) : (
                    <div>
                        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 gap-3">
                            {visibleBuddies.map((buddy, idx) => (
                                <div key={idx} className="aspect-square bg-slate-800/80 rounded-lg border border-slate-700/80 hover:border-green-400 hover:bg-slate-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center p-1 group relative overflow-hidden">
                                    {buddy.imageUrl ? (
                                        <img src={buddy.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated] group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <span className="text-xl">👤</span>
                                    )}
                                </div>
                            ))}
                            
                            {/* Visual indicator for hidden items if not expanded and count > 0 */}
                            {!isBuddiesExpanded && hiddenCount > 0 && (
                                <div 
                                    onClick={() => setIsBuddiesExpanded(true)}
                                    className="aspect-square bg-slate-800/40 border border-slate-700 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-slate-500 transition group"
                                >
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white">+{hiddenCount}</span>
                                    <span className="text-[10px] text-slate-500">更多</span>
                                </div>
                            )}
                        </div>

                        {/* Show More / Show Less Toggle */}
                        {totalBuddies > BUDDY_LIMIT && (
                            <button 
                                onClick={() => setIsBuddiesExpanded(!isBuddiesExpanded)}
                                className="w-full mt-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition flex items-center justify-center gap-1"
                            >
                                {isBuddiesExpanded ? (
                                    <><span>🔼</span> 收起列表</>
                                ) : (
                                    <><span>🔽</span> 展開全部 ({totalBuddies})</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-slate-800 mb-8"></div>

            {/* Drop Items */}
            {renderItemList("📦 掉落道具", safeDrops, "此區域沒有掉落物", "bg-blue-500")}

            {/* Reward Items */}
            {renderItemList("🏆 通關獎勵", safeRewards, "此區域沒有通關獎勵", "bg-amber-500")}
            
        </div>
      </div>
    </div>
  );
};

export default AdventureMapDetailModal;
