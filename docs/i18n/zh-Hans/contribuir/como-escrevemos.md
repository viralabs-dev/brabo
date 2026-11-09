---
id: como-escrevemos
title: 我们如何撰写文档
sidebar_label: 我们如何撰写
description: Brabo 文档的写作指南——短句、一段一个想法、按页面类型划分的字数预算，以及执行这些要求的检查。
keywords: [风格, 写作, 风格指南, 字数预算, estilo.mjs]
tipo: guia
traducao_de: 1056322a9dcfaff9d52972629384913ccbe3546e
---

# 我们如何撰写文档

**读完之后：** 你能写出一页无需求助就通过风格检查的文档。
**开始之前：** 知道页面的类型（教程、指南、概念或参考），并已克隆仓库且完成 `pnpm install`。

## 规则

1. **短句，主动语态。** 每句以 20 个词为目标。说“安装程序写入文件”，不要说“文件由安装程序写入”。
2. **一段一个想法。** 如果一段里有两个“此外”，那就是两段。
3. **开头先说读者将能做什么。** 紧跟标题之后写“读完之后”和前置条件，就像本页这样。
4. **先说怎么做，再说为什么。** 先写要做什么。原因放在后面，要简短，而且只在有助于决策时才写。
5. **带编号且可验证的步骤。** 每个步骤是一个动作。流程以“如何确认成功”结尾：命令和预期结果。
6. **内部 ID 只放在“Para saber mais”中。** ADR、RN、AT、EP、HS、Fase 和 Rodada 放在页面末尾的 `## Para saber mais` 一节。正文里用文字讲清楚想法。
7. **图片只来自图片清单。** 不要在页面里放零散的截图。任何截图都要隐藏敏感数据。
8. **机密永远不出现**，连看起来像真的示例也不行。使用 `<TOKEN>`。

## 按类型划分的预算

类型来自 frontmatter 的 `tipo:` 字段。只统计正文：frontmatter、代码块、表格、标题和“Para saber mais”一节不计入。

| 类型 | 字数上限 |
|---|---|
| 教程 | 1 500 |
| 指南 | 800 |
| 概念 | 1 200 |
| 参考 | 无上限，需带索引 |

超过上限？把页面拆成两页，或者把细节移到参考页并留一个链接。

## 运行检查

在仓库根目录：

```bash
node scripts/docs/estilo.mjs                          # todas as páginas
node scripts/docs/estilo.mjs docs/contribuir/como-escrevemos.md
```

检查会为每个超过上限的页面输出一条 `AVISO`，并为“Para saber mais”之外的每个内部 ID 输出一条。目前它只发出警告。`scripts/docs/estilo.spec.ts` 中的 `PENDENTES` 名单保存仍然超限的旧页面：它只会缩小。新页面，或你刚调整过的页面，必须通过。

如何确认成功：命令对你的页面以 `estilo: 0 aviso(s)` 结束，并且 `pnpm test:scripts` 以退出码 0 结束。

## 一个好的范本

`orquestrar-repositorios` 这条路径遵循本指南：它以“Para quem é”开头，句子为 15 到 18 个词，每页不超过 825 个词。照着它的格式写。

## 延伸阅读

- [文档如何保持鲜活](../explanation/documentation-workflow.md)：让文档保持最新的机制，包括 `estilo.mjs`。
- 来源：AT-861、EP-034。业界参考：Google Developer Documentation Style Guide、Microsoft Writing Style Guide、GitLab docs style 和 Write the Docs。
