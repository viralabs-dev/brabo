---
traducao_de: cba75d8600bf8985f8a3c8bb3ad62e8bfdac7571
---

# ADR 0232 — shadcn/ui with Base UI and Tailwind 4 in `apps/web`

## Status

**Accepted.** 2026-10-31 (AT-645, wave 1 of AT-636; owner's decisions on 10/31).
It does not edit ADRs 0074 (theme in both modes) or 0181 (neutral palette): it
uses their tokens as the source. Number 0231 is reserved for AT-626.

## Context

The chat and the AI interface move to the AI Elements patterns, which shadcn
absorbed. `apps/web` is CSS Modules over `design/tokens.css`, with no Tailwind
and no `@/` alias. The theme is written to `[data-theme]` by
`public/theme-boot.js`; shadcn expects `.dark`. There are name collisions
between Brabo's tokens and shadcn's raw variables (`--accent`, `--radius-*`,
`--font-mono`).

## Decision

- **Base:** shadcn/ui, `base-nova` style, over **Base UI** (`@base-ui/react`),
  not Radix. Tailwind 4 via `@tailwindcss/vite`.
- **Theme:** the neutral palette with terracotta and the Space Grotesk, Archivo
  and IBM Plex Mono fonts stay. shadcn is themed by Brabo's tokens, never the
  other way around.
- **Coexistence:** the `*.module.css` stay until the final cleanup. The
  **Tailwind preflight only comes in at the end**; until then `src/shadcn.css`
  imports only `tailwindcss/theme` and `utilities`, in layers (they lose to
  unlayered CSS), with `source(none)` and `@source` only on `components/shadcn/`
  so as not to emit loose utilities (`.absolute`, `.container`) from the rest of
  `src`.
- **Colors:** `@theme { --color-*: initial }` and `@theme inline` mapping the
  semantic colors to the tokens (`primary`→`--accent`,
  `accent`→`--surface-2`...). The project does NOT declare shadcn's raw
  variables. `--radius-*` and `--font-mono` already belong to Brabo and the
  unlayered `:root` beats Tailwind's default.
- **Dark:** `@custom-variant dark` over `[data-theme='dark']`.
- **Alias** `@/` → `apps/web/src` (vite and tsconfig); existing code is not
  rewritten. `components.json`: `aliases.ui` = `@/components/shadcn` (not
  `components/ui`, which belongs to the house primitives), `utils` =
  `@/lib/utils` (`cn`).
- **Dependencies**, each with its reason:
  - `tailwindcss` and `@tailwindcss/vite`: the engine of shadcn's utilities;
  - `@base-ui/react`: the unstyled primitives under the components;
  - `class-variance-authority`: variants of the copied components;
  - `clsx` and `tailwind-merge`: `cn`, which resolves class conflicts;
  - `lucide-react`: icons of shadcn's `iconLibrary` (not yet used).
- **Bundle:** `vendor-ui` group in the allow-list of `codeSplitting.groups`
  (Base UI, cva, clsx, tailwind-merge, lucide).
- **Minimal proof:** `components/shadcn/button.tsx` (`base-nova` registry, with
  the `cn` import swapped and the `var(--secondary)`/`var(--foreground)`
  references swapped for Brabo tokens), unused on any screen, with a test.

## Consequences

- No screen changes. The global CSS grows by the theme layer and the Button's
  utilities; the initial chunk's JS does not change (Button has no importer).
- A new shadcn component is born in `components/shadcn/`; the CLI tries to run
  `pnpm add` and may fail without `pnpm` on the PATH, and then the file comes
  from the registry and is adjusted by hand.
- Out of this wave: house adapters, ai-elements patterns, screens, preflight
  and the removal of the `module.css` files.
