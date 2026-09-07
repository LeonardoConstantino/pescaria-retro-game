// src/game/utils/randomizer.ts
// ─────────────────────────────────────────────
// Responsável por todos os sorteios do jogo.
// Centralizar aqui garante que a lógica de
// aleatoriedade seja fácil de testar e ajustar.
// ─────────────────────────────────────────────

import { GameConfig } from '../data/game.config.js';
import { FishData, GameFish } from '../data/fish.data.js';
import { EventData, GameEvent } from '../data/events.data.js';
import { GameLocation } from '../data/locations.data.js';

// ─────────────────────────────────────────────
// Sorteia um item de um array com base em pesos.
// Cada item deve ter uma propriedade `weight`.
// ─────────────────────────────────────────────
export function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  if (!items || items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }

  // fallback de segurança
  return items[items.length - 1];
}

// ─────────────────────────────────────────────
// Sorteia uma raridade levando em conta:
//  - pesos base do GameConfig
//  - modificadores do local (location)
//  - modificadores do equipamento (item)
//  - boost temporário do jogador (playerBoost)
// ─────────────────────────────────────────────
export function rollRarity({
  locationModifier = {},
  itemModifier = {},
  playerBoost = {},
}: {
  locationModifier?: Record<string, number>;
  itemModifier?: Record<string, number>;
  playerBoost?: Record<string, number>;
} = {}): string {
  const baseRarities = GameConfig.rarity;

  const rarityPool = Object.entries(baseRarities).map(([key, config]) => ({
    id: key,
    weight: Math.max(
      0, // peso nunca negativo
      config.weight +
        (locationModifier[key] ?? 0) +
        (itemModifier[key] ?? 0) +
        (playerBoost[key] ?? 0),
    ),
  }));

  return weightedRandom(rarityPool)?.id ?? 'common';
}

// ─────────────────────────────────────────────
// Sorteia um peixe dentro de um local,
// filtrando pelo pool do local e pela raridade
// sorteada. Retorna o objeto completo do peixe
// com o peso gerado aleatoriamente.
// ─────────────────────────────────────────────
export function rollFish({
  location,
  rarityModifier = {},
  itemModifier = {},
  playerBoost = {},
}: {
  location: GameLocation;
  rarityModifier?: Record<string, number>;
  itemModifier?: Record<string, number>;
  playerBoost?: Record<string, number>;
}): (GameFish & { weight: number }) | null {
  // 1. Sorteia a raridade considerando todos os modificadores
  const rarity = rollRarity({
    locationModifier: rarityModifier,
    itemModifier,
    playerBoost,
  });

  // 2. Filtra peixes do pool do local com a raridade sorteada
  const eligible = FishData.filter(
    (fish) => fish.rarity === rarity && location.fishPool.includes(fish.id),
  );

  // 3. Se não houver peixe elegível nessa raridade, tenta raridade abaixo
  if (eligible.length === 0) {
    const fallback = FishData.filter(
      (fish) => fish.rarity === 'common' && location.fishPool.includes(fish.id),
    );
    if (fallback.length === 0) return null;
    const fish = fallback[Math.floor(Math.random() * fallback.length)];
    return { ...fish, weight: rollWeight(fish) };
  }

  // 4. Escolhe aleatoriamente entre os elegíveis (mesma raridade = mesmo peso)
  const fish = eligible[Math.floor(Math.random() * eligible.length)];
  return { ...fish, weight: rollWeight(fish) };
}

// ─────────────────────────────────────────────
// Gera um peso aleatório para o peixe
// entre minWeight e maxWeight (em kg).
// ─────────────────────────────────────────────
export function rollWeight(fish: GameFish): number {
  const min = fish.minWeight;
  const max = fish.maxWeight;
  const raw = Math.random() * (max - min) + min;
  return Math.round(raw * 100) / 100; // 2 casas decimais
}

// ─────────────────────────────────────────────
// Decide se a pescaria resultará em falha
// (sem peixe) com base nos modificadores.
// Retorna true se não pegou nada.
// ─────────────────────────────────────────────
export function rollEmpty({
  locationModifier = 0,
  itemModifier = 0,
}: { locationModifier?: number; itemModifier?: number } = {}): boolean {
  const chance = Math.max(
    0,
    GameConfig.emptyChance + locationModifier + itemModifier,
  );
  return Math.random() < chance;
}

// ─────────────────────────────────────────────
// Decide se um evento vai ocorrer nessa pesca
// e sorteia qual evento, filtrando por local.
// Retorna o objeto do evento ou null.
// ─────────────────────────────────────────────
export function rollEvent({
  locationId,
  locationModifier = 0,
  itemModifier = 0,
}: {
  locationId: string;
  locationModifier?: number;
  itemModifier?: number;
}): GameEvent | null {
  const chance = Math.min(
    1,
    Math.max(0, GameConfig.eventChance + locationModifier + itemModifier),
  );

  // Decide se haverá evento
  if (Math.random() >= chance) return null;

  // Filtra eventos aplicáveis ao local (null = todos)
  const eligible = EventData.filter(
    (e) =>
      e.weight > 0 &&
      (e.locations === null || e.locations.includes(locationId)),
  );

  if (eligible.length === 0) return null;
  return weightedRandom(eligible);
}

// ─────────────────────────────────────────────
// Sorteia um evento encadeado (chain).
// Recebe o array de IDs de eventos encadeados.
// Retorna o objeto do evento sorteado ou null.
// ─────────────────────────────────────────────
export function rollChainEvent(chainIds?: string[]): GameEvent | null {
  if (!chainIds || chainIds.length === 0) return null;

  // Chance fixa de 40% de o chain disparar
  if (Math.random() > 0.4) return null;

  const eligible = EventData.filter((e) => chainIds.includes(e.id));
  if (eligible.length === 0) return null;

  // Todos os chains têm peso igual entre si
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// ─────────────────────────────────────────────
// Gera o tempo de espera da pescaria em ms,
// dentro do intervalo definido no GameConfig.
// ─────────────────────────────────────────────
export function rollWaitTime(): number {
  const { minWaitMs, maxWaitMs } = GameConfig.fishing;
  return Math.floor(Math.random() * (maxWaitMs - minWaitMs) + minWaitMs);
}

// ─────────────────────────────────────────────
// Utilitário genérico: número inteiro entre
// min e max (inclusive).
// ─────────────────────────────────────────────
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
