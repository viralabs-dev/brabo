---
id: historico-de-fases-parte-2
title: "Histórico de fases, parte 2: Programa 16–26 e rodadas"
sidebar_label: Programa 16–26 e rodadas, parte 2
description: "O Programa 16–26 e as rodadas exp003 e exp001: o que o uso real pediu depois da fase 15."
keywords: [histórico, fases, ADR, RN]
tipo: historico
---

# Histórico de fases, parte 2: Programa 16–26 e rodadas

:::historico 2026-09-11
O Programa 16–26 (o que a primeira navegação real pediu), o que o uso pediu depois e as rodadas exp003 e exp001.
Texto movido sem reescrita do [Histórico de fases](historico-de-fases.md). O que vale hoje mora nas RNs e nos ADRs.
:::

## PROGRAMA 16–26 — o que a navegação pediu (em execução)
Onze pedidos nascidos da PRIMEIRA navegação real na app depois do reset do
banco. Não é roteiro: é uso. Três descobertas da investigação definiram o
tamanho e a ORDEM do programa, e vale registrar cada uma, porque nenhuma
estava no pedido original:

1. Existe um handoff de design COMPLETO em `design_handoff_brabo/` — 8 telas
   de alta fidelidade, tokens, tipografia e marca. A decisão foi adotá-lo
   INTEIRO e PRIMEIRO: assim os onze pedidos nascem no visual novo em vez de
   serem feitos duas vezes.
2. O terminal da aba Code virou decisão de ARQUITETURA. Cada projeto passa a
   ter container próprio, e é o ARQUITETO quem decide a imagem. Dentro dele o
   agente é livre; `git push`, PR e deploy continuam humanos. Isso paga a
   maior dívida aberta do produto — hoje o agente executa no MESMO container
   que o monorepo do Brabo, e o ADR 0055 diz de si que é política, não
   isolamento.
3. Dois defeitos reais apareceram no caminho, e nenhum foi pedido:
   `agent_areas` NUNCA é gravada (`upsert` sem chamador, a API devolve `[]`),
   e a gaveta do sino ordena `seq ASC` no SQL — mostra os mais ANTIGOS.

Teto de execução: no máximo QUATRO subagentes em paralelo. As fases foram
cortadas por ARQUIVO DISPUTADO, não por tema — é o que torna o paralelismo
possível. O limitador do backend é `apps/api/src/db/migrations/meta/_journal.json`
e os snapshots do drizzle: UMA migration por onda, porque resolver conflito de
snapshot à mão é caminho para schema divergente. Faixas de RN e números de ADR
são PRÉ-ALOCADOS antes de a onda começar: duas fases paralelas escrevendo
`RN-094` fazem uma renumerar no merge, e RN renumerada quebra os links
`#rn-0xx` que o `pnpm docs:check` reprova.

### FASE 16 — CONCLUÍDA: fundações (destravar o paralelismo)
Nenhum dos onze pedidos entrega aqui. A fase existe porque três deles tocam
os MESMOS quatro pontos de `router.tsx`/`ProjectPage.tsx`, e outros três
esbarram na falta de peça comum. Sem ela, as ondas colapsam para execução
serial.
1. `design/tokens.css` recebe `--violet` (agentes/IA) e o que mais o handoff
   define. As fontes CONTINUAM self-hosted — seguir o handoff aí quebraria a
   app sob o CSP do nginx (ADR 0036). O teste de contraste cobre os pares
   novos, e a dívida conhecida de 4 pares segue travada.
2. A aba deixa de ser lista fechada em DOIS lugares: registro único de onde
   `PROJECT_TABS`, `type TabKey`, a régua e o render passam a derivar. Teste
   que reprova chave num lugar e ausente no outro — é o defeito real.
3. `Disclosure` no design system, com a semântica da implementação mais
   completa que já existe (`ModelCatalogSection`). COMPONENTE SÓ: nenhuma das
   seis implementações ad-hoc migra aqui, senão a fase abriria os três
   arquivos mais disputados do programa.
4. Rótulo de sessão vira helper e os cinco `slice(0, 8)` inline migram. É
   esta migração que impede a FASE 20 de colidir com a 19.
5. `CLAUDE.md` entra na definição de pronto (ver a seção de Documentação), com
   regra `warn` no docmap. ENTREGUE: a regra é `claude-md` em
   docs/.docmap.yml, disparada por `package.json`, `pnpm-workspace.yaml`,
   `apps/*/package.json`, `apps/engine/mix.exs`, `docs/adr/*.md` e
   `docs/gates.yml` — a frase "hoje ele tem ZERO cobertura" que estava aqui
   descrevia o estado ANTES da fase e ficou mentindo depois dela.

### FASE 17 — CONCLUÍDA: as 8 telas conforme o handoff
Fidelidade visual ANTES do comportamento, para não refazer trabalho. Nenhuma
regra de negócio muda: se uma tela precisar de dado que não existe, isso vira
pendência declarada, não feature de carona.
6. Login e App/lista de projetos.
7. Projeto e Sessão, preservando os três estados da RN-088 (erro antes de vazio).
8. Aprovações e Configurações — Aprovações é a base visual da FASE 19.
9. Prova de que a fidelidade aconteceu: contraste medido sobre os tokens e
   layout verificado por `scripts/dev/validacao-visual.js` em TODAS as telas
   tocadas. O `.dc.html` é referência, NÃO código para copiar — o próprio
   README do handoff diz isso.

