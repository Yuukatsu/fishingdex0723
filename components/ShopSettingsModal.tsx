
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh parent
}

interface ShopData {
    imageUrl: string;
    url: string;
    isVisible?: boolean; // Only for event shop
}

interface AllShopsData {
    sp: ShopData;
    exchange: ShopData;
    event: ShopData;
}

const DEFAULT_SHOP_DATA: ShopData = { imageUrl: '', url: '' };

const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({ isOpen, onClose, onUpdate }) => {
  const [data, setData] = useState<AllShopsData>({
      sp: { ...DEFAULT_SHOP_DATA },
      exchange: { ...DEFAULT_SHOP_DATA },
      event: { ...DEFAULT_SHOP_DATA, isVisible: false }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs for file inputs
  const spInputRef = useRef<HTMLInputElement>(null);
  const exchangeInputRef = useRef<HTMLInputElement>(null);
  const eventInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && db) {
        setLoading(true);
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'app_settings', 'shops');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // Merge with defaults to ensure structure
                    const serverData = docSnap.data() as Partial<AllShopsData>;
                    setData({
                        sp: { ...DEFAULT_SHOP_DATA, ...serverData.sp },
                        exchange: { ...DEFAULT_SHOP_DATA, ...serverData.exchange },
                        event: { ...DEFAULT_SHOP_DATA, isVisible: false, ...serverData.event }
                    });
                }
            } catch (e) {
                console.error("Error fetching shop settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof AllShopsData) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              // Resize logic: Standard banner width usually around 600-800px max is enough for web
              const MAX_WIDTH = 600;
              let width = img.width;
              let height = img.height;

              if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.drawImage(img, 0, 0, width, height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // JPEG 85% quality
                  
                  setData(prev => ({
                      ...prev,
                      [key]: { ...prev[key], imageUrl: dataUrl }
                  }));
              }
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
  };

  const handleChange = (key: keyof AllShopsData, field: string, value: any) => {
      setData(prev => ({
          ...prev,
          [key]: { ...prev[key], [field]: value }
      }));
  };

  const handleSave = async () => {
      if (!db) return;
      setSaving(true);
      try {
          await setDoc(doc(db, 'app_settings', 'shops'), data, { merge: true });
          onUpdate(); // Refresh parent
          onClose();
      } catch (e: any) {
          alert("儲存失敗: " + e.message);
      } finally {
          setSaving(false);
      }
  };

  const renderSection = (
      key: keyof AllShopsData, 
      title: string, 
      ref: React.RefObject<HTMLInputElement>,
      colorClass: string
  ) => {
      const shop = data[key];
      return (
          <div className={`p-4 rounded-xl border ${colorClass} bg-slate-900/50`}>
              <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-200">{title}</h3>
                  {key === 'event' && (
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1 rounded border border-slate-600">
                          <input 
                              type="checkbox" 
                              checked={shop.isVisible || false} 
                              onChange={(e) => handleChange(key, 'isVisible', e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                          />
                          <span className={`text-xs font-bold ${shop.isVisible ? 'text-green-400' : 'text-slate-500'}`}>
                              {shop.isVisible ? '顯示中' : '已隱藏'}
                          </span>
                      </label>
                  )}
              </div>

              {/* Image Preview / Upload */}
              <div 
                  className="w-full h-32 bg-slate-950 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-slate-500 transition mb-3"
                  onClick={() => ref.current?.click()}
              >
                  {shop.imageUrl ? (
                      <>
                        <img src={shop.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold text-white">更換圖片</div>
                      </>
                  ) : (
                      <div className="text-center text-slate-500">
                          <span className="text-2xl block mb-1">🖼️</span>
                          <span className="text-xs">點擊上傳封面</span>
                      </div>
                  )}
              </div>
              <input type="file" ref={ref} onChange={(e) => handleImageUpload(e, key)} accept="image/*" className="hidden" />

              {/* URL Input */}
              <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">連結網址 (URL)</label>
                  <input 
                      type="text" 
                      value={shop.url} 
                      onChange={(e) => handleChange(key, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
              </div>
          </div>
      );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">🛒 商店連結設定</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {loading ? <div className="text-center py-10 text-slate-500">載入中...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderSection('sp', '💎 SP 商店', spInputRef, 'border-blue-500/30')}
                    {renderSection('exchange', '⚖️ 重要道具交換所', exchangeInputRef, 'border-amber-500/30')}
                    {renderSection('event', '⏳ 限時活動商店', eventInputRef, 'border-rose-500/30')}
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-950 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg disabled:opacity-50">
                {saving ? '儲存中...' : '儲存變更'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsModal;
