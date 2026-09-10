// src/components/IdleShopModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Contratação de Ajudantes / Automações de Pesca & Upgrades
// (Estilo Cookie Clicker Buildings & Upgrades Bar)
// Exibe prateleira de Upgrades de Eficiência no topo, custo escalonado
// exponencial, CPS gerado e botão de compra.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import {
  IDLE_FISHER_TIERS,
  IdleFisherTier,
  calculateTierCost,
  calculateTierTotalCps,
} from '../game/data/idle.data.js';
import { IdleUpgrade } from '../game/data/upgrades.data.js';
import {
  X,
  Coins,
  Zap,
  TrendingUp,
  Sparkles,
  Bot,
  Layers,
  ArrowUpCircle,
  HelpCircle,
} from 'lucide-react';

interface IdleShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  totalCps: number;
  availableUpgrades: IdleUpgrade[];
  onBuyTier: (tierId: string) => void;
  onBuyUpgrade: (upgradeId: string) => void;
}

export const IdleShopModal: React.FC<IdleShopModalProps> = ({
  isOpen,
  onClose,
  player,
  totalCps,
  availableUpgrades,
  onBuyTier,
  onBuyUpgrade,
}) => {
  const [hoveredUpgrade, setHoveredUpgrade] = useState<IdleUpgrade | null>(null);

  if (!isOpen) return null;

  const idleFishers = player.idleFishers || {};
  const purchasedUpgradesCount = player.idleUpgrades?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                Ajudantes & Melhorias
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  Cookie Clicker
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Contrate ajudantes e compre melhorias que dobram sua produção e cliques!
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

        {/* Barra de Status de Produção Total & Clique */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Passivo:</span>
              <span className="text-sm font-black text-emerald-400">
                +{totalCps.toLocaleString('pt-BR')} 🪙/s
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-300">Clique na água:</span>
              <span className="text-sm font-black text-yellow-300">
                +{1 + Math.floor(totalCps * 0.03)} 🪙
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{player.coins.toLocaleString('pt-BR')} 🪙 disponíveis</span>
          </div>
        </div>

        {/* ── BARRA DE UPGRADES DISPONÍVEIS (Estilo Cookie Clicker Upgrades Vault) ── */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-b border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
              Melhorias Disponíveis ({availableUpgrades.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Adquiridos: <strong className="text-emerald-400">{purchasedUpgradesCount}</strong>
            </span>
          </div>

          {availableUpgrades.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1">
              Nenhuma melhoria disponível no momento. Contrate mais ajudantes ou dê mais cliques para liberar!
            </p>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar-amber">
              {availableUpgrades.map((upg) => {
                const canAfford = player.coins >= upg.cost;
                return (
                  <div key={upg.id} className="relative group shrink-0">
                    <button
                      onClick={() => onBuyUpgrade(upg.id)}
                      onMouseEnter={() => setHoveredUpgrade(upg)}
                      onMouseLeave={() => setHoveredUpgrade((prev) => (prev?.id === upg.id ? null : prev))}
                      disabled={!canAfford}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border shadow-md relative ${
                        canAfford
                          ? 'bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border-amber-400/60 hover:scale-110 hover:border-amber-300 active:scale-95 shadow-amber-500/20'
                          : 'bg-slate-800/80 border-slate-700/80 opacity-50 cursor-not-allowed'
                      }`}
                      title={`${upg.name} - ${upg.cost.toLocaleString('pt-BR')} 🪙`}
                    >
                      <span>{upg.emoji}</span>
                      {/* Selo 2x */}
                      <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black leading-tight border border-slate-900">
                        2x
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tooltip Dinâmico da Melhoria Selecionada */}
          <AnimatePresence>
            {hoveredUpgrade && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs flex items-center justify-between gap-3 overflow-hidden"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{hoveredUpgrade.emoji}</span>
                    <span>{hoveredUpgrade.name}</span>
                    <span className="text-emerald-400 font-black">({hoveredUpgrade.description})</span>
                  </div>
                  <p className="text-[11px] text-amber-200/60 italic mt-0.5">
                    {hoveredUpgrade.flavorText}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    {hoveredUpgrade.cost.toLocaleString('pt-BR')} 🪙
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de Contratações (Buildings) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar-amber">
          {IDLE_FISHER_TIERS.map((tier) => {
            const count = idleFishers[tier.id] || 0;
            const cost = calculateTierCost(tier, count);
            const canAfford = player.coins >= cost;
            const tierCps = calculateTierTotalCps(tier, count);

            return (
              <div
                key={tier.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  canAfford
                    ? 'border-slate-700/80 bg-slate-950/60 hover:border-amber-400/50 hover:bg-slate-950/90'
                    : 'border-slate-800/80 bg-slate-950/30 opacity-75'
                }`}
              >
                {/* Lado Esquerdo: Ícone + Info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-md">
                    {tier.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-100">
                        {tier.name}
                      </h3>
                      {count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 text-xs font-black border border-slate-700">
                          x{count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                    <p className="text-[11px] text-amber-200/60 italic mt-0.5">
                      {tier.flavorText}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        +{tier.baseCps} 🪙/s cada
                      </span>
                      {count > 0 && (
                        <span className="text-slate-400 font-medium">
                          Total: <strong className="text-slate-200">{tierCps} 🪙/s</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Botão de Compra com Custo Exponencial */}
                <button
                  onClick={() => onBuyTier(tier.id)}
                  disabled={!canAfford}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 active:scale-95 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>{cost.toLocaleString('pt-BR')} 🪙</span>
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
