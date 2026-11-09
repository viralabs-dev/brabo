---
id: historico-de-fases-parte-2
title: "Phase history, part 2: Program 16–26 and rounds"
sidebar_label: "Program 16–26 and rounds, part 2"
description: "Program 16–26 and rounds exp003 and exp001: what real use asked for after phase 15."
keywords: [history, phases, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Phase history, part 2: Program 16–26 and rounds

:::historico 2026-09-11
Program 16–26 (what the first real navigation asked for), what use asked for afterwards and rounds exp003 and exp001.
Text moved without rewriting from the [Phase history](historico-de-fases.md). What holds today lives in the RNs and the ADRs.
:::

## PROGRAMA 16–26 — what browsing asked for (in progress) {#programa-1626--o-que-a-navegação-pediu-em-execução}
Eleven requests born from the FIRST real browsing of the app after the database
reset. It's not a script: it's use. Three discoveries from the investigation defined the
size and the ORDER of the program, and it's worth recording each one, because none
was in the original request:

1. There is a COMPLETE design handoff in `design_handoff_brabo/` — 8
   high-fidelity screens, tokens, typography and brand. The decision was to adopt it
   WHOLE and FIRST: that way the eleven requests are born in the new look instead of
   being done twice.
2. The Code tab's terminal became an ARCHITECTURE decision. Each project now
   has its own container, and it is the ARQUITETO who decides the image. Inside it the
   agent is free; `git push`, PR and deploy remain human. This pays off the
   product's biggest open debt — today the agent runs in the SAME container
   as Brabo's monorepo, and ADR 0055 says of itself that it is policy, not
   isolation.
3. Two real defects showed up along the way, and neither was requested:
   `agent_areas` is NEVER written (`upsert` without a caller, the API returns `[]`),
   and the bell drawer orders `seq ASC` in SQL — it shows the OLDEST.

Execution ceiling: at most FOUR subagents in parallel. The phases were
cut by CONTESTED FILE, not by theme — that is what makes parallelism
possible. The backend's limiter is `apps/api/src/db/migrations/meta/_journal.json`
and the drizzle snapshots: ONE migration per wave, because resolving a snapshot
conflict by hand is a path to a divergent schema. RN ranges and ADR numbers
are PRE-ALLOCATED before the wave starts: two parallel phases writing
`RN-094` make one renumber at merge, and a renumbered RN breaks the
`#rn-0xx` links that `pnpm docs:check` fails.

### FASE 16 — COMPLETED: foundations (unblock parallelism) {#fase-16--concluída-fundações-destravar-o-paralelismo}
None of the eleven requests delivers here. The phase exists because three of them touch
the SAME four points of `router.tsx`/`ProjectPage.tsx`, and another three
run into the lack of a common piece. Without it, the waves collapse into serial
execution.
1. `design/tokens.css` gets `--violet` (agents/AI) and whatever else the handoff
   defines. The fonts REMAIN self-hosted — following the handoff there would break the
   app under nginx's CSP (ADR 0036). The contrast test covers the new
   pairs, and the known debt of 4 pairs stays locked.
2. The tab stops being a closed list in TWO places: a single registry from which
   `PROJECT_TABS`, `type TabKey`, the ruler and the render start to derive. A test
   that fails a key present in one place and absent in the other — that's the real defect.
3. `Disclosure` in the design system, with the semantics of the most
   complete implementation that already exists (`ModelCatalogSection`). COMPONENT ONLY: none of the
   six ad-hoc implementations migrates here, otherwise the phase would open the three
   most contested files of the program.
4. The session label becomes a helper and the five inline `slice(0, 8)` migrate. It is
   this migration that keeps FASE 20 from colliding with 19.
5. `CLAUDE.md` enters the definition of done (see the Documentation section), with
   a `warn` rule in the docmap. DELIVERED: the rule is `claude-md` in
   docs/.docmap.yml, triggered by `package.json`, `pnpm-workspace.yaml`,
   `apps/*/package.json`, `apps/engine/mix.exs`, `docs/adr/*.md` and
   `docs/gates.yml` — the sentence "today it has ZERO coverage" that was here
   described the state BEFORE the phase and kept lying after it.

### FASE 17 — COMPLETED: the 8 screens per the handoff {#fase-17--concluída-as-8-telas-conforme-o-handoff}
Visual fidelity BEFORE behavior, so as not to redo work. No
business rule changes: if a screen needs data that doesn't exist, that becomes a
declared pending item, not a hitchhiking feature.
6. Login and App/project list.
7. Project and Session, preserving the three states of RN-088 (error before empty).
8. Approvals and Settings — Approvals is the visual base of FASE 19.
9. Proof that fidelity happened: contrast measured on the tokens and
   layout verified by `scripts/dev/validacao-visual.js` on ALL the screens
   touched. The `.dc.html` is a reference, NOT code to copy — the handoff's own
   README says so.

### FASE 18 — COMPLETED: the area exists in the database (a defect, fixed first) {#fase-18--concluída-a-área-existe-no-banco-defeito-corrigido-antes}
10. `AgentAreaRepository.upsert` has NO caller at all, so four use
    cases operate on an empty table. Provision on project creation +
    backfill, with a test that proves a freshly created project HAS areas — it's the
    same failure as FASE 14d: testing the piece is not testing the path to it.
11. Collapse the THREE copies of the areas list (api, web, engine) into one source.

### FASE 19 — COMPLETED: an approval you can read {#fase-19--concluída-aprovação-que-se-lê}
12. Kill the generic fallback of `ApprovalCard`, which dumps
    `chave: JSON.stringify(valor)` — the likely cause of "hard to read".
    Every type gets a SENTENCE in pt-BR; a type without a sentence shows verb + "see
    details" and the raw payload is born COLLAPSED, never dumped.
13. Collapse in THREE places: Approvals, Insights and the card in the chat, with verb
    and sentence coming from ONE module.
14. Project constraint: the collapse does NOT introduce a new required prop in
    `ApprovalCard`. That is what keeps `SessionPage.tsx` untouched and removes the
    edge with FASE 20.

### FASE 20 — COMPLETED: the session gets an identity {#fase-20--concluída-a-sessão-ganha-identidade}
15. `sessions` gets `kind` and `name` in the SAME migration — two migrations
    on the same table collide in the journal and the snapshots.
16. Reconcile with the event-based derivation: `kind` classifies the creation
    INTENT, `execution.activated` keeps classifying execution STATE,
    and neither rewrites the other. `execution.activated` in a consultative session is an
    explicit error, not a silent conversion.
17. Rename preserving the hashtag; without a name, it degrades to the hashtag alone.
18. A back-to-dashboard button — today `SessionPage.tsx` imports neither `Link`
    nor `useNavigate`, and NO navigation leaves the screen. Destination revised in a
    later round: the button goes back to the session's PROJECT
    (`/projects/:projectId`), no longer to the root dashboard — a session is always
    born inside a project.

### FASE 21 — COMPLETED: the volume of events (RN-099/100) {#fase-21--concluída-o-volume-de-eventos-rn-099100}
19. `useSessionEvents` remains the CURRENT STATE (`latest`, four
    consumers: roster, tree, execution, Approvals). The HISTORY became
    `useSessionEventHistory`, only for Activities, with the `afterSeq` the
    endpoint already returned. No new route, no new parameter.
    The anchor is the TAIL, not the start of the session: the endpoint pages
    forward and there is no `beforeSeq`, but opening the feed on event #1 of a
    session with thousands delivers the wrong screen. So the first page is the
    same `latest` read (SAME `queryKey`, deduplicated) and each click goes down
    a fixed window backwards.
20. The bell orders `DESC` in SQL. The "read" cutoff did NOT change semantics, and
    that's why there's no ADR: a cutoff by `seq` marks a PREFIX and the drawer shows
    a SUFFIX, so "mark the 50 shown" is inexpressible without a per-event read
    table. What changed is the drawer no longer hiding what the advance
    swallows — total per project, `+ N older`, and the button saying how many
    it marks. The missing number comes from SUBTRACTION (`latestSeq` minus the cutoff),
    not from a request.
21. The RN-090/091 savings didn't regress: one request per cycle, and the
    first "load older" costs ZERO — the `latest` read brings 200
    and the window shows 100. An old page has `staleTime: Infinity` and no
    `refetchInterval`: a closed `seq` window over an immutable event doesn't change.

### FASE 22 — COMPLETED on 2026-08-09 (spend with two audiences) {#fase-22--concluída-em-2026-08-09-gasto-com-duas-audiências}
Delivered as the **Spend** tab (ADR 0063, RN-101).
22. The missing AGGREGATIONS came into a single method —
    `sumGroupedBy(dimensao, escopo)` with `model`, `project`, `actor`,
    `session` and `day`. `provider` is NOT one of its dimensions, and the absence is
    structural: breaking down by provider is breaking down by CREDENTIAL, and that is
    what keeps the member's view from gaining the axis by carelessness — there is no
    argument to pass.
23. No charting library: daily bars and a ranking in inline SVG. The daily
    series comes DENSE from the api (a day without spend comes in with zero), otherwise three
    calls in three weeks become three bars stuck together.
24. The collision was resolved by separating the QUESTIONS, not the filters. The
    per-CREDENTIAL report stays exclusive to the owner (RN-060) and gained
    alongside it the workspace breakdown by model/project/actor/day, also
    `owner`. The member's view is by ACTOR, in tokens and estimated cost,
    without provider and without credential — and the actor comes from the authenticated
    TOKEN, with no parameter where one could write another person's id. An agent doesn't count in the
    member's account: `token_usage` records who spent, not who ordered the
    spending.

No migration, but WITH measurement: at 525 thousand rows the queries take
55 ms and 38 ms by seq scan, and an index on `token_usage(created_at)` would
bring them to 32 ms and 19 ms. The number is in the ADR; the index comes in the wave that
has the slot.

### FASE 23 — COMPLETED on 2026-08-09 (model inheritable per area) {#fase-23--concluída-em-2026-08-09-modelo-herdável-por-área}
25. The `area` scope entered the cascade (`session > agent > area > project >
    workspace`), BETWEEN agent and project: it is the default that lead and subagents
    share, and the agent diverges by overriding it (ADR 0064, RN-102).
26. The incoherence resolved BEFORE coding: the agent binding was GLOBAL
    (`scope_id` = plain slug, the route's `:projectId` ignored since Fase 9a) and
    area is per project since ADR 0053. A per-project scope above a global
    scope would make the same agent resolve different models only where there was an
    area. Decision: the agent binding became per project too —
    the `scope_id` of `agent`/`area` became composite, `<projectId>:<slug|chave>`
    (RN-103) — and not the area below the agent, which would contradict "inheritable
    default" (almost every binding today is an agent's).
27. The UI shows who INHERITS and who DIVERGED (`AreaModelsSection` and the
    Origin column of `ModelsSection`, in `ProjectSettingsTab.tsx`); "go back to
    inheriting" is a `DELETE` on the agent/area binding, never writes into it the model
    of the level below — copying would become a copy that diverges on its own at the area's next
    change. The `maintainer` role to change the area's model (same
    rule as the parallelism ceiling, RN-083); the agent's stays `developer`.

### FASE 24 — COMPLETED: Chat and Criativo as places (RN-104) {#fase-24--concluída-chat-e-criativo-como-lugares-rn-104}
28. Two tabs on the PROJECT screen, each listing the sessions of its `kind` and
    creating in that `kind` without asking again. The Session remains its own
    screen — the tab did not become a chat container.
29. The collision was resolved with "Sessions" LEAVING the ruler. What remained of it is
    the deep-link KEY: Chat carries `key: 'sessions'`, and that is what makes an
    old `?tab=sessions` open on Chat with the tab MARKED. An alias resolved only
    in the panel would open the right panel and leave the ruler without a selection, because
    `Tabs` compares `active` with `key` and whoever writes `active` is
    `ProjectPage` — one of the two files the wave kept closed.
30. **Verdict on "Start ideation"**: it STAYS. Half the problem had already
    closed in FASE 20 (the button vanished from the consultative session, RN-097), and the other
    half wasn't redundancy: it is what brings the Criativo, and from there on
    the owner's key is spent (RN-058). What was wrong was the PLACE — the
    invitation spent a paragraph pointing at the topbar. Now the action lives
    INSIDE the invitation while it is on screen, and goes back to the topbar when it
    isn't; `conviteVisivel` is the only question the two share, so
    that it neither shows up twice nor disappears.

### FASE 25 — COMPLETED WITH A CUT: Container per project (the boundary stops being just policy) {#fase-25--concluída-com-corte-container-por-projeto-a-fronteira-deixa-de-ser-só-política}
The biggest architectural change of the program, and the one that pays the debt Phases B
and F already pointed at separately. Delivered 25a (the Arquiteto's decision and the
gate) and 25c (the external-effect boundary); 25b (the container's
lifecycle) was CUT and declared — not half-implemented (ADR 0065, RN-105
and RN-106).
30. COMPLETED: the ARQUITETO decides which image comes up for the project, as
    its artifact (`artifact.project_image` in the event log, versioned, without a
    table) — auditable, not hidden configuration. Until it
    decides, the Code tab answers 409 and doesn't unlock (RN-105).
31. NOT DELIVERED AT THE TIME, declared: per-project lifecycle (provision,
    recycle, clean, resource ceiling actually applied), with the agent's
    worktree living inside the container. Container state is MUTABLE and
    asked for its own table — improvising it in the event log just so as not to wait for the
    migration slot would produce the fix right after.
    PARTIALLY REVOKED by Wave 4/front F1 of PROGRAMA 28: the state
    TABLE (`project_containers`, ADR 0081) arrived. What is still missing,
    without softening, is the half that made the table worth anything: no
    real orchestrator calls Docker yet, and the agent's worktree remains outside
    the container. The "inside, the agent is free" half of the terminal policy
    has NOT CHANGED YET — ADR 0055 keeps holding as it is until the container
    actually comes up.
32. COMPLETED AT THE TIME, REVISED by the local runner (ADR 0102/0103, RN-418):
    the external-effect boundary. `git push`, PR and deploy don't go out through the
    terminal — not even inside the project scope —, and the rule WAS `deny`
    (not `require_approval`, because of "always allow"), with the
    message redirecting to the TYPED action (`git_push`/`git_merge`/
    `pr_open`), which is born a `proposed_action` (RN-106, revised). The `deny`
    became an ABSOLUTE CEILING (unconditional `require_approval`, never
    auto-approvable) — the product owner's decision, "always allow" closed
    at the source so it wouldn't become decorative (see the local runner section). Merge into a protected branch
    remains manual (RN-014), untouched. Network and spend have their own verdict in the
    image ARTIFACT (`network: none`/`egress`, a cpus/memory/pids ceiling
    that refuses instead of silently downgrading) — decided ONCE, not
    command by command, for the same reason Z and AD proved that a verb
    allowlist doesn't converge. Closing Z and AD itself depends on 25b (the
    physical wall), which hasn't come up yet.

