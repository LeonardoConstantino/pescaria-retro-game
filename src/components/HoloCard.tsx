// src/components/HoloCard.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface HoloCardProps {
  children: React.ReactNode;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  className?: string;
  enableTilt?: boolean;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  children,
  rarity = 'common',
  className = '',
  enableTilt = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const isSpecial = ['rare', 'epic', 'legendary'].includes(rarity);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Cores do brilho holográfico conforme a raridade
  const getHoloGradient = () => {
    switch (rarity) {
      case 'legendary':
        return `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(251, 191, 36, 0.45) 0%, rgba(236, 72, 153, 0.35) 30%, rgba(59, 130, 246, 0.25) 60%, transparent 85%)`;
      case 'epic':
        return `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(192, 132, 252, 0.45) 0%, rgba(56, 189, 248, 0.35) 35%, rgba(168, 85, 247, 0.2) 65%, transparent 85%)`;
      case 'rare':
        return `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(56, 189, 248, 0.4) 0%, rgba(45, 212, 191, 0.3) 40%, transparent 80%)`;
      default:
        return `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)`;
    }
  };

  return (
    <div
      style={{ perspective: 900 }}
      className={`relative select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        animate={{
          rotateX,
          rotateY,
          scale: isHovered && isSpecial ? 1.03 : 1,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 260, mass: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-3xl overflow-hidden"
      >
        {/* Conteúdo da Carta */}
        <div className="relative z-10 w-full h-full">{children}</div>

        {/* Camada Holográfica Furta-cor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20"
          style={{
            background: getHoloGradient(),
            mixBlendMode: 'color-dodge',
            opacity: isHovered || isSpecial ? 0.75 : 0.2,
          }}
        />

        {/* Listras de arco-íris diagonais cintilantes para Épicos e Lendários */}
        {isSpecial && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen z-20"
            style={{
              background: `linear-gradient(${glarePos.x + 45}deg, rgba(255,0,0,0.15) 0%, rgba(255,154,0,0.15) 15%, rgba(208,222,33,0.15) 30%, rgba(79,220,74,0.15) 45%, rgba(63,218,216,0.15) 60%, rgba(47,201,226,0.15) 75%, rgba(28,127,238,0.15) 90%, rgba(95,21,242,0.15) 100%)`,
            }}
          />
        )}

        {/* Efeito de Feixe de Luz Móvel */}
        {isHovered && isSpecial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/15 to-transparent z-20"
          />
        )}
      </motion.div>
    </div>
  );
};
