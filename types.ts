
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

export type BattleAction = '拉' | '放' | '收' | '無';
export const BATTLE_ACTIONS: BattleAction[] = ['拉', '放', '收', '無'];

export interface BattleStats {
    tensileStrength: number; // 拉扯力 (對應釣具)
    durability: number;      // 耐久度 (對應釣具)
    luck: number;            // 幸運值 (對應釣具)
    preferredAction: BattleAction; // 偏好行為
    huanyeNote?: string;     // 歡也的備註
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
  
  // New Battle Stats
  battleStats?: BattleStats;
  
  // Deprecated string field (kept for type compatibility if needed, but UI will use battleStats)
  battleRequirements?: string; 
  
  specialNote?: string;
  tags: string[];
  variants: FishVariants;
  isNew?: boolean;
  imageUrl?: string; 
  location?: string;
  dropItemIds?: string[];
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
  isPerfectQuality?: boolean;
}

export const LUNCHBOX_FLAVORS = ["酸味", "甜味", "苦味", "辣味", "澀味", "鹹味", "鮮味", "美味", "無味"];
export const LUNCHBOX_CATEGORIES = ["肉類", "海鮮", "豆類", "穀類", "菇類", "誘糰", "蜜類", "料理", "礦類", "全部", "點心"];

export const ITEM_ATTRIBUTES = [
  "一般", "飛行", "火", "水", "蟲", "電", "岩石", "草", "幽靈", "冰", "龍", "格鬥", "惡", "毒", "鋼", "地面", "妖精", "超能力", "無"
] as const;

export type ItemAttribute = typeof ITEM_ATTRIBUTES[number];

export const ITEM_ATTRIBUTE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "一般": { bg: "bg-stone-800/80", text: "text-stone-300", border: "border-stone-500/50" },
  "飛行": { bg: "bg-sky-900/60", text: "text-sky-200", border: "border-sky-500/50" },
  "火": { bg: "bg-red-900/60", text: "text-red-200", border: "border-red-500/50" },
  "水": { bg: "bg-blue-900/60", text: "text-blue-200", border: "border-blue-500/50" },
  "蟲": { bg: "bg-lime-900/60", text: "text-lime-200", border: "border-lime-500/50" },
  "電": { bg: "bg-yellow-900/60", text: "text-yellow-200", border: "border-yellow-500/50" },
  "岩石": { bg: "bg-amber-900/60", text: "text-amber-200", border: "border-amber-600/50" },
  "草": { bg: "bg-emerald-900/60", text: "text-emerald-200", border: "border-emerald-500/50" },
  "幽靈": { bg: "bg-purple-950/70", text: "text-purple-200", border: "border-purple-600/50" },
  "冰": { bg: "bg-cyan-900/60", text: "text-cyan-200", border: "border-cyan-400/50" },
  "龍": { bg: "bg-indigo-950/70", text: "text-indigo-200", border: "border-indigo-500/50" },
  "格鬥": { bg: "bg-orange-950/70", text: "text-orange-200", border: "border-orange-600/50" },
  "惡": { bg: "bg-zinc-900/90", text: "text-zinc-200", border: "border-zinc-500/50" },
  "毒": { bg: "bg-fuchsia-950/70", text: "text-fuchsia-200", border: "border-fuchsia-500/50" },
  "鋼": { bg: "bg-slate-700/70", text: "text-slate-100", border: "border-slate-400/50" },
  "地面": { bg: "bg-yellow-950/70", text: "text-yellow-100", border: "border-yellow-700/50" },
  "妖精": { bg: "bg-pink-900/60", text: "text-pink-200", border: "border-pink-500/50" },
  "超能力": { bg: "bg-rose-900/60", text: "text-rose-200", border: "border-rose-400/50" },
  "超能": { bg: "bg-rose-900/60", text: "text-rose-200", border: "border-rose-400/50" },
  "無": { bg: "bg-slate-800/80", text: "text-slate-400", border: "border-slate-600/50" },
};