### FASE 26 — COMPLETED: Code, read-only {#fase-26--concluída-code-só-leitura}
33. COMPLETED (26a): `GitProviderContract` gained `listTree` and PR diff
    (11th/12th operation), capability declared ONLY when proven by the suite.
34. COMPLETED (26b): the four routes of `code.controller.ts` — tree,
    file, search and diff — behind the CENTRALIZED check of RN-092/095, with
    a ceiling and cache on the search (which is COMPOSITE, not a contract operation).
35. COMPLETED: the screen (`ProjectCodeTab`/`code/*`), registered in
    `project-tabs.ts` without touching `router.tsx`/`ProjectPage.tsx`. Rail
    (Explorer/Search — the only ones with real data), explorer loaded by
    DIRECTORY, editor tabs with breadcrumb, real search with
    `filesScanned`/`truncated`, PR diff by known id (with
    `patch: null` treated as "no text", never "no change"). Syntax
    highlighting is its OWN regex tokenizer (`code/highlight.ts`) — ZERO
    new dependency, against the 15-90 KB of Prism/highlight.js/Shiki for
    what the tab needs; three new color tokens (`--syntax-function/
    -comment/-operator`) calibrated at 4.5:1 against `--code-bg` in BOTH
    themes. The fourth state of RN-088 — blocked by the Arquiteto's pending
    decision (RN-105) — became RN-107, asked BEFORE trying to read
    code, with its own re-query every 15s while blocked.

    Pending items DECLARED, with no real data behind them: interactive terminal
    (FASE 25b, which remains cut — an honest empty state in the tab), blame,
    list of PRs inside the tab (the diff is only reachable by known
    id, coming from Approvals) and a Problems/lint/tests panel.
    Line virtualization was also left out at the time — the handoff itself
    calls the code tab "the most costly of the program"; the 512 KB per
    file ceiling (`GIT_BLOB_MAX_BYTES`) limited the worst case until then. CLOSED
    by Wave 4/front E2 of PROGRAMA 28 (RN-239..242): only the visible window
    becomes a DOM node, and the minimap reuses the same tokenization without a second
    pass.

