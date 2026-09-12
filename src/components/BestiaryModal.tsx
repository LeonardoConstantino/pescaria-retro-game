// src/components/BestiaryModal.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FishData, GameFish } from '../game/data/fish.data.js';
import { GameConfig } from '../game/data/game.config.js';
import { DiscoveredFishEntry } from '../game/managers/PlayerManager.js';
import { GameAssetImage } from './GameAssetImage.js';
import { HoloCard } from './HoloCard.js';
import {
  BookOpen,
  Sparkles,
  Check,
  HelpCircle,
  X,
  Search,
  Trophy,
  Compass,
  Waves,
  Scale,
  Coins,
} from 'lucide-react';
import { sound } from '../utils/audio.js';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caughtFishIds: string[];
  discoveredFishMap?: Record<string, DiscoveredFishEntry>;
}

const LOCATION_LABELS: Record<string, string> = {
  lake: 'Lago',
  river: 'Rio',
  swamp: 'Pântano',
  ocean: 'Mar Aberto',
  abyss: 'Abismo',
};

type FilterCategory = 'all' | 'discovered' | 'undiscovered' | 'lake' | 'river' | 'swamp' | 'ocean' | 'abyss';

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  caughtFishIds,
  discoveredFishMap = {},
}) => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const totalSpecies = FishData.length;
  const discoveredCount = caughtFishIds.length;
  const progressPercent = Math.round((discoveredCount / totalSpecies) * 100);

  // Filtragem inteligente de espécies
  const filteredFish = useMemo(() => {
    return FishData.filter((fish) => {
      const isDiscovered = caughtFishIds.includes(fish.id);

      // Filtro de categoria
      if (filter === 'discovered' && !isDiscovered) return false;
      if (filter === 'undiscovered' && isDiscovered) return false;
      if (['lake', 'river', 'swamp', 'ocean', 'abyss'].includes(filter)) {
        if (!fish.locations.includes(filter)) return false;
      }

      // Filtro de busca (para peixes não descobertos, pesquisa por habitat)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        if (isDiscovered) {
          const matchName = fish.name.toLowerCase().includes(query);
          const matchDesc = fish.description.toLowerCase().includes(query);
          return matchName || matchDesc;
        } else {
          // Se não descoberto, só busca por habitat ou raridade
          const habitats = fish.locations.map((loc) => LOCATION_LABELS[loc] || loc).join(' ').toLowerCase();
          return habitats.includes(query) || 'misterioso desconhecido'.includes(query);
        }
      }

      return true;
    });
  }, [caughtFishIds, filter, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      id="bestiary-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <motion.div
        id="bestiary-modal-container"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-[96vw] sm:w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Bestiário com Barra de Conclusão */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex flex-col gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                  Guia Ilustrado das Espécies
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {discoveredCount}/{totalSpecies}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                  Enciclopédia viva de todas as criaturas que habitam os ecossistemas aquáticos.
                </p>
              </div>
            </div>

            <button
              id="bestiary-close-button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors touch-manipulation shrink-0"
              title="Fechar Guia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso de Descobertas */}
          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Descobertas Catalogadas
              </span>
              <span className="font-bold text-indigo-300">
                {discoveredCount} de {totalSpecies} espécies ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca (Rolável no Mobile) */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          {/* Abas de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(
              [
                { id: 'all', label: `Todos (${totalSpecies})` },
                { id: 'discovered', label: `Descobertos (${discoveredCount})` },
                { id: 'undiscovered', label: `Desconhecidos (${totalSpecies - discoveredCount})` },
                { id: 'lake', label: 'Lago' },
                { id: 'river', label: 'Rio' },
                { id: 'swamp', label: 'Pântano' },
                { id: 'ocean', label: 'Mar' },
                { id: 'abyss', label: 'Abismo' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playWaterClick(false);
                    setFilter(tab.id as FilterCategory);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar peixe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Grade de Peixes do Bestiário */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 custom-scrollbar-amber">
          {filteredFish.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Compass className="w-10 h-10 mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma espécie encontrada com esses filtros.</p>
              <p className="text-xs text-slate-500 mt-1">Tente trocar a aba ou limpar a busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFish.map((fish) => {
                const isDiscovered = caughtFishIds.includes(fish.id);
                const statsEntry = discoveredFishMap[fish.id];
                const rarityConfig = GameConfig.rarity[fish.rarity] || GameConfig.rarity.common;

                return (
                  <HoloCard
                    key={fish.id}
                    rarity={isDiscovered ? (fish.rarity as any) : 'common'}
                    enableTilt={isDiscovered}
                    className={`rounded-2xl border transition-all ${
                      isDiscovered
                        ? 'border-slate-800 bg-slate-950/75 shadow-lg hover:border-slate-700'
                        : 'border-slate-800/60 bg-slate-950/40'
                    }`}
                  >
                    <div className="p-3 sm:p-3.5 flex items-start gap-3 w-full h-full">
                      {/* Avatar / Imagem do Peixe com Efeito de Borrão para Peixes Desconhecidos */}
                      <div className="relative shrink-0">
                        {isDiscovered ? (
                          <div className="relative">
                            <GameAssetImage
                              assetId={fish.assetId}
                              name={fish.name}
                              rarity={fish.rarity}
                              size="md"
                            />
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        ) : (
                          /* Peixe Não Descoberto: Imagem Fortemente Borrada e Silhueta Misteriosa */
                          <div
                            className="relative w-16 h-16 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center overflow-hidden group"
                            title="Espécie ainda não descoberta! Lance a linha para catalogá-la."
                          >
                            {/* Silhueta borrada do peixe que aguça a curiosidade */}
                            <div className="w-full h-full flex items-center justify-center blur-md grayscale brightness-40 contrast-125 opacity-30 select-none pointer-events-none scale-95 transition-transform duration-500">
                              <GameAssetImage
                                assetId={fish.assetId}
                                name="Desconhecido"
                                rarity="common"
                                size="md"
                              />
                            </div>
                            {/* Ponto de Interrogação Cósmico Central */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center shadow-inner">
                                <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Informações da Espécie */}
                      <div className="flex-1 min-w-0">
                        {/* Nome & Tag de Raridade */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-sm text-slate-100 truncate">
                            {isDiscovered ? fish.name : '??? (Espécie Misteriosa)'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                              isDiscovered ? '' : 'border-slate-700 bg-slate-800 text-slate-400'
                            }`}
                            style={
                              isDiscovered
                                ? {
                                    color: rarityConfig.color,
                                    borderColor: rarityConfig.color + '40',
                                    backgroundColor: rarityConfig.color + '15',
                                  }
                                : undefined
                            }
                          >
                            {isDiscovered ? rarityConfig.label : '??? Desconhecido'}
                          </span>
                        </div>

                        {/* Descrição Autêntica vs Texto Misterioso */}
                        <p className="text-xs text-slate-300/90 mt-1 line-clamp-2 leading-relaxed">
                          {isDiscovered
                            ? fish.description
                            : 'Esta espécie aquática ainda não foi pescada e catalogada. Explore diferentes biomas com iscas especiais para revelar seus segredos!'}
                        </p>

                        {/* Metadados & Habitats */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          {/* Habitats de Origem */}
                          <div className="flex items-center gap-1 text-slate-400">
                            <Waves className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="truncate">
                              {fish.locations
                                .map((loc) => LOCATION_LABELS[loc] || loc)
                                .join(', ')}
                            </span>
                          </div>

                          {/* Estatísticas de Captura Persistentes (Recorde e Contagem) */}
                          {isDiscovered ? (
                            <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                              <span className="flex items-center gap-1 text-amber-300" title="Valor base de venda">
                                <Coins className="w-3 h-3" />
                                {fish.basePrice}
                              </span>

                              {statsEntry?.maxWeight ? (
                                <span className="flex items-center gap-1 text-emerald-400" title="Maior peso capturado">
                                  <Trophy className="w-3 h-3" />
                                  {statsEntry.maxWeight} kg
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-400" title="Faixa de peso">
                                  <Scale className="w-3 h-3" />
                                  {fish.minWeight}-{fish.maxWeight}kg
                                </span>
                              )}

                              {statsEntry?.count && statsEntry.count > 0 && (
                                <span className="text-slate-400 text-[10px]">
                                  ({statsEntry.count}x)
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                              <span>⚖️ ??? kg</span>
                              <span>🪙 ???</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </HoloCard>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
