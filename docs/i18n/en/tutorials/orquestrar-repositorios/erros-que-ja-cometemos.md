---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: Mistakes we already made
description: Nine short lessons, each with the symptom, the cause and the rule that stayed, taken from Brabo's repositories and public ADRs.
---

# Mistakes we already made

**Who it is for:** anyone who wants to avoid the costliest path.

**After reading, you can:** recognize nine traps of a set of repositories before falling into them. Each lesson explains itself and points to the public source.

## 1. Copying the list of repositories by hand
- **Symptom:** the "Repositórios do Brabo" section was in 14 places, in 11 different versions. The `brabo-ci` README said it depended on nobody, but it reads data from two other repositories.
- **Cause:** copying with no single source and no verification.
- **The rule that stayed:** one source (`repos.yml`), the rest is generated, and a check fails what diverges. [ADR 0281](../../adr/0281-o-mapa-dos-repos-tem-uma-fonte-so.md).

## 2. Reading the siblings' `dev` "as of now"
- **Symptom:** the same PR, with no new commit, went from green to red. There were about 56 merges a day across the siblings' `dev` branches.
- **Cause:** the documentation generator cloned the tip of each sibling's `dev` on the spot.
- **The rule that stayed:** read the siblings through a SHA lock that only a bot bumps. [ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md).

## 3. Measuring everyone's translation
- **Symptom:** 19 of the 28 red PRs in two weeks were not at fault for what they changed.
- **Cause:** translation parity summed the documentation of all repositories, so someone else's merge changed the total.
- **The rule that stayed:** each repository measures only its own documentation. [ADR 0273](../../adr/0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md).

## 4. Leaving the merge order in someone's head
- **Symptom:** infra's `dev` went red between two merges in different repositories.
- **Cause:** GitHub has no dependency between repositories, and the order was written nowhere.
- **The rule that stayed:** the PR declares `Depende-de: owner/repo#N` and a check waits; in promotion, the order is inferred from the layers. [ADR 0276](../../adr/0276-a-pr-declara-de-que-pr-depende-o-merge.md) and [ADR 0284](../../adr/0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md).

## 5. A policy pin without a readable version
- **Symptom:** 5 different SHAs across 11 repositories, and pins frozen without warning.
- **Cause:** the pin comment said `# dev` or nothing, and Dependabot only updates a pin whose comment is a version.
- **The rule that stayed:** the comment is `vX.Y.Z`, the SHA is the tag's, and a check verifies it. [ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md).

## 6. Pushing a tag or opening a PR with `GITHUB_TOKEN`
- **Symptom:** the promotion PR became "mergeable" without the promotion check having run, and the tag never published the Release.
- **Cause:** GitHub does not trigger workflows from events created by `GITHUB_TOKEN`.
- **The rule that stayed:** whatever must trigger another workflow uses a GitHub App token. [CI lessons, no. 3](../../explanation/licoes-do-ci.md).

## 7. Putting `if:` on a required job
- **Symptom:** the check stayed green after the PR's base changed.
- **Cause:** the status is indexed by commit and name; a skipped job leaves the old green stuck, and `skipped` counts as green.
- **The rule that stayed:** the required job always runs, and the filter goes inside it. [CI lessons, no. 2](../../explanation/licoes-do-ci.md).

## 8. A product pin behind the latest Release
- **Symptom:** the product was left with a tag and no Release, twice in a row (v2.1.0 and v2.1.1).
- **Cause:** a component released between the merge into `main` and the stamping, and the lock failed.
- **The rule that stayed:** a bot bumps the pin, and the way out is to merge its PR and let a product patch ship. [Product release](../../explanation/release-do-produto.md).

## 9. Rewriting the whole lock when bumping a contract
- **Symptom:** `brabo-broker`'s CI broke after the contract version was bumped.
- **Cause:** `pnpm install` regenerated the whole lock, not only the contract's entries.
- **The rule that stayed:** the bump script grafts only the contract's blocks onto the old lock and refuses the rest. [`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh).

> **For your project:** the pattern across the nine lessons is the same. What is not generated or checked by machine, drifts. Before splitting, decide which check will police each edge.

Back to the [start of the path](index.md).
