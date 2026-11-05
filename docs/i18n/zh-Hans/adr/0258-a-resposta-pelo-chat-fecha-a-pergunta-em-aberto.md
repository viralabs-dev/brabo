---
traducao_de: cca933f4b1f4f0b3cb2211c17da9937c78f9366f
---

# ADR 0258 — 在聊天中给出的回答关闭悬而未决的问题

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `gates`
- **引用：** ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md)（扩展第 2、3、6 项；0214 不被编辑）、RN-858、RN-860 和 RN-862，以及实现本决定的 RN-1002（api）和 RN-1003（engine）（AT-741，EP-030，所有者于 2026-11-05 的决定）。

## 背景

在 11月5日的 TP-01（第 24 轮）中，创意代理留下了四个悬而未决的问题。用户在聊天中回答了全部四个，创意代理记录了规则和决定。然而这些问题仍留在队列中，带着“接受建议”按钮：没有产生任何 `open_question.answered`。

ADR 0214 只预见了一种关闭问题的方式：会话作者在队列中点击（`PerguntasEmAbertoUseCase.responder`）。engine 只有打开问题的工具（`declare_open_question`），没有关闭问题的工具，而中心指令也没有说明当回答来自聊天时该怎么做。已回答的问题仍然打开，因 `needs_user_decision` 而搁置的 gate 仍然停着。

## 决定

1. **由代理关闭问题。** 工具 `answer_open_question`（`questionId`，可选的 `resposta`；省略时采用问题本身的建议）交给 ADR 0214 中的四个提问者：创意、PO、架构师和 Dev Lead。他们中任何一个都可以关闭项目中的问题，而不只是提出问题的那个代理。
2. **只在回答明确无歧义时。** `fluxo_do_time` 的中心语句要求只在用户在聊天中的回答**明确无歧义**时关闭；有疑问时问题保持打开，按钮仍然有效。为此，打开的问题（带 `questionId` 和建议）会进入全部四个提问者的回合。
3. **关闭会像点击一样重新启动 gate。** 效果与按钮相同：`decision_record` + `open_question.answered` 这一对，并恢复每个受影响任务被搁置的 gate（RN-860）。
4. **一条与 `responder` 共用核心的内部路由。** engine 以服务令牌调用 `POST /internal/projects/:projectId/open-questions/:questionId/answer`。该路由与人工的 `responder` 共用同一个核心；engine 不写事件。`respondidaPor` 仍是会话作者，代理记在 `viaAgente` 中。已关闭的问题返回 `already_answered`（从不返回 409），使调用具有幂等性。

## 后果

- 在聊天中回答的问题无需用户再做一次操作即离开队列，QA 也会带着该决定重新评判。
- ADR 0214 的第 3 项（“只有会话作者回答”）对点击仍然有效。聊天中的回答出自作者本人，所以决定仍属于作者；代理只是记录它。
- 声明的代价：代理可能把并非无歧义的回答当作无歧义。衡量标准是中心语句，而 `decision_record` 保存了记录下的回答，用户可以核对。
- 不变的部分：工具仍是问题的唯一来源（0214 第 2 项）、`needs_user_decision` 裁决以及 ADR 0207 的搁置机制。

## 考虑过的替代方案

- **只让界面清楚地显示问题仍然打开（方案 b）。** 被所有者否决：用户已经回答，要求再点击等于重复回答。
- **只由提出问题的代理关闭。** 否决：回答可能出现在同一项目另一个提问者的聊天中。
- **不用工具，而从文本中识别回答。** 否决，理由与 0214 相同：基于文字的启发式在两个方向上都会出错。

## 参考

- [0214](0214-pergunta-em-aberto-vira-pendencia.md)、[0207](0207-ciclo-de-gate-velho-estaciona.md)。
- `brabo-api` 的 PR #16（RN-1002）和 `brabo-engine` 的 PR #16（RN-1003）。
