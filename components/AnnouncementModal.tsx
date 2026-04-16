import React, { useState } from 'react';
import { Announcement, AnnouncementTag } from '../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { X, Plus, Edit2, Trash2, Save, Settings } from 'lucide-react';

interface AnnouncementModalProps {
    announcements: Announcement[];
    tags: AnnouncementTag[];
    onClose: () => void;
    isDevMode: boolean;
    onSaveAnnouncement: (announcement: Announcement) => void;
    onDeleteAnnouncement: (id: string) => void;
    onSaveTags: (tags: AnnouncementTag[]) => void;
}

const PREDEFINED_COLORS = [
    'bg-blue-900/50 text-blue-300 border-blue-500',
    'bg-amber-900/50 text-amber-300 border-amber-500',
    'bg-green-900/50 text-green-300 border-green-500',
    'bg-rose-900/50 text-rose-300 border-rose-500',
    'bg-purple-900/50 text-purple-300 border-purple-500',
    'bg-cyan-900/50 text-cyan-300 border-cyan-500',
    'bg-slate-800 text-slate-300 border-slate-500',
];

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
    announcements,
    tags,
    onClose,
    isDevMode,
    onSaveAnnouncement,
    onDeleteAnnouncement,
    onSaveTags
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Announcement>>({});
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // Tag Management State
    const [isManagingTags, setIsManagingTags] = useState(false);
    const [newTagLabel, setNewTagLabel] = useState('');
    const [newTagColor, setNewTagColor] = useState(PREDEFINED_COLORS[0]);

    const handleEdit = (ann: Announcement, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingId(ann.id);
        setFormData(ann);
        setSelectedAnnouncement(null);
        setIsManagingTags(false);
    };

    const handleAddNew = () => {
        setEditingId('new');
        setFormData({
            id: Date.now().toString(),
            title: '',
            version: 'v1.0.0',
            date: new Date().toISOString().split('T')[0],
            content: '',
            tags: [],
            isForcePopup: false
        });
        setSelectedAnnouncement(null);
        setIsManagingTags(false);
    };

    const handleSave = () => {
        if (!formData.version || !formData.date || !formData.content) {
            alert('請填寫完整資訊 (版本號、日期、內容)');
            return;
        }
        onSaveAnnouncement(formData as Announcement);
        setEditingId(null);
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if(window.confirm('確定刪除此公告？')) {
            onDeleteAnnouncement(id);
            if (selectedAnnouncement?.id === id) {
                setSelectedAnnouncement(null);
            }
        }
    };

    const toggleTag = (tagId: string) => {
        const currentTags = formData.tags || [];
        if (currentTags.includes(tagId)) {
            setFormData({ ...formData, tags: currentTags.filter(id => id !== tagId) });
        } else {
            setFormData({ ...formData, tags: [...currentTags, tagId] });
        }
    };

    const handleAddTag = () => {
        if (!newTagLabel.trim()) return;
        const newTag: AnnouncementTag = {
            id: `tag_${Date.now()}`,
            label: newTagLabel.trim(),
            color: newTagColor
        };
        onSaveTags([...tags, newTag]);
        setNewTagLabel('');
    };

    const handleDeleteTag = (tagId: string) => {
        if (window.confirm('確定刪除此標籤？')) {
            onSaveTags(tags.filter(t => t.id !== tagId));
            // Also remove this tag from the current form data if it's selected
            if (formData.tags?.includes(tagId)) {
                setFormData({ ...formData, tags: formData.tags.filter(id => id !== tagId) });
            }
        }
    };

    // Sort announcements by date descending
    const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {selectedAnnouncement && !editingId && (
                            <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">
                                ←
                            </button>
                        )}
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span>📢</span> {selectedAnnouncement && !editingId ? selectedAnnouncement.version : '更新日誌與公告'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
                    
                    {/* Dev Mode Controls */}
                    {isDevMode && !editingId && !selectedAnnouncement && (
                        <div className="mb-6">
                            <button onClick={handleAddNew} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition flex items-center justify-center gap-2 font-bold">
                                <Plus size={18} /> 新增公告
                            </button>
                        </div>
                    )}

                    {/* Edit Form */}
                    {isDevMode && editingId && (
                        <div className="bg-slate-800 border border-blue-500/50 rounded-xl p-5 mb-8 shadow-lg animate-fadeIn">
                            <h3 className="text-lg font-bold text-blue-400 mb-4">{editingId === 'new' ? '新增公告' : '編輯公告'}</h3>
                            
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 mb-1">標題</label>
                                <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" placeholder="公告標題 (選填)" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">版本號</label>
                                    <input type="text" value={formData.version || ''} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" placeholder="e.g. v1.2.0" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">日期</label>
                                    <input type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white" />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs text-slate-400">標籤分類</label>
                                    <button onClick={() => setIsManagingTags(!isManagingTags)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <Settings size={12} /> {isManagingTags ? '完成管理' : '管理標籤'}
                                    </button>
                                </div>
                                
                                {isManagingTags ? (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 mb-3">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {tags.map(tag => (
                                                <div key={tag.id} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border border-transparent ${tag.color}`}>
                                                    {tag.label}
                                                    <button onClick={() => handleDeleteTag(tag.id)} className="hover:text-red-400 ml-1"><X size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={newTagLabel} onChange={e => setNewTagLabel(e.target.value)} placeholder="新標籤名稱" className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white flex-1" />
                                            <select value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                                                {PREDEFINED_COLORS.map((colorClass, i) => (
                                                    <option key={i} value={colorClass}>顏色 {i + 1}</option>
                                                ))}
                                            </select>
                                            <button onClick={handleAddTag} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition">新增</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => {
                                            const isSelected = formData.tags?.includes(tag.id);
                                            return (
                                                <button 
                                                    key={tag.id}
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${isSelected ? tag.color + ' border-transparent' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'}`}
                                                >
                                                    {tag.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 mb-1">內容 (支援 Markdown)</label>
                                <textarea 
                                    value={formData.content || ''} 
                                    onChange={e => setFormData({...formData, content: e.target.value})} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white min-h-[300px] font-sans text-base leading-relaxed"
                                    placeholder="輸入更新內容..."
                                />
                            </div>

                            <div className="mb-6 flex items-center gap-2">
                                <input type="checkbox" id="forcePopup" checked={formData.isForcePopup || false} onChange={e => setFormData({...formData, isForcePopup: e.target.checked})} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500" />
                                <label htmlFor="forcePopup" className="text-sm text-slate-300 cursor-pointer">強制彈出 (即使版本號未變，使用者進入網頁時也會彈出此公告)</label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 transition text-sm">取消</button>
                                <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition text-sm flex items-center gap-2"><Save size={16} /> 儲存</button>
                            </div>
                        </div>
                    )}

                    {/* Detail View */}
                    {selectedAnnouncement && !editingId && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col gap-2">
                                    {selectedAnnouncement.title && (
                                        <h3 className="text-2xl font-bold text-white">{selectedAnnouncement.title}</h3>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-400 font-mono">{selectedAnnouncement.date}</span>
                                        {selectedAnnouncement.tags && selectedAnnouncement.tags.length > 0 && (
                                            <div className="flex gap-1.5">
                                                {selectedAnnouncement.tags.map(tagId => {
                                                    const tagInfo = tags.find(t => t.id === tagId);
                                                    if (!tagInfo) return null;
                                                    return (
                                                        <span key={tagId} className={`text-xs px-2 py-0.5 rounded-full ${tagInfo.color}`}>
                                                            {tagInfo.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isDevMode && (
                                    <div className="flex gap-2 self-start">
                                        <button onClick={() => handleEdit(selectedAnnouncement)} className="p-2 bg-blue-900/50 text-blue-300 hover:bg-blue-600 hover:text-white rounded transition"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(selectedAnnouncement.id)} className="p-2 bg-red-900/50 text-red-300 hover:bg-red-600 hover:text-white rounded transition"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:text-slate-300 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-white prose-ul:text-slate-300 bg-slate-800/50 p-6 rounded-xl border border-slate-700 leading-relaxed">
                                <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{selectedAnnouncement.content}</Markdown>
                            </div>
                        </div>
                    )}

                    {/* List View (Timeline) */}
                    {!selectedAnnouncement && !editingId && (
                        <div className="space-y-4">
                            {sortedAnnouncements.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">目前沒有任何公告紀錄</div>
                            ) : (
                                sortedAnnouncements.map((ann, index) => (
                                    <div 
                                        key={ann.id} 
                                        onClick={() => setSelectedAnnouncement(ann)}
                                        className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-center gap-4 sm:w-1/4 shrink-0">
                                            <div className={`flex items-center justify-center w-3 h-3 rounded-full shadow-sm ${index === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-slate-600'}`}></div>
                                            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{ann.version}</span>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex flex-col gap-1">
                                                {ann.title && <span className="text-base font-bold text-white">{ann.title}</span>}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {ann.tags && ann.tags.length > 0 && (
                                                        <div className="flex gap-1.5">
                                                            {ann.tags.map(tagId => {
                                                                const tagInfo = tags.find(t => t.id === tagId);
                                                                if (!tagInfo) return null;
                                                                return (
                                                                    <span key={tagId} className={`text-[10px] px-2 py-0.5 rounded-full ${tagInfo.color}`}>
                                                                        {tagInfo.label}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-slate-400 line-clamp-1">
                                                        {ann.content.split('\n')[0].replace(/[#*`]/g, '').trim()}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono shrink-0 sm:self-start">{ann.date}</span>
                                        </div>

                                        {/* Dev Controls */}
                                        {isDevMode && (
                                            <div className="absolute top-3 right-3 sm:static sm:top-auto sm:right-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => handleEdit(ann, e)} className="p-1.5 bg-blue-900/50 text-blue-300 hover:bg-blue-600 hover:text-white rounded transition"><Edit2 size={14} /></button>
                                                <button onClick={(e) => handleDelete(ann.id, e)} className="p-1.5 bg-red-900/50 text-red-300 hover:bg-red-600 hover:text-white rounded transition"><Trash2 size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
