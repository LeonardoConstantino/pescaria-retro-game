// src/game/managers/IdleManager.ts
// ─────────────────────────────────────────────────────────────
// Gerencia compra de ajudantes, cálculo de CPS (Coins per Second),
// processamento de ganho passivo e progresso offline.
// ─────────────────────────────────────────────────────────────

import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import {
  IDLE_FISHER_TIERS,
  IdleFisherTier,
  calculateTierCost,
} from '../data/idle.data.js';
import {
  IDLE_UPGRADES,
  IdleUpgrade,
} from '../data/upgrades.data.js';
import { TalentManager } from './TalentManager.js';
import * as R from '../utils/response.builder.js';

export class IdleManager {
  private playerManager: PlayerManager;
  private talentManager?: TalentManager;

  constructor(playerManager: PlayerManager, talentManager?: TalentManager) {
    this.playerManager = playerManager;
    this.talentManager = talentManager;
  }

  getTiers(): IdleFisherTier[] {
    return IDLE_FISHER_TIERS;
  }

  getTier(tierId: string): IdleFisherTier | undefined {
    return IDLE_FISHER_TIERS.find((t) => t.id === tierId);
  }

  getUpgrades(): IdleUpgrade[] {
    return IDLE_UPGRADES;
  }

  getUpgrade(upgradeId: string): IdleUpgrade | undefined {
    return IDLE_UPGRADES.find((u) => u.id === upgradeId);
  }

  /**
   * Calcula o multiplicador específico de um tier baseado nos upgrades comprados
   */
  getTierMultiplier(player: PlayerProfile, tierId: string): number {
    const purchased = player.idleUpgrades || [];
    let mult = 1;

    for (const upgId of purchased) {
      const upg = this.getUpgrade(upgId);
      if (upg && upg.effectType === 'tier_multiplier' && upg.targetTierId === tierId) {
        mult *= upg.multiplier;
      }
    }

    return mult;
  }

  /**
   * Calcula o multiplicador de poder de clique baseado nos upgrades comprados
   */
  getClickPowerMultiplier(player: PlayerProfile): number {
    const purchased = player.idleUpgrades || [];
    let mult = 1;

    for (const upgId of purchased) {
      const upg = this.getUpgrade(upgId);
      if (upg && upg.effectType === 'click_power') {
        mult *= upg.multiplier;
      }
    }

    return mult;
  }

  /**
   * Retorna os upgrades disponíveis que o jogador pode ver e comprar
   */
  getAvailableUpgrades(player: PlayerProfile): IdleUpgrade[] {
    const purchased = new Set(player.idleUpgrades || []);
    const idleFishers = player.idleFishers || {};
    const totalClicks = player.stats.totalWaterClicks || 0;

    return IDLE_UPGRADES.filter((upg) => {
      if (purchased.has(upg.id)) return false;

      const req = upg.requirement;
      if (req.tierId && req.minCount) {
        const count = idleFishers[req.tierId] || 0;
        if (count < req.minCount) return false;
      }

      if (req.minClicks && totalClicks < req.minClicks) {
        return false;
      }

      return true;
    });
  }

  /**
   * Compra um upgrade exponencial
   */
  buyUpgrade(player: PlayerProfile, upgradeId: string): R.GameResponse<{ upgrade: IdleUpgrade; newCps: number }> {
    const upgrade = this.getUpgrade(upgradeId);
    if (!upgrade) {
      return R.error('UPGRADE_NOT_FOUND', 'Melhoria não encontrada.');
    }

    if (!player.idleUpgrades) {
      player.idleUpgrades = [];
    }

    if (player.idleUpgrades.includes(upgrade.id)) {
      return R.error('ALREADY_PURCHASED', 'Você já comprou esta melhoria.');
    }

    if (player.coins < upgrade.cost) {
      return R.error(
        'INSUFFICIENT_COINS',
        `Moedas insuficientes. Custa ${upgrade.cost.toLocaleString('pt-BR')} 🪙.`,
      );
    }

    player.coins -= upgrade.cost;
    player.stats.totalCoinsSpent += upgrade.cost;
    player.idleUpgrades.push(upgrade.id);

    this.playerManager.savePlayer(player);

    const newCps = this.calculateTotalCps(player);

    return R.success(
      'buy_idle_upgrade',
      {
        upgrade,
        newCps,
      },
      'upgrade_purchased',
      `Upgrade adquirido: ${upgrade.name}! ${upgrade.description}`,
    );
  }

  /**
   * Retorna a capacidade máxima de produção passiva (CPS) suportada pela licença do nível atual do pescador
   */
  getMaxCpsCapacity(player: PlayerProfile): number {
    const baseCap = Math.floor(player.level * player.level * 60);
    const ascensionMult = 1 + (player.stats?.ascensionsCount || 0) * 0.5;
    return Math.max(30, Math.floor(baseCap * ascensionMult));
  }