### FASE 26b — COMPLETED: blame foundation, navigable PRs and a rich branch {#fase-26b--concluída-fundação-de-blame-prs-navegáveis-e-branch-rica}
The phase started as ONLY the API layer, and the sentence "no UI" that stayed here
described the state of the FIRST batch — it aged and started teaching wrong. The
THREE UIs exist: the rich branch dropdown (item 38, `CodeBranchPicker.tsx`),
the on-demand blame toggle (`CodeEditor.tsx`, RN-113) and the list of PRs inside
the tab (`CodeDiffPanel.tsx`), the last two delivered in v3.0.0. The three
declared pending items of blame,
rich branch dropdown and PR list would touch the SAME files
(contract, the three providers, the use case, the controller, the contract
suite) if attacked separately by agents in parallel; the decision was to
deliver all three together, at once, and leave the UI of each to three
following agents with no risk of collision.
36. `GitProviderContract` gained `blame`, `listPullRequests` and
    `listBranchesDetailed` (13th, 14th and 15th operation — RN-110/111/112),
    capability declared only when proven by the contract suite against the
    three providers (`local` against real git; `github`/`gitlab`
    mocked — the real smokes remain skipped without
    `GITHUB_TEST_TOKEN`/`GITLAB_TEST_TOKEN` in the environment, same situation as
    FASE 13a). `listBranchesDetailed` is its OWN operation, not an extension of
    `listBranches` (RN-112) — enriching costs an extra call to the provider
    PER BRANCH, and `listBranches` remains the Gitflow bootstrap's,
    which doesn't pay that cost.
