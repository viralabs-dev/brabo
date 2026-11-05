---
traducao_de: 8ab4a94a8ad005489ee47bbc26e7f70b0c2dfa0b
---

# ADR 0245 — Quick access by role only in the local environment

- **Status:** accepted
- **Date:** 2026-11-03
- **References:** ADRs [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) and [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) (the session and the cookie), [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) (the `dev`/`prd` vocabulary), [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) (the published images) and [0155](0155-a-primeira-conta-nasce-no-terminal.md) (RN-546). None of them is edited.

## Context

The owner (AT-722, 11/03) asked for a dialog on the login screen where choosing
a role already logs in, for development and for TP-01 on the installation built
on this machine. Production is everything that leaves through GitHub Actions. A
door that issues a session without a credential is an authentication boundary:
it needs a barrier that does not depend on remembering to turn it off.

## Decision

1. **One environment variable, three values.** `BRABO_AMBIENTE` in the api and
   `VITE_BRABO_AMBIENTE` in the web (Vite only exposes `VITE_*`): `dev` (Actions
   on `dev`), `prd` (Actions on `main` and release tags) and `local` (only
   outside Actions). Quick access exists **only with `local`**; absent, empty or
   any other value, it does not exist.
2. **Four layers.**
   - Build: `AMBIENTE` in `docker-bake.hcl` (default empty) becomes the
     build-arg `BRABO_AMBIENTE` (api) and `VITE_BRABO_AMBIENTE` (web); in the
     web the dead branch disappears from the bundle, with no chunk.
   - Image file: the api Dockerfile writes `/app/AMBIENTE_DA_IMAGEM` (the
     compose `environment:` overrides `ENV`, not a file).
   - Runtime: the `acessoRapidoLigado` predicate requires the variable `local`
     AND the file absent (`pnpm dev`) or `local`; the module is only registered
     that way, and otherwise the routes give 404. `NODE_ENV` does not enter: the
     installation runs `production`.
   - Proofs: the predicate's spec, the module's spec,
     `scripts/ci/ambiente-nas-actions.spec.ts` (no workflow turns on `local`),
     steps of `docker/smoke.sh` and the E2E test.
3. **Production is everything that leaves through Actions**: `ci.yml` passes
   `dev` or `prd` by the PR's base and `release.yml` passes `prd`. `install.sh`
   does not change; TP-01 turns on `local` through the runbook.
4. **Accounts `<role>@brabo.dev`** (`owner`, `maintainer`, `developer`,
   `viewer`, the `ROLE_ORDER`). `POST /auth/dev-login { papel }` resolves only
   these accounts, never a free email, and issues the session through the same
   `EmitirSessaoUseCase` as login. On the installation the route ensures the
   accounts through the `ProvisionarUsuarioUseCase` core with a discarded RANDOM
   password, in a workspace of its own ("quick access (local)"), with no access
   to the real projects. RN-546 stays intact: there is no known password and the
   seed keeps refusing production. With no user on the installation, 409 (the
   `first-account` creates the first account).
5. **Bind on `127.0.0.1`.** With `local`, the installation's api and web ports
   are bound to `127.0.0.1` (`BRABO_BIND`).
6. The seed's `dev@brabo.dev` becomes `developer@brabo.dev`.

## Consequences

- Declared risks: with `local`, whoever reaches the port gets in as any role
  (hence the bind); the route has no rate limit or CSRF, like `/auth/login`, and
  the defense is it not existing outside `local`; an image built by hand with
  `AMBIENTE=local` is local by definition; a database seeded earlier keeps the
  orphaned `dev@brabo.dev` until the next reset.
- The route appears neither in `route-surface.spec` nor in `openapi.json`; it
  stays in the prose of `docs/security-surface.md`.
