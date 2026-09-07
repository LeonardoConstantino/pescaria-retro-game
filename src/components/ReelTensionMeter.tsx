// src/components/ReelTensionMeter.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Star } from 'lucide-react';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';

interface ReelTensionMeterProps {
  isOpen: boolean;
  onComplete: (isPerfect: boolean) => void;
}

export const ReelTensionMeter: React.FC<ReelTensionMeterProps> = ({ isOpen, onComplete }) => {
  const [needlePos, setNeedlePos] = useState(10); // 0 to 100
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [hasResolved, setHasResolved] = useState(false);
  const [outcome, setOutcome] = useState<'perfect' | 'normal' | null>(null);

  // Zona Perfeita: entre 42% e 62%
  const SWEET_SPOT_START = 42;
  const SWEET_SPOT_END = 62;

  const needleRef = useRef(10);
  const dirRef = useRef<'right' | 'left'>('right');

  useEffect(() => {
    if (!isOpen) {
      setHasResolved(false);
      setOutcome(null);
      setNeedlePos(10);
      needleRef.current = 10;
      dirRef.current = 'right';
      return;
    }

    // Loop de movimento fluido da agulha (60fps)
    const interval = setInterval(() => {
      if (dirRef.current === 'right') {
        needleRef.current += 3.2;
        if (needleRef.current >= 95) {
          dirRef.current = 'left';
        }
      } else {
        needleRef.current -= 3.2;
        if (needleRef.current <= 5) {
          dirRef.current = 'right';
        }
      }
      setNeedlePos(needleRef.current);
    }, 16);

    // Timeout de 2.2 segundos para caso o usuário não clique
    const timeout = setTimeout(() => {
      handleStrike();
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  // Atalho de teclado (Espaço ou Enter)
  useEffect(() => {
    if (!isOpen || hasResolved) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'Enter'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        handleStrike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasResolved, needlePos]);

  const handleStrike = () => {
    if (hasResolved) return;
    setHasResolved(true);

    const current = needleRef.current;
    const isSweet = current >= SWEET_SPOT_START && current <= SWEET_SPOT_END;

    if (isSweet) {
      setOutcome('perfect');
      sound.playPerfectBite();
      vibrate.perfectHit();
    } else {
      setOutcome('normal');
      sound.playReel(2);
      vibrate.catchNormal();
    }

    setTimeout(() => {
      onComplete(isSweet);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full max-w-sm bg-slate-900/95 border-2 border-amber-400/90 rounded-3xl p-5 shadow-[0_0_40px_rgba(251,191,36,0.35)] text-center flex flex-col items-center overflow-hidden"
      >
        {/* Título com pulso */}
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
          <span className="text-sm font-black uppercase tracking-wider text-amber-300">
            Fisgada em Tensão!
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Acerte a <strong className="text-amber-400">Zona Dourada</strong> para bônus de peso (+25%)!
        </p>

        {/* ── BARRA DE TENSÃO ── */}
        <div className="relative w-full h-8 bg-slate-950 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-inner flex items-center mb-4">
          {/* Zona Perfeita (Sweet Spot) */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-400/80 via-yellow-300 to-amber-400/80 border-x-2 border-amber-200 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.8)]"
            style={{
              left: `${SWEET_SPOT_START}%`,
              width: `${SWEET_SPOT_END - SWEET_SPOT_START}%`,
            }}
          >
            <Star className="w-3.5 h-3.5 text-slate-950 fill-slate-950 animate-spin-slow" />
          </div>

          {/* Agulha / Indicador de Tensão */}
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_12px_#ffffff] border border-slate-900 transition-all duration-75 z-20"
            style={{ left: `${needlePos}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Feedback do Resultado imediato */}
        {outcome === 'perfect' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            className="mb-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/50"
          >
            <Sparkles className="w-4 h-4" />
            ⭐ FISGADA PERFEITA! (+25% PESO)
          </motion.div>
        )}

        {outcome === 'normal' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 text-xs font-bold text-slate-300"
          >
            Linha recolhida com sucesso!
          </motion.div>
        )}

        {/* Botão de Fisgar */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          disabled={hasResolved}
          onClick={handleStrike}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-slate-950" />
          <span>FISGAR AGORA (ESPAÇO)</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
