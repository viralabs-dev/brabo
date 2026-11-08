---
traducao_de: 79c254589fcc8fb071f6286f04004fb413b3bbf7
title: The rule becomes code, and the docs go with it
description: How a business decision leaves a verifiable trace - a rule with file, line and test, a structural decision in an immutable record - and why documentation is part of done, in the same PR as the change.
---

# The rule becomes code, and the docs go with it

**Who it's for:** anyone who has watched docs age next to the code and wants a way to stop it.

**After reading, you can:** decide whether something is a business rule or an architecture decision, record it in the right place and know what goes into the same PR as the change.

## Two kinds of decision, two records

| It is... | It becomes... | Does it change? |
|---|---|---|
| A rule the product keeps ("the invitation expires in 7 days") | A numbered **business rule** | Yes, when the business changes |
| A structural choice ("we use a queue for jobs") | A **decision record** (ADR) | Never: a new one replaces it |

## The business rule points to the code

A rule without a pointer is an opinion. Each Brabo rule says **where** it is enforced and **which test** proves it:

```markdown
### Convite expira em 7 dias
O convite deixa de valer 7 dias depois de enviado.
- Código: `src/convites/expira.ts:42`
- Teste: `src/convites/expira.spec.ts`
```

A check confirms that the file exists and that the line still points to the symbol. If someone moves the code and forgets the rule, the check fails. The rule doesn't age in silence.

:::nota[Anchors that don't repeat]
Each rule has a unique number. Before creating one, look for the next free number in **all** open branches, not only the main one. Two parallel fronts often pick the same.
:::

## The ADR records the why

An ADR is a short page with context, decision and consequences. Golden rule: **an accepted ADR is not edited.** If the decision changes, write a new one and say which one it replaces. The decision history is read like a diary, and a diary isn't rewritten. The [ADR template](copie-o-metodo.md) is ready to copy.

Not every change needs an ADR. It is needed by whoever touches a boundary, the database, the consistency model or a heavy dependency.

## The docs go in the same PR

Brabo's definition of done includes:

1. the code and the tests;
2. the repository docs (`docs/`) updated;
3. a line in `CHANGELOG.md`, under "Unreleased";
4. the README and the contributing guide, when they change;
5. the site, which aggregates the repositories' docs.

There is no "docs later". A PR that changes observable behavior without touching the matching docs is not done.

## The map that says what to update

So as not to depend on memory, a file (`docs/.docmap.yml`) ties **code paths** to **documents**. Whoever changes `src/convites/` sees that `docs/convites.md` depends on it. The map is a **floor**: it reminds you of the minimum, but the writer still sweeps the folder for other affected pages.

Files marked as generated are never edited by hand; the generator rewrites them.

## When information is missing

If the writer has no way of knowing something, they leave a visible mark:

```markdown
> **TODO(humano):** o prazo de 7 dias vale para convites reenviados?
```

Invented docs are worse than missing docs. The mark becomes a question on the board, and the [task](do-pedido-a-atividade.md) stays without `#explorada` until someone answers.

## Learn more

- [Documentation workflow](https://github.com/viralabs-dev/brabo/blob/dev/docs/documentation-workflow.md), with the full mechanism.
- [How to contribute](https://github.com/viralabs-dev/brabo/blob/dev/CONTRIBUTING.md), section "Documentation is part of the PR".
