// src/components/TitanAssetIcon.tsx
import React from 'react';

interface TitanAssetIconProps {
  titanId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TitanAssetIcon: React.FC<TitanAssetIconProps> = ({
  titanId,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Renderizações vetoriais SVG orgânicas estilizadas de acordo com os 5 Titãs Ancestrais
  switch (titanId) {
    case 'titan_swamp_catfish':
      // Siluro Ancestral: Siluriforme colossal com placas de limo, olhos de âmbar e barbilhões ramificados
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize} ${className} transition-transform duration-300 drop-shadow-[0_4px_12px_rgba(101,163,13,0.35)]`}
        >
          <defs>
            <linearGradient id="swampTitanBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e2920" />
              <stop offset="50%" stopColor="#2d3c2c" />
              <stop offset="100%" stopColor="#4a4837" />
            </linearGradient>
            <radialGradient id="swampEye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#713f12" />
            </radialGradient>
            <filter id="swampGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Fundo de água lodosa sutil */}
          <circle cx="60" cy="60" r="54" fill="#0d140e" stroke="#365314" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="48" fill="#142016" opacity="0.6" />

          {/* Cauda e Nadadeira Caudal potente */}
          <path
            d="M 28 60 C 14 42, 8 46, 6 60 C 8 74, 14 78, 28 60 Z"
            fill="#273827"
            stroke="#4d7c0f"
            strokeWidth="1.5"
          />

          {/* Corpo Muscular do Siluro com curvatura secular */}
          <path
            d="M 24 60 C 38 42, 70 38, 98 48 C 108 52, 114 60, 108 68 C 88 78, 42 76, 24 60 Z"
            fill="url(#swampTitanBody)"
            stroke="#65a30d"
            strokeWidth="1.8"
          />

          {/* Placas dérmicas e musgo de turfeira no dorso */}
          <path
            d="M 52 42 Q 62 40, 78 44 Q 68 47, 52 42 Z"
            fill="#4d7c0f"
            opacity="0.85"
          />
          <path
            d="M 38 48 Q 48 46, 58 50 Q 48 52, 38 48 Z"
            fill="#365314"
            opacity="0.9"
          />

          {/* Nadadeira Peitoral Espessa */}
          <path
            d="M 66 66 C 70 78, 54 86, 50 82 C 54 74, 62 68, 66 66 Z"
            fill="#223223"
            stroke="#4d7c0f"
            strokeWidth="1.2"
          />

          {/* Olho Pequeno e Milenar de Âmbar */}
          <circle cx="94" cy="54" r="3.5" fill="url(#swampEye)" filter="url(#swampGlow)" />
          <circle cx="94.5" cy="53.5" r="1" fill="#ffffff" />

          {/* Barbilhões Orgânicos Superiores e Inferiores (estilo galhos/raízes) */}
          <path
            d="M 104 60 Q 112 68, 118 78 Q 112 82, 106 74"
            fill="none"
            stroke="#84cc16"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 98 65 Q 106 75, 110 88"
            fill="none"
            stroke="#65a30d"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M 92 68 Q 96 78, 92 86"
            fill="none"
            stroke="#4d7c0f"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Partículas bioluminescentes de metano */}
          <circle cx="36" cy="38" r="1.5" fill="#a3e635" opacity="0.6" />
          <circle cx="82" cy="78" r="1.5" fill="#bef264" opacity="0.7" />
          <circle cx="106" cy="36" r="2" fill="#84cc16" opacity="0.5" />
        </svg>
      );

    case 'titan_lake_lunar':
      // Colosso Lunar: Carpa monumental prateada com escamas lunares reflexivas e véu
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize} ${className} transition-transform duration-300 drop-shadow-[0_4px_14px_rgba(147,197,253,0.4)]`}
        >
          <defs>
            <linearGradient id="lunarTitanBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="40%" stopColor="#1e3a8a" />
              <stop offset="80%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            <radialGradient id="lunarMoon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>
          </defs>

          <circle cx="60" cy="60" r="54" fill="#030712" stroke="#1e40af" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="48" fill="#0b1329" opacity="0.7" />

          {/* Nadadeiras Translúcidas Véu */}
          <path
            d="M 26 60 C 10 36, 4 48, 6 60 C 4 72, 10 84, 26 60 Z"
            fill="#38bdf8"
            opacity="0.6"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />

          {/* Corpo do Colosso Lunar */}
          <path
            d="M 22 60 C 36 40, 68 36, 96 46 C 108 52, 110 66, 98 72 C 72 82, 38 78, 22 60 Z"
            fill="url(#lunarTitanBody)"
            stroke="#93c5fd"
            strokeWidth="1.8"
          />

          {/* Nadadeira Dorsal Alta */}
          <path
            d="M 44 40 Q 64 26, 80 42 Q 62 36, 44 40 Z"
            fill="#60a5fa"
            opacity="0.8"
            stroke="#bae6fd"
            strokeWidth="1.2"
          />

          {/* Linha Lateral de Escamas Lunares */}
          <circle cx="48" cy="58" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="60" cy="57" r="2.5" fill="#ffffff" opacity="0.95" />
          <circle cx="72" cy="56" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="84" cy="55" r="2" fill="#ffffff" opacity="0.8" />

          {/* Olho Lunar com Brilho Estelar */}
          <circle cx="92" cy="52" r="3.8" fill="url(#lunarMoon)" />
          <circle cx="93" cy="51" r="1.2" fill="#ffffff" />

          {/* Reflexo Lunar */}
          <circle cx="34" cy="30" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="92" cy="80" r="1.5" fill="#7dd3fc" opacity="0.8" />
        </svg>
      );

