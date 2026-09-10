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
  // ─────────────────────────────────────────────
  // ── VARAS DE PESCA (RODS) ────────────────────
  // ─────────────────────────────────────────────
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
    id: 'rod_bamboo',
    assetId: 'rod_bamboo',
    name: 'Vara de Bambu Japonês',
    type: 'rod',
    description: 'Leve, ágil e flexível. Excelente para pescarias rápidas e dinâmicas.',
    price: 60,
    requiredLevel: 2,
    modifiers: {
      emptyChanceModifier: -0.03,
      eventChanceModifier: +0.02,
      rarityModifier: { common: +3, uncommon: +2 },
      xpMultiplier: 1.1,
      cooldownModifier: -300, // -0.3s
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
      cooldownModifier: -500, // -0.5s
    },
  },

  {
    id: 'rod_titanium',
    assetId: 'rod_titanium',
    name: 'Vara de Titânio Forjado',
    type: 'rod',
    description: 'Construída com liga aeroespacial de titânio. Aguenta arrancadas sem vergar.',
    price: 380,
    requiredLevel: 5,
    modifiers: {
      emptyChanceModifier: -0.07,
      eventChanceModifier: +0.04,
      rarityModifier: { uncommon: +5, rare: +3 },
      xpMultiplier: 1.25,
      cooldownModifier: -800, // -0.8s
    },
  },

  {
    id: 'rod_advanced',
    assetId: 'rod_advanced',
    name: 'Vara de Carbono Pro',
    type: 'rod',
    description: 'Para pescadores que buscam grandes troféus. Sensibilidade de ponta incrível.',
    price: 750,
    requiredLevel: 7,
    modifiers: {
      emptyChanceModifier: -0.09,
      eventChanceModifier: +0.06,
      rarityModifier: { uncommon: +5, rare: +4 },
      xpMultiplier: 1.35,
      cooldownModifier: -1200, // -1.2s
    },
  },

  {
    id: 'rod_abyssal',
    assetId: 'rod_abyssal',
    name: 'Vara Abissal de Obsidiana',
    type: 'rod',
    description: 'Imbuída de essência abissal. Capaz de suportar a imensa pressão do fundo do mar.',
    price: 1400,
    requiredLevel: 9,
    modifiers: {
      emptyChanceModifier: -0.1,
      eventChanceModifier: +0.09,
      rarityModifier: { rare: +5, epic: +4 },
      xpMultiplier: 1.45,
      cooldownModifier: -1500, // -1.5s
      locationBonus: ['deep_sea', 'sea'],
    },
  },

  {
    id: 'rod_legendary',
    assetId: 'rod_legendary',
    name: 'Vara Rúnica Ancestral',
    type: 'rod',
    description: 'Forjada com runas de mestre. Atrai peixes gigantes e predadores lendários.',
    price: 3500,
    requiredLevel: 12,
    modifiers: {
      emptyChanceModifier: -0.13,
      eventChanceModifier: +0.12,
      rarityModifier: { rare: +6, epic: +5, legendary: +3 },
      xpMultiplier: 1.65,
      cooldownModifier: -2000, // -2.0s
    },
  },

  {
    id: 'rod_leviathan',
    assetId: 'rod_leviathan',
    name: 'Vara do Leviatã Oceânico',
    type: 'rod',
    description: 'Reforçada com espinhas do Leviatã. Domina as maiores bestas marinhas com facilidade.',
    price: 8500,
    requiredLevel: 15,
    modifiers: {
      emptyChanceModifier: -0.16,
      eventChanceModifier: +0.15,
      rarityModifier: { rare: +7, epic: +7, legendary: +5 },
      xpMultiplier: 1.85,
      cooldownModifier: -2500, // -2.5s
    },
  },

  {
    id: 'rod_celestial',
    assetId: 'rod_celestial',
    name: 'Vara Cósmica Celestial',
    type: 'rod',
    description: 'Tecida com poeira estelar e luz de nebulosa. Concede o dobro de XP e atrai peixes divinos.',
    price: 24000,
    requiredLevel: 20,
    modifiers: {
      emptyChanceModifier: -0.2,
      eventChanceModifier: +0.2,
      rarityModifier: { epic: +8, legendary: +7 },
      xpMultiplier: 2.0, // Dobro de XP!
      cooldownModifier: -3000, // -3.0s (quase instantâneo!)
    },
  },

  // ─────────────────────────────────────────────
  // ── ISCAS ESPECIAIS (BAITS) ──────────────────
  // ─────────────────────────────────────────────
  {
    id: 'bait_worm',
    assetId: 'bait_worm',
    name: 'Minhoca Clássica',
    type: 'bait',
    description: 'Isca tradicional. Perfeita para águas calmas de lagos e riachos.',
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
    id: 'bait_dough',
    assetId: 'bait_dough',
    name: 'Massa Doce de Baunilha',
    type: 'bait',
    description: 'Massa artesanal doce e amarelada. As carpas e tilápias não resistem ao cheiro.',
    price: 15,
    quantity: 5,
    requiredLevel: 2,
    modifiers: {
      emptyChanceModifier: -0.06,
      rarityModifier: { common: +6, uncommon: +3 },
      locationBonus: ['lake', 'river'],
    },
  },

  {
    id: 'bait_cricket',
    assetId: 'bait_cricket',
    name: 'Grilo da Floresta',
    type: 'bait',
    description: 'Bate as perninhas na flor d’água atraindo peixes caçadores de superfície.',
    price: 22,
    quantity: 5,
    requiredLevel: 3,
    modifiers: {
      emptyChanceModifier: -0.07,
      rarityModifier: { uncommon: +5, rare: +2 },
      locationBonus: ['river', 'lake'],
    },
  },

  {
    id: 'bait_shrimp',
    assetId: 'bait_shrimp',
    name: 'Camarão Fresco',
    type: 'bait',
    description: 'Excelente para peixes predadores, espécies costeiras e marinhas.',
    price: 30,
    quantity: 5,
    requiredLevel: 4,
    modifiers: {
      emptyChanceModifier: -0.08,
      rarityModifier: { uncommon: +6, rare: +3 },
      locationBonus: ['sea', 'deep_sea'],
    },
  },

  {
    id: 'bait_lure_glow',
    assetId: 'bait_lure_glow',
    name: 'Isca Artificial Fosforescente',
    type: 'bait',
    description: 'Emite brilho neon no escuro das profundezas. Fatal em pescarias noturnas e abissais.',
    price: 90,
    quantity: 3,
    requiredLevel: 6,
    modifiers: {
      emptyChanceModifier: -0.1,
      rarityModifier: { rare: +5, epic: +3 },
      locationBonus: ['deep_sea', 'sea'],
    },
  },

  {
    id: 'bait_live_minnow',
    assetId: 'bait_live_minnow',
    name: 'Peixinho Prateado Vivo',
    type: 'bait',
    description: 'Nado frenético e reflexos de prata que atiçam os maiores predadores do ecossistema.',
    price: 160,
    quantity: 3,
    requiredLevel: 8,
    modifiers: {
      emptyChanceModifier: -0.11,
      rarityModifier: { rare: +6, epic: +4 },
      locationBonus: null,
    },
  },

  {
    id: 'bait_blood_extract',
    assetId: 'bait_blood_extract',
    name: 'Extrato de Sangue Atrativo',
    type: 'bait',
    description: 'Aroma aquático feroz que atrai tubarões e bestas carnívoras de quilômetros de distância.',
    price: 350,
    quantity: 2,
    requiredLevel: 11,
    modifiers: {
      emptyChanceModifier: -0.14,
      rarityModifier: { epic: +6, legendary: +4 },
      locationBonus: ['sea', 'deep_sea'],
    },
  },

  {
    id: 'bait_golden',
    assetId: 'bait_golden',
    name: 'Isca Dourada Solar',
    type: 'bait',
    description: 'Isca mágica luminosa. Oportunidade dourada para atrair peixes lendários.',
    price: 450,
    quantity: 1,
    requiredLevel: 12,
    modifiers: {
      emptyChanceModifier: -0.15,
      rarityModifier: { rare: +6, epic: +6, legendary: +5 },
      locationBonus: null,
    },
  },

  {
    id: 'bait_kraken_eye',
    assetId: 'bait_kraken_eye',
    name: 'Olho de Kraken Abissal',
    type: 'bait',
    description: 'Relíquia mágica do fundo das fossas oceânicas. Desperta as maiores lendas dos mares.',
    price: 1800,
    quantity: 1,
    requiredLevel: 16,
    modifiers: {
      emptyChanceModifier: -0.2,
      rarityModifier: { epic: +9, legendary: +9 },
      locationBonus: null,
    },
  },
];
