// src/components/LocationsModal.tsx
import React from 'react';
import { motion } from 'motion/react';
import { GameLocation } from '../game/data/locations.data.js';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameAssetImage } from './GameAssetImage.js';
import {
  MapPin,
  Lock,
  Check,
  Compass,
  ArrowRight,
  Waves,
  X,
} from 'lucide-react';

interface LocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  locations: GameLocation[];
  onSelectLocation: (locationId: string) => void;
}

export const LocationsModal: React.FC<LocationsModalProps> = ({
  isOpen,
  onClose,
  player,
  locations,
  onSelectLocation,
}) => {
  if (!isOpen) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Mapa dos Locais de Pesca
              </h2>
              <p className="text-xs text-slate-400">
                Escolha seu próximo destino e enfrente cardumes mais raros e lendários
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

        {/* Lista de Locais */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {locations.map((loc) => {
            const isCurrent = player.currentLocation === loc.id;
            const isLocked = player.level < loc.requiredLevel;

            return (
              <div
                key={loc.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-sky-400 bg-sky-950/20 shadow-lg'
                    : isLocked
                    ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <GameAssetImage assetId={loc.assetId} name={loc.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-100">{loc.name}</h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-400 text-slate-950 text-[10px] font-black tracking-wider">
                          LOCAL ATUAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">{loc.description}</p>

                    {/* Espécies nativas */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        Espécies:
                      </span>
                      {loc.fishPool.map((fId) => (
                        <span
                          key={fId}
                          className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] border border-slate-700 font-medium capitalize"
                        >
                          {fId.replace('fish_', '').replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ação */}
                <div className="w-full sm:w-auto flex justify-end shrink-0">
                  {isCurrent ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 px-3 py-1.5 bg-sky-950/40 rounded-xl border border-sky-800/50">
                      <Check className="w-4 h-4" /> Ancorado aqui
                    </div>
                  ) : isLocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold px-3 py-1.5 bg-rose-950/30 rounded-xl border border-rose-900/50">
                      <Lock className="w-3.5 h-3.5" /> Requer Nível {loc.requiredLevel}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSelectLocation(loc.id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
                    >
                      <span>Viajar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
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
