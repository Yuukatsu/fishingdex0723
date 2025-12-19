
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
        className="relative group bg-slate-800/80 border border-slate-700 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
    >
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-2xl shadow-inner">
                {job.name === "挖礦" ? "⛏️" : job.name === "採藥" ? "🌿" : job.name === "搬運" ? "📦" : job.name === "料理" ? "🍳" : "🛡️"}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white leading-none mb-1.5">{job.name}</h3>
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Dispatch Job</span>
            </div>
        </div>

        <div className="flex gap-2 mt-auto">
            {job.focusStats.map(stat => (
                <span key={stat} className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-800/50 rounded text-[10px] font-bold">
                    {stat} 優先
                </span>
            ))}
        </div>

        {isDevMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1 z-10">
          <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} className="p-1 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DispatchJobCard;
