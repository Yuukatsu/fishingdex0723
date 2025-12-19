
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
            else setContent("請輸入派遣工作的相關規則與名詞解釋。");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">📜 派遣工作指南</h2>
          <div className="flex gap-2">
            {isDevMode && !isEditing && (
                <button onClick={() => { setTempContent(content); setIsEditing(true); }} className="text-xs bg-blue-600 px-2 py-1 rounded text-white">編輯</button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isEditing ? (
                <textarea 
                    value={tempContent} 
                    onChange={e => setTempContent(e.target.value)} 
                    className="w-full h-full min-h-[300px] bg-slate-950 border border-slate-700 rounded p-4 text-sm text-slate-200 outline-none focus:border-blue-500 font-mono"
                />
            ) : (
                <div className="text-sm text-slate-300 leading-loose whitespace-pre-wrap">
                    {content}
                </div>
            )}
        </div>

        {isEditing && (
            <div className="p-4 border-t border-slate-700 bg-slate-950 flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500">取消</button>
                <button onClick={handleSave} className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded">儲存指南</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DispatchGuideModal;
