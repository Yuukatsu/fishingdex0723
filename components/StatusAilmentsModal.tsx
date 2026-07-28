import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface StatusAilmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDevMode: boolean;
    content: string;
    onSave: (content: string) => void;
}

const StatusAilmentsModal: React.FC<StatusAilmentsModalProps> = ({ isOpen, onClose, isDevMode, content, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditContent(content);
            setIsEditing(false);
        }
    }, [isOpen, content]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(editContent);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                        <span>☠️</span> 異常狀態一覽
                    </h2>
                    <div className="flex gap-2">
                        {isDevMode && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
                                編輯
                            </button>
                        )}
                        {isDevMode && isEditing && (
                            <button onClick={handleSave} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded">
                                儲存
                            </button>
                        )}
                        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-full min-h-[400px] bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
                            placeholder="支援 Markdown 格式..."
                        />
                    ) : (
                        <div className="prose prose-invert prose-cyan max-w-none markdown-body">
                            {content ? (
                                <Markdown>{content}</Markdown>
                            ) : (
                                <p className="text-slate-500 text-center py-8">目前沒有設定任何異常狀態資訊</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatusAilmentsModal;
