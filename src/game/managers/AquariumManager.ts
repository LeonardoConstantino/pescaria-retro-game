// src/game/managers/AquariumManager.ts
// ─────────────────────────────────────────────────────────────
// Gerencia a mecânica do Aquário / Viveiro de Troféus
// (Capacidade, alimentação, visitantes, temas e decorações)
// ─────────────────────────────────────────────────────────────

import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import { TalentManager } from './TalentManager.js';
import {
  PlayerAquarium,
  AquariumTankTiers,
  AquariumTankTier,
  AquariumThemes,
  AquariumTheme,
  AquariumDecorations,
  AquariumDecoration,
  AquariumTrophyFish,
} from '../data/aquarium.data.js';
import * as R from '../utils/response.builder.js';

export class AquariumManager {
  private playerManager: PlayerManager;
  private talentManager?: TalentManager;

  constructor(playerManager: PlayerManager, talentManager?: TalentManager) {
    this.playerManager = playerManager;
    this.talentManager = talentManager;
  }

  // Obter o estado do Aquário atualizado (com cálculo de moedas de visitantes passivas)
  public getAquarium(userId: string): PlayerAquarium {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return {
        level: 1,
        currentThemeId: 'theme_freshwater',
        ownedThemes: ['theme_freshwater'],
        ownedDecorations: [],
        fish: [],
        lastFedAt: 0,
        fedHappinessExpiresAt: 0,
        uncollectedCoins: 0,
        lastTickAt: Date.now(),
      };
    }

