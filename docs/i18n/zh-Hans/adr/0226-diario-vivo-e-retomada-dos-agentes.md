---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0226 — 活的日志与智能体恢复：被中断的回合凭计划恢复一次

## 状态

**已接受。** 2026-10-28（AT-582，EP-031，所有者 27 和 28/10 的决定）。主题：`agentes`。
在 RN-586 和 RN-778 中修订 engine 重启所杀死的回合"从不重做"的规定。补充（不编辑）
[0163](0163-o-clique-responde-ao-aceitar.md)、
[0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md)、
[0207](0207-ciclo-de-gate-velho-estaciona.md) 和
[0221](0221-upstream-preso-por-sessao.md)。

## 背景

当 engine 在回合中途重启时，进程和 `Task` 一同死亡。此前的结局始终相同：`TurnoOrfao` 以 `agent.error`（来源 `infra`）和 `idle` 关闭回合，提示"请重新发送"，从不重做（RN-586）；dev 智能体阻塞任务并要求一次点击；gate 被整个重新派发，没有限制；Infra Lead 仅存于内存的待处理修正则消失。所有者（19/10）的要求是一份活的记录，记下智能体正在执行什么、停在哪里、还差什么，以便从确切的位置恢复，而不是从头开始或仅仅关闭。可测量的收益是去掉点击和沉默，而不是省钱（第 18 次执行中每个被中断的 dev 约 0,04 美元）。

## 决定

1. **显式计划。** 模型用工具 `registrar_plano` 写下自己的计划，它记录 `agent.plan`（目标和最多 12 个带状态的步骤）。它不是 `proposed_action`，也不是项目工件：写计划不是外部效应。
2. **日志 = 计划加上 log 的投影**，不新增表（`Engine.Agents.Diario`）：当前计划、已确认的效应、没有结果的调用、待处理的动作和最后一次活动。真相来源仍是 event log。
3. **自动恢复：每个回合、任务或周期仅 1 次，仅在启动时，且仅限近期。** "近期"指自智能体最后一次活动起 900 秒（与 RN-823 相同的标准）。智能体收到一条**临时的** `system` 消息（`RetomadaDoTurno`），绝不是伪造的用户消息。超过上限或在窗口之外，只剩下时间线中的"Retomar"按钮，它是人的手势，没有上限。这**修订**了 RN-586 和 RN-778 中的"从不重新执行"。
4. **Dev：** 处于 `working` 的 dev 近期崩溃时，把 worktree 保存为 commit，重新领取**同一**任务，并带着日志运行循环；第 2 次崩溃、窗口之外的崩溃以及 `awaiting_approval` 仍然阻塞。
5. **Gates：** 周期的自动救援只有**一次**，在启动和 tick 时；第 2 次则停放（`gate.rescue_parked`，原因 `retomada_automatica_ja_usada`）并等待"Retomar gate"，它会清零计数器。ADR 0207 的 2 小时停放不变。
6. **Infra Lead：** 带着进行中回合到达的修正变为持久的（`infra.correction_queued`/`_delivered`），沿用 ADR 0191 的队列模式。
7. **幂等：** push 和 PR 可重复（已打开的 PR 会被复用）；恢复时**绝不** merge（RN-418 的上限）；没有结果的调用绝不由 engine 重新执行，日志指示模型在重复之前先核对状态。

## 后果

- 新事件：`agent.plan`、`agent.turn_resumed`、`infra.correction_queued` 和
  `infra.correction_delivered`；列 `engine.gate_states.auto_resumes`；路由
  `POST /projects/:projectId/sessions/:sessionId/agents/:agent/resume`。
- 声明但未修正的残留：
  - **两节点竞态。** 两个节点同时启动、互相看不见，可能把同一个回合恢复两次（沉默的节点算作存活，这缩小了窗口，但没有关闭）。外部效应仍是幂等的；最坏结果是多一个回合。
  - **新 gate 周期上的待处理标记。** 新的 gate 周期可能接到一个不足 15 分钟的待处理 `agent.turn_resumed` 标记，并继承前一个周期的计划。
  - **屏幕之外的"没有结果"。** 时间线卡片显示目标、步骤和停止的位置，但不显示没有结果的调用：错误事件不带它们。
  - **对话型智能体的网络重试。** 不在本次交付内；该按钮本可适用于因瞬时故障而关闭的回合，留待单独的 AT。
- gate 子智能体不会打开 `agent.status: working`，因此它的恢复只带计划；`infra/workflows_agent` 和 `context-manager` 没有 `registrar_plano`。

## 参考

- [0163](0163-o-clique-responde-ao-aceitar.md)、[0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md)、
  [0207](0207-ciclo-de-gate-velho-estaciona.md)、[0221](0221-upstream-preso-por-sessao.md)。
- [RN-918](../business-rules/engine.md#rn-918) 至 [RN-924](../business-rules/engine.md#rn-924)；
  被修订的：[RN-586](../business-rules/engine.md#rn-586)、[RN-742](../business-rules/engine.md#rn-742)、
  [RN-722](../business-rules/engine.md#rn-722)、[RN-823](../business-rules/engine.md#rn-823)、
  [RN-617](../business-rules/engine.md#rn-617)。
