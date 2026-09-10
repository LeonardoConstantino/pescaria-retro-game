// src/components/ReelTensionMeter.tsx
// ─────────────────────────────────────────────────────────────
// Minigame de Batalha de Pesca Realista (Reel & Fight Engine)
// Transmite tensão, força do peixe, controle de carretilha e
// contragolpes direcionais da vara.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Disc,
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';
import { FishingSession } from '../game/managers/SessionManager.js';
import { GameFish } from '../game/data/fish.data.js';

interface ReelTensionMeterProps {
  isOpen: boolean;
  session: FishingSession | null;
  rodName?: string;
  rodId?: string;
  onSuccess: (isPerfect: boolean) => void;
  onLineSnap: () => void;
  onClose?: () => void;
}

type FishMood = 'normal' | 'thrashing' | 'exhausted';
type Direction = 'left' | 'center' | 'right';

export const ReelTensionMeter: React.FC<ReelTensionMeterProps> = ({
  isOpen,
  session,
  rodName = 'Vara de Pesca',
  rodId = 'rod_basic',
  onSuccess,
  onLineSnap,
}) => {
  // Dados do peixe (se houver na sessão)
  const fish: (GameFish & { weight: number }) | null = session?.result?.fish || null;
  const rarity = fish?.rarity || 'common';
  const fishWeight = fish?.weight || 2.5;

  // Parâmetros iniciais calculados com base no peixe
  const initialDistance = (() => {
    if (!fish) return 18;
    switch (rarity) {
      case 'legendary':
        return Math.min(85, 55 + fishWeight * 0.4);
      case 'epic':
        return Math.min(65, 42 + fishWeight * 0.35);
      case 'rare':
        return Math.min(50, 32 + fishWeight * 0.3);
      case 'uncommon':
        return Math.min(38, 25 + fishWeight * 0.25);
      default:
        return Math.min(30, 20 + fishWeight * 0.2);
    }
  })();

  // Multiplicadores da vara equipada
  const rodStrength = (() => {
    if (rodId.includes('celestial') || rodId.includes('mythic') || rodId.includes('cosmic')) return 1.85;
    if (rodId.includes('leviathan')) return 1.65;
    if (rodId.includes('legendary')) return 1.5;
    if (rodId.includes('abyssal')) return 1.35;
    if (rodId.includes('carbon') || rodId.includes('advanced')) return 1.25;
    if (rodId.includes('titanium')) return 1.2;
    if (rodId.includes('intermediate') || rodId.includes('fiber')) return 1.12;
    if (rodId.includes('bamboo')) return 1.06;
    return 1.0;
  })();

  // Estados principais da batalha
  const [distance, setDistance] = useState(initialDistance);
  const [tension, setTension] = useState(30); // 0 a 100
  const [stamina, setStamina] = useState(100); // 0 a 100
  const [fishMood, setFishMood] = useState<FishMood>('normal');
  const [fishDirection, setFishDirection] = useState<Direction>('center');
  const [playerDirection, setPlayerDirection] = useState<Direction>('center');
  const [isReeling, setIsReeling] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [perfectCountersCount, setPerfectCountersCount] = useState(0);
  const [sweetSpotTimeMs, setSweetSpotTimeMs] = useState(0);

  // Referências para o loop de física (60fps)
  const distanceRef = useRef(initialDistance);
  const tensionRef = useRef(30);
  const staminaRef = useRef(100);
  const isReelingRef = useRef(false);
  const fishMoodRef = useRef<FishMood>('normal');
  const fishDirRef = useRef<Direction>('center');
  const playerDirRef = useRef<Direction>('center');
  const criticalTimeRef = useRef(0); // Tempo acumulado na zona crítica
  const lastTickSoundRef = useRef(0);
  const moodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dirTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reinicializa ao abrir
  useEffect(() => {
    if (!isOpen) {
      setIsBroken(false);
      setIsVictory(false);
      setIsReeling(false);
      isReelingRef.current = false;
      return;
    }

    const dist = initialDistance;
    setDistance(dist);
    distanceRef.current = dist;
    setTension(28);
    tensionRef.current = 28;
    setStamina(100);
    staminaRef.current = 100;
    setFishMood('normal');
    fishMoodRef.current = 'normal';
    setFishDirection('center');
    fishDirRef.current = 'center';
    setPlayerDirection('center');
    playerDirRef.current = 'center';
    setIsBroken(false);
    setIsVictory(false);
    setPerfectCountersCount(0);
    setSweetSpotTimeMs(0);
    criticalTimeRef.current = 0;

    // Primeiro som de combate
    sound.playSplash();

    // Loop de Comportamento da IA do Peixe (mudança de humor e arrancadas)
    const scheduleNextMood = () => {
      // Duração base de cada estado
      const isLegendary = rarity === 'legendary' || rarity === 'epic';
      const delay = Math.random() * (isLegendary ? 2200 : 3200) + 1800;

      moodTimerRef.current = setTimeout(() => {
        // Decide o próximo humor
        const current = fishMoodRef.current;
        let next: FishMood = 'normal';

        if (current === 'normal') {
          // Chance de arrancada violenta ou cansaço
          const roll = Math.random();
          if (roll < (isLegendary ? 0.65 : 0.45)) {
            next = 'thrashing';
            sound.playFishSplash();
            vibrate.fishThrash();
          } else {
            next = 'exhausted';
          }
        } else if (current === 'thrashing') {
          // Após arrancada, o peixe cansa
          next = 'exhausted';
        } else {
          // Após cansaço, volta a nadar normalmente
          next = 'normal';
        }

        fishMoodRef.current = next;
        setFishMood(next);
        scheduleNextMood();
      }, delay);
    };

    // Loop de Direção do Peixe (Esquerda, Centro, Direita)
    const scheduleNextDirection = () => {
      const delay = Math.random() * 2000 + 1200;
      dirTimerRef.current = setTimeout(() => {
        const dirs: Direction[] = ['left', 'right', 'center'];
        const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
        fishDirRef.current = nextDir;
        setFishDirection(nextDir);
        scheduleNextDirection();
      }, delay);
    };

    scheduleNextMood();
    scheduleNextDirection();

    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
      if (dirTimerRef.current) clearTimeout(dirTimerRef.current);
    };
  }, [isOpen, initialDistance, rarity]);

  // Atualiza referências diretas
  useEffect(() => {
    isReelingRef.current = isReeling;
  }, [isReeling]);

  useEffect(() => {
    playerDirRef.current = playerDirection;
  }, [playerDirection]);

  // Loop de Física em Tempo Real (60 FPS)
  useEffect(() => {
    if (!isOpen || isBroken || isVictory) return;

    const interval = setInterval(() => {
      const dt = 0.016; // 16ms
      const reeling = isReelingRef.current;
      const mood = fishMoodRef.current;
      const fishDir = fishDirRef.current;
      const playerDir = playerDirRef.current;

      // 1. Verificação de Contragolpe Direcional (Counter-Steering)
      const isCountering =
        (fishDir === 'left' && playerDir === 'right') ||
        (fishDir === 'right' && playerDir === 'left') ||
        (fishDir === 'center' && playerDir === 'center');

      // Drenagem de estamina do peixe
      let staminaDrain = 4 * dt;
      if (reeling) staminaDrain += 8 * dt;
      if (isCountering && fishDir !== 'center') {
        staminaDrain += 16 * dt;
      }
      staminaRef.current = Math.max(0, staminaRef.current - staminaDrain);
      setStamina(staminaRef.current);

      // 2. Dinâmica de Tensão da Linha
      let tensionDelta = 0;

      if (reeling) {
        // Recolhendo linha: Tensão sobe
        let baseRise = 32 * dt;
        if (mood === 'thrashing') {
          baseRise *= 2.2; // Arrancada violenta dispara tensão!
        } else if (mood === 'exhausted') {
          baseRise *= 0.6; // Peixe cansado quase não tensiona
        }

        // Se o jogador estiver aplicando o contragolpe correto, alivia o aumento de tensão
        if (isCountering && fishDir !== 'center') {
          baseRise *= 0.55;
        }

        tensionDelta += baseRise;

        // Som de estalo contínuo do carretel
        const now = performance.now();
        if (now - lastTickSoundRef.current > 75) {
          lastTickSoundRef.current = now;
          sound.playReelTick(tensionRef.current * 2.5);
        }
      } else {
        // Soltou carretel: Tensão cai naturalmente
        const dropSpeed = (mood === 'thrashing' ? 24 : 45) * rodStrength * dt;
        tensionDelta -= dropSpeed;
      }

      // Se o peixe estiver em arrancada e não estivermos contragolpeando, o peixe puxa a linha
      if (mood === 'thrashing' && !isCountering) {
        tensionDelta += 14 * dt;
      }

      // Aplica delta de tensão
      tensionRef.current = Math.max(0, Math.min(100, tensionRef.current + tensionDelta));
      setTension(tensionRef.current);

      // Acumula tempo na Sweet Spot (40% a 75%)
      if (tensionRef.current >= 40 && tensionRef.current <= 75) {
        setSweetSpotTimeMs((prev) => prev + 16);
      }

      // 3. Dinâmica de Distância
      if (reeling) {
        let reelSpeed = 5.2 * rodStrength * dt;
        if (mood === 'exhausted') {
          reelSpeed *= 2.0; // Janela de ouro: recolhe o dobro!
        } else if (mood === 'thrashing') {
          reelSpeed *= 0.35; // Muito difícil recolher durante arrancada
        }

        // Bônus se estiver na zona ideal de tensão
        if (tensionRef.current >= 45 && tensionRef.current <= 75) {
          reelSpeed *= 1.25;
        }

        distanceRef.current = Math.max(0, distanceRef.current - reelSpeed);
      } else {
        // Peixe tenta fugir se a linha estiver totalmente solta e ele estiver forte
        if (mood === 'thrashing' && staminaRef.current > 10) {
          distanceRef.current = Math.min(initialDistance * 1.3, distanceRef.current + 2.5 * dt);
        }
      }
      setDistance(distanceRef.current);

      // 4. Verificação de Ruptura (Zona Crítica > 88%)
      if (tensionRef.current >= 88) {
        criticalTimeRef.current += dt;
        sound.playTensionStrain(criticalTimeRef.current);

        if (criticalTimeRef.current > 0.35 && Math.random() < 0.3) {
          vibrate.lineStrain();
        }

        // Tempo limite de tolerância antes da linha arrebentar (1.4s base * rodStrength)
        const maxCriticalTime = 1.4 * rodStrength;
        if (criticalTimeRef.current >= maxCriticalTime) {
          // LINHA ARREBENTOU!
          handleLineSnap();
          return;
        }
      } else {
        criticalTimeRef.current = Math.max(0, criticalTimeRef.current - dt * 1.8);
      }

      // 5. Verificação de Vitória (Distância alcançou 0m)
      if (distanceRef.current <= 0.1) {
        handleVictory();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isOpen, isBroken, isVictory, initialDistance, rodStrength]);

  // Controles de Teclado (Espaço para recolher, A/D ou Setas para inclinar a vara)
  useEffect(() => {
    if (!isOpen || isBroken || isVictory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsReeling(true);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        setPlayerDirection('left');
        checkCounterHit('left');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        setPlayerDirection('right');
        checkCounterHit('right');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        setPlayerDirection('center');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsReeling(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, isBroken, isVictory]);

  // Checa se o contragolpe foi bem-sucedido e dá feedback
  const checkCounterHit = (dir: Direction) => {
    if (
      (dir === 'left' && fishDirRef.current === 'right') ||
      (dir === 'right' && fishDirRef.current === 'left')
    ) {
      sound.playPerfectCounter();
      vibrate.perfectHit();
      setPerfectCountersCount((prev) => prev + 1);
    }
  };

  // Vitória na batalha
  const handleVictory = useCallback(() => {
    setIsVictory(true);
    setIsReeling(false);
    isReelingRef.current = false;
    sound.playFishSplash();

    // Se o jogador acumulou bons contragolpes e manteve bom controle de tensão
    const isPerfect = perfectCountersCount >= 2 || sweetSpotTimeMs > 2500;

    setTimeout(() => {
      onSuccess(isPerfect);
    }, 600);
  }, [perfectCountersCount, sweetSpotTimeMs, onSuccess]);

  // Ruptura da Linha
  const handleLineSnap = useCallback(() => {
    setIsBroken(true);
    setIsReeling(false);
    isReelingRef.current = false;
    sound.playLineSnap();
    vibrate.lineSnap();

    setTimeout(() => {
      onLineSnap();
    }, 1200);
  }, [onLineSnap]);

  if (!isOpen) return null;

  // Cálculos visuais
  const tensionColor =
    tension >= 88
      ? 'from-red-600 to-rose-600 shadow-red-500/80 animate-pulse'
      : tension >= 65
        ? 'from-amber-500 to-orange-500 shadow-amber-500/50'
        : tension >= 25
          ? 'from-emerald-500 to-teal-400 shadow-emerald-500/40'
          : 'from-sky-500 to-blue-500 shadow-sky-500/30';

  const progressPercent = Math.max(0, Math.min(100, (1 - distance / initialDistance) * 100));

  // Curvatura da vara de acordo com a tensão
  const rodBendY = 40 + (tension / 100) * 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none touch-none">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        className={`relative w-full max-w-md bg-slate-900/98 rounded-3xl p-5 border-2 shadow-2xl text-center flex flex-col items-center overflow-hidden transition-colors duration-200 ${
          tension >= 88
            ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.45)]'
            : 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)]'
        }`}
      >
        {/* Efeito de flash em tensão crítica */}
        {tension >= 88 && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
        )}

        {/* ── CABEÇALHO COM ESTADO DO PEIXE ── */}
        <div className="w-full flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {rarity === 'legendary'
                ? '🐉'
                : rarity === 'epic'
                  ? '⚡'
                  : rarity === 'rare'
                    ? '💎'
                    : '🐟'}
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                  {fish ? fish.name : 'Presa Misteriosa'}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    rarity === 'legendary'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : rarity === 'epic'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : rarity === 'rare'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {rarity}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {rodName} ({fishWeight.toFixed(1)} kg est.)
              </div>
            </div>
          </div>

          {/* Badge de Humor do Peixe */}
          <div>
            {fishMood === 'thrashing' && (
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[11px] font-black flex items-center gap-1 uppercase tracking-wider shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                ARRANCADA!
              </motion.span>
            )}
            {fishMood === 'exhausted' && (
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-black flex items-center gap-1 uppercase tracking-wider shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                CANSADO! PUXE!
              </motion.span>
            )}
            {fishMood === 'normal' && (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
                🌊 Lutando
              </span>
            )}
          </div>
        </div>

        {/* ── VISUALIZADOR DA LINHA E CURVATURA DA VARA (SVG DINÂMICO) ── */}
        <div className="relative w-full h-32 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/60 rounded-2xl border border-slate-800 p-2 overflow-hidden mb-4 shadow-inner flex flex-col justify-between">
          {/* Fundo com efeito de água e profundidade */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent" />

          {/* SVG com a linha física e a curvatura da ponta da vara */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 128">
            {/* Ponta da Vara (canto superior esquerdo) */}
            <path
              d={`M 15 20 Q 90 ${rodBendY} 280 80`}
              fill="none"
              stroke={tension >= 88 ? '#ef4444' : tension >= 65 ? '#f59e0b' : '#38bdf8'}
              strokeWidth={tension >= 88 ? '3.5' : '2'}
              strokeDasharray={tension >= 88 ? '4 2' : 'none'}
              className="transition-all duration-75"
            />
            {/* Anzóis e Isca na ponta da linha */}
            <circle
              cx="280"
              cy="80"
              r="4.5"
              fill={tension >= 88 ? '#ef4444' : '#f59e0b'}
              className="animate-pulse"
            />
          </svg>

          {/* Silhueta do Peixe se debatendo na água */}
          <motion.div
            animate={{
              x: fishDirection === 'left' ? -35 : fishDirection === 'right' ? 35 : 0,
              y: fishMood === 'thrashing' ? 6 : 0,
              rotate:
                fishDirection === 'left'
                  ? -12
                  : fishDirection === 'right'
                    ? 12
                    : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute right-8 top-12 flex flex-col items-center pointer-events-none"
          >
            <div className="relative">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                {fishDirection === 'left' ? '🐟' : '🐠'}
              </span>
              {/* Espuma d'água */}
              {fishMood === 'thrashing' && (
                <span className="absolute -bottom-2 -left-2 text-xs animate-ping">💦</span>
              )}
            </div>
            <div className="text-[10px] font-black text-cyan-300 mt-1 uppercase tracking-wider bg-slate-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
              {fishDirection === 'left'
                ? '◀ Puxando P/ Esquerda'
                : fishDirection === 'right'
                  ? 'Puxando P/ Direita ▶'
                  : '▲ Puxando P/ Fundo'}
            </div>
          </motion.div>

          {/* Indicador de Distância em tempo real */}
          <div className="z-10 flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Disc className={`w-4 h-4 text-cyan-400 ${isReeling ? 'animate-spin' : ''}`} />
              <span className="text-xs text-slate-400 font-bold uppercase">Distância da Linha:</span>
            </div>
            <span className="text-lg font-black font-mono tracking-tight text-white">
              {distance.toFixed(1)} <span className="text-xs text-cyan-400 font-sans">metros</span>
            </span>
          </div>

          {/* Barra de Progresso de Recolhimento da Linha */}
          <div className="z-10 w-full px-2 pb-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
              <span>Isca Lançada</span>
              <span className="text-cyan-300 font-bold">{progressPercent.toFixed(0)}% Recolhido</span>
              <span>Barco / Margem</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── BARRA DE TENSÃO DA LINHA (CORE GAMEPLAY) ── */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200">Tensão da Linha:</span>
            </div>
            <span
              className={`font-mono text-sm font-black ${
                tension >= 88
                  ? 'text-red-400 animate-bounce'
                  : tension >= 65
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {tension.toFixed(0)}%
            </span>
          </div>

          {/* Trilho do Medidor de Tensão */}
          <div className="relative w-full h-8 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner flex items-center p-1">
            {/* Zona Segura (20% a 65%) */}
            <div
              className="absolute top-0 bottom-0 left-[20%] w-[45%] bg-emerald-500/15 border-x border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400/80 uppercase pointer-events-none"
            >
              Zona Segura
            </div>

            {/* Zona Perfeita / Sweet Spot (45% a 75%) */}
            <div
              className="absolute top-0 bottom-0 left-[45%] w-[30%] bg-amber-400/20 border-x-2 border-amber-400/50 flex items-center justify-center text-[10px] font-black text-amber-300 pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.3)]"
            >
              ⭐ Zona Ideal
            </div>

            {/* Zona de Perigo / Ruptura (88% a 100%) */}
            <div
              className="absolute top-0 bottom-0 right-0 w-[12%] bg-red-600/40 border-l-2 border-red-500 flex items-center justify-center text-[9px] font-black text-red-300 uppercase pointer-events-none animate-pulse"
            >
              Perigo
            </div>

            {/* Barra Preenchedora de Tensão */}
            <div
              className={`h-full rounded-xl bg-gradient-to-r ${tensionColor} transition-all duration-75 shadow-lg`}
              style={{ width: `${tension}%` }}
            />
          </div>

          {/* Aviso de Tensão Crítica */}
          {tension >= 88 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wide bg-red-500/10 py-1 rounded-lg border border-red-500/30 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              PERIGO DE RUPTURA! ALIVIE O CARRETEL!
            </motion.div>
          )}
        </div>

        {/* ── CONTRAGOLPE DA VARA (DIREÇÃO: ESQUERDA / CENTRO / DIREITA) ── */}
        <div className="w-full mb-4 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Contragolpe da Vara (A / D):</span>
            {playerDirection !== 'center' && (
              <span className="text-amber-300 text-[10px] font-black">
                {playerDirection === 'left' ? '◀ Puxando Esquerda' : 'Puxando Direita ▶'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Puxar Vara para Esquerda */}
            <button
              type="button"
              onClick={() => {
                setPlayerDirection('left');
                checkCounterHit('left');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all ${
                playerDirection === 'left'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 active:scale-95'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Vara Esquerda</span>
            </button>

            {/* Vara Reta / Centro */}
            <button
              type="button"
              onClick={() => setPlayerDirection('center')}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all ${
                playerDirection === 'center'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 active:scale-95'
              }`}
            >
              <span>Centro</span>
            </button>

            {/* Puxar Vara para Direita */}
            <button
              type="button"
              onClick={() => {
                setPlayerDirection('right');
                checkCounterHit('right');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition-all ${
                playerDirection === 'right'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 active:scale-95'
              }`}
            >
              <span>Vara Direita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── BOTÃO PRINCIPAL DE RECOLHER CARRETEL (CLICK & HOLD) ── */}
        <div className="w-full">
          <button
            type="button"
            onMouseDown={() => setIsReeling(true)}
            onMouseUp={() => setIsReeling(false)}
            onMouseLeave={() => setIsReeling(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsReeling(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsReeling(false);
            }}
            disabled={isBroken || isVictory}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] ${
              isReeling
                ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-slate-950 shadow-cyan-500/50 scale-[0.99] border-2 border-white'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 border-2 border-amber-300'
            }`}
          >
            <Disc className={`w-5 h-5 ${isReeling ? 'animate-spin text-slate-950' : ''}`} />
            <span>
              {isReeling ? 'RECOLHENDO LINHA... (SOLTE PARA ALIVIAR)' : 'SEGURE P/ RECOLHER (ESPAÇO)'}
            </span>
          </button>
          <div className="text-[11px] text-slate-400 mt-2">
            💡 Dica: Segure o botão para puxar. Quando o peixe der arrancada, solte para não estourar a linha!
          </div>
        </div>

        {/* ── OVERLAY DE LINHA ESTOURADA (SNAP) ── */}
        <AnimatePresence>
          {isBroken && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-6 text-center z-30"
            >
              <XCircle className="w-16 h-16 text-red-500 mb-3 animate-bounce" />
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
                A LINHA ARREBENTOU!
              </h3>
              <p className="text-sm text-red-200">
                A tensão ultrapassou o limite e o peixe escapou de volta para as profundezas!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── OVERLAY DE VITÓRIA (CAPTURADO) ── */}
        <AnimatePresence>
          {isVictory && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyan-950/95 flex flex-col items-center justify-center p-6 text-center z-30"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3 animate-bounce" />
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
                PEIXE DOMINADO!
              </h3>
              <p className="text-sm text-cyan-200">
                Você venceu a batalha e puxou a presa para fora d'água com sucesso!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
