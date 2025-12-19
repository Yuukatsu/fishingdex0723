
import React from 'react';
import { DispatchJob, Item, AdventureMapItem } from '../types';

interface DispatchJobDetailModalProps {
  job: DispatchJob;
  onClose: () => void;
  itemList: Item[];
  onItemClick: (item: Item) => void;
}

const DispatchJobDetailModal: React.FC<DispatchJobDetailModalProps> = ({ job, onClose, itemList, onItemClick }) => {
  const renderTable = (label: string, items: AdventureMapItem[], color: string) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mb-6 animate-fadeIn">
            <h4 className={`text-[10px] font-black uppercase mb-3 flex items-center gap-2 ${color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {label} ({items.length})
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {items.map(mItem => {
                    const detail = itemList.find(i => i.id === mItem.id);
                    return (
                        <div key={mItem.id} onClick={() => detail && onItemClick(detail)} className="bg-slate-800/40 p-2 rounded-lg border border-slate-700 hover:border-slate-500 transition cursor-pointer flex flex-col items-center">
                            <div className="w-8 h-8 flex items-center justify-center mb-1 overflow-hidden">
                                {detail?.imageUrl ? <img src={detail.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" /> : <span className="text-xl">🎁</span>}
                            </div>
                            <span className="text-[8px] text-slate-400 text-center truncate w-full">{detail?.name || mItem.id}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-3xl">
                    {job.name === "挖礦" ? "⛏️" : job.name === "採藥" ? "🌿" : job.name === "搬運" ? "📦" : job.name === "料理" ? "🍳" : "🛡️"}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{job.name}</h2>
                    <div className="flex gap-2 mt-1">
                        {job.focusStats.map(s => <span key={s} className="text-[10px] text-blue-400 font-bold">#{s} 優先</span>)}
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                這是派遣工作的道具掉落預覽。實際獲得的道具將取決於夥伴的體能表現與工作評價。
                單次派遣僅能選定一位夥伴進行。
            </p>

            {renderTable("狀況不佳", job.badDrops, "text-gray-400")}
            {renderTable("普通完成", job.normalDrops, "text-blue-400")}
            {renderTable("大成功", job.greatDrops, "text-emerald-400")}
            {renderTable("特殊掉落", job.specialDrops, "text-amber-400")}
            {renderTable("隱藏掉落", job.hiddenDrops, "text-purple-400")}

            {(!job.badDrops?.length && !job.normalDrops?.length && !job.greatDrops?.length && !job.specialDrops?.length && !job.hiddenDrops?.length) && (
                <div className="py-20 text-center text-slate-600 text-sm italic">
                    此工作目前沒有配置掉落道具
                </div>
            )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
             <button onClick={onClose} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition uppercase tracking-widest">Close Report</button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobDetailModal;
