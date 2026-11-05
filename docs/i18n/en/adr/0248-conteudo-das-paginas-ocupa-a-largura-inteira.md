---
traducao_de: ec2aca21cc4e40b01f8d1937285bb674e491e6c8
---

# ADR 0248 — Page content takes up the full width

- **Status:** accepted
- **Date:** 2026-11-03
- **Revises:** [ADR 0244](0244-coluna-das-abas-do-projeto-alinhada-a-esquerda.md), on the point of the maximum reading width.

## Context

Measured in Chrome (1848x981), each tab's content ended near the middle of the
screen: `max-width: 1040px` on the `ProjectPage` `.coluna` and 720px on the
Account page. The owner (11/03) read this as a poorly laid-out page, "not
reaching the end".

## Decision

1. The content of the project tabs and the Account page takes up the full width
   to the right of the sidebar, with today's side padding. The Account page's
   `.coluna` and `.page` have no `max-width`.
2. The COMPONENT limits stay: long-text paragraph (`62ch`), question cards
   (560px), modals and form fields.
3. The Code tab and the Session screen do not change.

## Consequences

- On wide screens table rows and cards stretch; reading of long text remains
  protected by the paragraph's `ch`.
