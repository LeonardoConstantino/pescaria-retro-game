// src/game/data/talents.data.ts
// ─────────────────────────────────────────────────────────────
// Definições da Árvore de Talentos / Maestria do Pescador
// (Mastery Skill Tree) dividida em 3 ramos especializados.
// ─────────────────────────────────────────────────────────────

export type TalentBranchId = 'angler' | 'tycoon' | 'mystic';

export interface TalentBranch {
  id: TalentBranchId;
  name: string;
  tagline: string;
  description: string;
  colorTheme: {
    accent: string;
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
  };
}

export interface TalentDefinition {
  id: string;
  branch: TalentBranchId;
  tier: 1 | 2 | 3 | 4; // 1 = Básico, 2 = Intermediário (req 3pts no ramo), 3 = Avançado (req 6pts), 4 = Keystone Mestre (req 8pts)
  name: string;
  icon: string;
  maxRank: number;
  requiredBranchPoints: number;
  prerequisiteTalentId?: string;
  description: string;
  effectDescription: (rank: number) => string;
  valuesByRank: number[];
}

export const TALENT_BRANCHES: TalentBranch[] = [
  {
    id: 'angler',
    name: 'Pescador de Elite',
    tagline: 'Foco na Vara & Arremesso Ativo',
    description: 'Aperfeiçoa a pescaria manual com reações rápidas, peixes maiores, espécies raras e linhas duplas.',
    colorTheme: {
      accent: '#38bdf8', // sky-400
      border: 'border-sky-500/40',
      bg: 'from-sky-950/70 via-slate-900 to-slate-950',
      text: 'text-sky-300',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
  },
  {
    id: 'tycoon',
    name: 'Magnata dos Mares',
    tagline: 'Comércio, Iscas & Economia',
    description: 'Maximize o lucro por peixe vendido, economize iscas, amplie gorjetas do aquário e ganhe descontos.',
    colorTheme: {
      accent: '#fbbf24', // amber-400
      border: 'border-amber-500/40',
      bg: 'from-amber-950/70 via-slate-900 to-slate-950',
      text: 'text-amber-300',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
  },
  {
    id: 'mystic',
    name: 'Oceonógrafo Místico',
    tagline: 'XP, Marés, Clima & Ajudantes',
    description: 'Sintonize-se com os ritmos naturais do oceano, turbine ganho de XP, impulsione ajudantes e domine o clima.',
    colorTheme: {
      accent: '#a855f7', // purple-500
      border: 'border-purple-500/40',
      bg: 'from-purple-950/70 via-slate-900 to-slate-950',
      text: 'text-purple-300',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  },
];

export const TALENTS_DATA: TalentDefinition[] = [
  // ─────────────────────────────────────────────
  // RAMO 1: PESCADOR DE ELITE (ANGLER)
  // ─────────────────────────────────────────────
  {
    id: 'talent_reflexes',
    branch: 'angler',
    tier: 1,
    name: 'Reflexos Rápidos',
    icon: 'Zap',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Agilidade aguçada para fisgar os peixes no instante em que tocam na isca.',
    valuesByRank: [0.12, 0.24, 0.36],
    effectDescription: (rank) =>
      `Reduz o tempo de espera até o peixe morder a isca em -${Math.round((TALENTS_DATA.find(t => t.id === 'talent_reflexes')?.valuesByRank[rank - 1] || 0.12) * 100)}%.`,
  },
  {
    id: 'talent_hooking',
    branch: 'angler',
    tier: 1,
    name: 'Fisgada Perfeita',
    icon: 'Anchor',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Técnica impecável que atrai e puxa exemplares mais robustos e pesados.',
    valuesByRank: [0.08, 0.16, 0.25],
    effectDescription: (rank) =>
      `Aumenta o peso de todos os peixes capturados em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_hooking')?.valuesByRank[rank - 1] || 0.08) * 100)}% (mais valor e troféus).`,
  },
  {
    id: 'talent_eagle_eyes',
    branch: 'angler',
    tier: 2,
    name: 'Olhos de Lince',
    icon: 'Eye',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Visão atenta através das águas para identificar as sombras das espécies mais valiosas.',
    valuesByRank: [0.15, 0.30, 0.45],
    effectDescription: (rank) =>
      `Aumenta a chance de fisgar peixes Raros, Épicos e Lendários em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_eagle_eyes')?.valuesByRank[rank - 1] || 0.15) * 100)}%.`,
  },
  {
    id: 'talent_fast_reel',
    branch: 'angler',
    tier: 2,
    name: 'Descanso Ágil',
    icon: 'Timer',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Recuperação muscular imediata após puxar a linha para arremessar novamente.',
    valuesByRank: [0.15, 0.30, 0.45],
    effectDescription: (rank) =>
      `Reduz o intervalo de recarga (cooldown) entre arremessos da vara em -${Math.round((TALENTS_DATA.find(t => t.id === 'talent_fast_reel')?.valuesByRank[rank - 1] || 0.15) * 100)}%.`,
  },
  {
    id: 'talent_monster_hunter',
    branch: 'angler',
    tier: 3,
    name: 'Caçador de Titãs',
    icon: 'Shield',
    maxRank: 2,
    requiredBranchPoints: 6,
    description: 'Firmeza absoluta no carretel ao duelar contra os maiores monstros aquáticos.',
    valuesByRank: [0.25, 0.50],
    effectDescription: (rank) =>
      `Aumenta a taxa de captura de Lendários em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_monster_hunter')?.valuesByRank[rank - 1] || 0.25) * 100)}% e estende a tolerância da linha contra rompimentos.`,
  },
  {
    id: 'talent_twin_lines',
    branch: 'angler',
    tier: 4, // Keystone
    name: 'Linha Dupla Mestre',
    icon: 'Sparkles',
    maxRank: 1,
    requiredBranchPoints: 8,
    description: 'Montagem secreta com anzóis geminados que duplica o troféu no mesmo arremesso!',
    valuesByRank: [0.25],
    effectDescription: () =>
      'Toda captura bem-sucedida tem 25% de chance de fisgar um segundo peixe bônus idêntico!',
  },

  // ─────────────────────────────────────────────
  // RAMO 2: MAGNATA DOS MARES (TYCOON)
  // ─────────────────────────────────────────────
  {
    id: 'talent_bargaining',
    branch: 'tycoon',
    tier: 1,
    name: 'Barganha Portuária',
    icon: 'Coins',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Habilidade de negociação com peixarias e restaurantes portuários.',
    valuesByRank: [0.12, 0.25, 0.40],
    effectDescription: (rank) =>
      `Aumenta o preço de venda de todos os peixes no cesto em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_bargaining')?.valuesByRank[rank - 1] || 0.12) * 100)}%.`,
  },
  {
    id: 'talent_bait_saver',
    branch: 'tycoon',
    tier: 1,
    name: 'Conservação de Iscas',
    icon: 'PackageCheck',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Fixação cuidadosa das iscas no anzol para resistir às bicadas sem se soltarem.',
    valuesByRank: [0.20, 0.40, 0.60],
    effectDescription: (rank) =>
      `${Math.round((TALENTS_DATA.find(t => t.id === 'talent_bait_saver')?.valuesByRank[rank - 1] || 0.20) * 100)}% de chance de NÃO consumir a isca equipada ao lançar a linha.`,
  },
  {
    id: 'talent_luxury_tips',
    branch: 'tycoon',
    tier: 2,
    name: 'Gorjetas de Ouro',
    icon: 'DollarSign',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Hospitalidade e ambientação refinada que encantam os visitantes do seu Aquário.',
    valuesByRank: [0.25, 0.55, 0.90],
    effectDescription: (rank) =>
      `Aumenta as gorjetas e renda passiva de visitantes do seu Aquário em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_luxury_tips')?.valuesByRank[rank - 1] || 0.25) * 100)}%.`,
  },
  {
    id: 'talent_market_sense',
    branch: 'tycoon',
    tier: 2,
    name: 'Faro Comercial',
    icon: 'TrendingUp',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Reconhecimento instantâneo de oportunidades e achados valiosos na água.',
    valuesByRank: [15, 35, 65],
    effectDescription: (rank) =>
      `Concede um bônus imediato de +${TALENTS_DATA.find(t => t.id === 'talent_market_sense')?.valuesByRank[rank - 1] || 15} 🪙 moedas sempre que qualquer peixe for recolhido.`,
  },
  {
    id: 'talent_merchant_discount',
    branch: 'tycoon',
    tier: 3,
    name: 'Contatos Portuários',
    icon: 'Tag',
    maxRank: 2,
    requiredBranchPoints: 6,
    description: 'Amizade de longa data com os armadores e fornecedores locais de material de pesca.',
    valuesByRank: [0.15, 0.25],
    effectDescription: (rank) =>
      `Reduz o custo em moedas de todas as varas e iscas na Loja de Equipamentos em -${Math.round((TALENTS_DATA.find(t => t.id === 'talent_merchant_discount')?.valuesByRank[rank - 1] || 0.15) * 100)}%.`,
  },
  {
    id: 'talent_golden_monopoly',
    branch: 'tycoon',
    tier: 4, // Keystone
    name: 'Monopólio dos Mares',
    icon: 'Crown',
    maxRank: 1,
    requiredBranchPoints: 8,
    description: 'Sua marca controla os leilões marítimos mais prestigiados da região!',
    valuesByRank: [1.0],
    effectDescription: () =>
      'Peixes Troféus (peso acima da média) valem +100% no momento da venda!',
  },

  // ─────────────────────────────────────────────
  // RAMO 3: OCEONÓGRAFO MÍSTICO (MYSTIC)
  // ─────────────────────────────────────────────
  {
    id: 'talent_wisdom',
    branch: 'mystic',
    tier: 1,
    name: 'Sabedoria Ancestral',
    icon: 'GraduationCap',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Estudo metódico dos hábitos aquáticos que transforma cada captura em aprendizado.',
    valuesByRank: [0.20, 0.40, 0.65],
    effectDescription: (rank) =>
      `Aumenta todo o XP recebido nas pescarias em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_wisdom')?.valuesByRank[rank - 1] || 0.20) * 100)}% (suba de nível mais rápido).`,
  },
  {
    id: 'talent_water_resonance',
    branch: 'mystic',
    tier: 1,
    name: 'Ressonância Aquática',
    icon: 'Droplets',
    maxRank: 3,
    requiredBranchPoints: 0,
    description: 'Sintonia mística com a superfície da água ao tocar o lago.',
    valuesByRank: [0.50, 1.00, 1.80],
    effectDescription: (rank) =>
      `Aumenta as moedas obtidas por clique manual na água em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_water_resonance')?.valuesByRank[rank - 1] || 0.50) * 100)}%.`,
  },
  {
    id: 'talent_crew_inspiration',
    branch: 'mystic',
    tier: 2,
    name: 'Estímulo da Tripulação',
    icon: 'Users',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Liderança inspiradora que motiva seus ajudantes automatizados a produzir com maestria.',
    valuesByRank: [0.15, 0.30, 0.50],
    effectDescription: (rank) =>
      `Aumenta o ganho passivo contínuo de todos os Ajudantes Automáticos (CPS) em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_crew_inspiration')?.valuesByRank[rank - 1] || 0.15) * 100)}%.`,
  },
  {
    id: 'talent_weather_attunement',
    branch: 'mystic',
    tier: 2,
    name: 'Sintonia com as Marés',
    icon: 'CloudRain',
    maxRank: 3,
    requiredBranchPoints: 3,
    description: 'Compreensão profunda das mudanças de vento, chuva, sol e tempestades.',
    valuesByRank: [0.20, 0.45, 0.70],
    effectDescription: (rank) =>
      `Amplifica em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_weather_attunement')?.valuesByRank[rank - 1] || 0.20) * 100)}% os bônus positivos do clima atual no lago.`,
  },
  {
    id: 'talent_event_magnet',
    branch: 'mystic',
    tier: 3,
    name: 'Sussurro das Profundezas',
    icon: 'Radio',
    maxRank: 2,
    requiredBranchPoints: 6,
    description: 'Atração inexplicável por segredos submersos, baús misteriosos e encontros cósmicos.',
    valuesByRank: [0.35, 0.70],
    effectDescription: (rank) =>
      `Aumenta a chance de sortear Eventos Especiais e Encontros Positivos na linha em +${Math.round((TALENTS_DATA.find(t => t.id === 'talent_event_magnet')?.valuesByRank[rank - 1] || 0.35) * 100)}%.`,
  },
  {
    id: 'talent_poseidon_blessing',
    branch: 'mystic',
    tier: 4, // Keystone
    name: 'Bênção de Netuno',
    icon: 'Sparkle',
    maxRank: 1,
    requiredBranchPoints: 8,
    description: 'O deus dos oceanos protege sua linha de pesca contra infortúnios e perdas.',
    valuesByRank: [1.0],
    effectDescription: () =>
      'Eventos negativos NUNCA fazem você perder o peixe, e peixes dourados surgem com o dobro de frequência!',
  },
];
