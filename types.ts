
export enum Rarity {
  OneStar = '★',
  TwoStar = '★★',
  ThreeStar = '★★★',
  FourStar = '★★★★',
  Special = '◆',
}

export interface FishVariants {
  normalMale?: string;
  normalFemale?: string;
  shinyMale?: string;
  shinyFemale?: string;
}

export interface Fish {
  id: string;
  internalId?: number; // 新增內部編號，從 0 開始
  name: string;
  description: string;
  rarity: Rarity;
  depthMin?: number; // 水深最小值 (m)
  depthMax?: number; // 水深最大值 (m)
  conditions: string[]; // 目擊情報
  battleRequirements?: string; // 比拚要點
  specialNote?: string; // 特殊要求
  tags: string[]; // 標籤/系列
  variants: FishVariants; // 圖片變種
  isNew?: boolean; // 是否為最新推出
  // Deprecated fields kept optional for migration safety
  imageUrl?: string; 
  location?: string;
}

export interface WeeklyEvent {
  id: string;
  startDate: string;
  endDate: string;
  targetFishIds: string[]; // List of Fish IDs selected for this event
}

// --- New Item System Types ---

export enum ItemCategory {
  BallMaker = '球匠類',
  Ingredient = '食材類',
  Medicine = '藥材類',
  Other = '其他類',
}

export const ITEM_CATEGORY_ORDER = [
  ItemCategory.BallMaker,
  ItemCategory.Ingredient,
  ItemCategory.Medicine,
  ItemCategory.Other,
];

export interface Item {
  id: string;
  name: string;
  description: string;
  source: string; // 獲取方式
  category: ItemCategory;
  imageUrl?: string;
  isRare?: boolean; // 新增：是否為稀有素材
}

// -----------------------------

export const RARITY_ORDER = [
  Rarity.OneStar,
  Rarity.TwoStar,
  Rarity.ThreeStar,
  Rarity.FourStar,
  Rarity.Special,
];

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.OneStar]: 'text-gray-400 border-gray-400 bg-gray-900/50',
  [Rarity.TwoStar]: 'text-green-400 border-green-400 bg-green-900/50',
  [Rarity.ThreeStar]: 'text-blue-400 border-blue-400 bg-blue-900/50',
  [Rarity.FourStar]: 'text-yellow-400 border-yellow-400 bg-yellow-900/50',
  [Rarity.Special]: 'text-fuchsia-400 border-fuchsia-400 bg-fuchsia-900/50 shadow-[0_0_15px_rgba(232,121,249,0.3)]',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.OneStar]: '',
  [Rarity.TwoStar]: '',
  [Rarity.ThreeStar]: '',
  [Rarity.FourStar]: '',
  [Rarity.Special]: '',
};
