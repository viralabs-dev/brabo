---
id: historico-de-fases-parte-1
title: "Phase history, part 1: phases 1 to 15"
sidebar_label: "Phases 1 to 15, part 1"
description: "From phases 1 to 12 to post-phase 15 (v2.5): what each phase delivered, cut and found."
keywords: [history, phases, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Phase history, part 1: phases 1 to 15

:::historico 2026-08-08
From phases 1 to 12, through 13 (prove and triage), 14 (what real execution demanded) and 15 (gates as data), to post-phase 15 (v2.5.0 and v2.5.1).
Text moved without rewriting from the [Phase history](historico-de-fases.md). What holds today lives in the RNs and the ADRs.
:::

## Status {#status}
- FASE 1 (MVP) — COMPLETED: IAM/RBAC, sessions with an immutable event log,
  chat with an LLM router (Ollama + APIs), token metering/budget,
  proposed_actions pipeline + permissions.json, Elixir/OTP engine with
  supervision and a termination event.
- FASE 2 — COMPLETED: GitProvider (Local/GitHub/GitLab) with a contract
  suite and capabilities, encrypted credentials, idempotent Gitflow
  bootstrap resumable through the pipeline, wizard with live
  progress.
- FASE 3 — COMPLETED: Harness (PromptAssembler, ToolLoop,
  ContextManager, InstructionFiles, Hooks), explicit handoffs,
  Criativo, PO and Arquiteto agents with artifacts and validations in the
  domain.
- FASE 4 — COMPLETED: execution agents (dynamic per-module devs
  in isolated worktrees, QA and SecOps as PR gates, proactive
  Infra), protected-merge lock, live team panel;
  real Psicólogo and Anamnese with a closed loop. Gates validated by
  real execution (ADR 0020).
- FASE 5 — COMPLETED: non-root production images and CI (ADR 0024),
  Kubernetes with Kustomize, HPA by Oban queue, NetworkPolicies and
  ESO (ADR 0025), graceful shutdown + OpenTelemetry + dashboards
  (ADR 0026), backup with tested restore, runbooks and hardening
  (ADR 0027).
- FASE DOC — COMPLETED: docs/ as the single source with Diátaxis, a
  Docusaurus site in website/ reading from docs/, generated references,
  docs/.docmap.yml + drift check (docs:check) in CI, a
  community layer, MIT verified, mechanism documented in
  docs/explanation/documentation-workflow.md.
- FASE 6 — COMPLETED: mechanized branch policy (ADR 0030) —
  pr-police, approval-ladder with both modes, promote/tag-release
  with a calculated version and a tree anchor, backmerge gate with
  automatic back-propagation, versioned rulesets. Pipeline exercised
  end to end (v0.1.0 → v0.2.0) and the hotfix chain validated by
  real execution.
- FASE 7 — COMPLETED: first-party auth replacing Keycloak —
  argon2id, Ed25519 access, refresh rotation with family
  revocation, progressive lockout, account tokens and a log-only MailSender
  (ADR 0031, RN-030..033); atomic cutover with its own issuer, RBAC
  untouched, /internal/* with a service token, httpOnly cookie + CSRF,
  user migration and total removal of Keycloak (ADR 0032,
  RN-034/035); OpenAPI on the 23 controllers with type-locked DTOs,
  a table test requiring metadata, docs/reference/api/ generated with
  a hash manifest (ADR 0033).
- FASE 8 — COMPLETED WITH A CUT: agent hierarchy — areas with a single
  lead as the external contact, private internal delegations (table
  `delegations`, `area` as TEXT), consolidated verdict with
  traceability, failure with origin; QA as an area (Lead + Automation +
  Performance/Security, the gates' external contract unchanged — the Fase 4
  suite green without modification); Infra as an area with a Workflows
  subagent generating CI per provider; team panel by area and
  Psicólogo/Anamnese targeting subagents (ADR 0038).
  SCOPE CUT of the time, REVOKED by FASE 14d:
  `agent_areas`/`agent_area_members` exist since then, per project,
  with configurable `max_parallel` — it was the dev area, the first
  DYNAMIC one, that forced it. What remains cut is only the **budget per area**
  (real budget ceilings remain project, session and task).
  The `apps/web/src/lib/agents.ts` list survived for color, icon and
  the addressing RULE; dev members come from the table.
- FASE 9 — COMPLETED: LLMProvider contract suite running
  against the existing ones, OpenAICompatibleProvider base on
  node:http with an INACTIVITY timeout, error normalized by `code`,
  capabilities in two layers (ADR 0041); catalog sync with a discovered
  model coming in disabled, a vanished model marked instead of
  deleted, price frozen in `token_usage` with append-only auditing
  (ADR 0042); ModelPicker regrouped by origin with curation.
  The six 9b providers came in through Fase 11 (ADR 0043).
- FASE 10 — COMPLETED: Bitbucket + GenericGitProvider delivered VIA
  dogfooding (the first real run of Brabo building Brabo itself,
  in a fork with a manual seed, batches with a restart between tasks,
  Criativo mandatory in the chain). Harvest written in Fase 12d, in
  docs/explanation/primeiro-dogfooding.md — the 17 findings with
  file:line are real; the QUANTITATIVE half (restarts,
  interventions, cost) stayed as `não medido`, because the observation
  table was never filled in. The three operability P1s were
  closed by Fase 12. The other 14 remain open and listed in the
  harvest — don't fix them in passing.
- FASE 11 — COMPLETED: the six Fase 9b providers as config on top of
  the base, each one investigated from scratch against the official docs (inheriting
  quirks forbidden); LLM_PROVIDER_NAMES from 3 to 9; credential DTO and
  connection tester deriving from a single list; capability only
  declared when proven, with two live reversals (DeepInfra and
  Vultr); a single new hook in the base (`parseErrorFrame`, +31 lines)
  proven necessary by OpenRouter (ADR 0043).
  Pending smokes with a real credential: absorbed by FASE 13.
- FASE 12 — COMPLETED: post-dogfooding operability, the three P1
  findings closed and proven in a single run (ADR 0047).
  12a — adoption of an existing repository: its own route, `getRepo`
  validating access before writing, `origin` (created|adopted) in both
  tables, and the PLAN as the gate — a dry-run that describes the divergence and
  changes nothing while the decision is null; re-adopting converges
  (ADR 0044, RN-045/046).
  12b — event-driven rescheduling of the dev agent: a persisted state
  machine (working|awaiting_gate|idle|idle_tripped) reacting to two
  events of the existing outbox, `awaiting_gate` retaining the worktree (which
  is per AGENT, not per task) until the gate ends, and a circuit breaker
  with explicit rearm (ADR 0045, RN-047).
  12c — story promotion with the user's authority: `story_promotion`
  per project with `manual` as the NEW DEFAULT (a targeted backfill puts the
  existing projects in `auto`), `proposed_ready` as a proposal and not a
  state, promotion reusing TransitionStoryUseCase (dead code from
  finding #13) and refusal returning to the PO with the reason pinned in its
  session (ADR 0046, RN-048).
  12d — the Noop entered the 12b state machine; the script
  `pnpm --filter api validacao:fase-12` that exits != 0 when the criterion
  doesn't close and extracts the evidence from the database; Fase 10 harvest
  written; docmap covering engine/dev and engine/agents.
  Pending items (running the validation; Local/Noop limits declared):
  absorbed by FASE 13.
- Don't refactor what is done without an explicit request.

## FASE 13 — COMPLETED on 2026-08-07 (prove it for real and triage) {#fase-13--concluída-em-2026-08-07-provar-de-verdade-e-triar}
No new feature. The phase closes the declared pending items, proves what
the Local/Noop validation admittedly doesn't prove, and turns the
19 open findings into a prioritized plan. Lesson incorporated: the
manual table of Fase 10 was never filled in — in this phase EVERY metric is
extracted by script from the event log/token_usage, never noted by hand.

### 13a — Close the declared pending items {#13a--fechar-as-pendências-declaradas}
1. COMPLETED on 2026-08-07: `pnpm --filter api validacao:fase-12` exits `0`
   and the table of event ids is in docs/explanation/validacao-fase-12.md
   (the TODO(humano) came out). It cost four fixes — three to the INSTRUMENT
   (the guinea pig was born in /tmp, invisible to the engine; the Noop didn't open the
   gate; the Noop died at `pr_settled`) and one to the PRODUCT (finding W: the
   dev agent died when the queue emptied).
2. PARTIAL on 2026-08-07: the **OpenRouter** smoke ran with a real credential
   and closed (real cost US$ 0.000005, read from `token_usage`). The
   other five remain skipped — there is no key for them in the environment. The smoke
   had rotted against ADR 0049 and had never run; fixed
   along with it. Dated result in docs/explanation/aceite-providers.md

### 13b — COMPLETED on 2026-08-07 (v2.4.0) {#13b--concluída-em-2026-08-07-v240}
The whole chain proven against REAL GitHub (`daneiel/test`), in ten
runs: remote adoption → plan with the user's decision → manual
promotion of ONE story → real dev agent writing code → commit, push and
REMOTE PR → gate opens → area delegates and dismisses with justification →
subagent SUSPENDS on approval → the user's refusal RESUMES the loop →
`changes_requested` verdict by LLM. Zero engine restarts. Merge
out, by design (RN-014).
3. The script is `pnpm --filter api validacao:real`, with phases split
   by COST (`--ate adocao|backlog|execucao`) — the cheap one runs alone
   first, and that is how configuration errors showed up before
   costing money. It requires running FROM INSIDE the api container: the
   policy is a file in a shared volume, and from the host it is born
   in a filesystem the engine doesn't see.
4. `pnpm --filter api medir:execucao` is the instrument, and it is PROVEN:
   it reproduces on its own the numbers the previous dogfooding had noted by hand
   (18 calls, 292,211 tokens, ~US$ 0.03).
5. Result in docs/explanation/validacao-real.md, with the ten
   runs and what each one taught.

SEVEN P1s closed along the way, all found by EXECUTION and none by
test: W (dev agent died with an empty queue), Y (the search didn't distinguish
empty from not-found), AA (git credential resolved by whoever
clicks, not by whoever pays — RN-082), AB (the gate called a pending decision
an infra failure — ADR 0057), AC (redirection made any
command unapprovable), the ReDoS in the path scope (CodeQL HIGH), and the
postgrex CVE.

Of the findings the phase opened, X closed later (FASE 14d, RN-085 — the
iteration ceiling became per agent TYPE). TWO remain open, and their
argument is worth more than the numbers: Z and AD (the verb allowlist
does NOT converge: verb, form and invocation are distinct spaces, and
runs 6/7/8 got stuck on one of each), and AE (the QA agent tries to
fix the code it judges, against its own prompt — contained by
two independent barriers, allowlist and scope). Neither of them is a
bug to fix: they are a product decision, and are in
docs/explanation/achados-execucao-real.md.

The conclusion the phase delivers, and that matters more than the PR: the path
to autonomy does NOT go through loosening policy. It goes through the agent
WAITING for the decision instead of dying — what ADR 0057 did for the
gates, extending 0052.

### 13c — COMPLETED: the triage became docs/explanation/backlog.md {#13c--concluída-a-triagem-virou-docsexplanationbacklogmd}
The 19 findings are closed (19 of 19). The document stays alive and
received the new findings from 13b.
6. Triage session: read docs/explanation/primeiro-dogfooding.md and
   classify the 19 findings into P1/P2/P3 with a proposed grouping
   into cohesive phases (by theme and dependency between them), estimated relative
   cost (S/M/L) and the risk of waiting. The output is a PROPOSAL — the
   priority decision is the user's.
7. Consolidate the full backlog into a living document
   (docs/explanation/backlog.md or equivalent): triaged findings +
   old items — budget per area (ADR 0038; the areas apparatus and the
   Dev Lead left the backlog with ADR 0053, implemented
   by FASE 14d), manual handoff to an agent of choice,
   MFA/social/OIDC/federation (ADR 0031),
   real SMTP in MailSender, deploy (DEPLOY_ENABLED + Environments),
   return of rc/rcfix (ADR 0030), community mode of approval-ladder,
   "N agents online" on the dashboard, currency preference with a manual
   rate.

## FASE 14 — COMPLETED on 2026-08-07 (what real execution demanded) {#fase-14--concluída-em-2026-08-07-o-que-a-execução-real-exigiu}
The hello world run didn't get past the first turn and revealed defects that
no suite caught, because everything before ran with a LOCAL model. The fixes
are already in; what remains is a feature decided by the user during the run.

### 14a — Agent operability (COMPLETED) {#14a--operabilidade-dos-agentes-concluída}
- A turn failure became a DURABLE `agent.error` with origin, and the agent SPEAKS in
  the thread; the four conversational ones stopped writing an empty `agent.response`
  (RN-059). The error path narrated in the final frame, which emitted no
  event at all, also closed.
- The Criativo chat opens with an invitation instead of empty: it is activated and waits
  for the user to speak first, and the screen now says so — including that technology
  and code are NOT its job.
- The key the agent spends is the workspace OWNER's (RN-058). Before, the turn
  looked for the credential by the agent's SLUG in a UUID column: no agent
  ever used a provider with a credential, and only `ollama` worked.
- Key spend report, only for the owner, with agent separate from
  person (RN-060).
- Gitflow bootstrap on GitHub: a freshly created repo answers 409 on the whole Git
  Data API, and the first commit goes through the Contents API. The tests' fake
  backend lied (404 where GitHub answers 409) — fixed along with it, it is what
  made the suite stay green with the product broken.

### 14b — Tree timeline (COMPLETED) {#14b--linha-do-tempo-em-árvore-concluída}
One branch per agent, from the first milestone to what it is doing NOW, derived
100% from the event log the screen already fetches. The chronological feed remains, in the
activity column: it answers "what happened", the tree answers "who is
doing what".

Revisited after FASE 26 (no new phase, same spirit of a targeted
fix as 12d/POST-FASE 15): the default opening criterion went from just
"active/stopped" to the 5 agents with the most RECENT activity — active keeps
priority (RN-118); each collapsed branch got its own NOVELTY counter,
with a per-agent "last seen" in `read-state.ts` (same mechanism
as the bell, now granular); and `tool.call`/`tool.result`/`agent.response`
started expanding INDIVIDUALLY (args, result, iteration), grouped
by ToolLoop iteration boundary.

### 14c — Automatic UI validation (COMPLETED) {#14c--validação-automática-de-ui-concluída}
Contrast became a test on `design/tokens.css`, with the known debt measured
and locked; layout (cut-off text, menu outside the viewport, dropdown clipped
by an ancestor, target < 24px) became a browser checker in
`scripts/dev/validacao-visual.js`. No new dependency.

### 14d — COMPLETED: parallelism decided by the LEAD, authorized by you {#14d--concluída-paralelismo-decidido-pelo-lead-autorizado-por-você}
Delivered in four PRs (#181, #182, #183, #184). ADR 0053 became
ACCEPTED, revoking for good the three cuts (Dev Lead, dynamic areas via
module_map and the generic areas apparatus).

1. **Areas became data**: `agent_areas`/`agent_area_members` per
   project, with `max_parallel` default 2. What forced it was the
   **dev** area — the first DYNAMIC one, whose members are one per module of the
   module_map. What is not enumerable in code has to be data.
2. **The ceiling is the SESSION's, not the module's** (RN-083). Counting per module
   would allow N modules × 2 without any authorization — the previous hole
   under another name. Above the ceiling it becomes a `proposed_action`.
3. **Configurable per area** in Settings, requiring `maintainer`
   for the same reason as activating execution: changing the ceiling is deciding how much
   the product spends without asking.
4. **The Anamnese proposes raising it** when authorizing has become routine — three
   approvals and NO denial (RN-086). One denial kills the signal:
   if you ever refused, the ceiling is doing its job.
5. **The Dev Lead exists** (RN-087), conversational, receiving the handoff
   from the Arquiteto in the same confirmation that already delivers to Infra, and
   proposing the plan: how many agents per module and why. The
   `dev-<modulo>` stopped being addressable by handoff — the rule of
   ADR 0038 starting to apply to dev as it already did to QA and Infra.

**Finding X** was closed here (RN-085): `TOOL_LOOP_MAX_ITERATIONS`
became a ceiling PER TYPE — 8 conversational, 60 execution and gate. The criterion
of who goes up is NOT "who works a lot": it is who has
`token_budget_micros` underneath holding the spend. `infra-workflows`
uses a heavy tool and stays at 8, because it runs without a budget.

**Three gaps of the phase itself, found by me while writing the next
slice, and all the same failure**: the ceiling rule came in with green
tests and the product didn't exercise it — no route called the use
case, approving the action executed nothing, and the type could be
auto-approved by permissions.json (closed by RN-086). Testing the piece
is not testing the path to it.

**Out of scope, by declared decision** (ADR 0053 item 5): the
"Activate execution" button changing owner. The Dev Lead → `dev-<modulo>` delegation
through the `delegations` table with `area = "dev"`, which this same item also
declared, STOPPED being out of scope — closed by ADR 0094
(fluxo.yml × code audit, Wave 2, RN-405). The button remains
reversible; execution remains on the current path, and the post-gate fix
still goes straight to the dev who opened the PR.

## FASE 15 — COMPLETED on 2026-08-07 (gates as data) {#fase-15--concluída-em-2026-08-07-gates-como-dado}
No NEW gate. The phase extracts into docs/gates.yml the gates that ALREADY
exist implicitly in the product, with script verification and severity,
in the same spirit as docs/.docmap.yml. An agent gate that doesn't exist
(dev-lead, platform) comes in as `status: planned` referencing the
backlog — never active. The gates' external contract does NOT change.

### 15a — COMPLETED: declarative registry {#15a--concluída-registro-declarativo}
1. docs/gates.yml with the existing gates (see ADR 0054, which extends
   ADR 0048 — the decision in the event log is what makes passing a
   gate measurable), schema validated by test.
2. Loader in the api reading the registry; internal read endpoint.
3. Script `pnpm --filter api validacao:gates` that extracts from the event log
   the last pass of each active gate and exits != 0 if some
   `block` gate has no evidence of script verification.

Not every gate has proof in the event log, and the registry says where it lives:
`merge-protegida` is guaranteed by TEST (the lock in decide.ts emits no
event of its own) and `backmerge` is CI, with state in .release/gate.json.
That is why each gate declares `evidencia: event_log | teste | ci` with the
locator — demoting them to `warn` would be lying about the product's hardest
locks.

### 15b — COMPLETED: consumption {#15b--concluída-consumo}
4. The team panel shows the gate each story/PR is waiting on,
   derived from the registry (not hardcoded).
5. docs/explanation/gates.md explaining the mechanism, in the docmap.

## POST-FASE 15 — COMPLETED on 2026-08-08 (v2.5.0 and v2.5.1) {#pós-fase-15--concluído-em-2026-08-08-v250-e-v251}
Not a planned phase: it is what USE found after 15, and it is here
because the origin of each item matters. None of this came from a script — it came
from browsing the app in Chrome and reading the security panel.

**UI defects, found while browsing** (RN-088..091):
- `429` turned into a WHITE SCREEN and the app answered with more traffic. The rule
  became general: every screen distinguishes THREE states — loading, error (with
  `trace_id` and a button) and empty. `if (!dado) return null` collapses all three.
- The dashboard made one request per project: **3,824 → 12 req/min**, with
  `GET /workspaces/:id/projects-summary`. The bell was the missing half:
  **289 → one** request per cycle (RN-090/091).

**Security hardening, with both panels at ZERO**:
- ADR 0058 — CSP closed in the api (`default-src 'none'`), revising item
  7 of ADR 0027; and the `projectId` contained in the root (RN-092), which hit
  not only `permissions.json` but the scope that AUTHORIZES the terminal.
- ADR 0059 — `GIT_OAUTH_STATE_SECRET` without a default in production (RN-093).
  The default was PUBLIC (`.env.example`) and the production compose supplied it
  as a fallback: requiring "not empty" would have caught nothing, because on the
  real error path the variable was DEFINED.
- An alert that didn't hold up was DISMISSED with a written justification,
  never silenced — and dismissing is the user's decision, not the agent's.

**Three operational lessons that cost a CI cycle, and hold as a rule:**
1. **Green CodeQL on a PR doesn't prove an old alert closed** — the PR
   check reports a NEW alert. An alert closes on the scan of the DEFAULT branch,
   that is, only after the fix reaches `main`.
2. **Gitleaks scans commits reachable from `refs/heads/*`, not the tree.**
   A high-entropy value committed once fails CI forever
   on that branch; fixing on top does NOT clean it. The way out is for the commit to stop
   being reachable (rebuild from `dev` and DELETE the old
   branch BEFORE opening the new PR) — never an allowlist, which blinds the scanner
   on that path for every commit. PR refs are out of scope.
   A fixture that represents a secret is born WITHOUT entropy.
3. **A barrier that lives in another function CodeQL doesn't see** — hence the
   three `js/path-injection` surviving the fix. The centralized check
   was kept (RN-092) and the price was paid on the panel: duplicating it in each
   caller would be a check that one day diverges.
