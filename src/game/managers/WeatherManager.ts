// src/game/managers/WeatherManager.ts
// ─────────────────────────────────────────────────────────────
// Gerenciador de Clima do Lago (Weather Manager)
// Alterna periodicamente entre climas a cada ciclo de minutos,
// provendo efeitos visuais e multiplicadores dinâmicos.
// ─────────────────────────────────────────────────────────────

import { WEATHER_TYPES, WeatherType, WeatherInfo } from '../data/weather.data.js';

export class WeatherManager {
  private currentWeatherType: WeatherType = 'sunny';
  private weatherStartedAt: number = Date.now();
  private durationMs: number = 3 * 60 * 1000; // 3 minutos por ciclo de clima

  constructor() {
    this.rotateWeather();
  }

  getCurrentWeather(): WeatherInfo {
    const elapsed = Date.now() - this.weatherStartedAt;
    if (elapsed > this.durationMs) {
      this.rotateWeather();
    }
    return WEATHER_TYPES[this.currentWeatherType];
  }

  getTimeRemainingSeconds(): number {
    const elapsed = Date.now() - this.weatherStartedAt;
    const remaining = Math.max(0, this.durationMs - elapsed);
    return Math.ceil(remaining / 1000);
  }

  rotateWeather(): WeatherInfo {
    const types: WeatherType[] = ['sunny', 'rainy', 'storm', 'mystic_moon'];
    // Escolhe aleatoriamente um clima diferente do atual
    const choices = types.filter((t) => t !== this.currentWeatherType);
    const nextType = choices[Math.floor(Math.random() * choices.length)];
    this.currentWeatherType = nextType;
    this.weatherStartedAt = Date.now();
    return WEATHER_TYPES[this.currentWeatherType];
  }

  setWeather(type: WeatherType): WeatherInfo {
    this.currentWeatherType = type;
    this.weatherStartedAt = Date.now();
    return WEATHER_TYPES[type];
  }
}
