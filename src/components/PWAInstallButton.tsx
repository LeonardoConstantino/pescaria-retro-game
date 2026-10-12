// src/components/PWAInstallButton.tsx
import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { PWAInstallModal } from './PWAInstallModal.js';
import { sound } from '../utils/audio.js';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'dock' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    sound.playCoins();
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // Se já estiver em modo standalone (PWA instalado), não precisa poluir o header
  if (isInstalled && variant === 'header') {
    return null;
  }

  if (variant === 'dock') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`col-span-2 p-3 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/40 flex items-center gap-2.5 text-left active:scale-95 transition-transform ${className}`}
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
            {isInstalled ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-sky-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-sky-200 flex items-center gap-1.5">
              {isInstalled ? 'App Instalado (PWA)' : 'Instalar na Tela de Início'}
              <span className="text-[9px] font-black uppercase bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded border border-sky-500/30">
                PWA
              </span>
            </div>
            <div className="text-[10px] text-sky-400/80 font-medium">
              {isInstalled
                ? 'Você está usando a versão PWA em tela cheia'
                : 'Jogue em tela cheia com carregamento instantâneo'}
            </div>
          </div>
        </button>

        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
          onInstall={install}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/40 hover:to-indigo-600/40 border border-sky-500/40 text-sky-200 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${className}`}
        title="Instalar Jogo de Pesca como Aplicativo (PWA)"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden lg:inline">Instalar</span>
        <span className="text-[9px] uppercase tracking-wider bg-sky-500/30 text-sky-300 px-1 py-0.2 rounded">
          PWA
        </span>
      </button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
      />
    </>
  );
};
