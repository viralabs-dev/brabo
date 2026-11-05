---
traducao_de: e7f079cf5c07cda04fd640b5b0ee1bc41aeb181c
---

# ADR 0227 — OpenCode Zen comes in as the 11th LLM provider, in the OpenAI dialect only

## Status

**Accepted.** 2026-10-29 (AT-568, EP-026). Theme: `llm`. Extends
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) and
[0222](0222-provider-9router-de-llm.md) (the provider list, which goes from ten
to eleven) without editing them, and follows
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) and
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): the
capability only becomes `true` with proof against the real API, and the catalog
is curation.

## Context

OpenCode Zen is a model gateway with a tier of `-free` models. The public docs
show three dialects: `/chat/completions` (OpenAI, at
`https://opencode.ai/inference/openai/v1`), `/responses` and `/v1/messages`
(Anthropic), plus Google. The `OpenAICompatibleProvider` base only speaks
`/chat/completions`, and the model list (`/inference/v1/models`) is not at
`{baseUrl}/models`, which is what the base calls. Among the free ones, only
`deepseek-v4.1-flash-free` and `glm-5.3-flash-free` declare zero retention and
no training on the data.

**Measured on 10/29/2026, with a real key (smoke):** both free models answer
through a third-party API with `429 FreeUsageLimitError`: "Free usage limit
reached. Free models work in OpenCode (https://opencode.ai); subscribe to
OpenCode Go to keep going". That is, the free tier only works INSIDE the
OpenCode client, not through the API. The provider normalized the right error
(`rate_limit`, with the upstream's message). Zen's paid models require a
balance on the account or the OpenCode Go subscription; that route was NOT
proven.

## Decision

1. **OpenAI dialect only.** `opencode-zen` is an `OpenAICompatibleProvider`
   with base `https://opencode.ai/inference/openai/v1` and `Authorization:
   Bearer`. The models of `/responses`, `/messages` and Google stay out, as
   does Zen's Jev (the `ToolRouter` is OpenRouter-only, ADR 0179).
2. **`listModels: false`.** The models route is another, public one; the
   catalog comes from the curated seed. For the same reason the credential's
   connection test declares no test for it: a public GET would pass with an
   invalid key.
3. **Seed without a model.** The two zero-retention free models left the seed
   on 10/29/2026: the vendor refuses the free tier through the API (429 above).
   A paid model comes in by manual curation on the screen (ADR 0042), with a
   real price. The capabilities are born `false`.
4. **Capabilities `false` besides `streaming`** (which the contract suite
   requires) and `streamOptionsIncludeUsage: false` until the smoke with
   `OPENCODE_ZEN_TEST_KEY` proves tool call and `usage` on
   `deepseek-v4.1-flash-free` and `glm-5.3-flash-free`.

## Consequences

- The provider list becomes eleven in the enum (migration 0077), the registry,
  the web and the docs.
- A free model is "for a limited time": the catalog ages by itself, with no
  sync; a model that disappears becomes an upstream error, normalized.
- Until the smoke passes, the provider talks by text and does not serve an
  agent with tools. The smoke ran on 10/29/2026 and fails on the vendor's 429.

## References

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — the
  provider list.
- [0222](0222-provider-9router-de-llm.md) — the previous provider, the mold for
  this one.
