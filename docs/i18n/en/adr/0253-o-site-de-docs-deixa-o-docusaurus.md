---
traducao_de: c87b5a0707f3fda92677bd57825eeef69194dbbe
---

# ADR 0253 — The docs site leaves Docusaurus

- **Status:** accepted
- **Date:** 2026-11-04
- **Theme:** `docs`
- **References:** ADRs [0117](0117-lockfile-proprio-para-o-website.md), [0206](0206-referencia-da-api-numa-pagina-redoc.md), [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) and [0220](0220-api-traduzida-por-catalogo.md). None of them is edited.

## Context

The documentation site is Docusaurus 3 reading `docs/` (AT-662, EP-031, owner's decision of 11/02/2026). The framework brings a dependency tree that never reaches any image and has already required an isolated lockfile (0117) and nineteen overrides, the search index weighs about 25 MB per language, and the theme follows Infima, not the product's design system. The mold of a home-made generator already exists in the Smartsky project's `site/` (about 1.3 thousand lines, `markdown-it`, no framework).

## Decision

1. **Home-made generator** in `scripts/docs/site/` (ESM, `markdown-it` and `shiki` in `scripts/package.json`), outputting to `build/docs-site/`, with relative paths and the SAME URLs and `{#id}` anchors as today's site (`x.md` becomes `x.html`, `pasta/index.md` becomes `pasta.html`, `intro` becomes `index.html`, other languages under `/<locale>/`). Each language is assembled with the WHOLE set of pages (translation or pt-BR source at the same address), so a link never leaves the language.
2. **The API reference stays on Redoc 3**, with the spec text translated by the hash catalog of 0220 (which does not change) and **telemetry explicitly turned off**. Redoc 3 removed the `labels` option: the labels of Redoc's INTERFACE (Request samples, Responses…) go back to English in all four languages, a price accepted by the owner. 0206 changes renderer (no redocusaurus) and 0220 keeps the catalog.
3. **The translations go to `docs/i18n/<locale>/`**, ceasing to live in `website/i18n/…/docusaurus-plugin-content-docs/current/` (the parity, `openapi-textos.json` and the guides follow the new path). The path is a constant of the generator.
4. **Substring search**, normalized, without stemming, with an index per language loaded only when the person searches; the API page keeps Redoc's search.
5. **0117 loses its object** where `website/` no longer has Docusaurus; the lockfile isolation only continues for the Redoc tree.
6. **Kept:** the per-step publication of 0073, the four languages and the pt-BR source of 0216, the `noindex` outside `main`, the test-phase notice, "edit this page" and "last updated".

## Consequences

- The ranking of lunr's search, the highlighting of the term on the destination page and `search.html` are lost.
- The migration is in stages: the generator runs alongside (`pnpm docs:site`) until the CI and deploy switch, which is a single PR.
- The CLAUDE.md and the context parts that cite Docusaurus change at the switch, not before.
