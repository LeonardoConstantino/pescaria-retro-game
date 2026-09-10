// src/components/FishingStage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameLocation } from '../game/data/locations.data.js';
import { GameItem } from '../game/data/items.data.js';
import { FishingSession } from '../game/managers/SessionManager.js';
import { GameAssetImage } from './GameAssetImage.js';
import { FishShadows } from './FishShadows.js';
import { IdleFishersWaterVisual } from './IdleFishersWaterVisual.js';
import { GoldenFishSpawner } from './GoldenFishSpawner.js';
import { sound } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';
import { WeatherInfo } from '../game/data/weather.data.js';
import {
  Anchor,
  CircleDot,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface FishingStageProps {
  player: PlayerProfile;
  currentLocation: GameLocation;
  currentRod: GameItem | null;
  currentBait: GameItem | null;
  activeSession: FishingSession | null;
  isCasting: boolean;
  isCollecting: boolean;
  onCast: () => void;
  onCollect: () => void;
  onWaterClick?: (e: React.MouseEvent) => void;
  onCatchGoldenFish?: () => void;
  clickPower?: number;
  screenShake: boolean;
  weather?: WeatherInfo;
}

export const FishingStage: React.FC<FishingStageProps> = ({
  player,
  currentLocation,
  currentRod,
  currentBait,
  activeSession,
  isCasting,
  isCollecting,
  onCast,
  onCollect,
  onWaterClick,
  onCatchGoldenFish,
  clickPower = 1,
  screenShake,
  weather,
}) => {
  const [now, setNow] = useState(Date.now());
  const [showFishPool, setShowFishPool] = useState(false);

  // Intervalo para atualizar estado de prontidão da sessão
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Atalho de teclado: Barra de Espaço
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (activeSession) {
          if (now >= activeSession.readyAt && !isCollecting) {
            onCollect();
          }
        } else if (!isCasting) {
          onCast();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSession, now, isCasting, isCollecting, onCast, onCollect]);

  const hasSession = !!activeSession;
  const isReady = hasSession && now >= activeSession.readyAt;
  const remainingWaitMs = hasSession ? Math.max(0, activeSession.readyAt - now) : 0;
  const totalWaitMs = hasSession ? activeSession.waitMs : 5000;
  const waitProgress = hasSession
    ? Math.min(100, Math.max(0, ((totalWaitMs - remainingWaitMs) / totalWaitMs) * 100))
    : 0;

  // Toca som de fisgada e vibra quando a boia fica pronta
  const playedBiteRef = useRef(false);
  useEffect(() => {
    if (isReady && !playedBiteRef.current) {
      sound.playBite();
      vibrate.bite();
      playedBiteRef.current = true;
    } else if (!hasSession) {
      playedBiteRef.current = false;
    }
  }, [isReady, hasSession]);

  // Background visual específico do local
  const getLocationVisual = () => {
    switch (currentLocation.id) {
      case 'lake':
        return {
          sky: 'from-sky-950 via-cyan-950 to-slate-900',
          water: 'from-cyan-900/90 via-teal-900/95 to-slate-950',
          ambientRipples: 'border-cyan-400/20',
          decor: '🏔️ Montanhas serenas e reflexo cristalino',
        };
      case 'river':
        return {
          sky: 'from-teal-950 via-emerald-950 to-slate-950',
          water: 'from-emerald-900/90 via-teal-950/95 to-slate-950',
          ambientRipples: 'border-emerald-400/30',
          decor: '🌊 Corredeiras rápidas e pedras ribeirinhas',
        };
      case 'swamp':
        return {
          sky: 'from-stone-950 via-lime-950/50 to-slate-950',
          water: 'from-lime-950/90 via-emerald-950 to-stone-950',
          ambientRipples: 'border-lime-500/20',
          decor: '🌿 Pântano misterioso com névoa rasteira',
        };
      case 'sea':
        return {
          sky: 'from-blue-950 via-indigo-950 to-slate-900',
          water: 'from-blue-900/90 via-indigo-950/95 to-slate-950',
          ambientRipples: 'border-blue-400/30',
          decor: '⛵ Mar aberto com ondas vigorosas',
        };
      case 'deep_sea':
        return {
          sky: 'from-indigo-950 via-purple-950 to-black',
          water: 'from-purple-950/95 via-indigo-950 to-black',
          ambientRipples: 'border-purple-500/30',
          decor: '🌌 Abismo oceânico com criaturas bioluminescentes',
        };
      default:
        return {
          sky: 'from-slate-900 to-slate-950',
          water: 'from-blue-900 to-slate-950',
          ambientRipples: 'border-sky-400/20',
          decor: 'Pescaria nas águas',
        };
    }
  };

  const locVisual = getLocationVisual();
  const baitCount = currentBait ? player.inventory.items[currentBait.id] || 0 : 0;

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl transition-transform duration-100 ${
        screenShake ? 'animate-[wiggle_0.3s_ease-in-out_infinite]' : ''
      }`}
    >
      {/* Cenário: Céu e Horizonte */}
      <div
        className={`relative w-full h-80 sm:h-96 bg-gradient-to-b ${locVisual.sky} flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none`}
      >
        {/* Camada Panorâmica do Asset do Local (com transparência atmosférica, blend mode e degradê suave) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={`${import.meta.env.BASE_URL}${currentLocation.assetId}.png`}
            alt={currentLocation.name}
            onError={(e) => {
              // Se a imagem não carregar, oculta suavemente sem quebrar o layout
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter saturate-150 contrast-125 scale-105 transition-all duration-700"
          />
          {/* Degradês de integração para fundir a imagem com o céu e com a água */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />
        </div>

        {/* Estrelas / Partículas de Ambiente */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] z-[1]" />

        {/* Camada Superior: Cartões de Vara & Isca equipadas */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          {/* Cartão da Vara Equipada */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <GameAssetImage
              assetId={currentRod?.assetId || 'rod_basic'}
              name={currentRod?.name || 'Vara Básica'}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Vara Equipada
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                {currentRod?.name || 'Vara Básica'}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-sky-400 font-medium">
                {currentRod?.modifiers.xpMultiplier && currentRod.modifiers.xpMultiplier > 1 && (
                  <span>+{Math.round((currentRod.modifiers.xpMultiplier - 1) * 100)}% XP</span>
                )}
                {currentRod?.modifiers.cooldownModifier && (
                  <span>{currentRod.modifiers.cooldownModifier / 1000}s espera</span>
                )}
              </div>
            </div>
          </div>

          {/* Cartão da Isca Ativa */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            {currentBait ? (
              <>
                <GameAssetImage
                  assetId={currentBait.assetId}
                  name={currentBait.name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Isca Ativa
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-amber-300">
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
                <CircleDot className="w-5 h-5 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Isca
                  </span>
                  <span className="text-xs text-slate-400 italic">Sem isca ativa</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informação do Local e Botão de Dica / Espécies */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/60 backdrop-blur-md shadow-lg">
            <GameAssetImage
              assetId={currentLocation.assetId}
              name={currentLocation.name}
              size="xs"
              className="rounded-lg ring-sky-400/40"
            />
            <div>
              <span className="text-xs font-bold text-slate-200">{currentLocation.name}</span>
              <p className="text-[10px] text-slate-400 hidden sm:block">{locVisual.decor}</p>
            </div>
          </div>

          <button
            onClick={() => setShowFishPool(!showFishPool)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50 transition-all hover:scale-105 active:scale-95"
            title="Ver peixes deste local"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Espécies Nativas</span>
          </button>
        </div>

        {/* Modal/Gaveta de Espécies Nativas */}
        <AnimatePresence>
          {showFishPool && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 z-20 w-72 p-3 rounded-2xl bg-slate-900/95 border border-sky-500/30 backdrop-blur-xl shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-bold text-sky-300">Peixes em {currentLocation.name}:</span>
                <button
                  onClick={() => setShowFishPool(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {currentLocation.fishPool.map((fId) => (
                  <div key={fId} className="flex items-center gap-2 py-0.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <span className="capitalize">{fId.replace('fish_', '').replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ÁGUA & BOIA INTERATIVA ── */}
        <div
          className="absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950 cursor-pointer select-none"
          onClick={(e) => {
            // Se o peixe estiver mordendo, não trata como clique comum de água
            if (isReady) {
              onCollect();
            } else if (onWaterClick) {
              onWaterClick(e);
            }
          }}
          title={isReady ? 'Clique para recolher!' : `Toque na água para fisgar moedas (+${clickPower} 🪙)`}
        >
          {/* Spawner do Peixe Dourado (Golden Fish) */}
          {onCatchGoldenFish && (
            <GoldenFishSpawner
              onCatchGoldenFish={onCatchGoldenFish}
              chanceMultiplier={weather?.goldenFishChanceMult || 1.0}
            />
          )}

          {/* Superfície da Água com Ondas */}
          <div
            className={`w-full h-full bg-gradient-to-t ${locVisual.water} backdrop-blur-[2px] relative flex items-center justify-center overflow-hidden`}
          >
            {/* Efeito Visual de Clima Ativo (Gotas de Chuva / Relâmpagos / Brilho Lunar) */}
            {weather?.id === 'rainy' && (
              <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
              </div>
            )}
            {weather?.id === 'storm' && (
              <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-indigo-500/10 animate-pulse" />
            )}
            {weather?.id === 'mystic_moon' && (
              <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-violet-500/10 via-transparent to-transparent opacity-60" />
            )}

            {/* Linhas de Ondulação na Água */}
            <div className="absolute inset-0 opacity-40">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent animate-pulse" />
            </div>

            {/* Silhuetas de Peixes Nadando no Fundo d'Água */}
            <FishShadows locationId={currentLocation.id} isBiting={isReady} />

            {/* Boias Cômicas dos Ajudantes Automatizados (Estilo Cookie Clicker) */}
            <IdleFishersWaterVisual idleFishers={player.idleFishers || {}} />

            {/* Linha de Pesca SVG desenhada da vara à boia quando houver sessão */}
            {hasSession && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <motion.path
                  d="M 120 40 Q 300 120, 50% 50%"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray={isReady ? '4 2' : 'none'}
                />
              </svg>
            )}

            {/* A BOIA */}
            <div className="relative z-10 flex flex-col items-center">
              {hasSession ? (
                <div className="relative flex flex-col items-center">
                  {/* Alerta Visual de Mordida (Bite) */}
                  {isReady && (
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: [1, 1.25, 1], y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 0.45 }}
                      className="absolute -top-12 z-20 flex flex-col items-center cursor-pointer"
                      onClick={onCollect}
                    >
                      <div className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs sm:text-sm font-black tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.9)] border-2 border-slate-950 flex items-center gap-1.5 animate-bounce">
                        <Sparkles className="w-3.5 h-3.5" />
                        FISGOU! RECOLHA!
                      </div>
                      <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1" />
                    </motion.div>
                  )}

                  {/* Círculos de Ondulação concêntricos expandindo da boia */}
                  <motion.div
                    animate={{
                      scale: isReady ? [1, 2.5] : [1, 1.8],
                      opacity: isReady ? [0.9, 0] : [0.6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: isReady ? 0.6 : 2.2,
                      ease: 'easeOut',
                    }}
                    className={`absolute w-16 h-8 rounded-full border-2 ${
                      isReady ? 'border-amber-400' : 'border-sky-300'
                    } -bottom-2`}
                  />

                  {/* O Corpo da Boia (Vermelho e Branco, ou Dourada) */}
                  <motion.div
                    animate={
                      isReady
                        ? {
                            y: [0, 8, -4, 6, 0],
                            rotate: [-15, 20, -10, 15, 0],
                          }
                        : {
                            y: [-3, 3, -3],
                            rotate: [-3, 3, -3],
                          }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: isReady ? 0.35 : 2.0,
                      ease: 'easeInOut',
                    }}
                    className="relative cursor-pointer select-none"
                    onClick={() => {
                      if (isReady) onCollect();
                    }}
                  >
                    <div
                      className={`w-8 h-10 rounded-full shadow-2xl border-2 border-slate-900 flex flex-col overflow-hidden ${
                        isReady
                          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900'
                          : ''
                      }`}
                    >
                      <div className="w-full h-1/2 bg-red-500" />
                      <div className="w-full h-1/2 bg-white" />
                      {/* Antena da Boia */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-amber-300 rounded-t" />
                    </div>
                  </motion.div>

                  {/* Texto de Status flutuante */}
                  <span
                    className={`mt-2 text-[11px] font-bold tracking-wide drop-shadow-md ${
                      isReady ? 'text-amber-300 animate-pulse' : 'text-sky-200'
                    }`}
                  >
                    {isReady
                      ? '⚡ O peixe mordeu!'
                      : `Aguardando a fisgada... (${Math.ceil(remainingWaitMs / 1000)}s)`}
                  </span>
                </div>
              ) : (
                /* Estado Repouso (Linha recolhida) */
                <div className="flex flex-col items-center opacity-85 pointer-events-none">
                  <div className="w-14 h-4 rounded-full bg-slate-900/60 blur-sm" />
                  <span className="text-xs text-sky-200/90 font-medium tracking-wide">
                    Águas calmas. Lance sua linha ou toque na água para catar moedas!
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold mt-1 bg-slate-950/60 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Toque na água: +{clickPower} 🪙
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA INFERIOR DE CONTROLE E AÇÃO DINÂMICA ── */}
      <div className="bg-slate-950 p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Barra de Progresso / Tensão */}
        <div className="w-full sm:w-auto flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {hasSession
                ? isReady
                  ? 'Fisgada firme na linha!'
                  : 'Aguardando o peixe morder...'
                : 'Pronto para lançar'}
            </span>
            <span className="text-slate-400 text-[11px]">
              Dica: aperte <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[10px]">Espaço</kbd>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className={`h-full rounded-full transition-all duration-200 ${
                isReady
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse'
                  : 'bg-gradient-to-r from-sky-500 to-teal-400'
              }`}
              style={{ width: hasSession ? (isReady ? '100%' : `${waitProgress}%`) : '0%' }}
            />
          </div>
        </div>

        {/* ── BOTÃO DE AÇÃO PRINCIPAL ── */}
        <div className="w-full sm:w-auto shrink-0">
          {hasSession ? (
            /* Botão Recolher / Puxar Linha */
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={isCollecting}
              onClick={onCollect}
              className={`w-full sm:w-64 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                isReady
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/40 ring-4 ring-amber-400/50 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              {isReady ? (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
                  PUXAR LINHA AGORA!
                </>
              ) : (
                <>
                  <Anchor className="w-4 h-4 text-slate-400 animate-spin-slow" />
                  AGUARDANDO FISGADA...
                </>
              )}
            </motion.button>
          ) : (
            /* Botão Lançar Linha */
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={isCasting}
              onClick={onCast}
              className="w-full sm:w-64 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Anchor className="w-5 h-5 text-slate-950" />
              LANÇAR LINHA
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
