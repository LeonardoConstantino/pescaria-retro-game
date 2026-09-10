// src/components/WeatherBanner.tsx
// ─────────────────────────────────────────────────────────────
// Banner Compacto de Clima no Topo do Lago
// Exibe o clima atual, multiplicadores ativos e contagem regressiva para a próxima maré.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { WeatherInfo } from '../game/data/weather.data.js';
import { CloudRain, Sun, Zap, Moon, Clock } from 'lucide-react';

interface WeatherBannerProps {
  weather: WeatherInfo;
  timeRemainingSeconds: number;
}

export const WeatherBanner: React.FC<WeatherBannerProps> = ({
  weather,
  timeRemainingSeconds,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getIcon = () => {
    switch (weather.id) {
      case 'rainy':
        return <CloudRain className="w-4 h-4 text-blue-300" />;
      case 'storm':
        return <Zap className="w-4 h-4 text-amber-300" />;
      case 'mystic_moon':
        return <Moon className="w-4 h-4 text-purple-300" />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-xs shadow-md select-none w-full max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-base">{weather.emoji}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-100">{weather.name}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              • {weather.buffDescription}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{formatTime(timeRemainingSeconds)}</span>
      </div>
    </div>
  );
};
