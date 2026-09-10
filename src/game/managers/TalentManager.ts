// src/game/managers/TalentManager.ts
// ─────────────────────────────────────────────────────────────
// Gerencia a Árvore de Maestria e Talentos do Pescador.
// Concede pontos de talento por nível e calcula todos os
// bônus aplicados ao motor de pesca, economia e ajudantes.
// ─────────────────────────────────────────────────────────────

import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import {
  TALENTS_DATA,
  TALENT_BRANCHES,
  TalentDefinition,
  TalentBranch,
  TalentBranchId,
} from '../data/talents.data.js';
import * as R from '../utils/response.builder.js';

export interface TalentTreeStatus {
  totalPoints: number;
  spentPoints: number;
  availablePoints: number;
  invested: Record<string, number>;
  branchPoints: Record<TalentBranchId, number>;
}

export class TalentManager {
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  getTalents(): TalentDefinition[] {
    return TALENTS_DATA;
  }

  getBranches(): TalentBranch[] {
    return TALENT_BRANCHES;
  }

  getTalent(id: string): TalentDefinition | undefined {
    return TALENTS_DATA.find((t) => t.id === id);
  }

  getInvestedRank(player: PlayerProfile, talentId: string): number {
    return player.talents?.[talentId] || 0;
  }

  getBranchPoints(player: PlayerProfile, branchId: TalentBranchId): number {
    const invested = player.talents || {};
    let pts = 0;
    for (const talent of TALENTS_DATA) {
      if (talent.branch === branchId) {
        pts += invested[talent.id] || 0;
      }
    }
    return pts;
  }

  /**
   * Total de Pontos de Maestria conquistados pelo jogador.
   * O jogador ganha 1 ponto a cada nível a partir do nível 2 (ex: Nível 10 = 9 pontos).
   */
  getTotalPointsEarned(player: PlayerProfile): number {
    const levelPoints = Math.max(0, player.level - 1);
    const bonusPoints = player.bonusTalentPoints || 0;
    return levelPoints + bonusPoints;
  }

  /**
   * Total de pontos atualmente alocados na árvore.
   */
  getTotalPointsSpent(player: PlayerProfile): number {
    const invested = player.talents || {};
    let total = 0;
    for (const rank of Object.values(invested)) {
      total += rank;
    }
    return total;
  }

  /**
   * Pontos de talento disponíveis para gastar.
   */
  getAvailablePoints(player: PlayerProfile): number {
    return Math.max(0, this.getTotalPointsEarned(player) - this.getTotalPointsSpent(player));
  }

  /**
   * Status consolidado da Árvore de Talentos
   */
  getStatus(player: PlayerProfile): TalentTreeStatus {
    const totalPoints = this.getTotalPointsEarned(player);
    const spentPoints = this.getTotalPointsSpent(player);
    const availablePoints = Math.max(0, totalPoints - spentPoints);
    const invested = { ...(player.talents || {}) };

    const branchPoints: Record<TalentBranchId, number> = {
      angler: this.getBranchPoints(player, 'angler'),
      tycoon: this.getBranchPoints(player, 'tycoon'),
      mystic: this.getBranchPoints(player, 'mystic'),
    };

    return {
      totalPoints,
      spentPoints,
      availablePoints,
      invested,
      branchPoints,
    };
  }

  /**
   * Valida se um talento pode ser aprendido ou evoluído
   */
  canLearn(player: PlayerProfile, talentId: string): { can: boolean; reason?: string } {
    const talent = this.getTalent(talentId);
    if (!talent) {
      return { can: false, reason: 'Talento não encontrado.' };
    }

    const currentRank = this.getInvestedRank(player, talentId);
    if (currentRank >= talent.maxRank) {
      return { can: false, reason: 'Este talento já atingiu a maestria máxima!' };
    }

    const availablePoints = this.getAvailablePoints(player);
    if (availablePoints <= 0) {
      return {
        can: false,
        reason: 'Você não tem Pontos de Maestria disponíveis. Suba de nível para obter mais!',
      };
    }

    const branchPoints = this.getBranchPoints(player, talent.branch);
    if (branchPoints < talent.requiredBranchPoints) {
      const branch = TALENT_BRANCHES.find((b) => b.id === talent.branch);
      return {
        can: false,
        reason: `Requer pelo menos ${talent.requiredBranchPoints} pontos investidos no ramo "${branch?.name || talent.branch}".`,
      };
    }

    return { can: true };
  }

  /**
   * Investe 1 ponto de talento na habilidade selecionada
   */
  learnTalent(player: PlayerProfile, talentId: string): R.GameResponse<{ talent: TalentDefinition; newRank: number }> {
    const check = this.canLearn(player, talentId);
    if (!check.can) {
      return R.error('CANNOT_LEARN_TALENT', check.reason || 'Não foi possível aprender este talento.');
    }

    const talent = this.getTalent(talentId)!;
    if (!player.talents) {
      player.talents = {};
    }

    const currentRank = player.talents[talentId] || 0;
    const newRank = currentRank + 1;
    player.talents[talentId] = newRank;

    this.playerManager.savePlayer(player);

    return R.success(
      'learn_talent',
      { talent, newRank },
      'action_success',
      `Maestria elevada: ${talent.name} (Nível ${newRank}/${talent.maxRank})!`,
    );
  }

