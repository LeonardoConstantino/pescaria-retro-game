// src/game/data/prestige.data.ts
// ─────────────────────────────────────────────────────────────
// Sistema de Prestígio / Renascimento Cósmico (Cookie Clicker Ascension)
// Moeda Cósmica: Escamas Douradas Cósmicas (Golden Scales)
// Cada escama confere +1% de bônus permanente de produção (CPS) e clique.
// ─────────────────────────────────────────────────────────────

export interface CosmicBlessing {
  id: string;
  name: string;
  emoji: string;
  cost: number; // Em Escamas Douradas Cósmicas
  description: string;
  flavorText: string;
  tier: 1 | 2 | 3;
  effectType:
    | 'bonus_cps_percent'
    | 'golden_fish_frequency'
    | 'offline_cap'
    | 'rare_fish_luck'
    | 'starting_coins'
    | 'water_click_power'
    | 'offline_efficiency'
    | 'aquarium_boost'
    | 'xp_boost'
    | 'trophy_value'
    | 'golden_fish_duration'
    | 'bait_preserve'
    | 'permanent_talent';
  value: number;
}

export const COSMIC_BLESSINGS: CosmicBlessing[] = [
  // Tier 1 — Iniciação Celestial (1 a 5 Escamas)
  {
    id: 'blessing_golden_magnet',
    name: 'Ímã Astral de Peixes Dourados',
    emoji: '🧲',
    cost: 1,
    tier: 1,
    description: 'Peixes Dourados (*Golden Fish*) surgem com 35% mais frequência.',
    flavorText: '"O brilho das suas escamas atrai seres místicos das profundezas."',
    effectType: 'golden_fish_frequency',
    value: 0.35,
  },
  {
    id: 'blessing_ancestral_wealth',
    name: 'Herança do Pescador Ancião',
    emoji: '🏺',
    cost: 2,
    tier: 1,
    description: 'Comece cada novo renascimento já com 1.500 🪙 no bolso.',
    flavorText: '"Um pote de moedas enterrado sob as raízes do chorão."',
    effectType: 'starting_coins',
    value: 1500,
  },
  {
    id: 'blessing_water_surge',
    name: 'Ressonância das Marés',
    emoji: '⚡',
    cost: 3,
    tier: 1,
    description: '+35% de moedas ao tocar ou clicar diretamente na água.',
    flavorText: '"Suas mãos transmitem vibrações elétricas que hipnotizam os cardumes."',
    effectType: 'water_click_power',
    value: 0.35,
  },
  {
    id: 'blessing_celestial_luck',
    name: 'Sorte das Constelações',
    emoji: '🍀',
    cost: 5,
    tier: 1,
    description: '+15% de chance de fisgar peixes Raros, Épicos e Lendários.',
    flavorText: '"As marés e as estrelas conspiram em favor da sua linha."',
    effectType: 'rare_fish_luck',
    value: 0.15,
  },

  // Tier 2 — Mestria Oceânica (10 a 30 Escamas)
  {
    id: 'blessing_extended_offline',
    name: 'Ampulheta Cósmica das Marés',
    emoji: '⏳',
    cost: 10,
    tier: 2,
    description: 'Aumenta o tempo máximo de acúmulo offline de 4 para 10 horas.',
    flavorText: '"O tempo não desgasta mais suas redes quando você dorme."',
    effectType: 'offline_cap',
    value: 10,
  },
  {
    id: 'blessing_idle_efficiency',
    name: 'Vigília Noturna Perfeita',
    emoji: '⚓',
    cost: 15,
    tier: 2,
    description: 'Aumenta a eficiência passiva offline de 65% para 100% de rendimento.',
    flavorText: '"Sua tripulação mantém o ritmo impecável mesmo sem supervisão."',
    effectType: 'offline_efficiency',
    value: 1.0,
  },
  {
    id: 'blessing_aquarium_prestige',
    name: 'Aquário dos Deuses',
    emoji: '🏛️',
    cost: 20,
    tier: 2,
    description: 'Visitantes do Aquário doam o dobro (2x) de gorjetas de moedas.',
    flavorText: '"Espécimes iluminados por aura cósmica atraem multidões maravilhadas."',
    effectType: 'aquarium_boost',
    value: 2.0,
  },
  {
    id: 'blessing_xp_resonance',
    name: 'Sabedoria das Estrelas',
    emoji: '📜',
    cost: 25,
    tier: 2,
    description: '+25% de experiência (XP) permanente em todas as capturas.',
    flavorText: '"Cada peixe retirado da água revela segredos ancestrais do oceano."',
    effectType: 'xp_boost',
    value: 0.25,
  },
  {
    id: 'blessing_divine_current',
    name: 'Correnteza Divina de Poseidon',
    emoji: '🌊',
    cost: 30,
    tier: 2,
    description: '+30% de produção passiva (CPS) geral de toda a frota para sempre.',
    flavorText: '"O murmúrio das correntes oceânicas acelera cada batimento do mar."',
    effectType: 'bonus_cps_percent',
    value: 0.30,
  },

  // Tier 3 — Apoteose das Marés (45 a 120 Escamas)
  {
    id: 'blessing_trophy_master',
    name: 'Olhar do Colecionador Mítico',
    emoji: '🏆',
    cost: 45,
    tier: 3,
    description: 'Peixes Troféu (peso máximo) concedem +50% de valor no mercado (em vez de +25%).',
    flavorText: '"Mercadores de terras distantes pagam fortunas pelas maiores lendas."',
    effectType: 'trophy_value',
    value: 0.50,
  },
  {
    id: 'blessing_golden_frenzy',
    name: 'Extensão de Frenesi Astral',
    emoji: '🌟',
    cost: 70,
    tier: 3,
    description: 'A duração de todos os efeitos do Peixe Dourado é aumentada em +50%.',
    flavorText: '"O tempo parece desacelerar enquanto as águas douradas transbordam riqueza."',
    effectType: 'golden_fish_duration',
    value: 0.50,
  },
  {
    id: 'blessing_bait_alchemy',
    name: 'Alquimia das Iscas',
    emoji: '🔮',
    cost: 90,
    tier: 3,
    description: '20% de chance de não consumir a isca equipada ao lançar a linha.',
    flavorText: '"Iscas encantadas que retornam misteriosamente ao anzol após a fisgada."',
    effectType: 'bait_preserve',
    value: 0.20,
  },
  {
    id: 'blessing_ocean_lord',
    name: 'Coroa das Profundezas',
    emoji: '🔱',
    cost: 120,
    tier: 3,
    description: 'Concede +1 Ponto de Talento bônus permanente para cada Ascensão realizada.',
    flavorText: '"A autoridade suprema dos mares transforma pescadores mortais em reis."',
    effectType: 'permanent_talent',
    value: 1,
  },
];