37. Three new routes in `code.controller.ts` (`GET .../code/blame`,
    `GET .../code/pull-requests`, `GET .../code/branches`), same `role:
    viewer` and the same central path check (RN-095) as the four
    earlier ones. `apps/web/src/lib/api-client.ts`/`api-types.ts` gained the
    corresponding functions and types (`getCodeBlame`, `getCodePullRequests`,
    `getCodeBranches`) for the next wave to consume — `CodeShell.tsx` and
    `CodeDiffPanel.tsx` were NOT touched beyond the comment documenting
    that the foundation already exists.
38. COMPLETED: the rich branch dropdown (RN-112) — `CodeBranchPicker.tsx`,
    opened from `CodeShell.tsx`, replaces the plain text field with a
    selector listing each branch with `ahead`/`behind` relative to the default and the
    associated PR, when there is one (`aberta`/`mesclada`/`fechada`). A ref outside the
    list (tag or sha) remains reachable — `listBranchesDetailed` doesn't
    enumerate those two, so the dropdown's footer has a manual field.

**The program's freeze:** each phase declares what it doesn't do, and the hardest is
26's — code READ-ONLY, no saving through the tab. Editing is the next
phase, and when it comes, writing is an external effect: it is born a `proposed_action`.

## POST-PROGRAMA 16–26 — what use asked for afterwards (RN-148) {#pós-programa-1626--o-que-o-uso-pediu-depois-rn-148}
Same spirit as POST-FASE 15: not a planned phase, it is what USE asked for.
Stories with pending promotion at the same time (RN-048/RN-126) became N
loose cards in the PO session's timeline when it produced several in one
batch. `Carousel` (`apps/web/src/components/ui/Carousel.tsx`) is the design system's first
item-by-item navigation component — 2+ pending
become ONE navigable carousel (arrows, dots, keyboard), with "Approve all"
promoting the whole batch in a single call (`promoteStories` was already a batch,
no contract change); 1 pending remains the usual simple card. The
decision of when a "batch" forms is re-evaluated on each render — the
set of promotions STILL PENDING in the session, not "created in sequence
without interruption" — so that resolving a story in the middle of the carousel
recomputes the batch on its own, with no state of its own to synchronize.

