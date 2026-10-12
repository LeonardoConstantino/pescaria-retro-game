// src/components/LevelUpModal.tsx
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { LocationData } from '../game/data/locations.data.js';
import { ItemData } from '../game/data/items.data.js';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Verifica o que desbloqueia neste nível
  const unlockedLocations = LocationData.filter((l) => l.requiredLevel === newLevel);
  const unlockedItems = ItemData.filter((i) => i.requiredLevel === newLevel && i.price > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl p-6 text-center overflow-hidden flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
        </div>

        <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          EVOLUÇÃO DE NÍVEL!
        </div>

        <h2 className="text-3xl font-black text-slate-100 tracking-tight">
          NÍVEL {newLevel}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Sua perícia como pescador acaba de alcançar novos patamares!
        </p>

        {/* Desbloqueios */}
        {(unlockedLocations.length > 0 || unlockedItems.length > 0) && (
          <div className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 mb-4 text-left space-y-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Novidades Desbloqueadas:
            </span>

            {unlockedLocations.map((loc) => (
              <div key={loc.id} className="flex items-center gap-2 text-xs text-sky-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Novo Local: {loc.name}</span>
              </div>
            ))}

            {unlockedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Novo Equipamento: {item.name}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <span>Continuar Aventuras</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
