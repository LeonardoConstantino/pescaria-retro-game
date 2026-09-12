// src/components/ShopModal.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameItem } from '../game/data/items.data.js';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameAssetImage } from './GameAssetImage.js';
import {
  ShoppingBag,
  Coins,
  Lock,
  Check,
  Zap,
  Sparkles,
  Clock,
  X,
  Plus,
  MapPin,
} from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  catalog: GameItem[];
  onBuyItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  player,
  catalog,
  onBuyItem,
  onEquipItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'rod' | 'bait'>('all');

  if (!isOpen) return null;

  const filteredItems = catalog.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-[96vw] sm:w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Cabeçalho */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Loja de Equipamentos
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] sm:text-xs text-slate-400">Saldo:</span>
                <span className="text-[11px] sm:text-xs font-black text-amber-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {player.coins.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex border-b border-slate-800 px-3 sm:px-5 pt-2 bg-slate-950/30 gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
          {(['all', 'rod', 'bait'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? catalog.length
                : catalog.filter((i) => i.type === tab).length;
            const label =
              tab === 'all'
                ? 'Todos os Itens'
                : tab === 'rod'
                ? 'Varas de Pesca'
                : 'Iscas Especiais';

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation ${
                  filter === tab
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filter === tab
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lista de Itens */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar-amber">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isLocked = player.level < item.requiredLevel;
              const isOwned = item.type === 'rod' && (player.inventory.items[item.id] || 0) > 0;
              const isEquipped =
                item.type === 'rod'
                  ? player.equipment.rod === item.id
                  : player.equipment.bait === item.id;
              const baitQuantityOwned =
                item.type === 'bait' ? player.inventory.items[item.id] || 0 : 0;
              const canAfford = player.coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isEquipped
                      ? 'border-amber-400 bg-amber-950/20 shadow-md'
                      : isLocked
                      ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GameAssetImage assetId={item.assetId} name={item.name} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-100">{item.name}</span>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider">
                            EQUIPADO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Modificadores */}
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                        {item.modifiers.xpMultiplier && item.modifiers.xpMultiplier > 1 && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/50 flex items-center gap-1 font-semibold">
                            <Sparkles className="w-2.5 h-2.5" />
                            +{Math.round((item.modifiers.xpMultiplier - 1) * 100)}% XP
                          </span>
                        )}
                        {item.modifiers.cooldownModifier && (
                          <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/50 flex items-center gap-1 font-semibold">
                            <Clock className="w-2.5 h-2.5" />
                            {item.modifiers.cooldownModifier / 1000}s Cooldown
                          </span>
                        )}
                        {item.modifiers.rarityModifier && Object.keys(item.modifiers.rarityModifier).length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 flex items-center gap-1 font-semibold">
                            <Zap className="w-2.5 h-2.5" />
                            +Raridade
                          </span>
                        )}
                        {item.quantity && item.quantity > 1 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-semibold">
                            Pacote c/ {item.quantity}x
                          </span>
                        )}
                        {item.modifiers.locationBonus && item.modifiers.locationBonus.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1 font-semibold">
                            <MapPin className="w-2.5 h-2.5" />
                            Bônus de Local
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preço e Botão de Ação */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      {item.price > 0 ? (
                        <div className="flex items-center gap-1 text-sm font-black text-amber-300">
                          <Coins className="w-4 h-4 text-amber-400" />
                          {item.price.toLocaleString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400">Inicial / Grátis</span>
                      )}
                      {baitQuantityOwned > 0 && (
                        <span className="text-[10px] text-slate-400">
                          (Você tem {baitQuantityOwned}x)
                        </span>
                      )}
                    </div>

                    <div>
                      {isLocked ? (
                        <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold px-2 py-1 bg-rose-950/30 rounded-lg border border-rose-900/50">
                          <Lock className="w-3 h-3" /> Requer Nv. {item.requiredLevel}
                        </div>
                      ) : isOwned ? (
                        isEquipped ? (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Em uso
                          </span>
                        ) : (
                          <button
                            onClick={() => onEquipItem(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-transform active:scale-95"
                          >
                            Equipar
                          </button>
                        )
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={!canAfford}
                          onClick={() => onBuyItem(item.id)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Comprar
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
