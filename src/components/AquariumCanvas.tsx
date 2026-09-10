// src/components/AquariumCanvas.tsx
// ─────────────────────────────────────────────────────────────
// Simulação Interativa e Viva do Aquário de Troféus
// (Peixes nadando em tempo real, partículas de bolhas, ração
// afundando, decorações animadas e placas interativas de troféu)
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AquariumTrophyFish, AquariumTheme, AquariumDecoration } from '../game/data/aquarium.data.js';
import { Sparkles, Heart, Utensils } from 'lucide-react';

interface FoodPellet {
  id: string;
  x: number;
  y: number;
  vy: number;
  radius: number;
}

interface FishEntity {
  id: string;
  fishId: string;
  name: string;
  nickname?: string;
  rarity: string;
  weight: number;
  assetId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  facing: 1 | -1; // 1 = direita, -1 = esquerda
  size: number;
  wigglePhase: number;
  wiggleSpeed: number;
  color: string;
  bellyColor: string;
  glowColor: string;
  eatingCooldown: number;
  hasHeart: boolean;
  heartTimer: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

interface AquariumCanvasProps {
  fishList: AquariumTrophyFish[];
  theme: AquariumTheme;
  decorations: AquariumDecoration[];
  isFed: boolean;
  onSelectFish: (fish: AquariumTrophyFish) => void;
  selectedFishId?: string | null;
}

const RARITY_COLORS: Record<string, { body: string; belly: string; glow: string }> = {
  common: { body: '#38bdf8', belly: '#bae6fd', glow: 'rgba(56, 189, 248, 0.2)' },
  uncommon: { body: '#4ade80', belly: '#bbf7d0', glow: 'rgba(74, 222, 128, 0.3)' },
  rare: { body: '#60a5fa', belly: '#dbeafe', glow: 'rgba(96, 165, 250, 0.4)' },
  epic: { body: '#c084fc', belly: '#f3e8ff', glow: 'rgba(192, 132, 252, 0.5)' },
  legendary: { body: '#fbbf24', belly: '#fef3c7', glow: 'rgba(251, 191, 36, 0.65)' },
};

export const AquariumCanvas: React.FC<AquariumCanvasProps> = ({
  fishList,
  theme,
  decorations,
  isFed,
  onSelectFish,
  selectedFishId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<FishEntity[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const foodRef = useRef<FoodPellet[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  // Sincroniza a lista de entidades quando fishList muda
  useEffect(() => {
    const currentEntities = entitiesRef.current;
    const newEntities: FishEntity[] = [];

    const width = dimensions.width;
    const height = dimensions.height;

    fishList.forEach((fish) => {
      const existing = currentEntities.find((e) => e.id === fish.id);
      const colorScheme = RARITY_COLORS[fish.rarity] || RARITY_COLORS.common;

      // Tamanho proporcional ao peso com limites estéticos (26px a 62px)
      const baseSize = 28 + Math.min(Math.sqrt(fish.weight) * 7.5, 34);

      if (existing) {
        existing.nickname = fish.nickname;
        newEntities.push(existing);
      } else {
        const startX = 60 + Math.random() * (width - 120);
        const startY = 50 + Math.random() * (height - 130);
        const vx = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.9);

        newEntities.push({
          id: fish.id,
          fishId: fish.fishId,
          name: fish.name,
          nickname: fish.nickname,
          rarity: fish.rarity,
          weight: fish.weight,
          assetId: fish.assetId,
          x: startX,
          y: startY,
          vx,
          vy: (Math.random() - 0.5) * 0.4,
          targetX: startX + vx * 200,
          targetY: startY,
          facing: vx >= 0 ? 1 : -1,
          size: baseSize,
          wigglePhase: Math.random() * Math.PI * 2,
          wiggleSpeed: 0.12 + Math.random() * 0.08,
          color: colorScheme.body,
          bellyColor: colorScheme.belly,
          glowColor: colorScheme.glow,
          eatingCooldown: 0,
          hasHeart: false,
          heartTimer: 0,
        });
      }
    });

    entitiesRef.current = newEntities;
  }, [fishList, dimensions]);

  // Redimensionamento responsivo do container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(240, Math.floor(rect.width || 320));
        const h = Math.max(140, Math.floor(rect.height || 176));
        setDimensions({ width: w, height: h });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Criação inicial de bolhas de oxigênio
  useEffect(() => {
    const count = 25;
    const bubbles: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        radius: 1.5 + Math.random() * 3.5,
        vy: 0.6 + Math.random() * 1.2,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobbleAmp: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    bubblesRef.current = bubbles;
  }, [dimensions]);

  // Função para adicionar ração ao clicar na água
  const dropFoodAt = useCallback((x: number, y: number) => {
    // Adiciona 2 a 4 flocos de ração que afundam
    const newPellets: FoodPellet[] = [];
    for (let i = 0; i < 3; i++) {
      newPellets.push({
        id: `food_${Date.now()}_${i}`,
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 12,
        vy: 0.6 + Math.random() * 0.6,
        radius: 2.5 + Math.random() * 1.5,
      });
    }
    foodRef.current.push(...newPellets);

    // Adiciona ondulação na água
    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      alpha: 0.7,
    });
  }, []);

  // Interação de clique no canvas (alimentar ou selecionar peixe)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Verifica se clicou em algum peixe (do topo da z-order para baixo)
    const entities = entitiesRef.current;
    let clickedFish: AquariumTrophyFish | null = null;

    for (let i = entities.length - 1; i >= 0; i--) {
      const f = entities[i];
      const dx = clickX - f.x;
      const dy = clickY - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= f.size * 0.85) {
        const foundOriginal = fishList.find((item) => item.id === f.id);
        if (foundOriginal) {
          clickedFish = foundOriginal;
          break;
        }
      }
    }

