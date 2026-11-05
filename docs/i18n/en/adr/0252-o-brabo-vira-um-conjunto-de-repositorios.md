---
traducao_de: 58f20f24eac7374db995438e278dbf37663f42f5
---

# ADR 0252 — Brabo becomes a set of repositories in `viralabs-dev`

- **Status:** accepted
- **Date:** 2026-11-04
- **References:** ADRs [0030](0030-politica-de-branches-mecanizada.md), [0117](0117-lockfile-proprio-para-o-website.md), [0119](0119-imagens-publicadas-no-ghcr-por-digest.md), [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md), [0130](0130-broker-de-container.md), [0149](0149-assinatura-dos-artefatos-publicados.md), [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md), [0202](0202-o-indice-de-adr-por-tema.md) and [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md). None of them is edited: each remains in force for the repository that inherits the subject, and the file path changes without the decision changing.

## Context

The monorepo gathers api, engine, web, runner, broker, infrastructure, documentation and E2E in a single history, with a single version and a single pipeline. The owner decided on 11/02/2026 (EP-033, AT-688) to split it into repositories in the `viralabs-dev` organization. The survey is in the vault's AT-688 note; this ADR records the decision and the map. **State: decided, migrating (wave A). Nothing is split yet.**

## Decision

1. **New repositories, all PUBLIC, with the `brabo-` prefix:** `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-runner`, `brabo-broker`, `brabo-contracts`, `brabo-ci`, `brabo-infra`, `brabo-qa` and `brabo-workspace`. None reuses `infra-viralabs`.
2. **What each one takes:**
   - `brabo-api`: `apps/api`, `gates.yml`, `openapi.json`; `brabo-engine`: `apps/engine`, `prompts/`, golden-set fixtures; `brabo-web`: `apps/web`, `design/`; `brabo-runner`: `apps/runner` and the build and publication of the binaries; `brabo-broker`: `apps/broker`.
   - `brabo-contracts`: `packages/shared`, `packages/docker-port`, the source of `agent-areas` and `fluxo.yml`, consumed as a git dependency by TAG.
   - `brabo-ci`: PR and branch policy, ladder, archiving, Dependabot and the community templates, as reusable workflows (`workflow_call`).
   - `brabo-infra`: composes, `deploy/k8s`, `Makefile`, `scripts/dev`, backup and the orchestrator of the local clones.
   - `brabo-qa`: `e2e/`, golden-sets, `scripts/jev`, `scripts/idioma` and the TP-01 script.
   - `brabo-workspace`: the parent folder, with the `CLAUDE.md`, the clone scripts and the shortcuts.
3. **Front door: `viralabs-dev/brabo`** (the empty repository that already exists, made public). It takes the entire documentation (site and README), the `install.sh`, the product RELEASE and the product CHANGELOG. The site stays at `viralabs-dev.github.io/brabo`. Whoever installs only needs to know this repository.
4. **Each repository has its own doc, and requires it in the same PR as the code:** the `docs/` and the RNs live in the repository that owns the code, each one's `docs:check` checks its own, and `brabo` only gathers the folders and publishes the site.
5. **Versions:** each repository has its own, and the product has its own, in `brabo`. All restart at **1.0.0**.
6. **History:** extraction WITH history (`git filter-repo`); `#NNN` becomes `daneiel/brabo#NNN`.
7. **Legacy:** `daneiel/brabo` is TRANSFERRED to the org as `viralabs-dev/brabo-legacy`; locally, the old checkout goes to `~/dev/brabo/brabo-old`.
8. **Bot:** an organization GitHub App, from now on, in place of the personal token (owner's gesture in AT-689).
9. **AT-662** (site without Docusaurus) runs BEFORE the split.
10. **Order of the waves:** A (ADR and context, fixed owner outside the code, isolated contracts, AT-662) → B (doc inside each area, `brabo-contracts`, `brabo-ci`) → C (api, engine, web, runner, broker, workspace) → D (infra, `brabo`, qa, CLAUDE.md per repo, vault) → E (coordinated 1.0.0 release, legacy transfer, local installation) → F (local folder migration, on its own).

## What does NOT change

No product behavior, no business rule and no absolute ceiling (RN-418, manual merge into a protected branch, `decide.ts`). The rule "do not version by hand" holds per repository. The `dev → main` pipeline (ADR 0235) holds per repository.

## Consequences

- The `CLAUDE.md` documentation rules change in nature on migration: the docmap stops being checked in the same PR across repositories, and the counts and anchored phrases read the rebuilt layout. Each wave adjusts what it touches.
- The supply chain (GHCR namespace, cosign identity, `images.json`) changes owner together with the release repository.
- The `CLAUDE.md` and the memories are split per repository (AT-708); until then, those at the root hold.
