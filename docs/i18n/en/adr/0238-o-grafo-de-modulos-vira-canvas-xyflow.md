---
traducao_de: 7bf8a146ef78bd026afbb4d0c878f43485496bff
---

# ADR 0238 — The Architecture module graph becomes a Canvas (`@xyflow/react`)

- **Status:** accepted
- **Date:** 2026-11-02

## Context

AT-683 (owner's decision, 11/02/2026) approved replacing the module card list
of the Architecture tab with a graph. The vault's v5 preview showed the Canvas
working; its ⚠️ items (node title with the whole stack, white zoom controls in
the dark theme) were fixed here.

## Decision

1. New dependency in `apps/web`: `@xyflow/react` (~1.2 MB unpacked).
2. Measured weight: a chunk of its own of ~42 KB gzip. `GrafoDeModulos` loads it
   by dynamic `import()` (`React.lazy`), in the same mold as ADR 0234 and
   AT-300, so none of it enters the initial load.
3. The graph is DERIVED from the current `module_map` (RN-149): nodes = modules,
   edges = `dependsOn` (a nonexistent dependency is ignored). It is never
   retyped.
4. Node title = module name; the stack goes in smaller, truncated text. Colors
   and zoom controls come from `var(--…)` tokens, never from hex, in both
   themes.
5. The module cards remain below the graph.

## Consequences

- One more dependency to follow in `pnpm audit`.
- A project without modules still shows the empty-state text.
