---
traducao_de: cca933f4b1f4f0b3cb2211c17da9937c78f9366f
---

# ADR 0259 — 被其他模块依赖的模块在执行计划中必须有负责人

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `time`
- **引用：** ADR [0194](0194-aprovar-o-plano-ativa-a-execucao.md)（仅针对基础任务修订 RN-678“由 PO 创建任务”；0194 不被编辑）、ADR [0053](0053-dev-lead-e-paralelismo-autorizado.md)，以及实现本决定的 RN-1004、RN-1005 和 RN-1006（AT-742，EP-030，所有者于 2026-11-05 的决定）。

## 背景

在 11月5日的 TP-01（第 24 轮）中，Dev Lead 的计划把 `persistencia` 和 `api-http` 标为“无任务、无代理”。日程和预订任务因缺少 `api-http` 的契约而阻塞，`deploy` 任务在计划之后 13 到 16 秒阻塞。上一轮也是同样的模式：没有负责人的模块是**基础**（`dependsOn` 为空）和 HTTP 层。

四个原因叠加在一起：

- PO 在 `module_map` 存在**之前**就创建任务，基础模块不会成为故事；
- Dev Lead 不能创建任务（RN-678），kickoff 也不向其展示各模块的 `dependsOn`；
- api 只**统计**计划中的 `modulosSemTarefa`，并不拒绝；
- `claimNext` 分发任务时不看 `dependsOn`，因此开发者在依赖存在之前就开始了。

## 决定

1. **由 Dev Lead 创建基础任务。** 其获得 `create_task`，仅限于 `module_ids` 包含该模块的故事；kickoff 和 `module_map_vigente` 现在会显示每个模块的 `dependsOn` 以及基础规则（RN-1006）。除此之外，任务仍由 PO 创建（RN-678）。
2. **api 拒绝让被其他模块依赖的模块没有负责人的计划。** `lerPlanoDeExecucao` 返回 400，并指明这一对模块（没有任务的模块和依赖它的模块）。**没有**任何模块依赖的无任务模块仍可通过，只被计数（RN-1004）。
3. **claim 等待直接依赖。** 只要某模块的**直接** `dependsOn` 中有任何模块还有未完成的任务，`claimNext` 就不分发该模块的任务。不考虑传递依赖：它已经卡住了中间的模块（RN-1005）。

## 后果

- 声明的代价：**并行度降低。** 依赖模块的开发者等待基础完成，而不是一起开始然后因缺少契约而阻塞。在典型的 TP-01 计划中，HTTP 层和领域模块现在要等待持久化层。
- 过去带着缺口被批准的计划，现在会连同指明的模块对一起退回给 Dev Lead，由其创建缺失的任务来修正。
- Dev Lead 的 kickoff 会因每个模块的 `dependsOn` 而变长。
- 不变的部分：批准计划仍会激活执行（ADR 0194），任务的模块仍由 Dev Lead 指派，且只有该模块的开发者会领取它。

## 考虑过的替代方案

- **由 PO 创建基础任务。** 否决：PO 在 `module_map` 之前工作，而了解模块及其依赖的是 Dev Lead。
- **拒绝所有含无任务模块的计划。** 被所有者否决：没有任何模块依赖的模块可以稍后再做，不会耽误任何人。
- **claim 遵循传递的 `dependsOn`。** 否决：直接依赖已经足够，因为每一环都会卡住下一环，传递依赖只会增加读取成本。

## 参考

- [0194](0194-aprovar-o-plano-ativa-a-execucao.md)、[0053](0053-dev-lead-e-paralelismo-autorizado.md)、[0086](0086-dev-lead-plano-suspende-para-aprovacao.md)。
