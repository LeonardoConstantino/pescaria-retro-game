// src/utils/audio.ts
// ─────────────────────────────────────────────
// Efeitos sonoros e som ambiente procedurais via Web Audio API.
// Sem dependência de arquivos externos mp3/wav.
// Suporte a controle de volume Master, SFX e Ambiente,
// com persistência no LocalStorage e loop procedural de natureza.
// ─────────────────────────────────────────────

export interface AudioState {
  enabled: boolean; // Master ligado / não mutado
  masterVolume: number; // 0.0 a 1.0
  sfxVolume: number; // 0.0 a 1.0
  ambientVolume: number; // 0.0 a 1.0
  sfxMuted: boolean;
  ambientMuted: boolean;
  ambientActive: boolean;
  currentWeather: string;
  currentLocation: string;
}

type AudioListener = (state: AudioState) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true; // Master toggle
  public masterVolume = 1.0;
  public sfxVolume = 0.8;
  public ambientVolume = 0.5;
  public sfxMuted = false;
  public ambientMuted = false;

  // Nós principais de ganho
  private masterGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private ambientGainNode: GainNode | null = null;

  // Nós e estado do loop de som ambiente procedural
  private isAmbientRunning = false;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private ambientLfoGain: GainNode | null = null;
  private rainNoiseSource: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private mysticOsc1: OscillatorNode | null = null;
  private mysticOsc2: OscillatorNode | null = null;
  private mysticGain: GainNode | null = null;

  private currentWeather = 'sunny';
  private currentLocation = 'lake';
  private listeners: Set<AudioListener> = new Set();
  private hasUserInteracted = false;

  constructor() {
    this.loadSettings();

    if (typeof window !== 'undefined') {
      // Escuta primeiro clique/toque para iniciar áudio sem violação de política do navegador
      const onUserGesture = () => {
        this.hasUserInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        // Se o ambiente estiver habilitado e com volume > 0, inicializa o loop
        if (this.enabled && !this.ambientMuted && this.ambientVolume > 0.05 && !this.isAmbientRunning) {
          this.startAmbient();
        }
        window.removeEventListener('click', onUserGesture);
        window.removeEventListener('touchstart', onUserGesture);
        window.removeEventListener('keydown', onUserGesture);
      };
      window.addEventListener('click', onUserGesture, { passive: true });
      window.addEventListener('touchstart', onUserGesture, { passive: true });
      window.addEventListener('keydown', onUserGesture, { passive: true });

      // Pausa som ambiente quando a aba estiver em segundo plano
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  // ─────────────────────────────────────────────
  // Persistência no LocalStorage
  // ─────────────────────────────────────────────
  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedMaster = localStorage.getItem('pescaria_audio_master_vol');
      if (savedMaster !== null) this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedMaster)));

      const savedSfx = localStorage.getItem('pescaria_audio_sfx_vol');
      if (savedSfx !== null) this.sfxVolume = Math.max(0, Math.min(1, parseFloat(savedSfx)));

      const savedAmb = localStorage.getItem('pescaria_audio_ambient_vol');
      if (savedAmb !== null) this.ambientVolume = Math.max(0, Math.min(1, parseFloat(savedAmb)));

      const savedMuted = localStorage.getItem('pescaria_audio_muted');
      if (savedMuted !== null) this.enabled = savedMuted !== 'true';

      const savedSfxMuted = localStorage.getItem('pescaria_audio_sfx_muted');
      if (savedSfxMuted !== null) this.sfxMuted = savedSfxMuted === 'true';

      const savedAmbMuted = localStorage.getItem('pescaria_audio_ambient_muted');
      if (savedAmbMuted !== null) this.ambientMuted = savedAmbMuted === 'true';
    } catch (_) {}
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pescaria_audio_master_vol', this.masterVolume.toFixed(2));
      localStorage.setItem('pescaria_audio_sfx_vol', this.sfxVolume.toFixed(2));
      localStorage.setItem('pescaria_audio_ambient_vol', this.ambientVolume.toFixed(2));
      localStorage.setItem('pescaria_audio_muted', String(!this.enabled));
      localStorage.setItem('pescaria_audio_sfx_muted', String(this.sfxMuted));
      localStorage.setItem('pescaria_audio_ambient_muted', String(this.ambientMuted));
    } catch (_) {}
  }

  // ─────────────────────────────────────────────
  // Inicialização e Grafo Web Audio
  // ─────────────────────────────────────────────
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initAudioGraph();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initAudioGraph(): void {
    if (!this.ctx) return;
    try {
      this.masterGainNode = this.ctx.createGain();
      this.sfxGainNode = this.ctx.createGain();
      this.ambientGainNode = this.ctx.createGain();

      this.sfxGainNode.connect(this.masterGainNode);
      this.ambientGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.ctx.destination);

      this.applyGains();
    } catch (e) {
      console.warn('Erro ao inicializar grafo de áudio:', e);
    }
  }

  private applyGains(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const effectiveMaster = this.enabled ? this.masterVolume : 0;
    const effectiveSfx = this.sfxMuted ? 0 : this.sfxVolume;
    const effectiveAmbient = this.ambientMuted ? 0 : this.ambientVolume;

    if (this.masterGainNode) {
      this.masterGainNode.gain.cancelScheduledValues(now);
      this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
      this.masterGainNode.gain.linearRampToValueAtTime(effectiveMaster, now + 0.05);
    }

    if (this.sfxGainNode) {
      this.sfxGainNode.gain.cancelScheduledValues(now);
      this.sfxGainNode.gain.setValueAtTime(this.sfxGainNode.gain.value, now);
      this.sfxGainNode.gain.linearRampToValueAtTime(effectiveSfx, now + 0.05);
    }

    if (this.ambientGainNode) {
      this.ambientGainNode.gain.cancelScheduledValues(now);
      this.ambientGainNode.gain.setValueAtTime(this.ambientGainNode.gain.value, now);
      this.ambientGainNode.gain.linearRampToValueAtTime(effectiveAmbient, now + 0.08);
    }
  }

  public getSfxDestination(ctx?: AudioContext): AudioNode {
    const c = ctx || this.getContext();
    if (this.sfxGainNode) return this.sfxGainNode;
    return c ? c.destination : ({} as AudioNode);
  }

  public getAmbientDestination(ctx?: AudioContext): AudioNode {
    const c = ctx || this.getContext();
    if (this.ambientGainNode) return this.ambientGainNode;
    return c ? c.destination : ({} as AudioNode);
  }

  public canPlaySfx(): boolean {
    return this.enabled && !this.sfxMuted && this.sfxVolume > 0.01 && this.masterVolume > 0.01;
  }

  // ─────────────────────────────────────────────
  // Métodos de Controle de Volume & Mute
  // ─────────────────────────────────────────────
  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    this.applyGains();
    this.saveSettings();

    // Se ligou o som e o ambiente deve tocar, inicia o loop
    if (this.enabled && !this.ambientMuted && this.ambientVolume > 0.05 && !this.isAmbientRunning) {
      this.startAmbient();
    }

    this.notify();
    return this.enabled;
  }

  public setMasterVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, val));
    this.masterVolume = clamped;
    if (clamped > 0 && !this.enabled) {
      this.enabled = true;
    }
    this.applyGains();
    this.saveSettings();

    if (this.enabled && !this.ambientMuted && this.ambientVolume > 0.05 && !this.isAmbientRunning) {
      this.startAmbient();
    }

    this.notify();
  }

  public setSfxVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, val));
    this.sfxVolume = clamped;
    if (clamped > 0 && this.sfxMuted) {
      this.sfxMuted = false;
    }
    this.applyGains();
    this.saveSettings();
    this.notify();
  }

  public setAmbientVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, val));
    this.ambientVolume = clamped;
    if (clamped > 0 && this.ambientMuted) {
      this.ambientMuted = false;
    }
    this.applyGains();
    this.saveSettings();

    if (clamped > 0.05 && this.enabled && !this.ambientMuted && !this.isAmbientRunning) {
      this.startAmbient();
    } else if (clamped <= 0.01 && this.isAmbientRunning) {
      // Deixa o ganho em 0
    }

    this.notify();
  }

  public toggleSfxMute(): boolean {
    this.sfxMuted = !this.sfxMuted;
    this.applyGains();
    this.saveSettings();
    this.notify();
    return !this.sfxMuted;
  }

  public toggleAmbientMute(): boolean {
    this.ambientMuted = !this.ambientMuted;
    this.applyGains();
    this.saveSettings();

    if (!this.ambientMuted && this.enabled && this.ambientVolume > 0.05 && !this.isAmbientRunning) {
      this.startAmbient();
    }

    this.notify();
    return !this.ambientMuted;
  }

  public setPreset(preset: 'default' | 'night' | 'nature' | 'silent'): void {
    switch (preset) {
      case 'default':
        this.enabled = true;
        this.masterVolume = 1.0;
        this.sfxVolume = 0.8;
        this.ambientVolume = 0.6;
        this.sfxMuted = false;
        this.ambientMuted = false;
        break;
      case 'night':
        this.enabled = true;
        this.masterVolume = 0.45;
        this.sfxVolume = 0.35;
        this.ambientVolume = 0.3;
        this.sfxMuted = false;
        this.ambientMuted = false;
        break;
      case 'nature':
        this.enabled = true;
        this.masterVolume = 0.85;
        this.sfxVolume = 0.15;
        this.ambientVolume = 0.9;
        this.sfxMuted = false;
        this.ambientMuted = false;
        break;
      case 'silent':
        this.enabled = false;
        break;
    }

    this.applyGains();
    this.saveSettings();

    if (this.enabled && !this.ambientMuted && this.ambientVolume > 0.05 && !this.isAmbientRunning) {
      this.startAmbient();
    }

    this.notify();
  }

  public testSfx(): void {
    this.playWaterClick(true);
  }

  public testAmbient(): void {
    if (!this.enabled) {
      this.toggleSound();
    }
    if (this.ambientMuted) {
      this.toggleAmbientMute();
    }
    if (this.ambientVolume < 0.2) {
      this.setAmbientVolume(0.6);
    }
    this.startAmbient();
    this.playWaterClick(false);
  }

  public getState(): AudioState {
    return {
      enabled: this.enabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      ambientVolume: this.ambientVolume,
      sfxMuted: this.sfxMuted,
      ambientMuted: this.ambientMuted,
      ambientActive: this.isAmbientRunning,
      currentWeather: this.currentWeather,
      currentLocation: this.currentLocation,
    };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Som Ambiente Procedural Contínuo (Natureza & Clima)
  // ─────────────────────────────────────────────
  public setWeather(weatherId: string): void {
    this.currentWeather = weatherId;
    this.updateAmbientLayers();
    this.notify();
  }

  public setLocation(locationId: string): void {
    this.currentLocation = locationId;
    this.updateAmbientLayers();
    this.notify();
  }

  public startAmbient(): void {
    if (this.isAmbientRunning) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // 1. Buffer de Ruído Suave (4 segundos em loop contínuo)
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);

      // Gera ruído rosa/marrom suave (pink noise filter)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.ambientNoiseSource = ctx.createBufferSource();
      this.ambientNoiseSource.buffer = noiseBuffer;
      this.ambientNoiseSource.loop = true;

      // 2. Filtro Passa-Baixas com Ondulação Suave (simula água do lago)
      this.ambientFilter = ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(450, ctx.currentTime);
      this.ambientFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      // 3. LFO (Oscilador de Baixa Frequência) para ritmar as ondas d'água a cada 4.5s
      this.ambientLfo = ctx.createOscillator();
      this.ambientLfo.frequency.setValueAtTime(0.22, ctx.currentTime); // ~4.5s período
      this.ambientLfoGain = ctx.createGain();
      this.ambientLfoGain.gain.setValueAtTime(180, ctx.currentTime); // Modula freq ±180Hz

      this.ambientLfo.connect(this.ambientLfoGain);
      this.ambientLfoGain.connect(this.ambientFilter.frequency);

      const waterGain = ctx.createGain();
      waterGain.gain.setValueAtTime(0.18, ctx.currentTime);

      this.ambientNoiseSource.connect(this.ambientFilter);
      this.ambientFilter.connect(waterGain);
      waterGain.connect(this.getAmbientDestination(ctx));

      this.ambientNoiseSource.start(0);
      this.ambientLfo.start(0);

      // 4. Camada de Chuva (Ativada quando rainy ou storm)
      const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        rainData[i] = (Math.random() * 2 - 1) * 0.035;
      }

      this.rainNoiseSource = ctx.createBufferSource();
      this.rainNoiseSource.buffer = rainBuffer;
      this.rainNoiseSource.loop = true;

      this.rainFilter = ctx.createBiquadFilter();
      this.rainFilter.type = 'bandpass';
      this.rainFilter.frequency.setValueAtTime(2400, ctx.currentTime);
      this.rainFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, ctx.currentTime); // Inicia silenciado

      this.rainNoiseSource.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.getAmbientDestination(ctx));

      this.rainNoiseSource.start(0);

      // 5. Camada Mística Eetérea (Para mystic_moon)
      this.mysticOsc1 = ctx.createOscillator();
      this.mysticOsc2 = ctx.createOscillator();
      this.mysticGain = ctx.createGain();

      this.mysticOsc1.type = 'sine';
      this.mysticOsc2.type = 'sine';
      this.mysticOsc1.frequency.setValueAtTime(216, ctx.currentTime); // Harmônico suave
      this.mysticOsc2.frequency.setValueAtTime(432, ctx.currentTime); // Oitava mágica

      this.mysticGain.gain.setValueAtTime(0, ctx.currentTime); // Inicia silenciado

      this.mysticOsc1.connect(this.mysticGain);
      this.mysticOsc2.connect(this.mysticGain);
      this.mysticGain.connect(this.getAmbientDestination(ctx));

      this.mysticOsc1.start(0);
      this.mysticOsc2.start(0);

      this.isAmbientRunning = true;
      this.updateAmbientLayers();
      this.notify();
    } catch (e) {
      console.warn('Não foi possível iniciar o som ambiente procedural:', e);
    }
  }

  private updateAmbientLayers(): void {
    if (!this.isAmbientRunning || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Ajusta camada de chuva
    if (this.rainGain) {
      const isRainy = this.currentWeather === 'rainy';
      const isStorm = this.currentWeather === 'storm';
      const rainTarget = isStorm ? 0.22 : isRainy ? 0.12 : 0;

      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, now + 1.2);
    }

    // Ajusta camada mística
    if (this.mysticGain) {
      const isMystic = this.currentWeather === 'mystic_moon';
      const mysticTarget = isMystic ? 0.035 : 0;

      this.mysticGain.gain.cancelScheduledValues(now);
      this.mysticGain.gain.setValueAtTime(this.mysticGain.gain.value, now);
      this.mysticGain.gain.linearRampToValueAtTime(mysticTarget, now + 1.5);
    }

    // Ajusta filtro d'água conforme o bioma
    if (this.ambientFilter) {
      let baseFreq = 450;
      if (this.currentLocation === 'deep_sea') baseFreq = 320; // Mar profundo
      if (this.currentLocation === 'river') baseFreq = 580; // Correnteza
      if (this.currentLocation === 'swamp') baseFreq = 380; // Pântano quieto

      this.ambientFilter.frequency.cancelScheduledValues(now);
      this.ambientFilter.frequency.setValueAtTime(this.ambientFilter.frequency.value, now);
      this.ambientFilter.frequency.linearRampToValueAtTime(baseFreq, now + 2.0);
    }
  }

  public stopAmbient(): void {
    if (!this.isAmbientRunning) return;
    try {
      this.ambientNoiseSource?.stop();
      this.ambientNoiseSource?.disconnect();
      this.ambientLfo?.stop();
      this.ambientLfo?.disconnect();
      this.rainNoiseSource?.stop();
      this.rainNoiseSource?.disconnect();
      this.mysticOsc1?.stop();
      this.mysticOsc1?.disconnect();
      this.mysticOsc2?.stop();
      this.mysticOsc2?.disconnect();
    } catch (_) {}

    this.ambientNoiseSource = null;
    this.ambientFilter = null;
    this.ambientLfo = null;
    this.ambientLfoGain = null;
    this.rainNoiseSource = null;
    this.rainFilter = null;
    this.rainGain = null;
    this.mysticOsc1 = null;
    this.mysticOsc2 = null;
    this.mysticGain = null;
    this.isAmbientRunning = false;
    this.notify();
  }

  // ─────────────────────────────────────────────
  // Efeitos Sonoros (SFX) Procedurais
  // ─────────────────────────────────────────────

  // 1. Som de Lançamento (Whoosh)
  playCast(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.3);

    // Adiciona pequeno estalo do carretel
    setTimeout(() => this.playClick(240), 120);
    setTimeout(() => this.playClick(320), 190);
  }

  // 2. Som de "Plop" na água
  playSplash(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 3. Alerta de Fisgada (Bite alert - Sino / Ding!)
  playBite(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [880, 1174, 1760];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // 4. Som de recolher carretel com modulação dinâmica de peso e tensão
  playReel(weight = 2): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const clampedWeight = Math.max(0.5, Math.min(50, weight));
    const baseFreq = Math.max(160, 480 - clampedWeight * 6.5);
    const clickCount = Math.min(8, 3 + Math.floor(clampedWeight / 6));

    for (let i = 0; i < clickCount; i++) {
      const delay = i * (0.04 + clampedWeight * 0.001);
      setTimeout(() => {
        this.playClick(baseFreq + (i % 2 === 0 ? 40 : -20), 0.045);
      }, delay * 1000);
    }

    if (clampedWeight > 5) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80 + clampedWeight * 2, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  // 4b. Som de Acerto Perfeito (Quick-Time / Sweet spot)
  playPerfectBite(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const time = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(time);
      osc.stop(time + 0.3);
    });
  }

  // 4c. Som de Impacto / Hit Stop (Sub-grave)
  playHitImpact(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 5. Sucesso ao pegar peixe (Fanfarra conforme raridade)
  playCatch(rarity: string, weight = 1): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (['epic', 'legendary'].includes(rarity)) {
      this.playHitImpact();
    }

    const now = ctx.currentTime;
    let chord = [523.25, 659.25, 783.99, 1046.5]; // Dó Maior (Comum)

    if (rarity === 'uncommon') {
      chord = [587.33, 739.99, 880.0, 1174.66]; // Ré Maior
    } else if (rarity === 'rare') {
      chord = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // Mi Maior brilhante
    } else if (rarity === 'epic') {
      chord = [698.46, 880.0, 1046.5, 1396.91, 1760.0]; // Fá Maior heroico
    } else if (rarity === 'legendary') {
      chord = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51, 1760.0]; // Fanfarra Lendária
    }

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = rarity === 'legendary' ? 'sawtooth' : 'triangle';
      const delay = idx * (rarity === 'legendary' ? 0.08 : 0.05);

      osc.frequency.setValueAtTime(freq, now + delay);

      const dur = rarity === 'legendary' ? 0.8 : 0.45;
      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });
  }

  // 6. Som de moedas (Jingle de venda ou tesouro)
  playCoins(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const coins = [987.77, 1318.51, 1567.98, 2093.0];

    coins.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const time = now + i * 0.07;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(time);
      osc.stop(time + 0.15);
    });
  }

  // 7. Som de Level Up (Arpeggio ascendente glorioso)
  playLevelUp(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const time = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(time);
      osc.stop(time + 0.4);
    });
  }

  // 8. Som de erro ou perda
  playThud(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playClick(freq = 400, duration = 0.03): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + duration);
  }

  // Som especial de clique na água
  playWaterClick(isCrit = false): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCrit ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isCrit ? 640 : 420, now);
    osc.frequency.exponentialRampToValueAtTime(isCrit ? 980 : 310, now + 0.08);

    gain.gain.setValueAtTime(isCrit ? 0.25 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Fanfarra celestial para o Peixe Dourado (Golden Fish)
  playGoldenFish(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.22, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.35);
    });
  }

  // Som místico de Ascensão Cósmica / Renascimento
  playAscension(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.28, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.6);
    });
  }

  // Fanfarra dourada de Conquista / Marco desbloqueado
  playAchievement(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }

  // 9. Som mecânico de estalo contínuo do carretel (Reeling tick)
  playReelTick(pitchOffset = 0): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + pitchOffset, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // 10. Zumbido agudo de tensão crítica na linha (Strain alert)
  playTensionStrain(intensity = 0.5): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + intensity * 400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.05 * Math.min(1, intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 11. Estalo de ruptura da linha (Snap / Quebra da linha)
  playLineSnap(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));
    osc.start(now);
    osc.stop(now + 0.15);

    const whip = ctx.createOscillator();
    const whipGain = ctx.createGain();
    whip.type = 'triangle';
    whip.frequency.setValueAtTime(2200, now + 0.02);
    whip.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    whipGain.gain.setValueAtTime(0.25, now + 0.02);
    whipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    whip.connect(whipGain);
    whipGain.connect(this.getSfxDestination(ctx));
    whip.start(now + 0.02);
    whip.stop(now + 0.2);
  }

  // 12. Som de peixe debatendo na água (Splash violento)
  playFishSplash(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 13. Ding de contragolpe perfeito (Harmonia brilhante)
  playPerfectCounter(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now);
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.getSfxDestination(ctx));

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // 14. Trovão distante suave para clima de tempestade (Procedural Rumble)
  playThunder(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(45, now + 1.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      whiteNoise.start(now);
      whiteNoise.stop(now + 1.5);
    } catch (_) {}
  }

  // 15. Som profundo de deslocamento de água e ondulação do Titã
  playTitanAwakening(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(38, now);
      osc.frequency.linearRampToValueAtTime(62, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(32, now + 2.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.getSfxDestination(ctx));

      osc.start(now);
      osc.stop(now + 3.0);
    } catch (_) {}
  }

  // 16. Som solene de conquista ancestral do Titã
  playTitanConquered(): void {
    if (!this.canPlaySfx()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [146.83, 220.0, 293.66, 440.0, 587.33];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0.01, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.18 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 2.2);

        osc.connect(gain);
        gain.connect(this.getSfxDestination(ctx));

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 2.2);
      });
    } catch (_) {}
  }
}

export const sound = new SoundEngine();
