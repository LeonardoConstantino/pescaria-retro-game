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
  startY: number;
  speed: number;
  scale: number;
  delay: number;
}

export const FishShadows: React.FC<FishShadowsProps> = ({ locationId, isBiting }) => {
  // Configuração estática de sombras para evitar recriação
  const shadows: ShadowSpec[] = useMemo(() => [
    { id: 1, direction: 'ltr', startY: 25, speed: 18, scale: 0.8, delay: 0 },
    { id: 2, direction: 'rtl', startY: 65, speed: 24, scale: 1.2, delay: 5 },
    { id: 3, direction: 'ltr', startY: 45, speed: 14, scale: 0.6, delay: 10 },
    { id: 4, direction: 'rtl', startY: 78, speed: 28, scale: 1.6, delay: 2 }, // Peixe grande
  ], []);

  // Cor das sombras conforme o local
  const getShadowColor = () => {
    switch (locationId) {
      case 'lake':
        return 'rgba(6, 78, 59, 0.45)'; // verde-azulado profundo
      case 'river':
        return 'rgba(4, 47, 46, 0.5)';
      case 'swamp':
        return 'rgba(28, 25, 23, 0.65)'; // lodo escuro
      case 'sea':
        return 'rgba(15, 23, 42, 0.55)'; // azul marinho escuro
      case 'deep_sea':
        return 'rgba(46, 16, 101, 0.5)'; // roxo abissal com toque bioluminescente
      default:
        return 'rgba(15, 23, 42, 0.5)';
    }
  };

  const shadowFill = getShadowColor();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sombras normais navegando pelas águas */}
      {shadows.map((s) => {
        const isLtr = s.direction === 'ltr';
        return (
          <motion.div
            key={s.id}
            initial={{
              x: isLtr ? -120 : '110%',
              y: `${s.startY}%`,
              opacity: 0,
            }}
            animate={{
              x: isLtr ? '110%' : -120,
              y: [`${s.startY}%`, `${s.startY + (s.id % 2 === 0 ? 8 : -8)}%`, `${s.startY}%`],
              opacity: [0, 0.65, 0.7, 0],
            }}
            transition={{
              x: {
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
            className="absolute"
            style={{
              transform: `scale(${s.scale}) ${isLtr ? 'scaleX(1)' : 'scaleX(-1)'}`,
            }}
          >
            {/* SVG da silhueta realista de peixe com ondulação de cauda */}
            <motion.svg
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              width="64"
              height="28"
              viewBox="0 0 64 28"
              fill={shadowFill}
              className="blur-[1px]"
            >
              {/* Corpo e barbatanas estilizados */}
              <path d="M52 14 C46 7 30 4 16 10 C10 12 4 8 1 5 C2 10 3 13 1 18 C4 16 10 14 16 16 C30 22 46 21 52 14 Z" />
              <path d="M30 6 C28 1 24 0 20 2 C23 5 26 6 30 6 Z" />
              <path d="M32 20 C30 25 26 27 22 25 C25 22 28 21 32 20 Z" />
            </motion.svg>
          </motion.div>
        );
      })}

      {/* Sombra de Fisgada Imediata (Quando a boia afunda, uma sombra corre em direção à boia) */}
      {isBiting && (
        <motion.div
          initial={{ x: '15%', y: '80%', opacity: 0, scale: 0.5 }}
          animate={{
            x: '50%',
            y: '50%',
            opacity: [0, 0.8, 0],
            scale: [0.6, 1.4, 1.8],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            width="80"
            height="36"
            viewBox="0 0 64 28"
            fill={shadowFill}
            className="blur-[2px]"
          >
            <path d="M52 14 C46 7 30 4 16 10 C10 12 4 8 1 5 C2 10 3 13 1 18 C4 16 10 14 16 16 C30 22 46 21 52 14 Z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
