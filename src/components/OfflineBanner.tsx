// src/components/OfflineBanner.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
    } else if (hasBeenOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 text-center"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Modo Offline • Seu progresso é salvo localmente no dispositivo normalmente.
          </span>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300 text-center"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Conexão restabelecida! Sincronização pronta.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
