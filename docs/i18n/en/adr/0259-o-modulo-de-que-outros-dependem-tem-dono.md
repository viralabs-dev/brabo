---
traducao_de: cca933f4b1f4f0b3cb2211c17da9937c78f9366f
---

# ADR 0259 — The module others depend on has an owner in the execution plan

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `time`
- **References:** ADR [0194](0194-aprovar-o-plano-ativa-a-execucao.md) (revises RN-678, "the PO creates tasks", only for the foundation task; 0194 is not edited), ADR [0053](0053-dev-lead-e-paralelismo-autorizado.md), and RN-1004, RN-1005 and RN-1006, which implement this decision (AT-742, EP-030, owner's decision of 11/05/2026).

## Context

In the TP-01 of 11/05 (24th round), the Dev Lead's plan marked `persistencia` and `api-http` as "no task, no agent". The scheduling and booking tasks blocked for lack of the `api-http` contract, and the `deploy` task blocked 13 to 16 seconds after the plan. The previous round had the same pattern: the modules without an owner were the BASE (empty `dependsOn`) and the HTTP layer.

Four causes added up:

- the PO creates the tasks BEFORE the `module_map` exists, and the foundation module does not become a story;
- the Dev Lead cannot create a task (RN-678), and the kickoff does not show them the modules' `dependsOn`;
- the api only COUNTS the plan's `modulosSemTarefa`, without refusing;
- `claimNext` hands out the task without looking at `dependsOn`, so the dev starts before the dependency exists.

## Decision

1. **The Dev Lead creates the foundation task.** They get `create_task`, restricted to the story whose `module_ids` contain the module, and the kickoff and `module_map_vigente` now show each module's `dependsOn` and the foundation rule (RN-1006). Otherwise, the PO is still the one who creates tasks (RN-678).
2. **The api refuses a plan that leaves without an owner a module another depends on.** `lerPlanoDeExecucao` returns 400 naming the pair (the module without a task and the one that depends on it). A module without a task that NO other depends on still passes, only counted (RN-1004).
3. **The claim waits for the direct dependency.** `claimNext` does not hand out a module's task while any module in its DIRECT `dependsOn` has an open task. The transitive dependency is not looked at: it already holds the module in the middle (RN-1005).

## Consequences

- Declared price: **less parallelism.** The devs of the dependent modules wait for the foundation to finish, instead of starting together and blocking without a contract. In the typical TP-01 plan, the HTTP layer and the domain modules now wait for persistence.
- A plan that used to be approved with a hole now goes back to the Dev Lead with the pair named, and they fix it by creating the missing task.
- The Dev Lead's kickoff grows with each module's `dependsOn`.
- What does not change: approving the plan still activates execution (ADR 0194), the task's module is still assigned by the Dev Lead, and only that module's dev picks it up.

## Alternatives considered

- **The PO creating the foundation task.** Rejected: the PO works before the `module_map`, and the one who knows the modules and their dependencies is the Dev Lead.
- **Refusing every plan with a module without a task.** Rejected by the owner: a module nobody depends on can wait without holding anyone up.
- **The claim following the transitive `dependsOn`.** Rejected: the direct dependency is enough, because each link holds the next one, and the transitive one only costs reading.

## References

- [0194](0194-aprovar-o-plano-ativa-a-execucao.md), [0053](0053-dev-lead-e-paralelismo-autorizado.md), [0086](0086-dev-lead-plano-suspende-para-aprovacao.md).
