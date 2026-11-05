---
traducao_de: 0483395980d396f056e7debe40f10199e7932766
---

# ADR 0251 — 对不提供价格的 provider，在代码中标注日期的标价

- **状态：** 已接受
- **日期：** 2026-11-03
- **引用：** ADR [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)（人工策展，价格在 metering 中冻结）。不编辑任何 ADR。

## 背景

Anthropic 的 `/v1/models` 既不提供价格，也不在 Brabo 中标明推理：14 个同步的模型中有 13 个到达时价格为 0 且 `supports_reasoning = false`。开销以零成本记录而没有任何提示，而 AT-676 从未开启推理。

## 决定

1. API 不提供价格的 provider，从厂商的唯一表中读取**标价**（`precos-do-fabricante.ts`，RN-965，每行带来源链接和日期），这与建议界面所用的是**同一张**表，现在同步也使用它。`listModels` 按 ID 匹配，找不到时按去掉日期后缀的 ID 匹配。表外的 ID 仍然没有价格。
2. 同步不变：`manual_pricing` 仍然优先于远程目录；标价只进入非手工的行。
3. `supportsReasoning` 来自 SDK 的 `capabilities.thinking`，以模型系列作为备用。

## 后果

- 这张表会过时：更新就是编辑 `precos-do-fabricante.ts` 和 `conferidoEm`，在此之前新模型的价格属于策展。
- 只有一个来源：建议界面与同步不会出现分歧。
