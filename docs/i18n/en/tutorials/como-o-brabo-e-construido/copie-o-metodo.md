---
traducao_de: 79c254589fcc8fb071f6286f04004fb413b3bbf7
title: Copy the method
description: The Kanban board, task and ADR templates to download and adapt, plus Brabo's analyst and executor agents as an example of roles, and an afternoon script to run the first round.
---

# Copy the method

**Who it's for:** anyone who has read the previous pages and wants to leave with files in hand. This page is only what there is to take away.

**After reading, you can:** set up your board, write your first task and record your first decision in one afternoon.

## The templates

Three Markdown files, to download and adapt. The board uses the Obsidian Kanban plugin format, but it is plain text and opens in any editor.

| Template | What for | File |
|---|---|---|
| Board | Columns, usage rules and a sample round | [`_kanban.md`](../../assets/modelos/_kanban.md) |
| Task | The note with the sections from [page 1](do-pedido-a-atividade.md) | [`_atividade.md`](../../assets/modelos/_atividade.md) |
| ADR | Context, decision and consequences | [`_adr.md`](../../assets/modelos/_adr.md) |

The `_` prefix in the name is intentional: the site serves them as files to download, without turning them into pages.

## The agents

Two roles, written as Claude Code agent files, are public in `brabo-ci`:

- [`analista`](https://github.com/viralabs-dev/brabo-ci/blob/dev/.claude/agents/analista.md): read only. Gathers requirements and writes in the note.
- [`executor`](https://github.com/viralabs-dev/brabo-ci/blob/dev/.claude/agents/executor.md): implements a lane, validates and reports.

Don't copy without reading. They cite Brabo conventions (branch names, commit format); swap in yours and keep what matters: the analyst doesn't write code, the executor doesn't decide scope.

## Afternoon script

:::passos
1. Copy `_kanban.md` into your project folder and rename it. Create an epic with a real goal.
2. Copy `_atividade.md` twice and write two small tasks. Leave one with an open question.
3. Answer the question (or put it to whoever decides) and add `#explorada` only to the task with no doubts.
4. Build a one-lane round: give the explored task's note to an executor, human or agent, with the validation commands and the expected exit code.
5. Integrate, validate and open a PR. Move the card at the same instant the status changes.
6. If the change was structural, copy `_adr.md` and record the decision.
:::

If you reached step 5 without having to ask the executor anything, the method worked.

## What to adapt first

- **Column names and tags:** use your team's words.
- **Who the "owner" is:** whoever merges into the main branch. Without a name, nobody does.
- **The parallelism ceiling:** start with two lanes. Raise it when integration stops being the bottleneck.

## When not to copy

A one-person team, a one-repository product and weeks of life? The board and the task are enough. Rounds and agents pay off when there is real parallel work.

## Learn more

- [Build your own](../orquestrar-repositorios/monte-o-seu.md), the equivalent script for the repository **structure**.
