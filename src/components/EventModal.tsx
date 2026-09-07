// src/components/EventModal.tsx
import React from 'react';
import { motion } from 'motion/react';
import { GameEvent } from '../game/data/events.data.js';
import { GameAssetImage } from './GameAssetImage.js';
import { Sparkles, Coins, Zap, AlertTriangle, Check, X } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: GameEvent | null;
  eventDetails: any | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  eventDetails,
}) => {
  if (!isOpen || !event) return null;

  const isPositive = event.type === 'positive';
  const isNegative = event.type === 'negative';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 15 }}
        className={`relative w-full max-w-md bg-slate-900 border-2 rounded-3xl shadow-2xl p-5 sm:p-6 text-center overflow-hidden flex flex-col items-center ${
          isPositive
            ? 'border-amber-400/80 shadow-amber-500/20'
            : isNegative
            ? 'border-rose-500/80 shadow-rose-500/20'
            : 'border-sky-400/80'
        }`}
      >
        {/* Tag do Evento */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-3 flex items-center gap-1.5 border shadow-sm ${
            isPositive
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              : isNegative
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              : 'bg-sky-950/60 border-sky-500/50 text-sky-300'
          }`}
        >
          {isPositive ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          ) : isNegative ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-sky-400" />
          )}
          Evento Inesperado!
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          {event.name}
        </h2>

        {/* Imagem do Evento */}
        <div className="my-4">
          <GameAssetImage assetId={event.assetId} name={event.name} size="lg" />
        </div>

        {/* Descrição */}
        <p className="text-xs text-slate-300 mb-4">{event.description}</p>

        {/* Efeitos aplicados */}
        {eventDetails?.appliedEffects && (
          <div className="w-full p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 space-y-1.5 text-xs">
            {eventDetails.appliedEffects.coinsAwarded && (
              <p className="font-bold text-amber-300 flex items-center justify-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                + {eventDetails.appliedEffects.coinsAwarded} Moedas encontradas!
              </p>
            )}
            {eventDetails.appliedEffects.xpAwarded && (
              <p className="font-bold text-sky-300">
                ✨ + {eventDetails.appliedEffects.xpAwarded} XP concedido!
              </p>
            )}
            {eventDetails.appliedEffects.fishLost && (
              <p className="font-bold text-rose-400">
                💔 O peixe da pescaria acabou escapando com a confusão!
              </p>
            )}
            {eventDetails.appliedEffects.boostAdded && (
              <p className="font-bold text-purple-300">
                🔮 {eventDetails.appliedEffects.boostAdded}
              </p>
            )}
            {eventDetails.appliedEffects.itemGiven && (
              <p className="font-bold text-emerald-300">
                🎁 Você ganhou um item especial: {eventDetails.appliedEffects.itemGiven}!
              </p>
            )}
          </div>
        )}

        {/* Encadeado */}
        {eventDetails?.chainEvent && (
          <div className="w-full p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 mb-4 text-xs text-amber-200">
            <span className="font-bold">Encadeamento:</span> {eventDetails.chainEvent.name}!
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider transition-all border border-slate-600"
        >
          Continuar Pescaria
        </button>
      </motion.div>
    </div>
  );
};
