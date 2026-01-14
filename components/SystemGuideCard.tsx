
import React from 'react';
import { SystemGuide } from '../types';

interface SystemGuideCardProps {
  guide: SystemGuide;
  isDevMode: boolean;
  onEdit: (guide: SystemGuide) => void;
  onDelete: (id: string) => void;
  onClick: (guide: SystemGuide) => void;
}

const SystemGuideCard: React.FC<SystemGuideCardProps> = ({ guide, isDevMode, onEdit, onDelete, onClick }) => {
  return (
    <div 
        onClick={() => onClick(guide)}
        className="relative group bg-slate-800/80 border border-slate-700 hover:border-indigo-500 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 min-h-[160px]"
    >
        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-tight pr-6">{guide.title}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
            {guide.tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full">
                    #{tag}
                </span>
            ))}
        </div>

        {/* Summary */}
        <div className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed">
            {guide.summary}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-3 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500">
            <span>最後更新: {new Date(guide.updatedAt).toLocaleDateString()}</span>
            <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition">點擊查看詳情 &rarr;</span>
        </div>

        {/* Dev Controls */}
        {isDevMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 backdrop-blur-sm z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(guide); }} 
                    className="p-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded shadow-sm"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(guide.id); }} 
                    className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded shadow-sm"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )}
    </div>
  );
};

export default SystemGuideCard;