**Local or Container project (RN-169/RN-170, ADR 0072).** The product
owner's request: "cross the boundary of only writing code in the container and be able to
write code from a user folder", with the **freely typed path**
variant chosen by him, aware that it only works mounted in the
container. `projects` gets (`workspace_mode`, `workspace_path`) in migration
`0043`, with `container` as the default — nothing changes for whoever doesn't choose. ADR
0072 REVISES part of 0065 and touches the ground of 0055, which decided the
opposite direction (the container wall), and so the consequence is written without
softening: the STRUCTURAL containment of `join(env, coluna)` — no
corrupted column leaving the managed root — ceases to exist for a Local project, and
what remains is the creation guard plus the lexical revalidation on read. 
FASE 25b remains cut: a Local project runs in the SAME container as today, only
the folder changed.

**The Arquiteto's C4 diagram (RN-149, ADR 0068).** New deliverable:
`create_c4_diagram` generates Context + Container (Simon Brown) in Mermaid,
rendered in the Overview. The Container level is DERIVED from the current
`module_map` by the use case — never retyped by the model — so as not to open
a second source that diverges from the first; only the Context (system name and
external actors) comes from the tool call. `artifact.c4_diagram` is an artifact without a
table, versioned in the event log, same design as `artifact.project_image`
(ADR 0065). `mermaid` came in as a new RUNTIME dependency of
`apps/web` — the first of its kind (the docs site already uses Mermaid, but at
build time) — isolated behind `apps/web/src/lib/mermaid-render.ts` with dynamic
`import()`; `vite build` confirmed that only the entrypoint loads
eagerly and Mermaid's heavy chunks stay on demand, and none of them uses
`eval`/`new Function` — the closed CSP of ADR 0058 stayed intact, with no
configuration change.

## RODADA exp003 — COMPLETED (RN-150..162, PRs #278–#293) {#rodada-exp003--concluída-rn-150162-prs-278293}
Not a phase: it is 17 points USE found in a live test session
on the `exp003` project, fixed in five waves sequenced by
CONTESTED FILE — four of them converging on `SessionPage.tsx`, which
forced serialization. The origin matters: none of these was found by a test.