### FASE 18 — CONCLUÍDA: a área existe no banco (defeito, corrigido antes)
10. `AgentAreaRepository.upsert` não tem NENHUM chamador, então quatro casos
    de uso operam sobre tabela vazia. Provisionar na criação do projeto +
    backfill, com teste que prova que projeto recém-criado TEM áreas — é a
    mesma falha da FASE 14d: testar a peça não é testar o caminho até ela.
11. Colapsar as TRÊS cópias da lista de áreas (api, web, engine) em uma fonte.

### FASE 19 — CONCLUÍDA: aprovação que se lê
12. Matar o fallback genérico do `ApprovalCard`, que despeja
    `chave: JSON.stringify(valor)` — a causa provável do "difícil de ler".
    Todo tipo ganha FRASE em pt-BR; tipo sem frase mostra verbo + "ver
    detalhes" e o payload cru nasce COLAPSADO, nunca despejado.
13. Colapso nos TRÊS lugares: Aprovações, Insights e o card no chat, com verbo
    e frase saindo de UM módulo.
14. Restrição de projeto: o colapso NÃO introduz prop nova obrigatória em
    `ApprovalCard`. É isso que mantém `SessionPage.tsx` intocado e tira a
    aresta com a FASE 20.

### FASE 20 — CONCLUÍDA: a sessão ganha identidade
15. `sessions` ganha `kind` e `name` na MESMA migration — duas migrations
    sobre a mesma tabela colidem no journal e nos snapshots.
16. Reconciliar com a derivação por evento: `kind` classifica a INTENÇÃO de
    criação, `execution.activated` continua classificando ESTADO de execução,
    e nenhum reescreve o outro. `execution.activated` em sessão consultiva é
    erro explícito, não conversão silenciosa.
17. Renomear preservando a hashtag; sem nome, degrada para ela sozinha.
18. Botão de voltar ao dashboard — hoje `SessionPage.tsx` não importa `Link`
    nem `useNavigate`, e NENHUMA navegação sai da tela. Destino revisto numa
    rodada posterior: o botão volta ao PROJETO da sessão
    (`/projects/:projectId`), não mais ao dashboard raiz — a sessão sempre
    nasce dentro de um projeto.

### FASE 21 — CONCLUÍDA: o volume de eventos (RN-099/100)
19. `useSessionEvents` continua sendo o ESTADO ATUAL (`latest`, quatro
    consumidores: roster, árvore, execução, Aprovações). O HISTÓRICO virou
    `useSessionEventHistory`, só para as Atividades, com o `afterSeq` que o
    endpoint já devolvia. Nenhuma rota nova, nenhum parâmetro novo.
    A âncora é a CAUDA, e não o começo da sessão: o endpoint pagina para
    frente e não existe `beforeSeq`, mas abrir o feed no evento nº 1 de uma
    sessão de milhares entrega a tela errada. Então a primeira página é a
    mesma leitura `latest` (MESMA `queryKey`, deduplicada) e cada clique desce
    uma janela fixa para trás.
20. O sino ordena `DESC` no SQL. O corte de "lido" NÃO mudou de semântica, e
    por isso não há ADR: um corte por `seq` marca um PREFIXO e a gaveta mostra
    um SUFIXO, então "marcar as 50 exibidas" é inexprimível sem tabela de
    lidos por evento. O que mudou é a gaveta parar de esconder o que o avanço
    engole — total por projeto, `+ N mais antigos`, e o botão dizendo quantas
    marca. O número que falta sai de SUBTRAÇÃO (`latestSeq` menos o corte),
    não de requisição.
21. A economia da RN-090/091 não regrediu: uma requisição por ciclo, e o
    primeiro "carregar mais antigos" custa ZERO — a leitura `latest` traz 200
    e a janela mostra 100. Página antiga tem `staleTime: Infinity` e nenhum
    `refetchInterval`: janela fechada de `seq` sobre evento imutável não muda.

### FASE 22 — CONCLUÍDA em 2026-08-09 (gasto com duas audiências)
Entregue como a aba **Gastos** (ADR 0063, RN-101).
22. As AGREGAÇÕES que faltavam entraram num método só —
    `sumGroupedBy(dimensao, escopo)` com `model`, `project`, `actor`,
    `session` e `day`. `provider` NÃO é dimensão dele, e a ausência é
    estrutural: quebrar por provider é quebrar por CREDENCIAL, e é isso
    que impede a visão do membro de ganhar o eixo por descuido — não há
    argumento a passar.
23. Sem lib de gráficos: barras diárias e ranking em SVG inline. A série
    diária vem DENSA da api (dia sem gasto entra com zero), senão três
    chamadas em três semanas viram três barras coladas.
24. A colisão foi resolvida separando as PERGUNTAS, não os filtros. O
    relatório por CREDENCIAL segue exclusivo do owner (RN-060) e ganhou
    ao lado a quebra do workspace por modelo/projeto/ator/dia, também
    `owner`. A visão do membro é por ATOR, em tokens e custo estimado,
    sem provider e sem credencial — e o ator sai do TOKEN autenticado,
    sem parâmetro onde escrever o id de outra pessoa. Agente não entra na
    conta do membro: `token_usage` registra quem gastou, não quem mandou
    gastar.

