---
id: historico-de-fases-parte-3
title: "Histórico de fases, parte 3: Programa 28 e auditorias"
sidebar_label: Programa 28 e auditorias, parte 3
description: O Programa 28, a auditoria fluxo.yml × código e os agentes do time, até o grafo de conhecimento.
keywords: [histórico, fases, ADR, RN]
tipo: historico
---

# Histórico de fases, parte 3: Programa 28 e auditorias

:::historico 2026-09-11
O Programa 28 (onda a onda), a auditoria fluxo.yml × código, os agentes novos do time e o grafo de conhecimento.
Texto movido sem reescrita do [Histórico de fases](historico-de-fases.md). O que vale hoje mora nas RNs e nos ADRs.
:::

## PROGRAMA 28 — Onda 1, frente A: o tema deixa de ser inalcançável (RN-182..185)
O tema claro existia em `design/tokens.css`, tinha teste de paridade e estava
descrito no `design/README.md` como se fosse uma tela — e **nada em `apps/web`
escrevia `data-theme`**. O único jeito de vê-lo era digitar o atributo no
DevTools. Os dois testes de contraste sabiam e diziam: um afirmava por `expect`
que TRÊS pares do claro reprovam, "registro do que se herda, não garantia do que
se renderiza". Enquanto durou, o argumento era honesto — medir uma tela que
ninguém pode abrir é medir uma intenção. Com o botão de tema chegando, ele
inverte de sinal.

**O boot é um ARQUIVO** (`apps/web/public/theme-boot.js`), síncrono no `<head>`,
antes do bundle. O handoff manda usar script INLINE; a imagem serve sob
`script-src 'self'` (ADR 0058), então inline funcionaria em `pnpm dev:web` e
seria bloqueado em produção — a falha do ADR 0036 com outro sujeito. `tema.ts`
é a API que o shell consome; o botão não mora nela. `localStorage` que lança
degrada para "pinta e não persiste", e valor desconhecido cai no default.

**Seis tokens do tema claro mudaram de valor** (ADR 0074), porque o fundo mais
exigente do claro é o `--code-bg` de papel: accent 3,56 → 4,81, warning
3,15 → 4,98, success 3,89 → 5,12, violet 4,16 → 4,95, text-muted 2,76 → 5,17,
mais o accent-hover um degrau abaixo. O ESCURO não mudou nenhum, e a dívida dele
segue travada nos mesmos cinco números. Dois efeitos colaterais registrados: os
cinco pares que no escuro são dívida PASSAM no claro, e a "exceção conhecida do
design system" (`--on-accent` sobre `--accent`, 3,20:1) some no claro — o
conserto que o comentário do teste descrevia, escurecer até `--terracota-500`, é
o que o claro passou a fazer.

**Cinco dos oito valores `--syn-*` do handoff foram RECUSADOS por medição** (o
pior, `--syn-cm`, dá 2,32:1 no claro). Onde o handoff reprova, vale o número
medido: é a mesma régua das fontes. Os oito papéis passam a existir com prefixo
`--syntax-*`; os cinco semânticos que ainda pintam vão medidos ao lado deles.

## PROGRAMA 28 — Onda 1, frente D0: gasto por provider (RN-186..188)
**A contenção mudou de natureza, e é isso que importa — não o eixo novo.**
`provider` voltou a ser dimensão de `sumGroupedBy`, revisando o ADR 0063 por
decisão do dono do produto. Antes, o membro não alcançava a quebra por
CREDENCIAL porque ela não existia — o ADR 0063 escreveu "não há argumento a
passar". Agora existe, e quem contém é o TIPO: duas sobrecargas, e o escopo que
carrega `actor` (o único da visão do membro) só aceita
`Exclude<SpendDimension, 'provider'>`. A garantia passou de "impossível de
expressar" para "impossível de compilar", que é mais fraca — e é por isso que as
barreiras são DUAS e independentes: a rota do membro também não tem parâmetro de
dimensão nenhum. Nenhum `if` sobre a combinação, de propósito (mesma lição da
RN-153/154), e a prova foi por INVERSÃO: sem o `@ts-expect-error` o `tsc` acusa
`TS2769` na linha exata.

`porOwner`/`porAgente` são partição de `porAtor` por `actor_kind`, sem consulta a
mais; `system` fica fora dos dois e continua no total. O índice em
`token_usage(created_at)` que o ADR 0063 mediu e adiou entrou na migração `0044`.
A TELA não mudou — é onda posterior.

