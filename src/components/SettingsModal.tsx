// src/components/SettingsModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Configurações do Jogo:
// - Controle de Volume completo (Master, Efeitos SFX e Som Ambiente)
// - Sliders intuitivos de 0% a 100% com teste sonoro imediato
// - Predefinições rápidas (Padrão, Noturno, Foco/Natureza, Silencioso)
// - Alternância de Vibração Tátil (Mobile Haptic Feedback)
// - Acesso rápido a Backup / Exportação de Save e Novo Jogo
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  Volume1,
  VolumeX,
  Zap,
  Waves,
  Vibrate,
  FileJson,
  RotateCcw,
  Sliders,
  Check,
  Play,
  CloudRain,
  Moon,
  Headphones,
  Camera,
} from 'lucide-react';
import { sound, AudioState } from '../utils/audio.js';
import { vibrate } from '../utils/vibrate.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBackup?: () => void;
  onOpenSharePassport?: () => void;
  onResetProgress?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenBackup,
  onOpenSharePassport,
  onResetProgress,
}) => {
  const [audioState, setAudioState] = useState<AudioState>(sound.getState());
  const [vibrationOn, setVibrationOn] = useState<boolean>(vibrate.enabled);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [justTestedSfx, setJustTestedSfx] = useState(false);
  const [justTestedAmbient, setJustTestedAmbient] = useState(false);

  useEffect(() => {
    // Sincroniza em tempo real com o motor de áudio
    const unsubscribe = sound.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sound.setMasterVolume(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sound.setSfxVolume(val);
  };

  const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sound.setAmbientVolume(val);
  };

  const handleToggleVibration = () => {
    const active = vibrate.toggle();
    setVibrationOn(active);
    if (active) {
      vibrate.bite();
    }
  };

  const testSfx = () => {
    sound.testSfx();
    vibrate.perfectHit();
    setJustTestedSfx(true);
    setTimeout(() => setJustTestedSfx(false), 600);
  };

  const testAmbient = () => {
    sound.testAmbient();
    setJustTestedAmbient(true);
    setTimeout(() => setJustTestedAmbient(false), 900);
  };

  const masterPercent = Math.round(audioState.masterVolume * 100);
  const sfxPercent = Math.round(audioState.sfxVolume * 100);
  const ambientPercent = Math.round(audioState.ambientVolume * 100);

  return (
    <AnimatePresence>
      <div
        id="settings-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="settings-modal-dialog"
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── CABEÇALHO DO MODAL ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Configurações de Áudio
                </h2>
                <p className="text-xs text-slate-400">
                  Calibre os volumes de efeitos, sons do ambiente e preferências
                </p>
              </div>
            </div>

            <button
              id="settings-modal-close"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Fechar configurações"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── CONTEÚDO SCROLLÁVEL ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* 1. SEÇÃO DE PREDEFINIÇÕES RÁPIDAS (PRESETS) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Predefinições Rápidas
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => sound.setPreset('default')}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    audioState.enabled &&
                    masterPercent >= 90 &&
                    sfxPercent >= 70 &&
                    ambientPercent >= 50
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Headphones className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] font-mono opacity-80">100%</span>
                  </div>
                  <div className="text-xs font-bold leading-tight">Padrão</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Equilibrado</div>
                </button>

                <button
                  type="button"
                  onClick={() => sound.setPreset('night')}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    audioState.enabled && masterPercent < 60 && masterPercent > 0
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-mono opacity-80">45%</span>
                  </div>
                  <div className="text-xs font-bold leading-tight">Noturno</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Suave & Baixo</div>
                </button>

                <button
                  type="button"
                  onClick={() => sound.setPreset('nature')}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    audioState.enabled && sfxPercent <= 20 && ambientPercent >= 70
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Waves className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-mono opacity-80">Natureza</span>
                  </div>
                  <div className="text-xs font-bold leading-tight">Só Ambiente</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Foco no lago</div>
                </button>

                <button
                  type="button"
                  onClick={() => sound.setPreset('silent')}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    !audioState.enabled
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px] font-mono opacity-80">0%</span>
                  </div>
                  <div className="text-xs font-bold leading-tight">Mudo</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Silêncio total</div>
                </button>
              </div>
            </div>

            {/* 2. SEÇÃO DE SLIDERS DE VOLUME INDIVIDUAIS */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Canais de Áudio
              </div>

              {/* SLIDER 1: VOLUME GERAL (MASTER) */}
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sound.toggleSound()}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        !audioState.enabled
                          ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                          : 'bg-slate-700/60 border-slate-600 text-sky-400'
                      }`}
                      title={audioState.enabled ? 'Silenciar Áudio Geral' : 'Ativar Áudio Geral'}
                    >
                      {!audioState.enabled ? (
                        <VolumeX className="w-4 h-4" />
                      ) : masterPercent > 50 ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <Volume1 className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <span className="text-sm font-bold text-slate-100">Volume Geral (Master)</span>
                      <p className="text-[11px] text-slate-400">Controle mestre de todo o som do jogo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-sky-300">
                      {!audioState.enabled ? 'MUDO' : `${masterPercent}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-500">0%</span>
                  <input
                    id="slider-volume-master"
                    type="range"
                    min="0"
                    max="100"
                    value={audioState.enabled ? masterPercent : 0}
                    onChange={handleMasterChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <span className="text-[11px] font-mono text-slate-500">100%</span>
                </div>
              </div>

              {/* SLIDER 2: EFEITOS SONOROS (SFX) */}
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sound.toggleSfxMute()}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        audioState.sfxMuted
                          ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                          : 'bg-slate-700/60 border-slate-600 text-amber-400'
                      }`}
                      title={audioState.sfxMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos'}
                    >
                      {audioState.sfxMuted ? <VolumeX className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="text-sm font-bold text-slate-100">Efeitos Sonoros (SFX)</span>
                      <p className="text-[11px] text-slate-400">
                        Lançamento, carretilha, mordida, fanfarras e cliques
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={testSfx}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all active:scale-95 ${
                        justTestedSfx
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold scale-105'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                      }`}
                      title="Testar volume do efeito"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Testar</span>
                    </button>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-300">
                      {audioState.sfxMuted ? 'MUDO' : `${sfxPercent}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-500">0%</span>
                  <input
                    id="slider-volume-sfx"
                    type="range"
                    min="0"
                    max="100"
                    value={audioState.sfxMuted ? 0 : sfxPercent}
                    onChange={handleSfxChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[11px] font-mono text-slate-500">100%</span>
                </div>
              </div>

              {/* SLIDER 3: SOM AMBIENTE (NATUREZA & CLIMA) */}
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sound.toggleAmbientMute()}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        audioState.ambientMuted
                          ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                          : 'bg-slate-700/60 border-slate-600 text-cyan-400'
                      }`}
                      title={audioState.ambientMuted ? 'Ativar Som Ambiente' : 'Silenciar Ambiente'}
                    >
                      {audioState.ambientMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Waves className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <span className="text-sm font-bold text-slate-100">
                        Som Ambiente (Natureza & Clima)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Ondulação suave do lago, brisa e chuva procedural viva
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={testAmbient}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all active:scale-95 ${
                        justTestedAmbient
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold scale-105'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                      }`}
                      title="Ouvir som ambiente agora"
                    >
                      <Waves className="w-3 h-3" />
                      <span>Ouvir</span>
                    </button>

                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-300">
                      {audioState.ambientMuted ? 'MUDO' : `${ambientPercent}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-500">0%</span>
                  <input
                    id="slider-volume-ambient"
                    type="range"
                    min="0"
                    max="100"
                    value={audioState.ambientMuted ? 0 : ambientPercent}
                    onChange={handleAmbientChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-[11px] font-mono text-slate-500">100%</span>
                </div>
              </div>
            </div>

            {/* 3. PREFERÊNCIAS DE IMERSÃO E DISPOSITIVO */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Imersão & Dispositivo
              </div>

              {/* Feedback Tátil / Vibração */}
              <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Vibrate className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-100">Vibração Tátil (Mobile)</span>
                    <p className="text-[11px] text-slate-400">
                      Pulso de resposta na mordida, carretilha e capturas
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVibration}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    vibrationOn
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {vibrationOn ? 'Ativada' : 'Desativada'}
                </button>
              </div>

              {/* Passaporte do Pescador & Compartilhar Card */}
              {onOpenSharePassport && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-800/70 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        Passaporte do Pescador
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950">
                          HD
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Gere seu card oficial com troféus para compartilhar
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSharePassport();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-cyan-950/40 cursor-pointer"
                  >
                    Gerar Card
                  </button>
                </div>
              )}

              {/* Backup & Save JSON */}
              {onOpenBackup && (
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-100">Backup & Restauração</span>
                      <p className="text-[11px] text-slate-400">
                        Exporte ou importe seu progresso para salvar seus dados
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBackup();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-sky-950/40"
                  >
                    Gerenciar
                  </button>
                </div>
              )}
            </div>

            {/* 4. NOVO JOGO / REINICIAR PROGRESSO */}
            {onResetProgress && (
              <div className="pt-2 border-t border-slate-800">
                {!showResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-slate-800/50 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Progresso (Novo Jogo)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2 text-center">
                    <p className="text-xs text-rose-200 font-medium">
                      Tem certeza? Todo o progresso, peixes e moedas serão reiniciados do zero.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetConfirm(false);
                          onClose();
                          onResetProgress();
                        }}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Sim, Reiniciar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RODAPÉ ── */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px]">As preferências são salvas automaticamente</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Concluído
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
