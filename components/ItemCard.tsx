
import React, { useState, useEffect } from 'react';
import { Item, ItemType, ItemCategory } from '../types';

interface ItemCardProps {
  item: Item;
  isDevMode: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onClick?: (item: Item) => void;
  onDragStart?: (e: React.DragEvent, item: Item) => void;
  onDrop?: (e: React.DragEvent, targetItem: Item) => void;
  itemList?: Item[]; // Needed for Bundle image cycling
  compact?: boolean; // Small size mode
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isDevMode, onEdit, onDelete, onClick, onDragStart, onDrop, itemList = [], compact = false }) => {
  const [displayImage, setDisplayImage] = useState<string>('');
  const [isPerfectView, setIsPerfectView] = useState(false);
  
  // Determine properties
  const isTackle = item.type === ItemType.Tackle;
  const isBundle = item.category === ItemCategory.Bundle;
  const isLunchBox = item.type === ItemType.LunchBox;
  
  // Image Cycling Logic for Bundles
  useEffect(() => {
      if (isPerfectView && item.perfectQualityImageUrl) {
          setDisplayImage(item.perfectQualityImageUrl);
          return;
      }
      
      if (isBundle && item.bundleContentIds && item.bundleContentIds.length > 0) {
          let currentIndex = 0;
          
          // Helper to get image URL from ID
          const getImg = (id: string) => itemList.find(i => i.id === id)?.imageUrl || '';
          
          // Initial set
          const firstImg = getImg(item.bundleContentIds[0]);
          setDisplayImage(firstImg || item.imageUrl || '');

          if (item.bundleContentIds.length > 1) {
              const interval = setInterval(() => {
                  currentIndex = (currentIndex + 1) % item.bundleContentIds!.length;
                  const nextImg = getImg(item.bundleContentIds![currentIndex]);
                  // If content item has no image, fallback to bundle's own image or stay empty
                  setDisplayImage(nextImg || item.imageUrl || '');
              }, 1500); // Cycle every 1.5 seconds
              return () => clearInterval(interval);
          }
      } else {
          setDisplayImage(item.imageUrl || '');
      }
  }, [item, isBundle, itemList, isPerfectView]);

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

  // Determine border and glow effects
  const borderClass = item.isRare 
      ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      : isTackle 
        ? 'border-cyan-700/50 hover:border-cyan-500' 
        : isBundle
            ? 'border-indigo-500/50 hover:border-indigo-400 border-dashed bg-indigo-900/10'
            : isLunchBox
                ? 'border-orange-700/40 hover:border-orange-500'
                : 'border-slate-700';
  
  const bgClass = isTackle ? 'bg-slate-800/90' : 'bg-slate-800/80';

  // Tackle Stats Logic
  const hasTensile = (item.tensileStrength || 0) > 0;
  const hasDurability = (item.durability || 0) > 0;
  const hasLuck = (item.luck || 0) > 0;
  const showStatsRow = isTackle && (hasTensile || hasDurability || hasLuck);

  // Bundle Names Helpers
  const getNames = (ids?: string[]) => {
      if (!ids || ids.length === 0) return '無';
      return ids.map(id => itemList.find(i => i.id === id)?.name || id).join('、');
  };

  return (
    <div 
        draggable={isDevMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onClick && onClick(item)}
        className={`${bgClass} border ${compact ? 'rounded-lg p-2 gap-2' : 'rounded-xl p-4 gap-4'} flex transition-all group relative shadow-sm hover:-translate-y-1 hover:shadow-lg hover:bg-slate-800 
        ${borderClass}
        ${isDevMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        `}
    >
      {/* Image Container - Pixel Art Optimized */}
      <div className={`${compact ? 'w-12 h-12 p-1' : 'w-20 h-20 p-2'} bg-slate-900 rounded-lg border flex-shrink-0 flex items-center justify-center relative overflow-hidden ${item.isRare ? 'border-amber-500/40' : 'border-slate-600'}`}>
        {item.isRare && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse"></div>}
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={item.name} 
            key={displayImage} // Force re-render for animation if needed, though src change handles it
            className={`w-full h-full object-contain [image-rendering:pixelated] pointer-events-none transition-opacity duration-300`}
          />
        ) : (
          <span className={`${compact ? 'text-xl' : 'text-3xl'} select-none`}>{isTackle ? '🎣' : isBundle ? '🧺' : isLunchBox ? '🍱' : '📦'}</span>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0 flex flex-col h-full justify-center">
        <div className="mb-auto">
            <h3 className={`font-bold ${isPerfectView ? 'text-fuchsia-300' : 'text-slate-200'} ${compact ? 'text-sm' : 'text-base mb-1'} truncate flex items-center gap-2`}>
                {isPerfectView ? (item.perfectQualityName || `${item.name} (完美)`) : item.name}
                {item.isRare && !compact && (
                    <span className="px-1.5 py-0.5 text-[10px] leading-none font-bold bg-amber-500 text-black rounded shadow-sm flex-shrink-0">
                        稀有
                    </span>
                )}
                {isBundle && !compact && (
                    <span className="px-1.5 py-0.5 text-[10px] leading-none font-bold bg-indigo-600 text-white rounded shadow-sm flex-shrink-0">
                        集合
                    </span>
                )}
                {isPerfectView && compact && (
                    <span className="px-1.5 py-0.5 text-[10px] leading-none font-bold text-fuchsia-300 border border-fuchsia-800 rounded bg-fuchsia-950/30 flex-shrink-0">
                        完美
                    </span>
                )}
            </h3>
            
            {/* Tackle Stats Row */}
            {showStatsRow && !compact && (
                <div className="flex items-center gap-3 mb-2 text-xs font-mono bg-slate-950/30 p-1.5 rounded border border-white/5">
                    {hasTensile && (
                        <div className="flex items-center gap-1 text-red-300" title="拉扯力">
                            <span>💪</span>{item.tensileStrength}
                        </div>
                    )}
                    {hasDurability && (
                        <div className="flex items-center gap-1 text-blue-300" title="耐久度">
                            <span>🛡️</span>{item.durability}
                        </div>
                    )}
                    {hasLuck && (
                        <div className="flex items-center gap-1 text-green-300" title="幸運值">
                            <span>🍀</span>{item.luck}
                        </div>
                    )}
                </div>
            )}
            
            {/* Tackle Extra Effect */}
            {isTackle && item.extraEffect && !compact && (
                <p className={`text-[10px] mb-1 line-clamp-1 ${item.extraEffectIsNegative ? 'text-red-400' : 'text-cyan-200'}`}>
                    ⚡ {item.extraEffect}
                </p>
            )}

            {/* LunchBox Info Row */}
            {isLunchBox && !compact && (
                <div className="flex flex-col gap-1.5 mb-2 mt-1">
                    {/* Satiety & Flavors */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isPerfectView ? 'bg-fuchsia-900/30 border-fuchsia-700/30' : 'bg-orange-900/30 border-orange-700/30'}`} title={isPerfectView ? "完美美味度" : "美味度"}>
                            <span className="text-[10px]">🍗</span>
                            <span className={`text-xs font-bold ${isPerfectView ? 'text-fuchsia-300' : 'text-orange-200'}`}>
                                {isPerfectView ? (item.perfectQualitySatiety ?? item.satiety ?? 0) : (item.satiety ?? 0)}
                            </span>
                        </div>
                        {(isPerfectView ? (item.perfectQualityExtraBonus ?? item.extraBonus) : item.extraBonus) !== undefined && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isPerfectView ? 'bg-fuchsia-900/30 border-fuchsia-700/30' : 'bg-teal-900/30 border-teal-700/30'}`} title={isPerfectView ? "完美額外加成" : "額外加成"}>
                                <span className="text-[10px]">✨</span>
                                <span className={`text-xs font-bold ${isPerfectView ? 'text-fuchsia-300' : 'text-teal-200'}`}>
                                    {isPerfectView ? (item.perfectQualityExtraBonus ?? item.extraBonus) : item.extraBonus}
                                </span>
                            </div>
                        )}
                        {item.flavors?.map(f => (
                            <span key={f} className="text-[10px] bg-pink-900/20 text-pink-300 px-1.5 py-0.5 rounded border border-pink-700/30">
                                {f}
                            </span>
                        ))}
                    </div>
                    
                    {/* Food Categories */}
                    {item.foodCategories && item.foodCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {item.foodCategories.map(c => (
                                <span key={c} className="text-[9px] bg-slate-950/50 text-amber-200/70 px-1.5 py-0.5 rounded border border-slate-700">
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Description Logic - Explicit Check */}
            {!compact && (isBundle ? (
                <div className="text-xs space-y-1.5 mt-1">
                    <p className="text-indigo-200 line-clamp-2 leading-relaxed">
                        <span className="font-bold text-indigo-400 bg-indigo-900/30 px-1 rounded mr-1">包含</span> 
                        {getNames(item.bundleContentIds)}
                    </p>
                    {item.bundleSubstituteIds && item.bundleSubstituteIds.length > 0 && (
                        <p className="text-slate-400 line-clamp-1 leading-relaxed">
                            <span className="font-bold text-slate-500 bg-slate-700/30 px-1 rounded mr-1">可替換</span> 
                            {getNames(item.bundleSubstituteIds)}
                        </p>
                    )}
                </div>
            ) : (
                <p className={`text-xs line-clamp-2 leading-relaxed ${isPerfectView ? 'text-fuchsia-200/80' : 'text-slate-400'}`}>
                    {isPerfectView ? (item.perfectQualityDescription || item.description) : item.description}
                </p>
            ))}
        </div>
        
        {/* Source Tag & Perfect Toggle - Hidden for Bundles */}
        {!isBundle && !compact && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
                 <div className="flex items-center gap-2 min-w-0">
                     <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600 whitespace-nowrap flex-shrink-0">
                         來源
                     </span>
                     <span className="text-xs text-amber-200/90 truncate font-medium max-w-[100px]">
                         {item.source || '未知'}
                     </span>
                 </div>
                 
                 {item.hasPerfectQuality && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPerfectView(!isPerfectView); }}
                        className={`ml-auto text-[10px] px-2 py-0.5 rounded border transition-colors flex-shrink-0 ${isPerfectView ? 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-700 shadow-[0_0_5px_rgba(217,70,239,0.3)]' : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-fuchsia-300'}`}
                    >
                        {isPerfectView ? '✨ 完美版本' : '一般版本'}
                    </button>
                 )}
            </div>
        )}
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
