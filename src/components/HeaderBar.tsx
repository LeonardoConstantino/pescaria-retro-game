// src/components/HeaderBar.tsx
import React, { useState } from 'react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameLocation } from '../game/data/locations.data.js';
import { sound } from '../utils/audio.js';
import {
  Coins,
  Sparkles,
  Volume2,
  VolumeX,
  MapPin,
  ShoppingBag,
  Package,
  Trophy,
  Award,
  User,
  Edit2,
  Check,
  Bot,
  TrendingUp,
  Flame,
  Zap,
  Scroll,
  Waves,
  GraduationCap,
} from 'lucide-react';

interface HeaderBarProps {
  player: PlayerProfile;
  currentLocation: GameLocation;
  levelInfo: { currentLevelBaseXp: number; nextLevelXp: number };
  totalCps: number;
  unclaimedMissionsCount?: number;
  availableTalentPoints?: number;
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onOpenIdleShop: () => void;
  onOpenPrestige: () => void;
  onOpenAchievements: () => void;
  onOpenLocations: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenAquarium: () => void;
  onOpenTalents?: () => void;
  onUpdatePlayerName: (newName: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  player,
  currentLocation,
  levelInfo,
  totalCps,
  unclaimedMissionsCount = 0,
  availableTalentPoints = 0,
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
  onUpdatePlayerName,
}) => {
  const [isMuted, setIsMuted] = useState(!sound.enabled);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name);

  const toggleMute = () => {
    const newState = !sound.toggleSound();
    setIsMuted(newState);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  // XP Calculations
  const xpInCurrentLevel = Math.max(0, player.xp - levelInfo.currentLevelBaseXp);
  const xpNeededForLevel = Math.max(1, levelInfo.nextLevelXp - levelInfo.currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Lado Esquerdo: Perfil & XP */}
        <div className="flex items-center gap-3">
          {/* Avatar & Nível */}
          <button
            onClick={onOpenTalents}
            className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 text-left"
            title="Abrir Árvore de Maestria & Talentos"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-indigo-950/50 group-hover:shadow-sky-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-sky-300 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-tight shadow-md border-2 border-slate-900 flex items-center gap-0.5">
              Nv.{player.level}
            </div>
          </button>

          {/* Nome e Barra de XP */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    maxLength={16}
                    autoFocus
                    className="px-2 py-0.5 text-xs bg-slate-800 border border-amber-400/60 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 hover:bg-slate-800 rounded text-emerald-400"
                    title="Salvar Nome"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-slate-100 tracking-wide">
                    {player.name}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Editar Nome"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {player.boosts.rarity && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-900/60 text-purple-300 border border-purple-500/40 animate-pulse">
                  ✨ Boost {player.boosts.rarity.remaining}x
                </span>
              )}
            </div>

            {/* Barra de XP */}
            <div className="w-32 sm:w-44 mt-1">
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5 font-medium">
                <span>XP</span>
                <span>{Math.round(xpInCurrentLevel)}/{Math.round(xpNeededForLevel)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Centro / Moedas & Local */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Moedas & CPS */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-wide text-amber-200 leading-none">
                {player.coins.toLocaleString('pt-BR')}
              </span>
              {totalCps > 0 && (
                <span className="text-[10px] text-emerald-400 font-bold leading-none mt-0.5 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +{totalCps} 🪙/s
                </span>
              )}
            </div>
          </div>

          {/* Buffs Ativos do Peixe Dourado (Frenesi) */}
          {player.activeBuffs?.production_frenzy && player.activeBuffs.production_frenzy.expiresAt > Date.now() && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-red-500/50 text-amber-200 text-xs font-black animate-pulse shadow-md"
              title="Frenesi de Produção Ativo: 7x CPS!"
            >
              <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>7x CPS!</span>
              <span className="text-[10px] text-amber-300 font-normal">
                {Math.ceil((player.activeBuffs.production_frenzy.expiresAt - Date.now()) / 1000)}s
              </span>
            </div>
          )}

          {player.activeBuffs?.click_frenzy && player.activeBuffs.click_frenzy.expiresAt > Date.now() && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-400/50 text-yellow-200 text-xs font-black animate-pulse shadow-md"
              title="Frenesi de Clique Ativo: 77x por clique!"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-300" />
              <span>77x Clique!</span>
              <span className="text-[10px] text-yellow-300 font-normal">
                {Math.ceil((player.activeBuffs.click_frenzy.expiresAt - Date.now()) / 1000)}s
              </span>
            </div>
          )}

          {/* Local Atual */}
          <button
            onClick={onOpenLocations}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/70 text-slate-200 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Mudar Local de Pesca"
          >
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="hidden xs:inline truncate max-w-[120px]">{currentLocation.name}</span>
            <span className="xs:hidden">Viajar</span>
          </button>
        </div>

        {/* Lado Direito: Ações (visíveis em tablets e desktop) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
          {/* Ajudantes / Cookie Clicker Automation */}
          <button
            onClick={onOpenIdleShop}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Contratar Ajudantes e Automação (Cookie Clicker)"
          >
            <Bot className="w-4 h-4 text-amber-400 sm:mr-1.5 animate-bounce" />
            <span className="hidden sm:inline">Ajudantes</span>
            {totalCps > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center border border-slate-900">
                {totalCps}
              </span>
            )}
          </button>

          {/* Ascensão Cósmica / Renascimento */}
          <button
            onClick={onOpenPrestige}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Ascensão Cósmica & Renascimento"
          >
            <span className="text-sm sm:mr-1">🌟</span>
            <span className="hidden sm:inline">Ascensão</span>
            {(player.cosmicScales || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 rounded-full bg-purple-500 text-white text-[9px] font-black flex items-center justify-center border border-slate-900 shadow-sm">
                {player.cosmicScales}
              </span>
            )}
          </button>

          {/* Inventário */}
          <button
            onClick={onOpenInventory}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 text-slate-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Cesto de Peixes e Mochila"
          >
            <Package className="w-4 h-4 text-emerald-400 sm:mr-1.5" />
            <span className="hidden sm:inline">Cesto</span>
            {player.inventory.fish.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-900">
                {player.inventory.fish.length}
              </span>
            )}
          </button>

          {/* Aquário & Viveiro de Troféus */}
          <button
            onClick={onOpenAquarium}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-950/50 to-blue-950/50 hover:from-cyan-900/60 hover:to-blue-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Aquário & Viveiro de Troféus"
          >
            <Waves className="w-4 h-4 text-cyan-400 sm:mr-1.5" />
            <span className="hidden sm:inline">Aquário</span>
            {player.aquarium && player.aquarium.fish.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-sm">
                {player.aquarium.fish.length}
              </span>
            )}
          </button>

          {/* Árvore de Maestria / Talentos */}
          <button
            id="header-talents-button"
            onClick={onOpenTalents}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-950/40 via-sky-950/40 to-purple-950/40 hover:from-amber-900/50 hover:to-purple-900/50 border border-sky-500/40 text-sky-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Árvore de Maestria & Talentos do Pescador"
          >
            <GraduationCap className="w-4 h-4 text-sky-400 sm:mr-1.5" />
            <span className="hidden sm:inline">Talentos</span>
            {availableTalentPoints > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">
                {availableTalentPoints}
              </span>
            )}
          </button>

          {/* Loja */}
          <button
            onClick={onOpenShop}
            className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 text-slate-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Loja de Equipamentos"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 sm:mr-1.5" />
            <span className="hidden sm:inline">Loja</span>
          </button>

          {/* Missões Diárias / Quadro de Encomendas */}
          <button
            onClick={onOpenMissions}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-950/40 to-yellow-950/40 hover:from-amber-900/50 hover:to-yellow-900/50 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Quadro de Missões Diárias & Encomendas"
          >
            <Scroll className="w-4 h-4 text-amber-400 sm:mr-1.5" />
            <span className="hidden sm:inline">Missões</span>
            {unclaimedMissionsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">
                {unclaimedMissionsCount}
              </span>
            )}
          </button>

          {/* Conquistas & Marcos */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Conquistas e Marcos de Progresso"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Ranking */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Tabela de Classificação"
          >
            <Award className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Som (Desktop) */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${
              isMuted
                ? 'bg-red-950/30 border-red-800/50 text-red-400'
                : 'bg-slate-800/90 border-slate-600/70 text-sky-400'
            }`}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Som (Mobile Only - compacto no topo) */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all active:scale-95 shadow-sm ${
              isMuted
                ? 'bg-red-950/30 border-red-800/50 text-red-400'
                : 'bg-slate-800/90 border-slate-600/70 text-sky-400'
            }`}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
