---
traducao_de: 79c254589fcc8fb071f6286f04004fb413b3bbf7
title: The round
description: How work moves with people and agents - discovery by a read-only analyst, execution in lanes with disjoint files, one PR per repository and the merge in the owner's hands.
---

# The round

**Who it's for:** anyone who wants to split a batch of tasks among several executors, human or agent, without them stepping on each other.

**After reading, you can:** plan a round with parallel lanes, say what stays sequential and why, and describe the path to the merge.

## What a round is

A **round** is a batch of already-explored tasks, run at the same time. Each task goes to a **lane**, and each lane is an executor (a person or an agent). The round ends when the changes are integrated and validated.

## Two roles, kept apart

| Role | Can write code? | Does what |
|---|---|---|
| **Analyst** | No, read only | Gathers requirements and writes the result in the note |
| **Executor** | Yes, in their lane | Implements, tests and documents |

The separation is the method's most valuable rule. Whoever gathers requirements doesn't risk "fixing things along the way". Whoever executes receives the specification ready. The two sample agents are in [Copy the method](copie-o-metodo.md).

## Building the round

1. **Re-read the board.** Only tasks with `#explorada` get in.
2. **Split into lanes.** Each lane has files or areas **disjoint** from the others in the same round.
3. **Mark what is sequential.** What has a real dependency, a shared file, a single resource (a database, an environment) or a human gesture waits in line.
4. **Launch every lane at once.** The coordinator doesn't wait for one to finish before releasing the next.
5. **Update the board at the same instant:** the lanes' cards move to In progress.

:::dica[Shared files stay with the coordinator]
Indexes, menu lists and the board itself are collision points. No lane edits them. Each one reports, in its report, the line that needs to go in, and the coordinator merges them.
:::

## What each lane receives

A good lane brief fits on one screen and says:

- the starting point (the code base, with the SHA);
- the task note, which is the specification;
- what **not** to touch;
- the validation commands, with the expected exit code for each;
- the report format.

The lane doesn't open other agents. The parallelism ceiling belongs to the coordinator, not to each lane.

## One PR per repository

When two lanes touch the same repository, they **combine** their work in one branch and open **one** PR for the round. The proof is that PR's CI. This cuts review noise and keeps the history readable.

The path from the PR to the release is described in [The life of a change](../orquestrar-repositorios/vida-de-uma-mudanca.md). We don't repeat it here.

## Review and merge

The coordinator **integrates**: checks each lane's diff, runs the validation and updates the board. The merge into a protected branch belongs to the product **owner**. No lane, and no agent, merges into the main branch.

:::cuidado[Check what the lane says]
A lane report is not proof. Run the command and read the exit code. "The tests pass" without the exit code has fooled the team more than once.
:::

## When something fails

One lane's failure doesn't take down the others. The coordinator reads the cause, fixes the brief and launches only that lane again. The cause goes into the task note.

## A real example

[PR 89 of `brabo`](https://github.com/viralabs-dev/brabo/pull/89) was a documentation round: several lanes, each with its own area, integrated into a single PR.

## Learn more

- [Who does what](../orquestrar-repositorios/o-mapa.md), for the map of the repositories.
- [Mistakes we've already made](../orquestrar-repositorios/erros-que-ja-cometemos.md).
