// src/components/WeatherBanner.tsx
// ─────────────────────────────────────────────────────────────
// Banner Compacto de Clima no Topo do Lago & Modal de Detalhes
// Exibe o clima atual, previsão meteorológica futura (Barômetro/Talento)
// e controle divino de invocação de clima (Bênção Cósmica: Domínio dos Céus).
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WEATHER_TYPES, WeatherInfo, WeatherType } from '../game/data/weather.data.js';
import {
  CloudRain,
  Sun,
  Zap,
  Moon,
  Clock,
  Info,
  ChevronRight,
  X,
  Sparkles,
  Wind,
  Eye,
  Lock,
  Compass,
  Star,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio.js';

interface WeatherBannerProps {
  weather: WeatherInfo;
  nextWeather?: WeatherInfo;
  timeRemainingSeconds: number;
  hasWeatherControl: boolean;
  hasWeatherForesight: boolean;
  onSelectWeather?: (type: WeatherType) => void;
  onOpenPrestige?: () => void;
  onOpenTalents?: () => void;
}

export const WeatherBanner: React.FC<WeatherBannerProps> = ({
  weather,
  nextWeather,
  timeRemainingSeconds,
  hasWeatherControl,
  hasWeatherForesight,
  onSelectWeather,
  onOpenPrestige,
  onOpenTalents,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getIcon = (id: WeatherType) => {
    switch (id) {
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'storm':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'mystic_moon':
        return <Moon className="w-4 h-4 text-purple-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleSelectWeatherType = (type: WeatherType) => {
    if (!hasWeatherControl) {
      sound.playThud();
      return;
    }

    if (type === 'storm') {
      sound.playThunder();
    } else {
      sound.playSplash();
    }
    if (onSelectWeather) {
      onSelectWeather(type);
    }
    setShowDetails(false);
  };

  const weatherEffectsDescriptions: Record<WeatherType, { effects: string; atmospheric: string }> = {
    sunny: {
      effects: 'Feixes de luz solar volumétricos (God Rays) e reflexos especulares cintilantes (Glints) na água.',
      atmospheric: 'Iluminação diurna límpida, brisa calma e condições ideais para pescaria estável.',
    },
    rainy: {
      effects: 'Gotas de chuva contínuas com micro-ondulações elípticas e respingos dinâmicos na superfície da água.',
      atmospheric: 'Névoa suave no horizonte, agitação na superfície que estimula a fome dos peixes (+35% velocidade).',
    },
    storm: {
      effects: 'Chuva torrencial inclinada pelo vento, relâmpagos estocásticos cortando o céu com trovão distante procedural.',
      atmospheric: 'Clima de alta energia elétrica: todas as espécies vendidas rendem o dobro de moedas (+100% bônus)!',
    },
    mystic_moon: {
      effects: 'Lua Cheia celestial com halo etéreo, estrelas cadentes ocasionais e trilha de reflexo prateado ondulando no leito d\'água.',
      atmospheric: 'Vagalumes bioluminescentes arcanos flutuam sobre a água e a chance de spawn do Peixe Dourado é 3x maior.',
    },
  };

  const weatherTips: Record<WeatherType, string> = {
    sunny: 'Aproveite para estocar moedas e pescar com calma sob o sol.',
    rainy: 'Excelente momento para pescaria veloz: o tempo até o peixe morder a isca cai em 35%!',
    storm: 'Momento de ouro! Venda seus peixes agora: o valor de venda é dobrado (2x moedas)!',
    mystic_moon: 'Fique atento ao lago! Peixes Dourados surgem 3x mais rápido durante o luar místico.',
  };

  const detailsModal = (
    <AnimatePresence>
      {showDetails && (
        <div
          id="weather-details-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            id="weather-details-modal"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-sky-950/50 flex items-center justify-center">
                  <span className="text-xl">{weather.emoji}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    Clima & Atmosfera do Lago
                    {hasWeatherControl && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
                        ⚡ Domínio Ativo
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Efeitos visuais, previsões meteorológicas e domínio celestial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-4 sm:p-5 space-y-4 text-sm text-slate-300 overflow-y-auto flex-1">
              {/* ── CARD 1: CLIMA ATIVO ATUAL ── */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    {getIcon(weather.id)} Clima Ativo
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>Duração restante: {formatTime(timeRemainingSeconds)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{weather.emoji}</span>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{weather.name}</h4>
                    <p className="text-xs text-amber-300 font-medium">{weather.buffDescription}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-start gap-1.5 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Efeitos Visuais:</strong> {weatherEffectsDescriptions[weather.id].effects}</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-slate-400">
                    <Wind className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Atmosfera:</strong> {weatherEffectsDescriptions[weather.id].atmospheric}</span>
                  </p>
                </div>
              </div>

              {/* ── CARD 2: PREVISÃO METEOROLÓGICA (BARÔMETRO ANCESTRAL) ── */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    Previsão Meteorológica
                  </span>
                  {hasWeatherForesight ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Barômetro Ativo
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Oculta
                    </span>
                  )}
                </div>

                {hasWeatherForesight && nextWeather ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-purple-950/40 border border-purple-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{nextWeather.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">Próximo Clima:</span>
                            <span className="text-xs font-black text-purple-300">{nextWeather.name}</span>
                          </div>
                          <p className="text-[11px] text-amber-300 font-medium">
                            {nextWeather.buffDescription}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Chega em</span>
                        <span className="text-xs font-mono font-bold text-purple-200">
                          {formatTime(timeRemainingSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Dica Estratégica do Pescador:
                      </span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {weatherTips[nextWeather.id]}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 space-y-2 text-center">
                    <p className="text-xs text-slate-400 italic">
                      "As névoas e marés escondem o próximo ciclo das águas..."
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Desbloqueie o talento <strong className="text-purple-300">Sintonia com as Marés</strong> (Rank 1+) na Árvore de Talentos para ativar o Barômetro Ancestral e prever os climas com antecedência.
                    </p>
                    {onOpenTalents && (
                      <button
                        onClick={() => {
                          setShowDetails(false);
                          onOpenTalents();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Ver Talento na Árvore de Maestria</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── CARD 3: INVOÇÃO / MUDANÇA DE CLIMA (DOMÍNIO DOS CÉUS) ── */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    {hasWeatherControl ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Invocação Celestial (Poder Divino)
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        Invocação Manual de Clima
                      </>
                    )}
                  </h4>
                  {hasWeatherControl ? (
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Autoridade Concedida
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Requer Bênção Cósmica
                    </span>
                  )}
                </div>

                {!hasWeatherControl && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      A faculdade de mudar o clima à vontade é uma autoridade suprema que exige a Bênção Cósmica <strong className="text-amber-300">Domínio dos Céus</strong> no Templo da Ascensão Cósmica (Prestígio).
                    </p>
                    {onOpenPrestige && (
                      <button
                        onClick={() => {
                          setShowDetails(false);
                          onOpenPrestige();
                        }}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Ver Bênção "Domínio dos Céus" na Ascensão</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(WEATHER_TYPES) as WeatherType[]).map((wId) => {
                    const w = WEATHER_TYPES[wId];
                    const isSelected = weather.id === wId;
                    return (
                      <button
                        key={wId}
                        onClick={() => handleSelectWeatherType(wId)}
                        disabled={!hasWeatherControl}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 relative ${
                          isSelected
                            ? 'bg-sky-950/40 border-sky-500/60 ring-2 ring-sky-500/30'
                            : hasWeatherControl
                            ? 'bg-slate-950/50 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 cursor-pointer active:scale-95'
                            : 'bg-slate-950/30 border-slate-800/80 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <span>{w.emoji}</span> {w.name}
                          </span>
                          {isSelected ? (
                            <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded">
                              Ativo
                            </span>
                          ) : hasWeatherControl ? (
                            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {w.buffDescription}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-right shrink-0">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        id="weather-banner-container"
        onClick={() => setShowDetails(true)}
        className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-950/75 border border-slate-800/80 hover:border-sky-500/40 backdrop-blur-md text-xs shadow-md select-none w-full max-w-xl mx-auto cursor-pointer transition-all hover:bg-slate-900/80 active:scale-[0.99] group"
        title="Clique para ver efeitos do clima, previsão do tempo e domínio celestial"
      >
        {/* Clima Atual */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-lg group-hover:scale-110 transition-transform shrink-0">
            {weather.emoji}
          </span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-100 truncate">{weather.name}</span>
              {hasWeatherControl && (
                <span className="text-[10px] text-amber-400 font-bold hidden sm:inline" title="Poder Divino de Invocação Ativo">
                  ⚡
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              {weather.buffDescription}
            </span>
          </div>
        </div>

        {/* Lado Direito: Previsão Futura + Cronômetro */}
        <div className="flex items-center gap-2 shrink-0">
          {hasWeatherForesight && nextWeather && (
            <div
              className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-950/50 border border-purple-500/40 text-[10px] text-purple-200"
              title={`Previsão: ${nextWeather.name} em ${formatTime(timeRemainingSeconds)}`}
            >
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="font-bold">Próx:</span>
              <span>{nextWeather.emoji}</span>
              <span className="truncate max-w-[85px]">{nextWeather.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <div className="p-1 rounded-md text-slate-400 group-hover:text-sky-400 transition-colors">
            <Info className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(detailsModal, document.body)}
    </>
  );
};
