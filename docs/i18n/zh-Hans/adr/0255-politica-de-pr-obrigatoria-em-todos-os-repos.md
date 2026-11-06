---
traducao_de: a766a77602f64b8f373dcf2fcd64c6af12aebc25
---

# ADR 0255 — PR 政策在所有仓库中都是强制的，机器人的重新生成 PR 在 dev 上免除阶梯

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `git`
- **参考：** ADR [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) 和 [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md)，以及活动 AT-726 和 AT-733。均不被编辑。

## 背景

随着拆分为多个仓库（0252），检查 `Política de branches` 和 `Escada de aprovação` 只是发出提示：没有任何 ruleset 要求它们，所以在这两项上为红色的 PR 仍然可以被合并。三个仓库（`brabo`、`brabo-qa`、`brabo-infra`）甚至没有禁止 force push 的 ruleset。而 GitHub App `viralabs-dev-brabo` 按计划打开、用来重新生成生成物的 PR（AT-726）每 6 小时都要等待一次人工批准。所有者 2026-11-05 的决定。

## 决定

1. **`Política de branches` 和 `Escada de aprovação` 是 REQUIRED 检查**，位于 11 个 `viralabs-dev/brabo*` 仓库中 `dev` 和 `main` 的 ruleset 内。
2. **`brabo`、`brabo-qa` 和 `brabo-infra` 获得 ruleset “main 与 dev 禁止 force push”**，其余仓库早已具备。
3. **GitHub App `viralabs-dev-brabo` 在固定分支 `chore/regenera-gerados`、目标为 `dev` 的 PR 免除阶梯**，通过作者且分支（二者同时）识别，沿用 ADR 0236 的模式。`main` 仍保留完整的阶梯。

## 后果

- 未通过政策或阶梯的 PR，在该集合的任何仓库中都不能再被合并。
- 重新生成的生成物无需人工等待就到达 `dev`；`dev` 的其他检查仍然是审查，而晋升到 `main` 仍需批准。
- 仅有作者或仅有分支，都不足以获得免除。
