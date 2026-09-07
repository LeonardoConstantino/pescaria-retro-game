// src/components/BestiaryModal.tsx
import React from 'react';
import { motion } from 'motion/react';
import { FishData } from '../game/data/fish.data.js';
import { GameConfig } from '../game/data/game.config.js';
import { GameAssetImage } from './GameAssetImage.js';
import { HoloCard } from './HoloCard.js';
import { BookOpen, Sparkles, Check, HelpCircle, X } from 'lucide-react';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caughtFishIds: string[];
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  caughtFishIds,
}) => {
  if (!isOpen) return null;

  const totalSpecies = FishData.length;
  const discoveredCount = caughtFishIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Guia Ilustrado das Espécies
              </h2>
              <p className="text-xs text-slate-400">
                Progresso: {discoveredCount}/{totalSpecies} espécies registradas
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

        {/* Grade de Peixes */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FishData.map((fish) => {
              const isDiscovered = caughtFishIds.includes(fish.id);
              const rarityConfig = GameConfig.rarity[fish.rarity] || GameConfig.rarity.common;

              return (
                <HoloCard
                  key={fish.id}
                  rarity={isDiscovered ? (fish.rarity as any) : 'common'}
                  enableTilt={isDiscovered}
                  className={`rounded-2xl border transition-all ${
                    isDiscovered
                      ? 'border-slate-800 bg-slate-950/70'
                      : 'border-slate-800/50 bg-slate-950/30 opacity-60'
                  }`}
                >
                  <div className="p-3.5 flex items-start gap-3 w-full h-full">
                    <div className="relative">
                      <GameAssetImage
                        assetId={fish.assetId}
                        name={fish.name}
                        rarity={fish.rarity}
                        size="md"
                      />
                      {isDiscovered && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-100">
                          {isDiscovered ? fish.name : '??? Desconhecido'}
                        </span>
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
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {isDiscovered
                          ? fish.description
                          : 'Explore diferentes locais e use iscas variadas para descobrir este peixe.'}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>⚖️ {fish.minWeight} - {fish.maxWeight} kg</span>
                        <span className="text-amber-300 font-semibold">🪙 Base: {fish.basePrice}</span>
                      </div>
                    </div>
                  </div>
                </HoloCard>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
