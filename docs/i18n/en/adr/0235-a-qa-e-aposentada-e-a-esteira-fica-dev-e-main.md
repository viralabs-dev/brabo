---
traducao_de: 43cc8a02d2589da10f56a0d230a89967700d3a9b
---

# ADR 0235 — `qa` is retired for now and the repository's pipeline becomes `dev → main`

- **Status:** accepted
- **Date:** 2026-11-02
- **Revises:** the ladder and promotion flow of
  [ADR 0030](0030-politica-de-branches-mecanizada.md) (from `dev → qa → main` to
  `dev → main`)
- **Revokes:** the mechanism of
  [ADR 0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) (automatic
  promotion to `qa`, which without `qa` has no destination)
- **Prior context:** [ADR 0034](0034-documentacao-publicada-por-degrau.md),
  [ADR 0071](0071-publicacao-simetrica-por-degrau.md) and
  [ADR 0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) (one site per step:
  there is now one step fewer)

## Context

On 11/02/2026 the owner decided: "retire `qa` for now and stay with just `dev`
and `main`". With a single maintainer, the staging step repeated `dev`'s
validation and cost a whole promotion per cycle. "For now" means that coming
back has to be cheap.

## Decision

1. **Scope: only Brabo's REPOSITORY.** The Gitflow the product creates in
   users' projects (bootstrap, RN-582/RN-664) does NOT change, and `qa` stays in
   the product's `PROTECTED_BRANCHES`, in the mold of `rc` (ADR 0030):
   unprotecting a branch that exists costs dearly.
2. The pipeline becomes `dev → main`; the back-propagation is `main → dev`.
   `qa` leaves the `ESCADA`, the `ESTAGIO_POR_BRANCH`, the approval ladder and
   the gate order. `qa` goes into `NUNCA_ARQUIVAR`: people decide its fate.
3. **Version anchor.** The final tag on `main` anchors on the cycle's `-dev.N`
   (merge with the second parent stamped and the same tree). The historical
   `-qa.N` tags are still read.
4. **`qa` is archived** at `refs/archive/qa` (the AT-557 mechanism), by human
   gesture and only after the change is on `dev` (the `backmerge-gate` looked up
   `refs/heads/qa`).
5. The site loses the `/brabo/qa/` step; the first publish after the change
   removes it on its own (`keep_files: false`). ADR 0073 still holds.

## Recipe for going back

Revert the round's PR (returns `qa` to the `ESCADA`, the workflows and the
site), revive the branch (`git push origin refs/archive/qa:refs/heads/qa`),
promote `dev → qa` and only then reopen `qa → main`.

## Consequences

- There is no new RN: it is the repository's CI policy, not a product rule.
- No absolute ceiling changes.
- Before the change, `dev → main` failed (`PROMOCAO-NAO-ADJACENTE`) and, forced,
  would have been classified as a hotfix (PATCH); the new anchor closes that
  case.
