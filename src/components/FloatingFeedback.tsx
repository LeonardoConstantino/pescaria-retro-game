// src/components/FloatingFeedback.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, Star, Zap } from 'lucide-react';

export interface FloatingItem {
  id: string;
  text: string;
  type: 'xp' | 'coins' | 'perfect' | 'legendary' | 'weight' | 'level';
  x?: number; // porcentagem ou pixels
  y?: number;
}

interface FloatingFeedbackProps {
  items: FloatingItem[];
  onDismiss: (id: string) => void;
}

export const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({ items, onDismiss }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {items.map((item, index) => {
          const isCoins = item.type === 'coins';
          const isXp = item.type === 'xp';
          const isPerfect = item.type === 'perfect';
          const isLegendary = item.type === 'legendary';

          // Leve dispersão vertical para quando múltiplos feedbacks aparecem simultaneamente
          const staggerOffset = index * 26;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.25, 1.1, 0.9],
                y: -90 - staggerOffset,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut', times: [0, 0.15, 0.75, 1] }}
              onAnimationComplete={() => onDismiss(item.id)}
              className="absolute left-1/2 top-1/3 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md border-2 text-sm sm:text-base font-black select-none pointer-events-none"
              style={{
                backgroundColor: isPerfect
                  ? 'rgba(16, 185, 129, 0.98)'
                  : isLegendary
                  ? 'rgba(245, 158, 11, 0.98)'
                  : isCoins
                  ? 'rgba(250, 204, 21, 0.98)'
                  : 'rgba(14, 165, 233, 0.98)',
                color: isCoins ? '#0f172a' : '#ffffff',
                borderColor: isPerfect
                  ? '#a7f3d0'
                  : isLegendary
                  ? '#fde68a'
                  : isCoins
                  ? '#ffffff'
                  : '#bae6fd',
                boxShadow: isLegendary
                  ? '0 0 35px rgba(245, 158, 11, 0.9)'
                  : isPerfect
                  ? '0 0 28px rgba(16, 185, 129, 0.8)'
                  : isCoins
                  ? '0 0 24px rgba(250, 204, 21, 0.75)'
                  : '0 0 20px rgba(14, 165, 233, 0.7)',
              }}
            >
              {isCoins && <Coins className="w-5 h-5 text-slate-950 fill-amber-400" />}
              {isXp && <Sparkles className="w-5 h-5 text-sky-100 animate-spin" />}
              {isPerfect && <Star className="w-5 h-5 text-yellow-100 fill-yellow-200" />}
              {isLegendary && <Zap className="w-5 h-5 text-amber-100 fill-amber-200 animate-bounce" />}

              <span className="tracking-wide drop-shadow-md">{item.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

