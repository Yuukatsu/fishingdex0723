
import React, { useState, useEffect, useRef } from 'react';
import { DispatchJob, Item, DispatchRequest, AdventureMapItem } from '../types';

interface DispatchJobFormModalProps {
  initialData?: DispatchJob | null;
  onSave: (job: DispatchJob) => void;
  onClose: () => void;
  itemList: Item[];
}

// Sub-component for managing a single reward list
const RewardListEditor = ({ 
    title, 
    items, 
    onChange, 
    itemList,
    colorClass 
}: { 
    title: string; 
    items: AdventureMapItem[]; 
    onChange: (newItems: AdventureMapItem[]) => void;
    itemList: Item[];
    colorClass: string;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState('');

    const handleAdd = () => {
        if (!selectedId) return;
        if (!items.some(i => i.id === selectedId)) {
            onChange([...items, { id: selectedId, isLowRate: false }]);
        }
        setSelectedId('');
        setSearchTerm('');
    };

    const handleRemove = (id: string) => {
        onChange(items.filter(i => i.id !== id));
    };

    const filteredOptions = itemList.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`p-3 rounded-lg border bg-slate-900/30 ${colorClass}`}>
            <label className="text-[10px] font-bold uppercase block mb-2 opacity-80">{title}</label>
            
            {/* List */}
            <div className="flex flex-wrap gap-2 mb-2">
                {items.map(item => {
                    const detail = itemList.find(i => i.id === item.id);
                    return (
                        <div key={item.id} className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded px-1.5 py-1">
                            {detail?.imageUrl && <img src={detail.imageUrl} className="w-4 h-4 object-contain" />}
                            <span className="text-[10px] text-slate-300">{detail?.name || item.id}</span>
                            <button type="button" onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 ml-1">×</button>
                        </div>
                    );
                })}
                {items.length === 0 && <span className="text-[10px] text-slate-600 italic">無獎勵</span>}
            </div>

            {/* Add Control */}
            <div className="flex gap-1">
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="搜尋..." 
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-1 text-[10px] text-white"
                />
                <select 
                    value={selectedId} 
                    onChange={e => setSelectedId(e.target.value)} 
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-1 text-[10px] text-white"
                >
                    <option value="">選擇...</option>
                    {filteredOptions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <button type="button" onClick={handleAdd} className="bg-slate-700 hover:bg-slate-600 text-white px-2 rounded text-[10px]">+</button>
            </div>
        </div>
    );
};

