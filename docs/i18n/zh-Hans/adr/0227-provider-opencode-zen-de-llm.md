---
traducao_de: e7f079cf5c07cda04fd640b5b0ee1bc41aeb181c
---

# ADR 0227 — OpenCode Zen 成为第 11 个 LLM provider，仅使用 OpenAI 方言

## 状态

**已接受。** 2026-10-29（AT-568，EP-026）。主题：`llm`。扩展
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) 与
[0222](0222-provider-9router-de-llm.md)（provider 列表，由十个增至十一个），均不编辑，并遵循
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) 与
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)：
capability 只有在对真实 API 取得证明后才会变为 `true`，目录是策展。

## 背景

OpenCode Zen 是一个模型网关，有一批 `-free` 模型。公开文档展示了三种方言：`/chat/completions`（OpenAI，位于
`https://opencode.ai/inference/openai/v1`）、`/responses` 和 `/v1/messages`
（Anthropic），以及 Google。基类 `OpenAICompatibleProvider` 只支持
`/chat/completions`，而模型列表（`/inference/v1/models`）不在
`{baseUrl}/models`，而基类调用的正是后者。免费模型中，只有
`deepseek-v4.1-flash-free` 和 `glm-5.3-flash-free` 声明零保留且不用数据训练。

**2026 年 10 月 29 日用真实密钥实测（smoke）：** 两个免费模型通过第三方 API 调用时都返回 `429 FreeUsageLimitError`："Free usage limit
reached. Free models work in OpenCode (https://opencode.ai); subscribe to
OpenCode Go to keep going"。也就是说，免费只在 OpenCode 客户端**内部**有效，通过 API 无效。该 provider 正确地规范化了错误（`rate_limit`，附带 upstream 的消息）。Zen 的付费模型需要账户余额或 OpenCode Go 订阅；这条路径**没有**被证明。

## 决定

1. **仅 OpenAI 方言。** `opencode-zen` 是一个 `OpenAICompatibleProvider`，基础地址为 `https://opencode.ai/inference/openai/v1`，使用 `Authorization: Bearer`。
   `/responses`、`/messages` 和 Google 的模型不在范围内，Zen 的 Jev 也是（`ToolRouter` 只属于 OpenRouter，ADR 0179）。
2. **`listModels: false`。** 模型路由是另一个公开的路由；目录来自策展的 seed。出于同样的原因，凭据的连接测试不为它声明测试：公开的 GET 即使密钥无效也会通过。
3. **seed 中没有模型。** 两个零保留的免费模型于 2026 年 10 月 29 日移出 seed：供应商拒绝通过 API 提供免费模型（上述 429）。付费模型通过界面上的人工策展加入（ADR 0042），带真实价格。capabilities 默认为 `false`。
4. **除 `streaming`（契约测试套件要求）之外的 capabilities 均为 `false`**，且在使用 `OPENCODE_ZEN_TEST_KEY` 的 smoke 于 `deepseek-v4.1-flash-free` 和 `glm-5.3-flash-free` 上证明 tool call 和 `usage` 之前，`streamOptionsIncludeUsage: false`。

## 后果

- provider 数量在 enum（migration 0077）、registry、web 和文档中变为十一个。
- 免费模型是"限时的"：目录会自行变旧，没有同步；消失的模型会变成规范化的 upstream 错误。
- 在 smoke 通过之前，该 provider 只能以文本对话，不适用于带工具的智能体。smoke 已于 2026 年 10 月 29 日运行，并因供应商的 429 而未通过。

## 参考

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — provider 列表。
- [0222](0222-provider-9router-de-llm.md) — 前一个 provider，本 ADR 的模板。
