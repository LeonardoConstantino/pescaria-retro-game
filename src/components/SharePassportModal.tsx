// src/components/SharePassportModal.tsx
// ─────────────────────────────────────────────────────────────
// Modal de Compartilhamento Unificado & Passaporte do Pescador
// Transforma o estado completo do jogo em um Card Oficial Colecionável
// com estética holográfica 3D, efeitos sonoros, confetes e exportação
// real em imagem PNG HD para postar no Discord, WhatsApp, Twitter e Stories!
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Trophy,
  Award,
  Anchor,
  Compass,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Crown,
  Camera,
  Layers,
  Palette,
  ExternalLink,
  Fish,
} from 'lucide-react';
import { PlayerProfile } from '../game/managers/PlayerManager.js';
import { GameLocation } from '../game/data/locations.data.js';
import { FishData, GameFish } from '../game/data/fish.data.js';
import { ItemData } from '../game/data/items.data.js';
import { TITANS_DATA } from '../game/data/titans.data.js';
import { sound } from '../utils/audio.js';
import { GameAssetImage } from './GameAssetImage.js';

export type CardTheme = 'nautical' | 'cosmic' | 'arcade';

interface SharePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  currentLocation: GameLocation;
  totalCps: number;
  levelInfo: { currentLevelBaseXp: number; nextLevelXp: number };
  discoveredCount?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
}

