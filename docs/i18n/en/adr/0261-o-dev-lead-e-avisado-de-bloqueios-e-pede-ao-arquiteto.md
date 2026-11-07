---
traducao_de: 7c11b935db491cb45b0f4804a9cbdce6e6476870
---

# ADR 0261 — The Dev Lead is told about blockers and asks the Architect through a channel of its own

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `time`
- **References:** complements ADR [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) (the plan rejects a task whose route belongs to another module, RN-1011) and extends ADR [0038](0038-hierarquia-de-agentes.md) (the only path between agents was the handoff). Cites ADR [0045](0045-reagendamento-por-evento-do-dev-agent.md) (`Wake` delivers at most once) and ADR [0163](0163-o-clique-responde-ao-aceitar.md) (immediate acceptance). Implemented by RN-1011 and RN-1012 (AT-748, engine#25 and engine#26, owner's decision of 11/05/2026).

## Context

Only the user talked to the Architect, through the chat. A handoff to an agent that is already active returns 409 `agente_ja_ativo`, so the Dev Lead had no way to ask the Architect for a contract. And the Dev Lead was not told when a task blocked: the blocker was visible only to the human, who had to notice it.

## Decision

1. **The system tells the Dev Lead.** Through `Engine.Dev.Wake`, two events wake it: `:tarefa_bloqueada` (from `report_blocked` with origin `modelo`) and `:contrato_publicado` (from `declare_module_contracts`). The notice is read as a system-initiated turn, or goes into `fila_de_mensagens` if the Dev Lead already has a turn running or a suspended approval (RN-1012).
2. **The Dev Lead asks the Architect through the `pedir_ao_arquiteto` tool.** It writes a durable `chat.message` from the `dev-lead` actor, prefixed `[Pedido do Dev Lead]`, and delivers it through `ArquitetoServer.user_message`: the Architect accepts at once (ADR 0163) or queues it if busy. Rehydration already treats a `chat.message` from any actor as `user`, so the request survives a restart.
3. **Unblocking the stuck task stays human** (RN-826, RN-777). The notice informs the Dev Lead; it unlocks nothing.

## Consequences

- The Dev Lead now has a system-initiated turn, a case ADR 0038 did not foresee (only the handoff opened a turn).
- Limit: `Wake` delivers at most once (ADR 0045). With no Dev Lead running, the notice is lost and only the human path remains (RN-826).
- The `chat.message` may appear duplicated in the history if the Architect is busy when the request arrives.
- The user still sees the request in the Architect's chat, with the prefix that sets it apart from the user's own words.

## Alternatives considered

- **Allow the handoff to an active agent.** Rejected: the 409 `agente_ja_ativo` protects the running turn, and the request is not a hand-over.
- **The Dev Lead writing to the chat as if it were the user.** Rejected: it would lose authorship, and the Architect could not tell the agent's request from the owner's words.

## References

- [0038](0038-hierarquia-de-agentes.md), [0045](0045-reagendamento-por-evento-do-dev-agent.md), [0053](0053-dev-lead-e-paralelismo-autorizado.md), [0163](0163-o-clique-responde-ao-aceitar.md), [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md), [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md).
