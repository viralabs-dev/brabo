---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0221 — The hub pins each agent's conversation to the upstream that served it, by `session_id`

## Status

**Accepted.** 2026-10-21 (AT-580). Theme: `llm`. Extends
[0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) (which only
sent `provider.sort`; its docblock said the other fields of the `provider`
object are a product decision of their own) without editing it, and follows
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) and
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): the
capability only becomes `true` with proof against the real API.

## Context

In the 18th round's TP-01, the same model was served by 17 different upstreams
and the dev agents' cache hit rate dropped. OpenRouter already has the memory
that was needed (*provider sticky routing*): it pins the conversation to the
upstream that served it and only falls to the next one if that one fails, for
10 minutes of inactivity. Without `session_id`, the "conversation" is the hash
of the first `system` message plus the first non-`system` one, and the sticking
only kicks in after a cache hit; each dev task opens with a different first
message, so each one drew a new upstream. With `session_id` in the body (up to
256 characters), the sticking kicks in on the first successful response.

## Decision

1. Brabo sends `session_id` = `brabo:<sessionId>:<agentId>` (without an agent,
   `brabo:<sessionId>`) in calls to OpenRouter, built in
   `StreamLlmTurnUseCase` and `RunLlmTurnUseCase` (`chaveDeSessao`) and carried
   in `ChatOptions.sessionKey`. **Per agent + session**, never per project:
   each agent has its own prefix (instructions + tools) and mixing two in one
   sticky entry gains no cache.
2. New capability `stickySession` in `LLMProviderCapabilities`, mandatory on
   the nine providers, `false` on eight; on OpenRouter it is `true` after the
   smoke `openrouter-provider.sessao.smoke.spec.ts` (6 of 6 calls on the same
   upstream with the key, 4 upstreams in 6 without it). Declaring it without
   the `campoDeSessao` hook fails at construction.
3. **Out**: `provider.order`, `only` and `allow_fallbacks` — `order` turns off
   sticky routing, asks for the slug (and we store the frame's name) and
   choosing the "best" one would require reading `token_usage` per call (the
   ceiling of ADR 0060). It only comes in as an evolution if the post-delivery
   measurement shows the pinned upstream is bad.
4. No table, no engine: the key is derivable from `token_usage`
   (`session_id` + `actor_id`) and the hub keeps the memory. The Jev (ADR 0179)
   does not receive the key.

## Consequences

- `routingPreference` (`sort`) coexists: `sort` picks the first upstream, the
  sticking keeps it.
- The sticking applies to both implicit and explicit cache (RN-892).
- A wait for a gate or approval of more than 10 minutes releases the sticking;
  the next draw is the hub's.
- The DTO of `GET /llm/provider-capabilities` gains `stickySession`.

## References

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — the routing
  preference.
- [RN-907](../business-rules/api.md#rn-907).