    case 'titan_river_emperor':
      // Imperador da Correnteza: Salmãoide das rochas com couraça de cobre e mandíbula adunca
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize} ${className} transition-transform duration-300 drop-shadow-[0_4px_14px_rgba(248,113,113,0.35)]`}
        >
          <defs>
            <linearGradient id="riverTitanBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="45%" stopColor="#7f1d1d" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>

          <circle cx="60" cy="60" r="54" fill="#1c0a0a" stroke="#991b1b" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="48" fill="#2d0c0c" opacity="0.7" />

          {/* Cauda em V cortante */}
          <path
            d="M 28 60 L 10 40 L 16 60 L 10 80 Z"
            fill="#991b1b"
            stroke="#f87171"
            strokeWidth="1.8"
          />

          {/* Corpo Hidrodinâmico Poderoso */}
          <path
            d="M 24 60 C 40 44, 76 42, 98 48 C 108 52, 112 60, 102 68 C 80 80, 42 74, 24 60 Z"
            fill="url(#riverTitanBody)"
            stroke="#ef4444"
            strokeWidth="1.8"
          />

          {/* Mandíbula Adunca (Kype) característica de salmão ancestral */}
          <path
            d="M 98 48 Q 112 52, 114 62 Q 106 64, 100 60"
            fill="#7f1d1d"
            stroke="#fca5a5"
            strokeWidth="1.5"
          />

          {/* Couraça de Cobre & Escamas de Rápidos */}
          <path
            d="M 45 48 L 52 54 L 46 60 L 39 54 Z"
            fill="#f87171"
            opacity="0.7"
          />
          <path
            d="M 60 47 L 68 53 L 61 60 L 53 54 Z"
            fill="#fca5a5"
            opacity="0.8"
          />
          <path
            d="M 75 48 L 83 54 L 76 61 L 68 55 Z"
            fill="#ef4444"
            opacity="0.7"
          />

          {/* Olho Feroz */}
          <circle cx="94" cy="54" r="3.2" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <circle cx="94.5" cy="53.5" r="1.2" fill="#000000" />
        </svg>
      );

    case 'titan_sea_megalodon':
      // Megalodonte das Marés: Tubarão titanico com cracas, fendas branquiais e dorso azul-abissal
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize} ${className} transition-transform duration-300 drop-shadow-[0_4px_14px_rgba(56,189,248,0.35)]`}
        >
          <defs>
            <linearGradient id="seaTitanBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#334155" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          <circle cx="60" cy="60" r="54" fill="#08101e" stroke="#0284c7" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="48" fill="#0f1f38" opacity="0.7" />

          {/* Nadadeira Caudal Heterocerca Clássica */}
          <path
            d="M 28 60 L 10 32 L 18 58 L 12 78 L 28 60 Z"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="1.8"
          />

          {/* Corpo Maciço e Aerodinâmico */}
          <path
            d="M 24 60 C 40 44, 76 42, 100 50 C 112 55, 114 64, 102 70 C 80 82, 42 76, 24 60 Z"
            fill="url(#seaTitanBody)"
            stroke="#38bdf8"
            strokeWidth="1.8"
          />

          {/* Barbatana Dorsal Icônica */}
          <path
            d="M 52 44 L 64 22 L 72 44 Z"
            fill="#0f172a"
            stroke="#0284c7"
            strokeWidth="1.6"
          />

          {/* Fendas Branquiais Ancestrais com Cracas */}
          <line x1="78" y1="52" x2="76" y2="64" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="82" y1="53" x2="80" y2="65" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="86" y1="54" x2="84" y2="66" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />

          {/* Olho Negro e Dentes Triangulares */}
          <circle cx="98" cy="56" r="3.5" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
          <polygon points="98,64 102,68 96,68" fill="#f8fafc" />
          <polygon points="103,64 107,67 101,67" fill="#f8fafc" />
        </svg>
      );

    case 'titan_abyss_leviathan':
    default:
      // Leviatã das Profundezas: Entidade abissal escura com fotóforos cósmicos violetas e ciano
      return (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize} ${className} transition-transform duration-300 drop-shadow-[0_4px_16px_rgba(168,85,247,0.55)]`}
        >
          <defs>
            <linearGradient id="abyssTitanBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#030712" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
            <radialGradient id="photophoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <circle cx="60" cy="60" r="54" fill="#02040a" stroke="#7c3aed" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="48" fill="#090a1f" opacity="0.8" />

          {/* Ondulação de Nadadeiras Abissais Translúcidas */}
          <path
            d="M 26 60 Q 12 36, 6 50 Q 8 60, 6 70 Q 12 84, 26 60 Z"
            fill="#4338ca"
            opacity="0.45"
            stroke="#a855f7"
            strokeWidth="1.2"
          />

          {/* Corpo Serpentino Monumental do Leviatã */}
          <path
            d="M 22 60 C 34 40, 72 38, 98 46 C 112 52, 114 68, 96 74 C 70 84, 34 78, 22 60 Z"
            fill="url(#abyssTitanBody)"
            stroke="#a855f7"
            strokeWidth="2"
          />

          {/* Cadeia de Fotóforos Bioluminescentes Cósmicos */}
          <circle cx="42" cy="58" r="3" fill="#a855f7" className="animate-pulse" />
          <circle cx="56" cy="57" r="3.2" fill="#06b6d4" className="animate-pulse" />
          <circle cx="70" cy="56" r="3.5" fill="#a855f7" className="animate-pulse" />
          <circle cx="84" cy="55" r="3.8" fill="#38bdf8" className="animate-pulse" />

          {/* Olho Cego Abissal com Foco Cósmico */}
          <circle cx="94" cy="52" r="4" fill="#c084fc" />
          <circle cx="94" cy="52" r="2" fill="#ffffff" />

          {/* Antena / Barbilhão Abissal com Lâmpada Fotófora */}
          <path
            d="M 98 48 Q 106 32, 114 36"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="114" cy="36" r="4" fill="url(#photophoreGlow)" />
          <circle cx="114" cy="36" r="2" fill="#ffffff" />
        </svg>
      );
  }
};
