

export enum Rarity {
  OneStar = '★',
  TwoStar = '★★',
  ThreeStar = '★★★',
  FourStar = '★★★★',
  Special = '◆',
}

// Added missing RARITY_ORDER and RARITY_COLORS constants to fix import errors
export const RARITY_ORDER = [
  Rarity.OneStar,
  Rarity.TwoStar,
  Rarity.ThreeStar,
  Rarity.FourStar,
  Rarity.Special,
];

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.OneStar]: 'text-slate-400 border-slate-400 bg-slate-400',
  [Rarity.TwoStar]: 'text-emerald-400 border-emerald-400 bg-emerald-400',
  [Rarity.ThreeStar]: 'text-blue-400 border-blue-400 bg-blue-400',
  [Rarity.FourStar]: 'text-purple-400 border-purple-400 bg-purple-400',
  [Rarity.Special]: 'text-red-500 border-red-500 bg-red-500',
};

export interface FishVariants {
  normalMale?: string;
  normalFemale?: string;
  shinyMale?: string;
  shinyFemale?: string;
}

export interface Fish {
  id: string;
  internalId?: number;
  name: string;
  description: string;
  rarity: Rarity;
  depthMin?: number;
  depthMax?: number;
  conditions: string[];
  battleRequirements?: string;
  specialNote?: string;
  tags: string[];
  variants: FishVariants;
  isNew?: boolean;
  imageUrl?: string; 
  location?: string;
}

export interface WeeklyEvent {
  id: string;
  startDate: string;
  endDate: string;
  targetFishIds: string[];
}

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

export enum ItemCategory {
  Bundle = '集合',
  BallMaker = '球匠類',
  Ingredient = '食材類',
  Medicine = '藥材類',
  Other = '其他類',
  Rod = '釣竿',
  Bait = '魚餌',
  Float = '浮標',
  Line = '魚線',
  Hook = '魚鉤',
  Decoration = '裝飾品',
  None = '通用',
}

export const ITEM_CATEGORY_ORDER = [
  ItemCategory.BallMaker,
  ItemCategory.Ingredient,
  ItemCategory.Medicine,
  ItemCategory.Other,
];

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

export const LUNCHBOX_FLAVORS = ["酸味", "甜味", "苦味", "辣味", "澀味", "鹹味", "鮮味", "美味", "無味"];
export const LUNCHBOX_CATEGORIES = ["其他", "穀類", "豆類", "蜜類", "礦類", "菇類", "全部"];

export interface Item {
  id: string;
  name: string;
  description: string;
  source: string;
  type: ItemType;
  category: ItemCategory;
  imageUrl?: string;
  isRare?: boolean;
  order?: number;
  recipe?: CraftingIngredient[];
  flavors?: string[];
  foodCategories?: string[];
  satiety?: number;
  tensileStrength?: number;
  durability?: number;
  luck?: number;
  extraEffect?: string;
  bundleContentIds?: string[];
  bundleSubstituteIds?: string[];
}

export interface AdventureBuddy {
    imageUrl: string;
}

export interface AdventureMapItem {
    id: string;
    isLowRate?: boolean;
}

export interface FieldEffect {
    name: string;
    chance: number;
}

export interface AdventureMap {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    unlockCondition?: string;
    isEX?: boolean;
    order: number;
    recommendedLevel?: number;
    requiredProgress?: number;
    fieldEffects: FieldEffect[];
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
    name: string; // 工作內容 (挖礦, 採藥...)
    focusStats: DispatchStat[]; // 看重的體能 (長度固定為2)
    badDrops: AdventureMapItem[]; // 狀況不佳
    normalDrops: AdventureMapItem[]; // 普通完成
    greatDrops: AdventureMapItem[]; // 大成功
    specialDrops: AdventureMapItem[]; // 特殊掉落
    hiddenDrops: AdventureMapItem[]; // 隱藏掉落
    order: number;
}