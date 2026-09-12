// src/App.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FishingGame } from './game/FishingGame.js';
import { PlayerProfile } from './game/managers/PlayerManager.js';
import { FishingSession } from './game/managers/SessionManager.js';
import { FishingCollectResult } from './game/managers/FishingEngine.js';
import { LocationData, GameLocation } from './game/data/locations.data.js';
import { ItemData, GameItem } from './game/data/items.data.js';
import { HeaderBar } from './components/HeaderBar.js';
import { FishingStage } from './components/FishingStage.js';
import { InventoryModal } from './components/InventoryModal.js';
import { ShopModal } from './components/ShopModal.js';
import { LocationsModal } from './components/LocationsModal.js';
import { LeaderboardModal } from './components/LeaderboardModal.js';
import { CatchModal } from './components/CatchModal.js';
import { EventModal } from './components/EventModal.js';
import { LevelUpModal } from './components/LevelUpModal.js';
import { BestiaryModal } from './components/BestiaryModal.js';
import { ReelTensionMeter } from './components/ReelTensionMeter.js';
import { FloatingFeedback, FloatingItem } from './components/FloatingFeedback.js';
import { IdleShopModal } from './components/IdleShopModal.js';
import { PrestigeModal } from './components/PrestigeModal.js';
import { AchievementsModal } from './components/AchievementsModal.js';
import { MissionsModal } from './components/MissionsModal.js';
import { AquariumModal } from './components/AquariumModal.js';
import { TalentModal } from './components/TalentModal.js';
import { WeatherBanner } from './components/WeatherBanner.js';
import { MobileBottomDock } from './components/MobileBottomDock.js';
import { sound } from './utils/audio.js';
import { vibrate } from './utils/vibrate.js';
import {
  Package,
  ShoppingBag,
  MapPin,
  Trophy,
  BookOpen,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  Scroll,
  Waves,
} from 'lucide-react';

const CHAT_ID = 'web_session';
const USER_ID = 'main_angler';

