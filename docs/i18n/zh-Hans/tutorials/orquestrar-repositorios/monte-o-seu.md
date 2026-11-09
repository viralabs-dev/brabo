---
traducao_de: f9981957e3564e59e86f24d25dde64cac77ab183
title: 搭建你自己的
description: 在另一个产品中复制 Brabo 做法的有序清单 - 父目录、带策略的 CI 仓库、契约仓库、编排仓库、带关卡的质量仓库和入口 - 并说明每一步要照搬什么、调整什么。
---

# 搭建你自己的

**适合谁：** 已决定拆分自己产品、想要一条路线的人。

**读完之后你可以：** 按顺序列出你要创建的仓库，并说明每个仓库从 Brabo 照搬什么、调整什么。

:::dica[顺序很重要]
每一步只依赖前面的步骤。一次做一步，**只有该步骤的示例 PR 变绿之后才继续**。
:::

## 0. 先画地图

为**你的**产品写出[第 2 页](o-mapa.md)的角色表，并在每条边上标明消费方式（[第 3 页](como-cada-repo-e-consumido.md)）。如果某个仓库没有清晰的角色，先不要创建它。

## 1. 父目录与"克隆全部"

- **照搬** [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme) 的做法：一个让各克隆并排存放的目录，以及一个克隆全部且从不删除任何东西的 `clonar-tudo.sh`。仓库列表只是一个变量。
- **调整** 组织名称和仓库列表。
- **注意：** 脚本兼容 bash 3.2（macOS）；避免使用关联数组和 `mapfile`。
- **完成标志：** 在干净的机器上运行 `clonar-tudo.sh`，所有克隆都就位。

## 2. 带策略的 CI 仓库

在代码仓库中**先做这一个**，因为其他所有仓库都会调用它。

- **照搬** [`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme)，或者在不 fork 的情况下直接调用它的工作流。[采用指南](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md)能让一个从未见过 Brabo 的仓库做到 `pr-police` 和 `escada` 变绿，示例仓库 `daneiel/brabo-ci-exemplo` 证明了这些步骤。
- **调整：** `ci_ref`（你所选版本的 SHA）、变量 `OWNER_HANDLE`，以及如果想按角色审批，则调整 `community` 模式。
- **不要盲目照搬：** QA 关卡、`dependencias-de-merge`（假定有那 11 个仓库）和 `contracts-alinhado`（假定有 `@viralabs-dev/brabo-*` 软件包）是 Brabo 特有的。
- **完成标志：** 一个示例 PR 显示 `Política de branches` 和 `Escada de aprovação` 均为绿色。

## 3. 契约仓库

- **照搬** [`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme) 的做法：带 GitHub Packages 的 `publishConfig`、`files: ["dist"]`，以及从标签调用 CI 的 `publish-npm.yml` 的 `publish.yml`。
- **调整：** 软件包的作用域及其内容（类型、模式、数据文件）。
- **黄金法则：** 使用方固定**精确版本**，绝不固定分支。
- **完成标志：** 一个测试使用方用 `pnpm add` 按标签安装该软件包。

## 4. 代码仓库

- **照搬** 含八个固定章节的 README 骨架（[`README.modelo.md`](https://github.com/viralabs-dev/brabo-ci/blob/dev/README.modelo.md)）、`pr-police`/`escada`/`tag-release` 的调用以及打标签。
- **调整** 每个仓库发布的内容（镜像、二进制文件、软件包）和测试命令。
- **完成标志：** 每次合并到 `dev`，每个仓库都会发布一个 `-dev.N` 标签。

## 5. 编排仓库

- **照搬** [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme) 的思路：compose、开发脚本和克隆兄弟仓库的 action。
- **调整** compose 服务和 action 中的仓库列表。
- **完成标志：** `docker compose up` 用已发布的镜像把整套系统拉起来。

## 6. 带关卡的质量仓库

- **照搬** [`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme) 的做法：**按 digest** 运行的 E2E、仅在干净检出之后才创建 App 令牌的作业，以及功能目录。
- **调整** 目录和各仓库的路径，并为**你的**产品编写规格。
- **要求** 关卡检查出现在 `main` 的 ruleset 中，且只在那里。
- **完成标志：** 如果 E2E 失败，到 `main` 的 PR 会变红。

## 7. 入口

- **照搬** [`brabo`](https://github.com/viralabs-dev/brabo#readme) 的结构：`repos.yml`（地图的单一来源）、`componentes.json`（固定版本）、`irmaos.lock` 和 `install.sh`。
- **调整** 仓库列表和构成**你的**产品的组件。
- **最后再开启** 产品发布：它依赖每个组件的 Release 都已存在。
- **完成标志：** 安装程序校验已签名的 `checksums.txt`，并在干净的机器上安装整套系统。

## 搭好之后

:::passos
1. 从 `repos.yml` 生成每个 README 的 "Onde se encaixa" 区块。
2. 开启合并顺序和固定版本的检查。
3. 在认为一切顺利之前先读[我们犯过的错误](erros-que-ja-cometemos.md)。
:::

> **TODO(humano)：** 这条路径尚未经过项目之外的人验证。约定的验证方式是：SmartSky 团队的某个人只读这条路径，就画出地图并讲出一次变更到发布的路径；结果和任何分歧都需要记录在这里。
