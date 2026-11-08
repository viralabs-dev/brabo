---
id: historico-de-fases-parte-1
title: "Histórico de fases, parte 1: fases 1 a 15"
sidebar_label: Fases 1 a 15, parte 1
description: "Das fases 1 a 12 ao pós-fase 15 (v2.5): o que cada fase entregou, cortou e achou."
keywords: [histórico, fases, ADR, RN]
tipo: historico
---

# Histórico de fases, parte 1: fases 1 a 15

:::historico 2026-08-08
Das fases 1 a 12, passando pela 13 (provar e triar), a 14 (o que a execução real exigiu) e a 15 (gates como dado), até o pós-fase 15 (v2.5.0 e v2.5.1).
Texto movido sem reescrita do [Histórico de fases](historico-de-fases.md). O que vale hoje mora nas RNs e nos ADRs.
:::

## Status
- FASE 1 (MVP) — CONCLUÍDA: IAM/RBAC, sessões com event log imutável,
  chat com roteador de LLM (Ollama + APIs), metering/budget de tokens,
  pipeline de proposed_actions + permissions.json, motor Elixir/OTP com
  supervisão e evento de término.
- FASE 2 — CONCLUÍDA: GitProvider (Local/GitHub/GitLab) com suite de
  contrato e capabilities, credenciais criptografadas, bootstrap de
  Gitflow idempotente e retomável via pipeline, wizard com progresso
  ao vivo.
- FASE 3 — CONCLUÍDA: Harness (PromptAssembler, ToolLoop,
  ContextManager, InstructionFiles, Hooks), handoffs explícitos,
  agentes Criativo, PO e Arquiteto com artefatos e validações no
  domínio.
- FASE 4 — CONCLUÍDA: agentes de execução (devs dinâmicos por módulo
  em worktrees isolados, QA e SecOps como gates de PR, Infra
  propositivo), trava de merge protegido, painel do time ao vivo;
  Psicólogo real e Anamnese com loop fechado. Gates validados por
  execução real (ADR 0020).
- FASE 5 — CONCLUÍDA: imagens de produção non-root e CI (ADR 0024),
  Kubernetes com Kustomize, HPA por fila do Oban, NetworkPolicies e
  ESO (ADR 0025), graceful shutdown + OpenTelemetry + dashboards
  (ADR 0026), backup com restore testado, runbooks e hardening
  (ADR 0027).
- FASE DOC — CONCLUÍDA: docs/ como fonte única com Diátaxis, site
  Docusaurus em website/ lendo de docs/, referências geradas,
  docs/.docmap.yml + drift check (docs:check) no CI, camada de
  comunidade, MIT verificado, mecanismo documentado em
  docs/explanation/documentation-workflow.md.
- FASE 6 — CONCLUÍDA: política de branches mecanizada (ADR 0030) —
  pr-police, approval-ladder com os dois modos, promote/tag-release
  com versão calculada e âncora por árvore, backmerge gate com
  retropropagação automática, rulesets versionados. Esteira exercitada
  de ponta a ponta (v0.1.0 → v0.2.0) e a cadeia de hotfix validada por
  execução real.