    if (clickedFish) {
      onSelectFish(clickedFish);
    } else {
      // Se clicou na água aberta, solta ração e cria ondulação!
      dropFoodAt(clickX, clickY);
    }
  };

  // Loop de Renderização Física a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // ── 1. Luzes e Raios Solares Caustics ─────────────────
      ctx.save();
      const sunGradient = ctx.createLinearGradient(0, 0, 0, height);
      sunGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      sunGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
      sunGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // ── 2. Ondulações da Água ─────────────────────────────
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 55 * dt;
        r.alpha -= 0.7 * dt;

        if (r.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // ── 3. Bolhas de Oxigênio ─────────────────────────────
      bubblesRef.current.forEach((b) => {
        b.y -= b.vy;
        b.phase += b.wobbleSpeed;
        const drawX = b.x + Math.sin(b.phase) * b.wobbleAmp;

        if (b.y < -10) {
          b.y = height + 10;
          b.x = Math.random() * width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Ponto de brilho na bolha
        ctx.beginPath();
        ctx.arc(drawX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.restore();
      });

      // ── 4. Ração Afundando ─────────────────────────────────
      for (let i = foodRef.current.length - 1; i >= 0; i--) {
        const pellet = foodRef.current[i];
        pellet.y += pellet.vy * (dt * 60);

        // Se chegou ao chão do aquário, fica parado um pouco e se dissolve
        if (pellet.y >= height - 35) {
          pellet.vy = 0;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, pellet.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Limita quantidade máxima de pellets
      if (foodRef.current.length > 30) {
        foodRef.current.splice(0, foodRef.current.length - 30);
      }

      // ── 5. Peixes Nadando (Comportamento & Animação) ──────
      const entities = entitiesRef.current;
      const food = foodRef.current;

      entities.forEach((fish) => {
        fish.wigglePhase += fish.wiggleSpeed;

        // Comportamento em relação a comida: se houver comida próxima, o peixe nada em direção a ela!
        let nearestFood: FoodPellet | null = null;
        let minDist = 220;

        for (const pellet of food) {
          const dx = pellet.x - fish.x;
          const dy = pellet.y - fish.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            nearestFood = pellet;
          }
        }

        if (nearestFood && fish.eatingCooldown <= 0) {
          // Atrai para a comida
          const angle = Math.atan2(nearestFood.y - fish.y, nearestFood.x - fish.x);
          const speed = isFed ? 2.6 : 2.0;
          fish.vx = Math.cos(angle) * speed;
          fish.vy = Math.sin(angle) * speed;
          fish.facing = fish.vx >= 0 ? 1 : -1;

          // Come a comida se estiver bem perto
          if (minDist < fish.size * 0.5) {
            const foodIdx = food.indexOf(nearestFood);
            if (foodIdx !== -1) {
              food.splice(foodIdx, 1);
              fish.hasHeart = true;
              fish.heartTimer = 1.4;
              fish.eatingCooldown = 1.0;
            }
          }
        } else {
          // Movimento natural de roaming: nada suavemente entre as bordas
          if (fish.eatingCooldown > 0) {
            fish.eatingCooldown -= dt;
          }

          // Inverte direção se encostar nas paredes
          const margin = fish.size * 0.7;
          if (fish.x < margin && fish.vx < 0) {
            fish.vx = Math.abs(fish.vx);
            fish.facing = 1;
          } else if (fish.x > width - margin && fish.vx > 0) {
            fish.vx = -Math.abs(fish.vx);
            fish.facing = -1;
          }

          const topBound = Math.max(25, height * 0.16);
          const bottomBound = Math.max(35, height * 0.22);
          if (fish.y < topBound && fish.vy < 0) {
            fish.vy = Math.abs(fish.vy);
          } else if (fish.y > height - bottomBound && fish.vy > 0) {
            fish.vy = -Math.abs(fish.vy);
          }

          // Pequenas variações orgânicas na velocidade vertical
          fish.vy += (Math.random() - 0.5) * 0.04;
          fish.vy = Math.max(-0.6, Math.min(0.6, fish.vy));
        }

        // Atualiza posição
        fish.x += fish.vx * (dt * 60);
        fish.y += fish.vy * (dt * 60);

        // Renderiza o peixe no canvas
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.facing, 1); // Vira o peixe para onde ele está nadando

        // Destaca se for o peixe selecionado
        const isSelected = fish.id === selectedFishId;
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(0, 0, fish.size * 0.75, 0, Math.PI * 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Brilho místico para peixes épicos e lendários
        if (fish.rarity === 'legendary' || fish.rarity === 'epic') {
          const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, fish.size * 0.9);
          glowGrad.addColorStop(0, fish.glowColor);
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(0, 0, fish.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Movimento da Cauda (Ondulação)
        const tailOffset = Math.sin(fish.wigglePhase) * (fish.size * 0.22);
        const halfSize = fish.size * 0.5;

        // Cauda
        ctx.beginPath();
        ctx.moveTo(-halfSize * 0.6, 0);
        ctx.lineTo(-halfSize * 1.25, -halfSize * 0.5 + tailOffset);
        ctx.lineTo(-halfSize * 0.95, tailOffset * 0.4);
        ctx.lineTo(-halfSize * 1.25, halfSize * 0.5 + tailOffset);
        ctx.closePath();
        ctx.fillStyle = fish.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Barbatana Dorsal (superior)
        ctx.beginPath();
        ctx.moveTo(-halfSize * 0.2, -halfSize * 0.35);
        ctx.quadraticCurveTo(0, -halfSize * 0.85, halfSize * 0.25, -halfSize * 0.3);
        ctx.fillStyle = fish.color;
        ctx.fill();

        // Corpo Principal (Forma aerodinâmica)
        ctx.beginPath();
        ctx.ellipse(0, 0, halfSize * 0.85, halfSize * 0.48, 0, 0, Math.PI * 2);
        ctx.fillStyle = fish.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Ventre / Barriga em tom mais claro
        ctx.beginPath();
        ctx.ellipse(
          0,
          halfSize * 0.16,
          halfSize * 0.65,
          halfSize * 0.25,
          0,
          0,
          Math.PI,
          false,
        );
        ctx.fillStyle = fish.bellyColor;
        ctx.fill();

        // Olho Vivo
        const eyeX = halfSize * 0.45;
        const eyeY = -halfSize * 0.12;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, Math.max(2.5, halfSize * 0.14), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + 1, eyeY, Math.max(1.2, halfSize * 0.08), 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        // Brilho no olho
        ctx.beginPath();
        ctx.arc(eyeX + 1.6, eyeY - 1, Math.max(0.6, halfSize * 0.04), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Pequena barbatana peitoral animada
        const finAngle = Math.sin(fish.wigglePhase * 1.5) * 0.35;
        ctx.save();
        ctx.translate(halfSize * 0.05, halfSize * 0.05);
        ctx.rotate(finAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, halfSize * 0.28, halfSize * 0.15, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = fish.bellyColor;
        ctx.fill();
        ctx.restore();

        ctx.restore(); // Fim do desenho do peixe

        // Etiqueta com Apelido ou Nome (sem escala invertida)
        ctx.save();
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        const displayName = fish.nickname || fish.name;

        // Fundo semitransparente para legibilidade
        const textMetrics = ctx.measureText(displayName);
        const bgW = textMetrics.width + 10;
        const tagY = fish.y - fish.size * 0.6 - 12;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(fish.x - bgW / 2, tagY - 11, bgW, 16, 6);
        ctx.fill();

        ctx.fillStyle = isSelected ? '#fbbf24' : '#f1f5f9';
        ctx.fillText(displayName, fish.x, tagY);

        // Se comeu ração recentemente, desenha coração flutuante
        if (fish.hasHeart && fish.heartTimer > 0) {
          fish.heartTimer -= dt;
          const heartY = tagY - 18 - (1.4 - fish.heartTimer) * 15;
          ctx.fillStyle = '#ec4899';
          ctx.font = '14px sans-serif';
          ctx.fillText('❤️', fish.x, heartY);
        } else {
          fish.hasHeart = false;
        }

        ctx.restore();
      });

      // ── 6. Chão Subaquático com Areia e Seixos ───────────
      const floorGrad = ctx.createLinearGradient(0, height - 32, 0, height);
      floorGrad.addColorStop(0, 'rgba(120, 113, 108, 0.7)');
      floorGrad.addColorStop(1, 'rgba(68, 64, 60, 0.95)');
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.moveTo(0, height - 26);
      ctx.quadraticCurveTo(width * 0.25, height - 34, width * 0.5, height - 26);
      ctx.quadraticCurveTo(width * 0.75, height - 18, width, height - 26);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Renderiza decorações na areia
      if (decorations && decorations.length > 0) {
        decorations.forEach((deco, idx) => {
          const decoX = 80 + idx * Math.min(140, (width - 160) / Math.max(1, decorations.length - 1));
          const decoY = height - 28;

          ctx.save();
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(deco.emoji, decoX, decoY);
          ctx.restore();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, theme, decorations, isFed, selectedFishId, onSelectFish]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-44 sm:h-64 md:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/30 bg-gradient-to-b ${theme.bgGradient} select-none cursor-pointer touch-pan-y`}
      title="Clique na água para jogar ração ou clique em um peixe para inspecionar!"
    >
      {/* Canvas da física subaquática */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block"
      />

      {/* Dica interativa flutuante discreta */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 text-[10px] sm:text-[11px] text-slate-300">
        <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
        <span>Toque p/ alimentar</span>
      </div>
    </div>
  );
};
