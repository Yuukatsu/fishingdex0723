import React, { useState, useEffect } from 'react';
import { SocialLinks } from '../types';
import { X, Save } from 'lucide-react';

interface SocialLinksModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLinks: SocialLinks;
    onSave: (links: SocialLinks) => void;
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({ isOpen, onClose, currentLinks, onSave }) => {
    const [links, setLinks] = useState<SocialLinks>(currentLinks);

    useEffect(() => {
        if (isOpen) {
            setLinks(currentLinks);
        }
    }, [isOpen, currentLinks]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(links);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🔗</span> 編輯社群連結
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Discord 連結</label>
                        <input 
                            type="text" 
                            value={links.discord} 
                            onChange={e => setLinks({...links, discord: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
                            placeholder="https://discord.gg/..." 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">YouTube 連結</label>
                        <input 
                            type="text" 
                            value={links.youtube} 
                            onChange={e => setLinks({...links, youtube: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" 
                            placeholder="https://youtube.com/..." 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Twitch 連結</label>
                        <input 
                            type="text" 
                            value={links.twitch} 
                            onChange={e => setLinks({...links, twitch: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" 
                            placeholder="https://twitch.tv/..." 
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition text-sm font-medium">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition text-sm font-medium flex items-center gap-2">
                        <Save size={16} /> 儲存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialLinksModal;
