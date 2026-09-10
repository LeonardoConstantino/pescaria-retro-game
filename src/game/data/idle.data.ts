// src/game/data/idle.data.ts
// ─────────────────────────────────────────────────────────────
// Catálogo de Ajudantes / Automações de Pesca (Estilo Cookie Clicker)
// Cada contratação gera Moedas por Segundo (CPS) e coloca boias
// cômicas na água com limites visuais performáticos.
// ─────────────────────────────────────────────────────────────

export interface IdleFisherTier {
  id: string;
  name: string;
  category: 'helper' | 'contraption' | 'vessel' | 'mythical';
  emoji: string;
  bobberVisual: {
    colorTop: string;
    colorBottom: string;
    antennaEmoji: string;
    wobbleSpeed: number;
    sizeScale: number;
  };
  baseCost: number;
  baseCps: number; // Moedas por segundo base
  description: string;
  flavorText: string;
}

export const IDLE_FISHER_TIERS: IdleFisherTier[] = [
  {
    id: 'bamboo_stand',
    name: 'Vara de Bambu Finada no Barro',
    category: 'contraption',
    emoji: '🎋',
    bobberVisual: {
      colorTop: '#ef4444',
      colorBottom: '#ffffff',
      antennaEmoji: '🌿',
      wobbleSpeed: 2.2,
      sizeScale: 0.65,
    },
    baseCost: 15,
    baseCps: 0.5,
    description: 'Uma vara amarrada com barbante e espetada na margem.',
    flavorText: '"Não cansa, não bebe água e nem reclama do sol."',
  },
  {
    id: 'fishing_cat',
    name: 'Gato Pescador Concursado',
    category: 'helper',
    emoji: '🐱',
    bobberVisual: {
      colorTop: '#f97316',
      colorBottom: '#fed7aa',
      antennaEmoji: '🐾',
      wobbleSpeed: 1.6,
      sizeScale: 0.75,
    },
    baseCost: 100,
    baseCps: 4,
    description: 'Um felino focado que dá patadas cirúrgicas na água.',
    flavorText: '"Fica com 10% dos lambaris como comissão sindical."',
  },
  {
    id: 'retired_grandpa',
    name: 'Seu Zé Aposentado com Radinho',
    category: 'helper',
    emoji: '👴',
    bobberVisual: {
      colorTop: '#3b82f6',
      colorBottom: '#e2e8f0',
      antennaEmoji: '📻',
      wobbleSpeed: 2.8,
      sizeScale: 0.85,
    },
    baseCost: 1100,
    baseCps: 32,
    description: 'Senta num banquinho de plástico ouvindo o jogo no rádio AM.',
    flavorText: '"Jura de pés juntos que ontem quase tirou um peixe de 3 metros."',
  },
  {
    id: 'canoe_net',
    name: 'Canoa com Rede de Arrasto Furtiva',
    category: 'vessel',
    emoji: '🛶',
    bobberVisual: {
      colorTop: '#10b981',
      colorBottom: '#064e3b',
      antennaEmoji: '🚩',
      wobbleSpeed: 1.9,
      sizeScale: 0.95,
    },
    baseCost: 12000,
    baseCps: 260,
    description: 'Varre o rio recolhendo de lambari a bota furada.',
    flavorText: '"A fumaça do motor de popa espanta os mosquitos e atrai os peixes."',
  },
  {
    id: 'otter_brigade',
    name: 'Brigada de Ariranhas Táticas',
    category: 'helper',
    emoji: '🦦',
    bobberVisual: {
      colorTop: '#8b5cf6',
      colorBottom: '#4c1d95',
      antennaEmoji: '🫧',
      wobbleSpeed: 1.2,
      sizeScale: 0.8,
    },
    baseCost: 130000,
    baseCps: 1400,
    description: 'Esquadrão anfíbio altamente treinado em cerco aquático.',
    flavorText: '"Nenhum peixe escapa do nado sincronizado subaquático."',
  },
  {
    id: 'trawler_ship',
    name: 'Traineira Pesqueira a Vapor',
    category: 'vessel',
    emoji: '🚢',
    bobberVisual: {
      colorTop: '#eab308',
      colorBottom: '#713f12',
      antennaEmoji: '⚓',
      wobbleSpeed: 2.5,
      sizeScale: 1.15,
    },
    baseCost: 1400000,
    baseCps: 7800,
    description: 'Guindastes movidos a carvão içando toneladas por segundo.',
    flavorText: '"A buzina de ré ecoa por todo o litoral."',
  },
  {
    id: 'poseidon_shrine',
    name: 'Santuário de Poseidon & Netuno',
    category: 'mythical',
    emoji: '🔱',
    bobberVisual: {
      colorTop: '#06b6d4',
      colorBottom: '#083344',
      antennaEmoji: '⚡',
      wobbleSpeed: 0.9,
      sizeScale: 1.3,
    },
    baseCost: 20000000,
    baseCps: 45000,
    description: 'Oferendas de pão com mortadela que encantam as divindades das marés.',
    flavorText: '"Os próprios peixes saltam voluntariamente em fila indiana no seu cesto."',
  },
];

/**
 * Fórmula exponencial de custo clássica de Cookie Clicker:
 * Custo(n) = CustoBase * (1.15 ^ n)
 */
export function calculateTierCost(tier: IdleFisherTier, ownedCount: number): number {
  return Math.floor(tier.baseCost * Math.pow(1.15, ownedCount));
}

/**
 * Calcula o CPS total de uma quantidade de ajudantes
 */
export function calculateTierTotalCps(tier: IdleFisherTier, ownedCount: number): number {
  return Math.round(tier.baseCps * ownedCount * 10) / 10;
}

export type GoldenFishEffectType = 'production_frenzy' | 'click_frenzy' | 'instant_school';

export interface GoldenFishReward {
  type: GoldenFishEffectType;
  title: string;
  description: string;
  durationSeconds: number;
  multiplier: number;
  instantCoins?: number;
}

export interface ActiveIdleBuff {
  type: GoldenFishEffectType;
  multiplier: number;
  expiresAt: number; // timestamp
}

