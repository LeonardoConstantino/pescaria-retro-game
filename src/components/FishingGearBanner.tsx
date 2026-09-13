// src/components/FishingGearBanner.tsx
// ─────────────────────────────────────────────────────────────
// Banner de Equipamentos & Local de Pesca (HUD Elegante Fora do Lago)
// Exibe Vara Equipada, Isca Ativa e Local com Acesso à Fauna Nativa
// Mantém a visão do lago 100% livre e limpa para apreciar os efeitos climáticos.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameLocation } from '../game/data/locations.data.js';
import { GameItem } from '../game/data/items.data.js';
import { GameAssetImage } from './GameAssetImage.js';
import { CircleDot, MapPin, Fish, Sparkles, X, ChevronDown } from 'lucide-react';

interface FishingGearBannerProps {
  currentLocation: GameLocation;
  currentRod: GameItem | null;
  currentBait: GameItem | null;
  baitCount: number;
  onOpenShop?: () => void;
  onOpenLocations?: () => void;
}

export const FishingGearBanner: React.FC<FishingGearBannerProps> = ({
  currentLocation,
  currentRod,
  currentBait,
  baitCount,
  onOpenShop,
  onOpenLocations,
}) => {
  const [showFishPool, setShowFishPool] = useState(false);

  return (
    <>
      <div
        id="fishing-gear-banner"
        className="w-full max-w-5xl mx-auto rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5 select-none transition-all"
      >
        {/* LADO ESQUERDO: LOCAL DE PESCA & ESPÉCIES */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            onClick={onOpenLocations}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/60 transition-all ${
              onOpenLocations
                ? 'cursor-pointer hover:border-sky-500/50 hover:bg-slate-900 active:scale-[0.98] group'
                : ''
            }`}
            title={onOpenLocations ? 'Clique para viajar para outro local' : currentLocation.name}
          >
            <div className="relative shrink-0">
              <GameAssetImage
                assetId={currentLocation.assetId}
                name={currentLocation.name}
                size="xs"
                className="rounded-lg ring-1 ring-sky-400/40"
              />
              <MapPin className="w-3 h-3 text-sky-400 absolute -bottom-1 -right-1 drop-shadow" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                  {currentLocation.name}
                </span>
                {onOpenLocations && (
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-sky-400 transition-colors hidden sm:inline" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate hidden xs:inline">
                Nível mín. {currentLocation.requiredLevel}
              </span>
            </div>
          </div>

          {/* Botão de Espécies Nativas */}
          <button
            onClick={() => setShowFishPool(!showFishPool)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              showFishPool
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                : 'bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-slate-100 border-slate-800'
            }`}
            title="Ver catálogo de peixes deste local"
          >
            <Fish className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Fauna ({currentLocation.fishPool.length})</span>
          </button>
        </div>

        {/* LADO DIREITO: VARA & ISCA EQUIPADAS */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* VARA EQUIPADA */}
          <div
            onClick={onOpenShop}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 transition-all ${
              onOpenShop
                ? 'cursor-pointer hover:border-sky-500/50 hover:bg-slate-900 active:scale-[0.98] group'
                : ''
            }`}
            title={onOpenShop ? 'Ver loja / varas de pesca' : 'Vara equipada'}
          >
            <GameAssetImage
              assetId={currentRod?.assetId || 'rod_basic'}
              name={currentRod?.name || 'Vara Básica'}
              size="xs"
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                Vara
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 truncate group-hover:text-sky-300 transition-colors max-w-[90px] sm:max-w-[130px]">
                  {currentRod?.name || 'Vara Básica'}
                </span>
                {currentRod?.modifiers.xpMultiplier && currentRod.modifiers.xpMultiplier > 1 && (
                  <span className="text-[10px] text-sky-400 font-bold hidden md:inline">
                    +{Math.round((currentRod.modifiers.xpMultiplier - 1) * 100)}% XP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ISCA ATIVA */}
          <div
            onClick={onOpenShop}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 transition-all ${
              onOpenShop
                ? 'cursor-pointer hover:border-amber-500/50 hover:bg-slate-900 active:scale-[0.98] group'
                : ''
            }`}
            title={onOpenShop ? 'Ver loja / comprar iscas' : 'Isca ativa'}
          >
            {currentBait ? (
              <>
                <GameAssetImage
                  assetId={currentBait.assetId}
                  name={currentBait.name}
                  size="xs"
                  className="rounded-lg"
                />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    Isca Ativa
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-300 truncate max-w-[80px] sm:max-w-[110px]">
                      {currentBait.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {baitCount}x
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <CircleDot className="w-4 h-4 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    Isca
                  </span>
                  <span className="text-xs text-slate-400 italic">Sem isca</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL / DROPDOWN DE ESPÉCIES NATIVAS DO LOCAL */}
      <AnimatePresence>
        {showFishPool && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowFishPool(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900 border border-sky-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Fish className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                    Espécies em {currentLocation.name}
                  </h4>
                </div>
                <button
                  onClick={() => setShowFishPool(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista */}
              <div className="p-3 space-y-1.5 overflow-y-auto max-h-64 text-xs">
                {currentLocation.fishPool.map((fId) => {
                  const fishDisplayName = fId
                    .replace('fish_', '')
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                  return (
                    <div
                      key={fId}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-semibold">{fishDisplayName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé */}
              <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 text-right">
                <button
                  onClick={() => setShowFishPool(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
