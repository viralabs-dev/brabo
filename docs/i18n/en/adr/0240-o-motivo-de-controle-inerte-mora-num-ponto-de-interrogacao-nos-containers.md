---
traducao_de: 045e2ae23938805c9357f91cb7c35e192c852d61
---

# ADR 0240 — The reason for an inert control can live in an active "?" on the Containers page

- **Status:** accepted
- **Date:** 2026-11-02
- **Revises:** [ADR 0064](0064-escopo-de-area-na-cascata-e-o-binding-de-agente-global.md), only on the rule "the reason for an inert control is stated in visible TEXT", and only for the Containers page.

## Context

ADR 0064 says to state the reason for an inert control in text, because `title`
and tooltip on a `disabled` element do not open. On the Containers page each row
stacked up to four sentences ("Never provisioned…", "No image decided…", the
broker…) below three icon buttons, and the owner (preview v6, 11/02) preferred a
clean row. What ADR 0064 protects is the reason staying ACCESSIBLE, not that it
takes up the cell.

## Decision

1. In `AcoesDoContainer.tsx` the per-row inertia reasons go into ONE `Ajuda`
   ("?"), with the subject "Why the actions are unavailable", next to the
   buttons. The "?" is an ACTIVE button (not `disabled`): it opens on click, by
   keyboard and on hover, and so the reason remains reachable with the buttons
   disabled. Without a reason, there is no "?".
2. The ROLE reason is still stated once, in text, at the top of the page.
3. The exception applies ONLY to Containers. On any other screen the reason for
   an inert control stays in visible text (for example, the "I'm ready"
   suggestion in the composer).

## Consequences

- `design/COMPONENTS.md`, "Ajuda" section, records the exception and its limit.
- Extending it to another page requires a new ADR, not a rereading of this one.
