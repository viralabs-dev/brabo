---
traducao_de: 0cbbd50333145ac8c13420e50db0d94e83d1748f
---

# ADR 0237 — Visual v3 turns on the preflight and raises the radii

- **Status:** accepted
- **Date:** 2026-11-02
- **Revises:** [ADR 0232](0232-shadcn-com-base-ui-no-apps-web.md), only on the
  preflight ("no preflight until the final cleanup"). Fidelity to Brabo's design
  system continues.

## Context

The owner evaluated three visual previews (v1, v2 and v3, in the vault's
`13-design`). On 11/02/2026 they approved v3, the middle ground: Tailwind's
preflight and shadcn's radii, keeping Brabo's terracotta, typography and
surfaces.

## Decision

1. `src/shadcn.css` imports `tailwindcss/preflight` in the `base` layer. Since
   `index.css` is not in a layer, it beats the preflight.
2. `index.css` restores what the preflight zeroes: the size of h1–h6, the weight
   and margin of h4–h6, and the margin of `p`, `ul` and `ol` (with bullets and
   indent on lists), only for the element WITHOUT a `class`.
3. The radii are born from `--radius: 0.625rem` in `design/tokens.css`:
   `--radius-sm/md/lg` = 6/8/10px and `--r-xs/sm` = 6/8px. `--radius-full` and
   `--r-pill` do not change. `--r-sm` and `--radius-sm` remain different steps.

## Consequences

- Screens with a literal radius in a CSS module do not change; those that use a
  token become rounder.
- The contrast floors do not change.
