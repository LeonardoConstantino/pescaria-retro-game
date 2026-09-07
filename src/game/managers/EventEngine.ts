// src/game/managers/EventEngine.ts
// ─────────────────────────────────────────────
// Motor de resolução e aplicação de eventos.
// ─────────────────────────────────────────────

import { GameEvent } from '../data/events.data.js';
import { PlayerProfile, PlayerManager } from './PlayerManager.js';
import { GameFish } from '../data/fish.data.js';
import * as Randomizer from '../utils/randomizer.js';

export interface EventResult {
  event: GameEvent;
  appliedEffects: {
    coinsAwarded?: number;
    xpAwarded?: number;
    fishLost?: boolean;
    itemGiven?: string;
    boostAdded?: string;
  };
  chainEvent?: GameEvent | null;
}

export class EventEngine {
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  processEvent(
    event: GameEvent,
    player: PlayerProfile,
    caughtFish: (GameFish & { weight: number }) | null,
  ): EventResult {
    const applied: EventResult['appliedEffects'] = {};
    const effect = event.effect;

    player.stats.totalEvents += 1;

    // 1. Moedas
    if (effect.coins && effect.coins > 0) {
      this.playerManager.addCoins(player, effect.coins);
      applied.coinsAwarded = effect.coins;
    }

    // 2. XP
    if (effect.xp && effect.xp > 0) {
      this.playerManager.addXp(player, effect.xp);
      applied.xpAwarded = effect.xp;
    }

    // 3. Perda de peixe
    if (effect.lostFish) {
      applied.fishLost = true;
    }

    // 4. Ganho de item
    if (effect.giveItem) {
      player.inventory.items[effect.giveItem] = (player.inventory.items[effect.giveItem] || 0) + 1;
      applied.itemGiven = effect.giveItem;
    }

    // 5. Boost de Raridade
    if (effect.boostRarity) {
      player.boosts.rarity = {
        rarity: effect.boostRarity.rarity,
        value: effect.boostRarity.value,
        remaining: effect.boostRarity.durationPescarias,
      };
      applied.boostAdded = `Boost de ${effect.boostRarity.rarity} por ${effect.boostRarity.durationPescarias} pescarias`;
    }

    // 6. Boost de Cooldown
    if (effect.boostCooldown) {
      player.boosts.cooldown = {
        value: effect.boostCooldown.value,
        remaining: effect.boostCooldown.durationPescarias,
      };
    }

    // 7. Eventos encadeados
    let chainEvent: GameEvent | null = null;
    if (event.chain && event.chain.length > 0) {
      chainEvent = Randomizer.rollChainEvent(event.chain);
      if (chainEvent) {
        if (chainEvent.effect.lostFish) applied.fishLost = true;
        if (chainEvent.effect.coins) {
          this.playerManager.addCoins(player, chainEvent.effect.coins);
          applied.coinsAwarded = (applied.coinsAwarded || 0) + chainEvent.effect.coins;
        }
      }
    }

    this.playerManager.savePlayer(player);

    return {
      event,
      appliedEffects: applied,
      chainEvent,
    };
  }
}
