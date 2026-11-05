---
traducao_de: 0483395980d396f056e7debe40f10199e7932766
---

# ADR 0251 — Dated list price in code for a provider that does not report a price

- **Status:** accepted
- **Date:** 2026-11-03
- **References:** ADR [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) (manual curation, price frozen in the metering). No ADR is edited.

## Context

Anthropic's `/v1/models` carries no price and does not flag reasoning in Brabo: 13 of 14 synced models arrived with price 0 and `supports_reasoning = false`. Spend was recorded at zero cost without a warning, and AT-676 never turned reasoning on.

## Decision

1. A provider whose API does not report a price reads the LIST price from the manufacturer's single table (`precos-do-fabricante.ts`, RN-965, with source link and date per row), the SAME one as the suggestion screen, and now also used by the sync. `listModels` matches by ID and, if not found, by the ID without a date suffix. An ID outside the table stays without a price.
2. The sync does not change: `manual_pricing` still beats the remote catalog; the list price only enters a non-manual row.
3. `supportsReasoning` comes from the SDK's `capabilities.thinking`, with the family as a fallback.

## Consequences

- The table ages: updating it means editing `precos-do-fabricante.ts` and `conferidoEm`, and a new model's price is curation until then.
- There is a single source: the suggestion screen and the sync do not diverge.
