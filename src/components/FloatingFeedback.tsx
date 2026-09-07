// src/components/FloatingFeedback.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, Star, Zap } from 'lucide-react';

export interface FloatingItem {
  id: string;
  text: string;
  type: 'xp' | 'coins' | 'perfect' | 'legendary' | 'weight';
  x?: number; // porcentagem ou pixels
  y?: number;
}

interface FloatingFeedbackProps {
  items: FloatingItem[];
  onDismiss: (id: string) => void;
}

export const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({ items, onDismiss }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {items.map((item) => {
          const isCoins = item.type === 'coins';
          const isXp = item.type === 'xp';
          const isPerfect = item.type === 'perfect';
          const isLegendary = item.type === 'legendary';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.25, 1.1, 0.9],
                y: -75,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut', times: [0, 0.2, 0.8, 1] }}
              onAnimationComplete={() => onDismiss(item.id)}
              className="absolute left-1/2 bottom-28 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md border text-xs sm:text-sm font-black select-none"
              style={{
                backgroundColor: isPerfect
                  ? 'rgba(16, 185, 129, 0.95)'
                  : isLegendary
                  ? 'rgba(245, 158, 11, 0.95)'
                  : isCoins
                  ? 'rgba(234, 179, 8, 0.92)'
                  : 'rgba(14, 165, 233, 0.92)',
                color: isCoins ? '#0f172a' : '#ffffff',
                borderColor: isPerfect
                  ? '#34d399'
                  : isLegendary
                  ? '#fbbf24'
                  : isCoins
                  ? '#fef08a'
                  : '#7dd3fc',
                boxShadow: isLegendary
                  ? '0 0 25px rgba(245, 158, 11, 0.8)'
                  : isPerfect
                  ? '0 0 20px rgba(16, 185, 129, 0.7)'
                  : '0 0 15px rgba(0,0,0,0.5)',
              }}
            >
              {isCoins && <Coins className="w-4 h-4 text-slate-950 fill-amber-300" />}
              {isXp && <Sparkles className="w-4 h-4 text-sky-200 animate-spin" />}
              {isPerfect && <Star className="w-4 h-4 text-yellow-200 fill-yellow-300" />}
              {isLegendary && <Zap className="w-4 h-4 text-amber-200 fill-amber-300 animate-bounce" />}

              <span className="tracking-wide">{item.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
