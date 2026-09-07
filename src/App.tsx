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
  const [showLocations, setShowLocations] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);

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

  const addFloating = (text: string, type: 'xp' | 'coins' | 'perfect' | 'legendary' | 'weight') => {
    const newItem: FloatingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text,
      type,
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

  // Peixes únicos pescados (para o Bestiário)
  const caughtFishIds = useMemo(() => {
    const ids = new Set<string>();
    player.inventory.fish.forEach((f) => ids.add(f.id));
    if (player.stats.largestFishName) {
      // adiciona histórico
    }
    return Array.from(ids);
  }, [player.inventory.fish, player.stats.largestFishName]);

  // 1. LANÇAR LINHA
  const handleCast = () => {
    if (isCasting) return;
    setIsCasting(true);

    const response = game.cast(CHAT_ID, USER_ID);
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

  // 2. INICIAR RECOLHIMENTO (ABRE MEDIDOR DE TENSÃO OU COLETAR DIRETO)
  const handleCollect = () => {
    if (isCollecting) return;
    // Abre o minigame de tensão e quick-time
    setShowTensionMeter(true);
  };

  // 2b. EXECUTAR COLETAR COM RESULTADO DO QUICK-TIME (PERFEITO OU NORMAL)
  const executeCollect = (isPerfect: boolean) => {
    setShowTensionMeter(false);
    setIsCollecting(true);

    if (isPerfect) {
      addFloating('⭐ FISGADA PERFEITA! (+25% PESO)', 'perfect');
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

  // 3. VENDER PEIXE
  const handleSellFish = (inventoryId: string) => {
    const res = game.sellFish(USER_ID, inventoryId);
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
    const res = game.sellAll(USER_ID);
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
        onOpenInventory={() => setShowInventory(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenLocations={() => setShowLocations(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      {/* Flash de Impacto (Hit Flash) */}
      {hitFlash && (
        <div className="fixed inset-0 z-50 bg-white/50 pointer-events-none transition-opacity duration-75 animate-pulse" />
      )}

      {/* ── PALCO CENTRAL DE PESCA ── */}
      <main
        className={`flex-1 flex flex-col justify-center items-center px-3 sm:px-4 py-4 sm:py-6 max-w-6xl w-full mx-auto relative transition-transform duration-100 ${
          isHitStop ? 'scale-[1.02] filter brightness-125' : ''
        }`}
      >
        {/* Números Flutuantes de Recompensa (Damage/Reward Numbers) */}
        <FloatingFeedback items={floatingItems} onDismiss={removeFloating} />

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
          screenShake={screenShake}
        />

        {/* Barra de Acesso Rápido Inferior */}
        <div className="w-full max-w-5xl mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
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
        calculateFishPrice={(f) => game.shopManager.calculateFishPrice(f)}
      />

      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        player={player}
        catalog={game.getShopCatalog()}
        onBuyItem={handleBuyItem}
        onEquipItem={handleEquipItem}
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
      {/* Mini-jogo de Tensão de Recolhimento (Quick-Time Event) */}
      <ReelTensionMeter
        isOpen={showTensionMeter}
        onComplete={executeCollect}
      />
    </div>
  );
}
