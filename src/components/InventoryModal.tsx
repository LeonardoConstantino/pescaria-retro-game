// src/components/InventoryModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameItem } from '../game/data/items.data.js';
import { GameConfig } from '../game/data/game.config.js';
import { GameAssetImage } from './GameAssetImage.js';
import { sound } from '../utils/audio.js';
import {
  Package,
  Coins,
  Fish,
  Sparkles,
  Trash2,
  Check,
  CircleDot,
  Anchor,
  X,
  Waves,
} from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  shopCatalog: GameItem[];
  onSellFish: (inventoryId: string) => void;
  onSellAllFish: () => void;
  onEquipItem: (itemId: string) => void;
  onUnequipBait: () => void;
  calculateFishPrice: (fish: any) => number;
  onSendToAquarium?: (inventoryId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  player,
  shopCatalog,
  onSellFish,
  onSellAllFish,
  onEquipItem,
  onUnequipBait,
  calculateFishPrice,
  onSendToAquarium,
}) => {
  const [activeTab, setActiveTab] = useState<'fish' | 'gear'>('fish');

  if (!isOpen) return null;

  const fishList = player.inventory.fish;
  const maxSlots = GameConfig.inventory.maxSlots;

  // Calcula valor total dos peixes
  const totalSellValue = fishList.reduce((acc, f) => acc + calculateFishPrice(f), 0);

  // Itens possuídos
  const ownedItems = Object.entries(player.inventory.items)
    .map(([itemId, qty]) => {
      const item = shopCatalog.find((i) => i.id === itemId);
      return item ? { ...item, ownedQty: qty } : null;
    })
    .filter(Boolean) as (GameItem & { ownedQty: number })[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-[96vw] sm:w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Cabeçalho do Modal */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Mochila & Cesto de Pesca
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Capacidade: {fishList.length}/{maxSlots} peixes guardados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 px-3 sm:px-5 pt-2 bg-slate-950/30 gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('fish')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all touch-manipulation ${
              activeTab === 'fish'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fish className="w-4 h-4" />
            Cesto de Peixes ({fishList.length})
          </button>

          <button
            onClick={() => setActiveTab('gear')}
            className={`pb-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-all touch-manipulation ${
              activeTab === 'gear'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Anchor className="w-4 h-4" />
            Varas & Iscas Guardadas
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'fish' ? (
            <>
              {fishList.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Fish className="w-16 h-16 text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">
                    Seu cesto de peixes está vazio!
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Vá até o cais e lance a linha para capturar peixes valorizados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fishList.map((fish) => {
                    const price = calculateFishPrice(fish);
                    const rarityConfig = GameConfig.rarity[fish.rarity] || GameConfig.rarity.common;
                    const isTrophy = fish.maxWeight && fish.weight >= fish.maxWeight * (GameConfig.economy.trophyWeightThreshold || 0.85);

                    return (
                      <div
                        key={fish.inventoryId}
                        className={`p-3 rounded-2xl border ${rarityConfig.borderColor} ${
                          isTrophy ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-950/60'
                        } flex items-center justify-between gap-3 hover:bg-slate-950/90 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <GameAssetImage
                            assetId={fish.assetId}
                            name={fish.name}
                            rarity={fish.rarity}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-slate-100">{fish.name}</span>
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.2 rounded-md border"
                                style={{
                                  color: rarityConfig.color,
                                  borderColor: rarityConfig.color + '40',
                                  backgroundColor: rarityConfig.color + '15',
                                }}
                              >
                                {rarityConfig.label}
                              </span>
                              {isTrophy && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-amber-400/40 bg-amber-500/20 text-amber-300">
                                  🏆 Troféu (+25%)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">
                              ⚖️ {fish.weight} kg
                            </p>
                            <p className="text-xs text-amber-300 font-bold mt-0.5">
                              🪙 {price} moedas
                            </p>
                          </div>
                        </div>

                        {/* Ações do Peixe: Aquário e Vender */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onSendToAquarium && (
                            <button
                              onClick={() => onSendToAquarium(fish.inventoryId)}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1"
                              title="Transferir para o Viveiro de Troféus"
                            >
                              <Waves className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="hidden sm:inline">Aquário</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSellFish(fish.inventoryId)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1"
                          >
                            Vender
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Aba de Equipamentos */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownedItems.map((item) => {
                  const isEquipped =
                    item.type === 'rod'
                      ? player.equipment.rod === item.id
                      : player.equipment.bait === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isEquipped
                          ? 'border-amber-400 bg-amber-950/20 shadow-md'
                          : 'border-slate-800 bg-slate-950/60'
                      } flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3">
                        <GameAssetImage assetId={item.assetId} name={item.name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{item.name}</span>
                            {isEquipped && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                                EQUIPADO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                          <p className="text-xs text-sky-400 font-medium mt-1">
                            Quantidade: {item.ownedQty}x
                          </p>
                        </div>
                      </div>

                      <div>
                        {isEquipped ? (
                          item.type === 'bait' ? (
                            <button
                              onClick={onUnequipBait}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
                            >
                              Guardar
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Ativo
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => onEquipItem(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-transform active:scale-95"
                          >
                            Equipar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé: Botão de Vender Todos */}
        {activeTab === 'fish' && fishList.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total acumulado:</span>
              <span className="text-base font-black text-amber-300 flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                {totalSellValue.toLocaleString('pt-BR')} moedas
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSellAllFish}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              VENDER TODOS OS {fishList.length} PEIXES
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
