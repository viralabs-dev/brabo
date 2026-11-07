---
traducao_de: ef03b3bddfbc5314b59e4ccc957c774fc5d9f8db
---

# ADR 0257 — 在直连 Anthropic 时，关闭推理是按模型的，而 effort 会降低 Opus 的推理

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `llm`
- **参考：** ADR [0223](0223-orcamento-de-raciocinio-por-modelo.md)（修订第 4 项“`effort` 从不使用”，仅针对 provider `anthropic`；0223 不被编辑）、ADR [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)、RN-741、RN-782、RN-783 和 RN-916，以及为该 provider 取代它们的 RN-1000（AT-739，EP-030，所有者 2026-11-05 的决定）。

## 背景

在 11 月 5 日的 TP-01 中，Haiku 5.5 上 dev agent 的 10 个任务中有 10 个因“只有推理的回应”而阻塞。Anthropic 适配器在推理关闭时省略了 `thinking`（RN-783），理由是“`disabled` 在 5.5 上是 400”。然而在自适应思考的模型上，省略就意味着以默认 effort 运行自适应思考。而且 400 适用于 Sonnet 和 Opus 5.5，不适用于 Haiku 5.5。在自适应开启时，`max_tokens` 总共只有 4096，截断了 Infra。`reasoning_tokens` 输出为 NULL。

## 决定

1. 推理关闭时，请求体按模型而定：
   - Haiku 5.5：`thinking: disabled`；
   - Sonnet 5.5：`thinking: between_tools`；
   - Opus 5.5：`output_config.effort: low`，声明为已减少而不是已关闭；
   - 未知的自适应模型：使用模型的默认值，直到有证明。
2. 对该 provider，`effort` 开始被使用，且只用于推理关闭的 Opus 5.5。会推理的 agent 保持模型的默认 effort。
3. 自适应开启以及仍会思考的情形：`max_tokens` = 可见输出 +（`reasoningBudget` ?? 4096），即 RN-741 的余量。
4. provider 声明 `aceitaRaciocinioDesligado`（RN-916）。
5. `reasoning_tokens` = 最后一个 `message_delta` 的 `thinking_tokens`，仅当它是 ≥ 0 的整数时；否则省略并为 NULL（RN-666）。

## 后果

- 证明：11 月 5 日的付费 smoke，约 0,009 美元（`brabo-api` 的 PR #12）：
  - Haiku、Sonnet 和 Opus 5.5 带一个工具均被接受；
  - Opus 5.5 上的 `disabled` 返回 400；
  - 更换 `system` 并重新发送推理块被接受。
- 在 Opus 5.5 上，RN-916 的无推理重试只会**减少**推理。
- Anthropic 的新模型只有在 PR 中引用了它自己的 smoke 之后，才进入按模型的表。

## 参考

- [0223](0223-orcamento-de-raciocinio-por-modelo.md)、[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md)。
- 官方文档：<https://platform.claude.com/docs/en/build-with-claude/effort> 和 <https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost>。
