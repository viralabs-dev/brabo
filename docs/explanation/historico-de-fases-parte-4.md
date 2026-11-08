---
id: historico-de-fases-parte-4
title: "Histórico de fases, parte 4: do runner local em diante"
sidebar_label: Do runner local em diante, parte 4
description: Do runner local ao binário standalone, e a seção migrada do índice do CLAUDE.md (fases 28 a 30 inclusas).
keywords: [histórico, fases, ADR, RN]
tipo: historico
---

# Histórico de fases, parte 4: do runner local em diante

:::historico 2026-09-11
Do runner local (ADR 0102 e 0103) em diante, mais a seção migrada do índice do CLAUDE.md, onde estão as fases 28, 29 e 30.
Texto movido sem reescrita do [Histórico de fases](historico-de-fases.md). O que vale hoje mora nas RNs e nos ADRs.
:::

## Runner local — execução na máquina do usuário (RN-418/419/420, ADR 0102/0103)
Pedido do dono do produto: agente rodando na MÁQUINA DO USUÁRIO, na pasta
local do projeto, pelo terminal padrão do usuário — mais terminal
interativo de verdade na aba Code. Duas mudanças, uma dependendo da outra.

**Política (ADR 0102 — decisão GLOBAL, confirmada explicitamente pelo dono
do produto depois de um aviso automático de segurança sobre a mudança)**:
`git push`/PR/deploy (RN-106) e `sudo`/`doas` (novos) saem de `deny`
incondicional e viram TETO ABSOLUTO — `require_approval` incondicional,
no MESMO bloco e MESMO padrão dos tetos vizinhos (`current.policy ===
'auto_approve'`), nunca auto-aprovável por `agent_autonomy`(curinga `"*"`)
nem por `permissions.json`. A fresta que o `deny` original tapava à força
foi fechada na FONTE: `ApproveAlwaysActionUseCase`/`patternForAction`
recusam gravar padrão em `allow` pra ação com efeito externo git ou
comando privilegiado — "sempre permitir" aprova só a instância, nunca o
padrão, pra esses dois casos. Sem essa segunda metade, o teto seria
decorativo. `sudo`/`doas` casam por VERBO em `comandoPrivilegiadoNoComando`
(`external-effect.ts`), varrendo todos os segmentos do comando, mesmo
princípio de `efeitoExternoNoComando`.

**Runner (`apps/runner`, novo workspace Node/TS, ADR 0103)**: CLI
(`brabo-runner --project <id> --dir <pasta> --token brb_...`) que o
usuário roda na própria máquina, conecta no ENGINE via canal Phoenix NOVO
(`/runner`,
tópico `terminal:<projectId>`) autenticado por ticket de USO ÚNICO (mesmo
padrão RN-108, mas ticket EMITIDO PELO ENGINE — schema `"engine"`,
migration própria — e pedido pela api via rota HTTP interna, invertendo o
fluxo do ticket de sessão). Executa `exec` (comando de agente JÁ APROVADO
— o roteamento em `TerminalExecutor` só acontece DEPOIS do pipeline de
`decide()`/`proposed_action` de sempre, nunca antes) no `$SHELL` do
usuário, e um modo PTY interativo pra aba Terminal (`pty_open`/`pty_data`/
`pty_input`/`pty_resize`/`pty_close` — o engine faz RELAY puro, nunca
interpreta os bytes). Só UM runner por projeto (`Engine.Runners.Registry`,
`:global`, exclusividade de `:global.register_name/3`); modo `runner` SEM
workspace verificado ou SEM runner conectado RECUSA explicitamente — nunca
cai no `System.cmd`/bind-mount, que não existe pra um projeto `runner`
(revisado pelo ADR 0104/RN-423, ver acima; o fallback pro caminho de
sempre continua valendo, mas só pra `container`/`mounted`). PTY é ação do
USUÁRIO autenticado, não passa por `proposed_action`, mas audita
(`terminal.session.started`/`ended` no event log, inclusive quando a aba
cai sem `pty_close` explícito).

A fronteira de segurança do runner NÃO é sandboxing — é autenticação
(o CLI apresenta um Personal Access Token da CONTA do usuário) + o
pipeline de aprovação de sempre + o consentimento de o usuário rodar o
CLI na própria máquina, com os privilégios dele. `apps/runner/src/guard.ts`
valida `cwd` dentro da raiz por resolução léxica, mas é declarado
BEST-EFFORT, não a garantia real.

**PAT fechou a lacuna de token de automação (ADR 0105/RN-424..426).** O
achado real da Onda 1 — "o produto não tem mecanismo de token de conta de
LONGA DURAÇÃO pra automação, então o runner replica o login do browser
(cookie/CSRF persistidos em `~/.brabo/runner-credentials.json`)" — foi
fechado na Onda 2: `personal_access_tokens` (`brb_…`, hash HMAC-SHA256+
pepper via `hashDeToken()`, nunca argon2 — errado pra segredo de ALTA
entropia) é emitido em Configurações do projeto, escopado a UM projeto,
revogável, com expiração opcional. `apps/runner/src/auth.ts` perdeu por
completo login interativo, cookies e o arquivo de credenciais — só
valida formato e repassa `--token`/`BRABO_ACCOUNT_TOKEN`, NUNCA gravado
em disco pelo CLI. O PAT nunca autentica fora de
`POST .../runner-ticket`, por CONSTRUÇÃO (`IS_PAT_ROUTE_KEY`/
`@RequirePatAuth()` + `PatAuthGuard`) — nunca um branch no `JwtAuthGuard`
global, que deixaria `RolesGuard` autorizar o PAT pra qualquer rota do
papel do usuário.

**`maintainer` revoga PAT de outro usuário (RN-427)**, fechando o item
que o ADR 0105 tinha declarado fora de escopo por ora (resposta a
incidente — dev desligado com token vazando). Extensão do mesmo modelo,
sem ADR novo: rotas SEPARADAS (`GET .../personal-access-tokens/all`,
`DELETE .../personal-access-tokens/:tokenId/admin`), escopo por
`projectId` em vez de `userId` — a autorevogação de cada usuário
(RN-426) não muda.

`@xterm/xterm`/`@xterm/addon-fit` (web) e `phoenix`/`node-pty` (runner)
são as quatro dependências novas — mesma régua de exceção do `mermaid`
(ADR 0068): `import()` dinâmico, sem `eval`/`new Function` confirmado por
grep no pacote instalado (não é garantia formal contra ofuscação, só
evidência forte — declarado como incerteza, não afirmado como certeza).

**ADR 0104 — Onda 1 CONCLUÍDA (RN-421/422/423):** os ADRs 0072 e 0103
nunca se falaram — RN-170 exigia bind-mount na criação, e o roteamento pro
runner (RN-420) reusava a mesma flag `workspace_mode == 'local'` sem
bind-mount nenhum, então usar o runner de verdade continuava obrigado a
passar pela validação de pasta montada. `workspace_mode` (2 valores) virou
`execution_mode` (`container`/`mounted`/`runner`, migração `0048`) —
RN-170 (agora RN-422) passa a valer só para `mounted`; `runner` nasce com
caminho validado só LEXICAMENTE (sem I/O) e `workspaceVerifiedAt: null`,
promovido a verificado quando um runner conecta e confirma o caminho no
HOST (`POST /internal/projects/:projectId/workspace-verification`, RN-423)
— o runner é a FONTE DA VERDADE do caminho, sobrescrevendo o que foi
digitado no wizard. `Engine.Actions.TerminalExecutor.decisao_de_execucao/1`
ganhou QUATRO saídas: roteia só com workspace verificado E runner
conectado; sem qualquer um dos dois, RECUSA explicitamente — nunca cai no
`System.cmd`/bind-mount de `mounted`, que não existe pra um projeto
`runner`.

