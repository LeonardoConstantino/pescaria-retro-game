// src/game/data/aquarium.data.ts
// ─────────────────────────────────────────────────────────────
// Dados, Tiers de Capacidade, Cenários e Decorações do Aquário
// ─────────────────────────────────────────────────────────────

export interface AquariumTankTier {
  level: number;
  id: string;
  name: string;
  capacity: number;
  cost: number;
  description: string;
  minPlayerLevel: number;
}

export interface AquariumTheme {
  id: string;
  name: string;
  cost: number;
  coinsMultiplier: number;
  description: string;
  bgGradient: string;
  waterColor: string;
  causticsOpacity: number;
  ambientParticles: string; // 'bubbles' | 'sparkles' | 'deep_glow' | 'stardust'
}

export interface AquariumDecoration {
  id: string;
  name: string;
  cost: number;
  coinsBonusPct: number; // Ex: 10 = +10%
  description: string;
  emoji: string;
  assetId?: string;
}

export interface AquariumTrophyFish {
  id: string;
  fishId: string;
  name: string;
  nickname?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weight: number;
  basePrice: number;
  assetId: string;
  addedAt: number;
}

export interface PlayerAquarium {
  level: number;
  currentThemeId: string;
  ownedThemes: string[];
  ownedDecorations: string[];
  fish: AquariumTrophyFish[];
  lastFedAt: number;
  fedHappinessExpiresAt: number;
  uncollectedCoins: number;
  lastTickAt: number;
}

// ── Níveis de Expansão do Aquário ───────────────────────────
export const AquariumTankTiers: AquariumTankTier[] = [
  {
    level: 1,
    id: 'tank_tier_1',
    name: 'Aquário de Vidro Cristal',
    capacity: 6,
    cost: 0,
    minPlayerLevel: 1,
    description: 'Aquário clássico de vidro temperado com areia fina e boa filtragem.',
  },
  {
    level: 2,
    id: 'tank_tier_2',
    name: 'Tanque Panorâmico Curvo',
    capacity: 12,
    cost: 1500,
    minPlayerLevel: 4,
    description: 'Visão ampliada com bordas curvas, iluminação suave e capacidade dobrada.',
  },
  {
    level: 3,
    id: 'tank_tier_3',
    name: 'Viveiro de Rochas Naturais',
    capacity: 20,
    cost: 5500,
    minPlayerLevel: 8,
    description: 'Rochas de rio escavadas, cascata oxigenada e habitat rico para espécies raras.',
  },
  {
    level: 4,
    id: 'tank_tier_4',
    name: 'Recife Iluminado com UV',
    capacity: 32,
    cost: 16000,
    minPlayerLevel: 12,
    description: 'Sistema profissional de filtragem biológica e leds para peixes épicos.',
  },
  {
    level: 5,
    id: 'tank_tier_5',
    name: 'Palácio Oceânico Atlantis',
    capacity: 50,
    cost: 45000,
    minPlayerLevel: 16,
    description: 'O santuário definitivo das profundezas para exibir dezenas de troféus lendários.',
  },
];

// ── Temas de Ambiente e Cenário ──────────────────────────────
export const AquariumThemes: AquariumTheme[] = [
  {
    id: 'theme_freshwater',
    name: 'Lago de Água Doce',
    cost: 0,
    coinsMultiplier: 1.0,
    description: 'Ambiente calmo e relaxante com águas esverdeadas e juncos serenos.',
    bgGradient: 'from-emerald-950/90 via-teal-950/80 to-slate-950',
    waterColor: '#0f766e',
    causticsOpacity: 0.25,
    ambientParticles: 'bubbles',
  },
  {
    id: 'theme_coral_reef',
    name: 'Recife Tropical do Caribe',
    cost: 2000,
    coinsMultiplier: 1.15,
    description: 'Águas azul-turquesa radiantes com corais luminosos que atraem muitos visitantes.',
    bgGradient: 'from-cyan-950/90 via-sky-950/80 to-blue-950',
    waterColor: '#0284c7',
    causticsOpacity: 0.35,
    ambientParticles: 'bubbles',
  },
  {
    id: 'theme_deep_abyss',
    name: 'Fossa das Marianas Profunda',
    cost: 7500,
    coinsMultiplier: 1.3,
    description: 'Águas escuras misteriosas com reflexos bioluminescentes das profundezas.',
    bgGradient: 'from-indigo-950/95 via-slate-950 to-neutral-950',
    waterColor: '#1e1b4b',
    causticsOpacity: 0.15,
    ambientParticles: 'deep_glow',
  },
  {
    id: 'theme_cosmic_space',
    name: 'Nebulosa Celestial Aquática',
    cost: 22000,
    coinsMultiplier: 1.5,
    description: 'Águas mágicas impregnadas de poeira estelar onde os peixes nadam entre constelações.',
    bgGradient: 'from-purple-950/95 via-fuchsia-950/80 to-slate-950',
    waterColor: '#581c87',
    causticsOpacity: 0.4,
    ambientParticles: 'stardust',
  },
];

// ── Decorações Interativas com Bônus ─────────────────────────
export const AquariumDecorations: AquariumDecoration[] = [
  {
    id: 'deco_castle',
    name: 'Castelo do Rei Tritão',
    cost: 800,
    coinsBonusPct: 8,
    description: 'Miniatura esculpida em resina coralina que encanta os visitantes do aquário.',
    emoji: '🏰',
  },
  {
    id: 'deco_treasure',
    name: 'Baú de Ouro Borbulhante',
    cost: 1600,
    coinsBonusPct: 12,
    description: 'Um baú de dobrões que abre periodicamente soltando jatos de bolhas.',
    emoji: '👑',
  },
  {
    id: 'deco_shipwreck',
    name: 'Naufrágio Pirata Espectral',
    cost: 4200,
    coinsBonusPct: 18,
    description: 'O lendário mastro de um galeão espanhol perdido nas profundezas.',
    emoji: '⛵',
  },
  {
    id: 'deco_neon_flora',
    name: 'Floresta de Anêmonas Neon',
    cost: 9500,
    coinsBonusPct: 25,
    description: 'Vegetação exótica bioluminescente que quadruplica o encanto dos troféus.',
    emoji: '🪸',
  },
  {
    id: 'deco_volcano',
    name: 'Mini Vulcão Submarino',
    cost: 18000,
    coinsBonusPct: 35,
    description: 'Chaminé hidrotermal ativa que emite calor suave e bolhas vulcânicas vibrantes.',
    emoji: '🌋',
  },
];
