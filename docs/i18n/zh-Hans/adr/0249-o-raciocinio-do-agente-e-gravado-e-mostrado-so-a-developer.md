---
traducao_de: 8ab514af259ee767549a90f75e4b67d69e331217
---

# ADR 0249 — 智能体的推理被记录，且仅向 developer 及以上显示

- **状态：** 已接受
- **日期：** 2026-11-03
- **引用：** ADR [0224](0224-raciocinio-abortado-no-stream.md)（推理在 stream 中被**计数**，不被保存）和 [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)（capability 必须有证明）。不编辑任何 ADR。

## 背景

AT-676（EP-031）：时间线中的"推理"块没有数据。文本已经通过 `delta.reasoning` 到达，却被丢弃。所有者在 11 月 3 日决定：**完整**记录，也实时显示，只有 `developer` 或更高者可见，并适用于 OpenRouter、Anthropic 和 `reasoning_content`。

## 决定

1. **契约。** `ChatStreamChunk` 新增 `{ type: 'reasoning', text }`，`LLMProviderCapabilities` 新增 `reasoningText`，在有 smoke 之前全部为 `false`（读取代码已存在于各 provider 中；该标志只说明什么被**证明**了）。
2. **`stream-llm-turn`** 发出带 delta 的 `raciocinio` 帧，`final` 携带完整的 `raciocinio`，不截断；`llm-turn` 返回同一字段。文本绝不进入 `content`。
3. **Anthropic。** 发送 `thinking`（`budget_tokens` = 模型的预算，至少 1024），输出上限随该值上调。带签名的 `thinking`/`redacted_thinking` 块通过 `tool_calls` chunk（`thinkingBlocks`）和 `final`（`message.thinkingBlocks`）输出；engine 在循环的各轮之间保存它们，并通过 `ChatMessage.thinkingBlocks` 返还，provider 将其置于文本和 `tool_use` **之前**。
4. **记录。** engine 把 `payload.raciocinio` 写入 `agent.response`，无上限。它绝不返回给模型（重放）、RAG 或图谱。
5. **谁能读。** 对于有效角色低于 `developer` 的人，api 通过统一的输出过滤器，从 HTTP 事件读取中去掉 `payload.raciocinio`；engine 的实时通道需要同样的角色，由 socket 的 ticket 签发。

## 后果

- 推理可能重复智能体读过的内容；按角色限制就是遏制，沿用 `tool.result`（RN-589）的模式并多一级。
- 没有上限时，事件会增长（至每轮的预算，最多 14 轮）。大小由 engine lane 在 payload 中声明。
- 没有 smoke 的 provider 保持 `reasoningText: false`，并在没有该块的情况下降级。
