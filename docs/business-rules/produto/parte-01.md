---
id: rn-produto-parte-01
title: 'Regras de negócio — Produto — parte 1 (desde RN-012)'
sidebar_label: 'Produto — parte 1 (desde RN-012)'
description: 'As RNs hospedadas na raiz produto.'
keywords: [regras de negócio, produto]
---

# Produto — parte 1 (desde RN-012)

## Backlog

<a id="rn-012"></a>

### RN-012 — A module removed from `module_map` demotes the story {#rn-012}

A story linked to a module that ceased to exist goes back to `draft`, with
a `backlog.story_demoted` event.

- **Where:** `apps/api/src/domain/architecture/module-resolution.ts`; the
  event is emitted in
  `application/use-cases/architecture/create-module-map.use-case.ts:73`
- **Test:** `test/domain/architecture/module-resolution.spec.ts`

## Painel de projetos

<a id="rn-096"></a>

### RN-096 — Toda decisão diz em português o que acontece; o payload cru nasce colapsado {#rn-096}

Todo tipo de `proposed_action` tem uma **frase em português** que descreve o
efeito de aprovar, e ela é a primeira coisa visível no card — antes de qualquer
detalhe, nas três telas onde uma decisão é pedida (a fila de Aprovações, o card
dentro do chat da sessão e a aba Insights). O payload cru continua acessível,
**dentro de um colapso que nasce fechado**, e nunca é despejado na tela.

**O que existia era um despejo.** Todo tipo sem corpo visual próprio caía num
`Object.entries(payload).map(([k, v]) => k + ': ' + JSON.stringify(v))`, sempre
aberto. Quem abria a fila lia `worktree: /workspaces/dev-api`,
`coAuthor: Brabo User <user@brabo.dev>` e `proposto: 4` — e tinha de deduzir o
que ia acontecer se clicasse em Aprovar. Aprovação que exige dedução é
aprovação que se dá no automático, e o produto inteiro se apoia em o usuário
ser a autoridade final.

