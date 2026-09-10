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
import { CosmicBlessing } from '../game/data/prestige.data.js';
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
  const [selectedBlessing, setSelectedBlessing] = useState<CosmicBlessing | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-lg select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border border-purple-500/40 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho Astral */}
        <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] text-2xl">
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
              <p className="text-xs text-slate-400">
                Reinicie seu mundo mortal em troca de Escamas Cósmicas e bônus eternos!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo de Escamas & Poder Cósmico */}
        <div className="p-4 sm:p-5 bg-purple-950/25 border-b border-purple-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-purple-300 tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              Escamas Disponíveis
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-purple-200">
                {status.currentScales}
              </span>
              <span className="text-xs text-purple-400/80">🌟 para gastar</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Bônus Cósmico Total
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-300">
                +{status.totalAscensionBonusPercent}%
              </span>
              <span className="text-xs text-slate-400">em todo CPS e cliques</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Ao Ascender Agora
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400">
                +{status.pendingScales}
              </span>
              <span className="text-xs text-emerald-300/80">novas Escamas</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso até a Próxima Escama */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-purple-500/20 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span>Progresso até a próxima Escama Cósmica:</span>
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
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar-amber">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Bênçãos Celestiais Eternas (Não somem ao ascender)
            </h3>
            <span className="text-xs text-slate-400">
              Renascimentos: <strong className="text-purple-300">{status.ascensionsCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {status.blessings.available.map((blessing) => {
              const canAfford = status.currentScales >= blessing.cost;
              return (
                <div
                  key={blessing.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    canAfford
                      ? 'bg-slate-950/70 border-purple-500/40 hover:border-purple-400 hover:bg-slate-950/90'
                      : 'bg-slate-950/30 border-slate-800 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{blessing.emoji}</span>
                        <h4 className="font-bold text-sm text-slate-100">{blessing.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-400/30 flex items-center gap-1">
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
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
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

            {status.blessings.purchased.map((blessingId) => {
              return (
                <div
                  key={blessingId}
                  className="p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-200">Bênção Adquirida</h4>
                      <p className="text-xs text-slate-400">Ativa para sempre nesta e em futuras vidas.</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    Ativa
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Ação de Ascensão */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <p className="font-bold text-slate-200">
              O que você mantém: Nível, Peixes do Bestiário, Escamas e Bênçãos Cósmicas.
            </p>
            <p className="text-[11px] text-slate-500">
              O que reseta: Moedas atuais, varas e ajudantes comprados.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmAscend(true)}
            disabled={status.pendingScales <= 0}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 ${
              status.pendingScales > 0
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:brightness-115 active:scale-95 shadow-purple-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ascender (+{status.pendingScales} 🌟)</span>
          </button>
        </div>

        {/* Modal de Confirmação de Ascensão */}
        <AnimatePresence>
          {showConfirmAscend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center select-none"
            >
              <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                🌌
              </div>
              <h3 className="text-xl font-black text-slate-100">
                Confirmar Ascensão Cósmica?
              </h3>
              <p className="text-sm text-slate-300 max-w-md mt-2">
                Você renascerá nos céus e receberá{' '}
                <strong className="text-purple-300">+{status.pendingScales} Escamas Cósmicas</strong>.
                Sua produção passiva e cliques recomeçarão muito mais velozes com um bônus vitalício de{' '}
                <strong className="text-amber-300">
                  +{status.totalAscensionBonusPercent + status.pendingScales}%
                </strong>
                !
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmAscend(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmAscend}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs hover:brightness-115 active:scale-95 shadow-lg shadow-purple-600/40"
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
