// src/game/managers/FishingEngine.ts
// ─────────────────────────────────────────────
// Motor central da mecânica de pesca.
// ─────────────────────────────────────────────

import { GameConfig } from '../data/game.config.js';
import { ItemData, GameItem } from '../data/items.data.js';
import { LocationData, GameLocation } from '../data/locations.data.js';
import { GameFish } from '../data/fish.data.js';
import { PlayerManager, PlayerProfile } from './PlayerManager.js';
import { SessionManager, FishingSession } from './SessionManager.js';
import { LocationManager } from './LocationManager.js';
import { EventEngine } from './EventEngine.js';
import * as Randomizer from '../utils/randomizer.js';
import * as R from '../utils/response.builder.js';

export interface FishingCollectResult {
  empty: boolean;
  fish: (GameFish & { weight: number }) | null;
  bonusFish: (GameFish & { weight: number }) | null;
  event: any | null;
  eventDetails: any | null;
  xpEarned: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  inventoryFull: boolean;
  rod: GameItem | null;
  bait: GameItem | null;
  location: GameLocation;
  player: PlayerProfile;
}

export class FishingEngine {
  private playerManager: PlayerManager;
  private sessionManager: SessionManager;
  private locationManager: LocationManager;
  private eventEngine: EventEngine;

  constructor(
    playerManager: PlayerManager,
    sessionManager: SessionManager,
    locationManager: LocationManager,
    eventEngine: EventEngine,
  ) {
    this.playerManager = playerManager;
    this.sessionManager = sessionManager;
    this.locationManager = locationManager;
    this.eventEngine = eventEngine;
  }

  private getItem(itemId: string | null): GameItem | null {
    if (!itemId) return null;
    return ItemData.find((i) => i.id === itemId) || null;
  }

  castLine(chatId: string, userId: string): R.GameResponse {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.', 'error_PLAYER_NOT_FOUND');
    }

    // 1. Verifica se já está pescando
    const activeSession = this.sessionManager.getSession(chatId, userId);
    if (activeSession) {
      if (this.sessionManager.isReady(activeSession)) {
        return R.error(
          'FISHING_READY',
          'Sua linha já foi puxada e um peixe está mordendo! Puxe a vara agora!',
          'action_ready',
        );
      }
      const remainingMs = this.sessionManager.getRemainingWait(activeSession);
      return R.error(
        'FISHING_IN_PROGRESS',
        `Aguarde mais ${Math.ceil(remainingMs / 1000)}s antes de recolher.`,
        'action_pending',
      );
    }

    // 2. Cooldown
    const rod = this.getItem(player.equipment.rod);
    const bait = this.getItem(player.equipment.bait);

    let cooldown = GameConfig.fishing.cooldownMs;
    if (rod?.modifiers.cooldownModifier) {
      cooldown += rod.modifiers.cooldownModifier;
    }
    if (player.boosts.cooldown) {
      cooldown += player.boosts.cooldown.value;
    }
    cooldown = Math.max(1000, cooldown); // mínimo 1s

    if (player.lastFishedAt) {
      const elapsed = Date.now() - player.lastFishedAt;
      if (elapsed < cooldown) {
        const waitSec = Math.ceil((cooldown - elapsed) / 1000);
        return R.error(
          'COOLDOWN',
          `Descanse um instante! Você poderá lançar a linha novamente em ${waitSec}s.`,
          'error_COOLDOWN',
        );
      }
    }

    // 3. Localização
    const location = this.locationManager.getLocation(player.currentLocation) || LocationData[0];

    // 4. Modificadores
    const emptyMod =
      (location.emptyChanceModifier || 0) +
      (rod?.modifiers.emptyChanceModifier || 0) +
      (bait?.modifiers.emptyChanceModifier || 0);

    const eventMod =
      (location.eventChanceModifier || 0) +
      (rod?.modifiers.eventChanceModifier || 0);

    // Merge rarity modifiers
    const rarityMod: Record<string, number> = { ...location.rarityModifier };
    if (rod?.modifiers.rarityModifier) {
      for (const [k, v] of Object.entries(rod.modifiers.rarityModifier)) {
        rarityMod[k] = (rarityMod[k] || 0) + v;
      }
    }
    if (bait?.modifiers.rarityModifier) {
      for (const [k, v] of Object.entries(bait.modifiers.rarityModifier)) {
        rarityMod[k] = (rarityMod[k] || 0) + v;
      }
    }

    // Player boost
    const playerBoost: Record<string, number> = {};
    if (player.boosts.rarity) {
      playerBoost[player.boosts.rarity.rarity] = player.boosts.rarity.value;
    }

    // Consome isca se houver
    const consumedBait = this.playerManager.consumeBait(player);

    // 5. Sorteios
    const waitMs = Randomizer.rollWaitTime();
    const isEmpty = Randomizer.rollEmpty({ locationModifier: emptyMod });
    const fish = isEmpty
      ? null
      : Randomizer.rollFish({
          location,
          rarityModifier: rarityMod,
          playerBoost,
        });

    const event = Randomizer.rollEvent({
      locationId: location.id,
      locationModifier: eventMod,
    });

