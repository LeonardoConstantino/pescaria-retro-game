// src/components/GoldenFishSpawner.tsx
// ─────────────────────────────────────────────────────────────
// O "Golden Cookie" da Pesca: Peixe Dourado Saltador
//
// 1. Spawna aleatoriamente a cada 75-140 segundos (com cooldown).
// 2. Salta e nada pela tela por 12 segundos com brilho dourado e partículas.
// 3. Se o jogador clicar a tempo, dispara o efeito especial
//    (Frenesi de Produção 7x, Frenesi de Clique 77x ou Cardume Instantâneo).
// 4. Som de fanfarra e vibração imediata.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';

interface GoldenFishSpawnerProps {
  onCatchGoldenFish: () => void;
  chanceMultiplier?: number;
}

interface GoldenFishInstance {
  id: string;
  startX: number; // 10 a 80%
  startY: number; // 25 a 70%
  targetX: number;
  targetY: number;
}

export const GoldenFishSpawner: React.FC<GoldenFishSpawnerProps> = ({
  onCatchGoldenFish,
  chanceMultiplier = 1.0,
}) => {
  const [currentFish, setCurrentFish] = useState<GoldenFishInstance | null>(null);

  // Sistema de agendamento de spawn
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextSpawn = () => {
      // Entre 45 e 90 segundos ajustado pelo multiplicador de clima (Lua Mística / Tempestade)
      const baseDelay = Math.random() * (90000 - 45000) + 45000;
      const safeMult = Math.max(0.5, chanceMultiplier);
      const delay = Math.round(baseDelay / safeMult);

      timeoutId = setTimeout(() => {
        spawnFish();
      }, delay);
    };

    const spawnFish = () => {
      const startX = Math.random() > 0.5 ? 5 : 85;
      const targetX = startX === 5 ? 85 : 5;
      const startY = Math.floor(Math.random() * 45) + 25; // 25% a 70%
      const targetY = Math.floor(Math.random() * 45) + 25;

      const instance: GoldenFishInstance = {
        id: `golden-${Date.now()}`,
        startX,
        startY,
        targetX,
        targetY,
      };

      setCurrentFish(instance);
      sound.playCatch('legendary', 10); // Som sutil de anúncio cósmico

      // Desaparece após 13 segundos se não for clicado
      setTimeout(() => {
        setCurrentFish((prev) => (prev?.id === instance.id ? null : prev));
        scheduleNextSpawn();
      }, 13000);
    };

    // Primeiro spawn acontece entre 20 e 40 segundos após iniciar
    const initialDelay = Math.floor(Math.random() * 20000 + 20000);
    timeoutId = setTimeout(spawnFish, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleClickFish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentFish) return;

    sound.playGoldenFish();
    vibrate.catchLegendary();

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff'],
    });

    setCurrentFish(null);
    onCatchGoldenFish();
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
            left: [`${currentFish.startX}%`, `${(currentFish.startX + currentFish.targetX) / 2}%`, `${currentFish.targetX}%`],
            top: [`${currentFish.startY}%`, `${Math.max(15, currentFish.startY - 25)}%`, `${currentFish.targetY}%`],
            scale: [0.6, 1.25, 1.1, 0.9],
            opacity: [0, 1, 1, 0.9],
            rotate: currentFish.startX < currentFish.targetX ? [0, -15, 10, 0] : [0, 15, -10, 0],
          }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{
            duration: 12,
            ease: 'linear',
          }}
          onClick={handleClickFish}
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Halo Radiante Dourado */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute w-20 h-20 rounded-full bg-amber-400/30 blur-md pointer-events-none"
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute w-24 h-24 border-2 border-dashed border-amber-300/40 rounded-full pointer-events-none"
            />

            {/* Peixe Dourado Estilizado */}
            <div className="relative px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-2 border-yellow-100 shadow-[0_0_25px_rgba(251,191,36,0.95)] flex items-center gap-1.5 transform group-hover:scale-115 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-900 fill-amber-300 animate-spin" />
              <span className="text-2xl filter drop-shadow-md">✨🐟✨</span>
              <span className="text-[10px] font-black uppercase text-amber-950 bg-yellow-200/90 px-1.5 py-0.5 rounded-full tracking-wider border border-amber-400 shadow-xs">
                Clique!
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
