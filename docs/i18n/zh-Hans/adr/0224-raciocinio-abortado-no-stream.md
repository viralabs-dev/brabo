---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0224 — 推理在 stream 中被计数并在上限处中止，成本先估算再对账

## 状态

**已接受。** 2026-10-22（AT-589，EP-026，所有者的决定）。主题：`llm`。
补充（不编辑）[0223](0223-orcamento-de-raciocinio-por-modelo.md)，并使用
[0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md) 的
`price_implicit` 列。

## 背景

[0223](0223-orcamento-de-raciocinio-por-modelo.md) 只能限制遵守 `reasoning.max_tokens` 字段的模型。`deepseek/deepseek-v4.1-flash` 忽略所有限制字段（8192 中的 8192 全是推理），AT-589 就是为它而生：在 stream 中中止连接是限制它的唯一办法。22/10 的付费测量（OpenRouter）：每个推理 chunk 都带有 `delta.reasoning`（文本）；`字符数/4` 近似 token 数（deepseek 为 3,9，qwen 为 3,8）；中止只对已生成的部分计费（529 个 token 中约 521 个）。但被中止的响应**不**带 `usage`，也没有 `finish_reason`，真实成本约 5 分钟后才出现在 `GET /api/v1/generation?id=`（之前是 404）。

## 决定

1. 兼容 OpenAI 的 provider 在模型有 `reasoning_budget` 时统计 `delta.reasoning`（字符数/4），超过上限时中止连接，并发出 `truncated` chunk，带 `motivo: "raciocinio"`（因 `max_tokens` 截断则没有 motivo）。没有预算的模型不计数也不中止。
2. 被中止调用的开销 = 即时估算：输出 token = 字符数/4（推理与文本），输入 token 由估算器给出（没有则字符数/4），按目录价格计算，并带 `price_implicit` 和新的 `token_usage.custo_a_reconciliar`。
3. 对账：`ReconciliarCustoEstimadoUseCase` 通过 `setInterval` 在 api 进程内运行（与 projectors 相同的机制；没有新队列，没有 Redis），间隔为 `CUSTO_RECONCILIACAO_INTERVAL_MS`（5 分钟；`0` 为关闭）。只查看最近 24 小时内被标记的行，并且只有在返回 200 时才用 `/generation` 的 `total_cost` 替换；被替换的行把估算值保存在 `catalog_cost_micros`。其他任何响应都让该行留待下一轮；24 小时后估算值成为最终值。
4. 迁移 0075 创建该列，并在 `deepseek/deepseek-v4.1-flash`（openrouter）上设置 `reasoning_budget` 2048，沿用 0074 的模式。

## 后果

- provider 契约新增 `truncated.motivo` 和 `usage.abortadoPeloRaciocinio`（增量式）；metering 新增该列。
- 声明的限制：预算和领域的 `spentMicros` **不**由对账修正（估算值已经累加过；差额只有几分钱）；使用的密钥是 workspace owner 的；多个 api 实例并行对账不会造成损害（替换只作用于仍被标记的行）；被中止的 stream 中的部分 tool call 会被丢弃。

## 参考

- [0223](0223-orcamento-de-raciocinio-por-modelo.md)、[0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md)。
- [RN-915](../business-rules/api.md#rn-915)、[RN-914](../business-rules/api.md#rn-914)。
