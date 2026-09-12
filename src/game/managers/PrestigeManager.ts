// src/game/managers/PrestigeManager.ts
// ─────────────────────────────────────────────────────────────
// Gerenciador de Prestígio / Ascensão Cósmica (Cookie Clicker Ascension)
// Calcula escamas celestiais, executa o renascimento e gerencia as bênçãos.
// ─────────────────────────────────────────────────────────────

import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import {
  COSMIC_BLESSINGS,
  CosmicBlessing,
  MIN_ASCENSION_LEVEL,
  calculateTotalScalesForCoins,
  coinsForNextScale,
  calculateAscensionBonusPercent,
} from '../data/prestige.data.js';
import * as R from '../utils/response.builder.js';

export interface PrestigeStatus {
  currentScales: number; // Escamas prontas para gastar
  claimedScalesTotal: number; // Total de escamas já reclamadas
  pendingScales: number; // Novas escamas a serem recebidas se ascender agora
  totalLifetimeCoins: number;
  coinsNeededForNextScale: number;
  coinsProgressToNextScale: number;
  progressPercent: number;
  totalAscensionBonusPercent: number; // Bônus percentual permanente calibrado
  ascensionsCount: number;
  minLevelRequired: number;
  isLevelQualified: boolean;
  blessings: {
    available: CosmicBlessing[];
    purchased: string[];
  };
}

export class PrestigeManager {
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  getBlessings(): CosmicBlessing[] {
    return COSMIC_BLESSINGS;
  }

  getBlessing(id: string): CosmicBlessing | undefined {
    return COSMIC_BLESSINGS.find((b) => b.id === id);
  }

  /**
   * Obtém o status completo de prestígio do jogador
   */
  getPrestigeStatus(player: PlayerProfile): PrestigeStatus {
    const lifetimeCoins = (player.stats.lifetimeCoinsEarned || 0) + player.stats.totalCoinsEarned;
    const totalPotentialScales = calculateTotalScalesForCoins(lifetimeCoins);
    const claimedScales = player.claimedScalesTotal || 0;
    const pendingScales = Math.max(0, totalPotentialScales - claimedScales);

    const nextTargetCoins = coinsForNextScale(totalPotentialScales);
    const prevTargetCoins = totalPotentialScales > 0 ? coinsForNextScale(totalPotentialScales - 1) : 0;
    const progressSpan = nextTargetCoins - prevTargetCoins;
    const currentProgressInSpan = Math.max(0, lifetimeCoins - prevTargetCoins);
    const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgressInSpan / progressSpan) * 100)));

    const blessings = player.cosmicBlessings || [];
    const bonusPercent = calculateAscensionBonusPercent(claimedScales, blessings);

    const availableBlessings = COSMIC_BLESSINGS.filter((b) => !blessings.includes(b.id));

    return {
      currentScales: player.cosmicScales || 0,
      claimedScalesTotal: claimedScales,
      pendingScales,
      totalLifetimeCoins: lifetimeCoins,
      coinsNeededForNextScale: Math.max(0, nextTargetCoins - lifetimeCoins),
      coinsProgressToNextScale: currentProgressInSpan,
      progressPercent,
      totalAscensionBonusPercent: bonusPercent,
      ascensionsCount: player.stats.ascensionsCount || 0,
      minLevelRequired: MIN_ASCENSION_LEVEL,
      isLevelQualified: player.level >= MIN_ASCENSION_LEVEL,
      blessings: {
        available: availableBlessings,
        purchased: blessings,
      },
    };
  }

  /**
   * Realiza a Ascensão Cósmica / Renascimento
   * Concede as escamas pendentes, reseta moedas e construções, mas preserva nível, inventário de peixes,
   * escamas e bênçãos celestiais.
   */
  ascend(player: PlayerProfile): R.GameResponse<{ scalesAwarded: number; newTotalScales: number }> {
    if (player.level < MIN_ASCENSION_LEVEL) {
      return R.error(
        'LEVEL_TOO_LOW',
        `A Ascensão Cósmica exige no mínimo Nível ${MIN_ASCENSION_LEVEL} do Pescador para suportar a energia celestial (Seu nível: ${player.level}).`,
      );
    }

    const lifetimeCoins = (player.stats.lifetimeCoinsEarned || 0) + player.stats.totalCoinsEarned;
    const totalPotentialScales = calculateTotalScalesForCoins(lifetimeCoins);
    const claimedScales = player.claimedScalesTotal || 0;
    const pendingScales = Math.max(0, totalPotentialScales - claimedScales);

    if (pendingScales <= 0) {
      return R.error(
        'NO_SCALES_PENDING',
        'Você precisa acumular mais moedas nesta vida para desbloquear pelo menos +1 nova Escama Cósmica antes de ascender.',
      );
    }

    // Atualiza estatísticas de ascensão
    player.stats.lifetimeCoinsEarned = lifetimeCoins;
    player.stats.totalCoinsEarned = 0;
    player.stats.totalCoinsSpent = 0;
    player.stats.ascensionsCount = (player.stats.ascensionsCount || 0) + 1;

    // Concede as novas escamas
    player.cosmicScales = (player.cosmicScales || 0) + pendingScales;
    player.claimedScalesTotal = totalPotentialScales;

    // Concede ponto de talento cósmico se possuir a Coroa das Profundezas
    if (player.cosmicBlessings?.includes('blessing_ocean_lord')) {
      player.bonusTalentPoints = (player.bonusTalentPoints || 0) + 1;
    }

    // Reseta construções e upgrades do mundo mortal para o recomeço acelerado
    player.idleFishers = {};
    player.idleUpgrades = [];
    player.activeBuffs = {};

    // Verifica se possui bênção de moedas iniciais
    const blessings = player.cosmicBlessings || [];
    let startingCoins = 0;
    if (blessings.includes('blessing_ancestral_wealth')) {
      startingCoins = 1500;
    }
    player.coins = startingCoins;

    this.playerManager.savePlayer(player);

    return R.success(
      'ascend',
      {
        scalesAwarded: pendingScales,
        newTotalScales: player.cosmicScales,
      },
      'cosmic_ascension',
      `🌟 Ascensão Concluída! Você renasceu nos céus e recebeu +${pendingScales} Escamas Cósmicas!`,
    );
  }

  /**
   * Compra uma Bênção Celestial permanente
   */
  buyBlessing(player: PlayerProfile, blessingId: string): R.GameResponse<{ blessing: CosmicBlessing }> {
    const blessing = this.getBlessing(blessingId);
    if (!blessing) {
      return R.error('BLESSING_NOT_FOUND', 'Bênção celestial não encontrada.');
    }

    if (!player.cosmicBlessings) {
      player.cosmicBlessings = [];
    }

    if (player.cosmicBlessings.includes(blessing.id)) {
      return R.error('ALREADY_OWNED', 'Você já possui esta bênção eterna.');
    }

    const currentScales = player.cosmicScales || 0;
    if (currentScales < blessing.cost) {
      return R.error(
        'INSUFFICIENT_SCALES',
        `Escamas Cósmicas insuficientes. Custa ${blessing.cost} 🌟.`,
      );
    }

    player.cosmicScales = currentScales - blessing.cost;
    player.cosmicBlessings.push(blessing.id);

    this.playerManager.savePlayer(player);

    return R.success(
      'buy_blessing',
      { blessing },
      blessing.id,
      `Bênção Desbloqueada: ${blessing.name}! ${blessing.description}`,
    );
  }
}
