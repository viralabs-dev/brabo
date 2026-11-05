---
traducao_de: 2fc4f085eec24047951a35401481ec08fd740a4c
---

# ADR 0254 — Each area's doc lives at its root

- **Status:** accepted
- **Date:** 2026-11-04
- **Theme:** `docs`
- **References:** ADRs [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md), [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) and [0253](0253-o-site-de-docs-deixa-o-docusaurus.md). None of them is edited.

## Context

0252 splits Brabo into repositories by area, and 0253 gave the site a generator of its own. With all the doc in `docs/`, each new repository would be born without the documentation of its own code, and the business rules (RN) live in three large files that mix areas (owner's decision of 11/02/2026, AT-688 question 11, confirmed on 11/04, AT-693).

## Decision

1. **Each area's doc lives in `<root>/docs/`.** The list of roots is in `scripts/docs/raizes-de-doc.mjs`; `docs/` remains the aggregator (the "product").
2. **The site is the UNION TREE** of the roots: each file keeps the SAME relative path it had in `docs/` (`reference/permissions.md` becomes `apps/api/docs/reference/permissions.md`), the public URL does not change and the links between pages are written in UNION coordinates, not disk ones. A slug repeated across roots fails.
3. **RN per area.** Each RN lives in `<root>/docs/business-rules/<root>.md`, in the root that hosts the FIRST `path:N` ref in the body (with no ref, the first cited path; with none, the product). The numbering is GLOBAL and unique (the next is the maximum summing all roots) and the `{#rn-NNN}` anchor does not change.
4. **`docs/business-rules.md` becomes a GENERATED INDEX** (one line per RN linking to the host page, so `business-rules.html#rn-NNN` keeps resolving). `custo.md` and `autenticacao.md` become FROZEN stubs, written once. There is a new check: the same RN number in two files fails.
5. **Sources and checks.** `scripts/docs/fontes.yml` (or the file pointed to by `BRABO_FONTES`) maps logical name to root. The checks gain `--raiz <name>`: they run PER root what depends only on it (RN anchors, internal `path:N` refs, docmap glob, drift) and ONLY on the aggregator what crosses roots (counts, RN uniqueness and index, external refs, parity, links between locales, runbook procedures). In the monorepo `pnpm docs:check` runs everything.
6. **Translations** in `<root>/docs/i18n/<locale>/<same-path>`; `traducao.json` remains ONE, in the aggregator. The change that moves files leaves all translations "stale" by construction, so it goes in TWO commits: the change itself and a second one that re-stamps `traducao_de` with the SHA of the first, only on those that were up to date.
7. **The RAG golden-set corpus stays FROZEN** (ADR 0132): moving the doc cannot rewrite the baseline.

## Consequences

- Each future repository takes its own doc and its own RNs; the site remains one and no URL changes.
- **Price:** a link between roots works on the site and gives 404 in GitHub's view (the link path is the union's, not the disk's).
- Whoever writes an RN needs to know the area that owns the code; `docs:check` points out a duplicate RN, a missing anchor and a ref that does not match.
- The migration of the files and of the ~13 thousand links between pages is a one-off, idempotent script, in the same PR right after this ADR.
