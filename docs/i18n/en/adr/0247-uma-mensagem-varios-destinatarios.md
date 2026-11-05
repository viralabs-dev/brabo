---
traducao_de: c04e6a3fb5c951494bdc10f4cfdc196836d95f22
---

# ADR 0247 — One message, several recipients

- **Status:** accepted
- **Date:** 2026-11-03
- **References:** ADRs [0163](0163-o-clique-responde-ao-aceitar.md) (answer on accept) and [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md) (queue per agent). Revises RN-584 and RN-631 (a single recipient per message). No ADR is edited.

## Context

AT-717 (EP-031): the composer's `@`. The owner decided on 11/02 that `@po @arquiteto` sends the SAME message to both. Until now the message had one recipient, chosen in the "To" selector (RN-631), and `chat.message` did not say who it went to.

## Decision

1. **New route** `POST /projects/:projectId/sessions/:sessionId/messages` (`developer`), body `{ text, destinatarios: string[] (1 to 7), anexos? }`, 202 with `{ mensagemId, entregas: [{ agente, entrega: 'turno'|'enfileirada'|'recusada', motivo? }] }`. The single-agent route (`.../agents/:agent/message`) does not change.
2. **ONE `chat.message`** with `payload.destinatarios`. The single-agent route now records `[agent]`, and the log says who each message went to.
3. **One delivery per agent, with the SAME `mensagemId`**, through the path that already exists (the engine's `agent/message`, `TurnoAssincrono`, the RN-673 queue, named refusals). There is no new queue. A recipient's refusal (non-conversational, inactive, full queue) becomes `recusada` with the reason and does not take down the others. A closed session remains 409 `sessao_encerrada` (RN-581), before any delivery.
4. **The shared `mensagemId` calls for per-agent scope in the queue**: `chat.message_delivered` (actor = the agent) and `chat.message_cancelled` (`agente` in the payload) only close the copy of the agent they refer to. An old event without `agente` applies to all.
5. **Rehydration:** `chat.message` already enters as a user message in every agent's history; the recipients read it as addressed to them and for whoever is not a recipient nothing changes.

## Consequences

- Each recipient pays for a turn; the screen follows more than one turn (web lane).
- Agents that are not recipients still do not read it live; only on rehydration.
- RN-584 (named refusal) and RN-631 (single-destination selector) still hold per recipient.