export const SharePassportModal: React.FC<SharePassportModalProps> = ({
  isOpen,
  onClose,
  player,
  currentLocation,
  totalCps,
  levelInfo,
  discoveredCount = 0,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 18,
}) => {
  const [theme, setTheme] = useState<CardTheme>('nautical');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 3D Tilt interativo
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  // Dispara celebração sonora e confetes ao abrir
  useEffect(() => {
    if (isOpen) {
      sound.playCatch('legendary', 4);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#34d399'],
      });
    }
  }, [isOpen]);

  // Título Honorário do Pescador
  const honoraryTitle = useMemo(() => {
    const titanCount = Object.keys(player.capturedTitans || {}).length;
    const ascensions = player.stats.ascensionsCount || 0;

    if (ascensions >= 3 || titanCount >= 4) return 'Lenda Viva dos Sete Mares';
    if (ascensions >= 1 || titanCount >= 2) return 'Domador de Titãs Ancestrais';
    if (player.level >= 40) return 'Comandante das Frotas Profundas';
    if (player.level >= 25) return 'Mestre Pescador dos Abismos';
    if (player.level >= 15) return 'Capitão das Correntes';
    if (player.level >= 5) return 'Pescador Veterano';
    return 'Pescador de Trapiche';
  }, [player.level, player.capturedTitans, player.stats.ascensionsCount]);

  // Vara e Isca Equipadas
  const equippedRod = useMemo(() => {
    return ItemData.find((i) => i.id === player.equipment.rod) || null;
  }, [player.equipment.rod]);

  const equippedBait = useMemo(() => {
    return ItemData.find((i) => i.id === player.equipment.bait) || null;
  }, [player.equipment.bait]);

  // Maior Troféu / Peixe Recorde
  const bestTrophy = useMemo(() => {
    const rawName = player.stats.largestFishName || 'Tilápia';
    const weight = player.stats.largestFishWeight || 1.8;

    // Tenta encontrar nos Peixes comuns/épicos
    const fishMatch = FishData.find(
      (f) => f.name.toLowerCase() === rawName.toLowerCase() || f.id === rawName,
    );

    // Tenta encontrar nos Titãs
    const titanMatch = Object.values(TITANS_DATA).find(
      (t) => t.name.toLowerCase() === rawName.toLowerCase() || t.id === rawName,
    );

    if (titanMatch) {
      return {
        name: titanMatch.name,
        assetId: titanMatch.assetId,
        weight: weight,
        rarity: 'legendary' as const,
        isTitan: true,
        desc: titanMatch.speciesBase,
      };
    }

    if (fishMatch) {
      return {
        name: fishMatch.name,
        assetId: fishMatch.assetId,
        weight: weight,
        rarity: fishMatch.rarity,
        isTitan: false,
        desc: fishMatch.description,
      };
    }

    return {
      name: rawName,
      assetId: 'fish_tilapia',
      weight: weight,
      rarity: 'rare' as const,
      isTitan: false,
      desc: 'Um espécime vigoroso que gravou sua marca nas águas.',
    };
  }, [player.stats.largestFishName, player.stats.largestFishWeight]);

  // Titãs Domados
  const titansTamedCount = useMemo(() => {
    return Object.keys(player.capturedTitans || {}).length;
  }, [player.capturedTitans]);

  // Quantidade de Peixes no Aquário
  const aquariumFishCount = useMemo(() => {
    return player.aquarium?.fish.length || 0;
  }, [player.aquarium]);

  // Manipulador de Inclinação 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((y - centerY) / centerY) * -12);
    setRotateY(((x - centerX) / centerX) * 12);
    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  // ─────────────────────────────────────────────────────────────
  // GERAÇÃO REAL DE IMAGEM HD VIA CANVAS (1080 x 1400 px)
  // ─────────────────────────────────────────────────────────────
  const generateCanvasImage = async (): Promise<HTMLCanvasElement> => {
    const width = 1080;
    const height = 1440;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível inicializar Canvas 2D');

    // 1. Fundo do Tema
    if (theme === 'nautical') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#040d1a');
      grad.addColorStop(0.5, '#07182e');
      grad.addColorStop(1, '#020610');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Linhas Náuticas / Grid Elegante
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 40; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 40; j < height; j += 80) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Moldura Dourada Clássica
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, width - 72, height - 72);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, width - 96, height - 96);
    } else if (theme === 'cosmic') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0c051f');
      grad.addColorStop(0.4, '#150a36');
      grad.addColorStop(0.8, '#081735');
      grad.addColorStop(1, '#04020e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Estrelas e Nebulosa
      for (let s = 0; s < 120; s++) {
        const sx = (s * 137.5) % width;
        const sy = (s * 293.7) % height;
        const sr = (s % 3) + 1;
        ctx.fillStyle = s % 2 === 0 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(236, 72, 153, 0.6)';
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moldura Holográfica
      const borderGrad = ctx.createLinearGradient(0, 0, width, height);
      borderGrad.addColorStop(0, '#38bdf8');
      borderGrad.addColorStop(0.5, '#c084fc');
      borderGrad.addColorStop(1, '#ec4899');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, width - 72, height - 72);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, width - 96, height - 96);
    } else {
      // Arcade
      ctx.fillStyle = '#060b10';
      ctx.fillRect(0, 0, width, height);

      // Grid Verde CRT
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < height; i += 6) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, width - 72, height - 72);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, width - 96, height - 96);
    }

    // Cantos Decorativos
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = theme === 'arcade' ? '#10b981' : theme === 'cosmic' ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(x - 12, y - 12, 24, 24);
    };
    drawCorner(36, 36);
    drawCorner(width - 36, 36);
    drawCorner(36, height - 36);
    drawCorner(width - 36, height - 36);

    // 2. CABEÇALHO OFICIAL / BRASÃO
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillStyle = theme === 'arcade' ? '#34d399' : theme === 'cosmic' ? '#38bdf8' : '#f59e0b';
    ctx.letterSpacing = '4px';
    ctx.fillText('★ CAPITANIA DOS MARES · REPÚBLICA PESQUEIRA ★', width / 2, 95);

    ctx.font = '900 48px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1px';
    ctx.fillText('PASSAPORTE DE PESCADOR', width / 2, 150);

    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('LICENÇA DE MESTRE NAVEGADOR & REGISTRO DE TROFÉUS', width / 2, 185);

    // Linha Divisória
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(80, 215);
    ctx.lineTo(width - 80, 215);
    ctx.stroke();

    // 3. CARTÃO DE IDENTIDADE DO PESCADOR (Caixa Principal)
    const idBoxY = 240;
    const idBoxH = 220;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(80, idBoxY, width - 160, idBoxH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, idBoxY, width - 160, idBoxH);

    // Avatar / Distintivo
    const avatarX = 140;
    const avatarY = idBoxY + 50;
    ctx.fillStyle = theme === 'arcade' ? '#064e3b' : theme === 'cosmic' ? '#311042' : '#451a03';
    ctx.beginPath();
    ctx.arc(avatarX + 50, avatarY + 50, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme === 'arcade' ? '#10b981' : theme === 'cosmic' ? '#c084fc' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Símbolo do Avatar
    ctx.font = '54px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🎣', avatarX + 50, avatarY + 68);

    // Textos de Identidade
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.fillText(player.name || 'Pescador Anônimo', 280, idBoxY + 70);

    ctx.fillStyle = theme === 'arcade' ? '#6ee7b7' : theme === 'cosmic' ? '#a78bfa' : '#fcd34d';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`⚜️ ${honoraryTitle}`, 280, idBoxY + 110);

    // Nível, XP e Selo de Prestígio
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.fillText(`NÍVEL ${player.level}`, 280, idBoxY + 160);

    if ((player.stats.ascensionsCount || 0) > 0) {
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(`✨ ASCENSÃO GRAU ${player.stats.ascensionsCount}`, 440, idBoxY + 160);
    }

    // Barra de XP
    const xpPercent = Math.min(1, Math.max(0, player.xp / Math.max(1, levelInfo.nextLevelXp)));
    const xpBarX = 280;
    const xpBarY = idBoxY + 180;
    const xpBarW = 400;
    const xpBarH = 14;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
    ctx.fillStyle = theme === 'arcade' ? '#10b981' : '#38bdf8';
    ctx.fillRect(xpBarX, xpBarY, xpBarW * xpPercent, xpBarH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(`${player.xp} / ${levelInfo.nextLevelXp} XP`, xpBarX + xpBarW + 20, xpBarY + 12);

    // Carimbo Oficial no Canto
    ctx.save();
    ctx.translate(width - 200, idBoxY + 110);
    ctx.rotate(-0.15);
    ctx.strokeStyle = theme === 'arcade' ? '#10b981' : theme === 'cosmic' ? '#ec4899' : '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = theme === 'arcade' ? '#10b981' : theme === 'cosmic' ? '#ec4899' : '#dc2626';
    ctx.textAlign = 'center';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText('OFICIAL', 0, -18);
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('VERIFICADO', 0, 4);
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText('PESCA RETRÔ', 0, 24);
    ctx.restore();

    // 4. DESTAQUE DO MAIOR TROFÉU (Recorde Supremo)
    const trophyY = 485;
    const trophyH = 220;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(80, trophyY, width - 160, trophyH);

    const trophyBorderGrad = ctx.createLinearGradient(80, trophyY, width - 80, trophyY);
    trophyBorderGrad.addColorStop(0, '#f59e0b');
    trophyBorderGrad.addColorStop(1, '#fbbf24');
    ctx.strokeStyle = trophyBorderGrad;
    ctx.lineWidth = 2;
    ctx.strokeRect(80, trophyY, width - 160, trophyH);

    // Rótulo
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏆 MAIOR TROFÉU PESCADO NA CARREIRA', 110, trophyY + 40);

    // Nome e Peso
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px system-ui, sans-serif';
    ctx.fillText(bestTrophy.name, 110, trophyY + 95);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(`${bestTrophy.weight.toFixed(1)} kg`, 110, trophyY + 145);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 18px system-ui, sans-serif';
    ctx.fillText(`Raridade: ${bestTrophy.rarity.toUpperCase()} · ${bestTrophy.desc}`, 110, trophyY + 185);

    // Ícone Gigante do Peixe à direita
    ctx.font = '80px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(bestTrophy.isTitan ? '🐉' : '🐟', width - 180, trophyY + 130);

    // 5. GRADE DE ESTATÍSTICAS UNIFICADAS (6 Quadrantes)
    const statsY = 730;
    const cardW = (width - 160 - 30) / 3;
    const cardH = 145;

    const statsList = [
      {
        label: 'PEIXES PESCADOS',
        val: (player.stats.totalFishCaught || 0).toLocaleString('pt-BR'),
        sub: 'Total Histórico',
        icon: '🎣',
      },
      {
        label: 'FORTUNA ATUAL',
        val: `${(player.coins || 0).toLocaleString('pt-BR')} 🪙`,
        sub: 'Moedas de Ouro',
        icon: '💰',
      },
      {
        label: 'RENDA PASSIVA',
        val: `+${totalCps} 🪙/s`,
        sub: 'Automação Ativa',
        icon: '⚡',
      },
      {
        label: 'BESTIÁRIO',
        val: `${discoveredCount} / 14`,
        sub: 'Espécies Descobertas',
        icon: '📖',
      },
      {
        label: 'TITÃS DOMADOS',
        val: `${titansTamedCount} / 5`,
        sub: 'Criaturas Ancestrais',
        icon: '⚔️',
      },
      {
        label: 'CONQUISTAS',
        val: `${unlockedAchievementsCount} / ${totalAchievementsCount}`,
        sub: 'Marcos de Glória',
        icon: '🏅',
      },
    ];

    statsList.forEach((stat, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const sx = 80 + col * (cardW + 15);
      const sy = statsY + row * (cardH + 15);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(sx, sy, cardW, cardH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, cardW, cardH);

      // Emoji
      ctx.textAlign = 'left';
      ctx.font = '24px system-ui';
      ctx.fillText(stat.icon, sx + 20, sy + 42);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(stat.label, sx + 56, sy + 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px system-ui, sans-serif';
      ctx.fillText(stat.val, sx + 20, sy + 88);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 15px system-ui, sans-serif';
      ctx.fillText(stat.sub, sx + 20, sy + 118);
    });

    // 6. EQUIPAMENTO & LOCALIZAÇÃO ATIVA (Rodapé Superior)
    const equipY = 1060;
    const equipH = 140;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(80, equipY, width - 160, equipH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(80, equipY, width - 160, equipH);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('ARSENAL EQUIPADO & BIOMA ATUAL', 110, equipY + 40);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`🎣 Vara: ${equippedRod?.name || 'Vara Básica'}`, 110, equipY + 80);
    ctx.fillText(`🪱 Isca: ${equippedBait?.name || 'Sem Isca'}`, 110, equipY + 112);

    ctx.fillText(`📍 Bioma: ${currentLocation.name}`, 560, equipY + 80);
    ctx.fillText(`🐠 Aquário: ${aquariumFishCount} Peixes em Exibição`, 560, equipY + 112);

    // 7. RODAPÉ DE VALIDAÇÃO / BRANDING
    const dateStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(`Emitido em ${dateStr} · Autenticação Criptográfica do Pescador: #${player.id.substring(0, 8)}`, width / 2, 1260);

    ctx.fillStyle = theme === 'arcade' ? '#10b981' : theme === 'cosmic' ? '#38bdf8' : '#fbbf24';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('JOGUE GRÁTIS NO NAVEGADOR: PESCA RETRÔ', width / 2, 1310);

    ctx.fillStyle = '#475569';
    ctx.font = '500 16px system-ui, sans-serif';
    ctx.fillText('O Despertar dos Titãs Ancestrais · Sistema de Pescaria Dinâmica e RPG', width / 2, 1345);

    return canvas;
  };

  // ─────────────────────────────────────────────────────────────
  // AÇÕES DO USUÁRIO: DOWNLOAD, COPIAR IMAGEM, COPIAR TEXTO, SHARE
  // ─────────────────────────────────────────────────────────────
  const handleDownloadImage = async () => {
    setIsGeneratingImg(true);
    sound.playCoins();
    try {
      const canvas = await generateCanvasImage();
      const link = document.createElement('a');
      link.download = `passaporte-pescador-${(player.name || 'pesca').toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#38bdf8', '#34d399', '#ec4899'],
      });
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleCopyImage = async () => {
    setIsGeneratingImg(true);
    sound.playCoins();
    try {
      const canvas = await generateCanvasImage();
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Falha ao criar blob');
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2800);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } else {
          // Fallback para download se a Clipboard API de imagem não for permitida no browser
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
      // Fallback
      handleDownloadImage();
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleCopyTextSummary = () => {
    sound.playWaterClick(false);
    const summary = [
      `🌊 PASSAPORTE DO PESCADOR - PESCA RETRÔ 🎣`,
      `👤 Capitão: ${player.name} (Nível ${player.level}) · ⚜️ ${honoraryTitle}`,
      `🏆 Maior Troféu: ${bestTrophy.name} (${bestTrophy.weight.toFixed(1)} kg)`,
      `🐟 Total Pescado: ${(player.stats.totalFishCaught || 0).toLocaleString('pt-BR')} peixes`,
      `🪙 Fortuna: ${(player.coins || 0).toLocaleString('pt-BR')} moedas | ⚡ Automação: +${totalCps} 🪙/s`,
      `⚔️ Titãs Conquistados: ${titansTamedCount}/5 | 📖 Bestiário: ${discoveredCount}/14`,
      `📍 Local Atual: ${currentLocation.name} | 🎣 Vara: ${equippedRod?.name || 'Vara Básica'}`,
      `✨ Jogue grátis agora e mostre seu troféu!`,
      `🔗 https://leonardoconstantino.github.io/pescaria-retro-game/`
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2800);
    }
  };

  const handleNativeShare = async () => {
    sound.playWaterClick(false);
    try {
      if (navigator.share) {
        const canvas = await generateCanvasImage();
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'passaporte.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'passaporte-pescador.png', { type: 'image/png' });
            await navigator.share({
              title: `Passaporte de Pescador de ${player.name}`,
              text: `Confira meu progresso épico no Pesca Retrô! Nível ${player.level} com ${player.stats.totalFishCaught} peixes e o troféu ${bestTrophy.name} (${bestTrophy.weight.toFixed(1)} kg)!`,
              files: [file],
            });
          } else {
            await navigator.share({
              title: `Passaporte de Pescador de ${player.name}`,
              text: `Confira meu progresso no Pesca Retrô! Nível ${player.level} com troféu ${bestTrophy.name} (${bestTrophy.weight.toFixed(1)} kg)!`,
              url: window.location.href,
            });
          }
        }, 'image/png');
      } else {
        handleDownloadImage();
      }
    } catch (e) {
      // Compartilhamento cancelado pelo usuário ou erro
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Barra de Topo do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                Passaporte Oficial de Pescador
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HD SHARE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Seu jogo unificado em um único card lendário pronto para printar ou baixar!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo: Grade com Preview do Card + Painel de Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 overflow-y-auto">
          {/* Coluna Esquerda: O Card Interativo 3D (7 Colunas) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* Seletor de Tema / Estilo do Card */}
            <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4 w-full justify-center">
              <span className="text-xs text-slate-400 font-semibold px-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                Estilo:
              </span>
              <button
                onClick={() => {
                  setTheme('nautical');
                  sound.playWaterClick(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  theme === 'nautical'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚓ Capitania Real
              </button>
              <button
                onClick={() => {
                  setTheme('cosmic');
                  sound.playWaterClick(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  theme === 'cosmic'
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌌 Holo Cósmico
              </button>
              <button
                onClick={() => {
                  setTheme('arcade');
                  sound.playWaterClick(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  theme === 'arcade'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👾 Retrô 16-Bit
              </button>
            </div>

            {/* O CARD (Renderizado com CSS 3D Tilt) */}
            <div
              style={{ perspective: 1000 }}
              className="relative w-full max-w-[430px] select-none cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                ref={cardRef}
                animate={{ rotateX, rotateY }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`relative rounded-3xl p-5 sm:p-6 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
                  theme === 'nautical'
                    ? 'bg-gradient-to-b from-slate-900 via-[#071933] to-[#030b17] border-amber-500/70 shadow-amber-950/40'
                    : theme === 'cosmic'
                    ? 'bg-gradient-to-b from-[#110729] via-[#1a0f3d] to-[#070417] border-cyan-400/80 shadow-purple-950/40'
                    : 'bg-gradient-to-b from-stone-950 via-slate-950 to-black border-emerald-500/80 shadow-emerald-950/40'
                }`}
              >
                {/* Reflexo Holográfico Dinâmico */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-30"
                  style={{
                    background:
                      theme === 'cosmic'
                        ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(236, 72, 153, 0.4) 0%, rgba(56, 189, 248, 0.35) 35%, transparent 75%)`
                        : `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(251, 191, 36, 0.3) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 70%)`,
                    mixBlendMode: 'color-dodge',
                    opacity: 0.65,
                  }}
                />

                {/* Marca d'água de Fundo */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-slate-100">
                  <Anchor className="w-56 h-56" />
                </div>

                {/* 1. Header do Card */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {theme === 'cosmic' ? '🌌' : theme === 'arcade' ? '👾' : '⚓'}
                    </span>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-black text-amber-400">
                        {theme === 'cosmic' ? 'REGISTRO CÓSMICO' : 'CAPITANIA DOS MARES'}
                      </div>
                      <div className="text-xs font-black text-slate-100 tracking-wide">
                        PASSAPORTE DE PESCADOR
                      </div>
                    </div>
                  </div>

                  {/* Carimbo / Selo de Autenticidade */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/50 text-red-300 text-[10px] font-black tracking-wider uppercase rotate-2 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-red-400" />
                    OFICIAL
                  </div>
                </div>

                {/* 2. Identidade do Pescador */}
                <div className="relative z-10 flex items-center gap-3.5 mb-4 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-700 flex items-center justify-center text-2xl shadow-md border-2 border-amber-400 shrink-0">
                    🎣
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black border border-slate-900">
                      N{player.level}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white truncate">
                        {player.name || 'Pescador'}
                      </h3>
                      {(player.stats.ascensionsCount || 0) > 0 && (
                        <span title={`Ascensão Grau ${player.stats.ascensionsCount}`} className="text-xs">
                          ✨
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-300 truncate">
                      ⚜️ {honoraryTitle}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(5, (player.xp / Math.max(1, levelInfo.nextLevelXp)) * 100),
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {player.xp}/{levelInfo.nextLevelXp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Destaque do Maior Troféu */}
                <div className="relative z-10 mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-transparent border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Maior Troféu Registrado
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950">
                      RECORDE
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        {bestTrophy.name}
                        {bestTrophy.isTitan && (
                          <span className="text-[9px] font-black px-1.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30">
                            TITÃ
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-black text-sky-300">
                        {bestTrophy.weight.toFixed(1)} kg
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                      <GameAssetImage
                        assetId={bestTrophy.assetId}
                        name={bestTrophy.name}
                        rarity={bestTrophy.rarity}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Grade de Estatísticas Unificadas */}
                <div className="relative z-10 grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Pescados</div>
                    <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                      {(player.stats.totalFishCaught || 0).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Fortuna</div>
                    <div className="text-xs sm:text-sm font-black text-amber-300 mt-0.5 truncate">
                      {(player.coins || 0).toLocaleString('pt-BR')} 🪙
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Renda Passiva</div>
                    <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">
                      +{totalCps} 🪙/s
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Bestiário</div>
                    <div className="text-xs sm:text-sm font-black text-sky-300 mt-0.5">
                      {discoveredCount}/14
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Titãs</div>
                    <div className="text-xs sm:text-sm font-black text-lime-300 mt-0.5">
                      {titansTamedCount}/5
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Conquistas</div>
                    <div className="text-xs sm:text-sm font-black text-purple-300 mt-0.5">
                      {unlockedAchievementsCount}/{totalAchievementsCount}
                    </div>
                  </div>
                </div>

                {/* 5. Loadout & Rodapé do Card */}
                <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate">{currentLocation.name}</span>
                  </div>
                  <div className="font-mono font-bold text-amber-400">
                    PESCA RETRÔ · HD
                  </div>
                </div>
              </motion.div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              💡 Mova o mouse sobre a carta para ver o reflexo holográfico em 3D!
            </p>
          </div>

          {/* Coluna Direita: Painel de Compartilhamento & Ações (5 Colunas) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Pronto para Postar!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gere um PNG cristalino em alta resolução (1080x1440) para enviar no grupo de pesca, Discord, WhatsApp ou nos Stories. Sem precisar recortar vários prints!
                </p>
              </div>

              {/* Botões de Ação com Juice */}
              <div className="space-y-2.5">
                {/* 1. Baixar Imagem HD */}
                <button
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImg}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-950/40 disabled:opacity-60 cursor-pointer"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      <span>Download Concluído!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>{isGeneratingImg ? 'Gerando Imagem HD...' : 'Baixar Imagem PNG (HD)'}</span>
                    </>
                  )}
                </button>

                {/* 2. Copiar Imagem para Área de Transferência */}
                <button
                  onClick={handleCopyImage}
                  disabled={isGeneratingImg}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600/70 text-slate-100 font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.98] shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Imagem Copiada! (Cole com Ctrl+V)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span>Copiar Imagem (Colar no Discord/WhatsApp)</span>
                    </>
                  )}
                </button>

                {/* 3. Compartilhar Nativo (Mobile / Web Share) */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600/40 to-blue-600/40 hover:from-cyan-600/60 hover:to-blue-600/60 border border-cyan-500/40 text-cyan-200 font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.98] shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-cyan-300" />
                    <span>Compartilhar Direto no Celular</span>
                  </button>
                )}

                {/* 4. Copiar Resumo em Texto */}
                <button
                  onClick={handleCopyTextSummary}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Resumo em Texto com Emojis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Caixa de Resumo Rápido */}
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Destaques Inclusos no Card:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                <li>Nome, Nível e Título Honorário Oficial</li>
                <li>Maior Peixe / Troféu pescado com peso em kg</li>
                <li>Moedas acumuladas e renda passiva (CPS)</li>
                <li>Bestiário e Titãs Ancestrais domados</li>
                <li>Selo oficial de autenticidade da Capitania</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
