---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0223 — 推理预算是按模型的 capability，人工策展

## 状态

**已接受。** 2026-10-22（AT-569，EP-026，所有者的方案 C）。主题：`llm`。遵循
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) 与
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)（capability
只有在得到证明时才声明；人工策展），并以
[RN-914](../business-rules/api.md#rn-914) 修订（不编辑）
[RN-782](../business-rules/api.md#rn-782)。

## 背景

PO 在 `deepseek/deepseek-v4.1-flash` 上连续三次把 8192 个 token 中的 8192 个全部花在推理上，没有创建任何故事（TP-01 第 18 轮）。RN-782 从所有模型中移除了 `reasoning` 字段，因为在 Haiku 上它要么被忽略，要么会开启推理。22/10 的付费测量（16 次调用，生成 id 记录在
`~/brabo-gravacoes/raciocinio-smoke-2026-10-22/resultados.jsonl`，已用 `GET /api/v1/generation` 核对）把各模型区分开来。

## 决定

1. 按模型的 capability `reasoningBudget`：列 `models.reasoning_budget`
   （整数，`NULL` = 未证明），由 migration 人工策展，绝不自动发现——同步的 upsert 不会写入它。
2. `qwen/qwen3.7-flash` = 已证明：`reasoning: { max_tokens: N }` 被精确遵守（请求 1024，`native_tokens_reasoning` 中也是 1024，两次调用皆如此）。
   N = **2048**。`buildBody` 只对有预算的模型发送该字段，`max_tokens` = 可见输出 + N（RN-741）。
3. `deepseek/deepseek-v4.1-flash` = 经测量为 `NULL`：`reasoning.max_tokens`
   （1024 和 256）、`reasoning.effort` 与 `reasoning_effort` 都给出同样的 8192 推理，既没有文本也没有 tool call。它被排除在外是因为有证据，而不是疏漏；对它的约束仍是 `reasoningOff`（RN-783/838）。
4. 绝不使用 `effort`：在 qwen 上被忽略（有字段 1191，无字段 643），在 deepseek 上同样如此。
5. qwen 的保留意见：该限制包含推理，但**不**保证 tool call——在困难的 prompt 上，它继续在可见文本中思考（11 551 个字符），耗尽上限而没有调用工具。

## 后果

- 没有预算的模型：请求体与之前逐字节相同（RN-782）。
- 标记其他模型需要自己的 smoke，并在 PR 中引用。
- 待办：目录界面的 thinking 分面不显示预算。

## 参考

- [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)、
  [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)。
- [RN-782](../business-rules/api.md#rn-782)、[RN-914](../business-rules/api.md#rn-914)。
