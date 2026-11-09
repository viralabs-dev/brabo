---
traducao_de: c165be09458a5dfdc42010867a29adf8a36ccd99
id: rn-produto-parte-01
title: 'Business rules — Product — part 1 (from RN-012)'
sidebar_label: 'Produto — part 1 (from RN-012)'
description: 'The RNs hosted in the product root.'
keywords: [business rules, product]
---

# Produto — part 1 (from RN-012)

## Backlog

### RN-012 — A module removed from `module_map` demotes the story {#rn-012}

A story linked to a module that ceased to exist goes back to `draft`, with
a `backlog.story_demoted` event.

- **Where:** `apps/api/src/domain/architecture/module-resolution.ts`; the
  event is emitted in
  `application/use-cases/architecture/create-module-map.use-case.ts:73`
- **Test:** `test/domain/architecture/module-resolution.spec.ts`

## Projects panel

### RN-096 — Every decision says in plain language what happens; the raw payload is born collapsed {#rn-096}

Every `proposed_action` type has a **sentence in Portuguese** describing the
effect of approving, and it is the first visible thing on the card — before any
detail, on the three screens where a decision is asked for (the Approvals queue, the card
inside the session chat, and the Insights tab). The raw payload remains accessible,
**inside a collapse that is born closed**, and is never dumped on the screen.

**What existed was a dump.** Every type without its own visual body fell into an
`Object.entries(payload).map(([k, v]) => k + ': ' + JSON.stringify(v))`, always
open. Whoever opened the queue read `worktree: /workspaces/dev-api`,
`coAuthor: Brabo User <user@brabo.dev>`, and `proposto: 4` — and had to deduce what
would happen if they clicked Approve. Approval that requires deduction is
approval given on autopilot, and the whole product rests on the user
being the final authority.

