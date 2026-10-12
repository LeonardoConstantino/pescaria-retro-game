// src/game/managers/AchievementManager.ts
// ─────────────────────────────────────────────────────────────
// Gerenciador de Conquistas & Marcos (Achievements & Milestones)
// Avalia condições em tempo real, concede multiplicador global de maré (+1.5% cada)
// e notifica novas conquistas para exibição de fanfarra.
// ─────────────────────────────────────────────────────────────

import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import { ACHIEVEMENTS, Achievement } from '../data/achievements.data.js';

export interface AchievementProgress {
  achievement: Achievement;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export class AchievementManager {
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }

  /**
   * Avalia todas as conquistas e retorna a lista de novas conquistas desbloqueadas nesta verificação.
   */
  checkAchievements(player: PlayerProfile, currentCps = 0): Achievement[] {
    if (!player.unlockedAchievements) {
      player.unlockedAchievements = [];
    }

    const newlyUnlocked: Achievement[] = [];
    const lifetimeCoins = (player.stats.lifetimeCoinsEarned || 0) + player.stats.totalCoinsEarned;

    for (const ach of ACHIEVEMENTS) {
      if (player.unlockedAchievements.includes(ach.id)) {
        continue;
      }

      let metric = 0;
      switch (ach.requirementType) {
        case 'total_fished':
          metric = player.stats.totalFishCaught || 0;
          break;
        case 'legendary_caught':
          metric = player.inventory.fish.some((f) => f.rarity === 'legendary') ? 1 : 0;
          break;
        case 'water_clicks':
          metric = player.stats.totalWaterClicks || 0;
          break;
        case 'coins_earned':
          metric = lifetimeCoins;
          break;
        case 'cps_reached':
          metric = currentCps;
          break;
        case 'golden_fish_clicked':
          metric = player.stats.goldenFishCaught || 0;
          break;
        case 'ascensions_count':
          metric = player.stats.ascensionsCount || 0;
          break;
      }

      if (metric >= ach.requirementValue) {
        player.unlockedAchievements.push(ach.id);
        newlyUnlocked.push(ach);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.playerManager.savePlayer(player);
    }

    return newlyUnlocked;
  }

  /**
   * Calcula o multiplicador global de bônus derivado das conquistas desbloqueadas (estilo Cookie Clicker Milk)
   */
  getAchievementMultiplier(player: PlayerProfile): number {
    const unlocked = player.unlockedAchievements || [];
    if (unlocked.length === 0) return 1.0;

    let bonusTotal = 0;
    for (const achId of unlocked) {
      const ach = ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) {
        bonusTotal += ach.bonusPercent;
      }
    }

    return 1 + bonusTotal / 100;
  }

  /**
   * Retorna a lista detalhada com o progresso de cada conquista
   */
  getAchievementsStatus(player: PlayerProfile, currentCps = 0): {
    totalUnlocked: number;
    totalAchievements: number;
    bonusPercent: number;
    items: AchievementProgress[];
  } {
    const unlockedIds = new Set(player.unlockedAchievements || []);
    const lifetimeCoins = (player.stats.lifetimeCoinsEarned || 0) + player.stats.totalCoinsEarned;

    let totalBonus = 0;

    const items: AchievementProgress[] = ACHIEVEMENTS.map((ach) => {
      const isUnlocked = unlockedIds.has(ach.id);
      if (isUnlocked) {
        totalBonus += ach.bonusPercent;
      }

      let metric = 0;
      switch (ach.requirementType) {
        case 'total_fished':
          metric = player.stats.totalFishCaught || 0;
          break;
        case 'legendary_caught':
          metric = player.inventory.fish.some((f) => f.rarity === 'legendary') ? 1 : 0;
          break;
        case 'water_clicks':
          metric = player.stats.totalWaterClicks || 0;
          break;
        case 'coins_earned':
          metric = lifetimeCoins;
          break;
        case 'cps_reached':
          metric = currentCps;
          break;
        case 'golden_fish_clicked':
          metric = player.stats.goldenFishCaught || 0;
          break;
        case 'ascensions_count':
          metric = player.stats.ascensionsCount || 0;
          break;
      }

      const progressPercent = isUnlocked
        ? 100
        : Math.min(100, Math.round((metric / ach.requirementValue) * 100));

      return {
        achievement: ach,
        isUnlocked,
        currentValue: metric,
        targetValue: ach.requirementValue,
        progressPercent,
      };
    });

    return {
      totalUnlocked: unlockedIds.size,
      totalAchievements: ACHIEVEMENTS.length,
      bonusPercent: Math.round(totalBonus * 10) / 10,
      items,
    };
  }
}
