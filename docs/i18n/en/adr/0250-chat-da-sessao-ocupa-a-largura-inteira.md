---
traducao_de: 2442bf15d7dad2af1a2ecdc0a96816afb1128b87
---

# ADR 0250 — The Session chat takes up the full width

- **Status:** accepted
- **Date:** 2026-11-03
- **Extends:** [ADR 0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) to the Session screen.

## Context

ADR 0248 removed the column from the project tabs and the Account page and left
the Session out. Measured, the thread, the composer and the pending items were
held to 780px even on a wide screen; the owner (11/03) asked for the chat to
take up all the space.

## Decision

1. The thread, the bubbles, the turn strip, the composer, the notices and the
   Session's pending items take up the full width of the chat area, with
   today's side padding.
2. The COMPONENT limits stay (question cards of 560px, labels and chips) and the
   side context panel.

## Consequences

- On wide screens the bubble's text lines stretch.
