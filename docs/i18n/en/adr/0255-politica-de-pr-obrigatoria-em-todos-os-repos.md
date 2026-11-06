---
traducao_de: a766a77602f64b8f373dcf2fcd64c6af12aebc25
---

# ADR 0255 — The PR policy is mandatory in every repository and the bot's regeneration PR skips the ladder on dev

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `git`
- **References:** ADRs [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) and [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md), and activities AT-726 and AT-733. None of them is edited.

## Context

With the split into repositories (0252), the `Política de branches` and `Escada de aprovação` checks only signaled: no ruleset required them, so a PR that was red on them could still be merged. Three repositories (`brabo`, `brabo-qa`, `brabo-infra`) did not even have a ruleset against force push. And the PR that the GitHub App `viralabs-dev-brabo` opens on a schedule to regenerate the generated files (AT-726) would wait for human approval every 6 h. Owner's decisions of 11/05/2026.

## Decision

1. **`Política de branches` and `Escada de aprovação` are REQUIRED checks** in the ruleset of `dev` and `main` of the 11 repositories `viralabs-dev/brabo*`.
2. **`brabo`, `brabo-qa` and `brabo-infra` get the ruleset "main and dev without force push"**, which the others already had.
3. **The PR of the GitHub App `viralabs-dev-brabo` on the fixed branch `chore/regenera-gerados` with destination `dev` skips the ladder**, recognized by author AND branch (both), on the model of ADR 0236. `main` keeps the whole ladder.

## Consequences

- A PR that fails the policy or the ladder can no longer be merged in any repository of the set.
- The regenerated files reach `dev` without human waiting; the other checks of `dev` remain the review, and the promotion to `main` still requires approval.
- Author or branch alone are not enough for the exemption.
