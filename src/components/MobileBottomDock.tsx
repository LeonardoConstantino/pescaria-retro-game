// src/components/MobileBottomDock.tsx
// ─────────────────────────────────────────────────────────────
// Dock de Navegação Inferior para Dispositivos Móveis
// Acesso rápido aos recursos mais frequentes com touch targets ergonômicos
// e gaveta de opções extras para manter o visual limpo e imersivo.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Anchor,
  Package,
  ShoppingBag,
  Scroll,
  GraduationCap,
  MoreHorizontal,
  Waves,
  Bot,
  MapPin,
  Sparkles,
  Trophy,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
} from 'lucide-react';
import { sound } from '../utils/audio.js';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameLocation } from '../game/data/locations.data.js';

interface MobileBottomDockProps {
  player: PlayerProfile;
  currentLocation: GameLocation;
  totalCps: number;
  unclaimedMissionsCount: number;
  availableTalentPoints: number;
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onOpenIdleShop: () => void;
  onOpenPrestige: () => void;
  onOpenAchievements: () => void;
  onOpenLocations: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenAquarium: () => void;
  onOpenTalents: () => void;
  onOpenBestiary: () => void;
  onResetProgress: () => void;
  onScrollToFishingStage?: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  player,
  currentLocation,
  totalCps,
  unclaimedMissionsCount,
  availableTalentPoints,
  onOpenInventory,
  onOpenShop,
  onOpenIdleShop,
  onOpenPrestige,
  onOpenAchievements,
  onOpenLocations,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenAquarium,
  onOpenTalents,
  onOpenBestiary,
  onResetProgress,
  onScrollToFishingStage,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(!sound.enabled);

  const toggleMute = () => {
    const active = sound.toggleSound();
    setIsMuted(!active);
  };

  const handleAction = (action: () => void) => {
    sound.playWaterClick(false);
    action();
  };

  const fishCount = player.inventory.fish.length;
  const aquariumFishCount = player.aquarium?.fish.length || 0;

  return (
    <>
      {/* ── BARRA FIXA INFERIOR NO MOBILE (SM:HIDDEN) ── */}
      <nav
        id="mobile-bottom-dock"
        aria-label="Navegação Principal Mobile"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around"
      >
        {/* 1. PESCAR / PALCO */}
        <button
          type="button"
          onClick={() => {
            sound.playWaterClick(false);
            if (onScrollToFishingStage) {
              onScrollToFishingStage();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-sky-400 active:scale-95 transition-transform"
          title="Área de Pesca"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shadow-sm">
            <Anchor className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-sky-300">Pescar</span>
        </button>

        {/* 2. CESTO / INVENTÁRIO */}
        <button
          type="button"
          onClick={() => handleAction(onOpenInventory)}
          className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-emerald-400 active:scale-95 transition-transform"
          title="Cesto de Peixes"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-sm relative">
            <Package className="w-4 h-4 text-emerald-400" />
            {fishCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md">
                {fishCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-emerald-300">Cesto</span>
        </button>

        {/* 3. LOJA */}
        <button
          type="button"
          onClick={() => handleAction(onOpenShop)}
          className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-amber-400 active:scale-95 transition-transform"
          title="Loja de Varas e Iscas"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-amber-300">Loja</span>
        </button>

        {/* 4. MISSÕES */}
        <button
          type="button"
          onClick={() => handleAction(onOpenMissions)}
          className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-yellow-400 active:scale-95 transition-transform"
          title="Missões Diárias"
        >
          <div className="w-8 h-8 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shadow-sm relative">
            <Scroll className="w-4 h-4 text-yellow-400" />
            {unclaimedMissionsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md animate-bounce">
                {unclaimedMissionsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-yellow-300">Missões</span>
        </button>

        {/* 5. TALENTOS */}
        <button
          type="button"
          onClick={() => handleAction(onOpenTalents)}
          className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-indigo-400 active:scale-95 transition-transform"
          title="Árvore de Maestria & Talentos"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-sm relative">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            {availableTalentPoints > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md animate-bounce">
                {availableTalentPoints}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-indigo-300">Talentos</span>
        </button>

        {/* 6. MENU MAIS */}
        <button
          type="button"
          onClick={() => {
            sound.playWaterClick(false);
            setIsMoreMenuOpen(true);
          }}
          className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] text-slate-400 active:scale-95 transition-transform"
          title="Outras Funcionalidades"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm">
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-slate-400">Mais</span>
        </button>
      </nav>

      {/* ── GAVETA / BOTTOM SHEET "MAIS OPÇÕES" ── */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex items-end bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsMoreMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl z-10 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Barra de título do menu mais */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-black text-slate-200 uppercase tracking-wider">
                    Central do Pescador
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid de Ações Rápidas */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Aquário */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenAquarium);
                  }}
                  className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <Waves className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-200">Aquário</div>
                    <div className="text-[10px] text-cyan-400/80 font-medium">
                      {aquariumFishCount} {aquariumFishCount === 1 ? 'troféu' : 'troféus'}
                    </div>
                  </div>
                </button>

                {/* Ajudantes / Idle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenIdleShop);
                  }}
                  className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200">Ajudantes</div>
                    <div className="text-[10px] text-amber-400/80 font-medium">
                      {totalCps} 🪙/s
                    </div>
                  </div>
                </button>

                {/* Biomas / Viajar */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenLocations);
                  }}
                  className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-200">Viajar</div>
                    <div className="text-[10px] text-sky-400/80 font-medium truncate max-w-[90px]">
                      {currentLocation.name}
                    </div>
                  </div>
                </button>

                {/* Ascensão Cósmica */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenPrestige);
                  }}
                  className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-200">Ascensão</div>
                    <div className="text-[10px] text-purple-400/80 font-medium">
                      {player.cosmicScales || 0} Escamas
                    </div>
                  </div>
                </button>

                {/* Conquistas */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenAchievements);
                  }}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Conquistas</div>
                    <div className="text-[10px] text-slate-400 font-medium">Marcos & Títulos</div>
                  </div>
                </button>

                {/* Ranking */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenLeaderboard);
                  }}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Ranking</div>
                    <div className="text-[10px] text-slate-400 font-medium">Líderes do Cais</div>
                  </div>
                </button>

                {/* Guia das Espécies */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleAction(onOpenBestiary);
                  }}
                  className="col-span-2 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-left active:scale-95 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-indigo-200">Guia das Espécies (Bestiário)</div>
                    <div className="text-[10px] text-indigo-400/80 font-medium">
                      Consulte todas as presas e biomas catalogados
                    </div>
                  </div>
                </button>
              </div>

              {/* Controles de Som & Reset */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 active:scale-95 transition-transform"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                  <span>{isMuted ? 'Efeitos Mutados' : 'Efeitos Ativados'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onResetProgress();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400/80 hover:text-rose-300 text-xs font-medium active:scale-95 transition-transform"
                  title="Reiniciar Progresso"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Novo Jogo</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
