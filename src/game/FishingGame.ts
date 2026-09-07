// src/game/FishingGame.ts
// ─────────────────────────────────────────────
// Facade principal do Jogo de Pesca.
// Encapsula e coordena todos os sub-sistemas.
// ─────────────────────────────────────────────

import { LocalStorageAdapter } from './storage/LocalStorageAdapter.js';
import { PlayerManager, PlayerProfile } from './managers/PlayerManager.js';
import { SessionManager, FishingSession } from './managers/SessionManager.js';
import { LocationManager } from './managers/LocationManager.js';
import { ShopManager } from './managers/ShopManager.js';
import { EventEngine } from './managers/EventEngine.js';
import { FishingEngine, FishingCollectResult } from './managers/FishingEngine.js';
import { RankingManager, RankingEntry } from './managers/RankingManager.js';
import { GameLocation } from './data/locations.data.js';
import { GameItem } from './data/items.data.js';
import * as R from './utils/response.builder.js';

export class FishingGame {
  public storage: LocalStorageAdapter;
  public playerManager: PlayerManager;
  public sessionManager: SessionManager;
  public locationManager: LocationManager;
  public shopManager: ShopManager;
  public eventEngine: EventEngine;
  public fishingEngine: FishingEngine;
  public rankingManager: RankingManager;

  constructor(customStorage?: LocalStorageAdapter) {
    this.storage = customStorage || new LocalStorageAdapter('fishing_game:');
    this.playerManager = new PlayerManager(this.storage as any);
    this.sessionManager = new SessionManager(this.storage as any);
    this.locationManager = new LocationManager();
    this.shopManager = new ShopManager(this.playerManager);
    this.eventEngine = new EventEngine(this.playerManager);
    this.fishingEngine = new FishingEngine(
      this.playerManager,
      this.sessionManager,
      this.locationManager,
      this.eventEngine,
    );
    this.rankingManager = new RankingManager(this.storage as any);
  }

  initPlayer(userId: string, name = 'Pescador'): PlayerProfile {
    return this.playerManager.getOrCreatePlayer(userId, name);
  }

  getPlayer(userId: string): PlayerProfile | null {
    return this.playerManager.getPlayer(userId);
  }

  cast(chatId: string, userId: string): R.GameResponse {
    return this.fishingEngine.castLine(chatId, userId);
  }

  collect(
    chatId: string,
    userId: string,
    options?: { isPerfect?: boolean },
  ): R.GameResponse<FishingCollectResult | null> {
    return this.fishingEngine.collect(chatId, userId, options);
  }

  changeLocation(userId: string, locationId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.locationManager.changeLocation(player, locationId);
  }

  buy(userId: string, itemId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.shopManager.buyItem(player, itemId);
  }

  equip(userId: string, itemId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.shopManager.equipItem(player, itemId);
  }

  unequipBait(userId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.shopManager.unequipBait(player);
  }

  sellFish(userId: string, inventoryId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.shopManager.sellFish(player, inventoryId);
  }

  sellAll(userId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.shopManager.sellAllFish(player);
  }

  getActiveSession(chatId: string, userId: string): FishingSession | null {
    return this.sessionManager.getSession(chatId, userId);
  }

  getLocations(userId: string): {
    all: GameLocation[];
    available: GameLocation[];
    current: GameLocation | null;
  } {
    const player = this.playerManager.getPlayer(userId);
    const all = this.locationManager.getAllLocations();
    const available = player ? this.locationManager.getAvailableLocations(player.level) : all.slice(0, 1);
    const current = player ? this.locationManager.getLocation(player.currentLocation) : all[0];
    return { all, available, current };
  }

  getShopCatalog(): GameItem[] {
    return this.shopManager.getCatalog();
  }

  getLeaderboard(userId?: string): RankingEntry[] {
    const player = userId ? this.playerManager.getPlayer(userId) || undefined : undefined;
    return this.rankingManager.getLeaderboard(player);
  }
}
