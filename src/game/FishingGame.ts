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
import { IdleManager } from './managers/IdleManager.js';
import { PrestigeManager, PrestigeStatus } from './managers/PrestigeManager.js';
import { AchievementManager } from './managers/AchievementManager.js';
import { WeatherManager } from './managers/WeatherManager.js';
import { MissionManager } from './managers/MissionManager.js';
import { AquariumManager } from './managers/AquariumManager.js';
import { TalentManager } from './managers/TalentManager.js';
import { Achievement } from './data/achievements.data.js';
import { WeatherInfo, WeatherType } from './data/weather.data.js';
import { IdleFisherTier } from './data/idle.data.js';
import { GameLocation } from './data/locations.data.js';
import { GameItem } from './data/items.data.js';
import { TITANS_DATA, TitanData } from './data/titans.data.js';
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
  public idleManager: IdleManager;
  public prestigeManager: PrestigeManager;
  public achievementManager: AchievementManager;
  public weatherManager: WeatherManager;
  public missionManager: MissionManager;
  public aquariumManager: AquariumManager;
  public talentManager: TalentManager;

  constructor(customStorage?: LocalStorageAdapter) {
    this.storage = customStorage || new LocalStorageAdapter('fishing_game:');
    this.playerManager = new PlayerManager(this.storage as any);
    this.sessionManager = new SessionManager(this.storage as any);
    this.locationManager = new LocationManager();
    this.talentManager = new TalentManager(this.playerManager);
    this.shopManager = new ShopManager(this.playerManager, this.talentManager);
    this.eventEngine = new EventEngine(this.playerManager);
    this.fishingEngine = new FishingEngine(
      this.playerManager,
      this.sessionManager,
      this.locationManager,
      this.eventEngine,
      this.talentManager,
    );
    this.rankingManager = new RankingManager(this.storage as any);
    this.idleManager = new IdleManager(this.playerManager, this.talentManager);
    this.prestigeManager = new PrestigeManager(this.playerManager);
    this.achievementManager = new AchievementManager(this.playerManager);
    this.weatherManager = new WeatherManager();
    this.missionManager = new MissionManager(this.playerManager, this.storage as any);
    this.aquariumManager = new AquariumManager(this.playerManager, this.talentManager);
  }

  initPlayer(userId: string, name = 'Pescador'): PlayerProfile {
    return this.playerManager.getOrCreatePlayer(userId, name);
  }

  getPlayer(userId: string): PlayerProfile | null {
    return this.playerManager.getPlayer(userId);
  }

  cast(chatId: string, userId: string, biteSpeedMultiplier = 1.0): R.GameResponse {
    return this.fishingEngine.castLine(chatId, userId, biteSpeedMultiplier);
  }

  collect(
    chatId: string,
    userId: string,
    options?: { isPerfect?: boolean },
  ): R.GameResponse<FishingCollectResult | null> {
    const res = this.fishingEngine.collect(chatId, userId, options);
    if (res.ok && res.data) {
      if (res.data.fish) {
        const p = this.playerManager.getPlayer(userId);
        const loc = p ? p.currentLocation : 'lake';
        this.missionManager.onFishCaught(userId, res.data.fish, loc, !!options?.isPerfect);
      }
      if (res.data.bait) {
        this.missionManager.onBaitUsed(userId);
      }
    }
    return res;
  }

  cancelSession(chatId: string, userId: string): boolean {
    return this.sessionManager.deleteSession(chatId, userId);
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

  sellFish(userId: string, inventoryId: string, priceMultiplier = 1.0): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    const res = this.shopManager.sellFish(player, inventoryId, priceMultiplier);
    if (res.ok && res.data && res.data.coinsEarned) {
      this.missionManager.onCoinsEarned(userId, res.data.coinsEarned);
    }
    return res;
  }

  sellAll(userId: string, priceMultiplier = 1.0): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    const res = this.shopManager.sellAllFish(player, priceMultiplier);
    if (res.ok && res.data && res.data.totalCoins) {
      this.missionManager.onCoinsEarned(userId, res.data.totalCoins);
    }
    return res;
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

  getIdleTiers(): IdleFisherTier[] {
    return this.idleManager.getTiers();
  }

  getAvailableUpgrades(userId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return [];
    return this.idleManager.getAvailableUpgrades(player);
  }

  buyIdleUpgrade(userId: string, upgradeId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.idleManager.buyUpgrade(player, upgradeId);
  }

  buyIdleFisher(userId: string, tierId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    return this.idleManager.buyIdleFisher(player, tierId);
  }

  processIdleTick(userId: string): { coinsEarned: number; secondsElapsed: number; totalCps: number } {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return { coinsEarned: 0, secondsElapsed: 0, totalCps: 0 };
    }
    const result = this.idleManager.processIdleTick(player);
    const totalCps = this.idleManager.calculateTotalCps(player);
    return { ...result, totalCps };
  }

  getTotalCps(userId: string): number {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return 0;
    return this.idleManager.calculateTotalCps(player);
  }

  getMaxCpsCapacity(userId: string): number {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return 100;
    return this.idleManager.getMaxCpsCapacity(player);
  }

  processWaterClick(userId: string): { coinsEarned: number; isCritical: boolean } {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return { coinsEarned: 0, isCritical: false };
    return this.idleManager.processWaterClick(player);
  }

  getClickPower(userId: string): { coins: number; isCritical: boolean; multiplier: number } {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return { coins: 1, isCritical: false, multiplier: 1 };
    return this.idleManager.calculateClickPower(player);
  }

  claimGoldenFish(userId: string): { effect: string; title: string; description: string; instantCoins?: number } | null {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return null;
    return this.idleManager.claimGoldenFish(player);
  }

  cleanExpiredBuffs(userId: string): boolean {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return false;
    return this.idleManager.cleanExpiredBuffs(player);
  }

  getLeaderboard(userId?: string): RankingEntry[] {
    const player = userId ? this.playerManager.getPlayer(userId) || undefined : undefined;
    return this.rankingManager.getLeaderboard(player);
  }

  getPrestigeStatus(userId: string): PrestigeStatus | null {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return null;
    return this.prestigeManager.getPrestigeStatus(player);
  }

  ascend(userId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    return this.prestigeManager.ascend(player);
  }

  buyCosmicBlessing(userId: string, blessingId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    return this.prestigeManager.buyBlessing(player, blessingId);
  }

  // Conquistas & Marcos
  checkAchievements(userId: string): Achievement[] {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return [];
    const cps = this.getTotalCps(userId);
    return this.achievementManager.checkAchievements(player, cps);
  }

  getAchievementsStatus(userId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return null;
    const cps = this.getTotalCps(userId);
    return this.achievementManager.getAchievementsStatus(player, cps);
  }

  // Clima Dinâmico do Lago
  getCurrentWeather(): WeatherInfo {
    return this.weatherManager.getCurrentWeather();
  }

  getNextWeather(): WeatherInfo {
    return this.weatherManager.getNextWeather();
  }

  getWeatherTimeRemaining(): number {
    return this.weatherManager.getTimeRemainingSeconds();
  }

  hasWeatherForesight(userId: string): boolean {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return false;
    return this.talentManager.hasWeatherForesight(player);
  }

  hasWeatherControl(userId: string): boolean {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return false;
    return !!player.cosmicBlessings?.includes('blessing_storm_caller');
  }

  setWeather(type: WeatherType): WeatherInfo {
    return this.weatherManager.setWeather(type);
  }

  setWeatherWithPermission(userId: string, type: WeatherType): R.GameResponse<WeatherInfo> {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }
    if (!this.hasWeatherControl(userId)) {
      return R.error(
        'BLESSING_REQUIRED',
        'Mudar o clima manualmente requer a Bênção Cósmica "Domínio dos Céus" (disponível na Ascensão Cósmica).',
      );
    }
    const updated = this.weatherManager.setWeather(type);
    return R.success('weather_changed', updated, 'weather', `⚡ Clima alterado para ${updated.name}!`);
  }

  // Aquário / Viveiro de Troféus
  getAquarium(userId: string) {
    return this.aquariumManager.getAquarium(userId);
  }

  upgradeAquarium(userId: string) {
    return this.aquariumManager.upgradeTank(userId);
  }

  addFishToAquarium(userId: string, inventoryId: string) {
    return this.aquariumManager.addFishToAquarium(userId, inventoryId);
  }

  removeFishFromAquarium(userId: string, trophyId: string, sell = false) {
    return this.aquariumManager.removeFishFromAquarium(userId, trophyId, sell);
  }

  renameAquariumFish(userId: string, trophyId: string, nickname: string) {
    return this.aquariumManager.renameFish(userId, trophyId, nickname);
  }

  feedAquariumFish(userId: string) {
    return this.aquariumManager.feedFish(userId);
  }

  buyAquariumTheme(userId: string, themeId: string) {
    return this.aquariumManager.buyTheme(userId, themeId);
  }

  setAquariumTheme(userId: string, themeId: string) {
    return this.aquariumManager.setTheme(userId, themeId);
  }

  buyAquariumDecoration(userId: string, decoId: string) {
    return this.aquariumManager.buyDecoration(userId, decoId);
  }

  collectAquariumCoins(userId: string) {
    return this.aquariumManager.collectVisitorCoins(userId);
  }

  // ── O DESPERTAR DOS TITÃS (EVENTO ESPECIAL DE BIOMA) ──
  getTitanForLocation(locationId: string): TitanData | null {
    // Procura titã associado ao bioma atual (Vertical slice: Pântano -> titan_swamp_catfish)
    for (const t of Object.values(TITANS_DATA)) {
      if (t.locationId === locationId) {
        return t;
      }
    }
    return null;
  }

  /**
   * Avalia a possibilidade do Titã do Bioma despertar.
   * Regras de Design:
   * 1. ACONTECE APENAS 1 ÚNICA VEZ por Titã: se o jogador já capturou/domou
   *    ou já possui a relíquia, o Titã nunca mais desperta.
   * 2. Encontro ocasional raro (~3.5% de chance base por puxada no bioma correspondente,
   *    com leves acréscimos se o clima for tempestuoso/místico ou com iscas raras).
   */
  checkTitanAwakening(userId: string): TitanData | null {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return null;

    // Titã associado ao bioma atual
    const titan = this.getTitanForLocation(player.currentLocation);
    if (!titan) return null;

    // REGRA DE OURO: Apenas 1 única vez por Titã
    const alreadyCaptured = (player.capturedTitans?.[titan.id]?.count || 0) > 0;
    const alreadyHasRelic = player.titanRelics?.includes(titan.relic.id);
    if (alreadyCaptured || alreadyHasRelic) {
      return null;
    }

    // Cálculo de probabilidade rara (3.5% base)
    let encounterChance = 0.035;

    // Clima misterioso ou tempestuoso aguça os sentidos do Titã
    const weather = this.weatherManager?.getCurrentWeather();
    if (weather?.id === 'mystic_moon' || weather?.id === 'storm') {
      encounterChance += 0.015;
    }

    // Isca equipada rara/lendária aumenta a atração
    const currentBait = player.equipment?.bait;
    if (currentBait?.includes('legendary') || currentBait?.includes('golden')) {
      encounterChance += 0.015;
    }

    const roll = Math.random();
    if (roll < encounterChance) {
      return titan;
    }

    return null;
  }

  /**
   * Conclui com sucesso a captura do Titã, concedendo a Relíquia Ancestral Única,
   * adicionando ao Aquário como peça central suprema e registrando no perfil.
   */
  captureTitan(userId: string, titanId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.');
    }

    const titan = TITANS_DATA[titanId];
    if (!titan) {
      return R.error('TITAN_NOT_FOUND', 'Titã não catalogado.');
    }

    // 1. Concede a Relíquia Ancestral Única (se ainda não tiver)
    if (!player.titanRelics) player.titanRelics = [];
    if (!player.titanRelics.includes(titan.relic.id)) {
      player.titanRelics.push(titan.relic.id);
    }

    // 2. Registra o Titã Domado
    if (!player.capturedTitans) player.capturedTitans = {};
    const existing = player.capturedTitans[titan.id];
    player.capturedTitans[titan.id] = {
      count: (existing?.count || 0) + 1,
      firstCaughtAt: existing?.firstCaughtAt || Date.now(),
      maxWeightKg: Math.max(existing?.maxWeightKg || 0, titan.weightKg),
    };

    if (!player.stats.totalTitansCaught) player.stats.totalTitansCaught = 0;
    player.stats.totalTitansCaught += 1;

    // 3. Adiciona diretamente ao Aquário como Troféu Supremo do Bioma
    if (player.aquarium) {
      const alreadyInAquarium = player.aquarium.fish.some((f) => f.id === `trophy_${titan.id}`);
      if (!alreadyInAquarium) {
        player.aquarium.fish.push({
          id: `trophy_${titan.id}`,
          fishId: titan.id,
          name: titan.name,
          nickname: `${titan.title}`,
          rarity: 'legendary',
          weight: titan.weightKg,
          basePrice: titan.baseTrophyPrice,
          assetId: 'fish_catfish',
          addedAt: Date.now(),
        });
      }
    }

    // 4. Concede XP e moedas colossais
    this.playerManager.addXp(player, titan.baseXpReward);
    this.playerManager.addCoins(player, titan.baseTrophyPrice);
    this.playerManager.savePlayer(player);

    return R.success(
      'titan_captured',
      { titan, relic: titan.relic },
      'titans',
      `🏆 O lendário ${titan.name} foi domado e agora repousa como peça central do seu Viveiro!`,
    );
  }

  getTalentStatus(userId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return R.error('PLAYER_NOT_FOUND', 'Jogador não encontrado');
    const status = this.talentManager.getStatus(player);
    const resetCost = player.level <= 10 || player.coins < 100 ? 0 : 100;
    return R.success('talent_status', {
      ...status,
      resetCost,
      canResetFree: resetCost === 0,
    });
  }

  learnTalent(userId: string, talentId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return R.error('PLAYER_NOT_FOUND', 'Jogador não encontrado');
    return this.talentManager.learnTalent(player, talentId);
  }

  resetTalents(userId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return R.error('PLAYER_NOT_FOUND', 'Jogador não encontrado');
    return this.talentManager.resetTalents(player);
  }

  getDiscoveredFish(userId: string) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return {};
    return this.playerManager.getDiscoveredFish(player);
  }

  getDiscoveredFishIds(userId: string): string[] {
    const player = this.playerManager.getPlayer(userId);
    if (!player) return [];
    return this.playerManager.getDiscoveredFishIds(player);
  }

  exportSave(userId: string): { filename: string; json: string; summary: any } {
    const player = this.playerManager.getPlayer(userId);
    const allData = this.storage.getAllData();
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().slice(0, 10);
    const sanitizedName = (player?.name || 'pescador').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `pescaria_save_${sanitizedName}_${dateStr}.json`;

    const summary = {
      id: player?.id || userId,
      name: player?.name || 'Pescador',
      level: player?.level || 1,
      coins: player?.coins || 0,
      fishCaught: player?.stats?.totalFishCaught || 0,
      ascensionCount: player?.stats?.ascensionsCount || 0,
      cosmicScales: player?.cosmicScales || 0,
    };

    const savePayload = {
      game: 'pescaria-retro-game',
      version: 1,
      exportedAt: timestamp,
      playerSummary: summary,
      data: allData,
    };

    return {
      filename,
      json: JSON.stringify(savePayload, null, 2),
      summary,
    };
  }

  importSave(jsonContent: string, defaultUserId: string): R.GameResponse<PlayerProfile> {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        return R.error('INVALID_FORMAT', 'Arquivo de backup corrompido ou formato inválido.');
      }

      let storagePayload: Record<string, any> = {};

      if (parsed.data && typeof parsed.data === 'object') {
        storagePayload = parsed.data;
      } else if (parsed.id && parsed.level !== undefined) {
        // Suporte a save direto de perfil de jogador legado
        storagePayload = { [`player:${parsed.id}`]: parsed };
      } else {
        // Pode ser um dicionário direto de chaves
        storagePayload = parsed;
      }

      // Procura um player válido no storagePayload
      let foundPlayer: any = null;
      for (const [k, v] of Object.entries(storagePayload)) {
        if (k.startsWith('player:') && v && typeof v === 'object' && v.id) {
          foundPlayer = v;
          break;
        }
      }

      if (!foundPlayer) {
        return R.error('NO_PLAYER_FOUND', 'Nenhum perfil de pescador válido foi encontrado no arquivo.');
      }

      // Se o ID for diferente do defaultUserId, clona para o defaultUserId
      if (foundPlayer.id !== defaultUserId) {
        const adaptedPlayer = { ...foundPlayer, id: defaultUserId };
        storagePayload[`player:${defaultUserId}`] = adaptedPlayer;
      }

      this.storage.loadAllData(storagePayload);
      const restored = this.playerManager.getPlayer(defaultUserId);
      if (!restored) {
        return R.error('RESTORE_FAILED', 'Falha ao processar os dados do perfil.');
      }

      return R.success('save_imported', restored);
    } catch (err: any) {
      return R.error('PARSE_ERROR', `Erro ao decodificar JSON: ${err?.message || 'Arquivo inválido'}`);
    }
  }

  resetAllSaveData(): void {
    this.storage.clear();
  }
}
