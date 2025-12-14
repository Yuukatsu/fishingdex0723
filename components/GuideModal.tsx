
import React, { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onUpdate: (newUrl: string) => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, currentUrl, onUpdate }) => {
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentUrl);
    }
  }, [isOpen, currentUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setSaving(true);
    try {
      // Clean up input (remove spaces)
      const cleanUrl = urlInput.trim();
      
      await setDoc(doc(db, 'app_settings', 'guide'), { guideImageUrl: cleanUrl }, { merge: true });
      onUpdate(cleanUrl);
      alert("指南連結已更新！");
      onClose();
    } catch (error: any) {
      console.error("Error updating guide url:", error);
      if (error.code === 'permission-denied') {
          alert("權限不足 (Permission Denied)！\n請確認您有寫入 app_settings 的權限。");
      } else {
          alert(`更新失敗: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔗 設定指南連結
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">目標網頁網址 (URL)</label>
                <input 
                    type="url" 
                    required
                    placeholder="https://..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">玩家點擊「釣魚指南」按鈕時，將會開啟此網頁。</p>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 mr-2 text-slate-300 hover:text-white transition"
                >
                    取消
                </button>
                <button 
                    type="submit" 
                    disabled={saving}
                    className={`px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {saving ? '儲存中...' : '儲存變更'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default GuideModal;

