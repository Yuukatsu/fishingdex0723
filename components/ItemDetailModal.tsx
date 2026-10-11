
import React, { useState, useEffect } from 'react';
import { Item, ItemType, ItemCategory, AdventureMap, EncounterPartner, Fish, DispatchJob, ITEM_ATTRIBUTE_COLORS } from '../types';

interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  isDevMode: boolean;
  itemList?: Item[]; // Needed to resolve ingredient IDs to Names/Images
  initialTab?: 'normal' | 'perfect';
  onShowSource?: (item: Item) => void;
  mapList?: AdventureMap[];
  encounterList?: EncounterPartner[];
  fishList?: Fish[];
  dispatchList?: DispatchJob[];
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item: initialItem, onClose, isDevMode, itemList = [], initialTab = 'normal', onShowSource, mapList = [], encounterList = [], fishList = [], dispatchList = [] }) => {
  const item = itemList.find(i => i.id === initialItem.id) || initialItem;
  const [copied, setCopied] = useState(false);
  const [displayImage, setDisplayImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'normal' | 'perfect'>(initialTab);
  
  const isBundle = item.category === ItemCategory.Bundle;
  const isHeldItem = item.type === ItemType.HeldItem || (item.type as any) === '攜帶物' || (item.category as any) === '攜帶物';

  // Image Cycling Logic for Bundles
  useEffect(() => {
      if (activeTab === 'perfect' && item.perfectQualityImageUrl) {
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
                  setDisplayImage(nextImg || item.imageUrl || '');
              }, 1500); 
              return () => clearInterval(interval);
          }
      } else {
          setDisplayImage(item.imageUrl || '');
      }
  }, [item, isBundle, itemList, activeTab]);

  // Determine border color based on rarity (using generic blue/slate if not rare)
  const borderColorClass = item.isRare 
    ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
    : item.type === ItemType.Tackle
        ? 'border-cyan-500/50'
        : isBundle
            ? 'border-indigo-500/50'
            : 'border-slate-600';

  const glowClass = item.isRare
    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-900/20'
    : item.type === ItemType.Tackle
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20'
        : isBundle
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/20'
            : 'bg-slate-900';

  const handleCopyCommand = () => {
      const command = `!道具合成 ${item.name}`;
      navigator.clipboard.writeText(command).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  const renderBundleList = (title: string, ids?: string[]) => {
      if (!ids || ids.length === 0) return null;
      return (
          <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{title}</h4>
              <div className="grid grid-cols-4 gap-2">
                  {ids.map(id => {
                      const subItem = itemList.find(i => i.id === id);
                      return (
                          <div key={id} className="bg-slate-800/80 p-2 rounded border border-slate-700 flex flex-col items-center justify-center text-center gap-1 group relative">
                              {subItem?.imageUrl ? (
                                  <img src={subItem.imageUrl} className="w-8 h-8 object-contain [image-rendering:pixelated]" />
                              ) : (
                                  <span className="text-xl">📦</span>
                              )}
                              <span className="text-[10px] text-slate-300 leading-tight line-clamp-2">{subItem?.name || id}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  // Tackle Stats Logic
  const displayResistance = item.resistance ?? item.luck ?? 0;
  const hasTensile = (item.tensileStrength || 0) > 0;
  const hasDurability = (item.durability || 0) > 0;
  const hasResistance = displayResistance > 0;
  const showStatsGrid = item.type === ItemType.Tackle && (hasTensile || hasDurability || hasResistance);
  const showTackleSection = item.type === ItemType.Tackle && (showStatsGrid || item.extraEffect || item.negativeExtraEffect);

  // Enhanceable Tackle Stages Logic
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    setCurrentStageIndex(0);
  }, [item.id]);

  const isEnhanceableTackle = item.type === ItemType.Tackle && !!item.isEnhanceable && Array.isArray(item.enhanceStages) && item.enhanceStages.length > 0;

  const tackleStages = isEnhanceableTackle ? [
    {
      stageIndex: 0,
      title: '基礎階段',
      name: item.name,
      tensileStrength: item.tensileStrength || 0,
      durability: item.durability || 0,
      resistance: displayResistance,
      extraEffect: item.extraEffect,
      negativeExtraEffect: item.negativeExtraEffect,
      recipe: item.recipe || [],
    },
    ...item.enhanceStages!.map((s, idx) => ({
      stageIndex: idx + 1,
      title: `強化階段 ${idx + 1}`,
      name: s.name || `${item.name} +${idx + 1}`,
      tensileStrength: s.tensileStrength ?? item.tensileStrength ?? 0,
      durability: s.durability ?? item.durability ?? 0,
      resistance: s.resistance ?? displayResistance,
      extraEffect: s.extraEffect ?? item.extraEffect,
      negativeExtraEffect: s.negativeExtraEffect ?? item.negativeExtraEffect,
      recipe: s.recipe || [],
    }))
  ] : [];

  const totalStages = isEnhanceableTackle ? tackleStages.length : 1;

  const hasSystemSources = item.hasExchangeSource || 
    fishList.some(f => f.dropItemIds?.includes(item.id)) ||
    mapList.some(map => map.dropItemIds?.some(i => i.id === item.id) || map.rewardItemIds?.some(i => i.id === item.id) || map.possibleHeldItems?.some(i => i.id === item.id) || map.rumoredTreasureItemIds?.some(i => i.id === item.id)) ||
    encounterList.some(enc => enc.dropItems?.some(d => d.name === item.name)) ||
    dispatchList.some(d => {
      let match = false;
      if (d.normalDrops?.some(i => i.id === item.id) || d.greatDrops?.some(i => i.id === item.id) || d.specialDrops?.some(i => i.id === item.id) || d.hiddenDrops?.some(i => i.id === item.id) || d.badDrops?.some(i => i.id === item.id)) match = true;
      if (d.requests) d.requests.forEach(r => {
        if (r.rewardsNormal?.some(i => i.id === item.id) || r.rewardsGreat?.some(i => i.id === item.id) || r.rewardsSuper?.some(i => i.id === item.id)) match = true;
      });
      return match;
    });

  const renderRecipeBlock = (recipeList: typeof item.recipe, targetName: string, stageTitle?: string, sIdx?: number) => {
    if (!recipeList || recipeList.length === 0) {
      if (!isEnhanceableTackle) return null;
      return (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 mb-6 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <span>🛠️ 合成公式</span>
              {stageTitle && <span className="text-[10px] text-cyan-300 font-normal">({stageTitle})</span>}
            </h3>
            {isEnhanceableTackle && (
              <div className="flex items-center gap-1.5">
                {(sIdx ?? 0) > 0 && (
                  <button 
                    onClick={() => setCurrentStageIndex(i => Math.max(0, i - 1))}
                    className="px-2 py-1 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 transition flex items-center gap-1 shadow"
                  >
                    ◀ 上一階段
                  </button>
                )}
                {(sIdx ?? 0) < totalStages - 1 && (
                  <button 
                    onClick={() => setCurrentStageIndex(i => Math.min(totalStages - 1, i + 1))}
                    className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 transition flex items-center gap-1 shadow-md animate-pulse"
                  >
                    下一階段 ▶
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 italic py-2">此階段尚無合成公式</p>
        </div>
      );
    }

    return (
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 mb-6 relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <span>🛠️ 合成公式</span>
            {stageTitle && <span className="text-[10px] text-cyan-300 font-normal">({stageTitle})</span>}
            <span className="h-px flex-1 bg-indigo-900/50"></span>
          </h3>
          {isEnhanceableTackle && (
            <div className="flex items-center gap-1.5 ml-2">
              {(sIdx ?? 0) > 0 && (
                <button 
                  onClick={() => setCurrentStageIndex(i => Math.max(0, i - 1))}
                  className="px-2 py-1 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 transition flex items-center gap-1 shadow"
                  title="回到上一階段"
                >
                  ◀ 上一階段
                </button>
              )}
              {(sIdx ?? 0) < totalStages - 1 && (
                <button 
                  onClick={() => setCurrentStageIndex(i => Math.min(totalStages - 1, i + 1))}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 transition flex items-center gap-1 shadow-md animate-pulse"
                  title="前往下一階段 (強化)"
                >
                  下一階段 ▶
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {recipeList.map((ing, idx) => {
            const ingDetails = itemList.find(i => i.id === ing.itemId);
            const displayName = ing.isPerfectQuality && ingDetails?.hasPerfectQuality ? (ingDetails.perfectQualityName || `${ingDetails.name} (完美)`) : (ingDetails?.name || ing.itemId);
            const displayIngImg = ing.isPerfectQuality && ingDetails?.perfectQualityImageUrl ? ingDetails.perfectQualityImageUrl : ingDetails?.imageUrl;
            
            return (
              <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-700">
                <div className="w-8 h-8 bg-black/30 rounded flex items-center justify-center flex-shrink-0">
                  {displayIngImg ? (
                    <img src={displayIngImg} className="w-6 h-6 object-contain [image-rendering:pixelated]" />
                  ) : <span className="text-xs">?</span>}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-300 truncate">{displayName}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-500 font-bold">x {ing.quantity}</span>
                    {ing.isPerfectQuality && <span className="text-[9px] text-fuchsia-400 border border-fuchsia-900 px-1 rounded bg-fuchsia-950/30">完美</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Copy Command Button */}
        <button 
          onClick={() => {
            const command = `!道具合成 ${targetName}`;
            navigator.clipboard.writeText(command).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className={`w-full py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-600 border-green-500 text-white' : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'}`}
        >
          {copied ? (
            <><span>✅</span> 已複製指令</>
          ) : (
            <><span>📋</span> 複製合成指令 (!道具合成 {targetName})</>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`${glowClass} border ${borderColorClass} rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/80 transition">✕</button>

        {/* Image Section */}
        <div className="w-full h-64 bg-slate-950/50 relative border-b border-slate-700/50 flex items-center justify-center p-8 flex-shrink-0">
            {item.isRare && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent pointer-events-none"></div>
            )}
            <div className={`w-32 h-32 flex items-center justify-center relative ${item.isRare ? 'drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''}`}>
                {displayImage ? (
                    <img 
                        src={displayImage} 
                        alt={item.name} 
                        key={displayImage} // Force animation
                        className="max-w-full max-h-full object-contain [image-rendering:pixelated] scale-150 transition-opacity duration-300" 
                    />
                ) : (
                    <span className="text-6xl">{item.type === ItemType.Tackle ? '🎣' : isBundle ? '🧺' : '📦'}</span>
                )}
            </div>
            
            <div className="absolute bottom-4 left-4">
                <span className={`px-2 py-1 text-xs font-bold rounded border ${item.isRare ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                    {item.isRare ? '✨ 稀有物品' : isBundle ? '📦 集合' : '一般物品'}
                </span>
            </div>
        </div>

        {/* Floating Prev / Next Buttons */}
        {isEnhanceableTackle && currentStageIndex > 0 && (
          <button
            onClick={() => setCurrentStageIndex(i => Math.max(0, i - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/60 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110"
            title="回到上一階段"
          >
            ◀
          </button>
        )}
        {isEnhanceableTackle && currentStageIndex < totalStages - 1 && (
          <button
            onClick={() => setCurrentStageIndex(i => Math.min(totalStages - 1, i + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-cyan-600/95 hover:bg-cyan-500 text-white border border-cyan-400 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 animate-pulse"
            title="前往下一階段 (強化)"
          >
            ▶
          </button>
        )}

        {/* Info Section */}
        {isEnhanceableTackle ? (
          <div className="overflow-hidden w-full relative">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentStageIndex * 100}%)` }}
            >
              {tackleStages.map((stage, sIdx) => {
                const stageHasTensile = (stage.tensileStrength || 0) > 0;
                const stageHasDurability = (stage.durability || 0) > 0;
                const stageHasResistance = (stage.resistance || 0) > 0;
                const stageShowGrid = stageHasTensile || stageHasDurability || stageHasResistance;

                return (
                  <div key={sIdx} className="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-start">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.type} &gt; {item.category}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-900/70 border border-cyan-500/50 text-cyan-200">
                            ⭐ {stage.title} ({sIdx + 1}/{totalStages})
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          {stage.name}
                        </h2>
                      </div>
                    </div>

                    {/* Tackle Stats Grid */}
                    <div className="mb-4 space-y-2">
                      {stageShowGrid && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded-lg border border-cyan-900/30">
                          <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                            <span className="text-xs text-slate-400 mb-1">💪 拉扯力</span>
                            <span className="text-lg font-bold text-red-300">{stage.tensileStrength}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                            <span className="text-xs text-slate-400 mb-1">🛡️ 耐久度</span>
                            <span className="text-lg font-bold text-blue-300">{stage.durability}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                            <span className="text-xs text-slate-400 mb-1">🔰 抵抗力</span>
                            <span className="text-lg font-bold text-emerald-300">{stage.resistance}</span>
                          </div>
                        </div>
                      )}
                      {stage.extraEffect && (
                        <div className="bg-cyan-900/10 border border-cyan-800/30 p-2 rounded-lg flex gap-2">
                          <span className="text-lg">⚡</span>
                          <div>
                            <span className="block text-[10px] text-cyan-400 font-bold uppercase">正面額外效果</span>
                            <span className="text-sm text-cyan-100">{stage.extraEffect}</span>
                          </div>
                        </div>
                      )}
                      {stage.negativeExtraEffect && (
                        <div className="bg-red-900/10 border border-red-800/30 p-2 rounded-lg flex gap-2 mt-2">
                          <span className="text-lg">⚠️</span>
                          <div>
                            <span className="block text-[10px] text-red-400 font-bold uppercase">負面額外效果</span>
                            <span className="text-sm text-red-100">{stage.negativeExtraEffect}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {item.description && item.description.trim() !== '' && (
                      <div className="rounded-xl p-4 border mb-6 bg-slate-950/50 border-slate-800">
                        <p className="text-slate-300 italic leading-relaxed">
                          "{item.description}"
                        </p>
                      </div>
                    )}

                    {/* Crafting Recipe Display for this stage */}
                    {renderRecipeBlock(stage.recipe, stage.name, stage.title, sIdx)}

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm border-t border-slate-800 pt-3">
                        <span className="w-20 text-slate-500 font-bold flex-shrink-0 mt-1">📍 獲取來源</span>
                        {hasSystemSources ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onShowSource && onShowSource(item); }}
                            className="px-3 py-1 bg-indigo-900/50 hover:bg-indigo-700 text-indigo-200 border border-indigo-700/50 rounded transition-colors text-xs font-bold whitespace-nowrap"
                          >
                            獲取來源
                          </button>
                        ) : (
                          <span className="text-blue-300 mt-1">{item.source || '未知'}</span>
                        )}
                      </div>
                    </div>

                    {isDevMode && (
                      <div className="flex items-center gap-3 text-sm border-t border-slate-800 pt-3 mt-3">
                        <span className="w-20 text-slate-500 font-bold flex-shrink-0">🆔 物品編號</span>
                        <span className="text-slate-400 font-mono">{item.id}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{item.type} &gt; {item.category}</span>
                    <h2 className={`text-2xl font-bold ${item.isRare ? 'text-amber-200' : 'text-white'}`}>
                        {activeTab === 'perfect' && item.perfectQualityName ? item.perfectQualityName : item.name}
                    </h2>
                </div>
            </div>

            {/* Item Attribute Display (Only for Held Items) */}
            {isHeldItem && (() => {
                const attr = item.attribute || '無';
                const attrStyle = ITEM_ATTRIBUTE_COLORS[attr] || ITEM_ATTRIBUTE_COLORS['無'];
                return (
                    <div className="flex items-center gap-2 mb-4 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/60 w-fit">
                        <span className="text-xs font-bold text-slate-400">道具屬性：</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${attrStyle.bg} ${attrStyle.text} ${attrStyle.border} shadow-sm`}>
                            {attr}
                        </span>
                    </div>
                );
            })()}

            {/* Bundle Specific Details */}
            {isBundle && (
                <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-4 mb-4">
                    {renderBundleList("📦 包含項目", item.bundleContentIds)}
                    {renderBundleList("🔄 可替換/補充", item.bundleSubstituteIds)}
                </div>
            )}

            {/* Tackle Specific Stats */}
            {showTackleSection && (
                <div className="mb-4 space-y-2">
                    {showStatsGrid && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded-lg border border-cyan-900/30">
                            <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                                <span className="text-xs text-slate-400 mb-1">💪 拉扯力</span>
                                <span className="text-lg font-bold text-red-300">{item.tensileStrength || 0}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                                <span className="text-xs text-slate-400 mb-1">🛡️ 耐久度</span>
                                <span className="text-lg font-bold text-blue-300">{item.durability || 0}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 rounded bg-slate-800/50">
                                <span className="text-xs text-slate-400 mb-1">🔰 抵抗力</span>
                                <span className="text-lg font-bold text-emerald-300">{displayResistance}</span>
                            </div>
                        </div>
                    )}
                    {item.extraEffect && (
                        <div className="bg-cyan-900/10 border border-cyan-800/30 p-2 rounded-lg flex gap-2">
                            <span className="text-lg">⚡</span>
                            <div>
                                <span className="block text-[10px] text-cyan-400 font-bold uppercase">正面額外效果</span>
                                <span className="text-sm text-cyan-100">{item.extraEffect}</span>
                            </div>
                        </div>
                    )}
                    {item.negativeExtraEffect && (
                        <div className="bg-red-900/10 border border-red-800/30 p-2 rounded-lg flex gap-2 mt-2">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <span className="block text-[10px] text-red-400 font-bold uppercase">負面額外效果</span>
                                <span className="text-sm text-red-100">{item.negativeExtraEffect}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LunchBox Specific Details */}
            {item.type === ItemType.LunchBox && (
                <div className="flex flex-wrap gap-2 mb-4 bg-orange-900/10 border border-orange-900/30 p-2 rounded-lg">
                    {/* Satiety */}
                    <div className="flex items-center gap-1 bg-orange-900/40 px-2 py-1 rounded text-orange-200 text-xs font-bold border border-orange-700/50">
                        <span>🍗 美味度:</span>
                        <span>{activeTab === 'perfect' && item.perfectQualitySatiety !== undefined ? item.perfectQualitySatiety : (item.satiety || 0)}</span>
                    </div>
                    {/* Extra Bonus */}
                    {(activeTab === 'perfect' && item.perfectQualityExtraBonus !== undefined ? item.perfectQualityExtraBonus : item.extraBonus) !== undefined && (
                        <div className="flex items-center gap-1 bg-teal-900/40 px-2 py-1 rounded text-teal-200 text-xs font-bold border border-teal-700/50">
                            <span>✨ 額外加成:</span>
                            <span>{activeTab === 'perfect' && item.perfectQualityExtraBonus !== undefined ? item.perfectQualityExtraBonus : item.extraBonus}</span>
                        </div>
                    )}
                    {item.feedingEffect && (
                        <div className="w-full flex items-center gap-1 bg-yellow-900/40 px-2 py-1 rounded text-yellow-200 text-xs font-bold border border-yellow-700/50">
                            <span>🍴 餵食作用:</span>
                            <span>{item.feedingEffect}</span>
                        </div>
                    )}
                    {/* Categories */}
                    {item.foodCategories?.map(cat => (
                        <div key={cat} className="flex items-center gap-1 bg-amber-900/40 px-2 py-1 rounded text-amber-200 text-xs border border-amber-700/50">
                            🏷️ {cat}
                        </div>
                    ))}
                    {/* Flavors */}
                    {item.flavors?.map(flavor => (
                        <div key={flavor} className="flex items-center gap-1 bg-pink-900/40 px-2 py-1 rounded text-pink-200 text-xs border border-pink-700/50">
                            👅 {flavor}
                        </div>
                    ))}
                </div>
            )}
          
            {item.hasPerfectQuality && (
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setActiveTab('normal')}
                        className={`flex-1 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${activeTab === 'normal' ? 'text-blue-400 border-blue-400 bg-blue-900/20' : 'text-slate-500 border-slate-700 hover:text-slate-300'}`}
                    >
                        一般品質
                    </button>
                    <button 
                        onClick={() => setActiveTab('perfect')}
                        className={`flex-1 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${activeTab === 'perfect' ? 'text-fuchsia-400 border-fuchsia-400 bg-fuchsia-900/20' : 'text-slate-500 border-slate-700 hover:text-slate-300'}`}
                    >
                        🌟 完美品質
                    </button>
                </div>
            )}
            
            {(activeTab === 'normal' ? item.description : item.perfectQualityDescription) && (activeTab === 'normal' ? item.description : item.perfectQualityDescription)!.trim() !== '' && (
                <div className={`rounded-xl p-4 border mb-6 ${activeTab === 'perfect' ? 'bg-fuchsia-950/30 border-fuchsia-800/50' : 'bg-slate-950/50 border-slate-800'}`}>
                    <p className={`${activeTab === 'perfect' ? 'text-fuchsia-200' : 'text-slate-300'} italic leading-relaxed`}>
                        "{activeTab === 'normal' ? item.description : item.perfectQualityDescription}"
                    </p>
                </div>
            )}
            
            {/* Crafting Recipe Display */}
            {renderRecipeBlock(item.recipe, item.name)}

            {!isBundle && (
                <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm border-t border-slate-800 pt-3">
                        <span className="w-20 text-slate-500 font-bold flex-shrink-0 mt-1">📍 獲取來源</span>
                        {hasSystemSources ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onShowSource && onShowSource(item); }}
                                className="px-3 py-1 bg-indigo-900/50 hover:bg-indigo-700 text-indigo-200 border border-indigo-700/50 rounded transition-colors text-xs font-bold whitespace-nowrap"
                            >
                                獲取來源
                            </button>
                        ) : (
                            <span className="text-blue-300 mt-1">{item.source || '未知'}</span>
                        )}
                    </div>
                </div>
            )}
             
            {/* ID Field - Only for Developers */}
            {isDevMode && (
                <div className="flex items-center gap-3 text-sm border-t border-slate-800 pt-3 mt-3">
                    <span className="w-20 text-slate-500 font-bold flex-shrink-0">🆔 物品編號</span>
                    <span className="text-slate-400 font-mono">{item.id}</span>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailModal;
