---
traducao_de: ef03b3bddfbc5314b59e4ccc957c774fc5d9f8db
---

# ADR 0257 — On direct Anthropic, switched-off reasoning is per model and the effort reduces Opus

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `llm`
- **References:** ADR [0223](0223-orcamento-de-raciocinio-por-modelo.md) (revises item 4, "`effort` is never used", only for the `anthropic` provider; 0223 is not edited), ADR [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md), RN-741, RN-782, RN-783 and RN-916, and RN-1000, which replaces them for this provider (AT-739, EP-030, owner's decisions of 11/05/2026).

## Context

In TP-01 of 11/05, 10 of 10 dev-agent tasks on Haiku 5.5 blocked with "reasoning-only response". The Anthropic adapter omitted `thinking` when reasoning was switched off (RN-783), because "`disabled` is a 400 on the 5.5s". On adaptive-thinking models, however, omitting it is the adaptive mode at the default effort. And the 400 holds for Sonnet and Opus 5.5, not for Haiku 5.5. With adaptive on, `max_tokens` was 4096 TOTAL and cut off the Infra. `reasoning_tokens` came out NULL.

## Decision

1. With reasoning switched off, the body is per model:
   - Haiku 5.5: `thinking: disabled`;
   - Sonnet 5.5: `thinking: between_tools`;
   - Opus 5.5: `output_config.effort: low`, declared as REDUCED, not switched off;
   - unknown adaptive model: the model's default, until there is proof.
2. For this provider, `effort` is now used, and only on Opus 5.5 switched off. The agents that reason stay at the model's default effort.
3. Adaptive on and the cases that still think: `max_tokens` = visible output + (`reasoningBudget` ?? 4096), the headroom of RN-741.
4. The provider declares `aceitaRaciocinioDesligado` (RN-916).
5. `reasoning_tokens` = `thinking_tokens` of the last `message_delta`, only when it is an integer ≥ 0; otherwise it is omitted and NULL (RN-666).

## Consequences

- Proof: paid smoke test of 11/05, about US$ 0.009 (PR #12 of `brabo-api`):
  - Haiku, Sonnet and Opus 5.5 accepted with a tool;
  - `disabled` on Opus 5.5 gave a 400;
  - swapping the `system` with the reasoning block resent was accepted.
- On Opus 5.5, the retry without reasoning of RN-916 only REDUCES the reasoning.
- A new Anthropic model enters the per-model table only with its own smoke test cited in the PR.

## References

- [0223](0223-orcamento-de-raciocinio-por-modelo.md), [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md).
- Official docs: <https://platform.claude.com/docs/en/build-with-claude/effort> and <https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost>.
