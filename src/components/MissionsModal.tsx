// src/components/MissionsModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal do Quadro de Missões Diárias & Encomendas da Peixaria
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Scroll,
  Clock,
  Coins,
  Sparkles,
  CheckCircle2,
  Gift,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { DailyMission } from '../game/data/missions.data.js';
import { MissionManager } from '../game/managers/MissionManager.js';
import { ItemData } from '../game/data/items.data.js';
import { GameAssetImage } from './GameAssetImage.js';
import { sound } from '../utils/audio.js';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  missionManager: MissionManager;
  onMissionClaimed: () => void;
  showToast: (message: string) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  missionManager,
  onMissionClaimed,
  showToast,
}) => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [canClaimChest, setCanClaimChest] = useState(false);
  const [isChestClaimed, setIsChestClaimed] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const loadData = () => {
    const daily = missionManager.getDailyMissions(userId);
    setMissions([...daily]);
    setCanClaimChest(missionManager.canClaimBonusChest(userId));
    setIsChestClaimed(missionManager.isBonusChestClaimed(userId));
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      sound.playSplash();
    }
  }, [isOpen]);

  // Temporizador para reset diário
  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const remaining = missionManager.getTimeUntilReset();
      setTimeRemaining({
        hours: remaining.hours,
        minutes: remaining.minutes,
        seconds: remaining.seconds,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const claimedCount = missions.filter((m) => m.isClaimed).length;
  const allMissionsClaimed = missions.length > 0 && missions.every((m) => m.isClaimed);

  const handleClaim = (mission: DailyMission) => {
    if (!mission.isCompleted || mission.isClaimed || claimingId) return;

    setClaimingId(mission.id);
    const res = missionManager.claimMission(userId, mission.id);

    if (res.ok) {
      sound.playCoins();
      showToast(res.message || `Encomenda resgatada! +${mission.reward.coins} 🪙`);
      loadData();
      onMissionClaimed();
    } else {
      showToast(res.message || 'Erro ao resgatar missão.');
    }
    setClaimingId(null);
  };

  const handleClaimGrandChest = () => {
    if (!canClaimChest || isChestClaimed || claimingId) return;

    setClaimingId('grand_chest');
    const res = missionManager.claimDailyBonusChest(userId);

    if (res.ok) {
      sound.playAchievement();
      showToast(res.message || '🎉 Grande Baú Diário Resgatado com Sucesso!');
      loadData();
      onMissionClaimed();
    } else {
      showToast(res.message || 'Não foi possível resgatar o Baú Diário.');
    }
    setClaimingId(null);
  };

  const getItemName = (itemId?: string) => {
    if (!itemId) return null;
    const found = ItemData.find((i) => i.id === itemId);
    return found ? found.name : itemId;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-700/80 shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Cabeçalho */}
          <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-md shadow-amber-950/50">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scroll className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  Quadro de Encomendas
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Diárias
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      Renovação em:{' '}
                      <span className="font-mono text-sky-300 font-semibold">
                        {String(timeRemaining.hours).padStart(2, '0')}h{' '}
                        {String(timeRemaining.minutes).padStart(2, '0')}m{' '}
                        {String(timeRemaining.seconds).padStart(2, '0')}s
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playSplash();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso Geral */}
          <div className="px-5 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Progresso de Hoje:</span>
              <span className="font-bold text-slate-100">
                {claimedCount} de {missions.length} entregues
              </span>
            </div>
            <div className="flex-1 max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${missions.length > 0 ? (claimedCount / missions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Lista de Missões */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1">
            {missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));
              const isReadyToClaim = mission.isCompleted && !mission.isClaimed;

              return (
                <div
                  key={mission.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    mission.isClaimed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : isReadyToClaim
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Informações da Missão */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
                        {mission.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100 truncate">
                            {mission.title}
                          </h3>
                          {mission.isClaimed && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Entregue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {mission.description}
                        </p>

                        {/* Barra de Progresso da Missão */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50">
                            <div
                              className={`h-full transition-all duration-500 ${
                                mission.isCompleted
                                  ? 'bg-emerald-400'
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-300 shrink-0">
                            {mission.current} / {mission.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Recompensas e Botão de Ação */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      {/* Recompensas Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {mission.reward.coins > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            +{mission.reward.coins}
                          </span>
                        )}
                        {mission.reward.xp > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                            🎓 +{mission.reward.xp} XP
                          </span>
                        )}
                        {mission.reward.baitId && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            🪱 {mission.reward.baitQuantity}x {getItemName(mission.reward.baitId)}
                          </span>
                        )}
                      </div>

                      {/* Botão de Resgate ou Estado */}
                      <div>
                        {mission.isClaimed ? (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-800/40 text-slate-500 text-xs font-semibold flex items-center gap-1 cursor-default">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resgatado</span>
                          </div>
                        ) : isReadyToClaim ? (
                          <button
                            onClick={() => handleClaim(mission)}
                            disabled={claimingId === mission.id}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/30 flex items-center gap-1 animate-pulse"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            <span>Resgatar!</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-400 text-xs font-semibold cursor-default">
                            Em Progresso ({progressPct}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── GRANDE BAÚ DIÁRIO DO PESCADOR MESTRE ── */}
            <div
              className={`mt-4 p-4 rounded-2xl border transition-all duration-300 ${
                isChestClaimed
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-70'
                  : canClaimChest
                  ? 'bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900 border-amber-400/80 shadow-xl shadow-amber-950/50 ring-2 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-purple-600 p-0.5 shadow-lg shadow-amber-950/60 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                      🎁
                    </div>
                    {canClaimChest && !isChestClaimed && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                        Grande Baú da Guilda
                        <Flame className="w-4 h-4 text-amber-400" />
                      </h4>
                      {isChestClaimed ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                          Aberto Hoje ✓
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                          Bônus Completo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isChestClaimed
                        ? 'Você já abriu o baú de hoje! Novos suprimentos chegam após a meia-noite.'
                        : canClaimChest
                        ? 'Todas as 4 encomendas entregues! Abra o baú e receba as maiores recompensas do dia!'
                        : `Entregue as ${missions.length} encomendas de hoje para destravar o Grande Baú.`}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end">
                  {isChestClaimed ? (
                    <div className="px-4 py-2 rounded-xl bg-slate-800/40 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-default">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Coletado</span>
                    </div>
                  ) : canClaimChest ? (
                    <button
                      onClick={handleClaimGrandChest}
                      disabled={claimingId === 'grand_chest'}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/40 flex items-center justify-center gap-2 animate-bounce"
                    >
                      <Gift className="w-4 h-4" />
                      <span>ABRIR GRANDE BAÚ!</span>
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-semibold text-center cursor-default">
                      🔒 Bloqueado ({claimedCount}/{missions.length})
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé Informativo */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Encomendas renovadas automaticamente todos os dias às 00:00.
            </span>
            <button
              onClick={() => {
                sound.playSplash();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
