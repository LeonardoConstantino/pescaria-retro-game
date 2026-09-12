// src/components/TalentModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal da Árvore de Maestria & Talentos do Pescador
// Permite investir pontos ganhos por nível nos 3 ramos:
// Angler (Pesca ativa), Tycoon (Economia), Mystic (XP & Automação).
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Zap,
  Anchor,
  Eye,
  Timer,
  Shield,
  Sparkles,
  Coins,
  PackageCheck,
  DollarSign,
  TrendingUp,
  Tag,
  Crown,
  Droplets,
  Users,
  CloudRain,
  Radio,
  Sparkle,
  X,
  RotateCcw,
  Lock,
  Check,
  ChevronRight,
  Flame,
  Award,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { FishingGame } from '../game/FishingGame.js';
import {
  TalentBranchId,
  TALENT_BRANCHES,
  TALENTS_DATA,
  TalentDefinition,
} from '../game/data/talents.data.js';
import { TalentTreeStatus } from '../game/managers/TalentManager.js';
import { sound } from '../utils/audio.js';

export interface FullTalentStatus extends TalentTreeStatus {
  resetCost: number;
  canResetFree: boolean;
}

interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: FishingGame;
  userId: string;
  onTalentChanged?: () => void;
}

// Mapeador de ícones Lucide para os nós de talento
const renderTalentIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Zap':
      return <Zap className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Timer':
      return <Timer className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'PackageCheck':
      return <PackageCheck className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Tag':
      return <Tag className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Sparkle':
      return <Sparkle className={className} />;
    default:
      return <Award className={className} />;
  }
};

