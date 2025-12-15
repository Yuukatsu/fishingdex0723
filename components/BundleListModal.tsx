
import React from 'react';
import { Item, ItemCategory } from '../types';
import ItemCard from './ItemCard';

interface BundleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemList: Item[];
  isDevMode: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onClick: (item: Item) => void;
}

const BundleListModal: React.FC<BundleListModalProps> = ({ 
    isOpen, 
    onClose, 
    itemList, 
    isDevMode, 
    onEdit, 
    onDelete, 
    onClick 
}) => {
  if (!isOpen) return null;

  // Filter only bundle items
  const bundleItems = itemList.filter(item => item.category === ItemCategory.Bundle);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-600 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧺</span>
            <h2 className="text-xl font-bold text-white">
               集合一覽 (Bundles)
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-900/50">
            {bundleItems.length === 0 ? (
                <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                    <div className="text-6xl mb-4">🧺</div>
                    <p>目前沒有任何集合定義</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {bundleItems.map(item => (
                        <ItemCard 
                            key={item.id} 
                            item={item} 
                            isDevMode={isDevMode} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onClick={onClick} 
                            itemList={itemList} // Pass for image cycling
                        />
                    ))}
                </div>
            )}
            
            <div className="mt-8 p-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
                <h4 className="text-indigo-300 font-bold mb-2 text-sm">💡 什麼是集合？</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    「集合」是一種特殊的道具定義，代表一組性質相似的物品（例如：「樹果類」包含桃桃果、零餘果等）。
                    在合成配方中，若需求為某個集合，則可以使用該集合內的任意物品來進行合成。
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BundleListModal;

