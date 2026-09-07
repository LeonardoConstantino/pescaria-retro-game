// src/game/utils/response.builder.ts
// ─────────────────────────────────────────────
// Construtor padronizado de respostas do jogo.
// ─────────────────────────────────────────────

export interface GameResponse<T = any> {
  ok: boolean;
  action: string;
  status: 'success' | 'error' | 'pending';
  code?: string;
  message: string;
  assetId: string;
  data: T;
}

export function success<T = any>(
  action: string,
  data: T,
  assetId = 'action_success',
  message = 'Ação realizada com sucesso.',
): GameResponse<T> {
  return {
    ok: true,
    action,
    status: 'success',
    assetId,
    message,
    data,
  };
}

export function error(
  code: string,
  message: string,
  assetId?: string,
): GameResponse<null> {
  const resolvedAssetId = assetId ?? `error_${code}`;
  return {
    ok: false,
    action: 'error',
    status: 'error',
    code,
    assetId: resolvedAssetId,
    message,
    data: null,
  };
}

export function pending<T = any>(
  action: string,
  waitMs: number,
  assetId = 'action_pending',
  message = 'Aguardando o momento certo...',
  extraData?: T,
): GameResponse<{ waitMs: number; readyAt: number; [key: string]: any }> {
  return {
    ok: true,
    action,
    status: 'pending',
    assetId,
    message,
    data: {
      waitMs,
      readyAt: Date.now() + waitMs,
      ...(extraData || {}),
    },
  };
}