**What the round taught, worth more than the list**: the biggest fix
(RN-155) was invisible to any suite because the defect was in comparing
two DIFFERENT numeric spaces that happen to both be `number` — the
`event.seq` (gapless, per SESSION) against the `action.seq`
(`proposed_actions.seq`, a global `bigserial` of the WHOLE table, shared
by every project and every session in the system, and documented in the schema as a
deliberate contrast). The order only seemed right while the table was
small. The fix didn't invent a field: it used the
`proposed_action.created` event that `ProposeActionUseCase` already writes in the SAME
transaction, with `payload.actionId` pointing back.

**Engine and contained reading (RN-150)** — `search_workspace` returned ALL
the hits, without a ceiling: the second real cause of the `413` in PR review, after
the `read_file` fix. Two INDEPENDENT ceilings, because the search
blows up in two ways — number of hits (`SEARCH_WORKSPACE_MAX_HITS`,
500, over a `Stream` that STOPS scanning at `max_hits + 1`) and bytes of the
final text (`SEARCH_WORKSPACE_MAX_BYTES`, 32,768). Their own variables, not
reused from the other two: same class of overflow, diverging one shouldn't
require touching the others. The truncation mark is addressed to the MODEL
(it tells it to refine the term) and never invents a total, because counting the total
would pay again the I/O the ceiling exists to avoid.

**Numbers that lie (RN-151)** — the project badge in the sidebar counted
ANY unread event: `exp003` showed 392 while the Approvals tab
of the same project showed 8. A number that doesn't correspond to anything actionable
when clicked is worse than none. It became `pendingApprovalsCount` in the read model
that already existed (RN-090), in one more aggregation in the `Promise.all` — never
N+1.

**Traceability of what the agent produced (RN-152)** — the
`feature/task-XXXXXXXX` branch in the Code tab's dropdown now says which dev
agent and module it belongs to. The module comes from the current `module_map` through the SAME
functions that generated it, never by reverse regex on the name; without a link,
it degrades to `null` instead of guessing.

**Auto mode (RN-153/154, see Conventions)** — the `actionType: "*"` wildcard.
What matters is where it lives: resolution is the REPOSITORY's (`findMode`),
and `decide.ts` didn't gain a line — that is what makes the three absolute
ceilings true by CONSTRUCTION, and not by one more `if` that one day
someone forgets.

**The session thread you can read (RN-155..159)** — ordering (above); the
5s indicator with the fixed text "Gathering information..." instead of
interpolating the agent, which already appears in the header (RN-156); the PO's
epic/story creation becoming a compact notice instead of a bubble with the same
visual weight as a real reply (RN-157); light Markdown with highlighting
in the chat by its OWN regex parser, zero new dependency and no
`dangerouslySetInnerHTML`, and only the agent's OUTPUT is rendered — what the
human types stays literal (RN-158); and "Generated artifacts" grouped by
agent with the `Disclosure` of RN-138, each artifact navigating to where it
lives (RN-159). The module_map/C4 stayed OUT by recorded decision: it is the project's
CURRENT state, not a session-dated artifact.

**Order of authority (RN-160/161, ADR 0069)** — "Confirm architecture
ready" only enables with at least 1 PROMOTED story (having a captured rule
isn't enough); and accepting the handoff to the Dev Lead chains the activation of
execution when the effective role of whoever accepts already authorizes it. The fusion is only on the
client: the backend still requires `maintainer` (RN-137), so it avoids
a redundant click without moving the authorization boundary.

**Structured input (RN-162)** — `ask_structured_questions`, the Criativo's:
the model declares the questions in a schema, the form is rendered by
`StructuredQuestionCard`, and the answer REUSES `SendAgentMessageUseCase` instead
of opening a second message path. Answering is a single act —
resending is 409, not an overwrite.

## RODADA exp001 — the Criativo keeps its promise (RN-163) {#rodada-exp001--o-criativo-cumpre-a-promessa-rn-163}
Same spirit as the other rounds: it came from USE, not from a script. The report was
"the Criativo didn't reply after saying it would fix it and try again",
and the sentence was literal in the code — `run_turn_capturing/1` called the model ONCE,
dispatched the tools and returned. The tool's result went into the
in-memory history and nobody read it again, so the promised fix only
happened if the user sent another message.

The Criativo was the only conversational one without a tool-use loop; it got the same as the
PO, with its own ceiling of 12. What matters beyond the fix: **whoever decides what is
announced became the ceiling**, and not a fixed text — the retry promise
only enters the sentence when there is still a round to keep it. An exhausted ceiling became
a narrated `agent.error` (`po_server` ended silently in that case, and that was the
next obvious debt — closed just below by RN-166), and the tool
failure stopped being an `agent.response`
— in the event log it was indistinguishable from a normal reply and stated no
origin at all, exactly what RN-059 closed for turn failure.

