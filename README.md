# 🎣 Jogo de Pesca (Fishing Game)

Um web app moderno, interativo e imersivo de pescaria e progressão incremental. Combina a jogabilidade ativa de pesca de precisão (*arcade/minigame*) com sistemas aprofundados de RPG (*skill tree* de maestria, biomas desbloqueáveis, catálogo de espécies) e mecânicas viciantes de automação (*idle clicker*, aquário vivo gerador de renda, clima em tempo real e renascimento cósmico).

[![Jogue Agora](https://img.shields.io/badge/▶_Jogue_Online-Live_Demo-emerald?style=for-the-badge&logo=google-chrome)](https://leonardoconstantino.github.io/pescaria-retro-game/)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge&logo=github)

> 🎮 **Link do Jogo Online**: [https://leonardoconstantino.github.io/pescaria-retro-game/](https://leonardoconstantino.github.io/pescaria-retro-game/)

---

## 🌟 Principais Sistemas & Funcionalidades

### 1. 🎮 Mecânica de Pesca & Game Feel ("Juice")
- **Lançamento e Fisgada Realista**: Boia com física flutuante, cálculo de tensão de linha por curva Bézier em SVG e contagem de espera dinâmica.
- **Cardume Subaquático**: Sombras de peixes nadando nas profundezas com inteligência procedural e reação ao afundar da boia.
- **Minigame de Tensão (Quick-Time Event)**: Ao puxar o anzol, um medidor de precisão surge. Acertar a **Zona Dourada** recompensa o pescador com bônus de peso (+25%), XP ampliado e fanfarra especial.
- **Feedback Tátil (Vibration API)**: Vibração rítmica na mordida da boia, no acerto perfeito do medidor e em capturas Épicas/Lendárias.
- **Áudio Sintetizado via Web Audio API**: Efeitos sonoros gerados por código (sem arquivos externos pesados): arremesso, estalo da linha, carretel, salpicos d'água, fanfarras e tilintar de moedas.
- **Cartas Holográficas 3D (HoloCard)**: Efeito 3D Tilt interativo com reflexos furta-cor e arco-íris para peixes raros e lendários.

---

### 2. 🌲 Árvore de Maestria & Talentos do Pescador
Sistema de progressão por árvore de habilidades desbloqueado por níveis e pontos de maestria:
- 🎣 **Pescador de Elite (*Angler*)**: Reduz o tempo de espera da mordida, aumenta o peso dos peixes, melhora chances de espécimes Raros/Lendários e concede a habilidade Keystone *Linha Dupla Mestre* (captura dois peixes simultâneos).
- 🪙 **Magnata dos Mares (*Tycoon*)**: Aumenta o valor de venda no mercado, concede chance de economizar iscas, concede descontos em varas e desbloqueia a Keystone *Monopólio dos Mares* (+100% de valor em troféus).
- 🔮 **Oceanógrafo Místico (*Mystic*)**: Multiplica o ganho de XP, aumenta o poder do clique na água, acelera ajudantes automatizados e concede a Keystone *Bênção de Netuno* (imunidade a perdas por eventos negativos e frequência dobrada de peixes dourados).

---

### 3. 🐠 Aquário & Viveiro de Troféus Interativo
- **Exposição Viva**: Peixes capturados nadam em um aquário animado com física orgânica e colisões suaves.
- **Renda Passiva de Visitantes**: Visitantes pagam gorjetas para admirar espécies raras e troféus bem alimentados.
- **Alimentação & Felicidade**: Alimentar os peixes ativa o estado de *Êxtase*, dobrando a receita por hora.
- **Temas & Decorações**: Ambientes customizáveis (Água Doce, Recife de Coral, Abismo Bioluminescente) com plantas, ruínas submersas e castelos que multiplicam os ganhos.

---

### 4. ⚓ Tripulação Automatizada & Ganhos Passivos (Idle Fishers)
- **Ajudantes de Pesca (Estilo Cookie Clicker)**:
  - Varas de Bambu fixadas na margem.
  - Gatos Pescadores Concursados.
  - Seu Zé Aposentado com Radinho AM.
  - Canoas com redes de arrasto furtivas.
  - Brigadas de Ariranhas Táticas.
  - Traineiras Pesqueiras Industriais.
  - Santuários Místicos de Poseidon & Netuno.
- **Visual na Água**: Boias e embarcações aparecem balançando em tempo real no cenário do lago.
- **Ganhos Offline**: Acumule moedas mesmo com o navegador fechado (com limites expansíveis).

---

### 5. 🌌 Renascimento Cósmico & Prestígio (Escamas Douradas)
- Reinicie o progresso básico em troca de **Escamas Cósmicas Douradas**.
- Cada escama acumulada concede **+1% de bônus permanente** de produção e clique.
- Compre **Bênçãos Cósmicas Permanentes**:
  - *Ímã de Peixes Dourados*: Aumenta o spawn de eventos cósmicos.
  - *Herança do Pescador Ancião*: Comece cada renascimento com fundos iniciais garantidos.
  - *Sorte Astral Oceânica*: Bônus permanente para encontrar peixes raros e lendários.
  - *Ampulheta Cósmica*: Expande o teto de ganhos offline de 4 para até 12 horas.
  - *Correnteza Divina de Poseidon*: +50% adicional em toda a economia.

---

### 6. ✨ O "Golden Cookie" dos Mares: Peixe Dourado Saltador
- Peixe lendário místico que salta periodicamente e cruza as águas por tempo limitado.
- Ao ser clicado a tempo, ativa efeitos especiais imediatos:
  - **Frenesi de Produção (7x CPS por 77 segundos)**.
  - **Frenesi de Clique (77x no clique da água)**.
  - **Cardume Instantâneo** com chuva imediata de moedas e confetes.

---

### 7. ⛅ Clima Dinâmico em Tempo Real
- Ciclos climáticos dinâmicos com impactos diretos nas mecânicas:
  - ☀️ **Ensolarado**: Pescaria serena com peixes mais dóceis.
  - 🌧️ **Chuva Suave**: Aumenta a velocidade de mordida da boia em 25%.
  - ⛈️ **Tempestade Elétrica**: +50% de ganho de XP e aparição de peixes energéticos.
  - 🌫️ **Neblina Mística**: Aumenta as chances de espécies raras e estranhas.
  - 🌙 **Lua Mística**: Peixes Dourados saltam com frequência 3x maior!

---

### 8. 📜 Missões Diárias, Conquistas & Ranking
- **Missões Diárias**: 3 objetivos renovados a cada dia (capturas por bioma, uso de iscas, ganho de moedas) com recompensas valiosas.
- **Catálogo de Conquistas**: Mais de 30 marcos desbloqueáveis com títulos honorários e moedas bônus.
- **Ranking Global & Local**: Quadro de líderes destacando os maiores mestres pescadores e maiores espécimes registrados.

---

## 🌊 Locais de Pesca & Biomas

| Bioma | Nível Mínimo | Atmosfera & Destaque |
| :--- | :---: | :--- |
| 🏞️ **Lago Tranquilo** | Nv. 1 | Águas mansas, perfeito para lambaris, tilápias e carpas. |
| 🌊 **Rio Correntoso** | Nv. 3 | Correntezas rápidas com dourados valentes e trutas arco-íris. |
| 🐊 **Pântano Misterioso** | Nv. 5 | Águas turvas com peixes-elétricos, piranhas e segredos. |
| 🚢 **Mar Aberto** | Nv. 8 | Alto-mar com atuns gigantes, tubarões e peixes-espada. |
| 🌌 **Abismo Oceânico** | Nv. 12 | Profundezas bioluminescentes com celacantos, peixes-lanterna e o mítico *Kraken Bebê*. |

---

## 🛠️ Tecnologias Utilizadas

- **React 18** — Componentização funcional, hooks personalizados e estado orquestrado.
- **TypeScript 5** — Tipagem estática rigorosa para motores de regras, peixes, eventos e talentos.
- **Tailwind CSS 4** — Estilização de alta performance com classes utilitárias e paletas temáticas.
- **Motion (Framer Motion)** — Física fluida de animações, modais reativos e feedback elástico.
- **Web Audio API** — Síntese acústica processual em tempo real sem dependências externas de som.
- **Navigator Vibration API** — Resposta tátil háptica para dispositivos móveis.
- **Lucide React** — Biblioteca consistente de ícones vetoriais.
- **Canvas Confetti** — Efeitos comemorativos para conquistas e capturas raras.
- **Vite 6** — Ambiente de compilação e bundler moderno.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm`, `yarn` ou `bun`

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

4. Acesse no navegador:
```
http://localhost:3000
```

---

## 📦 Estrutura do Projeto

```text
├── .github/workflows/          # Automação de deploy para GitHub Pages
├── public/assets/              # Imagens e ilustrações do jogo
├── src/
│   ├── components/             # Componentes React de UI e Modais
│   │   ├── AquariumModal.tsx   # Viveiro 3D com peixes animados e gorjetas
│   │   ├── BestiaryModal.tsx   # Catálogo e enciclopédia das espécies
│   │   ├── CatchModal.tsx      # Resultado da pescaria com HoloCard 3D
│   │   ├── FishingStage.tsx    # Cenário central interativo com água e boia
│   │   ├── GoldenFishSpawner.tsx # Evento do Peixe Dourado saltador
│   │   ├── HeaderBar.tsx       # Barra de status, moedas, nível e menu
│   │   ├── IdleShopModal.tsx   # Contratação de ajudantes e automações
│   │   ├── InventoryModal.tsx  # Gestão de cesto e venda em lote
│   │   ├── LocationsModal.tsx  # Seleção de biomas aquáticos
│   │   ├── MissionsModal.tsx   # Missões diárias e objetivos
│   │   ├── PrestigeModal.tsx   # Renascimento Cósmico e Escamas
│   │   ├── ReelTensionMeter.tsx# Minigame de tensão e Zona Dourada
│   │   ├── ShopModal.tsx       # Loja de varas e iscas
│   │   ├── TalentModal.tsx     # Árvore de Maestria com 3 ramos
│   │   └── WeatherBanner.tsx   # Indicador do clima dinâmico
│   ├── game/
│   │   ├── data/               # Banco de dados (peixes, itens, clima, talentos, prestígio)
│   │   └── managers/           # Motores de regra de negócio do jogo
│   ├── utils/
│   │   ├── audio.ts            # Síntese sonora procedural via Web Audio
│   │   └── vibrate.ts          # Feedback háptico tátil mobile
│   ├── App.tsx                 # Estado global e orquestração do jogo
│   └── main.tsx                # Ponto de entrada React
├── TODO.md                     # Roadmap estratégico de melhorias e balanceamento
├── metadata.json
├── package.json
└── vite.config.ts
```

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**.