/**
 * Constantes da curva de Escamas Cósmicas:
 * 35.000 * n^2 + 25.000 * n
 * 1ª escama: 60.000 moedas
 * 2ª escama: 190.000 moedas
 * 3ª escama: 390.000 moedas
 * 4ª escama: 660.000 moedas
 * 5ª escama: 1.000.000 moedas
 * 10ª escama: 3.750.000 moedas
 * 25ª escama: 22.500.000 moedas
 */
const PRESTIGE_A = 35000;
const PRESTIGE_B = 25000;

/**
 * Requisito mínimo de nível do pescador para realizar a Ascensão Cósmica
 */
export const MIN_ASCENSION_LEVEL = 10;

/**
 * Calcula o bônus percentual permanente concedido pelas Escamas Cósmicas acumuladas,
 * utilizando uma curva suave de retornos proporcionais para preservar o equilíbrio.
 */
export function calculateAscensionBonusPercent(claimedScales: number, blessings: string[] = []): number {
  let bonus = 0;
  if (claimedScales <= 50) {
    bonus = claimedScales * 1.0;
  } else if (claimedScales <= 150) {
    bonus = 50 + (claimedScales - 50) * 0.5;
  } else {
    bonus = 100 + (claimedScales - 150) * 0.2;
  }

  if (blessings.includes('blessing_divine_current')) {
    bonus += 30;
  }

  return Math.round(bonus * 10) / 10;
}

/**
 * Calcula quantas Escamas Cósmicas totais o jogador acumulou com base no seu total histórico de moedas.
 * Solução analítica da equação quadrática: A*n^2 + B*n - C = 0
 */
export function calculateTotalScalesForCoins(totalCoinsEarned: number): number {
  if (totalCoinsEarned < PRESTIGE_A + PRESTIGE_B) return 0;
  const delta = PRESTIGE_B * PRESTIGE_B + 4 * PRESTIGE_A * totalCoinsEarned;
  const n = (-PRESTIGE_B + Math.sqrt(delta)) / (2 * PRESTIGE_A);
  return Math.max(0, Math.floor(n));
}

/**
 * Calcula quantas moedas totais são necessárias para alcançar a PRÓXIMA escama
 */
export function coinsForNextScale(currentScales: number): number {
  const nextScale = currentScales + 1;
  return PRESTIGE_A * nextScale * nextScale + PRESTIGE_B * nextScale;
}
