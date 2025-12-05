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
  name: string;
  description: string;
  rarity: Rarity;
  depth: string; // 水深範圍 (原地點)
  conditions: string[]; // 目擊情報
  battleRequirements?: string; // 比拚需求
  specialNote?: string; // 特殊要求
  tags: string[]; // 標籤/系列
  variants: FishVariants; // 圖片變種
  // Deprecated fields kept optional for migration safety if needed, though we will try to use new ones
  imageUrl?: string; 
  location?: string;
}

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