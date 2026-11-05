---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0222 — The 9Router LLM provider

## Status

**Accepted.** 2026-10-22 (AT-576a, EP-026). Theme: `llm`. Extends
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) (the provider
list, which goes from nine to ten) without editing it, and follows
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) and
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): the
capability only becomes `true` with proof against the real API, and the price
is manual curation.

## Context

9Router is the owner's local gateway (Node, MIT), with an OpenAI-compatible
endpoint at `http://localhost:20128/v1` and routing by combos. It runs OUTSIDE
the compose, on the owner's machine, and uses their accounts and subscriptions.
Unlike the nine cloud providers, the address is not fixed.

## Decision

1. **URL per installation.** `NINE_ROUTER_BASE_URL`, default
   `http://host.docker.internal:20128/v1` (the `OLLAMA_HOST` mold), read by the
   provider and by the connection test. The install and production composes get
   `extra_hosts: host.docker.internal:host-gateway` on the api.
2. **Mandatory credential.** The API key is created in the 9Router panel; the
   provider goes into `LLM_PROVIDER_NAMES_COM_CREDENCIAL`. Reading or creating
   combos through the panel would require its PASSWORD as a second secret and
   is out (576b).
3. **Manual price, with the public price.** The response carries no cost. By
   the owner's decision (10/22), a subscription model records the **public
   price of the equivalent API**, not zero: the budget counts the opportunity
   cost. It is curation (ADR 0042), never discovery.
4. **Capabilities `false` until the smoke** (`toolCalling`,
   `routingPreference`, `embeddings`, `promptCaching`, `stickySession`), with
   `listModels: true` and `streaming: true` (the contract suite requires
   `streaming` of every provider) and its own parser for the `capabilities` of
   `GET /v1/models`.
5. **Token Saver off.** The RTK Token Saver compresses `tool_result`; the
   provider sends `x-9router-token-saver: off` on every call and the smoke
   checks that the `tool_result` arrives intact. Smoke and TP-01 only with
   `free`/`auto:free` models.

## Consequences

- The provider list becomes ten in the enum, the migration, the registry, the
  web and the docs.
- 9Router being down is a normalized infra error, like any provider.
- The value of the Token Saver header was not found in the source
  (**TODO(humano)**): the smoke is what says whether `off` holds.

## References

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — the
  provider list.
- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — routing is
  the hub's; a combo is not `provider.sort`.
- [RN-909](../business-rules/api.md#rn-909).
