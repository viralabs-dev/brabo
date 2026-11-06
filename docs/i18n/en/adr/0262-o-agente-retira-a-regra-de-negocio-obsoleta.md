---
traducao_de: dc7656e9b5c23c0855a8298ec96f64043b9ce9b7
---

# ADR 0262 — The agent retires the obsolete business rule, citing the replacement or the answer

- **Status:** accepted
- **Date:** 2026-11-06
- **Theme:** `time`
- **References:** uses the yardstick of ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md) (the user's answer authorizes the correction, RN-859). Cites ADR [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) (the backlog coverage decides the acceptance) and ADR [0212](0212-historia-arquivada.md) (a new state without changing the claim gate). Implemented by RN-1018 (api#34) and completed in the engine and the web (AT-755, owner's decision of 11/06/2026).

## Context

The business rule is the immutable event `artifact.business_rule`, and the log only accumulates. No one had a way to retire a rule that became obsolete. In the 26th TP-01 (11/06), the Creative asked the conductor to "remove the rule manually" four times, and the story came to cite the old rule and the new one at the same time.

## Decision

1. **The agent retires the rule on its own,** with no approval card. It cites the replacement rule (`replacedBy`) or the user's answer (`questionId`), with the same yardstick as RN-859. Without a citation, the retirement is refused (400 `retirada_sem_citacao`).
2. **Only the Creative and the PO retire.** Another role receives 403 `papel_nao_retira_regra`.
3. **A new state, without touching the log.** The event `artifact.business_rule_retired { ruleId, reason, storyIds, replacedBy?, questionId? }` marks the retirement. The rule stays in the log, but leaves every reading that decides anything: list, coverage, duplicate, dev context, automatic acceptance, `afeta.regras` and context summary. Creating or completing a story no longer links a retired rule.
4. **The stories start citing the replacement,** including the `ready` story, with no new promotion. Nothing is written, and the retirement is refused, in two cases:
   - a story would be left with no rule at all (409 `historia_ficaria_sem_regra`);
   - the story has a task in execution (409 `historia_com_tarefa_em_execucao`).

## Consequences

- The Creative and the PO get the tool `retire_business_rule`, and the timeline shows the retirement.
- Retiring by the answer alone, with no replacement, only passes when no story would be left with no rule.
- The refusal because of a task in execution protects the work in progress. The retirement is left for after the merge or the blocking of the task.

## Alternatives considered

- **Approval card.** Rejected by the owner: it gives the user back the friction that TP-01 pointed out.
- **A button only on the screen.** Rejected: it does not solve the case where the agent notices the obsolete rule.
- **Deleting or altering the rule's event.** Rejected: it breaks the log's immutability.

## References

- [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md), [0212](0212-historia-arquivada.md), [0214](0214-pergunta-em-aberto-vira-pendencia.md).
