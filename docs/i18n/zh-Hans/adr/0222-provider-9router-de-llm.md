---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0222 — 9Router 成为第 10 个 LLM provider，URL 按安装配置

## 状态

**已接受。** 2026-10-22（AT-576a，EP-026）。主题：`llm`。扩展
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md)（provider 列表，由九个增至十个），不编辑它；并遵循
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) 与
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)：
capability 只有在对真实 API 取得证明后才会变为 `true`，价格是人工策展。

## 背景

9Router 是所有者本人的本地网关（Node，MIT），提供兼容 OpenAI 的端点 `http://localhost:20128/v1`，并按 combo 路由。它运行在 compose **之外**、所有者的机器上，使用他自己的账号和订阅。与九个云端 provider 不同，它的地址不是固定的。

## 决定

1. **URL 按安装配置。** `NINE_ROUTER_BASE_URL`，默认值
   `http://host.docker.internal:20128/v1`（沿用 `OLLAMA_HOST` 的模式），由 provider 和连接测试读取。安装与生产的 compose 在 api 上增加
   `extra_hosts: host.docker.internal:host-gateway`。
2. **凭据必填。** API 密钥在 9Router 面板中创建；该 provider 进入
   `LLM_PROVIDER_NAMES_COM_CREDENCIAL`。通过面板读取或创建 combo 需要他的密码作为第二个秘密，因此不在范围内（576b）。
3. **手工定价，使用公开价格。** 响应不带成本。按所有者的决定（22/10），订阅型模型登记的是**等价 API 的公开价格**，而不是零：预算计入机会成本。这是策展（ADR 0042），绝不是自动发现。
4. **在 smoke 之前 capabilities 均为 `false`**（`toolCalling`、`routingPreference`、
   `embeddings`、`promptCaching`、`stickySession`），`listModels: true` 与
   `streaming: true`（契约测试套件要求每个 provider 都有 `streaming`），并对 `GET /v1/models` 的 `capabilities` 使用专门的解析器。
5. **Token Saver 关闭。** RTK Token Saver 会压缩 `tool_result`；该
   provider 在每次调用中发送 `x-9router-token-saver: off`，smoke 会核对
   `tool_result` 原样到达。smoke 和 TP-01 只使用
   `free`/`auto:free` 模型。

## 后果

- provider 数量在 enum、migration、registry、web 和文档中都变为十个。
- 9Router 不在线时是规范化的 infra 错误，与任何 provider 一样。
- Token Saver 请求头的取值在源码中没有找到
  （**TODO(humano)**）：由 smoke 来确认 `off` 是否有效。

## 参考

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — provider 列表。
- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — 路由属于 hub；combo 不是 `provider.sort`。
- [RN-909](../business-rules/api.md#rn-909)。
