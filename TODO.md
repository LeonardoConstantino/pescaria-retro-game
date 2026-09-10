# 📋 Plano de Evolução, Balanceamento e Polimento — Jogo de Pesca

Este documento reúne o planejamento estratégico, ajustes de balanceamento econômico, refinamento de interface mobile, polimento audiovisual e próximas adições para elevar o jogo ao seu mais alto padrão de qualidade e retenção.

---

## 📱 1. Ajustes de CSS & Experiência Mobile

- [ ] **Dock / Barra de Ações Inferior para Mobile (Bottom Navigation Dock)**
  - *Problema atual*: O `HeaderBar` possui 9 botões de funcionalidades (Cesto, Loja, Ajudantes, Biomas, Conquistas, Ranking, Missões, Aquário, Talentos). No celular, embora possua scroll horizontal, pode sobrecarregar a área superior.
  - *Solução*: Implementar um dock de navegação fixo inferior no mobile (`sm:hidden fixed bottom-0 left-0 right-0`), agrupando as ações mais frequentes (Pescar, Cesto, Loja, Missões, Menu "Mais"), com touch targets de 48px e safe-area padding (`pb-safe`).
- [ ] **Otimização dos Modais em Telas Pequenas**
  - [ ] Garantir `max-h-[85vh]` e `w-[95vw]` em todos os modais (`TalentModal`, `AquariumModal`, `InventoryModal`, `ShopModal`, etc.).
  - [ ] Grids adaptativos: transformar colunas duplas em coluna única fluida (`grid-cols-1 md:grid-cols-2`) com padding interno reduzido (`p-3` no mobile vs `p-6` no desktop).
  - [ ] Fixar botões de fechamento (`X`) no topo direito e garantir que o cabeçalho fique com `sticky top-0 z-10` durante a rolagem do conteúdo do modal.
- [ ] **Aprimoramento do Palco de Pesca no Celular (`FishingStage`)**
  - [ ] Ajustar o tamanho da boia e o raio de interação de toque na água.
  - [ ] Otimizar o medidor de recolhimento (`ReelTensionMeter`) para posicionamento centralizado sem cobrir o visual da boia no celular em modo retrato.
  - [ ] Desativar seleção de texto (`select-none`) e zoom acidental por duplo clique (`touch-action: manipulation`) na área de toque da água.

---

## ⚖️ 2. Balanceamento da Economia & Progressão (XP, Moedas, Escamas)

### A. Progressão de Níveis & Curva de XP
- *Fórmula atual*: `baseXpPerLevel = 80`, `levelMultiplier = 1.6`.
  - Nv 2: 80 XP
  - Nv 5: ~740 XP acumulados
  - Nv 10: ~3.800 XP acumulados
  - Nv 15: ~10.500 XP acumulados
- [ ] **Calibração de Recompensas de XP**:
  - Aumentar proporcionalmente o XP concedido por peixes de biomas avançados (Abismo Oceânico e Mar Aberto), garantindo que capturas lendárias e épicas façam a barra de XP progredir visivelmente (10% a 25% por captura rara/lendária).
  - Adicionar bônus de XP ao completar todas as missões diárias do dia (+250 XP bônus).
  - Suavizar a transição entre os níveis 8 e 12 para evitar a sensação de "trava" antes de desbloquear o Abismo Oceânico.

### B. Economia de Moedas & Retorno sobre Investimento (ROI)
- *Estrutura atual*:
  - Multiplicadores de venda: Comum (1.0x), Incomum (1.8x), Raro (3.5x), Épico (8.0x), Lendário (20.0x).
  - Ajudantes passivos: escala de custo exponencial `baseCost * (1.15 ^ n)`.
  - Aquário: gera moedas por hora com base na felicidade dos peixes e decorações.
- [ ] **Ajustes de Preços e Renda**:
  - Elevar ligeiramente o valor base dos peixes grandes capturados na Zona Perfeita do minigame (adicionar bônus explícito de valor de venda quando o peixe tiver peso acima de 85% do máximo da espécie).
  - Rebalancear o custo inicial da Vara de Carbono e Titânio para alinhá-los à progressão orgânica do jogador (evitando que se tornem baratas demais com ajudantes ou caras demais para quem joga apenas manualmente).
  - Adicionar teto dinâmico de produção passiva (CPS) proporcional ao nível do jogador para valorizar o jogo ativo.

### C. Escamas Cósmicas & Prestígio (Ascensão)
- *Fórmula atual*: `Math.floor(Math.cbrt(totalCoinsEarned / 100000))`.
  - 100.000 moedas = 1 escama
  - 800.000 moedas = 2 escamas (salto de 8x!)
  - 2.700.000 moedas = 3 escamas
