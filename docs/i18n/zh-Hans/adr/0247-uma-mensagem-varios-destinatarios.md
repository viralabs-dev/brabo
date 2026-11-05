---
traducao_de: c04e6a3fb5c951494bdc10f4cfdc196836d95f22
---

# ADR 0247 — 一条消息，多个收件人

- **状态：** 已接受
- **日期：** 2026-11-03
- **引用：** ADR [0163](0163-o-clique-responde-ao-aceitar.md)（接受时即响应）和 [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md)（按智能体的队列）。修订 RN-584 和 RN-631（每条消息只有一个收件人）。不编辑任何 ADR。

## 背景

AT-717（EP-031）：composer 的 `@`。所有者在 11 月 2 日决定 `@po @arquiteto` 把**同一条**消息发给两者。到此为止，一条消息只有一个收件人，由"Para"选择器选定（RN-631），而且 `chat.message` 没有说明发给了谁。

## 决定

1. **新路由** `POST /projects/:projectId/sessions/:sessionId/messages`（`developer`），请求体 `{ text, destinatarios: string[] (1 至 7), anexos? }`，返回 202 与 `{ mensagemId, entregas: [{ agente, entrega: 'turno'|'enfileirada'|'recusada', motivo? }] }`。单个智能体的路由（`.../agents/:agent/message`）不变。
2. **一个** `chat.message`，带 `payload.destinatarios`。单个智能体的路由开始记录 `[agent]`，日志因此说明每条消息发给了谁。
3. **每个智能体一次投递，使用相同的 `mensagemId`**，走已有的路径（engine 的 `agent/message`、`TurnoAssincrono`、RN-673 的队列、命名的拒绝）。没有新队列。某个收件人的拒绝（非对话型、未激活、队列已满）变为 `recusada` 并附原因，不会连累其他收件人。会话已结束仍然是 409 `sessao_encerrada`（RN-581），发生在任何投递之前。
4. **共享的 `mensagemId` 要求队列按智能体划定范围**：`chat.message_delivered`（actor = 该智能体）和 `chat.message_cancelled`（payload 中的 `agente`）只会关闭它们所指智能体的那份副本。没有 `agente` 的旧事件对所有智能体有效。
5. **重放：** `chat.message` 已经作为用户消息进入所有智能体的历史；收件人把它当作发给自己的来读，对非收件人则没有任何变化。

## 后果

- 每个收件人各付出一个回合；界面要跟踪多个回合（web lane）。
- 不是收件人的智能体仍然不会实时读取；只在重放时读取。
- RN-584（命名的拒绝）和 RN-631（单一目的地的选择器）对每个收件人仍然有效。
