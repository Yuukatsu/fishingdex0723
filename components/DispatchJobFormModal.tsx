
import React, { useState, useEffect } from 'react';
import { DispatchJob, Item, DispatchStat, DISPATCH_STATS, DISPATCH_TYPES, AdventureMapItem } from '../types';

interface DispatchJobFormModalProps {
  initialData?: DispatchJob | null;
  onSave: (job: DispatchJob) => void;
  onClose: () => void;
  itemList: Item[];
}

const DispatchJobFormModal: React.FC<DispatchJobFormModalProps> = ({ initialData, onSave, onClose, itemList }) => {
  const [formData, setFormData] = useState<DispatchJob>({
    id: '',
    name: DISPATCH_TYPES[0],
    focusStats: [DISPATCH_STATS[0], DISPATCH_STATS[1]],
    badDrops: [],
    normalDrops: [],
    greatDrops: [],
    specialDrops: [],
    hiddenDrops: [],
    order: 99
  });

  const [activeTable, setActiveTable] = useState<keyof DispatchJob>('normalDrops');
  const [newItemId, setNewItemId] = useState('');

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleStatToggle = (stat: DispatchStat) => {
    const current = [...formData.focusStats];
    if (current.includes(stat)) {
        if (current.length <= 1) return;
        setFormData({ ...formData, focusStats: current.filter(s => s !== stat) });
    } else {
        if (current.length >= 2) current.shift();
        setFormData({ ...formData, focusStats: [...current, stat] });
    }
  };

  const addItem = () => {
    if (!newItemId) return;
    const currentList = formData[activeTable] as AdventureMapItem[];
    if (!currentList.some(i => i.id === newItemId)) {
        setFormData({ ...formData, [activeTable]: [...currentList, { id: newItemId, isLowRate: false }] });
    }
    setNewItemId('');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯派遣' : '新增派遣'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">工作內容</label>
                <div className="flex flex-wrap gap-2">
                    {DISPATCH_TYPES.map(t => (
                        <button key={t} onClick={() => setFormData({...formData, name: t})} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.name === t ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{t}</button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">重點體能 (選二)</label>
                <div className="flex flex-wrap gap-2">
                    {DISPATCH_STATS.map(s => (
                        <button key={s} onClick={() => handleStatToggle(s)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.focusStats.includes(s) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{s}</button>
                    ))}
                </div>
              </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <label className="block text-xs font-bold text-amber-400 uppercase mb-4">📦 評價掉落表配置</label>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                    {key: 'badDrops', label: '狀況不佳'},
                    {key: 'normalDrops', label: '普通完成'},
                    {key: 'greatDrops', label: '大成功'},
                    {key: 'specialDrops', label: '特殊掉落'},
                    {key: 'hiddenDrops', label: '隱藏掉落'}
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTable(tab.key as any)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTable === tab.key ? 'bg-amber-600 border-amber-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{tab.label}</button>
                ))}
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
                <div className="flex gap-2">
                    <select value={newItemId} onChange={e => setNewItemId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-600 text-white text-xs rounded px-3 py-2 focus:border-blue-500 outline-none">
                        <option value="">選擇道具加入...</option>
                        {itemList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <button onClick={addItem} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded">加入</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(formData[activeTable] as AdventureMapItem[]).map(item => {
                        const detail = itemList.find(i => i.id === item.id);
                        return (
                            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center justify-between group">
                                <span className="text-[10px] text-slate-300 truncate">{detail?.name || item.id}</span>
                                <button onClick={() => setFormData({...formData, [activeTable]: (formData[activeTable] as AdventureMapItem[]).filter(i => i.id !== item.id)})} className="text-red-500 hover:text-red-400">✕</button>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-950 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm text-slate-400 hover:text-white">取消</button>
          <button onClick={() => onSave(formData)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg">儲存派遣</button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobFormModal;
