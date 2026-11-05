---
traducao_de: c3b4a27053c341eae6d6d88ff06651d79e7dccec
---

# ADR 0243 — An irreversible consequence can live in a danger button

- **Status:** accepted
- **Date:** 2026-11-03
- **Revises:** the "?" rule in `design/COMPONENTS.md` ("the irreversible consequence is always visible"), only for the execution-mode conversion warning, and extends the mold of [ADR 0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md).

## Context

The `execution_mode` conversion warning (RN-560, AT-144) says what the
conversion leaves behind, what is lost, what is refused and what is carried
over. It was a multi-line `Alert` always on the screen. The owner (AT-719,
11/02) asked for a short section and the warning in a caption button with a
danger icon. What the rule protects is the consequence being ANNOUNCED before
the click on Convert, not that the text takes up the section.

## Decision

1. `components/ui/Perigo.tsx` is created, a sibling of `Ajuda`: the same Popover
   with `openOnHover` (opens on click, by keyboard and on hover; closes with
   Esc), with the `TriangleAlert` icon (`aria-hidden`) in the color of the
   `--danger` token. The accessible name is "Warning: {subject}"
   (`ui:perigo.rotulo`).
2. The button sits next to the mode selector, under the SAME conditions in which
   the warning appeared, and the popover carries the whole warning, without
   changing content or condition (RN-560, AT-144, AT-372). The risk is announced
   by the always-visible icon; the text stays in the popover.
3. The exception applies ONLY to the mode-conversion warning. Another use of
   `Perigo` requires another ADR.

## Consequences

- `design/COMPONENTS.md` records `Perigo` and the limit of the exception.
- The "?" rule still holds everywhere else: an irreversible consequence and an
  absolute ceiling stay in visible text.
