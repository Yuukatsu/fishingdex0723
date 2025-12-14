
import React, { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_FOOD_EGG_GROUP_MAPPING } from '../constants';
import { LUNCHBOX_CATEGORIES } from '../types';

interface FoodCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}

const FoodCategoryModal: React.FC<FoodCategoryModalProps> = ({ isOpen, onClose, isDevMode }) => {
  const [mapping, setMapping] = useState<Record<string, string>>(DEFAULT_FOOD_EGG_GROUP_MAPPING);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMapping, setEditedMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && db) {
        setLoading(true);
        const fetchMapping = async () => {
            try {
                const docRef = doc(db, 'app_settings', 'food_mapping');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().mapping) {
                    setMapping(docSnap.data().mapping);
                } else {
                    setMapping(DEFAULT_FOOD_EGG_GROUP_MAPPING);
                }
            } catch (e: any) {
                console.error("Failed to fetch food mapping", e);
                // Fail gracefully to defaults if permission denied
                if (e.code === 'permission-denied') {
                     console.warn("Firestore permission denied for app_settings. Using default local mapping.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMapping();
    }
  }, [isOpen]);

  const handleEditClick = () => {
      setEditedMapping({...mapping});
      setEditMode(true);
  };

  const handleCancelEdit = () => {
      setEditMode(false);
  };

  const handleSaveEdit = async () => {
      if (!db) return;
      setSaving(true);
      try {
          await setDoc(doc(db, 'app_settings', 'food_mapping'), { mapping: editedMapping }, { merge: true });
          setMapping(editedMapping);
          setEditMode(false);
      } catch (e: any) {
          console.error("Failed to save mapping", e);
          if (e.code === 'permission-denied') {
              alert("儲存失敗：權限不足。\n\n請前往 Firebase Console > Firestore Database > Rules\n添加以下規則以允許寫入 app_settings：\n\nmatch /app_settings/{document=**} { allow read, write: if request.auth != null; }");
          } else {
              alert(`儲存失敗: ${e.message}`);
          }
      } finally {
          setSaving(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             🥚 食物分類對應蛋群
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
                <div className="text-center py-8 text-slate-500">載入中...</div>
            ) : (
                <div className="space-y-4">
                    {/* Header Controls */}
                    {isDevMode && !editMode && (
                        <div className="flex justify-end mb-4">
                            <button onClick={handleEditClick} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition flex items-center gap-1">
                                ✏️ 編輯對照表
                            </button>
                        </div>
                    )}
                    
                    {/* Display or Edit Grid */}
                    <div className="grid gap-4">
                        {LUNCHBOX_CATEGORIES.map(category => {
                            const eggGroups = editMode ? (editedMapping[category] || "") : (mapping[category] || "無");
                            return (
                                <div key={category} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex items-start gap-3 flex-col sm:flex-row sm:items-center">
                                        <div className="w-20 flex-shrink-0">
                                            <span className="px-3 py-1 bg-amber-600/20 text-amber-300 border border-amber-600/50 rounded-lg text-sm font-bold block text-center">
                                                {category}
                                            </span>
                                        </div>
                                        <div className="flex-1 w-full">
                                            {editMode ? (
                                                <input 
                                                    type="text"
                                                    value={editedMapping[category] || ''}
                                                    onChange={(e) => setEditedMapping({ ...editedMapping, [category]: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                    placeholder="輸入對應蛋群 (以頓號或逗號分隔)"
                                                />
                                            ) : (
                                                <p className="text-slate-300 text-sm leading-relaxed">
                                                    {eggGroups}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Edit Mode Footer */}
        {editMode && (
            <div className="p-4 border-t border-slate-700 bg-slate-950 flex justify-end gap-3">
                <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded text-slate-400 hover:text-white transition text-sm"
                >
                    取消
                </button>
                <button 
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow text-sm disabled:opacity-50"
                >
                    {saving ? '儲存中...' : '儲存變更'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FoodCategoryModal;
