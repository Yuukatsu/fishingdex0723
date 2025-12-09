
import React, { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { WeeklyEvent, Fish, Rarity, RARITY_ORDER } from '../types';
import FishCard from './FishCard';

interface WeeklyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
  fishList: Fish[];
  onFishClick: (fish: Fish) => void;
}

const WeeklyEventModal: React.FC<WeeklyEventModalProps> = ({ isOpen, onClose, isDevMode, fishList, onFishClick }) => {
  const [events, setEvents] = useState<WeeklyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newDateStart, setNewDateStart] = useState('');
  const [newDateEnd, setNewDateEnd] = useState('');
  
  // Selection States Map: Rarity -> Array of 3 slots (strings of IDs)
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen || !db) return;

    // Initialize selections state structure
    const initSelections: Record<string, string[]> = {};
    RARITY_ORDER.forEach(r => {
        initSelections[r] = ['', '', ''];
    });
    setSelections(initSelections);

    const q = query(collection(db, 'weekly_events'), orderBy('startDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WeeklyEvent));
      setEvents(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleSelectionChange = (rarity: string, index: number, value: string) => {
    setSelections(prev => {
        const newArr = [...(prev[rarity] || ['', '', ''])];
        newArr[index] = value;
        return { ...prev, [rarity]: newArr };
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!newDateStart || !newDateEnd) {
      alert("請填寫日期");
      return;
    }
    
    // Collect all valid IDs
    const targetFishIds: string[] = [];
    Object.values(selections).forEach(slots => {
        slots.forEach(id => {
            if (id) targetFishIds.push(id);
        });
    });

    if (targetFishIds.length === 0) {
        alert("請至少選擇一隻魚");
        return;
    }

    try {
      await addDoc(collection(db, 'weekly_events'), {
        startDate: newDateStart,
        endDate: newDateEnd,
        targetFishIds: targetFishIds
      });
      
      // Reset form
      setNewDateStart('');
      setNewDateEnd('');
      const initSelections: Record<string, string[]> = {};
      RARITY_ORDER.forEach(r => {
          initSelections[r] = ['', '', ''];
      });
      setSelections(initSelections);

    } catch (err) {
      console.error("Error adding event:", err);
      alert("新增失敗");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!db || !window.confirm("確定要刪除此活動嗎？")) return;
    try {
      await deleteDoc(doc(db, 'weekly_events', id));
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("刪除失敗");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📅 本周機率加倍
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">載入中...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
              目前沒有加倍活動
            </div>
          ) : (
            <div className="space-y-6">
              {events.map(event => (
                <div key={event.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 relative group">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-2">
                    <div className="flex items-center gap-2">
                         <span className="text-2xl">🔥</span>
                         <div>
                            <h3 className="text-white font-bold text-lg">加倍活動</h3>
                            <div className="text-xs text-blue-300 font-mono">
                                {event.startDate} ~ {event.endDate}
                            </div>
                         </div>
                    </div>

                    {isDevMode && (
                        <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 bg-red-900/50 text-red-300 rounded hover:bg-red-600 hover:text-white transition"
                        title="刪除活動"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        </button>
                    )}
                  </div>
                  
                  {/* Cards Grid */}
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                     {event.targetFishIds.map(fishId => {
                         const fish = fishList.find(f => f.id === fishId);
                         if (!fish) return null;
                         return (
                            <div key={fishId} className="w-24 sm:w-28 flex-shrink-0">
                                <FishCard 
                                    fish={fish} 
                                    viewMode="simple" 
                                    isDevMode={false} // Disable delete/edit buttons in this view
                                    onEdit={() => {}}
                                    onDelete={() => {}}
                                    onClick={onFishClick}
                                />
                            </div>
                         );
                     })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dev Add Form */}
        {isDevMode && (
          <div className="p-4 bg-slate-950 border-t border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">新增活動 (開發者)</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">開始日期</label>
                  <input 
                    type="date" 
                    value={newDateStart}
                    onChange={e => setNewDateStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">結束日期</label>
                  <input 
                    type="date" 
                    value={newDateEnd}
                    onChange={e => setNewDateEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white"
                  />
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-4 overflow-x-auto">
                 {RARITY_ORDER.map(rarity => {
                     const fishInRarity = fishList.filter(f => f.rarity === rarity);
                     return (
                         <div key={rarity} className="min-w-[300px]">
                            <h4 className="text-xs text-slate-400 font-bold mb-2">{rarity} 稀有度池 (最多選3個)</h4>
                            <div className="flex gap-2">
                                {[0, 1, 2].map(slotIndex => (
                                    <div key={slotIndex} className="flex-1">
                                        <select
                                            value={selections[rarity]?.[slotIndex] || ''}
                                            onChange={e => handleSelectionChange(rarity, slotIndex, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">-- 選填 --</option>
                                            {fishInRarity.map(f => (
                                                <option key={f.id} value={f.id}>
                                                    (Int: {f.internalId ?? '?'}) {f.id} - {f.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                         </div>
                     );
                 })}
              </div>

              <div className="flex justify-end">
                 <button 
                   type="submit"
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg"
                 >
                   發布活動
                 </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyEventModal;
