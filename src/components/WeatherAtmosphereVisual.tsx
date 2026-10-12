// src/components/WeatherAtmosphereVisual.tsx
// ─────────────────────────────────────────────────────────────
// Sistema de Efeitos Visuais de Clima no Cenário (Weather Atmosphere)
// Renderização fluida via Canvas 2D integrada à perspectiva do lago:
// - Chuva suave com micro-ondulações dinâmicas e respingos na água.
// - Tempestade elétrica com chuva torrencial, relâmpagos procedurais e trovões.
// - Lua cheia mística com reflexo prateado na água, estrelas e orbes etéreos.
// - Dia ensolarado com feixes de luz volumétricos e cintilações na água.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { WeatherInfo, WeatherType } from '../game/data/weather.data.js';
import { sound } from '../utils/audio.js';

interface WeatherAtmosphereVisualProps {
  weather?: WeatherInfo;
}

// Interfaces para os sistemas de partículas
interface RainDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  thickness: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

interface WaterSplash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  blinkSpeed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface MysticWisp {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  size: number;
  hue: number;
  pulsePhase: number;
  speed: number;
}

interface SunGlint {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

interface LightningBranch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}

export const WeatherAtmosphereVisual: React.FC<WeatherAtmosphereVisualProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const weatherTypeRef = useRef<WeatherType>(weather?.id || 'sunny');

  useEffect(() => {
    weatherTypeRef.current = weather?.id || 'sunny';
  }, [weather?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let waterLineY = 0;

    // Listas de partículas e entidades
    const rainDrops: RainDrop[] = [];
    const ripples: WaterRipple[] = [];
    const splashes: WaterSplash[] = [];
    const stars: Star[] = [];
    const wisps: MysticWisp[] = [];
    const glints: SunGlint[] = [];

    // Estado do relâmpago
    let lightningFlashAlpha = 0;
    let lightningBranches: LightningBranch[] = [];
    let nextLightningTime = Date.now() + 4000 + Math.random() * 5000;

    // Estado da estrela cadente
    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      alpha: 0,
      active: false,
    };
    let nextShootingStarTime = Date.now() + 6000 + Math.random() * 8000;

    // Inicialização e redimensionamento responsivo
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      // Suporte a telas de alta densidade (Retina) limitado a 2x para fluidez
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // A linha d'água no card do cenário fica situada a cerca de 46% da altura total
      waterLineY = Math.floor(height * 0.46);

      // Reinicializa estrelas estáticas para a noite
      stars.length = 0;
      const starCount = Math.floor(width / 16);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (waterLineY - 10),
          size: 0.8 + Math.random() * 1.5,
          baseAlpha: 0.25 + Math.random() * 0.5,
          blinkSpeed: 1.5 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Reinicializa orbes arcanos para a lua mística
      wisps.length = 0;
      const wispCount = 10;
      for (let i = 0; i < wispCount; i++) {
        const yBase = waterLineY + 15 + Math.random() * (height - waterLineY - 30);
        wisps.push({
          x: Math.random() * width,
          y: yBase,
          baseY: yBase,
          vx: (Math.random() - 0.5) * 0.6,
          size: 2.5 + Math.random() * 2.5,
          hue: Math.random() > 0.5 ? 260 : 190, // Violeta ou Ciano
          pulsePhase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 1.2,
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);
    handleResize();

    // Gerador de relâmpago procedural ramificado
    const triggerLightning = () => {
      lightningFlashAlpha = 0.58;
      lightningBranches = [];

      const startX = width * 0.2 + Math.random() * (width * 0.6);
      let curX = startX;
      let curY = 0;
      const targetY = waterLineY - 10;

      const segments = 12;
      const dy = targetY / segments;

      for (let i = 0; i < segments; i++) {
        const nextX = curX + (Math.random() - 0.5) * 36;
        const nextY = curY + dy;
        lightningBranches.push({
          x1: curX,
          y1: curY,
          x2: nextX,
          y2: nextY,
          width: Math.max(1, 3.2 - (i / segments) * 2),
        });

        // Chance de ramificação secundária
        if (Math.random() < 0.45 && i > 2 && i < segments - 2) {
          const branchDir = Math.random() > 0.5 ? 1 : -1;
          let bX = curX;
          let bY = curY;
          for (let j = 0; j < 3; j++) {
            const nbX = bX + branchDir * (12 + Math.random() * 16);
            const nbY = bY + dy * 0.7;
            lightningBranches.push({
              x1: bX,
              y1: bY,
              x2: nbX,
              y2: nbY,
              width: 1.2,
            });
            bX = nbX;
            bY = nbY;
          }
        }

        curX = nextX;
        curY = nextY;
      }

      // Toca áudio procedural do trovão distante
      sound.playThunder();
    };

    let lastTime = performance.now();

    // Loop de Animação Contínuo
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Se a aba do navegador estiver em segundo plano, economiza 100% de processamento
      if (document.hidden) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const currentWeather = weatherTypeRef.current;
      const now = Date.now();

      // ─────────────────────────────────────────────────────────
      // 1. CLIMA: NOITE DE LUA MÍSTICA (MYSTIC_MOON)
      // ─────────────────────────────────────────────────────────
      if (currentWeather === 'mystic_moon') {
        const moonX = width * 0.78;
        const moonY = Math.max(38, height * 0.22);
        const moonRadius = Math.min(26, width * 0.05);

        // Estrelas cintilantes no céu
        stars.forEach((star) => {
          const alpha =
            star.baseAlpha + Math.sin((time * 0.002 * star.blinkSpeed) + star.phase) * 0.25;
          ctx.fillStyle = `rgba(224, 231, 255, ${Math.max(0.08, Math.min(0.9, alpha))})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Estrela Cadente Ocasional
        if (!shootingStar.active && now > nextShootingStarTime) {
          shootingStar.active = true;
          shootingStar.x = width * (0.2 + Math.random() * 0.5);
          shootingStar.y = 10 + Math.random() * (waterLineY * 0.4);
          shootingStar.length = 35 + Math.random() * 45;
          shootingStar.speed = 450 + Math.random() * 250;
          shootingStar.angle = Math.PI * 0.22 + (Math.random() - 0.5) * 0.1;
          shootingStar.alpha = 1;
        }

        if (shootingStar.active) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed * dt;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed * dt;
          shootingStar.alpha -= dt * 1.6;

          if (shootingStar.alpha <= 0 || shootingStar.y >= waterLineY) {
            shootingStar.active = false;
            nextShootingStarTime = now + 7000 + Math.random() * 10000;
          } else {
            const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
            const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
            const grad = ctx.createLinearGradient(
              tailX,
              tailY,
              shootingStar.x,
              shootingStar.y
            );
            grad.addColorStop(0, 'rgba(192, 132, 252, 0)');
            grad.addColorStop(0.7, 'rgba(224, 231, 255, 0.6)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.alpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(shootingStar.x, shootingStar.y);
            ctx.stroke();
          }
        }

        // Halo etéreo da Lua Cheia
        const haloGrad = ctx.createRadialGradient(
          moonX,
          moonY,
          moonRadius * 0.5,
          moonX,
          moonY,
          moonRadius * 4.5
        );
        haloGrad.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
        haloGrad.addColorStop(0.35, 'rgba(129, 140, 248, 0.18)');
        haloGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.06)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // O Disco da Lua Cheia
        const moonGrad = ctx.createRadialGradient(
          moonX - moonRadius * 0.3,
          moonY - moonRadius * 0.3,
          moonRadius * 0.2,
          moonX,
          moonY,
          moonRadius
        );
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.7, '#e0e7ff');
        moonGrad.addColorStop(1, '#c7d2fe');

        ctx.fillStyle = moonGrad;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.8)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Limpa sombra

        // Crateras sutis da lua
        ctx.fillStyle = 'rgba(165, 180, 252, 0.25)';
        ctx.beginPath();
        ctx.arc(moonX - moonRadius * 0.2, moonY + moonRadius * 0.1, moonRadius * 0.22, 0, Math.PI * 2);
        ctx.arc(moonX + moonRadius * 0.25, moonY - moonRadius * 0.2, moonRadius * 0.16, 0, Math.PI * 2);
        ctx.arc(moonX + moonRadius * 0.1, moonY + moonRadius * 0.35, moonRadius * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Trilha de Reflexo Prateado na Água (Moonlight Water Path)
        // Linhas de reflexo que ondulam verticalmente sob a lua na água
        const waterHeight = height - waterLineY;
        const trailSteps = 16;
        const stepH = waterHeight / trailSteps;

        for (let i = 1; i < trailSteps; i++) {
          const cy = waterLineY + i * stepH;
          const progress = i / trailSteps;
          const waveShift = Math.sin(time * 0.0025 + i * 0.6) * (6 + progress * 14);
          const segWidth = (16 + progress * 60) * (0.8 + Math.sin(time * 0.003 + i) * 0.2);
          const alpha = (1 - progress * 0.7) * (0.2 + Math.sin(time * 0.002 + i * 0.5) * 0.1);

          ctx.strokeStyle = `rgba(224, 231, 255, ${Math.max(0.05, alpha)})`;
          ctx.lineWidth = 1.6 + (1 - progress) * 1.2;
          ctx.beginPath();
          ctx.moveTo(moonX + waveShift - segWidth * 0.5, cy);
          ctx.lineTo(moonX + waveShift + segWidth * 0.5, cy);
          ctx.stroke();
        }

        // Orbes Místicos Flutuantes sobre a Água (Will-o'-wisps)
        wisps.forEach((wisp) => {
          wisp.x += wisp.vx;
          if (wisp.x < -20) wisp.x = width + 20;
          if (wisp.x > width + 20) wisp.x = -20;

          wisp.y =
            wisp.baseY +
            Math.sin(time * 0.0015 * wisp.speed + wisp.pulsePhase) * 10;
          const pulse =
            0.5 + Math.sin(time * 0.003 + wisp.pulsePhase) * 0.45;

          const grad = ctx.createRadialGradient(
            wisp.x,
            wisp.y,
            0,
            wisp.x,
            wisp.y,
            wisp.size * 3.5
          );
          grad.addColorStop(
            0,
            `hsla(${wisp.hue}, 90%, 75%, ${0.7 * pulse})`
          );
          grad.addColorStop(
            0.5,
            `hsla(${wisp.hue}, 85%, 65%, ${0.25 * pulse})`
          );
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(wisp.x, wisp.y, wisp.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Núcleo brilhante
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(wisp.x, wisp.y, wisp.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ─────────────────────────────────────────────────────────
      // 2. CLIMA: CHUVA SUAVE (RAINY) OU TEMPESTADE (STORM)
      // ─────────────────────────────────────────────────────────
      if (currentWeather === 'rainy' || currentWeather === 'storm') {
        const isStorm = currentWeather === 'storm';
        const maxDrops = isStorm ? 130 : 65;
        const windX = isStorm ? -6.5 : -1.8;
        const fallSpeed = isStorm ? 580 : 380;

        // Disparo e decaimento de relâmpago na tempestade
        if (isStorm) {
          if (now > nextLightningTime) {
            triggerLightning();
            nextLightningTime = now + 4500 + Math.random() * 6000;
          }

          if (lightningFlashAlpha > 0) {
            // Flash no céu e horizonte
            ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlashAlpha * 0.75})`;
            ctx.fillRect(0, 0, width, height);

            // Desenha as ramificações do relâmpago
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#a5b4fc';
            ctx.shadowBlur = 10;
            ctx.lineCap = 'round';

            lightningBranches.forEach((b) => {
              ctx.lineWidth = b.width;
              ctx.beginPath();
              ctx.moveTo(b.x1, b.y1);
              ctx.lineTo(b.x2, b.y2);
              ctx.stroke();
            });

            ctx.shadowBlur = 0;
            lightningFlashAlpha -= dt * 2.8;
            if (lightningFlashAlpha < 0) {
              lightningFlashAlpha = 0;
              lightningBranches = [];
            }
          }
        }

        // Spawn de novas gotas de chuva
        while (rainDrops.length < maxDrops) {
          rainDrops.push({
            x: Math.random() * (width + 120),
            y: -20 - Math.random() * 60,
            vx: windX + (Math.random() - 0.5) * 0.8,
            vy: fallSpeed + (Math.random() - 0.5) * 80,
            length: isStorm ? 16 + Math.random() * 10 : 10 + Math.random() * 7,
            alpha: isStorm ? 0.4 + Math.random() * 0.35 : 0.25 + Math.random() * 0.3,
            thickness: isStorm ? 1.4 : 1.0,
          });
        }

        // Atualização e renderização das gotas de chuva
        ctx.strokeStyle = isStorm ? 'rgba(219, 234, 254, 0.75)' : 'rgba(186, 230, 253, 0.65)';
        ctx.lineCap = 'round';

        for (let i = rainDrops.length - 1; i >= 0; i--) {
          const drop = rainDrops[i];
          drop.x += drop.vx * dt * 60;
          drop.y += drop.vy * dt;

          // Se a gota atingir ou passar da linha d'água
          if (drop.y >= waterLineY + Math.random() * (height - waterLineY)) {
            // Cria micro-ondulação na superfície da água
            const rippleX = drop.x;
            const rippleY = Math.min(height - 8, Math.max(waterLineY + 6, drop.y));

            ripples.push({
              x: rippleX,
              y: rippleY,
              radius: 1.5,
              maxRadius: isStorm ? 14 + Math.random() * 10 : 8 + Math.random() * 7,
              alpha: isStorm ? 0.65 : 0.45,
              speed: isStorm ? 24 : 16,
              color: isStorm ? 'rgba(199, 210, 254,' : 'rgba(186, 230, 253,',
            });

            // Cria pequenos respingos pontuais
            if (Math.random() < (isStorm ? 0.4 : 0.2)) {
              for (let s = 0; s < (isStorm ? 2 : 1); s++) {
                splashes.push({
                  x: rippleX,
                  y: rippleY,
                  vx: (Math.random() - 0.5) * 45,
                  vy: -(40 + Math.random() * 50),
                  alpha: 0.7,
                  size: 1.2 + Math.random() * 1.2,
                });
              }
            }

            // Remove a gota e recicla
            rainDrops.splice(i, 1);
            continue;
          }

          // Se saiu pelas bordas da tela
          if (drop.x < -50 || drop.y > height) {
            rainDrops.splice(i, 1);
            continue;
          }

          // Traço da gota com rastro de velocidade
          ctx.lineWidth = drop.thickness;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(
            drop.x + (drop.vx / 10) * drop.length,
            drop.y + drop.length
          );
          ctx.stroke();
        }

        // Atualização e renderização das micro-ondulações (Ripples elípticos)
        for (let r = ripples.length - 1; r >= 0; r--) {
          const rip = ripples[r];
          rip.radius += rip.speed * dt;
          rip.alpha -= dt * (isStorm ? 1.1 : 0.85);

          if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
            ripples.splice(r, 1);
            continue;
          }

          ctx.strokeStyle = `${rip.color} ${Math.max(0, rip.alpha)})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          // Elipse achatada horizontalmente para dar perspectiva realista à água
          ctx.ellipse(
            rip.x,
            rip.y,
            rip.radius,
            rip.radius * 0.32,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // Atualização e renderização dos respingos pontuais (Splashes)
        for (let s = splashes.length - 1; s >= 0; s--) {
          const sp = splashes[s];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vy += 220 * dt; // Gravidade
          sp.alpha -= dt * 2.2;

          if (sp.alpha <= 0 || sp.y > height) {
            splashes.splice(s, 1);
            continue;
          }

          ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0, sp.alpha)})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Névoa suave na linha d'água durante a chuva
        const mistGrad = ctx.createLinearGradient(
          0,
          waterLineY - 15,
          0,
          waterLineY + 25
        );
        mistGrad.addColorStop(0, 'rgba(148, 163, 184, 0)');
        mistGrad.addColorStop(
          0.5,
          isStorm ? 'rgba(99, 102, 241, 0.12)' : 'rgba(186, 230, 253, 0.09)'
        );
        mistGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, waterLineY - 15, width, 40);
      }

      // ─────────────────────────────────────────────────────────
      // 3. CLIMA: DIA ENSOLARADO (SUNNY)
      // ─────────────────────────────────────────────────────────
      if (currentWeather === 'sunny') {
        const sunX = width * 0.84;
        const sunY = Math.max(34, height * 0.16);
        const sunRadius = Math.min(22, width * 0.045);

        // Feixes de luz solar volumétricos (God Rays) descendo até a água
        const rayCount = 4;
        for (let r = 0; r < rayCount; r++) {
          const rayAngle = Math.PI * 0.65 + r * 0.12 + Math.sin(time * 0.001 + r) * 0.03;
          const rayLength = height * 0.85;
          const raySpread = 28 + r * 12;

          const p1X = sunX;
          const p1Y = sunY;
          const p2X = sunX + Math.cos(rayAngle - 0.08) * rayLength - raySpread;
          const p2Y = sunY + Math.sin(rayAngle) * rayLength;
          const p3X = sunX + Math.cos(rayAngle + 0.08) * rayLength + raySpread;
          const p3Y = p2Y;

          const rayGrad = ctx.createLinearGradient(sunX, sunY, p2X, p2Y);
          const rayPulse = 0.05 + Math.sin(time * 0.0015 + r * 1.5) * 0.025;
          rayGrad.addColorStop(0, `rgba(254, 240, 138, ${rayPulse * 2.2})`);
          rayGrad.addColorStop(0.5, `rgba(253, 224, 71, ${rayPulse})`);
          rayGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(p1X, p1Y);
          ctx.lineTo(p2X, p2Y);
          ctx.lineTo(p3X, p3Y);
          ctx.closePath();
          ctx.fill();
        }

        // Auréola Solar Brilhante
        const sunHalo = ctx.createRadialGradient(
          sunX,
          sunY,
          sunRadius * 0.5,
          sunX,
          sunY,
          sunRadius * 4.0
        );
        sunHalo.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
        sunHalo.addColorStop(0.4, 'rgba(251, 191, 36, 0.15)');
        sunHalo.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.fillStyle = sunHalo;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 4.0, 0, Math.PI * 2);
        ctx.fill();

        // O Disco Solar
        const sunGrad = ctx.createRadialGradient(
          sunX - sunRadius * 0.2,
          sunY - sunRadius * 0.2,
          sunRadius * 0.2,
          sunX,
          sunY,
          sunRadius
        );
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.6, '#fef08a');
        sunGrad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = sunGrad;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sparkles / Glints na água sob a luz do sol
        if (glints.length < 24 && Math.random() < 0.25) {
          glints.push({
            x: width * 0.15 + Math.random() * (width * 0.75),
            y: waterLineY + 12 + Math.random() * (height - waterLineY - 24),
            size: 2.0 + Math.random() * 2.5,
            life: 0,
            maxLife: 1.2 + Math.random() * 1.5,
            alpha: 0,
          });
        }

        for (let g = glints.length - 1; g >= 0; g--) {
          const gl = glints[g];
          gl.life += dt;
          if (gl.life >= gl.maxLife) {
            glints.splice(g, 1);
            continue;
          }

          const progress = gl.life / gl.maxLife;
          // Curva de brilho suave (acende e apaga)
          const glAlpha = Math.sin(progress * Math.PI) * 0.75;

          // Estrela de 4 pontas cintilante
          ctx.fillStyle = `rgba(255, 255, 255, ${glAlpha})`;
          ctx.strokeStyle = `rgba(254, 240, 138, ${glAlpha * 0.6})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(gl.x - gl.size, gl.y);
          ctx.lineTo(gl.x + gl.size, gl.y);
          ctx.moveTo(gl.x, gl.y - gl.size * 0.6);
          ctx.lineTo(gl.x, gl.y + gl.size * 0.6);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(gl.x, gl.y, gl.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      id="weather-atmosphere-visual"
      className="absolute inset-0 pointer-events-none z-[4] overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
