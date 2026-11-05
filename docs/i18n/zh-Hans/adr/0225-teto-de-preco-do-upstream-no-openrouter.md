---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0225 — OpenRouter 每次调用获得价格上限（`provider.max_price` = 目录价 × 1,5）

## 状态

**已接受。** 2026-10-28（AT-606，EP-026，所有者 27/10 的决定）。主题：`llm`。
扩展 [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md)（它只发送
`provider.sort`，把 `max_price` 留作独立的产品决策），
并与 [0221](0221-upstream-preso-por-sessao.md)（`session_id`）并存，两者均不编辑。遵循
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)：
capability 只有在对真实 API 取得证明后才会变为 `true`。

## 背景

在 TP-01 第 18 轮中，`deepseek/deepseek-v4.1-flash` 经过了 17 个 upstream，真实成本是目录成本的 1,85 倍；每百万输入 token 的成本从 0,044 美元到 0,268 美元不等。0221 的 `session_id` 把智能体绑定在服务过它的 upstream 上，但可能把它绑到一个**昂贵的** upstream（AT-580 的 smoke 绑定到的 Together，输入是目录价的 2,1 倍，输出是 2,9 倍）。OpenRouter 的 `provider.max_price` 是按价格的**过滤器**（每百万美元，输入和输出），可与作为**排序**的 `sort` 组合。

## 决定

1. Brabo 在对 OpenRouter 的每次调用中发送 `provider.max_price = { prompt, completion }` = **模型的目录价格 × 1,5**
   （`StreamLlmTurnUseCase`、`RunLlmTurnUseCase`、`SendChatMessageUseCase`）。该系数
   （`FATOR_DO_TETO_DE_PRECO`）**固定在代码中**，并对两端目录价格均大于 0 的每个模型**默认开启**；价格为 0
   （未知）则不发送上限。取 1,5 时，deepseek 41 个端点中约有 11 个通过，Together 和 0,30 美元以上的被排除。更改该系数需要新的 ADR。
2. 在 `LLMProviderCapabilities` 中新增 capability `priceCeiling`，其他九个 provider 为 `false`，OpenRouter 在 smoke
   `openrouter-provider.teto.smoke.spec.ts` 通过后为 `true`。声明它却没有
   `campoDeTetoDePreco` 钩子会在构造时失败。上限的 `provider` 对象与 `sort` 的对象**合并**（并排展开会抹掉 `sort`）。
3. **没有 upstream 满足上限时的 404**：带上限的调用返回的 404 变成命名错误 `LLMPriceCeilingError`（`code: price_ceiling`），区别于 `LLMModelNotFoundError`。三个用例**无上限重试一次**（在 RN-916 的同一个循环中），在该行中把 `token_usage.price_ceiling_factor` 记为空，并在日志中提示；回合不会因成本政策而失败。
4. **Metering：** `token_usage.price_ceiling_factor`（`real`，可空）冻结**实际发出**的系数，沿用 `routing_preference` 的模式（RN-583）。`null` = 未发送任何内容。
5. **不包含**：量化过滤器（各 upstream 的质量没有测量过，且会成为第二个标准）、`provider.only`/`ignore`（按模型策展的列表自己就会过时，且需要名称→slug 的映射）和 `order`（会关闭 sticky）。Jev（ADR 0179）不会收到上限。

## 后果

- `sort` 在便宜的之间决定顺序；`session_id` 保持 upstream；绑定失效时，上限把昂贵的排除出抽取。
- 目录价格陈旧或为手工定价（`manual_pricing`）会导致上限不准；没有 upstream 满足上限时，无上限重试衡量超额部分（因子为空的行）。
- `GET /llm/provider-capabilities` 的 DTO 新增 `priceCeiling`。

## 参考

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — 路由偏好。
- [0221](0221-upstream-preso-por-sessao.md) — `session_id`。
- [RN-917](../business-rules/api.md#rn-917)。
