
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
    name: '',
    description: 'Dispatch Job',
    primaryStat: DISPATCH_STATS[0],
    secondaryStat: DISPATCH_STATS[1],
    badDrops: [],
    normalDrops: [],
    greatDrops: [],
    specialDrops: [],
    hiddenDrops: [],
    order: 99
  });

  // UI State
  const [activeTable, setActiveTable] = useState<keyof DispatchJob>('normalDrops');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [newItemId, setNewItemId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            description: initialData.description || 'Dispatch Job',
            primaryStat: initialData.primaryStat || DISPATCH_STATS[0],
            secondaryStat: initialData.secondaryStat || DISPATCH_STATS[1],
            // 確保所有陣列都已初始化，避免 undefined 錯誤
            badDrops: initialData.badDrops || [],
            normalDrops: initialData.normalDrops || [],
            greatDrops: initialData.greatDrops || [],
            specialDrops: initialData.specialDrops || [],
            hiddenDrops: initialData.hiddenDrops || [],
        });
    } else {
        // 新增模式預設值
        setFormData(prev => ({ ...prev, name: DISPATCH_TYPES[0] }));
    }
  }, [initialData]);

  // --- 道具管理邏輯 ---
  const addItem = () => {
    if (!newItemId) return;
    
    // 強制轉型以確保 TS 知道這是陣列
    const currentList = (formData[activeTable] as AdventureMapItem[]) || [];
    
    if (!currentList.some(i => i.id === newItemId)) {
        const newItem: AdventureMapItem = { id: newItemId, isLowRate: false };
        setFormData({ ...formData, [activeTable]: [...currentList, newItem] });
    }
    setNewItemId('');
    setItemSearchTerm(''); // 加入後清空搜尋
  };

  const removeItem = (id: string) => {
      const currentList = (formData[activeTable] as AdventureMapItem[]) || [];
      setFormData({ ...formData, [activeTable]: currentList.filter(i => i.id !== id) });
  };

  const toggleLowRate = (id: string) => {
      const currentList = (formData[activeTable] as AdventureMapItem[]) || [];
      const updatedList = currentList.map(item => {
          if (item.id === id) return { ...item, isLowRate: !item.isLowRate };
          return item;
      });
      setFormData({ ...formData, [activeTable]: updatedList });
  };

  // 篩選可選道具
  const filteredItems = itemList.filter(i => 
      i.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const tables = [
    { key: 'badDrops', label: '狀況不佳', color: 'text-slate-400' },
    { key: 'normalDrops', label: '普通完成', color: 'text-blue-400' },
    { key: 'greatDrops', label: '大成功', color: 'text-emerald-400' },
    { key: 'specialDrops', label: '特殊發現', color: 'text-amber-400' },
    { key: 'hiddenDrops', label: '隱藏獎勵', color: 'text-purple-400' }
  ];

  const handleSave = async () => {
      if (isSaving) return;
      
      if (!formData.name.trim()) {
          alert("請輸入工作名稱！");
          return;
      }
      
      if (formData.primaryStat === formData.secondaryStat) {
          alert("主要體能與次要體能不能相同！");
          return;
      }
      
      setIsSaving(true);
      try {
          await onSave(formData);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯派遣任務' : '新增派遣任務'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. 工作內容 & 敘述 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">1. 工作內容</label>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                        placeholder="名稱 (例如：深海探勘)"
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs text-slate-500 flex items-center mr-1">常用:</span>
                        {DISPATCH_TYPES.map(t => (
                            <button 
                                key={t} 
                                type="button" 
                                onClick={() => setFormData({...formData, name: t})} 
                                className={`px-3 py-1 rounded text-xs border transition-all ${formData.name === t ? 'bg-purple-900/50 border-purple-500 text-purple-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest mt-4">簡短敘述</label>
                    <input 
                        type="text" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none text-sm"
                        placeholder="敘述 (例如：派遣隊伍前往深海)"
                    />
                </div>
              </div>

              {/* 2. 核心體能 (主要與次要) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">2. 核心體能配置</label>
                
                <div className="space-y-4">
                    {/* Primary Stat */}
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <label className="block text-[10px] text-amber-500 font-bold mb-2 uppercase">👑 主要體能 (權重高)</label>
                        <div className="flex flex-wrap gap-2">
                            {DISPATCH_STATS.map(s => (
                                <button 
                                    key={s} 
                                    type="button" 
                                    onClick={() => setFormData({...formData, primaryStat: s})} 
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.primaryStat === s ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Stat */}
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <label className="block text-[10px] text-blue-400 font-bold mb-2 uppercase">🥈 次要體能 (權重中)</label>
                        <div className="flex flex-wrap gap-2">
                            {DISPATCH_STATS.map(s => (
                                <button 
                                    key={s} 
                                    type="button" 
                                    onClick={() => setFormData({...formData, secondaryStat: s})} 
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.secondaryStat === s ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">3. 評價掉落表配置</label>
            
            {/* 分頁切換 */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {tables.map(tab => (
                    <button 
                        key={tab.key} 
                        type="button" 
                        onClick={() => setActiveTable(tab.key as any)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTable === tab.key ? `bg-slate-800 border-current ${tab.color} shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 space-y-4 min-h-[300px]">
                {/* 搜尋與添加工具列 */}
                <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input 
                        type="text"
                        value={itemSearchTerm}
                        onChange={e => setItemSearchTerm(e.target.value)}
                        placeholder="搜尋道具..."
                        className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500 min-w-[120px]"
                    />
                    <select 
                        value={newItemId} 
                        onChange={e => setNewItemId(e.target.value)} 
                        className="flex-[2] bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="">{filteredItems.length === 0 ? '無符合道具' : '選擇道具加入...'}</option>
                        {filteredItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <button type="button" onClick={addItem} className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition shadow-lg whitespace-nowrap">加入</button>
                </div>

                {/* 道具列表 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {((formData[activeTable] as AdventureMapItem[]) || []).map(item => {
                        const detail = itemList.find(i => i.id === item.id);
                        return (
                            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center gap-3 group hover:border-slate-500 transition">
                                <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center flex-shrink-0 border border-slate-700 overflow-hidden">
                                    {detail?.imageUrl ? <img src={detail.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" /> : <span className="text-xs">?</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs text-slate-200 truncate block font-medium">{detail?.name || item.id}</span>
                                    <label className="flex items-center gap-1.5 cursor-pointer mt-1 select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={item.isLowRate || false} 
                                            onChange={() => toggleLowRate(item.id)}
                                            className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-red-500 focus:ring-0"
                                        />
                                        <span className={`text-[10px] ${item.isLowRate ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                            {item.isLowRate ? '低機率' : '一般'}
                                        </span>
                                    </label>
                                </div>
                                <button type="button" onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-full hover:bg-slate-700 transition">✕</button>
                            </div>
                        );
                    })}
                    {((formData[activeTable] as AdventureMapItem[]) || []).length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-600 text-xs italic border-2 border-dashed border-slate-800 rounded-lg">
                            此評價目前沒有設定獎勵
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm text-slate-500 hover:text-white font-medium transition" disabled={isSaving}>取消</button>
          <button type="button" onClick={handleSave} disabled={isSaving} className={`px-8 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl shadow-xl transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'}`}>
              {isSaving ? '儲存中...' : '儲存任務'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchJobFormModal;