Sem migration, mas COM medição: a 525 mil linhas as consultas saem em
55 ms e 38 ms por seq scan, e um índice em `token_usage(created_at)` as
levaria a 32 ms e 19 ms. O número está no ADR; o índice entra na onda que
tiver o slot.

### FASE 23 — CONCLUÍDA em 2026-08-09 (modelo herdável por área)
25. Escopo `area` entrou na cascata (`sessão > agente > área > projeto >
    workspace`), ENTRE agente e projeto: é o padrão que lead e subagentes
    compartilham, e o agente diverge sobrepondo-o (ADR 0064, RN-102).
26. A incoerência resolvida ANTES de codar: o binding de agente era GLOBAL
    (`scope_id` = slug puro, `:projectId` da rota ignorado desde a Fase 9a) e
    área é por projeto desde o ADR 0053. Escopo por projeto acima de escopo
    global faria o mesmo agente resolver modelos diferentes só onde houvesse
    área. Decisão: o binding de agente passou a ser por projeto também —
    `scope_id` de `agent`/`area` virou composto, `<projectId>:<slug|chave>`
    (RN-103) — e não a área abaixo do agente, que contrariaria "padrão
    herdável" (quase todo binding hoje é de agente).
27. A UI mostra quem HERDA e quem DIVERGIU (`AreaModelsSection` e a coluna
    Origem de `ModelsSection`, em `ProjectSettingsTab.tsx`); "voltar a
    herdar" é `DELETE` no binding do agente/área, nunca grava nele o modelo
    do nível de baixo — copiar viraria cópia que diverge sozinha na próxima
    mudança da área. Papel `maintainer` para mudar o modelo da área (mesma
    régua do teto de paralelismo, RN-083); o do agente continua `developer`.

### FASE 24 — CONCLUÍDA: Chat e Criativo como lugares (RN-104)
28. Duas abas na tela de PROJETO, cada uma listando as sessões do seu `kind` e
    criando naquele `kind` sem perguntar de novo. A Sessão continua tela
    própria — a aba não virou contêiner de chat.
29. A colisão foi resolvida com "Sessões" SAINDO da régua. O que ficou dela é
    a CHAVE de deep-link: o Chat carrega `key: 'sessions'`, e é isso que faz um
    `?tab=sessions` antigo abrir no Chat com a aba MARCADA. Alias resolvido só
    no painel abriria o painel certo e deixaria a régua sem seleção, porque
    `Tabs` compara `active` com `key` e quem escreve `active` é o
    `ProjectPage` — um dos dois arquivos que a onda manteve fechados.
30. **Veredito sobre "Iniciar ideação"**: ele FICA. Metade do problema já tinha
    fechado na FASE 20 (o botão sumiu da sessão consultiva, RN-097), e a outra
    metade não era redundância: é ele que traz o Criativo, e é daí em diante
    que a chave do owner é gasta (RN-058). O que estava errado era o LUGAR — o
    convite gastava um parágrafo apontando para a topbar. Agora a ação mora
    DENTRO do convite enquanto ele está na tela, e volta à topbar quando não
    está; `conviteVisivel` é a única pergunta que os dois compartilham, para
    que não apareça em dobro nem desapareça.

### FASE 25 — CONCLUÍDA COM CORTE: Container por projeto (a fronteira deixa de ser só política)
A maior mudança arquitetural do programa, e a que paga a dívida que as Fases B
e F já apontavam separadamente. Entregue 25a (a decisão do Arquiteto e o
portão) e 25c (a fronteira de efeito externo); 25b (o ciclo de vida do
container) ficou CORTADA e declarada — não meio-implementada (ADR 0065, RN-105
e RN-106).
30. CONCLUÍDO: o ARQUITETO decide qual imagem sobe para o projeto, como
    artefato dele (`artifact.project_image` no event log, versionado, sem
    tabela) — auditável, não configuração escondida. Enquanto ele não
    decidir, a aba Code responde 409 e não libera (RN-105).
31. NÃO ENTREGUE À ÉPOCA, declarado: ciclo de vida por projeto (provisionar,
    reciclar, limpar, teto de recursos aplicado de verdade), com o worktree
    do agente vivendo dentro do container. Estado de container é MUTÁVEL e
    pedia tabela própria — improvisá-lo no event log só para não esperar o
    slot de migration produziria a correção logo depois.
    PARCIALMENTE REVOGADO pela Onda 4/frente F1 do PROGRAMA 28: a TABELA de
    estado (`project_containers`, ADR 0081) chegou. O que continua faltando,
    sem atenuar, é a metade que fazia a tabela valer alguma coisa: nenhum
    orquestrador real chama Docker ainda, e o worktree do agente segue fora
    do container. A metade "dentro o agente é livre" da política de terminal
    AINDA NÃO mudou — o ADR 0055 continua valendo como está até o container
    subir de verdade.