    this.processTick(player);
    return player.aquarium;
  }

  // Capacidade máxima com base no nível do tanque
  public getCapacity(aquarium: PlayerAquarium): number {
    const tier = AquariumTankTiers.find((t) => t.level === aquarium.level);
    return tier ? tier.capacity : 6;
  }

  // Próximo nível disponível de expansão
  public getNextTier(aquarium: PlayerAquarium): AquariumTankTier | null {
    return AquariumTankTiers.find((t) => t.level === aquarium.level + 1) || null;
  }

  // Nível atual do tanque
  public getCurrentTier(aquarium: PlayerAquarium): AquariumTankTier {
    return (
      AquariumTankTiers.find((t) => t.level === aquarium.level) || AquariumTankTiers[0]
    );
  }

  // Cálculo da taxa de moedas geradas por segundo pelos peixes expostos
  public calculateCoinsPerSecond(aquarium: PlayerAquarium, player?: PlayerProfile): number {
    if (!aquarium.fish || aquarium.fish.length === 0) return 0;

    const baseRates: Record<string, number> = {
      common: 0.15,
      uncommon: 0.45,
      rare: 1.2,
      epic: 3.2,
      legendary: 8.5,
    };

    let totalBase = 0;
    for (const f of aquarium.fish) {
      const rate = baseRates[f.rarity] || 0.15;
      const weightBonus = 1 + Math.min(f.weight * 0.05, 1.5);
      totalBase += rate * weightBonus;
    }

    // Bônus do Tema
    const currentTheme =
      AquariumThemes.find((t) => t.id === aquarium.currentThemeId) || AquariumThemes[0];
    const themeMult = currentTheme.coinsMultiplier || 1.0;

    // Bônus das Decorações
    let decoBonusPct = 0;
    for (const decoId of aquarium.ownedDecorations) {
      const deco = AquariumDecorations.find((d) => d.id === decoId);
      if (deco) decoBonusPct += deco.coinsBonusPct;
    }
    const decoMult = 1 + decoBonusPct / 100;

    // Bônus de Alimentação (Felicidade Máxima)
    const isFed = Date.now() < aquarium.fedHappinessExpiresAt;
    const feedMult = isFed ? 2.0 : 1.0;

    // Bônus de Gorjetas de Visitantes por Talentos (Espetáculo Aquático)
    const talentMult = (player && this.talentManager)
      ? this.talentManager.getAquariumTipsMultiplier(player)
      : 1.0;

    // Bônus da Bênção Cósmica Aquário dos Deuses (2x)
    const blessingMult = player?.cosmicBlessings?.includes('blessing_aquarium_prestige') ? 2.0 : 1.0;

    return Number((totalBase * themeMult * decoMult * feedMult * talentMult * blessingMult).toFixed(2));
  }

  // Processa o tempo decorrido e acumula gorjetas dos visitantes do aquário
  public processTick(player: PlayerProfile): void {
    if (!player.aquarium) return;

    const now = Date.now();
    const lastTick = player.aquarium.lastTickAt || now;
    const elapsedSecs = Math.max(0, (now - lastTick) / 1000);

    if (elapsedSecs >= 1) {
      const cps = this.calculateCoinsPerSecond(player.aquarium, player);
      const earned = Math.floor(elapsedSecs * cps);

      if (earned > 0) {
        // Limite máximo de armazenamento (acumula até 8 horas sem coletar)
        const maxCapacity = Math.max(500, Math.floor(cps * 3600 * 8));
        player.aquarium.uncollectedCoins = Math.min(
          maxCapacity,
          player.aquarium.uncollectedCoins + earned,
        );
      }
      player.aquarium.lastTickAt = now;
      this.playerManager.savePlayer(player);
    }
  }

  // Coletar as moedas do cofrinho de doações dos visitantes
  public collectVisitorCoins(userId: string): R.GameResponse<{ coinsCollected: number }> {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    this.processTick(player);
    const amount = player.aquarium.uncollectedCoins;

    if (amount <= 0) {
      return R.error('NO_COINS_TO_COLLECT', 'Nenhum visitante deixou moedas ainda!');
    }

    player.aquarium.uncollectedCoins = 0;
    this.playerManager.addCoins(player, amount);
    this.playerManager.savePlayer(player);

    return R.success(
      'COLLECT_AQUARIUM_COINS',
      { coinsCollected: amount },
      'coins',
      `Você recolheu 🪙 ${amount} moedas deixadas pelos visitantes que admiraram seus troféus!`,
    );
  }

  // Aprimorar o Nível do Tanque (Expansão de Capacidade)
  public upgradeTank(userId: string): R.GameResponse<{ newLevel: number; capacity: number }> {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const nextTier = this.getNextTier(player.aquarium);
    if (!nextTier) {
      return R.error('MAX_LEVEL', 'Seu aquário já atingiu o nível máximo!');
    }

    if (player.level < nextTier.minPlayerLevel) {
      return R.error(
        'LEVEL_TOO_LOW',
        `Você precisa de Nível de Pescador ${nextTier.minPlayerLevel} para construir o ${nextTier.name}.`,
      );
    }

    if (player.coins < nextTier.cost) {
      return R.error(
        'INSUFFICIENT_COINS',
        `Moedas insuficientes! Você precisa de 🪙 ${nextTier.cost} (possui 🪙 ${player.coins}).`,
      );
    }

    this.playerManager.removeCoins(player, nextTier.cost);
    player.aquarium.level = nextTier.level;
    this.playerManager.savePlayer(player);

    return R.success(
      'UPGRADE_AQUARIUM',
      { newLevel: nextTier.level, capacity: nextTier.capacity },
      'upgrade_success',
      `🎉 Aquário expandido para ${nextTier.name}! Capacidade aumentada para ${nextTier.capacity} peixes!`,
    );
  }

  // Mover um peixe do inventário para o aquário de troféus
  public addFishToAquarium(
    userId: string,
    inventoryId: string,
  ): R.GameResponse<{ trophyFish: AquariumTrophyFish }> {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    this.processTick(player);

    const capacity = this.getCapacity(player.aquarium);
    if (player.aquarium.fish.length >= capacity) {
      return R.error(
        'AQUARIUM_FULL',
        `O aquário atingiu a capacidade máxima (${capacity}/${capacity} peixes). Aprimore o tanque para acomodar mais espécies!`,
      );
    }

    const fishIndex = player.inventory.fish.findIndex((f) => f.inventoryId === inventoryId);
    if (fishIndex === -1) {
      return R.error('FISH_NOT_FOUND', 'Peixe não encontrado no seu cesto de pesca.');
    }

    const caughtFish = player.inventory.fish[fishIndex];
    player.inventory.fish.splice(fishIndex, 1);

    const trophy: AquariumTrophyFish = {
      id: `trophy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fishId: caughtFish.id,
      name: caughtFish.name,
      rarity: caughtFish.rarity,
      weight: caughtFish.weight,
      basePrice: caughtFish.basePrice || 10,
      assetId: caughtFish.assetId,
      addedAt: Date.now(),
    };

    player.aquarium.fish.push(trophy);
    this.playerManager.savePlayer(player);

    return R.success(
      'ADD_FISH_AQUARIUM',
      { trophyFish: trophy },
      trophy.assetId,
      `✨ ${trophy.name} (${trophy.weight} kg) foi colocado no seu Aquário com sucesso!`,
    );
  }

  // Remover peixe do aquário (devolvendo ao inventário ou vendendo)
  public removeFishFromAquarium(
    userId: string,
    trophyId: string,
    sell = false,
  ): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    this.processTick(player);

    const index = player.aquarium.fish.findIndex((f) => f.id === trophyId);
    if (index === -1) {
      return R.error('TROPHY_NOT_FOUND', 'Peixe não encontrado no aquário.');
    }

    const [removed] = player.aquarium.fish.splice(index, 1);

    if (sell) {
      // Vende o peixe por seu valor integral
      const price = Math.floor(removed.basePrice * removed.weight * 1.2);
      this.playerManager.addCoins(player, price);
      this.playerManager.savePlayer(player);

      return R.success(
        'SELL_TROPHY_FISH',
        { coinsEarned: price },
        'coins',
        `Você vendeu ${removed.nickname || removed.name} por 🪙 ${price} moedas!`,
      );
    } else {
      // Retorna ao cesto de peixes
      const invFish = {
        id: removed.fishId,
        assetId: removed.assetId,
        name: removed.name,
        rarity: removed.rarity,
        weight: removed.weight,
        basePrice: removed.basePrice,
        xpReward: 10,
        locations: ['lake'],
        description: 'Um troféu retirado do seu aquário particular.',
        minWeight: 1,
        maxWeight: 10,
        inventoryId: `inv_ret_${Date.now()}`,
      };

      player.inventory.fish.push(invFish);
      this.playerManager.savePlayer(player);

      return R.success(
        'RETURN_FISH_INVENTORY',
        { fish: invFish },
        removed.assetId,
        `${removed.nickname || removed.name} foi movido de volta para o seu cesto de peixes.`,
      );
    }
  }

  // Dar um apelido ao peixe troféu
  public renameFish(
    userId: string,
    trophyId: string,
    nickname: string,
  ): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const fish = player.aquarium.fish.find((f) => f.id === trophyId);
    if (!fish) {
      return R.error('TROPHY_NOT_FOUND', 'Peixe não encontrado no aquário.');
    }

    const trimmed = nickname.trim().slice(0, 24);
    fish.nickname = trimmed.length > 0 ? trimmed : undefined;
    this.playerManager.savePlayer(player);

    return R.success(
      'RENAME_TROPHY_FISH',
      { nickname: fish.nickname },
      fish.assetId,
      trimmed ? `Peixe renomeado para "${trimmed}"!` : 'Apelido removido.',
    );
  }

  // Alimentar os peixes (Ração Nutritiva)
  public feedFish(userId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    if (player.aquarium.fish.length === 0) {
      return R.error('AQUARIUM_EMPTY', 'Adicione alguns peixes ao aquário antes de alimentar!');
    }

    const now = Date.now();
    // 20 minutos de efeito de Felicidade Máxima (dobro de gorjetas!)
    const durationMs = 20 * 60 * 1000;
    player.aquarium.lastFedAt = now;
    player.aquarium.fedHappinessExpiresAt = now + durationMs;

    this.playerManager.savePlayer(player);

    return R.success(
      'FEED_FISH',
      { expiresAt: player.aquarium.fedHappinessExpiresAt },
      'feed_success',
      '🐟 Ração nutritiva servida! Seus peixes estão radiantes de felicidade (Bônus 2x de moedas ativo por 20 minutos)!',
    );
  }

  // Comprar novo tema de cenário
  public buyTheme(userId: string, themeId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const theme = AquariumThemes.find((t) => t.id === themeId);
    if (!theme) {
      return R.error('THEME_NOT_FOUND', 'Tema não encontrado.');
    }

    if (player.aquarium.ownedThemes.includes(themeId)) {
      return R.error('ALREADY_OWNED', 'Você já possui esse cenário.');
    }

    if (player.coins < theme.cost) {
      return R.error(
        'INSUFFICIENT_COINS',
        `Moedas insuficientes! Esse cenário custa 🪙 ${theme.cost}.`,
      );
    }

    this.playerManager.removeCoins(player, theme.cost);
    player.aquarium.ownedThemes.push(themeId);
    player.aquarium.currentThemeId = themeId;
    this.playerManager.savePlayer(player);

    return R.success(
      'BUY_THEME',
      { themeId },
      'theme_purchased',
      `Cenário "${theme.name}" adquirido e aplicado com sucesso (+${Math.round((theme.coinsMultiplier - 1) * 100)}% de gorjetas)!`,
    );
  }

  // Equipar um tema já adquirido
  public setTheme(userId: string, themeId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    if (!player.aquarium.ownedThemes.includes(themeId)) {
      return R.error('THEME_NOT_OWNED', 'Você ainda não possui este cenário.');
    }

    player.aquarium.currentThemeId = themeId;
    this.playerManager.savePlayer(player);

    const theme = AquariumThemes.find((t) => t.id === themeId);
    return R.success(
      'SET_THEME',
      { themeId },
      'theme_set',
      `Cenário alterado para "${theme?.name || themeId}"!`,
    );
  }

  // Comprar decoração para o aquário
  public buyDecoration(userId: string, decoId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player || !player.aquarium) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const deco = AquariumDecorations.find((d) => d.id === decoId);
    if (!deco) {
      return R.error('DECO_NOT_FOUND', 'Decoração não encontrada.');
    }

    if (player.aquarium.ownedDecorations.includes(decoId)) {
      return R.error('ALREADY_OWNED', 'Você já possui essa decoração instalada.');
    }

    if (player.coins < deco.cost) {
      return R.error(
        'INSUFFICIENT_COINS',
        `Moedas insuficientes! Essa decoração custa 🪙 ${deco.cost}.`,
      );
    }

    this.playerManager.removeCoins(player, deco.cost);
    player.aquarium.ownedDecorations.push(decoId);
    this.playerManager.savePlayer(player);

    return R.success(
      'BUY_DECORATION',
      { decoId },
      'deco_purchased',
      `Decoração "${deco.name}" instalada no seu aquário! (+${deco.coinsBonusPct}% de moedas dos visitantes)`,
    );
  }
}