## RODADA exp001 — the PO reads what already exists and is held to account (RN-164..166) {#rodada-exp001--o-po-lê-o-que-já-existe-e-é-cobrado-rn-164166}
Not a phase: it is a defect found by real USE, and the origin matters because
no suite would catch it. The backlog came out with an epic and **no story** — hence
no task, hence execution stuck **with no error at all**. The investigation found
four stacked causes, and the first three are the same: the PO had no way to
know and no way to warn.

1. **The PO had four tools, all of them WRITE tools.** The context was
   built ONCE, at kickoff, from the last 200 events of the SESSION —
   from then on it never re-read anything: it didn't know which rules existed,
   which it had already covered, nor what it had itself already created. In came
   `listar_regras_de_negocio` and `listar_backlog` (RN-164), served by two
   internal routes scoped to the PROJECT — and the scope is the point: reading per
   session was exactly what hid the rule captured earlier. They reuse the
   plumbing that already existed (`listByTypeForProject`, `ListBacklogUseCase`,
   `computeCoverage`); what was missing was the route, the client method and the tool.
2. **Nothing demanded the story after the epic** and **the loop ended silently**.
   An epic without a story became an EXPLICIT outcome — `backlog.epic_without_story`,
   durable, in the pattern of RN-059 (RN-165) — and the `PoServer`'s iteration ceiling
   started emitting `toolloop.limit_reached`, the SAME type as the `ToolLoop`, which
   the conversational agents never emitted because they have their own loop (RN-166).
3. **The kickoff instruction didn't say a word about what to do when
   information is missing** — and faced with a gap without instruction a model chooses
   between inventing and stopping. Stopping is what it did. The third way out came to
   be written, with the tool to exercise it: `ask_structured_questions`,
   the SAME one as the Criativo's (RN-162), now advertised to the PO too.

Two design decisions that hold beyond this case: only a `create_story` that
**succeeded** discharges the epic's obligation (a story refused by the api
covered nothing, and treating it as if it had is trading one silence for another); and the
demand is per OCCURRENCE, reported once, never an alarm that repeats every
turn until someone learns to ignore it.

## RODADA exp001 — the thread reads as the turn happens (RN-172/173) {#rodada-exp001--o-fio-se-lê-como-o-turno-acontece-rn-172173}
Same origin as the others: USE, not a script. Four complaints about the
Session screen — the PO's handoff appearing ABOVE its last line, the approval
going up into the middle of the Arquiteto's reply and only coming down when it
finished, the approval card "badly laid out" and the scroll that didn't follow the
conversation.

**The investigation found that the ordering was RIGHT**, and that is the round's
lesson. RN-155 is faithful to the event log; what the log says is that
`po_server.ex#run_turn/2` emits, in the SAME iteration, the `agent.response`, THEN
the `offer_handoff` `tool.call` and ONLY THEN recurses into the closing line
— so the handoff's `seq` is honestly SMALLER than the last line's. The same
for `proposed_action.created`. The fix, therefore, isn't about ordering: it is
a declared PRESENTATION rule (RN-172), in a separate pass
(`afundarDesfechos`) AFTER the `sort` by `seq` — not a comparator with three
terms nobody would be able to justify a year later.

