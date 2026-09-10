// src/components/AquariumModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal Principal do Aquário / Viveiro de Troféus Personalizado
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Waves,
  X,
  Sparkles,
  Coins,
  Utensils,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Palette,
  Compass,
  Fish,
  Tag,
  Check,
  Package,
  Layers,
  ShoppingBag,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FishingGame } from '../game/FishingGame.js';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import {
  PlayerAquarium,
  AquariumTrophyFish,
  AquariumThemes,
  AquariumDecorations,
  AquariumTankTiers,
  AquariumTheme,
  AquariumDecoration,
} from '../game/data/aquarium.data.js';
import { GameConfig } from '../game/data/game.config.js';
import { AquariumCanvas } from './AquariumCanvas.js';
import { GameAssetImage } from './GameAssetImage.js';
import { sound } from '../utils/audio.js';

interface AquariumModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: FishingGame;
  player: PlayerProfile;
  onUpdatePlayer: () => void;
  showToast: (msg: string) => void;
}

type AquariumTab = 'trophies' | 'transfer' | 'themes' | 'decorations' | 'upgrade';

export const AquariumModal: React.FC<AquariumModalProps> = ({
  isOpen,
  onClose,
  game,
  player,
  onUpdatePlayer,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<AquariumTab>('trophies');
  const [aquarium, setAquarium] = useState<PlayerAquarium | null>(null);
  const [selectedFish, setSelectedFish] = useState<AquariumTrophyFish | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [timeLeftFed, setTimeLeftFed] = useState<string>('');
  const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false);

  // Atualiza os dados do aquário
  const refreshAquarium = useCallback(() => {
    if (!player) return;
    const data = game.getAquarium(player.id);
    setAquarium({ ...data });
  }, [game, player]);

  useEffect(() => {
    if (isOpen) {
      refreshAquarium();
    }
  }, [isOpen, refreshAquarium]);

  // Timer para contagem regressiva da alimentação e acumulação de gorjetas
  useEffect(() => {
    if (!isOpen || !aquarium) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expiresAt = aquarium.fedHappinessExpiresAt || 0;

      if (expiresAt > now) {
        const remainingSec = Math.floor((expiresAt - now) / 1000);
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        setTimeLeftFed(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      } else {
        setTimeLeftFed('');
      }

      // Atualiza levemente os dados de moedas geradas
      refreshAquarium();
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, aquarium, refreshAquarium]);

  if (!isOpen || !aquarium) return null;

  const currentTier = game.aquariumManager.getCurrentTier(aquarium);
  const nextTier = game.aquariumManager.getNextTier(aquarium);
  const capacity = currentTier.capacity;
  const currentTheme =
    AquariumThemes.find((t) => t.id === aquarium.currentThemeId) || AquariumThemes[0];
  const activeDecorations = AquariumDecorations.filter((d) =>
    aquarium.ownedDecorations.includes(d.id),
  );
  const cps = game.aquariumManager.calculateCoinsPerSecond(aquarium);
  const isFed = Date.now() < aquarium.fedHappinessExpiresAt;

  // Ação: Coletar Moedas de Visitantes
  const handleCollectCoins = () => {
    const res = game.collectAquariumCoins(player.id);
    if (res.ok) {
      sound.playCoins();
      showToast(res.message || 'Gorjetas coletadas!');
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Não há moedas para coletar.');
    }
  };

  // Ação: Alimentar os Peixes
  const handleFeed = () => {
    const res = game.feedAquariumFish(player.id);
    if (res.ok) {
      sound.playSplash();
      showToast(res.message || 'Peixes alimentados com sucesso!');
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Não foi possível alimentar agora.');
    }
  };

  // Ação: Adicionar Peixe do Inventário ao Aquário
  const handleAddFish = (inventoryId: string) => {
    const res = game.addFishToAquarium(player.id, inventoryId);
    if (res.ok) {
      sound.playSplash();
      showToast(res.message || 'Peixe adicionado ao viveiro!');
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Erro ao adicionar peixe.');
    }
  };

  // Ação: Remover Peixe do Aquário
  const handleRemoveFish = (trophyId: string, sell: boolean) => {
    const res = game.removeFishFromAquarium(player.id, trophyId, sell);
    if (res.ok) {
      if (sell) sound.playCoins();
      else sound.playSplash();

      showToast(res.message || 'Peixe retirado do aquário.');
      setSelectedFish(null);
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Erro ao remover peixe.');
    }
  };

  // Ação: Renomear Peixe
  const handleRenameFish = () => {
    if (!selectedFish) return;
    const res = game.renameAquariumFish(player.id, selectedFish.id, newNickname);
    if (res.ok) {
      showToast(res.message || 'Apelido salvo!');
      setIsEditingNickname(false);
      selectedFish.nickname = newNickname.trim() || undefined;
      refreshAquarium();
      onUpdatePlayer();
    }
  };

  // Ação: Comprar ou Equipar Tema
  const handleThemeAction = (theme: AquariumTheme) => {
    if (aquarium.ownedThemes.includes(theme.id)) {
      const res = game.setAquariumTheme(player.id, theme.id);
      if (res.ok) {
        sound.playSplash();
        showToast(res.message || 'Cenário aplicado!');
        refreshAquarium();
        onUpdatePlayer();
      }
    } else {
      const res = game.buyAquariumTheme(player.id, theme.id);
      if (res.ok) {
        sound.playCoins();
        showToast(res.message || 'Novo cenário adquirido!');
        refreshAquarium();
        onUpdatePlayer();
      } else {
        showToast(res.message || 'Erro ao comprar cenário.');
      }
    }
  };

  // Ação: Comprar Decoração
  const handleBuyDecoration = (deco: AquariumDecoration) => {
    const res = game.buyAquariumDecoration(player.id, deco.id);
    if (res.ok) {
      sound.playCoins();
      showToast(res.message || 'Decoração instalada!');
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Erro ao comprar decoração.');
    }
  };

  // Ação: Aprimorar Tanque
  const handleUpgradeTank = () => {
    const res = game.upgradeAquarium(player.id);
    if (res.ok) {
      sound.playAchievement();
      showToast(res.message || 'Aquário expandido com sucesso!');
      refreshAquarium();
      onUpdatePlayer();
    } else {
      showToast(res.message || 'Não foi possível expandir o aquário.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] bg-slate-900 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Cabeçalho do Aquário (Fixo no topo) */}
          <div className="shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-cyan-900/50 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 flex items-center justify-between z-30">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
                <Waves className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base md:text-lg font-black tracking-wide text-slate-100 truncate">
                    Viveiro & Aquário
                  </h2>
                  <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shrink-0">
                    Nv {aquarium.level} • {currentTier.name}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
                  Exiba suas maiores capturas, encante visitantes e ganhe renda passiva!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={() => setIsCanvasCollapsed(!isCanvasCollapsed)}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                  isCanvasCollapsed
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-slate-100'
                }`}
                title={isCanvasCollapsed ? 'Mostrar animação do aquário' : 'Ocultar animação para focar nas opções'}
              >
                {isCanvasCollapsed ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px] sm:text-xs hidden xs:inline">
                  {isCanvasCollapsed ? 'Ver Tanque' : 'Ocultar'}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playSplash();
                  onClose();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Corpo do Modal com Scroll Unificado */}
          <div className="overflow-y-auto flex-1 overscroll-contain divide-y divide-slate-800/80">
            {/* Painel de Estatísticas e Controles Rápidos */}
            <div className="px-3 sm:px-5 py-2.5 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Cofrinho de Gorjetas */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block uppercase">
                    Gorjetas
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1">
                    🪙 {aquarium.uncollectedCoins}
                  </span>
                </div>
                <button
                  onClick={handleCollectCoins}
                  disabled={aquarium.uncollectedCoins <= 0}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-extrabold text-[10px] sm:text-[11px] transition-all ${
                    aquarium.uncollectedCoins > 0
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Coletar
                </button>
              </div>

              {/* Renda por Segundo */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block uppercase">
                    Renda
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-300">
                    +{cps} <span className="text-[9px] sm:text-[10px] font-normal text-slate-400">m/s</span>
                  </span>
                </div>
              </div>

              {/* Estado de Alimentação */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block uppercase">
                    Bônus (2x)
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-sky-300 flex items-center gap-1">
                    {isFed ? `Ativo (${timeLeftFed})` : 'Normal'}
                  </span>
                </div>
                <button
                  onClick={handleFeed}
                  className="px-2 sm:px-2.5 py-1 rounded-lg font-extrabold text-[10px] sm:text-[11px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-all active:scale-95 flex items-center gap-1"
                  title="Alimentar para ativar bônus 2x de moedas por 20 minutos!"
                >
                  <Utensils className="w-3 h-3" />
                  Alimentar
                </button>
              </div>

              {/* Capacidade do Aquário */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block uppercase">
                    Lotação
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-200">
                    {aquarium.fish.length}{' '}
                    <span className="text-[10px] sm:text-xs text-slate-400 font-normal">/ {capacity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Área Central: Visualização do Tanque ou Mini Banner Recolhido */}
            {!isCanvasCollapsed ? (
              <div className="p-2 sm:p-4 bg-slate-950/40">
                <AquariumCanvas
                  fishList={aquarium.fish}
                  theme={currentTheme}
                  decorations={activeDecorations}
                  isFed={isFed}
                  onSelectFish={(fish) => {
                    setSelectedFish(fish);
                    setNewNickname(fish.nickname || '');
                    setIsEditingNickname(false);
                  }}
                  selectedFishId={selectedFish?.id}
                />
              </div>
            ) : (
              <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/60 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>
                    Tanque minimizado ({aquarium.fish.length} peixes gerando +{cps} m/s)
                  </span>
                </div>
                <button
                  onClick={() => setIsCanvasCollapsed(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 underline underline-offset-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Expandir Tanque
                </button>
              </div>
            )}

            {/* Placa de Inspeção do Peixe Selecionado */}
            {selectedFish && (
              <div className="px-3 sm:px-5 py-3 bg-slate-900/95 border-y border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <GameAssetImage
                    assetId={selectedFish.assetId}
                    name={selectedFish.name}
                    rarity={selectedFish.rarity as any}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditingNickname ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            placeholder="Digite um apelido..."
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 max-w-[140px]"
                            maxLength={20}
                          />
                          <button
                            onClick={handleRenameFish}
                            className="p-1 rounded bg-emerald-500 text-slate-950 font-bold"
                            title="Salvar Apelido"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-black text-slate-100 truncate">
                            {selectedFish.nickname || selectedFish.name}
                          </span>
                          {selectedFish.nickname && (
                            <span className="text-[11px] text-slate-400">
                              ({selectedFish.name})
                            </span>
                          )}
                          <button
                            onClick={() => setIsEditingNickname(true)}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                            title="Editar Apelido"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase"
                        style={{
                          color: GameConfig.rarity[selectedFish.rarity]?.color || '#38bdf8',
                          borderColor:
                            (GameConfig.rarity[selectedFish.rarity]?.color || '#38bdf8') + '50',
                        }}
                      >
                        {GameConfig.rarity[selectedFish.rarity]?.label || selectedFish.rarity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 mt-0.5 flex-wrap text-[11px]">
                      <span>⚖️ Peso: {selectedFish.weight} kg</span>
                      <span>•</span>
                      <span>
                        🪙 ~
                        {(
                          (selectedFish.rarity === 'legendary'
                            ? 8.5
                            : selectedFish.rarity === 'epic'
                            ? 3.2
                            : selectedFish.rarity === 'rare'
                            ? 1.2
                            : 0.3) * (1 + selectedFish.weight * 0.05)
                        ).toFixed(1)}{' '}
                        moedas/s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleRemoveFish(selectedFish.id, false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Package className="w-3.5 h-3.5 text-cyan-400" />
                    Devolver ao Cesto
                  </button>
                  <button
                    onClick={() => handleRemoveFish(selectedFish.id, true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Vender (🪙 {Math.floor(selectedFish.basePrice * selectedFish.weight * 1.2)})
                  </button>
                  <button
                    onClick={() => setSelectedFish(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                    title="Fechar detalhes"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Abas de Navegação (Fixas ao rolar o conteúdo) */}
            <div className="sticky top-0 z-20 px-2 sm:px-5 border-y border-slate-800 bg-slate-950/95 backdrop-blur-md flex items-center gap-1.5 sm:gap-3 overflow-x-auto text-xs font-bold py-2 no-scrollbar">
              <button
                onClick={() => {
                  sound.playSplash();
                  setActiveTab('trophies');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'trophies'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Fish className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="hidden xs:inline">Peixes no Tanque</span>
                <span className="xs:hidden">Peixes</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {aquarium.fish.length}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playSplash();
                  setActiveTab('transfer');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'transfer'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Plus className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="hidden xs:inline">Colocar do Cesto</span>
                <span className="xs:hidden">Cesto</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-800 text-slate-300">
                  {player.inventory.fish.length}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playSplash();
                  setActiveTab('themes');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'themes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Palette className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Cenários</span>
              </button>

              <button
                onClick={() => {
                  sound.playSplash();
                  setActiveTab('decorations');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'decorations'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Decorações</span>
              </button>

              <button
                onClick={() => {
                  sound.playSplash();
                  setActiveTab('upgrade');
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'upgrade'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Expansão</span>
              </button>
            </div>

            {/* Conteúdo da Aba Selecionada (sem limite restritivo de altura para scroll fluído) */}
            <div className="p-3 sm:p-5 space-y-3 bg-slate-900/40 min-h-[240px]">
            {/* ABA: Peixes no Tanque */}
            {activeTab === 'trophies' && (
              <div>
                {aquarium.fish.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Waves className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-slate-300">Nenhum peixe no seu aquário ainda.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Clique na aba &quot;Colocar do Cesto&quot; para transferir suas capturas para o viveiro.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {aquarium.fish.map((f) => {
                      const rarity = GameConfig.rarity[f.rarity] || GameConfig.rarity.common;
                      const isSelected = selectedFish?.id === f.id;

                      return (
                        <div
                          key={f.id}
                          onClick={() => {
                            setSelectedFish(f);
                            setNewNickname(f.nickname || '');
                            setIsEditingNickname(false);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/10'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GameAssetImage
                              assetId={f.assetId}
                              name={f.name}
                              rarity={f.rarity as any}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-100">
                                {f.nickname || f.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="text-[9px] font-extrabold uppercase px-1 rounded"
                                  style={{ color: rarity.color, backgroundColor: rarity.color + '15' }}
                                >
                                  {rarity.label}
                                </span>
                                <span className="text-[10px] text-slate-400">{f.weight} kg</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-bold">Ver</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ABA: Transferir do Cesto */}
            {activeTab === 'transfer' && (
              <div>
                {player.inventory.fish.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-slate-300">Seu cesto de peixes está vazio.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Pesque novos peixes no cais para colocá-los no seu aquário!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {player.inventory.fish.map((f) => {
                      const rarity = GameConfig.rarity[f.rarity] || GameConfig.rarity.common;
                      const isFull = aquarium.fish.length >= capacity;

                      return (
                        <div
                          key={f.inventoryId}
                          className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <GameAssetImage
                              assetId={f.assetId}
                              name={f.name}
                              rarity={f.rarity as any}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-100">{f.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="text-[9px] font-extrabold uppercase px-1 rounded"
                                  style={{ color: rarity.color, backgroundColor: rarity.color + '15' }}
                                >
                                  {rarity.label}
                                </span>
                                <span className="text-[10px] text-slate-400">{f.weight} kg</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddFish(f.inventoryId)}
                            disabled={isFull}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isFull
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 active:scale-95'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isFull ? 'Tanque Cheio' : 'Colocar no Tanque'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ABA: Cenários e Temas */}
            {activeTab === 'themes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AquariumThemes.map((t) => {
                  const isOwned = aquarium.ownedThemes.includes(t.id);
                  const isCurrent = aquarium.currentThemeId === t.id;

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-100">{t.name}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          +{Math.round((t.coinsMultiplier - 1) * 100)}% Gorjetas
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>

                      <div className="mt-3 flex items-center justify-between">
                        {isOwned ? (
                          <button
                            onClick={() => handleThemeAction(t)}
                            disabled={isCurrent}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isCurrent ? '✓ Cenário Ativo' : 'Usar Cenário'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleThemeAction(t)}
                            disabled={player.coins < t.cost}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                              player.coins >= t.cost
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            Comprar por 🪙 {t.cost}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ABA: Decorações */}
            {activeTab === 'decorations' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AquariumDecorations.map((d) => {
                  const isOwned = aquarium.ownedDecorations.includes(d.id);

                  return (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.emoji}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-100">{d.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{d.description}</p>
                          <span className="text-[10px] font-black text-emerald-400 block mt-0.5">
                            +{d.coinsBonusPct}% Moedas de Visitantes
                          </span>
                        </div>
                      </div>

                      {isOwned ? (
                        <span className="text-xs font-bold text-emerald-400 shrink-0">
                          ✓ Instalada
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyDecoration(d)}
                          disabled={player.coins < d.cost}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1 ${
                            player.coins >= d.cost
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />🪙 {d.cost}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ABA: Expansão do Tanque */}
            {activeTab === 'upgrade' && (
              <div className="max-w-lg mx-auto py-2 text-center">
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mb-4">
                  <span className="text-xs uppercase font-extrabold text-cyan-300 block">
                    Tanque Atual
                  </span>
                  <h3 className="text-lg font-black text-slate-100 mt-0.5">{currentTier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{currentTier.description}</p>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300">
                    Capacidade: {currentTier.capacity} Peixes
                  </div>
                </div>

                {nextTier ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs uppercase font-extrabold text-amber-400 block">
                      Próxima Expansão Disponível
                    </span>
                    <h3 className="text-base font-black text-slate-100 mt-0.5">{nextTier.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{nextTier.description}</p>

                    <div className="my-3 flex items-center justify-center gap-4 text-xs">
                      <span className="font-bold text-emerald-400">
                        Capacidade: {nextTier.capacity} Peixes (+{nextTier.capacity - currentTier.capacity})
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-bold text-sky-400">
                        Nível Mínimo: {nextTier.minPlayerLevel} (Você: {player.level})
                      </span>
                    </div>

                    <button
                      onClick={handleUpgradeTank}
                      disabled={
                        player.coins < nextTier.cost || player.level < nextTier.minPlayerLevel
                      }
                      className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                        player.coins >= nextTier.cost && player.level >= nextTier.minPlayerLevel
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Construir por 🪙 {nextTier.cost}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                    👑 Seu aquário atingiu o Nível Máximo (Palácio Oceânico Atlantis)!
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          {/* Fim do Corpo do Modal com Scroll Unificado */}

          {/* Rodapé Fixo na Base */}
          <div className="shrink-0 px-3.5 sm:px-5 py-2.5 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between text-xs text-slate-400 z-10">
            <span className="flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Peixes raros e lendários atraem mais visitantes e gorjetas!
            </span>
            <button
              onClick={() => {
                sound.playSplash();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all text-xs shrink-0 ml-2"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
