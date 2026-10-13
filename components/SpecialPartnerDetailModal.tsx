import React from 'react';
import { SpecialPartner, ITEM_ATTRIBUTE_COLORS, PARTNER_RANK_COLORS } from '../types';

interface SpecialPartnerDetailModalProps {
  partner: SpecialPartner;
  onClose: () => void;
  onEdit?: (partner: SpecialPartner) => void;
  onDelete?: (id: string) => void;
  isDevMode: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const SpecialPartnerDetailModal: React.FC<SpecialPartnerDetailModalProps> = ({
  partner,
  onClose,
  onEdit,
  onDelete,
  isDevMode,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  const partnerAttrs = (partner.attributes && partner.attributes.length > 0)
    ? (partner.attributes as string[])
    : (partner.attribute ? [partner.attribute as string] : ['一般']);
  const rank = partner.rank || 'C';
  const rankStyle = PARTNER_RANK_COLORS[rank] || PARTNER_RANK_COLORS['C'];

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-black/90 transition text-xs"
        >
          ✕
        </button>

        {/* Floating Prev / Next Navigation */}
        {hasPrev && onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-20 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-800 text-purple-300 border border-purple-500/50 flex items-center justify-center shadow-lg backdrop-blur-md transition-all hover:scale-110"
            title="查看上一隻夥伴"
          >
            ◀
          </button>
        )}
        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-20 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white border border-purple-400 flex items-center justify-center shadow-lg backdrop-blur-md transition-all hover:scale-110"
            title="查看下一隻夥伴"
          >
            ▶
          </button>
        )}

        {/* Hero Sprite Card */}
        <div className="w-full h-40 bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950/30 relative border-b border-slate-800 flex items-center justify-center p-4 flex-shrink-0">
          <div className="w-24 h-24 flex items-center justify-center relative drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            {partner.imageUrl ? (
              <img 
                src={partner.imageUrl} 
                alt={partner.name} 
                className="w-20 h-20 object-contain [image-rendering:pixelated] scale-125 transition-transform duration-300 hover:scale-150" 
              />
            ) : (
              <span className="text-5xl">🐾</span>
            )}
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-black/60 text-purple-300 border border-purple-500/40 rounded-full">
              #{partner.pokedexNumber ? partner.pokedexNumber.toString().padStart(3, '0') : '???'}
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
              Rank {rank}
            </span>
          </div>

          {/* Attribute Badges */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 flex-wrap justify-end">
            {partnerAttrs.map((a, idx) => {
              const aStyle = ITEM_ATTRIBUTE_COLORS[a] || ITEM_ATTRIBUTE_COLORS['一般'];
              return (
                <span key={idx} className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${aStyle.bg} ${aStyle.text} ${aStyle.border} shadow-sm`}>
                  {a}
                </span>
              );
            })}
          </div>
        </div>

        {/* Info Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Name & Basic Info */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {partner.name}
              </h2>
            </div>
          </div>

          {/* Possible Battle Skills (可能戰鬥特性) */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="block text-xs font-bold text-rose-300 uppercase flex items-center gap-1">
              <span>⚔️</span> 可能戰鬥特性
            </span>
            {partner.possibleBattleSkills && partner.possibleBattleSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partner.possibleBattleSkills.map((sk, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 bg-rose-950/60 text-rose-200 border border-rose-800/60 rounded-full text-xs font-bold shadow-sm"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-0.5">無特定戰鬥特性</p>
            )}
          </div>

          {/* Possible Sub Skills (可能副技能) */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="block text-xs font-bold text-emerald-300 uppercase flex items-center gap-1">
              <span>🌱</span> 可能副技能
            </span>
            {partner.possibleSubSkills && partner.possibleSubSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partner.possibleSubSkills.map((sk, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-800/60 rounded-full text-xs font-bold shadow-sm"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-0.5">無特定副技能</p>
            )}
          </div>

          {/* Possible Main Skills (可能主技能) */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="block text-xs font-bold text-blue-300 uppercase flex items-center gap-1">
              <span>⚡</span> 可能主技能
            </span>
            {partner.possibleMainSkills && partner.possibleMainSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {partner.possibleMainSkills.map((sk, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 bg-blue-950/60 text-blue-200 border border-blue-800/60 rounded-full text-xs font-bold shadow-sm"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-0.5">無特定主技能</p>
            )}
          </div>

          {/* Acquisition Source (獲得途徑) */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="block text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
              <span>📍</span> 獲得途徑
            </span>
            <p className="text-xs text-slate-300 leading-relaxed pt-0.5 whitespace-pre-line">
              {partner.acquisitionSource || '尚未記載獲得途徑'}
            </p>
          </div>

          {/* Detail Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-[10px] text-slate-500 font-mono">
              #{partner.pokedexNumber ? partner.pokedexNumber.toString().padStart(3, '0') : ''} {partner.id && `(ID: ${partner.id.slice(0, 8)})`}
            </span>
            <div className="flex items-center gap-2">
              {isDevMode && onEdit && (
                <button
                  onClick={() => onEdit(partner)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1 hover:scale-105"
                  title="編輯此夥伴的各項資訊"
                >
                  ✏️ 編輯夥伴資訊
                </button>
              )}
              {isDevMode && onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`確定要刪除「${partner.name}」嗎？`)) {
                      onDelete(partner.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-900/60 hover:bg-red-700 text-red-200 border border-red-700/50 text-xs font-bold rounded-lg transition"
                >
                  🗑️ 刪除
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialPartnerDetailModal;
