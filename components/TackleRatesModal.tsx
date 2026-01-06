
import React, { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RARITY_ORDER, RARITY_COLORS } from '../types';

interface TackleRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

interface RateData {
    id: string; // Unique ID for key
    name: string;
    rates: Record<string, string>; // Rarity -> Rate string (e.g. "10%")
}

const TackleRatesModal: React.FC<TackleRatesModalProps> = ({ isOpen, onClose, isDevMode }) => {
  const [rates, setRates] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Temp state for editing
  const [tempRates, setTempRates] = useState<RateData[]>([]);

  useEffect(() => {
    if (isOpen && db) {
        const fetchData = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'app_settings', 'tackle_rates');
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().data) {
                    setRates(snap.data().data);
                } else {
                    // Default Data if empty
                    setRates([
                        { id: '1', name: '破舊釣竿', rates: { '★': '50%', '★★': '30%', '★★★': '15%', '★★★★': '5%', '◆': '0%' } },
                        { id: '2', name: '好釣竿', rates: { '★': '30%', '★★': '40%', '★★★': '20%', '★★★★': '10%', '◆': '0%' } },
                    ]);
                }
            } catch (e) {
                console.error("Fetch rates error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [isOpen]);

  const handleEdit = () => {
      setTempRates(JSON.parse(JSON.stringify(rates))); // Deep copy
      setIsEditing(true);
  };

  const handleCancel = () => {
      setIsEditing(false);
  };

  const handleSave = async () => {
      if (!db) return;
      try {
          // Filter out rows with empty names
          const finalData = tempRates.filter(r => r.name.trim() !== '');
          await setDoc(doc(db, 'app_settings', 'tackle_rates'), { data: finalData }, { merge: true });
          setRates(finalData);
          setIsEditing(false);
      } catch (e) {
          alert("儲存失敗");
      }
  };

  const updateTempRate = (idx: number, field: string, value: string) => {
      const newData = [...tempRates];
      if (field === 'name') {
          newData[idx].name = value;
      } else {
          newData[idx].rates[field] = value;
      }
      setTempRates(newData);
  };

  const addNewRow = () => {
      setTempRates([...tempRates, { 
          id: Date.now().toString(), 
          name: '', 
          rates: { '★': '', '★★': '', '★★★': '', '★★★★': '', '◆': '' } 
      }]);
  };

  const deleteRow = (idx: number) => {
      if (window.confirm("確定刪除此列?")) {
          const newData = [...tempRates];
          newData.splice(idx, 1);
          setTempRates(newData);
      }
  };

  if (!isOpen) return null;

  const displayData = isEditing ? tempRates : rates;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-5xl w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold text-white">釣竿機率分布表</h2>
          </div>
          <div className="flex gap-3">
            {isDevMode && !isEditing && (
                <button onClick={handleEdit} className="text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-bold transition">編輯表格</button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-slate-900/50">
            {loading ? (
                <div className="text-center py-10 text-slate-500">載入中...</div>
            ) : (
                <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="p-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 bg-slate-900/80 sticky top-0 z-10 w-[200px]">釣竿名稱</th>
                            {RARITY_ORDER.map(rarity => {
                                const color = RARITY_COLORS[rarity].split(' ')[0]; // Extract text-color class
                                return (
                                    <th key={rarity} className={`p-3 text-center text-sm font-black border-b border-slate-700 bg-slate-900/80 sticky top-0 z-10 ${color}`}>
                                        {rarity}
                                    </th>
                                );
                            })}
                            {isEditing && <th className="p-3 border-b border-slate-700 bg-slate-900/80 sticky top-0 z-10 w-[50px]"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {displayData.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-3">
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={row.name} 
                                            onChange={e => updateTempRate(idx, 'name', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                            placeholder="輸入釣竿名稱..."
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-slate-200">{row.name}</span>
                                    )}
                                </td>
                                {RARITY_ORDER.map(rarity => (
                                    <td key={rarity} className="p-3 text-center">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={row.rates[rarity] || ''} 
                                                onChange={e => updateTempRate(idx, rarity, e.target.value)}
                                                className="w-full text-center bg-slate-800 border border-slate-600 rounded px-1 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                            />
                                        ) : (
                                            <span className="text-sm text-slate-400 font-mono">{row.rates[rarity] || '-'}</span>
                                        )}
                                    </td>
                                ))}
                                {isEditing && (
                                    <td className="p-3 text-center">
                                        <button onClick={() => deleteRow(idx)} className="text-red-500 hover:text-red-400 font-bold px-2">×</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {isEditing && (
                <div className="mt-4">
                    <button onClick={addNewRow} className="w-full py-2 bg-slate-800 border border-dashed border-slate-600 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-700 hover:text-white transition">
                        + 新增一列
                    </button>
                </div>
            )}
        </div>

        {isEditing && (
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                <button onClick={handleCancel} className="px-5 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition">取消</button>
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg">儲存變更</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TackleRatesModal;
