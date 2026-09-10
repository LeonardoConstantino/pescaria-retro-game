// src/game/managers/MissionManager.ts
// ─────────────────────────────────────────────────────────────
// Gerenciador do Quadro de Missões Diárias e Encomendas da Peixaria
// ─────────────────────────────────────────────────────────────

import { PlayerManager } from './PlayerManager.js';
import { DailyMission, MissionTemplates, MissionTemplate } from '../data/missions.data.js';
import { GameFish } from '../data/fish.data.js';
import * as R from '../utils/response.builder.js';

interface DailyMissionState {
  date: string;
  missions: DailyMission[];
  bonusChestClaimed: boolean;
}

export class MissionManager {
  private playerManager: PlayerManager;
  private storage: any;

  constructor(playerManager: PlayerManager, storage: any) {
    this.playerManager = playerManager;
    this.storage = storage;
  }

  private getTodayDateKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private getStateKey(userId: string): string {
    return `missions_state:${userId}`;
  }

  public getState(userId: string): DailyMissionState {
    const today = this.getTodayDateKey();
    const raw = this.storage.get(this.getStateKey(userId));

    if (raw && raw.date === today && Array.isArray(raw.missions) && raw.missions.length > 0) {
      return raw;
    }

    // Gera um novo conjunto diário de 4 missões balanceadas
    const newState = this.generateDailyMissions(today);
    this.saveState(userId, newState);
    return newState;
  }

  private saveState(userId: string, state: DailyMissionState): void {
    this.storage.set(this.getStateKey(userId), state);
  }

  // Gera 4 missões diárias com categorias variadas
  private generateDailyMissions(today: string): DailyMissionState {
    const pool = [...MissionTemplates];
    // Embaralha
    const shuffled = pool.sort(() => 0.5 - Math.random());

    // Pega 4 missões garantindo tipos diferentes se possível
    const selectedTemplates: MissionTemplate[] = [];
    const usedTypes = new Set<string>();

    for (const tmpl of shuffled) {
      if (!usedTypes.has(tmpl.type) || selectedTemplates.length < 4) {
        selectedTemplates.push(tmpl);
        usedTypes.add(tmpl.type);
      }
      if (selectedTemplates.length >= 4) break;
    }

    const missions: DailyMission[] = selectedTemplates.map((tmpl, index) => ({
      id: `m_${today}_${index}_${tmpl.id}`,
      templateId: tmpl.id,
      type: tmpl.type,
      title: tmpl.title,
      description: tmpl.description,
      target: tmpl.target,
      current: 0,
      targetLocation: tmpl.targetLocation,
      targetRarity: tmpl.targetRarity,
      minWeight: tmpl.minWeight,
      reward: tmpl.reward,
      icon: tmpl.icon,
      isCompleted: false,
      isClaimed: false,
    }));

    return {
      date: today,
      missions,
      bonusChestClaimed: false,
    };
  }

  public getDailyMissions(userId: string): DailyMission[] {
    return this.getState(userId).missions;
  }

  // Atualiza missões quando um peixe é capturado
  public onFishCaught(
    userId: string,
    fish: GameFish & { weight: number },
    locationId: string,
    isPerfect: boolean,
  ): DailyMission[] {
    const state = this.getState(userId);
    const newlyCompleted: DailyMission[] = [];

    const rarityRank: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
    };

    let modified = false;

    state.missions.forEach((m) => {
      if (m.isCompleted) return;

      let progressIncrement = 0;

      switch (m.type) {
        case 'catch_count':
          progressIncrement = 1;
          break;

        case 'catch_location':
          if (m.targetLocation === locationId) {
            progressIncrement = 1;
          }
          break;

        case 'catch_weight':
          if (m.minWeight && fish.weight >= m.minWeight) {
            progressIncrement = 1;
          }
          break;

        case 'perfect_reel':
          if (isPerfect) {
            progressIncrement = 1;
          }
          break;

        case 'catch_rarity':
          if (m.targetRarity) {
            const fishRank = rarityRank[fish.rarity] || 1;
            const targetRank = rarityRank[m.targetRarity] || 1;
            if (fishRank >= targetRank) {
              progressIncrement = 1;
            }
          }
          break;
      }

      if (progressIncrement > 0) {
        m.current = Math.min(m.target, m.current + progressIncrement);
        modified = true;

        if (m.current >= m.target && !m.isCompleted) {
          m.isCompleted = true;
          newlyCompleted.push(m);
        }
      }
    });

    if (modified) {
      this.saveState(userId, state);
    }

