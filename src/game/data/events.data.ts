// src/game/data/events.data.ts
// ─────────────────────────────────────────────
// Catálogo de eventos aleatórios da pescaria.
// Cada evento pode modificar a sessão, premiar
// itens/moedas ou encadear novos eventos.
// ─────────────────────────────────────────────

export interface GameEventEffect {
  coins?: number;
  bonusFish?: boolean;
  lostFish?: boolean;
  loseItem?: string;
  giveItem?: string;
  xp?: number;
  boostRarity?: {
    rarity: string;
    value: number;
    durationPescarias: number;
  };
  boostCooldown?: {
    value: number;
    durationPescarias: number;
  };
  loseFishChance?: number;
}

export interface GameEvent {
  id: string;
  assetId: string;
  name: string;
  type: 'positive' | 'negative' | 'neutral';
  weight: number;
  locations: string[] | null;
  description: string;
  effect: GameEventEffect;
  chain?: string[];
}

export const EventData: GameEvent[] = [
  // ── Positivos ────────────────────────────
  {
    id: 'event_treasure',
    assetId: 'event_treasure',
    name: 'Baú Submerso',
    type: 'positive',
    weight: 18,
    locations: null,
    description: 'Sua linha prendeu em algo pesado... um velho baú coberto de conchas cheio de moedas de ouro!',
    effect: { coins: 120, xp: 40 },
    chain: ['event_golden_bait'],
  },
  {
    id: 'event_double_fish',
    assetId: 'event_double_fish',
    name: 'Fisgada Dupla',
    type: 'positive',
    weight: 22,
    locations: null,
    description: 'Que sorte inacreditável! Dois peixes morderam o mesmo anzol em uma disputa voraz!',
    effect: { bonusFish: true, xp: 25 },
  },
  {
    id: 'event_golden_bait',
    assetId: 'event_golden_bait',
    name: 'Isca Luminosa Reluzente',
    type: 'positive',
    weight: 12,
    locations: ['sea', 'deep_sea'],
    description: 'Uma alga fosforescente enroscou no seu anzol, banhando a água com um brilho atrativo!',
    effect: {
      giveItem: 'bait_golden',
      boostRarity: { rarity: 'rare', value: 8, durationPescarias: 3 },
      xp: 20,
    },
  },
  {
    id: 'event_mermaid',
    assetId: 'event_mermaid',
    name: 'Bênção das Marés',
    type: 'positive',
    weight: 8,
    locations: ['sea', 'deep_sea'],
    description: 'Um cântico suave ecoa pelas ondas. As águas ao redor do seu barco se iluminam de magia!',
    effect: {
      coins: 200,
      xp: 100,
      boostRarity: { rarity: 'epic', value: 5, durationPescarias: 2 },
    },
  },

  // ── Negativos ────────────────────────────
  {
    id: 'event_storm',
    assetId: 'event_storm',
    name: 'Tempestade Súbita',
    type: 'negative',
    weight: 16,
    locations: ['sea', 'deep_sea', 'lake'],
    description: 'O céu escureceu em segundos e o vento agita as ondas ferozmente!',
    effect: {
      boostCooldown: { value: 2000, durationPescarias: 2 },
      loseFishChance: 0.25,
    },
    chain: ['event_lightning', 'event_giant_wave'],
  },
  {
    id: 'event_broken_line',
    assetId: 'event_broken_line',
    name: 'Linha Rompida!',
    type: 'negative',
    weight: 14,
    locations: null,
    description: 'Um puxão violento estalou o nylon! O peixe escapou levando a isca...',
    effect: { lostFish: true },
  },
  {
    id: 'event_lightning',
    assetId: 'event_lightning',
    name: 'Raio na Água!',
    type: 'negative',
    weight: 8,
    locations: ['sea', 'lake', 'swamp'],
    description: 'CABUM! Um relâmpago atingiu a água próxima, espantando os cardumes assustados!',
    effect: { lostFish: true, boostCooldown: { value: 3000, durationPescarias: 1 } },
  },
  {
    id: 'event_giant_wave',
    assetId: 'event_giant_wave',
    name: 'Onda Gigante',
    type: 'negative',
    weight: 10,
    locations: ['sea', 'deep_sea'],
    description: 'Uma onda avassaladora chacoalhou o barco e derrubou baldes no convés!',
    effect: { lostFish: true },
  },
  {
    id: 'event_heron_steal',
    assetId: 'event_heron_steal',
    name: 'Garça Ladrona',
    type: 'negative',
    weight: 14,
    locations: ['lake', 'river', 'swamp'],
    description: 'Uma garça atrevida mergulhou do céu e surrupiou o peixe antes de você recolher!',
    effect: { lostFish: true },
  },

  // ── Neutros ──────────────────────────────
  {
    id: 'event_trash',
    assetId: 'event_trash',
    name: 'Bota Velha Pescada',
    type: 'neutral',
    weight: 15,
    locations: ['river', 'lake', 'swamp'],
    description: 'Você sentiu peso na linha, mas puxou uma bota enlameada do fundo do leito.',
    effect: { xp: 5 },
  },
];
