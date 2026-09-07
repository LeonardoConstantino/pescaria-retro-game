// src/game/data/fish.data.ts
// ─────────────────────────────────────────────
// Catálogo completo de peixes do jogo.
// Cada peixe possui um assetId único para o
// cliente associar imagens e animações.
// ─────────────────────────────────────────────

export interface GameFish {
  id: string;
  assetId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  minWeight: number;
  maxWeight: number;
  basePrice: number;
  xpReward: number;
  locations: string[];
  description: string;
  weight?: number;
  inventoryId?: string | null;
}

export const FishData: GameFish[] = [
  // ── Comuns ───────────────────────────────
  {
    id: 'fish_tilapia',
    assetId: 'fish_tilapia',
    name: 'Tilápia',
    rarity: 'common',
    minWeight: 0.5,
    maxWeight: 2.0,
    basePrice: 12,
    xpReward: 12,
    locations: ['lake', 'river'],
    description: 'Um peixe muito comum, dócil e abundante.',
  },
  {
    id: 'fish_catfish',
    assetId: 'fish_catfish',
    name: 'Bagre',
    rarity: 'common',
    minWeight: 1.0,
    maxWeight: 4.0,
    basePrice: 16,
    xpReward: 14,
    locations: ['river', 'swamp'],
    description: 'Habita os leitos lamacentos e possui longos barbilhões sensoriais.',
  },
  {
    id: 'fish_carp',
    assetId: 'fish_carp',
    name: 'Carpa',
    rarity: 'common',
    minWeight: 1.5,
    maxWeight: 5.0,
    basePrice: 15,
    xpReward: 14,
    locations: ['lake'],
    description: 'Nadadora paciente e resistente, muito apreciada em lagos.',
  },

  // ── Incomuns ─────────────────────────────
  {
    id: 'fish_bass',
    assetId: 'fish_bass',
    name: 'Robalo',
    rarity: 'uncommon',
    minWeight: 2.0,
    maxWeight: 7.0,
    basePrice: 42,
    xpReward: 26,
    locations: ['river', 'sea'],
    description: 'Ágil e brigador, desafia a linha de qualquer pescador.',
  },
  {
    id: 'fish_trout',
    assetId: 'fish_trout',
    name: 'Truta Arco-Íris',
    rarity: 'uncommon',
    minWeight: 1.0,
    maxWeight: 4.5,
    basePrice: 38,
    xpReward: 24,
    locations: ['river'],
    description: 'Prefere águas gélidas e correntes rápidas, reluzindo com cores vibrantes.',
  },
  {
    id: 'fish_snapper',
    assetId: 'fish_snapper',
    name: 'Pargo Vermelho',
    rarity: 'uncommon',
    minWeight: 2.5,
    maxWeight: 8.0,
    basePrice: 48,
    xpReward: 30,
    locations: ['sea'],
    description: 'Coloração escarlate brilhante e muito valorizado no mercado marítimo.',
  },

  // ── Raros ────────────────────────────────
  {
    id: 'fish_salmon',
    assetId: 'fish_salmon',
    name: 'Salmão Prateado',
    rarity: 'rare',
    minWeight: 3.0,
    maxWeight: 12.0,
    basePrice: 130,
    xpReward: 65,
    locations: ['river', 'sea'],
    description: 'Capaz de saltar corredeiras com potência muscular espantosa.',
  },
  {
    id: 'fish_tuna',
    assetId: 'fish_tuna',
    name: 'Atum Azul',
    rarity: 'rare',
    minWeight: 10.0,
    maxWeight: 40.0,
    basePrice: 165,
    xpReward: 75,
    locations: ['sea', 'deep_sea'],
    description: 'Velocista supremo dos oceanos profundos.',
  },
  {
    id: 'fish_piranha',
    assetId: 'fish_piranha',
    name: 'Piranha Vermelha',
    rarity: 'rare',
    minWeight: 0.5,
    maxWeight: 2.0,
    basePrice: 110,
    xpReward: 70,
    locations: ['river', 'swamp'],
    description: 'Mandíbula pontiaguda e apetite implacável. Cuidado com os dedos!',
  },

  // ── Épicos ────────────────────────────────
  {
    id: 'fish_swordfish',
    assetId: 'fish_swordfish',
    name: 'Peixe-Espada',
    rarity: 'epic',
    minWeight: 20.0,
    maxWeight: 80.0,
    basePrice: 420,
    xpReward: 160,
    locations: ['sea', 'deep_sea'],
    description: 'Armado com uma lâmina natural, um duelo lendário com a natureza.',
  },
  {
    id: 'fish_arapaima',
    assetId: 'fish_arapaima',
    name: 'Pirarucu',
    rarity: 'epic',
    minWeight: 30.0,
    maxWeight: 100.0,
    basePrice: 520,
    xpReward: 190,
    locations: ['river', 'swamp'],
    description: 'O gigante dos rios e pântanos amazônicos, com escamas couraçadas.',
  },

  // ── Lendários ─────────────────────────────
  {
    id: 'fish_oarfish',
    assetId: 'fish_oarfish',
    name: 'Peixe-Remo',
    rarity: 'legendary',
    minWeight: 50.0,
    maxWeight: 200.0,
    basePrice: 2200,
    xpReward: 550,
    locations: ['deep_sea'],
    description: 'A grande serpente prateada das profundezas, anunciadora de tempestades.',
  },
  {
    id: 'fish_golden_carp',
    assetId: 'fish_golden_carp',
    name: 'Carpa Dourada Celestial',
    rarity: 'legendary',
    minWeight: 5.0,
    maxWeight: 15.0,
    basePrice: 2800,
    xpReward: 650,
    locations: ['lake'],
    description: 'Brilha com auréola divina. Dizem que traz sorte eterna a quem a encontra.',
  },
  {
    id: 'fish_kraken_baby',
    assetId: 'fish_kraken_baby',
    name: 'Filhote de Kraken',
    rarity: 'legendary',
    minWeight: 80.0,
    maxWeight: 300.0,
    basePrice: 5500,
    xpReward: 1100,
    locations: ['deep_sea'],
    description: 'Tentáculos púrpuras, olhos estelares e auréola mística. O ápice da pescaria!',
  },
];
