---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0224 — Reasoning is counted in the stream and aborted at the limit, and the cost is estimated and reconciled

## Status

**Accepted.** 2026-10-22 (AT-589, EP-026, owner's decisions). Theme: `llm`.
Complements, without editing it, [0223](0223-orcamento-de-raciocinio-por-modelo.md)
and uses the `price_implicit` column of
[0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md).

## Context

[0223](0223-orcamento-de-raciocinio-por-modelo.md) only limits models that
respect the `reasoning.max_tokens` field. `deepseek/deepseek-v4.1-flash`
ignores every limit field (8192 of reasoning in 8192), and AT-589 was born for
it: aborting the connection in the stream is the only way to limit it. Paid
measurement of 10/22 (OpenRouter): every reasoning chunk carries
`delta.reasoning` (text); `characters/4` approximates the tokens (3.9 on
deepseek, 3.8 on qwen); aborting charges only what was already generated (~521
of 529 tokens). But the aborted response carries NO `usage` or `finish_reason`,
and the real cost only shows up in `GET /api/v1/generation?id=` about 5 minutes
later (before that, 404).

## Decision

1. The OpenAI-compatible provider counts `delta.reasoning` (characters/4) when
   the model has `reasoning_budget`, and on going over the limit it aborts the
   connection and emits the `truncated` chunk with `motivo: "raciocinio"` (the
   truncation by `max_tokens` has no reason). A model without a budget neither
   counts nor aborts.
2. Spend of the aborted call = ESTIMATE ON THE SPOT: output tokens =
   characters/4 (of reasoning and text), input by the estimator (or
   characters/4 if there is none), at the catalog price, with `price_implicit`
   and the new `token_usage.custo_a_reconciliar`.
3. RECONCILIATION: `ReconciliarCustoEstimadoUseCase` runs by `setInterval` in
   the api's own process (the same mechanism as the projectors; no new queue,
   no Redis), every `CUSTO_RECONCILIACAO_INTERVAL_MS` (5 min; `0` turns it
   off). It only looks at marked rows from the last 24 h, and swaps in the
   `total_cost` from `/generation` only on a 200; the swapped row keeps the
   estimate in `catalog_cost_micros`. Any other response leaves the row for the
   next pass; after 24 h the estimate becomes final.
4. Migration 0075 creates the column and sets `reasoning_budget` 2048 on
   `deepseek/deepseek-v4.1-flash` (openrouter), following the mold of 0074.

## Consequences

- The provider contract gains `truncated.motivo` and
  `usage.abortadoPeloRaciocinio` (additive); the metering gains the column.
- Declared limits: the `spentMicros` of budget and area is NOT corrected by the
  reconciliation (the estimate already incremented it; the difference is cents);
  the key used is the workspace owner's; several api instances reconcile in
  parallel without harm (the swap only acts on a row that is still marked);
  partial tool calls from the aborted stream are discarded.

## References

- [0223](0223-orcamento-de-raciocinio-por-modelo.md), [0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md).
- [RN-915](../business-rules/api.md#rn-915), [RN-914](../business-rules/api.md#rn-914).
