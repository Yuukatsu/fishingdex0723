
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { WeeklyEvent } from '../types';

interface WeeklyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

const WeeklyEventModal: React.FC<WeeklyEventModalProps> = ({ isOpen, onClose, isDevMode }) => {
  const [events, setEvents] = useState<WeeklyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newDateStart, setNewDateStart] = useState('');
  const [newDateEnd, setNewDateEnd] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !db) return;

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 64; 
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; 
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setNewImage(canvas.toDataURL('image/png'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!newDateStart || !newDateEnd || !newTitle) {
      alert("請填寫完整資訊");
      return;
    }

    try {
      await addDoc(collection(db, 'weekly_events'), {
        startDate: newDateStart,
        endDate: newDateEnd,
        title: newTitle,
        imageUrl: newImage
      });
      // Reset form
      setNewTitle('');
      setNewImage('');
      // Dates kept for convenience or reset? Let's reset.
      setNewDateStart('');
      setNewDateEnd('');
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
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📅 本周機率加倍
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500">載入中...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
              目前沒有加倍活動
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex gap-4 items-center relative group">
                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-900 rounded-lg border border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain [image-rendering:pixelated]" />
                    ) : (
                      <span className="text-2xl">?</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="text-xs text-blue-300 font-mono mb-1">
                      {event.startDate} ~ {event.endDate}
                    </div>
                    <h3 className="text-white font-bold">{event.title}</h3>
                  </div>

                  {/* Dev Delete */}
                  {isDevMode && (
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-900/50 text-red-300 rounded hover:bg-red-600 hover:text-white transition opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dev Add Form */}
        {isDevMode && (
          <div className="p-4 bg-slate-950 border-t border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">新增活動 (開發者)</h3>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
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
              
              <div>
                <label className="text-xs text-slate-500 block mb-1">對象花紋/名稱</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="例如: 虎斑紋加倍"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-white"
                />
              </div>

              <div className="flex gap-2 items-center">
                 <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded flex items-center justify-center overflow-hidden">
                    {newImage ? (
                      <img src={newImage} className="w-full h-full object-contain [image-rendering:pixelated]" />
                    ) : (
                      <span className="text-xs text-slate-600">圖</span>
                    )}
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleImageUpload}
                   accept="image/*"
                   className="hidden"
                 />
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="flex-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded"
                 >
                   上傳圖片 (自動縮放)
                 </button>
                 <button 
                   type="submit"
                   className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded"
                 >
                   新增
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
