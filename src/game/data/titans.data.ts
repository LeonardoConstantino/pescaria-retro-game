// src/game/data/titans.data.ts
// ─────────────────────────────────────────────────────────────
// DIRETIVA DE ARTE: "O DESPERTAR DOS TITÃS" — MITOLOGIA NATURAL
// Fantasia: "Eu não estou lutando contra um chefe.
// Eu fisguei uma criatura que não deveria ter sido fisgada."
// Regra: 80% peixe real + 20% impossível.
// ─────────────────────────────────────────────────────────────

export interface TitanRelic {
  id: string;
  assetId: string;
  titanId: string;
  name: string;
  rarity: 'ancestral_relic';
  emoji: string;
  description: string;
  lore: string;
  passiveBonus: {
    type: 'gold_mult' | 'xp_mult' | 'legendary_chance' | 'rare_fish_speed';
    value: number; // Ex: 0.20 = +20%
    label: string;
  };
}

export interface TitanPhaseAssets {
  phase1: string; // Fase 1: Profundezas / Sombra / Silhueta oculta (75m - 45m)
  phase2: string; // Fase 2: Meia-água / Resistência / Vulto emergente (45m - 18m)
  phase3: string; // Fase 3: Ascensão à Superfície / Titã revelado (< 18m)
}

export interface TitanData {
  id: string;
  assetId: string;
  phaseAssets: TitanPhaseAssets;
  locationId: string;
  name: string;
  title: string;
  latinName: string;
  speciesBase: string; // Ex: "Siluriforme Primordial (Bagre Gigante Antigo)"
  estimatedAge: string; // Ex: "~340 anos"
  weightKg: number;
  lengthMeters: number;
  environmentTease: {
    ambientHush: string; // O ambiente anuncia antes da UI: silêncio dos animais
    waterSign: string; // Sinais na água: bolhas de metano, lodo subindo
    reelBiteFeel: string; // A sensação na linha
  };
  visualCharacteristics: {
    primaryColor: string;
    secondaryColor: string;
    bellyColor: string;
    accentGlow: string;
    naturalElements: string[]; // Ex: ["Musgo e algas de turfa incrustados", "Placas ósseas desgastadas", "Barbilhões espessos como cipós"]
  };
  relic: TitanRelic;
  baseTrophyPrice: number;
  baseXpReward: number;
}

