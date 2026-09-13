// src/game/managers/WeatherManager.ts
// ─────────────────────────────────────────────────────────────
// Gerenciador de Clima do Lago (Weather Manager)
// Alterna periodicamente entre climas a cada ciclo de minutos,
// provendo efeitos visuais e multiplicadores dinâmicos.
// ─────────────────────────────────────────────────────────────

import { WEATHER_TYPES, WeatherType, WeatherInfo } from '../data/weather.data.js';

export class WeatherManager {
  private currentWeatherType: WeatherType = 'sunny';
  private nextWeatherType: WeatherType = 'rainy';
  private weatherStartedAt: number = Date.now();
  private durationMs: number = 3 * 60 * 1000; // 3 minutos por ciclo de clima

  constructor() {
    this.initWeather();
  }

  private pickRandomDifferent(exclude: WeatherType): WeatherType {
    const types: WeatherType[] = ['sunny', 'rainy', 'storm', 'mystic_moon'];
    const choices = types.filter((t) => t !== exclude);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  private initWeather() {
    const types: WeatherType[] = ['sunny', 'rainy', 'storm', 'mystic_moon'];
    this.currentWeatherType = types[Math.floor(Math.random() * types.length)];
    this.nextWeatherType = this.pickRandomDifferent(this.currentWeatherType);
    this.weatherStartedAt = Date.now();
  }

  getCurrentWeather(): WeatherInfo {
    const elapsed = Date.now() - this.weatherStartedAt;
    if (elapsed > this.durationMs) {
      this.rotateWeather();
    }
    return WEATHER_TYPES[this.currentWeatherType];
  }

  getNextWeather(): WeatherInfo {
    return WEATHER_TYPES[this.nextWeatherType];
  }

  getTimeRemainingSeconds(): number {
    const elapsed = Date.now() - this.weatherStartedAt;
    const remaining = Math.max(0, this.durationMs - elapsed);
    return Math.ceil(remaining / 1000);
  }

  rotateWeather(): WeatherInfo {
    this.currentWeatherType = this.nextWeatherType;
    this.nextWeatherType = this.pickRandomDifferent(this.currentWeatherType);
    this.weatherStartedAt = Date.now();
    return WEATHER_TYPES[this.currentWeatherType];
  }

  setWeather(type: WeatherType): WeatherInfo {
    this.currentWeatherType = type;
    this.nextWeatherType = this.pickRandomDifferent(type);
    this.weatherStartedAt = Date.now();
    return WEATHER_TYPES[type];
  }
}
