---
traducao_de: ee557cab443ad894afe190e808b0ee99fab50a29
---

# ADR 0236 — Dependabot 在 `dev` 上免于审查，其他检查全绿即可合并

- **状态：** 已接受
- **日期：** 2026-11-02
- **修订：** [ADR 0030](0030-politica-de-branches-mecanizada.md) 的审批阶梯
  （`solo` 模式："第三方的 PR 需要 owner 的 1 个批准"），仅针对
  Dependabot，且仅在 `dev` 阶梯
- **先前背景：** [ADR 0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md)
  （流水线是 `dev → main`）

## 背景

检查 `Escada de aprovação` 把 `dependabot[bot]` 视为第三方：在 `solo` 模式下，即使所有其他检查都是绿色的，它的 PR 也要等待 owner 的批准。2026 年 11 月 2 日，#1201 仅因此而变红，所有者要求："让 Dependabot 不依赖我的批准：如果通过了其他所有 CI/CD，就可以合并"。

## 决定

1. **面向 `dev` 的 Dependabot PR 无需审查即可通过阶梯**，两种模式（`solo` 和 `community`）均如此。由其他检查承担审查的作用：测试、构建、drift、`pr-police` 以及两个 digest 规则。
2. **Dependabot 通过作者**和**分支**两者来识别，与 `pr-police` 使用**同一**标准：`ehBranchDoDependabot` 要求分支为 `dependabot/…` 且登录名为该机器人，不带后缀的 `dependabot` 只有在 `user.type == Bot` 时才有效。人类把分支命名为 `dependabot/` 仍然需要批准。
3. **仅限 `dev`。** 对 `main`，阶梯仍然完整。Dependabot 本来就经 `dev` 进入（`target-branch: dev` 和 `dependabot-para-dev.yml`），并像其他一切一样通过晋升到达 `main`。
4. **不会自动 merge。** "可合并"的意思是没有任何检查要求多做一个手势。合并到受保护分支仍是手动行为（`dev` 的 merge 由主持该轮的人完成；`main` 的由所有者完成）。

## 后果

- Dependabot 的更新在其 CI 绿色完成后即可合并，不必等 owner 打开 PR 去批准。
- 恶意或损坏的更新在没有人眼的情况下通过的风险，由 CI 以及向 `main` 的晋升（仍保留完整阶梯）覆盖。该 PR 仍然可见，可在 merge 之前关闭。
- 实现：`scripts/ci/approval-ladder.ts`
  （`DESTINO_SEM_REVISAO_PARA_O_DEPENDABOT`、`dispensadoPorDependabot`）以及
  `.github/workflows/approval-ladder.yml` 中的 `PR_AUTOR_TIPO`，在
  `scripts/ci/approval-ladder.spec.ts` 中得到证明。
