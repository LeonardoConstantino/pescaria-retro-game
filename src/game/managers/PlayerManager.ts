// src/game/managers/PlayerManager.ts
// ─────────────────────────────────────────────
// Gerencia criação, persistência e mutações de
// dados do jogador (XP, nível, inventário, etc).
// ─────────────────────────────────────────────

import { GameConfig } from '../data/game.config.js';
import { GameFish } from '../data/fish.data.js';

export interface PlayerEquipment {
  rod: string;
  bait: string | null;
}

export interface PlayerInventory {
  fish: (GameFish & { weight: number; inventoryId: string })[];
  items: Record<string, number>;
}

export interface PlayerStats {
  totalFishCaught: number;
  totalEvents: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  largestFishWeight: number;
  largestFishName: string;
}

export interface PlayerBoosts {
  rarity?: { rarity: string; value: number; remaining: number };
  cooldown?: { value: number; remaining: number };
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  currentLocation: string;
  equipment: PlayerEquipment;
  inventory: PlayerInventory;
  boosts: PlayerBoosts;
  stats: PlayerStats;
  lastFishedAt: number | null;
  createdAt: number;
}

export class PlayerManager {
  private storage: Map<string, any>;

  constructor(storage: Map<string, any>) {
    this.storage = storage;
  }

  createPlayer(id: string, name = 'Pescador'): PlayerProfile {
    const player: PlayerProfile = {
      id,
      name,
      level: 1,
      xp: 0,
      coins: 50, // Moedas iniciais para começar comprando iscas
      currentLocation: 'lake',
      equipment: {
        rod: 'rod_basic',
        bait: 'bait_worm',
      },
      inventory: {
        fish: [],
        items: {
          rod_basic: 1,
          bait_worm: 10,
        },
      },
      boosts: {},
      stats: {
        totalFishCaught: 0,
        totalEvents: 0,
        totalCoinsEarned: 50,
        totalCoinsSpent: 0,
        largestFishWeight: 0,
        largestFishName: '',
      },
      lastFishedAt: null,
      createdAt: Date.now(),
    };

    this.savePlayer(player);
    return player;
  }

  getPlayer(id: string): PlayerProfile | null {
    const data = this.storage.get(`player:${id}`);
    if (!data) return null;
    return data;
  }

  getOrCreatePlayer(id: string, name = 'Pescador'): PlayerProfile {
    const existing = this.getPlayer(id);
    if (existing) return existing;
    return this.createPlayer(id, name);
  }

  savePlayer(player: PlayerProfile): void {
    this.storage.set(`player:${player.id}`, player);
  }

  calculateLevel(xp: number): number {
    const { baseXpPerLevel, levelMultiplier } = GameConfig.xp;
    let lvl = 1;
    let required = baseXpPerLevel;
    let accumulated = 0;

    while (xp >= accumulated + required) {
      accumulated += required;
      lvl++;
      required = Math.round(baseXpPerLevel * Math.pow(lvl, levelMultiplier));
    }
    return lvl;
  }

  xpForNextLevel(currentLevel: number): { currentLevelBaseXp: number; nextLevelXp: number } {
    const { baseXpPerLevel, levelMultiplier } = GameConfig.xp;
    let accumulated = 0;
    for (let l = 1; l < currentLevel; l++) {
      accumulated += Math.round(baseXpPerLevel * Math.pow(l, levelMultiplier));
    }
    const currentNeed = Math.round(baseXpPerLevel * Math.pow(currentLevel, levelMultiplier));
    return {
      currentLevelBaseXp: accumulated,
      nextLevelXp: accumulated + currentNeed,
    };
  }

  addXp(player: PlayerProfile, amount: number): { leveledUp: boolean; oldLevel: number; newLevel: number } {
    const oldLevel = player.level;
    player.xp += Math.round(amount);
    const newLevel = this.calculateLevel(player.xp);
    const leveledUp = newLevel > oldLevel;
    player.level = newLevel;

    this.savePlayer(player);
    return { leveledUp, oldLevel, newLevel };
  }

  addFish(player: PlayerProfile, fish: GameFish & { weight: number }): { added: boolean; reason?: string } {
    if (player.inventory.fish.length >= GameConfig.inventory.maxSlots) {
      return { added: false, reason: 'INVENTORY_FULL' };
    }

    const uniqueId = `fish_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fishWithId = { ...fish, inventoryId: uniqueId };
    player.inventory.fish.push(fishWithId);

    player.stats.totalFishCaught += 1;
    if (fish.weight > player.stats.largestFishWeight) {
      player.stats.largestFishWeight = fish.weight;
      player.stats.largestFishName = fish.name;
    }

    this.savePlayer(player);
    return { added: true };
  }

  removeFish(player: PlayerProfile, inventoryId: string): boolean {
    const idx = player.inventory.fish.findIndex((f) => f.inventoryId === inventoryId);
    if (idx === -1) return false;
    player.inventory.fish.splice(idx, 1);
    this.savePlayer(player);
    return true;
  }

  addCoins(player: PlayerProfile, amount: number): void {
    player.coins += Math.max(0, Math.round(amount));
    player.stats.totalCoinsEarned += Math.max(0, Math.round(amount));
    this.savePlayer(player);
  }

  removeCoins(player: PlayerProfile, amount: number): boolean {
    const rounded = Math.round(amount);
    if (player.coins < rounded) return false;
    player.coins -= rounded;
    player.stats.totalCoinsSpent += rounded;
    this.savePlayer(player);
    return true;
  }

  consumeBait(player: PlayerProfile): boolean {
    const baitId = player.equipment.bait;
    if (!baitId) return false;

    const count = player.inventory.items[baitId] || 0;
    if (count <= 1) {
      delete player.inventory.items[baitId];
      player.equipment.bait = null;
    } else {
      player.inventory.items[baitId] = count - 1;
    }

    this.savePlayer(player);
    return true;
  }

  decrementBoosts(player: PlayerProfile): void {
    if (player.boosts.rarity) {
      player.boosts.rarity.remaining -= 1;
      if (player.boosts.rarity.remaining <= 0) {
        delete player.boosts.rarity;
      }
    }
    if (player.boosts.cooldown) {
      player.boosts.cooldown.remaining -= 1;
      if (player.boosts.cooldown.remaining <= 0) {
        delete player.boosts.cooldown;
      }
    }
    this.savePlayer(player);
  }
}
