---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: Why split, and when not to
description: The reasons that led Brabo to 11 repositories, the cost that came with them (SHA lock, translation parity, merge order) and the signs that your product should not be split yet.
---

# Why split, and when not to

**Who it is for:** anyone deciding whether to split a product into repositories.

**After reading, you can:** list what you gain and what you pay by splitting, and say whether your case justifies the cost.

## The starting point

Brabo began as a **monorepo**: api, engine, web, runner, broker, infrastructure, documentation and end-to-end tests in one repository, with **one version, one history and one pipeline**. In November 2026 the product owner decided to split it into repositories inside an organization. The decision and the map are in [ADR 0252](../../adr/0252-o-brabo-vira-um-conjunto-de-repositorios.md), for anyone who wants to read it later.

## What the split brought

What the ADR records as the reason and direct consequence:

- **Independent versions.** Each repository has its own version, and the product has its own in the front-door repository. Fixing the api does not force you to republish the web.
- **A clear owner for each piece of documentation.** `docs/` and the business rules live in the repository that owns the code, and each one's `docs:check` verifies its own.
- **Artifacts of their own.** Whoever publishes a container image, a binary or a package does so in their own repository, with their own signing chain.
- **One front door.** Someone who only wants to install needs to know one repository, not eleven.

> **TODO(humano):** ADR 0252 does not list numbered criteria for "when to split" (for example team size or release pace). If the owner wants the path to state them, he must write them.

## What the split cost

Splitting moves the complexity to the **edges** between repositories. These are the costs Brabo measured and had to solve, each with the solution it adopted:

| Cost | What happened | Solution adopted |
|---|---|---|
| **The site reads the siblings' code** | The documentation site needs the code of the other repositories. Reading the tip of each `dev` made the same PR go from green to red with no new commit. | A **SHA lock** (`irmaos.lock`) in the front-door repository, bumped by a bot. [ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) |
| **Translation parity** | The translation measurement summed the documentation of every repository, so a merge elsewhere turned other people's PRs red. | Parity measures **only** the owning repository's documentation. [ADR 0273](../../adr/0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) |
| **Merge order across repositories** | GitHub has no dependency between repositories. One repository's `dev` went red between two merges done in the wrong order, and the order lived only in the memory of whoever promoted. | The PR **declares** which PR it depends on (`Depende-de:`), and a check waits. [ADR 0276](../../adr/0276-a-pr-declara-de-que-pr-depende-o-merge.md) |
| **The promotion order** | Promoting `dev` to `main` also has an order. | The order is **inferred** from the repositories' layers. [ADR 0284](../../adr/0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) |
| **The map goes stale** | The list of repositories was copied by hand in 14 places, in 11 different wordings. | A **single source** (`repos.yml`) generates each README's block. [ADR 0281](../../adr/0281-o-mapa-dos-repos-tem-uma-fonte-so.md) |
| **The CI policy pin** | Each repository pinned a different version of the policy; there were 5 different SHAs across 11 repositories. | The pin points to a **tag**, and a check verifies it. [ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) |
| **Shared contracts** | A new tag of the contracts repository requires a bump in several consumers. | Consumption by **exact tag**, and a script bumps the version in each consumer. See [page 3](como-cada-repo-e-consumido.md). |

Notice the pattern: **every cost became a piece of automation**. Splitting without that automation is the most common path to a set of repositories nobody can maintain.

## When not to split

These signs come from the costs above, not from a Brabo rule. If several apply to you, postpone the split:

- **Nobody needs an independent version.** If everything always ships together, the monorepo already gives you that for free.
- **One person or a small team looks after everything.** The cost of the edges (lock, merge order, pins) is fixed, and the autonomy gain is small.
- **You cannot automate what crosses repositories.** Without checks for merge order, pins and the map, the set rots in silence.
- **The code always changes together.** If almost every change touches three repositories, you built a monorepo that is hard to use.

Brabo split anyway because it wanted artifacts and documentation with owners, and accepted paying with automation. The next page shows the result.

Next: [The map](o-mapa.md).