32. CONCLUÍDO À ÉPOCA, REVISADO pelo runner local (ADR 0102/0103, RN-418):
    a fronteira de efeito externo. `git push`, PR e deploy não saem pelo
    terminal — nem dentro do escopo do projeto —, e a regra ERA `deny`
    (não `require_approval`, por causa do "sempre permitir"), com a
    mensagem redirecionando para a ação TIPADA (`git_push`/`git_merge`/
    `pr_open`), que nasce `proposed_action` (RN-106, revisada). O `deny`
    virou TETO ABSOLUTO (`require_approval` incondicional, nunca
    auto-aprovável) — decisão do dono do produto, "sempre permitir" fechado
    na fonte para não virar decorativo (ver a seção do runner local). Merge em protegida
    segue manual (RN-014), intocado. Rede e gasto têm veredito próprio no
    ARTEFATO da imagem (`network: none`/`egress`, teto de cpus/memória/pids
    que recusa em vez de rebaixar em silêncio) — decidido UMA vez, não
    comando a comando, pelo mesmo motivo que Z e AD provaram que allowlist de
    verbo não converge. O fechamento de Z e AD em si depende de 25b (a
    parede física), que ainda não subiu.

### FASE 26 — CONCLUÍDA: Code, só leitura
33. CONCLUÍDO (26a): `GitProviderContract` ganhou `listTree` e diff de PR
    (11ª/12ª operação), capability declarada SÓ quando provada pela suite.
34. CONCLUÍDO (26b): as quatro rotas de `code.controller.ts` — árvore,
    arquivo, busca e diff — atrás da checagem CENTRALIZADA da RN-092/095, com
    teto e cache na busca (que é COMPOSTA, não operação do contrato).
35. CONCLUÍDO: a tela (`ProjectCodeTab`/`code/*`), registrada em
    `project-tabs.ts` sem tocar `router.tsx`/`ProjectPage.tsx`. Rail
    (Explorador/Buscar — os únicos com dado real), explorador carregado por
    DIRETÓRIO, abas de editor com breadcrumb, busca real com
    `filesScanned`/`truncated`, diff de PR por id conhecido (com
    `patch: null` tratado como "sem texto", nunca "sem mudança"). Realce de
    sintaxe é tokenizer PRÓPRIO por regex (`code/highlight.ts`) — ZERO
    dependência nova, contra os 15-90 KB de Prism/highlight.js/Shiki para o
    que a aba precisa; três tokens novos de cor (`--syntax-function/
    -comment/-operator`) calibrados a 4,5:1 contra `--code-bg` nos DOIS
    temas. O quarto estado da RN-088 — bloqueada por decisão pendente do
    Arquiteto (RN-105) — virou RN-107, perguntado ANTES de tentar ler
    código, com reconsulta própria a cada 15s enquanto bloqueada.

    Pendências DECLARADAS, sem dado real por trás: terminal interativo
    (FASE 25b, que segue cortada — estado vazio honesto na aba), blame,
    lista de PRs dentro da aba (o diff só é alcançável por id
    conhecido, vindo de Aprovações) e painel de Problemas/lint/testes.
    Virtualização de linha também ficou de fora à época — o próprio handoff
    chama a aba de código "a mais custosa do programa"; o teto de 512 KB por
    arquivo (`GIT_BLOB_MAX_BYTES`) limitava o pior caso até então. FECHADA
    pela Onda 4/frente E2 do PROGRAMA 28 (RN-239..242): só a janela visível
    vira nó de DOM, e o minimapa reusa a mesma tokenização sem segundo
    passe.

### FASE 26b — CONCLUÍDA: fundação de blame, PRs navegáveis e branch rica
A fase começou como SÓ a camada de API, e a frase "nenhuma UI" que ficou aqui
descrevia o estado da PRIMEIRA leva — envelheceu e passou a ensinar errado. As
TRÊS UIs existem: o dropdown rico de branches (item 38, `CodeBranchPicker.tsx`),
o toggle de blame sob demanda (`CodeEditor.tsx`, RN-113) e a lista de PRs dentro
da aba (`CodeDiffPanel.tsx`), as duas últimas entregues na v3.0.0. As três
pendências declaradas de blame,
dropdown rico de branches e lista de PRs tocariam os MESMOS arquivos
(contrato, os três providers, o caso de uso, o controller, a suite de
contrato) se atacadas separadamente por agentes em paralelo; a decisão foi
entregar as três juntas, de uma vez, e deixar a UI de cada uma para três
agentes seguintes sem risco de colisão.
36. `GitProviderContract` ganhou `blame`, `listPullRequests` e
    `listBranchesDetailed` (13ª, 14ª e 15ª operação — RN-110/111/112),
    capability declarada só quando provada pela suite de contrato contra os
    três providers (`local` contra git de verdade; `github`/`gitlab`
    mockados — os smokes reais seguem pulados sem
    `GITHUB_TEST_TOKEN`/`GITLAB_TEST_TOKEN` no ambiente, mesma situação da
    FASE 13a). `listBranchesDetailed` é operação PRÓPRIA, não extensão de
    `listBranches` (RN-112) — enriquecer custa uma chamada extra ao provider
    POR BRANCH, e `listBranches` continua sendo a do bootstrap de Gitflow,
    que não paga esse custo.
