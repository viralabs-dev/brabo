---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0225 — OpenRouter gets a price ceiling per call (`provider.max_price` = catalog × 1.5)

## Status

**Accepted.** 2026-10-28 (AT-606, EP-026, owner's decisions of 10/27). Theme:
`llm`. Extends [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md)
(which only sent `provider.sort` and left `max_price` as a product decision of
its own) and coexists with [0221](0221-upstream-preso-por-sessao.md)
(`session_id`), without editing either. Follows
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md): the
capability only becomes `true` with proof against the real API.

## Context

In the TP-01 18th round, `deepseek/deepseek-v4.1-flash` went through 17
upstreams and the real cost was 1.85× the catalog's; the cost per million input
tokens varied from US$ 0.044 to 0.268. The `session_id` of 0221 pins the agent
to the upstream that served it, but may pin it to an EXPENSIVE upstream
(Together, where the AT-580 smoke stuck, costs 2.1× the catalog's input and
2.9× its output). OpenRouter's `provider.max_price` is a FILTER by price (US$
per million, input and output) that combines with `sort`, which is an ORDER.

## Decision

1. Brabo sends `provider.max_price = { prompt, completion }` = **the model's
   catalog price × 1.5**, per call, in calls to OpenRouter
   (`StreamLlmTurnUseCase`, `RunLlmTurnUseCase`, `SendChatMessageUseCase`). The
   factor (`FATOR_DO_TETO_DE_PRECO`) is **fixed in code** and **on by default**
   for every model with a catalog price > 0 at both ends; price 0 (unknown)
   sends no ceiling. With 1.5, about 11 of deepseek's 41 endpoints pass, and
   Together and those at US$ 0.30+ are left out. Changing the factor is a new
   ADR.
2. New capability `priceCeiling` in `LLMProviderCapabilities`, `false` on the
   nine other providers and `true` on OpenRouter after the smoke
   `openrouter-provider.teto.smoke.spec.ts`. Declaring it without the
   `campoDeTetoDePreco` hook fails at construction. The ceiling's `provider`
   object is MERGED with the one for `sort` (spreading them side by side would
   erase `sort`).
3. **404 for no upstream within the ceiling**: the 404 of a call that carried a
   ceiling becomes the NAMED error `LLMPriceCeilingError` (`code:
   price_ceiling`), distinct from `LLMModelNotFoundError`. The three use cases
   **retry ONCE without the ceiling** (in the same loop as RN-916), record
   `token_usage.price_ceiling_factor` as null on that row and warn in the log;
   the turn does not fail over a cost policy.
4. **Metering:** `token_usage.price_ceiling_factor` (`real`, nullable) freezes
   the factor that WENT ON THE WIRE, following the mold of `routing_preference`
   (RN-583). `null` = nothing sent.
5. **Out**: quantization filter (quality per upstream was not measured and it
   would be a second criterion), `provider.only`/`ignore` (a list curated per
   model goes stale on its own and requires a name→slug map) and `order` (turns
   off sticky). The Jev (ADR 0179) does not receive the ceiling.

## Consequences

- `sort` chooses the order among the cheap ones; `session_id` keeps the
  upstream; the ceiling takes the expensive ones out of the draw when the
  sticking drops.
- A stale or manual catalog price (`manual_pricing`) gives a wrong ceiling;
  with no upstream within the ceiling, the retry without it measures the excess
  (row with a null factor).
- The DTO of `GET /llm/provider-capabilities` gains `priceCeiling`.

## References

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — the routing
  preference.
- [0221](0221-upstream-preso-por-sessao.md) — the `session_id`.
- [RN-917](../business-rules/api.md#rn-917).
