---
traducao_de: 8ab514af259ee767549a90f75e4b67d69e331217
---

# ADR 0249 — The agent's reasoning is recorded and shown only to developer or above

- **Status:** accepted
- **Date:** 2026-11-03
- **References:** ADR [0224](0224-raciocinio-abortado-no-stream.md) (reasoning is COUNTED in the stream, not stored) and [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) (capability only with proof). No ADR is edited.

## Context

AT-676 (EP-031): the thread's "Reasoning" block had no data. The text already arrived in `delta.reasoning` and was discarded. The owner decided on 11/03: record it WHOLE, show it live too, only `developer` or above sees it, and apply it to OpenRouter, Anthropic and `reasoning_content`.

## Decision

1. **Contract.** `ChatStreamChunk` gains `{ type: 'reasoning', text }` and `LLMProviderCapabilities` gains `reasoningText`, `false` on all until there is a smoke (the reading code exists in the providers; the flag only says what was PROVEN).
2. **`stream-llm-turn`** emits the `raciocinio` frame with the delta and the `final` carries the complete `raciocinio`, uncut; `llm-turn` returns the same field. The text never enters `content`.
3. **Anthropic.** It sends `thinking` (`budget_tokens` = the model's budget, at least 1024) and the output ceiling rises by that value. The signed `thinking`/`redacted_thinking` blocks leave in the `tool_calls` chunk (`thinkingBlocks`) and in the `final` (`message.thinkingBlocks`); the engine keeps them between loop turns and returns them in `ChatMessage.thinkingBlocks`, which the provider puts BEFORE the text and the `tool_use`.
4. **Recording.** The engine records `payload.raciocinio` in `agent.response`, with no ceiling. It never goes back to the model (rehydration), to the RAG or to the graph.
5. **Who reads it.** The api removes `payload.raciocinio` from HTTP event reads for those with an effective role below `developer`, through a single output filter; the engine's live channel needs the same role, issued in the socket ticket.

## Consequences

- The reasoning may repeat what the agent read; the role restriction is the containment, in the same mold as `tool.result` (RN-589) with one more step.
- With no ceiling, the event grows (up to the budget per turn, in up to 14 turns). The size is declared in the payload by the engine lane.
- Providers without a smoke stay `reasoningText: false` and degrade without a block.
