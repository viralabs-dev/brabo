---
traducao_de: 2d508b95c379df9edb51cc94523fd3f05edd83b2
---

# ADR 0260 — The documentation of the code repos is English-only; the site serves the English source with a banner

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `docs`
- **References:** revises ADRs [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) (the pt-BR source applies only to `brabo`), [0219](0219-referencia-entra-na-traducao.md) (the `idioma_original: en` contract becomes the normal path for siblings) and [0220](0220-api-traduzida-por-catalogo.md) (the catalogs move to `brabo`). AT-745, EP-033, owner decision of 2026-11-05: "the only documentation that will have more than one language is the front door for the customer, that is, `brabo`; the other repos, everything in English".

## Context

ADR 0216 made pt-BR the source of ALL documentation, with `en`, `ru` and `zh-Hans` as translations under `docs/i18n/`. After the split into eleven repositories (EP-033), the ten code repos carry that rule without an audience asking for it: their source is 94 to 100% pt-BR, the `i18n/en` copies date from 2026-10-15 and are stale (api missing 47 RNs, engine 22, web 22), and no sibling has a language check. Only `brabo` is the customer's front door and publishes the site.

The contract that makes this possible already existed: `idioma_original: en` in the frontmatter (AT-564, ADR 0219), read by `faixa-de-traducao-check.mjs` but not by `paginas.mjs`.

## Decision

1. **The documentation of the 10 code repos is English-only.** `docs/`, `README`, `CHANGELOG` and community files. New docs and new RNs are written in English with no `docs/i18n/`. Their `CLAUDE.md` and `.claude/` stay in pt-BR (owner decision). Code comments and commit messages are not changed by this ADR.
2. **`brabo` stays multilingual** (pt-BR source, `en`, `ru`, `zh-Hans`, ADR 0216), including the `ci` area documentation that lives in `scripts/ci/docs/`.
3. **A sibling page in English carries `idioma_original: en`.** On `/en/` the site serves the source itself, with no banner. On pt-BR, `ru` and `zh-Hans` it serves the SAME English source, with the new banner "this page only exists in English". If a sibling still has the translation of a locale, that translation applies in that locale: the mechanism accepts a mixed state, page by page.
4. **What comes with the mechanism:**
   - each locale's RN index uses the translation when its file exists and the source when it does not, so the siblings' RNs are not lost;
   - the generated block in a source with `idioma_original: en` is emitted with English texts;
   - `paridade-de-traducao` does not count a page with `idioma_original: en` as translatable (AT-735 is left with no object);
   - the sentences in sibling prose that `docs:check` anchors to the code (`contagens-do-codigo.mjs`, the runbook) accept the text in pt-BR OR in English, so the conversion does not leave the check blind.
5. **The API reference stays translated.** The owner kept the Redoc page in all four languages; the `openapi-textos.json` catalogs leave `brabo-api` and live in `brabo`, under `docs/i18n/<locale>/`.

## Consequences

- Each sibling converts its documentation to English in its own lane, promoting `i18n/en` to source RN by RN and deleting `docs/i18n/`; the siblings' `ru` and `zh-Hans` are deleted (git keeps them).
- Until a sibling converts, the site shows the pt-BR source with the usual banner. After it converts, a Russian or Chinese reader sees the English with the new banner.
- `RNS_SEM_TRADUCAO` in `links.mjs` stays: the index falls back to the source per FILE, not per RN, so an RN missing from a partial translation still breaks the anchor in that locale until the sibling's lane deletes `i18n/`.
- **Guard implemented (Round 201):** `scripts/docs/idioma-dos-irmaos.mjs`, called by `docs:check`, fails a `.md` page in a sibling doc root without `idioma_original: en`, and any `i18n/` in a sibling doc root, naming the file and this ADR. The `brabo` roots (`docs/`, `scripts/ci/docs/`) stay multilingual. A pt-BR counter (function words and `ção`/`ções` outside code, quotes, URLs and links) warns, without failing, when a page that already declares `en` still has Portuguese prose; on the current docs it reports zero lines.

### English sentences the translation lanes copy

The sentences below are the ones the new patterns recognize. The number is spelled out, in lowercase (the comparison ignores case).

| file (repo) | sentence in pt-BR | sentence in English |
|---|---|---|
| `deploy/docs/runbook.md` (infra) | `as cinco imagens que o produto publica já estão resolvidas` | `the five images the product publishes are already resolved` |
| `apps/api/docs/reference/git-providers.md` (api) | `O contrato tem **quinze operações** —` | `The contract has **fifteen operations** —` |
| `apps/api/docs/reference/git-providers.md` (api) | `implementar todas as quinze operações, declarando` | `implement all fifteen operations, declaring` |
| `apps/api/docs/reference/artifacts.md` (api), no frontmatter | `description: Os doze schemas de artefato` | `description: The twelve artifact schemas` |
| RN (infra) | `- as **cinco imagens** são assinadas **por DIGEST**` | `- the **five images** are signed **by DIGEST**` |
| RN (infra) | `- as cinco imagens vêm de **variável obrigatória**` | `- the five images come from a **required variable**` |

The pattern for `.claude/rules/broker-e-containers.md` (infra) stays pt-BR only, because `.claude/` stays in pt-BR.

## Alternatives considered

- **Serve the sibling in English WITHOUT a banner in the other locales.** Rejected: a reader in Russian needs to know the page is not in their language.
- **Hide the English-only pages from `ru` and `zh-Hans`.** Rejected: links between pages would break and search would lose the technical reference.
- **Keep the siblings' three translations.** Rejected by the owner: three copies per change, with no reader, and already stale.

## References

- [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md), [0219](0219-referencia-entra-na-traducao.md), [0220](0220-api-traduzida-por-catalogo.md).
