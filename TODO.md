# 📋 Plano de Evolução, Balanceamento e Polimento — Jogo de Pesca

Este documento reúne o planejamento estratégico, ajustes de balanceamento econômico, refinamento de interface mobile, polimento audiovisual e próximas adições para elevar o jogo ao seu mais alto padrão de qualidade e retenção.

---

## 📱 1. Ajustes de CSS & Experiência Mobile

- [x] **Dock / Barra de Ações Inferior para Mobile (Bottom Navigation Dock)**
  - *Problema atual*: O `HeaderBar` possuía 9 botões de funcionalidades. No celular sobrecarregava a área superior.
  - *Solução implementada*: Criado o componente `MobileBottomDock` com navegação ergonômica inferior (`fixed bottom-0 left-0 right-0`), abas principais (Pescar, Cesto, Loja, Missões, Talentos, Menu "Mais" com gaveta deslizante/bottom-sheet), badges dinâmicos e botões com touch targets confortáveis de 48px e `touch-manipulation`.
- [x] **Otimização dos Modais em Telas Pequenas**
  - [x] Ajustado para `w-[96vw] sm:w-full` e `max-h-[88vh]` com rolagem interna suave nos modais principais (`InventoryModal`, `ShopModal`, `TalentModal`, etc.).
  - [x] Corrigido o modal de **Ascensão Cósmica (`PrestigeModal`)**: anteriormente os cartões de estatísticas, barra de progresso e rodapé ficavam empilhados fixos, empurrando o conteúdo para fora da tela no mobile. Agora todo o miolo (estatísticas compactas em grid de 3 colunas, barra de progresso e lista de bênçãos) é rolável em um único container, com cabeçalho e botão de ascensão fixos e visíveis em 100% das telas móveis.
  - [x] **Enciclopédia do Bestiário Persistente & Silhuetas Misteriosas (`BestiaryModal`)**: 
    - Os peixes descobertos agora são gravados permanentemente no perfil do jogador (`discoveredFish`) e nunca mais são esquecidos, mesmo após vendê-los do inventário, transferi-los para o aquário ou ascender na Ascensão Cósmica.
    - Peixes ainda não capturados têm sua imagem fortemente borrada (`blur-md grayscale brightness-40 opacity-30`) com um ponto de interrogação cósmico pulsante para manter a curiosidade e mistério. Seus nomes aparecem como `"??? (Espécie Misteriosa)"`, com dicas dos habitats onde podem ser encontrados para orientar a exploração.
    - Peixes descobertos exibem o nome real com cores de raridade vivas, imagem nítida com efeito holográfico, selo de captura, maior peso pescado pelo jogador e total de capturas na carreira.
    - Adicionada barra de progresso geral de catalogação (`X de 24 espécies - Y%`), abas de filtro por bioma e busca rápida com suporte a mobile.
  - [x] Cabeçalhos fixos com `shrink-0` e botões de fechamento (`X`) com touch target aumentado (`w-10 h-10`).
  - [x] Barras de abas horizontais com suporte a rolagem horizontal suave (`overflow-x-auto shrink-0 whitespace-nowrap`).
- [x] **Aprimoramento do Palco de Pesca no Celular (`FishingStage`) & `ReelTensionMeter`**
  - [x] Área de água interativa configurada com `touch-manipulation` e `select-none` para eliminar latência e prevenir zoom de duplo clique indesejado.
  - [x] Botões de ação de pesca (`LANÇAR LINHA` / `PUXAR LINHA AGORA`) ampliados para altura mínima de 50px com transições responsivas.
  - [x] `ReelTensionMeter` adaptado para `w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto`, com botões direcionais e carretilha com touch target de 44px-52px e suporte nativo ao toque contínuo.

---

## ⚖️ 2. Balanceamento da Economia & Progressão (XP, Moedas, Escamas)

### A. Progressão de Níveis & Curva de XP
- [x] **Calibração da Curva & Recompensas de XP**:
  - `baseXpPerLevel` ajustado de 80 para 110 e `levelMultiplier` suavizado de 1.6 para 1.55. A progressão inicial é acolhedora e o avanço pelos níveis intermediários (8 a 13) flui de maneira recompensadora sem travas artificiais.
  - XP concedido por peixes recalibrado por bioma e raridade (espécies raras, épicas e lendárias concedem entre 30 e 400 XP).
  - Adicionado bônus de maestria de **+20% de XP** ao acertar a fisgada perfeita no minigame ativo de carretilha/tensão.
  - Ajustados os níveis de desbloqueio dos biomas: Pântano Sombrio (Nv 6), Mar Aberto (Nv 9) e Abismo Oceânico (Nv 13), garantindo tempo hábil para usufruir de cada ecossistema.

