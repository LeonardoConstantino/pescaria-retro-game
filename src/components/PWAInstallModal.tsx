// src/components/PWAInstallModal.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  WifiOff,
  Maximize2,
} from 'lucide-react';
import { sound } from '../utils/audio.js';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}) => {
  // Previne rolagem de fundo quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    sound.playCoins();
    const success = await onInstall();
    if (success) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div
        id="pwa-install-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="pwa-install-modal-container"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md shadow-sky-950/50 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src="./icon.svg"
                    alt="Pesca Retro"
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  Instalar Jogo de Pesca
                  <span className="text-[10px] uppercase font-black tracking-wider bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                    PWA
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Jogue como um aplicativo nativo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corpo do Modal (com rolagem segura se a tela for pequena) */}
          <div className="p-5 space-y-4 text-sm text-slate-300 overflow-y-auto flex-1">
            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <Maximize2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-slate-200">Tela Cheia</strong>
                  <span className="text-[11px] text-slate-400">Sem barra de navegação</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-slate-200">Super Rápido</strong>
                  <span className="text-[11px] text-slate-400">Carregamento instantâneo</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-slate-200">Cache Offline</strong>
                  <span className="text-[11px] text-slate-400">Funciona sem internet</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs text-slate-200">Ícone no Celular</strong>
                  <span className="text-[11px] text-slate-400">Acesso em 1 toque</span>
                </div>
              </div>
            </div>

            {/* Estado: Já instalado */}
            {isInstalled ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong>Aplicativo já instalado!</strong>
                  <p className="text-emerald-400/80 text-[11px] mt-0.5">
                    Você já está aproveitando a experiência PWA nativa.
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              /* Fluxo Direto: Android / Chrome / Edge */
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-400 text-center">
                  Clique no botão abaixo para adicionar o jogo diretamente à sua tela inicial ou área de trabalho:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Instalar Agora na Tela Inicial
                </button>
              </div>
            ) : isIOS ? (
              /* Fluxo iOS Safari */
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 space-y-2.5">
                <h4 className="font-bold text-xs text-sky-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  Como instalar no iPhone ou iPad:
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      1
                    </span>
                    <span>
                      Toque no botão <strong className="text-sky-300">Compartilhar</strong>{' '}
                      <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" /> na barra do Safari.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      2
                    </span>
                    <span>
                      Role a lista e selecione <strong className="text-sky-300">Adicionar à Tela de Início</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" />.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600/30 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      3
                    </span>
                    <span>
                      Toque em <strong className="text-emerald-400">Adicionar</strong> no canto superior direito.
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Dica Geral para navegadores Desktop/Mobile */
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>
                  Para instalar, clique no ícone de instalação <Download className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" /> na barra de endereços do seu navegador ou no menu do navegador (três pontinhos) e escolha <strong className="text-slate-200">"Instalar aplicativo"</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-right shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Renderiza via Portal no document.body para evitar distorção de contexto do Header ou da Dock
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
