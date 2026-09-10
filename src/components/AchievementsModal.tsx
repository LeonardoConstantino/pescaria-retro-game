// src/components/AchievementsModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Conquistas & Marcos (Cookie Clicker Achievements)
// Lista todas as conquistas, progresso percentual e o bônus de Maré (+1.5% cada).
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AchievementProgress } from '../game/managers/AchievementManager.js';
import {
  X,
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: {
    totalUnlocked: number;
    totalAchievements: number;
    bonusPercent: number;
    items: AchievementProgress[];
  } | null;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen || !status) return null;

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'fishing', label: '🎣 Pescaria' },
    { id: 'clicks', label: '⚡ Cliques' },
    { id: 'coins', label: '🪙 Economia' },
    { id: 'idle', label: '⏱️ Automação' },
    { id: 'golden', label: '✨ Dourados' },
    { id: 'prestige', label: '🌌 Prestígio' },
  ];

  const filteredItems = status.items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.achievement.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  Conquistas & Marcos
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                  +{status.bonusPercent}% Bônus
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cada conquista desbloqueada aumenta permanentemente toda a sua produção!
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

        {/* Resumo de Progresso e Efeito Leite/Maré */}
        <div className="p-4 bg-amber-950/20 border-b border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 text-slate-200 font-bold mb-1">
                <span>Total Concluído:</span>
                <span className="text-amber-400">
                  {status.totalUnlocked} / {status.totalAchievements} (
                  {Math.round((status.totalUnlocked / status.totalAchievements) * 100)}%)
                </span>
              </div>
              <div className="w-48 sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-300"
                  style={{
                    width: `${(status.totalUnlocked / status.totalAchievements) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-2 px-3 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Maré de Conquistas:</span>
            <strong className="text-emerald-400 font-black">+{status.bonusPercent}% CPS</strong>
          </div>
        </div>

        {/* Filtros de Categoria */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/50 flex items-center gap-2 overflow-x-auto custom-scrollbar-amber pb-2 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 select-none ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-850'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de Conquistas */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 custom-scrollbar-amber">
          {filteredItems.map((item) => {
            const { achievement: ach, isUnlocked, currentValue, targetValue, progressPercent } = item;

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-950/15 border-amber-500/30 shadow-sm shadow-amber-950/20'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                      ? 'bg-amber-500/20 border-amber-400/50 shadow-inner'
                      : 'bg-slate-800/80 border-slate-700 text-slate-600 grayscale'
                  }`}
                >
                  {isUnlocked ? ach.emoji : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isUnlocked ? 'text-amber-200' : 'text-slate-400'
                        }`}
                      >
                        {ach.title}
                      </h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      +{ach.bonusPercent}% CPS
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{ach.description}</p>

                  {/* Barra de Progresso Individual */}
                  {!isUnlocked && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold shrink-0">
                        {currentValue.toLocaleString('pt-BR')} / {targetValue.toLocaleString('pt-BR')} ({progressPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
