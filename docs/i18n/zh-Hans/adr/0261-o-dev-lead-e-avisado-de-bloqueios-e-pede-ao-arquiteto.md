---
traducao_de: 7c11b935db491cb45b0f4804a9cbdce6e6476870
---

# ADR 0261 — Dev Lead 会收到阻塞通知，并通过专用通道向架构师提请求

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `time`
- **参考：** 补充 ADR [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md)（计划拒绝路由属于其他模块的任务，RN-1011），并扩展 ADR [0038](0038-hierarquia-de-agentes.md)（此前智能体之间唯一的路径是 handoff）。引用 ADR [0045](0045-reagendamento-por-evento-do-dev-agent.md)（`Wake` 最多投递一次）和 ADR [0163](0163-o-clique-responde-ao-aceitar.md)（即时接受）。由 RN-1011 和 RN-1012 实现（AT-748，engine#25 与 engine#26，所有者 2026 年 11 月 5 日的决定）。

## 背景

过去只有用户通过聊天与架构师对话。向已处于活动状态的智能体做 handoff 会返回 409 `agente_ja_ativo`，因此 Dev Lead 无法向架构师索取合约。而任务被阻塞时 Dev Lead 也不会收到通知：阻塞只对人可见，需要人自己发现。

## 决定

1. **系统通知 Dev Lead。** 通过 `Engine.Dev.Wake`，两个事件会唤醒它：`:tarefa_bloqueada`（来自来源为 `modelo` 的 `report_blocked`）和 `:contrato_publicado`（来自 `declare_module_contracts`）。通知作为由系统发起的回合被读取；如果 Dev Lead 已有回合在进行或有挂起的审批，则进入 `fila_de_mensagens`（RN-1012）。
2. **Dev Lead 通过 `pedir_ao_arquiteto` 工具向架构师提请求。** 它写入一条来自 `dev-lead` 角色的持久 `chat.message`，前缀为 `[Pedido do Dev Lead]`，并通过 `ArquitetoServer.user_message` 投递：架构师立即接受（ADR 0163），忙时则排队。重放时已把任何角色的 `chat.message` 视为 `user`，因此请求能在重启后保留。
3. **解除被卡住任务的阻塞仍由人完成**（RN-826、RN-777）。通知只是告知 Dev Lead，不解除任何阻塞。

## 后果

- Dev Lead 现在有了由系统发起的回合，这是 ADR 0038 未预见的情形（此前只有 handoff 能开启回合）。
- 限制：`Wake` 最多投递一次（ADR 0045）。没有运行中的 Dev Lead 时通知会丢失，只剩人工路径（RN-826）。
- 若请求到达时架构师正忙，`chat.message` 可能在历史中重复出现。
- 用户仍能在架构师的聊天中看到该请求，其前缀把它与用户自己的话区分开。

## 考虑过的替代方案

- **允许向活动智能体做 handoff。** 否决：409 `agente_ja_ativo` 保护正在进行的回合，而请求并不是交接。
- **Dev Lead 假装用户在聊天中发言。** 否决：会丢失作者信息，架构师无法区分智能体的请求与所有者的话。

## 参考

- [0038](0038-hierarquia-de-agentes.md)、[0045](0045-reagendamento-por-evento-do-dev-agent.md)、[0053](0053-dev-lead-e-paralelismo-autorizado.md)、[0163](0163-o-clique-responde-ao-aceitar.md)、[0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md)、[0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md)。