What keeps turns from mixing are three barriers, and each one exists
because of a real case: **turn** (the boundary between two turns may have no
VISIBLE entry — `agent.activated` opens a turn and doesn't become a thread item),
**author** (in an execution session several agents write without the user speaking
even once, and they all stay in the same turn) and **non-outcome** (two outcomes
in a row preserve the order between them — Infra before the Dev Lead).

RN-173 closes the other two complaints, and they were the same: the scroll
effect depended only on `[events.length, streamingText]`, and `actions` is a
SEPARATE query — a card arriving pushed the conversation off screen without
scrolling anything. Dependency fixed, plus a `ResizeObserver` on the content
for what NO dependency list reaches (`Disclosure` collapse,
Markdown reflowing). The guard of 120px from the end stays intact, on
purpose: the thread follows the conversation, it doesn't hijack the reading of whoever scrolled up.

## RODADA exp001 — the thread says who speaks, with which model and what it asks (RN-171/174/175/176) {#rodada-exp001--o-fio-diz-quem-fala-com-qual-modelo-e-o-que-pergunta-rn-171174175176}
Same origin: USE. Four complaints about the Session screen, and three of them
share the same lesson — **the product knew the information and didn't
show it**.

**The question at the center, and with a way out (RN-171).** The report was literal: "always
give the user the input option when they select Write". The model
offered a "Write it yourself" kind of option and the form had nowhere to
write — the `ask_structured_questions` schema couldn't express "besides
these, whatever you want". `allowOther` came into `select` with **default
`true`**, and the asymmetry is the argument: a list closed by FORGETFULNESS locks the
conversation and the user can't unlock it from outside; a list opened by mistake offers one
more field. The interface sentinel never travels to the backend, and the submit
button still requires everything filled in (the backend refuses with 400 either
way). The box also became centered with the 560px ceiling of
`ApprovalCard` and got an avatar: it was the only thread item aligned to nothing.

**An action that triggers a turn arms the indicator (RN-174).** The "thinking" animation
already existed — what was missing was COVERAGE. Two actions on the screen trigger a
synchronous turn in the engine and armed nothing: answering the form
(`AnswerStructuredQuestionUseCase` reuses `SendAgentMessageUseCase`) and returning a
story to the PO (`ReturnStoryUseCase` calls `reviseStory`, which is
`handle_call({:revise, …})`). The Phoenix channel doesn't cover the hole: with the join
still in progress (RN-108) the "working" `agent.status` has no listener and gets lost.

**The model, for EVERYONE (RN-175).** The premise that the defect was the PO's didn't
hold: the four conversational ones have written `modelName` since RN-146, with a
green test. Whoever never wrote it was the **`ToolLoop`** — the path of every execution
and gate agent — and the chat without an active agent in the api. No new
call: `RunLlmTurnUseCase` already returned the field in the body. The screen stopped
writing the loose word "model" (which reads as if the model were called
that) and became a readable chip; without the data, it SAYS it wasn't recorded —
guessing from the current binding would attribute to an old reply a model that
maybe didn't even exist, the same error RN-044's frozen price avoids.

**A Markdown table becomes a table (RN-176).** Two ways out were possible, and the
chosen one was to support tables in the chat's Markdown, with the design
system's `Table`. Rendering `artifact.module_map` in the thread was REFUSED by a decision
already recorded: it is the project's CURRENT state, not a session-dated
artifact (RN-159), and it lives in the Overview. Besides, the request was about the
table **inside the message** — and the fix serves any agent that
writes one, not just the Module Map. The separator line remains
mandatory (GFM), so prose with `|` never becomes a table by mistake.

## RODADA exp001 — the panel groups, orders and says what it doesn't show (RN-177..181) {#rodada-exp001--o-painel-agrupa-ordena-e-diz-o-que-não-mostra-rn-177181}
Same origin as the others: USE, not a script. Five complaints about the
context panel and the Session log, and the round's lesson is a single one — **the panel showed
a slice as if it were the whole, in three different dimensions at once**:
it hid six event types without offering an alternative, read from oldest to
newest, and cut the session at 200 events without saying so.

**Origin as a new classification (RN-177).** `ActivityKind` answers "what
SUBJECT the event is about" and decides icon and color; `origem` answers "what LAYER
it came from", and it is what makes the history readable — `eventos`, `sistema`, `llm`,
`harness`, `agente`, `usuario`, derived from the data that EXISTS (`actor.kind` and the
`type` prefix). The precedence is what makes it predictable and is in the order
of the `if`s: mechanism beats actor (a `tool.call` belongs to the harness whoever it is), and
actor beats agent prefix (`chat.message` exists on both sides). The 5 most
recent stay open and the rest collapse by origin, **in both places** —
in the log panel and in the thread, where the axis is inverted (the thread is ascending, so the
history stays at the TOP). The machine-noise filter **stays on by
default**: its reason didn't change (116 of 193 real events), what changed is that it
became a CHOICE instead of a done deal.

**Order and pagination (RN-178).** The four sections became descending, and the
"Load older" button switched sides as a consequence — the argument from
before, with the sign flipped. Business rules above 5 paginate, with the page
resolved by *clamp* and not by a synchronization effect.

**The PO's tree (RN-179).** `backlog.task_created` never entered the panel;
now epic → story → task form a tree, through the LINK the event already
carries (`epicId`/`storyId`), never by proximity in the log — a node without a loaded
parent goes up to the root instead of being hung by guesswork.

**The ceiling that started showing (RN-180), and it is the item worth most.** The panel
read 200 events by prop and had no way to say there were more. It started reading the
paginated history of RN-099 (same `queryKey` as the tail, ZERO extra requests
— RN-090/091), got the pager `ActivityFeed` always had and no call
site passed, and the note counts how many are missing by SUBTRACTION on the `seq`, like
the bell of RN-100. The derived sections read `baixados` (everything already fetched) and not the
feed's window, otherwise they would start showing LESS than they showed before.

**Delegation in the thread (RN-181).** `delegation.completed|failed|dispensed` only
existed in the log panel: the gate opened and closed with no sign at all that there was
a second attempt underneath. They became a compact notice in the RN-157 format,
with the sentence coming from `classifyEvent` — the same as the panel's. The area's external
contract doesn't change (ADR 0038): the thread narrates what the lead recorded, it doesn't start
addressing a subagent.
