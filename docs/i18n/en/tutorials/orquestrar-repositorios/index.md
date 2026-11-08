---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: Orchestrating a product across many repositories
description: A seven-page path for anyone who is about to split, or has already split, a product into several repositories. It uses Brabo's 11 repositories as a real example, with the map, the consumption modes, the life of a change and a checklist to build your own.
---

# Orchestrating a product across many repositories

**Who it is for:** anyone who is about to split a product into several repositories, or already has and feels the cost, and **does not know Brabo's history**. You do not need to have read any ADR or taken part in any round of work: ADRs appear only as "learn more".

**After reading, you can:**
- decide whether your product should really be split, and when it should not;
- draw the repository map with the **consumption mode** of each edge;
- narrate the path of a change, from the first PR to the installer;
- build a similar set, in the right order, knowing what to copy and what to adapt.

**Reading time:** about 40 minutes for the whole path; each page takes 5 to 8.

## The example we use

Brabo is a platform that orchestrates engineering agents. It lives in **11 public repositories** in the [`viralabs-dev`](https://github.com/viralabs-dev) organization. None of them is "the" product: the product is the set, and one repository, [`brabo`](https://github.com/viralabs-dev/brabo), is the front door. The old single repository is for reference only and is outside this path.

## The order of the pages

| # | Page | Question it answers |
|---|---|---|
| 1 | [Why split, and when not to](por-que-separar.md) | Is it worth splitting? What does it cost? |
| 2 | [The map](o-mapa.md) | Who does what, and who depends on whom? |
| 3 | [How each repository is consumed](como-cada-repo-e-consumido.md) | Through what does one repository deliver something to another? |
| 4 | [The life of a change](vida-de-uma-mudanca.md) | How does a line of code become a release? |
| 5 | [Build your own](monte-o-seu.md) | In what order do I replicate this? |
| 6 | [Mistakes we already made](erros-que-ja-cometemos.md) | What can I avoid? |

## How to read

- Deciding whether to split: read 1 and 6.
- Already split and want to organize: read 2, 3 and 4.
- Want to get hands-on: go straight to 5, which points to the others when needed.

Each page says, at the start, who it is for and what you can do after it. Where the path has no evidence to state something, it writes `TODO(humano)` instead of inventing.

## The repositories, with each one's README

[`brabo`](https://github.com/viralabs-dev/brabo#readme), [`brabo-api`](https://github.com/viralabs-dev/brabo-api#readme), [`brabo-engine`](https://github.com/viralabs-dev/brabo-engine#readme), [`brabo-web`](https://github.com/viralabs-dev/brabo-web#readme), [`brabo-runner`](https://github.com/viralabs-dev/brabo-runner#readme), [`brabo-broker`](https://github.com/viralabs-dev/brabo-broker#readme), [`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme), [`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme), [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme), [`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme) and [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme).
