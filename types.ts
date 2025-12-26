
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

// --- New Item System Types ---

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

// --- Adventure System Types ---

export interface AdventureBuddy {
    imageUrl: string;
    note?: string;
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
    name: string;
    description?: string;
    primaryStat: DispatchStat;
    secondaryStat: DispatchStat;
    badDrops: AdventureMapItem[];
    normalDrops: AdventureMapItem[];
    greatDrops: AdventureMapItem[];
    specialDrops: AdventureMapItem[];
    hiddenDrops: AdventureMapItem[];
    order: number;
}

// --- Partner Skills System Types ---

export type SkillType = '常駐型' | '機率型';
export type SkillCategory = '戰鬥' | '冒險' | '釣魚' | '其他';
export const SKILL_CATEGORIES: SkillCategory[] = ['戰鬥', '冒險', '釣魚', '其他'];

export interface SkillPartner {
    imageUrl: string;
    note?: string;
}

// 用於儲存特定類別下的技能效果
export interface MainSkillCategoryData {
    description: string;
    levelEffects: string[]; // Always 6 elements
}

export interface MainSkill {
    id: string;
    name: string;
    type: SkillType;
    
    // New Fields
    categories: SkillCategory[]; // Active categories
    categoryData: Partial<Record<SkillCategory, MainSkillCategoryData>>; 

    // Deprecated fields (kept for migration/fallback)
    description?: string;
    levelEffects?: string[]; 
    isSpecial?: boolean; // Deprecated
    partners?: SkillPartner[]; // Deprecated
}

// New Entity: Special Main Skill
export interface SpecialMainSkill {
    id: string;
    name: string;
    description: string;
    type: SkillType;
    levelEffects: string[]; // Always 6 elements
    partner: SkillPartner; // The specific partner who owns this
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