### B. Economia de Moedas & Retorno sobre Investimento (ROI)
- [x] **Ajustes de Preços, Varas, Iscas e Renda**:
  - Multiplicadores de raridade calibrados: Comum (1.0x), Incomum (1.6x), Raro (2.8x), Épico (5.5x), Lendário (12.0x), prevenindo hiperinflação precoce.
  - Introduzido bônus de **Espécime Troféu (`trophyWeightThreshold: 0.85`, `trophyPriceBonus: 1.25`)**: peixes com peso no percentil superior recebem +25% no valor de venda, identificado com selo `🏆 Troféu (+25%)` no cesto e notificação no ato da venda.
  - Varas e iscas recalibradas em valor e nível necessário para acompanhar harmonicamente a evolução das receitas do pescador.
- [x] **Rebalanceamento Abrangente da Produção Passiva (Idle Helpers / Cookie Clicker)**:
  - **Diagnóstico resolvido**: Em 2 dias de jogo, ajudantes geravam 1.13M 🪙/s e 2.2 bilhões de moedas devido à base desproporcional do Santuário de Poseidon (45.000 CPS), upgrades com IDs incorretos e recompensa desregulada do Peixe Dourado (900s de CPS instantâneo).
  - **Recalibração das Taxas de CPS & Custos**:
    - *Vara de Bambu*: 0.25 🪙/s (custo base 25, Nível 1).
    - *Gato Pescador*: 1.5 🪙/s (custo base 220, Nível 2).
    - *Seu Zé Aposentado*: 9.0 🪙/s (custo base 1.800, Nível 4).
    - *Canoa de Arrasto*: 55.0 🪙/s (custo base 16.000, Nível 7).
    - *Brigada de Ariranhas*: 280.0 🪙/s (custo base 140.000, Nível 10).
    - *Traineira a Vapor*: 1.500.0 🪙/s (custo base 1.200.000, Nível 13).
    - *Santuário de Poseidon*: 7.500.0 🪙/s (custo base 12.000.000, Nível 16).
  - **Capacidade Máxima por Nível do Pescador (`getMaxCpsCapacity`)**: Criada fórmula de teto suave ($\text{nível}^2 \times 60 \times (1 + \text{ascensões} \times 0.5)$) com retorno amortecido além da capacidade da licença. Valoriza a pesca manual e o avanço de níveis para desbloquear maior potencial passivo.
  - **Correção dos Upgrades de Multiplicação**: Corrigidos os IDs em `upgrades.data.ts` (`canoe_net`, `otter_brigade`, `trawler_ship`), reajustando custos e multiplicadores.
  - **Equilíbrio do Peixe Dourado (*Golden Fish*)**: Frenesi de Produção reduzido para 3x por 30s (era 7x por 45s); Frenesi de Clique reduzido para 15x por 15s (era 77x); Cardume Abundante recalibrado para 60s de CPS (era 900s uncapped).
  - **Eficiência Offline Justa**: Rendimento offline limitado a 4 horas com eficiência equilibrada de 65% (100% no loop ativo com a aba aberta ou via Bênção Cósmica).
  - **Migração Retroativa de Sanidade Econômica (`economyRebalancedV2`)**: Saves afetados pelo bug da moeda infinita têm valores hiperinflados normalizados de forma graciosa e farta (500.000 moedas e ajudantes de ponta suavizados), preservando a diversão, os desafios e o ciclo de jogo.

### C. Escamas Cósmicas & Prestígio (Ascensão)
- [x] **Refinamento da Curva de Escamas & Bênçãos Celestiais (V3)**:
  - Curva quadrática contínua: $35.000 \cdot n^2 + 25.000 \cdot n$.
    - 1ª escama: 60.000 moedas
    - 2ª escama: 190.000 moedas
    - 3ª escama: 390.000 moedas
    - 4ª escama: 660.000 moedas
    - 5ª escama: 1.000.000 moedas
    - 10ª escama: 3.750.000 moedas
    - 25ª escama: 22.500.000 moedas
  - **Requisito Mínimo de Nível**: Agora exige no mínimo **Nível 10 do Pescador** para realizar a Ascensão Cósmica, impedindo ascensões prematuras e garantindo que o jogador vivencie a progressão mortal completa antes de alcançar as estrelas.
  - **Fórmula de Bônus Calibrada**: Substituído o multiplicador desenfreado por retornos suaves e proporcionais (1.0% por escama até 50, 0.5% até 150 e 0.2% acima).
  - **Catálogo Expandido com 13 Bênçãos Cósmicas em 3 Tiers**:
    - *Tier 1 (Iniciação, 1 a 5 🌟)*: Ímã Astral de Peixes Dourados (+35% freq), Herança do Pescador Ancião (1.500 🪙 iniciais), Ressonância das Marés (+35% clique na água), Sorte das Constelações (+15% peixes raros/épicos/lendários).
    - *Tier 2 (Mestria, 10 a 30 🌟)*: Ampulheta Cósmica das Marés (10h offline cap), Vigília Noturna Perfeita (100% rendimento offline), Aquário dos Deuses (2x gorjetas de visitantes), Sabedoria das Estrelas (+25% XP), Correnteza Divina de Poseidon (+30% CPS geral).
    - *Tier 3 (Apoteose, 45 a 120 🌟)*: Olhar do Colecionador Mítico (+50% valor peixe troféu), Extensão de Frenesi Astral (+50% duração buffs dourados), Alquimia das Iscas (20% chance de não consumir isca), Coroa das Profundezas (+1 Ponto de Talento bônus permanente por ascensão).
  - **Migração Retroativa de Sanidade Cósmica (`ascensionRebalancedV3`)**: Corrige saves inflacionados pelo bug antigo (ex: 520B moedas e 3812 escamas no Nível 7), atribuindo valores de moedas históricas justas e concedendo 6 a 8 Escamas Cósmicas prontas para gastar no novo catálogo de 13 bênçãos.
  - **UI Refinada do `PrestigeModal`**: Filtro por Tiers (Todas, Iniciação, Mestria, Apoteose), detalhes completos de bênçãos ativas e botão de ascensão com trava clara de nível.