    return newlyCompleted;
  }

  // Atualiza missões quando moedas são faturadas na venda
  public onCoinsEarned(userId: string, coins: number): DailyMission[] {
    if (coins <= 0) return [];
    const state = this.getState(userId);
    const newlyCompleted: DailyMission[] = [];
    let modified = false;

    state.missions.forEach((m) => {
      if (m.isCompleted) return;
      if (m.type === 'sell_coins') {
        m.current = Math.min(m.target, m.current + coins);
        modified = true;
        if (m.current >= m.target && !m.isCompleted) {
          m.isCompleted = true;
          newlyCompleted.push(m);
        }
      }
    });

    if (modified) {
      this.saveState(userId, state);
    }
    return newlyCompleted;
  }

  // Atualiza missões quando uma isca é consumida
  public onBaitUsed(userId: string): DailyMission[] {
    const state = this.getState(userId);
    const newlyCompleted: DailyMission[] = [];
    let modified = false;

    state.missions.forEach((m) => {
      if (m.isCompleted) return;
      if (m.type === 'use_bait') {
        m.current = Math.min(m.target, m.current + 1);
        modified = true;
        if (m.current >= m.target && !m.isCompleted) {
          m.isCompleted = true;
          newlyCompleted.push(m);
        }
      }
    });

    if (modified) {
      this.saveState(userId, state);
    }
    return newlyCompleted;
  }

  // Resgatar recompensa de uma missão concluída
  public claimMission(
    userId: string,
    missionId: string,
  ): R.GameResponse<{
    mission: DailyMission;
    coins: number;
    xp: number;
    baitId?: string;
    baitQuantity?: number;
  }> {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const state = this.getState(userId);
    const mission = state.missions.find((m) => m.id === missionId);

    if (!mission) {
      return R.error('MISSION_NOT_FOUND', 'Missão não encontrada.');
    }

    if (!mission.isCompleted) {
      return R.error('MISSION_INCOMPLETE', 'Esta missão ainda não foi concluída!');
    }

    if (mission.isClaimed) {
      return R.error('MISSION_ALREADY_CLAIMED', 'Recompensa já resgatada anteriormente.');
    }

    // Marca como resgatada
    mission.isClaimed = true;
    this.saveState(userId, state);

    // Entrega recompensas
    const { coins, xp, baitId, baitQuantity } = mission.reward;
    if (coins > 0) {
      this.playerManager.addCoins(player, coins);
    }
    if (xp > 0) {
      this.playerManager.addXp(player, xp);
    }
    if (baitId && baitQuantity) {
      this.playerManager.addItem(player, baitId, baitQuantity);
    }

    return R.success(
      'CLAIM_MISSION',
      {
        mission,
        coins,
        xp,
        baitId,
        baitQuantity,
      },
      'mission_claimed',
      `Encomenda "${mission.title}" resgatada com sucesso! +${coins} 🪙 +${xp} XP`,
    );
  }

  // Verifica se o grande baú do dia pode ser resgatado
  public canClaimBonusChest(userId: string): boolean {
    const state = this.getState(userId);
    if (state.bonusChestClaimed) return false;
    // Todas as 4 missões devem estar completas e resgatadas
    return state.missions.length > 0 && state.missions.every((m) => m.isCompleted && m.isClaimed);
  }

  public isBonusChestClaimed(userId: string): boolean {
    return this.getState(userId).bonusChestClaimed;
  }

  // Resgatar o Grande Baú Diário do Pescador Mestre
  public claimDailyBonusChest(
    userId: string,
  ): R.GameResponse<{
    coins: number;
    xp: number;
    baitId: string;
    baitQuantity: number;
  }> {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const state = this.getState(userId);

    if (state.bonusChestClaimed) {
      return R.error('CHEST_ALREADY_CLAIMED', 'O Baú Diário já foi resgatado hoje! Volte amanhã.');
    }

    if (!this.canClaimBonusChest(userId)) {
      return R.error('CHEST_LOCKED', 'Complete e resgate todas as 4 encomendas do dia para abrir o Grande Baú!');
    }

    state.bonusChestClaimed = true;
    this.saveState(userId, state);

    // Recompensa Suprema do Dia:
    const coinsReward = 600 + player.level * 50;
    const xpReward = 300 + player.level * 35;
    const rareBaits = ['bait_lure_glow', 'bait_live_minnow', 'bait_golden'];
    const chosenBait = rareBaits[Math.floor(Math.random() * rareBaits.length)];
    const baitQuantity = 3;

    this.playerManager.addCoins(player, coinsReward);
    this.playerManager.addXp(player, xpReward);
    this.playerManager.addItem(player, chosenBait, baitQuantity);

    return R.success(
      'CLAIM_BONUS_CHEST',
      {
        coins: coinsReward,
        xp: xpReward,
        baitId: chosenBait,
        baitQuantity,
      },
      'bonus_chest_claimed',
      `🎉 GRANDE BAÚ DIÁRIO ABERTO! Você recebeu +${coinsReward} 🪙, +${xpReward} XP e ${baitQuantity}x Iscas Raras!`,
    );
  }

  // Quantidade de missões prontas para resgate (para badges e notificações)
  public getUnclaimedCount(userId: string): number {
    const state = this.getState(userId);
    let count = state.missions.filter((m) => m.isCompleted && !m.isClaimed).length;
    if (this.canClaimBonusChest(userId)) {
      count += 1;
    }
    return count;
  }

  // Tempo restante até a meia-noite (reset diário)
  public getTimeUntilReset(): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
  }
}
