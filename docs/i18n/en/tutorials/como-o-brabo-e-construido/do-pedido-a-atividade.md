---
traducao_de: 79c254589fcc8fb071f6286f04004fb413b3bbf7
title: From request to task
description: How a request becomes work someone can start - epic, task and card on the Kanban board - and what it means for a task to be explored, with an open question blocking the start.
---

# From request to task

**Who it's for:** anyone who receives loose requests (from an owner, a customer, a test finding) and wants to turn them into work that can start without a meeting.

**After reading, you can:** write a task that someone else, or an agent, can carry out without asking anything, and decide when it is ready to enter a round.

## Three levels, each with a role

- **Epic:** a goal that lasts weeks. Example: "Corporate login".
- **Task:** the smallest piece that ships on its own and can be verified. Example: "ATV-001: login accepts SSO".
- **Card:** the task as it appears on the Kanban board, with a one-line summary and a link to the note.

The card is short on purpose. Everything that matters lives in the task's **note**, because the board changes every day and the note is the record.

## The board

A simple board has the columns **To do**, **In progress**, **Blocked** and **Done**. Two rules keep it honest:

1. **In progress is only what someone is working on right now.** A stalled card goes to To do or Blocked.
2. **The board is updated in the same step as the change.** Started, finished, blocked: the card changes at that instant, with a date and evidence.

## The task note

Every note has the same sections. They answer the questions an executor would ask:

| Section | Question |
|---|---|
| The problem | Why does this exist? |
| What to do | What changes, concretely? |
| Where | Which files or areas? |
| Linked rules | Which decisions and rules apply here? |
| Acceptance | How do we know it's finished? |
| Questions | What still depends on a human decision? |

The [task template](copie-o-metodo.md) comes with this structure ready.

## What "explored" means

A task only **starts** when it is **explored**: the note already has every requirement gathered and **no open question** for the owner. The card gets the `#explorada` tag at that moment.

This avoids the most common waste: someone starts, finds out halfway that a decision was missing, and stops.

:::nota[An open question blocks]
If the note still has an unanswered question, the task does **not** go to execution. It goes to a **discovery**, in which someone reads the code and the docs, writes down what is missing and phrases the question with options and a recommendation. Only when the answer arrives does the tag go on.
:::

## A short example

Request: "I want login to accept SSO".

1. The request becomes the epic "Corporate login" and the task ATV-001.
2. Without the tag, ATV-001 goes through discovery. The person doing it finds two things: the login file and a doubt ("which provider?").
3. They write both in the note, with options A, B and C and a recommendation.
4. The owner answers "B". The answer goes into the note and the card gets `#explorada`.
5. Only now can ATV-001 enter a [round](a-rodada.md).

## When a finding becomes a task

Every test finding, open issue or error seen in production follows the same path: it becomes a task with a card, and never stays only in a conversation. That way nothing is lost, and the board is the single list of what is missing.

## Learn more

- [The life of a change](../orquestrar-repositorios/vida-de-uma-mudanca.md), for what happens after the work starts.
- [How to contribute](https://github.com/viralabs-dev/brabo/blob/dev/CONTRIBUTING.md), with the PR flow.