  /**
   * Reseta e devolve todos os pontos de talento investidos.
   */
  resetTalents(player: PlayerProfile): R.GameResponse<{ refundedPoints: number }> {
    const spent = this.getTotalPointsSpent(player);
    if (spent <= 0) {
      return R.error('NO_POINTS_TO_RESET', 'Nenhum ponto de talento foi investido ainda.');
    }

    // Custo de redefinição: 100 moedas, ou grátis se o jogador tiver poucas moedas/nível baixo
    const resetCost = player.level <= 10 || player.coins < 100 ? 0 : 100;
    if (resetCost > 0 && player.coins < resetCost) {
      return R.error(
        'INSUFFICIENT_FUNDS',
        `Você precisa de ${resetCost} 🪙 para redefinir seus talentos.`,
      );
    }

    if (resetCost > 0) {
      player.coins -= resetCost;
      player.stats.totalCoinsSpent += resetCost;
    }

    player.talents = {};
    this.playerManager.savePlayer(player);

    return R.success(
      'reset_talents',
      { refundedPoints: spent },
      'action_success',
      `Árvore de Talentos redefinida! ${spent} pontos de maestria foram devolvidos ao seu pescador.`,
    );
  }

  // ─────────────────────────────────────────────
  // MODIFICADORES E CÁLCULOS PARA O MOTOR DO JOGO
  // ─────────────────────────────────────────────

  /**
   * Redução percentual do tempo de mordida (Reflexos Rápidos)
   */
  getBiteWaitReduction(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_reflexes');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_reflexes');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Multiplicador de peso dos peixes (Fisgada Perfeita)
   */
  getWeightMultiplier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_hooking');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_hooking');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Bônus de raridade para peixes raros/épicos/lendários (Olhos de Lince + Caçador de Titãs)
   */
  getRarityBonus(player: PlayerProfile): Record<string, number> {
    const bonus: Record<string, number> = {
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    const eagleRank = this.getInvestedRank(player, 'talent_eagle_eyes');
    if (eagleRank > 0) {
      const eagleTalent = this.getTalent('talent_eagle_eyes');
      const val = Math.round((eagleTalent?.valuesByRank[eagleRank - 1] || 0) * 100);
      bonus.rare += val;
      bonus.epic += val;
      bonus.legendary += val;
    }

    const titanRank = this.getInvestedRank(player, 'talent_monster_hunter');
    if (titanRank > 0) {
      const titanTalent = this.getTalent('talent_monster_hunter');
      const val = Math.round((titanTalent?.valuesByRank[titanRank - 1] || 0) * 100);
      bonus.legendary += val;
    }

    return bonus;
  }

  /**
   * Redução do tempo de cooldown entre arremessos (Descanso Ágil)
   */
  getCooldownReduction(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_fast_reel');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_fast_reel');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Chance de não consumir isca ao pescar (Conservação de Iscas)
   */
  getBaitSaveChance(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_bait_saver');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_bait_saver');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Chance de pescar um peixe extra idêntico (Keystone: Linha Dupla Mestre)
   */
  getTwinLineChance(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_twin_lines');
    return rank > 0 ? 0.25 : 0;
  }

  /**
   * Multiplicador de preço de venda de peixes (Barganha Portuária + Monopólio dos Mares)
   */
  getSellPriceMultiplier(player: PlayerProfile, isHeavyFish = false): number {
    let mult = 1.0;
    const bargainRank = this.getInvestedRank(player, 'talent_bargaining');
    if (bargainRank > 0) {
      const talent = this.getTalent('talent_bargaining');
      mult += talent?.valuesByRank[bargainRank - 1] || 0;
    }

    // Keystone: Monopólio dos Mares (+100% se for peixe com peso acima da média)
    if (isHeavyFish && this.getInvestedRank(player, 'talent_golden_monopoly') > 0) {
      mult += 1.0;
    }

    return mult;
  }

  /**
   * Desconto em itens da Loja de Equipamentos (Contatos Portuários)
   */
  getShopDiscount(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_merchant_discount');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_merchant_discount');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Bônus de gorjetas do Aquário (Gorjetas de Ouro)
   */
  getAquariumTipsMultiplier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_luxury_tips');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_luxury_tips');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Moedas imediatas ao recolher qualquer peixe (Faro Comercial)
   */
  getInstantCoinReward(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_market_sense');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_market_sense');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Multiplicador de XP recebido (Sabedoria Ancestral)
   */
  getXpMultiplier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_wisdom');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_wisdom');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Multiplicador de CPS de Ajudantes (Estímulo da Tripulação)
   */
  getIdleCpsMultiplier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_crew_inspiration');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_crew_inspiration');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Multiplicador de poder de clique na água (Ressonância Aquática)
   */
  getWaterClickMultiplier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_water_resonance');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_water_resonance');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Multiplicador amplificador do clima (Sintonia com as Marés)
   */
  getWeatherAmplifier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_weather_attunement');
    if (rank <= 0) return 1.0;
    const talent = this.getTalent('talent_weather_attunement');
    return 1.0 + (talent?.valuesByRank[rank - 1] || 0);
  }

  /**
   * Aumento de chance de eventos aleatórios positivos (Sussurro das Profundezas)
   */
  getEventChanceModifier(player: PlayerProfile): number {
    const rank = this.getInvestedRank(player, 'talent_event_magnet');
    if (rank <= 0) return 0;
    const talent = this.getTalent('talent_event_magnet');
    return talent?.valuesByRank[rank - 1] || 0;
  }

  /**
   * Verifica se o jogador possui uma Keystone ativa
   */
  hasKeystone(player: PlayerProfile, keystoneId: string): boolean {
    return (player.talents?.[keystoneId] || 0) > 0;
  }
}