// Catálogo dos 5 Titãs dos Biomas
export const TITANS_DATA: Record<string, TitanData> = {
  // ── VERTICAL SLICE MASTER: PÂNTANO SOMBRIO ────────────────
  titan_swamp_catfish: {
    id: 'titan_swamp_catfish',
    assetId: 'titan_swamp_catfish',
    phaseAssets: {
      phase1: 'titan_swamp_catfish_phase1', // Fase 1: Silhueta oculta nas profundezas do lodo (75m - 45m)
      phase2: 'titan_swamp_catfish_phase2', // Fase 2: Vulto colossal emergindo entre raízes e musgo (45m - 18m)
      phase3: 'titan_swamp_catfish_phase3', // Fase 3: Ascensão à Superfície - O Titã em sua magnitude (< 18m)
    },
    locationId: 'swamp',
    name: 'Siluro Ancestral',
    title: 'O Colosso de Lodo e Musgo',
    latinName: 'Silurus primordialis paludis',
    speciesBase: 'Siluriforme Primordial',
    estimatedAge: '~340 anos',
    weightKg: 428.6,
    lengthMeters: 4.8,
    environmentTease: {
      ambientHush: 'O coaxar dos sapos e o zumbido das libélulas cessam abruptamente.',
      waterSign: 'Grandes bolhas lentas de gás do leito sobem à tona. A água escura do brejo ganha uma ondulação pesada.',
      reelBiteFeel: 'A boia não estremece — ela afunda direto no leito, como se a vara tivesse enganchado nas raízes do mundo.',
    },
    visualCharacteristics: {
      primaryColor: '#1e2920', // Verde-musgo muito escuro / lodo
      secondaryColor: '#2d3c2c',
      bellyColor: '#4a4837', // Ocre pálido / lama seca
      accentGlow: 'rgba(101, 163, 13, 0.35)', // Brilho de pântano orgânico
      naturalElements: [
        'Raízes e musgos de turfeira crescidos sobre o dorso',
        'Longos barbilhões caídos que parecem galhos submersos',
        'Placas dérmicas fossilizadas e cicatrizes de anzóis seculares',
        'Olhos cor de âmbar que encaram as profundezas sem pressa',
      ],
    },
    relic: {
      id: 'relic_swamp_scale',
      assetId: 'relic_swamp_scale',
      titanId: 'titan_swamp_catfish',
      name: 'Escama Petrificada do Pântano',
      rarity: 'ancestral_relic',
      emoji: '🌿',
      description: 'Uma enorme placa dérmica óssea revestida por turfa e musgo fossilizado secular.',
      lore: '"Retirada com reverência do lombo do Siluro Ancestral. As raízes e as águas do pântano reconhecem quem a carrega."',
      passiveBonus: {
        type: 'gold_mult',
        value: 0.25,
        label: '+25% de moedas ganhas em todas as vendas e peixes de água doce.',
      },
    },
    baseTrophyPrice: 4800,
    baseXpReward: 1500,
  },

  // ── DEMAIS TITÃS (PREPARADOS PARA A PROGRESSÃO DOS OUTROS BIOMAS) ──
  titan_lake_lunar: {
    id: 'titan_lake_lunar',
    assetId: 'titan_lake_lunar',
    phaseAssets: {
      phase1: 'titan_lake_lunar_phase1', // Fase 1: Sombra espelhada sob as águas tranquilas (75m - 45m)
      phase2: 'titan_lake_lunar_phase2', // Fase 2: Ondulação prateada e brilho sutil (45m - 18m)
      phase3: 'titan_lake_lunar_phase3', // Fase 3: Ascensão à Superfície - Colosso Lunar revelado (< 18m)
    },
    locationId: 'lake',
    name: 'Colosso Lunar',
    title: 'O Guardião das Águas Espelhadas',
    latinName: 'Cyprinus lunaris vetustus',
    speciesBase: 'Ciprinídeo Megalodôntico',
    estimatedAge: '~280 anos',
    weightKg: 215.4,
    lengthMeters: 3.2,
    environmentTease: {
      ambientHush: 'A brisa no lago cessa por completo. A superfície vira um espelho imóvel.',
      waterSign: 'Uma linha prateada sutil corta o reflexo das estrelas enquanto a água se dilata.',
      reelBiteFeel: 'Um puxão firme e majestoso que dobra a haste em um arco perfeito.',
    },
    visualCharacteristics: {
      primaryColor: '#172554',
      secondaryColor: '#1e3a8a',
      bellyColor: '#93c5fd',
      accentGlow: 'rgba(191, 219, 254, 0.45)',
      naturalElements: [
        'Linha de escamas lunares prateadas ao longo da linha lateral',
        'Nadadeiras que ondulam como cetim transparente na penumbra',
      ],
    },
    relic: {
      id: 'relic_lake_scale',
      assetId: 'relic_lake_scale',
      titanId: 'titan_lake_lunar',
      name: 'Escama de Prata Lunar',
      rarity: 'ancestral_relic',
      emoji: '🌙',
      description: 'Uma escama espelhada que absorve a luz ambiente e reflete o brilho da lua cheia.',
      lore: '"Dizem que enquanto esta escama repousar com o pescador, as noites nunca serão vazias de peixes."',
      passiveBonus: {
        type: 'legendary_chance',
        value: 0.30,
        label: '+30% de chance de atrair peixes raros e lendários à noite.',
      },
    },
    baseTrophyPrice: 4200,
    baseXpReward: 1300,
  },

  titan_river_emperor: {
    id: 'titan_river_emperor',
    assetId: 'titan_river_emperor',
    phaseAssets: {
      phase1: 'titan_river_emperor_phase1', // Fase 1: Vulto veloz cortando o fundo pedregoso (75m - 45m)
      phase2: 'titan_river_emperor_phase2', // Fase 2: Reflexo de cobre contra os rápidos (45m - 18m)
      phase3: 'titan_river_emperor_phase3', // Fase 3: Ascensão à Superfície - Imperador da Correnteza (< 18m)
    },
    locationId: 'river',
    name: 'Imperador da Correnteza',
    title: 'A Lâmina dos Rápidos',
    latinName: 'Salmonis grandis torrentis',
    speciesBase: 'Salmãoide Gigante das Rochas',
    estimatedAge: '~190 anos',
    weightKg: 180.2,
    lengthMeters: 2.9,
    environmentTease: {
      ambientHush: 'O som da cachoeira parece distante quando a água ao redor começa a girar.',
      waterSign: 'Um turbilhão potente espirra água branca contra as margens de pedra.',
      reelBiteFeel: 'O carretel zune em alta rotação, como um raio cortando o leito.',
    },
    visualCharacteristics: {
      primaryColor: '#3f1515',
      secondaryColor: '#5c1d1d',
      bellyColor: '#fca5a5',
      accentGlow: 'rgba(239, 68, 68, 0.3)',
      naturalElements: [
        'Escamas de cobre polidas por séculos de atrito com seixos',
        'Mandíbula adunca potente e cicatrizes de corredeiras',
      ],
    },
    relic: {
      id: 'relic_river_scale',
      assetId: 'relic_river_scale',
      titanId: 'titan_river_emperor',
      name: 'Barbatana de Cobre Fluvial',
      rarity: 'ancestral_relic',
      emoji: '🌊',
      description: 'Uma quilha dorsal de resistência incomparável lapidada por corredeiras sem fim.',
      lore: '"A torrente não pode quebrar quem se curva como a água."',
      passiveBonus: {
        type: 'rare_fish_speed',
        value: 0.25,
        label: '+25% de velocidade de recolhimento contra peixes velozes.',
      },
    },
    baseTrophyPrice: 5000,
    baseXpReward: 1600,
  },

  titan_sea_megalodon: {
    id: 'titan_sea_megalodon',
    assetId: 'titan_sea_megalodon',
    phaseAssets: {
      phase1: 'titan_sea_megalodon_phase1', // Fase 1: Sombra colossal nas águas azuis profundas (75m - 45m)
      phase2: 'titan_sea_megalodon_phase2', // Fase 2: Silhueta triangular e fendas branquiais (45m - 18m)
      phase3: 'titan_sea_megalodon_phase3', // Fase 3: Ascensão à Superfície - Megalodonte revelado (< 18m)
    },
    locationId: 'deep_sea',
    name: 'Megalodonte das Marés',
    title: 'A Sombra dos Mares Abertos',
    latinName: 'Carcharodon pelagicus aeternus',
    speciesBase: 'Seláquio Primordial Oceânico',
    estimatedAge: '~450 anos',
    weightKg: 890.0,
    lengthMeters: 7.2,
    environmentTease: {
      ambientHush: 'Gaivotas calam o bando e cardumes inteiros saltam para fora da água.',
      waterSign: 'Uma sombra triangular gigantesca desliza serenamente logo abaixo da quilha.',
      reelBiteFeel: 'O barco inclina alguns centímetros. A linha range sob tensão titânica.',
    },
    visualCharacteristics: {
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      bellyColor: '#e2e8f0',
      accentGlow: 'rgba(56, 189, 248, 0.25)',
      naturalElements: [
        'Cracas antigas incrustadas ao longo das fendas branquiais',
        'Dorso com textura de lixa mineral e dentes serrilhados proeminentes',
      ],
    },
    relic: {
      id: 'relic_sea_tooth',
      assetId: 'relic_sea_tooth',
      titanId: 'titan_sea_megalodon',
      name: 'Dente Fossilizado das Marés',
      rarity: 'ancestral_relic',
      emoji: '🦈',
      description: 'Um dente fossilizado do tamanho de uma adaga serrilhada.',
      lore: '"Mares inteiros se curvaram perante este caçador durante eras não registradas."',
      passiveBonus: {
        type: 'gold_mult',
        value: 0.35,
        label: '+35% no valor de venda de todos os peixes de alto mar.',
      },
    },
    baseTrophyPrice: 8500,
    baseXpReward: 2500,
  },

  titan_abyss_leviathan: {
    id: 'titan_abyss_leviathan',
    assetId: 'titan_abyss_leviathan',
    phaseAssets: {
      phase1: 'titan_abyss_leviathan_phase1', // Fase 1: Pontos débeis de bioluminescência no vácuo (75m - 45m)
      phase2: 'titan_abyss_leviathan_phase2', // Fase 2: Cadeias bioluminescentes e véus ondulando (45m - 18m)
      phase3: 'titan_abyss_leviathan_phase3', // Fase 3: Ascensão à Superfície - Leviatã revelado (< 18m)
    },
    locationId: 'deep_sea', // Bioma Abissal
    name: 'Leviatã das Profundezas',
    title: 'A Entidade Sem Luz',
    latinName: 'Bathycavernus abyssus cosmicus',
    speciesBase: 'Entidade Ictiológica Abissal',
    estimatedAge: '~700 anos',
    weightKg: 1450.0,
    lengthMeters: 9.6,
    environmentTease: {
      ambientHush: 'As partículas bioluminescentes do fundo apagam-se de repente. Escuridão total.',
      waterSign: 'Uma tênue cadeia de fotóforos se acende no vácuo das profundezas.',
      reelBiteFeel: 'A sensação de tentar içar o próprio assoalho do oceano.',
    },
    visualCharacteristics: {
      primaryColor: '#030712',
      secondaryColor: '#111827',
      bellyColor: '#312e81',
      accentGlow: 'rgba(168, 85, 247, 0.6)',
      naturalElements: [
        'Cadeias de órgãos bioluminescentes ciano e violeta que pulsam lentamente',
        'Nadadeiras véu translúcidas que se estendem pela escuridão',
      ],
    },
    relic: {
      id: 'relic_abyss_heart',
      assetId: 'relic_abyss_heart',
      titanId: 'titan_abyss_leviathan',
      name: 'Núcleo Abissal Cósmico',
      rarity: 'ancestral_relic',
      emoji: '🌌',
      description: 'Um órgão bioluminescente mineralizado que pulsa com o batimento do mar.',
      lore: '"O abismo não é vazio; ele tem memória e agora você carrega um fragmento dela."',
      passiveBonus: {
        type: 'xp_mult',
        value: 0.50,
        label: '+50% de Experiência ganha em todas as atividades do pescador.',
      },
    },
    baseTrophyPrice: 15000,
    baseXpReward: 5000,
  },
};