  /**
   * Calcula o CPS (Coins Per Second) total do jogador considerando multiplicadores de upgrades, buffs ativos e teto de nível
   */
  calculateTotalCps(player: PlayerProfile): number {
    const idleFishers = player.idleFishers || {};
    let baseCps = 0;

    for (const tier of IDLE_FISHER_TIERS) {
      const count = idleFishers[tier.id] || 0;
      if (count > 0) {
        const tierMult = this.getTierMultiplier(player, tier.id);
        baseCps += (tier.baseCps * tierMult) * count;
      }
    }

    // Aplica multiplicador de Production Frenzy se ativo
    let multiplier = 1;
    const now = Date.now();
    if (player.activeBuffs?.production_frenzy && player.activeBuffs.production_frenzy.expiresAt > now) {
      multiplier *= player.activeBuffs.production_frenzy.multiplier;
    }

    // Bônus permanente de Ascensão Cósmica: +1% por Escama Dourada total resgatada
    const claimedScales = player.claimedScalesTotal || 0;
    let ascensionBonus = 1 + claimedScales * 0.01;
    if (player.cosmicBlessings?.includes('blessing_divine_current')) {
      ascensionBonus += 0.5;
    }

    // Bônus permanente de Maré de Conquistas (Achievements): +1.5% por conquista
    let achievementBonus = 1.0;
    if (player.unlockedAchievements && player.unlockedAchievements.length > 0) {
      achievementBonus += player.unlockedAchievements.length * 0.015;
    }

    // Multiplicador por Talentos do Pescador (Rede Automatizada)
    const talentCpsMult = this.talentManager ? this.talentManager.getIdleCpsMultiplier(player) : 1.0;

    const rawCps = baseCps * multiplier * ascensionBonus * achievementBonus * talentCpsMult;

    // Aplica curva amortecida de capacidade de nível para evitar inflação galopante
    const maxCapacity = this.getMaxCpsCapacity(player);
    let effectiveCps = rawCps;
    if (rawCps > maxCapacity) {
      effectiveCps = maxCapacity + Math.sqrt(rawCps - maxCapacity) * 15;
    }

    return Math.round(effectiveCps * 10) / 10;
  }

  /**
   * Calcula o valor de um clique manual na água/palco
   * Fórmula equilibrada: (1 moeda base + nível do jogador + 1.5% do CPS) * Multiplicadores de Upgrade * Bônus de Talento
   */
  calculateClickPower(player: PlayerProfile): { coins: number; isCritical: boolean; multiplier: number } {
    const cps = this.calculateTotalCps(player);
    const upgradeMult = this.getClickPowerMultiplier(player);
    const talentClickMult = this.talentManager ? this.talentManager.getWaterClickMultiplier(player) : 1.0;
    const blessingClickMult = player.cosmicBlessings?.includes('blessing_water_surge') ? 1.35 : 1.0;
    const baseClick = (1 + player.level + Math.floor(cps * 0.015)) * upgradeMult * talentClickMult * blessingClickMult;

    let buffMult = 1;
    const now = Date.now();
    if (player.activeBuffs?.click_frenzy && player.activeBuffs.click_frenzy.expiresAt > now) {
      buffMult = player.activeBuffs.click_frenzy.multiplier;
    }

    // Chance de 12% de clique crítico (3x)
    const isCritical = Math.random() < 0.12;
    const critMult = isCritical ? 3 : 1;

    const totalCoins = Math.max(1, Math.floor(baseClick * buffMult * critMult));

    return {
      coins: totalCoins,
      isCritical,
      multiplier: upgradeMult * buffMult * critMult,
    };
  }

  /**
   * Executa um clique manual na água/palco
   */
  processWaterClick(player: PlayerProfile): { coinsEarned: number; isCritical: boolean } {
    const { coins, isCritical } = this.calculateClickPower(player);
    player.coins += coins;
    player.stats.totalCoinsEarned += coins;
    player.stats.totalWaterClicks = (player.stats.totalWaterClicks || 0) + 1;

    this.playerManager.savePlayer(player);

    return {
      coinsEarned: coins,
      isCritical,
    };
  }

