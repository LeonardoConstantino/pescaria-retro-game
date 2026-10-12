// src/game/data/game.config.ts
// ─────────────────────────────────────────────
// Configurações globais do jogo.
// Calibradas para formato Web App com ritmo
// dinâmico, gratificação rápida e sensação suculenta!
// ─────────────────────────────────────────────

export interface RarityConfig {
  weight: number;
  label: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}

export const GameConfig = {
  // ── Pesca ────────────────────────────────
  fishing: {
    cooldownMs: 3 * 1000, // 3 segundos entre pescarias (ritmo dinâmico para web!)
    minWaitMs: 3 * 1000, // espera mínima para coletar (3s)
    maxWaitMs: 7 * 1000, // espera máxima para coletar (7s)
    expireMs: 5 * 60 * 1000, // sessão de pesca expira em 5 min
  },

  // ── Raridade — pesos de sorteio ──────────
  rarity: {
    common: {
      weight: 55,
      label: 'Comum',
      emoji: '⚪',
      color: '#94a3b8',
      bgGradient: 'from-slate-700 to-slate-800',
      borderColor: 'border-slate-500',
    },
    uncommon: {
      weight: 26,
      label: 'Incomum',
      emoji: '🟢',
      color: '#22c55e',
      bgGradient: 'from-emerald-800/80 to-teal-950',
      borderColor: 'border-emerald-500',
    },
    rare: {
      weight: 12,
      label: 'Raro',
      emoji: '🔵',
      color: '#3b82f6',
      bgGradient: 'from-blue-800/80 to-indigo-950',
      borderColor: 'border-blue-500',
    },
    epic: {
      weight: 5,
      label: 'Épico',
      emoji: '🟣',
      color: '#a855f7',
      bgGradient: 'from-purple-800/80 to-fuchsia-950',
      borderColor: 'border-purple-500',
    },
    legendary: {
      weight: 2,
      label: 'Lendário',
      emoji: '🟡',
      color: '#eab308',
      bgGradient: 'from-amber-600/80 to-yellow-950',
      borderColor: 'border-amber-400',
    },
  } as Record<string, RarityConfig>,

  // ── Chance de não pegar nada ─────────────
  emptyChance: 0.12, // 12% de chance (mais gratificante para web)

  // ── Chance de evento ocorrer ─────────────
  eventChance: 0.38, // 38% de chance de evento

  // ── XP ───────────────────────────────────
  xp: {
    perFishBase: 15,
    perSell: 6,
    perEvent: 20,
    levelMultiplier: 1.55,
    baseXpPerLevel: 110,
  },

  // ── Economia ─────────────────────────────
  economy: {
    sellMultiplierByRarity: {
      common: 1.0,
      uncommon: 1.6,
      rare: 2.8,
      epic: 5.5,
      legendary: 12.0,
    } as Record<string, number>,
    trophyWeightThreshold: 0.85, // Peixes com peso >= 85% do máximo ganham selo de Troféu
    trophyPriceBonus: 1.25, // +25% no preço de venda para Troféus
  },

  // ── Inventário ───────────────────────────
  inventory: {
    maxSlots: 40,
  },

  // ── Ranking ──────────────────────────────
  ranking: {
    defaultLimit: 10,
  },
};