## PROGRAMA 28 — Onda 2, frente H2: ranking de modelos sem nota inventada (RN-210, ADR 0077)
O handoff pedia duas coisas que dependiam do MESMO dado que o produto não
tem: uma nota de qualidade por capacidade (mock: "código → claude-sonnet-4 /
qwen2.5-coder:14b (9.4)") e um badge "ideal" no `ModelPicker` quando o
modelo cobre "todas as capacidades exigidas pelo agente". A investigação
confirmou duas vezes que esse segundo dado não existe: o próprio
`ModelsSection` já tinha renomeado a coluna "Agente · capacidades" para só
"Agente" por essa razão, e o `ModelPicker` de binding de agente lê
`GET /projects/:id/models` (papel `viewer`) — a curadoria (`uses`, ADR 0051)
só existe em `ModelComCuradoria`, de uma rota `maintainer`-only. O badge NÃO
foi construído; a tabela "Melhores modelos por capacidade" FOI, com dois
sinais reais: quantos agentes do projeto já resolvem, pela cascata, para
cada modelo curado, e o custo do catálogo como desempate — nunca nota
calculada.
## PROGRAMA 28 — Onda 2, frente B: sidebar recolhe (RN-195..201)
264px/62px com trilha de ícones no colapso; projetos expansíveis revelando as
abas (lidas de `project-tabs.ts`, nunca hardcoded); seção Atividades agrupada
por agente-base/instância REAL — sufixo `-2` de `extraDevAgentId`, nunca um
contador `-01/-02` inventado (achado da Onda 1/frente B0) —, escopada ao
projeto da rota atual, não a todos, para não abrir N+1 de eventos. Botão de
tema no rodapé; os dois itens globais inertes saem, só Projetos e Atividades
são globais; auto-collapse da aba Código via `AutoCollapseContext`
(`sidebar-state.ts`), sem gravar preferência. Persistência centralizada em
`sidebar-state.ts`, as seis chaves `brabo.*` do handoff.

Duas divergências do handoff documentadas e NÃO resolvidas (RN-197): o badge
do projeto continua `pendingApprovalsCount` (RN-151 vence, é mais recente) e a
cor de identidade do handoff só aparece na trilha recolhida — a linha
expandida mantém só o dot de status existente (RN-039), dois dots seria ruído.
## PROGRAMA 28 — Onda 2, frente C: moldura de tela (RN-202/203, ADR 0078)
As quatro correções literais do checklist "moldura de tela" do handoff:
`.headerTop` ganhou `min-height: var(--header-h)` — PISO, não teto, porque o
cabeçalho do projeto (identidade + `TokenMeter` compacto) é mais rico que o
cabeçalho genérico das 6 telas internas do handoff, e forçar 60px cortaria o
alerta de orçamento, a mesma classe de erro que a RN-088 proíbe; aba ativa com
`box-shadow: inset 0 -2px 0 var(--accent)` em vez de `border-bottom`; rolagem
horizontal na régua; container de conteúdo com `max-width: 1040px` nas abas em
forma de documento (não nas `semRespiro`). Os valores de espaçamento da régua
que viviam como override de CSS de descendente em `ProjectPage.module.css`
desde a FASE 16 migraram para `Tabs.module.css`, agora com o mesmo dono.

A parte que exigia decisão, não só CSS: o handoff lista 7 abas de projeto e o
registro (`project-tabs.ts`) tem 10. `executores` (RN-121), `backlog`
(RN-048) e `insights` (hipóteses do Psicólogo) nasceram DEPOIS do handoff, com
dado real e RN própria, e FICAM — o handoff é referência de fidelidade VISUAL,
não teto de quantas abas o produto tem (RN-203, ADR 0078). E a chave
`sessions` continua rotulada "Chat", nunca "Chat RAG" como o handoff mais
recente pede (RN-202): "Chat RAG" descreveria uma funcionalidade que não
existe — o contrato de embeddings está pronto (ADR 0075) mas nada ainda o
consome, sem pipeline de indexação e sem UI de citação — e renomear a aba
hoje seria o mesmo erro que o ADR 0042 já recusa para modelo de catálogo:
anunciar uma capacidade antes dela existir. Nenhuma FORMA de export mudou
(`AbaDoProjeto`, `ABAS_DO_PROJETO`); só o rótulo de `code` foi de "Code" para
"Código".

## PROGRAMA 28 — Onda 2, frente H1: foco visível (ADR 0036)
`Select`, `Modal` (botão de fechar) e `ProjectCard` ganharam `:focus-visible`
no mesmo tratamento calibrado de `Input.module.css`, incluindo o bloco de
`forced-colors`: nenhum dos três tinha indicação de foco alcançável só por
teclado. O botão de fechar do `Modal` subiu de 30px para 32px, o piso de alvo
de toque em desktop. `Table` e `Badge` foram auditados e NÃO precisaram de
mudança — nenhum dos dois expõe afordância interativa própria: linha de
`Table` é apresentação pura (quem precisa de linha clicável já usa
`<button>`/`<a>` dentro da célula, via `render`) e `Badge` não é usado com
`onClick` em lugar nenhum do produto.

## PROGRAMA 28 — Onda 3, frente H3: a aba Criativo ganha KPIs sem fingir dado que não existe (RN-227..230)
O handoff pede 4 selos de status para os 5 estados reais da sessão
(`created/active/closing/closed/closed_abnormally`). `closed_abnormally`→
abortada e `created`→aguardando são diretos; `closing` NÃO foi fundido com
"fechada" — ganha selo próprio ("encerrando", tom `accent`, pulsante),
porque em `closing` o desfecho ainda não é conhecido e chamá-la de "fechada"
mentiria sobre isso. Os filtros pill (só 4, pelo mesmo motivo) agrupam
`created` e `closing` por TRAJETÓRIA, não aparência: `created` cai em
"Ativas" (ainda em jogo), `closing` cai em "Fechadas" (a caminho de fechar
sem erro) — o selo da linha nunca é reescrito pelo filtro, só o agrupamento
muda. Dos 4 KPIs, dois são honestos por dado ausente: "custo do mês"
REAPROVEITA `getMySpend` (mesma `queryKey` da aba Gastos, visão do
membro/RN-101) e nunca mostra o total do projeto — que é dado do owner
(`porProjeto`), e a aba Criativo é vista por qualquer membro; "taxa ideação
→ commit" é DECLARADA ausente (mostra "—"), porque não existe vínculo entre
sessão e commit no produto hoje — inventar o cálculo seria a mesma classe
de erro que o ADR 0042 já recusa para nota de modelo.

## PROGRAMA 28 — Onda 4, frente G2: o Chat RAG ganha pipeline de indexação e busca híbrida (RN-231..238, ADR 0080)
Sobre a tabela `chunks` da Onda 3 (ADR 0079): indexação MANUAL (sem
watcher, `POST .../rag/reindex`, full rebuild idempotente — apaga o
escopo/sessão antes de recriar) dos três escopos honestos — `docs`/`adr`
via `ReadProjectCodeUseCase` (mesma credencial/portão/checagem de caminho
da aba Code) e `session` só de `chat.message`/`agent.response`. Chunking
por heading/parágrafo, 1200 caracteres com 150 de sobreposição —
documentado como ponto de partida, não calibração contra dado real (não
existe, ainda, corpo de perguntas rodado contra o índice). Busca híbrida
é DUAS consultas independentes (vetor via HNSW, léxico via GIN),
fundidas por soma ponderada (0.6/0.4) e cortadas num limiar (0.2) —
números também ponto de partida. Quando o provider de embedding (fixo:
`ollama`) não responde, o pipeline grava os chunks SEM vetor e declara a
lacuna no relatório — nunca finge indexação completa, e a busca degrada
para léxico-only avisando. A tela (Chat RAG como aba própria) é da Onda
5; esta frente é só o backend.

## PROGRAMA 28 — Onda 4, frente F1: ciclo de vida do container vira tabela, sem orquestrador (RN-243..248, ADR 0081)
Ver item 31 da FASE 25 (PARCIALMENTE REVOGADO): `project_containers`
(migração `0046`) grava o ESTADO mutável — `provisioning → running ⇄
stopped`, `failed` alcançável dos três, `removed` só sai reprovisionando
— distinto de `artifact.project_image` (a DECISÃO imutável do
Arquiteto). Confirmado por investigação (grep, zero ocorrências):
NENHUM serviço do produto monta `/var/run/docker.sock` nem roda
`privileged` — os dois casos de uso só GRAVAM e LEEM, nenhuma chamada
real a Docker. A primeira transição exige a imagem já decidida (RN-105)
e CONGELA versão/recursos na linha; projeto `local` (ADR 0072) é
recusado, porque não sobe container próprio. Teto de recursos
(`cpus`/`memory_mb`/`pids_limit`) é DECLARADO, não aplicado — nenhuma
tela afirma "o container está limitado a X", só "a intenção registrada
era X". Nenhuma rota HTTP nova à época: sem consumidor real ainda, expor
uma seria adivinhar contrato — fechado pela Onda 5/frente F2 logo abaixo.

## PROGRAMA 28 — Onda 5, frente G3: o Chat RAG ganha aba própria (RN-252..254, ADR 0082)
A tela que RN-202 (Onda 2/C) tinha adiado — "Chat RAG" descreveria uma
capacidade que ainda não existia — chega junto com o backend da Onda
4/G2: `key: 'rag'`, aba NOVA (`ordem: 28`, entre Código e Backlog),
NUNCA renomeando `sessions`. A distinção continua a mesma, só a razão
mudou: `sessions` é conversa com agente ATIVADO (gasta a chave do owner
por turno, RN-058); `rag` é busca sobre um índice já construído, sem
agente nenhum no meio, read-only por natureza. A tela consome os três
contratos do ADR 0080 sem adivinhar forma e mostra as duas degradações
honestas que o backend já declarava e nenhuma tela lia — `vectorAvailable:
false` vira aviso visível, e a cobertura nunca inventa "reindexado há
Xmin". Citação de origem `session` navega até o EVENTO exato, reusando o
mecanismo que os chips de evidência do Psicólogo já usam; origem `file`
mostra caminho/heading como texto, sem link — a aba Código não tem
deep-link por caminho hoje, fora de escopo aqui.

## PROGRAMA 28 — Onda 5, frente F2: o consumidor real do ciclo de vida do container (não o terminal) (RN-267/268, ADR 0083)
O plano original desta frente era o terminal interativo completo. A
investigação confirmou que a FASE 25b continua cortada: nenhum serviço
monta `/var/run/docker.sock`, e mesmo depois do ADR 0081 nada em
produção transiciona `project_containers` — não existe container real
para abrir um terminal DENTRO dele. Implementar um terminal fingido, ou
rodando no mesmo container do monorepo do Brabo (a dívida que o ADR 0055
já descreve como política, não isolamento), inventaria capacidade — o
mesmo erro que os ADRs 0041/0042 recusam para provider de LLM e modelo
de catálogo. A entrega real: `GET /projects/:projectId/container/lifecycle`
(role:viewer), primeira exposição HTTP do ciclo de vida (revisa o ADR
0081, que tinha adiado a rota por falta de consumidor), e a aba Terminal
mostrando esse estado — badge traduzido, motivo de falha — SOB o texto
explicativo que já existia, nunca no lugar dele, buscado só enquanto a
aba está aberta. `null` (nunca provisionado) é o resultado honesto e
mais comum hoje.

## PROGRAMA 28 — Onda 5, frente I: login social revoga a proibição do backlog do ADR 0031 (RN-272..283, ADR 0084)
Pedido explícito do dono do produto, ciente das consequências de
segurança — a proibição sai só para GitHub/GitLab; MFA, OIDC provider e
federação genérica continuam fora de escopo (ver "O que NÃO fazer").
`SocialLoginCallbackUseCase` termina no MESMO `EmitirSessaoUseCase` do
login por senha — nenhum segundo formato de sessão. Reusa o cliente
OAuth existente, mas o `state` tem propósito PRÓPRIO
(`purpose: 'social_login'`, checado ANTES de qualquer outro campo):
nunca aceita o `state` do fluxo de CONEXÃO de git a um projeto, o que
seria escalação de privilégio. Tabela nova `social_identities` (migração
`0047`), chave `(provider, provider_user_id)` — nunca e-mail/login.
Decisão em três passos: identidade conhecida → login; e-mail bate com
conta existente E verificado pelo provider → vincula (e verifica o
e-mail da conta se ainda não estava); e-mail bate mas NÃO verificado →
recusa — um e-mail digitado não é prova de posse, aceitar abriria
account takeover; sem conta correspondente → provisiona conta nova sem
senha, mesmo estado "pendente" da migração do Keycloak. Reusa o MESMO
app OAuth da conexão de git — zero variável de ambiente nova, só
`redirect_uri`/`scope` diferentes por fluxo; a ação do OPERADOR de
cadastrar o segundo callback no provider é o que justifica o branch
`breaking/`.

## Auditoria fluxo.yml × código — o plano do Dev Lead vira aprovação de verdade (RN-284, ADR 0086)
Não é fase planejada: fecha a divergência que uma auditoria só-leitura de
`docs/fluxo.yml` × código encontrou (achado A2,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) — o fluxo já declarava a
saída `plano-de-paralelismo` do `dev-lead` como `via: proposed_action`
desde o ADR 0085, e o código nunca foi ajustado para bater. O dono do
produto decidiu que o código errava.

`propose_execution_plan` entrou em `decide.ts` (papel mínimo
`maintainer`), DELIBERADAMENTE fora do bloco de tetos absolutos — pode ser
configurado para auto-aprovar, ao contrário de
`parallelize`/`raise_max_parallel`. O Dev Lead é o PRIMEIRO agente
conversacional (todos rodam turno síncrono via `GenServer.call` de até
180s) a suspender esperando uma decisão humana — o padrão já existia para
o dev agent (ADR 0052) e os gates de QA/Infra (ADR 0057), mas os dois são
disparados por `cast` e nunca precisaram lidar com um `from` síncrono
pendente. `TurnoAssincrono.tratar_resultado/2` ganhou um ramo: presente a
chave `:aguardando_aprovacao` (checada pelo VALOR, não pela presença —
o Dev Lead a carrega `nil` desde o `init/1`), responde ao `from` do mesmo
jeito e na mesma hora de sempre, mas emite só `agent.status:
awaiting_approval` em vez de `agent.done` — o turno não terminou.
`LiveBroadcast.agent_status/4` ganhou o status novo na guarda. A retomada
usa o MESMO `Engine.Dev.Wake` que `QaLeadServer` já reusa para os
subagentes de QA (a entrega é por AGENTE, não por tipo).

**Lacuna aceita, declarada**: sem tabela de estado própria, um restart do
engine enquanto o Dev Lead está suspenso perde a inscrição — a decisão
continua registrada e visível em Aprovações, mas ele não narra o desfecho
sozinho. Fechar isto exigiria o mesmo mecanismo de persistência do ADR
0052; fora do escopo desta correção, que só alinha o comportamento ao que
`docs/fluxo.yml` já declarava.

## UX Designer — o quinto agente conversacional, antecipado (RN-285..287, ADR 0087)
Não é gatilho de separação disparado — `docs/fluxo.yml` sempre declarou
"quando o projeto GERENCIADO tiver interface própria a desenhar" como
critério, e ele não disparou: o design system continua insumo estático.
Decisão CONSCIENTE do dono do produto de antecipar o papel mesmo assim.

`Engine.Agents.UxDesignerServer` espelha o `DevLeadServer` — GenServer por
sessão, teto de 14 iterações, ativado por handoff `accepted` endereçado a
"ux-designer" pelo mecanismo GENÉRICO já existente (nenhuma linha mudou em
`ActivateAgentUseCase`). SOLO: sem área, sem subagentes. O kickoff lê a
`artifact.product_brief` mais recente — a MESMA "necessidade de negócio"
que o Criativo produz, sem artefato novo — e o sistema de design
(`design/tokens.css`, `design/COMPONENTS.md`) é DESCRITO na identidade do
agente (`Engine.Harness.Agents`), texto estático: os agentes conversacionais
não têm ferramenta de leitura de arquivo do repositório.

`propose_prototype` é a ÚNICA ferramenta (`personas`, `jornadas`,
`prototipo` com `telas`/`anotacoes`, `resumo`). Grava
`artifact.prototipo_navegavel` **sem caso de uso dedicado na api** —
diferente de `choose_project_image`/`create_c4_diagram`, que precisam de um
porque têm conteúdo DERIVADO de outro artefato ou recusa de domínio
compartilhada; nenhum dos dois motivos vale aqui, então a validação de forma
mora no engine (`ArtifactSchemas`) e a gravação usa o `append_event_returning`
genérico que a api já expõe, mesmo caminho do `artifact.product_brief`. Um
artefato só, dois handoffs sobre ele — para "po" e para "dev-lead" — nunca
um segundo artefato para "spec-visual": o protótipo (telas + anotações) É a
spec visual, e duplicá-lo arriscaria as duas cópias divergirem depois. Reusa
a metade do desenho do ADR 0086 que sobrevive sem a suspensão dele:
`propose_prototype` bem-sucedido encerra o turno, para o modelo não propor
de novo e duplicar o artefato — sem o "aguardando_aprovacao", porque propor
um protótipo não tem efeito externo.

`apps/web/src/lib/agents.ts` ganhou a entrada (`color: var(--accent)`, o
token semântico menos reusado do roster; `icon: PencilIcon`).
`uxDesignerActive` entrou no roster nas DUAS fontes que a RN-090 exige em
sincronia — o painel do time (`agent-status.ts`) e o card do dashboard
(`projects-summary.repository.ts`, mesma consulta de `infraActive`
ampliada, sem query nova).

**Fora de alcance, declarado**: `teste-de-usabilidade` exige usuário humano
real — nenhum agente substitui isso. `metricas-de-uso` segue lacuna mesmo
com `analytics` `active` (ADR 0089): o relatório de funil mede
sessão→commit→PR→merge, não adoção de feature pelos usuários FINAIS do
projeto que o Brabo constrói — "evidência de adoção por feature" está
DECLARADA como métrica sem caminho para existir hoje, não pendência a
fechar na próxima rodada.

## Staff — código pronto, dormente para disparo automático (RN-305/306, ADR 0088)
Não é fase planejada: `docs/fluxo.yml` declara o Staff/Principal Engineer
como `status: planned` desde o ADR 0085 ("contrato pronto, ativação
decidida, aguarda gatilho"). Decisão CONSCIENTE do dono do produto:
antecipar o CÓDIGO mesmo sabendo que o gatilho AUTOMÁTICO (a Anamnese
notando um problema sistêmico RECORRENTE) não vai disparar — a Anamnese
está pausada (`ANAMNESE_ENABLED=false`, decisão de 2026-08-10). Dormente
para disparo automático, não para acionamento MANUAL.

Sexto agente conversacional solo (`Engine.Agents.StaffServer`), ao lado de
Criativo/PO/Arquiteto/Dev Lead/UX Designer, espelhando o Arquiteto (laço
bounded teto 14) com duas diferenças: SEM `kickoff/1` (não há artefato de
sessão para resumir — sobe e fica ocioso até a primeira `user_message`,
que é como quem endereçou o handoff explica o problema) e ativado pelo
caminho GENÉRICO de `canActivateAgent` (handoff `accepted` endereçado a
"staff"), sem entrar em `USER_STARTED_AGENTS` — investigação confirmou que
nenhuma mudança de domínio na api era necessária, porque
`assertHandoffTargetAllowed` só recusa subagente de área e o Staff não tem
área. A única ferramenta, `propose_rfc` (problema, opções com trade-offs,
recomendação, PoC descartável), grava `artifact.rfc_staff` DIRETO via
`append_event_returning` — mesmo padrão sem tabela de `emit_insight`, e
não o de `artifact.c4_diagram` (que deriva o Container level do
module_map na api) — e devolve o handoff ao Arquiteto no MESMO tool call,
sem `proposed_action` (registrar um documento não é efeito externo).

`staffActive` entrou na roster do painel do time e no card do dashboard
(`ProjectCardSummary.roster`), mesmo critério de `infraActive`, para não
abrir a divergência que o comentário de `RosterFacts` já alertava.
**Declarado, não escondido**: `SessionPage.tsx`/`AGENTES_DE_CHAT` não
foram tocados — mesmo padrão já aceito para `infra` (um lead REAL e ATIVO
também fora dessa lista). O caminho ponta a ponta de uso hoje é a rota
interna (`POST .../agent/message`, `agent: "staff"`), não a tela de
Sessão; a UI genérica de "handoff manual a agente à escolha" segue no
backlog.

## O gate `implementavel` ativo — QA-estratégia como segundo momento do qa-lead (ADR 0090)
Decisão consciente do dono do produto de antecipar o gatilho que
`docs/fluxo.yml` já previa ("quando o gate implementavel ativar") — o
gatilho AQUI é o próprio trabalho de construir o mecanismo, não um sintoma
de uso esperando para acontecer. `docs/gates.yml`, `implementavel`:
`status: planned` → `active` (dono `dev-lead`, `severidade: warn`
intocada — o registro já dizia "nasce warn mesmo quando ativar").

**QA-estratégia deixa de ser papel `proposto`**: é o PRÓPRIO `qa-lead`, num
segundo MOMENTO — mesmo processo, entregável separado do veredito de PR,
exatamente como `docs/fluxo.yml` já declarava ("pode ser o próprio qa-lead
em segundo MOMENTO, não necessariamente agente novo: a separação é de
entregável"). `Engine.Gates.QaLeadServer.run_design/3` é um ponto de
entrada NOVO e ADITIVO (sem tocar `run/2`, o caminho de sempre, amarrado a
`DevAgentState.find_by_task_id`), acionado por
`Engine.Gates.Dispatcher.run_qa_estrategia/3` (mesma indireção trocável em
teste que `run_qa/2`/`run_secops/2` já usam).

`Engine.Gates.QaEstrategiaAgent` é módulo SEM ESTADO (não `GenServer`),
mesma forma de `QaPerformanceSegurancaAgent` — registro sem `Terminal`
(`ReadFile`, `SearchWorkspace`, `EmitPlanoDeTeste`) —, mas o CONTEXTO é
outro: `Engine.Gates.QaEstrategiaContext.fetch/3` busca SÓ story (de
`list_backlog`) e `module_map` vigente (de `get_infra_context`, reusado só
pelo campo `moduleMap` — zero rota nova), sem `dev_state` nem
`worktree_path`, porque o gate roda PRE-DEV: não há dev agent, worktree
nem `task_id` ainda. Nenhuma das três ferramentas passa pelo
`ActionPipeline` (só `terminal`/`write_file` passam), então este agente
NUNCA suspende — `run_design/3` roda síncrono dentro do próprio
`handle_cast`. O teto de iterações fica em 8 (conversacional), não 60
(gate) — DE PROPÓSITO: sem `token_budget_micros` por baixo (não há task,
PRE-DEV), a mesma razão pela qual `infra-workflows` fica em 8 mesmo usando
ferramenta (RN-085). O entregável (`emit_plano_de_teste`: síntese,
critérios executáveis, estratégia de automação GENÉRICA e sem framework)
vira `artifact.plano_de_teste` no event log da sessão que chamou.

`assess_implementability`, ferramenta nova do Dev Lead, lê o
`artifact.plano_de_teste` mais recente da story no histórico da PRÓPRIA
sessão: sem plano ainda, dispara a avaliação e devolve erro pedindo
retentativa (erro de ferramenta é ENTRADA do laço, não fim de linha —
RN-163); com plano, propõe o parecer (`implementavel`/`inviavel` +
justificativa, plano embutido no payload) como `proposed_action`, MESMO
padrão de três desfechos de `propose_execution_plan` (ADR 0086) —
`maintainer`, DELIBERADAMENTE fora do bloco de tetos absolutos de
`decide.ts`.

**`appsec` deixa de ser `proposto`** — o segundo momento do SecOps entra na
seção seguinte.

## O appsec ganha o segundo momento do secops (RN-360/361, ADR 0090)
`docs/fluxo.yml` (`id: appsec`, camada_seguranca) declarava por antecipação
"mesmo padrão do QA: dois MOMENTOS, não dois agentes por ora" — decisão
consciente do dono do produto de antecipar a ativação, sem esperar o gate
`implementavel` (frente `qa-estrategia`, mesmo ADR conceitual 0090) que o
próprio registro citava como gatilho.

`Engine.Gates.SecOpsAgentServer.run_design/2` roda no MESMO processo do
secops de PR (mesma chave de `Registry`), sem `Diff`/`Scanner`/
`DevAgentState` nenhum: busca a story no backlog + o `module_map` vigente
(`Engine.Gates.AppSecContextBuilder`, sem `dev_state`/`worktree_path`) e
chama `Engine.Gates.AppSecAgent.run/3` — módulo SEM ESTADO (não é GenServer,
mesma forma de `QaPerformanceSegurancaAgent`), registro de ferramentas SEM
`Terminal`, rodando um checklist STRIDE-lite via `ToolLoop.run/1` sobre o
DESENHO da story, nunca sobre código. Termina emitindo `artifact.threat_model`
e criando handoff para os três leads declarados (arquiteto, dev-lead,
`infra` — o AGENTE endereçável do id `area-infra`, RN-361).

**Lacuna declarada, não bug**: `run_design/2` é ACIONÁVEL, mas nada aciona
sozinho ainda — o gatilho natural é `assess_implementability` do Dev Lead
(frente `qa-estrategia`), fora do escopo desta entrega, que foi mantida
autocontida (`decide.ts`/`docs/gates.yml`/`dev_lead_tools.ex` intocados).

## `analytics`/`delivery-metricas` viram relatório (RN-320..322, ADR 0089)
Decisão consciente do dono do produto de ANTECIPAR dois papéis do
modelo-alvo (`docs/fluxo.yml`, `status: proposto`) sem esperar o gatilho
orgânico que cada um já declarava. A forma é a que o próprio fluxo
prescrevia: `analytics` "absorvido por `medicao`" até métrica de PRODUTO
virar entrada obrigatória do PO, `delivery-metricas` "nunca vira agente —
vira RELATÓRIO do `medicao`". Os dois viram um SCRIPT só —
`apps/api/scripts/analise-funil.ts` (`pnpm --filter api analise:funil --
--projeto <uuid> [--json]`), no MESMO formato de `medir-execucao.ts`
(Fase 13b): leitura pura via Drizzle, zero escrita, sem GenServer, sem
agente de LLM.

Mede DE VERDADE, sobre `proposed_actions.execution_result` das três ações
git do dev agent (`git_commit`/`pr_open`/`git_merge`, só `status:
'executed'`): funil real (quantas sessões produziram commit / PR aberta /
PR mergeada, e a conversão entre etapas — conta SESSÃO, não ação), lead
time real (primeiro commit ao primeiro merge da sessão, por `updated_at`
da EXECUÇÃO, não da proposta) e deployment frequency real (merge em
branch `PROTECTED_BRANCHES`, por dia, cruzando por referência com o gate
`backmerge` de `docs/gates.yml` — cuja evidência é CI, fora do alcance de
um script que só lê o banco).

Três métricas ficam numa seção "Não medido, de propósito" — declaração
PERMANENTE, não lacuna a fechar na próxima rodada: **funil de produto
completo ideação → commit** (`sessions` sem `storyId`, RN-230, exigiria
schema novo — nenhuma migration nesta frente); **evidência de adoção por
feature** (não é dado que falta coletar — o Brabo não instrumenta os
projetos que ele CONSTRÓI, sem caminho nenhum para essa telemetria
existir hoje); **MTTR e change failure rate** (exigem sinal de INCIDENTE
de produção real, a mesma dependência de `secops-runtime`/`platform` —
outra frente).

## `secops-runtime` como script de relatório (RN-375..377, ADR 0091)
Antecipação decidida do dono do produto do papel `secops-runtime`
(`docs/fluxo.yml`, `camada_seguranca`, antes `proposto`), sem esperar o
gatilho declarado ("produção com tráfego real, pós `DEPLOY_ENABLED` +
`platform` ativo"). Só o que o gatilho NÃO exige entra: `pnpm --filter api
relatorio:seguranca-runtime` lê `rate_limit_hits` — o dado que o
`RateLimitGuard` do ADR 0027 já grava, inclusive sob tráfego de dev/CI — e
produz ranking de baldes (`user:<uuid>`/`ip:<endereço>`, os dois únicos
formatos gravados; sem rota nem motivo, que a tabela nunca guardou) e
distribuição temporal em fatias fixas. É SCRIPT, não agente LLM nem
`GenServer`: não há decisão a tomar sobre o dado, só agregação.

Detecção automática de incidente, resposta a incidente e postmortem de
segurança continuam FORA — dependem do mesmo gatilho que não disparou — e
o relatório os lista numa seção "não medido" PERMANENTE, sem simular
incidente de exemplo nem inventar número (mesmo princípio dos ADRs
0041/0042/0077). A janela retida é curta por desenho
(`DomainGaugesCollector.pruneRateLimit` apaga hits com mais de
`2 × RATE_LIMIT_WINDOW_MS`, 240s por padrão), e o relatório declara as duas
janelas — CONFIGURADA e OBSERVADA — nunca deixando a segunda passar por um
histórico maior do que é.

## `platform` ganha uma primeira entrega: relatório de telemetria sob demanda (RN-385/386, ADR 0092)
Decisão consciente do dono do produto de antecipar parte do papel `platform`
(`docs/fluxo.yml`, `camada_plataforma`) — cujo `status` continua `planned` e
cuja `ativacao` continua sincronizada com `DEPLOY_ENABLED`, que não existe.
`pnpm --filter api relatorio:telemetria [--projeto <uuid>] [--json]` é um
SCRIPT (não agente LLM, não `GenServer`) que lê, sob demanda, as MESMAS
perguntas que o `DomainGaugesCollector` já coleta para o scrape do
Prometheus — sessões ativas/closing por projeto, tasks bloqueadas por
projeto, estado do último backup (sempre GLOBAL, nunca por projeto, porque o
produto faz backup do banco inteiro) — e termina depois de imprimir. As
consultas SQL são REPLICADAS, não importadas do coletor: os métodos dele são
privados e terminam escrevendo num gauge Prometheus, sem metade pura de "só
a query" para reusar sem acoplar um script de CLI ao ciclo de vida de um
`@Injectable`.

A saída sempre traz "onde ver mais" (os dashboards versionados em
`deploy/k8s/observability/dashboards/*.json`, os alertas em
`deploy/k8s/observability/alerts/brabo-alerts.yaml`, `docs/runbook.md
#observabilidade`, `pnpm dev:obs` para observabilidade local) — link, nunca
duplicação — e uma seção "não medido" que DECLARA, sem inventar: nenhum SLO
numérico está definido no produto, postmortem depende de incidente real que
não aconteceu, e telemetria de volta ao produto em loop fechado é o que
tornaria `platform` `active` — o gatilho (`DEPLOY_ENABLED`) segue ausente. O
`gate_saida: { id: operavel, status: planned }` do papel não muda;
`docs/fluxo.yml` só ganha uma `nota` na saída `telemetria-consolidada`
dizendo que a versão manual/sob-demanda já é real.

## dbre vira dois scripts mecânicos (RN-400..403, ADR 0093)
Do papel `dbre` do fluxo.yml, só dois dos quatro entregáveis dependem de
volume real de dados (`plano-de-capacidade`, `tuning` — seguem lacuna,
sem prazo). Os outros dois não precisam de carga real: `parecer-de-
migracao` é reconhecimento de padrão em texto SQL
(`apps/api/scripts/lint-migracao.ts`, varre `apps/api/src/db/migrations/
*.sql`, sinaliza `DROP TABLE`/`TRUNCATE`/`DROP COLUMN`/`ALTER COLUMN ...
TYPE`/`ADD COLUMN ... NOT NULL` sem `DEFAULT`, `!= 0` se achar algo — hoje
acha 3 ocorrências em migrations já mergeadas e aceitas, informativo, não
corrigidas de passagem); `backup-restore-testado` já era real desde a
Fase 5 (CronJob + `backup_runs` + `make test-restore` executado, RTO
~40s) — faltava só um relatório sob demanda (`relatorio:backup`, mesma
leitura do `DomainGaugesCollector.collectBackup()`). Nenhum dos dois
entra em CI ainda: o linter varre o repositório inteiro, não o diff de
uma PR, e viraria gate que reprova PR por achado que não é dela — ver o
ADR 0093 para a técnica de escopo (`pr-police.ts`) quando isso mudar. A
regra de "uma migration por onda" (`meta/_journal.json`) deixou de ser
chamada de "versão mecanizada" deste papel: ela evita conflito de
snapshot entre agentes em paralelo, preocupação ortogonal a "este SQL
tem um padrão arriscado".

## Auditoria fluxo.yml × código — Onda 1: fluxo.yml/gates.yml em dia
Primeira das seis ondas do plano da auditoria (seção D,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) a fechar — as Ondas 3, 4 e
5 já tinham sido antecipadas fora de ordem (analytics/DORA, gate
`implementavel`, QA-estratégia/appsec); esta é só metadado, sem ADR, sem
linha de código de produção.

`docs/gates.yml` (`paralelismo-autorizado`): `status: planned` → `active`,
com `evidencia` no MESMO formato do gate `implementavel` vizinho —
`event_types: [proposed_action.created/approved/denied]`, `filtro: {
actionType: parallelize }`, `onde:
request-parallelization.use-case.ts` (achado A1/B5 — o `fluxo.yml` já
dizia `ativo` desde o ADR 0053/FASE 14d, só o `gates.yml` ficou para trás).
`docs/fluxo.yml` ganhou mais três correções da auditoria, todas de citação
ou rótulo, nenhuma de comportamento: a máquina de estados do `dev` passou
de 4 para 5 estados (`awaiting_approval` entrou, Fase 12e/ADR 0052 — A3); a
citação de RN-160 saiu da entrada `backlog-promovido` do Arquiteto e foi
para onde ela realmente se aplica, a saída `handoff-duplo` (o botão
"Confirmar arquitetura pronta" que ela trava — A4); a citação de RN-161
saiu de `handoff-duplo` e virou nota na entrada do Dev Lead (é o passo de
ACEITAR o handoff que encadeia ativação de execução, não o duplo handoff
em si — A5); e a origem de `worktree-por-agente` do `dev` deixou de dizer
`harness` (`Engine.Dev.WorktreeManager` não é um dos 4 componentes do
papel `harness` — A8). `docs/explanation/backlog.md` também foi
atualizado: a linha do `gates.yml` desatualizado saiu da tabela de
pendências (fechada aqui), junto com o gate `implementavel` (B3, já
fechado pelo ADR 0090 antes desta onda, sem ninguém ter tirado da tabela)
e a parte de B7 (deployment frequency/lead time) que o `analise:funil`
(ADR 0089) já entrega de verdade — MTTR/change failure rate continuam de
fora, mas como lacuna PERMANENTE já declarada em `fluxo.yml`, não
pendência de engenharia.

Verificação: `pnpm --filter api validacao:gates -- --sem-banco` (registro
válido, sem `ativo-sem-evidencia`) e `pnpm docs:check` verdes. A fase 3 do
script (evidência real no event log) exige `--projeto <uuid>` contra um
banco com dados — fora do alcance desta correção, que é só de metadado.

**Pendentes do mesmo plano, não desta onda**: Onda 2 (delegação Dev Lead →
dev, RN-160 revalidada no backend) e Onda 6 (gate `necessidade-validada`,
que exige ADR e decisão de produto antes de codar).

## Auditoria fluxo.yml × código — Onda 2: RN-160 no backend e delegação Dev Lead → dev (RN-404/405, ADR 0094)
Segunda das seis ondas do plano da auditoria (seção D), os DOIS itens de
maior escopo depois da Onda 1 — os outros quatro (3, 4, 5 antecipadas fora
de ordem; 6 ainda pendente, exige ADR e decisão de produto). Os dois vivem
exclusivamente em `apps/api`; nenhuma mudança em `engine`/`web` foi
necessária.

**B6 — RN-160 revalidada no backend.** A regra ("Confirmar arquitetura
pronta" exige ao menos 1 história promovida) só era garantida no CLIENTE
(`SessionPage.tsx`, `hasPromotedStory`) — uma chamada HTTP direta a
`POST /agents/arquiteto/handoff-infra` ignorava a regra por completo.
`OfferInfraHandoffUseCase.execute` agora consulta
`StoryRepository.findByProject` e recusa com `BadRequestException` ANTES
de gravar o evento ou chamar o engine, quando nenhuma história tem
`status !== 'draft'`.

**B1 — a delegação Dev Lead → dev vira dado.** O ADR 0053 (item 5) já
previa isto e declarou fora de escopo à época — CLAUDE.md listava como
corte reversível. Fechado aqui: `AcceptParallelizationUseCase.execute`
(lado API, cobre os caminhos direto E aprovado de graça, porque os dois já
convergem nele) grava `delegations` com `area: 'dev'`, `leadAgent:
'dev-lead'`, `subagent` = o id do `dev-<modulo>` recém-ativado. Diferente
de QA/Infra (que gravam do lado ENGINE, porque é lá que o subagente produz
um parecer), `status: 'completed'` foi REDEFINIDO para esta área: significa
"a delegação foi EFETIVADA" (o agente subiu), não "parecer emitido" — e
`parecerArtifactId` aponta para o `artifact.module_map` mais recente do
projeto (via `SessionEventRepository.listByTypeForProject`, método já
existente, sem consulta nova). Sem module_map no projeto — não deveria
acontecer —, a delegação não é gravada com id falso: só loga o estado
inesperado e segue, porque a ativação do dev agent já é sucesso quando essa
gravação é tentada; falha em `RecordDelegationUseCase` também não derruba a
ativação, pela mesma razão. Decisão registrada no ADR 0094, que também
revoga o corte do ADR 0053 item 5.

`docs/fluxo.yml` (`dev-lead`, saída `delegacao`): `status: lacuna` →
`status: ativo, regra: RN-405`.

## Auditoria fluxo.yml × código — Onda 6 (última): o gate `necessidade-validada` (RN-406, ADR 0095)
Fecha a ÚLTIMA das seis ondas do plano da auditoria (seção D,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) — as seis fecharam: a 3,
4 e 5 tinham sido antecipadas fora de ordem (analytics/DORA, gate
`implementavel`, QA-estratégia/appsec, ADRs 0089/0090); a 1 e a 2
fecharam nos PRs anteriores (fluxo.yml/gates.yml em dia; RN-160 no
backend + delegação Dev Lead → dev). Esta é a 6ª: o gate
`necessidade-validada` (Criativo → PO), declarado `proposto` desde o ADR
0085 sem mecanismo nenhum atrás.

`modelo-de-time.md` já registrava por que ele ficou parado: o Criativo (o
modelo) decidir sozinho que a necessidade que ele mesmo produziu está
validada seria autovalidação, não gate de verdade. A decisão do dono do
produto foi confirmação humana SEPARADA — um terceiro botão em
`SessionPage.tsx`, "Confirmar necessidade validada", no MESMO padrão de
"Confirmar arquitetura pronta" (RN-160): rota dedicada
(`POST .../agents/criativo/validate-necessity`), caso de uso dedicado
(`ValidateNecessityUseCase`), evento próprio (`necessity.validated`).
Nunca reaproveitou `confirm_readiness`/RN-142 (que continua sendo só o
piso estrutural, "≥1 regra capturada") nem o aceite do handoff pelo PO
(`AcceptHandoffUseCase`, estrutural, sem julgamento de conteúdo).

O encadeamento escolhido: o botão só habilita DEPOIS que `confirm_readiness`
já consolidou o `artifact.product_brief` (`hasProductBrief`) — não faz
sentido "validar" um resumo que ainda não existe, e é a leitura mais
consistente com `docs/fluxo.yml` (o gate é de SAÍDA do Criativo, o
momento em que o trabalho dele já entregou um artefato concreto).
Diferente de `OfferInfraHandoffUseCase`, esta confirmação NÃO sinaliza o
engine — o handoff Criativo→PO já aconteceu dentro do próprio
`confirm_readiness`, então o evento novo é só o registro do MÉRITO, sem
gatilho nenhum esperando por ele.

`docs/gates.yml` ganha o gate `necessidade-validada`: `active`,
`aprovacao_humana: true`, mas `severidade: warn` — nada no produto hoje
CONSULTA a passagem deste gate antes de deixar o PO seguir, diferente dos
`block` de `story-promovida`/`plano-de-adocao`, que têm trava real de
código por trás. `docs/fluxo.yml` (`criativo`, `gate_saida`): `status:
proposto` → `status: ativo, regra: RN-406`.

## Auditoria fluxo.yml × código — B4 (a ÚLTIMA pendência): o PO lê métricas de produto (RN-407)
Fecha o item B4 — a última linha da tabela "Backlog do modelo de time
(ADR 0085)" em `docs/explanation/backlog.md`; a tabela fica VAZIA depois
desta correção, e a auditoria fluxo.yml × código termina aqui. Sem ADR
novo: segue o mesmo padrão já estabelecido pela RN-164 (leitura de agente
escopada ao projeto, sem efeito externo, sem `proposed_action`), só com
uma RN nova. `docs/fluxo.yml` (papel `po`, entrada `metricas-de-produto`):
`status: lacuna` → `regra: RN-407`.

O DADO já existia desde o ADR 0089 (`analise:funil` — funil real
sessão → commit → PR → merge, lead time real, deployment frequency real);
faltava só o PO conseguir LER esse relatório dentro do turno. Terceira
ferramenta de leitura do PO, `listar_metricas_de_produto`
(`GET .../product-metrics`), mesmo desenho exato das duas irmãs da
RN-164 — `:direct`, sem parâmetro, escopo fechado no projeto. As funções
de CÁLCULO puras e a query (`calcularFunil`/`calcularLeadTimes`/
`leadTimeMedioMs`/`deploymentFrequencyPorDia`/`buscarAcoesGitDoFunil`)
migraram de `apps/api/scripts/analise-funil.ts` para
`apps/api/src/application/services/funil-metrics.ts` — refatoração
MECÂNICA e necessária (`scripts/` não pode viver em `src/`, e `src/` não
importa de `scripts/`): o script passou a REEXPORTAR dali, sem mudar
assinatura nem comportamento, e o teste de regressão do script continua
verde sem ser tocado. O corpo JSON não tem campo para as três ausências
permanentes que o script já declarava só em texto (funil de produto
completo ideação → commit, evidência de adoção por feature, MTTR/change
failure rate) — a ferramenta do PO as cita pelo nome no TEXTO que devolve
ao modelo, sempre, para ele nunca concluir por omissão dos números que
não há lacuna.

## GOVERNANCE.md — o critério do modo `community`, não o mecanismo dele
Item do backlog anterior ("Modo community do approval-ladder") virou correção
de registro, não implementação: investigação confirmou que o modo `community`
já existe em código desde a FASE 6 (`scripts/ci/approval-ladder.ts`), testado
nos dois lados, só desligado por `APPROVAL_MODE=solo` (default). A frase do
backlog ("vira mudança de `aprovacao_humana` no registro de gates") vinha de
uma linha ESPECULATIVA do ADR 0054 — não editada, por regra, mas a imprecisão
está registrada em `docs/explanation/backlog.md`: `aprovacao_humana` do gate
`aprovacoes-da-escada` já é `true` fixo nos dois modos, sem campo nenhum no
schema do `Gate` que reaja a `APPROVAL_MODE`.

O que faltava de verdade era outro `TODO(humano)`, em
`docs/explanation/branching-policy.md`: o critério de quem entra em cada
lista de aprovadores (`devs`/`po`/`gestão`) — quem entra, quem sai, com base
em quê. `GOVERNANCE.md` (raiz do repo, novo) fecha isso: MECANISMO continua
em `branching-policy.md` (a escada, pessoas distintas, o passo a passo da
troca de variável), CRITÉRIO passa a morar em `GOVERNANCE.md`. É proposta,
não comitê em funcionamento — o projeto continua com um mantenedor só, e o
documento é explícito sobre isso: a maior parte dele descreve o que passa a
valer QUANDO houver mais gente, não uma estrutura já ativa. Regra `warn` nova
no docmap (`governanca`) cobra revisão quando `approval-ladder.ts`/
`branching-policy.md` mudam — separada da regra `block` existente
(`politica-de-branches`) pelo mesmo motivo que `checks-e-rulesets` é separada
dela: MECANISMO decorre do código, CRITÉRIO é decisão humana.

## SMTP real no MailSender (RN-408, ADR 0096)
Fecha o item de backlog aberto desde o corte do Keycloak (ADR 0032, "SMTP
real continua sendo config futura"). `nodemailer` sobre transporte SMTP
puro (protocolo de LINHA com estado/MIME/STARTTLS/AUTH, diferente das APIs
JSON HTTP que o resto do produto integra), atrás de `MAIL_TRANSPORT` — `log`
(default, INCLUSIVE em produção: enviar e-mail de verdade é opt-in do
operador) ou `smtp`, selecionado por `useFactory` em `AuthUseCasesModule`
sem tocar nenhum caso de uso (`RegisterUseCase`,
`RequestPasswordResetUseCase`, `LoginUseCase`, o script
`migrate-keycloak-users.ts` continuam só injetando `MailSender`).
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` seguem o padrão RN-114
em produção quando o modo é `smtp` — mas SEM o default público que as
quatro RN-114 originais têm, então a régua só entra quando o operador optou
por `smtp`; a validação roda no construtor de `SmtpMailSender`, exercitado
pelo `useFactory` na montagem do grafo de providers (mesmo desenho de
`CREDENTIALS_MASTER_KEY`), não por chamada eager em `main.ts`. Corpo em
TEXTO PURO, nunca HTML — a porta não carrega estrutura para corpo rico, e
um template engine seria superfície de injeção sem ganho nenhum.

Investigação achou uma lacuna real antes de codar: `email_verification` não
tinha rota web nenhuma — `verificarEmail` existia em
`apps/web/src/lib/auth.ts` desde a Fase 7a sem NENHUM chamador, então o
link do e-mail de verificação levaria a lugar nenhum assim que SMTP
passasse a mandar e-mail de verdade. `/verificar-email`
(`VerifyEmailPage.tsx`) fecha isso, espelhando `SetPasswordPage.tsx` — mesmo
padrão de `validateSearch` no `router.tsx`, mesma resposta única para link
inexistente/expirado/já usado — com uma diferença: sem formulário, a
confirmação dispara sozinha ao montar, então a tela precisa dos três
estados da RN-088 (carregando/erro/sucesso), não só dois.
## "N agentes online" no dashboard — status AO VIVO, nunca presença histórica (RN-409, ADR 0097)
Item do backlog anterior fechado. Investigação prévia confirmou que não
existia agregado de liveness nenhum, nem por projeto nem por workspace — só
presença HISTÓRICA (`RosterFacts`, "já apareceu alguma vez") e status ao
vivo de verdade só no cliente, derivado do event log, só quando um projeto
está ABERTO. `ProjectCardSummary.onlineAgentCount` soma dois mecanismos pela
MESMA régua ("não ocioso, não travado"): dev agents
(`engine.dev_agent_states.status NOT IN ('idle', 'idle_tripped')`,
agregado em lote no engine) e agentes conversacionais (último `agent.status`
da sessão mais recente com `status !== 'idle'`, `payload` que só aceita
`working`/`idle`/`awaiting_approval`). QA/SecOps nunca contam — não emitem
`agent.status`, veredito único por invocação, sem noção de "ocioso" entre
chamadas.

A decisão de arquitetura que vale registrar: a consulta lê
`engine.dev_agent_states` DIRETO, via SQL cru batelado por workspace, dentro
do MESMO `Promise.all` que já soma onze consultas do read model de RN-090
(DOZE → CATORZE, ainda CONSTANTE) — em vez de abrir uma rota HTTP interna
nova no engine. `api` e `engine` compartilham o MESMO banco físico,
separados só por schema Postgres, e já havia precedente
(`apps/api/scripts/medir-execucao.ts` já lê `engine.oban_peers`); esta
decisão eleva o padrão de script manual para código de produção TESTADO
(fixture mínima e declarada da tabela do engine em
`test/support/global-setup.ts`). Consequência aceita e declarada no ADR
0097: a consulta pressupõe que quem opera o produto migra os dois lados
juntos (`db:migrate` E `engine:migrate`), e falha alto/visível se só a api
migrou — sem try/catch escondendo o erro.

## Sessão de execução não fecha mais com dev agent pendente (RN-411)
Correção de defeito achado numa sessão de execução REAL, não item de
roteiro: cinco dev agents subiram, ficaram `idle_tripped` (RN-047, o
circuit breaker) travados esperando o usuário desbloquear tarefa a
tarefa, e o heartbeat de 30s da sessão (`Engine.Sessions.SessionServer`)
fechou a sessão por baixo enquanto o desbloqueio manual continuava. O
terceiro sinal de `GetSessionPendingWorkUseCase` (RN-064) só lê
`agent.status`, vocabulário dos agentes conversacionais — dev agents
falam `dev.*` (`Engine.Dev.AgentIo`) e nunca emitem `agent.status`, então
nenhum dev agent jamais segurava a sessão por esse sinal. O quarto sinal
lê o último evento `dev.*` de cada `dev-<modulo>`/`dev-<modulo>-2` na
sessão: `dev.working`/`dev.blocked`/`dev.idle_tripped` seguram a sessão
(travado esperando decisão humana É trabalho pendente); só `dev.idle`
(drenado de verdade) não segura. `dev.awaiting_gate`/`dev.awaiting_approval`
ENTRARAM na régua pela RN-412 — ver abaixo; a lacuna residual que este
parágrafo descrevia foi fechada.
## Workspace pessoal automático no cadastro (RN-410)
Achado navegando: o botão "Novo projeto" do dashboard não fazia NADA, sem
erro. Causa raiz: `RegisterUseCase` e `SocialLoginCallbackUseCase` (no ramo
que provisiona conta nova) criavam usuário e credencial mas NUNCA um
workspace — TODO cadastro novo caía nessa parede, e só não aparecia antes
porque `seed.ts` sempre cria um workspace junto dos dados de demonstração.
Os dois pontos agora criam o workspace e adicionam o usuário como `owner`
na MESMA transação que já cria a conta. Nome/slug saem de uma função pura
única, `nomeESlugDoWorkspacePessoal` (`domain/auth/personal-workspace.ts`),
para a regra não divergir em dois arquivos; o slug é sempre sufixado com
`userId.slice(0, 8)` (mesmo padrão de `extraDevAgentId`) para ser único
sem round-trip ao banco (RN-410).

## 413 nas PRs e Executores "sem execução" — as duas pontas e o encadeamento (RN-412, ADR 0098)
Não é fase planejada: correção pedida por USO real ("nas PRs sempre está
estourando entity too large") mais o defeito irmão da aba Executores
aparecer vazia com trabalho real rolando. Investigação achou os dois
encadeados: o gate morre com `413` → devs ficam presos em
`dev.awaiting_gate` → esse estado não segurava a sessão (lacuna da
RN-411) → o heartbeat de 30s fecha a sessão por baixo → a aba exige
sessão ativa e some com o roster inteiro.

**A causa do 413 era da API do Brabo, não do provider de LLM** — os
comentários que atribuíam o erro ao provider (`runtime.exs`,
`terminal_executor.ex`, `docker-compose.yml`) estavam errados;
`FalhaDeTurno.origem({413, _})` já classificava como `"codigo"`, e
estava certo. `apps/api/src/main.ts` nunca configurou limite de body do
Express — valia o default de 100 KB, muito abaixo dos 8 MB que o
Phoenix aceita, no sentido mais pesado do transporte (engine → api,
`POST /internal/sessions/:sessionId/llm-turn`, que reenvia o histórico
INTEIRO a cada iteração do ToolLoop). `API_JSON_BODY_LIMIT` (default
10 MB) fecha a ponta do transporte.

A segunda ponta, sem a qual subir o limite só adiaria o estouro: o
`ContextManager` do engine (ADR 0098) tinha DOIS defeitos que
mantinham a compactação inalcançável antes do corpo estourar —
`estimate/1` contava só `content`, então mensagens de `assistant`
cheias de `toolCalls` custavam ~zero tokens na estimativa; e a janela
de compactação usava só `context_window` (128.000 tokens nos agentes
de gate), o que dava ~350 KB antes de compactar — bem depois de
qualquer teto de transporte razoável. A janela EFETIVA agora é
`min(context_window, teto_de_transporte)`, com o corte sempre em
FRONTEIRA DE ITERAÇÃO do ToolLoop (nunca separando um `assistant` com
`toolCalls` dos `role: "tool"` que o respondem — quebraria o protocolo
de tool-use do provider).

**RN-412** estende a RN-411: `DEV_PENDING_TYPES` ganhou
`dev.awaiting_gate` (o argumento original — gate pode morrer e travar
o dev agent nesse estado indefinidamente) e também
`dev.awaiting_approval`, por um argumento novo achado na investigação:
a decisão de aprovação grava `proposed_actions.status` de forma
SÍNCRONA, mas a retomada do dev agent via outbox/Oban é ASSÍNCRONA —
na janela entre as duas, nada segurava a sessão, o mesmo defeito da
RN-411 um nível mais fundo.

**A aba Executores/Visão Geral** tinham o defeito irmão do lado web:
`executionActivated` era derivado de `events.some(...)` sobre a janela
de só 200 eventos de `useSessionEvents` — `execution.activated` é dos
PRIMEIROS eventos de uma sessão e saía da janela em qualquer execução
real, apagando o roster inteiro. O valor correto já existia, agregado
sobre TODOS os eventos, no resumo do workspace (RN-090,
`projects-summary.repository.ts`) — as duas telas passaram a consumir
esse valor. Achado de bônus no caminho: `ExecutionSection` (Visão
Geral) recalculava `activated` de novo, independentemente, sobre a
mesma janela — uma execução longa voltava a oferecer "Ativar execução"
como se nunca tivesse começado; corrigido junto. `gatesEverOpened`
sofre da MESMA classe de defeito e ficou DECLARADO como limitação
conhecida, não corrigido aqui — corrigi-lo exigiria mudar a assinatura
de `deriveAgentRoster`/`rosterFactsFromEvents`, fora do escopo desta
correção pontual.

## Neo4j como grafo de conhecimento — a fundação (RN-413/414/415, ADR 0099/0100)
Pedido do dono do produto: Neo4j + `ollama-model-loader` (gemma:1b,
yi-coder:1.5b, nomic-embed-text), inspirado explicitamente no repositório
[ErickWendel/neo4j-ai-experiments](https://github.com/ErickWendel/neo4j-ai-experiments)
— agradecimento registrado no ADR 0099 e em `prompts/README.md`, pela
inspiração concreta do padrão "prompt como arquivo versionado, não string
presa no código" e do grafo como memória de agentes.

Duas responsabilidades, uma fundação: **templates de prompt versionados**
(`PromptTemplate`/`PromptVersion`, idempotente por hash — RN-413) e
**memória relacional** (interações, hipóteses do Psicólogo com evidência,
perfis da Anamnese, handoffs — consumo real é onda futura, esta entrega
só constrói o mecanismo). O grafo é memória DERIVADA, nunca fonte de
verdade; pgvector continua sendo o índice vetorial dos chunks, sem
duplicar embedding em dois bancos. Driver `neo4j-driver` na api (não no
engine) — a api já é dona de toda persistência e do RAG, o engine
consome por HTTP interno com service token, como sempre.

`rag_search` (RN-414) fecha o maior vão do RAG existente: nenhum agente o
consultava, só a aba web "Chat RAG". Tool nova no engine, tetos próprios
(RN-150), degradação sempre visível no início do texto ao modelo.
`ollama-model-loader` (RN-415) fecha um bug real separado: `nomic-embed-text`
nunca era puxado automaticamente e o RAG degradava pra léxico-only em
silêncio em qualquer ambiente limpo.

Primeira leva de templates extraída para `prompts/*.md` (ux-designer,
Psicólogo, Anamnese, sumarização do `ContextManager`).

## Consumo do grafo — templates sem tocar GenServers, relevância sem substituir recência (RN-416/417, ADR 0101)
`InstructionFiles` ganhou fonte `:graph` (`db > graph > dir > root` —
o `instruction_patch` do usuário continua vencendo tudo), e TRÊS agentes
passaram a TENTAR resolver template do grafo antes do texto inline, que
virou fallback obrigatório: ux-designer (`graph_instruction_templates_enabled?`),
Psicólogo e Anamnese (`graph_templates_enabled?`, mesma chave pros
dois). Duas flags, não uma — colidiriam com defaults CONTRÁRIOS entre
frentes paralelas se dividissem a chave; os dois defaults são `false`.
Só `context-manager-summarize` (dos quatro templates da leva) ficou sem
consumidor à época — lacuna que a ADR 0101 declarou aberta e que fechou
depois, pelo QUARTO consumidor da MESMA `graph_templates_enabled?`: o
prompt de sumarização do `ContextManager` (`prompt/1`, ver a RN-417).

`Psychologist.ContextBuilder`/`Anamnese.ContextBuilder` ganharam uma
SEGUNDA fonte de contexto — `rag_search`, com query derivada do gatilho
da análise — em COMPOSIÇÃO com a leitura de recentes/janela temporal de
sempre, nunca em substituição: sem hit, o comportamento é idêntico ao de
antes. Os trechos entram no orçamento EXISTENTE de `Triage`, e
`degraded: true` do RAG é sempre visível no contexto, nunca escondido.

O grafo se escreve sozinho: `GraphProjector` (api) drena uma SEGUNDA
linha de outbox (`aggregateType: 'graph_projection'`, mesma transação,
valor que o filtro do engine — `IN ('session', 'task')` — nunca casa,
evitando a corrida com o `Engine.Outbox.Drain` que já drena `'session'`
em ~2s) e chama os casos de uso de gravação já existentes. O engine
NUNCA escreve no grafo direto — preserva o event log como única fonte de
verdade; o grafo é reconstruível por replay.

**Achado real durante a verificação, registrado porque ensina**: o teste
de body limit da RN-412 (`apps/api/test/main.spec.ts`) tinha um bug
LATENTE — `AppModule` importado ESTATICAMENTE no topo do arquivo avalia
`DrizzleModule` (que cria seu pool de conexão em escopo de MÓDULO, não
numa factory do Nest) ANTES do `beforeAll` conseguir apontar
`DATABASE_URL` pra base de teste. Ficou mascarado enquanto a base de dev
local também estava migrada (mesma tabela, então a query "achava" mesmo
apontando pro lugar errado); destravou assim que a base de dev foi
recriada vazia (pelo teste de fumaça real desta própria onda contra
Neo4j+Postgres). Corrigido com `await import(...)` DINÂMICO dentro do
`beforeAll`, depois do `DATABASE_URL` já setado — é o padrão a seguir
sempre que um teste precisa redirecionar `DATABASE_URL` para um
`AppModule` real.

