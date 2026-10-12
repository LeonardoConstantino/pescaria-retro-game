// src/game/managers/SessionManager.ts
// ─────────────────────────────────────────────
// Gerencia as sessões ativas de pescaria
// (lançamento da linha, tempo de espera e coleta).
// ─────────────────────────────────────────────

import { GameConfig } from '../data/game.config.js';
import { GameFish } from '../data/fish.data.js';
import { GameEvent } from '../data/events.data.js';

export interface FishingSession {
  chatId: string;
  userId: string;
  startedAt: number;
  waitMs: number;
  readyAt: number;
  expiresAt: number;
  locationId: string;
  result: {
    empty: boolean;
    fish: (GameFish & { weight: number }) | null;
    event: GameEvent | null;
    chainEvent: GameEvent | null;
    bonusFish: (GameFish & { weight: number }) | null;
  };
}

export class SessionManager {
  private storage: Map<string, any>;

  constructor(storage: Map<string, any>) {
    this.storage = storage;
  }

  private sessionKey(chatId: string, userId: string): string {
    return `session:${chatId}:${userId}`;
  }

  createSession(
    chatId: string,
    userId: string,
    data: Omit<FishingSession, 'chatId' | 'userId' | 'startedAt' | 'expiresAt'>,
  ): FishingSession {
    const now = Date.now();
    const session: FishingSession = {
      chatId,
      userId,
      startedAt: now,
      expiresAt: now + GameConfig.fishing.expireMs,
      ...data,
    };
    this.storage.set(this.sessionKey(chatId, userId), session);
    return session;
  }

  getSession(chatId: string, userId: string): FishingSession | null {
    const session = this.storage.get(this.sessionKey(chatId, userId)) as FishingSession | undefined;
    if (!session) return null;

    if (this.isExpired(session)) {
      this.deleteSession(chatId, userId);
      return null;
    }
    return session;
  }

  deleteSession(chatId: string, userId: string): boolean {
    return this.storage.delete(this.sessionKey(chatId, userId));
  }

  isReady(session: FishingSession): boolean {
    return Date.now() >= session.readyAt;
  }

  isExpired(session: FishingSession): boolean {
    return Date.now() >= session.expiresAt;
  }

  getRemainingWait(session: FishingSession): number {
    return Math.max(0, session.readyAt - Date.now());
  }
}