export const TalentModal: React.FC<TalentModalProps> = ({
  isOpen,
  onClose,
  game,
  userId,
  onTalentChanged,
}) => {
  const [activeBranch, setActiveBranch] = useState<TalentBranchId>('angler');
  const getLatestStatus = useCallback((): FullTalentStatus | null => {
    const res = game.getTalentStatus(userId);
    return res.ok && res.data ? (res.data as FullTalentStatus) : null;
  }, [game, userId]);

  const [statusState, setStatusState] = useState<FullTalentStatus | null>(getLatestStatus);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Recarrega status dos talentos
  const refreshStatus = useCallback(() => {
    const latest = getLatestStatus();
    if (latest) {
      setStatusState(latest);
    }
  }, [getLatestStatus]);

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      setShowResetConfirm(false);
      setNotification(null);
    }
  }, [isOpen, refreshStatus]);

  // Mensagem temporária
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3200);
  };

  // Investir 1 ponto em um talento
  const handleLearnTalent = (talent: TalentDefinition) => {
    const res = game.learnTalent(userId, talent.id);
    if (res.ok) {
      if (talent.tier === 4) {
        sound.playPerfectCounter();
      } else {
        sound.playLevelUp();
      }
      showToast(res.message, 'success');
      refreshStatus();
      onTalentChanged?.();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Resetar talentos
  const handleResetTalents = () => {
    const res = game.resetTalents(userId);
    if (res.ok) {
      sound.playCoins();
      showToast(res.message, 'success');
      setShowResetConfirm(false);
      refreshStatus();
      onTalentChanged?.();
    } else {
      showToast(res.message, 'error');
    }
  };

  const branchConfig = useMemo(() => {
    return TALENT_BRANCHES.find((b) => b.id === activeBranch) || TALENT_BRANCHES[0];
  }, [activeBranch]);

  const branchTalents = useMemo(() => {
    return TALENTS_DATA.filter((t) => t.branch === activeBranch);
  }, [activeBranch]);

  // Agrupa os talentos por Tier
  const talentsByTier = useMemo(() => {
    const tiers: Record<number, TalentDefinition[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const t of branchTalents) {
      tiers[t.tier].push(t);
    }
    return tiers;
  }, [branchTalents]);

  if (!isOpen) return null;

  const status = statusState || getLatestStatus();
  if (!status) return null;

  const currentBranchPoints = status.branchPoints[activeBranch] || 0;
  const player = game.getPlayer(userId);

  return (
    <AnimatePresence>
      <motion.div
        id="talent-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          id="talent-modal-container"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-[96vw] sm:w-full max-w-4xl max-h-[88vh] flex flex-col bg-slate-900/95 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOPO: Cabeçalho com Título, Pontos & Ações */}
          <div className="relative px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-400 p-0.5 shadow-lg shadow-sky-500/10 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-300">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-bold text-white tracking-wide">
                    Árvore de Maestria
                  </h2>
                  <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded bg-slate-700 text-slate-300 border border-slate-600">
                    Nv. {player?.level || 1}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                  Invista pontos para forjar bônus permanentes e habilidades.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Pílula de Pontos Disponíveis */}
              <div
                className={`px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold border transition-all ${
                  status.availablePoints > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span>
                  {status.availablePoints}{' '}
                  <span className="font-normal text-[11px] sm:text-xs opacity-80">
                    {status.availablePoints === 1 ? 'Ponto' : 'Pontos'}
                  </span>
                </span>
              </div>

              {/* Botão de Redefinir */}
              <button
                id="talent-reset-button"
                onClick={() => setShowResetConfirm(true)}
                disabled={status.spentPoints === 0}
                title="Redefinir todos os pontos de talentos"
                className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 border transition-colors touch-manipulation ${
                  status.spentPoints > 0
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600'
                    : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Redefinir</span>
              </button>

              {/* Botão Fechar */}
              <button
                id="talent-close-button"
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-0.5 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NOTIFICAÇÃO TOAST */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
                  notification.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800/50'
                    : 'bg-rose-950/80 text-rose-200 border-rose-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{notification.text}</span>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONFIRMAÇÃO DE REDEFINIÇÃO */}
          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/95 border-b border-amber-500/40 px-4 py-3 text-xs sm:text-sm text-slate-200 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>
                    Deseja redefinir todos os {status.spentPoints} pontos investidos?{' '}
                    <span className="text-amber-300 font-bold">
                      {status.canResetFree ? 'Primeira redefinição GRÁTIS!' : `Custo: 🪙 ${status.resetCost} moedas`}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    id="talent-confirm-reset-button"
                    onClick={handleResetTalents}
                    className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow"
                  >
                    Confirmar Redefinição
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SELETOR DE RAMOS (ABAS) */}
          <div className="bg-slate-950/60 px-4 pt-3 pb-0 border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
            {TALENT_BRANCHES.map((b) => {
              const isSelected = b.id === activeBranch;
              const pointsInBranch = status.branchPoints[b.id] || 0;
              return (
                <button
                  key={b.id}
                  id={`talent-tab-${b.id}`}
                  onClick={() => {
                    sound.playWaterClick(false);
                    setActiveBranch(b.id);
                  }}
                  className={`relative px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap border-t border-x touch-manipulation ${
                    isSelected
                      ? `bg-slate-900 ${b.colorTheme.border} ${b.colorTheme.text} shadow-lg`
                      : 'bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {b.id === 'angler' && <Anchor className="w-4 h-4" />}
                    {b.id === 'tycoon' && <Coins className="w-4 h-4" />}
                    {b.id === 'mystic' && <Sparkles className="w-4 h-4" />}
                    <span>{b.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-extrabold ${
                      pointsInBranch > 0
                        ? b.colorTheme.badgeBg
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {pointsInBranch} pts
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-talent-tab"
                      className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* CORPO DO MODAL (SCROLLÁVEL NO MOBILE E DESKTOP) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Banner Descritivo do Ramo Ativo */}
            <div
              className={`p-4 rounded-xl border bg-gradient-to-r ${branchConfig.colorTheme.bg} ${branchConfig.colorTheme.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base ${branchConfig.colorTheme.text}`}>
                    {branchConfig.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                    {branchConfig.tagline}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {branchConfig.description}
                </p>
              </div>

              {/* Medidor de Tier do Ramo */}
              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-700 text-xs shrink-0">
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Investido neste Ramo
                  </div>
                  <div className="font-extrabold text-white text-sm">
                    {currentBranchPoints} Pontos
                  </div>
                </div>
                <div className="w-px h-7 bg-slate-700 mx-1" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={currentBranchPoints >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      Tier 2 (3 pts)
                    </span>
                    {currentBranchPoints >= 3 && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={currentBranchPoints >= 8 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      Keystone (8 pts)
                    </span>
                    {currentBranchPoints >= 8 && <Crown className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE TALENTOS ORGANIZADOS POR TIER */}
            {[1, 2, 3, 4].map((tierNum) => {
              const tierTalents = talentsByTier[tierNum] || [];
              if (tierTalents.length === 0) return null;

              const reqPoints = tierTalents[0].requiredBranchPoints;
              const isTierUnlocked = currentBranchPoints >= reqPoints;

              return (
                <div key={tierNum} className="space-y-3">
                  {/* Título do Tier */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {tierNum === 4 ? (
                        <>
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300">Tier 4 • Keystone Mestre Lendário</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 text-sky-400" />
                          <span>Tier {tierNum}</span>
                        </>
                      )}
                    </div>
                    <div className="h-px flex-1 bg-slate-800" />
                    {!isTierUnlocked && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Requer {reqPoints} pts no ramo (você tem {currentBranchPoints})
                      </span>
                    )}
                  </div>

                  {/* Grid de Talentos do Tier */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tierTalents.map((talent) => {
                      const currentRank = status.invested[talent.id] || 0;
                      const isMaxed = currentRank >= talent.maxRank;
                      const hasBranchPoints = currentBranchPoints >= talent.requiredBranchPoints;
                      const hasPrereq = !talent.prerequisiteTalentId || (status.invested[talent.prerequisiteTalentId] || 0) > 0;
                      const canLearn = !isMaxed && hasBranchPoints && hasPrereq && status.availablePoints > 0;
                      const isLocked = !hasBranchPoints || !hasPrereq;

                      const nextRank = currentRank + 1;
                      const isKeystone = talent.tier === 4;

                      return (
                        <div
                          key={talent.id}
                          id={`talent-card-${talent.id}`}
                          className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            isKeystone
                              ? currentRank > 0
                                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/10'
                                : 'bg-slate-900/80 border-amber-500/30'
                              : currentRank > 0
                              ? 'bg-slate-900/90 border-sky-500/40 shadow-sm'
                              : isLocked
                              ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                              : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            {/* Linha superior: Ícone, Nome, Rank */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform ${
                                    isKeystone
                                      ? currentRank > 0
                                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40'
                                        : 'bg-amber-950/60 text-amber-400 border-amber-700/60'
                                      : currentRank > 0
                                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                                      : isLocked
                                      ? 'bg-slate-800 text-slate-500 border-slate-700'
                                      : 'bg-slate-800 text-slate-300 border-slate-600'
                                  }`}
                                >
                                  {renderTalentIcon(talent.icon, isKeystone ? 'w-6 h-6' : 'w-5 h-5')}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm sm:text-base text-white">
                                      {talent.name}
                                    </h4>
                                    {isKeystone && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        Keystone
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                    {talent.description}
                                  </p>
                                </div>
                              </div>

                              {/* Pips de Nível / Rank */}
                              <div className="flex flex-col items-end shrink-0">
                                <div className="text-xs font-bold text-slate-300 mb-1">
                                  {currentRank}/{talent.maxRank}
                                </div>
                                <div className="flex gap-1">
                                  {Array.from({ length: talent.maxRank }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-2 rounded-sm transition-all ${
                                        i < currentRank
                                          ? isKeystone
                                            ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                                            : 'bg-sky-400 shadow-sm shadow-sky-400/50'
                                          : 'bg-slate-800 border border-slate-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Descrição dos Efeitos */}
                            <div className="mt-3.5 space-y-1.5 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                              {currentRank > 0 ? (
                                <div className="text-emerald-300 flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Efeito Atual:</strong> {talent.effectDescription(currentRank)}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-slate-400 flex items-start gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Nível 1:</strong> {talent.effectDescription(1)}
                                  </span>
                                </div>
                              )}

                              {!isMaxed && currentRank > 0 && (
                                <div className="text-sky-300/90 flex items-start gap-1.5 pt-1 border-t border-slate-800">
                                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Próximo Nível:</strong> {talent.effectDescription(nextRank)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rodapé do Card: Requisitos e Botão de Aprimoramento */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            {/* Alertas de Requisito */}
                            <div className="text-[11px] text-slate-400">
                              {isLocked ? (
                                <span className="text-rose-400 flex items-center gap-1 font-medium">
                                  <Lock className="w-3 h-3" />
                                  {!hasBranchPoints
                                    ? `Requer ${talent.requiredBranchPoints} pts no ramo`
                                    : 'Requer talento anterior'}
                                </span>
                              ) : isMaxed ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  Maestria Máxima
                                </span>
                              ) : status.availablePoints <= 0 ? (
                                <span className="text-amber-400/80">
                                  Suba de nível para obter pontos
                                </span>
                              ) : (
                                <span className="text-slate-300">
                                  Custo: 1 Ponto de Talento
                                </span>
                              )}
                            </div>

                            {/* Botão de Aprender */}
                            <button
                              id={`learn-talent-${talent.id}`}
                              onClick={() => handleLearnTalent(talent)}
                              disabled={!canLearn}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                                isMaxed
                                  ? 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-default'
                                  : canLearn
                                  ? isKeystone
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 hover:scale-[1.02] shadow-amber-500/20 active:scale-95'
                                    : 'bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white hover:scale-[1.02] shadow-sky-500/20 active:scale-95'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              {isMaxed ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>MAX</span>
                                </>
                              ) : isLocked ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Bloqueado</span>
                                </>
                              ) : currentRank === 0 ? (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Aprender (+1)</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Aprimorar (+1)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RODAPÉ DO MODAL COM RESUMO DE PROGRESSO */}
          <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Total de Pontos da Conta:{' '}
                <strong className="text-white font-bold">{status.totalPoints}</strong>
              </span>
              <span>•</span>
              <span>
                Pontos Investidos:{' '}
                <strong className="text-sky-300 font-bold">{status.spentPoints}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Você ganha 1 Ponto de Maestria a cada nível alcançado.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
