// src/components/PrestigeModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Ascensão Cósmica / Renascimento (Cookie Clicker Ascension)
// 1. Apresenta as Escamas Douradas Cósmicas acumuladas (+1% CPS e Clique por escama).
// 2. Mostra a loja de Bênçãos Celestiais permanentes.
// 3. Permite ascender com confirmação consciente dos resets e ganhos eternos.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PrestigeStatus } from '../game/managers/PrestigeManager.js';
import { COSMIC_BLESSINGS, CosmicBlessing } from '../game/data/prestige.data.js';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Coins,
  Star,
  Check,
  AlertTriangle,
  Flame,
  Award,
  Lock,
} from 'lucide-react';

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PrestigeStatus | null;
  onAscend: () => void;
  onBuyBlessing: (blessingId: string) => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({
  isOpen,
  onClose,
  status,
  onAscend,
  onBuyBlessing,
}) => {
  const [showConfirmAscend, setShowConfirmAscend] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');

  if (!isOpen || !status) return null;

  const handleConfirmAscend = () => {
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#fbbf24', '#ffffff', '#38bdf8'],
    });
    setShowConfirmAscend(false);
    onAscend();
  };

  const filteredAvailableBlessings = status.blessings.available.filter((b) => {
    if (selectedTier === 'all') return true;
    return b.tier === selectedTier;
  });

  const canAscend = status.isLevelQualified && status.pendingScales > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-lg select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-[96vw] sm:w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border border-purple-500/40 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Cabeçalho Astral */}
        <div className="p-3 sm:p-5 border-b border-purple-500/20 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] text-xl sm:text-2xl shrink-0">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  Ascensão Cósmica
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-400/40">
                  Renascimento
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Reinicie seu mundo mortal em troca de Escamas Cósmicas e bônus eternos!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors touch-manipulation shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área Central Rolável (Garante que todo conteúdo apareça em qualquer tela mobile) */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar-amber">
          {/* Resumo de Escamas & Poder Cósmico */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase text-purple-300 tracking-wider flex items-center gap-1 truncate">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 fill-purple-400 shrink-0" />
                <span className="truncate">Escamas</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-purple-200">
                  {status.currentScales}
                </span>
                <span className="text-[9px] sm:text-xs text-purple-400/80 truncate">🌟</span>
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-amber-500/30 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Bônus</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-amber-300">
                  +{status.totalAscensionBonusPercent}%
                </span>
              </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase text-emerald-300 tracking-wider flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Ganho</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black text-emerald-400">
                  +{status.pendingScales}
                </span>
                <span className="text-[9px] sm:text-xs text-emerald-300/80 truncate">🌟</span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso até a Próxima Escama */}
          <div className="p-2.5 sm:p-3 bg-slate-950/60 rounded-xl sm:rounded-2xl border border-purple-500/20 text-[11px] sm:text-xs">
            <div className="flex flex-wrap items-center justify-between text-slate-300 mb-1.5 gap-1">
              <span>Próxima Escama:</span>
              <span className="font-bold text-purple-300">
                {status.coinsProgressToNextScale.toLocaleString('pt-BR')} / {(status.coinsProgressToNextScale + status.coinsNeededForNextScale).toLocaleString('pt-BR')} 🪙 ({status.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${status.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Conteúdo Principal: Bênçãos Celestiais Permanentes */}
          <div className="pt-1 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Catálogo de Bênçãos Cósmicas
              </h3>

              {/* Filtro de Tiers */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 1, label: 'Iniciação (1-5 🌟)' },
                  { id: 2, label: 'Mestria (10-30 🌟)' },
                  { id: 3, label: 'Apoteose (45+ 🌟)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTier(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                      selectedTier === tab.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Bênçãos Disponíveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {filteredAvailableBlessings.map((blessing) => {
                const canAfford = status.currentScales >= blessing.cost;
                return (
                  <div
                    key={blessing.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                      canAfford
                        ? 'bg-slate-950/70 border-purple-500/40 hover:border-purple-400 hover:bg-slate-950/90'
                        : 'bg-slate-950/30 border-slate-800 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl">{blessing.emoji}</span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">{blessing.name}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-400/30 flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 fill-purple-400" />
                          {blessing.cost}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5">{blessing.description}</p>
                      <p className="text-[11px] text-purple-200/60 italic mt-1">
                        {blessing.flavorText}
                      </p>
                    </div>

                    <button
                      onClick={() => onBuyBlessing(blessing.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md touch-manipulation ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 active:scale-95 shadow-purple-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>Desbloquear Bênção</span>
                    </button>
                  </div>
                );
              })}

              {/* Bênçãos Adquiridas com detalhes ricos */}
              {status.blessings.purchased.map((blessingId) => {
                const blessing = COSMIC_BLESSINGS.find((b) => b.id === blessingId);
                return (
                  <div
                    key={blessingId}
                    className="p-3 sm:p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl shrink-0">{blessing?.emoji || '✨'}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-emerald-200">
                          {blessing?.name || 'Bênção Cósmica'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {blessing?.description || 'Ativa para sempre nesta e em futuras vidas.'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 shrink-0 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Ativa
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé Fixo com Ação de Ascensão */}
        <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left leading-tight">
            <p className="font-bold text-slate-200">
              Mantém: Nível, Bestiário, Talentos, Escamas e Bênçãos Cósmicas.
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              {!status.isLevelQualified
                ? `Requer Nível ${status.minLevelRequired} do Pescador para ascender.`
                : 'Reseta: Moedas atuais e construções de ajudantes para novo ciclo veloz.'}
            </p>
          </div>

          <button
            onClick={() => setShowConfirmAscend(true)}
            disabled={!canAscend}
            className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 min-h-[46px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 touch-manipulation ${
              canAscend
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:brightness-115 active:scale-95 shadow-purple-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {!status.isLevelQualified ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloqueado (Nv. {status.minLevelRequired})</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Ascender (+{status.pendingScales} 🌟)</span>
              </>
            )}
          </button>
        </div>

        {/* Modal de Confirmação de Ascensão */}
        <AnimatePresence>
          {showConfirmAscend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center justify-center text-center select-none overflow-y-auto"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                🌌
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-100 mb-1">
                Confirmar Ascensão Cósmica?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2">
                Você renascerá nos céus e receberá{' '}
                <strong className="text-purple-300">+{status.pendingScales} Escamas Cósmicas</strong>.
                Sua produção passiva e cliques recomeçarão com um bônus vitalício de{' '}
                <strong className="text-amber-300">
                  +{status.totalAscensionBonusPercent + status.pendingScales}%
                </strong>
                !
              </p>

              <div className="mt-5 sm:mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmAscend(false)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors touch-manipulation min-h-[44px]"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmAscend}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs hover:brightness-115 active:scale-95 shadow-lg shadow-purple-600/40 touch-manipulation min-h-[44px]"
                >
                  Sim, Ascender Agora!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
