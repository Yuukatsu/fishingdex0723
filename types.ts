export enum Rarity {
  OneStar = '★',
  TwoStar = '★★',
  ThreeStar = '★★★',
  FourStar = '★★★★',
  Special = '◆',
}

export interface Fish {
  id: string;
  name: string;
  description: string; // The "appearance" text description
  rarity: Rarity;
  location: string; // 目擊情報
  time: string; // 出現時間
  weather: string; // 天氣條件
  battleRequirements?: string; // 比拚需求 (Optional)
  tags: string[]; // 新增：標籤/系列
  imageUrl?: string; // Optional custom image URL
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