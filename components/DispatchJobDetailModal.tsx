
import React, { useState } from 'react';
import { DispatchJob, Item, AdventureMapItem, DispatchRequest } from '../types';

interface DispatchJobDetailModalProps {
  job: DispatchJob;
  onClose: () => void;
  itemList: Item[];
  onItemClick: (item: Item) => void;
}

const DispatchJobDetailModal: React.FC<DispatchJobDetailModalProps> = ({ job, onClose, itemList, onItemClick }) => {
  // Track expanded request ID
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const toggleRequest = (reqId: string) => {
      setExpandedRequestId(prev => prev === reqId ? null : reqId);
  };

  const renderRewardGrid = (items: AdventureMapItem[], title: string, bgClass: string, textClass: string) => {
      if (!items || items.length === 0) return null;
      return (
          <div className={`p-3 rounded-lg border border-opacity-30 ${bgClass}`}>
              <h5 className={`text-[10px] font-bold uppercase mb-2 ${textClass} opacity-80`}>{title}</h5>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {items.map(mItem => {
                      const detail = itemList.find(i => i.id === mItem.id);
                      return (
                          <div 
                            key={mItem.id} 
                            onClick={(e) => { e.stopPropagation(); detail && onItemClick(detail); }} 
                            className="bg-slate-900/60 p-1.5 rounded border border-slate-700/50 hover:border-slate-500 transition cursor-pointer flex flex-col items-center group relative"
                          >
                              {mItem.isLowRate && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>}
                              <div className="w-8 h-8 flex items-center justify-center mb-1 overflow-hidden">
                                  {detail?.imageUrl ? <img src={detail.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" /> : <span className="text-xl">📦</span>}
                              </div>
                              <span className="text-[8px] text-slate-400 text-center truncate w-full group-hover:text-white">{detail?.name || mItem.id}</span>
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
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header: Enterprise Info */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-start">
            <div className="flex gap-5 items-center">
                <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg">
                    {job.imageUrl ? (
                        <img src={job.imageUrl} alt={job.name} className="w-full h-full object-cover [image-rendering:pixelated]" />
                    ) : (
                        <span className="text-4xl opacity-50">🏢</span>
                    )}
                </div>
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Enterprise Details</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-2">{job.name}</h2>
                    {job.dropSummary && (
                        <p className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                            <span className="text-slate-500 font-bold mr-1">📦 主要產出:</span>
                            {job.dropSummary}
                        </p>
                    )}
                </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700">✕</button>
        </div>

        {/* Body: Request List */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <span>📋 委託列表</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-500">{job.requests?.length || 0}</span>
            </h3>

            <div className="space-y-3">
                {(!job.requests || job.requests.length === 0) ? (
                    <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        此企業目前沒有發布任何委託
                    </div>
                ) : (
                    job.requests.map((req) => {
                        const isExpanded = expandedRequestId === req.id;
                        return (
                            <div key={req.id} className={`border rounded-xl transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-slate-800 border-slate-600 shadow-lg' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'}`}>
                                {/* Request Header (Click to toggle) */}
                                <div 
                                    onClick={() => toggleRequest(req.id)}
                                    className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {isExpanded ? '▼' : '▶'}
                                        </div>
                                        <span className={`text-sm font-bold ${isExpanded ? 'text-white' : 'text-slate-300'}`}>
                                            {req.name}
                                        </span>
                                    </div>
                                    
                                    {/* Request Tags Display */}
                                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                                        {req.tags && req.tags.map((tag, idx) => (
                                            <span key={idx} className="text-[10px] bg-slate-900 text-blue-300 border border-slate-600 px-2 py-0.5 rounded font-mono">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Request Body (Description + Rewards) */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 animate-fadeIn">
                                        {/* Description Section */}
                                        {req.description && (
                                            <div className="py-3 text-sm text-slate-300 italic border-b border-slate-700/30 mb-2 leading-relaxed">
                                                {req.description}
                                            </div>
                                        )}
                                        
                                        <div className="pt-2 space-y-4">
                                            {renderRewardGrid(req.rewardsNormal, "✅ 完成 (Normal)", "bg-blue-900/10 border-blue-500", "text-blue-400")}
                                            {renderRewardGrid(req.rewardsGreat, "✨ 幹得好! (Great)", "bg-emerald-900/10 border-emerald-500", "text-emerald-400")}
                                            {renderRewardGrid(req.rewardsSuper, "🏆 超級成功!! (Super)", "bg-amber-900/10 border-amber-500", "text-amber-400")}
                                            
                                            {(!req.rewardsNormal?.length && !req.rewardsGreat?.length && !req.rewardsSuper?.length) && (
                                                <div className="text-center text-xs text-slate-600 py-2">無獎勵資料</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobDetailModal;