    let bonusFish: (GameFish & { weight: number }) | null = null;
    if (event && event.effect.bonusFish) {
      bonusFish = Randomizer.rollFish({
        location,
        rarityModifier: rarityMod,
        playerBoost,
      });
    }

    // 6. Cria a sessão
    this.sessionManager.createSession(chatId, userId, {
      waitMs,
      readyAt: Date.now() + waitMs,
      locationId: location.id,
      result: {
        empty: isEmpty,
        fish,
        event,
        chainEvent: null,
        bonusFish,
      },
    });

    return R.pending(
      'fish_cast',
      waitMs,
      location.assetId,
      `Linha lançada no ${location.name}! A boia está flutuando nas águas... fique atento aos movimentos!`,
      {
        location,
        rod,
        bait: consumedBait ? bait : null,
      },
    );
  }

  collect(
    chatId: string,
    userId: string,
    options?: { isPerfect?: boolean },
  ): R.GameResponse<FishingCollectResult | null> {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      return R.error('PLAYER_NOT_FOUND', 'Pescador não encontrado.', 'error_PLAYER_NOT_FOUND');
    }

    const session = this.sessionManager.getSession(chatId, userId);
    if (!session) {
      return R.error(
        'NO_ACTIVE_SESSION',
        'Você não tem nenhuma linha na água! Lance a linha primeiro.',
        'error_NO_ACTIVE_SESSION',
      );
    }

    if (!this.sessionManager.isReady(session)) {
      const remainingMs = this.sessionManager.getRemainingWait(session);
      const remainingSec = (remainingMs / 1000).toFixed(1);
      return R.error(
        'FISHING_IN_PROGRESS',
        `Ainda não! A boia mal balançou. Aguarde mais ${remainingSec}s para puxar no momento certo!`,
        'action_pending',
      );
    }

    const { empty, fish, event, bonusFish } = session.result;
    const rod = this.getItem(player.equipment.rod);
    const bait = this.getItem(player.equipment.bait);
    const location = this.locationManager.getLocation(session.locationId) || LocationData[0];

    // Bônus de Fisgada Perfeita (Quick-Time sweet spot hit: +25% de peso)
    if (options?.isPerfect && fish) {
      fish.weight = Number((fish.weight * 1.25).toFixed(2));
    }

    // Processa evento se houver
    let eventDetails: any = null;
    let fishLost = false;

    if (event) {
      eventDetails = this.eventEngine.processEvent(event, player, fish);
      if (eventDetails.appliedEffects.fishLost) {
        fishLost = true;
      }
    }

    let xpGained = 0;
    let inventoryFull = false;
    let actualCaughtFish: (GameFish & { weight: number }) | null = null;
    let actualBonusFish: (GameFish & { weight: number }) | null = null;

    if (!empty && !fishLost && fish) {
      const addResult = this.playerManager.addFish(player, fish);
      if (addResult.added) {
        actualCaughtFish = fish;
        const rodMult = rod?.modifiers.xpMultiplier || 1.0;
        xpGained += Math.round(fish.xpReward * rodMult);
      } else {
        inventoryFull = true;
      }

      if (bonusFish && !inventoryFull) {
        const bonusAdd = this.playerManager.addFish(player, bonusFish);
        if (bonusAdd.added) {
          actualBonusFish = bonusFish;
          xpGained += Math.round(bonusFish.xpReward * (rod?.modifiers.xpMultiplier || 1.0));
        }
      }
    } else if (empty && !event) {
      xpGained += 5; // XP de consolação por tentar
    }

    // Aplica XP ganho
    const xpResult = this.playerManager.addXp(player, xpGained);

    // Decrementa contadores de boosts
    this.playerManager.decrementBoosts(player);

    // Registra horário da pescaria
    player.lastFishedAt = Date.now();
    this.playerManager.savePlayer(player);

    // Remove sessão
    this.sessionManager.deleteSession(chatId, userId);

    const assetId = actualCaughtFish
      ? actualCaughtFish.assetId
      : event
      ? event.assetId
      : 'action_empty';

    let message = '';
    if (actualCaughtFish) {
      message = `Incrível! Você fisgou um lindo ${actualCaughtFish.name} de ${actualCaughtFish.weight} kg!`;
      if (actualBonusFish) {
        message += ` E ainda veio um ${actualBonusFish.name} de bônus!`;
      }
    } else if (fishLost) {
      message = 'Que pena! O peixe acabou escapando durante o evento!';
    } else if (empty) {
      message = 'Nada fisgou desta vez... Apenas algumas algas no anzol. Tente novamente!';
    }

    return R.success(
      'fish_collect',
      {
        empty: !actualCaughtFish,
        fish: actualCaughtFish,
        bonusFish: actualBonusFish,
        event,
        eventDetails,
        xpEarned: xpGained,
        leveledUp: xpResult.leveledUp,
        oldLevel: xpResult.oldLevel,
        newLevel: xpResult.newLevel,
        inventoryFull,
        rod,
        bait,
        location,
        player,
      },
      assetId,
      message,
    );
  }
}
