
import React from 'react';
import { SystemGuide, GUIDE_CATEGORY_LABELS } from '../types';

interface SystemGuideDetailModalProps {
  guide: SystemGuide;
  onClose: () => void;
}

const SystemGuideDetailModal: React.FC<SystemGuideDetailModalProps> = ({ guide, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded">
                    {GUIDE_CATEGORY_LABELS[guide.category]}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                    最後更新: {new Date(guide.updatedAt).toLocaleDateString()}
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{guide.title}</h2>
            
            <div className="flex flex-wrap gap-2 mt-3">
                {guide.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-slate-400 italic">#{tag}</span>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
            {/* Summary Block */}
            {guide.summary && (
                <div className="mb-8 p-4 bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r-lg">
                    <p className="text-indigo-200 font-medium leading-relaxed italic">{guide.summary}</p>
                </div>
            )}

            {/* Main Content */}
            <div className="text-slate-300 leading-8 whitespace-pre-wrap text-base">
                {guide.content || <span className="text-slate-600 italic">無內容...</span>}
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-700 transition">
                關閉
            </button>
        </div>
      </div>
    </div>
  );
};

export default SystemGuideDetailModal;
