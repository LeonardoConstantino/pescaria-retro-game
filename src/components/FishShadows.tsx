// src/components/FishShadows.tsx
import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FishShadowsProps {
  locationId: string;
  isBiting: boolean;
}

interface ShadowSpec {
  id: number;
  direction: 'ltr' | 'rtl';
  topPercent: number;
  speed: number;
  scale: number;
  delay: number;
}

export const FishShadows: React.FC<FishShadowsProps> = ({ locationId, isBiting }) => {
  // Configuração estática de sombras para evitar recriação
  const shadows: ShadowSpec[] = useMemo(
    () => [
      { id: 1, direction: 'ltr', topPercent: 22, speed: 16, scale: 0.85, delay: 0 },
      { id: 2, direction: 'rtl', topPercent: 55, speed: 20, scale: 1.15, delay: 4 },
      { id: 3, direction: 'ltr', topPercent: 40, speed: 13, scale: 0.7, delay: 8 },
      { id: 4, direction: 'rtl', topPercent: 72, speed: 24, scale: 1.5, delay: 1.5 }, // Peixe grande
      { id: 5, direction: 'ltr', topPercent: 80, speed: 18, scale: 0.9, delay: 11 },
    ],
    []
  );

  // Cor das sombras conforme o local
  const getShadowColor = () => {
    switch (locationId) {
      case 'lake':
        return 'rgba(6, 78, 59, 0.55)'; // verde-azulado profundo
      case 'river':
        return 'rgba(4, 47, 46, 0.6)';
      case 'swamp':
        return 'rgba(28, 25, 23, 0.75)'; // lodo escuro
      case 'sea':
        return 'rgba(15, 23, 42, 0.65)'; // azul marinho escuro
      case 'deep_sea':
        return 'rgba(76, 29, 149, 0.6)'; // roxo abissal bioluminescente
      default:
        return 'rgba(15, 23, 42, 0.6)';
    }
  };

  const shadowFill = getShadowColor();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sombras normais navegando continuamente pelas águas */}
      {shadows.map((s) => {
        const isLtr = s.direction === 'ltr';
        return (
          <motion.div
            key={s.id}
            initial={{
              left: isLtr ? '-15%' : '115%',
              opacity: 0,
            }}
            animate={{
              left: isLtr ? ['-15%', '115%'] : ['115%', '-15%'],
              y: [0, s.id % 2 === 0 ? 12 : -12, 0],
              opacity: [0, 0.75, 0.8, 0],
            }}
            transition={{
              left: {
                repeat: Infinity,
                duration: s.speed,
                ease: 'linear',
                delay: s.delay,
              },
              y: {
                repeat: Infinity,
                duration: s.speed / 3,
                ease: 'easeInOut',
              },
              opacity: {
                repeat: Infinity,
                duration: s.speed,
                delay: s.delay,
              },
            }}
            className="absolute -translate-y-1/2"
            style={{
              top: `${s.topPercent}%`,
            }}
          >
            <div
              style={{
                transform: `scale(${s.scale}) ${isLtr ? 'scaleX(1)' : 'scaleX(-1)'}`,
              }}
            >
              {/* SVG da silhueta realista de peixe com ondulação contínua de cauda */}
              <motion.svg
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                width="72"
                height="32"
                viewBox="0 0 64 28"
                fill={shadowFill}
                className="blur-[1.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              >
                {/* Corpo e barbatanas estendidas */}
                <path d="M52 14 C46 7 30 4 16 10 C10 12 4 8 1 5 C2 10 3 13 1 18 C4 16 10 14 16 16 C30 22 46 21 52 14 Z" />
                <path d="M30 6 C28 1 24 0 20 2 C23 5 26 6 30 6 Z" />
                <path d="M32 20 C30 25 26 27 22 25 C25 22 28 21 32 20 Z" />
              </motion.svg>
            </div>
          </motion.div>
        );
      })}

      {/* Sombra de Fisgada Imediata (Quando a boia afunda, uma sombra nada veloz em direção à boia central) */}
      {isBiting && (
        <motion.div
          initial={{ left: '15%', top: '75%', opacity: 0, scale: 0.5 }}
          animate={{
            left: '50%',
            top: '50%',
            opacity: [0, 0.9, 0],
            scale: [0.6, 1.4, 1.9],
          }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            width="88"
            height="38"
            viewBox="0 0 64 28"
            fill={shadowFill}
            className="blur-[2px] drop-shadow-lg"
          >
            <path d="M52 14 C46 7 30 4 16 10 C10 12 4 8 1 5 C2 10 3 13 1 18 C4 16 10 14 16 16 C30 22 46 21 52 14 Z" />
            <path d="M30 6 C28 1 24 0 20 2 C23 5 26 6 30 6 Z" />
            <path d="M32 20 C30 25 26 27 22 25 C25 22 28 21 32 20 Z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};

