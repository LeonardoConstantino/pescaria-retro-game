// src/game/data/items.data.ts
// ─────────────────────────────────────────────
// Equipamentos disponíveis na loja.
// Cada item possui modificadores que o
// FishingEngine aplica durante o sorteio.
// ─────────────────────────────────────────────

export interface ItemModifiers {
  emptyChanceModifier?: number;
  eventChanceModifier?: number;
  rarityModifier?: Record<string, number>;
  xpMultiplier?: number;
  cooldownModifier?: number;
  locationBonus?: string[] | null;
}

export interface GameItem {
  id: string;
  assetId: string;
  name: string;
  type: 'rod' | 'bait';
  description: string;
  price: number;
  requiredLevel: number;
  quantity?: number;
  modifiers: ItemModifiers;
}

export const ItemData: GameItem[] = [
  // ── Varas ────────────────────────────────
  {
    id: 'rod_basic',
    assetId: 'rod_basic',
    name: 'Vara Básica',
    type: 'rod',
    description: 'A vara com que todo pescador começa. Confiável e sem rodeios.',
    price: 0,
    requiredLevel: 1,
    modifiers: {
      emptyChanceModifier: 0,
      eventChanceModifier: 0,
      rarityModifier: {},
      xpMultiplier: 1.0,
      cooldownModifier: 0,
    },
  },

  {
    id: 'rod_intermediate',
    assetId: 'rod_intermediate',
    name: 'Vara de Fibra',
    type: 'rod',
    description: 'Mais resistente e elástica. Reduz a chance de perder o peixe.',
    price: 150,
    requiredLevel: 3,
    modifiers: {
      emptyChanceModifier: -0.05,
      eventChanceModifier: 0,
      rarityModifier: { uncommon: +4 },
      xpMultiplier: 1.15,
      cooldownModifier: -500, // -0.5s de cooldown
    },
  },

  {
    id: 'rod_advanced',
    assetId: 'rod_advanced',
    name: 'Vara de Carbono',
    type: 'rod',
    description: 'Para pescadores que buscam grandes troféus. Sensibilidade incrível.',
    price: 600,
    requiredLevel: 7,
    modifiers: {
      emptyChanceModifier: -0.08,
      eventChanceModifier: +0.06,
      rarityModifier: { uncommon: +5, rare: +3 },
      xpMultiplier: 1.3,
      cooldownModifier: -1000, // -1s de cooldown
    },
  },

  {
    id: 'rod_legendary',
    assetId: 'rod_legendary',
    name: 'Vara Ancestral',
    type: 'rod',
    description: 'Forjada com runas de mestre. Atrai peixes gigantes e místicos.',
    price: 3500,
    requiredLevel: 12,
    modifiers: {
      emptyChanceModifier: -0.12,
      eventChanceModifier: +0.12,
      rarityModifier: { rare: +5, epic: +4, legendary: +2 },
      xpMultiplier: 1.6,
      cooldownModifier: -2000, // -2s de cooldown (pesca quase instantânea!)
    },
  },

  // ── Iscas ─────────────────────────────────
  {
    id: 'bait_worm',
    assetId: 'bait_worm',
    name: 'Minhoca',
    type: 'bait',
    description: 'Isca clássica. Perfeita para águas calmas de lagos e rios.',
    price: 10,
    quantity: 5,
    requiredLevel: 1,
    modifiers: {
      emptyChanceModifier: -0.05,
      rarityModifier: { common: +5 },
      locationBonus: ['lake', 'river'],
    },
  },

  {
    id: 'bait_shrimp',
    assetId: 'bait_shrimp',
    name: 'Camarão Fresco',
    type: 'bait',
    description: 'Excelente para peixes predadores e espécies marinhas.',
    price: 25,
    quantity: 5,
    requiredLevel: 4,
    modifiers: {
      emptyChanceModifier: -0.08,
      rarityModifier: { uncommon: +6, rare: +3 },
      locationBonus: ['sea', 'deep_sea'],
    },
  },

  {
    id: 'bait_golden',
    assetId: 'bait_golden',
    name: 'Isca Dourada',
    type: 'bait',
    description: 'Isca mágica luminosa. Oportunidade dourada para peixes lendários.',
    price: 400,
    quantity: 1,
    requiredLevel: 1,
    modifiers: {
      emptyChanceModifier: -0.12,
      rarityModifier: { rare: +6, epic: +5, legendary: +4 },
      locationBonus: null,
    },
  },
];
