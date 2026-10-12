# 🎣 Jogo de Pesca (Fishing Game)

Um web app moderno, interativo e imersivo de pescaria e progressão incremental. Combina a jogabilidade ativa de pesca de precisão (*arcade/minigame*) com sistemas aprofundados de RPG (*skill tree* de maestria, biomas desbloqueáveis, catálogo enciclopédico de espécies) e mecânicas ricas de automação (*idle clicker*, aquário vivo gerador de renda, clima em tempo real, peixe dourado lendário e renascimento cósmico).

[![Jogue Agora](https://img.shields.io/badge/▶_Jogue_Online-Live_Demo-emerald?style=for-the-badge&logo=google-chrome)](https://leonardoconstantino.github.io/pescaria-retro-game/)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge&logo=github)

> 🎮 **Link do Jogo Online**: [https://leonardoconstantino.github.io/pescaria-retro-game/](https://leonardoconstantino.github.io/pescaria-retro-game/)

---

## 🌟 Principais Sistemas & Mecânicas de Jogo

### 1. 🎮 Pesca Ativa & Game Feel ("Juice")
- **Lançamento e Física Realista**: Boia com flutuação orgânica na água, cálculo de tensão de linha por curva Bézier em SVG e contagem de espera dinâmica.
- **Cardume Subaquático Procedural**: Sombras de peixes nadando nas profundezas (`FishShadows.tsx`) com inteligência procedural que reagem e se aproximam da boia.
- **Minigame de Tensão & Zona Dourada (`ReelTensionMeter.tsx`)**: Ao puxar o anzol, um medidor de tensão com zona alvo dinâmica é ativado. Acertar a **Zona Dourada** recompensa com:
  - Bônus imediato de peso no peixe (+25%).
  - Ganho de XP ampliado (+50%).
  - Animação comemorativa e fanfarra especial.
- **Feedback Tátil Háptico (Navigator Vibration API)**: Padrões de vibração personalizados para mordidas na boia, acertos perfeitos de puxada e captura de espécimes Raros, Épicos e Lendários.
- **Síntese de Áudio via Web Audio API**: Efeitos sonoros gerados por código em tempo real (sem arquivos de áudio externos): arremesso da vara, estalo da linha, carretel, salpicos d'água, tilintar de moedas e acordes celestiais.
- **Cartas Holográficas 3D (`HoloCard.tsx`)**: Efeito 3D Tilt interativo com reflexos furta-cor e brilho dinâmico baseado no cursor para exibir os peixes capturados.

---

### 2. 🌲 Árvore de Maestria & Talentos do Pescador
A cada nível alcançado, o jogador conquista **Pontos de Maestria** para especializar sua jornada em 3 ramos de evolução (`TalentModal.tsx`), totalizando 18 talentos e 3 habilidades Keystones supremas:

| Ramo | Foco | Destaques | Habilidade Keystone (Tier 4) |
| :--- | :--- | :--- | :--- |
| 🎣 **Pescador de Elite (*Angler*)** | Arremesso ativo e peixes gigantes | Redução do tempo de mordida, aumento de peso médio, bônus de espécies raras e captura de espécimes gigantes. | **Linha Dupla Mestre**: Concede chance de fisgar dois peixes em um único arremesso com anzol duplo. |
| 🪙 **Magnata dos Mares (*Tycoon*)** | Economia, comércio e lucros | Maior valor de venda no mercado, desconto em compras de varas e economia automática de iscas valiosas. | **Monopólio dos Mares**: Concede +100% de valor extra na venda de peixes de troféu. |
| 🔮 **Oceanógrafo Místico (*Mystic*)** | Automação, cliques e eventos raros | Multiplicador de XP, poder de clique na água, aceleração dos ajudantes passivos e bônus de clima. | **Bênção de Netuno**: Imunidade a perdas por tempestades e duplica a frequência de aparição do Peixe Dourado. |

---

### 3. 🐠 Aquário & Viveiro de Troféus Interativo
Um ecossistema aquático vivo onde o jogador pode preservar suas melhores capturas e lucrar com visitações (`AquariumModal.tsx` e `AquariumCanvas.tsx`):
- **Exposição Viva em Canvas 2D**: Os peixes transferidos do inventário nadam no aquário com velocidade proporcional ao seu peso e física orgânica de nado.
- **Renda Passiva de Visitantes**: Visitantes do aquário pagam gorjetas automáticas por segundo de acordo com a raridade e o peso dos peixes em exibição.
- **Alimentação & Estado de Êxtase**: Alimentar os peixes eleva a saciedade da fauna aquática, ativando o estado de **Êxtase Aquático**, que dobra a receita de moedas por hora.
- **Temas & Cenários**: Ambientes desbloqueáveis como *Água Doce*, *Recife de Coral* e *Abismo Bioluminescente*.
- **Decorações Mágicas**: Plantas raras, baús de tesouro submersos e ruínas antigas que aplicam multiplicadores globais na atração de público.

---

### 4. ⚓ Tripulação Automatizada & Ganhos Passivos (Idle Fishers)
Sistema de automação estilo *Cookie Clicker* com geração contínua de Moedas por Segundo (CPS):
- **Ajudantes Contratáveis**:
  - 🎋 **Varas de Bambu na Margem**: Pescaria autônoma básica.
  - 🐱 **Gato Pescador Concursado**: Felinos ágeis com bônus de clique.
  - 📻 **Seu Zé Aposentado**: Experiência ribeirinha com radinho AM.
  - 🛶 **Canoa de Arrasto Noturno**: Coleta em rede nas margens.
  - 🦦 **Brigada de Ariranhas Táticas**: Pesca em bando veloz e implacável.
  - 🚢 **Traineira Pesqueira Industrial**: Produção em massa de alto-mar.
  - 🔱 **Santuário de Poseidon**: Bênçãos cósmicas de captura contínua.
- **Visualização Viva na Água (`IdleFishersWaterVisual.tsx`)**: Boias, barcos e ajudantes aparecem flutuando ativamente no cenário enquanto trabalham.
- **Ganhos Offline Seguros**: Acúmulo de recursos mesmo com o jogo fechado, com limite expansível via bênçãos cósmicas.

---

### 5. ✨ Peixe Dourado (*Golden Fish*) — O "Golden Cookie" dos Mares
Um evento celestial espontâneo e recompensador (`GoldenFishSpawner.tsx`):
- **Visual Lendário Estilizado**: Silhueta vetorial orgânica em SVG de peixe dourado com natação ondulatória, gradiente metálico, cauda articulada, halos de ondas d'água e centelhas estelares.
- **Raridade Equilibrada**:
  - *Modo Base*: surge a cada **110s a 200s** (~1.8 a 3.3 minutos).
  - *Com Bênção de Netuno ou Ímã Dourado*: surge a cada **65s a 115s**.
  - *Na Lua Mística*: aparição especial a cada **40s a 70s**.
- **Desaparecimento Instantâneo**: Ao ser clicado pelo pescador, desaparece imediatamente em uma celebração com confetes dourados, áudio orquestrado e vibração.
- **Efeitos de Frenesi Cósmico**:
  - 🌟 **Frenesi de Produção**: 7x mais CPS durante 77 segundos.
  - ⚡ **Frenesi de Clique**: 77x mais moedas por clique na água.
  - 💰 **Cardume de Ouro**: Chuva torrencial instantânea de moedas.

---

### 6. 🌌 Renascimento Cósmico & Prestígio (Ascensão)
Quando a pescaria atinge patamares elevados, o pescador pode ascender e recomeçar sua jornada com poderes divinos (`PrestigeModal.tsx`):
- **Requisito Mínimo**: Nível 10 do pescador.
- **Escamas Cósmicas Douradas**: Moeda divina calculada pelo total de moedas acumuladas ao longo de toda a história do pescador.
- **Bônus Permanente**: Cada Escama Cósmica confere **+1% permanente** de produção de moedas e poder de clique.
- **Tiers de Bênçãos Cósmicas**:
  - **Tier 1 — Iniciação Celestial**: *Ímã Astral de Peixes Dourados*, *Herança do Pescador Ancião* (moedas iniciais no renascimento), *Ressonância das Marés* (clique ampliado).
  - **Tier 2 — Maestria dos Mares Cósmicos**: *Sorte Astral Oceânica* (chances de raros/lendários), *Ampulheta Cósmica* (expansão do teto offline de 4h para até 12h), *Sintonia de Cardumes*.
  - **Tier 3 — Apoteose Oceânica**: *Correnteza Divina de Poseidon* (+50% CPS global permanente) e *Alquimia dos Troféus*.
- **Proteção de Sanidade Cósmica**: Algoritmo de validação que previne corrupção de dados ou inflações anômalas em saves de versões anteriores.

---

### 7. ⛅ Clima Dinâmico em Tempo Real
O clima afeta o ambiente visual e os parâmetros de pescaria (`WeatherBanner.tsx` e `weather.data.ts`):

| Clima | Modificador de Mordida | Chance de Raros | Bônus de XP | Efeito Especial |
| :--- | :---: | :---: | :---: | :--- |
| ☀️ **Ensolarado** | Normal (1.0x) | Normal | 1.0x | Águas calmas e visibilidade cristalina. |
| 🌧️ **Chuva Suave** | +25% mais rápido | +10% | 1.1x | Peixes saem da profundeza para buscar oxigênio. |
| ⛈️ **Tempestade Elétrica** | +40% mais rápido | +25% | **1.5x** | Raios no horizonte e peixes elétricos ativos. |
| 🌫️ **Neblina Mística** | Normal | **+50%** | 1.2x | Silhuetas misteriosas emergem do fundo. |
| 🌙 **Lua Mística** | +15% mais rápido | +35% | 1.3x | **Peixe Dourado surge até 3x mais rápido!** |

---

### 8. 📜 Missões Diárias, Conquistas & Leaderboard
- **Missões Diárias (`MissionsModal.tsx`)**: 3 tarefas diárias sorteadas a cada meia-noite (pescar espécies em biomas específicos, usar iscas especiais, acumular moedas) que garantem recompensas generosas.
- **Galeria de Conquistas (`AchievementsModal.tsx`)**: Mais de 30 marcos que desafiam o pescador (primeiro lendário, mestre dos biomas, aquarista experiente, etc.).
- **Quadro de Líderes (`LeaderboardModal.tsx`)**: Histórico dos maiores registros de peso, número de capturas e recordes da comunidade.

---

## 🌊 Locais de Pesca & Biomas

| Bioma | Nível Mínimo | Atmosfera & Espécies de Destaque |
| :--- | :---: | :--- |
| 🏞️ **Lago Tranquilo** | Nv. 1 | Águas mansas e límpidas. Lar do Lambari, Tilápia, Carpa e o mítico Dourado do Lago. |
| 🌊 **Rio Correntoso** | Nv. 3 | Corredeiras rápidas com cascalho. Abriga Trutas Arco-Íris, Pacus e Dourados Valentes. |
| 🐊 **Pântano Misterioso** | Nv. 5 | Águas escuras entre raízes de mangue. Lar de Bagres gigantes, Piranhas e Peixes-Elétricos. |
| 🚢 **Mar Aberto** | Nv. 8 | Ondas salgadas profundas. Habitat de Atuns Azuis, Peixes-Espada e Tubarões Martelo. |
| 🌌 **Abismo Oceânico** | Nv. 12 | Zona afótica com bioluminescência. Guarda Celacantos, Peixes-Lanterna e o Lendário *Kraken Bebê*. |

---

## 🛠️ Tecnologias & Arquitetura

- **React 18** — Interface componentizada moderna, hooks customizados e renderização declarativa.
- **TypeScript 5** — Tipagem estática rigorosa para motores de regras, modelos matemáticos e persistência.
- **Tailwind CSS 4** — Design responsivo, fluido e estilização utility-first de alta performance.
- **Motion (`motion/react`)** — Animações fluidas de nado, transições elásticas de modais e partículas.
- **Web Audio API** — Motor de som processual sintetizado em código puro (zero dependência de mp3 externos).
- **Navigator Vibration API** — Resposta tátil háptica para mordidas e eventos no mobile.
- **Canvas Confetti** — Chuva de partículas comemorativas para conquistas e o Peixe Dourado.
- **Vite 6** — Compilação ultrarrápida e Hot Module Replacement otimizado.

---

## 📦 Estrutura do Código

```text
├── public/
│   └── assets/                     # Sprites e ilustrações temáticas
├── src/
│   ├── components/                 # Componentes React de UI e Modais
│   │   ├── AchievementsModal.tsx   # Galeria de conquistas e marcos
│   │   ├── AquariumCanvas.tsx      # Renderizador em Canvas 2D da vida no aquário
│   │   ├── AquariumModal.tsx       # Gestão do viveiro, alimentação e decorações
│   │   ├── BestiaryModal.tsx       # Enciclopédia de peixes capturados e silhuetas
│   │   ├── CatchModal.tsx          # Animação de captura com HoloCard 3D
│   │   ├── EventModal.tsx          # Eventos aleatórios e escolhas de narrativa
│   │   ├── FishingStage.tsx        # Cenário central interativo com água, boia e linha
│   │   ├── FishShadows.tsx         # Sombras de peixes procedurais no fundo d'água
│   │   ├── FloatingFeedback.tsx    # Indicadores visuais flutuantes de XP e moedas
│   │   ├── GoldenFishSpawner.tsx   # Peixe Dourado Lendário ("Golden Cookie")
│   │   ├── HeaderBar.tsx           # Barra de navegação, status, nível e moedas
│   │   ├── HoloCard.tsx            # Card holográfico 3D interativo com física de tilt
│   │   ├── IdleFishersWaterVisual.tsx # Visualização dos ajudantes trabalhando na água
│   │   ├── IdleShopModal.tsx       # Contratação e melhoria de ajudantes automatizados
│   │   ├── InventoryModal.tsx      # Gestão de peixes capturados e venda em lote
│   │   ├── LeaderboardModal.tsx    # Quadro de honra e recordes
│   │   ├── LevelUpModal.tsx        # Celebração de novo nível e pontos de maestria
│   │   ├── LocationsModal.tsx      # Seleção e desbloqueio de biomas aquáticos
│   │   ├── MissionsModal.tsx       # Missões diárias e objetivos especiais
│   │   ├── MobileBottomDock.tsx    # Barra de navegação inferior otimizada para mobile
│   │   ├── PrestigeModal.tsx       # Renascimento Cósmico, Escamas e Bênçãos
│   │   ├── ReelTensionMeter.tsx    # Minigame de tensão da linha e Zona Dourada
│   │   ├── ShopModal.tsx           # Loja de equipamentos (varas e iscas)
│   │   ├── TalentModal.tsx         # Árvore de Maestria (3 ramos e 18 talentos)
│   │   └── WeatherBanner.tsx       # Indicador e efeitos do clima em tempo real
│   ├── game/
│   │   ├── data/                   # Definições estáticas e tabelas de balanceamento
│   │   │   ├── achievements.data.ts # Conquistas e critérios
│   │   │   ├── aquarium.data.ts    # Temas, decorações e tiers do viveiro
│   │   │   ├── fish.data.ts        # Catálogo com mais de 30 espécies e pesos
│   │   │   ├── idle.data.ts        # Ajudantes de pesca e custos de upgrade
│   │   │   ├── items.data.ts       # Varas, molinetes e iscas
│   │   │   ├── locations.data.ts   # Biomas, níveis requeridos e tabelas de pesca
│   │   │   ├── missions.data.ts    # Gerador de missões diárias
│   │   │   ├── prestige.data.ts    # Bênçãos de Netuno e custos de Escamas
│   │   │   ├── talents.data.ts     # Ramos de maestria, Keystones e bônus
│   │   │   └── weather.data.ts     # Ciclos climáticos e multiplicadores
│   │   └── managers/               # Motores de regra de negócio (Game Engine)
│   │       ├── AchievementManager.ts # Validação de conquistas
│   │       ├── AquariumManager.ts    # Simulação de visitantes, alimentação e lucro
│   │       ├── FishingEngine.ts      # Física do anzol, mordidas e capturas
│   │       ├── IdleManager.ts        # Cálculo de CPS e ganhos offline
│   │       ├── LocationManager.ts    # Desbloqueio e restrição de biomas
│   │       ├── MissionManager.ts     # Ciclo de missões diárias
│   │       ├── PlayerManager.ts      # Níveis, XP, inventário e persistência
│   │       ├── PrestigeManager.ts   # Cálculo de Escamas e Bênçãos Cósmicas
│   │       ├── TalentManager.ts      # Alocação de pontos de maestria
│   │       └── WeatherManager.ts     # Rotação climática em tempo real
│   ├── utils/
│   │   ├── audio.ts                # Sintetizador sonoro procedural via Web Audio
│   │   └── vibrate.ts              # Feedback tátil háptico para celulares
│   ├── App.tsx                     # Orquestração principal e ciclo do jogo
│   └── main.tsx                    # Ponto de montagem da aplicação
├── TODO.md                         # Registro de desenvolvimento e roadmap
├── metadata.json                   # Metadados e configurações da plataforma
├── package.json
└── vite.config.ts
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes: `npm`, `yarn` ou `bun`

### Passo a Passo

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/pescaria-retro-game.git
cd pescaria-retro-game
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento local:
```bash
npm run dev
```

4. Abra no seu navegador:
```
http://localhost:3000
```

5. Para compilar a versão de produção:
```bash
npm run build
```

---

## 📄 Licença

Este projeto é desenvolvido sob a licença **MIT** — sinta-se livre para jogar, modificar e contribuir!