export interface Item {
  isVisible?: boolean;
  id: string;
  name: string;
  description: string;
  source: string;
  type: ItemType;
  category: ItemCategory;
  attribute?: ItemAttribute | string;
  imageUrl?: string;
  isRare?: boolean;
  order?: number;
  recipe?: CraftingIngredient[];
  flavors?: string[];
  foodCategories?: string[];
  feedingEffect?: string;
  satiety?: number;
  extraBonus?: number;
  tensileStrength?: number;
  durability?: number;
  luck?: number;
  extraEffect?: string;
  negativeExtraEffect?: string;
  bundleContentIds?: string[];
  bundleSubstituteIds?: string[];
  hasPerfectQuality?: boolean;
  perfectQualityName?: string;
  perfectQualityDescription?: string;
  perfectQualityImageUrl?: string;
  perfectQualitySatiety?: number;
  perfectQualityExtraBonus?: number;
  hasExchangeSource?: boolean;
}

// --- Adventure System Types ---

export interface AdventureBuddy {
    imageUrl: string;
    note?: string;
    isRare?: boolean;
}

export interface AdventureMapItem {
    id: string;
    isLowRate?: boolean;
    skillName?: string; // For items like 主技能光碟
    uniqueKey?: string; // To allow multiple of the same item
    isPerfectQuality?: boolean;
}

export interface FieldEffect {
    name: string;
    chance: number;
}

export interface AdventureMap {
    isVisible?: boolean;
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    unlockCondition?: string;
    isEX?: boolean;
    isLimitedTime?: boolean; // New: Limited Time Event Map
    startDate?: string;      // New: Event Start Date
    endDate?: string;        // New: Event End Date
    order: number;
    recommendedLevel?: number;
    recommendedRebirth?: string; // New: Recommended Reincarnation Stage
    requiredProgress?: number;
    fieldEffects: FieldEffect[];
    dropItemIds: AdventureMapItem[]; 
    rewardItemIds: AdventureMapItem[]; 
    rumoredTreasureItemIds?: AdventureMapItem[];
    possibleHeldItems?: AdventureMapItem[]; // New: Possible Held Items near encounters
    buddies: AdventureBuddy[]; 
}

// --- Dispatch System Types (Redesigned) ---

export type DispatchStat = "耐力" | "力量" | "技巧" | "速度"; // Kept for legacy compatibility if needed, but UI uses Tags
export const DISPATCH_STATS: DispatchStat[] = ["耐力", "力量", "技巧", "速度"];
export const DISPATCH_TYPES = ["挖礦", "採藥", "搬運", "料理", "巡邏"];

export interface DispatchRequest {
    id: string;
    name: string; // 委託名稱
    description?: string; // NEW: 委託內容概述
    tags: string[]; // 每個委託的標籤 (例如: #耐力 #力量)
    // Three tiers of rewards
    rewardsNormal: AdventureMapItem[]; // 完成
    rewardsGreat: AdventureMapItem[];  // 幹得好!
    rewardsSuper: AdventureMapItem[];  // 超級成功!!
}

export interface DispatchJob {
    id: string;
    name: string; // 企業名稱
    description?: string; // 企業描述
    imageUrl?: string; // 256x256 Logo/Image
    dropSummary?: string; // 掉落物概略 (取代原本的主要 Tags)
    requests: DispatchRequest[]; // List of requests from this enterprise
    order: number;
    
    // Deprecated fields kept for types compatibility during migration
    tags?: string[]; // Deprecated
    primaryStat?: DispatchStat;
    secondaryStat?: DispatchStat;
    badDrops?: AdventureMapItem[];
    normalDrops?: AdventureMapItem[];
    greatDrops?: AdventureMapItem[];
    specialDrops?: AdventureMapItem[];
    hiddenDrops?: AdventureMapItem[];
}

// --- Partner Skills System Types ---

export type SkillType = '常駐型' | '機率型';
export type SkillCategory = '戰鬥' | '冒險' | '釣魚' | '其他';
export const SKILL_CATEGORIES: SkillCategory[] = ['冒險', '釣魚', '其他'];
export const SUB_SKILL_CATEGORIES: SkillCategory[] = ['戰鬥', '冒險', '釣魚', '其他'];

