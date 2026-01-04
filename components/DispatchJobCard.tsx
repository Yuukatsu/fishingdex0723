
import React from 'react';
import { DispatchJob } from '../types';

interface DispatchJobCardProps {
  job: DispatchJob;
  isDevMode: boolean;
  onEdit: (job: DispatchJob) => void;
  onDelete: (id: string) => void;
  onClick: (job: DispatchJob) => void;
}

const DispatchJobCard: React.FC<DispatchJobCardProps> = ({ job, isDevMode, onEdit, onDelete, onClick }) => {
  return (
    <div 
        onClick={() => onClick(job)}
        className="relative group bg-slate-800/80 border border-slate-700 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 min-h-[140px]"
    >
        {/* Top: Image & Name */}
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 border border-slate-600 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner relative">
                {job.imageUrl ? (
                    <img src={job.imageUrl} alt={job.name} className="w-full h-full object-cover [image-rendering:pixelated]" />
                ) : (
                    <span className="text-3xl opacity-50">🏢</span>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Enterprise</span>
                <h3 className="text-lg font-bold text-white leading-tight truncate">{job.name}</h3>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">
                        {job.requests?.length || 0} 個委託
                    </span>
                </div>
            </div>
        </div>

        {/* Bottom: Drop Summary */}
        <div className="mt-auto pt-2 border-t border-slate-700/50">
            {job.dropSummary ? (
                <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
                    <span className="text-slate-500 font-bold mr-1">📦 掉落:</span>
                    {job.dropSummary}
                </p>
            ) : (
                <span className="text-[10px] text-slate-600 italic">無掉落資訊</span>
            )}
        </div>

        {/* Dev Controls */}
        {isDevMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 backdrop-blur-sm z-10">
                <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="p-1 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} className="p-1 bg-red-600/80 hover:bg-red-500 text-white rounded shadow-sm">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )}
    </div>
  );
};

export default DispatchJobCard;
