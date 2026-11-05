---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0223 — Reasoning budget per model

## Status

**Accepted.** 2026-10-22 (AT-569, EP-026, owner's option C). Theme: `llm`.
Follows [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) and
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)
(capability only asserted when proven; manual curation) and revises, without
editing it, [RN-782](../business-rules/api.md#rn-782) through
[RN-914](../business-rules/api.md#rn-914).

## Context

The PO on `deepseek/deepseek-v4.1-flash` spent 8192 of 8192 tokens on reasoning
alone, three times in a row, and no story was created (TP-01 18th). RN-782
removed the `reasoning` field from all models because on Haiku it was ignored
or turned reasoning on. The paid measurement of 10/22 (16 calls, generation ids
in `~/brabo-gravacoes/raciocinio-smoke-2026-10-22/resultados.jsonl`, checked
against `GET /api/v1/generation`) told the models apart.

## Decision

1. Capability `reasoningBudget` PER MODEL: column `models.reasoning_budget`
   (integer, `NULL` = not proven), curated by hand through the migration, never
   discovered — the sync upsert does not write it.
2. `qwen/qwen3.7-flash` = proven: `reasoning: { max_tokens: N }` was respected
   exactly (1024 requested, 1024 in `native_tokens_reasoning`, in both calls).
   N = **2048**. `buildBody` sends the field only for a model with a budget,
   with `max_tokens` = visible output + N (RN-741).
3. `deepseek/deepseek-v4.1-flash` = `NULL` by measurement:
   `reasoning.max_tokens` (1024 and 256), `reasoning.effort` and
   `reasoning_effort` gave the same 8192 of reasoning, with no text or tool
   call. It stays out by proof, not by omission; its containment remains
   `reasoningOff` (RN-783/838).
4. `effort` is never used: ignored on qwen (1191 against 643 without the field)
   and on deepseek.
5. The qwen caveat: the limit contains the reasoning, but does NOT guarantee
   the tool call — on the hard prompt it kept thinking in the visible text
   (11,551 characters) and exhausted the ceiling without calling the tool.

## Consequences

- A model without a budget: the body is byte for byte what it was before
  (RN-782).
- Marking another model requires its own smoke cited in the PR.
- Pending: the thinking facet of the catalog screen does not show the budget.

## References

- [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md),
  [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md).
- [RN-782](../business-rules/api.md#rn-782), [RN-914](../business-rules/api.md#rn-914).
