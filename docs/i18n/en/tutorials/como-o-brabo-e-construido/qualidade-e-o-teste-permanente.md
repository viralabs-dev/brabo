---
traducao_de: 79c254589fcc8fb071f6286f04004fb413b3bbf7
title: Quality and the permanent acceptance test
description: How Brabo knows the whole product still works - regression by feature, an end-to-end test gate at promotion and a permanent acceptance test that uses the real product and turns findings into tasks.
---

# Quality and the permanent acceptance test

**Who it's for:** anyone whose tests are green and who still finds defects when someone uses the product end to end.

**After reading, you can:** set up three test layers with different roles and explain why the last one never ends.

## Three layers

| Layer | When it runs | What it proves |
|---|---|---|
| **Regression by feature** | On the PR | The feature you touched is still right |
| **End-to-end gate** | At promotion to the main branch | The whole set works, and it blocks the merge if it breaks |
| **Permanent acceptance test** | Continuously, every round | A user can get from idea to result, in the real product |

## Regression by feature

The product has a catalog of features. Each one lists the code paths that make it up and has its browser tests. When your PR touches one of those paths, **that** feature is tested, not the whole product. If it has no test yet, it shows up as "no coverage" and doesn't fail.

On a PR to `dev` this check only **attests**: it is never required. The rule is one of honesty: adjust the regression of the feature you changed, or write on the card why it isn't needed.

Details in [Regression by feature](../../explanation/regressivo-por-funcionalidade.md).

## End-to-end gate

At promotion to `main`, the **whole** catalog runs and blocks the merge. It is the only point where the cost of running everything pays off: it happens rarely and protects what the user installs. There is an explicit way out to accept a known failure, which records who accepted it.

How it works: [The E2E gate](../../e2e-portao/como-funciona.md).

## The permanent acceptance test

The first two test what someone **foresaw**. The third looks for what nobody foresaw.

It is a fixed script that uses the product the way a customer would: creates a project, asks for a delivery, approves, merges and receives the result. It runs **always against the version the user installs**, every round of work, and is never "finished".

### What it returns

- **Findings:** each failure or friction becomes a [task](do-pedido-a-atividade.md) with a card, like any request.
- **One score per round:** quality of the delivery, of what the agents produced and of the time from idea to merge. Measuring only the interaction, without counting the driver's pauses, keeps the series comparable.
- **Comparison:** the round's score is read against the previous ones. A drop is a signal before it is an incident.

:::nota[Why against the installed version]
Testing on the development branch only proves that the next version works. The permanent test exists to prove that the version **already** in the user's hands works.
:::

## How the result goes back to the method

A cycle closes: the permanent test finds, the finding becomes a task, the task is explored, enters a [round](a-rodada.md), becomes a PR and the test runs again. When a finding repeats, it gets a test in the regression, and the lower layer starts catching it earlier.

## What to copy

Start small: a **ten-step** script that walks your product's main path, run by hand every week. Write down what hurt. Only then automate, and only the steps that hurt to repeat.

## Learn more

- [The life of a change](../orquestrar-repositorios/vida-de-uma-mudanca.md), the sections on regression and the gate.
