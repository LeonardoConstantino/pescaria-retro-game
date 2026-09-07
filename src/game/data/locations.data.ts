// src/game/data/locations.data.ts
// ─────────────────────────────────────────────
// Locais de pesca desbloqueados por nível (XP).
// fishPool define quais peixes podem aparecer
// e weightModifier ajusta as probabilidades
// de raridade do local.
// ─────────────────────────────────────────────

export interface GameLocation {
  id: string;
  assetId: string;
  name: string;
  description: string;
  requiredLevel: number;
  fishPool: string[];
  rarityModifier: Record<string, number>;
  emptyChanceModifier: number;
  eventChanceModifier: number;
  ambienceColor?: string;
  gradient?: string;
}

export const LocationData: GameLocation[] = [
  {
    id: 'lake',
    assetId: 'location_lake',
    name: 'Lago Tranquilo',
    description: 'Um lago calmo de águas cristalinas, perfeito para iniciantes.',
    requiredLevel: 1,
    fishPool: ['fish_tilapia', 'fish_carp', 'fish_golden_carp'],
    rarityModifier: {
      common: +10,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: -0.2,
    },
    emptyChanceModifier: -0.05,
    eventChanceModifier: 0,
    ambienceColor: '#38bdf8',
    gradient: 'from-sky-900 via-teal-900 to-emerald-950',
  },

  {
    id: 'river',
    assetId: 'location_river',
    name: 'Rio Correntoso',
    description: 'Correntes vigorosas e pedras escorregadias com peixes fortes e ágeis.',
    requiredLevel: 3,
    fishPool: [
      'fish_tilapia',
      'fish_catfish',
      'fish_bass',
      'fish_trout',
      'fish_salmon',
      'fish_piranha',
      'fish_arapaima',
    ],
    rarityModifier: {
      common: 0,
      uncommon: +5,
      rare: +2,
      epic: 0,
      legendary: 0,
    },
    emptyChanceModifier: 0,
    eventChanceModifier: +0.05,
    ambienceColor: '#2dd4bf',
    gradient: 'from-emerald-900 via-cyan-900 to-slate-950',
  },

  {
    id: 'swamp',
    assetId: 'location_swamp',
    name: 'Pântano Sombrio',
    description: 'Águas turvas e musgosos entrelaçados escondendo predadores misteriosos.',
    requiredLevel: 5,
    fishPool: ['fish_catfish', 'fish_piranha', 'fish_arapaima'],
    rarityModifier: {
      common: -10,
      uncommon: +5,
      rare: +5,
      epic: +2,
      legendary: 0,
    },
    emptyChanceModifier: +0.05,
    eventChanceModifier: +0.15,
    ambienceColor: '#a3e635',
    gradient: 'from-lime-950 via-emerald-950 to-stone-950',
  },

  {
    id: 'sea',
    assetId: 'location_sea',
    name: 'Mar Aberto',
    description: 'Ondas salgadas e brisa fresca. Cardumes velozes e monstros marinhos.',
    requiredLevel: 8,
    fishPool: [
      'fish_bass',
      'fish_snapper',
      'fish_tuna',
      'fish_salmon',
      'fish_swordfish',
    ],
    rarityModifier: {
      common: -5,
      uncommon: +5,
      rare: +3,
      epic: +1,
      legendary: 0,
    },
    emptyChanceModifier: -0.05,
    eventChanceModifier: +0.1,
    ambienceColor: '#60a5fa',
    gradient: 'from-blue-900 via-indigo-950 to-slate-950',
  },

  {
    id: 'deep_sea',
    assetId: 'location_deep_sea',
    name: 'Abismo Profundo',
    description: 'A zona abissal onde a luz não chega. Criaturas ancestrais e lendas vivas.',
    requiredLevel: 12,
    fishPool: [
      'fish_tuna',
      'fish_swordfish',
      'fish_oarfish',
      'fish_kraken_baby',
    ],
    rarityModifier: {
      common: -20,
      uncommon: -5,
      rare: +5,
      epic: +8,
      legendary: +3,
    },
    emptyChanceModifier: +0.1,
    eventChanceModifier: +0.2,
    ambienceColor: '#c084fc',
    gradient: 'from-indigo-950 via-purple-950 to-black',
  },
];
