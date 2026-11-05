---
traducao_de: 43cc8a02d2589da10f56a0d230a89967700d3a9b
---

# ADR 0235 — `qa` 暂时退役，仓库的流水线变为 `dev → main`

- **状态：** 已接受
- **日期：** 2026-11-02
- **修订：** [ADR 0030](0030-politica-de-branches-mecanizada.md) 的阶梯与晋升流程（由 `dev → qa → main`
  变为 `dev → main`）
- **撤销：** [ADR 0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) 的机制
  （自动晋升到 `qa`，没有 `qa` 就没有目的地）
- **先前背景：** [ADR 0034](0034-documentacao-publicada-por-degrau.md)、
  [ADR 0071](0071-publicacao-simetrica-por-degrau.md) 和
  [ADR 0073](0073-o-caminho-publicado-nomeia-o-ambiente.md)（每个阶梯一个站点：阶梯少了一个）

## 背景

2026 年 11 月 2 日，所有者决定："暂时退役 `qa`，只保留 `dev` 和 `main`"。只有一位维护者时，验收阶梯重复了 `dev` 的验证，每个周期还要多花一次完整的晋升。"暂时"意味着回来的成本必须很低。

## 决定

1. **范围：仅 Brabo 的仓库。** 产品在用户项目中创建的 Gitflow（bootstrap，RN-582/RN-664）**不**改变，`qa` 仍留在产品的 `PROTECTED_BRANCHES` 中，沿用 `rc` 的模式（ADR 0030）：取消保护一个存在的分支代价很高。
2. 流水线变为 `dev → main`；反向回合是 `main → dev`。`qa`
   从 `ESCADA`、`ESTAGIO_POR_BRANCH`、审批阶梯和 gate 的顺序中移除。`qa` 留在 `NUNCA_ARQUIVAR`：它的去向由人来决定。
3. **版本锚点。** `main` 的最终 tag 锚定在该周期的 `-dev.N` 上（merge 的第二个父提交被标记，且树相同）。历史上的 `-qa.N` tag 仍可读取。
4. **`qa` 被归档**到 `refs/archive/qa`（AT-557 的机制），由人手动完成，且只能在此变更已进入 `dev` 之后（`backmerge-gate` 会获取 `refs/heads/qa`）。
5. 站点失去 `/brabo/qa/` 阶梯；变更后的第一次 publish 会自动将其移除（`keep_files: false`）。ADR 0073 仍然有效。

## 回退方案

回滚该轮的 PR（把 `qa` 还给 `ESCADA`、workflows 和站点），恢复分支（`git push origin refs/archive/qa:refs/heads/qa`），晋升 `dev → qa`，然后才重新开启 `qa → main`。

## 后果

- 没有新的 RN：这是仓库的 CI 政策，而不是产品规则。
- 没有绝对上限改变。
- 变更之前，`dev → main` 会被拒绝（`PROMOCAO-NAO-ADJACENTE`），强行执行则会被归类为 hotfix（PATCH）；新的锚点封闭了这种情况。
