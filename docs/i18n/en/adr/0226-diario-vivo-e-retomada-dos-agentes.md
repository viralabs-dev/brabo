---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0226 — Living diary and agent resumption: the interrupted turn comes back once, from the plan

## Status

**Accepted.** 2026-10-28 (AT-582, EP-031, owner's decisions of 10/27 and 10/28).
Theme: `agentes`. Revises, in RN-586 and RN-778, the "is never redone" of the
turn that the engine restart killed. Complements, without editing them,
[0163](0163-o-clique-responde-ao-aceitar.md),
[0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md),
[0207](0207-ciclo-de-gate-velho-estaciona.md) and
[0221](0221-upstream-preso-por-sessao.md).

## Context

When the engine restarts in the middle of a turn, the process and the `Task`
die together. Until now the outcome was always the same: `TurnoOrfao` closed
the turn with `agent.error` (origin `infra`) and `idle`, said "send it again"
and never redid it (RN-586); the dev agent blocked the task and asked for a
click; the gate was redispatched whole, with no limit; the Infra Lead's pending
correction, only in memory, vanished. The owner's request (10/19) was a living
record of what the agent is running, where it stopped and what is left, so it
could come back from the exact point instead of starting over or merely
closing. The measured gain is removing the click and the silence, not money
(≈ US$ 0.04 per interrupted dev in the 18th run).

## Decision

1. **Explicit plan.** The model writes its own plan with the tool
   `registrar_plano`, which records `agent.plan` (goal and up to 12 steps with
   status). It is neither a `proposed_action` nor a project artifact: writing
   the plan is not an external effect.
2. **The diary is the plan plus a projection of the log**, with no new table
   (`Engine.Agents.Diario`): current plan, confirmed effects, calls without an
   outcome, pending actions and last activity. The source of truth remains the
   event log.
3. **Automatic resumption, once per turn, task or cycle, only on boot and only
   if recent.** "Recent" is 900 s since the agent's last activity (the same
   yardstick as RN-823). The agent receives an EPHEMERAL `system` message
   (`RetomadaDoTurno`), never a fake user message. After the ceiling, or
   outside the window, only the "Resume" button on the thread, which is a human
   gesture and has no ceiling. This REVISES the "never re-executes" of RN-586
   and RN-778.
4. **Dev:** a recent crash of a `working` dev preserves the worktree as a
   commit, re-adopts the SAME task and runs the loop with the diary; the 2nd
   crash, a crash outside the window and `awaiting_approval` keep blocking.
5. **Gates:** the automatic rescue of a cycle applies ONCE, on boot and on the
   tick; the 2nd one parks (`gate.rescue_parked`, reason
   `retomada_automatica_ja_usada`) and waits for the "Resume gate", which
   resets the counter. The 2 h parking of ADR 0207 does not change.
6. **Infra Lead:** the correction that arrives with a turn in progress becomes
   durable (`infra.correction_queued`/`_delivered`), following the mold of the
   queue of ADR 0191.
7. **Idempotency:** push and PR are repeatable (the open PR is reused); merge
   NEVER on resumption (RN-418 ceiling); a call without an outcome is never
   re-executed by the engine, and the diary tells the model to check the state
   before repeating.

## Consequences

- New events: `agent.plan`, `agent.turn_resumed`, `infra.correction_queued` and
  `infra.correction_delivered`; column `engine.gate_states.auto_resumes`; route
  `POST /projects/:projectId/sessions/:sessionId/agents/:agent/resume`.
- Declared residues, not fixed:
  - **Two-node race.** Two nodes coming up together, without seeing each
    other, may resume the same turn twice (a mute node counts as alive, which
    reduces the window but does not close it). External effects remain
    idempotent; the worst outcome is one extra turn.
  - **Pending marker in the new gate cycle.** A new gate cycle may pick up a
    pending `agent.turn_resumed` marker younger than 15 min and inherit the
    previous cycle's plan.
  - **"Without outcome" off the screen.** The thread card shows goal, steps
    and where it stopped, but not the calls without an outcome: the error event
    does not carry them.
  - **Network retry in the conversationals.** Left out of this delivery; the
    button could apply to a turn closed by a transient failure, in an AT of its
    own.
- The gate subagent does not open `agent.status: working`, so its resumption
  carries only the plan; `infra/workflows_agent` and `context-manager` have no
  `registrar_plano`.

## References

- [0163](0163-o-clique-responde-ao-aceitar.md), [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md),
  [0207](0207-ciclo-de-gate-velho-estaciona.md), [0221](0221-upstream-preso-por-sessao.md).
- [RN-918](../business-rules/engine.md#rn-918) to [RN-924](../business-rules/engine.md#rn-924);
  revised: [RN-586](../business-rules/engine.md#rn-586), [RN-742](../business-rules/engine.md#rn-742),
  [RN-722](../business-rules/engine.md#rn-722), [RN-823](../business-rules/engine.md#rn-823),
  [RN-617](../business-rules/engine.md#rn-617).
