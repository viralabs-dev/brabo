---
traducao_de: 928410e84dc409647a53517bd5bd6e5fed6663ca
---

# ADR 0242 — Containers in a linear table with `@tanstack/react-table`

## Status

**Accepted.** 2026-11-02 (AT-714; v7 approved by the owner).

## Context

v7 swaps the Containers and Providers cards for a linear table (one row per
item, icon-only actions with `legenda`). Containers needs sorting and
pagination.

## Decision

- Containers uses `@tanstack/react-table` (`^9.3.1`, `legacy` entry) only to
  decide order and page on the CLIENT; no new query. Providers stays in a linear
  table over the existing `Table` component, without the library.
- Justification for the new dependency, measured in `vite build`: the screen is
  a chunk of its own (`ContainersPage` 4.4 kB, 1.7 kB gzip) and the library
  falls into the existing `vendor-tanstack` vendor group (236 kB, 66 kB gzip in
  total, with router and query); the library's isolated delta was not measured.
  `pnpm audit --prod`: no known vulnerability; ~140 kB on disk in
  `node_modules`.

## Consequences

One more dependency to maintain; a future table that only lists does not need
it.