const DispatchJobFormModal: React.FC<DispatchJobFormModalProps> = ({ initialData, onSave, onClose, itemList }) => {
  const [formData, setFormData] = useState<DispatchJob>({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    dropSummary: '',
    requests: [],
    order: 99
  });

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  
  // Track tag inputs for each request independently: { requestId: tagInputValue }
  const [requestTagInputs, setRequestTagInputs] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            name: initialData.name || '',
            description: initialData.description || '',
            imageUrl: initialData.imageUrl || '',
            dropSummary: initialData.dropSummary || '',
            requests: initialData.requests || [],
            order: initialData.order ?? 99
        });
    } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  // Image Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const SIZE = 256;
              canvas.width = SIZE;
              canvas.height = SIZE;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  // Center crop
                  const ratio = Math.max(SIZE / img.width, SIZE / img.height);
                  const centerShift_x = (SIZE - img.width * ratio) / 2;
                  const centerShift_y = (SIZE - img.height * ratio) / 2;
                  ctx.clearRect(0,0,SIZE,SIZE);
                  ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                  setFormData(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/png') }));
              }
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  // Request Handlers
  const addRequest = () => {
      const newReq: DispatchRequest = {
          id: Date.now().toString(),
          name: '新委託',
          tags: [],
          rewardsNormal: [],
          rewardsGreat: [],
          rewardsSuper: []
      };
      setFormData(prev => ({ ...prev, requests: [...prev.requests, newReq] }));
      setActiveRequestId(newReq.id);
  };

  const removeRequest = (id: string) => {
      if (window.confirm("確定刪除此委託？")) {
          setFormData(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== id) }));
          if (activeRequestId === id) setActiveRequestId(null);
      }
  };

  const updateRequest = (reqId: string, field: keyof DispatchRequest, value: any) => {
      setFormData(prev => ({
          ...prev,
          requests: prev.requests.map(r => r.id === reqId ? { ...r, [field]: value } : r)
      }));
  };

  // Tag Management for Requests
  const updateTagInput = (reqId: string, val: string) => {
      setRequestTagInputs(prev => ({ ...prev, [reqId]: val }));
  };

  const addRequestTag = (reqId: string) => {
      const input = requestTagInputs[reqId]?.trim();
      if (!input) return;
      
      const request = formData.requests.find(r => r.id === reqId);
      if (request && !request.tags?.includes(input)) {
          const currentTags = request.tags || [];
          updateRequest(reqId, 'tags', [...currentTags, input]);
          updateTagInput(reqId, '');
      }
  };

  const removeRequestTag = (reqId: string, tagToRemove: string) => {
      const request = formData.requests.find(r => r.id === reqId);
      if (request) {
          const currentTags = request.tags || [];
          updateRequest(reqId, 'tags', currentTags.filter(t => t !== tagToRemove));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return alert("請輸入企業名稱");
      onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯企業與委託' : '新增企業與委託'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
            
            {/* 1. Enterprise Info */}
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Image Upload */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                    >
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl opacity-50">🏢</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold text-white">上傳 Logo</div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <span className="text-[10px] text-slate-500">256 x 256</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">企業名稱</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                            placeholder="例如: 寶可夢中心快遞"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">掉落物概略 (Drop Summary)</label>
                        <input 
                            type="text" 
                            value={formData.dropSummary || ''} 
                            onChange={e => setFormData({...formData, dropSummary: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none placeholder-slate-600"
                            placeholder="例如: 基礎球果、回復藥、進化石碎片"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">此欄位僅用於卡片外部顯示，讓玩家快速了解該企業的主要產出。</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800"></div>

            {/* 2. Requests Management */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-300">📋 委託列表</h3>
                    <button type="button" onClick={addRequest} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow flex items-center gap-1">
                        <span>＋</span> 新增委託
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.requests.map((req, index) => {
                        const isOpen = activeRequestId === req.id;
                        return (
                            <div key={req.id} className={`border rounded-xl transition-all ${isOpen ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/40 border-slate-700'}`}>
                                {/* Accordion Header */}
                                <div className="p-3 flex justify-between items-center cursor-pointer select-none" onClick={() => setActiveRequestId(isOpen ? null : req.id)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                                        <span className={`text-sm font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>{req.name}</span>
                                        {/* Tag Preview in Header */}
                                        {!isOpen && req.tags && req.tags.length > 0 && (
                                            <div className="flex gap-1 ml-2">
                                                {req.tags.slice(0, 3).map(t => <span key={t} className="text-[9px] bg-slate-700 px-1 rounded text-slate-300">{t}</span>)}
                                                {req.tags.length > 3 && <span className="text-[9px] text-slate-500">...</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); removeRequest(req.id); }}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                        <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {/* Accordion Content */}
                                {isOpen && (
                                    <div className="p-4 pt-0 border-t border-slate-700/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                            {/* Request Name Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">委託名稱</label>
                                                <input 
                                                    type="text" 
                                                    value={req.name} 
                                                    onChange={e => updateRequest(req.id, 'name', e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                                                />
                                            </div>

                                            {/* Request Tags Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">標籤 (Tags)</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input 
                                                        type="text" 
                                                        value={requestTagInputs[req.id] || ''} 
                                                        onChange={e => updateTagInput(req.id, e.target.value)} 
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequestTag(req.id))}
                                                        placeholder="#耐力 #力量 (Enter新增)" 
                                                        className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                                                    />
                                                    <button type="button" onClick={() => addRequestTag(req.id)} className="bg-slate-700 px-3 py-1 text-xs text-white rounded hover:bg-slate-600">加入</button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {req.tags?.map((tag, i) => (
                                                        <span key={i} className="text-xs bg-blue-900/30 text-blue-200 px-2 py-1 rounded border border-blue-800 flex items-center gap-1">
                                                            {tag}
                                                            <button type="button" onClick={() => removeRequestTag(req.id, tag)} className="text-red-400 hover:text-white ml-1">×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rewards Columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <RewardListEditor 
                                                title="✅ 完成獎勵" 
                                                items={req.rewardsNormal} 
                                                onChange={(items) => updateRequest(req.id, 'rewardsNormal', items)}
                                                itemList={itemList}
                                                colorClass="border-blue-500/30 text-blue-200"
                                            />
                                            <RewardListEditor 
                                                title="✨ 幹得好獎勵" 
                                                items={req.rewardsGreat} 
                                                onChange={(items) => updateRequest(req.id, 'rewardsGreat', items)}
                                                itemList={itemList}
                                                colorClass="border-emerald-500/30 text-emerald-200"
                                            />
                                            <RewardListEditor 
                                                title="🏆 超級成功獎勵" 
                                                items={req.rewardsSuper} 
                                                onChange={(items) => updateRequest(req.id, 'rewardsSuper', items)}
                                                itemList={itemList}
                                                colorClass="border-amber-500/30 text-amber-200"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {formData.requests.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs border-2 border-dashed border-slate-800 rounded-xl">
                            尚未新增任何委託
                        </div>
                    )}
                </div>
            </div>

        </form>

        <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm text-slate-500 hover:text-white font-medium transition">取消</button>
          <button type="button" onClick={handleSubmit} className="px-8 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl shadow-xl hover:bg-purple-500 transition">儲存</button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobFormModal;
