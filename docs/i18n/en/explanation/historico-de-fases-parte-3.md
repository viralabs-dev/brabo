---
id: historico-de-fases-parte-3
title: "Phase history, part 3: Program 28 and audits"
sidebar_label: "Program 28 and audits, part 3"
description: "Program 28, the fluxo.yml × code audit and the team's agents, up to the knowledge graph."
keywords: [history, phases, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Phase history, part 3: Program 28 and audits

:::historico 2026-09-11
Program 28 (wave by wave), the fluxo.yml × code audit, the team's new agents and the knowledge graph.
Text moved without rewriting from the [Phase history](historico-de-fases.md). What holds today lives in the RNs and the ADRs.
:::

## PROGRAMA 28 — Wave 1, front A: the theme stops being unreachable (RN-182..185) {#programa-28--onda-1-frente-a-o-tema-deixa-de-ser-inalcançável-rn-182185}
The light theme existed in `design/tokens.css`, had a parity test and was
described in `design/README.md` as if it were a screen — and **nothing in `apps/web`
wrote `data-theme`**. The only way to see it was to type the attribute in
DevTools. The two contrast tests knew and said so: one asserted by `expect`
that THREE light pairs fail, "a record of what is inherited, not a guarantee of what
is rendered". While it lasted, the argument was honest — measuring a screen
nobody can open is measuring an intention. With the theme button arriving, it
flips sign.

**The boot is a FILE** (`apps/web/public/theme-boot.js`), synchronous in `<head>`,
before the bundle. The handoff says to use an INLINE script; the image serves under
`script-src 'self'` (ADR 0058), so inline would work in `pnpm dev:web` and
be blocked in production — ADR 0036's failure with another subject. `tema.ts`
is the API the shell consumes; the button doesn't live in it. A `localStorage` that throws
degrades to "paints and doesn't persist", and an unknown value falls to the default.

**Six light-theme tokens changed value** (ADR 0074), because the light theme's most
demanding background is the paper `--code-bg`: accent 3.56 → 4.81, warning
3.15 → 4.98, success 3.89 → 5.12, violet 4.16 → 4.95, text-muted 2.76 → 5.17,
plus accent-hover one step below. The DARK didn't change any, and its debt
stays locked at the same five numbers. Two side effects recorded: the
five pairs that are debt in the dark PASS in the light, and the "known exception of the
design system" (`--on-accent` over `--accent`, 3.20:1) disappears in the light — the
fix the test's comment described, darkening down to `--terracota-500`, is
what the light theme now does.

**Five of the handoff's eight `--syn-*` values were REFUSED by measurement** (the
worst, `--syn-cm`, gives 2.32:1 in the light). Where the handoff fails, the measured
number holds: it's the same rule as the fonts. The eight roles now exist with the prefix
`--syntax-*`; the five semantic ones that still paint are measured alongside them.