37. Três rotas novas em `code.controller.ts` (`GET .../code/blame`,
    `GET .../code/pull-requests`, `GET .../code/branches`), mesmo `role:
    viewer` e a mesma checagem central de caminho (RN-095) das quatro
    anteriores. `apps/web/src/lib/api-client.ts`/`api-types.ts` ganharam as
    funções e tipos correspondentes (`getCodeBlame`, `getCodePullRequests`,
    `getCodeBranches`) para a onda seguinte consumir — `CodeShell.tsx` e
    `CodeDiffPanel.tsx` NÃO foram tocados além do comentário que documenta
    que a fundação já existe.
38. CONCLUÍDO: o dropdown rico de branches (RN-112) — `CodeBranchPicker.tsx`,
    aberto a partir de `CodeShell.tsx`, troca o campo de texto simples por um
    seletor listando cada branch com `ahead`/`behind` relativos à default e a
    PR associada, quando houver (`aberta`/`mesclada`/`fechada`). Ref fora da
    lista (tag ou sha) continua alcançável — `listBranchesDetailed` não
    enumera essas duas, então o rodapé do dropdown tem um campo manual.

**Congelamento do programa:** cada fase declara o que não faz, e o mais duro é
o da 26 — SÓ LEITURA de código, nenhum salvamento pela aba. A edição é fase
seguinte, e quando vier, escrita é efeito externo: nasce `proposed_action`.

## PÓS-PROGRAMA 16–26 — o que o uso pediu depois (RN-148)
Mesmo espírito da PÓS-FASE 15: não é fase planejada, é o que o USO pediu.
Histórias com promoção pendente ao mesmo tempo (RN-048/RN-126) viravam N
cards avulsos na timeline da sessão do PO quando ele produzia várias numa
leva. `Carousel` (`apps/web/src/components/ui/Carousel.tsx`) é o primeiro
componente de navegação item-por-item do design system — 2+ pendentes
viram UM carrossel navegável (setas, dots, teclado), com "Aprovar todas"
promovendo o lote inteiro numa chamada só (`promoteStories` já era lote,
sem mudança de contrato); 1 pendente continua o card simples de sempre. A
decisão de quando uma "leva" se forma é reavaliada a cada render — o
conjunto das promoções AINDA PENDENTES na sessão, não "criadas em sequência
sem interrupção" — para que resolver uma história no meio do carrossel
recalcule a leva sozinho, sem estado próprio a sincronizar.

**Projeto Local ou Container (RN-169/RN-170, ADR 0072).** Pedido do dono do
produto: "cruzar a fronteira de apenas escrever código no container e poder
escrever código a partir de uma pasta do usuário", com a variante de **caminho
livre digitado** escolhida por ele, ciente de que só funciona montado no
container. `projects` ganha (`workspace_mode`, `workspace_path`) na migração
`0043`, com `container` de default — nada muda para quem não escolhe. O ADR
0072 REVISA parte do 0065 e mexe no terreno do 0055, que decidiram a direção
contrária (a parede de container), e por isso a consequência está escrita sem
atenuar: a contenção ESTRUTURAL do `join(env, coluna)` — nenhuma coluna
corrompida saindo da raiz gerenciada — deixa de existir para projeto Local, e
o que sobra é a guarda da criação mais a revalidação léxica na leitura. A
FASE 25b continua cortada: projeto Local roda no MESMO container de hoje, só
a pasta mudou.

**Diagrama C4 do Arquiteto (RN-149, ADR 0068).** Entregável novo:
`create_c4_diagram` gera Context + Container (Simon Brown) em Mermaid,
renderizado na Visão Geral. O Container level é DERIVADO do `module_map`
vigente pelo caso de uso — nunca redigitado pelo modelo — para não abrir
uma segunda fonte que diverge da primeira; só o Context (nome do sistema e
atores externos) vem do tool call. `artifact.c4_diagram` é artefato sem
tabela, versionado no event log, mesmo desenho do `artifact.project_image`
(ADR 0065). `mermaid` entrou como dependência de RUNTIME nova do
`apps/web` — a primeira do tipo (o site de docs já usa Mermaid, mas em
build-time) — isolada atrás de `apps/web/src/lib/mermaid-render.ts` com
`import()` dinâmico; `vite build` confirmou que só o entrypoint carrega
eager e os chunks pesados do Mermaid ficam sob demanda, e nenhum deles usa
`eval`/`new Function` — o CSP fechado do ADR 0058 seguiu intacto, sem
mudança de configuração.

## RODADA exp003 — CONCLUÍDA (RN-150..162, PRs #278–#293)
Não é fase: são 17 pontos que o USO encontrou numa sessão de teste ao vivo
sobre o projeto `exp003`, corrigidos em cinco ondas sequenciadas por
ARQUIVO DISPUTADO — quatro delas convergindo em `SessionPage.tsx`, o que
obrigou a serializar. Vale a origem: nenhum destes foi achado por teste.

**O que a rodada ensinou, e vale mais que a lista**: a maior correção
(RN-155) era invisível a qualquer suite porque o defeito estava em comparar
dois espaços numéricos DIFERENTES que casualmente são ambos `number` — o
`event.seq` (gapless, por SESSÃO) contra o `action.seq`
(`proposed_actions.seq`, `bigserial` global de TODA a tabela, compartilhado
por todo projeto e toda sessão do sistema, e documentado no schema como
contraste deliberado). A ordem só parecia certa enquanto a tabela era
pequena. A correção não inventou campo: usou o evento
`proposed_action.created` que o `ProposeActionUseCase` já grava na MESMA
transação, com `payload.actionId` apontando de volta.

