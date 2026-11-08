---
id: historico-de-fases-parte-4
title: "Phase history, part 4: from the local runner onward"
sidebar_label: "From the local runner onward, part 4"
description: "From the local runner to the standalone binary, and the section migrated from the CLAUDE.md index (phases 28 to 30 included)."
keywords: [history, phases, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Phase history, part 4: from the local runner onward

:::historico 2026-09-11
From the local runner (ADR 0102 and 0103) onward, plus the section migrated from the CLAUDE.md index, where phases 28, 29 and 30 are.
Text moved without rewriting from the [Phase history](historico-de-fases.md). What holds today lives in the RNs and the ADRs.
:::

## Local runner — execution on the user's machine (RN-418/419/420, ADR 0102/0103) {#runner-local--execução-na-máquina-do-usuário-rn-418419420-adr-01020103}
The product owner's request: an agent running on the USER'S MACHINE, in the
project's local folder, through the user's default terminal — plus a real
interactive terminal in the Code tab. Two changes, one depending on the other.

**Policy (ADR 0102 — a GLOBAL decision, explicitly confirmed by the product
owner after an automatic security warning about the change)**:
`git push`/PR/deploy (RN-106) and `sudo`/`doas` (new) leave the unconditional
`deny` and become an ABSOLUTE CEILING — unconditional `require_approval`,
in the SAME block and SAME pattern as the neighboring ceilings (`current.policy ===
'auto_approve'`), never auto-approvable by `agent_autonomy` (wildcard `"*"`)
nor by `permissions.json`. The gap the original `deny` plugged by force
was closed at the SOURCE: `ApproveAlwaysActionUseCase`/`patternForAction`
refuse to write an `allow` pattern for an action with a git external effect or a
privileged command — "always allow" approves only the instance, never the
pattern, for those two cases. Without that second half, the ceiling would be
decorative. `sudo`/`doas` match by VERB in `comandoPrivilegiadoNoComando`
(`external-effect.ts`), scanning all the command's segments, same
principle as `efeitoExternoNoComando`.

**Runner (`apps/runner`, a new Node/TS workspace, ADR 0103)**: a CLI
(`brabo-runner --project <id> --dir <pasta> --token brb_...`) that the
user runs on their own machine, connects to the ENGINE through a NEW Phoenix channel
(`/runner`,
topic `terminal:<projectId>`) authenticated by a SINGLE-USE ticket (same
pattern as RN-108, but a ticket ISSUED BY THE ENGINE — schema `"engine"`,
its own migration — and requested by the api through an internal HTTP route, inverting the
session ticket's flow). It runs `exec` (an ALREADY APPROVED agent command
— the routing in `TerminalExecutor` only happens AFTER the usual
`decide()`/`proposed_action` pipeline, never before) in the user's `$SHELL`,
and an interactive PTY mode for the Terminal tab (`pty_open`/`pty_data`/
`pty_input`/`pty_resize`/`pty_close` — the engine does pure RELAY, never
interprets the bytes). Only ONE runner per project (`Engine.Runners.Registry`,
`:global`, exclusivity of `:global.register_name/3`); `runner` mode WITHOUT a
verified workspace or WITHOUT a connected runner REFUSES explicitly — it never
falls into `System.cmd`/bind-mount, which doesn't exist for a `runner` project
(revised by ADR 0104/RN-423, see above; the fallback to the usual path
remains valid, but only for `container`/`mounted`). PTY is an action of the
authenticated USER, it doesn't go through `proposed_action`, but it audits
(`terminal.session.started`/`ended` in the event log, even when the tab
drops without an explicit `pty_close`).

The runner's security boundary is NOT sandboxing — it is authentication
(the CLI presents a Personal Access Token of the user's ACCOUNT) + the
usual approval pipeline + the consent of the user running the
CLI on their own machine, with their privileges. `apps/runner/src/guard.ts`
validates `cwd` inside the root by lexical resolution, but it is declared
BEST-EFFORT, not the real guarantee.

**The PAT closed the automation token gap (ADR 0105/RN-424..426).** The
real finding of Wave 1 — "the product has no LONG-LIVED account token
mechanism for automation, so the runner replicates the browser login
(cookie/CSRF persisted in `~/.brabo/runner-credentials.json`)" — was
closed in Wave 2: `personal_access_tokens` (`brb_…`, HMAC-SHA256+
pepper hash via `hashDeToken()`, never argon2 — wrong for a HIGH-entropy
secret) is issued in the project's Settings, scoped to ONE project,
revocable, with optional expiry. `apps/runner/src/auth.ts` lost
completely the interactive login, cookies and the credentials file — it only
validates the format and passes on `--token`/`BRABO_ACCOUNT_TOKEN`, NEVER written
to disk by the CLI. The PAT never authenticates outside
`POST .../runner-ticket`, by CONSTRUCTION (`IS_PAT_ROUTE_KEY`/
`@RequirePatAuth()` + `PatAuthGuard`) — never a branch in the global `JwtAuthGuard`,
which would let `RolesGuard` authorize the PAT for any route of the
user's role.

**`maintainer` revokes another user's PAT (RN-427)**, closing the item
ADR 0105 had declared out of scope for now (incident
response — a dismissed dev with a leaking token). An extension of the same model,
without a new ADR: SEPARATE routes (`GET .../personal-access-tokens/all`,
`DELETE .../personal-access-tokens/:tokenId/admin`), scope by
`projectId` instead of `userId` — each user's self-revocation
(RN-426) doesn't change.

`@xterm/xterm`/`@xterm/addon-fit` (web) and `phoenix`/`node-pty` (runner)
are the four new dependencies — the same exception rule as `mermaid`
(ADR 0068): dynamic `import()`, no `eval`/`new Function` confirmed by
grep in the installed package (not a formal guarantee against obfuscation, only
strong evidence — declared as uncertainty, not asserted as certainty).

**ADR 0104 — Wave 1 COMPLETED (RN-421/422/423):** ADRs 0072 and 0103
never talked to each other — RN-170 required a bind-mount at creation, and the routing to the
runner (RN-420) reused the same `workspace_mode == 'local'` flag without
any bind-mount, so actually using the runner was still forced to
go through the mounted-folder validation. `workspace_mode` (2 values) became
`execution_mode` (`container`/`mounted`/`runner`, migration `0048`) —
RN-170 (now RN-422) applies only to `mounted`; `runner` is born with a
path validated only LEXICALLY (no I/O) and `workspaceVerifiedAt: null`,
promoted to verified when a runner connects and confirms the path on the
HOST (`POST /internal/projects/:projectId/workspace-verification`, RN-423)
— the runner is the SOURCE OF TRUTH of the path, overwriting what was
typed in the wizard. `Engine.Actions.TerminalExecutor.decisao_de_execucao/1`
gained FOUR outcomes: it routes only with a verified workspace AND a connected
runner; without either of the two, it REFUSES explicitly — it never falls into
`mounted`'s `System.cmd`/bind-mount, which doesn't exist for a `runner`
project.

**A finding of the implementation, correcting the ADR (which is not edited — the
correction lives here and in
[backlog.md](backlog.md#backlog-of-the-runnerexecution_mode-adr-0104)):**
ADR 0104's sentence that converting between the three modes of an
existing project "is now allowed without recreating the project" is INCORRECT.
`UpdateProjectDto` still excludes `executionMode`/`workspacePath` on
purpose — it isn't a trivial PATCH (worktree, permissions.json and the
engine cache point to the old scope). Wave 1 delivered only the three-value
field at CREATION; converting an existing project is a future wave, with
its own design, not yet planned. Runner backlog: Wave 2 (PAT,
ADR 0105) closed the item that blocked `npm publish @brabo/runner`, and
Wave 3 (ADR 0106) delivered the distribution itself — `tsup` bundles
`apps/runner` into a single `dist/index.cjs` (`node-pty` as a mandatory
`external`, native binding), published on each final tag by its own
workflow (`publish-runner.yml`), parallel to `release.yml`. A real finding
tested empirically: the auto-run guard of `index.ts` needed
`realpathSync` on `process.argv[1]` — without it, `main()` never ran
when the CLI was invoked through the `bin` installed via `npm install -g`
(a symlink, which `process.argv[1]` never resolves by realpath but
`import.meta.url` always does). Declared operational pending item: the
actual publication requires the product owner to create the npm Automation Token
and configure the `NPM_TOKEN` secret — without it, the workflow warns and skips,
never fails. Exclusivity by `{project_id, machine_id}` remains postponed
until a second real simultaneous dev; best-effort `guard.ts` is a
REAFFIRMED invariant, not a gap. See
[ADR 0104](../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)/
[ADR 0105](../adr/0105-personal-access-token-do-runner-escopado-por-construcao.md)/
[ADR 0106](../adr/0106-distribuicao-do-runner-via-tsup-e-npm-publish.md).

## DEVELOPMENT TOOL — `pnpm bootstrap` {#ferramenta-de-desenvolvimento--pnpm-bootstrap}
A terminal menu in `scripts/dev/bootstrap.sh` grouping what is done
day to day: Docker, K8s, Database and Test. It exists because those commands live
in THREE places that don't talk to each other — `package.json`, `Makefile` and scripts in
`deploy/k8s/`/`docker/` — and memorized knowledge rots.

It **reimplements nothing**: each leaf calls the command that already exists. The
`--print-commands` mode resolves the whole tree without a TTY and without executing, and it is
on it that the test runs (`scripts/dev/bootstrap.spec.ts`) — a TUI can't be
unit tested, but the menu→command mapping can, and that's what goes wrong.
Zero new dependencies; the colors come from `design/tokens.css` in 24-bit ANSI
with degradation to 256 colors and to none.

The output of a running command is SCROLLABLE (mouse wheel in SGR, `j`/`k`,
PageUp/PageDown, `G` to go back to the end). What was missing wasn't reading the wheel: it was
OFFSET — `tail -n` only knows how to show the end —, so the window became a slice
with `sed -n 'a,bp'`, testable without a TTY through `--print-window`. Two consequences
the footer announces: scrolling back FREEZES the window (like `less +F`, otherwise
the 5 Hz redraw undoes the scrolling) and mouse tracking, turned on only on the
execution screen, is turned off on EVERY exit — `\e[?1006l\e[?1000l` in
`restaurar_terminal`, which the EXIT trap covers. The escape parser is a generic
CSI one (reads up to the final byte): reading two fixed bytes left the rest of the sequence
in the buffer, and since the menu treats `[1-9]` as a choice, a wheel turn fired
menu items.

Three recorded decisions: `Create` provisions from scratch and `Deploy` publishes
into an environment that already exists (that's why only `Deploy` has a per-service choice);
in K8s only `All` works, and Api/Engine/Web appear DISABLED instead of
vanishing, because the menu should say what the product doesn't do; and
`Database › Delete` recreates the pgvector extension, since
`docker/postgres/init.sql` only runs on the volume's first initialization —
a plain `DROP SCHEMA` would make the next migration fail, and since the engine
shares the same database, recovering requires `db:migrate` AND `engine:migrate`.

**`Docker › Reset total`** (`scripts/dev/reset-total.sh`) adds up that
whole sequence into a single leaf — preflight, `up --build --wait` (the
`--wait` of Compose v2.17+ is the "until everything is healthy", with no health loop
written by hand), the same `DROP SCHEMA` as Delete, `db:migrate` +
`engine:migrate` and the seed — with its OWN confirmation screen
(`confirmar_reset`, requires typing `RESET`), distinct from Delete's (which
requires the database NAME) and without Delete's "postgres already up" precondition,
because it is the command itself that brings up compose from scratch. The seed
(`apps/api/src/db/seed.ts`) gained a step that activates a provider credential
from `.env`, reusing the SAME `<PROVIDER>_TEST_KEY` variables
that the LLM smokes already use
(`apps/api/test/infrastructure/llm/*.smoke.spec.ts`) — a single naming
convention, two consumers; a provider without a defined variable doesn't come in, without
error, and the credential stays with the OWNER (RN-058).

Two findings when running the reset for the first time, and not about the item itself —
neither of them is hypothetical, both broke the real run:

1. `gemma:1b` doesn't exist in the Ollama registry (`manifest unknown` — only
   `gemma3:1b` exists), so `ollama-model-loader` always failed and the
   `--wait` never closed green. Fixed in the six places that carried the
   wrong value as CODE — `docker-compose.yml`/`.prod.yml`,
   `.env.example`, `docker/ollama/pull-models.sh`,
   `scripts/dev/verificar-modelos-ollama.sh`,
   `deploy/k8s/base/ollama/job-model-loader.yaml` and RN-415 in
   `docs/business-rules.md` — without touching ADRs 0099/0100 (accepted) nor the
   historical narrative of this same section of CLAUDE.md, which describe what
   was requested/decided at the time, not the current operational value.
2. More serious, and older — `Database › Delete` (item 3.4, existing
   since the menu was created) never really dropped: `DROP SCHEMA public
   CASCADE` doesn't reach `engine.*` (Ecto/Oban lives in its OWN schema,
   `engine`) nor `drizzle.__drizzle_migrations` (drizzle-kit's control
   lives in its OWN schema, `drizzle`). Result: `mix ecto.migrate` hit
   `duplicate_table` on the engine tables that survived, and
   `pnpm db:migrate` — worse, WITHOUT any error — saw drizzle-kit's
   control intact, concluded it had already run everything and recreated
   NO api table. `Delete`/`Reset total` now drop `engine` and
   `drizzle` too, in that order, before `public`.

## Grouped tabs, project-wide PRs, local folder via Runner, the PO's carousel (2026-08-20) {#abas-agrupadas-prs-project-wide-pasta-local-via-runner-carrossel-do-po-2026-08-20}
Five independent waves, run in parallel by contested file, coming
from real use of the project screen — none planned in advance. The sixth wave
of the same program (complete translation of product and documentation, i18n) is
bigger than the five together; its FOUNDATION (Wave 6a — mechanism, no
content translation yet) has already closed: `react-i18next`+`i18next` on the web
(`en` became the app's default language, `pt-BR` kept — RN-425), a
`locale` column in `users` embedded in the login/refresh payload, a new `AccountPage`
(`/account`) proving the mechanism, and Docusaurus with
`i18n.defaultLocale: 'en'`/`locales: ['en', 'pt-BR']` — the current pt-BR snapshot
of `docs/` is already preserved in
`website/i18n/pt-BR/docusaurus-plugin-content-docs/current/`. Wave 6b
(mass extraction of the interface + translation of `docs/`) advanced a lot on
2026-08-22, in four parallel fronts — see CHANGELOG.md (Unreleased/
Documentation) for the detail of each — but it has NOT YET closed: missing are
`docs/business-rules.md` (only the front-matter was translated; the body, with
hundreds of RNs, remains 100% in Portuguese — it is the largest file of the whole
doc and grows faster than it can be translated in passing) and a
residual slice of smaller `.tsx` components. When it really closes,
this section gets the final summary and the rest of CLAUDE.md (Stack,
"Documentation") is fully revised to record English as the real primary
language.

- **Grouped tab ruler**: 11 loose tabs became 6 at the top — Overview,
  **Agents ▾** (Executors, Criativo, Chat, Insights), **Dev ▾**
  (Code, PRs, Approvals), **Documentation ▾** (Backlog, Architecture),
  Spend, Settings — via a new `GroupedTabs` (`apps/web/src/components/
  ui/GroupedTabs.tsx`), built ON TOP of the generic `Tabs`, which
  remains without groups for the other screens. `ChaveDeAba` remains flat — only the
  presentation became grouped, so as not to touch the `?tab=` deep link. Chat and
  RAG Chat become ONE tab (`ProjectChatShell.tsx`) with an internal segmented
  control ("Converse"/"Search") — the business distinction between the two
  (RN-202: conversing activates an agent and spends the owner's key per turn; RAG is
  a read over an index, without an agent) didn't change, only the UI container.
- **PRs tab, project-wide**: `ProjectApprovalsTab` scoped "PRs under
  review" to the most recent session — the review of a PR from a previous session
  vanished from the screen as soon as a new session proposed another one. The new `prs` tab
  lists straight from the git provider (never per session) and cross-references with
  a pending `proposed_action` via `findPendingByProject`, new, alongside the
  already existing session-scoped method — the decision uses the `sessionId` of the
  action ITSELF, never `latestSession` (RN-423). It is the first real producer
  of `git_merge` through the UI; the protected-branch lock (RN-154) remains
  absolute and untouched — the "Merge" button only PROPOSES, human approval
  remains the only way to execute.
- **Architecture tab**: extracted from the Overview (module_map, C4 diagram,
  ADRs, pending items), which keeps a condensed summary + link. The design system's first
  lightbox — `Modal` gained `size="full"` — to enlarge the
  C4 diagram (SVG, without quality loss) (RN-424).
- **Local folder navigation via the Runner (RN-422, ADR 0104)**: revises
  ADR 0072 (which had explicitly refused a folder picker) WITHOUT
  editing it — navigation exists, but through the Runner, which already runs with the
  user's real privilege on their machine, never through the api enumerating the
  container's filesystem. Two new events on the already existing channel
  (`fs_list_dir`/`fs_home_dir`), pure relay by the engine, same pattern as the PTY.
  `FolderBrowserModal` works where the project already exists. At creation
  (`NewProjectWizard.tsx`), the gap stayed declared until ADR 0108: in
  `mounted` mode the project is still only born at confirmation (the path validation
  touches disk there), but in `runner` mode "Browse folder..." now creates the
  project IN ADVANCE — reused by an identity snapshot instead of
  duplicated on each click — so it can anchor the channel ticket before the
  confirmation (RN-437, ADR 0108). A new `RunnerOnboardingPanel`
  (shared with the Terminal tab) replaces the raw `<code>` from before.
  `apps/runner` got a README — actually publishing to npm/packaging a
  signed binary remains out of scope, declared in the README.
  The folder explorer itself became three columns (shortcuts, a list where one
  click selects/double click enters, a details panel — RN-436),
  following the product owner's visual reference.
- **The PO's carousel bug fixed (RN-421)**: the batch of pending
  promotions depended on a scan over the last 200 events
  (`useSessionEvents`) — in a long session, the proposal left the window and the
  carousel degraded to a single card or vanished. The same class of bug that
  RN-180 had already fixed for `ContextAside`; the source is now
  `useBacklog` (complete, no window), with a per-story fallback when the
  backlog hasn't answered yet.

## Manual handoff to an agent of choice (RN-440/441, ADR 0109) {#handoff-manual-a-agente-à-escolha-rn-440441-adr-0109}
It closes the backlog item open since FASE 13c. `CreateHandoffUseCase`
remains the ONLY place that writes `toAgent` (ADR 0038) — it only gained an
optional `actor?: Actor`, defaulting to the usual `{kind:'agent', id: fromAgent}`.
`RequestManualHandoffUseCase` (a new route, `POST
.../sessions/:sessionId/handoffs`, role `developer`) validates `toAgent`
against `addressableAgents()` — a CLOSED catalog (area leads ∪
`SOLO_CONVERSATIONAL_AGENTS`), stricter than `assertHandoffTargetAllowed`
(which only refuses a subagent) — resolves `fromAgent` through the session's most recent
`agent.activated` (sentinel `"usuario"` when there is none), and writes
`actor: {kind:'user'}`. The handoff is born `offered` just like an automatic one:
the already existing acceptance card (`SessionPage.tsx`) picks it up on its own, zero
change in the acceptance path.

Investigation BEFORE coding found `ux-designer` (ADR 0087) in the SAME
situation as the Staff (ADR 0088) that motivated the item: a `message/2` clause
ready in `agent_command_controller.ex`, no human path to it.
Both entered `AGENTES_DE_CHAT` in the same change — `infra`/`qa`
remain out, the same pattern already documented there (leads without `kickoff/1`
or a `message` clause). Declared, not hidden: the mirror of
`SOLO_CONVERSATIONAL_AGENTS` on the web side (`apps/web/src/lib/agents.ts`)
is NOT cross-checked by test with the api's — diverging produces, at worst, a
stale option in the selector that the backend still refuses with 400.

## Budget per area — closes the cut of ADR 0038 (RN-443, ADR 0110) {#budget-por-área--fecha-o-corte-do-adr-0038-rn-443-adr-0110}
An approved backlog item ("Older backlog", `docs/explanation/backlog.md`).
`agent_areas` gets `budget_micros`/`spent_micros`, mirroring exactly
`max_parallel` — same row, same decision owner (`maintainer`), without a
new table. It is a THIRD ADDITIVE ceiling alongside project and session
(`CheckBudgetGateUseCase` checks all three in parallel, any one blocked
already refuses), **not** the model binding cascade of ADR 0064 (`session >
agent > area > project > workspace`, "the most specific wins") — the two
mechanisms share the word "area" and nothing else; not confusing the
two is the central point of ADR 0110, in the same way RN-101/ADR 0063 already
separates the owner's view from the member's view in the spend report.
`spent_micros` always adds up when the actor belongs to an area (lead or
member, via `areaDo` — a pure function, without touching the database for an actor without an area),
with or without `budget_micros` configured (`null` is the default, no ceiling).

## The runner's standalone binary (2026-08-23, RN-451/452, ADR 0112) {#binário-standalone-do-runner-2026-08-23-rn-451452-adr-0112}
A backlog item of ADR 0104 ("standalone binary, `pkg`/`bun build
--compile`"), companion of ADR 0106 (distribution via npm). The product
owner's explicit decision: a truly SINGLE binary, a complete matrix
with Windows since v1 — the cheaper alternative ("binary + a
`node-pty-native/` folder next to it") was offered and refused.

`bun build --compile` embeds `node-pty`'s native `.node` through
`with { type: 'file' }` and extracts it to a REAL TEMPORARY directory at
runtime (`native-pty-loader.ts`) — necessary because `node-pty` resolves its
own addon through a `require()` of a COMPUTED path
(`lib/utils.js#loadNativeModule`), which Bun can't embed on its own
(the build passes, the runtime throws `Cannot find module`, tested before
designing the fix). Five platforms
(`linux-x64`/`linux-arm64`/`darwin-x64`/`darwin-arm64`/`win32-x64`), each
one built on its NATIVE runner
(`.github/workflows/build-runner-binaries.yml`, final tag trigger,
same pattern as `publish-runner.yml`), the binary attached to the already
existing Release.

**Honest validation, per platform**: only `linux-x64` was actually executed
in this environment (`build:bin`+`smoke:bin` green, repeatedly —
it was by running the real binary that the two bugs below showed up). The other
four — Windows especially, with THREE native files instead of one —
were reasoned about by reading `node-pty`'s source code, never executed
on a real machine of that OS; their first real run is the NEXT
version tag, not this PR. No per-platform fallback was applied
preventively — nothing in this investigation PROVED that any of the five doesn't
work this way; if a real tag shows that it does, that becomes a new item, not
today's assumption.

Two defects found only by running the compiled binary, not by reading the API:
`--external node-pty` needs to be in the `bun build` command even without
any static `import` of `node-pty` in the code — the fallback `await import(...)`
(used only outside the binary) is discovered and embedded by Bun
anyway, and fails at runtime with a misleading error; and the
auto-run guard (ADR 0106) needed a second branch — `process.argv[1]` inside
the binary is a VIRTUAL path (`/$bunfs/root/...`) that `realpathSync`
can't reach, throwing `ENOENT` outside any `try/catch` before
`main()` is attempted.

## Converting the execution_mode of an existing project (RN-447..450, ADR 0111) {#converter-execution_mode-de-projeto-existente-rn-447450-adr-0111}
It closes the correction that the runner's Wave 1 (ADR 0104) had recorded in
`docs/explanation/backlog.md`: item 4 of that ADR said that converting
`execution_mode` between `container`/`mounted`/`runner` in a project that already
exists "is now allowed without recreating the project", and that was false until
here — `UpdateProjectDto` still excludes both fields on purpose.
`PUT projects/:projectId/execution-mode` (`maintainer`,
`ConvertProjectExecutionModeUseCase`) is a DEDICATED route, not a loosened
`PATCH`: it orchestrates the migration instead of just switching the column.

It refuses with 409 while any dev agent of the project (in ANY session,
read straight from `engine.dev_agent_states` by `project_id`, the same path as
RN-409) isn't `idle` — `idle_tripped` COUNTS as active here, unlike
RN-409's "online" criterion, because the agent still has
`workspace_root` captured in memory waiting for human unblocking
(RN-447). `PermissionsFileStore` gained `move(from, to)`: the content of
permissions.json never changes, only the physical path, because `projectScopeRoot`
derives from the (mode, path) pair (RN-448). Leaving `container` with a provisioned
container, the lifecycle (ADR 0081) is taken to `removed` — via
`stopped` first if it was `running` — BEFORE the column changes, because
`RegistrarTransicaoDeContainerUseCase` refuses a transition outside
`container` mode; entering `container` never auto-provisions (RN-449).
`workspaceVerifiedAt` is reset on every real conversion, including going back to
`runner` with a path that looks the same (RN-450). The same (mode, path) as
today is a no-op — it doesn't even check for an active dev agent.

**Declared consequence, not hidden**: the conversion NEVER copies the code
already written between the old root and the new one. That is safe for what was already
COMMITTED — the engine derives the worktree from the bare repo from scratch
(`Engine.Actions.Workspace.ensure!/4`) whenever the destination folder isn't
yet marked ready, so the next agent rebuilds the working
tree in the new root from the real git. What does NOT survive is an
UNCOMMITTED diff in the abandoned worktree — it stays orphaned on the old disk,
never migrated nor deleted. The active dev agent ceiling (RN-447) reduces the
risk (it never converts with a `working` agent) but doesn't eliminate it: an
`idle` agent between tasks may be sitting on a dirty diff, and nothing here
inspects the working tree's cleanliness before converting.

## A local folder attached as a RAG Chat reference (2026-08-23, RN-455..457, ADR 0113) {#pasta-local-anexada-como-referência-do-chat-rag-2026-08-23-rn-455457-adr-0113}
The product owner's request: attach a folder from the user's OWN machine to
a project as a READ reference for the agents — without the
`brabo-runner` CLI (ADR 0103). Explicitly NOT project execution/workspace:
`execution_mode: runner` (ADR 0104) needs the CLI because it needs
a real HOST path for the container to route commands; this is more
like "attaching files to a conversation". The browser reads the CONTENT
(`File.text()`) and the RELATIVE path (`File.webkitRelativePath`) of the
chosen files — never an absolute host path (the `File` API
doesn't expose one, to any site), and that's why ADR 0113 is explicit that it is NOT
a revision of what ADRs 0072/0107 refused: those refused
RESOLVING a host path from the browser; here there is no path
at all to resolve, only bytes the browser already had the right to read.

`chunks.scope` (ADR 0079/0080) gains a FOURTH value, `'local'` (migration
`0052`, `ALTER TYPE ... ADD VALUE`, additive — the two CHECKs of migration
`0045` are already written as "it's `session` or it isn't", so `local` falls on the
same side as `docs`/`adr` without a new CHECK). `IndexLocalFolderUseCase`
mirrors `IndexProjectDocsUseCase` closely — Markdown-aware chunking for
`.md`/`.mdx`, `RagEmbeddingService`, a chunk without a vector instead of failing
when the embedding drops (RN-233) — but REJECTS (400) the whole upload
when the AGGREGATE ceilings overflow (number of files, summed
bytes), never truncates silently: it's a SINGLE gesture by the user with a
folder picker on screen, not a background scan. An individual
file that's too big or has an unrecognized extension is only SKIPPED
(`filesSkipped`), never brings down the batch (RN-456). `origemDoChunk` didn't
need any new branch: `local` carries `sourcePath` like
`docs`/`adr`, falls into the `kind: 'file'` that the citation already knew how to render.

**It never enters the generic "Reindex now" (RN-457)**: `ReindexProjectUseCase`
reindexes by reading from a source the SERVER can revisit (the project's
repository, the event log); `local` has no source at all to revisit — the
text only exists in the browser of whoever attached it. Reattaching the folder (a new
upload to `POST .../rag/local`, `maintainer`) IS the
resync mechanism, a deliberately separate button, with a cross-comment
in both use cases pointing at each other and at ADR 0113, so that a future
"fix" doesn't wire the two back together and erase the user's material. The
coverage (`RagCoverage.local`) has its OWN shape — there's no "total in the
repository" to compare — and `lastAttachedAt` is the ONLY real exception to the
"never Xmin" rule (RN-237): a real `MAX(chunks.created_at)`, not a
guess (RN-458).

## The turn's activity strip — the thread only receives the reply at the end (RN-459/460) {#faixa-de-atividade-do-turno--o-fio-só-recebe-a-resposta-no-fim-rn-459460}

The product owner's request: the Session screen starts showing, ABOVE the
composer, a strip that narrates in human language what a conversational
agent (Criativo, PO, Arquiteto, Dev Lead, UX Designer, Staff)
is doing DURING the turn — visual reference: Claude Code's status
line. The thread only receives the reply bubble AFTER the turn
ends; the rule belongs to the CHAT (Phoenix channel) and applies only to the six
conversational ones — the consultative chat without an active agent (SSE,
`streamChatMessage`) keeps the usual streaming bubble,
untouched.

**Mechanism**: the six servers already emitted a DURABLE `tool.call`; they now
also `broadcast(state, "tool.call", %{tool: name, agent: @agent})` —
EPHEMERAL, without `args` (RN-096/RN-412) — for the channel to deliver in real time.
There is no shared behaviour/macro between the six `dispatch_tool`s
(four distinct structural shapes, confirmed by a complete read) —
the change was six edits adapted to each one's local shape, not a
refactoring. On the web side, a PURE reducer
(`reduzirAtividadeDoTurno`/`lib/atividade-do-turno.ts`) accumulates the
`agent.delta` as current text; when `tool.call` arrives, it archives the
non-empty current text as a narration line, resets it, and always adds a
tool line with `fraseDaFerramenta(tool)` (a dictionary of the 19
tools, `lib/narracao-de-ferramentas.ts`, without its own RN). Its OWN
flag (`turnoViaCanal`, never derived from `statusAgent`/`streamingAgent`,
which go through legitimately `null` windows in the middle of the turn) decides whether the
strip appears or the old bubble — never both.

**Presentation rule (history)**: `agruparNarracoesDoTurno`, a new
pure pass after `afundarDesfechos` (RN-172) in the same `useMemo` —
consecutive `agent.response`s of the same `turno`+`autor` become a
compact `Disclosure` ("Turn steps · N"), only the last stays intact
outside it. `turno === 0` (the sentinel prologue of `turnoDoSeq`) stays
OUT of the grouping — old fixtures stack `agent.response` without a
turn boundary to test another mechanism (RN-138/RN-177), and without the
exclusion the new grouping would produce a `Disclosure` inside a
`Disclosure` there. `afundarDesfechos` itself didn't change.

**A finding along the way, scope extended by the product owner's decision**: the
investigation found that FOUR of the six servers (Arquiteto, Dev Lead, UX
Designer, Staff) ended SILENTLY at the iteration ceiling —
`defp run_turn(state, remaining) when remaining <= 0, do: state`, without
any event, contradicting the permanent rule that an agent loop doesn't
end silently. Only the PO already emitted `toolloop.limit_reached` (RN-166); the
Criativo deliberately diverges with `agent.error` (a decision documented
in the code itself). The four fixed now emit
`toolloop.limit_reached`, the same event as the PO (RN-459).


## Migrated from the CLAUDE.md index on 2026-09-11 {#migrado-do-índice-do-claudemd-em-2026-09-11}

The entries below came from the `CLAUDE.md` index table and **had no
section of their own in this file** — their narrative existed in a single place. They were
moved without rewriting, in the order they were in, when the table was reduced to an
index. Whatever is here is history; what holds today lives in the RNs, the ADRs
and the "Current and open state" section of `CLAUDE.md`.

### PROGRAMA 16–26 (ADR 0060–0072) {#programa-1626-adr-00600072}
Design handoff adopted; 8 screens; session kind; paginated events; Spend;
model per area; container per project (25b cut); Code tab

### pnpm bootstrap {#pnpm-bootstrap}
Terminal menu over existing commands; Reset total

### Native Ollama / Hugging Face pull (RN-461..463, ADR 0114–0115) {#ollama-nativo--pull-de-hugging-face-rn-461463-adr-01140115}
The dev bootstrap asks once and persists the Ollama mode in `.env`;
a Hub model browser with a two-step pull and an allowlist of official
publishers

### The website's own lockfile (ADR 0117) {#lockfile-próprio-do-website-adr-0117}
`website/` leaves the root pnpm workspace — lockfile and security overrides
isolated, the product's `pnpm audit` stops reporting the Docusaurus tree

### Automatic runner configuration through the browser (RN-464..466, ADR 0118) {#configuração-automática-do-runner-pelo-navegador-rn-464466-adr-0118}
An Ed25519 device key generated in the browser, additive to the PAT; a binary
proxy via GitHub Releases; the File System Access API writes the configured folder,
with a download fallback outside Chromium; `--project/--dir/--token` become
optional in the CLI

### Images published to GHCR (ADR 0119) {#imagens-publicadas-no-ghcr-adr-0119}
`release.yml` publishes the four images on each final tag and records the digests
in `.release/images.json`; the production overlay stops pointing at a
placeholder

### Schema per aggregate (ADR 0121) {#schema-por-agregado-adr-0121}
`db/schema.ts` becomes a barrel; the 51 tables and 34 enums become 16 files under
`db/schema/`, one per aggregate of `domain/*`

### `SessionPage.tsx` in 5 mechanical PRs (ADR 0122) {#sessionpagetsx-em-5-prs-mecânicos-adr-0122}
3,807 → 2,661 lines; timeline/turn, `StorySlide`, `StructuredQuestionCard`,
backlog tree + `ContextAside`, hook `useSessionReadiness` — the turn
channel cluster and `ProjectSettingsTab.tsx` remain out, declared

### The `SessionPage.tsx` turn channel hook (ADR 0124) {#hook-do-canal-de-turno-do-sessionpagetsx-adr-0124}
2,661 → 2,479 lines; a mechanical dedup PR
(`iniciarTurnoDoAgente`/`finalizarTurnoDoAgente`/`cancelarTurnoOtimista`)
followed by the extraction of state + effect of the Phoenix channel into the hook
`useTurnoDoAgente` (`lib/session-turno.ts`) — closes the item ADR 0122
left declared open; `ProjectSettingsTab.tsx` remains out, a separate
decision

### `ProjectSettingsTab.tsx` by section (ADR 0125) {#projectsettingstabtsx-por-seção-adr-0125}
2,532 → 77 lines; the 17 sections become one file each under `routes/settings/`
(+ `shared.ts` with the TWO helpers with more than one caller), and the old file
stays on the path as an entry and barrel — the path and the 11 exported names are
the contract of 3 tests. Closes the LAST half of the debt line in
`docs/architecture.md`

### The project's vertical navigation rail (ADR 0126, RN-201) {#trilho-vertical-de-navegação-do-projeto-adr-0126-rn-201}
The two-level horizontal ruler (`GroupedTabs`) becomes a vertical rail with
the THREE groups open at the same time; geometry of the `CodeShell` rail,
keyboard ported, the 5 counters remain separate. Revises RN-201: the
Code tab no longer collapses the sidebar on its own

### Anchored Settings table of contents (CHANGELOG) {#sumário-ancorado-de-configurações-changelog}
The tab's 17 sections get an `id`, a `<section>` with an accessible name and a table of contents
in four groups INSIDE the content area — no new vertical strip, the frame
stays at the 444px of ADR 0126. Registry in `routes/settings/sumario.ts`
(the third list of the same design as `project-tabs.ts`), deep link `?section=`,
spy by `IntersectionObserver`; only a section that MOUNTED enters the table of contents

### A single pattern for an inherited value (CHANGELOG) {#padrão-único-de-valor-herdado-changelog}
The FOUR wordings of "has no value of its own" in the Settings tab become two
poles and a verb, from a single source (`routes/settings/heranca.tsx`): the label says
the STATE, the detail says the CONSEQUENCE. Vocabulary unified, shape not — the
mark only goes where the control doesn't show the state on its own

### Save by section in Settings (RN-469) {#salvar-por-seção-em-configurações-rn-469}
Parallelism and Spend ceiling swap N row buttons for ONE for the section
(`settings/secao-salvavel.tsx`), with a count of pending rows and an outcome
PER ROW — saving is N calls, not a transaction, and the screen never asserts what
it didn't get. The three autosave sections and Credentials stay out, each
one for a declared reason

### The "needs you" panel (RN-467) {#painel-precisa-de-você-rn-467}
A chip at the top of the project opens the FIVE decision queues in a single place —
separated, ordered by urgency, with no sum at all (not even on the chip). Approvals
and merges are decided there through the `ApprovalCard`; the other three lead to the tab.
An architecture pending item borrows the story's date and SAYS it borrowed it

### The model cascade as a visible chain (RN-470) {#cascata-de-modelo-como-cadeia-visível-rn-470}
The Origin column stops printing the database enum and becomes `workspace › projeto ›
área › agente` with four states per node (`settings/cascata.tsx`) — separating
the TWO meanings of `origin: 'agent'` without touching the api. The warning of a
discarded level enters the chain; the three `—` get three texts. Closes the
UI improvements canvas (7 of 7 items taken)

### Folder before the runner (RN-473/474) {#pasta-antes-do-runner-rn-473474}
The runner configuration through the browser (ADR 0118) inverts the order:
`showDirectoryPicker` is the FIRST step and the binary the LAST, best-effort — a
release without the asset returned 502 before the picker opened, and the folder became
unreachable. A binary failure keeps both written files and swaps the
instruction for the `npm install -g @brabo/runner` path. After the instruction,
`EsperaDoRunner` probes `workspaceVerifiedAt` with three states and a ceiling

### The `kid` in the device key (RN-475) {#o-kid-na-chave-de-dispositivo-rn-475}
ADR 0118's automatic mode NEVER authenticated: the browser discarded the `id`
the registration returned, and the written JWK was born without a `kid` — the CLI refused it
always. Registration and export become ONE function
(`registrarChaveEExportarPrivada`), on BOTH paths; and the CLI's refusal stops
being indistinguishable from "there is no key". The test that let it pass asserted
that the file had been OPENED, never its content

### Provisioning that doesn't stay silent (RN-477) {#provisionamento-que-não-fica-calado-rn-477}
Two failures didn't become any state — `step.check` outside the `try` and the refusal
of `createRepo` BEFORE the bootstrap row existed —, and the screen polled
"Starting…" forever without a button. Root cause of it all: `/data/git-repos` and
`/data/project-workspaces` were born `root` in the DEV images, which
`Dockerfile.prod` already knew how to create before `USER`

### The policy file and the terminal scope (RN-478) {#o-arquivo-de-política-e-o-escopo-do-terminal-rn-478}
`projectScopeRoot` had TWO consumers with opposite needs, and the
`runner` mode (without a bind-mount) separated them: the scope keeps pointing at the HOST, the
`permissions.json` now lives in the MANAGED root. Execution activation
returned 500 (`mkdir '/home/<usuario>'`), and the READ degraded silently — in a
`runner` project the file never existed. Along with it: a typed error with 400 instead of a
raw `Error`, the Overview no longer swallowing the api's message, and the OpenAPI
annotation that promised 409 for two cases that were never 409

### Warning about the human step before the click (RN-473/477) {#aviso-do-passo-humano-antes-do-clique-rn-473477}
The runner's terminal step was announced only in the success state; it now
is also said in the initial one, and the final command gets `cd <caminho>` when it can
be asserted that the chosen folder is the project's. The button label does NOT change —
it talks about the folder, which really is automatic

### One model for all agents (RN-476) {#um-modelo-para-todos-os-agentes-rn-476}
The `Modelos por agente` table gets a bar that applies ONE model to all 17
at once, writing at the AGENT level (through the project it would be `maintainer`, and
it would touch the session default). The first EXCEPTION to RN-469's "a named value saves
on `onChange`" rule — the selector is an action argument, not configuration —,
with RN-469's own three-state outcome

### Demotion ceilings in `project_members` (ADR 0127, RN-472) {#tetos-de-rebaixamento-em-project_members-adr-0127-rn-472}
The `projectRole ?? workspaceRole` override STAYS in both directions (it's a
capability, not a bug); what comes in are two 403 ceilings in the use case —
nobody demotes the workspace `owner`, nobody demotes themselves. The three
OpenAPI descriptions that RN-471 declared false now describe the
code; the `Select` gate is a separate PR, because the screen has no way to compute the
first ceiling

### RAG search telemetry (RN-479..481) {#telemetria-de-busca-do-rag-rn-479481}
The hybrid search leaves a trail: `rag_searches` (with the weights FROZEN in the
row) and `rag_feedback` (the useful/irrelevant vote, the only real signal).
A TABLE and not just an event, because `session_events.session_id` is `NOT NULL` and the
tab's search has no session — the `rag.search`/`rag.feedback` event is NARRATION,
only when there is a session. A `rag_feedback` tool (`:direct`) in the six agents
that already had `rag_search`, and `medir:rag` to read it. NOTHING calibrated — this
stage only instruments

### Container broker (ADR 0130, RN-485/486) {#broker-de-container-adr-0130-rn-485486}
`apps/broker` is born, the ONLY process that talks to a Docker daemon on the
server — and it does NOT accept a specification: it receives `projectId` + operation, READS the
Arquiteto's decision from the api and COMPOSES image, network, resources and the single mount. The
ADR 0128 port MOVES from `apps/runner/src/` to `packages/docker-port` (both
consumers bundle it; the api can't consume it). The lifecycle
route now returns observed alongside registered, without merging them

### Routing modules to infra (PR 1.4) (ADR 0131, RN-487) {#roteamento-de-módulos-para-infra-pr-14-adr-0131-rn-487}
The Arquiteto's seventh tool, `route_modules_to_infra`: one item `{modulo,
imagemCandidata, porque}` per module of the current `module_map`, written as
`artifact.module_routing` (no table, the same design as
`artifact.project_image`/`artifact.c4_diagram`). It NOMINATES — the image of
each item goes through the same `validarDecisaoDeImagem` as `choose_project_image`
—, and whoever ELECTS among the candidates is Infra, in a separate PR (1.5, closed
just below)

### The RAG accuracy golden set (ADR 0132, RN-490) {#golden-set-de-acerto-do-rag-adr-0132-rn-490}
The QA golden-set mold (ADR 0123) applied to the hybrid search: since the
judgment doesn't live in the engine (it is `HybridSearchUseCase`, in the api),
`seed-golden-set-rag.ts` provisions ONE project with a real curated corpus (22
files from `docs/`) AND runs the search for 17 questions composed from real
RNs/ADRs; `rag_golden_test.exs` only invokes the script and applies the floor. The hit
criterion — file path, top-5, never exact chunk/rank 1 — is a tested pure
function. A new `rag-acertivo` gate, `warn` (no CI with an LLM). Actually measured,
twice, deterministically: 17/17 in the top-5

### Dev agents execute INSIDE the real container (PR 1.6) (ADR 0134, RN-492/493) {#dev-agents-executam-dentro-do-container-real-pr-16-adr-0134-rn-492493}
It closes what RN-491 declared pending: `Engine.Actions.TerminalExecutor`
gets the FIFTH outcome, `:executar_no_container` — an `execution_mode:
container` project with a REGISTERED `running` row
(`Engine.Containers.ProjectContainerLifecycle`, a direct read, the same pattern
as `Engine.Projects.Project`) — and the command crosses engine → api (`POST
internal/projects/:projectId/container-exec`,
`ExecutarComandoNoContainerUseCase`) → broker (`ContainerBrokerPort.exec`, the
FIRST real caller of the last of the five operations of ADR 0128/0130),
running via `docker exec` instead of a local `System.cmd`. `cwd` is translated from the
HOST path to inside `/work` in the engine, BEFORE the call — confirmed
in code to be the SAME physical directory `Workspace.ensure!/4` already writes
(the dev agent's worktree changes neither place nor mechanism).
`BrokerRecusouError`/`BrokerIndisponivelError`/a transport failure become a
normal `failed_result`, never a crash nor a silent fallback outside the
container (RN-486: a registered `running` never guarantees the container is up).
A terminal INSIDE the container gets an auto-approval FLOOR
(`ProposeActionUseCase`/`decide.ts`, `containerExecutionActive`) — the five
absolute ceilings and the usual lexical scope keep running on top, byte for
byte

### The runner brings up the project's container (PR 1.3, Part 1 out of order — closes the half that RN-494/PR 1.7 had left declared) (ADR 0137, RN-497) {#o-runner-sobe-o-container-do-projeto-pr-13-parte-1-fora-de-ordem--fecha-a-metade-que-a-rn-494pr-17-tinha-deixado-declarada-adr-0137-rn-497}
`container_start`/`container_stop`/`container_remove` get a SECOND execution
path, branched by `executionMode`: `container` keeps going through the broker
(unchanged); `mounted`/`runner` now ask the connected RUNNER, through THREE
new pairs on the Phoenix channel (`container_start`/`_result`,
`container_stop`/`_result`, `container_remove`/`_result`, the same mold as
`exec`/`exec_result`) — `EngineWeb.ContainerCommandController` passes it on to the
`RunnerRouter`, which the runner serves with `DockerViaCli` (ITS Docker,
`@brabo/docker-port`, which gets real use beyond `--self-test-docker`). The
image is READ (`ObterSpecDeContainerUseCase`, the same use case as the broker's),
never re-elected. "No runner"/"timeout" (`RunnerNaoConectadoError`) and "runner
refused" (`RunnerRecusouContainerError`) become a named `failed`, never an
exception. `Engine.Actions.TerminalExecutor` didn't get a new outcome — it already
routed every command of a connected `runner` project to the channel
unconditionally; the host-vs-container choice is INTERNAL to the runner
(`EstadoDoRunner.containerAtivo`, `tratarExec` routes via `docker exec` with
`cwd` translated by prefix swapping, `cwdParaContainer`). `guard.ts`/RN-434
now covers the bind-mount without ANY new validation — the mount IS the root already
confirmed at the CLI's startup

### The Infra handoff could be accepted by no screen at all (D0) (RN-499) {#o-handoff-da-infra-podia-ser-aceito-por-tela-nenhuma-d0-rn-499}
`offeredHandoff` filters the thread's card by `AGENTES_DE_CHAT`, which excludes
`infra` — and the filter is RIGHT (the engine has no `message` clause for the
Infra Lead; widening it would make the screen offer a thread that doesn't exist and the composer
send a message to the Criativo). The defect was the consequence, which the code's own
comment recorded as accepted: `acceptHandoff` had ONE consumer
only, behind that filter, so the `OfferInfraHandoffUseCase` handoff stayed
`offered` forever, the Infra Lead was never activated,
`propose_container_start` was never called and NO project in any mode
ever got a container up. Fix: its OWN actionable card, outside the thread,
on the fixed strip between the scrolling area and the composer — the same one that already hosts the
manual handoff and declares itself the place for handoff actions that aren't conversation
—, calling the `acceptHandoff` that already existed, closed by the same `activeFor`.
The Infra `handoff.offered` remains NARRATED in the thread as a mute divider

### The single base of mounted projects (PR 1, BREAKING) (ADR 0141, RN-500) {#a-base-única-dos-projetos-montados-pr-1-breaking-adr-0141-rn-500}
Creating a `mounted` project required a bind-mount line written BY HAND in `api`
AND `engine` plus a restart of both — which kills every agent turn, terminal
socket and LLM call in flight in the installation, to onboard ONE project.
`BRABO_PROJECTS_BASE` is born: ONE base, configured once by the operator,
mounted by IDENTITY (`$X:$X`) in both services, with all mounted projects
inside it and NOTHING edited per project. Identity and not a fixed mountpoint
because `workspace_path` is typed by the user and shown back to them
— and it is what keeps `projectScopeRoot`/`workspace_dir/2` correct without
new code. Its OWN variable (a namespace collision with the UNIQUE `workspace_dir_name`
would `git init` in another project's folder; opposite owner; the base is
browsable and the managed root shouldn't be). ABSENT is normal: `projectsBase:
null` (`GET workspaces/:id/projects-base`, `maintainer`) and the mode isn't
offered. And `pnpm dev` REFUSES to start with the base overlapping the checkout — the
only possible check, because the api compares against `/workspace`. Two declared
costs: a symlink under the base and a single base

### Container for a mounted project (PR 3) (ADR 0144, RN-503) {#container-de-projeto-montado-pr-3-adr-0144-rn-503}
A `mounted` project couldn't get ANY container, because of two independent
blocks — the api sent every non-`container` mode to the RUNNER (which requires
a connected `brabo-runner`) and the broker refused non-`container` at the source. The
two were about GEOMETRY, not the mode's name, and ADR
0141's single base changed the geometry. The branching becomes by DESTINATION: `container` AND
`mounted` → broker, only `runner` → runner (and `container_stop`/`_remove` change
TOGETHER with `_start`, otherwise it comes up on the server and stops on the user's machine). The
ADR 0130 invariant doesn't move — no absolute path crosses the network:
the broker gets a SECOND root (`BRABO_PROJECTS_HOST_BASE`) and the api sends a
DISCRIMINATED locator (`gerenciada` \|`montada` \|`indisponivel`) saying
against which root the relative segment applies. THREE variants because
`indisponivel` has two different fixes (`runner` × a legacy `mounted` outside
the base), and a missing root is NEVER supplied by the other one. `mounted` ELECTS the
image like `container` — the broker composes from `artifact.project_image`, so an
unrecorded election is an inert election (ADR 0133 in a second mode)

### Dev agents only after the container (PR 7) (ADR 0143, RN-502) {#agentes-de-dev-só-depois-do-container-pr-7-adr-0143-rn-502}
In a real run of `exp001`, TEN dev tasks got stuck at once — and the
finding wasn't the folder that failed, it was that **nothing ordered container before
dev agent**. `Engine.Dev.AgentIo.try_claim/2` — the SINGLE claim point — now
queries `ProjectContainerLifecycle.running?/1` (the predicate ADR 0134
already had) BEFORE calling the api: without a REGISTERED `running` row, the agent falls
into `:idle`, persists and emits `dev.blocked_by_container`. In the ENGINE and not only in the
api's `activate-execution` because REHYDRATION reaches `try_claim/2` without
going through any route (`init/1` → `finish_restart_recovery/1`). `:idle` and
NOT a new status, for the reason `try_claim/2`'s own docblock already
recorded since Fase 12b — it is the only state from which a wake still rescues,
and all the guards of `handle_info/2` rely on that; whoever distinguishes "empty
queue" from "no container" is the EVENT, never the status. The wake comes through the outbox:
`RegistrarTransicaoDeContainerUseCase` publishes `container.running` in the SAME
transaction that writes the arrival at `running`, in a NEW `aggregate_type`
(`container`, the third one `Engine.Outbox.Drain` reads) instead of borrowing `task`,
with the PROJECT as the `aggregateId`; the message delivered is the `{:wake,
:became_claimable}` that already existed. Second half: `TerminalExecutor` stops
degrading silently — `container` without `running` fell into `System.cmd` INSIDE the
engine process, and now it REFUSES, with `mounted` in the same branch

### A pipeline merge alarm with a recipient (ADR 0139) {#alarme-de-merge-de-esteira-com-destinatário-adr-0139}
The rule "promotion is `--no-ff`" was broken THREE times (#367, #394, #464 — the
third was the PR that fixed the first two). The finding: the detection ALREADY
existed and ALREADY worked (`tag-release` failed the first two with the
right message) — what was missing was WHOM to ring, because a `push` workflow that fails
on a permanent branch has no PR to go red on and the repo had zero issues.
`tag-release` gets the `avisar` job, which opens an issue (and comments on the already open one,
never duplicates) with `github.token` and never with the PAT — an invalid PAT is one of the
failures it reports — and that stopped being hypothetical: the `BRABO_BOT_TOKEN`
expired on 2026-09-03 at night, failed two `tag-release` runs, and was
rotated on 2026-09-04; v4.0.0 stamped and TRIGGERED the Release, which only
happens with a valid PAT (a tag created with `GITHUB_TOKEN` doesn't trigger a workflow).
The rule now covers `dev` NARROWLY: the only defect is a PR that brought a
NEW EDGE (head was a merge whose second parent wasn't in the base), never the
squash of a work PR, which is the convention. Turning off squash in the repo was
MEASURED and refused (it would tax every PR and touch `changelog.mjs`, which runs
`--no-merges`)

### The conversational agents' decision artifact (Front 3, generic slice) (RN-505) {#o-artefato-de-decisão-dos-conversacionais-frente-3-fatia-genérica-rn-505}
`decision_record` reuses the GENERIC pattern of `emit_artifact`/`ArtifactSchemas`
(the same as `note`/`business_rule`) instead of the dedicated one of
`project_image`/`c4_diagram` — a decision is an append-only log, never a
"current" one that gets replaced. PO, Arquiteto, Dev Lead, UX Designer and Staff
get the tool (alias + `tool_specs` + `run_tool/3` + the same sentence in
`system_prompt/1`); the Criativo already had `emit_artifact` since Fase 3b and only
got the new type, with no change to it. Distinct from `open_adr_pr` (only the
Arquiteto, a real commit + PR + human approval): the two COEXIST for
different scales of decision. Out of scope, declared: execution agents
(`ToolLoop`, without a common harness) and the tie-in with the Infra Lead — emitting
`decision_record` when proposing `container_start_via_runner` — which depends on a
tool from another front of the same plan, in a separate branch

### "Always allow" separated per module Dev Agent (RN-509) {#sempre-permitir-separado-por-dev-agent-de-módulo-rn-509}
Clicking "always allow" on an action of a `dev-<modulo>` wrote to
`permissions.json`, the WHOLE PROJECT scope — it released the same command for
any other agent. It now writes to `agent_autonomy(projeto, agente,
tipo)`, the SAME mechanism already used for the 3 git actions seeded on execution
activation. `dev-lead` (leads the area, isn't a member of it) and any
non-modular actor keep going to the usual `permissions.json`; the two absolute
ceilings (a terminal with an external effect/privileged command,
`container_remove`) keep refusing the whole click BEFORE the new branch.
No migration: old entries remain in `permissions.json`, a conscious
decision

### Docker becomes a real prerequisite of Runner mode (RN-507/508, ADR 0145) {#docker-vira-pré-requisito-real-do-modo-runner-rn-507508-adr-0145}
`runner` routed every approved terminal to the CLI as soon as a verified workspace
+ connected runner matched, without checking for a `running` container — without Docker up,
the runner fell on its own to the pure HOST, the SAME silent fallback that ADR 0143
had already closed for `container`/`mounted`. `Engine.Runners.RunnerReadiness`
unifies the THREE preconditions (verified, connected, `running` container) with
two consumers: `TerminalExecutor` and the materialization of the dev
agent's worktree, which stops trying a LOCAL `File.mkdir_p!`/`git init` against the
HOST path (the gap open since RN-478) and starts running INSIDE the real
container, on the user's machine, through the SAME `exec`/`exec_result` channel
(`Engine.Actions.Workspace.RunnerGit`, new) — `WorktreeManager` forks by the
same criterion, and the periodic cleanup job silently SKIPS a
`runner` project without a ready runner now. The `exec` protocol gets an optional `env` for
the git credential (ADR 0056) to travel in the environment of the HOST's child process —
merged over `process.env`, never passed on to `docker exec` nor logged.
`container_start` stops serving `runner` (its payload, with image
election, never made sense there); `container_start_via_runner` is born — a schema
with only `rationale`, it brings up the already decided image —, with the Infra Lead's new tool
refusing LOCALLY (without HTTP) before proposing blindly

### RN-505 duplicated in dev, fixed {#rn-505-duplicada-em-dev-corrigida}
The "decision artifact" and the "always allow per Dev Agent" merged 2
minutes apart, each one allocating RN-505 without seeing the other; "always
allow per Dev Agent" was renumbered to RN-509 (`docs/business-rules.md`,
CHANGELOG, the comment in `approve-always-action.use-case.ts` and in
`ApprovalCard.test.tsx`), freeing the `{#rn-505}` anchor for the
`decision_record`. Found along with it: the 505→507/506→508 renumbering done during the
conflict resolution of another PR (Docker/runner, ADR 0145) had been left
INCOMPLETE — three mentions of "RN-505" remained in this very file, also
fixed to "RN-507"

### FASE 28 (session 5) — the local agent's `join` stops being mute (RN-514, ADR 0147 point 1) {#fase-28-sessão-5--o-join-do-agente-local-deixa-de-ser-mudo-rn-514-adr-0147-ponto-1}
The `join` of the `terminal:<projectId>` channel was mute on BOTH sides — the runner
sent `{}` and the server did `_params` —, so the server had no way to
know whether the binary on the other side understands a new message, and the defect was the
worst possible: the message arrives, the handler doesn't exist and NOTHING happens, without
error and without log. Now the runner DECLARES in the params
(`Engine.Runners.Capacidades`, vocabulary `exec`/`pty`/`espelho`) and the
server GRANTS the intersection with what it KNOWS, in `socket.assigns` and NEVER
in a table (a capability is a property of that CONNECTION). The runner declares only
`exec` and `pty` — declaring `espelho` without implementing it is exactly the defect
the negotiation prevents; it comes in as a vocabulary NAME and nothing more, and
session 6 implements it. Absent/empty params are the LEGACY binary and grant
`{exec, pty}` — a FACT, not benevolence: they are the two functions the runner
was born with, and refusing legacy would be `breaking/` and MAJOR. Unknown is IGNORED
(a runner NEWER than the engine connects); required-and-not-declared refuses the join
NAMING the missing one, BEFORE the `Registry` — a mechanism implemented and tested
that today does NOT fire (`runner` requires `exec`, which every binary has; nothing requires
`espelho` yet), and that is the design. The half that delivers value TODAY:
a message without the capability is REFUSED with a named reply — `exec` replies in the
`exec_result` format (126 + cause) instead of the `RunnerRouter` waiting for the
timeout, and `pty_*` becomes `pty_error` in the tab instead of vanishing. `RunnerReadiness`
byte for byte as it is

### FASE 28 (session 6, half B) — the mirror comes into existence (RN-516, ADR 0147 points 2/3/4/8) {#fase-28-sessão-6-metade-b--o-espelho-passa-a-existir-rn-516-adr-0147-pontos-2348}
The `espelho` capability goes from a vocabulary name to code on BOTH
sides. The DESTINATION travels in the `join` GRANT (the reply stops being empty
for `:runner`: `%{espelho: %{destino: ...}}`), lives only in that connection and the
runner REFUSES `mirror_sync` for a destination not granted — never global
configuration nor a variable, which would make project B's artifact land in project
A's folder. A non-null `mirror_path` now REQUIRES the capability, and that is the FIRST
real firing of RN-514's refusal mechanism: an old binary in a project with a
destination STOPS connecting, named and fatal — opt-in, cost declared in the ADR.
`espelho-guard.ts` is born a SIBLING of `guard.ts` (reuses the three helpers and the double
pass, inherits the TOCTOU caveat in writing) and refuses the ADR's three
things; a finding while implementing: `realpathMaisProximo` falls back to the ancestor, and since the
destination almost never exists, collapsing both sides would make `/base-outra` and
`/base` become `/` — the second pass resolves the ancestor and PUTS BACK the
suffix. ONE direction and it NEVER deletes: a file deleted at the origin STAYS at the
destination (the user's folder is accumulation, not a replica). What gets copied is the GIT
LIST (tracked + untracked-not-ignored), with no exclusion list
of its own; a failing git becomes a NAMED error, never a fallback `cp -r`; a nested git
repo (the dev agent's worktree) comes back as ONE entry and isn't descended into, and
a symlink at the origin is skipped. Its OWN predicate (`Engine.Runners.Espelho`), TWO
preconditions and NEVER `RunnerReadiness` with a flag — `runner_readiness.ex` stays
byte for byte. Trigger: the COMMIT, a named moment, fire-and-forget and never a
watcher; "end of an agent turn" stays DECLARED and not wired, because there is no
unambiguous hook

### The broker that never came up (fix of RN-512) (RN-512, ADR 0130/0146) {#o-broker-que-nunca-subiu-correção-da-rn-512-rn-512-adr-01300146}
RN-512 took the broker out of `profiles` so it would be up in dev, and it NEVER
came up: `corepack prepare` ran as ROOT at build (cache in `/root/.cache`),
the container runs as uid 1000, and without a cache corepack tries to DOWNLOAD pnpm in a
service whose only network is `internal: true` — `EAI_AGAIN registry.npmjs.org`,
`Exited (1)` five seconds later. Without a healthcheck, `up --wait` said
`Healthy` and the reset total announced "reset complete" with the process dead;
while there was a profile, whoever brought up the broker was someone already watching it. The
fix takes the registry out of RUNTIME and does NOT open the network (the first of the five
layers of ADR 0130): `COREPACK_HOME` prepared at build with the runtime uid's
owner, `pnpm install` as a BUILD step, and — because the three
`node_modules` volumes cover what the image installed and Docker only seeds an EMPTY
volume — an entrypoint that reconciles them against a copy outside `/workspace`,
stamped with the sha256 of the build's lockfile (the same stamp WARNS that the image
fell behind, without refusing to start). A healthcheck on the service, from inside the
container. Production didn't suffer from this and doesn't change

### FASE 28 (session 7) — the local agent becomes a user service (RN-518, ADR 0147 point 5) {#fase-28-sessão-7--o-agente-local-vira-serviço-de-usuário-rn-518-adr-0147-ponto-5}
`brabo-runner service install|uninstall|status`, and the precedent was ZERO
(no mention of `systemd`/`launchd` in `apps/runner/`; the model was
foreground killed by SIGINT). USER level always — `systemd
--user`/`LaunchAgent` —, and root is a REFUSAL, not a warning: `guard.ts`'s docblock
declares "runs with HIS privileges" as the premise of the three real
boundaries, and a root service would leave the best-effort `cwd` guard as the only
thing between an approved command and the disk. Windows is a NAMED refusal (a third
mechanism, not a variation of the two). One unit per PROJECT because the server already
enforces one runner per project — naming by folder would create two units that never
come up together, and the second would appear as a connection failure instead of an
installation error; on Linux the file goes where systemd LOOKS
(`$XDG_CONFIG_HOME/systemd/user`, otherwise `~/.config`). `Restart=on-abnormal` and
NEVER `on-failure` (in the plist, `KeepAlive`/`Crashed`): the runner's exit 1 is a
fatal join refusal (RN-514) or an exhausted attempt ceiling, and restarting
would be the loop the CLI refuses to do on its own. The service authenticates by DEVICE
KEY and never by token — writing it into a unit would leave it on disk, and this
CLI never wrote a credential to disk. `uninstall` removes the THREE by reading the
UNIT's folder and never the `cwd` (without a unit, only with `--dir` — guessing would delete
another project's key), and SAYS that the key left the disk and was NOT revoked on the
server. `status` answers FOUR states with their own sentence and code
(0/3/4/5), and the first answer comes from DISK — that's why it stays right on a
machine without a manager; a failed `spawn` never becomes "the manager said
no". BRB-031 does NOT close here

### The runner's spec went without `projectId`, and the path NEVER brought up a container (RN-508, ADR 0145) {#a-spec-do-runner-ia-sem-projectid-e-o-caminho-nunca-subiu-container-rn-508-adr-0145}
`container_start_via_runner` (RN-508, ADR 0145) ended `failed` 100% of the
time — *"container specification refused at `projectId`: expected non-empty
text, got undefined"* —, and in a real run of `exp004` what was seen
was the EFFECT: ten dev tasks with no agent claiming them. That block
was RIGHT (RN-507 and RN-502/ADR 0143 refuse without a REGISTERED `running`
container); what was wrong was the previous step.
`EspecificacaoDeContainerParaRunner` was born with NINE fields and
`especificacaoValidada` (`packages/docker-port`) always required TEN — the data
was at hand in `SpecDeContainer.projectId` and simply wasn't copied; the engine
passes the map on OPAQUELY, so nothing was lost in the middle. By contrast the
BROKER always worked because it FETCHES the spec from the api and receives the
whole `SpecDeContainer` — that's why only `runner` mode broke. Three
green suites didn't catch it because each link built its own fixture: nobody
tested the CHAIN. It comes in — the payload the REAL use case composes
crossing the REAL validator, and the SET of fields locked (`raizDoProjeto`
is the only one the api doesn't send) — in the api suite, through a RELATIVE import, the only
place where both sides exist alive; the
`api-nao-consome-docker-port` invariant stays green and was EXTENDED to fail a relative
import from `src/`. Siblings checked and RIGHT:
`container_stop`/`container_remove` send only `workspaceDirName`, which is all
that `nomeDeWorkspaceValidado` asks for

### The pause that couldn't be undone (RN-540) {#a-pausa-que-não-podia-ser-desfeita-rn-540}
Anamnese and Psicólogo had been PAUSED since 2026-08-10 and three places called
the pause reversible — the docblocks of
`AnamneseSchedulerWorker.enabled?/0`/`PsychologistWorker.enabled?/0` ("Turning
it back on is `X=true` and restarting the engine") and
`docs/reference/configuration.md`. It wasn't reversible in ANY environment: the
`environment:` of the `engine` service mapped the THIRTEEN
Anamnese/Psicólogo variables — all cost CEILINGS — and neither of the two PRODUCT ones, and
`docker compose` does NOT pass on the host's environment, so `ANAMNESE_ENABLED=true`
in `.env` was inert and `runtime.exs` fell back to the `"false"` default SILENTLY.
Measured in the dev container: `[true] [] []`. Likely origin: when the default
became `false`, nobody needed the variable to TURN IT OFF — only whoever tries to
TURN IT ON discovers the wire doesn't exist, months later. The EIGHT boolean flags
(`System.get_env("X", "true"|"false") == "true"`) go into BOTH composes with
the SAME default as the code — the four extra ones (`START_MODEL_SYNC`,
`START_GATE_RESCUE`, the two `GRAPH_*`) because they are the same defect, found
by the mechanism itself, and excepting them would require four excuses. Zero change
in behavior: the product decision to keep both off stays byte
for byte, what comes into existence is the SWITCH. The mechanism is
`scripts/ci/flags-do-engine-no-compose.spec.ts`, which DERIVES the list from
`runtime.exs` (the other 50 variables are ceilings with a good default and release
things, legitimately absent) and demands an equal default only in the DEV compose —
the production one turns off the background agents on purpose. `deploy/k8s/` does NOT
change, for coherence: the layer that breaks doesn't exist there

### FASE 29 (session 1) — one-line installation, planning only (ADR 0149-0152, fase-29-instalacao-de-uma-linha.md) {#fase-29-sessão-1--instalação-de-uma-linha-só-planejamento-adr-0149-0152-fase-29-instalacao-de-uma-linhamd}
Installing Brabo is THREE disconnected gestures (compose with five secrets by hand,
runner through the browser with `chmod +x`, `pnpm bootstrap` that only exists in a
checkout), and FASE 28 refused in writing the one-line installer while
the artifacts weren't signed (BRB-005) — that's why the phase signs BEFORE
installing. Four `Proposed` ADRs: keyless `cosign` signing by DIGEST plus
ONE signed `checksums.txt`, never five signatures (0149); the installer
invoked by `sh -c "$(curl …)"` and NEVER `curl|sh`, because with the pipe the script
IS the stdin and consent dies (0150); the runner's consented base,
reusing `dentroDoEscopo` and the per-SEGMENT loop refusal of
`espelho-guard.ts` instead of a fourth copy of the rule (0151); and
backup/restore against compose (0152). The measurement corrected FIVE points of the
original scope: `workspace.verified` does NOT exist (what exists is
`workspace_confirm`, and it is ONE-WAY), point 5 of ADR 0146 versions
`consentir-base.mjs` and not an `install.sh`, `docker-compose.prod.yml` doesn't
consume GHCR and declares itself a VALIDATION compose, `make test-restore` is a Kubernetes
path with a Postgres-only backup, and "one runner per project" is
enforced in FIVE independent places — which took the per-machine runner out of
this phase, to FASE 30. Its own finding: **`git_local_repos` isn't in any
backup**, and losing it is losing the code of the `local` projects.
`docs/reference/brb.md` is born — and the finding is that the BRB register **isn't the
repository's**: it lives in the maintainer's vault, with 33 items, and here only two ids
appeared in prose. Measuring: BRB-032 and BRB-033 describe defects that **no longer
reproduce**, and **BRB-004 isn't what the id suggests** — it asks for third-party images
by DIGEST, not the tag #419 pinned. The file here keeps the EVIDENCE
(measured state, `file:line`); the vault remains the owner of the finding. Range
RN-524..538 and ADRs 0149-0152, skipping what is IN FLIGHT: three collisions
observed at the same moment (ADR 0148 ×2, RN-522 ×2, RN-523 ×2), resolved
later by the DATE criterion — whoever allocated first kept the number, and the
branches of 08/09 became ADR 0153, RN-539 and RN-540

### FASE 29 (session 2) — the pipeline signs what it publishes (RN-524, ADR 0149) {#fase-29-sessão-2--a-esteira-assina-o-que-publica-rn-524-adr-0149}
The product signed **nothing**: `cosign`/`sigstore`/`attestation` didn't exist in
`.github/`, `scripts/` or `docker/`, and the only provenance was the
`--provenance` of the runner's **npm** package. `release.yml` published the four
images **without** `id-token: write`; `build-runner-binaries.yml` uploaded the five
binaries with `gh release upload` and nothing more — while the `sha256sum -c`s that
already existed verify **third-party** binaries, the pattern the repository
knew how to apply and never applied to itself. Now the images are signed by
**DIGEST** (never by tag, a moving pointer) and the binaries get **ONE**
signed `checksums.txt`, in a `checksums` job that waits for the matrix — not five
signatures, because whoever verifies four and forgets the fifth doesn't know they
forgot. The job is `if: always()` on purpose (`fail-fast: false` in the matrix) and
**names what the manifest doesn't cover**. Both workflows **verify before
publishing**. Keyless because of the house's history: a private key would be one more
CI secret, and a PAT has already expired silently (ADR 0139). A verification
procedure in the runbook, with the two `--certificate-*` flags **mandatory** —
without them `cosign` accepts a valid signature from ANYONE. Closes BRB-005
for images and binaries; left out, declared, are OS code-signing and the
download proxy

### FASE 29 (session 3) — the installer that doesn't install yet (RN-526, ADR 0150) {#fase-29-sessão-3--o-instalador-que-ainda-não-instala-rn-526-adr-0150}
`install.sh` is born at the ROOT, versioned and served by the Release. The form is `sh
-c "$(curl …)"` and **never** `curl|sh`, for a MECHANICAL reason: with the pipe, the
process's `stdin` IS the download, and every `read` reads bytes of the script itself or
hits EOF — an installer that doesn't ask would choose on its own where to create a folder
on someone's machine. It VERIFIES ITS OWN ORIGIN (the signature of RN-524's
`checksums.txt`, and its own hash INSIDE the verified manifest), with
`cosign` pinned and checked by `sha256sum` against the hash written in the script;
DETECTION names what it found before asking; without a TTY it reports and exits 0; and
it **never deletes a user folder** — the projects base and the mirror folder stay
outside any confirmation, by the mirror's rule (RN-516). A marker in
`$XDG_STATE_HOME/brabo/`, never in `~/.brabo/`, which is PER PROJECT. **It doesn't
install anything in this version, and SAYS so** instead of ending silently.
`--print-plan`/`--print-state` expose the decision without a TTY, without network and without effect
— the mold of `bootstrap.sh`'s `--print-commands`, tested the same way. Two bash
bugs found while running, both of the same kind: under `set -e`+`pipefail`, a `[
cond ] && assignment` that is false KILLS the script, and an `ls` that doesn't match
brings down the whole substitution — in a function whose normal case is "found
nothing". The repository ROOT wasn't covered by any docmap (the root globs
are literal names); the `instalador` rule is born

### FASE 29 (session 4) — the installation comes up from its own compose (RN-527, ADR 0150) {#fase-29-sessão-4--a-instalação-sobe-de-um-compose-próprio-rn-527-adr-0150}
`docker/docker-compose.install.yml` is born, GENERATED from the production one and
different in three points: the four images come from a **mandatory variable**
(`${BRABO_API_IMAGE:?…}` — with a default, a missing variable would bring up half the
stack with an image nobody chose, and the error would become strange behavior
instead of a refusal), **no `build:`** survives, and the **`broker` service does NOT
exist** because its image isn't published (the bake has four targets) — with
`--source=ghcr`, `mounted` doesn't bring up a container, and the compose SAYS so in the
`BROKER_URL` comment. `docker-compose.prod.yml` stays intact: it
declares itself a VALIDATION compose and is what `smoke.sh` uses building locally. The
cost of the two files is declared and the ceiling is MECHANICAL —
`composes-em-conformidade.spec.ts` fails an extra service/volume/port,
a surviving `build:` and a loosened third-party image. Two things from the plan
died on contact with the disk, for opposite reasons: **migrate isn't a step**
(compose chains `api`→`migrate-api` with `service_completed_successfully`,
and two places ordering migration would be two sources of the same truth) and **the
`smoke.sh` isn't reused** (it BUILDS what the installation downloaded by digest,
and tears down the stack at the end) — in its place, the installer ASKS before asserting,
hitting `/health` on both

### FASE 29 (session 6) — migrating requires a PROVEN backup (RN-530, ADR 0150/0152) {#fase-29-sessão-6--migrar-exige-backup-provado-rn-530-adr-01500152}
Installing over an existing installation **isn't offered** — either it migrates, or it
stops: `up` over another version's volumes is damage that gives no warning. The order is
backup → **PROVE** → ask → delete → install → restore, and the middle step
is what gives the installer the right to delete: a backup nobody
tried to restore is a file, and the time to find that out isn't after the
`down -v`. The proof runs `test-restore-compose.sh` (the SAME three validations
of ADR 0152); a backup or proof that fails stops the migration **without deleting anything**.
The destination is a HOST folder — the compose default is the `backup_local` volume,
which `down -v` would delete ALONG with what one wants to preserve. The Postgres dump
is NOT restored on its own over a populated database (it's destructive, and `brabo-restore`
never touches the origin); the local git repos are, because they would be born empty

### FASE 29 (session 7) — one base for both sides, and BRB-031 closes (RN-531, ADR 0150/0151) {#fase-29-sessão-7--uma-base-para-os-dois-lados-e-o-brb-031-fecha-rn-531-adr-01500151}
The installer asks for the base ONCE and writes it in BOTH places:
`BRABO_PROJECTS_BASE` in `.env` (server, ADR 0141) and the `base` field of
`runner.json` (local agent, RN-529) — what differs between `mounted` and `runner`
is WHO executes, not where the code lives, and two bases for the same folder would be
the collision ADR 0141 refused. A refusal in BOTH directions against the checkout,
and `~` isn't expanded on purpose (the value goes into a configuration file,
where `~` is read literally). The runner binary is checked against the
**same** `checksums.txt` the script already verified to check itself —
downloading it again would be two chances to get different manifests, and the
second wouldn't be verified — and installed with `install -m 0755`. **BRB-031
closes here**: it survived FASE 28 because the installation didn't come from a
versioned artifact, and whoever reached `service install` had already needed the
`chmod`. A Release without the platform's binary does NOT interrupt the installation

### FASE 29 (sessions 8-10) — the protocol, the picker and the E2E (RN-532..534, ADR 0149/0150/0151) {#fase-29-sessões-8-10--o-protocolo-o-picker-e-o-e2e-rn-532534-adr-014901500151}
**8 (RN-532)**: the `workspace_create`/`_result` pair is born in the mold of
`exec`/`exec_result`, and the confirmation REUSES the `workspace_confirm` that already
exists — no new write route, the engine still doesn't write the table.
The predicate is its OWN for a stronger reason than the mirror's: there the
third precondition would be **circular** — a `runner` project only has a
`running` container after the runner brings it up, and the container comes up ON the folder that
this message creates. The `workspace` capability is the only one whose declaration depends
on STATE (consented base), not on the binary's version. **9 (RN-533)**: the
picker goes back to reading the user's disk through `fs_list_dir`, and the decision NOT to
hide the mode without a runner is symmetric to RN-513, not contrary — there the api HAS a
signal and without a base the creation ends in 400; here there's no presence signal (
RN-521 already declares it), and hiding would be deciding "doesn't have" from "don't know".
Finding: the screen decided by matching the SENTENCE `'Nenhum runner conectado'` that lives
in an engine `.ex` — it became a discriminated reason. **10 (RN-534)**: the
`install.sh` enters the signed `checksums.txt` (without it the verification it
does of ITSELF was a dead letter) and is exercised on a clean machine, with a TTY
simulated by `script -qec` and never by a pipe — the pipe is what kills
consent. It does NOT run on PRs, for the same reason as the signature

### FASE 29 (session 8) — the local agent's base gets a consumer (RN-532, ADR 0151 points 3–6) {#fase-29-sessão-8--a-base-do-agente-local-ganha-um-consumidor-rn-532-adr-0151-pontos-36}
RN-529 built the BASE and declared in writing that nothing consumed it. In comes the
`workspace_create`/`workspace_create_result` pair, in the REQUEST WITH
REPLY mold of `exec`/`exec_result` — and NEVER in that of `workspace_confirm`, which is
ONE-WAY (`{:noreply, socket}`, pushes nothing back), a precision that
the phase had already recorded along with "`workspace.verified` does NOT exist". Only the
relative SEGMENT crosses the network (the invariant of ADR 0130/0144: whoever has the
root is whoever executes), and an ABSOLUTE segment is refused lexically. The confirmation
REUSES the `workspace_confirm` that already existed, and that is what saves a whole
front: **no new write route is born**, the engine still doesn't
write the table, and the only path that stamps `workspace_verified_at`
remains a single one — with ORDER as the mechanism (confirm BEFORE the result,
because both reach the same channel process in order and the
confirm handler is synchronous). The `workspace` capability enters the vocabulary IN THE SESSION
IN WHICH THE CODE COMES IN, on both sides — RN-514 made the opposite bet with
`espelho` and it only paid off because someone demanded it —, and it is the ONLY one of the
four whose declaration depends on the STATE of that execution: the runner only
declares it with a consented base, and it is through that line, and no other, that the
server KNOWS a base exists (the engine doesn't read the user's disk). NOBODY
requires it at join, on purpose: requiring it in `runner` would be `breaking/` and MAJOR
for a function that project may never use. Its OWN predicate
(`Engine.Runners.PastaDoProjeto`), TWO preconditions, `RunnerReadiness` byte
for byte — and here the third would be worse than unnecessary, it would be CIRCULAR: a
`runner` project only gets a `running` container after the runner brings it
up, and the container comes up on the folder this message exists to create.
It also doesn't ask about `workspace_verified_at` (here that's the RESULT) nor the
mode. The TWO preconditions are answered in different places because "consented
base" is a property of the CONNECTION (`socket.assigns`, never a table): the channel
refuses BEFORE pushing, with `motivo: "sem-base"` through the same `ref`, in the
format the module expects — never a timeout. Five named reasons that don't
collapse, idempotency with its OWN outcome (`ja-era-repositorio` is a success),
and `estado.dir` does NOT change. It isn't a `proposed_action` and no ceiling gets an exception

### FASE 29 (session 5) — the backup starts covering what hurts to lose (ADR 0152, RN-528) {#fase-29-sessão-5--o-backup-passa-a-cobrir-o-que-perder-dói-adr-0152-rn-528}
The backup covered ONE database and ran in ONE place: `make test-restore` is a
Kubernetes path (it requires `kubectl`, a cluster and the CronJob) and `docker-compose.prod.yml`
had NO `backup` service at all — migrating a compose installation had no
proven path. The decision starts by REFUSING the easy move ("back up
all the volumes") and CLASSIFYING the seven: `neo4j_data` and
`project_workspaces` are derived, `ollama_data` can be re-obtained,
`brabo_projects_base` is the user's — copying them gives an impression of coverage without
adding recovery. The sources of truth are TWO, and the finding is the second:
**`git_local_repos` wasn't in any backup**, and a project with the `local`
provider keeps its *bare* repo there — it isn't rebuildable from Postgres (the event log
keeps the NARRATIVE, not the git objects), so losing the volume is losing the
agents' code. The runbook's prose asserted the opposite ("the real
repositories live in GitHub/GitLab") and it is what explains the years without
coverage: it holds for `github`/`gitlab`, and for `local` there's no upstream. The
file's guarantee is DECLARED and smaller than a "snapshot" — consistency by
REFERENCE (git writes objects before moving the ref, and swaps the ref by atomic
rename), without a global instant and without `git fsck` (the image has no git, on
purpose); a concurrent `gc` becomes a FAILURE and not a partial file, with the `tar`
status captured in a FILE because in POSIX `sh` a pipe's status is that of the
last command. The five S3 variables stop being mandatory and become the
configuration of ONE destination (`BACKUP_DIR` chooses disk; absent, S3 — the
inference is what keeps the CronJob INTACT). `make test-restore-compose`
triggers a REAL backup and calls the SAME `brabo-restore` with the SAME three
validations: the WRAPPER changes, never the judgment, and
`deploy/k8s/test-restore.sh` stays INTACT (unifying would make the compose one
depend on `kubectl`); `restore.sh` still doesn't touch the ORIGIN database.
Restoring the repos is a SIBLING command (`brabo-restore-git`, verifies by default,
writes only with `--restaurar`) and not a phase of the other — two artifacts, two
judgments, and joining them would make a git failure fail the event log validation.
A finding while RUNNING, which reading wouldn't give: the volume is shared by three
images with different uids and carries the owner of whoever mounted it first (measured
`1000:1000`, mode 0755), while the image runs as uid 70 — the extraction
died halfway leaving the volume half done; now it refuses BEFORE the `tar`
naming `--user 0:0`, and what's extracted as root goes back to the DIRECTORY's owner,
otherwise the volume would come back intact and USELESS (api and engine, non-root, unable
to write to what was just restored). Neo4j gets REPROJECTION and
not backup — not built here (BRB-018): a migrated installation is born with the
graph EMPTY, a named degradation and not data loss (the RAG lives in pgvector,
inside the dump)

### FASE 30 — the machine's local agent (ADRs 0154/0155, RN-543..552, closes in session 8 with RN-549) {#fase-30--o-agente-local-da-máquina-adrs-01540155-rn-543552-fecha-na-sessão-8-com-a-rn-549}
FASE 29 delivered installing in one line and STOPPED at two points the
product itself already declared in writing: the local agent was still paired per
PROJECT (whoever wanted to use the installed binary went back to the browser to paste
a command into the terminal), and **nobody could get in** — the generated `.env` has
no email variable, `MAIL_TRANSPORT` falls to `log` and registration requires
verifying the email, so the way out was fishing the link from `docker compose logs api`.
Both were solved in the same place, and that's what made a single phase. The finding that
defined its SIZE came from re-measuring with `file:line` FASE
29's claim that "one runner per project is enforced in five places": **three of the
five didn't need to change**, because topic, socket id and ticket describe a
CONNECTION, and a process that opens N connections — one per project — satisfies them byte
for byte, preserving the refusal of a second runner on the same project, which is a real
guarantee and not an accident. **Nothing in the engine changed in the whole phase**, and that's what
kept `RunnerReadiness`, the mirror and `workspace_create` intact. What remained
was what belongs to the PROCESS: the credential (`runner_device_keys.project_id` becomes
nullable, RN-543 — and the listing starts returning the TWO kinds, marked,
otherwise a machine key would be invisible and permanent, the defect RN-519
closed, reborn) and the unit (RN-545, `service install --machine`, one per
machine, COEXISTING with the per-project ones). Two decisions contradicted the letter of the
ADRs and both were MEASURED: the unit's discriminator is the `--machine` flag and not
the absence of `--project` (`resolverProjeto` has two sources, and the normal path
is to run `install` without a flag from inside the folder the browser configured — taken
literally, the ADR would silently convert the installation of whoever already uses the product), and
`install` REFUSES when the other kind is already installed, without `--force`, because
the two together would be two processes competing for the same project. Session 6
would touch three workspaces at once and was SPLIT into three, with the two
disjoint pieces going out first and `install.sh` after them, as orchestrator and nothing
more. From that split came the phase's most interesting revision: with ZERO connections
the agent stopped EXITING and started WAITING, re-querying at 15s/30s/60s
(RN-550) — RN-544's argument against re-querying stays whole where it
holds (a list that comes back SMALLER is ambiguous, and bringing down a LIVE connection through ambiguity
trades a certain state for a guess), and with zero connections there's nothing to bring down; what
fell was the `exit 0` argument ("an active service that does nothing"),
because the process started doing something and SAYING it does. Measured: `Restart=on-abnormal`
**doesn't look at the exit code**, so no unit changed and the effect is that the machine one
is genuinely `active (running)`. The other piece (RN-551) closes "nobody CREATES a
machine key" from the agent's side, and the decision there is the CUT: the CLI does **not**
talk to the api, because whoever registers is the installer with the `BRABO_SERVICE_TOKEN`
— each side keeps a secret and neither sees the other's. From that follows the two-step
design, and from it follows the invariant: the `kid` IS the registration id and only exists
after it, so `create` writes a `.parcial` the reader ignores and
`finish` writes the real name — **the file the runner reads never exists without a
`kid`**, the defect of RN-475 made impossible by construction. The api half
(RN-552) declared the cost instead of hiding it: the credential is the service token,
and a leaked token can now MANUFACTURE a lasting credential — that's why three
containments live in the ROUTE and not in the text (there's no `userId` in the body; registering
REPLACES the owner's active machine keys in the same transaction, so a reinstalled
machine passes and a thousand keys are impossible by clause, with no number that
ages; and a JWK with `d` is refused by name). Session 6 (RN-547) chained the
five commands and fixed three rules: a middle link that fails undoes nothing, becomes a
named line in a final block and the script ALWAYS exits 0 (undoing would require deleting an
account and revoking a key, and there's no route for that nor should there be one the
installer calls on its own); idempotency is the HTTP CODE, and `409` is an EXPECTED
outcome and not a failure, with `000` handled apart so "the api didn't come up" isn't
read as "the api refused"; and the password travels through `curl`'s STDIN, never through
`argv`, because `/proc/<pid>/cmdline` is readable by any user on the machine.
A finding of that session: `--help` had been LYING for months (*"THIS VERSION INSTALLS
NOTHING"*) because it prints the header, which is a comment, and the rule forbidding
talk of "phase sessions" only read code lines. Session 7 (RN-548) gave
the kind marker a consumer, and the decision was one of HONESTY: with a key and without
a live connection — the most common case — the screen says the two things it knows and names
the two it doesn't (*a registered key isn't an agent running*, *the list belongs to your
ACCOUNT and not this browser*), `accent` tone and never `success`. Session 8
(RN-549) is the only one that could prove the whole, and it EXTENDED the workflow that
FASE 29 already had instead of creating a second one. Its central decision is the SIGNAL:
`perguntarEstado` maps `activating` to `rodando` — with reason —, so
`systemctl is-active` and `service status --machine` would give green to a process
that's going to die in two seconds; the chosen signal is the LINE the agent
writes when entering the wait, which only exists after it has read the key,
taken a ticket, talked to the api and received an EMPTY list, and which is a RECORDED FACT
and not a sampling of state. The outcome is proven through the API and not the
browser, because the subject of the claim is the AGENT and what it observes is
`GET /runner/projects` — a browser would create the project through the same route with one
more layer that fails for unrelated reasons, and the assertion would still be the
journal line. And the E2E stays OUT of `pull_request`, with the consequence
declared instead of hidden (**the PR that wrote it didn't run it**): opening
that door is giving the installer a way to skip the origin verification, which is
what ADR 0150 refuses — hence the half that runs on PRs being a TEST
(`scripts/dev/install-e2e.spec.ts`), guarding the two ways the workflow can
rot silently, the loosened gate and the rewritten `install.sh` sentence (which makes
the assertions not fail, but VANISH). Two defects showed up, both
invisible because the workflow had never run: the TTY answers started with
`nao-migrar`, which on a clean machine falls into the MARKER question and made the
script exit 0 saying "Nothing was written"; and the FINDING that stayed a finding — the
published `install.sh` **brings up nothing on its own on a clean machine**, because
`docker/docker-compose.install.yml` (with `./postgres/init.sql` along) isn't a
Release asset, doesn't enter the signed `checksums.txt` and it doesn't download it
anywhere, so whoever follows the runbook's `curl … install.sh` dies at "no
such file or directory" AFTER having already verified the signature and written the
`.env`. Fixing it means deciding between a signed asset and a clone, and it's a delivery of its own.
What the phase left DECLARED and not done: revocation still reaches
`{project, user}` and never `{key}`, and now it costs more (it brings down the agent in
ALL the projects of that machine); there's no screen to list and revoke a device
key, and the phase added a kind to list without building the screen — the
gap became LARGER, on purpose; one process per machine is a single point of
failure, the design's price; and `install --machine` still doesn't know whether the key
in that folder really is a machine one, because on disk both kinds are the same
file and whoever knows is the server

### The QA golden set measures again and runs on a schedule, weekly (AT-076/AT-149, ADR 0168) {#o-golden-set-do-qa-volta-a-medir-e-roda-agendado-semanal-at-076at-149-adr-0168}

Two deliveries, one human decision between them. AT-067 had measured that the
clock fit in an `ubuntu-latest` without a GPU and that the instrument didn't measure: since
RN-502 the `npm test` of a `container` project without a `running` container is
refused, and the seed never brought one up — 0/6 by construction. The maintainer chose
"path 1" and AT-076 delivered it: the seed brings up each case's container through the
PRODUCTION path (`module_map` → routing → `container_start` proposed by
Infra and approved by the owner → `ExecuteContainerStartUseCase` → broker → `running`
through the state machine), with `node:24.11.1-bookworm-slim` pinned by digest,
RN-502 intact, and a container that doesn't come up becoming a NAMED error that fails the
ExUnit (before, the body's `{:skip, _}` passed green silently). Two runs in CI
gave 3/6 and 3/6 against the 1/6 floor, with different cases, in 52 and 86 min of
job. AT-149 closed the cadence: WEEKLY (Saturday 01:17 UTC, plus
`workflow_dispatch`, never `pull_request`), in `golden-set-qa.yml`, in the mold of
`golden-set-rag.yml`. Weekly and not nightly because a run costs up to 86 min and
VARIES — the same total through different cases —, and once a week is enough for the floor
to flag a drop. `timeout-minutes: 150` for the worst measured case. The verdict is
the test's own; the workflow adds only two INSTRUMENT guards (the score
line must exist, and the event log can't have an RN-502 refusal) and, on
failure, prints the logs like the RAG one — no issue. The image to pull before the seed
is READ from the seed's constant, never from a second literal, because the broker's `docker run`
runs under the 30 s control ceiling (RN-604). The proof run, with a
temporary `push` trigger removed before the PR, was 36327281774: 3/6
again, zero RN-502 refusals, 10 min of `mix golden_set.qa` and 13 min 41 s of
job. Declared: the CI broker doesn't have the compose's five layers, the heartbeat
closes the seed's sessions while QA is still working on them (with no visible
effect), and a PR that touches the workflow doesn't run it.

### The Infra Lead converses through the composer (AT-141, ADR 0175, RN-617) {#o-infra-lead-conversa-pelo-composer-at-141-adr-0175-rn-617}

RN-584 (AT-098) removed the chat's default recipient and left the product
question in writing: does the Infra Lead converse? The maintainer said yes on
2026-09-27, with the condition RN-584 itself had set — the turn first.
The Infra Lead's turn ran ENTIRELY inside `handle_call`/`handle_cast`: without
acceptance, without "Stop", outside `TurnoOrfao`, with the loop's 14th step ending
silently and a 180 s ceiling smaller than the 225 s of the container `propose_action`
(RN-605). The kickoff, being a `cast`, didn't hold a click, but it held the process —
8.4 min measured in AT-089 —, and a message in the meantime would wait in the queue.
Stage 1 put the three turns (kickoff, gate correction, message) into
`TurnoAssincrono`, with the Workflows consolidation inside the Task; a gate
correction arriving with a turn in progress got a queue, because `TurnoAssincrono`
without `from` would discard it. Stage 2 gave `infra` the `message/2` clause
(the `agente_sem_conversa` refusal went away), the `via_for` of "Stop" and a place in
`AGENTES_DE_CHAT`; the acceptance of its handoff stayed in RN-499's own card, and
the thread card excludes it by name. `SOLO_CONVERSATIONAL_AGENTS` didn't change: the Infra
Lead is an area lead. Declared: it didn't get structured questions nor
backlog reading.

### Credentialed git runs on the runner's host, the code in the container (AT-116, ADR 0193, RN-676) {#o-git-credenciado-roda-no-host-do-runner-o-código-no-container-at-116-adr-0193-rn-676}

2026-10-01, round 36. RN-558 had closed the SILENCE half — the authenticated `git
fetch` in `runner` mode, with the container up, stopped running with
empty variables and started being refused with the mark
`credencial-nao-atravessa-o-container` — and declared the other half as a pending
ADR, because every known option touched the containment port of ADR 0130.
The owner's decision (01/10) chose the one that doesn't touch it: credentialed git operation
on the HOST, code in the container. Measured before: the engine's only `exec` with `env`
was `RunnerGit.fetch!/3`'s fetch; there was no credentialed `push` nor `clone`
through `exec` (the folder-creation clone already ran on the host, RN-532); and the folder is
the same on both sides (`estado.dir` mounted at `/work`). The chosen discriminator
was an explicit MARK from the engine (`gitCredenciado: true`, set only
by `RunnerRouter.exec_git_credenciado/5`), and not the `env` that already existed —
with `env` as the key, any command with `env` would escape the container. RN-558's
refusal survived shrunk, for `env` without the mark, and in practice
came to mean "runner older than ADR 0193". The proof is AT-111, on both
sides: on the runner, a real `git credential fill` and `git fetch origin` with
`GitAuth`'s helper succeed on the host with the container active; on the engine, the chain
through the real `TerminalChannel` ends in `{:ok, _}`. The ExUnit tests didn't run in the
delivery environment (`repo.hex.pm` 403) and were left for CI.

### The consultative session without an agent asks for an agent (AT-254, RN-682) {#a-consultiva-sem-agente-pede-um-agente-at-254-rn-682}

2026-10-01, round 36. In the real use of 29/09 a consultative session without an agent
answered "I don't have access to previous conversations": the message without a
recipient went to the SSE of `POST .../chat`, which sends the bound model only the
current text — no history, no system prompt — and writes the reply with the
model's name as the actor. The owner's decision (01/10) was to ask for an agent instead
of giving history to the free chat. Measured before: the screen was the only client of the
route (the `curl` printed by the seed is a development hint, in a creative
session), and the `SendChatMessageUseCase` use case had a second legitimate
consumer, the provider smokes, which use it as an end-to-end instrument
in a session without an agent. That's why the api's refusal lives in the ROUTE, in its own
guard, and the use case stayed intact. On the screen, the recipient line started
carrying the manual handoff's own selector when there's no agent — the same
usual gesture, now in the place where it is the only way for the message to have a
destination —, and the Criativo stayed off the list because the consultative session promises it
doesn't come in.

### Revocation targets the key, and not the `{project, user}` pair (AT-013, ADR 0201, RN-685) {#a-revogação-mira-a-chave-e-não-o-par-projeto-usuário-at-013-adr-0201-rn-685}

2026-10-01, round 36. RN-520 had made revocation reach the live
connection, with the `{project, user}` target because the credential's identity died
in `PatAuthGuard`; ADR 0154 put *"revocation by key"* among what it didn't
do, and PR #534 gave the machine key the same pair applied project by
project. AT-013 stayed blocked by scope and by decision until the owner
chose (01/10): by KEY, with an ADR, touching the engine. Measured before: the
ticket was born from `{userId, kind}`, the socket kept only project/user/kind,
and the channel compared the user — the same user's runner with a PAT or another
key fell along; the machine key's connection in a project outside the api's
list stayed up; a ticket issued before the revocation got in after it; and
revoking a PAT brought down nothing. Delivered: two nullable columns in the ticket
(an Ecto migration, the table is the engine's — Drizzle's journal stayed at `0068`),
the guard annotating the credential after authorizing, the socket id gaining the
kind and id of the credential, and a `runner/disconnect-credential` route that voids
the pending tickets and asks every runner in the cluster whether it was born from it. The
AT-013 prohibition (not ceasing to bring down what used to fall) became two transition
pieces: the legacy connection falls through the pair in the row's projects, and an engine
without the route makes the api go back to the pair. The pair stayed as the target of member
removal. The screen changed only the confirmation text (RN-561). The runner didn't change.
The ExUnit tests didn't run in the delivery environment (`repo.hex.pm` 403) and were left
for CI.