export interface SkillPartner {
    imageUrl: string;
    megaImageUrl?: string;   // Mega Evolution Image
    primalImageUrl?: string; // New: Primal Reversion Image
    note?: string;
}

// 用於儲存特定類別下的技能效果
export interface MainSkillCategoryData {
    description: string;
    levelEffects: string[]; // Always 6 elements
}

export type BattleFormType = 'mega' | 'primal';

export type BattleTraitType = '常駐特性' | '額外特性' | '專屬特性' | '稀有特性';

export interface BattleFormSkill {
    isVisible?: boolean;
    id: string;
    cardNumber?: number;
    name: string;
    formType: BattleFormType; // kept for legacy
    partner: SkillPartner;
    description: string;
    levelEffects: string[]; // Deprecated, kept for backward compatibility

    // New properties for 戰鬥特性
    traitType?: BattleTraitType;
    acquisitionSource?: string;
    enhanceCondition?: string;
    hasAdaptedVersion?: boolean;
    adaptedDescription?: string;
    adaptedAttributeImageUrl?: string;
    adaptedAttributeName?: string;
}


export interface MainSkill {
    isVisible?: boolean;
    id: string;
    name: string;
    type: SkillType;
    
    // Acquisition Method
    acquisitionType?: 'regular' | 'special';
    specialAcquisitionSource?: string;

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
    isVisible?: boolean;
    id: string;
    cardNumber?: number; // New: Card Number for sorting
    name: string;
    type: SkillType;
    partner: SkillPartner; // The specific partner who owns this

    // New Fields (Same as MainSkill)
    categories: SkillCategory[]; 
    categoryData: Partial<Record<SkillCategory, MainSkillCategoryData>>; 

    // Deprecated/Fallback fields
    description?: string;
    levelEffects?: string[]; 
}

// New Entity: Sub Skill (Same structure as MainSkill)
export interface SubSkill extends MainSkill {}

// --- System Guide Types ---

export type GuideCategory = 'fishing' | 'partner' | 'item' | 'appearance' | 'shop';

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
    fishing: '釣魚',
    partner: '夥伴',
    item: '道具',
    appearance: '外觀',
    shop: '商店'
};

export const GUIDE_CATEGORIES: GuideCategory[] = ['fishing', 'partner', 'item', 'appearance', 'shop'];

export interface SystemGuide {
    id: string;
    category: GuideCategory;
    title: string;
    tags: string[];
    summary: string; // 概述
    content: string; // 主要內容 (HTML or Markdown-like text)
    updatedAt: number; // Timestamp
}

// --- Encounter System Types ---

export const ENCOUNTER_SCENES = ['限時活動', '草原', '森林', '原野', '雪原', '沙灘', '高山'];
export const ENCOUNTER_RARITIES = ['普通', '中級', '高級', '特殊'];

export interface EncounterDropItem {
    name: string;
    quantity: string;
}

export interface EncounterPartner {
    id: string;
    scene: string;
    rarity: string;
    name: string;
    partnerId: string; // 夥伴編號
    likedFlavors: string[]; // 喜歡的口味
    dislikedFlavors: string[]; // 討厭的口味
    eggGroup?: string; // 舊的蛋群保留防錯
    eggGroups?: string[]; // 新蛋群清單
    dropItems: EncounterDropItem[]; // 掉落道具清單
    imageUrl: string; // 縮圖
    order?: number;
    eventDate?: string;
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

// --- Announcement System Types ---

export interface AnnouncementTag {
  id: string;
  label: string;
  color: string; // e.g., 'bg-blue-500 text-white'
}

export interface Announcement {
  id: string;
  title?: string;
  version: string;
  date: string; // YYYY-MM-DD
  content: string; // Markdown content
  tags: string[]; // Array of tag IDs
  isForcePopup?: boolean; // Force popup even if version hasn't changed
}

export interface SocialLinks {
  discord: string;
  youtube: string;
  twitch: string;
}