- [ ] **Refinamento da Curva de Escamas**:
  - Ajustar a fórmula para `Math.floor(Math.sqrt(totalCoinsEarned / 25000))` ou escala cúbica atenuada:
    - 50.000 moedas = 1 escama
    - 200.000 moedas = 2 escamas
    - 450.000 moedas = 3 escamas
    - 800.000 moedas = 4 escamas
    - 1.250.000 moedas = 5 escamas
  - *Benefício*: O primeiro renascimento recompensa o jogador com 2 a 4 escamas, permitindo comprar 1 ou 2 bênçãos cósmicas logo de cara (ex: Ímã de Peixes Dourados + Herança do Pescador), tornando o renascimento imediatamente empolgante.

---

## ✨ 3. Peixe Dourado (*Golden Fish*) — Frequência & Visual

- [ ] **Frequência de Aparição**:
  - *Atualmente*: Intervalo entre 45s e 90s (com primeiro spawn entre 20-40s).
  - *Ajuste proposto*:
    - Modo Base: intervalo entre **60s e 110s** (para manter a sensação de momento raro e especial).
    - Com talento *Bênção de Netuno* ou Bênção Cósmica *Ímã Dourado*: redução para **35s a 65s**.
    - Durante o clima *Lua Mística*: spawn acelerado especial (a cada 25-45s).
- [ ] **Design Visual & Botão Flutuante**:
  - *Problema*: Caixa retangular com bordas pesadas e texto "Clique!" que desarmoniza com o ambiente aquático.
  - *Novo Conceito Visual*:
    - Remover a caixa de texto retangular cinza/amarela.
    - Transformar em uma **Esfera Mística Aquática Dourada**:
      - Peixe dourado orgânico em alta resolução ou emoji estilizado (`🐠` dourado customizado com efeito brilhante).
      - Halo circular com efeito de pulso d'água translúcido (`animate-ping` suave).
      - Partículas de luz cintilantes ao redor (estrelinhas douradas flutuando).
      - Touch target invisível ampliado para **64x64px** garantindo facilidade de clique no celular enquanto o peixe nada pela tela.

---

## 📖 4. Atualização do README.md

- [ ] **Revisão Completa para Refletir o Estado Atual**:
  - [ ] Adicionar seção sobre a **Árvore de Maestria & Talentos** (3 ramos: Pescador de Elite, Magnata e Místico, com 18 talentos e 3 Keystones).
  - [ ] Adicionar seção sobre o **Aquário & Viveiro de Troféus** (gestão de espécies expostas, visitantes, alimentação e decorações).
  - [ ] Adicionar seção sobre o **Sistema de Renascimento & Prestígio Cósmico** (Escamas Cósmicas e Bênçãos de Poseidon).
  - [ ] Adicionar seção sobre a **Tripulação Automatizada (Idle Fishers & Upgrades)** (estilo Cookie Clicker, CPS, boias temáticas na água).
  - [ ] Adicionar seção sobre **Missões Diárias & Conquistas** (sistema de objetivos com progresso diário).
  - [ ] Adicionar seção sobre **Clima Dinâmico em Tempo Real** (ensolarado, chuva, tempestade, névoa e lua mística).
  - [ ] Atualizar tabela de arquitetura de pastas com os novos componentes e managers.
  - [ ] Atualizar capturas e instruções de execução.

---

## 💎 5. Sugestões de Polimento & Novas Adições

- [ ] **Efeitos Visuais de Clima no Cenário**:
  - Gotas de chuva caindo com micro-ondulações na superfície d'água durante clima chuvoso.
  - Céu estrelado e reflexo prateado na água durante o clima de Lua Mística.
- [ ] **Controle de Volume / Áudio**:
  - Além do botão Mute atual, adicionar slider ou seleção de volume (SFX / Ambiente) nas configurações.
- [ ] **Backup de Save (Exportar / Importar JSON)**:
  - Botão para exportar o progresso em arquivo JSON e importar em outro dispositivo ou navegador.
- [ ] **PWA (Progressive Web App)**:
  - Manifesto web e service worker para permitir "Adicionar à Tela de Início" no Android/iOS, funcionando como app nativo com tela cheia.
- [ ] **Evento Especial de Bioma (Peixe Lendário Chefe)**:
  - Aparição rara de um desafio de pesca com múltiplas fases de tensão na linha para capturar um peixe colossal único de cada bioma.