**The sentence degrades, and that's what makes it reliable.** None of them assumes that
a payload key exists: with an empty payload the sentence is still a true
sentence, just less specific ("Records a commit in the project's
repository."). The payload comes from the engine and from ten different use cases, and none
of them promises a format — a sentence that only works with the right fixture is a sentence
that breaks on the first real approval.

**A type the web doesn't know yet is not a theoretical case.** The web's `ActionType`
union has already fallen behind twice: first with the three Gitflow bootstrap
types, and again with `parallelize`/`raise_max_parallel`, which came in during PHASE
14d. The compiler doesn't catch it: the canonical list is in `apps/api`, which the web doesn't
import. Hence two things at once — the card **degrades** (neutral verb
+ "see details", with the payload collapsed, instead of the `undefined` in the
icon map that took down the whole React tree), and the **test reads the backend's
`decide.ts`** and fails when a type comes in without a sentence.

**The open/closed default is derived, not configured.** The rule is a single one —
it opens what is still waiting for a decision from whoever is looking: in the chat, a `pending` action;
in the queue, never (there are N cards, and N open details are the same wall of text);
in Insights, a `proposed` hypothesis. And the RAW payload doesn't open in any variant.
The project consequence is that `ApprovalCard` **gained no new mandatory
prop**: the default comes from `variant` and `status`, which already existed.

**Verb and sentence come from a single module**, consumed by the three screens. The Psicólogo's
hypothesis literally uses the `instruction_patch` verb instead of a
parallel vocabulary — and its sentence says what accept really does
(queues it for the Anamnese, which **may** propose the adjustment, which still comes for
approval), never "the instruction will be changed".

**`write_file` had a sentence, but no body.** It was born outside
`COM_CORPO_PROPRIO`: the sentence showed only the `path`, and the detail fell into the same
collapsed raw-JSON dump this RN exists to avoid — so a write
that genuinely asked for approval (outside the `dev-` prefix, or a path outside the
agent's scope) required one more click to see the `content`. It entered
`COM_CORPO_PROPRIO` with its own body: `path` and a preview of the `content` (up to
25 lines/4,000 characters, with a truncation notice — never the entire
file, same rule as the raw payload), open by default in the chat while
pending, like `terminal`.

**An empty payload is not an absent payload.** `command` (terminal) or
`path`/`content` (write_file) arriving as an empty string — a malformed tool call
from the model, not a rendering bug — degraded into a `$ ` prompt
or a blank preview, which the user read as a screen defect. The two
bodies now distinguish the two cases and show "the model did not produce a
valid X for this action" instead of a blank.

- **Where:** `apps/web/src/lib/aprovacoes.ts` (`VERBO_DA_ACAO`, `fraseDaAcao`,
  `descreverAcao`, `descreverHipotese`), consumed by
  `apps/web/src/components/ApprovalCard.tsx` (Approvals + session chat,
  `COM_CORPO_PROPRIO`, `previewConteudo` for the `content` `write_file`) and
  `apps/web/src/components/HypothesisCard.tsx` (Insights); collapse via the
  `Disclosure` of `apps/web/src/components/ui/Disclosure.tsx`
- **Test:** `apps/web/src/lib/aprovacoes.test.ts` (reads `ACTION_TYPES` from
  `apps/api/src/domain/actions/decide.ts` and requires verb + sentence for each type,
  with an empty payload); `apps/web/src/components/ApprovalCard.test.tsx`
  (`frase e colapso` — payload collapsed in both variants, readable JSON on
  opening, an unknown type doesn't take the screen down, `write_file` with its own body
  open by default and preview truncation, empty `command`/`path`/`content`
  showing the fallback message);
  `apps/web/src/components/HypothesisCard.test.tsx` (`frase e colapso`)
- **Origin:** PHASE 19 of program 16–26, from the request "today reading is very
  hard" on the first real navigation after the database reset

---

## "N agents online" on the dashboard — LIVE status, never historical presence (RN-409, ADR 0097)

An item from the previous backlog. Prior investigation (`docs/explanation/backlog.md`)
confirmed that there was no liveness aggregate at all — neither per project, nor
per workspace: what existed was only HISTORICAL presence
(`RosterFacts` — "has appeared in the session at some point") and REAL live status
only on the client, derived from the event log, and only when a project is
OPEN (`deriveAgentRoster`). The dashboard card today forced
`() => 'ocioso'` because it drew no status at all — that's the hardcode
this RN replaces.

### RN-409 — "N online" adds two mechanisms by the SAME ruler: not idle, not tripped {#rn-409}

`ProjectCardSummary.onlineAgentCount` (`GET /workspaces/:workspaceId/
projects-summary`) is the count of agents ONLINE now — working or with
a pending item waiting for a decision —, never team size. Calling
"online" a number that is really "has appeared at some point" would be misleading
(same principle as [ADR 0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/
[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)/
[0077](../../adr/0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) against faked
data).

Two SOURCES, one ruler:

- **Dev agents** — `engine.dev_agent_states.status`, aggregated in batch by
  `project_id` (`status NOT IN ('idle', 'idle_tripped')`). `working`,
  `awaiting_gate`, and `awaiting_approval` count (RN-047/ADR 0052 — the five
  states of the dev's machine); `idle`/`idle_tripped` don't. `dev-<modulo>` and
  `dev-<modulo>-2` are DISTINCT keys (`agent_id` in the table), so they count
  separately with no effort at all — it's the primary key itself that already separates them.
- **Conversational agents** (criativo/po/arquiteto/dev-lead/ux-designer/
  staff/infra) — the last `agent.status` event of each `actor_id`, in the project's MOST
  RECENT session (the same session scope the rest of `RosterFacts`
  uses, RN-090). `agent.status` has only three possible values
  (`Engine.Sessions.LiveBroadcast.agent_status/4` refuses any other):
  `working`/`awaiting_approval` count, `idle` doesn't.

**QA/SecOps NEVER count** — it isn't a filter, it's an ABSENCE of data: neither of
the two emits `agent.status` (they run a single verdict per invocation, with no notion of
"idle" between calls — their status comes from `pr.gate_changed`/
`infra.gate_changed`, a separate mechanism that `deriveAgentRoster` already handles
separately). No explicit exclusion was needed: the query only sums what has
the right event type.

The ruler is the SAME that `deriveAgentRoster` would already apply if the project were
open (`'trabalhando'`/`'aguardando'` on the client ≅ `working`/
`awaiting_gate`/`awaiting_approval` on the backend) — BOTH paths compute
"online" from the same eventual state (event log/persisted state
table), only by different MECHANISMS (SQL aggregation on the backend,
a fold over already fetched events on the client), in the same spirit as
`infraActive`/`uxDesignerActive`/`staffActive` (RN-090/RN-287: two sources,
one ruler). There's no shared function between `apps/api` and `apps/web` for
this — the two already diverge in language/runtime for the rest of `RosterFacts`
too, and introducing a shared package just for one count would be
a heavier weight than the problem.

**A new query against a schema the api doesn't migrate.** `engine.dev_agent_states`
is an ENGINE table (Ecto, Postgres schema `"engine"`), same physical database,
same connection — not a second data source, a second NAMESPACE in the
same Postgres. The precedent already existed: `apps/api/scripts/medir-execucao.ts`
already reads `engine.oban_peers` the same way (raw SQL via Drizzle), only
as a manual SCRIPT, never tested. This RN raises the pattern to tested PRODUCTION
code — see [ADR 0097](../../adr/0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md)
for the decision NOT to expose this as an internal HTTP route in the engine.

**Cost measured, not pretended free.** The two new queries take the read
model's total from TWELVE to FOURTEEN (RN-090 still holds — fourteen is
CONSTANT, proven by `projects-summary.repository.spec.ts` counting trips
to the database with 2 and with 20 projects). Neither has a time `WHERE` — the
`agent.status` one scans the same `session_events` of the most recent sessions
that `lastEvents`/`marcos` already scan next to it, so the marginal cost is
that of one more `type` filter over a query plan that was going to happen anyway,
not a new table being scanned from scratch. DECLARED gap: there's no recent
real execution (dogfooding) with production volume to measure real `ms`
against the Phase 22 ruler (525 thousand rows, `EXPLAIN ANALYZE`) — the two
new queries remain without a measured number, only the structural argument above.

- **Where:** `apps/api/src/application/ports/projects-summary-repository.port.ts`,
  `apps/api/src/infrastructure/persistence/drizzle/projects-summary.repository.ts`,
  `apps/api/src/interfaces/http/iam/dto/iam.response.dto.ts`,
  `apps/web/src/lib/api-types.ts`, `apps/web/src/components/ProjectCard.tsx`,
  `apps/web/src/routes/Dashboard.tsx`
- **Test:** `apps/api/test/infrastructure/persistence/drizzle/projects-summary.repository.spec.ts`
  (`describe('onlineAgentCount (RN-409)')` — dev agent working/idle/
  idle_tripped, awaiting_gate/awaiting_approval, two instances of the same
  base agent, conversational agent working/idle/awaiting_approval, only the
  LAST `agent.status` counts, QA/SecOps never count, sum between the two
  sources, isolation between projects);
  `apps/api/test/support/global-setup.ts` (`ensureEngineFixture` — the engine's
  table created as a MINIMAL and declared fixture, only so the test above
  can exist);
  `apps/web/src/components/ProjectCard.test.tsx` (the "N online" badge disappears with
  `0`/`undefined`, appears with `onlineAgentCount > 0`)
- **Origin:** `docs/explanation/backlog.md` (item inherited from PHASE 13c/
  the dogfooding harvest); product decision that the number had to be
  real liveness, not historical presence, recorded in the prompt that
  commissioned this fix

---

## The Runner's folder explorer becomes three columns, and creating a `runner` project no longer waits for the final step (RN-436/436)

### RN-451 — The standalone binary smoke runs the real SUBPROCESS, never a mock {#rn-451}

The same discipline pattern that `smoke-dist.mjs` (ADR 0106) already applies to
the `dist/index.cjs` published to npm now also applies to
`dist-bin/brabo-runner-<platform>-<arch>[.exe]` (ADR 0112): no suite
proves that a PACKAGED artifact works by reading its source code — only by
executing the real artifact, as a subprocess, and observing real
output. `scripts/smoke-bin.mjs` runs the COMPILED binary (never
`node src/index.ts` nor any non-compiled form) with `--self-test-pty`
— an internal flag, not documented in `uso()` — which resolves `node-pty`
exactly as production does and spawns a real PTY via `GerenciadorDePty`,
writing to and reading from it. Only the line `node-pty carregado com sucesso` +
`SELF_TEST_PTY_OK:` in the real process's stdout counts as proof; no
mock of `node-pty` nor of `child_process` is acceptable for this specific
test, because what it exists to prove is precisely that the embedded native `.node`
(`with { type: 'file' }`, `native-pty-embed.generated.ts`)
loads and works INSIDE the binary — mocking any piece of the path
would erase the only thing the test needs to prove.

- **Where:** `apps/runner/scripts/smoke-bin.mjs`; `apps/runner/src/index.ts`
  (`rodarAutoTestePty`, the implementation of `--self-test-pty`)
- **Test:** `smoke-bin.mjs` itself — there's no unit test that
  replaces it, on purpose (it's the same design as `smoke-dist.mjs`, which
  also has no unit counterpart)
- **ADR:** [0112](../../adr/0112-binario-standalone-do-runner-via-bun-build-compile.md)
- **Origin:** explicit requirement from the product owner for this backlog
  item ("no mocking")

---

## Local runner terminal stuck at "Opening terminal..." forever (RN-433)

### RN-453 — A relative local runner `--dir` resolves against `INIT_CWD`, not against pnpm's rebased cwd {#rn-453}

`resolve(dirBruto)` in `lerArgumentos()` resolved a relative `--dir` against
`process.cwd()` — correct when the CLI runs directly (standalone binary,
`npm install -g @brabo/runner`), but WRONG in the only invocation path
that exists today without a real npm publication (a real finding, ADR 0106/backlog):
`pnpm --filter runner start` REBASES `process.cwd()` to the PACKAGE's
folder (`apps/runner`), not the folder from which the user typed the command.
`pnpm --filter runner start -- --dir ../exp001`, run from `~/dev/brabo`,
created `~/dev/brabo/apps/exp001` instead of `~/dev/exp001` — silently,
with no error, because RN-435 already makes a nonexistent `--dir` get created instead of
refused.

`resolverDir()` (`apps/runner/src/guard.ts`) resolves against `INIT_CWD`
when present — the variable that npm/pnpm ALWAYS defines with the original
invocation folder, existing only when the process is born from a
`package.json` script — and falls back to `process.cwd()` when absent (direct
binary, where it's already the right folder). Node's `resolve()` already ignores the base
when `dirBruto` is absolute, so an absolute path (the case documented in the
README) doesn't change behavior.

- **Where:** `apps/runner/src/guard.ts` (`resolverDir`), `apps/runner/src/index.ts` (`lerArgumentos`)
- **Test:** `apps/runner/src/guard.spec.ts` (`describe('resolverDir', …)`
  — relative against `INIT_CWD` when present, falls back to the process's cwd
  when absent, absolute ignores both bases)
- **ADR:** [0104](../../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)
  (additive extension, same category as RN-435 — it reduces invocation friction,
  it doesn't change the runner as source of truth of the path)
- **Origin:** found in real use, running `pnpm --filter runner start --
  dir ../exp001` from inside the monorepo checkout — the only invocation
  path available today, because `@brabo/runner` hasn't really been published
  on npm yet (`NPM_TOKEN` pending, see ADR 0106's backlog)

---

## RAG search leaves a trace, and the trace freezes the weights (RN-479..481)

### RN-481 — `rag.search`/`rag.feedback` are timeline NARRATION, and only exist when there's a session {#rn-481}

The two events enter the event log **only on the agent's path** — the tab's search
is a project one and has no session in which to narrate. That's a declared asymmetry,
not a gap: **the table is the measurement's source, the event is narration**. Measuring through the
event log would lose half of the searches, and precisely the half with human
judgment.

A narration failure takes down neither the search nor the vote: the table's row is already
written, and it's what the measurement reads. The failure becomes a log with origin `infra`, never
silence.

`'rag'` enters `PREFIXOS_DE_EVENTO` (`scripts/docs/generate.mjs`) in the same
commit — without it the generated inventory of `docs/reference/events.md` doesn't see
the two types, and `pnpm docs:check` would be green over an incomplete list:
a doc that passes while lying is worse than a doc that fails.

- **Where:** `apps/api/src/domain/rag/rag-telemetry.ts`
  (`EVENTO_RAG_SEARCH`/`EVENTO_RAG_FEEDBACK`),
  `apps/api/src/application/use-cases/rag/hybrid-search.use-case.ts`,
  `apps/api/src/application/use-cases/rag/record-rag-feedback.use-case.ts`,
  `scripts/docs/generate.mjs` (`PREFIXOS_DE_EVENTO`)
- **Test:**
  `apps/api/test/application/use-cases/rag/hybrid-search.use-case.spec.ts`
  (narrates with a session; does NOT narrate without a session),
  `apps/api/test/application/use-cases/rag/record-rag-feedback.use-case.spec.ts`
  (the same pair, for the vote)
- **ADR:** [0129](../../adr/0129-telemetria-de-busca-do-rag-como-tabela.md)
- **Origin:** the product owner's plan, Part 2 / Stage 1

### RN-485 — The container broker doesn't accept a specification: it receives a project and COMPOSES {#rn-485}

The broker (`apps/broker`) is the only process of the product with access to a Docker
daemon on the server. The rule that makes it non-arbitrary isn't an allowlist: it's the
**shape of the input**.

**It receives `projectId` and one of the five operations — nothing else.** The five are those
of the `DockerPort` of [ADR 0128](../../adr/0128-porta-de-docker-e-a-prova-de-empacotamento.md)
(`start`, `stop`, `remove`, `inspect`, `exec`), and a sixth is a product decision
with an ADR, never one more parameter. `start`, `stop`, and `remove` have an EMPTY body;
`exec` takes a command and `cwd`, and nothing else.

**The specification is read from the api and COMPOSED here.** The broker calls
`GET /internal/projects/:projectId/container-spec`, which returns the project's
identity, execution mode, and the Arquiteto's current image decision. Image,
network, resources, and the single mount come from there. There's no field where one writes
`privileged`, `cap_add`, `network: host`, or a free `-v` — because there's no
field. If the specification traveled in the body, the containment of a
root-equivalent process on the host would depend on the CALLER being correct, and containment that
depends on the caller isn't containment.

**It revalidates what the api returned, and the two validations aren't the same.**
`validarDecisaoDeImagem` (api) asks "is this architecture decision
reviewable?" — it requires `rationale`, refuses `latest`, applies `RECURSOS_MAXIMOS`, and
returns the refusal to the MODEL through the tool-result (RN-061). `especificacaoValidada`
(broker) asks "can I hand this to the daemon?" — it's the PARSE of an untrusted
JSON into the closed type. The ceilings here are the BROKER's, the last
resort it never exceeds wherever the request comes from; today the numbers
coincide with the api's on purpose, and if one day they diverge the smaller wins without
anything breaking, because neither of the two claims to be the other. One check exists only
on this side: an image reference starting with `-` would be read by the CLI as a
FLAG, and `execFile` without a shell solves COMMAND injection, not ARGUMENT injection.

**The api sends no PATH at all.** The `-v` of a `docker run` is resolved by the
DAEMON, against the HOST's filesystem — a path from inside the api's container
would make the daemon create and mount an EMPTY folder, with the dev agent working in a
directory with no code and nothing indicating why. The broker composes the path with
`PROJECT_WORKSPACES_HOST_ROOT`, ITS configuration, plus the `workspaceDirName`
frozen at creation (RN-109). Without that variable, `start` REFUSES naming it; the
other four operations keep working. Refusing is the rule: guessing
would produce the empty mount silently.

**A `mounted`/`runner` project is refused with 409**, because their folder lives on the
user's machine and the broker's host doesn't see it — there, whoever brings up the container is the
runner. It's the same policy `RegistrarTransicaoDeContainerUseCase` already applies
in the api, stated where the broker can state it.

**Nothing triggers a startup.** There's no loop, no queue, no `container_start`
`proposed_action`: the broker acts when called, and the only caller that exists
today does a READ. External effect still requires approval.

- **Where:** `apps/broker/src/operacoes.ts` (the five, and the composition in
  `especificacaoDoProjeto`), `apps/broker/src/servidor.ts` (the closed list of
  routes and the status table),
  `packages/docker-port/src/spec-de-container.ts` (the parse and the ceilings),
  `apps/api/src/application/use-cases/containers/obter-spec-de-container.use-case.ts`
  (what the api returns, and the path it doesn't return),
  `apps/api/src/interfaces/http/internal/internal-containers.controller.ts`
- **Test:** `apps/broker/src/servidor.spec.ts` (image, network, resources, and mount
  sent in the body are IGNORED; an artifact with an image starting with `-` is 422
  and nothing is touched; a sixth operation is 404; a `cwd` outside `/work` is refused,
  including `/workspace`; without `PROJECT_WORKSPACES_HOST_ROOT` the `start` refuses
  saying which variable is missing),
  `packages/docker-port/src/spec-de-container.spec.ts` (the parse field by field),
  `apps/api/test/application/use-cases/containers/spec-e-observacao-de-container.use-case.spec.ts`
  (the api returns no path at all, nor `rationale`),
  `apps/api/test/infrastructure/http-clients/container-broker.client.spec.ts`
  (`start` sends an empty body)
- **ADR:** [0130](../../adr/0130-broker-de-container.md)

### RN-497 — `brabo-runner` brings up the project's container ON THE USER'S MACHINE, with THEIR Docker {#rn-497}

Closes the half that RN-494 (ADR 0135) left declared: `mounted`/`runner`
came to REQUIRE a decided image (RN-105's gate applies in the three modes),
but still brought up NO container — only `execution_mode: container`
had someone (the broker, `apps/broker`) capable of really calling Docker.
`container_start`/`container_stop`/`container_remove` (RN-491/495) now have
a SECOND execution path, branched by the project's `executionMode`
inside `ExecuteContainerStartUseCase`/`ExecuteContainerStopUseCase`/
`ExecuteContainerRemoveUseCase` — never in the action's PROPOSAL nor APPROVAL,
which remain mode-agnostic (`decide.ts` doesn't change).

**`container` goes through the broker, with no change at all.** `mounted`/`runner`
ask the ENGINE (`ApiToEngineClient.startContainerViaRunner`/
`stopContainerViaRunner`/`removeContainerViaRunner`, synchronous like
`executeTerminalAction`) to pass on to the connected RUNNER — the CLI that already
keeps the `terminal:<projectId>` channel (ADR 0103/0104) gains THREE new event
pairs, `container_start`/`_result`, `container_stop`/`_result`,
`container_remove`/`_result` (`apps/runner/src/channel.ts`), in the SAME mold
as `exec`/`exec_result`: `Engine.Runners.RunnerRouter` dispatches to the channel
correlated by `ref` and stays blocked on `receive`, the runner calls
`DockerViaCli.start/stop/remove` (`@brabo/docker-port`, ADR 0128) with the
USER'S DOCKER — not the server's — and answers. `EngineWeb.
ContainerCommandController` (routes `POST internal/projects/:projectId/
containers/{start,stop,remove}`) is the only caller; no other path
reaches those three operations on the engine side.

**The image that comes up isn't ELECTED again** — unlike the
`container` path, which reuses `DecidirImagemDoProjetoUseCase` to write a new
version of `artifact.project_image`. The `mounted`/`runner` path only READS the
CURRENT decision (`ObterSpecDeContainerUseCase`, the SAME use case that already
composes `GET .../container-spec` for the broker — called directly, without HTTP,
because both run in the api's process) and sends it to the runner; without a decided
image (RN-105), it fails BEFORE asking the engine.

**"No runner connected" is a NORMAL FAILURE, never a generic exception** — the same
discipline as `BrokerIndisponivelError`/`BrokerRecusouError` on the
`container` path. `RunnerNaoConectadoError` (no runner, or timeout) and
`RunnerRecusouContainerError` (the runner answered and REFUSED — Docker
unavailable on the user's machine, invalid specification) are the two
classes `HttpApiToEngineClient` throws; the three use cases catch them
and write `failed` with the reason, never letting them propagate. On the engine side, the
response is ALWAYS 200 — `sucesso: false` in the body, with `motivoCodigo`
("not_connected"/"timeout") only when the engine DIDN'T EVEN GET to ask the
runner (`RunnerRouter` returned `{:error, _}`), never an HTTP error status
for what is a normal failure of the command.

**`Engine.Actions.TerminalExecutor` did NOT gain a new output.** The decision
"run the command on the host or inside the container this runner brought up" is
INTERNAL to the runner — `decisao_de_execucao/1` already routes UNCONDITIONALLY
every command of a connected `runner` project to `RunnerRouter.exec/4`
(RN-423). What changes is only `apps/runner/src/index.ts`: `EstadoDoRunner` gains
`containerAtivo` (the NAME of the container THIS runner brought up, or `null`), and
`tratarExec` now routes to `DockerViaCli.exec` (via `docker exec`)
when there's an active container, or to the usual path (`executarComando`
directly on the host) when there isn't — the `cwd`, already validated by
`validarCwdDentroDaRaiz` against the project root, is translated into
`/work` by PREFIX swap (`cwdParaContainer`, `guard.ts`), the same
reasoning as `cwd_para_container/2` on the engine side (RN-492).

**`guard.ts` (containment in `$HOME` on Linux, RN-434) now also covers the
mounted path, with NO new validation.** The container's bind-mount IS
`estado.dir` — the same root `validarDirDentroDoHomeNoLinux` already validated
at the CLI's startup, before any container came up. There's no
second check of "valid mount path" because there doesn't need to be: the
mount IS the confirmed root, period.

- **Where:** `apps/runner/src/channel.ts`, `apps/runner/src/index.ts`
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
- **Test:**
  `apps/runner/src/channel.spec.ts` (roundtrip of the three new pairs),
  `apps/runner/src/index-handlers.spec.ts` (`tratarExec` routes host vs.
  container; `tratarContainerStart/Stop/Remove` never throw),
  `apps/runner/src/guard.spec.ts` (`cwdParaContainer`),
  `apps/engine/test/engine/runners/runner_router_test.exs`,
  `apps/engine/test/engine_web/channels/terminal_channel_test.exs`,
  `apps/api/test/infrastructure/http-clients/api-to-engine-client.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-start.use-case.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-stop.use-case.spec.ts`,
  `apps/api/test/application/use-cases/actions/execute-container-remove.use-case.spec.ts`
  (the three with describe "mounted/runner (ADR 0137)")
- **Architectural decision:** [ADR 0137](../../adr/0137-o-runner-sobe-o-container-do-projeto.md)
- **Origin:** the product owner's plan, Part 1 / PR 1.3

## PHASE 29 — the one-line installation: signing what is published

### RN-525 — The binary proxy checks the hash against the manifest of the same release, refuses when it cannot check, and SAYS that this is integrity and not provenance {#rn-525}

`GET /runner-releases/binary` is `@Public()`, without authentication, and it is step 4 of the
browser setup flow ([RN-473](../web.md#rn-473),
[ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md)). Until
session 3 of PHASE 29 it validated the INPUT (`platform` against a closed
allowlist) and streamed the bytes from GitHub straight to the client, **without verifying
anything** — it is the consumer that [ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md)
names and [RN-524](../ci.md#rn-524) left pending.

Now it **checks the sha256 of the bytes against the `checksums.txt` of the SAME
release** before answering anything, and the `Content-Digest` header
(RFC 9530) repeats the checked hash, so whoever receives it can redo the math.

**What this verification does NOT do, and it is written where it is done.** It does **not
verify the signature** of the manifest (`checksums.txt.bundle`). This is
**integrity against the manifest, not provenance**: whoever can rewrite the
Release rewrites both files and passes. The two ways of closing this were
MEASURED in this session, and both were refused:

| path | measured | why not |
|---|---|---|
| `cosign` in the api image | **155 MB** (`cosign-linux-amd64` v2.6.1) | nearly doubles the runtime image (Alpine + Node), published by digest on GHCR ([ADR 0119](../../adr/0119-imagens-publicadas-no-ghcr-por-digest.md)), to verify an optional download |
| `@sigstore/verify` + `@sigstore/tuf` | **2.5 MB, 12 packages** | size is not the cost. `getTrustedRoot()` refreshes TUF metadata against `tuf-repo-cdn.sigstore.dev` (the package's `seeds.json` only seeds the `root.json`), so a public route that today depends on ONE third-party host would come to depend on two. And, by the rule of ADRs [0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) — a capability is only declared when **proven** —, there is no way to prove the path today: **no Release has `checksums.txt.bundle`**, because the `checksums` job was born in session 2 and only runs on a final tag, a gap [RN-524](../ci.md#rn-524) itself already declares on the signer's side |

What verifies the SIGNATURE is `install.sh` (session 4/7), which has a real `cosign`
and downloads it pinned with `sha256sum -c` (decision 4 of ADR 0149). **BRB-005
remains open for the provenance half of this route**, and
[the registry](../../reference/brb.md) says so — it is not a footnote, it is the limit of what the route
proves.

**A Release without `checksums.txt` is a REFUSAL, never "I serve with a warning".** A warning that
one accepts by clicking is a verification that does not exist (ADR 0149, decision 3) — and
it would be the cheapest downgrade possible: deleting 400 bytes from the Release would turn off
everyone's check. The cost is measured and small: in v5.0.0 there are two
binaries (`linux-x64`, `linux-arm64`) and no manifest, and the binary step is
**best-effort** in the browser flow ([RN-473](../web.md#rn-473), step 4) — it is left without the local agent and says so (npm was dropped in AT-774). Every release
prior to the first tag after ADR 0149 falls into that path, by construction.

**The six 502 outcomes do not collapse.** The status alone does not separate them and
they ask different actions of whoever called, so the refusal carries a `motivo`
in the body — `plataforma_nao_publicada`, `release_sem_manifesto`,
`manifesto_nao_cobre_a_plataforma`, `manifesto_ilegivel`, `download_falhou`,
`hash_divergente`. It is the rule of [RN-470](../web.md#rn-470) in an api response: "this
platform has not come out yet" says to wait for the next release, "release without a
manifest" says to use npm, and "divergent hash" is an incident. In particular,
"manifest not listed in the release" and "listed manifest that failed to download"
are DIFFERENT outcomes — confusing them would send the person to install via npm because
of a momentary network failure.

**Checking a hash requires reading all the bytes, and that goes through disk.** Buffering
the binary's ~79 MB in memory would be trivial exhaustion on a public route (the api
pod has `limits.memory: 512Mi`), and caching the bytes would be worse — five
platforms × 79 MB. The bytes come down in a **stream** to a temporary file in
`/tmp` (an `emptyDir` mounted precisely because the api's rootfs is read-only), with
the hash computed along the way, and the file is re-read in a stream to the client **only
after** the hash matches: constant memory, and no unchecked byte reaches
the client. A ceiling of 256 MiB aborts an absurd response before filling `/tmp`.
The existing cache (URLs, 5 min) **stays**, and now also keeps the already
parsed manifest — hundreds of bytes of TEXT, never binary bytes —, in the SAME
entry and never in a cache of its own: in different windows, a release published
in the middle would make the new hash be checked against the old binary, and the outcome
would be a `hash_divergente` that would look like tampering.

- **Where:** `apps/api/src/interfaces/http/runner/runner-releases.controller.ts`
  (the verification, the byte ceiling, the temporary file and the `Content-Digest`),
  `apps/api/src/interfaces/http/runner/checksums.ts` (the pure reading of the
  manifest and the union of `MotivoDaRecusa`),
  `apps/web/src/lib/runner-bootstrap.ts` (`baixarBinario` now reads `message`
  and `motivo` from the body, and the sentence reaches `falhaDoBinario`)
- **Test:** `apps/api/test/interfaces/runner-releases.controller.spec.ts`
  (happy path with `Content-Digest`; divergent hash with NO byte or
  header in the body; release without a manifest refusing before downloading the binary;
  manifest that does not cover the platform; unreadable manifest; failed download; and
  the cache keeping release and manifest together) and the `describe('parsearChecksums')`
  of the same file; `apps/web/src/lib/runner-bootstrap.test.ts` (the api's sentence
  and the `motivo` reaching the caller, and a non-JSON body not becoming a second
  exception)
- **Origin:** PHASE 29, session 3. [ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md),
  the third consumer of the table of decision 3 — for the HALF the api can
  prove today, with the other half named instead of faked
| `BACKUP_DIR` points to a directory that exists and does NOT accept writes | the backup refuses BEFORE the `pg_dump`, saying it is WRITING — a read-only destination would pass an existence test and fail later, with the diagnosis pointing to the wrong place (RN-528) |
| A concurrent `git gc` deletes a packfile in the middle of the bare repos `tar` | the execution becomes **`failed`** in `backup_runs`, with the `tar` status named — never a partial archive announcing itself as good, because only a failure becomes an alert (RN-528) |
| `git_local_repos` volume not mounted in the backup container (the k8s CronJob) | the step is **SKIPPED and stated in the log** — and "not mounted" is never collapsed with "mounted and empty", which is the normal state of an installation without a `local` project (RN-528) |
| There are bare repos in the volume and NO archive in the `git-daily/` prefix | `brabo-restore-git` **fails** saying this volume is without coverage — absent-and-empty is another outcome, and exits successfully (RN-528) |
| Truncated bare repos archive | fails when **READ** (`tar -tzf`), never by size: a cut tar has bytes to spare. It is the `pg_restore --list` of the git side (RN-528) |
| `brabo-restore-git --restaurar` on a volume that already has bare repos | refused: overlaying two repository states raises no error at all and only shows up in a `fetch` with the wrong history. `RESTORE_GIT_FORCE=1` for whoever really wants it (RN-528) |
| `brabo-restore-git --restaurar` without being able to write to the volume (uid 70 × api owner) | refuses **BEFORE** the `tar`, naming `--user 0:0` — finding out in the middle of the extraction would leave the volume half done. And what is extracted as root goes back to the DIRECTORY's owner (RN-528) |

### RN-526 — The installer verifies its own origin, NAMES what it found before asking, and never deletes a user folder {#rn-526}

`install.sh` (repository root, versioned and published as a Release asset)
is the single installation door. Four guarantees, and each one exists against a
concrete defect:

**The invocation preserves stdin and leaves a FILE.** The documented form is
`curl -fsSLO …/install.sh && bash install.sh` — download and run a file with
`bash` —, and **never** `curl … | sh`: with the script arriving through the pipe, the process's
`stdin` IS the download, and any `read` reads bytes of the script itself or
hits EOF. An installer that cannot ask would choose on its own where to
create folders on someone's computer — the opposite of the rule RN-511 already applies
to the base consent. Until AT-083 the documented form was
`sh -c "$(curl -fsSL …)"`, and it **never worked**: the verification of its own
origin (the next paragraph) computes the hash of `$0`, and in `X -c "…"` the `$0` is the
shell's name, not a file; with `dash` as `sh` the script died earlier, at
`set -o pipefail`. The maintainer's decision (09/18) was to change the DOC and keep the
verification by `$0`, **without** a skip door (ADR 0150). The wrong forms
became **named refusals**, before the first download, that print the right
form: running under a shell that is not bash (POSIX block at the top, before
`set -o pipefail`) and running without a file (`exigir_o_proprio_arquivo`, which requires the
top-level `BASH_SOURCE` **and** a readable `$0` — `/bin/bash -c` leaves
`$0=/bin/bash`, which exists, and without the first half its hash would go to the
manifest and the person would read the tampering sentence). The form is ONE constant
(`COMO_RODAR`), used by the refusals and by the report without a TTY.

**It verifies its own origin before acting**, and the chain has two links: the
signature of the Release's `checksums.txt` (RN-524), and the hash **of this file**
inside the verified manifest. The `cosign` that performs the verification is itself
pinned by version and checked by hash against the value written in the script — whoever
trusts `install.sh` enough to execute it trusts the hash it
carries, and the chain does not become more fragile than the link that starts it. A failure in
any link is a **named refusal, never a warning**.

**Computing a hash has ONE function and TWO accepted tools** — `sha256sum` or
`shasum -a 256` —, resolved **before the first download** and never in the middle of
a verification: a machine that has nothing to check with should not get to have
anything to check. Lacking both is its OWN **refusal**, which names the two
tools, says where each one lives and asserts that nothing was downloaded — never the
divergent-hash refusal, which is the **incident** one (*"stop and investigate"*). The
distinction is not style: the script called `sha256sum` directly at the five
verification points, macOS does not ship it, and the `command not found` reached whoever
was installing as an accusation of tampering — blocking every installation on the
platform the script itself supports (there is a pinned `cosign` `darwin-*` in it) and
teaching people to ignore the sentence on the day it is true. `--print-plan` runs
without either and declares which one the script accepts (`conferir-hash`). And there is a
THIRD refusal, since AT-083: the tool exists but **cannot read the
file**. Without it, `hash_sha256` returned empty from inside the command
substitution (`errexit` does not reach the subshell) and the next comparison failed with
the caller's incident text — the tampering accusation of AT-091 by another
path. Now it is `falha_ao_calcular_hash`, which names the file and says there was
nothing to compare.

**Detection names what it found.** Through the marker
(`$XDG_STATE_HOME/brabo/install-state.json`) when it exists; through signals
(compose project `brabo*`, units `brabo-runner-*`, binary in the PATH) when
not — and the list is printed **before** any question. There is no path
"I found something and decide on my own". Without a TTY the script **reports and exits 0**, as
`consentir-base.mjs` already does.

**It never deletes a user folder.** The projects base and the mirror folder
are out of reach of any confirmation — the same rule as the mirror
(RN-516): a user folder is accumulation, not product state. A named volume only
goes with confirmation, and listed one by one before asking.

The marker lives in `$XDG_STATE_HOME` and **not** in `~/.brabo/`, which is where the
runner keeps things per PROJECT: installation state and project configuration
are different lives, and joining them would make removing one delete the other.

**Where:** `install.sh` (root).
**Test:** `scripts/dev/install.spec.ts` — the `--print-state` and
`--print-plan` modes prove the DECISION without a TTY, without network and without effect, in the mold of
`bootstrap.spec.ts`; and the block *"o hash num PATH sem sha256sum"* runs the
hash functions in the real shell, with the `PATH` assembled tool by
tool, checking the TWO refusals (absent tool × divergent hash)
and that the first never uses the second's vocabulary;
`scripts/dev/install-invocacao.spec.ts` runs the script through the wrong forms
(`bash -c`, `/bin/bash -c`, pipe, `dash -c`, `dash install.sh`) and demands the
named refusal with the right form before any download, the third hash refusal,
and that runbook, bootstrap and header teach the SAME form.
**Origin:** PHASE 29, session 3 ([ADR 0150](../../adr/0150-instalador-de-uma-linha.md)).
In this session the script **installs nothing** — bringing up the compose, generating secrets and
installing the runner are sessions 4 and 7, and it **says so** in the output instead of
ending silently.

### RN-531 — The installer consents ONE base for both sides and installs the local agent already executable {#rn-531}

**One base, consented once.** `install.sh` asks where the projects will
live and writes the same path in BOTH places: `BRABO_PROJECTS_BASE` in `.env`
(the server, [ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md)) and the
`base` field of `runner.json` (the local agent,
[RN-529](../runner.md#rn-529)). What differs between `mounted` and `runner` is **who executes**,
not where the code lives — two different bases for the same folder would be the
namespace collision ADR 0141 refused in writing.

The base is refused when it is not absolute, when it is **inside** the Brabo
checkout and when it **contains** the checkout — both directions, as `preflight.mjs`
already does on the server side. The `~` is not expanded on purpose: the value goes
into a configuration file, and a `~` written there is read literally.

**The local agent is installed already executable.** The binary is downloaded, checked
against the **same** signed `checksums.txt` the script already verified to
check itself (RN-524) — downloading it twice would be two chances of getting
different manifests, and the second would not be verified — and installed with
`install -m 0755`, which sets the execute bit in the same act in which it copies.

**This closes BRB-031.** The manual `chmod +x` survived PHASE 28 because
installing as a service did not come from a versioned artifact: whoever got to
run `brabo-runner service install` had already needed to make the binary executable
to get to the command. Coming from the installer, the step disappears — the browser's File System
Access API does not preserve the bit, a script does.

A release without the platform's binary **does not interrupt the installation**: the rest is already
up, and the message points to the issue on `brabo-runner` (npm was dropped in AT-774). It is the same
disposition as the binary step in the browser setup (RN-473), and the
reason is the same — the local agent is the last stage, not a prerequisite.

**Where:** `install.sh`, `consentir_base` and `instalar_o_runner`.
**Test:** `scripts/dev/install.spec.ts` — `install -m 0755` present, the
`chmod` instruction addressed to the user absent, and the check against the
signed manifest named.
**Origin:** PHASE 29, session 7 ([ADR 0150](../../adr/0150-instalador-de-uma-linha.md),
[ADR 0151](../../adr/0151-base-consentida-no-runner.md)).

### RN-534 — The installer enters the signed manifest, and is exercised on a clean machine {#rn-534}

Two halves of the same guarantee.

**`install.sh` enters `checksums.txt` and the Release.** Without that the verification
it does of itself (RN-526) would be a dead letter: it checks its own hash
against the signed manifest, and the manifest did not cover it. The file comes from the
**tag's checkout**, not from a download — it is the same commit that produced everything else
being signed in the same job.

**And it is exercised on a clean machine**, which is what the ephemeral Actions
runner is: a freshly created host, without Brabo, without `.env`, without a marker. The E2E proves,
in this order: the **plan** did not stop promising what it never deletes; the **state**
on a clean machine does not invent a marker or signals; **without a TTY** the installer
reports, exits 0 and **does not write**; and, with a real TTY (not a pipe — the pipe is
precisely what would kill consent), the full installation verifies the
signature, checks its own hash, writes the marker and leaves the `.env` in mode
**600**.

**Correction (AT-083):** the "TTY simulated by `script -qec`" this paragraph
asserted **was never a TTY for the installer**. The step ran
`script -qec "… ./install.sh … < respostas"`, with the `<` INSIDE the `script`
command: the installer's stdin was the file, `[ -t 0 ]` was always false, and the
interactive flow was never exercised. Today what runs the installer is a PTY driver
in Python (`python3 -I`, no new dependency), which puts it on the slave side
of the pty and WAITS for each question before answering — and, for the two password
ones, waits for the echo to be OFF, which proves the "no echo" of RN-547 and prevents
the password from appearing in the output. The E2E also downloads and runs the installer through the SAME
form the runbook prescribes (`curl -fsSLO` + `bash install.sh`, RN-526), and
fails right away if the installer says "Sem terminal interativo". Since the
workflow still does not run on PRs, the driver is extracted from it and exercised in
`scripts/dev/install-e2e.spec.ts` against a fake installer (terminal
seen, answers in order, password out of the output, and the two named stops),
with the old form pinned as the one that did NOT give a terminal.

**It does not run on `pull_request`**, and the reason is the same as for the signature: the
signed manifest only exists after a final tag. Making the script run on a PR
would require giving it a door to SKIP verification — the door ADR 0150
refuses, and which once opened would hold for anyone, not only for CI. It is the
decision the RAG golden-set had already taken by the same reasoning
([ADR 0138](../../adr/0138-golden-set-do-rag-em-ci-agendado.md)): what is not
exercisable on a PR runs on its own cadence, and the workflow **says why** instead
of faking coverage.

**Where:** `.github/workflows/install-e2e.yml`;
`.github/workflows/build-runner-binaries.yml`, job `checksums`.
**Test:** the workflow itself — and `scripts/dev/install.spec.ts` keeps
covering the decision without network; `scripts/dev/install-e2e.spec.ts` (block *"o TTY
do E2E é um TTY para o INSTALADOR"*) exercises the PTY driver on PRs.
**Origin:** PHASE 29, session 10 ([ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md),
[ADR 0150](../../adr/0150-instalador-de-uma-linha.md)).

> **TODO(humano):** the RNs above were extracted from code and tests. It remains
> to confirm whether there is a business rule **not implemented** that should be
> here — something agreed on and not yet coded does not show up in this sweep.

---

## The agents' artifacts become files, in `docs/` (RN-523)

### RN-542 — The installer compares the installed version with the one it is going to install, and the offer is specific per relation {#rn-542}

`install.sh` detected a previous installation since [RN-530](../infra.md#rn-530) and
offered to migrate with a proven backup. What it did **not** know was **which** version
was there: the marker (`$XDG_STATE_HOME/brabo/install-state.json`) recorded
`schemaVersion`, `instaladoEm`, platform, source, digests and paths — and nothing
that said 5.0.0. The question *"migrate this installation?"* was blind on both
sides, and whoever answered had no way of knowing whether it went up, down or repeated.

The information was always at hand and was ignored: the Release's `images.json` carries
`"versao"` next to `commit` and `publicadoEm`, and `resolver_imagens_do_ghcr` read
only `repositorio` and `digest`. From the other end, `--source=local` already requires a
**clean tree on a tag** — so `git describe` is a reliable version there, through the two
refusals that already happened before.

**The order is the decision.** The images are now resolved **before**
detection: knowing what comes in is a prerequisite for asking whether what exists goes out.
The marker goes up to `schemaVersion: 2` and records `versao` and `commit` — the two
together, because a new marker without the field would pass for an old one.

With both versions in hand, the offer stops being one question and becomes four,
one per relation:

| relation | offer | default |
|---|---|---|
| greater | `Atualizar 5.0.0 → 5.1.0?` | **yes** — it is what the person came to do, and the proven backup makes it reversible |
| equal | `Já é a 5.0.0. Reinstalar do zero mesmo assim?` | no — there is no gain to offer |
| lesser | names a **downgrade**, warning that a database migration does not go backwards | no — there may be no going back |
| new line | `Atualizar 7.0.0 (linha anterior) → 1.0.0 (linha nova)?` — [RN-998](parte-02.md#rn-998) | **yes** — restarting the versions at 1.0.0 is not a downgrade |
| unknown | a schema 1 marker has no version: says so, and **does not guess** | no |

The `maior` branch was the **only** one with a default of yes, and it is the only one that can have it: the
step is reversible through the backup that was just proven. Since
[RN-998](parte-02.md#rn-998) the `nova-linha` relation shares that default, for the same reason
(it is an upgrade, only with another numbering). The other three require a typed `s`.

**In any branch the installation is deleted and recreated from scratch**, never brought up
on top — a decision of the product owner, and the same reason as RN-530: an `up` over
volumes of another version is damage that gives no warning, and half a migration is worse than
none. The chain backup → **PROVE** → ask → delete → install →
restore does not change in any of them.
`comparar_versoes` is implemented by hand and **not** with `sort -V`: macOS's BSD `sort`
gained `-V` late, and this script runs on other people's machines — the same
discipline that already made `sha_do_cosign` refuse an associative array because of
bash 3.2. It echoes the verdict instead of returning an exit code, because under
`set -e` a legitimate `return 1` would kill the script.

In the `pnpm bootstrap` menu, *Docker › Instalar (install.sh)* **reports** the plan
and does not install — mechanics, not preference: a menu item runs with stdin at
`/dev/null` so the menu keeps reading keys from the same terminal, and this installer
exists to ASK (that is the reason [ADR 0150](../../adr/0150-instalador-de-uma-linha.md)
refuses `curl | sh`). It is the same design as the *Base de projetos* item
([RN-511](../infra.md#rn-511)), and the item's note carries the command that really installs.

- **Code:** `install.sh` (`comparar_versoes`, `campo_do_marcador`,
  `resolver_imagens_do_ghcr`, `resolver_imagens_locais`, `main`);
  `scripts/dev/bootstrap.sh` (item `1.7`)
- **Test:** `scripts/dev/install.spec.ts` — *"a comparação de versões"* and
  *"o marcador registra a versão"*; the function is extracted from the script and run by
  `bash`, never reimplemented in TS (a copy keeps passing after the
  shell breaks)
- **Found by running, not by reading:** `cut -d.` on a string **without a dot**
  returns the whole line, not empty — so `5.0.0` vs `5` answered `menor`.
  Normalized with `.0.0` at the end, with a regression test.
- **ADR:** [0150](../../adr/0150-instalador-de-uma-linha.md)
- **Origin:** request of the product owner — *"o sh deve ser inteligente de
  entender que já há uma versão e verificar se será uma nova versão a ser
  executada ou não... caso seja uma nova ou escolhido isso pelo usuário deverá
  deletar a anterior e instalar do zero para evitar possíveis erros"*