---

## ✨ 3. Peixe Dourado (*Golden Fish*) — Frequência & Visual

- [x] **Frequência & Raridade Autêntica**:
  - *Modo Base*: intervalo ampliado para **110s a 200s** (~1.8 a 3.3 minutos), transformando a aparição em um evento genuinamente raro e excitante.
  - *Com talentos/bênçãos*: com o talento *Bênção de Netuno* (2.0x) e a bênção cósmica *Ímã Astral de Peixes Dourados* (1.35x), o intervalo reduz para **65s a 115s**.
  - *Durante o clima Lua Mística*: spawn acelerado especial a cada **40s a 70s**.
  - *Primeiro Spawn*: agendado somente após **60s a 110s** de pescaria ativa.
- [x] **Design Visual Inspirado no Aquário (Adeus ao Emoji)**:
  - Substituição total do emoji genérico por uma **ilustração vetorial SVG estilizada de Peixe Dourado Lendário** inspirada no design orgânico do aquário:
    - Corpo aerodinâmico em gradiente metálico dourado-âmbar (`#fffbeb` a `#92400e`).
    - Cauda em leque articulada com ondulação contínua de nado via Motion (`animate={{ rotate: [-14, 14, -14] }}`).
    - Barbatanas dorsal, peitoral e ventral translúcidas com flutter realista.
    - Olho vivo com esclera, pupila e ponto de brilho especular.
    - Orientação dinâmica: inverte o eixo horizontal (`scaleX`) automaticamente para a direção em que nada.
    - Aura aquática etérea com ondulações líquidas em expansão concêntrica e estrelas cadentes orbitantes.
- [x] **Desaparecimento Instantâneo ao Clicar**:
  - Correção do tempo de animação de saída: ao ser tocado, o peixe encolhe e desaparece em apenas **180ms** (`scale: 0.1, opacity: 0`).
  - Cancelamento imediato do temporizador de despawn e disparo instantâneo da celebração com confetes dourados, áudio e vibração tátil.
  - Reagendamento automático e limpo do próximo spawn raro sem closures órfãs.

---

## 📖 4. Atualização do README.md

- [x] **Revisão Completa para Refletir o Estado Atual**:
  - [x] Adicionar seção sobre a **Árvore de Maestria & Talentos** (3 ramos: Pescador de Elite, Magnata e Místico, com 18 talentos e 3 Keystones).
  - [x] Adicionar seção sobre o **Aquário & Viveiro de Troféus** (gestão de espécies expostas em Canvas 2D, visitantes, alimentação, estado de êxtase e decorações).
  - [x] Adicionar seção sobre o **Sistema de Renascimento & Prestígio Cósmico** (Escamas Cósmicas, Tiers de Bênçãos de Poseidon, requisito de Nível 10 e Sanidade Cósmica).
  - [x] Adicionar seção sobre a **Tripulação Automatizada (Idle Fishers & Upgrades)** (estilo Cookie Clicker, CPS, boias e embarcações temáticas flutuando na água).
  - [x] Adicionar seção sobre o **Peixe Dourado Lendário** (silhueta vetorial orgânica, raridade de 110-200s, desaparecimento instantâneo e frenesis de 7x CPS e 77x clique).
  - [x] Adicionar seção sobre **Missões Diárias & Conquistas** (sistema de objetivos com progresso diário e marcos).
  - [x] Adicionar seção sobre **Clima Dinâmico em Tempo Real** (tabela com os 5 climas e multiplicadores de mordida, XP e peixes raros).
  - [x] Atualizar tabela de arquitetura de pastas com os 26 componentes React e 10 game managers.
  - [x] Atualizar instruções de execução e compilação do projeto.

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
