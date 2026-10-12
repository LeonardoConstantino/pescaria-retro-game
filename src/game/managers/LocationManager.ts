// src/game/managers/LocationManager.ts
// ─────────────────────────────────────────────
// Gerencia consulta e troca de locais de pesca.
// ─────────────────────────────────────────────

import { LocationData, GameLocation } from '../data/locations.data.js';
import { PlayerProfile } from './PlayerManager.js';
import * as R from '../utils/response.builder.js';

export class LocationManager {
  getLocation(id: string): GameLocation | null {
    return LocationData.find((l) => l.id === id) || null;
  }

  getAllLocations(): GameLocation[] {
    return LocationData;
  }

  getAvailableLocations(playerLevel: number): GameLocation[] {
    return LocationData.filter((l) => l.requiredLevel <= playerLevel);
  }

  changeLocation(player: PlayerProfile, targetLocationId: string): R.GameResponse {
    const target = this.getLocation(targetLocationId);
    if (!target) {
      return R.error('INVALID_LOCATION', 'Local de pesca inexistente.', 'error_INVALID_LOCATION');
    }

    if (player.level < target.requiredLevel) {
      return R.error(
        'LOCATION_LOCKED',
        `Você precisa atingir o nível ${target.requiredLevel} para pescar em ${target.name}.`,
        'error_LOCATION_LOCKED',
      );
    }

    if (player.currentLocation === targetLocationId) {
      return R.error(
        'ALREADY_IN_LOCATION',
        `Você já está pescando em ${target.name}.`,
        'error_ALREADY_IN_LOCATION',
      );
    }

    player.currentLocation = targetLocationId;
    return R.success(
      'change_location',
      { location: target },
      target.assetId,
      `Você viajou para ${target.name}! Prepare sua vara e boas fisgadas!`,
    );
  }
}
