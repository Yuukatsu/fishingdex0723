
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
  Tackle = '釣具',
}

export const ITEM_TYPE_ORDER = [
  ItemType.Tackle, 
  ItemType.Material,
  ItemType.Consumable,
  ItemType.HeldItem,
  ItemType.KeyItem,
  ItemType.LunchBox,
];

// Level 2: Sub Category (Specific to Materials mainly, but structure allows expansion)
export enum ItemCategory {
  // Material Categories
  Bundle = '集合', // 用於定義一組道具的集合
  BallMaker = '球匠類',
  Ingredient = '食材類',
  Medicine = '藥材類',
  Other = '其他類',
  
  // Tackle Categories
  Rod = '釣竿',
  Bait = '魚餌',
  Float = '浮標',
  Line = '魚線',
  Hook = '魚鉤',
  Decoration = '裝飾品',
  
  None = '通用', // For items that don't need sub-categories
}

export const ITEM_CATEGORY_ORDER = [
  // ItemCategory.Bundle removed from here to hide from filter pills
  ItemCategory.BallMaker,
  ItemCategory.Ingredient,
  ItemCategory.Medicine,
  ItemCategory.Other,
];

// 釣具專用的分類顯示順序
export const TACKLE_CATEGORY_ORDER = [
  ItemCategory.Rod,
  ItemCategory.Bait,
  ItemCategory.Float,
  ItemCategory.Line,
  ItemCategory.Hook,
  ItemCategory.Decoration,
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

  // Tackle specific fields
  tensileStrength?: number; // 拉扯力
  durability?: number;      // 耐久度
  luck?: number;            // 幸運值
  extraEffect?: string;     // 額外效果

  // Bundle specific fields
  bundleContentIds?: string[];    // 集合包含的項目 ID
  bundleSubstituteIds?: string[]; // 可替換/補充的項目 ID
}

// --- Adventure System Types (New) ---

export interface AdventureBuddy {
    imageUrl: string;
    note?: string; // 新增：夥伴備註
}

// 新增介面：地圖道具 (包含 ID 與機率設定)
export interface AdventureMapItem {
    id: string;
    isLowRate?: boolean; // 是否為低機率掉落
}

export interface FieldEffect {
    name: string;
    chance: number;
}

export interface AdventureMap {
    id: string;
    name: string; // e.g., 啟程草原
    imageUrl?: string; // New: 112x112 Image
    description?: string;
    unlockCondition?: string; // 解鎖條件
    isEX?: boolean; // 是否為 EX 地圖
    order: number;
    recommendedLevel?: number; // 推薦等級
    requiredProgress?: number; // 完成所需進度點
    fieldEffects: FieldEffect[]; // 場地效果列表 (多個)
    // Modified to support objects instead of just strings
    dropItemIds: AdventureMapItem[]; 
    rewardItemIds: AdventureMapItem[]; 
    buddies: AdventureBuddy[]; 
}

// --- Dispatch System Types ---
export type DispatchStat = "耐力" | "力量" | "技巧" | "速度";
export const DISPATCH_STATS: DispatchStat[] = ["耐力", "力量", "技巧", "速度"];
export const DISPATCH_TYPES = ["挖礦", "採藥", "搬運", "料理", "巡邏"];

export interface DispatchJob {
    id: string;
    name: string; // 工作內容 (e.g., 挖礦)
    description?: string; // 簡短敘述 (e.g., 尋找稀有礦石)
    
    // Updated: Split focus stats
    primaryStat: DispatchStat; // 主要體能
    secondaryStat: DispatchStat; // 次要體能
    
    badDrops: AdventureMapItem[]; // 狀況不佳
    normalDrops: AdventureMapItem[]; // 普通完成
    greatDrops: AdventureMapItem[]; // 大成功
    specialDrops: AdventureMapItem[]; // 特殊發現
    hiddenDrops: AdventureMapItem[]; // 隱藏獎勵
    order: number;
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