**Engine e leitura contida (RN-150)** — `search_workspace` devolvia TODOS
os hits, sem teto: a segunda causa real do `413` em revisão de PR, depois
da correção de `read_file`. Dois tetos INDEPENDENTES, porque a busca
estoura de duas formas — quantidade de hits (`SEARCH_WORKSPACE_MAX_HITS`,
500, sobre um `Stream` que PARA de escanear em `max_hits + 1`) e bytes do
texto final (`SEARCH_WORKSPACE_MAX_BYTES`, 32.768). Variáveis próprias, não
reaproveitadas das outras duas: mesma classe de estouro, divergir uma não
deve exigir tocar as outras. A marca de truncagem é dirigida ao MODELO
(manda refinar o termo) e nunca inventa um total, porque contar o total
pagaria de novo o I/O que o teto existe para evitar.

**Números que mentem (RN-151)** — o badge do projeto na sidebar contava
QUALQUER evento não lido: `exp003` mostrava 392 enquanto a aba Aprovações
do mesmo projeto mostrava 8. Um número que não corresponde a nada acionável
ao clicar é pior que nenhum. Virou `pendingApprovalsCount` no read model
que já existia (RN-090), numa agregação a mais no `Promise.all` — nunca
N+1.

**Rastreabilidade do que o agente produziu (RN-152)** — a branch
`feature/task-XXXXXXXX` no dropdown da aba Code passa a dizer de qual dev
agent e módulo ela é. O módulo sai do `module_map` vigente pelas MESMAS
funções que o geraram, nunca por regex reversa sobre o nome; sem vínculo,
degrada para `null` em vez de adivinhar.

**Auto mode (RN-153/154, ver Convenções)** — a curinga `actionType: "*"`.
O que importa é onde ela mora: a resolução é do REPOSITÓRIO (`findMode`),
e `decide.ts` não ganhou uma linha — é isso que torna os três tetos
absolutos verdadeiros por CONSTRUÇÃO, e não por mais um `if` que um dia
alguém esquece.

**O fio da sessão que se lê (RN-155..159)** — ordenação (acima); o
indicador de 5s com texto fixo "Reunindo informações..." em vez de
interpolar o agente, que já aparece no cabeçalho (RN-156); criação de
épico/história do PO virando aviso compacto em vez de bolha com o mesmo
peso visual de uma resposta de verdade (RN-157); Markdown leve com highlight
no chat por parser PRÓPRIO de regex, zero dependência nova e nenhum
`dangerouslySetInnerHTML`, e só a SAÍDA do agente é renderizada — o que o
humano digita fica literal (RN-158); e "Artefatos gerados" agrupado por
agente com o `Disclosure` da RN-138, cada artefato navegando para onde ele
vive (RN-159). O module_map/C4 ficou FORA por decisão registrada: é estado
VIGENTE do projeto, não artefato datado por sessão.

**Ordem de autoridade (RN-160/161, ADR 0069)** — "Confirmar arquitetura
pronta" só habilita com ao menos 1 história PROMOVIDA (não basta ter regra
capturada); e aceitar o handoff pro Dev Lead encadeia a ativação de
execução quando o papel efetivo de quem aceita já autoriza. A fusão é só no
cliente: o backend continua exigindo `maintainer` (RN-137), então ela evita
um clique redundante sem mover a fronteira de autorização.

**Entrada estruturada (RN-162)** — `ask_structured_questions`, do Criativo:
o modelo declara as perguntas em schema, o formulário é renderizado por
`StructuredQuestionCard`, e a resposta REUSA `SendAgentMessageUseCase` em
vez de abrir um segundo caminho de mensagem. Responder é ato único —
reenvio é 409, não sobrescrita.

## RODADA exp001 — o Criativo cumpre a promessa (RN-163)
Mesmo espírito das outras rodadas: veio do USO, não de roteiro. O relato foi
"o Criativo não respondeu depois de dizer que iria corrigir e tentar de novo",
e a frase era literal no código — `run_turn_capturing/1` chamava o modelo UMA
vez, despachava as ferramentas e voltava. O resultado da ferramenta entrava no
histórico em memória e ninguém mais o lia, então a correção prometida só
acontecia se o usuário mandasse outra mensagem.

O Criativo era o único conversacional sem laço de tool use; ganhou o mesmo do
PO, com teto próprio de 12. O que vale além da correção: **quem decide o que se
anuncia passou a ser o teto**, e não um texto fixo — a promessa de retentativa
só entra na frase quando ainda há volta para cumpri-la. Teto esgotado virou
`agent.error` narrado (o `po_server` terminava calado nesse caso, e essa era a
próxima dívida óbvia — fechada logo abaixo pela RN-166), e a falha de
ferramenta deixou de ser `agent.response`
— no event log ela era indistinguível de uma resposta normal e não dizia
origem nenhuma, exatamente o que a RN-059 fechou para a falha de turno.

## RODADA exp001 — o PO lê o que já existe e é cobrado (RN-164..166)
Não é fase: é um defeito achado por USO real, e a origem importa porque
nenhuma suite pegaria. O backlog saiu com épico e **nenhuma história** — logo
sem tarefa, logo a execução travada **sem erro nenhum**. A investigação achou
quatro causas empilhadas, e as três primeiras são a mesma: o PO não tinha como
saber e não tinha como avisar.

