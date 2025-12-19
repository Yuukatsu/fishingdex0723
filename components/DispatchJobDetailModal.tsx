
import React from 'react';
import { DispatchJob, Item, AdventureMapItem } from '../types';

interface DispatchJobDetailModalProps {
  job: DispatchJob;
  onClose: () => void;
  itemList: Item[];
  onItemClick: (item: Item) => void;
}

const DispatchJobDetailModal: React.FC<DispatchJobDetailModalProps> = ({ job, onClose, itemList, onItemClick }) => {
  const renderTable = (label: string, items: AdventureMapItem[], color: string, bg: string) => {
    if (!items || items.length === 0) return null;
    return (
        <div className={`mb-6 p-5 rounded-2xl border border-slate-800/50 ${bg} animate-fadeIn`}>
            <h4 className={`text-[11px] font-black uppercase mb-4 flex items-center gap-2 ${color}`}>
                <span className="w-2 h-2 rounded-full bg-current shadow-lg shadow-current/50"></span>
                評價等級：{label} ({items.length})
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {items.map(mItem => {
                    const detail = itemList.find(i => i.id === mItem.id);
                    return (
                        <div key={mItem.id} onClick={() => detail && onItemClick(detail)} className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 hover:border-slate-600 transition cursor-pointer flex flex-col items-center group">
                            <div className="w-10 h-10 flex items-center justify-center mb-1 overflow-hidden">
                                {detail?.imageUrl ? <img src={detail.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated] group-hover:scale-110 transition" /> : <span className="text-2xl">🎁</span>}
                            </div>
                            <span className="text-[9px] text-slate-500 text-center truncate w-full">{detail?.name || mItem.id}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-opacity-50">
                    {job.name === "挖礦" ? "⛏️" : job.name === "採藥" ? "🌿" : job.name === "搬運" ? "📦" : job.name === "料理" ? "🍳" : "🛡️"}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{job.name} 派遣預覽</h2>
                    <div className="flex gap-2 mt-1">
                        {job.focusStats.map(s => <span key={s} className="text-[10px] text-blue-400 font-bold bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-800/30">{s} 優先</span>)}
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700">✕</button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
            {renderTable("狀況不佳", job.badDrops, "text-slate-500", "bg-slate-900/20")}
            {renderTable("普通完成", job.normalDrops, "text-blue-400", "bg-blue-900/5")}
            {renderTable("大成功", job.greatDrops, "text-emerald-400", "bg-emerald-900/5")}
            {renderTable("特殊發現", job.specialDrops, "text-amber-400", "bg-amber-900/5")}
            {renderTable("隱藏獎勵", job.hiddenDrops, "text-purple-400", "bg-purple-900/5")}

            {(!job.badDrops?.length && !job.normalDrops?.length && !job.greatDrops?.length && !job.specialDrops?.length && !job.hiddenDrops?.length) && (
                <div className="py-24 text-center text-slate-700 text-sm italic">尚無設定任何獎勵表</div>
            )}
        </div>

        <div className="p-5 bg-slate-950 border-t border-slate-800">
             <button onClick={onClose} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition uppercase tracking-widest border border-slate-700">關閉報告</button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobDetailModal;
