
import React, { useState, useEffect, useRef } from 'react';
import { Item, ItemCategory, ITEM_CATEGORY_ORDER } from '../types';

interface ItemFormModalProps {
  initialData?: Item | null;
  onSave: (item: Item) => void;
  onClose: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Item>({
    id: '',
    name: '',
    description: '',
    source: '',
    category: ItemCategory.BallMaker, // Default
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl || '');
    } else {
        // Generate a random ID for new items
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('請輸入名稱');
    onSave(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Keep original size for pixel art (30x30), but ensure it's not too huge
        let width = img.width;
        let height = img.height;
        
        // Cap max size to avoid Firestore limits, but 30x30 is tiny so it's fine.
        // We'll set a reasonable limit just in case user uploads 4k image
        const MAX_SIZE = 128; 
        if (width > MAX_SIZE || height > MAX_SIZE) {
            const ratio = width > height ? MAX_SIZE / width : MAX_SIZE / height;
            width *= ratio;
            height *= ratio;
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // Pixel art!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          setImagePreview(dataUrl);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white">{initialData ? '編輯道具' : '新增道具'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Image Upload Section */}
          <div className="flex items-center gap-4">
             <div 
                className="w-20 h-20 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden relative group"
                onClick={() => fileInputRef.current?.click()}
             >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain [image-rendering:pixelated]" />
                ) : (
                    <span className="text-2xl">📷</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">更換</div>
             </div>
             <div className="flex-1">
                 <p className="text-xs text-slate-400 mb-2">建議尺寸: 30x30 像素 (Pixel Art)</p>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded border border-slate-600">
                    選擇圖片
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">道具分類</label>
            <div className="grid grid-cols-2 gap-2">
                {ITEM_CATEGORY_ORDER.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-2 text-xs rounded border transition-all ${formData.category === cat ? 'bg-blue-600 border-blue-500 text-white font-bold' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">道具名稱</label>
            <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                placeholder="例如: 鐵製釣鉤"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">獲取方式 (Source)</label>
            <input 
                type="text" 
                value={formData.source} 
                onChange={e => setFormData({...formData, source: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none" 
                placeholder="例如: 商店購買、深海釣魚"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">說明 (Description)</label>
            <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none resize-none h-20" 
                placeholder="道具的功能或描述..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm text-slate-300 hover:text-white transition">取消</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