1. **O PO tinha quatro ferramentas e todas de ESCRITA.** O contexto era
   montado UMA vez, no kickoff, a partir dos 200 últimos eventos da SESSÃO —
   dali em diante ele nunca mais relia nada: não sabia quais regras existiam,
   quais já cobrira, nem o que ele próprio já criara. Entraram
   `listar_regras_de_negocio` e `listar_backlog` (RN-164), servidas por duas
   rotas internas escopadas ao PROJETO — e o escopo é o ponto: leitura por
   sessão era exatamente o que escondia a regra capturada antes. Reusam o
   encanamento que já existia (`listByTypeForProject`, `ListBacklogUseCase`,
   `computeCoverage`); o que faltava era a rota, o método no cliente e o tool.
2. **Nada cobrava a história depois do épico** e **o laço terminava calado**.
   Épico sem história virou desfecho EXPLÍCITO — `backlog.epic_without_story`,
   durável, no padrão da RN-059 (RN-165) — e o teto de iterações do `PoServer`
   passou a emitir `toolloop.limit_reached`, o MESMO tipo do `ToolLoop`, que
   os agentes conversacionais nunca emitiram por terem laço próprio (RN-166).
3. **A instrução de kickoff não dizia uma palavra sobre o que fazer quando
   falta informação** — e diante de uma lacuna sem instrução um modelo escolhe
   entre inventar e parar. Parar foi o que ele fez. A terceira saída passou a
   estar escrita, com a ferramenta para exercê-la: `ask_structured_questions`,
   a MESMA do Criativo (RN-162), agora advertida também ao PO.

Duas decisões de desenho que valem além deste caso: só o `create_story` que
**deu certo** quita a obrigação do épico (uma história recusada pela api não
cobriu nada, e tratá-la como se tivesse é trocar um silêncio por outro); e a
cobrança é por OCORRÊNCIA, reportada uma vez, nunca alarme que repete a cada
turno até alguém aprender a ignorá-lo.

## RODADA exp001 — o fio se lê como o turno acontece (RN-172/173)
Mesma origem das outras: USO, não roteiro. Quatro queixas sobre a tela da
Sessão — o handoff do PO aparecendo ACIMA da última fala dele, a aprovação
subindo para o meio da resposta do Arquiteto e só descendo quando ele
terminava, o card de aprovação "mal diagramado" e o scroll que não seguia a
conversa.

**A investigação achou que a ordenação estava CERTA**, e é essa a lição da
rodada. A RN-155 é fiel ao event log; o que o log diz é que
`po_server.ex#run_turn/2` emite, na MESMA iteração, o `agent.response`, DEPOIS
o `tool.call` de `offer_handoff` e SÓ ENTÃO recursa para a fala de fechamento
— logo o `seq` do handoff é honestamente MENOR que o da última fala. O mesmo
para `proposed_action.created`. A correção, portanto, não é de ordenação: é
uma regra de APRESENTAÇÃO declarada (RN-172), numa passada separada
(`afundarDesfechos`) DEPOIS do `sort` por `seq` — não um comparador com três
termos que ninguém saberia justificar um ano depois.

O que impede turnos de se misturarem são três barreiras, e cada uma existe
por um caso real: **turno** (a fronteira entre dois turnos pode não ter
entrada VISÍVEL — `agent.activated` abre turno e não vira item do fio),
**autor** (em sessão de execução vários agentes escrevem sem o usuário falar
nenhuma vez, e todos ficam no mesmo turno) e **não-desfecho** (dois desfechos
seguidos preservam a ordem entre si — Infra antes do Dev Lead).

A RN-173 fecha as outras duas queixas, e elas eram a mesma: o efeito de
scroll dependia só de `[events.length, streamingText]`, e `actions` é uma
query SEPARADA — um card chegando empurrava a conversa para fora da tela sem
rolar nada. Dependência corrigida, mais um `ResizeObserver` sobre o conteúdo
para o que NENHUMA lista de dependências alcança (colapso de `Disclosure`,
Markdown reflowando). A guarda dos 120px do fim continua intacta, de
propósito: o fio segue a conversa, não sequestra a leitura de quem subiu.

## RODADA exp001 — o fio diz quem fala, com qual modelo e o que pergunta (RN-171/174/175/176)
Mesma origem: USO. Quatro queixas sobre a tela da Sessão, e três delas
compartilham a mesma lição — **o produto sabia a informação e não a
mostrava**.

**A pergunta ao centro, e com saída (RN-171).** O relato foi literal: "sempre
dê a opção de input do usuário quando ele seleciona Escreva". O modelo
oferecia uma opção do tipo "Escreva você mesmo" e o formulário não tinha onde
escrever — o schema de `ask_structured_questions` não sabia expressar "além
destas, o que você quiser". `allowOther` entrou em `select` com **default
`true`**, e a assimetria é o argumento: lista fechada por ESQUECIMENTO trava a
conversa e o usuário não destrava de fora; lista aberta por engano oferece um
campo a mais. O sentinela de interface nunca viaja pro backend, e o botão de
envio continua exigindo tudo preenchido (o backend recusa com 400 de qualquer
forma). A caixa também virou centralizada com o teto de 560px do
`ApprovalCard` e ganhou avatar: era o único item do fio alinhado a nada.

