
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

// Level 1: Main Type
export enum ItemType {
  Material = '素材',
  Consumable = '消耗品',
  HeldItem = '攜帶物',
  KeyItem = '重要',
  LunchBox = '餐盒',
  Tackle = '釣具', // 新增
}

export const ITEM_TYPE_ORDER = [
  ItemType.Tackle, // 將釣具排前面或依需求調整，這裡僅定義順序
  ItemType.Material,
  ItemType.Consumable,
  ItemType.HeldItem,
  ItemType.KeyItem,
  ItemType.LunchBox,
];

// Level 2: Sub Category (Specific to Materials mainly, but structure allows expansion)
export enum ItemCategory {
  // Material Categories
  BallMaker = '球匠類',
  Ingredient = '食材類',
  Medicine = '藥材類',
  Other = '其他類',
  
  // Tackle Categories (新增)
  Rod = '釣竿',
  Reel = '捲線器',
  Line = '釣線',
  Hook = '釣鉤',
  Bait = '魚餌',
  Float = '浮標',
  
  None = '通用', // For items that don't need sub-categories
}

export const ITEM_CATEGORY_ORDER = [
  ItemCategory.BallMaker,
  ItemCategory.Ingredient,
  ItemCategory.Medicine,
  ItemCategory.Other,
];

// 釣具專用的分類顯示順序
export const TACKLE_CATEGORY_ORDER = [
  ItemCategory.Rod,
  ItemCategory.Reel,
  ItemCategory.Line,
  ItemCategory.Hook,
  ItemCategory.Float,
  ItemCategory.Bait,
  ItemCategory.Other,
];

export interface CraftingIngredient {
  itemId: string;
  quantity: number;
}

// LunchBox Specific Types
export const LUNCHBOX_FLAVORS = ["酸味", "甜味", "苦味", "辣味", "澀味", "鹹味", "鮮味", "美味", "無味"];
export const LUNCHBOX_CATEGORIES = ["其他", "穀類", "豆類", "蜜類", "礦類", "菇類", "全部"];

export interface Item {
  id: string;
  name: string;
  description: string;
  source: string; // 獲取方式
  type: ItemType; // 新增：大分類
  category: ItemCategory; // 子分類
  imageUrl?: string;
  isRare?: boolean; // 是否為稀有素材
  order?: number; // 用於自定義排序
  recipe?: CraftingIngredient[]; // 合成公式
  
  // LunchBox specific fields
  flavors?: string[]; // 口味
  foodCategories?: string[]; // 食物分類
  satiety?: number; // 飽腹感

  // Tackle specific fields (New)
  tensileStrength?: number; // 拉扯力
  durability?: number;      // 耐久度
  luck?: number;            // 幸運值
  extraEffect?: string;     // 額外效果
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
