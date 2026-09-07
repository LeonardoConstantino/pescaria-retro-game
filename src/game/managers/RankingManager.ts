// src/game/managers/RankingManager.ts
// ─────────────────────────────────────────────
// Gerencia a tabela de classificação e líderes.
// ─────────────────────────────────────────────

import { PlayerProfile } from './PlayerManager.js';

export interface RankingEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  totalFishCaught: number;
  largestFishWeight: number;
  largestFishName: string;
  coins: number;
}

export class RankingManager {
  private storage: Map<string, any>;

  constructor(storage: Map<string, any>) {
    this.storage = storage;
  }

  getLeaderboard(currentPlayer?: PlayerProfile, limit = 10): RankingEntry[] {
    const players: PlayerProfile[] = [];

    // Busca jogadores no storage
    for (const key of this.storage.keys()) {
      if (key.startsWith('player:')) {
        const p = this.storage.get(key);
        if (p && p.id) {
          players.push(p);
        }
      }
    }

    if (currentPlayer && !players.some((p) => p.id === currentPlayer.id)) {
      players.push(currentPlayer);
    }

    // Se houver poucos jogadores, adicionamos pescadores veteranos para dar atmosfera viva de pesqueiro!
    const bots: PlayerProfile[] = [
      {
        id: 'bot_1',
        name: 'Capitão Barba-Prata',
        level: 15,
        xp: 12500,
        coins: 14500,
        currentLocation: 'deep_sea',
        equipment: { rod: 'rod_legendary', bait: 'bait_golden' },
        inventory: { fish: [], items: {} },
        boosts: {},
        stats: {
          totalFishCaught: 248,
          totalEvents: 68,
          totalCoinsEarned: 32000,
          totalCoinsSpent: 17500,
          largestFishWeight: 284.5,
          largestFishName: 'Filhote de Kraken',
        },
        lastFishedAt: Date.now() - 120000,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'bot_2',
        name: 'Mariana Pescadora',
        level: 11,
        xp: 7200,
        coins: 4200,
        currentLocation: 'sea',
        equipment: { rod: 'rod_advanced', bait: 'bait_shrimp' },
        inventory: { fish: [], items: {} },
        boosts: {},
        stats: {
          totalFishCaught: 132,
          totalEvents: 34,
          totalCoinsEarned: 12000,
          totalCoinsSpent: 7800,
          largestFishWeight: 72.8,
          largestFishName: 'Peixe-Espada',
        },
        lastFishedAt: Date.now() - 300000,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'bot_3',
        name: 'Seu Zé do Lambari',
        level: 6,
        xp: 2100,
        coins: 840,
        currentLocation: 'river',
        equipment: { rod: 'rod_intermediate', bait: 'bait_worm' },
        inventory: { fish: [], items: {} },
        boosts: {},
        stats: {
          totalFishCaught: 47,
          totalEvents: 12,
          totalCoinsEarned: 2400,
          totalCoinsSpent: 1560,
          largestFishWeight: 18.4,
          largestFishName: 'Pirarucu',
        },
        lastFishedAt: Date.now() - 600000,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'bot_4',
        name: 'Tiago do Molinete',
        level: 4,
        xp: 1100,
        coins: 310,
        currentLocation: 'lake',
        equipment: { rod: 'rod_intermediate', bait: 'bait_worm' },
        inventory: { fish: [], items: {} },
        boosts: {},
        stats: {
          totalFishCaught: 26,
          totalEvents: 7,
          totalCoinsEarned: 1100,
          totalCoinsSpent: 790,
          largestFishWeight: 4.8,
          largestFishName: 'Carpa',
        },
        lastFishedAt: Date.now() - 900000,
        createdAt: Date.now() - 86400000,
      },
    ];

    const allPlayers = [...players];
    for (const bot of bots) {
      if (!allPlayers.some((p) => p.id === bot.id)) {
        allPlayers.push(bot);
      }
    }

    allPlayers.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      if (b.stats.totalFishCaught !== a.stats.totalFishCaught) {
        return b.stats.totalFishCaught - a.stats.totalFishCaught;
      }
      return b.stats.largestFishWeight - a.stats.largestFishWeight;
    });

    return allPlayers.slice(0, limit).map((p, index) => ({
      rank: index + 1,
      id: p.id,
      name: p.name,
      level: p.level,
      totalFishCaught: p.stats.totalFishCaught,
      largestFishWeight: p.stats.largestFishWeight,
      largestFishName: p.stats.largestFishName || 'Nenhum',
      coins: p.coins,
    }));
  }
}
