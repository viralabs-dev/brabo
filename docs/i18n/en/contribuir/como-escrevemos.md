---
id: como-escrevemos
title: How we write the documentation
sidebar_label: How we write
description: Brabo's documentation writing guide - short sentences, one idea per paragraph, a word budget per page type and the check that enforces it.
keywords: [style, writing, style guide, word budget, estilo.mjs]
tipo: guia
traducao_de: 1056322a9dcfaff9d52972629384913ccbe3546e
---

# How we write the documentation

**After reading:** you write a page that passes the style check without asking for help.
**Before you start:** know the page's type (tutorial, guide, concept or reference) and have the repo cloned with `pnpm install` done.

## The rules

1. **Short sentences, active voice.** Aim for 20 words per sentence. Say "the installer writes the file", not "the file is written by the installer".
2. **One idea per paragraph.** If a paragraph has two "furthermore", it is two paragraphs.
3. **Open with what the person will be able to do.** Right after the title, write "After reading" and the prerequisites, as on this page.
4. **The how comes before the why.** Start with what to do. The reason comes after, short, and only if it helps decide.
5. **Numbered, verifiable steps.** Each step is one action. End the procedure with "how to tell it worked": the command and the expected result.
6. **Internal IDs only in "Para saber mais".** ADR, RN, AT, EP, HS, Fase and Rodada stay in the `## Para saber mais` section, at the end of the page. In the body, say the idea in words.
7. **Images only from the image manifest.** Do not put a stray screenshot on the page. Hide sensitive data in any capture.
8. **A secret never appears**, not even an example that looks like the real one. Use `<TOKEN>`.

## Budget per type

The type comes from the `tipo:` field of the frontmatter. The count is prose only: frontmatter, code blocks, tables, headings and the "Para saber mais" section are left out.

| Type | Word limit |
|---|---|
| tutorial | 1,500 |
| guide | 800 |
| concept | 1,200 |
| reference | no limit, with an index |

Over the limit? Split the page in two, or move the detail to a reference and leave a link.

## Run the check

At the repo root:

```bash
node scripts/docs/estilo.mjs                          # todas as páginas
node scripts/docs/estilo.mjs docs/contribuir/como-escrevemos.md
```

The check prints one `AVISO` per page above the limit and one per internal ID outside "Para saber mais". For now it only warns. The `PENDENTES` list in `scripts/docs/estilo.spec.ts` holds the old pages that still overshoot: it only shrinks. A new page, or a page you have just adjusted, has to pass.

How to tell it worked: the command ends with `estilo: 0 aviso(s)` for your page, and `pnpm test:scripts` exits with code 0.

## A good model

The `orquestrar-repositorios` path follows this guide: it opens with "Para quem é", has sentences of 15 to 18 words and each page fits in 825 words. Copy its format.

## For more

- [How documentation stays alive](../explanation/documentation-workflow.md): the mechanism that keeps the docs up to date, including `estilo.mjs`.
- Origin: AT-861, EP-034. Industry references: Google Developer Documentation Style Guide, Microsoft Writing Style Guide, GitLab docs style and Write the Docs.