  /**
   * Coleta um Peixe Dourado (Golden Fish) e ativa seu efeito equilibrado
   */
  claimGoldenFish(player: PlayerProfile): { effect: string; title: string; description: string; instantCoins?: number } {
    if (!player.activeBuffs) {
      player.activeBuffs = {};
    }

    player.stats.goldenFishCaught = (player.stats.goldenFishCaught || 0) + 1;

    const roll = Math.random();
    const now = Date.now();
    const frenzyDurationMult = player.cosmicBlessings?.includes('blessing_golden_frenzy') ? 1.5 : 1.0;

    if (roll < 0.45) {
      // 1. Frenesi de Produção: 3x na produção passiva por 30 segundos (ou 45s com Bênção Astral)
      const duration = Math.round(30 * 1000 * frenzyDurationMult);
      player.activeBuffs.production_frenzy = {
        multiplier: 3,
        expiresAt: now + duration,
        title: 'Frenesi de Pesca (3x CPS)',
      };
      this.playerManager.savePlayer(player);
      return {
        effect: 'production_frenzy',
        title: '🔥 FRENESI DE PRODUÇÃO!',
        description: `Todos os ajudantes pescam acelerados! 3x CPS por ${Math.round(duration / 1000)} segundos.`,
      };
    } else if (roll < 0.80) {
      // 2. Frenesi de Clique: 15x no poder de clique por 15 segundos (ou 22.5s com Bênção Astral)
      const duration = Math.round(15 * 1000 * frenzyDurationMult);
      player.activeBuffs.click_frenzy = {
        multiplier: 15,
        expiresAt: now + duration,
        title: 'Frenesi de Clique (15x Clique)',
      };
      this.playerManager.savePlayer(player);
      return {
        effect: 'click_frenzy',
        title: '⚡ FRENESI DE CLIQUE!',
        description: `Clique na água como um raio! Cliques valem 15x por ${Math.round(duration / 1000)} segundos.`,
      };
    } else {
      // 3. Cardume Abundante: Equivalente a 60 segundos de CPS instantâneo equilibrado
      const cps = this.calculateTotalCps(player);
      const instantCoins = Math.max(30, Math.floor(cps * 60 * frenzyDurationMult) || 40);
      player.coins += instantCoins;
      player.stats.totalCoinsEarned += instantCoins;
      this.playerManager.savePlayer(player);
      return {
        effect: 'instant_school',
        title: '💰 CARDUME ABUNDANTE!',
        description: `Um cardume reluzente saltou na sua rede! +${instantCoins.toLocaleString('pt-BR')} 🪙 instantâneos.`,
        instantCoins,
      };
    }
  }

  /**
   * Limpa buffs expirados
   */
  cleanExpiredBuffs(player: PlayerProfile): boolean {
    if (!player.activeBuffs) return false;
    let changed = false;
    const now = Date.now();

    for (const [key, buff] of Object.entries(player.activeBuffs)) {
      if (buff.expiresAt <= now) {
        delete player.activeBuffs[key];
        changed = true;
      }
    }

    if (changed) {
      this.playerManager.savePlayer(player);
    }
    return changed;
  }


  /**
   * Compra um ajudante/construção
   */
  buyIdleFisher(player: PlayerProfile, tierId: string): R.GameResponse<{ newCount: number; cost: number; newCps: number }> {
    const tier = this.getTier(tierId);
    if (!tier) {
      return R.error('TIER_NOT_FOUND', 'Ajudante de pesca não encontrado.');
    }

    if (tier.requiredLevel && player.level < tier.requiredLevel) {
      return R.error(
        'LEVEL_TOO_LOW',
        `Nível insuficiente. Você precisa ser Nível ${tier.requiredLevel} para contratar ${tier.name}.`,
      );
    }

    if (!player.idleFishers) {
      player.idleFishers = {};
    }

    const currentCount = player.idleFishers[tier.id] || 0;
    const cost = calculateTierCost(tier, currentCount);

    if (player.coins < cost) {
      return R.error(
        'INSUFFICIENT_COINS',
        `Moedas insuficientes. Custa ${cost.toLocaleString('pt-BR')} 🪙.`,
      );
    }

    player.coins -= cost;
    player.stats.totalCoinsSpent += cost;
    player.idleFishers[tier.id] = currentCount + 1;

    this.playerManager.savePlayer(player);

    const newCps = this.calculateTotalCps(player);

    return R.success(
      'hire_fisher',
      {
        newCount: currentCount + 1,
        cost,
        newCps,
      },
      tier.id,
      `Você contratou +1 ${tier.name}! Produção aumentada para ${newCps} 🪙/s.`,
    );
  }

  /**
   * Processa o ganho passivo de moedas baseado no tempo decorrido desde o último tick.
   * Suporta tick contínuo de frontend e progresso offline com eficiência equilibrada.
   */
  processIdleTick(player: PlayerProfile, currentTimestamp: number = Date.now()): { coinsEarned: number; secondsElapsed: number } {
    const lastTick = player.lastIdleTickAt || currentTimestamp;
    const elapsedSeconds = Math.max(0, (currentTimestamp - lastTick) / 1000);

    const cps = this.calculateTotalCps(player);
    let coinsEarned = 0;
    let countedSeconds = 0;

    if (elapsedSeconds <= 3) {
      // Loop ativo em tempo real na aba aberta (100% de rendimento)
      coinsEarned = Math.floor(cps * elapsedSeconds);
      countedSeconds = elapsedSeconds;
    } else {
      // Progresso Offline: teto de 4 horas (ou 10 horas com Ampulheta Cósmica) e rendimento saudável de 65% (ou 100% com Vigília Noturna)
      const maxOfflineSeconds = player.cosmicBlessings?.includes('blessing_extended_offline') ? 36000 : 14400;
      countedSeconds = Math.min(maxOfflineSeconds, elapsedSeconds);
      const offlineEfficiency = player.cosmicBlessings?.includes('blessing_idle_efficiency') ? 1.0 : 0.65;
      coinsEarned = Math.floor(cps * countedSeconds * offlineEfficiency);
    }

    if (coinsEarned > 0) {
      player.coins += coinsEarned;
      player.stats.totalCoinsEarned += coinsEarned;
    }

    player.lastIdleTickAt = currentTimestamp;
    this.playerManager.savePlayer(player);

    return {
      coinsEarned,
      secondsElapsed: countedSeconds,
    };
  }
}
