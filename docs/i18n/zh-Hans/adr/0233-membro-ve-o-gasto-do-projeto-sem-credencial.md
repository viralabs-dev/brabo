---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0233 — 成员按智能体和领域查看项目开销，绝不按 provider

- **状态：** 已接受
- **日期：** 2026-10-31
- **修订：** [ADR 0063](0063-duas-audiencias-para-o-mesmo-gasto.md)（同一笔开销的两类受众），涉及成员只能看到**自己的**消耗这一点；
  [ADR 0076](0076-provider-volta-a-ser-dimensao-de-gasto.md) 仍然完全有效（provider 是 owner 的维度，且按类型不在范围内）
- **先前背景：** [RN-058](../business-rules/api.md#rn-058)、
  [RN-060](../business-rules/api.md#rn-060)、
  [RN-101](../business-rules/api.md#rn-101)、
  [RN-187](../business-rules/api.md#rn-187)

## 背景

所有者的要求（AT-632，31/10）把开销页面分为全局和按项目。ADR 0063 让成员只有 `spend/me`（自己作为 actor 的消耗），尽管按智能体的成本已经在"设置 > 模型"中向 `developer` 显示。所有者的决定是：成员看到项目的总额以及按智能体/领域的成本，不含 provider 和凭据。

## 决定

1. `GET /projects/:projectId/spend/team`（`viewer`）：项目总额，以及按目录中的智能体和领域的成本。范围是项目的范围，不含 actor，但用例只请求维度 `actor`；路由上没有维度参数。provider 和凭据仍然专属于 owner（RN-060、RN-186）。
2. `GET /workspaces/:workspaceId/spend/me`（`viewer`）：**自己的**消耗按项目汇总，供全局页面上的非 owner 使用。范围是 actor 的，因此 `provider` 甚至无法编译（RN-187）。
3. owner 的报告新增 `?projectId=`（其他 workspace 的项目返回 404）和维度 `session`。
4. `models` 上的策展标记 `billing`（`api|subscription|free`）把 `assinaturaMicros` 与实际支付的美元分开。

## 后果

- 成员开始能看到团队（智能体）在项目上花了多少。这是项目的事实，而不是密钥账单；账单仍属于 owner。
- 成员**不会**得到的：provider、凭据、他人的消耗。
- web 中 `CriativoKpis` 的拒绝不再是规则；该界面属于 web lane。
