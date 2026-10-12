// src/components/LeaderboardModal.tsx
import React from 'react';
import { motion } from 'motion/react';
import { RankingEntry } from '../game/managers/RankingManager.js';
import { Trophy, Medal, Crown, Fish, X } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: RankingEntry[];
  currentUserId: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  currentUserId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Ranking dos Pescadores
              </h2>
              <p className="text-xs text-slate-400">
                Os maiores mestres dos anzóis e suas lendas aquáticas
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

        {/* Lista de Classificação */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
          {leaderboard.map((entry) => {
            const isMe = entry.id === currentUserId;

            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Posição / Medalha */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                    {entry.rank === 1 ? (
                      <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    ) : entry.rank === 2 ? (
                      <Medal className="w-5 h-5 text-slate-300" />
                    ) : entry.rank === 3 ? (
                      <Medal className="w-5 h-5 text-amber-700" />
                    ) : (
                      <span className="text-slate-500 font-bold">#{entry.rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          isMe ? 'text-amber-300' : 'text-slate-100'
                        }`}
                      >
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                          VOCÊ
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        Nv. {entry.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>🎣 {entry.totalFishCaught} peixes fisgados</span>
                      {entry.largestFishWeight > 0 && (
                        <span className="text-amber-200/90 font-medium">
                          🏆 Maior: {entry.largestFishName} ({entry.largestFishWeight} kg)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-300">
                    🪙 {entry.coins.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
