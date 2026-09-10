// src/components/CatchModal.tsx
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { GameFish } from '../game/data/fish.data.js';
import { GameConfig } from '../game/data/game.config.js';
import { GameAssetImage } from './GameAssetImage.js';
import { HoloCard } from './HoloCard.js';
import { vibrate } from '../utils/vibrate.js';
import { Sparkles, Coins, ArrowRight, Package, Waves } from 'lucide-react';

interface CatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  fish: (GameFish & { weight: number }) | null;
  bonusFish: (GameFish & { weight: number }) | null;
  xpEarned: number;
  onSellNow: () => void;
  estimatedPrice: number;
  onSendToAquarium?: () => void;
}

export const CatchModal: React.FC<CatchModalProps> = ({
  isOpen,
  onClose,
  fish,
  bonusFish,
  xpEarned,
  onSellNow,
  estimatedPrice,
  onSendToAquarium,
}) => {
  useEffect(() => {
    if (isOpen && fish) {
      if (fish.rarity === 'legendary') {
        vibrate.catchLegendary();
        confetti({
          particleCount: 130,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#ffffff'],
        });
      } else if (['rare', 'epic'].includes(fish.rarity)) {
        vibrate.catchRare();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#c084fc'],
        });
      } else {
        vibrate.catchNormal();
      }
    }
  }, [isOpen, fish]);

  if (!isOpen || !fish) return null;

  const rarityConfig = GameConfig.rarity[fish.rarity] || GameConfig.rarity.common;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="relative w-full max-w-md bg-slate-900 border-2 rounded-3xl shadow-2xl p-5 sm:p-6 text-center overflow-hidden flex flex-col items-center"
        style={{ borderColor: rarityConfig.color }}
      >
        {/* Efeito de brilho de fundo */}
        <div
          className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: rarityConfig.color }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: rarityConfig.color }}
        />

        {/* Tag de Raridade */}
        <div
          className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-3 flex items-center gap-1.5 border shadow-sm"
          style={{
            color: rarityConfig.color,
            borderColor: rarityConfig.color + '60',
            backgroundColor: rarityConfig.color + '15',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          {rarityConfig.label}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          {fish.name}
        </h2>

        {/* Imagem do Peixe com HoloCard 3D Tilt e Aura */}
        <HoloCard
          rarity={fish.rarity as any}
          className="my-3 w-full max-w-[280px] p-4 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-xl"
        >
          <div className="relative flex flex-col items-center justify-center py-2">
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              <GameAssetImage
                assetId={fish.assetId}
                name={fish.name}
                rarity={fish.rarity}
                size="hero"
              />
            </motion.div>
          </div>
        </HoloCard>

        {/* Descrição */}
        <p className="text-xs text-slate-300 italic mb-4 max-w-xs">{fish.description}</p>

        {/* Informações de Peso, Preço e XP */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Peso</span>
            <span className="text-sm sm:text-base font-black text-slate-100">{fish.weight} kg</span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Valor</span>
            <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {estimatedPrice}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">XP</span>
            <span className="text-sm sm:text-base font-black text-sky-400">+{xpEarned}</span>
          </div>
        </div>

        {/* Se houve peixe bônus (Fisgada Dupla) */}
        {bonusFish && (
          <div className="w-full p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 mb-4 flex items-center gap-2.5 text-left">
            <GameAssetImage
              assetId={bonusFish.assetId}
              name={bonusFish.name}
              rarity={bonusFish.rarity}
              size="sm"
            />
            <div>
              <span className="text-[10px] font-bold text-purple-300 uppercase">
                Bônus: Fisgada Dupla!
              </span>
              <p className="text-xs font-bold text-slate-100">
                + {bonusFish.name} ({bonusFish.weight} kg)
              </p>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-600"
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            Cesto
          </button>

          {onSendToAquarium && (
            <button
              onClick={onSendToAquarium}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-cyan-500/40 shadow-sm"
              title="Colocar diretamente no seu viveiro de troféus"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              Ao Aquário
            </button>
          )}

          <button
            onClick={onSellNow}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Coins className="w-3.5 h-3.5 text-slate-950" />
            Vender
          </button>
        </div>
      </motion.div>
    </div>
  );
};
