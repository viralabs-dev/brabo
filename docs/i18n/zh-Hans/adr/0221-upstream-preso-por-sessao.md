---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0221 — hub 按 `session_id` 将每个智能体的对话绑定到服务它的 upstream

## 状态

**已接受。** 2026-10-21（AT-580）。主题：`llm`。扩展
[0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md)（它只发送
`provider.sort`；其 docblock 写明 `provider` 对象的其他字段属于独立的产品决策），不编辑它；并遵循
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) 与
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)：
capability 只有在对真实 API 取得证明后才会变为 `true`。

## 背景

在第 18 轮的 TP-01 中，同一个模型被 17 个不同的 upstream 服务，dev 智能体的缓存命中率随之下降。OpenRouter 已经具备所需的记忆（*provider sticky routing*）：它把对话绑定在服务过它的 upstream 上，只有该 upstream 失败时才切换到下一个，空闲 10 分钟后失效。没有 `session_id` 时，"对话"是第一条 `system` 消息加第一条非 `system` 消息的哈希，而且绑定只在一次缓存命中之后才生效；dev 的每个任务都以不同的第一条消息开头，因此每个任务都会抽到一个新的 upstream。请求体里带上 `session_id`（最多 256 个字符）后，绑定在第一次成功响应时就生效。

## 决定

1. Brabo 在对 OpenRouter 的调用中发送 `session_id` = `brabo:<sessionId>:<agentId>`（没有智能体时为
   `brabo:<sessionId>`），在 `StreamLlmTurnUseCase` 和 `RunLlmTurnUseCase`（`chaveDeSessao`）中组装，并通过
   `ChatOptions.sessionKey` 传递。**按智能体 + 会话**，绝不按项目：
   每个智能体都有自己的前缀（指令 + 工具），把两个智能体混进同一个绑定得不到缓存收益。
2. 在 `LLMProviderCapabilities` 中新增 capability `stickySession`，九个 provider 都必须声明，其中八个为 `false`；OpenRouter 在
   smoke `openrouter-provider.sessao.smoke.spec.ts` 通过后为 `true`（带该键时 6 次调用中 6 次落在同一个
   upstream，不带时 6 次中出现 4 个 upstream）。声明它却没有
   `campoDeSessao` 钩子，会在构造时失败。
3. **不包含**：`provider.order`、`only` 和 `allow_fallbacks`——`order` 会关闭
   sticky routing，需要 slug（而我们保存的是 frame 的名称），而且选择
   "最佳"需要逐次调用读取 `token_usage`（ADR 0060 的上限）。只有在交付后的测量显示被绑定的 upstream 很差时，才作为演进加入。
4. 无表、无 engine：该键可由 `token_usage`
   （`session_id` + `actor_id`）推导，记忆由 hub 保存。Jev（ADR 0179）
   不会收到该键。

## 后果

- `routingPreference`（`sort`）并存：`sort` 选择第一个
  upstream，绑定使其保持不变。
- 该绑定对隐式缓存和显式缓存都有效（RN-892）。
- 等待 gate 或审批超过 10 分钟会解除绑定；下一次抽取由 hub 决定。
- `GET /llm/provider-capabilities` 的 DTO 新增 `stickySession`。

## 参考

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) —
  路由偏好。
- [RN-907](../business-rules/api.md#rn-907)。
