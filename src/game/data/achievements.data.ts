// src/game/data/achievements.data.ts
// ─────────────────────────────────────────────────────────────
// Catálogo de Conquistas & Marcos (Achievements & Milestones)
// Cada conquista desbloqueada adiciona +1.5% de bônus global de produção (Milk / Maré).
// ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'fishing' | 'clicks' | 'coins' | 'idle' | 'golden' | 'prestige';
  requirementType: 
    | 'total_fished'
    | 'legendary_caught'
    | 'water_clicks'
    | 'coins_earned'
    | 'cps_reached'
    | 'golden_fish_clicked'
    | 'ascensions_count'
    | 'fishers_owned';
  requirementValue: number;
  bonusPercent: number; // +1.5% padrão por conquista
}

export const ACHIEVEMENTS: Achievement[] = [
  // Categoria: Pescaria Manual
  {
    id: 'ach_first_catch',
    title: 'Primeira Fisgada',
    description: 'Pesque seu primeiríssimo peixe.',
    emoji: '🎣',
    category: 'fishing',
    requirementType: 'total_fished',
    requirementValue: 1,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_ten_catches',
    title: 'Pescador Amador',
    description: 'Pesque um total de 10 peixes.',
    emoji: '🐟',
    category: 'fishing',
    requirementType: 'total_fished',
    requirementValue: 10,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_fifty_catches',
    title: 'Lobo do Rio',
    description: 'Pesque 50 peixes no total.',
    emoji: '🐠',
    category: 'fishing',
    requirementType: 'total_fished',
    requirementValue: 50,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_hundred_catches',
    title: 'Mestre das Águas',
    description: 'Pesque 100 peixes com sua vara.',
    emoji: '🐡',
    category: 'fishing',
    requirementType: 'total_fished',
    requirementValue: 100,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_first_legendary',
    title: 'Lenda Viva',
    description: 'Fisgue pelo menos 1 peixe de raridade Lendária.',
    emoji: '👑',
    category: 'fishing',
    requirementType: 'legendary_caught',
    requirementValue: 1,
    bonusPercent: 2.0,
  },

  // Categoria: Cliques na Água (Clicker)
  {
    id: 'ach_click_10',
    title: 'Ondulações na Água',
    description: 'Toque na água 10 vezes para perturbar os peixes.',
    emoji: '💧',
    category: 'clicks',
    requirementType: 'water_clicks',
    requirementValue: 10,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_click_100',
    title: 'Dedo Veloz do Lago',
    description: 'Realize 100 cliques manuais na água.',
    emoji: '⚡',
    category: 'clicks',
    requirementType: 'water_clicks',
    requirementValue: 100,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_click_500',
    title: 'Tsunami Digital',
    description: 'Realize 500 cliques na água.',
    emoji: '🌊',
    category: 'clicks',
    requirementType: 'water_clicks',
    requirementValue: 500,
    bonusPercent: 1.5,
  },

  // Categoria: Economia & Moedas
  {
    id: 'ach_coins_1000',
    title: 'Primeiro Tostão',
    description: 'Acumule 1.000 moedas vitalícias.',
    emoji: '🪙',
    category: 'coins',
    requirementType: 'coins_earned',
    requirementValue: 1000,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_coins_50000',
    title: 'Cofre Submerso',
    description: 'Acumule 50.000 moedas vitalícias.',
    emoji: '💰',
    category: 'coins',
    requirementType: 'coins_earned',
    requirementValue: 50000,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_coins_1000000',
    title: 'Milionário do Anzol',
    description: 'Acumule 1.000.000 de moedas vitalícias.',
    emoji: '💎',
    category: 'coins',
    requirementType: 'coins_earned',
    requirementValue: 1000000,
    bonusPercent: 2.0,
  },

  // Categoria: Produção Passiva (CPS)
  {
    id: 'ach_cps_10',
    title: 'Renda Fluindo',
    description: 'Alcance uma produção passiva de pelo menos 10 🪙/s.',
    emoji: '⏱️',
    category: 'idle',
    requirementType: 'cps_reached',
    requirementValue: 10,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_cps_100',
    title: 'Fábrica Flutuante',
    description: 'Alcance uma produção passiva de pelo menos 100 🪙/s.',
    emoji: '🏭',
    category: 'idle',
    requirementType: 'cps_reached',
    requirementValue: 100,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_cps_1000',
    title: 'Império das Águas',
    description: 'Alcance uma produção de 1.000 🪙/s.',
    emoji: '🔱',
    category: 'idle',
    requirementType: 'cps_reached',
    requirementValue: 1000,
    bonusPercent: 2.0,
  },

  // Categoria: Peixe Dourado (Golden Fish)
  {
    id: 'ach_golden_fish_1',
    title: 'Encontro Dourado',
    description: 'Resgate seu primeiro Peixe Dourado místico na água.',
    emoji: '✨',
    category: 'golden',
    requirementType: 'golden_fish_clicked',
    requirementValue: 1,
    bonusPercent: 1.5,
  },
  {
    id: 'ach_golden_fish_10',
    title: 'Colecionador de Relâmpagos Dourados',
    description: 'Resgate 10 Peixes Dourados.',
    emoji: '🌟',
    category: 'golden',
    requirementType: 'golden_fish_clicked',
    requirementValue: 10,
    bonusPercent: 2.0,
  },

  // Categoria: Prestígio & Renascimento
  {
    id: 'ach_first_ascension',
    title: 'Transcendente',
    description: 'Realize sua primeiríssima Ascensão Cósmica.',
    emoji: '🌌',
    category: 'prestige',
    requirementType: 'ascensions_count',
    requirementValue: 1,
    bonusPercent: 2.5,
  },
];
