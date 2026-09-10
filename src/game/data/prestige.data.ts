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
  effectType: 'bonus_cps_percent' | 'golden_fish_frequency' | 'offline_cap' | 'rare_fish_luck' | 'starting_coins';
  value: number;
}

export const COSMIC_BLESSINGS: CosmicBlessing[] = [
  {
    id: 'blessing_golden_magnet',
    name: 'Ímã de Peixes Dourados',
    emoji: '🧲',
    cost: 1,
    description: 'Peixes Dourados (*Golden Fish*) surgem com 40% mais frequência.',
    flavorText: '"O brilho das suas escamas atrai seres místicos das profundezas."',
    effectType: 'golden_fish_frequency',
    value: 0.4,
  },
  {
    id: 'blessing_ancestral_wealth',
    name: 'Herança do Pescador Ancião',
    emoji: '🏺',
    cost: 2,
    description: 'Comece cada novo renascimento já com 2.500 🪙 de presente.',
    flavorText: '"Um pote de moedas enterrado sob as raízes do chorão."',
    effectType: 'starting_coins',
    value: 2500,
  },
  {
    id: 'blessing_celestial_luck',
    name: 'Sorte Astral Oceânica',
    emoji: '🍀',
    cost: 5,
    description: '+15% de chance de fisgar peixes Raros e Lendários.',
    flavorText: '"As marés e as estrelas conspiram em favor da sua linha."',
    effectType: 'rare_fish_luck',
    value: 0.15,
  },
  {
    id: 'blessing_extended_offline',
    name: 'Ampulheta Cósmica das Marés',
    emoji: '⏳',
    cost: 10,
    description: 'Aumenta o limite máximo de ganho offline de 4 para 12 horas.',
    flavorText: '"O tempo não desgasta mais suas redes quando você dorme."',
    effectType: 'offline_cap',
    value: 12,
  },
  {
    id: 'blessing_divine_current',
    name: 'Correnteza Divina de Poseidon',
    emoji: '🌊',
    cost: 25,
    description: '+50% adicional em todo o CPS passivo e cliques para sempre.',
    flavorText: '"O murmúrio das correntes oceânicas acelera cada batimento do mar."',
    effectType: 'bonus_cps_percent',
    value: 0.5,
  },
];

/**
 * Calcula quantas Escamas Cósmicas totais o jogador acumulou com base no seu total histórico de moedas.
 * Fórmula: Math.floor(Math.cbrt(totalCoinsEarned / 100000))
 * Exemplo:
 * 100.000 moedas = 1 escama
 * 800.000 moedas = 2 escamas
 * 2.700.000 moedas = 3 escamas
 * 27.000.000 moedas = 6 escamas
 * 100.000.000 moedas = 10 escamas
 */
export function calculateTotalScalesForCoins(totalCoinsEarned: number): number {
  if (totalCoinsEarned < 100000) return 0;
  return Math.floor(Math.cbrt(totalCoinsEarned / 100000));
}

/**
 * Calcula quantas moedas são necessárias para alcançar a PRÓXIMA escama
 */
export function coinsForNextScale(currentScales: number): number {
  const nextScale = currentScales + 1;
  return Math.pow(nextScale, 3) * 100000;
}
