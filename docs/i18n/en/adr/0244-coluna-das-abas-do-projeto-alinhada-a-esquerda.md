---
traducao_de: 4eec59c50143afbc7650e5d4d564efd4167f88d1
---

# ADR 0244 — Project tabs column aligned to the left

- **Status:** accepted
- **Date:** 2026-11-03
- **Revises:** [ADR 0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) on the point of the content column centered at 1040px.

## Context

The project tabs drew the content in a centered 1040px column (`margin: 0
auto`), while the header stayed on the left. The owner (AT-720, 11/03) asked for
the content aligned with the header.

## Decision

1. `.body` in `ProjectPage.module.css` keeps `max-width: 1040px` (reading width)
   and loses the centering: the column starts on the left.
2. The Code tab and the `semRespiro` tabs do not use the column (ADR 0211/0241)
   and do not change.

## Consequences

- On wide screens, space is left over on the right, on purpose.
