// src/components/TitanEncounterModal.tsx
// ─────────────────────────────────────────────────────────────
// ENCONTRO COM O TITÃ ANCESTRAL (CHEFE LENDÁRIO DO BIOMA)
// Batalha de pesca épica com fases de tensão, contragolpes direcionais
// e apresentação respeitosa da arte oficial e da relíquia única.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TitanData } from '../game/data/titans.data.js';
import { GameAssetImage } from './GameAssetImage.js';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Disc,
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  Waves,
  Zap,
} from 'lucide-react';

interface TitanEncounterModalProps {
  isOpen: boolean;
  titan: TitanData;
  rodName?: string;
  onVictory: (relicClaimed: boolean) => void;
  onEscape: () => void;
}

type FishDirection = 'left' | 'center' | 'right';
type PlayerDirection = 'left' | 'center' | 'right';

export const TitanEncounterModal: React.FC<TitanEncounterModalProps> = ({
  isOpen,
  titan,
  rodName = 'Vara de Pesca',
  onVictory,
  onEscape,
}) => {
  // Parâmetros da luta titânica
  const initialDistance = 75; // 75 metros de cabo nas profundezas

  // Estados principais da batalha
  const [distance, setDistance] = useState(initialDistance);
  const [tension, setTension] = useState(35); // 0 a 100
  const [fishDirection, setFishDirection] = useState<FishDirection>('center');
  const [playerDirection, setPlayerDirection] = useState<PlayerDirection>('center');
  const [isReeling, setIsReeling] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [fightPhase, setFightPhase] = useState<'deep_surge' | 'mud_resistance' | 'final_ascent'>('deep_surge');

  // Refs de física de precisão em 60fps
  const distanceRef = useRef(initialDistance);
  const tensionRef = useRef(35);
  const isReelingRef = useRef(false);
  const isEndedRef = useRef(false);
  const criticalTimeRef = useRef(0);
  const fishDirRef = useRef<FishDirection>('center');
  const playerDirRef = useRef<PlayerDirection>('center');
  const fightPhaseRef = useRef<'deep_surge' | 'mud_resistance' | 'final_ascent'>('deep_surge');

  // Sincroniza refs com estado
  useEffect(() => {
    fishDirRef.current = fishDirection;
  }, [fishDirection]);

  useEffect(() => {
    playerDirRef.current = playerDirection;
  }, [playerDirection]);

  // Inicialização do encontro
  useEffect(() => {
    if (isOpen) {
      setDistance(initialDistance);
      setTension(35);
      setFishDirection('center');
      setPlayerDirection('center');
      setIsReeling(false);
      setIsBroken(false);
      setIsVictory(false);
      setIsCritical(false);
      setFightPhase('deep_surge');

      distanceRef.current = initialDistance;
      tensionRef.current = 35;
      isReelingRef.current = false;
      isEndedRef.current = false;
      criticalTimeRef.current = 0;
      fishDirRef.current = 'center';
      playerDirRef.current = 'center';
      fightPhaseRef.current = 'deep_surge';

      // Efeitos de som e imersão inicial
      sound.playTitanAwakening();
      vibrate.heavy();
    }
  }, [isOpen]);

  // Ciclo de movimentação e arrancadas do Titã
  useEffect(() => {
    if (!isOpen || isBroken || isVictory) return;

    const dirInterval = setInterval(() => {
      if (isEndedRef.current) return;
      const dirs: FishDirection[] = ['left', 'center', 'right'];
      const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
      setFishDirection(nextDir);
      fishDirRef.current = nextDir;

      // Solavanco com som de água
      if (nextDir !== 'center') {
        sound.playSplash();
        vibrate.fishThrash();
      }
    }, 2800);

    return () => clearInterval(dirInterval);
  }, [isOpen, isBroken, isVictory]);

  // Loop de física e tensão em tempo real (60fps)
  useEffect(() => {
    if (!isOpen || isBroken || isVictory) return;

    const interval = setInterval(() => {
      if (isEndedRef.current) return;
      const dt = 0.016; // 16ms passo de física

      // Atualiza a fase da luta com base na distância e dispara transição dramática
      let nextPhase: 'deep_surge' | 'mud_resistance' | 'final_ascent' = 'deep_surge';
      if (distanceRef.current > 45) {
        nextPhase = 'deep_surge';
      } else if (distanceRef.current > 18) {
        nextPhase = 'mud_resistance';
      } else {
        nextPhase = 'final_ascent';
      }

      if (fightPhaseRef.current !== nextPhase) {
        fightPhaseRef.current = nextPhase;
        setFightPhase(nextPhase);
        sound.playSplash();
        vibrate.fishThrash();
      }

      // 1. Dinâmica da Tensão
      let tensionChange = 0;
      if (isReelingRef.current) {
        // Puxando carretilha: tensão aumenta
        tensionChange += 34 * dt;
      } else {
        // Aliviando carretilha: tensão cede
        tensionChange -= 26 * dt;
      }

      // 2. Contragolpe Direcional (inclinando a vara contra a arrancada do Titã)
      const fDir = fishDirRef.current;
      const pDir = playerDirRef.current;
      const isCountering =
        (fDir === 'left' && pDir === 'right') ||
        (fDir === 'right' && pDir === 'left') ||
        (fDir === 'center' && pDir === 'center');

      if (fDir !== 'center' && !isCountering) {
        // Se o jogador não contragolpear o solavanco do Titã, a tensão dispara!
        tensionChange += 22 * dt;
      } else if (isCountering && fDir !== 'center') {
        // Contragolpe bem executado estabiliza a linha
        tensionChange -= 8 * dt;
      }

      // Aplica delta de tensão
      tensionRef.current = Math.max(0, Math.min(100, tensionRef.current + tensionChange));
      setTension(tensionRef.current);

      // 3. Recolhimento da Distância
      if (isReelingRef.current) {
        // Na zona ideal de tensão (40% a 80%), o recolhimento é altamente eficaz
        if (tensionRef.current >= 40 && tensionRef.current <= 82) {
          const reelSpeed = (isCountering ? 8.5 : 5.5) * dt;
          distanceRef.current = Math.max(0, distanceRef.current - reelSpeed);
        } else if (tensionRef.current < 30) {
          // Linha frouxa demais permite ao Titã ganhar terreno
          distanceRef.current = Math.min(initialDistance, distanceRef.current + 2.5 * dt);
        } else {
          // Tensão alta demais desacelera o recolhimento pelo atrito
          distanceRef.current = Math.max(0, distanceRef.current - 2.0 * dt);
        }
      } else {
        // Sem recolher, o Titã nada lentamente para o fundo
        distanceRef.current = Math.min(initialDistance, distanceRef.current + 1.2 * dt);
      }
      setDistance(distanceRef.current);

      // 4. Checagem de Ruptura por Tensão Crítica (> 88%)
      if (tensionRef.current >= 88) {
        setIsCritical(true);
        criticalTimeRef.current += dt;
        sound.playTensionStrain(criticalTimeRef.current);

        if (criticalTimeRef.current > 0.35 && Math.random() < 0.25) {
          vibrate.lineStrain();
        }

        // Se passar de 1.4s em tensão extrema, a linha arrebenta!
        if (criticalTimeRef.current >= 1.4) {
          isEndedRef.current = true;
          setIsBroken(true);
          sound.playLineSnap();
          vibrate.lineSnap();
          setTimeout(() => {
            onEscape();
          }, 1400);
          return;
        }
      } else {
        setIsCritical(false);
        criticalTimeRef.current = Math.max(0, criticalTimeRef.current - dt * 2.0);
      }

      // 5. Checagem de Vitória (0 metros de distância)
      if (distanceRef.current <= 0.2) {
        isEndedRef.current = true;
        setDistance(0);
        setIsVictory(true);
        sound.playTitanConquered();
        vibrate.perfectHit();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isOpen, isBroken, isVictory, onEscape]);

  // Controles táteis de carretilha
  const handleStartReeling = useCallback(() => {
    if (isBroken || isVictory) return;
    isReelingRef.current = true;
    setIsReeling(true);
    sound.playReel(110);
  }, [isBroken, isVictory]);

  const handleEndReeling = useCallback(() => {
    isReelingRef.current = false;
    setIsReeling(false);
  }, []);

  // Controles direcionais
  const handleSetDirection = (dir: PlayerDirection) => {
    setPlayerDirection(dir);
    playerDirRef.current = dir;
    if (
      (dir === 'left' && fishDirRef.current === 'right') ||
      (dir === 'right' && fishDirRef.current === 'left')
    ) {
      sound.playPerfectCounter();
      vibrate.perfectHit();
    }
  };

  // Suporte a teclado (Espaço para recolher, A/D e Setas para contragolpear)
  useEffect(() => {
    if (!isOpen || isBroken || isVictory) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleStartReeling();
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSetDirection('left');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleSetDirection('right');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleSetDirection('center');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleEndReeling();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen, isBroken, isVictory, handleStartReeling, handleEndReeling]);

  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (1 - distance / initialDistance) * 100));

  // Configuração progressiva das 3 fases do combate (1 assetId por fase para suspense)
  const phaseInfo = {
    deep_surge: {
      phaseNumber: 1,
      assetId: titan.phaseAssets?.phase1 || titan.assetId,
      name: `Silhueta das Profundezas (${titan.name})`,
      label: 'Fase 1: Arrancada das Profundezas',
      subtitle: 'Silhueta oculta no leito profundo',
      depthRange: '75m - 45m',
      desc: 'O Titã puxa com força colossal para o fundo. Firme a carretilha!',
      color: 'text-lime-400 bg-lime-950/70 border-lime-500/30',
      tagColor: 'bg-lime-500/15 border-lime-500/30 text-lime-300',
      glow: 'from-stone-950 via-lime-950/40 to-stone-950',
    },
    mud_resistance: {
      phaseNumber: 2,
      assetId: titan.phaseAssets?.phase2 || titan.assetId,
      name: `Vulto Colossal em Agitação (${titan.name})`,
      label: 'Fase 2: Resistência no Lodo',
      subtitle: 'Vulto emergindo entre raízes e turbulência',
      depthRange: '45m - 18m',
      desc: 'Solavancos pesados no leito. Incline a vara para contragolpear!',
      color: 'text-amber-400 bg-amber-950/70 border-amber-500/30',
      tagColor: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      glow: 'from-stone-950 via-amber-950/40 to-stone-950',
    },
    final_ascent: {
      phaseNumber: 3,
      assetId: titan.phaseAssets?.phase3 || titan.assetId,
      name: titan.name,
      label: 'Fase 3: Ascensão à Superfície',
      subtitle: 'O Titã rompe a superfície das águas!',
      depthRange: '< 18m',
      desc: 'O Titã emerge em sua glória! Mantenha a tensão e recolha!',
      color: 'text-sky-400 bg-sky-950/70 border-sky-500/30',
      tagColor: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      glow: 'from-stone-950 via-sky-950/40 to-stone-950',
    },
  }[fightPhase];

  return (
    <div
      id="titan-encounter-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none touch-none"
    >
      <motion.div
        id="titan-encounter-modal"
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`relative w-[95vw] sm:w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900/98 rounded-3xl p-4 sm:p-5 border-2 shadow-2xl text-center flex flex-col items-center transition-colors duration-200 ${
          isCritical
            ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.45)]'
            : 'border-lime-500/50 shadow-[0_0_40px_rgba(132,204,22,0.25)]'
        }`}
      >
        {/* Flash em Tensão Crítica */}
        {isCritical && (
          <div className="absolute inset-0 bg-red-500/10 rounded-3xl pointer-events-none animate-pulse" />
        )}

        {/* ── ESTADO: VITÓRIA & REVELAÇÃO DA RELÍQUIA ── */}
        {isVictory ? (
          <div className="w-full space-y-4 py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-500/15 border border-lime-500/40 text-lime-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-lime-400" />
              <span>Titã Ancestral Domado!</span>
            </div>

            <div className="flex flex-col items-center justify-center py-1">
              <GameAssetImage
                assetId={titan.phaseAssets?.phase3 || titan.assetId}
                name={titan.name}
                rarity="titan"
                size="lg"
                className="rounded-2xl shadow-xl border-2 border-lime-500/50"
              />
              <h3 className="text-xl font-black text-slate-100 mt-2.5">
                {titan.name}
              </h3>
              <p className="text-xs text-lime-300/90 font-medium">
                {titan.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                <span>{titan.weightKg} kg</span>
                <span>•</span>
                <span>{titan.lengthMeters} metros</span>
                <span>•</span>
                <span>+{titan.baseXpReward} XP</span>
              </div>
            </div>

            {/* Cartão de Exibição da Relíquia Ancestral Conquistada */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2.5">
                <GameAssetImage
                  assetId={titan.relic.assetId}
                  name={titan.relic.name}
                  rarity="ancestral_relic"
                  size="sm"
                  className="rounded-xl shadow-md shrink-0 border border-amber-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    {titan.relic.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Relíquia Ancestral Única
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                {titan.relic.lore}
              </p>
              <div className="pt-2 border-t border-slate-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Bônus Permanente: {titan.relic.passiveBonus.label}</span>
              </div>
            </div>

            {/* Botão de Envio ao Aquário / Viveiro */}
            <button
              id="titan-claim-victory-btn"
              onClick={() => onVictory(true)}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-lime-500/25 transition-all transform active:scale-95"
            >
              Acolher no Viveiro & Guardar Relíquia
            </button>
          </div>
        ) : isBroken ? (
          /* ── ESTADO: LINHA ARREBENTADA ── */
          <div className="w-full py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-red-300">
              A Linha Rompeu!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              O peso colossal do {titan.name} superou a resistência da linha.
              Ele submergiu nas profundezas escuras do leito...
            </p>
            <span className="text-[11px] text-slate-400 block font-medium">
              O Titã não foi domado e poderá ser reencontrado no futuro.
            </span>
          </div>
        ) : (
          /* ── ESTADO: BATALHA ATIVA DO TITÃ ── */
          <div className="w-full space-y-3">
            {/* Cabeçalho */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-xl bg-lime-950/80 border border-lime-500/40 flex items-center justify-center text-base shadow-inner">
                  🌿
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                    {titan.name}
                  </h3>
                  <span className="text-[10px] text-lime-400 font-medium">
                    Titã Ancestral • {titan.title}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Distância
                </span>
                <span className="text-sm font-black font-mono text-lime-300">
                  {distance.toFixed(1)}m
                </span>
              </div>
            </div>

            {/* Indicador Progressivo das 3 Fases do Encontro */}
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {[
                { phase: 'deep_surge', num: '1', title: 'Profundezas', range: '75m - 45m' },
                { phase: 'mud_resistance', num: '2', title: 'Resistência', range: '45m - 18m' },
                { phase: 'final_ascent', num: '3', title: 'Superfície', range: '< 18m' },
              ].map((p) => {
                const isActive = fightPhase === p.phase;
                const isPassed =
                  (p.phase === 'deep_surge' && (fightPhase === 'mud_resistance' || fightPhase === 'final_ascent')) ||
                  (p.phase === 'mud_resistance' && fightPhase === 'final_ascent');

                return (
                  <div
                    key={p.phase}
                    className={`py-1 px-1 rounded-xl border text-[10px] text-center transition-all ${
                      isActive
                        ? 'bg-lime-500/20 border-lime-400/80 text-lime-300 font-bold shadow-[0_0_12px_rgba(132,204,22,0.2)]'
                        : isPassed
                        ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className="block leading-tight font-bold">Fase {p.num}: {p.title}</span>
                    <span className="text-[9px] opacity-75 font-mono block">{p.range}</span>
                  </div>
                );
              })}
            </div>

            {/* Tag da Fase Atual */}
            <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center justify-between gap-1.5 ${phaseInfo.color}`}>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{phaseInfo.label}</span>
              </span>
              <span className="text-[10px] opacity-85 font-mono">
                {phaseInfo.depthRange}
              </span>
            </div>

            {/* Arte Central Oficial do Titã com Transição Progressiva de Suspense */}
            <div className={`relative w-full h-36 rounded-2xl bg-gradient-to-b ${phaseInfo.glow} border border-slate-800 flex items-center justify-center overflow-hidden transition-all duration-500`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_75%)] pointer-events-none" />

              {/* Subtítulo da Fase com Atmosfera de Suspense */}
              <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none text-[10px]">
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${phaseInfo.tagColor}`}>
                  Fase {phaseInfo.phaseNumber} de 3
                </span>
                <span className="text-slate-400 font-medium italic">
                  {phaseInfo.subtitle}
                </span>
              </div>

              {/* Imagem do Titã na Fase Correspondente */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseInfo.assetId}
                  initial={{ opacity: 0, scale: 0.88, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.06, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center justify-center pt-3"
                >
                  <GameAssetImage
                    assetId={phaseInfo.assetId}
                    name={phaseInfo.name}
                    rarity="titan"
                    size="lg"
                    className="scale-95 hover:scale-100 transition-transform"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Indicador de Movimento do Titã */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between px-2 text-[10px] font-mono z-10">
                <span
                  className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                    fishDirection === 'left'
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'text-slate-500'
                  }`}
                >
                  ← Puxando p/ Esquerda
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                    fishDirection === 'center'
                      ? 'bg-slate-700 text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  Fundo
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                    fishDirection === 'right'
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'text-slate-500'
                  }`}
                >
                  Puxando p/ Direita →
                </span>
              </div>
            </div>

            {/* Barra de Progresso de Recolhimento */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Profundezas (75m)</span>
                <span>Superfície (0m)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-lime-500 to-emerald-400"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Medidor de Tensão da Linha */}
            <div className="w-full space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-sky-400" />
                  Tensão da Linha (Ideal: 40% a 80%)
                </span>
                <span
                  className={`font-mono font-black ${
                    tension >= 88
                      ? 'text-red-400 animate-pulse'
                      : tension >= 40 && tension <= 82
                      ? 'text-lime-400'
                      : 'text-slate-300'
                  }`}
                >
                  {Math.round(tension)}%
                </span>
              </div>

              <div className="relative w-full h-4 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                {/* Marcador de Zona Ideal (40% - 80%) */}
                <div className="absolute left-[40%] right-[20%] top-0 bottom-0 bg-lime-500/20 border-x border-lime-500/40 pointer-events-none" />

                <motion.div
                  className={`h-full rounded-full transition-colors duration-150 ${
                    tension >= 88
                      ? 'bg-gradient-to-r from-red-600 to-rose-500'
                      : tension >= 40 && tension <= 82
                      ? 'bg-gradient-to-r from-lime-500 to-emerald-400'
                      : 'bg-gradient-to-r from-sky-500 to-blue-500'
                  }`}
                  animate={{ width: `${tension}%` }}
                  transition={{ duration: 0.08 }}
                />
              </div>
            </div>

            {/* Controles de Inclinação Direcional da Vara */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Contragolpe Direcional com a Vara
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSetDirection('left')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    playerDirection === 'left'
                      ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Esquerda</span>
                </button>
                <button
                  onClick={() => handleSetDirection('center')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    playerDirection === 'center'
                      ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>Centro</span>
                </button>
                <button
                  onClick={() => handleSetDirection('right')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    playerDirection === 'right'
                      ? 'bg-lime-500 text-slate-950 border-lime-400 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>Direita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Botão Principal de Carretilha (Recolher / Aliviar Linha) */}
            <div className="pt-2">
              <button
                id="titan-reel-button"
                onMouseDown={handleStartReeling}
                onMouseUp={handleEndReeling}
                onTouchStart={handleStartReeling}
                onTouchEnd={handleEndReeling}
                className={`w-full py-4 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl touch-manipulation select-none active:scale-95 ${
                  isReeling
                    ? 'bg-lime-500 text-slate-950 shadow-lime-500/40 ring-4 ring-lime-500/25'
                    : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-100 border border-slate-600'
                }`}
              >
                <Disc className={`w-5 h-5 ${isReeling ? 'animate-spin' : ''}`} />
                <span>
                  {isReeling ? 'RECOLHENDO CARRETILHA...' : 'SEGURE PARA RECOLHER A LINHA'}
                </span>
              </button>
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Solte o botão para aliviar se a tensão entrar na zona vermelha!
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
