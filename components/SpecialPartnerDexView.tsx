import React, { useState, useMemo } from 'react';
import { SpecialPartner, PartnerRank, PARTNER_RANKS, PARTNER_RANK_COLORS, ITEM_ATTRIBUTE_COLORS } from '../types';

const POKEMON_18_ATTRIBUTES = [
  "一般", "格鬥", "飛行", "毒", "地面", "岩石", "蟲", "幽靈", "鋼",
  "火", "水", "草", "電", "超能力", "冰", "龍", "惡", "妖精"
];

interface SpecialPartnerDexViewProps {
  partnerList: SpecialPartner[];
  isDevMode: boolean;
  onSelectPartner: (partner: SpecialPartner) => void;
  onCreatePartner: (defaultNumber?: number) => void;
}

const PAGE_SIZE = 30; // 5 x 6 = 30 格

const SpecialPartnerDexView: React.FC<SpecialPartnerDexViewProps> = ({
  partnerList,
  isDevMode,
  onSelectPartner,
  onCreatePartner
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<PartnerRank | 'ALL'>('ALL');
  const [selectedAttribute, setSelectedAttribute] = useState<string | 'ALL'>('ALL');

  // Filter & Sort Partners
  const filteredPartners = useMemo(() => {
    return partnerList.filter(p => {
      if (selectedRank !== 'ALL' && p.rank !== selectedRank) return false;
      if (selectedAttribute !== 'ALL' && p.attribute !== selectedAttribute) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(term);
        const matchNum = p.pokedexNumber?.toString().includes(term);
        const matchSource = p.acquisitionSource?.toLowerCase().includes(term);
        const matchBattle = p.possibleBattleSkills?.some(s => s.toLowerCase().includes(term));
        const matchSub = p.possibleSubSkills?.some(s => s.toLowerCase().includes(term));
        const matchMain = p.possibleMainSkills?.some(s => s.toLowerCase().includes(term));
        if (!matchName && !matchNum && !matchSource && !matchBattle && !matchSub && !matchMain) return false;
      }
      return true;
    });
  }, [partnerList, searchTerm, selectedRank, selectedAttribute]);

  // Sort by pokedexNumber
  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => {
      const numA = a.pokedexNumber ?? 999999;
      const numB = b.pokedexNumber ?? 999999;
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    });
  }, [filteredPartners]);

  const totalPages = Math.max(1, Math.ceil(sortedPartners.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Current page items
  const currentPageItems = useMemo(() => {
    const start = (validCurrentPage - 1) * PAGE_SIZE;
    return sortedPartners.slice(start, start + PAGE_SIZE);
  }, [sortedPartners, validCurrentPage]);

  // 5x6 = 30 slots on every page
  const slots = useMemo(() => {
    const list: (SpecialPartner | null)[] = [...currentPageItems];
    while (list.length < PAGE_SIZE) {
      list.push(null);
    }
    return list;
  }, [currentPageItems]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Controls & Filter Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-xl shadow-inner">
              📖
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                特殊夥伴圖鑑
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/40">
                  共 {partnerList.length} 隻
                </span>
              </h3>
              <p className="text-xs text-slate-400">以 5 × 6 格子圖鑑陳列每位夥伴的屬性、Rank 與技能</p>
            </div>
          </div>

          {/* Quick Page Navigator */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-700/80 self-end sm:self-auto">
            <button
              onClick={handlePrevPage}
              disabled={validCurrentPage <= 1}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                validCurrentPage <= 1
                  ? 'opacity-30 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-600 shadow'
              }`}
            >
              ◀ 上一頁
            </button>
            <span className="text-xs font-bold text-slate-300 px-2 font-mono whitespace-nowrap">
              第 {validCurrentPage} / {totalPages} 頁
            </span>
            <button
              onClick={handleNextPage}
              disabled={validCurrentPage >= totalPages}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                validCurrentPage >= totalPages
                  ? 'opacity-30 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 shadow animate-pulse'
              }`}
            >
              下一頁 ▶
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center pt-2 border-t border-slate-800">
          {/* Search input */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="搜尋編號、夥伴名稱、特性或技能..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rank Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap mr-1">Rank:</span>
            <button
              onClick={() => { setSelectedRank('ALL'); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                selectedRank === 'ALL'
                  ? 'bg-purple-600 text-white border-purple-400 shadow'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              全部
            </button>
            {PARTNER_RANKS.map(rk => (
              <button
                key={rk}
                onClick={() => { setSelectedRank(rk); setCurrentPage(1); }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  selectedRank === rk
                    ? `${PARTNER_RANK_COLORS[rk].bg} ${PARTNER_RANK_COLORS[rk].text} ${PARTNER_RANK_COLORS[rk].border} shadow ring-1 ring-white/30`
                    : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>

          {/* Attribute Filter */}
          <div className="flex items-center gap-1">
            <select
              value={selectedAttribute}
              onChange={e => { setSelectedAttribute(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">全部屬性 (18種)</option>
              {POKEMON_18_ATTRIBUTES.map(attr => (
                <option key={attr} value={attr}>{attr} 屬性</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5x6 Grid Section (30 Slots) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {slots.map((partner, slotIdx) => {
          const slotDisplayNumber = (validCurrentPage - 1) * PAGE_SIZE + slotIdx + 1;

          if (!partner) {
            // Empty Pokédex Slot
            return (
              <div
                key={`empty-${slotIdx}`}
                onClick={() => {
                  onCreatePartner(slotDisplayNumber);
                }}
                className="aspect-square bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between transition-all select-none hover:border-purple-500/60 hover:bg-purple-950/20 cursor-pointer group"
                title={`點擊新增第 #${slotDisplayNumber} 號夥伴`}
              >
                <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-600">
                  <span>#{slotDisplayNumber.toString().padStart(3, '0')}</span>
                  <span>---</span>
                </div>
                <div className="text-center">
                  <span className="text-xl opacity-30 group-hover:opacity-80 group-hover:scale-110 transition block">
                    ➕
                  </span>
                  <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition block mt-0.5">
                    點擊新增
                  </span>
                </div>
                <span className="text-[10px] text-slate-600">空欄位</span>
              </div>
            );
          }

          // Occupied Slot
          const attr = partner.attribute || '一般';
          const attrStyle = ITEM_ATTRIBUTE_COLORS[attr] || ITEM_ATTRIBUTE_COLORS['一般'];
          const rank = partner.rank || 'C';
          const rankStyle = PARTNER_RANK_COLORS[rank] || PARTNER_RANK_COLORS['C'];

          return (
            <div
              key={partner.id}
              onClick={() => onSelectPartner(partner)}
              className="aspect-square bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-purple-400/80 rounded-xl p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105 shadow-md hover:shadow-purple-900/30 group relative overflow-hidden"
            >
              {/* Top row: Number and Rank */}
              <div className="w-full flex justify-between items-center z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-purple-300 transition">
                  #{partner.pokedexNumber ? partner.pokedexNumber.toString().padStart(3, '0') : slotDisplayNumber.toString().padStart(3, '0')}
                </span>
                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
                  {rank}
                </span>
              </div>

              {/* Center: 64x64 Pixel Sprite Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center relative my-auto">
                {partner.imageUrl ? (
                  <img
                    src={partner.imageUrl}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain [image-rendering:pixelated] group-hover:scale-115 transition-transform duration-200"
                  />
                ) : (
                  <span className="text-3xl group-hover:scale-115 transition-transform">🐾</span>
                )}
              </div>

              {/* Bottom row: Name & Attribute */}
              <div className="w-full flex items-center justify-between gap-1 z-10">
                <span className="text-[11px] font-bold text-white truncate max-w-[70px] group-hover:text-purple-200 transition">
                  {partner.name}
                </span>
                <span className={`px-1 py-0.2 text-[9px] font-bold rounded border ${attrStyle.bg} ${attrStyle.text} ${attrStyle.border} flex-shrink-0`}>
                  {attr}
                </span>
              </div>

              {/* Subtle aura highlight */}
              <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition"></div>
            </div>
          );
        })}
      </div>

      {/* Bottom Pagination Bar */}
      <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400">
          顯示第 {(validCurrentPage - 1) * PAGE_SIZE + 1} - {Math.min(validCurrentPage * PAGE_SIZE, sortedPartners.length)} 隻夥伴（總計 {sortedPartners.length} 隻符合）
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={validCurrentPage <= 1}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              validCurrentPage <= 1
                ? 'opacity-30 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-600'
            }`}
          >
            ◀ 上一頁
          </button>
          <span className="text-slate-300 font-bold px-2 font-mono">
            {validCurrentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={validCurrentPage >= totalPages}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              validCurrentPage >= totalPages
                ? 'opacity-30 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400 shadow'
            }`}
          >
            下一頁 ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialPartnerDexView;
