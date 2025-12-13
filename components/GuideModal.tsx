
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, isDevMode }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && db) {
      setLoading(true);
      const fetchGuide = async () => {
        try {
          const docRef = doc(db, 'app_settings', 'guide');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().guideImageUrl) {
            setImageUrl(docSnap.data().guideImageUrl);
          }
        } catch (error) {
          console.error("Error fetching guide:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGuide();
    }
  }, [isOpen]);

  const handleUpdateImage = async (newUrl: string) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'app_settings', 'guide'), { guideImageUrl: newUrl }, { merge: true });
      setImageUrl(newUrl);
    } catch (error) {
      console.error("Error updating guide image:", error);
      alert("更新失敗");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side resizing to avoid large payloads in Firestore
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Limit max width for guide (e.g., 1024px)
        const MAX_WIDTH = 1024;
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG 80% quality
          handleUpdateImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📖 釣魚指南
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
          {loading ? (
             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : imageUrl ? (
             <img src={imageUrl} alt="Guide" className="max-w-full h-auto shadow-lg rounded" />
          ) : (
             <div className="text-slate-500 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <p>目前尚無指南資訊</p>
                {isDevMode && <p className="text-sm mt-2 text-blue-400">請在下方上傳圖片</p>}
             </div>
          )}
        </div>

        {isDevMode && (
          <div className="p-4 border-t border-slate-700 bg-slate-900">
             <div className="flex gap-4 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Admin Control</span>
                <input 
                  type="text" 
                  placeholder="輸入圖片 URL..." 
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleUpdateImage(e.currentTarget.value);
                          e.currentTarget.value = '';
                      }
                  }}
                />
                <span className="text-slate-600 text-xs">or</span>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition">
                    上傳圖片
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideModal;