**Ação que dispara turno arma o indicador (RN-174).** A animação de "pensando"
já existia — o que faltava era COBERTURA. Duas ações da tela disparam turno
síncrono no engine e não ligavam nada: responder o formulário
(`AnswerStructuredQuestionUseCase` reusa `SendAgentMessageUseCase`) e devolver
história ao PO (`ReturnStoryUseCase` chama `reviseStory`, que é
`handle_call({:revise, …})`). O canal Phoenix não cobre o buraco: com o join
ainda em curso (RN-108) o `agent.status` "working" não tem ouvinte e se perde.

**O modelo, para TODOS (RN-175).** A premissa de que o defeito era do PO não se
sustentou: os quatro conversacionais gravam `modelName` desde a RN-146, com
teste verde. Quem nunca gravou foi o **`ToolLoop`** — o caminho de todo agente
de execução e de gate — e o chat sem agente ativo na api. Nenhuma chamada
nova: `RunLlmTurnUseCase` já devolvia o campo no corpo. A tela deixou de
escrever a palavra solta "modelo" (que se lê como se o modelo se chamasse
assim) e virou chip legível; sem o dado, ela DIZ que não foi registrado —
adivinhar pelo binding atual atribuiria a uma resposta antiga um modelo que
talvez nem existisse, o mesmo erro que o preço congelado da RN-044 evita.

**Tabela em Markdown vira tabela (RN-176).** Duas saídas eram possíveis, e a
escolhida foi suportar tabela no Markdown do chat, com o `Table` do design
system. Renderizar `artifact.module_map` no fio foi RECUSADO por uma decisão
já registrada: ele é estado VIGENTE do projeto, não artefato datado por
sessão (RN-159), e vive na Visão Geral. Além disso, o pedido foi sobre a
tabela **dentro da mensagem** — e a correção serve a qualquer agente que
escreva uma, não só ao Mapa de Módulos. A linha separadora continua
obrigatória (GFM), então prosa com `|` nunca vira tabela por engano.

## RODADA exp001 — o painel agrupa, ordena e diz o que não mostra (RN-177..181)
Mesma origem das outras: USO, não roteiro. Cinco queixas sobre o painel de
contexto e o log da Sessão, e a lição da rodada é uma só — **o painel mostrava
um recorte como se fosse o todo, em três dimensões diferentes ao mesmo tempo**:
escondia seis tipos de evento sem oferecer alternativa, lia do mais antigo para
o mais novo, e cortava a sessão em 200 eventos sem dizer.

**Origem como classificação nova (RN-177).** `ActivityKind` responde "de que
ASSUNTO o evento fala" e decide ícone e cor; `origem` responde "de que CAMADA
ele veio", e é ela que torna o histórico legível — `eventos`, `sistema`, `llm`,
`harness`, `agente`, `usuario`, derivadas do dado que EXISTE (`actor.kind` e o
prefixo do `type`). A precedência é o que a torna previsível e está na ordem
dos `if`: mecanismo vence ator (um `tool.call` é do harness seja quem for), e
ator vence prefixo de agente (`chat.message` existe dos dois lados). As 5 mais
recentes ficam abertas e o resto se recolhe por origem, **nos dois lugares** —
no painel de log e no fio, onde o eixo é invertido (o fio é crescente, então o
histórico fica no TOPO). O filtro de ruído de máquina **continua ligado por
padrão**: a razão dele não mudou (116 de 193 eventos reais), o que mudou é ele
ter virado ESCOLHA em vez de fato consumado.

**Ordem e paginação (RN-178).** As quatro seções passaram a decrescentes, e o
botão "Carregar mais antigos" mudou de lado por consequência — o argumento de
antes, com o sinal trocado. Regras de negócio acima de 5 paginam, com a página
resolvida por *clamp* e não por efeito de sincronização.

**A árvore do PO (RN-179).** `backlog.task_created` nunca entrou no painel;
agora épico → história → tarefa formam árvore, pelo VÍNCULO que o evento já
carrega (`epicId`/`storyId`), nunca por vizinhança no log — nó sem pai
carregado sobe para a raiz em vez de ser pendurado por adivinhação.

**O teto que passou a aparecer (RN-180), e é o item que mais valia.** O painel
lia 200 eventos por prop e não tinha como dizer que havia mais. Passou a ler o
histórico paginado da RN-099 (mesma `queryKey` da cauda, ZERO requisição a mais
— RN-090/091), ganhou o pager que o `ActivityFeed` sempre teve e nenhum call
site passava, e a nota conta quantos faltam por SUBTRAÇÃO sobre o `seq`, como o
sino da RN-100. As seções derivadas leem `baixados` (tudo que já veio) e não a
janela do feed, senão passariam a mostrar MENOS do que mostravam antes.

**Delegação no fio (RN-181).** `delegation.completed|failed|dispensed` só
existiam no painel de log: o gate abria e fechava sem sinal nenhum de que houve
uma segunda tentativa por baixo. Viraram aviso compacto no formato da RN-157,
com a frase saindo de `classifyEvent` — a mesma do painel. O contrato externo
da área não muda (ADR 0038): o fio narra o que o lead registrou, não passa a
endereçar subagente.

