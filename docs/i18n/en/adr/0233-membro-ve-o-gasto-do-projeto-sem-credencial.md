---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0233 — The member sees the project's spend by agent and by area, never by provider

- **Status:** accepted
- **Date:** 2026-10-31
- **Revises:** [ADR 0063](0063-duas-audiencias-para-o-mesmo-gasto.md) (the two
  audiences for the same spend), on the point where the member only saw their
  OWN consumption; [ADR 0076](0076-provider-volta-a-ser-dimensao-de-gasto.md)
  still holds in full (provider is the owner's axis and out of reach by type)
- **Prior context:** [RN-058](../business-rules/api.md#rn-058),
  [RN-060](../business-rules/api.md#rn-060),
  [RN-101](../business-rules/api.md#rn-101),
  [RN-187](../business-rules/api.md#rn-187)

## Context

The owner's request (AT-632, 10/31) splits the spend page into GLOBAL and PER
PROJECT. ADR 0063 left the member with only `spend/me` (their own consumption
as an actor), although the cost per agent already shows for `developer` in
Settings > Models. The owner's decision was: the member sees the project's
TOTAL and the cost per agent/area, with no provider or credential.

## Decision

1. `GET /projects/:projectId/spend/team` (`viewer`): the project's total and
   cost per agent and per catalog area. The scope is the project's, with no
   actor, but the use case only asks for the `actor` dimension; there is no
   dimension parameter on the route. Provider and credential remain exclusive
   to the owner (RN-060, RN-186).
2. `GET /workspaces/:workspaceId/spend/me` (`viewer`): the member's OWN
   consumption summed per project, for the non-owner on the global page. Actor
   scope, so `provider` does not even compile (RN-187).
3. The owner's report gains `?projectId=` (404 for a project of another
   workspace) and the `session` dimension.
4. The curated mark `billing` (`api|subscription|free`) on `models` separates
   `assinaturaMicros` from the paid US$.

## Consequences

- The member now sees how much the team (agents) spent on the project. This is
  a fact about the project, not about the key's bill; the bill remains the
  owner's.
- What the member does NOT gain: provider, credential, another person's
  consumption.
- The refusal in `CriativoKpis` (web) stops being a rule; the screen belongs to
  the web lane.
