// src/components/IdleFishersWaterVisual.tsx
// ─────────────────────────────────────────────────────────────
// Representação cômica e performática dos ajudantes automatizados
// espalhados como boias personalizadas nas águas.
//
// Regras de Performance & Limite Visual:
// 1. Teto visual de 16 boias no total (para nunca poluir o palco).
// 2. Se o jogador tiver ex: 250 varas de bambu, renderiza até 3 ou 4
//    com um badge cômico acumulativo (ex: "🎋 x250" ou "🐾 x45").
// 3. Posições fixas procedurais pré-distribuídas (evita colisões).
// 4. Efeitos de ondulação e tremelique cômico característico.
// ─────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { IDLE_FISHER_TIERS, IdleFisherTier } from '../game/data/idle.data.js';

interface IdleFishersWaterVisualProps {
  idleFishers: Record<string, number>;
}

interface PlacedBobber {
  uniqueKey: string;
  tier: IdleFisherTier;
  xPercent: number;
  yPercent: number;
  representedCount: number;
  hasClusterBadge: boolean;
}

// 16 âncoras espaciais seguras e balanceadas na água (longe do centro da boia principal em 50%, 50%)
const SAFE_ANCHORS = [
  // Lado Esquerdo
  { x: 12, y: 30 },
  { x: 22, y: 68 },
  { x: 30, y: 22 },
  { x: 18, y: 48 },
  { x: 28, y: 76 },
  { x: 8, y: 62 },
  { x: 20, y: 15 },
  { x: 34, y: 45 },

  // Lado Direito
  { x: 88, y: 32 },
  { x: 78, y: 65 },
  { x: 70, y: 20 },
  { x: 82, y: 50 },
  { x: 72, y: 75 },
  { x: 92, y: 60 },
  { x: 80, y: 14 },
  { x: 66, y: 46 },
];

export const IdleFishersWaterVisual: React.FC<IdleFishersWaterVisualProps> = ({ idleFishers }) => {
  const placedBobbers = useMemo(() => {
    const list: PlacedBobber[] = [];
    let anchorIndex = 0;

    for (const tier of IDLE_FISHER_TIERS) {
      const count = idleFishers[tier.id] || 0;
      if (count <= 0) continue;

      // Quantas instâncias visuais alocar para esta categoria (mínimo 1, máximo 3)
      const visualCount = Math.min(3, count);
      const perBobberMultiplier = Math.floor(count / visualCount);
      const remainder = count % visualCount;

      for (let i = 0; i < visualCount; i++) {
        if (anchorIndex >= SAFE_ANCHORS.length) break;

        const anchor = SAFE_ANCHORS[anchorIndex % SAFE_ANCHORS.length];
        const represented = perBobberMultiplier + (i === 0 ? remainder : 0);

        list.push({
          uniqueKey: `${tier.id}-${i}`,
          tier,
          xPercent: anchor.x,
          yPercent: anchor.y,
          representedCount: represented,
          hasClusterBadge: count > 3,
        });

        anchorIndex++;
      }
    }

    return list;
  }, [idleFishers]);

  if (placedBobbers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {placedBobbers.map((item, idx) => {
        const { tier, xPercent, yPercent, representedCount, hasClusterBadge } = item;
        const visual = tier.bobberVisual;
        const delay = (idx * 0.35) % 1.5;

        return (
          <div
            key={item.uniqueKey}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer pointer-events-auto"
            style={{
              left: `${xPercent}%`,
              top: `${yPercent}%`,
            }}
            title={`${tier.name} (Produzindo moedas passivas)`}
          >
            {/* Boia Cômica com Animação Fluida */}
            <motion.div
              animate={{
                y: [-2, 3, -2],
                rotate: [-4, 4, -4],
              }}
              transition={{
                repeat: Infinity,
                duration: visual.wobbleSpeed,
                ease: 'easeInOut',
                delay,
              }}
              className="relative flex flex-col items-center select-none"
              style={{
                transform: `scale(${visual.sizeScale})`,
              }}
            >
              {/* Emblema cômico da antena (ex: rádio, pata de gato, tridente) */}
              <span className="text-[13px] -mb-1 filter drop-shadow-sm select-none">
                {visual.antennaEmoji}
              </span>

              {/* Corpo da Boia em Cores Personalizadas */}
              <div
                className="w-5 h-7 rounded-full shadow-md border border-slate-950 flex flex-col overflow-hidden"
                style={{
                  boxShadow: `0 0 8px ${visual.colorTop}55`,
                }}
              >
                <div
                  className="w-full h-1/2"
                  style={{ backgroundColor: visual.colorTop }}
                />
                <div
                  className="w-full h-1/2"
                  style={{ backgroundColor: visual.colorBottom }}
                />
              </div>

              {/* Mini-ondulação na água abaixo da boiazinha */}
              <motion.div
                animate={{
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: visual.wobbleSpeed * 1.2,
                  delay,
                }}
                className="w-8 h-3 rounded-full border border-sky-400/40 -mt-1"
              />
            </motion.div>

            {/* Badge Acumulativo Cômico (Ex: "🎋 x15" ou "👴 x3") */}
            {hasClusterBadge && (
              <span className="mt-0.5 px-1.5 py-0.2 rounded-full bg-slate-950/85 border border-slate-700/80 text-[9px] font-black text-amber-300 backdrop-blur-xs shadow-md tracking-tighter select-none">
                {tier.emoji} {representedCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
