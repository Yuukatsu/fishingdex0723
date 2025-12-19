
import React, { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface DispatchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

const DispatchGuideModal: React.FC<DispatchGuideModalProps> = ({ isOpen, onClose, isDevMode }) => {
  const [content, setContent] = useState<string>('載入中...');
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState('');

  useEffect(() => {
    if (isOpen && db) {
        const fetchGuide = async () => {
            const d = await getDoc(doc(db, 'app_settings', 'dispatch_guide'));
            if (d.exists()) setContent(d.data().content);
            else setContent("請輸入派遣任務相關名詞解釋。\n\n例如：\n【耐力】影響派遣過程中評價的穩定度...\n【力量】增加大成功評定的發生機率...");
        };
        fetchGuide();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!db) return;
    await setDoc(doc(db, 'app_settings', 'dispatch_guide'), { content: tempContent }, { merge: true });
    setContent(tempContent);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-[2.5rem] max-w-2xl w-full shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[85vh] border-opacity-50"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
              <span className="text-3xl">📋</span>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">派遣任務名詞指南</h2>
          </div>
          <div className="flex gap-3">
            {isDevMode && !isEditing && (
                <button onClick={() => { setTempContent(content); setIsEditing(true); }} className="text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-white font-black transition-all shadow-lg shadow-blue-900/20 border border-blue-400/30">編輯指南</button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white transition p-2 bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-slate-900/20">
            {isEditing ? (
                <textarea 
                    value={tempContent} 
                    onChange={e => setTempContent(e.target.value)} 
                    className="w-full h-full min-h-[450px] bg-black/40 border border-slate-700 rounded-3xl p-8 text-sm text-slate-300 outline-none focus:border-blue-500 font-mono leading-relaxed shadow-inner"
                    placeholder="在此輸入指南內容..."
                />
            ) : (
                <div className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-medium tracking-wide">
                    {content}
                </div>
            )}
        </div>

        {isEditing && (
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-xs text-slate-500 font-bold hover:text-slate-300 transition">放棄編輯</button>
                <button onClick={handleSave} className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-green-900/20 transition-all border border-green-400/30">發布更新</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DispatchGuideModal;
