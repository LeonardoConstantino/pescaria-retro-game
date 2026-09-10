// src/game/data/upgrades.data.ts
// ─────────────────────────────────────────────────────────────
// Upgrades Exponenciais de Construções & Cliques (Estilo Cookie Clicker)
// Cada upgrade dobra a produção de um ajudante específico ou amplifica o clique.
// ─────────────────────────────────────────────────────────────

export interface IdleUpgrade {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  flavorText: string;
  targetTierId?: string; // Se for para um ajudante específico (ex: 'bamboo_stand')
  effectType: 'tier_multiplier' | 'click_power' | 'all_cps';
  multiplier: number; // ex: 2 (dobra)
  requirement: {
    tierId?: string;
    minCount?: number;
    minCoinsEarned?: number;
    minClicks?: number;
  };
}

export const IDLE_UPGRADES: IdleUpgrade[] = [
  // ── 1. VARA DE BAMBU (bamboo_stand) ──
  {
    id: 'upg_bamboo_1',
    name: 'Bambu Envernizado',
    emoji: '🎋',
    cost: 100,
    description: 'Varas de bambu produzem o dobro de moedas (2x CPS).',
    flavorText: '"Não lasca mais os dedos do pescador nem racha no sereno."',
    targetTierId: 'bamboo_stand',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'bamboo_stand', minCount: 1 },
  },
  {
    id: 'upg_bamboo_2',
    name: 'Linha Fluorocarbono Invisível',
    emoji: '🧵',
    cost: 500,
    description: 'Varas de bambu produzem o dobro de moedas (2x CPS).',
    flavorText: '"Os lambaris nem desconfiam de que há um anzol ali."',
    targetTierId: 'bamboo_stand',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'bamboo_stand', minCount: 5 },
  },
  {
    id: 'upg_bamboo_3',
    name: 'Anzol com Farpas de Titânio',
    emoji: '🪝',
    cost: 5000,
    description: 'Varas de bambu produzem o dobro de moedas (2x CPS).',
    flavorText: '"Uma vez que morde, não solta nem com reza braba."',
    targetTierId: 'bamboo_stand',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'bamboo_stand', minCount: 25 },
  },

  // ── 2. GATO PESCADOR (fishing_cat) ──
  {
    id: 'upg_cat_1',
    name: 'Ração Premium com Salmão',
    emoji: '🐟',
    cost: 1000,
    description: 'Gatos pescadores produzem o dobro de moedas (2x CPS).',
    flavorText: '"O pelo fica brilhoso e as patadas 50% mais velozes."',
    targetTierId: 'fishing_cat',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'fishing_cat', minCount: 1 },
  },
  {
    id: 'upg_cat_2',
    name: 'Erva de Gato Estimulante (Catnip)',
    emoji: '🌿',
    cost: 5000,
    description: 'Gatos pescadores produzem o dobro de moedas (2x CPS).',
    flavorText: '"Foco hiperativo. Eles passam horas sem piscar observando a água."',
    targetTierId: 'fishing_cat',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'fishing_cat', minCount: 5 },
  },
  {
    id: 'upg_cat_3',
    name: 'Botinhas de Borracha Felinas',
    emoji: '👢',
    cost: 25000,
    description: 'Gatos pescadores produzem o dobro de moedas (2x CPS).',
    flavorText: '"Agora eles entram até a canela na água sem reclamar de pata molhada."',
    targetTierId: 'fishing_cat',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'fishing_cat', minCount: 25 },
  },

  // ── 3. SEU ZÉ APOSENTADO (retired_grandpa) ──
  {
    id: 'upg_grandpa_1',
    name: 'Pilha Alcalina de Longa Duração pro Rádio',
    emoji: '🔋',
    cost: 12000,
    description: 'Seu Zé Aposentado produz o dobro de moedas (2x CPS).',
    flavorText: '"Transmissão ininterrupta da rodada esportiva e das modas de viola."',
    targetTierId: 'retired_grandpa',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'retired_grandpa', minCount: 1 },
  },
  {
    id: 'upg_grandpa_2',
    name: 'Garrafa Térmica com Café Bem Forte',
    emoji: '☕',
    cost: 60000,
    description: 'Seu Zé Aposentado produz o dobro de moedas (2x CPS).',
    flavorText: '"Café preto que espanta qualquer cochilo debaixo do chapéu de palha."',
    targetTierId: 'retired_grandpa',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'retired_grandpa', minCount: 5 },
  },
  {
    id: 'upg_grandpa_3',
    name: 'Cadeira Reclinável Dobrável Acolchoada',
    emoji: '🪑',
    cost: 300000,
    description: 'Seu Zé Aposentado produz o dobro de moedas (2x CPS).',
    flavorText: '"Conforto lombar ergonômico para 14 horas de proseio e fisgadas."',
    targetTierId: 'retired_grandpa',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'retired_grandpa', minCount: 25 },
  },

  // ── 4. CANOA COM REDE (fishing_canoe) ──
  {
    id: 'upg_canoe_1',
    name: 'Remo Leve de Fibra de Vidro',
    emoji: '🛶',
    cost: 150000,
    description: 'Canoas de arrasto produzem o dobro de moedas (2x CPS).',
    flavorText: '"Navegação suave sem espantar os cardumes do fundo."',
    targetTierId: 'fishing_canoe',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'fishing_canoe', minCount: 1 },
  },
  {
    id: 'upg_canoe_2',
    name: 'Rede de Seda Náutica Trançada',
    emoji: '🕸️',
    cost: 750000,
    description: 'Canoas de arrasto produzem o dobro de moedas (2x CPS).',
    flavorText: '"Captura até os peixes que tentavam fingir de morto no fundo do rio."',
    targetTierId: 'fishing_canoe',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'fishing_canoe', minCount: 5 },
  },

  // ── 5. BRIGADA DE ARIRANHAS (tactical_otters) ──
  {
    id: 'upg_otter_1',
    name: 'Óculos de Mergulho Noturno',
    emoji: '🥽',
    cost: 1500000,
    description: 'Brigadas de ariranhas produzem o dobro de moedas (2x CPS).',
    flavorText: '"Visão térmica e noturna para caçadas em águas turvas e profundas."',
    targetTierId: 'tactical_otters',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'tactical_otters', minCount: 1 },
  },
  {
    id: 'upg_otter_2',
    name: 'Comunicação Tática por Apitos Submarinos',
    emoji: '📣',
    cost: 7500000,
    description: 'Brigadas de ariranhas produzem o dobro de moedas (2x CPS).',
    flavorText: '"Cercam cardumes inteiros com precisão de esquadrão de elite."',
    targetTierId: 'tactical_otters',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'tactical_otters', minCount: 5 },
  },

  // ── 6. TRAINEIRA A VAPOR (steam_trawler) ──
  {
    id: 'upg_trawler_1',
    name: 'Caldeira a Carvão Turboalimentada',
    emoji: '⚙️',
    cost: 15000000,
    description: 'Traineiras a vapor produzem o dobro de moedas (2x CPS).',
    flavorText: '"Motor roncando forte e esteiras transportadoras ultravelozes."',
    targetTierId: 'steam_trawler',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'steam_trawler', minCount: 1 },
  },

  // ── 7. SANTUÁRIO DE POSEIDON (poseidon_shrine) ──
  {
    id: 'upg_shrine_1',
    name: 'Tridente Dourado Consagrado',
    emoji: '🔱',
    cost: 100000000,
    description: 'Santuários de Poseidon produzem o dobro de moedas (2x CPS).',
    flavorText: '"As marés obedecem e os gigantes marinhos prestam reverência."',
    targetTierId: 'poseidon_shrine',
    effectType: 'tier_multiplier',
    multiplier: 2,
    requirement: { tierId: 'poseidon_shrine', minCount: 1 },
  },

  // ── 8. UPGRADES DE CLIQUE MANUAL (CLICK POWER) ──
  {
    id: 'upg_click_1',
    name: 'Dedo de Aço Inoxidável',
    emoji: '👆',
    cost: 100,
    description: 'Aumenta o poder do clique manual na água em +100%.',
    flavorText: '"Sem calos, sem fadiga, apenas toques precisos."',
    effectType: 'click_power',
    multiplier: 2,
    requirement: { minClicks: 10 },
  },
  {
    id: 'upg_click_2',
    name: 'Reflexos de Relâmpago',
    emoji: '⚡',
    cost: 2500,
    description: 'Cliques manuais na água geram +100% de moedas.',
    flavorText: '"Sua mão se move mais rápido do que a sombra do peixe na água."',
    effectType: 'click_power',
    multiplier: 2,
    requirement: { minClicks: 50 },
  },
  {
    id: 'upg_click_3',
    name: 'Luvas do Pescador Ninja',
    emoji: '🧤',
    cost: 50000,
    description: 'Cliques manuais na água geram o dobro de moedas.',
    flavorText: '"Toques na água tão sutis que criam vórtex de moedas instantâneas."',
    effectType: 'click_power',
    multiplier: 2,
    requirement: { minClicks: 200 },
  },
];
