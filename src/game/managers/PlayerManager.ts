// src/game/managers/PlayerManager.ts
// ─────────────────────────────────────────────
// Gerencia criação, persistência e mutações de
// dados do jogador (XP, nível, inventário, etc).
// ─────────────────────────────────────────────

import { GameConfig } from '../data/game.config.js';
import { GameFish } from '../data/fish.data.js';
import { PlayerAquarium } from '../data/aquarium.data.js';

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
  totalWaterClicks?: number;
  goldenFishCaught?: number;
  ascensionsCount?: number;
  lifetimeCoinsEarned?: number; // moedas totais históricas acumuladas através de todos os renascimentos
  totalTitansCaught?: number; // Contagem de Titãs Ancestrais domados
}

export interface PlayerBoosts {
  rarity?: { rarity: string; value: number; remaining: number };
  cooldown?: { value: number; remaining: number };
}

export interface DiscoveredFishEntry {
  count: number;
  maxWeight: number;
  firstCaughtAt: number;
  lastCaughtAt?: number;
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
  discoveredFish?: Record<string, DiscoveredFishEntry>; // Registro permanente do Bestiário (não é perdido ao vender nem ao ascender)
  idleFishers?: Record<string, number>; // id da automação -> quantidade possuída
  idleUpgrades?: string[]; // IDs dos upgrades comprados
  activeBuffs?: Record<string, { multiplier: number; expiresAt: number; title: string }>;
  cosmicScales?: number; // Escamas Douradas Cósmicas disponíveis para gastar
  claimedScalesTotal?: number; // Total de escamas já resgatadas
  cosmicBlessings?: string[]; // IDs das bênçãos permanentes adquiridas
  unlockedAchievements?: string[]; // IDs das conquistas desbloqueadas
  boosts: PlayerBoosts;
  stats: PlayerStats;
  aquarium?: PlayerAquarium;
  titanRelics?: string[]; // IDs das Relíquias Ancestrais dos Titãs conquistadas
  capturedTitans?: Record<string, { count: number; firstCaughtAt: number; maxWeightKg: number }>; // Registro dos Titãs domados
  talents?: Record<string, number>; // id do talento -> rank investido (ex: talent_reflexes: 3)
  bonusTalentPoints?: number; // Pontos de talento bônus ganhos por marcos especiais
  lastFishedAt: number | null;
  lastIdleTickAt?: number;
  createdAt: number;
  economyRebalancedV2?: boolean;
  ascensionRebalancedV3?: boolean;
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
      idleFishers: {},
      boosts: {},
      stats: {
        totalFishCaught: 0,
        totalEvents: 0,
        totalCoinsEarned: 50,
        totalCoinsSpent: 0,
        largestFishWeight: 0,
        largestFishName: '',
      },
      aquarium: {
        level: 1,
        currentThemeId: 'theme_freshwater',
        ownedThemes: ['theme_freshwater'],
        ownedDecorations: [],
        fish: [],
        lastFedAt: 0,
        fedHappinessExpiresAt: 0,
        uncollectedCoins: 0,
        lastTickAt: Date.now(),
      },
      discoveredFish: {},
      talents: {},
      bonusTalentPoints: 0,
      lastFishedAt: null,
      lastIdleTickAt: Date.now(),
      createdAt: Date.now(),
    };

    this.savePlayer(player);
    return player;
  }

  getPlayer(id: string): PlayerProfile | null {
    const data = this.storage.get(`player:${id}`);
    if (!data || typeof data !== 'object') return null;

    // Garantia absoluta de integridade contra saves incompletos ou versões antigas
    if (!data.id) data.id = id;
    if (!data.name) data.name = 'Pescador';
    if (typeof data.level !== 'number' || isNaN(data.level) || data.level < 1) data.level = 1;
    if (typeof data.xp !== 'number' || isNaN(data.xp) || data.xp < 0) data.xp = 0;
    if (typeof data.coins !== 'number' || isNaN(data.coins) || data.coins < 0) data.coins = 50;
    if (!data.currentLocation) data.currentLocation = 'lake';

    if (!data.equipment || typeof data.equipment !== 'object') {
      data.equipment = { rod: 'rod_basic', bait: 'bait_worm' };
    } else {
      if (!data.equipment.rod) data.equipment.rod = 'rod_basic';
      if (data.equipment.bait === undefined) data.equipment.bait = 'bait_worm';
    }

    if (!data.inventory || typeof data.inventory !== 'object') {
      data.inventory = { fish: [], items: { rod_basic: 1, bait_worm: 10 } };
    } else {
      if (!Array.isArray(data.inventory.fish)) data.inventory.fish = [];
      if (!data.inventory.items || typeof data.inventory.items !== 'object') {
        data.inventory.items = { rod_basic: 1 };
      }
    }

    if (!data.stats || typeof data.stats !== 'object') {
      data.stats = {
        totalFishCaught: 0,
        totalEvents: 0,
        totalCoinsEarned: 50,
        totalCoinsSpent: 0,
        largestFishWeight: 0,
        largestFishName: '',
      };
    } else {
      if (typeof data.stats.totalFishCaught !== 'number') data.stats.totalFishCaught = 0;
      if (typeof data.stats.totalEvents !== 'number') data.stats.totalEvents = 0;
      if (typeof data.stats.totalCoinsEarned !== 'number') data.stats.totalCoinsEarned = 50;
      if (typeof data.stats.totalCoinsSpent !== 'number') data.stats.totalCoinsSpent = 0;
      if (typeof data.stats.largestFishWeight !== 'number') data.stats.largestFishWeight = 0;
      if (typeof data.stats.largestFishName !== 'string') data.stats.largestFishName = '';
      if (typeof data.stats.totalWaterClicks !== 'number') data.stats.totalWaterClicks = 0;
      if (typeof data.stats.goldenFishCaught !== 'number') data.stats.goldenFishCaught = 0;
      if (typeof data.stats.ascensionsCount !== 'number') data.stats.ascensionsCount = 0;
      if (typeof data.stats.lifetimeCoinsEarned !== 'number') data.stats.lifetimeCoinsEarned = 0;
      if (typeof data.stats.totalTitansCaught !== 'number') data.stats.totalTitansCaught = 0;
    }

    if (!data.boosts || typeof data.boosts !== 'object') data.boosts = {};
    if (!data.idleFishers || typeof data.idleFishers !== 'object') {
      data.idleFishers = {};
    }
    if (!Array.isArray(data.idleUpgrades)) {
      data.idleUpgrades = [];
    }
    if (!data.activeBuffs || typeof data.activeBuffs !== 'object') {
      data.activeBuffs = {};
    }
    if (typeof data.cosmicScales !== 'number') {
      data.cosmicScales = 0;
    }
    if (typeof data.claimedScalesTotal !== 'number') {
      data.claimedScalesTotal = 0;
    }
    if (!Array.isArray(data.cosmicBlessings)) {
      data.cosmicBlessings = [];
    }
    if (!Array.isArray(data.unlockedAchievements)) {
      data.unlockedAchievements = [];
    }
    if (!data.lastIdleTickAt) {
      data.lastIdleTickAt = Date.now();
    }
    if (!data.aquarium) {
      data.aquarium = {
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
    if (!data.talents) {
      data.talents = {};
    }
    if (typeof data.bonusTalentPoints !== 'number') {
      data.bonusTalentPoints = 0;
    }
    if (!data.titanRelics) {
      data.titanRelics = [];
    }
    if (!data.capturedTitans) {
      data.capturedTitans = {};
    }
    // Inicialização e sincronização retroativa persistente do Bestiário
    if (!data.discoveredFish) {
      data.discoveredFish = {};
    }
    // Sincroniza qualquer peixe já presente no inventário
    if (data.inventory?.fish) {
      for (const f of data.inventory.fish) {
        if (!data.discoveredFish[f.id]) {
          data.discoveredFish[f.id] = {
            count: 1,
            maxWeight: f.weight || f.minWeight || 1,
            firstCaughtAt: Date.now(),
            lastCaughtAt: Date.now(),
          };
        }
      }
    }
    // Sincroniza qualquer peixe já presente no aquário
    if (data.aquarium?.fish) {
      for (const f of data.aquarium.fish) {
        if (!data.discoveredFish[f.fishId]) {
          data.discoveredFish[f.fishId] = {
            count: 1,
            maxWeight: f.weight || 1,
            firstCaughtAt: f.caughtAt || Date.now(),
            lastCaughtAt: f.caughtAt || Date.now(),
          };
        }
      }
    }
    // Rebalanceamento retroativo e seguro contra o bug de hiperinflação dos ajudantes passivos
    if (!data.economyRebalancedV2) {
      data.economyRebalancedV2 = true;
      const ascCount = data.stats?.ascensionsCount || 0;
      if (data.coins > 5000000 && ascCount < 2) {
        // Reduz para um montante farto e generoso (500.000 moedas), restaurando o desafio e a diversão
        data.coins = 500000;
        if (data.stats && data.stats.totalCoinsEarned > 1500000) {
          data.stats.totalCoinsEarned = 1500000;
        }
      }
      // Suaviza estoques anômalos de ajudantes de ponta
      if (data.idleFishers) {
        if (data.idleFishers['poseidon_shrine'] > 5) data.idleFishers['poseidon_shrine'] = 5;
        if (data.idleFishers['trawler_ship'] > 10) data.idleFishers['trawler_ship'] = 10;
        if (data.idleFishers['otter_brigade'] > 15) data.idleFishers['otter_brigade'] = 15;
      }
      this.savePlayer(data);
    }

    // Rebalanceamento retroativo da Ascensão Cósmica, Escamas e Bênçãos (V3)
    if (!data.ascensionRebalancedV3) {
      data.ascensionRebalancedV3 = true;
      let shouldSave = false;

      // Se o jogador possui moedas vitalícias geradas pela hiperinflação de ajudantes no passado (ex: 520 bilhões)
      if (data.stats && (data.stats.lifetimeCoinsEarned || 0) > 3000000 && data.level < 15) {
        const ascCount = Math.max(1, data.stats.ascensionsCount || 1);
        // Para 3 renascimentos no início/meio de jogo, concede 6 a 8 escamas cósmicas justas e prontas para gastar
        const fairScales = Math.min(15, Math.max(4, ascCount * 2));
        data.stats.lifetimeCoinsEarned = 660000;
        data.claimedScalesTotal = fairScales;
        data.cosmicScales = fairScales;
        // Reseta as bênçãos para que o jogador tenha o prazer de escolher e comprar no novo catálogo expandido
        data.cosmicBlessings = [];
        shouldSave = true;
      } else if (data.cosmicScales && data.cosmicScales > 100 && data.level < 15) {
        data.claimedScalesTotal = 6;
        data.cosmicScales = 6;
        data.cosmicBlessings = [];
        shouldSave = true;
      }

      // Normaliza moedas do cofrinho do aquário caso tenham acumulado milhões pelo tick antigo
      if (data.aquarium && data.aquarium.uncollectedCoins > 15000) {
        data.aquarium.uncollectedCoins = 2500;
        shouldSave = true;
      }

      if (shouldSave) {
        this.savePlayer(data);
      }
    }

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
    if (!xp || isNaN(xp) || xp <= 0) return 1;
    const { baseXpPerLevel, levelMultiplier } = GameConfig.xp;
    let lvl = 1;
    let required = baseXpPerLevel;
    let accumulated = 0;

    while (xp >= accumulated + required && lvl < 500) {
      accumulated += required;
      lvl++;
      required = Math.max(1, Math.round(baseXpPerLevel * Math.pow(lvl, levelMultiplier)));
    }
    return lvl;
  }

  xpForNextLevel(currentLevel: number): { currentLevelBaseXp: number; nextLevelXp: number } {
    const { baseXpPerLevel, levelMultiplier } = GameConfig.xp;
    const safeLevel = Math.max(1, Math.min(500, currentLevel || 1));
    let accumulated = 0;
    for (let l = 1; l < safeLevel; l++) {
      accumulated += Math.round(baseXpPerLevel * Math.pow(l, levelMultiplier));
    }
    const currentNeed = Math.round(baseXpPerLevel * Math.pow(safeLevel, levelMultiplier));
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

  /**
   * Registra uma espécie no Bestiário de forma permanente (não é perdido ao vender nem ascender).
   */
  discoverFish(player: PlayerProfile, fish: GameFish & { weight?: number }): void {
    if (!player.discoveredFish) {
      player.discoveredFish = {};
    }
    const weight = fish.weight || fish.minWeight || 1;
    const existing = player.discoveredFish[fish.id];
    if (existing) {
      existing.count += 1;
      existing.lastCaughtAt = Date.now();
      if (weight > existing.maxWeight) {
        existing.maxWeight = Number(weight.toFixed(2));
      }
    } else {
      player.discoveredFish[fish.id] = {
        count: 1,
        maxWeight: Number(weight.toFixed(2)),
        firstCaughtAt: Date.now(),
        lastCaughtAt: Date.now(),
      };
    }
    this.savePlayer(player);
  }

  addFish(player: PlayerProfile, fish: GameFish & { weight: number }): { added: boolean; reason?: string } {
    // Registra permanentemente no Bestiário independente de caber ou não no inventário
    this.discoverFish(player, fish);

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

  getDiscoveredFish(player: PlayerProfile): Record<string, DiscoveredFishEntry> {
    return player.discoveredFish || {};
  }

  getDiscoveredFishIds(player: PlayerProfile): string[] {
    return Object.keys(player.discoveredFish || {});
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

  addItem(player: PlayerProfile, itemId: string, quantity = 1): void {
    player.inventory.items[itemId] = (player.inventory.items[itemId] || 0) + Math.max(1, Math.round(quantity));
    this.savePlayer(player);
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
