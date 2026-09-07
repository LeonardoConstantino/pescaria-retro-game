# 🎣 Jogo de Pesca (Fishing Game)

Um web app interativo e imersivo de pescaria com progressão de níveis, biomas aquáticos desbloqueáveis, loja de equipamentos, catálogo de espécies (Bestiário), eventos climáticos aleatórios e mecânicas ricas de *game feel* (*juice*, vibração háptica e minigame de recolhimento).

[![Jogue Agora](https://img.shields.io/badge/▶_Jogue_Online-Live_Demo-emerald?style=for-the-badge&logo=google-chrome)](https://leonardoconstantino.github.io/pescaria-retro-game/)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge&logo=github)

> 🎮 **Link do Jogo Online**: [https://leonardoconstantino.github.io/pescaria-retro-game/](https://leonardoconstantino.github.io/pescaria-retro-game/)

---

## 🌟 Principais Funcionalidades

### 1. 🎮 Mecânica de Pesca & Game Feel ("Juice")
- **Lançamento e Fisgada Realista**: Boia animada com ondas, tensão de linha calculada via SVG dinâmico e contagem de espera com variação procedural.
- **Cardume Subaquático**: Sombras de peixes nadando no fundo d'água com física ondulatória e reação ao afundar da boia.
- **Minigame de Tensão (Quick-Time Event)**: Ao recolher o anzol, um medidor de precisão surge. Acertar a **Zona Dourada** recompensa o pescador com **+25% de peso no peixe**, bônus de XP e fanfarra especial.
- **Feedback Tátil (Mobile Vibration API)**:
  - Pulso duplo rítmico na mordida da boia.
  - Vibração de alta frequência no acerto perfeito do minigame.
  - Padrão tátil épico com múltiplos solavancos em capturas Lendárias.
- **Áudio Sintetizado via Web Audio API**: Sons autônomos gerados por código (lançamento da linha, clique do carretel com tom ajustado ao peso do peixe, splash na água, fanfarras por raridade e moedas caindo).
- **Efeitos de Impacto**:
  - *Hit Stop* (micro-congelamento dramático da tela).
  - *Hit Flash* luminoso em capturas raras/lendárias.
  - *Screen Shake* (tremor de tela responsivo).
  - *Damage/Reward Numbers*: Indicadores flutuantes elásticos de XP, moedas e bônus.

### 2. ✨ Cartas Holográficas 3D (HoloCard)
- Visual de cartas colecionáveis no modal de captura e no Guia das Espécies.
- Efeito de inclinação tridimensional (*3D Tilt*) que reage ao movimento do cursor ou dedo.
- Película furta-cor com reflexos de arco-íris deslizantes e partículas de confete para peixes raros, épicos e lendários.

### 3. 🌊 Locais de Pesca & Biomas
- **Lago Tranquilo** (Nível 1): Águas mansas, perfeito para iniciantes.
- **Rio Correntoso** (Nível 3): Águas rápidas com peixes fortes e ágeis.
- **Pântano Misterioso** (Nível 5): Águas turvas com atmosfera densa e espécies exóticas.
- **Mar Aberto** (Nível 8): Ondas bravias e espécies de grande porte.
- **Abismo Oceânico** (Nível 12): Profundezas bioluminescentes com criaturas lendárias como o *Kraken Bebê*.

### 4. 📖 Bestiário (Guia das Espécies)
- Registro completo de todas as espécies disponíveis.
- Rastreamento de peixes descobertos vs. desconhecidos.
- Informações sobre faixa de peso, valor base em moedas e habitats.

### 5. 🏪 Economia, Loja & Inventário
- **Venda Individual ou em Lote**: Venda capturas imediatamente na tela de resultado ou acumule no cesto para vender tudo com 1 clique.
- **Progressão de Varas**: Varas básicas, de fibra, de carbono e de titânio (aumentam chances de peixes raros e reduzem tempo de espera).
- **Iscas Especiais**: Minhoca, Grilo, Isca Artificial e a cobiçada Isca Dourada.
- **Gestão de Espaço**: Limite de cesto que incentiva o gerenciamento tático de recursos.

### 6. ⚡ Eventos Climáticos & Aleatórios
- Tempestades e relâmpagos com bônus de XP.
- Mensagens na garrafa com recompensas em moedas.
- Pássaros larápios e linhas que arrebentam caso o equipamento não seja adequado.
- Peixes fantasmas e surtos de sorte.

---

## 🛠️ Tecnologias Utilizadas

- **React 18** — Biblioteca UI baseada em componentes funcionais e hooks.
- **TypeScript** — Tipagem estática rigorosa para dados de itens, locais e peixes.
- **Tailwind CSS** — Estilização moderna utilitária com temas adaptados a cada bioma.
- **Motion (Framer Motion)** — Transições de modal, números flutuantes e física de animação.
- **Web Audio API** — Síntese de som procedural sem dependência de arquivos de áudio externos.
- **Navigator Vibration API** — Resposta háptica para smartphones.
- **Lucide React** — Conjunto consistente de ícones vetoriais.
- **Canvas Confetti** — Chuva de confetes comemorativa em capturas especiais.
- **Vite** — Bundler ultrarrápido para desenvolvimento e compilação de produção.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm`, `yarn` ou `pnpm`

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/pescaria-retro-game.git
cd pescaria-retro-game
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no seu navegador:
```
http://localhost:3000
```

---

## 📦 Estrutura de Pastas

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automação de deploy para GitHub Pages
├── public/                     # Imagens estáticas (peixes, locais, varas, iscas)
├── src/
│   ├── components/
│   │   ├── BestiaryModal.tsx   # Modal do Guia das Espécies
│   │   ├── CatchModal.tsx      # Modal comemorativo de captura com HoloCard
│   │   ├── EventModal.tsx      # Eventos climáticos e surpresas
│   │   ├── FishShadows.tsx     # Sombras de peixes nadando no fundo da água
│   │   ├── FishingStage.tsx    # Cenário central com boia e linha animada
│   │   ├── FloatingFeedback.tsx# Números flutuantes de XP e moedas
│   │   ├── GameAssetImage.tsx  # Renderizador inteligente de imagens com fallback
│   │   ├── HoloCard.tsx        # Carta 3D com efeito holográfico e tilt
│   │   ├── InventoryModal.tsx  # Cesto de peixes e venda em lote
│   │   ├── LocationsModal.tsx  # Seletor de biomas por nível
│   │   ├── ReelTensionMeter.tsx# Minigame de recolhimento e zona perfeita
│   │   └── ShopModal.tsx       # Loja de varas e iscas
│   ├── game/
│   │   ├── data/               # Catálogos (peixes, itens, locais, eventos)
│   │   └── managers/           # Motor de jogo e máquina de estado de pesca
│   ├── utils/
│   │   ├── audio.ts            # Síntese Web Audio (efeitos sonoros e fanfarras)
│   │   └── vibrate.ts          # Feedback háptico no celular
│   ├── App.tsx                 # Estado global e orquestração do jogo
│   └── main.tsx                # Ponto de montagem React
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 Publicação no GitHub Pages

Este repositório já inclui um fluxo de trabalho do **GitHub Actions** pronto em `.github/workflows/deploy.yml`.

1. No seu repositório no GitHub, acesse **Settings** > **Pages**.
2. Em **Source**, selecione **GitHub Actions**.
3. A cada novo `git push` na branch `main`, o jogo será compilado e publicado automaticamente em:
   **[https://leonardoconstantino.github.io/pescaria-retro-game/](https://leonardoconstantino.github.io/pescaria-retro-game/)**

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Sinta-se livre para usar, modificar e expandir!
