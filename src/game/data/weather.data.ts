// src/game/data/weather.data.ts
// ─────────────────────────────────────────────────────────────
// Sistema de Eventos Climáticos Dinâmicos no Lago
// Climas cíclicos que alteram a atmosfera visual e fornecem multiplicadores reais.
// ─────────────────────────────────────────────────────────────

export type WeatherType = 'sunny' | 'rainy' | 'storm' | 'mystic_moon';

export interface WeatherInfo {
  id: WeatherType;
  name: string;
  emoji: string;
  description: string;
  buffDescription: string;
  colorTheme: string;
  soundType: string;
  biteSpeedMultiplier: number; // Multiplicador na velocidade da fisgada
  coinsMultiplier: number;     // Multiplicador no valor de venda dos peixes
  goldenFishChanceMult: number; // Multiplicador de spawn do Golden Fish
}

export const WEATHER_TYPES: Record<WeatherType, WeatherInfo> = {
  sunny: {
    id: 'sunny',
    name: 'Dia Ensolarado',
    emoji: '☀️',
    description: 'Águas calmas e límpidas sob a luz do sol.',
    buffDescription: 'Condições estáveis e clássicas de pescaria.',
    colorTheme: 'from-sky-400 to-amber-200',
    soundType: 'breeze',
    biteSpeedMultiplier: 1.0,
    coinsMultiplier: 1.0,
    goldenFishChanceMult: 1.0,
  },
  rainy: {
    id: 'rainy',
    name: 'Chuva Suave',
    emoji: '🌧️',
    description: 'Gotas agitam a superfície e atraem os cardumes.',
    buffDescription: '+35% velocidade de fisgada e mais peixes.',
    colorTheme: 'from-blue-600/30 via-slate-700/40 to-slate-900/60',
    soundType: 'rain',
    biteSpeedMultiplier: 1.35,
    coinsMultiplier: 1.15,
    goldenFishChanceMult: 1.2,
  },
  storm: {
    id: 'storm',
    name: 'Tempestade Elétrica',
    emoji: '⚡',
    description: 'Trovões e relâmpagos despertam as espécies de alta energia.',
    buffDescription: 'Peixes valem 2x Moedas (100% bônus de venda)!',
    colorTheme: 'from-indigo-900/50 via-purple-950/60 to-slate-950',
    soundType: 'thunder',
    biteSpeedMultiplier: 1.2,
    coinsMultiplier: 2.0,
    goldenFishChanceMult: 1.5,
  },
  mystic_moon: {
    id: 'mystic_moon',
    name: 'Noite de Lua Cheia Mística',
    emoji: '🌕',
    description: 'Um brilho prateado ilumina o leito d’água.',
    buffDescription: 'Peixes Dourados aparecem 3x mais rápido!',
    colorTheme: 'from-indigo-950 via-violet-950/70 to-slate-950',
    soundType: 'mystic',
    biteSpeedMultiplier: 1.1,
    coinsMultiplier: 1.25,
    goldenFishChanceMult: 3.0,
  },
};
