---
traducao_de: dc7656e9b5c23c0855a8298ec96f64043b9ce9b7
---

# ADR 0262 — agent 撤销过时的业务规则，并引用替代规则或回答

- **状态：** 已接受
- **日期：** 2026-11-06
- **主题：** `time`
- **参考：** 使用 ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md) 的标尺（用户的回答授权修正，RN-859）。引用 ADR [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md)（backlog 的覆盖度决定接受）和 ADR [0212](0212-historia-arquivada.md)（新状态，而不改变 claim 的闸门）。由 RN-1018（api#34）实现，并在 engine 和 web 中完成（AT-755，所有者 2026-11-06 的决定）。

## 背景

业务规则是不可变事件 `artifact.business_rule`，而日志只会累积。没有人有办法撤销一条已经过时的规则。在 11 月 6 日的第 26 次 TP-01 中，Criativo 四次请求操作者“手动移除规则”，而故事同时引用了旧规则和新规则。

## 决定

1. **agent 自行撤销规则**，无需审批卡片。它引用替代规则（`replacedBy`）或用户的回答（`questionId`），使用与 RN-859 相同的标尺。没有引用时，撤销被拒绝（400 `retirada_sem_citacao`）。
2. **只有 Criativo 和 PO 可以撤销。** 其他角色收到 403 `papel_nao_retira_regra`。
3. **新状态，不触动日志。** 事件 `artifact.business_rule_retired { ruleId, reason, storyIds, replacedBy?, questionId? }` 标记撤销。规则仍留在日志中，但会从所有做决定的读取中消失：列表、覆盖度、重复、dev 的上下文、自动接受、`afeta.regras` 和上下文摘要。创建或补全故事时不再关联已撤销的规则。
4. **故事改为引用替代规则**，包括 `ready` 故事，无需重新晋升。在两种情况下不会写入任何东西，并拒绝撤销：
   - 某个故事将没有任何规则（409 `historia_ficaria_sem_regra`）；
   - 该故事有正在执行的任务（409 `historia_com_tarefa_em_execucao`）。

## 后果

- Criativo 和 PO 获得工具 `retire_business_rule`，时间线会显示这次撤销。
- 仅凭回答、没有替代规则而撤销，只有在没有任何故事会因此没有规则时才通过。
- 因任务正在执行而拒绝，是为了保护进行中的工作。撤销推迟到任务合并或被阻塞之后。

## 考虑过的替代方案

- **审批卡片。** 所有者否决：这把 TP-01 指出的摩擦又还给了用户。
- **只在界面上放一个按钮。** 否决：解决不了 agent 自己发现规则已过时的情形。
- **删除或修改规则的事件。** 否决：破坏日志的不可变性。

## 参考

- [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md)、[0212](0212-historia-arquivada.md)、[0214](0214-pergunta-em-aberto-vira-pendencia.md)。
