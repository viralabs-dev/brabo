---
traducao_de: 4f3cd30505856032119bb19b557c45cae26f732d
---

# ADR 0241 — The sidebar adopts shadcn's `sidebar-07` block

## Status

**Accepted.** 2026-11-02 (AT-714; v7 approved by the owner). Revises
[ADR 0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) — which remains
accepted and is not edited — only in the widths and in the collapse mechanism.

## Context

ADR 0211 made the sidebar the project's only navigation, with 264px open and 62
collapsed (Code tab: 312px of frame, or 110 collapsed). v7 (linear design and
shadcn blocks) was approved and the sidebar becomes the `sidebar-07` block.

## Decision

- Widths: **256** open and **48** collapsed (previously 264/62).
- Code tab: **304px** of frame (256 + the 48 of the `CodeShell` rail), or **96**
  with the sidebar collapsed (48 + 48). Sum of widths, not measured in the
  browser.
- The collapse state that already existed (remembered preference) and the
  Ctrl/Cmd+B shortcut are kept, now from the kit.
- The kit writes the `sidebar_state` cookie; it is stored **with no reader** (the
  source of the state remains that of `lib/sidebar-state`).
- Owner's decision (11/03, revises that of 11/02): "Settings" is ONE sidebar
  item, like the other tabs — the sidebar gains no sub-items and does not grow.
  The groups — Models, Project, People and Advanced — are TABS inside the page,
  in a strip at the top, and each lives at `?tab=settings&group=<group>`. The
  implementation belongs to AT-719.
- Owner's decision (11/03): the footer becomes `sidebar-07`'s user menu (trigger
  = card with avatar, email and role; items Account, Theme and Sign out;
  collapsed, only the avatar and the menu opens to the side). "Collapse menu",
  Containers, Providers and Spend remain footer links. The project tabs get
  bigger (body text, 32px, 16px icons) with a divider between groups.
- Lucide icons. What ADR 0211 decided about content (groups, active tab,
  keyboard, counters never summed) remains in force.

## Consequences

A dependency on the shadcn kit already present in the web; the cookie with no
reader is a declared gap, not an accident.