## PROGRAMA 28 — Wave 1, front D0: spend by provider (RN-186..188) {#programa-28--onda-1-frente-d0-gasto-por-provider-rn-186188}
**The containment changed nature, and that is what matters — not the new axis.**
`provider` became a dimension of `sumGroupedBy` again, revising ADR 0063 by
the product owner's decision. Before, the member couldn't reach the breakdown by
CREDENTIAL because it didn't exist — ADR 0063 wrote "there is no argument to
pass". Now it exists, and whoever contains it is the TYPE: two overloads, and the scope that
carries `actor` (the only one of the member's view) only accepts
`Exclude<SpendDimension, 'provider'>`. The guarantee went from "impossible to
express" to "impossible to compile", which is weaker — and that is why the
barriers are TWO and independent: the member's route also has no dimension
parameter at all. No `if` on the combination, on purpose (same lesson as
RN-153/154), and the proof was by INVERSION: without the `@ts-expect-error`, `tsc` flags
`TS2769` on the exact line.

`porOwner`/`porAgente` are a partition of `porAtor` by `actor_kind`, with no extra
query; `system` stays out of both and remains in the total. The index on
`token_usage(created_at)` that ADR 0063 measured and postponed came in in migration `0044`.
The SCREEN didn't change — that's a later wave.

## PROGRAMA 28 — Wave 2, front H2: model ranking without an invented score (RN-210, ADR 0077) {#programa-28--onda-2-frente-h2-ranking-de-modelos-sem-nota-inventada-rn-210-adr-0077}
The handoff asked for two things that depended on the SAME data the product doesn't
have: a quality score per capability (mock: "code → claude-sonnet-4 /
qwen2.5-coder:14b (9.4)") and an "ideal" badge in `ModelPicker` when the
model covers "all the capabilities required by the agent". The investigation
confirmed twice that this second data doesn't exist: `ModelsSection` itself
had already renamed the "Agent · capabilities" column to just
"Agent" for that reason, and the agent-binding `ModelPicker` reads
`GET /projects/:id/models` (role `viewer`) — the curation (`uses`, ADR 0051)
only exists in `ModelComCuradoria`, from a `maintainer`-only route. The badge was NOT
built; the "Best models per capability" table WAS, with two
real signals: how many of the project's agents already resolve, through the cascade, to
each curated model, and the catalog cost as a tiebreaker — never a
calculated score.
## PROGRAMA 28 — Wave 2, front B: the sidebar collapses (RN-195..201) {#programa-28--onda-2-frente-b-sidebar-recolhe-rn-195201}
264px/62px with an icon track when collapsed; expandable projects revealing the
tabs (read from `project-tabs.ts`, never hardcoded); the Activities section grouped
by REAL base agent/instance — the `-2` suffix of `extraDevAgentId`, never an
invented `-01/-02` counter (finding of Wave 1/front B0) —, scoped to the
current route's project, not all of them, so as not to open N+1 event reads. Theme button
in the footer; the two inert global items go, only Projects and Activities
are global; auto-collapse of the Code tab via `AutoCollapseContext`
(`sidebar-state.ts`), without saving a preference. Persistence centralized in
`sidebar-state.ts`, the handoff's six `brabo.*` keys.

Two divergences from the handoff documented and NOT resolved (RN-197): the project
badge remains `pendingApprovalsCount` (RN-151 wins, it's more recent) and the
handoff's identity color only appears on the collapsed track — the expanded
line keeps only the existing status dot (RN-039), two dots would be noise.
## PROGRAMA 28 — Wave 2, front C: screen frame (RN-202/203, ADR 0078) {#programa-28--onda-2-frente-c-moldura-de-tela-rn-202203-adr-0078}
The four literal fixes of the handoff's "screen frame" checklist:
`.headerTop` got `min-height: var(--header-h)` — a FLOOR, not a ceiling, because the
project header (identity + compact `TokenMeter`) is richer than the
generic header of the handoff's 6 internal screens, and forcing 60px would cut the
budget alert, the same class of error RN-088 forbids; the active tab with
`box-shadow: inset 0 -2px 0 var(--accent)` instead of `border-bottom`; horizontal
scrolling on the ruler; a content container with `max-width: 1040px` on the
document-shaped tabs (not on the `semRespiro` ones). The ruler's spacing values
that lived as a descendant CSS override in `ProjectPage.module.css`
since FASE 16 migrated to `Tabs.module.css`, now with the same owner.

The part that required a decision, not just CSS: the handoff lists 7 project tabs and the
registry (`project-tabs.ts`) has 10. `executores` (RN-121), `backlog`
(RN-048) and `insights` (Psicólogo hypotheses) were born AFTER the handoff, with
real data and their own RN, and they STAY — the handoff is a VISUAL fidelity reference,
not a ceiling on how many tabs the product has (RN-203, ADR 0078). And the
`sessions` key remains labeled "Chat", never "Chat RAG" as the handoff's most
recent version asks (RN-202): "Chat RAG" would describe a feature that doesn't
exist — the embeddings contract is ready (ADR 0075) but nothing consumes it yet,
with no indexing pipeline and no citation UI — and renaming the tab
today would be the same error ADR 0042 already refuses for a catalog model:
announcing a capability before it exists. No export SHAPE changed
(`AbaDoProjeto`, `ABAS_DO_PROJETO`); only the `code` label went from "Code" to
"Código".

## PROGRAMA 28 — Wave 2, front H1: visible focus (ADR 0036) {#programa-28--onda-2-frente-h1-foco-visível-adr-0036}
`Select`, `Modal` (close button) and `ProjectCard` got `:focus-visible`
with the same calibrated treatment as `Input.module.css`, including the
`forced-colors` block: none of the three had a focus indication reachable by
keyboard alone. The `Modal` close button went up from 30px to 32px, the desktop
touch-target floor. `Table` and `Badge` were audited and did NOT need
change — neither exposes an interactive affordance of its own: a
`Table` row is pure presentation (whoever needs a clickable row already uses
`<button>`/`<a>` inside the cell, via `render`) and `Badge` is not used with
`onClick` anywhere in the product.

## PROGRAMA 28 — Wave 3, front H3: the Criativo tab gets KPIs without faking data that doesn't exist (RN-227..230) {#programa-28--onda-3-frente-h3-a-aba-criativo-ganha-kpis-sem-fingir-dado-que-não-existe-rn-227230}
The handoff asks for 4 status seals for the session's 5 real states
(`created/active/closing/closed/closed_abnormally`). `closed_abnormally`→
aborted and `created`→waiting are direct; `closing` was NOT merged with
"closed" — it gets its own seal ("closing", `accent` tone, pulsing),
because in `closing` the outcome isn't known yet and calling it "closed" would
lie about that. The pill filters (only 4, for the same reason) group
`created` and `closing` by TRAJECTORY, not appearance: `created` falls in
"Active" (still in play), `closing` falls in "Closed" (on the way to closing
without error) — the row's seal is never rewritten by the filter, only the grouping
changes. Of the 4 KPIs, two are honest about missing data: "cost this month"
REUSES `getMySpend` (same `queryKey` as the Spend tab, the
member's view/RN-101) and never shows the project total — which is the owner's data
(`porProjeto`), and the Criativo tab is seen by any member; "ideation
→ commit rate" is DECLARED absent (shows "—"), because there is no link between
session and commit in the product today — inventing the calculation would be the same class
of error ADR 0042 already refuses for a model score.

## PROGRAMA 28 — Wave 4, front G2: the RAG Chat gets an indexing pipeline and hybrid search (RN-231..238, ADR 0080) {#programa-28--onda-4-frente-g2-o-chat-rag-ganha-pipeline-de-indexação-e-busca-híbrida-rn-231238-adr-0080}
On top of the `chunks` table from Wave 3 (ADR 0079): MANUAL indexing (no
watcher, `POST .../rag/reindex`, idempotent full rebuild — deletes the
scope/session before recreating) of the three honest scopes — `docs`/`adr`
via `ReadProjectCodeUseCase` (same credential/gate/path check
as the Code tab) and `session` only from `chat.message`/`agent.response`. Chunking
by heading/paragraph, 1200 characters with 150 of overlap —
documented as a starting point, not a calibration against real data (there
isn't, yet, a body of questions run against the index). Hybrid search
is TWO independent queries (vector via HNSW, lexical via GIN),
fused by a weighted sum (0.6/0.4) and cut at a threshold (0.2) —
numbers that are also a starting point. When the embedding provider (fixed:
`ollama`) doesn't answer, the pipeline writes the chunks WITHOUT a vector and declares the
gap in the report — it never fakes complete indexing, and the search degrades
to lexical-only with a warning. The screen (RAG Chat as its own tab) belongs to Wave
5; this front is just the backend.

## PROGRAMA 28 — Wave 4, front F1: the container lifecycle becomes a table, without an orchestrator (RN-243..248, ADR 0081) {#programa-28--onda-4-frente-f1-ciclo-de-vida-do-container-vira-tabela-sem-orquestrador-rn-243248-adr-0081}
See item 31 of FASE 25 (PARTIALLY REVOKED): `project_containers`
(migration `0046`) writes the mutable STATE — `provisioning → running ⇄
stopped`, `failed` reachable from all three, `removed` only leaves by reprovisioning
— distinct from `artifact.project_image` (the Arquiteto's immutable
DECISION). Confirmed by investigation (grep, zero occurrences):
NO service of the product mounts `/var/run/docker.sock` nor runs
`privileged` — both use cases only WRITE and READ, no real call
to Docker. The first transition requires the image already decided (RN-105)
and FREEZES version/resources in the row; a `local` project (ADR 0072) is
refused, because it doesn't bring up its own container. The resource ceiling
(`cpus`/`memory_mb`/`pids_limit`) is DECLARED, not applied — no
screen asserts "the container is limited to X", only "the recorded intention
was X". No new HTTP route at the time: without a real consumer yet, exposing
one would be guessing a contract — closed by Wave 5/front F2 just below.

## PROGRAMA 28 — Wave 5, front G3: the RAG Chat gets its own tab (RN-252..254, ADR 0082) {#programa-28--onda-5-frente-g3-o-chat-rag-ganha-aba-própria-rn-252254-adr-0082}
The screen that RN-202 (Wave 2/C) had postponed — "Chat RAG" would describe a
capability that didn't exist yet — arrives together with the backend of Wave
4/G2: `key: 'rag'`, a NEW tab (`ordem: 28`, between Code and Backlog),
NEVER renaming `sessions`. The distinction stays the same, only the reason
changed: `sessions` is a conversation with an ACTIVATED agent (spends the owner's key
per turn, RN-058); `rag` is a search over an already built index, with no
agent at all in between, read-only by nature. The screen consumes the three
contracts of ADR 0080 without guessing shape and shows the two honest
degradations the backend already declared and no screen read — `vectorAvailable:
false` becomes a visible warning, and the coverage never invents "reindexed
Xmin ago". A citation with `session` origin navigates to the exact EVENT, reusing the
mechanism the Psicólogo's evidence chips already use; `file` origin
shows path/heading as text, without a link — the Code tab has no
deep link by path today, out of scope here.

## PROGRAMA 28 — Wave 5, front F2: the real consumer of the container lifecycle (not the terminal) (RN-267/268, ADR 0083) {#programa-28--onda-5-frente-f2-o-consumidor-real-do-ciclo-de-vida-do-container-não-o-terminal-rn-267268-adr-0083}
The original plan for this front was the complete interactive terminal. The
investigation confirmed that FASE 25b remains cut: no service
mounts `/var/run/docker.sock`, and even after ADR 0081 nothing in
production transitions `project_containers` — there is no real container
to open a terminal INSIDE it. Implementing a faked terminal, or one
running in the same container as Brabo's monorepo (the debt ADR 0055
already describes as policy, not isolation), would invent capability — the
same error ADRs 0041/0042 refuse for an LLM provider and a catalog
model. The real delivery: `GET /projects/:projectId/container/lifecycle`
(role:viewer), the first HTTP exposure of the lifecycle (revises ADR
0081, which had postponed the route for lack of a consumer), and the Terminal tab
showing that state — translated badge, failure reason — UNDER the
explanatory text that already existed, never in its place, fetched only while the
tab is open. `null` (never provisioned) is the honest and
most common result today.

## PROGRAMA 28 — Wave 5, front I: social login revokes the prohibition from the ADR 0031 backlog (RN-272..283, ADR 0084) {#programa-28--onda-5-frente-i-login-social-revoga-a-proibição-do-backlog-do-adr-0031-rn-272283-adr-0084}
Explicit request from the product owner, aware of the security
consequences — the prohibition goes away only for GitHub/GitLab; MFA, OIDC provider and
generic federation remain out of scope (see "What NOT to do").
`SocialLoginCallbackUseCase` ends in the SAME `EmitirSessaoUseCase` as the
password login — no second session format. It reuses the existing OAuth
client, but the `state` has its OWN purpose
(`purpose: 'social_login'`, checked BEFORE any other field):
it never accepts the `state` of the git CONNECTION flow to a project, which
would be privilege escalation. New table `social_identities` (migration
`0047`), key `(provider, provider_user_id)` — never email/login.
A three-step decision: known identity → login; email matches an
existing account AND verified by the provider → links (and verifies the
account's email if it wasn't yet); email matches but NOT verified →
refuses — a typed email isn't proof of ownership, accepting it would open
account takeover; no matching account → provisions a new account without
a password, same "pending" state as the Keycloak migration. It reuses the SAME
OAuth app as the git connection — zero new environment variables, only
different `redirect_uri`/`scope` per flow; the OPERATOR's action of
registering the second callback in the provider is what justifies the
`breaking/` branch.

## fluxo.yml × code audit — the Dev Lead's plan becomes a real approval (RN-284, ADR 0086) {#auditoria-fluxoyml--código--o-plano-do-dev-lead-vira-aprovação-de-verdade-rn-284-adr-0086}
Not a planned phase: it closes the divergence a read-only audit of
`docs/fluxo.yml` × code found (finding A2,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) — the flow already declared the
`dev-lead`'s `plano-de-paralelismo` output as `via: proposed_action`
since ADR 0085, and the code was never adjusted to match. The product
owner decided the code was wrong.

`propose_execution_plan` entered `decide.ts` (minimum role
`maintainer`), DELIBERATELY outside the absolute ceilings block — it can be
configured to auto-approve, unlike
`parallelize`/`raise_max_parallel`. The Dev Lead is the FIRST conversational
agent (they all run a synchronous turn via `GenServer.call` of up to
180s) to suspend waiting for a human decision — the pattern already existed for
the dev agent (ADR 0052) and the QA/Infra gates (ADR 0057), but those two are
triggered by `cast` and never had to deal with a pending synchronous `from`.
`TurnoAssincrono.tratar_resultado/2` gained a branch: when the
`:aguardando_aprovacao` key is present (checked by VALUE, not by presence —
the Dev Lead carries it as `nil` since `init/1`), it replies to `from` the same
way and at the same time as always, but emits only `agent.status:
awaiting_approval` instead of `agent.done` — the turn hasn't ended.
`LiveBroadcast.agent_status/4` got the new status in its guard. The resumption
uses the SAME `Engine.Dev.Wake` that `QaLeadServer` already reuses for the
QA subagents (delivery is per AGENT, not per type).

**Accepted gap, declared**: without its own state table, an engine restart
while the Dev Lead is suspended loses the subscription — the decision
remains recorded and visible in Approvals, but it doesn't narrate the outcome
on its own. Closing this would require the same persistence mechanism as ADR
0052; out of scope for this fix, which only aligns the behavior with what
`docs/fluxo.yml` already declared.

## UX Designer — the fifth conversational agent, brought forward (RN-285..287, ADR 0087) {#ux-designer--o-quinto-agente-conversacional-antecipado-rn-285287-adr-0087}
It's not a triggered separation trigger — `docs/fluxo.yml` always declared
"when the MANAGED project has its own interface to design" as the
criterion, and it didn't fire: the design system remains static input.
A CONSCIOUS decision by the product owner to bring the role forward anyway.

`Engine.Agents.UxDesignerServer` mirrors `DevLeadServer` — a GenServer per
session, ceiling of 14 iterations, activated by an `accepted` handoff addressed to
"ux-designer" through the already existing GENERIC mechanism (no line changed in
`ActivateAgentUseCase`). SOLO: no area, no subagents. The kickoff reads the
most recent `artifact.product_brief` — the SAME "business need"
the Criativo produces, without a new artifact — and the design system
(`design/tokens.css`, `design/COMPONENTS.md`) is DESCRIBED in the
agent's identity (`Engine.Harness.Agents`), static text: the conversational agents
have no tool to read repository files.

`propose_prototype` is the ONLY tool (`personas`, `jornadas`,
`prototipo` with `telas`/`anotacoes`, `resumo`). It writes
`artifact.prototipo_navegavel` **without a dedicated use case in the api** —
unlike `choose_project_image`/`create_c4_diagram`, which need one
because they have content DERIVED from another artifact or a shared domain
refusal; neither reason holds here, so the shape validation
lives in the engine (`ArtifactSchemas`) and the write uses the generic
`append_event_returning` the api already exposes, the same path as `artifact.product_brief`. One
single artifact, two handoffs about it — to "po" and to "dev-lead" — never
a second artifact for "spec-visual": the prototype (screens + annotations) IS the
visual spec, and duplicating it would risk the two copies diverging later. It reuses
the half of ADR 0086's design that survives without its suspension:
a successful `propose_prototype` ends the turn, so the model doesn't propose
again and duplicate the artifact — without the "aguardando_aprovacao", because proposing
a prototype has no external effect.

`apps/web/src/lib/agents.ts` got the entry (`color: var(--accent)`, the
least reused semantic token of the roster; `icon: PencilIcon`).
`uxDesignerActive` entered the roster in BOTH sources RN-090 requires in
sync — the team panel (`agent-status.ts`) and the dashboard card
(`projects-summary.repository.ts`, the same `infraActive` query
widened, no new query).

**Out of reach, declared**: `teste-de-usabilidade` requires a real human
user — no agent replaces that. `metricas-de-uso` remains a gap even
with `analytics` `active` (ADR 0089): the funnel report measures
session→commit→PR→merge, not feature adoption by the FINAL users of the
project Brabo builds — "evidence of adoption per feature" is
DECLARED as a metric with no path to exist today, not a pending item to
close next round.

## Staff — code ready, dormant for automatic triggering (RN-305/306, ADR 0088) {#staff--código-pronto-dormente-para-disparo-automático-rn-305306-adr-0088}
Not a planned phase: `docs/fluxo.yml` declares the Staff/Principal Engineer
as `status: planned` since ADR 0085 ("contract ready, activation
decided, waiting for a trigger"). A CONSCIOUS decision by the product owner:
bring the CODE forward knowing the AUTOMATIC trigger (the Anamnese
noticing a RECURRING systemic problem) won't fire — the Anamnese
is paused (`ANAMNESE_ENABLED=false`, decision of 2026-08-10). Dormant
for automatic triggering, not for MANUAL invocation.

The sixth solo conversational agent (`Engine.Agents.StaffServer`), alongside
Criativo/PO/Arquiteto/Dev Lead/UX Designer, mirroring the Arquiteto (bounded
loop, ceiling 14) with two differences: NO `kickoff/1` (there is no session
artifact to summarize — it comes up and stays idle until the first `user_message`,
which is how whoever addressed the handoff explains the problem) and activated by the
GENERIC path of `canActivateAgent` (an `accepted` handoff addressed to
"staff"), without entering `USER_STARTED_AGENTS` — investigation confirmed that
no domain change in the api was necessary, because
`assertHandoffTargetAllowed` only refuses an area subagent and the Staff has no
area. The only tool, `propose_rfc` (problem, options with trade-offs,
recommendation, disposable PoC), writes `artifact.rfc_staff` DIRECTLY via
`append_event_returning` — the same tableless pattern as `emit_insight`, and
not that of `artifact.c4_diagram` (which derives the Container level from the
module_map in the api) — and returns the handoff to the Arquiteto in the SAME tool call,
without a `proposed_action` (recording a document is not an external effect).

`staffActive` entered the team panel roster and the dashboard card
(`ProjectCardSummary.roster`), same criterion as `infraActive`, so as not to
open the divergence the `RosterFacts` comment already warned about.
**Declared, not hidden**: `SessionPage.tsx`/`AGENTES_DE_CHAT` were not
touched — the same pattern already accepted for `infra` (a REAL and ACTIVE lead
also outside that list). The end-to-end usage path today is the internal
route (`POST .../agent/message`, `agent: "staff"`), not the Session
screen; the generic "manual handoff to an agent of choice" UI remains in the
backlog.

## The `implementavel` gate active — QA strategy as the qa-lead's second moment (ADR 0090) {#o-gate-implementavel-ativo--qa-estratégia-como-segundo-momento-do-qa-lead-adr-0090}
A conscious decision by the product owner to bring forward the trigger
`docs/fluxo.yml` already foresaw ("when the implementavel gate activates") — the
trigger HERE is the very work of building the mechanism, not a usage symptom
waiting to happen. `docs/gates.yml`, `implementavel`:
`status: planned` → `active` (owner `dev-lead`, `severidade: warn`
untouched — the registry already said "it's born warn even when it activates").

**QA strategy stops being a `proposto` role**: it is the `qa-lead` ITSELF, in a
second MOMENT — same process, a deliverable separate from the PR verdict,
exactly as `docs/fluxo.yml` already declared ("it may be the qa-lead itself
in a second MOMENT, not necessarily a new agent: the separation is by
deliverable"). `Engine.Gates.QaLeadServer.run_design/3` is a NEW and ADDITIVE entry
point (without touching `run/2`, the usual path, tied to
`DevAgentState.find_by_task_id`), triggered by
`Engine.Gates.Dispatcher.run_qa_estrategia/3` (the same test-swappable indirection
`run_qa/2`/`run_secops/2` already use).

`Engine.Gates.QaEstrategiaAgent` is a STATELESS module (not a `GenServer`),
the same shape as `QaPerformanceSegurancaAgent` — a registry without `Terminal`
(`ReadFile`, `SearchWorkspace`, `EmitPlanoDeTeste`) —, but the CONTEXT is
different: `Engine.Gates.QaEstrategiaContext.fetch/3` fetches ONLY the story (from
`list_backlog`) and the current `module_map` (from `get_infra_context`, reused only
for the `moduleMap` field — zero new route), without `dev_state` or
`worktree_path`, because the gate runs PRE-DEV: there is no dev agent, worktree
or `task_id` yet. None of the three tools goes through the
`ActionPipeline` (only `terminal`/`write_file` do), so this agent
NEVER suspends — `run_design/3` runs synchronously inside its own
`handle_cast`. The iteration ceiling stays at 8 (conversational), not 60
(gate) — ON PURPOSE: with no `token_budget_micros` underneath (there is no task,
PRE-DEV), the same reason `infra-workflows` stays at 8 even while using a
tool (RN-085). The deliverable (`emit_plano_de_teste`: synthesis,
executable criteria, a GENERIC automation strategy with no framework)
becomes `artifact.plano_de_teste` in the event log of the calling session.

`assess_implementability`, a new Dev Lead tool, reads the most recent
`artifact.plano_de_teste` of the story in its OWN session's
history: with no plan yet, it triggers the assessment and returns an error asking for a
retry (a tool error is loop INPUT, not the end of the line —
RN-163); with a plan, it proposes the opinion (`implementavel`/`inviavel` +
justification, plan embedded in the payload) as a `proposed_action`, the SAME
three-outcome pattern as `propose_execution_plan` (ADR 0086) —
`maintainer`, DELIBERATELY outside the absolute ceilings block of
`decide.ts`.

**`appsec` stops being `proposto`** — the SecOps second moment comes in the
next section.

## appsec gets the secops second moment (RN-360/361, ADR 0090) {#o-appsec-ganha-o-segundo-momento-do-secops-rn-360361-adr-0090}
`docs/fluxo.yml` (`id: appsec`, camada_seguranca) declared in advance
"same pattern as QA: two MOMENTS, not two agents for now" — a
conscious decision by the product owner to bring the activation forward, without waiting for the
`implementavel` gate (front `qa-estrategia`, same conceptual ADR 0090) that the
registry itself cited as the trigger.

`Engine.Gates.SecOpsAgentServer.run_design/2` runs in the SAME process as the
PR secops (same `Registry` key), without any `Diff`/`Scanner`/
`DevAgentState`: it fetches the story from the backlog + the current `module_map`
(`Engine.Gates.AppSecContextBuilder`, without `dev_state`/`worktree_path`) and
calls `Engine.Gates.AppSecAgent.run/3` — a STATELESS module (not a GenServer,
the same shape as `QaPerformanceSegurancaAgent`), a tool registry WITHOUT
`Terminal`, running a STRIDE-lite checklist via `ToolLoop.run/1` over the
story's DESIGN, never over code. It ends by emitting `artifact.threat_model`
and creating a handoff to the three declared leads (arquiteto, dev-lead,
`infra` — the addressable AGENT of the id `area-infra`, RN-361).

**Declared gap, not a bug**: `run_design/2` is INVOKABLE, but nothing invokes it
on its own yet — the natural trigger is the Dev Lead's `assess_implementability`
(front `qa-estrategia`), out of scope for this delivery, which was kept
self-contained (`decide.ts`/`docs/gates.yml`/`dev_lead_tools.ex` untouched).

## `analytics`/`delivery-metricas` become a report (RN-320..322, ADR 0089) {#analyticsdelivery-metricas-viram-relatório-rn-320322-adr-0089}
A conscious decision by the product owner to BRING FORWARD two roles of the
target model (`docs/fluxo.yml`, `status: proposto`) without waiting for the
organic trigger each one already declared. The shape is the one the flow itself
prescribed: `analytics` "absorbed by `medicao`" until a PRODUCT metric
becomes mandatory PO input, `delivery-metricas` "never becomes an agent —
it becomes a REPORT of `medicao`". Both become a single SCRIPT —
`apps/api/scripts/analise-funil.ts` (`pnpm --filter api analise:funil --
--projeto <uuid> [--json]`), in the SAME format as `medir-execucao.ts`
(Fase 13b): a pure read via Drizzle, zero writes, no GenServer, no
LLM agent.

It measures FOR REAL, over `proposed_actions.execution_result` of the dev agent's three git
actions (`git_commit`/`pr_open`/`git_merge`, only `status:
'executed'`): a real funnel (how many sessions produced a commit / opened PR /
merged PR, and the conversion between stages — it counts SESSIONS, not actions), real lead
time (first commit to the session's first merge, by the EXECUTION's
`updated_at`, not the proposal's) and real deployment frequency (merge into a
`PROTECTED_BRANCHES` branch, per day, cross-referencing the
`backmerge` gate of `docs/gates.yml` — whose evidence is CI, out of reach of
a script that only reads the database).

Three metrics stay in a "Not measured, on purpose" section — a
PERMANENT declaration, not a gap to close next round: **the complete product
funnel ideation → commit** (`sessions` without `storyId`, RN-230, would require
a new schema — no migration in this front); **evidence of adoption per
feature** (it's not data that is missing collection — Brabo doesn't instrument the
projects it BUILDS, with no path at all for that telemetry to
exist today); **MTTR and change failure rate** (they require a real production
INCIDENT signal, the same dependency as `secops-runtime`/`platform` —
another front).

## `secops-runtime` as a report script (RN-375..377, ADR 0091) {#secops-runtime-como-script-de-relatório-rn-375377-adr-0091}
A decided bringing-forward by the product owner of the `secops-runtime` role
(`docs/fluxo.yml`, `camada_seguranca`, previously `proposto`), without waiting for the
declared trigger ("production with real traffic, after `DEPLOY_ENABLED` +
`platform` active"). Only what the trigger does NOT require comes in: `pnpm --filter api
relatorio:seguranca-runtime` reads `rate_limit_hits` — the data that the
ADR 0027 `RateLimitGuard` already writes, including under dev/CI traffic — and
produces a ranking of buckets (`user:<uuid>`/`ip:<endereço>`, the only two
formats written; no route or reason, which the table never stored) and a
temporal distribution in fixed slices. It's a SCRIPT, not an LLM agent nor a
`GenServer`: there's no decision to make about the data, only aggregation.

Automatic incident detection, incident response and security
postmortem remain OUT — they depend on the same trigger that didn't fire — and
the report lists them in a PERMANENT "not measured" section, without simulating an
example incident nor inventing a number (same principle as ADRs
0041/0042/0077). The retained window is short by design
(`DomainGaugesCollector.pruneRateLimit` deletes hits older than
`2 × RATE_LIMIT_WINDOW_MS`, 240s by default), and the report declares both
windows — CONFIGURED and OBSERVED — never letting the second pass for a
longer history than it is.

## `platform` gets a first delivery: an on-demand telemetry report (RN-385/386, ADR 0092) {#platform-ganha-uma-primeira-entrega-relatório-de-telemetria-sob-demanda-rn-385386-adr-0092}
A conscious decision by the product owner to bring forward part of the `platform` role
(`docs/fluxo.yml`, `camada_plataforma`) — whose `status` remains `planned` and
whose `ativacao` remains synchronized with `DEPLOY_ENABLED`, which doesn't exist.
`pnpm --filter api relatorio:telemetria [--projeto <uuid>] [--json]` is a
SCRIPT (not an LLM agent, not a `GenServer`) that reads, on demand, the SAME
questions `DomainGaugesCollector` already collects for the
Prometheus scrape — active/closing sessions per project, blocked tasks per
project, state of the last backup (always GLOBAL, never per project, because the
product backs up the whole database) — and ends after printing. The
SQL queries are REPLICATED, not imported from the collector: its methods are
private and end by writing to a Prometheus gauge, with no pure "just
the query" half to reuse without coupling a CLI script to the lifecycle of an
`@Injectable`.

The output always includes "where to see more" (the versioned dashboards in
`deploy/k8s/observability/dashboards/*.json`, the alerts in
`deploy/k8s/observability/alerts/brabo-alerts.yaml`, `docs/runbook.md
#observabilidade`, `pnpm dev:obs` for local observability) — a link, never
duplication — and a "not measured" section that DECLARES, without inventing: no
numeric SLO is defined in the product, a postmortem depends on a real incident that
didn't happen, and telemetry back into the product in a closed loop is what
would make `platform` `active` — the trigger (`DEPLOY_ENABLED`) remains absent. The
role's `gate_saida: { id: operavel, status: planned }` doesn't change;
`docs/fluxo.yml` only gets a `nota` on the `telemetria-consolidada` output
saying the manual/on-demand version is already real.

## dbre becomes two mechanical scripts (RN-400..403, ADR 0093) {#dbre-vira-dois-scripts-mecânicos-rn-400403-adr-0093}
Of the fluxo.yml `dbre` role, only two of the four deliverables depend on
real data volume (`plano-de-capacidade`, `tuning` — they remain a gap,
with no deadline). The other two don't need a real load: `parecer-de-
migracao` is pattern recognition in SQL text
(`apps/api/scripts/lint-migracao.ts`, scans `apps/api/src/db/migrations/
*.sql`, flags `DROP TABLE`/`TRUNCATE`/`DROP COLUMN`/`ALTER COLUMN ...
TYPE`/`ADD COLUMN ... NOT NULL` without `DEFAULT`, `!= 0` if it finds something — today
it finds 3 occurrences in migrations already merged and accepted, informative, not
fixed in passing); `backup-restore-testado` was already real since
Fase 5 (CronJob + `backup_runs` + `make test-restore` executed, RTO
~40s) — all that was missing was an on-demand report (`relatorio:backup`, the same
read as `DomainGaugesCollector.collectBackup()`). Neither of the two
goes into CI yet: the linter scans the whole repository, not the diff of
a PR, and would become a gate that fails a PR for a finding that isn't its own — see
ADR 0093 for the scoping technique (`pr-police.ts`) when that changes. The
"one migration per wave" rule (`meta/_journal.json`) stopped being
called the "mechanized version" of this role: it avoids snapshot
conflicts between agents in parallel, a concern orthogonal to "this SQL
has a risky pattern".

## fluxo.yml × code audit — Wave 1: fluxo.yml/gates.yml up to date {#auditoria-fluxoyml--código--onda-1-fluxoymlgatesyml-em-dia}
The first of the six waves of the audit plan (section D,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) to close — Waves 3, 4 and
5 had already been brought forward out of order (analytics/DORA, the
`implementavel` gate, QA strategy/appsec); this one is only metadata, no ADR, no
line of production code.

`docs/gates.yml` (`paralelismo-autorizado`): `status: planned` → `active`,
with `evidencia` in the SAME format as the neighboring `implementavel` gate —
`event_types: [proposed_action.created/approved/denied]`, `filtro: {
actionType: parallelize }`, `onde:
request-parallelization.use-case.ts` (finding A1/B5 — `fluxo.yml` already
said `ativo` since ADR 0053/FASE 14d, only `gates.yml` lagged behind).
`docs/fluxo.yml` got three more fixes from the audit, all of citation
or label, none of behavior: the `dev`'s state machine went
from 4 to 5 states (`awaiting_approval` came in, Fase 12e/ADR 0052 — A3); the
RN-160 citation left the Arquiteto's `backlog-promovido` input and went
to where it really applies, the `handoff-duplo` output (the
"Confirm architecture ready" button it locks — A4); the RN-161 citation
left `handoff-duplo` and became a note on the Dev Lead's input (it is the step of
ACCEPTING the handoff that chains execution activation, not the double handoff
itself — A5); and the origin of the `dev`'s `worktree-por-agente` stopped saying
`harness` (`Engine.Dev.WorktreeManager` is not one of the 4 components of the
`harness` role — A8). `docs/explanation/backlog.md` was also
updated: the line about the outdated `gates.yml` left the table of
pending items (closed here), together with the `implementavel` gate (B3, already
closed by ADR 0090 before this wave, without anyone having removed it from the table)
and the part of B7 (deployment frequency/lead time) that `analise:funil`
(ADR 0089) already actually delivers — MTTR/change failure rate remain
out, but as a PERMANENT gap already declared in `fluxo.yml`, not an
engineering pending item.

Verification: `pnpm --filter api validacao:gates -- --sem-banco` (valid
registry, no `ativo-sem-evidencia`) and `pnpm docs:check` green. Phase 3 of the
script (real evidence in the event log) requires `--projeto <uuid>` against a
database with data — out of reach of this fix, which is metadata only.

**Pending items of the same plan, not of this wave**: Wave 2 (Dev Lead →
dev delegation, RN-160 revalidated in the backend) and Wave 6 (the `necessidade-validada` gate,
which requires an ADR and a product decision before coding).

## fluxo.yml × code audit — Wave 2: RN-160 in the backend and Dev Lead → dev delegation (RN-404/405, ADR 0094) {#auditoria-fluxoyml--código--onda-2-rn-160-no-backend-e-delegação-dev-lead--dev-rn-404405-adr-0094}
The second of the six waves of the audit plan (section D), the TWO items of
largest scope after Wave 1 — the other four (3, 4, 5 brought forward out
of order; 6 still pending, requires an ADR and a product decision). Both live
exclusively in `apps/api`; no change in `engine`/`web` was
necessary.

**B6 — RN-160 revalidated in the backend.** The rule ("Confirm architecture
ready" requires at least 1 promoted story) was only guaranteed on the CLIENT
(`SessionPage.tsx`, `hasPromotedStory`) — a direct HTTP call to
`POST /agents/arquiteto/handoff-infra` ignored the rule entirely.
`OfferInfraHandoffUseCase.execute` now queries
`StoryRepository.findByProject` and refuses with `BadRequestException` BEFORE
writing the event or calling the engine, when no story has
`status !== 'draft'`.

**B1 — the Dev Lead → dev delegation becomes data.** ADR 0053 (item 5) already
foresaw this and declared it out of scope at the time — CLAUDE.md listed it as a
reversible cut. Closed here: `AcceptParallelizationUseCase.execute`
(API side, covers both the direct AND the approved-for-free paths, because both already
converge on it) writes `delegations` with `area: 'dev'`, `leadAgent:
'dev-lead'`, `subagent` = the id of the freshly activated `dev-<modulo>`. Unlike
QA/Infra (which write on the ENGINE side, because that's where the subagent produces
an opinion), `status: 'completed'` was REDEFINED for this area: it means
"the delegation was CARRIED OUT" (the agent came up), not "opinion issued" — and
`parecerArtifactId` points to the project's most recent `artifact.module_map`
(via `SessionEventRepository.listByTypeForProject`, an already
existing method, no new query). Without a module_map in the project — it shouldn't
happen —, the delegation isn't written with a fake id: it only logs the
unexpected state and moves on, because the dev agent's activation is already a success when that
write is attempted; a failure in `RecordDelegationUseCase` also doesn't bring down the
activation, for the same reason. Decision recorded in ADR 0094, which also
revokes the cut of ADR 0053 item 5.

`docs/fluxo.yml` (`dev-lead`, output `delegacao`): `status: lacuna` →
`status: ativo, regra: RN-405`.

## fluxo.yml × code audit — Wave 6 (last): the `necessidade-validada` gate (RN-406, ADR 0095) {#auditoria-fluxoyml--código--onda-6-última-o-gate-necessidade-validada-rn-406-adr-0095}
It closes the LAST of the six waves of the audit plan (section D,
`docs/explanation/auditoria-fluxo-vs-codigo.md`) — all six closed: 3,
4 and 5 had been brought forward out of order (analytics/DORA, the
`implementavel` gate, QA strategy/appsec, ADRs 0089/0090); 1 and 2
closed in the previous PRs (fluxo.yml/gates.yml up to date; RN-160 in the
backend + Dev Lead → dev delegation). This is the 6th: the
`necessidade-validada` gate (Criativo → PO), declared `proposto` since ADR
0085 with no mechanism at all behind it.

`modelo-de-time.md` already recorded why it stood still: the Criativo (the
model) deciding on its own that the need it produced itself is
validated would be self-validation, not a real gate. The product owner's
decision was a SEPARATE human confirmation — a third button in
`SessionPage.tsx`, "Confirm need validated", in the SAME pattern as
"Confirm architecture ready" (RN-160): a dedicated route
(`POST .../agents/criativo/validate-necessity`), a dedicated use case
(`ValidateNecessityUseCase`), its own event (`necessity.validated`).
It never reused `confirm_readiness`/RN-142 (which remains just the
structural floor, "≥1 captured rule") nor the PO's acceptance of the handoff
(`AcceptHandoffUseCase`, structural, without judgment of content).

The chaining chosen: the button only enables AFTER `confirm_readiness`
has consolidated the `artifact.product_brief` (`hasProductBrief`) — it makes no
sense to "validate" a summary that doesn't exist yet, and it is the most
consistent reading of `docs/fluxo.yml` (the gate is the Criativo's OUTPUT, the
moment its work has already delivered a concrete artifact).
Unlike `OfferInfraHandoffUseCase`, this confirmation does NOT signal the
engine — the Criativo→PO handoff already happened inside
`confirm_readiness` itself, so the new event is only the record of MERIT, with no
trigger at all waiting for it.

`docs/gates.yml` gets the `necessidade-validada` gate: `active`,
`aprovacao_humana: true`, but `severidade: warn` — nothing in the product today
CHECKS the passing of this gate before letting the PO proceed, unlike the
`block` ones of `story-promovida`/`plano-de-adocao`, which have a real code
lock behind them. `docs/fluxo.yml` (`criativo`, `gate_saida`): `status:
proposto` → `status: ativo, regra: RN-406`.

## fluxo.yml × code audit — B4 (the LAST pending item): the PO reads product metrics (RN-407) {#auditoria-fluxoyml--código--b4-a-última-pendência-o-po-lê-métricas-de-produto-rn-407}
It closes item B4 — the last line of the table "Team model backlog
(ADR 0085)" in `docs/explanation/backlog.md`; the table is EMPTY after
this fix, and the fluxo.yml × code audit ends here. No new
ADR: it follows the same pattern already established by RN-164 (agent read
scoped to the project, no external effect, no `proposed_action`), just with
a new RN. `docs/fluxo.yml` (role `po`, input `metricas-de-produto`):
`status: lacuna` → `regra: RN-407`.

The DATA already existed since ADR 0089 (`analise:funil` — real funnel
session → commit → PR → merge, real lead time, real deployment frequency);
all that was missing was for the PO to be able to READ that report within the turn. The PO's third
read tool, `listar_metricas_de_produto`
(`GET .../product-metrics`), the exact same design as the two siblings of
RN-164 — `:direct`, no parameter, scope closed to the project. The pure
CALCULATION functions and the query (`calcularFunil`/`calcularLeadTimes`/
`leadTimeMedioMs`/`deploymentFrequencyPorDia`/`buscarAcoesGitDoFunil`)
migrated from `apps/api/scripts/analise-funil.ts` to
`apps/api/src/application/services/funil-metrics.ts` — a MECHANICAL and
necessary refactoring (`scripts/` can't live in `src/`, and `src/` doesn't
import from `scripts/`): the script started to RE-EXPORT from there, without changing
signature or behavior, and the script's regression test stays
green without being touched. The JSON body has no field for the three permanent
absences the script already declared only in text (complete product funnel
ideation → commit, evidence of adoption per feature, MTTR/change
failure rate) — the PO's tool cites them by name in the TEXT it returns
to the model, always, so it never concludes from the omission of the numbers that
there is no gap.

## GOVERNANCE.md — the criterion of the `community` mode, not its mechanism {#governancemd--o-critério-do-modo-community-não-o-mecanismo-dele}
An item of the previous backlog ("Community mode of approval-ladder") became a
record correction, not an implementation: investigation confirmed that the `community` mode
already exists in code since FASE 6 (`scripts/ci/approval-ladder.ts`), tested
on both sides, only turned off by `APPROVAL_MODE=solo` (default). The backlog's
sentence ("it becomes a change of `aprovacao_humana` in the gates registry") came from
a SPECULATIVE line of ADR 0054 — not edited, by rule, but the imprecision
is recorded in `docs/explanation/backlog.md`: the `aprovacao_humana` of the
`aprovacoes-da-escada` gate is already a fixed `true` in both modes, with no field at all in
the `Gate` schema that reacts to `APPROVAL_MODE`.

What was really missing was another `TODO(humano)`, in
`docs/explanation/branching-policy.md`: the criterion for who goes into each
approvers list (`devs`/`po`/`gestão`) — who comes in, who leaves, based
on what. `GOVERNANCE.md` (repo root, new) closes that: the MECHANISM stays
in `branching-policy.md` (the ladder, distinct people, the step by step of the
variable switch), the CRITERION now lives in `GOVERNANCE.md`. It's a proposal,
not a functioning committee — the project still has a single maintainer, and the
document is explicit about it: most of it describes what comes into
force WHEN there are more people, not a structure already active. A new `warn` rule
in the docmap (`governanca`) demands a review when `approval-ladder.ts`/
`branching-policy.md` change — separate from the existing `block` rule
(`politica-de-branches`) for the same reason `checks-e-rulesets` is separate
from it: MECHANISM follows from the code, CRITERION is a human decision.

## Real SMTP in MailSender (RN-408, ADR 0096) {#smtp-real-no-mailsender-rn-408-adr-0096}
It closes the backlog item open since the Keycloak cutover (ADR 0032, "real SMTP
remains future config"). `nodemailer` over pure SMTP transport
(a LINE protocol with state/MIME/STARTTLS/AUTH, unlike the HTTP
JSON APIs the rest of the product integrates), behind `MAIL_TRANSPORT` — `log`
(default, INCLUDING in production: sending real email is the operator's
opt-in) or `smtp`, selected by `useFactory` in `AuthUseCasesModule`
without touching any use case (`RegisterUseCase`,
`RequestPasswordResetUseCase`, `LoginUseCase`, the
`migrate-keycloak-users.ts` script keep just injecting `MailSender`).
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` follow the RN-114 pattern
in production when the mode is `smtp` — but WITHOUT the public default the
four original RN-114 ones have, so the rule only kicks in when the operator opted
for `smtp`; the validation runs in the constructor of `SmtpMailSender`, exercised
by the `useFactory` when the provider graph is assembled (the same design as
`CREDENTIALS_MASTER_KEY`), not by an eager call in `main.ts`. Body in
PLAIN TEXT, never HTML — the port carries no structure for a rich body, and
a template engine would be injection surface with no gain at all.

Investigation found a real gap before coding: `email_verification` had
no web route at all — `verificarEmail` existed in
`apps/web/src/lib/auth.ts` since Fase 7a with NO caller, so the
verification email's link would lead nowhere as soon as SMTP
started sending real email. `/verificar-email`
(`VerifyEmailPage.tsx`) closes that, mirroring `SetPasswordPage.tsx` — the same
`validateSearch` pattern in `router.tsx`, the same single response for a
nonexistent/expired/already used link — with one difference: no form, the
confirmation fires on its own on mount, so the screen needs the three
states of RN-088 (loading/error/success), not just two.
## "N agents online" on the dashboard — LIVE status, never historical presence (RN-409, ADR 0097) {#n-agentes-online-no-dashboard--status-ao-vivo-nunca-presença-histórica-rn-409-adr-0097}
An item of the previous backlog closed. Prior investigation confirmed there
was no liveness aggregate at all, neither per project nor per workspace — only
HISTORICAL presence (`RosterFacts`, "has appeared at some point") and real
live status only on the client, derived from the event log, only when a project
is OPEN. `ProjectCardSummary.onlineAgentCount` adds two mechanisms by the
SAME rule ("not idle, not stuck"): dev agents
(`engine.dev_agent_states.status NOT IN ('idle', 'idle_tripped')`,
aggregated in batch in the engine) and conversational agents (the last `agent.status`
of the most recent session with `status !== 'idle'`, a `payload` that only accepts
`working`/`idle`/`awaiting_approval`). QA/SecOps never count — they don't emit
`agent.status`, a single verdict per invocation, with no notion of "idle" between
calls.

The architecture decision worth recording: the query reads
`engine.dev_agent_states` DIRECTLY, via raw SQL batched by workspace, inside
the SAME `Promise.all` that already adds up eleven queries of the RN-090 read model
(TWELVE → FOURTEEN, still CONSTANT) — instead of opening a new internal HTTP route
in the engine. `api` and `engine` share the SAME physical database,
separated only by Postgres schema, and there was already a precedent
(`apps/api/scripts/medir-execucao.ts` already reads `engine.oban_peers`); this
decision raises the pattern from a manual script to TESTED production code
(a minimal, declared fixture of the engine table in
`test/support/global-setup.ts`). Consequence accepted and declared in ADR
0097: the query assumes whoever operates the product migrates both sides
together (`db:migrate` AND `engine:migrate`), and fails loudly/visibly if only the api
migrated — no try/catch hiding the error.

## An execution session no longer closes with a pending dev agent (RN-411) {#sessão-de-execução-não-fecha-mais-com-dev-agent-pendente-rn-411}
A fix for a defect found in a REAL execution session, not a script
item: five dev agents came up, became `idle_tripped` (RN-047, the
circuit breaker) stuck waiting for the user to unblock task by
task, and the session's 30s heartbeat (`Engine.Sessions.SessionServer`)
closed the session underneath while the manual unblocking went on. The
third signal of `GetSessionPendingWorkUseCase` (RN-064) only reads
`agent.status`, the conversational agents' vocabulary — dev agents
speak `dev.*` (`Engine.Dev.AgentIo`) and never emit `agent.status`, so
no dev agent ever held the session through that signal. The fourth signal
reads the last `dev.*` event of each `dev-<modulo>`/`dev-<modulo>-2` in the
session: `dev.working`/`dev.blocked`/`dev.idle_tripped` hold the session
(stuck waiting for a human decision IS pending work); only `dev.idle`
(truly drained) doesn't hold it. `dev.awaiting_gate`/`dev.awaiting_approval`
ENTERED the rule through RN-412 — see below; the residual gap this
paragraph described was closed.
## Automatic personal workspace on sign-up (RN-410) {#workspace-pessoal-automático-no-cadastro-rn-410}
Found while browsing: the dashboard's "New project" button did NOTHING, with no
error. Root cause: `RegisterUseCase` and `SocialLoginCallbackUseCase` (in the branch
that provisions a new account) created a user and a credential but NEVER a
workspace — EVERY new sign-up hit that wall, and it only didn't show before
because `seed.ts` always creates a workspace along with the demo data.
Both points now create the workspace and add the user as `owner`
in the SAME transaction that already creates the account. Name/slug come from a single pure
function, `nomeESlugDoWorkspacePessoal` (`domain/auth/personal-workspace.ts`),
so the rule doesn't diverge across two files; the slug is always suffixed with
`userId.slice(0, 8)` (the same pattern as `extraDevAgentId`) to be unique
without a round trip to the database (RN-410).

## 413 on PRs and Executors "without execution" — the two ends and the chain (RN-412, ADR 0098) {#413-nas-prs-e-executores-sem-execução--as-duas-pontas-e-o-encadeamento-rn-412-adr-0098}
Not a planned phase: a fix requested by real USE ("on PRs it's always
blowing up with entity too large") plus the sibling defect of the Executors tab
showing up empty with real work going on. Investigation found the two
chained: the gate dies with `413` → devs get stuck in
`dev.awaiting_gate` → that state didn't hold the session (the gap of
RN-411) → the 30s heartbeat closes the session underneath → the tab requires an
active session and vanishes with the whole roster.

**The cause of the 413 was Brabo's API, not the LLM provider** — the
comments that attributed the error to the provider (`runtime.exs`,
`terminal_executor.ex`, `docker-compose.yml`) were wrong;
`FalhaDeTurno.origem({413, _})` already classified it as `"codigo"`, and
was right. `apps/api/src/main.ts` never configured Express's body
limit — the 100 KB default applied, far below the 8 MB that
Phoenix accepts, in the transport's heaviest direction (engine → api,
`POST /internal/sessions/:sessionId/llm-turn`, which resends the WHOLE
history on each ToolLoop iteration). `API_JSON_BODY_LIMIT` (default
10 MB) closes the transport end.

The second end, without which raising the limit would only postpone the overflow: the
engine's `ContextManager` (ADR 0098) had TWO defects that
kept compaction unreachable before the body overflowed —
`estimate/1` counted only `content`, so `assistant` messages
full of `toolCalls` cost ~zero tokens in the estimate; and the compaction
window used only `context_window` (128,000 tokens in the gate
agents), which gave ~350 KB before compacting — well after
any reasonable transport ceiling. The EFFECTIVE window is now
`min(context_window, teto_de_transporte)`, with the cut always on a
ToolLoop ITERATION BOUNDARY (never separating an `assistant` with
`toolCalls` from the `role: "tool"` ones that answer it — it would break the provider's
tool-use protocol).

**RN-412** extends RN-411: `DEV_PENDING_TYPES` gained
`dev.awaiting_gate` (the original argument — a gate can die and lock
the dev agent in that state indefinitely) and also
`dev.awaiting_approval`, by a new argument found in the investigation:
the approval decision writes `proposed_actions.status`
SYNCHRONOUSLY, but the dev agent's resumption via outbox/Oban is ASYNCHRONOUS —
in the window between the two, nothing held the session, the same defect as
RN-411 one level deeper.

**The Executors/Overview tab** had the sibling defect on the web side:
`executionActivated` was derived from `events.some(...)` over the window
of only 200 events of `useSessionEvents` — `execution.activated` is among the
FIRST events of a session and left the window in any real
execution, erasing the whole roster. The correct value already existed, aggregated
over ALL the events, in the workspace summary (RN-090,
`projects-summary.repository.ts`) — the two screens started consuming
that value. A bonus finding along the way: `ExecutionSection` (Overview)
recomputed `activated` again, independently, over the
same window — a long execution went back to offering "Activate execution"
as if it had never started; fixed along with it. `gatesEverOpened`
suffers from the SAME class of defect and was DECLARED as a known
limitation, not fixed here — fixing it would require changing the signature
of `deriveAgentRoster`/`rosterFactsFromEvents`, out of scope for this
targeted fix.

## Neo4j as a knowledge graph — the foundation (RN-413/414/415, ADR 0099/0100) {#neo4j-como-grafo-de-conhecimento--a-fundação-rn-413414415-adr-00990100}
The product owner's request: Neo4j + `ollama-model-loader` (gemma:1b,
yi-coder:1.5b, nomic-embed-text), explicitly inspired by the repository
[ErickWendel/neo4j-ai-experiments](https://github.com/ErickWendel/neo4j-ai-experiments)
— acknowledgment recorded in ADR 0099 and in `prompts/README.md`, for the
concrete inspiration of the "prompt as a versioned file, not a string
stuck in the code" pattern and of the graph as agent memory.

Two responsibilities, one foundation: **versioned prompt templates**
(`PromptTemplate`/`PromptVersion`, idempotent by hash — RN-413) and
**relational memory** (interactions, Psicólogo hypotheses with evidence,
Anamnese profiles, handoffs — real consumption is a future wave, this delivery
only builds the mechanism). The graph is DERIVED memory, never a source of
truth; pgvector remains the chunks' vector index, without
duplicating embeddings in two databases. The `neo4j-driver` driver in the api (not in the
engine) — the api already owns all persistence and the RAG, the engine
consumes through internal HTTP with a service token, as always.

`rag_search` (RN-414) closes the biggest gap of the existing RAG: no agent
queried it, only the web "Chat RAG" tab. A new tool in the engine, its own ceilings
(RN-150), degradation always visible at the start of the text to the model.
`ollama-model-loader` (RN-415) closes a separate real bug: `nomic-embed-text`
was never pulled automatically and the RAG degraded to lexical-only
silently in any clean environment.

First batch of templates extracted to `prompts/*.md` (ux-designer,
Psicólogo, Anamnese, `ContextManager` summarization).

## Graph consumption — templates without touching GenServers, relevance without replacing recency (RN-416/417, ADR 0101) {#consumo-do-grafo--templates-sem-tocar-genservers-relevância-sem-substituir-recência-rn-416417-adr-0101}
`InstructionFiles` gained a `:graph` source (`db > graph > dir > root` —
the user's `instruction_patch` still beats everything), and THREE agents
started TRYING to resolve the template from the graph before the inline text, which
became a mandatory fallback: ux-designer (`graph_instruction_templates_enabled?`),
Psicólogo and Anamnese (`graph_templates_enabled?`, the same key for the
two). Two flags, not one — they would collide with OPPOSITE defaults between
parallel fronts if they shared the key; both defaults are `false`.
Only `context-manager-summarize` (of the four templates in the batch) was left without a
consumer at the time — a gap ADR 0101 declared open and that closed
later, through the FOURTH consumer of the SAME `graph_templates_enabled?`: the
`ContextManager`'s summarization prompt (`prompt/1`, see RN-417).

`Psychologist.ContextBuilder`/`Anamnese.ContextBuilder` gained a
SECOND context source — `rag_search`, with a query derived from the analysis
trigger — in COMPOSITION with the usual recent/time-window
read, never as a replacement: with no hit, the behavior is identical to
before. The excerpts go into the EXISTING `Triage` budget, and
the RAG's `degraded: true` is always visible in the context, never hidden.

The graph writes itself: `GraphProjector` (api) drains a SECOND
outbox line (`aggregateType: 'graph_projection'`, same transaction,
a value the engine's filter — `IN ('session', 'task')` — never matches,
avoiding the race with `Engine.Outbox.Drain`, which already drains `'session'`
in ~2s) and calls the already existing write use cases. The engine
NEVER writes to the graph directly — it preserves the event log as the single source of
truth; the graph can be rebuilt by replay.

**A real finding during verification, recorded because it teaches**: the
body limit test of RN-412 (`apps/api/test/main.spec.ts`) had a
LATENT bug — `AppModule` imported STATICALLY at the top of the file evaluates
`DrizzleModule` (which creates its connection pool at MODULE scope, not
in a Nest factory) BEFORE `beforeAll` can point
`DATABASE_URL` to the test database. It stayed masked while the local dev
database was also migrated (same table, so the query "found" it even
pointing at the wrong place); it got unstuck as soon as the dev database was
recreated empty (by this very wave's real smoke test against
Neo4j+Postgres). Fixed with a DYNAMIC `await import(...)` inside
`beforeAll`, after `DATABASE_URL` is already set — it is the pattern to follow
whenever a test needs to redirect `DATABASE_URL` to a real
`AppModule`.
