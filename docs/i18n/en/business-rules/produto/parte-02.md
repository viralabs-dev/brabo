---
traducao_de: c165be09458a5dfdc42010867a29adf8a36ccd99
id: rn-produto-parte-02
title: 'Business rules — Product — part 2 (from RN-543)'
sidebar_label: 'Produto — part 2 (from RN-543)'
description: 'The RNs hosted in the product root.'
keywords: [business rules, product]
---

# Produto — part 2 (from RN-543)

## The device key can now belong to the MACHINE (RN-543, PHASE 30)

### RN-543 — A null `runner_device_keys.project_id` is the MACHINE key: it holds for the OWNER's projects, resolved against the requested project {#rn-543}

The local agent's identity was per PROJECT. A machine with three projects in
`runner` mode had three keys, three folders with
`brabo-runner-device-key.jwk.json` and three service units — and the person went
three times through the same browser flow ([RN-464](../api.md#rn-464)..[466](../runner.md#rn-466),
[RN-475](../web.md#rn-475)) to describe **one** machine. It is item 4 of the five
couplings [ADR 0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)
measured; items 1, 2 and 3 (topic, socket id, ticket) describe a **connection**
and N connections satisfy them byte for byte, so **nothing in the engine changes here**.

**One table, two kinds.** Filled `project_id` = the usual PROJECT key.
NULL `project_id` = the MACHINE key. A sibling table was considered and
refused in the ADR: `PatAuthGuard` finds the public key by `kid` and does not need to know the
kind, and two tables would make two lookups — the second forgotten exactly
once. NULL and not a sentinel: the FK is real, and `project_id = '00000000-…'` would require
a fake row in `projects`. `user_id` stays `NOT NULL` — the ADR refuses a
key that crosses users, because the credential describes **who** acts.

**The point that decides everything is a single one.** `PatAuthGuard.autorizarPapel` refused
when the credential's project differed from the route's project. That comparison
was **not** deleted: it is what prevents project A's key from serving project
B, and it disappears **only** for a null `project_id`, because then there is nothing to compare. The
role is now resolved against the **REQUESTED** project, which is ADR 0154 point 2
to the letter — *"authorization remains the usual one, resolved against the
requested project"*. **No new ceiling and none loosened**: the machine key
gives the runner nothing its OWNER did not already have, and an insufficient role in the
requested project is still 403. The PAT branch does not change —
`personal_access_tokens.project_id` stays `NOT NULL`.

**The agent ASKS which projects it serves.** `GET runner/projects` returns the
projects in `execution_mode: 'runner'` in which the credential's owner reaches
at least `developer` — the SAME minimum as `runner-ticket`, because listing a
project whose ticket would be refused is promising what the next route denies. It
asks instead of sweeping the disk: the machine's base belongs to the user and may have a
folder that is no project at all, and guessing by folder name is the class of
error [ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md) refused.
What travels is the SEGMENT (`workspaceDirName`, [RN-109](../api.md#rn-109)) and never an
absolute path — the same invariant as the broker.

It is the **first `@RequirePatAuth()` route without `:projectId` in the path**, and the
two consequences are locked by tests: only a MACHINE credential gets in
(a project one describes a single project and has nothing to discover — 403 with its
OWN message, never the "wrong project" one, which would lie about the reason), and
there is no `@RequireRole`, because there is no project to resolve it against. The minimum
is applied per **ROW**, with the product's SINGLE rule
(`ResolveEffectiveRoleUseCase.forProject`, `projectRole ?? workspaceRole` —
[RN-471](../web.md#rn-471)); the candidates query in SQL is `alcança`, never `tem
papel`, and rewriting the `??` there would be a second rule. That is why
`route-surface.spec.ts` classifies it as `jwt` — the classifier reads
`@RequireRole` and does not see the mechanism — and `docs/security-surface.md` corrects the
reading in prose, exactly as it already does for `runner-ticket`.

**The listing of [RN-519](../api.md#rn-519) now states the KIND.** A machine
key serves every project of the owner, so it enters the listing of all of them —
marked (`especie: 'maquina'`, `projectId: null`). Both halves are
mandatory: without entering the list it would be invisible and permanent on every
screen, which is the defect RN-519 closed reborn in the new kind; without the
mark, the same row would appear in N projects looking like N different keys. The
kind is DERIVED from `project_id` in a single place — there is no column for it, and there
must not be.

**And revocation now has a PLURAL target.** [RN-520](../api.md#rn-520) takes down the live
connection of `{projeto, usuário}`, and a machine key names no project at all.
Not taking it down would reopen exactly what RN-520 closed — the key dies for a
NEW ticket and the live connections keep executing approved commands —, now in
N connections instead of one. So revoking a machine key requests a
`disconnectRunnerOfUser` **per project** in `runner` mode the owner reaches. It is
the consequence the ADR declared in advance (*"revoking will take down
all of that machine's projects"*), and it fits **without touching the engine**: the
`{projeto, usuário}` signature stays byte for byte, it is just called N times. The list
comes from the CANDIDATES, without a role filter, and that is deliberate — disconnecting is not
an authorization decision, and missing a project would leave standing what the revocation
exists to kill.

- **Code:** `apps/api/src/db/schema/auth.ts` (`runnerDeviceKeys.projectId`,
  without `.notNull()`); `apps/api/src/db/migrations/0058_public_war_machine.sql`;
  `apps/api/src/interfaces/http/auth/pat-auth.guard.ts` (`autorizarPapel`);
  `apps/api/src/interfaces/http/runner/runner-projects.controller.ts`;
  `apps/api/src/application/use-cases/runner/list-runner-projects.use-case.ts`;
  `apps/api/src/infrastructure/persistence/drizzle/project.repository.ts`
  (`listRunnerModeReachableBy`);
  `apps/api/src/infrastructure/persistence/drizzle/runner-device-key.repository.ts`;
  `apps/api/src/application/use-cases/auth/revoke-runner-device-key.use-case.ts`
- **Test:** `apps/api/test/interfaces/pat-auth.guard.spec.ts` — *"chave de
  MÁQUINA"*, with BOTH directions locked (the machine one holds in any
  project; the PROJECT one stays refused in a different project) and the route without
  `:projectId`; `apps/api/test/application/use-cases/runner/list-runner-projects.use-case.spec.ts`
  (a role below `developer` is left out);
  `apps/api/test/infrastructure/persistence/drizzle/runner-device-key.repository.spec.ts`
  and `.../project-runner-mode.repository.spec.ts` (against Postgres — what
  changed is a `NOT NULL` and a `WHERE`, and no fake proves either of the
  two); `apps/api/test/application/use-cases/auth/revoke-runner-device-key.use-case.spec.ts`
  (*"o alvo da desconexão vira PLURAL"*);
  `apps/api/test/interfaces/http/runner/runner-projects.controller.spec.ts`
- **Gap DECLARED, and CLOSED by [RN-552](../api.md#rn-552):** when this RN
  closed, no api route **created** a machine key — the route would be born in the
  PR that had the first real caller, `install.sh`
  ([ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md) point 4), never
  before. That is what happened: `POST /internal/machine-device-keys`. The port's type is already the COLUMN's
  (`projectId: string | null`), so the future consumer has nothing to change
  there. And the web still has no screen on which to list or revoke a device key
  (the open half of RN-519): the new kind makes the gap bigger, and it stays
  declared, not closed here. **CLOSED later by [RN-561](../web.md#rn-561)**, which is
  the screen — and the kind mark created here is what it uses not to lie
  about the reach of revoking.
- **ADR:** [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)
- **Origin:** PHASE 30, session 2 —
  [the phase's scope](../../explanation/fase-30-runner-por-maquina.md)

## An installation's first account is born in the terminal (RN-546)

### RN-546 — An internal route creates the FIRST account, already verified, and refuses when any user exists {#rn-546}

Session 5 of [PHASE 30](../../explanation/fase-30-runner-por-maquina.md), decided by
[ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md). It is the api half
of the step that closes the one-line installation; the `install.sh` that consumes this
route is session 6, and it arrived in [RN-547](#rn-547).

**The hole, measured.** In a new installation nobody can get in. The `.env`
the installer generates has **no** email variable at all, `MAIL_TRANSPORT`
falls back to the default `log` (`docker/docker-compose.install.yml`), and normal registration
requires verifying the email — which through a disabled channel does not close. The installation
ends saying "Ready" and the only way out is fishing the link from
`docker compose logs api`.

**The route.** `POST /internal/first-account`, `engine-service` — authenticated by
`BRABO_SERVICE_TOKEN`, in the same header and with the same constant-time
comparison as the other internal routes. Body `{ email, senha, nome? }`, response
`{ userId, email, workspaceId }`, `201`.

**Why internal, and never public.** A public "create the first
owner" route is a race between whoever installed and whoever scanned the port, and whoever loses
the race loses the installation: `owner` of the first workspace is not a role one
recovers via HTTP. The service token closes the race in the right place — it is
generated by `install.sh` itself and written to `.env` with mode `600`, so
presenting it proves control of the **machine**, which is the credential this step
really wants.

**The account is born VERIFIED, and that is the only thing this route loosens.** What
email verification proves is *"this person controls this inbox"*; whoever runs the
installer has already proven something stronger — the machine, the `.env` with the five
secrets and the Docker daemon. Demanding the weaker proof from them, through a channel
the installation knows is off, is theater. **Normal registration stays byte
for byte**: the ADR creates a path for a named case, it does not touch the other one.

**The refusal is about the INSTALLATION, not about the email.**
`UserRepository.existeAlgumUsuario()` (`SELECT 1 … LIMIT 1`, never `count(*)`),
and `409` if there is any user. The question is about `users` and not about
`auth_credentials`, because an account provisioned by social login
([RN-278](../api.md#rn-278)) is born without a credential and asking about the credential would say "there is
nobody" in a populated installation. Inheriting the per-email idempotency of
`provisionarUsuario` would turn the route into an account creator with a misleading
name — it would be enough to vary the address. In a migration
([RN-530](../infra.md#rn-530)) the users come in the restore and the step goes silent by the same
criterion.

**Personal workspace in the SAME transaction** ([RN-410](../api.md#rn-410)). This is the THIRD
account creation point, and it gains no name/slug rule of its own: it calls the
same `nomeESlugDoWorkspacePessoal` as the other two. Without it the installation
would close with a login that goes through and a dashboard where "New project" has nowhere
to create — the half of the hole this phase came to plug, not the other.

**The extraction, and why not `BRABO_FORCE_SEED`.** `provisionarUsuario` refuses
to run with `NODE_ENV=production`, and the installer runs exactly in production. What
the refusal protects is written in its docblock: a **known** password created
**without human interaction**. The route is another category — the password is chosen by a
human in the TTY, read without echo and confirmed, behind the service token, and only when
there is no user at all. So the core (the trio of writes that makes the account
be born verified) became `ProvisionarUsuarioUseCase`, and **the refusal stayed in the
script**, which is what it protects. Telling the installer to declare itself a "forced
seed" would make it cross a rule that never spoke about it, and would loosen the
refusal precisely where it holds.

**One password rule, not two.** The domain's `exigirSenhaValida`, called by the
SAME code registration calls — and that is why this route's DTO does **not** repeat
a `@MinLength`: the call covers the policy's FIVE refusals, not only the
length. The `@MaxLength` stays, because it is not policy: it is argon2id
protection, which copies the input before deriving. `PoliticaDeSenhaError` is a domain
`Error` and has no global filter, so the use case **translates** it to
`400` — without that the installer would read "server error" where the right answer is
"choose another password". Translating there does not touch normal registration.

**Its own kind in the auth trail.** `first_account_created`, and not
`register_created`: the account is born verified without any email having been
sent, and whoever audits later needs to see that written, not deduce it from the
absence of an `email_verified` alongside. A closed union in TypeScript, a `text`
column in the database — a new kind costs no migration.

**No `GET`.** "Is there any user?" is a question nobody needs to ask from
outside: the `POST` answers `201` or `409`, and the `409` is already the answer. A read
route would publish the same fact with one more surface, and its answer
would be exactly the signal a scanner wants.

**The new surface is declared, not hidden.** A second
user creation path that works in PRODUCTION comes to exist. It is narrow on three
independent counts (first account, internal route, service token) and disappears
as soon as the installation has people. It is in
[`security-surface.md`](../../security-surface.md), in the ADR's Consequences and here.

**A declared window, not closed.** The "is there any user" check runs
INSIDE the transaction, but `READ COMMITTED` does not prevent two concurrent calls
with different emails from passing together. Closing it would require an advisory lock
on the absence of rows, and that is not where containment lives: whoever reaches the route
already has the service token, that is, already controls the whole installation. What the
condition prevents is the route BECOMING a permanent account creation surface, and
that it prevents.

**What did NOT come in, by the ADR's decision:** a public first-owner route; a password
generated by the code or a default (the password is never written — neither in `.env`, nor in the
marker, nor in a log); SMTP turned on by itself (`MAIL_TRANSPORT=log` stays the
declared default); LLM credential (it belongs to whoever is going to spend,
[RN-058](../api.md#rn-058)); and any change to normal registration.

- **Code:** `apps/api/src/application/use-cases/auth/criar-primeira-conta.use-case.ts`
  (the refusal for a populated installation, the password rule, the personal workspace and the
  event), `apps/api/src/application/use-cases/auth/provisionar-usuario.use-case.ts`
  (the extracted core, without the production refusal),
  `apps/api/src/scripts/provisionar-usuario.ts` (only the refusal, plus the
  delegation), `apps/api/src/interfaces/http/internal/internal-first-account.controller.ts`,
  `apps/api/src/interfaces/http/internal/dto/first-account-internal.dto.ts` and
  `…/first-account-internal.response.dto.ts`,
  `apps/api/src/application/ports/user-repository.port.ts` and
  `apps/api/src/infrastructure/persistence/drizzle/user.repository.ts`
  (`existeAlgumUsuario`), `apps/api/src/domain/auth/auth-event.ts`
  (`first_account_created`),
  `apps/api/src/domain/auth/password-policy.ts` (UNTOUCHED — it is the reused rule)
- **Test:** `apps/api/test/application/use-cases/auth/criar-primeira-conta.use-case.spec.ts`
  (happy path with a verified account and personal workspace, the own kind, the
  `409` with a populated installation, the `400` for length and the `400` for a reason
  that is NOT length, and the name fallback);
  `apps/api/test/interfaces/http/internal/internal-first-account.controller.spec.ts`
  (the pass-through to the use case, the absent `nome` becoming `null`, and the three
  guard refusals: absent header, wrong token, right token);
  `apps/api/test/scripts/provisionar-usuario.spec.ts` (the production refusal
  STAYED in the script, and the delegation);
  `apps/api/test/interfaces/route-surface.spec.ts` (the route classified)
- **ADR:** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md), which depends
  on [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)

## `install.sh` closes the installation (RN-547, PHASE 30)

### RN-547 — The installer creates the first account, registers this machine's key and brings up the agent as a service — and what fails in the middle is REPORTED, never undone nor swallowed {#rn-547}

Session 6 of [PHASE 30](../../explanation/fase-30-runner-por-maquina.md), decided by
[ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md). The session would touch
three workspaces at once and was **split into three**: the two pieces of the agent
and of the api have already closed ([RN-546](#rn-546), [RN-551](../runner.md#rn-551), [RN-552](../api.md#rn-552),
over the unit of [RN-545](../runner.md#rn-545)), and what remained here is `install.sh` as an
**orchestrator and nothing more** — no line of `apps/` was touched, and no
route was born.

**The hole it closes.** A new installation ended saying "Ready" with a
login that NOBODY got through: the generated `.env` has no email variable
at all, `MAIL_TRANSPORT` falls back to the default `log`, and normal registration requires
verifying the email. The only way out was fishing the link from
`docker compose logs api`. And the local agent stayed installed without a credential,
waiting for someone to go back to the browser to pair a folder.

**The chain, and every link already existed.** `POST /internal/first-account`
([RN-546](#rn-546)) → `brabo-runner device-key create` ([RN-551](../runner.md#rn-551)) →
`POST /internal/machine-device-keys` ([RN-552](../api.md#rn-552)) → `device-key finish
--id <id>` → `brabo-runner service install --machine`
([RN-545](../runner.md#rn-545)). The `id` the api returns on registration is what becomes the private key's `kid`,
and the whole chain only PASSES IT ON — nobody derives it from anything else
([RN-475](../web.md#rn-475)). The service's `--dir` comes from the PATH the `finish`
printed, not from a second calculation by the script about where the configuration folder
is.

**What happens when a middle link fails: nothing is undone, everything is
REPORTED, and the script always exits 0.** It is this delivery's decision, and the argument is
that the links already fulfilled are useful on their own — with the account created the person gets in,
with the key registered the machine is paired, and the service is the only step
they repeat by hand with a command the script prints. Undoing would require deleting the
account and revoking the key, and there is no route for that nor should there be one the
installer calls on its own. The price is that an installation can end up half
done; what it never does is end half done SILENTLY — each failure
becomes a named line in a **"What was left pending"** block, at the end, where whoever
installed is still looking. Taking down the whole installation because of the last
step would trade half an installation for none.

**Idempotency is the HTTP CODE, and `409` is not a failure.** Both routes answer
`409` when the installation already has people — a second run, or a migration
([RN-530](../infra.md#rn-530)) whose restore brought the users. That is the
EXPECTED outcome: the step goes silent saying why, and does **not** enter the pending items.
Any other code is a failure, and shows up with the code and the api's response
alongside. `000` — the curl that never got to talk to the api — has its own treatment
for the same reason: collapsing it with a response code would make "the api did not come up"
read as "the api refused". And the agent step only runs when THIS run
created the account: with a pre-existing user, registering a machine key would mint
a durable credential for someone who asked for nothing in this round.

**The password touches neither disk nor `argv`.** Read in the TTY without echo (`stty -echo`, with the
terminal mode restored at the end), confirmed, and sent to the api via the `curl`'s
**STDIN** — never via `--data` on the command line, which `/proc/<pid>/cmdline`
publishes to any user of the machine, and never via a file. The header with
the `BRABO_SERVICE_TOKEN` goes in a mode-600 `--config`, deleted right after: it
is a secret too, and that secret already lives on disk, in `.env`, with the same mode.
Without `stty` on the machine the step is **refused**, never degraded to asking
with echo — promising no echo and delivering with echo is worse than not asking. The password
does not go to `.env`, does not go to the marker and does not go to any log; the
marker gains the **email**, which identifies and is not a secret, and
`MARCADOR_SCHEMA` goes up to **3** together with the field, by the same rule that made it
go up to 2 when gaining `versao`.

**The password refusal is repeatable, and the ceiling is 3.** The policy is the domain's
([RN-546](#rn-546)), the same as normal registration, and it is only known AFTER the
POST. Aborting the installation there would leave someone with the compose up and the
second run falling into the migration path — so the loop is over the
question+answer pair, and exhausting the ceiling becomes a named pending item instead of a refusal.
A typed password different from the confirmation never leaves the machine.
A tab in what was typed is **refused** and never silently removed: an
installer that rewrites the password produces an account whose password is not the one the
person typed.

**The refusal of `service install --machine` is the COMMON case on a developer's
machine, and it arrives in its own words.** `install --machine` refuses
when there is a per-PROJECT unit installed, without `--force` ([RN-545](../runner.md#rn-545):
*"installing and warning would leave the wrong installation up"*). The installer
passes on the CLI's output WHOLE instead of summarizing it — it is what names the
`uninstall` of each unit found, which is the gesture — and the pending item carries the
exact command to repeat later.

**The key's `name` is the `hostname`, and the choice is this script's.**
[RN-551](../runner.md#rn-551) declares in writing that the CLI does **not** name: the `name` is a
field of the record, and whoever names is whoever registers. Whoever opens the list of device
keys needs to know WHICH machine to go to, and the hostname is the name the
person already uses to talk about their machines — it is what the shell prompt shows.
It is not a secret, it is not unique, and the api derives nothing from it. Quotes and slashes go
(they would move out of place inside the JSON), the cut is at 80 (the DTO's `@MaxLength(80)`,
applied here so the refusal does not come from the api) and the total absence of `hostname` and
`uname` returns a fixed name — empty would become a `400` by `@MinLength(1)`, after
the account already exists.

**The `.parcial` left over when the registration does not close STAYS where it is, and is
named.** The `create` writes the private key to a file with a `.parcial` suffix that the
runner ignores by construction ([RN-551](../runner.md#rn-551)), and if the registration fails it
is left over. Deleting it would be the installer deciding it knows something it does not: a
timeout after the api writes is indistinguishable from a timeout before, and the
file may be the only copy of the private half of an already registered key. It
is inert, the next `device-key create` names it and replaces it, and the message
says both things.

**What this script does NOT do, and now says it right.** The last line of the output
announced, months after the functions existed, that it *"does not pair the local
agent"* and that the key *"still comes from the project screen"*. The text was
rewritten: SMTP stays off by decision (`MAIL_TRANSPORT=log`, here as
in production — and the account created is born verified precisely because of that), the LLM credential
still belongs to whoever is going to spend
([RN-058](../api.md#rn-058)), and pairing through the project screen
([ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md))
still exists for whoever wants it — what changed is that it stopped being
mandatory. The `--help` suffered from the same defect in a place no test
reached (it prints the HEADER, which is a comment, and the rule forbidding talk
of "phase sessions" only read code lines): it said *"THIS VERSION INSTALLS
NOTHING"*. Fixed, and the fixed line range that cut it off
silently became "up to the first line that is not a comment".

**What did NOT come in:** a new route of any kind (the session is orchestration —
if something were missing on the other side, the gesture was to stop and report); SMTP; LLM
credential; a password written anywhere; and any path that creates an account without
a TTY — without an interactive terminal the script reports and **exits 0**, at the step that already
existed, before any write.

- **Code:** `install.sh:1835` (`fechar_a_instalacao`, the chaining and the
  "always 0"), `:1634` (`perguntar_e_criar_a_conta`, the consent, the loop and
  the ceiling), `:1734` (`parear_esta_maquina`, the `id` becoming `--id`), `:1811`
  (`subir_o_agente_como_servico`, the refusal passed on whole), `:1537`
  (`post_interno`, the body via stdin and the header via the 600 `--config`),
  `:1578` (`criar_primeira_conta`) and `:1597` (`registrar_chave_de_maquina`) —
  the verdicts of the two routes —, `:1612` (`ler_sem_eco`), `:1516`
  (`nome_da_maquina`), `:1798` (`avisar_chave_parcial`), `:1208`/`:1215`
  (`escapar_json`/`sem_controle`), `:109` (`MARCADOR_SCHEMA=4`), `:1871` (the
  call, after the runner and before the marker), `:1882` (the `ownerEmail`).
  Numbers re-read by symbol on 09/18 (AT-096), on 09/27 (AT-065, which
  added the Mac Intel branch in `instalar_o_runner`) and on 10/01 (AT-122);
  those of `:966`/`:682` no longer matched on 09/17
- **Test:** `scripts/dev/install-fechamento.spec.ts` — the shell functions
  run FOR REAL (the whole script loaded by `source`, minus the call
  to `main`) against a real `node:http` server and a stand-in `brabo-runner`: the
  account's happy path (body, service token and password arriving), `409`/`400`/
  `500`/no-response with DIFFERENT verdicts, the password loop and the ceiling of 3, the
  order `create → registrar → finish → service install` with the `--id` being the
  api's `id`, the `service install` refusal passed on in its own words, the
  `.parcial` that stays when the registration fails, the `create` that refuses without anything
  being registered, and the closing without the agent's binary; `scripts/dev/install.spec.ts`
  (the printable plan, and the `--help` that stopped lying)
- **Gap DECLARED:** the end-to-end installation on a clean machine —
  real compose, real api, real runner binary, unit written
  and agent waiting for the first project — is the **E2E** of the phase's session 8, and only
  it can prove it. Here `brabo-runner` is a shell stand-in and the api is a
  test server; what is proven is the CHAINING, never the integration. And the
  main flow of `install.sh` (verifying its own origin against the signed
  `checksums.txt`) still has no coverage, for the reason
  `install.spec.ts` already recorded: no Release has that asset until the next
  final tag
- **ADR:** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md)
- **Origin:** PHASE 30, session 6 —
  [the phase's scope](../../explanation/fase-30-runner-por-maquina.md)

## The self-movement ceiling on the WORKSPACE upsert, and the self-promotion that closes (RN-557)

### RN-557 — Changing one's OWN role is refused with 403 on both membership routes, in both directions {#rn-557}

> **Extended by [RN-615](../api.md#rn-615) (ADR 0173):** the workspace member removal route
> said below not to exist came to exist, with the SAME ceiling
> (removing oneself is 403) — and it is that clause that holds the last owner, without
> counting. The reasoning below about ceiling 1 still holds.

The third and last door of the line opened by [RN-472](../api.md#rn-472) and continued by
[RN-556](../api.md#rn-556). [ADR 0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md)
declared this one in writing — *"`POST workspaces/:workspaceId/members` remains an
upsert with no ceiling at all — same class of defect, scope above"* — and
[ADR 0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md) reaffirmed it as
"different scope, separate decision". It is `BRB-002`, security P1.

**The defect, measured.** `AddWorkspaceMemberUseCase.execute` received
`(workspaceId, userId, role)` and called `workspaces.addMember` — **it did not receive the
actor** —, and the controller (`@Post(':workspaceId/members')`,
`@RequireRole('owner')`) called it with the bare body, without `@CurrentUser()`. There
was nothing with which to apply any ceiling.

**Why it is more serious one scope above.** Two things that exist in the project do not
exist here: (a) **there is no level above to catch the fall** — in the project,
demoting oneself drops the effective role to the workspace role, which often
holds it; in the workspace the role is the role, and an `owner` who writes themselves `viewer`
loses the entire workspace, with all the projects and the very capacity to invite
whoever would restore them; (b) **there is no member removal route** —
`WorkspacesController` has no member `@Delete` (measured, and ADR 0156 had
already used that fact). Undoing is this same route, which requires the just
abandoned `owner`.

**Self-PROMOTION was a loophole, and it closes.** ADR 0127 recorded in the Consequences
that it stayed: *"A `maintainer` can write themselves as `owner` of the project (…) the
ceilings are about going down"*. This RN **revises** that sentence. The two halves are the
same movement — a person deciding alone what authority they have — and the upper one
is the only one that **escalates privilege**: ADR 0127 could say its ceilings
were not about escalation ("nobody gains a role they did not have"), and about promotion
that is false.

| movement | outcome |
|---|---|
| changing one's own role in the PROJECT, downward | **403** — [RN-472](../api.md#rn-472), unchanged |
| changing one's own role in the PROJECT, upward | **403** — it was allowed, and this is what changes |
| changing one's own role in the WORKSPACE, in any direction | **403** — the new door |
| rewriting one's own role with the SAME value | passes — an idempotent upsert is not a movement |
| an `owner` demoting ANOTHER `owner` in the workspace | passes — it is the only way to revoke ownership |
| associating/demoting ANOTHER person, in any scope | passes — the usual legitimate capability |
| self-promotion through REMOVAL of the project row | passes — protected by ADR 0156, point 3 |

**The ceiling does NOT count owners.** Refusing only when the caller is the last
owner was considered and refused by the literal criterion of ADR 0127: *"it is stated in a
clause, it has no number to age"*. A count adds a read
that can get out of phase with the write, has to judge whether an inactive second owner
counts, and makes the same call with the same body pass today and refuse tomorrow without
anything the caller controls having changed. And the clause **already produces the
invariant the count would exist to guarantee**: a workspace is never left without an
`owner`, because removing the last one would require them to do it themselves.

**Ceiling 1 has no counterpart in this scope, and it was considered, not mirrored.**
Unlike removal ([RN-556](../api.md#rn-556)), here the movement EXISTS — an `owner`
can demote another. The refusal comes from ceiling 1 being a rule about **hierarchy
inversion**: in the project the row overlays the workspace one ([RN-471](../web.md#rn-471)) and
a `maintainer` reaches whoever is ABOVE them; in the workspace
`@RequireRole('owner')` already guarantees nobody reaches someone bigger than themselves — the
precondition is absent. Putting the counterpart, added to the absence of a removal route, would make
`owner` an **absorbing state**: nobody would leave it via HTTP, and offboarding,
ownership rotation and correcting a wrong invite would come to require a direct write
to the database — the class of state ADR 0127 was born to eliminate, with the
sign flipped.

**The rule is not copied: the comparison becomes ONE classifier.**
`autoMovimentoDoProprioPapel` returns the DIRECTION
(`'rebaixamento' | 'promocao' | null`) instead of a boolean, because whoever calls
needs it to choose the message. `ehAutoRebaixamento` keeps existing
as a READING of the classifier, and for a behavior reason and not a
compatibility one: `remocaoEhAutoRebaixamento` delegates to it, and widening it would make
REMOVAL also refuse self-promotion — removing one's own row that restricted
someone is precisely how one undoes the restriction ceiling 1 prevents from creating,
a movement ADR 0156 protected in writing.

**Four messages, one per DIRECTION and per SCOPE.** Whoever tried to promote themselves does not
receive the demotion sentence (it is not what they did), and whoever hits the
workspace ceiling is not told to talk to a `maintainer` — there the role that undoes is
`owner`. The same discipline as point 5 of [RN-556](../api.md#rn-556) and of
[RN-470](../web.md#rn-470).

**The actor's role comes from the repository, not from `ResolveEffectiveRoleUseCase`** —
the inverse of RN-556's choice, for the same reason it gave: in the project use
cases the other one comes in so the actor's role does not become a second hand-written
composition of `projectRole ?? workspaceRole`; in the workspace there is no composition
to protect (`forWorkspace` IS `workspaces.findMemberRole`), and this use case already
has the repository in hand.

**The PROMOTION half in the workspace is unreachable via HTTP, and is applied
anyway.** With `@RequireRole('owner')` the actor is already at the top and there is nowhere to
go up. It goes in and is tested for the reason ceiling 2 always had for not having a
threshold: the use case does not presume the guard, and it is what stays right on the day
the route changes its minimum. The same design as the capability refusal of
[RN-514](../engine.md#rn-514), implemented before it had any trigger.

**No web line changes, and it is not an omission:** `POST /workspaces/:workspaceId/members`
has no caller in `apps/web` — measured; the only occurrence is the generated type in
`api-types.generated.ts`. There is no toast to adjust nor `Select` to close.

- **Code:** `apps/api/src/domain/iam/tetos-de-rebaixamento.ts`
  (`autoMovimentoDoProprioPapel`, the type `SentidoDoAutoMovimento`, the three
  new messages and the `ehAutoRebaixamento` that became a reading of the
  classifier),
  `apps/api/src/application/use-cases/iam/add-workspace-member.use-case.ts`
  (the signature with `atorId`, the read of the actor's role and the two 403s),
  `apps/api/src/application/use-cases/iam/add-project-member.use-case.ts`
  (the swap of `ehAutoRebaixamento` for the classifier, which is what closes the
  self-promotion there),
  `apps/api/src/interfaces/http/iam/workspaces.controller.ts`
  (`@CurrentUser()`, the `@ApiForbiddenResponse` and the description),
  `apps/api/src/interfaces/http/iam/dto/add-member.dto.ts` and
  `apps/api/src/interfaces/http/iam/projects.controller.ts` (the descriptions that
  promised "no ceiling at all" and "downgrading yourself"),
  `apps/api/src/db/seed.ts` (the `owner.id` as actor),
  `apps/api/src/application/use-cases/iam/resolve-effective-role.use-case.ts`
  (UNTOUCHED, third ADR in a row)
- **Test:** `apps/api/test/application/use-cases/iam/tetos-de-rebaixamento.use-case.spec.ts`,
  block *"Teto de auto-movimento no WORKSPACE — a quarta porta"* (the refusal with
  another owner present, the refusal of the sole owner, the unreachable promotion, the
  message per scope, the idempotent upsert, the `owner` demoting another `owner`
  and the association of third parties), plus the three cases in the ceiling 2 block — the
  self-promotion test INVERTED, with the name keeping its origin, the assertion that
  each direction has its sentence, and the idempotent upsert in the project
- **ADR:** [0157](../../adr/0157-teto-de-auto-movimento-no-upsert-de-workspace.md),
  which references [0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md)
  and [0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md), and revises the first's
  sentence about self-promotion
- **Origin:** `BRB-002`, Security P1 of the maintainer's registry — the last
  movement the two previous ADRs left declared

---

## The device key gets a screen, and the screen states the reach of revoking (RN-561)

### RN-570 — The installer brings up the installation only with files the Release signed, checked before asking or writing anything {#rn-570}

[RN-549](../ci.md#rn-549) measured, the first time the installer ran on a clean
machine, that the published `install.sh` **brought up nothing on its own**: it called
`docker compose -f docker/docker-compose.install.yml`, a path RELATIVE to the
directory it ran from, and that file was not a Release asset, did not enter
the signed `checksums.txt` and was not downloaded anywhere. Whoever followed the
runbook's one-liner died in *"no such file or directory"* AFTER the script
had written the `.env` with the secrets. The maintainer decided the way out on
2026-09-13 — a signed asset, and not a clone ([ADR 0160](../../adr/0160-o-compose-do-instalador-viaja-assinado.md)).

**The rule:**

1. **Four files travel with the installer, in the SAME manifest.** The installation
   compose and the three the installation uses by relative path — the
   `postgres/init.sql` and the `ollama/pull-models.sh` that the compose bind-mounts, and the
   `backup/test-restore-compose.sh` that the migration ([RN-530](../infra.md#rn-530)) executes —
   are published as `brabo-install-*` assets by the `checksums` job and enter the
   `sha256sum` that generates the signed `checksums.txt`. The fourth was not in the
   E2E's workaround and was found while implementing: in a folder without a checkout the
   migration would die there. The job checks each manifest line against the file
   (`sha256sum -c --strict`) before attaching.
2. **The table has two sides and a guard.** The publisher reads
   `scripts/ci/assets-do-instalador.ts`; the downloader reads the `case` of
   `destino_do_asset_do_instalador` in `install.sh` (bash 3.2, without Node). The spec
   fails the divergence between the two AND derives from the compose every `./…` bind-mount
   that is not in the table — which is exactly how the defect was born.
3. **Verifying comes right after its own origin, and before everything.** The
   installer downloads the four and compares each sha256 against the `checksums.txt` that
   `verificar_a_si_mesmo` already verified (never a second download), by
   EXACT name equality. The three refusals are distinct — asset not published,
   manifest that does not cover it, hash that does not match — and all happen with the
   machine untouched.
4. **It never falls back to the relative path.** `COMPOSE_DE_INSTALACAO` is born EMPTY and only gets an
   absolute path when the verified copies are put under the installation's folder,
   at the first instant they are needed (the migration or the
   startup). Whatever is already there is REPLACED, never read — with `rm` before the
   `cp`, so a symlink does not carry the write outside.

**What this rule does NOT close:** the end-to-end proof only happens on the first
final tag after the merge — `install-e2e.yml` does not run on PRs (ADR 0150) —, and
no already published Release gains the assets: they stay with the old
installer and the workaround of running it from inside a checkout at the tag. The adjacency
ADR 0160 declared — `test-restore-compose.sh` called Compose without
`--env-file`, and Compose looks for the `.env` in the compose's folder — closed in
AT-102: the installer passes `BRABO_ENV_FILE` (`--env-file`, and not
`--project-directory`, which would also change the project's name and the base of the
relative paths) and the installation compose declares the `backup_local` volume
that the `backup` service references, whose absence refused the whole file with the
profile on. Covered by `scripts/dev/prova-de-restauracao-env.spec.ts`.

- **Code:** `install.sh:129` (`COMPOSE_DE_INSTALACAO` empty until materialized),
  `:587` (`ASSETS_DO_INSTALADOR`), `:589` (`destino_do_asset_do_instalador`, the
  downloader side's table), `:614` (`baixar_e_verificar_os_arquivos_da_instalacao`),
  `:607`/`:615`/`:617` (the three refusals), `:648`
  (`materializar_os_arquivos_da_instalacao`), `:1573` (the migration materializes
  before the backup), `:1677` (the verification right after its own origin),
  `:1831` (the startup materializes before the `up`);
  `scripts/ci/assets-do-instalador.ts:55` (the publisher side's table), `:93`
  (`problemasDoMapeamento`), `:135` (`prepararAssets`);
  `.github/workflows/build-runner-binaries.yml:468` (the assets prepared from the
  tag's checkout), `:494` (in the same `sha256sum`), `:520` (the
  `--strict` check), `:527` (attached together with the manifest)
- **Test:** `scripts/dev/install-arquivos-da-instalacao.spec.ts:144` (happy
  path against a fake Release), `:162` (absent asset, `.env` never
  written — failure case), `:179` (hash that does not match — failure case), `:191`
  (manifest that does not cover), `:202` (a similar name does not cover), `:217`
  (materializing without verifying is a refusal), `:225` (what was already there is replaced,
  and the symlink does not carry the write outside), `:258`/`:273`/`:280` (the order in
  `main` and in the migration); `scripts/ci/assets-do-instalador.spec.ts:89` (every
  relative bind-mount is an asset), `:114` (the shell's `case` is the
  TypeScript table), `:148`/`:152`/`:161` (the pipeline signs, checks and attaches);
  `scripts/dev/install-e2e.spec.ts:247` (the manual workaround does not come back, and the E2E
  asserts the installer downloaded them), `:295` (the token that downloads the manifest is not
  in the installer's environment)
- **Origin:** AT-026 — the finding of AT-008 (RN-549), decided by the maintainer on
  2026-09-13

## The container broker in the installation, with consent (RN-575)

### RN-575 — The installer only turns on the container broker with a typed "s", measures the socket's group from inside a container, and writes the four lines together or none {#rn-575}

In an installation by Release, a `container` or `mounted` project never executed:
what starts the container of those two modes is the broker ([ADR 0144](../../adr/0144-a-segunda-raiz-do-broker.md)),
and the installation did not have the service because the image was not published (ADR 0150,
decision 7). [ADR 0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md)
publishes the image as the fifth and puts the service in the installation compose,
OFF; this rule is what decides when it turns on, because turning it on hands the
machine's Docker socket to an installation service.

**The rule:**

1. **Only a typed "s"/"sim" turns it on.** The question comes after the base (the broker's second
   root derives from it) and before the `.env`, and SAYS in text what it grants —
   this machine's Docker socket, and that whoever commands the broker commands
   Docker — and what contains it. Enter, any other answer and the lack of a
   terminal leave it off, and the lack of a terminal is STATED, never decided
   silently. While the answer is not yes, Docker is not touched.
2. **The socket's group is MEASURED, from inside a container**, with the broker's own
   image, no network, read-only rootfs and the socket mounted by
   `--mount type=bind` — which refuses a nonexistent source instead of creating a
   folder on the host, as `-v` would. It is the gid seen from inside that `group_add`
   needs (in Docker Desktop the host's says nothing). A measurement that fails, a path
   that is not a socket or a gid that is not a number are a named REFUSAL, which teaches to
   run again answering no — never the compose default's `999`.
3. **The four lines go together or none goes:** `COMPOSE_PROFILES=container-broker`,
   `BROKER_URL=http://broker:8090`, `DOCKER_GID` and `PROJECT_WORKSPACES_HOST_ROOT`.
   A profile without a URL brings up a broker nobody calls; a URL without a profile points the
   api to a service that does not come up. `escrever_env` refuses to write the block without the
   measured gid — a defect of the script, not of the machine. `BRABO_BROKER_IMAGE` is
   ALWAYS written, on or not: Compose interpolates the whole file before
   filtering by profile.
4. **The managed folder's root is COMPUTED and then CHECKED.** Before
   startup, `<DockerRootDir>/volumes/brabo_project_workspaces/_data`; after,
   compared with the volume's `Mountpoint`. Diverging, or the api not reaching the
   broker over the internal network, becomes a named PENDING item at the end — never a refusal, which
   would take down an installation that is up because of a step fixed by editing the
   `.env`.
5. **The decision shows up in the final summary**, in both directions, and the sentence about what
   the installer does NOT do stops saying that only the Mounted folder stays without a
   container: `container` does too.

**What this rule does NOT close:** the `DOCKER_GID` and the computed root were not
measured on Docker Desktop for macOS, and the tag's E2E runs the interactive half only
on Linux. Rootless or remote Docker does not have the socket at `/var/run/docker.sock`,
which is the path the compose mounts, and falls into the refusal of item 2 — turning the broker on
there is not offered by another path.

- **Code:** `install.sh:1196` (`consentir_broker`), `:1148`
  (`medir_gid_do_socket`), `:1183` (`calcular_raiz_gerenciada`), `:1320`
  (`conferir_o_broker`), `:792` (`escrever_env_do_broker`), `:855` (the broker in the
  manifest), `:1812` (the order: after the base, before the `.env`);
  `docker/docker-compose.install.yml` (the `broker` service and the `broker` network)
- **Test:** `scripts/dev/install-broker.spec.ts:158` (without a terminal: off,
  stated, Docker untouched — failure case), `:169` (Enter), `:179` (`n`), `:187`
  (`s` turns on, with `--mount` and no network), `:208`/`:221`/`:229` (the three refusals),
  `:237` (the root as a pending item), `:248` (the final sentence);
  `scripts/dev/install-env.spec.ts:250`/`:259` (the four lines together or
  none), `:270` (the gid guard), `:291`/`:307` (the `.env` against Compose's
  parser: the broker comes up without a flag, with the token, the two roots and the gid, and the api
  points to it — or none of that); `scripts/dev/composes-em-conformidade.spec.ts:114`
  (the layers of ADR 0130 in the file that travels)
- **ADR:** [0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md)
- **Origin:** AT-097 — decided by the maintainer on 2026-09-18

---

## The installer offers the local models, and does not mistake dev for an installation (RN-691, RN-692)

### RN-691 — `install.sh` ASKS whether to switch on the local models (profile `llm`), measures the Ollama port before writing, and composes ONE `COMPOSE_PROFILES` line {#rn-691}

Measured in a real installation of v7.0.0 (AT-351): every business rule recorded
`backlog.semantic_duplicate_check_skipped` with `getaddrinfo EAI_AGAIN ollama`,
because the installation from a Release starts without the `llm` profile and the installer never
asked; switching it on by hand hit `address already in use` on 11434, the
port of a NATIVE Ollama on the host.

**The rule:** after the broker question ([RN-575](#rn-575)), the installer states
the COST (disk for the image and for the models the `ollama-model-loader` downloads, RAM
with a model loaded) and what is LOST without it (the semantic
duplicate check of [RN-681](../api.md#rn-681) and a local model for the agents), and only a typed "s"
switches it on; without a terminal it stays off SAYING so. Switching on MEASURES the host
port before writing anything — 11434, or the first free one up to 11443,
through bash's own `/dev/tcp` (3.2 included) — and the whole range being taken is a NAMED
refusal, with nothing written, never an `address already in use` on startup.
The `.env` gets `OLLAMA_PORT` and the `llm` profile; the consented profiles go out
in a SINGLE `COMPOSE_PROFILES` line (`container-broker,llm`), because two
lines do not add up — the last one would win and the broker would silently vanish.

Left OUT, declared: the session stating ONCE that the semantic check was
skipped (api side, another front); and the tag's E2E answers NO (switching on would
download GBs of models), so startup with the `llm` profile is not proven end
to end.

- **Where:** `install.sh:1274` (`consentir_llm`), `:1259`
  (`escolher_porta_do_ollama`), `:1249` (`porta_em_uso`), `:800`
  (`escrever_env_do_llm`), `:821` (`escrever_env_dos_profiles`)
- **Test:** `scripts/dev/install-llm.spec.ts` (without a terminal it stays off
  stating the cost; 11434 taken picks the next one; whole range taken fails
  — failure case; a listening server is measured as in use; broker and models
  in a single line); `scripts/dev/install-e2e.spec.ts` (the answer to the new question
  is in the TTY driver's list, in order)
- **Origin:** AT-351

### RN-692 — Only the `brabo` compose project is a previous installation, and migration offers reinstalling FROM SCRATCH after the proven backup {#rn-692}

`detectar_por_sinais` matched `"Name":"brabo[^"]*"`, and the DEV compose
(`brabo-dev`, ADR 0170) counted as a previous installation — the installer
offered to migrate the development environment. Now it matches only the EXACT name
`brabo`.

And the migration confirmation gets a third answer: `z` reinstalls FROM
SCRATCH. The order of ADR 0150 does not change — backup, PROOF, question, delete, install —,
but the old data is NOT restored: the proven backup stays in the folder, and
restoring it later is the runbook's `#restore`. `s` restores — and, since
[RN-998](#rn-998), restores EVERYTHING: Postgres into a freshly created, empty database, the git
repositories and the reprojection of the graph and the artifacts; until then only
the git repositories came back. Enter still deletes nothing.

Along with it, the wrap-up stops saying that pairing a folder through the project screen
"still exists (ADR 0118)": that flow left in ADR 0203 ([RN-687](../web.md#rn-687)).

- **Where:** `install.sh:440` (`detectar_por_sinais`), `:1918`
  (`migrar_instalacao_anterior`)
- **Test:** `scripts/dev/install-llm.spec.ts` (`brabo-dev` does not count and `brabo`
  counts; `z` deletes after the proof and leaves `MIGRAR_DE` empty; Enter does not delete —
  failure case; the ADR 0118 sentence does not come back)
- **Origin:** AT-358

## The installer's migration brings the whole previous installation back (RN-998)

### RN-998 — The migration restores the database into an empty database, keeps the master key, is resumable and understands the line of versions {#rn-998}

The first real migration from a 7.0.0 to product 1.0.0 (AT-710) brought up an
EMPTY installation with unreadable credentials. [ADR 0256](../../adr/0256-a-migracao-restaura-o-banco-num-banco-vazio.md)
closes the findings of AT-738, and the rules are these:

1. **Postgres comes back on its own.** After `down -v`, the installer brings up ONLY
   `postgres`, runs `brabo-restore --banco-vazio` (it refuses a database with any
   table) and only then brings up the rest, with the migrations on top of the dump. Next,
   the git repositories and the reprojection of the graph and the artifacts; a
   reprojection that fails is a PENDING item with the command, never a refusal.
2. **The git comes back as the volume's owner**, read in the api container (`stat`),
   never assumed: uid 70 of the backup image does not write to a volume of another
   owner, and neither does `--user 0:0`, because of `cap_drop`.
3. **The secrets that encrypt restored data come from the previous `.env`**, at the minimum
   `CREDENTIALS_MASTER_KEY` (environment → previous `.env` → generated), and every
   key the new `.env` does not declare comes back with its last value
   (`CREDENTIALS_MASTER_KEY_PREVIOUS`, `ANAMNESE_ENABLED`, `BRABO_BIND`…). Left
   out are those the installer decides on the spot (`COMPOSE_PROFILES`,
   `BROKER_URL`, `DOCKER_GID`, `PROJECT_WORKSPACES_HOST_ROOT`, `OLLAMA_PORT`) and the
   `_PREVIOUS` of the ephemeral secrets, which are born new.
4. **Backup, proof and deletion run with the migration's environment:** the five
   `BRABO_*_IMAGE` of this version (the previous `.env` may cite a local image that
   is gone), `BRABO_BACKUP_USER` = uid:gid of whoever runs it (the folder is theirs) and
   `BRABO_BACKUP_HOST_DIR` = the destination, so the proof restores the SAME backup
   that stays in the folder. The folder is born `0755`, declared.
5. **The migration is resumable.** The marker (schema 4) is written right after
   `down -v` with `restauracaoPendente` (`destino` and `etapas`: `banco git grafo
   artefatos`), and again at each step and when the new version comes up. The next
   run that finds the pending item RESUMES the restoration, without migrating again and without
   deleting anything; an absent backup folder is a named refusal.
6. **Line of versions.** The marker records `linha`. Without it, the installation belongs to the
   previous line, except for images under `ghcr.io/viralabs-dev/` (the 1.0.0 of this line
   recorded schema 3). Between lines the relation is `nova-linha`, with its own sentence and
   a default of yes ([RN-542](parte-01.md#rn-542)).
7. **Download with retry.** Every download goes through `baixar` (`curl
   --retry 6 --retry-delay 10 --retry-connrefused`); 404 is "the Release does not
   publish", and the rest is "the server did not deliver, run it again" — different
   sentences.

It revises [RN-530](../infra.md#rn-530) (the dump no longer stays only in the folder) and
the `s` sentence of [RN-692](#rn-692).

- **Where:** `install.sh:1918` (`migrar_instalacao_anterior`), `:1903`
  (`com_ambiente_do_backup`), `:1993` (`restaurar_o_banco`), `:2009`
  (`restaurar_os_repositorios_git`), `:2025` (`reprojetar`), `:2062`
  (`gravar_marcador`), `:930` (`relacao_com_o_instalado`), `:949`
  (`restauracao_pendente`), `:736` (`gerar_segredos`), `:971`
  (`preservar_do_env_anterior`), `:194` (`baixar`)
- **Test:** `scripts/dev/install-migracao.spec.ts` (one case per item, with
  `docker`, `curl` and the fake proof on the PATH; the failure case of each — a
  backup that fails deletes nothing, a refused restore stays pending, an unreadable owner
  refuses, 404 ≠ 504); `scripts/dev/install-fechamento.spec.ts` (schema 4)
- **Origin:** AT-738 (EP-033), decisions of the owner of 5 November 2026