**Achado da implementação, corrigindo o ADR (que não é editado — a
correção mora aqui e em
[backlog.md](backlog.md#backlog-of-the-runnerexecution_mode-adr-0104)):**
a frase do ADR 0104 de que a conversão entre os três modos de projeto
existente "passa a ser permitida sem recriar o projeto" está INCORRETA.
`UpdateProjectDto` continua excluindo `executionMode`/`workspacePath` de
propósito — não é PATCH trivial (worktree, permissions.json e cache do
engine apontam pro escopo antigo). A Onda 1 entregou só o campo de três
valores na CRIAÇÃO; conversão de projeto existente é onda futura, com
desenho próprio, ainda não planejada. Backlog do runner: a Onda 2 (PAT,
ADR 0105) fechou o item que bloqueava `npm publish @brabo/runner`, e a
Onda 3 (ADR 0106) entregou a distribuição em si — `tsup` empacota
`apps/runner` num `dist/index.cjs` único (`node-pty` como `external`
obrigatório, binding nativo), publicado a cada tag final por um workflow
próprio (`publish-runner.yml`), paralelo a `release.yml`. Achado real
testado empiricamente: a guarda de auto-run de `index.ts` precisou de
`realpathSync` em `process.argv[1]` — sem isso, `main()` nunca rodava
quando o CLI era invocado pelo `bin` instalado via `npm install -g`
(symlink, que `process.argv[1]` nunca resolve por realpath mas
`import.meta.url` sempre resolve). Pendência operacional declarada: a
publicação de verdade exige o dono do produto criar o Automation Token do
npm e configurar o secret `NPM_TOKEN` — sem ele, o workflow avisa e pula,
nunca falha. Exclusividade por `{project_id, machine_id}` continua adiada
até segundo dev simultâneo real; `guard.ts` best-effort é invariante
REAFIRMADO, não lacuna. Ver
[ADR 0104](../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)/
[ADR 0105](../adr/0105-personal-access-token-do-runner-escopado-por-construcao.md)/
[ADR 0106](../adr/0106-distribuicao-do-runner-via-tsup-e-npm-publish.md).

## FERRAMENTA DE DESENVOLVIMENTO — `pnpm bootstrap`
Menu de terminal em `scripts/dev/bootstrap.sh` agrupando o que se faz no
dia a dia: Docker, K8s, Database e Test. Existe porque esses comandos moram
em TRÊS lugares que não conversam — `package.json`, `Makefile` e scripts em
`deploy/k8s/`/`docker/` — e conhecimento decorado apodrece.

Ele **não reimplementa nada**: cada folha chama o comando que já existe. O
modo `--print-commands` resolve a árvore inteira sem TTY e sem executar, e é
sobre ele que roda o teste (`scripts/dev/bootstrap.spec.ts`) — um TUI não se
testa por unidade, mas o mapeamento menu→comando sim, e é ele que erra.
Zero dependência nova; as cores saem de `design/tokens.css` em ANSI 24-bit
com degradação para 256 cores e para nenhuma.

A saída de um comando em execução é ROLÁVEL (roda do mouse em SGR, `j`/`k`,
PageUp/PageDown, `G` para voltar ao fim). O que faltava não era ler a roda: era
DESLOCAMENTO — `tail -n` só sabe mostrar o fim —, então a janela virou recorte
com `sed -n 'a,bp'`, testável sem TTY por `--print-window`. Duas consequências
que o rodapé anuncia: rolar para trás CONGELA a janela (como o `less +F`, senão
o redesenho de 5 Hz desfaz a rolagem) e o rastreio de mouse, ligado só na tela de
execução, é desligado em TODA saída — `\e[?1006l\e[?1000l` em
`restaurar_terminal`, que o trap de EXIT cobre. O parser de escape é CSI
genérico (lê até o byte final): ler dois bytes fixos deixava o resto da sequência
no buffer, e como o menu trata `[1-9]` como escolha, um giro de roda disparava
itens do menu.

Três decisões registradas: `Create` provisiona do zero e `Deploy` publica
num ambiente que já existe (por isso só `Deploy` tem escolha por serviço);
no K8s só `All` funciona, e Api/Engine/Web aparecem DESABILITADOS em vez de
sumirem, porque o menu deve dizer o que o produto não faz; e
`Database › Delete` recria a extensão pgvector, já que
`docker/postgres/init.sql` só roda na primeira inicialização do volume —
um `DROP SCHEMA` puro faria a migração seguinte falhar, e como o engine
divide o mesmo banco, recuperar exige `db:migrate` E `engine:migrate`.

**`Docker › Reset total`** (`scripts/dev/reset-total.sh`) soma essa
sequência inteira numa folha só — preflight, `up --build --wait` (o
`--wait` do Compose v2.17+ é o "até tudo saudável", sem laço de saúde
escrito à mão), o mesmo `DROP SCHEMA` da Delete, `db:migrate` +
`engine:migrate` e o seed — com tela de confirmação PRÓPRIA
(`confirmar_reset`, exige digitar `RESET`), distinta da da Delete (que
exige o NOME do banco) e sem a precondição "postgres já de pé" da Delete,
porque é o próprio comando que sobe o compose do zero. O seed
(`apps/api/src/db/seed.ts`) ganhou um passo que ativa credencial de
provider a partir de `.env`, reaproveitando as MESMAS variáveis
`<PROVIDER>_TEST_KEY` que os smokes de LLM já usam
(`apps/api/test/infrastructure/llm/*.smoke.spec.ts`) — uma convenção de
nome só, dois consumidores; provider sem variável definida não entra, sem
erro, e a credencial fica no OWNER (RN-058).

Dois achados ao rodar o reset pela primeira vez, e não pelo item em si —
nenhum dos dois é hipotético, os dois quebraram a execução real:

1. `gemma:1b` não existe no registry da Ollama (`manifest unknown` — só
   `gemma3:1b` existe), então `ollama-model-loader` sempre falhava e o
   `--wait` nunca fechava verde. Corrigido nos seis lugares que carregavam o
   valor errado como CÓDIGO — `docker-compose.yml`/`.prod.yml`,
   `.env.example`, `docker/ollama/pull-models.sh`,
   `scripts/dev/verificar-modelos-ollama.sh`,
   `deploy/k8s/base/ollama/job-model-loader.yaml` e a RN-415 em
   `docs/business-rules.md` — sem tocar os ADRs 0099/0100 (aceitos) nem a
   narrativa histórica desta mesma seção do CLAUDE.md, que descrevem o que
   foi pedido/decidido na época, não o valor operacional corrente.
2. Mais sério, e mais antigo — `Database › Delete` (item 3.4, existente
   desde a criação do menu) nunca dropava de verdade: `DROP SCHEMA public
   CASCADE` não alcança `engine.*` (Ecto/Oban vive em schema PRÓPRIO,
   `engine`) nem `drizzle.__drizzle_migrations` (o controle do drizzle-kit
   vive em schema PRÓPRIO, `drizzle`). Resultado: `mix ecto.migrate` batia
   em `duplicate_table` nas tabelas do engine que sobreviviam, e
   `pnpm db:migrate` — pior, SEM erro nenhum — via o controle do
   drizzle-kit intacto, concluía que já tinha rodado tudo e não recriava
   NENHUMA tabela da api. `Delete`/`Reset total` agora dropam `engine` e
   `drizzle` também, nesta ordem, antes de `public`.

## Abas agrupadas, PRs project-wide, pasta local via Runner, carrossel do PO (2026-08-20)
Cinco ondas independentes, rodadas em paralelo por arquivo disputado, vindas
de uso real da tela de projeto — nenhuma planejada de antemão. A sexta onda
do mesmo programa (tradução completa de produto e documentação, i18n) é
maior que as cinco juntas; a FUNDAÇÃO dela (Onda 6a — mecanismo, sem
tradução de conteúdo ainda) já fechou: `react-i18next`+`i18next` na web
(`en` virou idioma default do app, `pt-BR` mantido — RN-425), coluna
`locale` em `users` embutida no payload de login/refresh, `AccountPage`
nova (`/account`) provando o mecanismo, e Docusaurus com
`i18n.defaultLocale: 'en'`/`locales: ['en', 'pt-BR']` — o snapshot pt-BR
atual de `docs/` já está preservado em
`website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`. A Onda 6b
(extração em massa da interface + tradução de `docs/`) avançou bastante em
2026-08-22, em quatro frentes paralelas — ver CHANGELOG.md (Unreleased/
Documentação) para o detalhe de cada uma — mas AINDA NÃO fechou: faltam
`docs/business-rules.md` (só o front-matter foi traduzido; o corpo, com
centenas de RNs, continua 100% em português — é o maior arquivo da doc
inteira e cresce mais rápido do que dá pra traduzir de passagem) e uma
fatia residual de componentes `.tsx` menores. Quando fechar de verdade,
esta seção ganha o resumo final e o restante do CLAUDE.md (Stack,
"Documentação") é revisado por completo para registrar inglês como idioma
primário de verdade.

- **Régua de abas agrupada**: 11 abas soltas viraram 6 no topo — Visão
  geral, **Agentes ▾** (Executores, Criativo, Chat, Insights), **Dev ▾**
  (Código, PRs, Aprovações), **Documentação ▾** (Backlog, Arquitetura),
  Gastos, Configurações — via `GroupedTabs` novo (`apps/web/src/components/
  ui/GroupedTabs.tsx`), construído POR CIMA do `Tabs` genérico, que
  continua sem grupo pras outras telas. `ChaveDeAba` continua flat — só a
  apresentação ficou agrupada, pra não mexer no deep-link `?tab=`. Chat e
  Chat RAG viram UMA aba (`ProjectChatShell.tsx`) com controle segmentado
  interno ("Conversar"/"Buscar") — a distinção de negócio entre os dois
  (RN-202: conversar ativa agente e gasta a chave do owner por turno; RAG é
  leitura sobre índice, sem agente) não mudou, só o contêiner de UI.
- **Aba PRs, project-wide**: `ProjectApprovalsTab` escopava "PRs em
  revisão" à sessão mais recente — a revisão de uma PR de sessão anterior
  sumia da tela assim que uma sessão nova propunha outra. A aba `prs` nova
  lista direto do provider de git (nunca por sessão) e cruza com
  `proposed_action` pendente via `findPendingByProject`, novo, ao lado do
  método já existente escopado por sessão — decisão usa o `sessionId` da
  PRÓPRIA ação, nunca `latestSession` (RN-423). É a primeira produtora real
  de `git_merge` pela UI; a trava de branch protegida (RN-154) continua
  absoluta e intocada — botão "Merge" só PROPÕE, a aprovação humana
  continua sendo o único jeito de executar.
- **Aba Arquitetura**: extraída da Visão Geral (module_map, diagrama C4,
  ADRs, pendências), que fica com um resumo condensado + link. Primeiro
  lightbox do design system — `Modal` ganhou `size="full"` — pra ampliar o
  diagrama C4 (SVG, sem perda de qualidade) (RN-424).
- **Navegação de pasta local via o Runner (RN-422, ADR 0104)**: revisa a
  ADR 0072 (que tinha recusado seletor de pasta explicitamente) SEM
  editá-la — a navegação existe, mas pelo Runner, que já roda com o
  privilégio real do usuário na máquina dele, nunca pela api enumerando o
  filesystem do container. Dois eventos novos no canal já existente
  (`fs_list_dir`/`fs_home_dir`), relay puro do engine, mesmo padrão do PTY.
  `FolderBrowserModal` funciona onde o projeto já existe. Na criação
  (`NewProjectWizard.tsx`), o gap ficou declarado até o ADR 0108: no modo
  `mounted` o projeto ainda só nasce na confirmação (a validação de caminho
  toca disco ali), mas no modo `runner` "Procurar pasta..." passa a criar o
  projeto ANTECIPADAMENTE — reusado por snapshot de identidade em vez de
  duplicado a cada clique — pra poder ancorar o ticket do canal antes da
  confirmação (RN-437, ADR 0108). `RunnerOnboardingPanel` novo
  (compartilhado com a aba Terminal) substitui o `<code>` cru de antes.
  `apps/runner` ganhou README — publicar de verdade no npm/empacotar
  binário assinado continua fora do escopo, declarado no README.
  O explorador de pasta em si virou três colunas (atalhos, lista com um
  clique seleciona/duplo clique entra, painel de detalhes — RN-436),
  seguindo a referência visual do dono do produto.
- **Bug do carrossel do PO corrigido (RN-421)**: a leva de promoções
  pendentes dependia de scan sobre os últimos 200 eventos
  (`useSessionEvents`) — numa sessão longa, a proposta saía da janela e o
  carrossel degradava pra card único ou sumia. Mesma classe de bug que a
  RN-180 já tinha corrigido pra `ContextAside`; a fonte agora é
  `useBacklog` (completo, sem janela), com fallback por história quando o
  backlog ainda não respondeu.

## Handoff manual a agente à escolha (RN-440/441, ADR 0109)
Fecha o item de backlog aberto desde a FASE 13c. `CreateHandoffUseCase`
continua sendo o ÚNICO lugar que grava `toAgent` (ADR 0038) — ganhou só um
`actor?: Actor` opcional, default `{kind:'agent', id: fromAgent}` de
sempre. `RequestManualHandoffUseCase` (rota nova, `POST
.../sessions/:sessionId/handoffs`, papel `developer`) valida `toAgent`
contra `addressableAgents()` — catálogo FECHADO (leads de área ∪
`SOLO_CONVERSATIONAL_AGENTS`), mais estrito que `assertHandoffTargetAllowed`
(que só recusa subagente) — resolve `fromAgent` pelo `agent.activated`
mais recente da sessão (sentinela `"usuario"` sem nenhum), e grava
`actor: {kind:'user'}`. O handoff nasce `offered` igual a um automático:
o card de aceite já existente (`SessionPage.tsx`) o pega sozinho, zero
mudança no caminho de aceite.

Investigação ANTES de codar achou `ux-designer` (ADR 0087) na MESMA
situação do Staff (ADR 0088) que motivou o item: cláusula de `message/2`
pronta em `agent_command_controller.ex`, nenhum caminho humano até ela.
Os dois entraram em `AGENTES_DE_CHAT` na mesma mudança — `infra`/`qa`
continuam de fora, mesmo padrão já documentado ali (leads sem `kickoff/1`
nem cláusula de `message`). Declarado, não escondido: o mirror de
`SOLO_CONVERSATIONAL_AGENTS` do lado web (`apps/web/src/lib/agents.ts`)
NÃO é cruzado por teste com o da api — divergir produz, no pior caso, uma
opção velha no seletor que o backend ainda recusa com 400.

## Budget por área — fecha o corte do ADR 0038 (RN-443, ADR 0110)
Item aprovado do backlog ("Older backlog", `docs/explanation/backlog.md`).
`agent_areas` ganha `budget_micros`/`spent_micros`, espelhando exatamente
`max_parallel` — mesma linha, mesmo dono da decisão (`maintainer`), sem
tabela nova. É um TERCEIRO teto ADITIVO ao lado de projeto e sessão
(`CheckBudgetGateUseCase` checa os três em paralelo, qualquer um bloqueado
já recusa), **não** a cascata de binding de modelo do ADR 0064 (`sessão >
agente > área > projeto > workspace`, "o mais específico vence") — os dois
mecanismos compartilham a palavra "área" e mais nada; não confundir os
dois é o ponto central do ADR 0110, do mesmo jeito que RN-101/ADR 0063 já
separa a visão do owner da visão do membro no relatório de gasto.
`spent_micros` soma SEMPRE que o ator pertence a uma área (lead ou
membro, via `areaDo` — função pura, sem tocar banco pra ator sem área),
com ou sem `budget_micros` configurado (`null` é o default, sem teto).

## Binário standalone do runner (2026-08-23, RN-451/452, ADR 0112)
Item de backlog do ADR 0104 ("standalone binary, `pkg`/`bun build
--compile`"), companion do ADR 0106 (distribuição via npm). Decisão
explícita do dono do produto: binário ÚNICO de verdade, matriz completa
com Windows desde a v1 — a alternativa mais barata ("binário + pasta
`node-pty-native/` ao lado") foi oferecida e recusada.

`bun build --compile` embute o `.node` nativo do `node-pty` via
`with { type: 'file' }` e o extrai pra um diretório TEMPORÁRIO REAL em
runtime (`native-pty-loader.ts`) — necessário porque `node-pty` resolve o
próprio addon por um `require()` de caminho COMPUTADO
(`lib/utils.js#loadNativeModule`), que o Bun não consegue embutir sozinho
(build passa, runtime lança `Cannot find module`, testado antes de
desenhar a correção). Cinco plataformas
(`linux-x64`/`linux-arm64`/`darwin-x64`/`darwin-arm64`/`win32-x64`), cada
uma construída no seu runner NATIVO
(`.github/workflows/build-runner-binaries.yml`, gatilho de tag final,
mesmo padrão de `publish-runner.yml`), binário anexado à Release já
existente.

**Validação honesta, por plataforma**: só `linux-x64` foi executado de
verdade neste ambiente (`build:bin`+`smoke:bin` verdes, repetidamente —
foi rodando o binário real que os dois bugs abaixo apareceram). As outras
quatro — Windows em especial, com TRÊS arquivos nativos em vez de um —
foram raciocinadas lendo o código-fonte do `node-pty`, nunca executadas
numa máquina real daquele SO; a primeira execução real delas é a PRÓXIMA
tag de versão, não esta PR. Nenhum fallback por plataforma foi aplicado
preventivamente — nada nesta investigação PROVOU que alguma das cinco não
funciona assim; se uma tag real mostrar que sim, isso vira item novo, não
suposição de hoje.

Dois defeitos achados só rodando o binário compilado, não lendo a API:
`--external node-pty` precisa estar no comando do `bun build` mesmo sem
`import` estático nenhum de `node-pty` no código — o `await import(...)`
de fallback (usado só fora do binário) é descoberto e embutido pelo Bun de
qualquer forma, e falha em runtime com erro enganoso; e a guarda de
auto-run (ADR 0106) precisou de um segundo ramo — `process.argv[1]` dentro
do binário é um caminho VIRTUAL (`/$bunfs/root/...`) que `realpathSync`
não alcança, lançando `ENOENT` fora de qualquer `try/catch` antes de
`main()` ser tentado.

## Converter execution_mode de projeto existente (RN-447..450, ADR 0111)
Fecha a correção que a Onda 1 do runner (ADR 0104) tinha registrado em
`docs/explanation/backlog.md`: o item 4 daquele ADR dizia que converter
`execution_mode` entre `container`/`mounted`/`runner` num projeto que já
existe "passa a ser permitida sem recriar o projeto", e isso era falso até
aqui — `UpdateProjectDto` continua excluindo os dois campos de propósito.
`PUT projects/:projectId/execution-mode` (`maintainer`,
`ConvertProjectExecutionModeUseCase`) é rota DEDICADA, não um `PATCH`
afrouxado: ela orquestra a migração em vez de só trocar a coluna.

Recusa com 409 enquanto qualquer dev agent do projeto (em QUALQUER sessão,
lido direto de `engine.dev_agent_states` por `project_id`, mesmo caminho da
RN-409) não está `idle` — `idle_tripped` CONTA como ativo aqui, ao
contrário do critério de "online" da RN-409, porque o agente ainda tem
`workspace_root` capturado em memória esperando desbloqueio humano
(RN-447). `PermissionsFileStore` ganhou `move(from, to)`: o conteúdo do
permissions.json nunca muda, só o caminho físico, porque `projectScopeRoot`
deriva do par (modo, caminho) (RN-448). Saindo de `container` com container
provisionado, o ciclo de vida (ADR 0081) é levado a `removed` — via
`stopped` primeiro se estava `running` — ANTES da coluna mudar, porque
`RegistrarTransicaoDeContainerUseCase` recusa transição fora do modo
`container`; entrar EM `container` nunca auto-provisiona (RN-449).
`workspaceVerifiedAt` zera em toda conversão real, inclusive voltando para
`runner` com caminho de aparência igual (RN-450). Mesmo (modo, caminho) de
hoje é no-op — nem checa dev agent ativo.

**Consequência declarada, não escondida**: a conversão NUNCA copia o código
já escrito entre a raiz antiga e a nova. Isso é seguro para o que já foi
COMMITADO — o engine deriva o worktree do bare repo do zero
(`Engine.Actions.Workspace.ensure!/4`) sempre que a pasta de destino ainda
não está marcada pronta, então o próximo agente reconstrói a árvore de
trabalho na raiz nova a partir do git de verdade. O que NÃO sobrevive é
diff NÃO commitado no worktree abandonado — ele fica órfão no disco antigo,
nunca migrado nem apagado. O teto de dev agent ativo (RN-447) reduz o
risco (nunca converte com um agente `working`) mas não elimina: um agente
`idle` entre tasks pode estar sentado sobre um diff sujo, e nada aqui
inspeciona limpeza de working tree antes de converter.

## Pasta local anexada como referência do Chat RAG (2026-08-23, RN-455..457, ADR 0113)
Pedido do dono do produto: anexar uma pasta da PRÓPRIA máquina do usuário a
um projeto como referência de LEITURA para os agentes — sem o CLI
`brabo-runner` (ADR 0103). Explicitamente NÃO é execução/workspace de
projeto: `execution_mode: runner` (ADR 0104) precisa do CLI porque precisa
de um caminho de HOST real pro container rotear comando; isto é mais
parecido com "anexar arquivos a uma conversa". O navegador lê o CONTEÚDO
(`File.text()`) e o caminho RELATIVO (`File.webkitRelativePath`) dos
arquivos escolhidos — nunca um caminho absoluto de host (a API de `File`
não expõe um, pra nenhum site), e por isso o ADR 0113 é explícito que NÃO
é uma revisão do que os ADRs 0072/0107 recusaram: aqueles recusavam
RESOLVER um caminho de host a partir do navegador; aqui não existe caminho
nenhum a resolver, só bytes que o navegador já tinha o direito de ler.

`chunks.scope` (ADR 0079/0080) ganha um QUARTO valor, `'local'` (migração
`0052`, `ALTER TYPE ... ADD VALUE`, aditivo — os dois CHECK da migração
`0045` já são escritos como "é `session` ou não é", então `local` cai do
mesmo lado de `docs`/`adr` sem CHECK novo). `IndexLocalFolderUseCase`
espelha `IndexProjectDocsUseCase` de perto — chunking Markdown-aware pra
`.md`/`.mdx`, `RagEmbeddingService`, chunk sem vetor em vez de falhar
quando o embedding cai (RN-233) — mas REJEITA (400) o upload inteiro
quando os tetos AGREGADOS estouram (quantidade de arquivos, bytes
somados), nunca trunca em silêncio: é um gesto ÚNICO do usuário com um
seletor de pasta na tela, não uma varredura em background. Arquivo
individual grande demais ou de extensão não reconhecida só é PULADO
(`filesSkipped`), nunca derruba o lote (RN-456). `origemDoChunk` não
precisou de nenhum ramo novo: `local` carrega `sourcePath` como
`docs`/`adr`, cai no `kind: 'file'` que a citação já sabia renderizar.

**Nunca entra no "Reindexar agora" genérico (RN-457)**: `ReindexProjectUseCase`
reindexa lendo de uma fonte que o SERVIDOR consegue revisitar (repositório
do projeto, event log); `local` não tem fonte nenhuma pra revisitar — o
texto só existe no navegador de quem anexou. Reanexar a pasta (novo
upload em `POST .../rag/local`, `maintainer`) É o mecanismo de
resincronizar, um botão deliberadamente separado, com comentário cruzado
nos dois casos de uso apontando um pro outro e pro ADR 0113, pra uma
"correção" futura não religar os dois e apagar o material do usuário. A
cobertura (`RagCoverage.local`) é forma PRÓPRIA — não há "total no
repositório" pra comparar — e `lastAttachedAt` é a ÚNICA exceção real à
regra "nunca Xmin" (RN-237): um `MAX(chunks.created_at)` de verdade, não
chutado (RN-458).

## Faixa de atividade do turno — o fio só recebe a resposta no fim (RN-459/460)

Pedido do dono do produto: a tela de Sessão passa a mostrar, ACIMA do
composer, uma faixa que narra em linguagem humana o que um agente
conversacional (Criativo, PO, Arquiteto, Dev Lead, UX Designer, Staff)
está fazendo DURANTE o turno — referência visual: a linha de status do
Claude Code. O fio só recebe a bolha de resposta DEPOIS que o turno
termina; a regra é do CHAT (canal Phoenix) e vale só pros seis
conversacionais — o chat consultivo sem agente ativo (SSE,
`streamChatMessage`) continua com a bolha de streaming de sempre,
intocada.

**Mecanismo**: os seis servers já emitiam `tool.call` DURÁVEL; passam a
também `broadcast(state, "tool.call", %{tool: name, agent: @agent})` —
EFÊMERO, sem `args` (RN-096/RN-412) — pro canal entregar em tempo real.
Não há behaviour/macro compartilhado entre os seis `dispatch_tool`
(quatro formas estruturais distintas, confirmadas por leitura completa) —
a mudança foi seis edições adaptadas à forma local de cada um, não uma
refatoração. Do lado web, um reducer PURO
(`reduzirAtividadeDoTurno`/`lib/atividade-do-turno.ts`) acumula o
`agent.delta` como texto corrente; ao chegar `tool.call`, arquiva o
corrente não-vazio como linha de narração, zera, e sempre adiciona uma
linha de ferramenta com `fraseDaFerramenta(tool)` (dicionário das 19
ferramentas, `lib/narracao-de-ferramentas.ts`, sem RN própria). Uma flag
PRÓPRIA (`turnoViaCanal`, nunca derivada de `statusAgent`/`streamingAgent`,
que passam por janelas legitimamente `null` no meio do turno) decide se a
faixa aparece ou a bolha antiga — nunca as duas.

**Regra de apresentação (histórico)**: `agruparNarracoesDoTurno`, nova
passada pura depois de `afundarDesfechos` (RN-172) no mesmo `useMemo` —
`agent.response` consecutivas do mesmo `turno`+`autor` viram um
`Disclosure` compacto ("Passos do turno · N"), só a última fica intacta
fora dele. `turno === 0` (o prólogo sentinela de `turnoDoSeq`) fica de
FORA do agrupamento — fixtures antigas empilham `agent.response` sem
fronteira de turno pra testar outro mecanismo (RN-138/RN-177), e sem a
exclusão o agrupamento novo produziria `Disclosure` dentro de
`Disclosure` ali. `afundarDesfechos` em si não mudou.

**Achado no caminho, escopo estendido por decisão do dono do produto**: a
investigação achou que QUATRO dos seis servers (Arquiteto, Dev Lead, UX
Designer, Staff) terminavam CALADOS no teto de iterações —
`defp run_turn(state, remaining) when remaining <= 0, do: state`, sem
evento nenhum, contradizendo a regra permanente de que laço de agente não
termina calado. Só o PO já emitia `toolloop.limit_reached` (RN-166); o
Criativo diverge deliberadamente com `agent.error` (decisão documentada
no próprio código). Os quatro corrigidos passam a emitir
`toolloop.limit_reached`, mesmo evento do PO (RN-459).


## Migrado do índice do CLAUDE.md em 2026-09-11

As entradas abaixo vinham da tabela-índice do `CLAUDE.md` e **não tinham
seção própria neste arquivo** — a narrativa delas existia num lugar só. Foram
movidas sem reescrita, na ordem em que estavam, quando a tabela foi reduzida a
índice. O que estiver aqui é histórico; o que vale hoje mora nas RNs, nos ADRs
e na seção "Estado atual e aberto" do `CLAUDE.md`.

### PROGRAMA 16–26 (ADR 0060–0072)
Handoff de design adotado; 8 telas; kind de sessão; eventos paginados; Gastos;
modelo por área; container por projeto (25b cortada); aba Code

### pnpm bootstrap
Menu de terminal sobre comandos existentes; Reset total

### Ollama nativo / pull de Hugging Face (RN-461..463, ADR 0114–0115)
Bootstrap dev pergunta uma vez e persiste o modo do Ollama em `.env`;
navegador de modelos do Hub com pull em duas etapas e allowlist de publisher
oficial

### Lockfile próprio do website (ADR 0117)
`website/` sai do workspace pnpm da raiz — lockfile e overrides de segurança
isolados, `pnpm audit` do produto para de reportar a árvore do Docusaurus

### Configuração automática do runner pelo navegador (RN-464..466, ADR 0118)
Chave de dispositivo Ed25519 gerada no navegador, aditiva ao PAT; proxy do
binário via GitHub Releases; File System Access API grava a pasta configurada,
com fallback de download fora do Chromium; `--project/--dir/--token` viram
opcionais no CLI

### Imagens publicadas no GHCR (ADR 0119)
`release.yml` publica as quatro imagens a cada tag final e registra os digests
em `.release/images.json`; overlay de produção deixa de apontar para um
placeholder

### Schema por agregado (ADR 0121)
`db/schema.ts` vira barrel; as 51 tabelas e 34 enums viram 16 arquivos sob
`db/schema/`, um por agregado de `domain/*`

### `SessionPage.tsx` em 5 PRs mecânicos (ADR 0122)
3 807 → 2 661 linhas; timeline/turno, `StorySlide`, `StructuredQuestionCard`,
árvore de backlog + `ContextAside`, hook `useSessionReadiness` — cluster do
canal de turno e `ProjectSettingsTab.tsx` seguem fora, declarado

### Hook do canal de turno do `SessionPage.tsx` (ADR 0124)
2 661 → 2 479 linhas; PR mecânica de dedup
(`iniciarTurnoDoAgente`/`finalizarTurnoDoAgente`/`cancelarTurnoOtimista`)
seguida da extração de estado + efeito do canal Phoenix para o hook
`useTurnoDoAgente` (`lib/session-turno.ts`) — fecha o item que a ADR 0122
deixou declarado em aberto; `ProjectSettingsTab.tsx` segue fora, decisão
separada

### `ProjectSettingsTab.tsx` por seção (ADR 0125)
2 532 → 77 linhas; as 17 seções viram um arquivo cada sob `routes/settings/`
(+ `shared.ts` com os DOIS helpers de mais de um chamador), e o arquivo antigo
fica no caminho como entrada e barrel — caminho e os 11 nomes exportados são
contrato de 3 testes. Fecha a ÚLTIMA metade da linha de dívida de
`docs/architecture.md`

### Trilho vertical de navegação do projeto (ADR 0126, RN-201)
A régua horizontal de dois níveis (`GroupedTabs`) vira um trilho vertical com
os TRÊS grupos abertos ao mesmo tempo; geometria do trilho do `CodeShell`,
teclado portado, os 5 contadores seguem separados. Revisa a RN-201: a aba de
Código não recolhe mais a sidebar sozinha

### Sumário ancorado de Configurações (CHANGELOG)
As 17 seções da aba ganham `id`, `<section>` com nome acessível e um sumário
em quatro grupos DENTRO da área de conteúdo — sem faixa vertical nova, moldura
segue nos 444px do ADR 0126. Registro em `routes/settings/sumario.ts`
(terceira lista do mesmo desenho de `project-tabs.ts`), deep-link `?section=`,
spy por `IntersectionObserver`; só entra no sumário a seção que MONTOU

### Padrão único de valor herdado (CHANGELOG)
As QUATRO redações de "não tem valor próprio" da aba Configurações viram dois
polos e um verbo, de uma fonte só (`routes/settings/heranca.tsx`): rótulo diz
o ESTADO, detalhe diz a CONSEQUÊNCIA. Vocabulário unificado, forma não — a
marca só entra onde o controle não mostra o estado sozinho

### Salvar por seção em Configurações (RN-469)
Paralelismo e Teto de gasto trocam N botões de linha por UM da seção
(`settings/secao-salvavel.tsx`), com contagem de linhas pendentes e desfecho
POR LINHA — salvar é N chamadas, não uma transação, e a tela nunca afirma o
que não obteve. As três seções de autosave e Credenciais ficam de fora, cada
uma por um motivo declarado

### Painel "precisa de você" (RN-467)
Chip no topo do projeto abre as CINCO filas de decisão num lugar só —
separadas, ordenadas por urgência, sem soma nenhuma (nem no chip). Aprovações
e merges decidem ali pelo `ApprovalCard`; as outras três levam à aba.
Pendência de arquitetura empresta a data da história e DIZ que emprestou

### Cascata de modelo como cadeia visível (RN-470)
A coluna Origem para de imprimir o enum do banco e vira `workspace › projeto ›
área › agente` com quatro estados por nó (`settings/cascata.tsx`) — separando
os DOIS sentidos de `origin: 'agent'` sem tocar na api. O aviso de nível
descartado entra na cadeia; os três `—` ganham três textos. Fecha o canvas de
melhorias de UI (7 de 7 itens tomados)

### Pasta antes do runner (RN-473/474)
A configuração do runner pelo navegador (ADR 0118) inverte a ordem:
`showDirectoryPicker` é o PRIMEIRO passo e o binário o ÚLTIMO, best-effort — a
release sem asset devolvia 502 antes do seletor abrir, e a pasta ficava
inalcançável. Falha do binário mantém os dois arquivos gravados e troca a
instrução pelo caminho `npm install -g @brabo/runner`. Depois da instrução,
`EsperaDoRunner` sonda `workspaceVerifiedAt` com três estados e teto

### O `kid` na chave de dispositivo (RN-475)
O modo automático do ADR 0118 NUNCA autenticou: o navegador descartava o `id`
que o registro devolvia, e a JWK gravada nascia sem `kid` — o CLI a recusava
sempre. Registro e exportação viram UMA função
(`registrarChaveEExportarPrivada`), nos DOIS caminhos; e a recusa do CLI deixa
de ser indistinguível de "não há chave". O teste que deixou passar afirmava
que o arquivo fora ABERTO, nunca o conteúdo

### Provisionamento que não fica calado (RN-477)
Duas falhas não viravam estado nenhum — `step.check` fora do `try` e a recusa
de `createRepo` ANTES de a linha de bootstrap existir —, e a tela pollava
"Iniciando…" para sempre sem botão. Causa raiz de tudo: `/data/git-repos` e
`/data/project-workspaces` nasciam `root` nas imagens de DEV, que o
`Dockerfile.prod` já sabia criar antes do `USER`

### O arquivo de política e o escopo do terminal (RN-478)
`projectScopeRoot` tinha DOIS consumidores com necessidades opostas, e o modo
`runner` (sem bind-mount) os separou: o escopo segue apontando para o HOST, o
`permissions.json` passa a morar na raiz GERENCIADA. A ativação da execução
devolvia 500 (`mkdir '/home/<usuario>'`), e a LEITURA degradava calada — em
projeto `runner` o arquivo nunca existiu. Junto: erro tipado com 400 em vez de
`Error` cru, a Visão geral parando de engolir a mensagem da api, e a anotação
de OpenAPI que prometia 409 para dois casos que nunca foram 409

### Aviso do passo humano antes do clique (RN-473/477)
O passo de terminal do runner era anunciado só no estado de sucesso; passa a
ser dito também no inicial, e o comando final ganha `cd <caminho>` quando dá
para afirmar que a pasta escolhida é a do projeto. Rótulo do botão NÃO muda —
ele fala da pasta, que é automática mesmo

### Um modelo para todos os agentes (RN-476)
A tabela `Modelos por agente` ganha uma barra que aplica UM modelo aos 17 de
uma vez, gravando no nível do AGENTE (pelo projeto seria `maintainer`, e
mexeria no default de sessão). Primeira EXCEÇÃO à régua "valor nomeado salva
no `onChange`" da RN-469 — o seletor é argumento de ação, não configuração —,
com o desfecho em três estados da própria RN-469

### Tetos de rebaixamento em `project_members` (ADR 0127, RN-472)
A sobreposição `projectRole ?? workspaceRole` FICA nos dois sentidos (é
capacidade, não bug); o que entra são dois tetos de 403 no caso de uso —
ninguém rebaixa o `owner` do workspace, ninguém rebaixa a si mesmo. As três
descrições de OpenAPI que a RN-471 declarou falsas passam a descrever o
código; o gate do `Select` é PR à parte, por a tela não ter como calcular o
primeiro teto

### Telemetria de busca do RAG (RN-479..481)
A busca híbrida deixa rastro: `rag_searches` (com os pesos CONGELADOS na
linha) e `rag_feedback` (o voto útil/irrelevante, o único sinal de verdade).
TABELA e não só evento, porque `session_events.session_id` é `NOT NULL` e a
busca da aba não tem sessão — o evento `rag.search`/`rag.feedback` é NARRAÇÃO,
só quando há sessão. Ferramenta `rag_feedback` (`:direct`) nos seis agentes
que já tinham `rag_search`, e `medir:rag` para ler. NADA calibrado — esta
etapa só instrumenta

### Broker de container (ADR 0130, RN-485/486)
Nasce `apps/broker`, o ÚNICO processo que fala com um daemon Docker no
servidor — e ele NÃO aceita especificação: recebe `projectId` + operação, LÊ a
decisão do Arquiteto da api e COMPÕE imagem, rede, recursos e o único mount. A
porta do ADR 0128 MOVE de `apps/runner/src/` para `packages/docker-port` (os
dois consumidores a empacotam; a api não pode consumi-la). A rota de ciclo de
vida passa a devolver observado ao lado de registrado, sem fundir

### Roteamento de módulos para infra (PR 1.4) (ADR 0131, RN-487)
Sétima ferramenta do Arquiteto, `route_modules_to_infra`: um item `{modulo,
imagemCandidata, porque}` por módulo do `module_map` vigente, gravado como
`artifact.module_routing` (sem tabela, mesmo desenho de
`artifact.project_image`/`artifact.c4_diagram`). Ele CANDIDATA — a imagem de
cada item passa pela mesma `validarDecisaoDeImagem` de `choose_project_image`
—, e quem ELEGE entre as candidatas é a Infra, num PR à parte (1.5, fechado
logo abaixo)

### Golden-set de acerto do RAG (ADR 0132, RN-490)
Molde do golden-set do QA (ADR 0123) aplicado à busca híbrida: como o
julgamento não mora no engine (é `HybridSearchUseCase`, na api),
`seed-golden-set-rag.ts` provisiona UM projeto com corpus real curado (22
arquivos de `docs/`) E roda a busca para 17 perguntas compostas de RNs/ADRs
reais; `rag_golden_test.exs` só invoca o script e aplica o piso. Critério de
acerto — caminho de arquivo, top-5, nunca chunk exato/rank 1 — é função pura
testada. Gate novo `rag-acertivo`, `warn` (sem CI com LLM). Medido de verdade,
duas vezes, deterministicamente: 17/17 no top-5

### Dev agents executam DENTRO do container real (PR 1.6) (ADR 0134, RN-492/493)
Fecha o que a RN-491 declarou pendente: `Engine.Actions.TerminalExecutor`
ganha a QUINTA saída, `:executar_no_container` — projeto `execution_mode:
container` com uma linha REGISTRADA `running`
(`Engine.Containers.ProjectContainerLifecycle`, leitura direta, mesmo padrão
de `Engine.Projects.Project`) — e o comando atravessa engine → api (`POST
internal/projects/:projectId/container-exec`,
`ExecutarComandoNoContainerUseCase`) → broker (`ContainerBrokerPort.exec`, o
PRIMEIRO chamador real da última das cinco operações do ADR 0128/0130),
rodando via `docker exec` em vez de `System.cmd` local. `cwd` é traduzido do
caminho de HOST pra dentro de `/work` no engine, ANTES da chamada — confirmado
em código que é o MESMO diretório físico que `Workspace.ensure!/4` já escreve
(o worktree do dev agent não muda de lugar nem de mecanismo).
`BrokerRecusouError`/`BrokerIndisponivelError`/falha de transporte viram
`failed_result` normal, nunca crash nem fallback silencioso pra fora do
container (RN-486: `running` registrado nunca garante container de pé).
Terminal DENTRO do container ganha PISO de auto-aprovação
(`ProposeActionUseCase`/`decide.ts`, `containerExecutionActive`) — os cinco
tetos absolutos e o escopo léxico de sempre continuam rodando por cima, byte a
byte

### O runner sobe o container do projeto (PR 1.3, Parte 1 fora de ordem — fecha a metade que a RN-494/PR 1.7 tinha deixado declarada) (ADR 0137, RN-497)
`container_start`/`container_stop`/`container_remove` ganham SEGUNDO caminho
de execução, ramificado por `executionMode`: `container` segue pelo broker
(inalterado); `mounted`/`runner` passam a pedir ao RUNNER conectado, via TRÊS
pares novos no canal Phoenix (`container_start`/`_result`,
`container_stop`/`_result`, `container_remove`/`_result`, mesmo molde de
`exec`/`exec_result`) — `EngineWeb.ContainerCommandController` repassa pro
`RunnerRouter`, que o runner atende com `DockerViaCli` (o Docker DELE,
`@brabo/docker-port`, que ganha uso real além de `--self-test-docker`). A
imagem é LIDA (`ObterSpecDeContainerUseCase`, o mesmo caso de uso do broker),
nunca reeleita. "Sem runner"/"timeout" (`RunnerNaoConectadoError`) e "runner
recusou" (`RunnerRecusouContainerError`) viram `failed` nomeado, nunca
exceção. `Engine.Actions.TerminalExecutor` não ganhou saída nova — ele já
roteava todo comando de projeto `runner` conectado pro canal
incondicionalmente; a escolha host-vs-container é INTERNA ao runner
(`EstadoDoRunner.containerAtivo`, `tratarExec` roteia via `docker exec` com
`cwd` traduzido por troca de prefixo, `cwdParaContainer`). `guard.ts`/RN-434
passa a cobrir o bind-mount sem NENHUMA validação nova — o mount É a raiz já
confirmada no startup da CLI

### O handoff da Infra podia ser aceito por tela nenhuma (D0) (RN-499)
`offeredHandoff` filtra o card do fio por `AGENTES_DE_CHAT`, que exclui
`infra` — e o filtro está CERTO (o engine não tem cláusula de `message` pro
Infra Lead; alargá-lo faria a tela oferecer um fio que não existe e o composer
mandar mensagem pro Criativo). O defeito era a consequência, que o comentário
do próprio código registrava como aceita: `acceptHandoff` tinha UM consumidor
só, atrás desse filtro, então o handoff de `OfferInfraHandoffUseCase` ficava
`offered` para sempre, o Infra Lead nunca era ativado,
`propose_container_start` nunca era chamado e NENHUM projeto de nenhum modo
chegava a ter container de pé. Correção: card acionável PRÓPRIO, fora do fio,
na faixa fixa entre a área que rola e o composer — a mesma que já hospeda o
handoff manual e se declara o lugar das ações de handoff que não são conversa
—, chamando o `acceptHandoff` que já existia, fechado pelo mesmo `activeFor`.
O `handoff.offered` da Infra continua NARRADO no fio como divisor mudo

### A base única dos projetos montados (PR 1, BREAKING) (ADR 0141, RN-500)
Criar projeto `mounted` exigia uma linha de bind-mount escrita À MÃO em `api`
E `engine` mais um restart dos dois — que mata todo turno de agente, socket de
terminal e chamada de LLM em voo da instalação, para onboardar UM projeto.
Nasce `BRABO_PROJECTS_BASE`: UMA base, configurada uma vez pelo operador,
montada por IDENTIDADE (`$X:$X`) nos dois serviços, com todos os projetos
montados dentro dela e NADA editado por projeto. Identidade e não mountpoint
fixo porque `workspace_path` é digitado pelo usuário e mostrado de volta a ele
— e é o que faz `projectScopeRoot`/`workspace_dir/2` continuarem certos sem
código novo. Variável PRÓPRIA (colisão de namespace com `workspace_dir_name`
UNIQUE faria `git init` na pasta de outro projeto; dono oposto; a base é
navegável e a raiz gerenciada não deve ser). AUSENTE é normal: `projectsBase:
null` (`GET workspaces/:id/projects-base`, `maintainer`) e o modo não é
oferecido. E `pnpm dev` RECUSA subir com a base sobreposta ao checkout — a
única checagem possível, porque a api compara contra `/workspace`. Dois custos
declarados: symlink sob a base e uma base só

### Container de projeto montado (PR 3) (ADR 0144, RN-503)
Projeto `mounted` não conseguia container NENHUM, por dois bloqueios
independentes — a api mandava todo modo não-`container` pro RUNNER (que exige
`brabo-runner` conectado) e o broker recusava não-`container` na fonte. Os
dois eram sobre GEOMETRIA, não sobre o nome do modo, e a base única do ADR
0141 mudou a geometria. A ramificação vira por DESTINO: `container` E
`mounted` → broker, só `runner` → runner (e `container_stop`/`_remove` mudam
JUNTAS com o `_start`, senão sobe no servidor e para na máquina do usuário). O
invariante do ADR 0130 não se mexe — nenhum caminho absoluto atravessa a rede:
o broker ganha uma SEGUNDA raiz (`BRABO_PROJECTS_HOST_BASE`) e a api manda um
localizador DISCRIMINADO (`gerenciada` \|`montada` \|`indisponivel`) dizendo
contra qual raiz o segmento relativo vale. TRÊS variantes porque
`indisponivel` tem dois consertos diferentes (`runner` × `mounted` legado fora
da base), e raiz que falta NUNCA é suprida pela outra. `mounted` ELEGE a
imagem como `container` — o broker compõe de `artifact.project_image`, então
eleição não gravada é eleição inerte (ADR 0133 num segundo modo)

### Agentes de dev só depois do container (PR 7) (ADR 0143, RN-502)
Numa execução real do `exp001`, DEZ tasks de dev travaram de uma vez — e o
achado não foi a pasta que falhou, foi que **nada ordenava container antes de
dev agent**. `Engine.Dev.AgentIo.try_claim/2` — o ponto ÚNICO de claim — passa
a consultar `ProjectContainerLifecycle.running?/1` (o predicado que o ADR 0134
já tinha) ANTES de chamar a api: sem linha REGISTRADA `running`, o agente cai
em `:idle`, persiste e emite `dev.blocked_by_container`. No ENGINE e não só no
`activate-execution` da api porque a REIDRATAÇÃO chega ao `try_claim/2` sem
passar por rota nenhuma (`init/1` → `finish_restart_recovery/1`). `:idle` e
NÃO status novo, pela razão que o próprio docblock do `try_claim/2` já
registrava desde a Fase 12b — é o único estado do qual um wake ainda resgata,
e todos os guards de `handle_info/2` se apoiam nisso; quem distingue "fila
vazia" de "sem container" é o EVENTO, nunca o status. O wake vem pelo outbox:
`RegistrarTransicaoDeContainerUseCase` publica `container.running` na MESMA
transação que grava a chegada em `running`, num `aggregate_type` NOVO
(`container`, o terceiro que `Engine.Outbox.Drain` lê) em vez de pegar `task`
emprestado, com o PROJETO como `aggregateId`; a mensagem entregue é a `{:wake,
:became_claimable}` que já existia. Segunda metade: `TerminalExecutor` para de
degradar calado — `container` sem `running` caía em `System.cmd` DENTRO do
processo do engine, e agora RECUSA, com `mounted` no mesmo ramo

### Alarme de merge de esteira com destinatário (ADR 0139)
A regra "promoção é `--no-ff`" foi quebrada TRÊS vezes (#367, #394, #464 — a
terceira era o PR que consertava as duas primeiras). O achado: a detecção JÁ
existia e JÁ funcionou (o `tag-release` reprovou as duas primeiras com a
mensagem certa) — faltava para QUEM tocar, porque workflow de `push` que falha
numa permanente não tem PR onde ficar vermelho e o repo tinha zero issues.
`tag-release` ganha o job `avisar`, que abre issue (e comenta na já aberta,
nunca duplica) com `github.token` e nunca com o PAT — PAT inválido é uma das
falhas que ele reporta — e isso deixou de ser hipotético: o `BRABO_BOT_TOKEN`
expirou em 2026-09-03 à noite, reprovou duas runs do `tag-release`, e foi
rotacionado em 2026-09-04; a v4.0.0 carimbou e DISPAROU a Release, o que só
acontece com PAT válido (tag criada com `GITHUB_TOKEN` não dispara workflow).
A regra passa a cobrir `dev` de forma ESTREITA: só é defeito o PR que trazia
ARESTA NOVA (head era merge cujo segundo pai não estava na base), nunca o
squash de PR de trabalho, que é a convenção. Desligar squash no repo foi
MEDIDO e recusado (taxaria todo PR e mexeria no `changelog.mjs`, que roda
`--no-merges`)

### O artefato de decisão dos conversacionais (Frente 3, fatia genérica) (RN-505)
`decision_record` reusa o padrão GENÉRICO de `emit_artifact`/`ArtifactSchemas`
(o mesmo de `note`/`business_rule`) em vez do dedicado de
`project_image`/`c4_diagram` — uma decisão é log append-only, nunca um
"vigente" que se substitui. PO, Arquiteto, Dev Lead, UX Designer e Staff
ganham a ferramenta (alias + `tool_specs` + `run_tool/3` + a mesma frase no
`system_prompt/1`); o Criativo já tinha `emit_artifact` desde a Fase 3b e só
ganhou o tipo novo, sem mudança nele. Distinto de `open_adr_pr` (só o
Arquiteto, commit real + PR + aprovação humana): os dois COEXISTEM para
escalas diferentes de decisão. Fora de escopo, declarado: agentes de execução
(`ToolLoop`, sem harness comum) e a amarração com o Infra Lead — emitir
`decision_record` ao propor `container_start_via_runner` — que depende de uma
tool de outra frente do mesmo plano, em branch separada

### "Sempre permitir" separado por Dev Agent de módulo (RN-509)
Clicar "sempre permitir" numa ação de um `dev-<modulo>` gravava em
`permissions.json`, escopo de PROJETO INTEIRO — liberava o mesmo comando pra
qualquer outro agente. Passa a gravar em `agent_autonomy(projeto, agente,
tipo)`, o MESMO mecanismo já usado pras 3 ações git seedadas na ativação da
execução. `dev-lead` (lidera a área, não é membro dela) e qualquer ator
não-modular continuam indo pro `permissions.json` de sempre; os dois tetos
absolutos (terminal com efeito externo/comando privilegiado,
`container_remove`) continuam recusando o clique inteiro ANTES do branch novo.
Sem migração: entradas antigas continuam em `permissions.json`, decisão
consciente

### Docker vira pré-requisito real do modo Runner (RN-507/508, ADR 0145)
`runner` roteava todo terminal aprovado ao CLI assim que workspace verificado
+ runner conectado batiam, sem checar container `running` — sem Docker de pé,
o runner caía sozinho no HOST puro, o MESMO fallback silencioso que o ADR 0143
já tinha fechado para `container`/`mounted`. `Engine.Runners.RunnerReadiness`
unifica as TRÊS pré-condições (verificado, conectado, container `running`) com
dois consumidores: `TerminalExecutor` e a materialização do worktree do dev
agent, que deixa de tentar `File.mkdir_p!`/`git init` LOCAL contra o caminho
do HOST (a lacuna aberta desde a RN-478) e passa a rodar DENTRO do container
real, na máquina do usuário, pelo MESMO canal `exec`/`exec_result`
(`Engine.Actions.Workspace.RunnerGit`, novo) — `WorktreeManager` bifurca pelo
mesmo critério, e o job periódico de limpeza PULA em silêncio um projeto
`runner` sem runner pronto agora. O protocolo `exec` ganha `env` opcional para
a credencial de git (ADR 0056) viajar no ambiente do processo filho do HOST —
mesclado sobre `process.env`, nunca repassado ao `docker exec` nem logado.
`container_start` deixa de atender `runner` (o payload dela, com eleição de
imagem, nunca fazia sentido lá); nasce `container_start_via_runner` — schema
só com `rationale`, sobe a imagem já decidida —, com a tool nova do Infra Lead
recusando LOCALMENTE (sem HTTP) antes de propor às cegas

### RN-505 duplicada em dev, corrigida
O "artefato de decisão" e o "sempre permitir por Dev Agent" mergearam com 2
minutos de diferença, cada um alocando RN-505 sem ver o outro; "sempre
permitir por Dev Agent" foi renumerado pra RN-509 (`docs/business-rules.md`,
CHANGELOG, o comentário do `approve-always-action.use-case.ts` e do
`ApprovalCard.test.tsx`), liberando o anchor `{#rn-505}` pro
`decision_record`. Achado junto: a renumeração 505→507/506→508 feita durante a
resolução de conflito de outro PR (Docker/runner, ADR 0145) tinha ficado
INCOMPLETA — sobravam três menções a "RN-505" neste próprio arquivo, também
corrigidas pra "RN-507"

### FASE 28 (sessão 5) — o `join` do agente local deixa de ser mudo (RN-514, ADR 0147 ponto 1)
O `join` do canal `terminal:<projectId>` era mudo dos DOIS lados — o runner
mandava `{}` e o servidor fazia `_params` —, então o servidor não tinha como
saber se o binário do outro lado entende uma mensagem nova, e o defeito era o
pior possível: a mensagem chega, o handler não existe e NADA acontece, sem
erro e sem log. Agora o runner DECLARA nos params
(`Engine.Runners.Capacidades`, vocabulário `exec`/`pty`/`espelho`) e o
servidor CONCEDE a interseção com o que CONHECE, em `socket.assigns` e NUNCA
em tabela (capacidade é propriedade daquela CONEXÃO). O runner declara só
`exec` e `pty` — declarar `espelho` sem implementá-lo é exatamente o defeito
que a negociação impede; ele entra como NOME do vocabulário e nada mais, e a
sessão 6 o implementa. Params ausentes/vazios são o binário LEGADO e concedem
`{exec, pty}` — FATO, não benevolência: são as duas funções com que o runner
nasceu, e recusar legado seria `breaking/` e MAJOR. Desconhecido é IGNORADO
(runner mais NOVO que o engine conecta); exigida-e-não-declarada recusa o join
NOMEANDO a que falta, ANTES do `Registry` — mecanismo implementado e testado
que hoje NÃO dispara (`runner` exige `exec`, que todo binário tem; nada exige
`espelho` ainda), e isso é o desenho. A metade que entrega valor HOJE:
mensagem sem a capacidade é RECUSADA com resposta nomeada — `exec` responde no
formato de `exec_result` (126 + causa) em vez de o `RunnerRouter` esperar o
timeout, e `pty_*` vira `pty_error` na aba em vez de sumir. `RunnerReadiness`
byte a byte como está

### FASE 28 (sessão 6, metade B) — o espelho passa a existir (RN-516, ADR 0147 pontos 2/3/4/8)
A capacidade `espelho` sai de nome do vocabulário e vira código nos DOIS
lados. O DESTINO viaja na CONCESSÃO do `join` (a resposta deixa de ser vazia
para o `:runner`: `%{espelho: %{destino: ...}}`), vive só naquela conexão e o
runner RECUSA `mirror_sync` para destino não concedido — nunca configuração
global nem variável, que faria o artefato do projeto B aterrissar na pasta do
A. `mirror_path` não-nulo passa a EXIGIR a capacidade, e esse é o PRIMEIRO
disparo real do mecanismo de recusa da RN-514: binário velho num projeto com
destino DEIXA de conectar, nomeado e fatal — opt-in, custo declarado no ADR.
`espelho-guard.ts` nasce IRMÃO de `guard.ts` (reusa os três helpers e a dupla
passada, herda a ressalva de TOCTOU por escrito) e recusa as três coisas do
ADR; achado implementando: `realpathMaisProximo` cai no ancestral, e como o
destino quase nunca existe, colapsar os dois lados faria `/base-outra` e
`/base` virarem `/` — a segunda passada resolve o ancestral e RECOLOCA o
sufixo. UMA direção e NUNCA apaga: arquivo apagado na origem PERMANECE no
destino (a pasta do usuário é acúmulo, não réplica). O que se copia é a LISTA
DO GIT (rastreados + não-rastreados-não-ignorados), sem lista de exclusão
própria; git que falha vira erro NOMEADO, nunca `cp -r` de plano B; repo git
aninhado (o worktree do dev agent) volta como UMA entrada e não é descido, e
symlink da origem é pulado. Predicado PRÓPRIO (`Engine.Runners.Espelho`), DUAS
pré-condições e NUNCA `RunnerReadiness` com flag — `runner_readiness.ex` fica
byte a byte. Gatilho: o COMMIT, momento nomeado, fire-and-forget e nunca
watcher; "fim de turno de agente" fica DECLARADO e não ligado, por não haver
enganche não-ambíguo

### O broker que nunca subiu (correção da RN-512) (RN-512, ADR 0130/0146)
A RN-512 tirou o broker do `profiles` para ele estar de pé em dev, e ele NUNCA
subiu: `corepack prepare` rodava como ROOT no build (cache em `/root/.cache`),
o container roda como uid 1000, e sem cache o corepack tenta BAIXAR o pnpm num
serviço cuja única rede é `internal: true` — `EAI_AGAIN registry.npmjs.org`,
`Exited (1)` cinco segundos depois. Sem healthcheck, `up --wait` dizia
`Healthy` e o reset total anunciava "reset completo" com o processo morto;
enquanto houve profile, quem subia o broker era quem já estava olhando. A
correção tira o registry do RUNTIME e NÃO abre a rede (primeira das cinco
camadas do ADR 0130): `COREPACK_HOME` preparado no build com o dono do uid de
runtime, `pnpm install` como passo de BUILD, e — porque os três volumes de
`node_modules` cobrem o que a imagem instalou e o Docker só semeia volume
VAZIO — um entrypoint que os reconcilia contra uma cópia fora de `/workspace`,
carimbada pelo sha256 do lockfile do build (o mesmo carimbo AVISA que a imagem
ficou para trás, sem recusar subir). Healthcheck no serviço, de dentro do
container. Produção não sofria disto e não muda

### FASE 28 (sessão 7) — o agente local vira serviço de usuário (RN-518, ADR 0147 ponto 5)
`brabo-runner service install|uninstall|status`, e o precedente era ZERO
(nenhuma menção a `systemd`/`launchd` em `apps/runner/`; o modelo era
foreground morto por SIGINT). Nível de USUÁRIO sempre — `systemd
--user`/`LaunchAgent` —, e root é RECUSA e não aviso: o docblock de `guard.ts`
declara "roda com os privilégios DELE" como a premissa das três fronteiras
reais, e um serviço root deixaria a guarda best-effort de `cwd` como única
coisa entre um comando aprovado e o disco. Windows é recusa NOMEADA (terceiro
mecanismo, não variação dos dois). Uma unit por PROJETO porque o servidor já
impõe um runner por projeto — nomear pela pasta criaria duas units que nunca
sobem juntas, e a segunda apareceria como falha de conexão em vez de erro de
instalação; no Linux o arquivo vai para onde o systemd PROCURA
(`$XDG_CONFIG_HOME/systemd/user`, senão `~/.config`). `Restart=on-abnormal` e
NUNCA `on-failure` (no plist, `KeepAlive`/`Crashed`): exit 1 do runner é
recusa fatal de join (RN-514) ou teto de tentativas esgotado, e reiniciar
seria o laço que o CLI recusa fazer sozinho. Serviço autentica por CHAVE DE
DISPOSITIVO e nunca por token — gravá-lo numa unit o deixaria em disco, e este
CLI nunca gravou credencial em disco. `uninstall` remove os TRÊS lendo a pasta
da UNIT e nunca do `cwd` (sem unit, só com `--dir` — adivinhar apagaria a
chave de outro projeto), e DIZ que a chave saiu do disco e NÃO foi revogada no
servidor. `status` responde QUATRO estados com frase e código próprios
(0/3/4/5), e a primeira resposta vem do DISCO — por isso continua certa numa
máquina sem gerenciador; `spawn` que falhou nunca vira "o gerenciador disse
não". BRB-031 NÃO fecha aqui

### A spec do runner ia sem `projectId`, e o caminho NUNCA subiu container (RN-508, ADR 0145)
`container_start_via_runner` (RN-508, ADR 0145) terminava `failed` em 100% das
vezes — *"especificação de container recusada em `projectId`: esperava texto
não vazio, recebi undefined"* —, e numa execução real do `exp004` o que se via
era o EFEITO: dez tasks de dev sem nenhum agente reivindicando. Esse bloqueio
estava CERTO (RN-507 e RN-502/ADR 0143 recusam sem container `running`
REGISTRADO); o errado era o passo anterior.
`EspecificacaoDeContainerParaRunner` nasceu com NOVE campos e
`especificacaoValidada` (`packages/docker-port`) sempre exigiu DEZ — o dado
estava à mão em `SpecDeContainer.projectId` e só não era copiado; o engine
repassa o mapa OPACAMENTE, então nada se perdia no meio. Por contraste o
BROKER sempre funcionou porque ele BUSCA a spec na api e recebe o
`SpecDeContainer` inteiro — era por isso que só o modo `runner` quebrava. Três
suítes verdes não pegaram porque cada elo montava o próprio fixture: ninguém
testava a CORRENTE. Entra ela — o payload que o caso de uso REAL compõe
atravessando o validador REAL, e o CONJUNTO de campos travado (`raizDoProjeto`
é o único que a api não manda) — na suíte da api, por import RELATIVO, o único
lugar onde os dois lados existem vivos; o invariante
`api-nao-consome-docker-port` segue verde e foi ESTENDIDO para reprovar import
relativo a partir de `src/`. Irmãos conferidos e CERTOS:
`container_stop`/`container_remove` mandam só `workspaceDirName`, que é tudo
que `nomeDeWorkspaceValidado` pede

### A pausa que não podia ser desfeita (RN-540)
Anamnese e Psicólogo estavam PAUSADOS desde 2026-08-10 e três lugares chamavam
a pausa de reversível — os docblocks de
`AnamneseSchedulerWorker.enabled?/0`/`PsychologistWorker.enabled?/0` ("Ligar
de volta é `X=true` e reiniciar o engine") e
`docs/reference/configuration.md`. Não era reversível em ambiente NENHUM: o
`environment:` do serviço `engine` mapeava as TREZE variáveis de
Anamnese/Psicólogo — todas TETOS de custo — e nenhuma das duas de PRODUTO, e
`docker compose` NÃO repassa o ambiente do host, então `ANAMNESE_ENABLED=true`
no `.env` era inerte e `runtime.exs` caía no default `"false"` em SILÊNCIO.
Medido no container de dev: `[true] [] []`. Origem provável: quando o default
virou `false`, ninguém precisou da variável para DESLIGAR — só quem tenta
LIGAR descobre que o fio não existe, meses depois. As OITO flags booleanas
(`System.get_env("X", "true"|"false") == "true"`) entram nos DOIS composes com
o MESMO default do código — as quatro extras (`START_MODEL_SYNC`,
`START_GATE_RESCUE`, os dois `GRAPH_*`) porque são o mesmo defeito, achado
pelo próprio mecanismo, e excetuá-las exigiria quatro desculpas. Zero mudança
de comportamento: a decisão de produto de manter os dois desligados fica byte
a byte, o que passa a existir é o INTERRUPTOR. O mecanismo é
`scripts/ci/flags-do-engine-no-compose.spec.ts`, que DERIVA a lista do
`runtime.exs` (as outras 50 variáveis são tetos com default bom e coisas de
release, legitimamente ausentes) e cobra default igual só no compose de DEV —
o de produção desliga os agentes de fundo de propósito. `deploy/k8s/` NÃO
muda, por coerência: lá não existe a camada que quebra

### FASE 29 (sessão 1) — instalação de uma linha, só planejamento (ADR 0149-0152, fase-29-instalacao-de-uma-linha.md)
Instalar o Brabo são TRÊS gestos desconexos (compose com cinco segredos à mão,
runner pelo navegador com `chmod +x`, `pnpm bootstrap` que só existe num
checkout), e a FASE 28 recusou por escrito o instalador de uma linha enquanto
os artefatos não forem assinados (BRB-005) — por isso a fase assina ANTES de
instalar. Quatro ADRs `Proposed`: assinatura `cosign` keyless por DIGEST mais
UM `checksums.txt` assinado, nunca cinco assinaturas (0149); o instalador
invocado por `sh -c "$(curl …)"` e NUNCA `curl|sh`, porque com o pipe o script
É o stdin e o consentimento morre (0150); a base consentida do runner,
reusando `dentroDoEscopo` e a recusa de laço por SEGMENTO de
`espelho-guard.ts` em vez de uma quarta cópia da régua (0151); e
backup/restore contra compose (0152). A medição corrigiu CINCO pontos do
recorte original: `workspace.verified` NÃO existe (o que existe é
`workspace_confirm`, e ele é UNIDIRECIONAL), o ponto 5 do ADR 0146 versiona
`consentir-base.mjs` e não um `install.sh`, `docker-compose.prod.yml` não
consome GHCR e se declara compose de VALIDAÇÃO, `make test-restore` é caminho
de Kubernetes com backup só de Postgres, e "um runner por projeto" está
imposto em CINCO lugares independentes — o que tirou o runner por máquina
desta fase, para a FASE 30. Achado próprio: **`git_local_repos` não está em
backup nenhum**, e perdê-lo é perder o código dos projetos `local`. Nasce
`docs/reference/brb.md` — e o achado é que o registro de BRB **não é do
repositório**: vive no vault do mantenedor, com 33 itens, e aqui só dois ids
apareciam em prosa. Medindo: BRB-032 e BRB-033 descrevem defeitos que **já não
reproduzem**, e **BRB-004 não é o que o id sugere** — pede imagem de terceiro
por DIGEST, não a tag que o #419 fixou. O arquivo daqui guarda a EVIDÊNCIA
(estado medido, `arquivo:linha`); o vault segue dono da finding. Faixa
RN-524..538 e ADRs 0149-0152, pulando o que está EM VOO: três colisões
observadas no mesmo instante (ADR 0148 ×2, RN-522 ×2, RN-523 ×2), resolvidas
depois pelo critério da DATA — quem alocou primeiro ficou com o número, e as
branches de 08/09 viraram ADR 0153, RN-539 e RN-540

### FASE 29 (sessão 2) — a esteira assina o que publica (RN-524, ADR 0149)
O produto assinava **nada**: `cosign`/`sigstore`/`attestation` não existiam em
`.github/`, `scripts/` ou `docker/`, e a única procedência era o
`--provenance` do pacote **npm** do runner. `release.yml` publicava as quatro
imagens **sem** `id-token: write`; `build-runner-binaries.yml` subia os cinco
binários com `gh release upload` e nada mais — enquanto os `sha256sum -c` que
já existiam verificam binário **de terceiro**, o padrão que o repositório
sabia aplicar e nunca aplicou a si mesmo. Agora as imagens são assinadas por
**DIGEST** (nunca por tag, ponteiro móvel) e os binários ganham **UM**
`checksums.txt` assinado, num job `checksums` que espera a matriz — não cinco
assinaturas, porque quem verifica quatro e esquece o quinto não sabe que
esqueceu. O job é `if: always()` de propósito (`fail-fast: false` na matriz) e
**nomeia o que o manifesto não cobre**. Os dois workflows **verificam antes de
publicar**. Keyless pelo histórico da casa: chave privada seria mais um
segredo de CI, e um PAT já expirou calado (ADR 0139). Procedimento de
verificação no runbook, com as duas flags `--certificate-*` **obrigatórias** —
sem elas o `cosign` aceita assinatura válida de QUALQUER UM. Fecha BRB-005
para imagens e binários; ficam fora, declarados, o code-signing de SO e o
proxy de download

### FASE 29 (sessão 3) — o instalador que ainda não instala (RN-526, ADR 0150)
Nasce `install.sh` na RAIZ, versionado e servido pela Release. A forma é `sh
-c "$(curl …)"` e **nunca** `curl|sh`, por motivo MECÂNICO: com o pipe, o
`stdin` do processo É o download, e todo `read` lê bytes do próprio script ou
acha EOF — um instalador que não pergunta escolheria sozinho onde criar pasta
na máquina de alguém. Ele VERIFICA A PRÓPRIA ORIGEM (a assinatura do
`checksums.txt` da RN-524, e o hash dele DENTRO do manifesto verificado), com
o `cosign` pinado e conferido por `sha256sum` contra o hash escrito no script;
a DETECÇÃO nomeia o que achou antes de perguntar; sem TTY relata e sai 0; e
**nunca apaga pasta de usuário** — base de projetos e pasta de espelho ficam
fora de qualquer confirmação, pela régua do espelho (RN-516). Marcador em
`$XDG_STATE_HOME/brabo/`, nunca em `~/.brabo/`, que é POR PROJETO. **Não
instala nada nesta versão, e DIZ isso** em vez de terminar calado.
`--print-plan`/`--print-state` expõem a decisão sem TTY, sem rede e sem efeito
— molde do `--print-commands` do `bootstrap.sh`, testado igual. Dois bugs de
bash achados rodando, os dois do mesmo gênero: sob `set -e`+`pipefail`, `[
cond ] && atribuição` que dá falso MATA o script, e um `ls` que não casa
derruba a substituição inteira — numa função cujo caso normal é "não achei
nada". A RAIZ do repositório não era coberta por docmap nenhum (os globs de
raiz são nomes literais); nasce a regra `instalador`

### FASE 29 (sessão 4) — a instalação sobe de um compose próprio (RN-527, ADR 0150)
Nasce `docker/docker-compose.install.yml`, GERADO a partir do de produção e
diferente em três pontos: as quatro imagens vêm de **variável obrigatória**
(`${BRABO_API_IMAGE:?…}` — com default, faltar a variável subiria metade da
stack com imagem que ninguém escolheu, e o erro viraria comportamento estranho
em vez de recusa), **nenhum `build:`** sobrevive, e o serviço **`broker` NÃO
existe** porque a imagem dele não é publicada (o bake tem quatro alvos) — com
`--source=ghcr`, `mounted` não sobe container, e o compose DIZ isso no
comentário da `BROKER_URL`. O `docker-compose.prod.yml` fica intacto: ele se
declara compose de VALIDAÇÃO e é o que o `smoke.sh` usa construindo local. O
custo dos dois arquivos é declarado e o teto é MECÂNICO —
`composes-em-conformidade.spec.ts` reprova serviço/volume/porta a mais,
`build:` sobrevivente e imagem de terceiro afrouxada. Duas coisas do plano
morreram no contato com o disco, por motivos opostos: **migrate não é passo**
(o compose encadeia `api`→`migrate-api` com `service_completed_successfully`,
e dois lugares mandando migrar seriam duas fontes da mesma verdade) e **o
`smoke.sh` não é reusado** (ele CONSTRÓI o que a instalação baixou por digest,
e derruba a stack no fim) — no lugar, o instalador PERGUNTA antes de afirmar,
batendo no `/health` dos dois

### FASE 29 (sessão 6) — migrar exige backup PROVADO (RN-530, ADR 0150/0152)
Instalar por cima de instalação existente **não é oferecido** — ou migra, ou
para: `up` sobre volumes de outra versão é estrago que não avisa. A ordem é
backup → **PROVAR** → perguntar → apagar → instalar → restaurar, e o passo do
meio é o que dá ao instalador o direito de apagar: um backup que ninguém
tentou restaurar é um arquivo, e a hora de descobrir isso não é depois do
`down -v`. A prova roda `test-restore-compose.sh` (as MESMAS três validações
do ADR 0152); backup ou prova que falham param a migração **sem apagar nada**.
O destino é pasta do HOST — o default do compose é o volume `backup_local`,
que o `down -v` apagaria JUNTO com o que se quer preservar. O dump do Postgres
NÃO é restaurado sozinho sobre banco populado (é destrutivo, e `brabo-restore`
nunca toca a origem); os repos git locais sim, porque nasceriam vazios

### FASE 29 (sessão 7) — uma base para os dois lados, e o BRB-031 fecha (RN-531, ADR 0150/0151)
O instalador pergunta a base UMA vez e grava nos DOIS lugares:
`BRABO_PROJECTS_BASE` no `.env` (servidor, ADR 0141) e o campo `base` do
`runner.json` (agente local, RN-529) — o que difere entre `mounted` e `runner`
é QUEM executa, não onde o código mora, e duas bases para a mesma pasta seriam
a colisão que o ADR 0141 recusou. Recusa nos DOIS sentidos contra o checkout,
e `~` não é expandido de propósito (o valor vai para arquivo de configuração,
onde `~` é lido literalmente). O binário do runner é conferido contra o
**mesmo** `checksums.txt` que o script já verificou para conferir a si mesmo —
baixá-lo de novo seriam duas chances de pegar manifestos diferentes, e a
segunda não seria verificada — e instalado com `install -m 0755`. **BRB-031
fecha por aqui**: ele sobreviveu à FASE 28 porque a instalação não vinha de
artefato versionado, e quem chegava ao `service install` já precisara do
`chmod`. Release sem o binário da plataforma NÃO interrompe a instalação

### FASE 29 (sessões 8-10) — o protocolo, o picker e o E2E (RN-532..534, ADR 0149/0150/0151)
**8 (RN-532)**: nasce o par `workspace_create`/`_result` no molde de
`exec`/`exec_result`, e a confirmação REUSA o `workspace_confirm` que já
existe — nenhuma rota de gravação nova, engine continua sem escrever a tabela.
O predicado é PRÓPRIO por uma razão mais forte que a do espelho: ali a
terceira pré-condição seria **circular** — projeto `runner` só tem container
`running` depois de o runner o subir, e o container sobe SOBRE a pasta que
esta mensagem cria. A capacidade `workspace` é a única cuja declaração depende
do ESTADO (base consentida), não da versão do binário. **9 (RN-533)**: o
picker volta a ler o disco do usuário por `fs_list_dir`, e a decisão de NÃO
esconder o modo sem runner é simétrica à RN-513, não contrária — lá a api TEM
sinal e sem base a criação termina em 400; aqui não há sinal de presença (a
RN-521 já declara), e esconder seria decidir "não tem" a partir de "não sei".
Achado: a tela decidia casando a FRASE `'Nenhum runner conectado'` que mora
num `.ex` do engine — virou motivo discriminado. **10 (RN-534)**: o
`install.sh` entra no `checksums.txt` assinado (sem isso a verificação que ele
faz de SI MESMO era letra morta) e é exercitado em máquina limpa, com TTY
simulado por `script -qec` e nunca por pipe — o pipe é o que mata o
consentimento. NÃO roda em PR, pelo mesmo motivo da assinatura

### FASE 29 (sessão 8) — a base do agente local ganha um consumidor (RN-532, ADR 0151 pontos 3–6)
A RN-529 construiu a BASE e declarou por escrito que nada a consumia. Entra o
par `workspace_create`/`workspace_create_result`, no molde de PEDIDO COM
RESPOSTA de `exec`/`exec_result` — e NUNCA no de `workspace_confirm`, que é
UNIDIRECIONAL (`{:noreply, socket}`, não empurra nada de volta), precisão que
a fase já tinha registrado junto com "`workspace.verified` NÃO existe". Só o
SEGMENTO relativo atravessa a rede (invariante do ADR 0130/0144: quem tem a
raiz é quem executa), e segmento ABSOLUTO é recusado por léxico. A confirmação
REUSA o `workspace_confirm` que já existia, e é o que economiza uma frente
inteira: **nenhuma rota nova de gravação nasce**, o engine continua não
escrevendo a tabela, e o único caminho que carimba `workspace_verified_at`
continua sendo um só — com a ORDEM como mecanismo (confirm ANTES do resultado,
porque os dois chegam ao mesmo processo de canal em ordem e o handler do
confirm é síncrono). A capacidade `workspace` entra no vocabulário NA SESSÃO
EM QUE O CÓDIGO ENTRA, dos dois lados — a RN-514 fez a aposta oposta com
`espelho` e ela só se pagou porque alguém a cobrou —, e ela é a ÚNICA das
quatro cuja declaração depende do ESTADO daquela execução: o runner só a
declara com base consentida, e é por essa linha, e por mais nenhuma, que o
servidor SABE que existe base (o engine não lê o disco do usuário). NINGUÉM a
exige no join, de propósito: exigi-la em `runner` seria `breaking/` e MAJOR
por uma função que aquele projeto talvez nunca use. Predicado PRÓPRIO
(`Engine.Runners.PastaDoProjeto`), DUAS pré-condições, `RunnerReadiness` byte
a byte — e aqui a terceira seria pior que desnecessária, seria CIRCULAR: um
projeto `runner` só chega a ter container `running` depois de o runner o
subir, e o container sobe sobre a pasta que esta mensagem existe para criar.
Ele também não pergunta `workspace_verified_at` (aqui é o RESULTADO) nem o
modo. As DUAS pré-condições são respondidas em lugares diferentes porque "base
consentida" é propriedade da CONEXÃO (`socket.assigns`, nunca tabela): o canal
recusa ANTES de empurrar, com `motivo: "sem-base"` pelo mesmo `ref`, no
formato que o módulo espera — nunca timeout. Cinco motivos nomeados que não
colapsam, idempotência com desfecho PRÓPRIO (`ja-era-repositorio` é sucesso),
e `estado.dir` NÃO muda. Não é `proposed_action` e nenhum teto ganha exceção

### FASE 29 (sessão 5) — o backup passa a cobrir o que perder dói (ADR 0152, RN-528)
O backup cobria UM banco e rodava NUM lugar: `make test-restore` é caminho de
Kubernetes (exige `kubectl`, cluster e o CronJob) e `docker-compose.prod.yml`
não tinha serviço `backup` NENHUM — migrar uma instalação por compose não
tinha caminho provado. A decisão começa RECUSANDO o movimento fácil ("fazer
backup de todos os volumes") e CLASSIFICANDO os sete: `neo4j_data` e
`project_workspaces` são derivados, `ollama_data` é re-obtenível,
`brabo_projects_base` é do usuário — copiá-los dá impressão de cobertura sem
acrescentar recuperação. Fonte de verdade são DOIS, e o achado é o segundo:
**`git_local_repos` não estava em backup nenhum**, e um projeto com provider
`local` guarda o *bare* ali — não é reconstruível do Postgres (o event log
guarda a NARRATIVA, não os objetos do git), então perder o volume é perder o
código dos agentes. A prosa do runbook afirmava o contrário ("the real
repositories live in GitHub/GitLab") e é ela que explica os anos sem
cobertura: vale para `github`/`gitlab`, e para `local` não há upstream. A
garantia do arquivo é DECLARADA e menor que "snapshot" — consistência por
REFERÊNCIA (git escreve objetos antes de mover a ref, e troca a ref por rename
atômico), sem instante global e sem `git fsck` (a imagem não tem git, de
propósito); `gc` concorrente vira FALHA e não arquivo parcial, com o status do
`tar` capturado num ARQUIVO porque em POSIX `sh` o status de um cano é o do
último comando. As cinco variáveis de S3 deixam de ser obrigatórias e viram a
configuração de UM destino (`BACKUP_DIR` escolhe disco; ausente, S3 — a
inferência é o que mantém o CronJob INTACTO). `make test-restore-compose`
dispara backup REAL e chama o MESMO `brabo-restore` com as MESMAS três
validações: muda o INVÓLUCRO, nunca o julgamento, e
`deploy/k8s/test-restore.sh` fica INTACTO (unificar faria o de compose
depender de `kubectl`); `restore.sh` segue sem tocar a database de ORIGEM.
Restaurar os repos é comando IRMÃO (`brabo-restore-git`, verifica por default,
escreve só com `--restaurar`) e não fase do outro — dois artefatos, dois
julgamentos, e juntá-los faria falha de git reprovar a validação do event log.
Achado RODANDO, que a leitura não daria: o volume é compartilhado por três
imagens com uids diferentes e carrega o dono de quem o montou primeiro (medido
`1000:1000`, modo 0755), enquanto a imagem roda como uid 70 — a extração
morria no meio deixando o volume pela metade; agora recusa ANTES do `tar`
nomeando `--user 0:0`, e o extraído como root volta ao dono do DIRETÓRIO,
senão o volume voltaria íntegro e INÚTIL (api e engine, non-root, sem
conseguir escrever no que se acabou de restaurar). Neo4j recebe REPROJEÇÃO e
não backup — não construída aqui (BRB-018): instalação migrada nasce com o
grafo VAZIO, degradação nomeada e não perda de dado (o RAG vive no pgvector,
dentro do dump)

### FASE 30 — o agente local da máquina (ADRs 0154/0155, RN-543..552, fecha na sessão 8 com a RN-549)
A FASE 29 entregou instalar numa linha e PAROU em dois pontos que o próprio
produto já declarava por escrito: o agente local continuava pareado por
PROJETO (quem quisesse usar o binário instalado voltava ao navegador para colar
um comando no terminal), e **ninguém conseguia entrar** — o `.env` gerado não
tem variável de e-mail, `MAIL_TRANSPORT` cai em `log` e o registro exige
verificar e-mail, então a saída era pescar o link em `docker compose logs api`.
Os dois se resolviam no mesmo lugar, e é isso que fez uma fase só. O achado que
definiu o TAMANHO dela veio de remedir com `arquivo:linha` a afirmação da FASE
29 de que "um runner por projeto está imposto em cinco lugares": **três dos
cinco não precisavam mudar**, porque tópico, socket id e ticket descrevem uma
CONEXÃO, e um processo que abra N conexões — uma por projeto — os satisfaz byte
a byte, preservando a recusa de segundo runner no mesmo projeto, que é garantia
real e não acidente. **Nada no engine mudou na fase inteira**, e foi o que
manteve `RunnerReadiness`, o espelho e `workspace_create` intactos. O que sobrou
foi o que é do PROCESSO: a credencial (`runner_device_keys.project_id` vira
nullable, RN-543 — e a listagem passa a devolver as DUAS espécies marcadas,
senão uma chave de máquina seria invisível e permanente, o defeito que a RN-519
fechou renascido) e a unit (RN-545, `service install --machine`, uma por
máquina, CONVIVENDO com as por projeto). Duas decisões contrariaram a letra dos
ADRs e as duas foram MEDIDAS: o discriminador da unit é a flag `--machine` e não
a ausência de `--project` (`resolverProjeto` tem duas fontes, e o caminho normal
é rodar `install` sem flag de dentro da pasta que o navegador configurou — ao pé
da letra, o ADR converteria em silêncio a instalação de quem já usa o produto), e
`install` RECUSA quando a outra espécie já está instalada, sem `--force`, porque
as duas juntas seriam dois processos disputando o mesmo projeto. A sessão 6
tocaria três workspaces de uma vez e foi DIVIDIDA em três, com as duas peças
disjuntas saindo antes e o `install.sh` depois delas, como orquestrador e nada
mais. Dessa divisão saiu a revisão mais interessante da fase: com ZERO conexões
o agente deixou de SAIR e passou a ESPERAR, reconsultando a 15s/30s/60s
(RN-550) — o argumento da RN-544 contra repesquisa continua inteiro onde ele
vale (lista que volta MENOR é ambígua, e derrubar conexão VIVA por ambiguidade
troca estado certo por palpite), e com zero conexões não há nada a derrubar; o
que caiu foi o argumento do `exit 0` ("um serviço ativo que não faz nada"),
porque o processo passou a fazer algo e a DIZER que faz. Medido: `Restart=on-abnormal`
**não olha código de saída**, então nenhuma unit mudou e o efeito é a de máquina
ficar `active (running)` de verdade. A outra peça (RN-551) fecha o "ninguém CRIA
chave de máquina" pelo lado do agente, e a decisão ali é o CORTE: o CLI **não**
fala com a api, porque quem registra é o instalador com o `BRABO_SERVICE_TOKEN`
— cada lado guarda um segredo e nenhum vê o do outro. Disso decorre o desenho de
dois passos, e dele decorre o invariante: o `kid` É o id do registro e só existe
depois dele, então o `create` grava um `.parcial` que o leitor ignora e o
`finish` grava o nome de verdade — **o arquivo que o runner lê nunca existe sem
`kid`**, o defeito da RN-475 tornado impossível por construção. A metade de api
(RN-552) declarou o custo em vez de escondê-lo: a credencial é o service token,
e um token vazado passa a poder FABRICAR credencial duradoura — por isso três
contenções vivem na ROTA e não no texto (não há `userId` no corpo; registrar
SUBSTITUI as chaves de máquina ativas do dono na mesma transação, então máquina
reinstalada passa e mil chaves são impossíveis por cláusula, sem número que
envelheça; e JWK com `d` é recusada por nome). A sessão 6 (RN-547) encadeou os
cinco comandos e fixou três regras: elo do meio que falha não desfaz nada, vira
linha nomeada num bloco final e o script SEMPRE sai 0 (desfazer exigiria apagar
conta e revogar chave, e não há rota para isso nem deveria haver uma que o
instalador chame sozinho); idempotência é o CÓDIGO HTTP, e `409` é desfecho
ESPERADO e não falha, com `000` tratado à parte para "a api não subiu" não ser
lido como "a api recusou"; e a senha viaja pelo STDIN do `curl`, nunca por
`argv`, porque `/proc/<pid>/cmdline` é legível por qualquer usuário da máquina.
Achado dessa sessão: o `--help` MENTIA havia meses (*"ESTA VERSÃO NÃO INSTALA
NADA"*) porque ele imprime o cabeçalho, que é comentário, e a regra que proíbe
falar de "sessões de fase" só lia linhas de código. A sessão 7 (RN-548) deu
consumidor à marca de espécie, e a decisão foi de HONESTIDADE: com chave e sem
conexão viva — o caso mais comum — a tela diz as duas coisas que sabe e nomeia
as duas que não sabe (*chave registrada não é agente rodando*, *a lista é da sua
CONTA e não deste navegador*), tom `accent` e nunca `success`. A sessão 8
(RN-549) é a única que podia provar o conjunto, e ela ESTENDEU o workflow que a
FASE 29 já tinha em vez de criar um segundo. A decisão central dela é o SINAL:
`perguntarEstado` mapeia `activating` para `rodando` — com razão —, então
`systemctl is-active` e `service status --machine` dariam verde a um processo
que vai morrer em dois segundos; o sinal escolhido é a LINHA que o agente
escreve ao entrar na espera, que só existe depois de ele ter lido a chave,
tirado ticket, falado com a api e recebido lista VAZIA, e que é um FATO GRAVADO
e não uma amostragem de estado. O desfecho se prova pela API e não pelo
navegador, porque o sujeito da afirmação é o AGENTE e o que ele observa é
`GET /runner/projects` — um navegador criaria o projeto pela mesma rota com uma
camada a mais que falha por motivos alheios, e a asserção continuaria sendo a
linha do journal. E o E2E segue FORA de `pull_request`, com a consequência
declarada em vez de escondida (**o PR que o escreveu não o executou**): abrir
essa porta é dar ao instalador um jeito de pular a verificação de origem, que é
o que o ADR 0150 recusa — daí a metade que roda em PR ser um TESTE
(`scripts/dev/install-e2e.spec.ts`), guardando as duas formas de o workflow
apodrecer calado, o gate afrouxado e a frase do `install.sh` reescrita (que faz
as asserções não falharem, e sim SUMIREM). Dois defeitos apareceram, os dois
invisíveis porque o workflow nunca rodou: as respostas do TTY começavam por
`nao-migrar`, que numa máquina limpa cai na pergunta do MARCADOR e fazia o
script sair 0 dizendo "Nada foi gravado"; e o ACHADO que ficou como achado — o
`install.sh` publicado **não sobe nada sozinho numa máquina limpa**, porque
`docker/docker-compose.install.yml` (com `./postgres/init.sql` junto) não é
asset da Release, não entra no `checksums.txt` assinado e ele não o baixa em
lugar nenhum, então quem segue o `curl … install.sh` do runbook morre em "no
such file or directory" DEPOIS de já ter verificado assinatura e gravado o
`.env`. Consertar é decidir entre asset assinado e clone, e é entrega própria.
O que a fase deixou DECLARADO e não feito: a revogação continua alcançando
`{projeto, usuário}` e nunca `{chave}`, e agora custa mais (derruba o agente em
TODOS os projetos daquela máquina); não há tela onde listar e revogar chave de
dispositivo, e a fase acrescentou uma espécie a listar sem construir a tela — a
lacuna ficou MAIOR, de propósito; um processo por máquina é ponto único de
falha, preço do desenho; e `install --machine` continua sem saber se a chave
daquela pasta é mesmo de máquina, porque em disco as duas espécies são o mesmo
arquivo e quem sabe é o servidor

### O golden-set do QA volta a medir e roda agendado, semanal (AT-076/AT-149, ADR 0168)

Duas entregas, uma decisão humana entre elas. A AT-067 tinha medido que o
relógio cabia num `ubuntu-latest` sem GPU e que o instrumento não media: desde a
RN-502 o `npm test` de um projeto `container` sem container `running` é
recusado, e o seed nunca subia um — 0/6 por construção. O mantenedor escolheu o
"caminho 1" e a AT-076 o entregou: o seed sobe o container de cada caso pelo
caminho de PRODUÇÃO (`module_map` → roteamento → `container_start` proposto pela
Infra e aprovado pelo dono → `ExecuteContainerStartUseCase` → broker → `running`
pela máquina de estados), com `node:24.11.1-bookworm-slim` preso por digest, a
RN-502 intacta, e container que não sobe virando erro NOMEADO que reprova o
ExUnit (antes o `{:skip, _}` do corpo passava verde calado). Duas rodadas em CI
deram 3/6 e 3/6 contra o piso de 1/6, com casos diferentes, em 52 e 86 min de
job. A AT-149 fechou a cadência: SEMANAL (sábado 01:17 UTC, mais
`workflow_dispatch`, nunca `pull_request`), em `golden-set-qa.yml`, no molde do
`golden-set-rag.yml`. Semanal e não noturno porque a rodada custa até 86 min e
VARIA — o mesmo total por casos diferentes —, e uma por semana basta para o piso
acusar uma queda. `timeout-minutes: 150` pelo pior caso medido. O veredito é o
do próprio teste; o workflow acrescenta só duas guardas de INSTRUMENTO (a linha
de placar tem de existir, e o event log não pode ter recusa da RN-502) e, em
falha, imprime os logs como o do RAG — sem issue. A imagem a puxar antes do seed
é LIDA da constante do seed, nunca de um segundo literal, porque o `docker run`
do broker roda sob o teto de controle de 30 s (RN-604). A rodada de prova, com
gatilho temporário de `push` removido antes do PR, foi a 36327281774: 3/6 de
novo, zero recusas da RN-502, 10 min de `mix golden_set.qa` e 13 min 41 s de
job. Declarado: o broker do CI não tem as cinco camadas do compose, o heartbeat
fecha as sessões do seed enquanto o QA ainda trabalha nelas (sem efeito
visível), e PR que mexe no workflow não o executa.

### O Infra Lead conversa pelo composer (AT-141, ADR 0175, RN-617)

A RN-584 (AT-098) tirou o destinatário padrão do chat e deixou a pergunta de
produto por escrito: o Infra Lead conversa? O mantenedor disse sim em
2026-09-27, com a condição que a própria RN-584 tinha posto — o turno primeiro.
O turno do Infra Lead rodava INTEIRO dentro do `handle_call`/`handle_cast`: sem
aceite, sem "Parar", fora do `TurnoOrfao`, com o 14º passo do laço terminando
calado e um teto de 180 s menor que os 225 s do `propose_action` de container
(RN-605). O kickoff, sendo `cast`, não prendia clique, mas prendia o processo —
8,4 min medidos na AT-089 —, e uma mensagem nesse meio tempo esperaria na fila.
A etapa 1 pôs os três turnos (kickoff, correção de gate, mensagem) no
`TurnoAssincrono`, com a consolidação do Workflows dentro da Task; a correção de
gate que chega com turno em curso ganhou uma fila, porque o `TurnoAssincrono`
sem `from` a descartaria. A etapa 2 deu ao `infra` a cláusula de `message/2`
(saiu a recusa `agente_sem_conversa`), o `via_for` do "Parar" e o lugar em
`AGENTES_DE_CHAT`; o aceite do handoff dele ficou no card próprio da RN-499, e
o card do fio o exclui por nome. `SOLO_CONVERSATIONAL_AGENTS` não mudou: o Infra
Lead é lead de área. Declarado: ele não ganhou perguntas estruturadas nem
leitura de backlog.

### O git credenciado roda no host do runner, o código no container (AT-116, ADR 0193, RN-676)

2026-10-01, rodada 36. A RN-558 tinha fechado a metade do SILÊNCIO — o `git
fetch` autenticado em modo `runner`, com o container de pé, deixou de rodar com
as variáveis vazias e passou a ser recusado com a marca
`credencial-nao-atravessa-o-container` — e declarado a outra metade como ADR
pendente, porque toda opção conhecida mexia na porta de contenção do ADR 0130.
A decisão do dono (01/10) escolheu a que não mexe: operação de git credenciada
no HOST, código no container. Medido antes: o único `exec` do engine com `env`
era o fetch de `RunnerGit.fetch!/3`; não havia `push` nem `clone` credenciado
por `exec` (o clone da criação de pasta já rodava no host, RN-532); e a pasta é
a mesma dos dois lados (`estado.dir` montada em `/work`). O discriminador
escolhido foi uma MARCA explícita do engine (`gitCredenciado: true`, posta só
por `RunnerRouter.exec_git_credenciado/5`), e não o `env` que já existia —
com o `env` como chave, qualquer comando com `env` escaparia do container. A
recusa da RN-558 sobreviveu encolhida, para `env` sem a marca, e na prática
passou a significar "runner anterior ao ADR 0193". A prova é a AT-111, dos dois
lados: no runner, um `git credential fill` e um `git fetch origin` reais com o
helper do `GitAuth` sucedem no host com container ativo; no engine, a corrente
pelo `TerminalChannel` real termina em `{:ok, _}`. Os ExUnit não rodaram no
ambiente da entrega (`repo.hex.pm` 403) e ficaram para o CI.

### A consultiva sem agente pede um agente (AT-254, RN-682)

2026-10-01, rodada 36. No uso real de 29/09 uma sessão consultiva sem agente
respondeu "não tenho acesso a conversas anteriores": a mensagem sem
destinatário ia ao SSE de `POST .../chat`, que manda ao modelo vinculado só o
texto atual — sem histórico, sem prompt de sistema — e grava a resposta com o
nome do modelo como ator. A decisão do dono (01/10) foi pedir um agente em vez
de dar histórico ao chat livre. Medido antes: a tela era o único cliente da
rota (o `curl` impresso pelo seed é dica de desenvolvimento, numa sessão
criativa), e o caso de uso `SendChatMessageUseCase` tinha um segundo consumidor
legítimo, os smokes de provider, que o usam como instrumento de ponta a ponta
numa sessão sem agente. Por isso a recusa da api mora na ROTA, numa guarda
própria, e o caso de uso ficou intacto. Na tela, a linha do destinatário passou
a carregar o próprio seletor do handoff manual quando não há agente — o mesmo
gesto de sempre, agora no lugar onde ele é a única forma de a mensagem ter
destino —, e o Criativo ficou fora da lista porque a consultiva promete que ele
não entra.

### A revogação mira a chave, e não o par `{projeto, usuário}` (AT-013, ADR 0201, RN-685)

2026-10-01, rodada 36. A RN-520 tinha feito a revogação alcançar a conexão
viva, com o alvo `{projeto, usuário}` porque a identidade da credencial morria
no `PatAuthGuard`; o ADR 0154 pôs *"revogação por chave"* entre o que não
fazia, e o PR #534 deu à chave de máquina o mesmo par aplicado projeto a
projeto. A AT-013 ficou bloqueada por recorte e por decisão até o dono
escolher (01/10): por CHAVE, com ADR, mexendo no engine. Medido antes: o
ticket nascia de `{userId, kind}`, o socket guardava só projeto/usuário/kind,
e o canal comparava o usuário — o runner do mesmo usuário com PAT ou outra
chave caía junto; a conexão da chave de máquina num projeto fora da lista da
api ficava de pé; o ticket emitido antes da revogação entrava depois dela; e
revogar PAT não derrubava nada. Entregou-se: duas colunas nuláveis no ticket
(migration Ecto, a tabela é do engine — o diário do Drizzle ficou na `0068`),
o guard anotando a credencial depois de autorizar, o id do socket ganhando
espécie e id da credencial, e uma rota `runner/disconnect-credential` que anula
os tickets pendentes e pergunta a todo runner do cluster se nasceu dela. A
proibição da AT-013 (não deixar de derrubar o que caía) virou duas peças de
transição: a conexão legada cai pelo par nos projetos da linha, e um engine
sem a rota faz a api voltar ao par. O par ficou como alvo da remoção de
membro. A tela trocou só o texto da confirmação (RN-561). O runner não mudou.
Os ExUnit não rodaram no ambiente da entrega (`repo.hex.pm` 403) e ficaram
para o CI.