- FASE 7 — CONCLUÍDA: auth first-party substituindo o Keycloak —
  argon2id, access Ed25519, rotação de refresh com revogação de
  família, lockout progressivo, tokens de conta e MailSender log-only
  (ADR 0031, RN-030..033); corte atômico com emissor próprio, RBAC
  intocado, /internal/* com service token, cookie httpOnly + CSRF,
  migração de usuários e remoção total do Keycloak (ADR 0032,
  RN-034/035); OpenAPI nos 23 controllers com DTOs travados por tipo,
  teste de tabela exigindo metadados, docs/reference/api/ gerado com
  manifesto de hashes (ADR 0033).
- FASE 8 — CONCLUÍDA COM CORTE: hierarquia de agentes — áreas com lead
  único como contato externo, delegações internas privadas (tabela
  `delegations`, `area` como TEXT), veredito consolidado com
  rastreabilidade, falha com origem; QA como área (Lead + Automação +
  Performance/Segurança, contrato externo dos gates inalterado — suite
  da Fase 4 verde sem modificação); Infra como área com subagente
  Workflows gerando CI por provider; painel do time por área e
  Psicólogo/Anamnese mirando subagentes (ADR 0038).
  CORTE DE ESCOPO da época, REVOGADO pela FASE 14d:
  `agent_areas`/`agent_area_members` existem desde então, por projeto,
  com `max_parallel` configurável — foi a área de dev, a primeira
  DINÂMICA, que forçou. O que segue cortado é só o **budget por área**
  (tetos de orçamento reais continuam sendo projeto, sessão e task).
  A lista de `apps/web/src/lib/agents.ts` sobreviveu para cor, ícone e
  a REGRA de endereçamento; os membros de dev vêm da tabela.
- FASE 9 — CONCLUÍDA: suite de contrato de LLMProvider rodando
  contra os existentes, base OpenAICompatibleProvider sobre
  node:http com timeout de INATIVIDADE, erro normalizado por `code`,
  capabilities em duas camadas (ADR 0041); sync de catálogo com modelo
  descoberto entrando desativado, modelo sumido marcado em vez de
  apagado, preço congelado em `token_usage` com auditoria append-only
  (ADR 0042); ModelPicker reagrupado por origem com curadoria.
  Os seis providers da 9b entraram pela Fase 11 (ADR 0043).
- FASE 10 — CONCLUÍDA: Bitbucket + GenericGitProvider entregues VIA
  dogfooding (primeira execução real do Brabo construindo o próprio
  Brabo, em fork com seed manual, tandas com restart entre tasks,
  Criativo obrigatório na cadeia). Colheita escrita na Fase 12d, em
  docs/explanation/primeiro-dogfooding.md — os 17 achados com
  arquivo:linha são reais; a metade QUANTITATIVA (restarts,
  intervenções, custo) ficou como `não medido`, porque a tabela de
  observação nunca foi preenchida. Os três P1 de operabilidade foram
  fechados pela Fase 12. Os outros 14 seguem abertos e listados na
  colheita — não corrija de passagem.
- FASE 11 — CONCLUÍDA: os seis providers da Fase 9b como config sobre
  a base, cada um investigado do zero contra a doc oficial (proibido
  herdar quirk); LLM_PROVIDER_NAMES de 3 para 9; DTO de credencial e
  testador de conexão derivando de lista única; capability só
  declarada quando provada, com duas reversões ao vivo (DeepInfra e
  Vultr); único hook novo na base (`parseErrorFrame`, +31 linhas)
  provado necessário pelo OpenRouter (ADR 0043).
  Pendência dos smokes com credencial real: absorvida pela FASE 13.
- FASE 12 — CONCLUÍDA: operabilidade pós-dogfooding, os três achados
  P1 fechados e provados numa execução única (ADR 0047).
  12a — adoção de repositório existente: rota própria, `getRepo`
  validando acesso antes de gravar, `origin` (created|adopted) nas duas
  tabelas, e o PLANO como portão — dry-run que descreve a divergência e
  não altera nada enquanto a decisão for nula; readotar converge
  (ADR 0044, RN-045/046).
  12b — reagendamento do dev agent por evento: máquina de estados
  persistida (working|awaiting_gate|idle|idle_tripped) reagindo a dois
  eventos da outbox existente, `awaiting_gate` retendo o worktree (que
  é por AGENTE, não por task) até o gate terminar, e circuit breaker
  com rearm explícito (ADR 0045, RN-047).
  12c — promoção de story com autoridade do usuário: `story_promotion`
  por projeto com `manual` como DEFAULT NOVO (backfill dirigido põe os
  projetos existentes em `auto`), `proposed_ready` como proposta e não
  estado, promoção reusando o TransitionStoryUseCase (código morto do
  achado #13) e recusa devolvendo ao PO com o motivo fixado na sessão
  dele (ADR 0046, RN-048).
  12d — o Noop entrou na máquina de estados da 12b; script
  `pnpm --filter api validacao:fase-12` que sai != 0 quando o critério
  não fecha e extrai a evidência do banco; colheita da Fase 10
  escrita; docmap cobrindo engine/dev e engine/agents.
  Pendências (execução da validação; limites Local/Noop declarados):
  absorvidas pela FASE 13.
- Não refatore o que está pronto sem pedido explícito.

## FASE 13 — CONCLUÍDA em 2026-08-07 (provar de verdade e triar)
Nenhuma feature nova. A fase fecha as pendências declaradas, prova o
que a validação Local/Noop declaradamente não prova, e transforma os
19 achados abertos em plano priorizado. Lição incorporada: a tabela
manual da Fase 10 nunca foi preenchida — nesta fase TODA métrica é
extraída por script do event log/token_usage, nunca anotada à mão.

### 13a — Fechar as pendências declaradas
1. CONCLUÍDO em 2026-08-07: `pnpm --filter api validacao:fase-12` sai `0`
   e a tabela de event ids está em docs/explanation/validacao-fase-12.md
   (o TODO(humano) saiu). Custou quatro correções — três do INSTRUMENTO
   (a cobaia nascia em /tmp, invisível ao engine; o Noop não abria o
   gate; o Noop morria em `pr_settled`) e uma do PRODUTO (achado W: o
   dev agent morria quando a fila esvaziava).
2. PARCIAL em 2026-08-07: o smoke do **OpenRouter** rodou com credencial
   real e fechou (custo real US$ 0,000005, lido do `token_usage`). Os
   outros cinco seguem pulados — não há chave deles no ambiente. O smoke
   estava apodrecido contra o ADR 0049 e nunca tinha rodado; corrigido
   junto. Resultado datado em docs/explanation/aceite-providers.md

### 13b — CONCLUÍDA em 2026-08-07 (v2.4.0)
A cadeia inteira provada contra GitHub REAL (`daneiel/test`), em dez
execuções: adoção remota → plano com decisão do usuário → promoção
manual de UMA story → dev agent real escrevendo código → commit, push e
PR REMOTA → gate abre → área delega e dispensa com justificativa →
subagente SUSPENDE em aprovação → a recusa do usuário RETOMA o laço →
veredito `changes_requested` por LLM. Zero restart do engine. Merge
fora, por desenho (RN-014).
3. O roteiro é `pnpm --filter api validacao:real`, com fases separadas
   por CUSTO (`--ate adocao|backlog|execucao`) — a barata roda sozinha
   primeiro, e foi assim que erros de configuração apareceram antes de
   custar dinheiro. Exige execução DE DENTRO do container da api: a
   política é arquivo em volume compartilhado, e pelo host ela nasce
   num filesystem que o engine não enxerga.
4. `pnpm --filter api medir:execucao` é o instrumento, e está PROVADO:
   reproduz sozinho os números que o dogfooding anterior anotara à mão
   (18 chamadas, 292.211 tokens, ~US$ 0,03).
5. Resultado em docs/explanation/validacao-real.md, com as dez
   execuções e o que cada uma ensinou.

SETE P1 fechados no caminho, todos achados por EXECUÇÃO e nenhum por
teste: W (dev agent morria com a fila vazia), Y (a busca não distinguia
vazio de não-encontrado), AA (credencial de git resolvida por quem
clica, não por quem paga — RN-082), AB (gate chamava decisão pendente
de falha de infra — ADR 0057), AC (redirecionamento tornava qualquer
comando inaprovável), o ReDoS no escopo de caminho (CodeQL HIGH), e a
CVE do postgrex.

Dos achados que a fase abriu, X fechou depois (FASE 14d, RN-085 — o
teto de iterações virou por TIPO de agente). DOIS seguem abertos, e o
argumento deles vale mais que os números: Z e AD (o allowlist de verbos
NÃO converge: verbo, forma e invocação são espaços distintos, e as
execuções 6/7/8 travaram em um de cada), e AE (o agente de QA tenta
consertar o código que julga, contra o próprio prompt — contido por
duas barreiras independentes, allowlist e escopo). Nenhum dos dois é
bug a corrigir: são decisão de produto, e estão em
docs/explanation/achados-execucao-real.md.

A conclusão que a fase entrega, e que importa mais que a PR: o caminho
para autonomia NÃO passa por afrouxar política. Passa por o agente
ESPERAR a decisão em vez de morrer — o que o ADR 0057 fez para os
gates, estendendo o 0052.

### 13c — CONCLUÍDA: a triagem virou docs/explanation/backlog.md
Os 19 achados estão fechados (19 de 19). O documento segue vivo e
recebeu os achados novos da 13b.
6. Sessão de triagem: ler docs/explanation/primeiro-dogfooding.md e
   classificar os 19 achados em P1/P2/P3 com proposta de agrupamento
   em fases coesas (por tema e dependência entre eles), custo relativo
   estimado (P/M/G) e risco de esperar. A saída é PROPOSTA — a
   decisão de prioridade é do usuário.
7. Consolidar o backlog completo num documento vivo
   (docs/explanation/backlog.md ou equivalente): achados triados +
   itens antigos — budget por área (ADR 0038; o aparato de áreas e o
   Dev Lead saíram do backlog com o ADR 0053, implementado
   pela FASE 14d), handoff manual a agente à escolha,
   MFA/social/OIDC/federação (ADR 0031),
   SMTP real no MailSender, deploy (DEPLOY_ENABLED + Environments),
   volta da rc/rcfix (ADR 0030), modo community do approval-ladder,
   "N agentes online" no dashboard, preferência de moeda com taxa
   manual.

## FASE 14 — CONCLUÍDA em 2026-08-07 (o que a execução real exigiu)
A execução do hello world não passou do primeiro turno e revelou defeitos que
nenhuma suite pegava, porque tudo antes rodou com modelo LOCAL. As correções
já entraram; o que sobra é feature decidida pelo usuário durante a execução.

### 14a — Operabilidade dos agentes (CONCLUÍDA)
- Falha de turno virou `agent.error` DURÁVEL com origem, e o agente FALA no
  fio; os quatro conversacionais paravam de gravar `agent.response` vazio
  (RN-059). O caminho do erro narrado no frame final, que não emitia evento
  nenhum, também fechou.
- O chat do Criativo abre com convite em vez de vazio: ele é ativado e espera
  o usuário falar primeiro, e a tela agora diz isso — incluindo que tecnologia
  e código NÃO são dele.
- A chave que o agente gasta é a do OWNER do workspace (RN-058). Antes o turno
  procurava a credencial pelo SLUG do agente numa coluna UUID: nenhum agente
  jamais usou provider com credencial, e só `ollama` funcionava.
- Relatório de gasto das chaves, só para o owner, com agente separado de
  pessoa (RN-060).
- Bootstrap de Gitflow no GitHub: repo recém-criado responde 409 em toda a Git
  Data API, e o primeiro commit passa pela Contents API. O backend falso dos
  testes mentia (404 onde o GitHub responde 409) — corrigido junto, é o que
  fazia a suite ficar verde com o produto quebrado.

### 14b — Linha do tempo em árvore (CONCLUÍDA)
Um ramo por agente, do primeiro marco ao que ele está fazendo AGORA, derivado
100% do event log que a tela já busca. O feed cronológico continua, na coluna
de atividade: ele responde "o que aconteceu", a árvore responde "quem está
fazendo o quê".

Revisitado depois da FASE 26 (sem fase nova, mesmo espírito de correção
pontual da 12d/PÓS-FASE 15): o critério de abertura padrão passou de só
"ativo/parado" para os 5 agentes de atividade mais RECENTE — ativo continua
com prioridade (RN-118); cada ramo colapsado ganhou contador de NOVIDADE
próprio, com "último visto" por agente em `read-state.ts` (mesmo mecanismo
do sino, agora granular); e `tool.call`/`tool.result`/`agent.response`
passaram a expandir INDIVIDUALMENTE (args, resultado, iteração), agrupados
por fronteira de iteração do ToolLoop.

### 14c — Validação automática de UI (CONCLUÍDA)
Contraste virou teste sobre `design/tokens.css`, com a dívida conhecida medida
e travada; layout (texto cortado, menu fora da viewport, dropdown recortado
por ancestral, alvo < 24px) virou verificador de navegador em
`scripts/dev/validacao-visual.js`. Sem dependência nova.

### 14d — CONCLUÍDA: paralelismo decidido pelo LEAD, autorizado por você
Entregue em quatro PRs (#181, #182, #183, #184). O ADR 0053 passou a
ACEITO, revogando de vez os três cortes (Dev Lead, áreas dinâmicas via
module_map e o aparato genérico de áreas).

1. **Áreas viraram dado**: `agent_areas`/`agent_area_members` por
   projeto, com `max_parallel` default 2. O que forçou foi a área de
   **dev** — a primeira DINÂMICA, cujos membros são um por módulo do
   module_map. O que não é enumerável em código tem de ser dado.
2. **O teto é da SESSÃO, não do módulo** (RN-083). Contar por módulo
   permitiria N módulos × 2 sem autorização nenhuma — o buraco anterior
   com outro nome. Acima do teto vira `proposed_action`.
3. **Configurável por área** em Configurações, exigindo `maintainer`
   pelo mesmo motivo de ativar execução: mudar o teto é decidir quanto
   o produto gasta sem perguntar.
4. **A Anamnese propõe subir** quando autorizar virou rotina — três
   aprovações e NENHUMA negação (RN-086). Uma negação derruba o sinal:
   se você recusou alguma vez, o teto está fazendo o trabalho dele.
5. **O Dev Lead existe** (RN-087), conversacional, recebendo o handoff
   do Arquiteto na mesma confirmação que já entrega ao Infra, e
   propondo o plano: quantos agentes por módulo e por quê. Os
   `dev-<modulo>` deixaram de ser endereçáveis por handoff — a regra do
   ADR 0038 passando a valer para o dev como já valia para QA e Infra.

O **achado X** foi fechado aqui (RN-085): `TOOL_LOOP_MAX_ITERATIONS`
virou teto POR TIPO — 8 conversacional, 60 execução e gate. O critério
de quem sobe NÃO é "quem trabalha muito": é quem tem
`token_budget_micros` por baixo segurando o gasto. `infra-workflows`
usa ferramenta pesada e fica em 8, porque roda sem budget.

**Três lacunas da própria fase, achadas por mim ao escrever a fatia
seguinte, e todas a mesma falha**: a regra do teto entrou com testes
verdes e o produto não a exercitava — nenhuma rota chamava o caso de
uso, aprovar a ação não executava nada, e o tipo podia ser
auto-aprovado por permissions.json (fechado pela RN-086). Testar a peça
não é testar o caminho até ela.

**Fora do escopo, por decisão declarada** (ADR 0053 item 5): o botão
"Ativar execução" mudar de dono. A delegação Dev Lead → `dev-<modulo>`
pela tabela `delegations` com `area = "dev"`, que este mesmo item também
declarava, DEIXOU de estar fora de escopo — fechada pelo ADR 0094
(Auditoria fluxo.yml × código, Onda 2, RN-405). O botão continua
reversível; a execução continua no caminho atual, e a correção pós-gate
continua indo direto ao dev que abriu a PR.

## FASE 15 — CONCLUÍDA em 2026-08-07 (gates como dado)
Nenhum gate NOVO. A fase extrai para docs/gates.yml os gates que JÁ
existem implícitos no produto, com verificação por script e severidade,
no mesmo espírito do docs/.docmap.yml. Gate de agente que não existe
(dev-lead, platform) entra como `status: planned` referenciando o
backlog — nunca ativo. O contrato externo dos gates NÃO muda.

### 15a — CONCLUÍDA: registro declarativo
1. docs/gates.yml com os gates existentes (ver ADR 0054, que estende o
   ADR 0048 — a decisão no event log é o que torna a passagem de um
   gate mensurável), schema validado por teste.
2. Loader na api lendo o registro; endpoint interno de leitura.
3. Script `pnpm --filter api validacao:gates` que extrai do event log
   a última passagem de cada gate ativo e sai != 0 se algum gate
   `block` não tem evidência de verificação por script.

Nem todo gate tem prova no event log, e o registro diz onde ela mora:
`merge-protegida` é garantido por TESTE (a trava em decide.ts não emite
evento próprio) e `backmerge` é CI, com estado em .release/gate.json.
Por isso cada gate declara `evidencia: event_log | teste | ci` com o
localizador — rebaixá-los a `warn` seria mentir sobre as travas mais
duras do produto.

### 15b — CONCLUÍDA: consumo
4. Painel do time exibe o gate que cada story/PR está aguardando,
   derivado do registro (não hardcoded).
5. docs/explanation/gates.md explicando o mecanismo, no docmap.

## PÓS-FASE 15 — CONCLUÍDO em 2026-08-08 (v2.5.0 e v2.5.1)
Não é fase planejada: é o que o USO encontrou depois da 15, e está aqui
porque a origem de cada item importa. Nada disto veio de roteiro — veio
de navegar a app no Chrome e de ler o painel de segurança.

**Defeitos de UI, achados navegando** (RN-088..091):
- `429` virava TELA BRANCA e a app respondia com mais tráfego. A regra
  virou geral: toda tela distingue TRÊS estados — carregando, erro (com
  `trace_id` e botão) e vazio. `if (!dado) return null` colapsa os três.
- Dashboard fazia uma requisição por projeto: **3.824 → 12 req/min**, com
  `GET /workspaces/:id/projects-summary`. O sino era a metade que
  faltava: **289 → uma** requisição por ciclo (RN-090/091).

**Endurecimento de segurança, com os dois painéis a ZERO**:
- ADR 0058 — CSP fechado na api (`default-src 'none'`), revisando o item
  7 do ADR 0027; e o `projectId` contido na raiz (RN-092), que atingia
  não só o `permissions.json` como o escopo que AUTORIZA terminal.
- ADR 0059 — `GIT_OAUTH_STATE_SECRET` sem default em produção (RN-093).
  O default era PÚBLICO (`.env.example`) e o compose de produção o supria
  como fallback: exigir "não vazia" não teria pego nada, porque no caminho
  real de erro a variável estava DEFINIDA.
- Alerta que não se sustentava foi DISPENSADO com justificativa escrita,
  nunca silenciado — e dispensar é decisão do usuário, não do agente.

**Três lições operacionais que custaram ciclo de CI, e valem como regra:**
1. **CodeQL verde numa PR não prova que alerta antigo fechou** — o check
   de PR reporta alerta NOVO. Alerta fecha na varredura do branch DEFAULT,
   isto é, só depois de a correção chegar em `main`.
2. **Gitleaks varre commits alcançáveis de `refs/heads/*`, não a árvore.**
   Um valor de alta entropia commitado uma vez reprova o CI para sempre
   naquele branch; corrigir por cima NÃO limpa. A saída é o commit deixar
   de ser alcançável (reconstruir a partir de `dev` e APAGAR o branch
   antigo ANTES de abrir a PR nova) — nunca allowlist, que cega o scanner
   naquele caminho para todos os commits. Refs de PR não entram no escopo.
   Fixture que representa segredo nasce SEM entropia.
3. **Barreira que mora em outra função o CodeQL não enxerga** — daí os
   três `js/path-injection` sobreviverem à correção. Manteve-se a checagem
   centralizada (RN-092) e pagou-se o preço no painel: duplicá-la em cada
   chamador seria checagem que um dia diverge.

