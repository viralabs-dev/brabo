---
traducao_de: ee557cab443ad894afe190e808b0ee99fab50a29
---

# ADR 0236 — Dependabot is exempt from review on `dev` and is mergeable with the other checks green

- **Status:** accepted
- **Date:** 2026-11-02
- **Revises:** the approval ladder of
  [ADR 0030](0030-politica-de-branches-mecanizada.md) (`solo` mode: "a
  third-party PR requires 1 approval from the owner"), only for Dependabot and
  only on the `dev` step
- **Prior context:** [ADR 0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md)
  (the pipeline is `dev → main`)

## Context

The `Approval ladder` check treats `dependabot[bot]` as a third party: in
`solo` mode, its PR waits for the owner's approval even with all the other
checks green. On 11/02/2026 #1201 turned red only because of that, and the
owner asked: "make Dependabot not depend on my approval: if it passes all the
other CI/CD, it is mergeable".

## Decision

1. **A Dependabot PR to `dev` passes the ladder without review**, in both modes
   (`solo` and `community`). The other checks play the role of review: tests,
   build, drift, `pr-police` and the two-digest rule.
2. **Dependabot is recognized by author AND branch**, with the SAME yardstick as
   `pr-police`: `ehBranchDoDependabot` requires the `dependabot/…` branch and
   the bot's login, and `dependabot` without a suffix only counts with `user.type
   == Bot`. A human who names the branch `dependabot/` still needs approval.
3. **Only on `dev`.** For `main` the ladder stays whole. Dependabot already
   comes in through `dev` (`target-branch: dev` and `dependabot-para-dev.yml`),
   and reaches `main` through the promotion, like everything else.
4. **Nothing is merged on its own.** "Mergeable" means that no check requires
   an extra gesture. It still holds that merging into a protected branch is a
   manual act (the merge into `dev` belongs to whoever drives the round; the one
   into `main`, to the owner).

## Consequences

- The Dependabot update is ready to merge as soon as its CI finishes green,
  without waiting for the owner to open the PR to approve.
- The risk of a malicious or broken update passing without human eyes is
  covered by the CI and by the promotion to `main`, which keeps the whole
  ladder. The PR remains visible and can be closed before the merge.
- Implementation: `scripts/ci/approval-ladder.ts`
  (`DESTINO_SEM_REVISAO_PARA_O_DEPENDABOT`, `dispensadoPorDependabot`) and the
  `PR_AUTOR_TIPO` in `.github/workflows/approval-ladder.yml`, proven in
  `scripts/ci/approval-ladder.spec.ts`.
