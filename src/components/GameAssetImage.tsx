// src/components/GameAssetImage.tsx
import React, { useState } from 'react';
import {
  Fish,
  Sparkles,
  Zap,
  CloudRain,
  Gift,
  Compass,
  AlertTriangle,
  Anchor,
  CircleDot,
  Flame,
  Waves,
  Feather,
} from 'lucide-react';

interface GameAssetImageProps {
  assetId: string;
  name?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}

const RARITY_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  common: { ring: 'ring-slate-400/40', bg: 'bg-slate-800/80', text: 'text-slate-200' },
  uncommon: { ring: 'ring-emerald-400/60', bg: 'bg-emerald-950/80', text: 'text-emerald-300' },
  rare: { ring: 'ring-blue-400/70', bg: 'bg-blue-950/80', text: 'text-blue-300' },
  epic: { ring: 'ring-purple-400/80', bg: 'bg-purple-950/80', text: 'text-purple-300' },
  legendary: { ring: 'ring-amber-400/90', bg: 'bg-amber-950/80', text: 'text-amber-300' },
};

export const GameAssetImage: React.FC<GameAssetImageProps> = ({
  assetId,
  name = '',
  rarity = 'common',
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const rarityInfo = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl',
    hero: 'w-44 h-44 text-3xl',
  }[size];

  // Ícone temático conforme o assetId
  const renderFallbackIcon = () => {
    // 1. Peixes
    if (assetId.startsWith('fish_')) {
      if (assetId === 'fish_kraken_baby') {
        return (
          <div className="relative flex items-center justify-center w-full h-full text-purple-400 animate-pulse">
            <Flame className="w-2/3 h-2/3 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
            <span className="absolute bottom-1 text-[11px] font-bold tracking-wider text-amber-300">🐙 KRAKEN</span>
          </div>
        );
      }
      if (assetId === 'fish_golden_carp') {
        return (
          <div className="relative flex items-center justify-center w-full h-full text-amber-300">
            <Fish className="w-2/3 h-2/3 text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-bounce" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-200 animate-spin" />
          </div>
        );
      }
      if (assetId === 'fish_swordfish') {
        return <Fish className="w-2/3 h-2/3 text-indigo-300 -rotate-12" />;
      }
      if (assetId === 'fish_arapaima') {
        return <Fish className="w-3/4 h-3/4 text-emerald-400" />;
      }
      if (assetId === 'fish_salmon') {
        return <Fish className="w-2/3 h-2/3 text-rose-400" />;
      }
      if (assetId === 'fish_tuna') {
        return <Fish className="w-2/3 h-2/3 text-sky-400" />;
      }
      return <Fish className={`w-2/3 h-2/3 ${rarityInfo.text}`} />;
    }

    // 2. Varas
    if (assetId.startsWith('rod_')) {
      if (assetId === 'rod_legendary') {
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <Anchor className="w-2/3 h-2/3 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            <Sparkles className="absolute top-1 right-1 w-4 h-4 text-yellow-200" />
          </div>
        );
      }
      return <Anchor className="w-2/3 h-2/3 text-sky-300" />;
    }

    // 3. Iscas
    if (assetId.startsWith('bait_')) {
      if (assetId === 'bait_golden') {
        return (
          <div className="relative flex items-center justify-center w-full h-full">
            <Sparkles className="w-3/4 h-3/4 text-amber-300 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
          </div>
        );
      }
      return <CircleDot className="w-2/3 h-2/3 text-orange-400" />;
    }

    // 4. Locais
    if (assetId.startsWith('location_')) {
      return <Waves className="w-2/3 h-2/3 text-cyan-300" />;
    }

    // 5. Eventos
    if (assetId === 'event_treasure') {
      return <Gift className="w-2/3 h-2/3 text-amber-400 animate-bounce" />;
    }
    if (assetId === 'event_lightning') {
      return <Zap className="w-2/3 h-2/3 text-yellow-300 animate-pulse" />;
    }
    if (assetId === 'event_storm' || assetId === 'event_giant_wave') {
      return <CloudRain className="w-2/3 h-2/3 text-sky-400" />;
    }
    if (assetId === 'event_mermaid') {
      return <Sparkles className="w-2/3 h-2/3 text-pink-300 animate-spin" />;
    }
    if (assetId === 'event_heron_steal') {
      return <Feather className="w-2/3 h-2/3 text-stone-300" />;
    }

    // Padrão
    return <Compass className="w-2/3 h-2/3 text-slate-300" />;
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden ring-1 ${rarityInfo.ring} ${rarityInfo.bg} shadow-lg shrink-0 transition-transform duration-200 ${sizeClasses} ${className}`}
    >
      {/* Tenta carregar a imagem do asset caso exista no servidor */}
      {!hasError ? (
        <img
          src={`${import.meta.env.BASE_URL}${assetId}.png`}
          alt={name || assetId}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-1.5 transition-transform hover:scale-105"
          onError={() => setHasError(true)}
        />
      ) : (
        renderFallbackIcon()
      )}
    </div>
  );
};
