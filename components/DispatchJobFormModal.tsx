
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
    const currentList = (formData[activeTable] as AdventureMapItem[]) || [];
    if (!currentList.some(i => i.id === newItemId)) {
        setFormData({ ...formData, [activeTable]: [...currentList, { id: newItemId, isLowRate: false }] });
    }
    setNewItemId('');
  };

  const tables = [
    { key: 'badDrops', label: '狀況不佳' },
    { key: 'normalDrops', label: '普通完成' },
    { key: 'greatDrops', label: '大成功' },
    { key: 'specialDrops', label: '特殊掉落' },
    { key: 'hiddenDrops', label: '隱藏掉落' }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">配置派遣任務</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">1. 工作內容</label>
                <div className="flex flex-wrap gap-2">
                    {DISPATCH_TYPES.map(t => (
                        <button key={t} type="button" onClick={() => setFormData({...formData, name: t})} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formData.name === t ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>{t}</button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">2. 核心體能 (限定二項)</label>
                <div className="flex flex-wrap gap-2">
                    {DISPATCH_STATS.map(s => (
                        <button key={s} type="button" onClick={() => handleStatToggle(s)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formData.focusStats.includes(s) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>{s}</button>
                    ))}
                </div>
              </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <label className="block text-xs font-bold text-amber-500 uppercase mb-4 tracking-widest">3. 掉落表編輯</label>
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                {tables.map(tab => (
                    <button key={tab.key} type="button" onClick={() => setActiveTable(tab.key as any)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTable === tab.key ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{tab.label}</button>
                ))}
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex gap-2">
                    <select value={newItemId} onChange={e => setNewItemId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500">
                        <option value="">選擇道具...</option>
                        {itemList.sort((a,b)=>a.name.localeCompare(b.name)).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <button type="button" onClick={addItem} className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition">加入</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {((formData[activeTable] as AdventureMapItem[]) || []).map(item => {
                        const detail = itemList.find(i => i.id === item.id);
                        return (
                            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between group">
                                <span className="text-[10px] text-slate-300 truncate font-medium">{detail?.name || item.id}</span>
                                <button type="button" onClick={() => setFormData({...formData, [activeTable]: (formData[activeTable] as AdventureMapItem[]).filter(i => i.id !== item.id)})} className="text-red-500 hover:text-red-400 p-1">✕</button>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm text-slate-500 hover:text-white">取消</button>
          <button type="button" onClick={() => onSave(formData)} className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-xl">儲存工作</button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobFormModal;