export default function App() {
  const gameRef = useRef<FishingGame | null>(null);
  if (!gameRef.current) {
    gameRef.current = new FishingGame();
  }
  const game = gameRef.current;

  // Estado do Jogador
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    return game.initPlayer(USER_ID, 'Capitão Pescador');
  });

  // Sessão de Pesca Ativa
  const [activeSession, setActiveSession] = useState<FishingSession | null>(() => {
    return game.getActiveSession(CHAT_ID, USER_ID);
  });

  // Estados de Modais
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showIdleShop, setShowIdleShop] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showAquarium, setShowAquarium] = useState(false);
  const [showTalents, setShowTalents] = useState(false);
  const [unclaimedMissions, setUnclaimedMissions] = useState(() => game.missionManager.getUnclaimedCount(USER_ID));

  // Pontos de Talentos Disponíveis
  const availableTalentPoints = useMemo(() => {
    const st = game.getTalentStatus(USER_ID);
    return st.ok && st.data ? st.data.availablePoints : 0;
  }, [game, player]);

  // Clima do Lago em Tempo Real
  const [currentWeather, setCurrentWeather] = useState(() => game.getCurrentWeather());
  const [weatherSecondsLeft, setWeatherSecondsLeft] = useState(() => game.getWeatherTimeRemaining());

  // Estados de Resultados & Celebração
  const [catchResult, setCatchResult] = useState<FishingCollectResult | null>(null);
  const [eventResult, setEventResult] = useState<{ event: any; details: any } | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<number | null>(null);

  // Estados de Ação e Feedback (Juice Máximo)
  const [isCasting, setIsCasting] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [showTensionMeter, setShowTensionMeter] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [isHitStop, setIsHitStop] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const addFloating = (
    text: string,
    type: 'xp' | 'coins' | 'perfect' | 'legendary' | 'weight' | 'level',
    position?: { x: number; y: number },
  ) => {
    const newItem: FloatingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text,
      type,
      x: position?.x,
      y: position?.y,
    };
    setFloatingItems((prev) => [...prev.slice(-4), newItem]);
  };

  const removeFloating = (id: string) => {
    setFloatingItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Recarrega o estado do jogador sempre que ocorrer uma ação
  const refreshPlayer = () => {
    const updated = game.getPlayer(USER_ID);
    if (updated) {
      setPlayer({ ...updated });
    }
    setUnclaimedMissions(game.missionManager.getUnclaimedCount(USER_ID));
  };

  const showToast = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 3200);
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);
  };

  const triggerHitFlash = (duration = 100) => {
    setHitFlash(true);
    setTimeout(() => setHitFlash(false), duration);
  };

  // Local Atual
  const currentLocation = useMemo(() => {
    return LocationData.find((l) => l.id === player.currentLocation) || LocationData[0];
  }, [player.currentLocation]);

  // Vara e Isca Equipadas
  const currentRod = useMemo(() => {
    return ItemData.find((i) => i.id === player.equipment.rod) || null;
  }, [player.equipment.rod]);

  const currentBait = useMemo(() => {
    return ItemData.find((i) => i.id === player.equipment.bait) || null;
  }, [player.equipment.bait]);

  // Nível & XP
  const levelInfo = useMemo(() => {
    return game.playerManager.xpForNextLevel(player.level);
  }, [player.level, player.xp]);

  // Moedas por Segundo (CPS) Totais dos Ajudantes
  const totalCps = useMemo(() => {
    return game.getTotalCps(USER_ID);
  }, [player.idleFishers, player.idleUpgrades, player.activeBuffs, player.coins]);

  // Upgrades Disponíveis para Compra
  const availableUpgrades = useMemo(() => {
    return game.getAvailableUpgrades(USER_ID);
  }, [player.idleFishers, player.idleUpgrades, player.stats.totalWaterClicks, player.coins]);

  // Status Completo de Prestígio / Ascensão Cósmica
  const prestigeStatus = useMemo(() => {
    return game.getPrestigeStatus(USER_ID);
  }, [player.stats.totalCoinsEarned, player.stats.lifetimeCoinsEarned, player.cosmicScales, player.cosmicBlessings, player.claimedScalesTotal]);

  // Status de Conquistas & Marcos
  const achievementsStatus = useMemo(() => {
    return game.getAchievementsStatus(USER_ID);
  }, [player.unlockedAchievements, player.stats, totalCps]);

  // Loop Contínuo de Produção Passiva (Cookie Clicker Loop)
  useEffect(() => {
    // Processa ganhos offline imediatamente ao montar
    const offlineReport = game.processIdleTick(USER_ID);
    if (offlineReport.coinsEarned > 0) {
      refreshPlayer();
      if (offlineReport.secondsElapsed > 10) {
        addFloating(`+${offlineReport.coinsEarned.toLocaleString('pt-BR')} 🪙 (Renda Offline)`, 'coins');
        showToast(
          `Seus pescadores renderam +${offlineReport.coinsEarned.toLocaleString('pt-BR')} 🪙 enquanto você esteve fora!`,
          'success',
        );
      }
    }

    // Tick contínuo de 1 segundo para produção passiva, clima e expiração de buffs
    const interval = setInterval(() => {
      const buffsChanged = game.cleanExpiredBuffs(USER_ID);
      const currentCps = game.getTotalCps(USER_ID);
      if (currentCps > 0) {
        const tick = game.processIdleTick(USER_ID);
        if (tick.coinsEarned > 0 || buffsChanged) {
          refreshPlayer();
        }
      } else if (buffsChanged) {
        refreshPlayer();
      }

      // Atualiza clima do lago
      setCurrentWeather(game.getCurrentWeather());
      setWeatherSecondsLeft(game.getWeatherTimeRemaining());

      // Avalia conquistas alcançadas
      const newAchs = game.checkAchievements(USER_ID);
      if (newAchs.length > 0) {
        refreshPlayer();
        newAchs.forEach((ach) => {
          sound.playAchievement();
          addFloating(`🏆 ${ach.title}! (+${ach.bonusPercent}%)`, 'level');
          showToast(`Conquista Desbloqueada: ${ach.title}! ${ach.description}`, 'success');
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poder do Clique Atual
  const clickPowerInfo = useMemo(() => {
    return game.getClickPower(USER_ID);
  }, [player.activeBuffs, player.coins, totalCps]);

  // Peixes únicos pescados permanentemente (Bestiário Persistente)
  const discoveredFishMap = useMemo(() => {
    return game.getDiscoveredFish(USER_ID);
  }, [player.stats.totalFishCaught, player.inventory.fish.length, player.discoveredFish]);

  const caughtFishIds = useMemo(() => {
    return Object.keys(discoveredFishMap);
  }, [discoveredFishMap]);

  // Vara de pesca equipada atualmente
  const equippedRod = useMemo(() => {
    return ItemData.find((i) => i.id === player.equipment.rod) || null;
  }, [player.equipment.rod]);

  // 1. LANÇAR LINHA
  const handleCast = () => {
    if (isCasting) return;
    setIsCasting(true);

    const biteSpeedMult = currentWeather?.biteSpeedMultiplier || 1.0;
    const response = game.cast(CHAT_ID, USER_ID, biteSpeedMult);
    refreshPlayer();

    if (response.ok) {
      sound.playCast();
      setTimeout(() => sound.playSplash(), 280);
      setActiveSession(game.getActiveSession(CHAT_ID, USER_ID));
      showToast(response.message, 'success');
    } else {
      sound.playThud();
      showToast(response.message, 'warning');
    }

    setIsCasting(false);
  };

  // 2. INICIAR RECOLHIMENTO (ABRE MEDIDOR DE TENSÃO E BATALHA DE PESCA)
  const handleCollect = () => {
    if (isCollecting) return;
    setShowTensionMeter(true);
  };

  // 2b. EXECUTAR COLETAR COM RESULTADO DO COMBATE DE PESCA
  const executeCollect = (isPerfect: boolean) => {
    setShowTensionMeter(false);
    setIsCollecting(true);

    if (isPerfect) {
      addFloating('⭐ DOMÍNIO PERFEITO! (+25% PESO)', 'perfect');
    }

    const response = game.collect(CHAT_ID, USER_ID, { isPerfect });
    refreshPlayer();
    setActiveSession(null);

    if (response.ok && response.data) {
      const data = response.data;

      // Se capturou peixe
      if (data.fish) {
        const fishWeight = data.fish.weight;
        const isSpecial = ['rare', 'epic', 'legendary'].includes(data.fish.rarity);

        // 4. Som de recolher carretel modulado dinamicamente pelo peso do peixe
        sound.playReel(fishWeight);

        // 5. Micro-congelamento Dramático ("Hit Stop") e flash em capturas especiais ou perfeitas
        if (isSpecial || isPerfect) {
          setHitFlash(true);
          setIsHitStop(true);
          triggerScreenShake();
          setTimeout(() => setHitFlash(false), 80);
          setTimeout(() => setIsHitStop(false), 120);
        }

        // Fanfarra conforme raridade e peso
        sound.playCatch(data.fish.rarity, fishWeight);

        // Popups Flutuantes
        addFloating(`+${data.xpEarned} XP`, 'xp');
        if (data.fish.rarity === 'legendary') {
          addFloating('🔥 CAPTURA LENDÁRIA!', 'legendary');
        }

        setCatchResult(data);
      } else if (data.empty && !data.event) {
        sound.playThud();
        showToast('Apenas algas no anzol desta vez. Tente novamente!', 'info');
      }

      // Se disparou evento
      if (data.event) {
        setTimeout(() => {
          setEventResult({ event: data.event, details: data.eventDetails });
        }, 300);
      }

      // Se subiu de nível
      if (data.leveledUp) {
        setTimeout(() => {
          sound.playLevelUp();
          setLevelUpInfo(data.newLevel);
        }, 800);
      }
    } else {
      sound.playThud();
      showToast(response.message, 'warning');
    }

    setIsCollecting(false);
  };

  // 2c. QUANDO A LINHA ARREBENTA DURANTE O COMBATE
  const handleLineSnap = () => {
    setShowTensionMeter(false);
    game.cancelSession(CHAT_ID, USER_ID);
    setActiveSession(null);
    refreshPlayer();
    addFloating('💥 A LINHA ESTOUROU!', 'coins');
    showToast('A linha não suportou a tensão extrema e o peixe escapou!', 'warning');
  };

  // 3. VENDER PEIXE
  const handleSellFish = (inventoryId: string) => {
    const coinsMult = currentWeather?.coinsMultiplier || 1.0;
    const res = game.sellFish(USER_ID, inventoryId, coinsMult);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      if (res.data?.coinsEarned) {
        addFloating(`+${res.data.coinsEarned} 🪙`, 'coins');
      }
      showToast(res.message, 'success');
    }
  };

  // 4. VENDER TODOS OS PEIXES
  const handleSellAllFish = () => {
    const coinsMult = currentWeather?.coinsMultiplier || 1.0;
    const res = game.sellAll(USER_ID, coinsMult);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      if (res.data?.coinsEarned) {
        addFloating(`+${res.data.coinsEarned} 🪙`, 'coins');
      }
      showToast(res.message, 'success');
      setShowInventory(false);
      if (res.data?.leveledUp) {
        setTimeout(() => {
          sound.playLevelUp();
          setLevelUpInfo(res.data.newLevel);
        }, 500);
      }
    } else {
      showToast(res.message, 'warning');
    }
  };

  // 5. COMPRAR ITEM
  const handleBuyItem = (itemId: string) => {
    const res = game.buy(USER_ID, itemId);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      showToast(res.message, 'success');
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 5.1 COMPRAR AJUDANTE DE AUTOMAÇÃO (COOKIE CLICKER)
  const handleBuyIdleTier = (tierId: string) => {
    const res = game.buyIdleFisher(USER_ID, tierId);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      addFloating(`+${res.data?.newCps} 🪙/s`, 'coins');
      showToast(res.message, 'success');
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 5.1.1 COMPRAR UPGRADE DE EFICIÊNCIA (COOKIE CLICKER UPGRADES)
  const handleBuyIdleUpgrade = (upgradeId: string) => {
    const res = game.buyIdleUpgrade(USER_ID, upgradeId);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      triggerHitFlash();
      addFloating(`2x UPGRADE!`, 'level');
      showToast(res.message, 'success');
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 5.2 CLIQUE MANUAL NA ÁGUA (CLICK POWER & CRÍTICOS)
  const handleWaterClick = (e: React.MouseEvent) => {
    const clickResult = game.processWaterClick(USER_ID);
    refreshPlayer();

    sound.playWaterClick(clickResult.isCritical);
    if (clickResult.isCritical) {
      vibrate.coins();
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addFloating(
      clickResult.isCritical
        ? `🔥 CRÍTICO! +${clickResult.coinsEarned} 🪙`
        : `+${clickResult.coinsEarned} 🪙`,
      'coins',
      { x, y },
    );
  };

  // 5.3 COLETAR O PEIXE DOURADO (GOLDEN FISH / GOLDEN COOKIE)
  const handleCatchGoldenFish = () => {
    const reward = game.claimGoldenFish(USER_ID);
    refreshPlayer();

    if (reward) {
      triggerHitFlash();
      if (reward.instantCoins) {
        addFloating(`+${reward.instantCoins.toLocaleString('pt-BR')} 🪙`, 'coins');
      }
      showToast(`${reward.title} ${reward.description}`, 'success');
    }
  };

  // 5.4 ASCENSÃO CÓSMICA / RENASCIMENTO (COOKIE CLICKER ASCENSION)
  const handleAscend = () => {
    const res = game.ascend(USER_ID);
    refreshPlayer();
    if (res.ok) {
      sound.playAscension();
      vibrate.heavy();
      triggerHitFlash();
      addFloating(`🌟 RENASCIMENTO CÓSMICO!`, 'legendary');
      showToast(res.message, 'success');
      setShowPrestige(false);
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 5.5 COMPRAR BÊNÇÃO CELESTIAL
  const handleBuyCosmicBlessing = (blessingId: string) => {
    const res = game.buyCosmicBlessing(USER_ID, blessingId);
    refreshPlayer();
    if (res.ok) {
      sound.playCoins();
      vibrate.coins();
      triggerHitFlash();
      addFloating(`BÊNÇÃO ETERNA!`, 'legendary');
      showToast(res.message, 'success');
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 6. EQUIPAR ITEM
  const handleEquipItem = (itemId: string) => {
    const res = game.equip(USER_ID, itemId);
    refreshPlayer();
    if (res.ok) {
      sound.playCast();
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  // 7. DESEQUIPAR ISCA
  const handleUnequipBait = () => {
    const res = game.unequipBait(USER_ID);
    refreshPlayer();
    if (res.ok) {
      showToast(res.message, 'info');
    }
  };

  // 8. MUDAR LOCAL
  const handleSelectLocation = (locationId: string) => {
    const res = game.changeLocation(USER_ID, locationId);
    refreshPlayer();
    if (res.ok) {
      sound.playSplash();
      showToast(res.message, 'success');
      setShowLocations(false);
    } else {
      sound.playThud();
      showToast(res.message, 'warning');
    }
  };

  // 8.1 TRANSFERIR PEIXE PARA O AQUÁRIO DE TROFÉUS
  const handleSendFishToAquarium = (inventoryId: string) => {
    const res = game.addFishToAquarium(USER_ID, inventoryId);
    if (res.ok) {
      sound.playSplash();
      showToast(res.message || 'Peixe transferido para o viveiro de troféus!', 'success');
      refreshPlayer();
    } else {
      sound.playThud();
      showToast(res.message || 'Não foi possível colocar o peixe no aquário.', 'warning');
    }
  };

  // 9. ATUALIZAR NOME DO JOGADOR
  const handleUpdatePlayerName = (newName: string) => {
    player.name = newName;
    game.playerManager.savePlayer(player);
    refreshPlayer();
    showToast(`Nome alterado para "${newName}"!`, 'info');
  };

  // 10. REINICIAR PROGRESSO
  const handleResetProgress = () => {
    if (window.confirm('Deseja realmente resetar seu progresso e recomeçar do Nível 1 com a Vara Básica?')) {
      game.storage.clear();
      const fresh = game.initPlayer(USER_ID, 'Capitão Pescador');
      setPlayer({ ...fresh });
      setActiveSession(null);
      showToast('Progresso reiniciado com sucesso!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ── BARRA SUPERIOR (HEADER) ── */}
      <HeaderBar
        player={player}
        currentLocation={currentLocation}
        levelInfo={levelInfo}
        totalCps={totalCps}
        onOpenInventory={() => setShowInventory(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenIdleShop={() => setShowIdleShop(true)}
        onOpenPrestige={() => setShowPrestige(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenLocations={() => setShowLocations(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenMissions={() => setShowMissions(true)}
        onOpenAquarium={() => setShowAquarium(true)}
        onOpenTalents={() => setShowTalents(true)}
        unclaimedMissionsCount={unclaimedMissions}
        availableTalentPoints={availableTalentPoints}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      {/* Flash de Impacto (Hit Flash) */}
      {hitFlash && (
        <div className="fixed inset-0 z-50 bg-white/50 pointer-events-none transition-opacity duration-75 animate-pulse" />
      )}

      {/* ── PALCO CENTRAL DE PESCA ── */}
      <main
        className={`flex-1 flex flex-col justify-center items-center px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-8 max-w-6xl w-full mx-auto relative transition-transform duration-100 ${
          isHitStop ? 'scale-[1.02] filter brightness-125' : ''
        }`}
      >
        {/* Banner de Clima do Lago */}
        <div className="w-full mb-3">
          <WeatherBanner
            weather={currentWeather}
            timeRemainingSeconds={weatherSecondsLeft}
          />
        </div>

        <FishingStage
          player={player}
          currentLocation={currentLocation}
          currentRod={currentRod}
          currentBait={currentBait}
          activeSession={activeSession}
          isCasting={isCasting}
          isCollecting={isCollecting}
          onCast={handleCast}
          onCollect={handleCollect}
          onWaterClick={handleWaterClick}
          onCatchGoldenFish={handleCatchGoldenFish}
          clickPower={clickPowerInfo.coins}
          screenShake={screenShake}
          weather={currentWeather}
        />

        {/* Barra de Acesso Rápido Inferior (Visível apenas em Desktop/Tablets) */}
        <div className="hidden sm:flex w-full max-w-5xl mt-4 flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBestiary(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Guia das Espécies</span>
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Ranking Regional</span>
            </button>

            <button
              onClick={() => setShowIdleShop(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 hover:text-amber-200 border border-amber-500/40 transition-all shadow-sm font-semibold"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Ajudantes ({totalCps} 🪙/s)</span>
            </button>

            <button
              onClick={() => setShowMissions(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-950/50 to-yellow-950/50 hover:from-amber-900/60 hover:to-yellow-900/60 text-amber-300 hover:text-amber-200 border border-amber-500/50 transition-all shadow-sm font-semibold"
            >
              <Scroll className="w-4 h-4 text-amber-400" />
              <span>Missões</span>
              {unclaimedMissions > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-bounce">
                  {unclaimedMissions}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowAquarium(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-950/50 to-blue-950/50 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 hover:text-cyan-200 border border-cyan-500/50 transition-all shadow-sm font-semibold"
            >
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Aquário ({player.aquarium?.fish.length || 0})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              Pescarias Realizadas: {player.stats.totalFishCaught}
            </span>
            <button
              onClick={handleResetProgress}
              className="text-slate-600 hover:text-rose-400 p-2 rounded-xl transition-colors"
              title="Resetar Progresso (Novo Jogo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* ── FLOATING TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border text-xs sm:text-sm font-semibold flex items-center gap-2 pointer-events-none max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/90 border-sky-500/40 text-slate-200'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAIS ── */}
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        player={player}
        shopCatalog={game.getShopCatalog()}
        onSellFish={handleSellFish}
        onSellAllFish={handleSellAllFish}
        onEquipItem={handleEquipItem}
        onUnequipBait={handleUnequipBait}
        calculateFishPrice={(f) =>
          game.shopManager.calculateFishPrice(f, currentWeather?.coinsMultiplier || 1.0, player)
        }
        onSendToAquarium={handleSendFishToAquarium}
      />

      {/* Modal do Aquário / Viveiro de Troféus Personalizado */}
      <AquariumModal
        isOpen={showAquarium}
        onClose={() => setShowAquarium(false)}
        game={game}
        player={player}
        onUpdatePlayer={refreshPlayer}
        showToast={(msg) => showToast(msg, 'success')}
      />

      {/* Modal da Árvore de Maestria & Talentos do Pescador */}
      <TalentModal
        isOpen={showTalents}
        onClose={() => setShowTalents(false)}
        game={game}
        userId={USER_ID}
        onTalentChanged={refreshPlayer}
      />

      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        player={player}
        catalog={game.getShopCatalog()}
        onBuyItem={handleBuyItem}
        onEquipItem={handleEquipItem}
      />

      {/* Modal de Ajudantes & Automação (Cookie Clicker) */}
      <IdleShopModal
        isOpen={showIdleShop}
        onClose={() => setShowIdleShop(false)}
        player={player}
        totalCps={totalCps}
        maxCpsCapacity={game.getMaxCpsCapacity(USER_ID)}
        availableUpgrades={availableUpgrades}
        onBuyTier={handleBuyIdleTier}
        onBuyUpgrade={handleBuyIdleUpgrade}
      />

      {/* Modal de Ascensão Cósmica / Prestígio */}
      <PrestigeModal
        isOpen={showPrestige}
        onClose={() => setShowPrestige(false)}
        status={prestigeStatus}
        onAscend={handleAscend}
        onBuyBlessing={handleBuyCosmicBlessing}
      />

      {/* Modal de Conquistas & Marcos */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        status={achievementsStatus}
      />

      {/* Modal de Missões Diárias & Encomendas */}
      <MissionsModal
        isOpen={showMissions}
        onClose={() => setShowMissions(false)}
        userId={USER_ID}
        missionManager={game.missionManager}
        onMissionClaimed={() => {
          refreshPlayer();
        }}
        showToast={(msg) => showToast(msg, 'success')}
      />

      <LocationsModal
        isOpen={showLocations}
        onClose={() => setShowLocations(false)}
        player={player}
        locations={game.locationManager.getAllLocations()}
        onSelectLocation={handleSelectLocation}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={game.getLeaderboard(USER_ID)}
        currentUserId={USER_ID}
      />

      <BestiaryModal
        isOpen={showBestiary}
        onClose={() => setShowBestiary(false)}
        caughtFishIds={caughtFishIds}
        discoveredFishMap={discoveredFishMap}
      />

      {/* Modal de Captura */}
      {catchResult && (
        <CatchModal
          isOpen={!!catchResult}
          onClose={() => setCatchResult(null)}
          fish={catchResult.fish}
          bonusFish={catchResult.bonusFish}
          xpEarned={catchResult.xpEarned}
          estimatedPrice={catchResult.fish ? game.shopManager.calculateFishPrice(catchResult.fish) : 0}
          onSendToAquarium={() => {
            if (catchResult.fish?.inventoryId) {
              handleSendFishToAquarium(catchResult.fish.inventoryId);
            }
            setCatchResult(null);
          }}
          onSellNow={() => {
            if (catchResult.fish?.inventoryId) {
              handleSellFish(catchResult.fish.inventoryId);
            }
            setCatchResult(null);
          }}
        />
      )}

      {/* Modal de Evento */}
      {eventResult && (
        <EventModal
          isOpen={!!eventResult}
          onClose={() => setEventResult(null)}
          event={eventResult.event}
          eventDetails={eventResult.details}
        />
      )}

      {/* Modal de Level Up */}
      {levelUpInfo !== null && (
        <LevelUpModal
          isOpen={levelUpInfo !== null}
          onClose={() => setLevelUpInfo(null)}
          newLevel={levelUpInfo}
        />
      )}
      {/* Minigame de Batalha de Pesca Realista (Reel & Fight Engine) */}
      <ReelTensionMeter
        isOpen={showTensionMeter}
        session={activeSession}
        rodName={equippedRod?.name || 'Vara Básica'}
        rodId={player.equipment.rod}
        onSuccess={executeCollect}
        onLineSnap={handleLineSnap}
        onClose={() => setShowTensionMeter(false)}
      />

      {/* Números Flutuantes de Recompensa (Damage/Reward Numbers) montados no topo da árvore DOM */}
      <FloatingFeedback items={floatingItems} onDismiss={removeFloating} />

      {/* ── DOCK DE NAVEGAÇÃO INFERIOR MOBILE ── */}
      <MobileBottomDock
        player={player}
        currentLocation={currentLocation}
        totalCps={totalCps}
        unclaimedMissionsCount={unclaimedMissions}
        availableTalentPoints={availableTalentPoints}
        onOpenInventory={() => setShowInventory(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenIdleShop={() => setShowIdleShop(true)}
        onOpenPrestige={() => setShowPrestige(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenLocations={() => setShowLocations(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenMissions={() => setShowMissions(true)}
        onOpenAquarium={() => setShowAquarium(true)}
        onOpenTalents={() => setShowTalents(true)}
        onOpenBestiary={() => setShowBestiary(true)}
        onResetProgress={handleResetProgress}
        onScrollToFishingStage={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
