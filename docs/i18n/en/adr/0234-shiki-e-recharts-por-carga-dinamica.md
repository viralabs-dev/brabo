---
traducao_de: 09eb04ce992b84f7116ad74aacaf73d44800624b
---

# ADR 0234 — `shiki` in the Code Block and `recharts` in the Chart, always by dynamic loading

- **Status:** accepted
- **Date:** 2026-11-01
- **Revises:** the "no dependency" justification of the regex code highlighting
  (`MarkdownMessage`, Code tab) and of the home-made SVG chart
  (`SpendCharts.tsx`); [ADR 0232](0232-shadcn-com-base-ui-no-apps-web.md) still
  holds in full
- **Prior context:** [ADR 0068](0068-diagrama-c4-do-arquiteto.md) and
  [ADR 0103](0103-runner-local-execucao-na-maquina-do-usuario.md) (the mold for
  a heavy dependency behind `import()`),
  [ADR 0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) and
  [ADR 0181](0181-tema-preto-neutro.md) (two themes, contrast as a floor)

## Context

Adopting shadcn/AI Elements (AT-636) has four extras that the owner released on
10/31 (decision 4): ⌘K, `shiki` in the Code Block, `recharts` in the Spend
Chart and `@shadcn/react` in the Questionnaire. ⌘K shipped with no new
dependency (the `Autocomplete` of `@base-ui/react`, already installed, instead
of `cmdk`, which would bring Radix) and `@shadcn/react` already came in with
AT-653. Two dependencies of measured weight remain from the 11/01 survey
(esbuild + gzip): `shiki@4.5.0` (core ~55 KB gz, 0.1 to 16 KB per language; 44
transitive packages; MIT) and `recharts@3.8.0` (~105 KB gz; 37 transitive ones
with a permissive license). `pnpm audit --prod`: zero vulnerabilities in both.

## Decision

1. Both enter `apps/web` with an EXACT version and NEVER in the initial JS nor
   in `codeSplitting.groups` (allow-list): only by `import()`/`React.lazy`, in
   the chunk of whoever uses them.
2. `shiki` lives behind `lib/realce-shiki.ts`: `shiki/core` with the JS regex
   engine (no WASM), language on demand, its own theme with `var(--syntax-*)`
   (no hex, in both themes). Today's regex highlighting stays as the fallback:
   while `shiki` loads and for a language it does not know.
3. `recharts` lives behind `GraficoDeGastoPorDia.tsx` (lazy), only in the daily
   spend series, with today's SVG as the fallback and the alternative table
   alongside. It cannot be imported by `SpendCharts.tsx`, which the Sessions tab
   also imports.
4. Chart and highlight colors come from tokens (`var(--accent)`,
   `var(--syntax-*)`); a color that must leave the CSS goes through
   `lib/tokens-padrao.ts`.

## Consequences

- The initial JS does not change; whoever opens neither the Spend screen nor a
  code block downloads nothing new. Each PR that touches these screens measures
  the chunk before and after.
- Two dependencies to maintain, with `overrides` if a transitive advisory shows
  up (the discipline of `pnpm-workspace.yaml`).
- If either leaves, the fallback (regex, SVG) is already in the code.
