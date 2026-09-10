// src/game/data/missions.data.ts
// ─────────────────────────────────────────────────────────────
// Catálogo e Definições de Missões Diárias / Encomendas da Peixaria
// ─────────────────────────────────────────────────────────────

export type MissionType =
  | 'catch_count'
  | 'catch_location'
  | 'catch_weight'
  | 'perfect_reel'
  | 'sell_coins'
  | 'use_bait'
  | 'catch_rarity';

export interface MissionReward {
  coins: number;
  xp: number;
  baitId?: string;
  baitQuantity?: number;
  cosmicScales?: number;
}

export interface MissionTemplate {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  targetLocation?: string;
  targetRarity?: 'uncommon' | 'rare' | 'epic' | 'legendary';
  minWeight?: number;
  reward: MissionReward;
  icon: string;
}

export interface DailyMission {
  id: string;
  templateId: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  current: number;
  targetLocation?: string;
  targetRarity?: string;
  minWeight?: number;
  reward: MissionReward;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export const MissionTemplates: MissionTemplate[] = [
  // ── Pescaria Geral ──
  {
    id: 'tmpl_catch_5',
    type: 'catch_count',
    title: 'Pescaria Produtiva',
    description: 'Pesque 5 peixes de qualquer espécie.',
    target: 5,
    reward: { coins: 80, xp: 45 },
    icon: '🐟',
  },
  {
    id: 'tmpl_catch_8',
    type: 'catch_count',
    title: 'Dia de Cesto Cheio',
    description: 'Pesque 8 peixes para suprir a feira local.',
    target: 8,
    reward: { coins: 140, xp: 80, baitId: 'bait_worm', baitQuantity: 5 },
    icon: '🧺',
  },

  // ── Domínio & Minigame de Batalha ──
  {
    id: 'tmpl_perfect_2',
    type: 'perfect_reel',
    title: 'Mestre da Carretilha',
    description: 'Execute 2 Domínios Perfeitos no minigame de batalha.',
    target: 2,
    reward: { coins: 120, xp: 75 },
    icon: '⭐',
  },
  {
    id: 'tmpl_perfect_3',
    type: 'perfect_reel',
    title: 'Fisgada Cirúrgica',
    description: 'Execute 3 Domínios Perfeitos sem deixar a linha estourar.',
    target: 3,
    reward: { coins: 200, xp: 120, baitId: 'bait_cricket', baitQuantity: 5 },
    icon: '🎯',
  },

  // ── Peixes Pesados / Troféus ──
  {
    id: 'tmpl_weight_5kg',
    type: 'catch_weight',
    title: 'Presa Pesada',
    description: 'Capture um peixe com pelo menos 5.0 kg.',
    target: 1,
    minWeight: 5.0,
    reward: { coins: 150, xp: 90 },
    icon: '⚖️',
  },
  {
    id: 'tmpl_weight_10kg',
    type: 'catch_weight',
    title: 'Gigante das Águas',
    description: 'Capture uma criatura colossal de mais de 10.0 kg.',
    target: 1,
    minWeight: 10.0,
    reward: { coins: 300, xp: 160, baitId: 'bait_live_minnow', baitQuantity: 3 },
    icon: '🐋',
  },

  // ── Comércio & Mercado ──
  {
    id: 'tmpl_sell_100',
    type: 'sell_coins',
    title: 'Comerciante Ribeirinho',
    description: 'Fature pelo menos 100 moedas vendendo peixes no mercado.',
    target: 100,
    reward: { coins: 90, xp: 50 },
    icon: '💰',
  },
  {
    id: 'tmpl_sell_250',
    type: 'sell_coins',
    title: 'Negócio Lucrativo',
    description: 'Fature pelo menos 250 moedas vendendo peixes.',
    target: 250,
    reward: { coins: 180, xp: 100, baitId: 'bait_dough', baitQuantity: 5 },
    icon: '🪙',
  },

  // ── Locais Específicos ──
  {
    id: 'tmpl_loc_lake',
    type: 'catch_location',
    title: 'Águas Calmas do Lago',
    description: 'Pesque 4 peixes no Lago Sereno.',
    target: 4,
    targetLocation: 'lake',
    reward: { coins: 110, xp: 60, baitId: 'bait_worm', baitQuantity: 5 },
    icon: '🏞️',
  },
  {
    id: 'tmpl_loc_river',
    type: 'catch_location',
    title: 'Corredeiras do Rio',
    description: 'Pesque 3 peixes no Rio das Pedras.',
    target: 3,
    targetLocation: 'river',
    reward: { coins: 130, xp: 70, baitId: 'bait_cricket', baitQuantity: 5 },
    icon: '🌊',
  },
  {
    id: 'tmpl_loc_sea',
    type: 'catch_location',
    title: 'Ondas do Mar Aberto',
    description: 'Pesque 3 peixes no Mar Aberto.',
    target: 3,
    targetLocation: 'sea',
    reward: { coins: 220, xp: 110, baitId: 'bait_shrimp', baitQuantity: 5 },
    icon: '⛵',
  },

  // ── Raridade & Iscas ──
  {
    id: 'tmpl_rarity_rare',
    type: 'catch_rarity',
    title: 'Achado Precioso',
    description: 'Capture 1 peixe de raridade Rara ou superior.',
    target: 1,
    targetRarity: 'rare',
    reward: { coins: 250, xp: 130, baitId: 'bait_lure_glow', baitQuantity: 3 },
    icon: '💎',
  },
  {
    id: 'tmpl_use_bait',
    type: 'use_bait',
    title: 'Técnica com Isca',
    description: 'Gaste 3 iscas equipadas em suas pescarias.',
    target: 3,
    reward: { coins: 100, xp: 60 },
    icon: '🪱',
  },
];