**A frase degrada, e é isso que a torna confiável.** Nenhuma delas assume que
uma chave do payload existe: com payload vazio a frase continua sendo uma frase
verdadeira, só menos específica ("Registra um commit no repositório do
projeto."). O payload vem do engine e de dez casos de uso diferentes, e nenhum
deles promete um formato — frase que só funciona com a fixture certa é frase
que quebra na primeira aprovação real.

**Tipo que o web ainda não conhece não é caso teórico.** A união `ActionType`
do web já ficou defasada duas vezes: primeiro com os três tipos do bootstrap de
Gitflow, e de novo com `parallelize`/`raise_max_parallel`, que entraram na FASE
14d. O compilador não pega: a lista canônica está em `apps/api`, que o web não
importa. Por isso duas coisas ao mesmo tempo — o card **degrada** (verbo neutro
+ "ver detalhes", com o payload colapsado, em vez do `undefined` no mapa de
ícones que derrubava a árvore inteira do React), e o **teste lê o `decide.ts`
do backend** e reprova quando um tipo entra sem frase.

**O default de aberto/fechado é derivado, não configurado.** A regra é uma só —
abre o que ainda espera decisão de quem está olhando: no chat, ação `pending`;
na fila, nunca (são N cards, e N detalhes abertos são a mesma parede de texto);
em Insights, hipótese `proposed`. E o payload CRU não abre em variante nenhuma.
A consequência de projeto é que `ApprovalCard` **não ganhou prop nova
obrigatória**: o default sai de `variant` e `status`, que já existiam.

**Verbo e frase saem de um módulo só**, consumido pelas três telas. A hipótese
do Psicólogo usa literalmente o verbo do `instruction_patch` em vez de um
vocabulário paralelo — e a frase dela diz o que o accept faz de verdade
(enfileira para a Anamnese, que **pode** propor o ajuste, que ainda vem para
aprovação), nunca "a instrução será alterada".

**`write_file` tinha frase, mas não corpo.** Ele nasceu de fora de
`COM_CORPO_PROPRIO`: a frase mostrava só o `path`, e o detalhe caía no mesmo
despejo de JSON cru colapsado que esta RN existe para evitar — então um write
que genuinamente pedia aprovação (fora do prefixo `dev-`, ou caminho fora do
escopo do agente) exigia um clique a mais para ver o `content`. Entrou em
`COM_CORPO_PROPRIO` com corpo próprio: `path` e um preview do `content` (até
25 linhas/4.000 caracteres, com aviso de truncamento — nunca o arquivo
inteiro, mesma regra do payload cru), aberto por padrão no chat enquanto
pendente, igual `terminal`.

**Payload vazio não é payload ausente.** `command` (terminal) ou
`path`/`content` (write_file) chegando como string vazia — tool-call
malformada do modelo, não bug de renderização — degradava para um prompt
`$ ` ou um preview em branco, que o usuário lia como defeito da tela. Os dois
corpos agora distinguem os dois casos e mostram "o modelo não produziu um
X válido para esta ação" em vez de um branco.

- **Onde:** `apps/web/src/lib/aprovacoes.ts` (`VERBO_DA_ACAO`, `fraseDaAcao`,
  `descreverAcao`, `descreverHipotese`), consumido por
  `apps/web/src/components/ApprovalCard.tsx` (Aprovações + chat da sessão,
  `COM_CORPO_PROPRIO`, `previewConteudo` para o `content` de `write_file`) e
  `apps/web/src/components/HypothesisCard.tsx` (Insights); colapso pelo
  `Disclosure` de `apps/web/src/components/ui/Disclosure.tsx`
- **Teste:** `apps/web/src/lib/aprovacoes.test.ts` (lê `ACTION_TYPES` de
  `apps/api/src/domain/actions/decide.ts` e exige verbo + frase para cada tipo,
  com payload vazio); `apps/web/src/components/ApprovalCard.test.tsx`
  (`frase e colapso` — payload colapsado nas duas variantes, JSON legível ao
  abrir, tipo desconhecido não derruba a tela, `write_file` com corpo próprio
  aberto por padrão e truncamento do preview, `command`/`path`/`content`
  vazios mostrando a mensagem de fallback);
  `apps/web/src/components/HypothesisCard.test.tsx` (`frase e colapso`)
- **Origem:** FASE 19 do programa 16–26, do pedido "hoje está muito difícil a
  leitura" na primeira navegação real depois do reset do banco

---

## "N agentes online" no dashboard — status AO VIVO, nunca presença histórica (RN-409, ADR 0097)

Item do backlog anterior. Investigação prévia (`docs/explanation/backlog.md`)
confirmou que não existia agregado de liveness nenhum — nem por projeto, nem
por workspace: o que existia era só presença HISTÓRICA
(`RosterFacts` — "já apareceu na sessão alguma vez") e status ao vivo de
VERDADE só no cliente, derivado do event log, e só quando um projeto está
ABERTO (`deriveAgentRoster`). O card do dashboard hoje forçava
`() => 'ocioso'` porque não desenhava status nenhum — este é o hardcode que
a RN substitui.

<a id="rn-409"></a>

### RN-409 — "N online" soma dois mecanismos pela MESMA régua: não ocioso, não travado {#rn-409}

`ProjectCardSummary.onlineAgentCount` (`GET /workspaces/:workspaceId/
projects-summary`) é a contagem de agentes ONLINE agora — trabalhando ou com
uma pendência esperando decisão —, nunca tamanho de equipe. Chamar de
"online" um número que na verdade é "já apareceu alguma vez" seria enganoso
(mesmo princípio dos [ADR 0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/
[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)/
[0077](../../adr/0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) contra dado
fingido).

Duas FONTES, uma régua:

- **Dev agents** — `engine.dev_agent_states.status`, agregado em lote por
  `project_id` (`status NOT IN ('idle', 'idle_tripped')`). `working`,
  `awaiting_gate` e `awaiting_approval` contam (RN-047/ADR 0052 — os cinco
  estados da máquina do dev); `idle`/`idle_tripped` não. `dev-<modulo>` e
  `dev-<modulo>-2` são chaves DISTINTAS (`agent_id` na tabela), então contam
  separado sem esforço nenhum — é a própria chave primária que já separa.
- **Agentes conversacionais** (criativo/po/arquiteto/dev-lead/ux-designer/
  staff/infra) — último evento `agent.status` de cada `actor_id`, na sessão
  MAIS RECENTE do projeto (mesmo escopo de sessão que o resto de `RosterFacts`
  usa, RN-090). `agent.status` só tem três valores possíveis
  (`Engine.Sessions.LiveBroadcast.agent_status/4` recusa qualquer outro):
  `working`/`awaiting_approval` contam, `idle` não.

**QA/SecOps NUNCA contam** — não é filtro, é AUSÊNCIA de dado: nenhum dos
dois emite `agent.status` (rodam veredito único por invocação, sem noção de
"ocioso" entre chamadas — o status deles vem de `pr.gate_changed`/
`infra.gate_changed`, um mecanismo à parte que `deriveAgentRoster` já trata
separado). Não precisou de exclusão explícita: a consulta só soma o que tem
o tipo de evento certo.

A régua é a MESMA que `deriveAgentRoster` já aplicaria se o projeto estivesse
aberto (`'trabalhando'`/`'aguardando'` no cliente ≅ `working`/
`awaiting_gate`/`awaiting_approval` no backend) — os DOIS caminhos calculam
"online" a partir do mesmo eventual estado (event log/tabela de estado
persistida), só que por MECANISMOS diferentes (agregação SQL no backend,
dobra sobre eventos já buscados no cliente), no mesmo espírito de
`infraActive`/`uxDesignerActive`/`staffActive` (RN-090/RN-287: duas fontes,
uma régua). Não há função compartilhada entre `apps/api` e `apps/web` para
isto — os dois já divergem de linguagem/runtime para o resto de `RosterFacts`
também, e introduzir um pacote compartilhado só para uma contagem seria
peso maior que o problema.

**Consulta nova contra schema que a api não migra.** `engine.dev_agent_states`
é tabela do ENGINE (Ecto, schema Postgres `"engine"`), mesmo banco físico,
mesma conexão — não uma segunda fonte de dados, um segundo NAMESPACE no
mesmo Postgres. O precedente já existia: `apps/api/scripts/medir-execucao.ts`
já lê `engine.oban_peers` pelo mesmo caminho (raw SQL via Drizzle), só que
como SCRIPT manual, nunca testado. Esta RN eleva o padrão para código de
PRODUÇÃO testado — ver o [ADR 0097](../../adr/0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md)
para a decisão de NÃO expor isto como rota HTTP interna no engine.

**Custo medido, não fingido grátis.** As duas consultas novas levam o total
do read model de DOZE para CATORZE (RN-090 continua valendo — catorze é
CONSTANTE, provado por `projects-summary.repository.spec.ts` contando idas
ao banco com 2 e com 20 projetos). Nenhuma tem `WHERE` por tempo — a de
`agent.status` escaneia os mesmos `session_events` das sessões mais recentes
que `lastEvents`/`marcos` já escaneiam ao lado dela, então o custo marginal é
o de mais um filtro de `type` sobre um plano de consulta que já ia acontecer,
não uma tabela nova sendo varrida do zero. Lacuna DECLARADA: não há execução
real recente (dogfooding) com volume de produção para medir `ms` de verdade
contra a régua da Fase 22 (525 mil linhas, `EXPLAIN ANALYZE`) — as duas
consultas novas ficam sem número medido, só o argumento estrutural acima.

- **Onde:** `apps/api/src/application/ports/projects-summary-repository.port.ts`,
  `apps/api/src/infrastructure/persistence/drizzle/projects-summary.repository.ts`,
  `apps/api/src/interfaces/http/iam/dto/iam.response.dto.ts`,
  `apps/web/src/lib/api-types.ts`, `apps/web/src/components/ProjectCard.tsx`,
  `apps/web/src/routes/Dashboard.tsx`
- **Teste:** `apps/api/test/infrastructure/persistence/drizzle/projects-summary.repository.spec.ts`
  (`describe('onlineAgentCount (RN-409)')` — dev agent working/idle/
  idle_tripped, awaiting_gate/awaiting_approval, duas instâncias do mesmo
  agente-base, agente conversacional working/idle/awaiting_approval, só o
  ÚLTIMO `agent.status` conta, QA/SecOps nunca contam, soma entre as duas
  fontes, isolamento entre projetos);
  `apps/api/test/support/global-setup.ts` (`ensureEngineFixture` — a tabela
  do engine criada como fixture MÍNIMA e declarada, só para o teste acima
  poder existir);
  `apps/web/src/components/ProjectCard.test.tsx` (badge "N online" some com
  `0`/`undefined`, aparece com `onlineAgentCount > 0`)
- **Origem:** `docs/explanation/backlog.md` (item herdado da FASE 13c/
  colheita do dogfooding); decisão de produto de que o número tinha de ser
  liveness de verdade, não presença histórica, registrada no prompt que
  encomendou esta correção

---

## O explorador de pasta do Runner vira três colunas, e a criação de um projeto `runner` deixa de esperar o passo final (RN-436/436)

<a id="rn-451"></a>

### RN-451 — Smoke do binário standalone roda o SUBPROCESSO real, nunca mock {#rn-451}

O mesmo padrão de disciplina que `smoke-dist.mjs` (ADR 0106) já aplica ao
`dist/index.cjs` publicado no npm passa a valer também para
`dist-bin/brabo-runner-<platform>-<arch>[.exe]` (ADR 0112): nenhuma suíte
prova que um artefato EMPACOTADO funciona lendo o código-fonte dele — só
executando o artefato de verdade, como subprocesso, e observando saída
real. `scripts/smoke-bin.mjs` roda o binário COMPILADO (nunca
`node src/index.ts` nem qualquer forma não-compilada) com `--self-test-pty`
— uma flag interna, não documentada em `uso()` — que resolve `node-pty`
exatamente como produção e spawna um PTY real via `GerenciadorDePty`,
escrevendo e lendo dele. Só a linha `node-pty carregado com sucesso` +
`SELF_TEST_PTY_OK:` no stdout do processo real conta como prova; nenhum
mock de `node-pty` nem de `child_process` é aceitável para este teste
específico, porque o que ele existe para provar é justamente que o `.node`
nativo embutido (`with { type: 'file' }`, `native-pty-embed.generated.ts`)
carrega e funciona DENTRO do binário — mockar qualquer peça do caminho
apagaria a única coisa que o teste precisa provar.

- **Onde:** `apps/runner/scripts/smoke-bin.mjs`; `apps/runner/src/index.ts`
  (`rodarAutoTestePty`, a implementação de `--self-test-pty`)
- **Teste:** o próprio `smoke-bin.mjs` — não há teste unitário que o
  substitua, de propósito (é o mesmo desenho de `smoke-dist.mjs`, que
  também não tem par unitário)
- **ADR:** [0112](../../adr/0112-binario-standalone-do-runner-via-bun-build-compile.md)
- **Origem:** requisito explícito do dono do produto para este item de
  backlog ("no mocking")

---

## Terminal do runner local preso em "Abrindo terminal..." para sempre (RN-433)

<a id="rn-453"></a>

### RN-453 — `--dir` relativo do runner local resolve contra `INIT_CWD`, não contra o cwd rebaseado do pnpm {#rn-453}

`resolve(dirBruto)` em `lerArgumentos()` resolvia `--dir` relativo contra
`process.cwd()` — correto quando o CLI roda direto (binário standalone,
`npm install -g @brabo/runner`), mas ERRADO no único caminho de invocação
que existe hoje sem publicação real no npm (achado real, ADR 0106/backlog):
`pnpm --filter runner start` REBASEIA `process.cwd()` para a pasta do
PACOTE (`apps/runner`), não a pasta de onde o usuário digitou o comando.
`pnpm --filter runner start -- --dir ../exp001`, rodado de `~/dev/brabo`,
criava `~/dev/brabo/apps/exp001` em vez de `~/dev/exp001` — silenciosamente,
sem erro, porque RN-435 já faz `--dir` inexistente ser criado em vez de
recusado.

`resolverDir()` (`apps/runner/src/guard.ts`) resolve contra `INIT_CWD`
quando presente — a variável que npm/pnpm SEMPRE define com a pasta
original de invocação, existente só quando o processo nasce de um script
do `package.json` — e cai em `process.cwd()` quando ausente (binário
direto, onde já é a pasta certa). `resolve()` do Node já ignora a base
quando `dirBruto` é absoluto, então caminho absoluto (o caso documentado no
README) não muda de comportamento.

- **Onde:** `apps/runner/src/guard.ts` (`resolverDir`), `apps/runner/src/index.ts` (`lerArgumentos`)
- **Teste:** `apps/runner/src/guard.spec.ts` (`describe('resolverDir', …)`
  — relativo contra `INIT_CWD` quando presente, cai no cwd do processo
  quando ausente, absoluto ignora as duas bases)
- **ADR:** [0104](../../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)
  (extensão aditiva, mesma categoria de RN-435 — reduz atrito de invocação,
  não muda o runner como fonte da verdade do caminho)
- **Origem:** achado em uso real, rodando `pnpm --filter runner start --
  dir ../exp001` de dentro do checkout do monorepo — o único caminho de
  invocação disponível hoje, porque `@brabo/runner` ainda não foi publicado
  de verdade no npm (`NPM_TOKEN` pendente, ver backlog do ADR 0106)

---

## A busca do RAG deixa rastro, e o rastro congela os pesos (RN-479..481)

<a id="rn-481"></a>

### RN-481 — `rag.search`/`rag.feedback` são NARRAÇÃO da timeline, e só existem quando há sessão {#rn-481}

Os dois eventos entram no event log **apenas no caminho do agente** — a busca
da aba é de projeto e não tem sessão onde narrar. Isso é assimetria declarada,
não lacuna: **a tabela é a fonte da medição, o evento é narração**. Medir pelo
event log perderia metade das buscas, e justamente a metade com julgamento
humano.

Falha de narração não derruba nem a busca nem o voto: a linha da tabela já está
gravada, e é ela que a medição lê. A falha vira log com origem `infra`, nunca
silêncio.

`'rag'` entra em `PREFIXOS_DE_EVENTO` (`scripts/docs/generate.mjs`) no mesmo
commit — sem isso o inventário gerado de `docs/reference/events.md` não enxerga
os dois tipos, e `pnpm docs:check` ficaria verde sobre uma lista incompleta:
uma doc que passa mentindo é pior que uma doc que reprova.

- **Onde:** `apps/api/src/domain/rag/rag-telemetry.ts`
  (`EVENTO_RAG_SEARCH`/`EVENTO_RAG_FEEDBACK`),
  `apps/api/src/application/use-cases/rag/hybrid-search.use-case.ts`,
  `apps/api/src/application/use-cases/rag/record-rag-feedback.use-case.ts`,
  `scripts/docs/generate.mjs` (`PREFIXOS_DE_EVENTO`)
- **Teste:**
  `apps/api/test/application/use-cases/rag/hybrid-search.use-case.spec.ts`
  (narra com sessão; NÃO narra sem sessão),
  `apps/api/test/application/use-cases/rag/record-rag-feedback.use-case.spec.ts`
  (o mesmo par, para o voto)
- **ADR:** [0129](../../adr/0129-telemetria-de-busca-do-rag-como-tabela.md)
- **Origem:** plano do dono do produto, Parte 2 / Etapa 1

<a id="rn-485"></a>

### RN-485 — O broker de container não aceita especificação: ele recebe um projeto e COMPÕE {#rn-485}

O broker (`apps/broker`) é o único processo do produto com acesso a um daemon
Docker no servidor. A regra que o torna não-arbitrário não é um allowlist: é a
**forma da entrada**.

**Ele recebe `projectId` e uma das cinco operações — nada mais.** As cinco são as
da `DockerPort` do [ADR 0128](../../adr/0128-porta-de-docker-e-a-prova-de-empacotamento.md)
(`start`, `stop`, `remove`, `inspect`, `exec`), e uma sexta é decisão de produto
com ADR, nunca um parâmetro a mais. `start`, `stop` e `remove` têm corpo VAZIO;
`exec` leva comando e `cwd`, e mais nada.

**A especificação é lida da api e COMPOSTA aqui.** O broker chama
`GET /internal/projects/:projectId/container-spec`, que devolve identidade do
projeto, modo de execução e a decisão de imagem vigente do Arquiteto. Imagem,
rede, recursos e o único mount saem daí. Não existe campo em que se escreva
`privileged`, `cap_add`, `network: host` ou um `-v` livre — porque não existe
campo. Se a especificação viajasse no corpo, a contenção de um processo
root-equivalente no host dependeria de o CHAMADOR estar correto, e contenção que
depende do chamador não é contenção.

**Ele revalida o que a api devolveu, e as duas validações não são a mesma.**
`validarDecisaoDeImagem` (api) pergunta "esta decisão de arquitetura é
revisável?" — exige `rationale`, recusa `latest`, aplica `RECURSOS_MAXIMOS` e
devolve a recusa ao MODELO pelo tool-result (RN-061). `especificacaoValidada`
(broker) pergunta "posso entregar isto ao daemon?" — é o PARSE de um JSON não
confiável para dentro do tipo fechado. Os tetos daqui são os do BROKER, o último
recurso que ele nunca ultrapassa venha o pedido de onde vier; hoje os números
coincidem com os da api de propósito, e se um dia divergirem o menor vence sem
nada quebrar, porque nenhum dos dois afirma ser o outro. Uma checagem existe só
deste lado: referência de imagem que começa com `-` seria lida pelo CLI como
FLAG, e `execFile` sem shell resolve injeção de COMANDO, não de ARGUMENTO.

**A api não manda CAMINHO nenhum.** O `-v` de um `docker run` é resolvido pelo
DAEMON, contra o filesystem do HOST — um caminho de dentro do container da api
faria o daemon criar e montar uma pasta VAZIA, com o dev agent trabalhando num
diretório sem código e nada indicando por quê. O broker compõe o caminho com
`PROJECT_WORKSPACES_HOST_ROOT`, configuração DELE, mais o `workspaceDirName`
congelado na criação (RN-109). Sem essa variável, `start` RECUSA nomeando-a; as
outras quatro operações continuam funcionando. Recusar é a regra: adivinhar
produziria o mount vazio em silêncio.

**Projeto `mounted`/`runner` é recusado com 409**, porque a pasta deles mora na
máquina do usuário e o host do broker não a enxerga — lá quem sobe container é o
runner. É a mesma política que `RegistrarTransicaoDeContainerUseCase` já aplica
na api, dita onde o broker consegue dizê-la.

**Nada dispara subida.** Não há laço, não há fila, não há `proposed_action` de
`container_start`: o broker age quando chamado, e o único chamador que existe
hoje faz LEITURA. Efeito externo continua exigindo aprovação.

- **Onde:** `apps/broker/src/operacoes.ts` (as cinco, e a composição em
  `especificacaoDoProjeto`), `apps/broker/src/servidor.ts` (a lista fechada de
  rotas e a tabela de status),
  `packages/docker-port/src/spec-de-container.ts` (o parse e os tetos),
  `apps/api/src/application/use-cases/containers/obter-spec-de-container.use-case.ts`
  (o que a api devolve, e o caminho que ela não devolve),
  `apps/api/src/interfaces/http/internal/internal-containers.controller.ts`
- **Teste:** `apps/broker/src/servidor.spec.ts` (imagem, rede, recursos e mount
  mandados no corpo são IGNORADOS; artefato com imagem que começa com `-` é 422
  e nada é tocado; uma sexta operação é 404; `cwd` fora de `/work` é recusado,
  inclusive `/workspace`; sem `PROJECT_WORKSPACES_HOST_ROOT` o `start` recusa
  dizendo qual variável falta),
  `packages/docker-port/src/spec-de-container.spec.ts` (o parse campo a campo),
  `apps/api/test/application/use-cases/containers/spec-e-observacao-de-container.use-case.spec.ts`
  (a api não devolve caminho nenhum, nem `rationale`),
  `apps/api/test/infrastructure/http-clients/container-broker.client.spec.ts`
  (`start` manda corpo vazio)
- **ADR:** [0130](../../adr/0130-broker-de-container.md)

<a id="rn-497"></a>

### RN-497 — O `brabo-runner` sobe o container do projeto NA MÁQUINA DO USUÁRIO, com o Docker DELE {#rn-497}

Fecha a metade que a RN-494 (ADR 0135) deixou declarada: `mounted`/`runner`
passaram a EXIGIR imagem decidida (o portão da RN-105 vale nos três modos),
mas continuavam sem subir container NENHUM — só `execution_mode: container`
tinha alguém (o broker, `apps/broker`) capaz de chamar Docker de verdade.
`container_start`/`container_stop`/`container_remove` (RN-491/495) agora têm
um SEGUNDO caminho de execução, ramificado pelo `executionMode` do projeto
dentro de `ExecuteContainerStartUseCase`/`ExecuteContainerStopUseCase`/
`ExecuteContainerRemoveUseCase` — nunca na PROPOSTA nem na APROVAÇÃO da
ação, que continuam agnósticas de modo (`decide.ts` não muda).

**`container` segue pelo broker, sem mudança nenhuma.** `mounted`/`runner`
pedem ao ENGINE (`ApiToEngineClient.startContainerViaRunner`/
`stopContainerViaRunner`/`removeContainerViaRunner`, síncrono como
`executeTerminalAction`) para repassar ao RUNNER conectado — o CLI que já
mantém o canal `terminal:<projectId>` (ADR 0103/0104) ganha TRÊS pares de
evento novos, `container_start`/`_result`, `container_stop`/`_result`,
`container_remove`/`_result` (`apps/runner/src/channel.ts`), no MESMO molde
de `exec`/`exec_result`: `Engine.Runners.RunnerRouter` despacha pro canal
correlacionado por `ref` e fica bloqueado em `receive`, o runner chama
`DockerViaCli.start/stop/remove` (`@brabo/docker-port`, ADR 0128) com o
DOCKER DO USUÁRIO — não o do servidor — e responde. `EngineWeb.
ContainerCommandController` (rotas `POST internal/projects/:projectId/
containers/{start,stop,remove}`) é o único chamador; nenhum outro caminho
alcança essas três operações do lado engine.

**A imagem que sobe não é ELEITA de novo** — ao contrário do caminho
`container`, que reusa `DecidirImagemDoProjetoUseCase` para gravar uma nova
versão de `artifact.project_image`. O caminho `mounted`/`runner` só LÊ a
decisão VIGENTE (`ObterSpecDeContainerUseCase`, o MESMO caso de uso que já
compõe `GET .../container-spec` para o broker — chamado direto, sem HTTP,
porque os dois rodam no processo da api) e a manda ao runner; sem imagem
decidida (RN-105), falha ANTES de perguntar ao engine.

**"Sem runner conectado" é FALHA NORMAL, nunca exceção genérica** — mesma
disciplina de `BrokerIndisponivelError`/`BrokerRecusouError` do caminho
`container`. `RunnerNaoConectadoError` (sem runner, ou timeout) e
`RunnerRecusouContainerError` (o runner respondeu e RECUSOU — Docker
indisponível na máquina do usuário, especificação inválida) são as duas
classes que `HttpApiToEngineClient` lança; os três casos de uso as capturam
e gravam `failed` com o motivo, nunca deixam propagar. Do lado engine, a
resposta é SEMPRE 200 — `sucesso: false` no corpo, com `motivoCodigo`
("not_connected"/"timeout") só quando o engine NEM CHEGOU a perguntar ao
runner (`RunnerRouter` devolveu `{:error, _}`), nunca um status HTTP de erro
para o que é falha normal do comando.

**`Engine.Actions.TerminalExecutor` NÃO ganhou saída nova.** A decisão
"rodar o comando no host ou dentro do container que este runner subiu" é
INTERNA ao runner — `decisao_de_execucao/1` já roteia INCONDICIONALMENTE
todo comando de projeto `runner` conectado para `RunnerRouter.exec/4`
(RN-423). O que muda é só `apps/runner/src/index.ts`: `EstadoDoRunner` ganha
`containerAtivo` (o NOME do container que ESTE runner subiu, ou `null`), e
`tratarExec` passa a rotear pra `DockerViaCli.exec` (via `docker exec`)
quando há container ativo, ou pro caminho de sempre (`executarComando`
direto no host) quando não há — o `cwd`, já validado por
`validarCwdDentroDaRaiz` contra a raiz do projeto, é traduzido pra dentro de
`/work` por troca de PREFIXO (`cwdParaContainer`, `guard.ts`), mesmo
raciocínio de `cwd_para_container/2` do lado engine (RN-492).

**`guard.ts` (contenção em `$HOME` no Linux, RN-434) passa a cobrir também o
caminho montado, sem NENHUMA validação nova.** O bind-mount do container É
`estado.dir` — a mesma raiz que `validarDirDentroDoHomeNoLinux` já validou
no startup da CLI, antes de qualquer container subir. Não existe uma
segunda checagem de "caminho de mount válido" porque não precisa existir: o
mount É a raiz confirmada, ponto.

- **Onde:** `apps/runner/src/channel.ts`, `apps/runner/src/index.ts`
  (`EstadoDoRunner.containerAtivo`, `tratarContainerStart/Stop/Remove`,
  `tratarExec`), `apps/runner/src/guard.ts` (`cwdParaContainer`),
  `apps/engine/lib/engine/runners/runner_router.ex`
  (`start_container/stop_container/remove_container`),
  `apps/engine/lib/engine_web/channels/terminal_channel.ex`,
  `apps/engine/lib/engine_web/controllers/container_command_controller.ex`,
  `apps/engine/lib/engine_web/router.ex`,
  `apps/api/src/application/ports/api-to-engine-client.port.ts`
  (`RunnerNaoConectadoError`, `RunnerRecusouContainerError`),
  `apps/api/src/infrastructure/http-clients/api-to-engine-client.ts`,
  `apps/api/src/application/use-cases/actions/execute-container-start.use-case.ts`,
  `apps/api/src/application/use-cases/actions/execute-container-stop.use-case.ts`,
  `apps/api/src/application/use-cases/actions/execute-container-remove.use-case.ts`
- **Teste:**
  `apps/runner/src/channel.spec.ts` (roundtrip dos três pares novos),
  `apps/runner/src/index-handlers.spec.ts` (`tratarExec` roteia host vs.
  container; `tratarContainerStart/Stop/Remove` nunca lançam),
  `apps/runner/src/guard.spec.ts` (`cwdParaContainer`),
  `apps/engine/test/engine/runners/runner_router_test.exs`,
  `apps/engine/test/engine_web/channels/terminal_channel_test.exs`,
  `apps/api/test/infrastructure/http-clients/api-to-engine-client.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-start.use-case.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-stop.use-case.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-remove.use-case.spec.ts`
  (os três com describe "mounted/runner (ADR 0137)")
- **Decisão arquitetural:** [ADR 0137](../../adr/0137-o-runner-sobe-o-container-do-projeto.md)
- **Origem:** plano do dono do produto, Parte 1 / PR 1.3

## FASE 29 — a instalação de uma linha: assinar o que se publica

<a id="rn-525"></a>

### RN-525 — O proxy do binário confere o hash contra o manifesto da mesma release, recusa quando não pode conferir, e DIZ que isso é integridade e não procedência {#rn-525}

`GET /runner-releases/binary` é `@Public()`, sem autenticação, e é o passo 4 do
fluxo de configuração pelo navegador ([RN-473](../web.md#rn-473),
[ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md)). Até a
sessão 3 da FASE 29 ele validava a ENTRADA (`platform` contra uma allowlist
fechada) e transmitia os bytes do GitHub direto para o cliente, **sem verificar
nada** — é o consumidor que o [ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md)
nomeia e a [RN-524](../ci.md#rn-524) deixou pendente.

Agora ele **confere o sha256 dos bytes contra o `checksums.txt` da MESMA
release** antes de responder qualquer coisa, e o header `Content-Digest`
(RFC 9530) repete o hash conferido, para quem receber poder refazer a conta.

**O que esta verificação NÃO faz, e está escrito onde ela é feita.** Ela **não
verifica a assinatura** do manifesto (`checksums.txt.bundle`). Isto é
**integridade contra o manifesto, não procedência**: quem consiga reescrever a
Release reescreve os dois arquivos e passa. As duas formas de fechar isso foram
MEDIDAS nesta sessão, e as duas foram recusadas:

| caminho | medido | por que não |
|---|---|---|
| `cosign` na imagem da api | **155 MB** (`cosign-linux-amd64` v2.6.1) | quase dobra a imagem de runtime (Alpine + Node), publicada por digest no GHCR ([ADR 0119](../../adr/0119-imagens-publicadas-no-ghcr-por-digest.md)), para verificar um download opcional |
| `@sigstore/verify` + `@sigstore/tuf` | **2,5 MB, 12 pacotes** | o tamanho não é o custo. `getTrustedRoot()` refresca metadados TUF contra `tuf-repo-cdn.sigstore.dev` (o `seeds.json` do pacote só semeia o `root.json`), então uma rota pública que hoje depende de UM host de terceiro passaria a depender de dois. E, pela régua dos ADRs [0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) — capability só é declarada quando **provada** —, não há como provar o caminho hoje: **nenhuma Release tem `checksums.txt.bundle`**, porque o job `checksums` nasceu na sessão 2 e só roda numa tag final, lacuna que a própria [RN-524](../ci.md#rn-524) já declara do lado de quem assina |

Quem verifica a ASSINATURA é o `install.sh` (sessão 4/7), que tem `cosign` de
verdade e o baixa pinado com `sha256sum -c` (decisão 4 do ADR 0149). **BRB-005
segue aberto para a metade de procedência desta rota**, e
[o registro](../../reference/brb.md) diz isso — não é rodapé, é o limite do que a rota
prova.

**Release sem `checksums.txt` é RECUSA, nunca "sirvo avisando".** Um aviso que
se aceita clicando é uma verificação que não existe (ADR 0149, decisão 3) — e
seria o downgrade mais barato possível: apagar 400 bytes da Release desligaria a
conferência de todo mundo. O custo está medido e é pequeno: na v5.0.0 há dois
binários (`linux-x64`, `linux-arm64`) e nenhum manifesto, e o passo do binário é
**best-effort** no fluxo do navegador ([RN-473](../web.md#rn-473), passo 4) — ele fica sem o agente local e diz isso (o npm saiu na AT-774). Toda release
anterior à primeira tag depois do ADR 0149 cai nesse caminho, por construção.

**Os seis desfechos de 502 não colapsam.** O status sozinho não os separa e
eles pedem ações diferentes de quem chamou, então a recusa carrega um `motivo`
no corpo — `plataforma_nao_publicada`, `release_sem_manifesto`,
`manifesto_nao_cobre_a_plataforma`, `manifesto_ilegivel`, `download_falhou`,
`hash_divergente`. É a régua da [RN-470](../web.md#rn-470) numa resposta de api: "essa
plataforma não saiu ainda" manda esperar a próxima release, "release sem
manifesto" manda usar o npm, e "hash divergente" é incidente. Em especial,
"manifesto não listado na release" e "manifesto listado que falhou ao baixar"
são desfechos DIFERENTES — confundi-los mandaria a pessoa instalar pelo npm por
causa de uma falha de rede momentânea.

**Conferir hash exige ler todos os bytes, e isso passa pelo disco.** Bufferizar
os ~79 MB do binário em memória seria exaustão trivial numa rota pública (o pod
da api tem `limits.memory: 512Mi`), e cachear os bytes seria pior — cinco
plataformas × 79 MB. Os bytes descem em **stream** para um arquivo temporário em
`/tmp` (um `emptyDir` montado justamente porque o rootfs da api é read-only), com
o hash calculado no caminho, e o arquivo é relido em stream para o cliente **só
depois** de o hash bater: memória constante, e nenhum byte não conferido chega
ao cliente. Um teto de 256 MiB aborta resposta absurda antes de encher o `/tmp`.
O cache existente (URLs, 5 min) **fica**, e passa a guardar também o manifesto
já parseado — centenas de bytes de TEXTO, nunca bytes de binário —, na MESMA
entrada e nunca num cache próprio: em janelas diferentes, uma release publicada
no meio faria o hash novo ser conferido contra o binário velho, e o desfecho
seria um `hash_divergente` que pareceria adulteração.

- **Onde:** `apps/api/src/interfaces/http/runner/runner-releases.controller.ts`
  (a verificação, o teto de bytes, o arquivo temporário e o `Content-Digest`),
  `apps/api/src/interfaces/http/runner/checksums.ts` (a leitura pura do
  manifesto e a união de `MotivoDaRecusa`),
  `apps/web/src/lib/runner-bootstrap.ts` (`baixarBinario` passa a ler `message`
  e `motivo` do corpo, e a frase chega em `falhaDoBinario`)
- **Teste:** `apps/api/test/interfaces/runner-releases.controller.spec.ts`
  (caminho feliz com `Content-Digest`; hash divergente sem NENHUM byte nem
  header no corpo; release sem manifesto recusando antes de baixar o binário;
  manifesto que não cobre a plataforma; manifesto ilegível; download falhado; e
  o cache guardando release e manifesto juntos) e o `describe('parsearChecksums')`
  do mesmo arquivo; `apps/web/src/lib/runner-bootstrap.test.ts` (a frase da api
  e o `motivo` chegando ao chamador, e corpo não-JSON não virando segunda
  exceção)
- **Origem:** FASE 29, sessão 3. [ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md),
  o terceiro consumidor da tabela da decisão 3 — pela METADE que a api pode
  provar hoje, com a outra metade nomeada em vez de fingida
| `BACKUP_DIR` aponta para um diretório que existe e NÃO aceita escrita | o backup recusa ANTES do `pg_dump`, dizendo que é ESCRITA — um destino read-only passaria num teste de existência e falharia depois, com o diagnóstico apontando para o lugar errado (RN-528) |
| `git gc` concorrente apaga um packfile no meio do `tar` dos bare repos | a execução vira **`failed`** em `backup_runs`, com o status do `tar` nomeado — nunca um arquivo parcial que se anuncia como bom, porque só a falha vira alerta (RN-528) |
| Volume `git_local_repos` não montado no container de backup (o CronJob do k8s) | o passo é **PULADO e dito no log** — e "não montado" nunca é colapsado com "montado e vazio", que é estado normal de instalação sem projeto `local` (RN-528) |
| Há bare repos no volume e NENHUM arquivo no prefixo `git-daily/` | `brabo-restore-git` **reprova** dizendo que este volume está sem cobertura — ausente-e-vazio é outro desfecho, e sai com sucesso (RN-528) |
| Arquivo dos bare repos truncado | reprova ao ser **LIDO** (`tar -tzf`), nunca pelo tamanho: um tar cortado tem bytes de sobra. É o `pg_restore --list` do lado do git (RN-528) |
| `brabo-restore-git --restaurar` num volume que já tem bare repos | recusado: sobrepor dois estados de repositório não levanta erro nenhum e só aparece num `fetch` com história errada. `RESTORE_GIT_FORCE=1` para quem quer mesmo (RN-528) |
| `brabo-restore-git --restaurar` sem poder escrever no volume (uid 70 × dono da api) | recusa **ANTES** do `tar`, nomeando `--user 0:0` — descobrir no meio da extração deixaria o volume pela metade. E o que é extraído como root volta para o dono do DIRETÓRIO (RN-528) |

<a id="rn-526"></a>

### RN-526 — O instalador verifica a própria origem, NOMEIA o que achou antes de perguntar, e nunca apaga pasta de usuário {#rn-526}

`install.sh` (raiz do repositório, versionado e publicado como asset da Release)
é a porta única de instalação. Quatro garantias, e cada uma existe contra um
defeito concreto:

**A invocação preserva o stdin e deixa um ARQUIVO.** A forma documentada é
`curl -fsSLO …/install.sh && bash install.sh` — baixar e rodar um arquivo com
`bash` —, e **nunca** `curl … | sh`: com o script chegando pelo pipe, o `stdin`
do processo É o download, e qualquer `read` lê bytes do próprio script ou
encontra EOF. Um instalador que não consegue perguntar escolheria sozinho onde
criar pastas no computador de alguém — o oposto da régua que a RN-511 já aplica
ao consentimento da base. Até a AT-083 a forma documentada era
`sh -c "$(curl -fsSL …)"`, e ela **nunca funcionou**: a verificação da própria
origem (o parágrafo seguinte) calcula o hash de `$0`, e em `X -c "…"` o `$0` é o
nome do shell, não um arquivo; com `dash` como `sh` o script morria antes, no
`set -o pipefail`. A decisão do mantenedor (18/09) foi mudar a DOC e manter a
verificação por `$0`, **sem** porta de pular (ADR 0150). As formas erradas
viraram **recusas nomeadas**, antes do primeiro download, que imprimem a forma
certa: rodar sob um shell que não é bash (bloco POSIX no topo, antes do
`set -o pipefail`) e rodar sem arquivo (`exigir_o_proprio_arquivo`, que exige o
`BASH_SOURCE` do nível de cima **e** um `$0` legível — `/bin/bash -c` deixa
`$0=/bin/bash`, que existe, e sem a primeira metade o hash dele iria ao
manifesto e a pessoa leria a frase de adulteração). A forma é UMA constante
(`COMO_RODAR`), usada pelas recusas e pelo relato sem TTY.

**Ele verifica a própria origem antes de agir**, e a cadeia tem dois elos: a
assinatura do `checksums.txt` da Release (RN-524), e o hash **deste arquivo**
dentro do manifesto verificado. O `cosign` que faz a verificação é ele mesmo
pinado por versão e conferido por hash contra o valor escrito no script — quem
confia no `install.sh` o bastante para executá-lo confia no hash que ele
carrega, e a cadeia não fica mais frágil que o elo que a inicia. Falha em
qualquer elo é **recusa nomeada, nunca aviso**.

**Calcular hash tem UMA função e DUAS ferramentas aceitas** — `sha256sum` ou
`shasum -a 256` —, resolvidas **antes do primeiro download** e nunca no meio de
uma verificação: a máquina que não tem com que conferir não deve chegar a ter o
que conferir. Faltar as duas é **recusa PRÓPRIA**, que nomeia as duas
ferramentas, diz onde cada uma mora e afirma que nada foi baixado — nunca a
recusa de hash divergente, que é a de **incidente** (*"pare e investigue"*). A
distinção não é estilo: o script chamava `sha256sum` direto nos cinco pontos de
verificação, o macOS não o traz, e o `command not found` chegava a quem
instalava como acusação de adulteração — bloqueando toda instalação na
plataforma que o próprio script suporta (há `cosign` `darwin-*` pinado nele) e
ensinando a ignorar a frase no dia em que ela for verdade. `--print-plan` roda
sem nenhuma das duas e declara qual o script aceita (`conferir-hash`). E há uma
TERCEIRA recusa, desde a AT-083: a ferramenta existe mas **não consegue ler o
arquivo**. Sem ela, `hash_sha256` devolvia vazio de dentro da substituição de
comando (o `errexit` não chega ao subshell) e a comparação seguinte falhava com
o texto de incidente do chamador — a acusação de adulteração da AT-091 por outro
caminho. Agora é `falha_ao_calcular_hash`, que nomeia o arquivo e diz que não
houve o que comparar.

**A detecção nomeia o que achou.** Pelo marcador
(`$XDG_STATE_HOME/brabo/install-state.json`) quando ele existe; por sinais
(projeto de compose `brabo*`, units `brabo-runner-*`, binário no PATH) quando
não — e a lista é impressa **antes** de qualquer pergunta. Não existe o caminho
"achei algo e decido sozinho". Sem TTY o script **relata e sai 0**, como
`consentir-base.mjs` já faz.

**Ele nunca apaga pasta de usuário.** A base de projetos e a pasta de espelho
estão fora do alcance de qualquer confirmação — a mesma régua do espelho
(RN-516): pasta de usuário é acúmulo, não estado do produto. Volume nomeado só
sai com confirmação, e listado um a um antes de perguntar.

O marcador mora no `$XDG_STATE_HOME` e **não** em `~/.brabo/`, que é onde o
runner guarda coisa por PROJETO: estado de instalação e configuração de projeto
são vidas diferentes, e juntá-los faria a remoção de um apagar o outro.

**Onde:** `install.sh` (raiz).
**Teste:** `scripts/dev/install.spec.ts` — os modos `--print-state` e
`--print-plan` provam a DECISÃO sem TTY, sem rede e sem efeito, no molde de
`bootstrap.spec.ts`; e o bloco *"o hash num PATH sem sha256sum"* roda as
funções de hash no shell de verdade, com o `PATH` montado ferramenta por
ferramenta, conferindo as DUAS recusas (ferramenta ausente × hash divergente)
e que a primeira nunca usa o vocabulário da segunda;
`scripts/dev/install-invocacao.spec.ts` roda o script pelas formas erradas
(`bash -c`, `/bin/bash -c`, pipe, `dash -c`, `dash install.sh`) e cobra a recusa
nomeada com a forma certa antes de qualquer download, a terceira recusa de hash,
e que runbook, bootstrap e cabeçalho ensinam a MESMA forma.
**Origem:** FASE 29, sessão 3 ([ADR 0150](../../adr/0150-instalador-de-uma-linha.md)).
Nesta sessão o script **não instala nada** — subir o compose, gerar segredos e
instalar o runner são as sessões 4 e 7, e ele **diz isso** na saída em vez de
terminar em silêncio.

<a id="rn-531"></a>

### RN-531 — O instalador consente UMA base para os dois lados e instala o agente local já executável {#rn-531}

**Uma base, consentida uma vez.** O `install.sh` pergunta onde os projetos vão
morar e grava o mesmo caminho nos DOIS lugares: `BRABO_PROJECTS_BASE` no `.env`
(o servidor, [ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md)) e o
campo `base` do `runner.json` (o agente local,
[RN-529](../runner.md#rn-529)). O que difere entre `mounted` e `runner` é **quem executa**,
não onde o código mora — duas bases diferentes para a mesma pasta seriam a
colisão de namespace que o ADR 0141 recusou por escrito.

A base é recusada quando não é absoluta, quando fica **dentro** do checkout do
Brabo e quando **contém** o checkout — os dois sentidos, como o `preflight.mjs`
já faz do lado do servidor. O `~` não é expandido de propósito: o valor vai
para um arquivo de configuração, e um `~` gravado ali é lido literalmente.

**O agente local é instalado já executável.** O binário é baixado, conferido
contra o **mesmo** `checksums.txt` assinado que o script já verificou para
conferir a si mesmo (RN-524) — baixá-lo duas vezes seriam duas chances de pegar
manifestos diferentes, e a segunda não seria verificada — e instalado com
`install -m 0755`, que põe o bit de execução no mesmo ato em que copia.

**Isso fecha o BRB-031.** O `chmod +x` manual sobreviveu à FASE 28 porque a
instalação como serviço não vinha de um artefato versionado: quem chegava a
rodar `brabo-runner service install` já precisara tornar o binário executável
para chegar ao comando. Vindo do instalador, o passo desaparece — a File System
Access API do navegador não preserva o bit, um script preserva.

Release sem o binário da plataforma **não interrompe a instalação**: o resto já
está de pé, e a mensagem aponta a issue no `brabo-runner` (o npm saiu na AT-774). É a mesma
disposição do passo do binário na configuração pelo navegador (RN-473), e a
razão é a mesma — o agente local é a última etapa, não um pré-requisito.

**Onde:** `install.sh`, `consentir_base` e `instalar_o_runner`.
**Teste:** `scripts/dev/install.spec.ts` — `install -m 0755` presente, a
instrução de `chmod` dirigida ao usuário ausente, e a conferência contra o
manifesto assinada nomeada.
**Origem:** FASE 29, sessão 7 ([ADR 0150](../../adr/0150-instalador-de-uma-linha.md),
[ADR 0151](../../adr/0151-base-consentida-no-runner.md)).

<a id="rn-534"></a>

### RN-534 — O instalador entra no manifesto assinado, e é exercitado numa máquina limpa {#rn-534}

Duas metades da mesma garantia.

**O `install.sh` entra no `checksums.txt` e na Release.** Sem isso a verificação
que ele faz de si mesmo (RN-526) seria letra morta: ele confere o próprio hash
contra o manifesto assinado, e o manifesto não o cobria. O arquivo vem do
**checkout da tag**, não de download — é o mesmo commit que produziu tudo o mais
que está sendo assinado no mesmo job.

**E ele é exercitado numa máquina limpa**, que é o que o runner efêmero do
Actions é: host recém-criado, sem Brabo, sem `.env`, sem marcador. O E2E prova,
nessa ordem: o **plano** não deixou de prometer o que nunca apaga; o **estado**
numa máquina limpa não inventa marcador nem sinais; **sem TTY** o instalador
relata, sai 0 e **não grava**; e, com um TTY de verdade (não um pipe — o pipe é
justamente o que mataria o consentimento), a instalação completa verifica
assinatura, confere o próprio hash, grava o marcador e deixa o `.env` em modo
**600**.

**Correção (AT-083):** o "TTY simulado por `script -qec`" que este parágrafo
afirmava **nunca foi TTY para o instalador**. O passo rodava
`script -qec "… ./install.sh … < respostas"`, com o `<` DENTRO do comando do
`script`: o stdin do instalador era o arquivo, `[ -t 0 ]` era sempre falso, e o
fluxo interativo nunca foi exercitado. Hoje quem roda o instalador é um driver
de PTY em Python (`python3 -I`, sem dependência nova), que o põe no lado
escravo do pty e ESPERA cada pergunta antes de responder — e, para as duas de
senha, espera o eco estar DESLIGADO, o que prova o "sem eco" da RN-547 e impede
a senha de aparecer na saída. O E2E também baixa e roda o instalador pela MESMA
forma que o runbook manda (`curl -fsSLO` + `bash install.sh`, RN-526), e
reprova de cara se o instalador disser "Sem terminal interativo". Como o
workflow segue sem rodar em PR, o driver é extraído dele e exercitado em
`scripts/dev/install-e2e.spec.ts` contra um instalador de mentira (terminal
visto, respostas em ordem, senha fora da saída, e as duas paradas nomeadas),
com a forma antiga fixada como a que NÃO dava terminal.

**Ele não roda em `pull_request`**, e o motivo é o mesmo da assinatura: o
manifesto assinado só existe depois de uma tag final. Fazer o script rodar em PR
exigiria dar-lhe uma porta para PULAR a verificação — a porta que o ADR 0150
recusa, e que uma vez aberta valeria para qualquer um, não só para o CI. É a
decisão que o golden-set do RAG já tinha tomado pelo mesmo raciocínio
([ADR 0138](../../adr/0138-golden-set-do-rag-em-ci-agendado.md)): o que não é
exercitável em PR roda em cadência própria, e o workflow **diz por quê** em vez
de fingir cobertura.

**Onde:** `.github/workflows/install-e2e.yml`;
`.github/workflows/build-runner-binaries.yml`, job `checksums`.
**Teste:** o próprio workflow — e `scripts/dev/install.spec.ts` continua
cobrindo a decisão sem rede; `scripts/dev/install-e2e.spec.ts` (bloco *"o TTY
do E2E é um TTY para o INSTALADOR"*) exercita o driver de PTY em PR.
**Origem:** FASE 29, sessão 10 ([ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md),
[ADR 0150](../../adr/0150-instalador-de-uma-linha.md)).

> **TODO(humano):** as RNs acima foram extraídas do código e dos testes. Falta
> confirmar se existe regra de negócio **não implementada** que deveria estar
> aqui — algo combinado e ainda não codificado não aparece nesta varredura.

---

## Os artefatos dos agentes viram arquivo, em `docs/` (RN-523)

<a id="rn-542"></a>

### RN-542 — O instalador compara a versão instalada com a que vai instalar, e a oferta é específica por relação {#rn-542}

O `install.sh` detectava instalação anterior desde a [RN-530](../infra.md#rn-530) e
oferecia migrar com backup provado. O que ele **não** sabia era **qual** versão
estava lá: o marcador (`$XDG_STATE_HOME/brabo/install-state.json`) gravava
`schemaVersion`, `instaladoEm`, plataforma, fonte, digests e caminhos — e nada
que dissesse 5.0.0. A pergunta *"migrar esta instalação?"* era cega nos dois
lados, e quem respondia não tinha como saber se aquilo subia, descia ou repetia.

A informação sempre esteve à mão e era ignorada: `images.json` da Release traz
`"versao"` ao lado de `commit` e `publicadoEm`, e `resolver_imagens_do_ghcr` lia
só `repositorio` e `digest`. Pela outra ponta, `--source=local` já exige árvore
**limpa e em tag** — então `git describe` é uma versão confiável ali, pelas duas
recusas que já aconteceram antes.

**A ordem é a decisão.** As imagens passam a ser resolvidas **antes** da
detecção: saber o que entra é pré-requisito de perguntar se o que existe sai.
O marcador sobe para `schemaVersion: 2` e grava `versao` e `commit` — os dois
juntos, porque um marcador novo sem o campo passaria por antigo.

Com as duas versões em mãos, a oferta deixa de ser uma pergunta e vira quatro,
uma por relação:

| relação | oferta | default |
|---|---|---|
| maior | `Atualizar 5.0.0 → 5.1.0?` | **sim** — é o que a pessoa veio fazer, e o backup provado torna reversível |
| igual | `Já é a 5.0.0. Reinstalar do zero mesmo assim?` | não — não há ganho a oferecer |
| menor | nomeia **rebaixamento**, avisando que migração de banco não anda para trás | não — pode não ter volta |
| nova-linha | `Atualizar 7.0.0 (linha anterior) → 1.0.0 (linha nova)?` — a [RN-998](parte-02.md#rn-998) | **sim** — o recomeço das versões em 1.0.0 não é rebaixamento |
| desconhecida | marcador de schema 1 não tem versão: diz isso, e **não adivinha** | não |

O ramo `maior` era o **único** com default sim, e é o único que pode tê-lo: o
passo é reversível pelo backup que acabou de ser provado. Desde a
[RN-998](parte-02.md#rn-998) a relação `nova-linha` divide esse default, pelo mesmo motivo
(é atualização, só com outra numeração). Os outros três exigem um `s` digitado.

**Em qualquer ramo a instalação é apagada e recriada do zero**, nunca subida por
cima — decisão do dono do produto, e a mesma razão da RN-530: um `up` sobre
volumes de outra versão é estrago que não avisa, e meia migração é pior que
nenhuma. A cadeia backup → **PROVAR** → perguntar → apagar → instalar →
restaurar não muda em nenhum deles.

`comparar_versoes` é implementada à mão e **não** com `sort -V`: o BSD `sort` do
macOS ganhou `-V` tarde, e este script roda na máquina dos outros — a mesma
disciplina que já fez `sha_do_cosign` recusar array associativo por causa do
bash 3.2. Ela ecoa o veredito em vez de devolver código de saída, porque sob
`set -e` um `return 1` legítimo mataria o script.

No menu do `pnpm bootstrap`, *Docker › Instalar (install.sh)* **relata** o plano
e não instala — mecânica, não preferência: item de menu roda com stdin em
`/dev/null` para o menu seguir lendo teclas do mesmo terminal, e este instalador
existe para PERGUNTAR (é o motivo de o [ADR 0150](../../adr/0150-instalador-de-uma-linha.md)
recusar `curl | sh`). É o mesmo desenho do item *Base de projetos*
([RN-511](../infra.md#rn-511)), e a nota do item carrega o comando que instala de verdade.

- **Código:** `install.sh` (`comparar_versoes`, `campo_do_marcador`,
  `resolver_imagens_do_ghcr`, `resolver_imagens_locais`, `main`);
  `scripts/dev/bootstrap.sh` (item `1.7`)
- **Teste:** `scripts/dev/install.spec.ts` — *"a comparação de versões"* e
  *"o marcador registra a versão"*; a função é extraída do script e rodada por
  `bash`, nunca reimplementada em TS (uma cópia continua passando depois que o
  shell quebra)
- **Achado rodando, não lendo:** `cut -d.` sobre uma string **sem ponto**
  devolve a linha inteira, não vazio — então `5.0.0` vs `5` respondia `menor`.
  Normalizado com `.0.0` no fim, com teste de regressão.
- **ADR:** [0150](../../adr/0150-instalador-de-uma-linha.md)
- **Origem:** pedido do dono do produto — *"o sh deve ser inteligente de
  entender que já há uma versão e verificar se será uma nova versão a ser
  executada ou não... caso seja uma nova ou escolhido isso pelo usuário deverá
  deletar a anterior e instalar do zero para evitar possíveis erros"*
