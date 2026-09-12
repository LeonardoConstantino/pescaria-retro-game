// src/components/GoldenFishSpawner.tsx
// ─────────────────────────────────────────────────────────────
// O "Golden Cookie" da Pesca: Peixe Dourado Lendário (Golden Fish)
//
// 1. Spawna raramente a cada 110-200s (ou 40-70s na Lua Mística / 65-115s com Bênçãos).
// 2. Visual autêntico: Silhueta estilizada do peixe dourado lendário (inspirada no aquário).
// 3. Touch target confortável com halo aquático translúcido e partículas estelares.
// 4. Ao clicar: DESAPARECE INSTANTANEAMENTE com estouro de confetes e frenesi imediato.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';

interface GoldenFishSpawnerProps {
  onCatchGoldenFish: () => void;
  chanceMultiplier?: number;
  isMysticMoon?: boolean;
}

interface GoldenFishInstance {
  id: string;
  startX: number; // 5% ou 85%
  startY: number; // 25% a 70%
  targetX: number;
  targetY: number;
}

export const GoldenFishSpawner: React.FC<GoldenFishSpawnerProps> = ({
  onCatchGoldenFish,
  chanceMultiplier = 1.0,
  isMysticMoon = false,
}) => {
  const [currentFish, setCurrentFish] = useState<GoldenFishInstance | null>(null);
  const [isCatching, setIsCatching] = useState(false);

  // Mantém referências atualizadas para os temporizadores
  const multiplierRef = useRef(chanceMultiplier);
  const mysticMoonRef = useRef(isMysticMoon);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const despawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    multiplierRef.current = chanceMultiplier;
    mysticMoonRef.current = isMysticMoon;
  }, [chanceMultiplier, isMysticMoon]);

  // Agenda o próximo spawn raro
  const scheduleNextSpawn = (isInitial = false) => {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }

    let delay: number;
    const mult = Math.max(1.0, multiplierRef.current);

    if (isInitial) {
      // Primeiro spawn da sessão: após 60s a 110s de pescaria ativa (ou 35-60s na Lua Mística)
      delay = mysticMoonRef.current
        ? Math.floor(Math.random() * 25000 + 35000)
        : Math.floor((Math.random() * 50000 + 60000) / mult);
    } else if (mysticMoonRef.current) {
      // Durante o clima especial da Lua Mística: spawn especial a cada 40s a 70s
      const base = Math.random() * (70000 - 40000) + 40000;
      const extra = mult / 3.0; // Desconta o bônus nativo de 3.0x do clima
      delay = Math.max(25000, Math.round(base / Math.max(1.0, extra)));
    } else {
      // Modo Base: INTERVALO RARO entre 110s e 200s (~1.8 a 3.3 minutos)
      // Com Bênção de Netuno (2.0x) ou Ímã Dourado (1.35x), reduz para 65s a 115s
      const base = Math.random() * (200000 - 110000) + 110000;
      delay = Math.round(base / mult);
    }

    spawnTimerRef.current = setTimeout(() => {
      spawnFish();
    }, delay);
  };

  const spawnFish = () => {
    const startX = Math.random() > 0.5 ? 5 : 85;
    const targetX = startX === 5 ? 85 : 5;
    const startY = Math.floor(Math.random() * 45) + 25; // 25% a 70% da altura da água
    const targetY = Math.floor(Math.random() * 45) + 25;

    const instance: GoldenFishInstance = {
      id: `golden-${Date.now()}`,
      startX,
      startY,
      targetX,
      targetY,
    };

    setIsCatching(false);
    setCurrentFish(instance);
    sound.playCatch('legendary', 10); // Som celestial misterioso que anuncia a presença

    // Nada pelas águas por 12 segundos antes de mergulhar de volta ao fundo
    if (despawnTimerRef.current) {
      clearTimeout(despawnTimerRef.current);
    }

    despawnTimerRef.current = setTimeout(() => {
      setCurrentFish((prev) => {
        if (prev?.id === instance.id) {
          scheduleNextSpawn(false);
          return null;
        }
        return prev;
      });
    }, 12000);
  };

  // Inicialização do temporizador no ciclo de vida
  useEffect(() => {
    scheduleNextSpawn(true);

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (despawnTimerRef.current) clearTimeout(despawnTimerRef.current);
    };
  }, []);

  // Clique no Peixe Dourado: DESAPARECE NA HORA
  const handleClickFish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFish || isCatching) return;

    // Cancela o temporizador de despawn imediatamente
    if (despawnTimerRef.current) {
      clearTimeout(despawnTimerRef.current);
      despawnTimerRef.current = null;
    }

    setIsCatching(true);

    // Efeitos imediatos
    sound.playGoldenFish();
    vibrate.catchLegendary();

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#eab308'],
    });

    // Remove o peixe da tela instantaneamente
    setCurrentFish(null);
    onCatchGoldenFish();

    // Agenda o próximo spawn raro
    scheduleNextSpawn(false);
  };

  return (
    <AnimatePresence>
      {currentFish && (
        <motion.div
          key={currentFish.id}
          initial={{
            left: `${currentFish.startX}%`,
            top: `${currentFish.startY}%`,
            scale: 0.2,
            opacity: 0,
          }}
          animate={{
            left: [
              `${currentFish.startX}%`,
              `${(currentFish.startX + currentFish.targetX) / 2}%`,
              `${currentFish.targetX}%`,
            ],
            top: [
              `${currentFish.startY}%`,
              `${Math.max(15, currentFish.startY - 20)}%`,
              `${currentFish.targetY}%`,
            ],
            scale: [0.7, 1.15, 1.1, 0.9],
            opacity: [0, 1, 1, 0.9],
            rotate: currentFish.startX < currentFish.targetX ? [0, -8, 6, 0] : [0, 8, -6, 0],
          }}
          exit={{
            scale: 0.1,
            opacity: 0,
            transition: { duration: 0.18, ease: 'easeOut' },
          }}
          transition={{
            duration: 12,
            ease: 'linear',
          }}
          onClick={handleClickFish}
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group w-20 h-16 sm:w-24 sm:h-18 flex items-center justify-center touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          title="Peixe Dourado Lendário! Toque para ativar o Frenesi Cósmico!"
        >
          {/* Efeitos de Aura Aquática & Ondulação */}
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Ondas Aquáticas Concêntricas Pulsantes (Water Ripples) */}
            <motion.div
              animate={{
                scale: [0.7, 1.7],
                opacity: [0.8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeOut',
              }}
              className="absolute w-16 h-16 rounded-full border-2 border-amber-300/90 bg-amber-400/20"
            />
            <motion.div
              animate={{
                scale: [0.5, 1.4],
                opacity: [0.7, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                delay: 0.45,
                ease: 'easeOut',
              }}
              className="absolute w-16 h-16 rounded-full border border-yellow-200/70"
            />

            {/* Halo Dourado Radiante Fluido */}
            <div className="absolute w-16 h-12 rounded-full bg-gradient-to-r from-amber-400/60 via-yellow-300/70 to-amber-500/60 blur-md animate-pulse" />

            {/* Partículas Estelares Orbitantes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
              className="absolute w-20 h-20 rounded-full pointer-events-none"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <Star className="w-3 h-3 fill-yellow-200 text-yellow-300 drop-shadow-[0_0_6px_rgba(254,240,138,1)]" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Sparkles className="w-3 h-3 text-amber-200 drop-shadow-[0_0_6px_rgba(254,240,138,1)]" />
              </div>
            </motion.div>

            {/* Silhueta Orgânica Estilizada do Peixe Dourado (Inspirada no Aquário & Arte Nativa) */}
            <div
              className={`relative flex items-center justify-center transform group-hover:scale-115 active:scale-90 transition-transform ${
                currentFish.startX > currentFish.targetX ? 'scale-x-[-1]' : ''
              }`}
            >
              <svg
                width="84"
                height="44"
                viewBox="0 0 84 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_0_12px_rgba(251,191,36,0.95)]"
              >
                <defs>
                  {/* Gradiente Dourado Metálico do Peixe */}
                  <linearGradient id="goldenBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="25%" stopColor="#f59e0b" />
                    <stop offset="55%" stopColor="#fef08a" />
                    <stop offset="78%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Gradiente do Ventre (Barriga) */}
                  <linearGradient id="goldenBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>

                  {/* Gradiente das Barbatanas */}
                  <linearGradient id="goldenFinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                {/* Cauda em Leque Animada com Ondulação de Natação */}
                <g className="origin-[24px_22px]">
                  <motion.path
                    d="M 24 22 C 16 14 6 8 2 5 C 7 13 8 18 3 22 C 8 26 7 31 2 39 C 6 36 16 30 24 22 Z"
                    fill="url(#goldenFinGrad)"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    animate={{
                      rotate: [-14, 14, -14],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.65,
                      ease: 'easeInOut',
                    }}
                  />
                </g>

                {/* Barbatana Dorsal Superior Ondulante */}
                <path
                  d="M 36 14 C 44 4 56 4 62 13 C 54 10 44 11 36 14 Z"
                  fill="url(#goldenFinGrad)"
                  stroke="#fbbf24"
                  strokeWidth="1"
                />

                {/* Barbatana Ventral Inferior */}
                <path
                  d="M 38 29 C 43 38 50 38 54 30 C 48 31 43 30 38 29 Z"
                  fill="url(#goldenFinGrad)"
                  stroke="#fbbf24"
                  strokeWidth="1"
                />

                {/* Corpo Principal Aerodinâmico e Curvo */}
                <path
                  d="M 22 22 C 26 13 42 10 65 14 C 74 16 78 19 80 22 C 78 25 74 28 65 30 C 42 34 26 31 22 22 Z"
                  fill="url(#goldenBodyGrad)"
                  stroke="#fbbf24"
                  strokeWidth="1.6"
                />

                {/* Ventre Iluminado */}
                <path
                  d="M 26 23 C 32 28 50 31 66 28 C 72 26 75 23 76 22 C 73 24 68 26 62 26 C 46 26 34 24 26 23 Z"
                  fill="url(#goldenBellyGrad)"
                  opacity="0.85"
                />

                {/* Barbatana Peitoral Lateral com Flutter */}
                <motion.path
                  d="M 52 23 C 44 26 40 31 44 33 C 48 31 52 27 52 23 Z"
                  fill="url(#goldenFinGrad)"
                  stroke="#fef08a"
                  strokeWidth="0.8"
                  animate={{
                    rotate: [-6, 12, -6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.55,
                    ease: 'easeInOut',
                  }}
                  className="origin-[52px_23px]"
                />

                {/* Arco das Brânquias */}
                <path
                  d="M 64 16 C 61 19 61 24 64 27"
                  stroke="#b45309"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Detalhes de Escamas / Cintilação Cósmica */}
                <circle cx="48" cy="18" r="1.2" fill="#ffffff" opacity="0.8" />
                <circle cx="42" cy="22" r="1.2" fill="#ffffff" opacity="0.8" />
                <circle cx="54" cy="21" r="1.4" fill="#ffffff" opacity="0.9" />
                <circle cx="36" cy="20" r="1" fill="#ffffff" opacity="0.7" />

                {/* Olho Vivo com Esclera, Íris e Brilho Especular */}
                <circle cx="71" cy="18.5" r="3.2" fill="#ffffff" />
                <circle cx="71.8" cy="18.5" r="2" fill="#0f172a" />
                <circle cx="72.6" cy="17.6" r="0.9" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


