// src/game/managers/ShopManager.ts
// ─────────────────────────────────────────────
// Gerencia a loja de equipamentos, compra,
// venda de peixes e equipar itens.
// ─────────────────────────────────────────────

import { ItemData, GameItem } from '../data/items.data.js';
import { GameConfig } from '../data/game.config.js';
import { PlayerProfile, PlayerManager } from './PlayerManager.js';
import { GameFish } from '../data/fish.data.js';
import * as R from '../utils/response.builder.js';

export class ShopManager {
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  getCatalog(): GameItem[] {
    return ItemData;
  }

  getItem(itemId: string): GameItem | null {
    return ItemData.find((i) => i.id === itemId) || null;
  }

  calculateFishPrice(fish: GameFish & { weight: number }): number {
    const mult = GameConfig.economy.sellMultiplierByRarity[fish.rarity] || 1.0;
    // Preço baseado no valor base e no peso relativo do peixe
    const weightFactor = fish.weight / ((fish.minWeight + fish.maxWeight) / 2);
    const price = Math.round(fish.basePrice * mult * Math.max(0.7, weightFactor));
    return Math.max(1, price);
  }

  buyItem(player: PlayerProfile, itemId: string): R.GameResponse {
    const item = this.getItem(itemId);
    if (!item) {
      return R.error('ITEM_NOT_FOUND', 'Item não encontrado na loja.', 'error_ITEM_NOT_FOUND');
    }

    if (player.level < item.requiredLevel) {
      return R.error(
        'LEVEL_TOO_LOW',
        `Você precisa estar no nível ${item.requiredLevel} para comprar ${item.name}.`,
        'error_ITEM_LOCKED',
      );
    }

    if (player.coins < item.price) {
      return R.error(
        'INSUFFICIENT_FUNDS',
        `Você precisa de 🪙 ${item.price} moedas (você tem ${player.coins}).`,
        'error_INSUFFICIENT_FUNDS',
      );
    }

    // Se for vara e já possuir
    if (item.type === 'rod' && player.inventory.items[itemId]) {
      return R.error(
        'ALREADY_OWNED',
        `Você já possui a vara ${item.name}!`,
        'error_ALREADY_OWNED',
      );
    }

    const deducted = this.playerManager.removeCoins(player, item.price);
    if (!deducted) {
      return R.error('PURCHASE_FAILED', 'Não foi possível completar a compra.');
    }

    const qty = item.quantity || 1;
    player.inventory.items[itemId] = (player.inventory.items[itemId] || 0) + qty;

    // Se for vara, equipa automaticamente
    if (item.type === 'rod') {
      player.equipment.rod = itemId;
    }
    // Se não tiver isca equipada e comprou isca, equipa
    if (item.type === 'bait' && !player.equipment.bait) {
      player.equipment.bait = itemId;
    }

    this.playerManager.savePlayer(player);

    return R.success(
      'buy_item',
      { item, playerCoins: player.coins, quantity: qty },
      item.assetId,
      `Você comprou ${item.name}${qty > 1 ? ` (${qty}x)` : ''} por 🪙 ${item.price} moedas!`,
    );
  }

  equipItem(player: PlayerProfile, itemId: string): R.GameResponse {
    const item = this.getItem(itemId);
    if (!item) {
      return R.error('ITEM_NOT_FOUND', 'Item não encontrado.', 'error_ITEM_NOT_FOUND');
    }

    if (!player.inventory.items[itemId] || player.inventory.items[itemId] <= 0) {
      return R.error(
        'ITEM_NOT_OWNED',
        `Você não possui ${item.name} no seu inventário.`,
        'error_ITEM_NOT_OWNED',
      );
    }

    if (item.type === 'rod') {
      player.equipment.rod = itemId;
    } else if (item.type === 'bait') {
      player.equipment.bait = itemId;
    }

    this.playerManager.savePlayer(player);

    return R.success(
      'equip_item',
      { equipment: player.equipment },
      item.assetId,
      `Você equipou ${item.name}!`,
    );
  }

  unequipBait(player: PlayerProfile): R.GameResponse {
    player.equipment.bait = null;
    this.playerManager.savePlayer(player);
    return R.success('unequip_bait', { equipment: player.equipment }, 'action_success', 'Isca desequipada.');
  }

  sellFish(player: PlayerProfile, inventoryId: string): R.GameResponse {
    const fish = player.inventory.fish.find((f) => f.inventoryId === inventoryId);
    if (!fish) {
      return R.error('FISH_NOT_FOUND', 'Peixe não encontrado no seu cesto.', 'error_FISH_NOT_FOUND');
    }

    const price = this.calculateFishPrice(fish);
    this.playerManager.removeFish(player, inventoryId);
    this.playerManager.addCoins(player, price);
    const xpResult = this.playerManager.addXp(player, GameConfig.xp.perSell);

    return R.success(
      'sell_fish',
      {
        soldFish: fish,
        coinsEarned: price,
        xpEarned: GameConfig.xp.perSell,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        currentCoins: player.coins,
      },
      fish.assetId,
      `Você vendeu ${fish.name} (${fish.weight} kg) por 🪙 ${price} moedas!`,
    );
  }

  sellAllFish(player: PlayerProfile): R.GameResponse {
    if (player.inventory.fish.length === 0) {
      return R.error('NO_FISH_TO_SELL', 'Seu cesto de peixes está vazio!', 'error_NO_FISH_TO_SELL');
    }

    let totalCoins = 0;
    const count = player.inventory.fish.length;

    for (const fish of player.inventory.fish) {
      totalCoins += this.calculateFishPrice(fish);
    }

    const totalXp = count * GameConfig.xp.perSell;
    player.inventory.fish = [];
    this.playerManager.addCoins(player, totalCoins);
    const xpResult = this.playerManager.addXp(player, totalXp);

    return R.success(
      'sell_all_fish',
      {
        count,
        totalCoins,
        totalXp,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        currentCoins: player.coins,
      },
      'action_success',
      `Você vendeu todos os ${count} peixes do seu cesto e faturou 🪙 ${totalCoins} moedas (+${totalXp} XP)!`,
    );
  }
}
