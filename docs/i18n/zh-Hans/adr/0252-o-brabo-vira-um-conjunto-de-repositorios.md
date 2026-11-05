---
traducao_de: 58f20f24eac7374db995438e278dbf37663f42f5
---

# ADR 0252 — Brabo 变成 `viralabs-dev` 中的一组仓库

- **状态：** 已接受
- **日期：** 2026-11-04
- **引用：** ADR [0030](0030-politica-de-branches-mecanizada.md)、[0117](0117-lockfile-proprio-para-o-website.md)、[0119](0119-imagens-publicadas-no-ghcr-por-digest.md)、[0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md)、[0130](0130-broker-de-container.md)、[0149](0149-assinatura-dos-artefatos-publicados.md)、[0162](0162-broker-publicado-e-oferecido-pelo-instalador.md)、[0202](0202-o-indice-de-adr-por-tema.md) 和 [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md)。均不被编辑：每一个对继承其主题的仓库仍然有效，文件路径会变，但决定不变。

## 背景

monorepo 把 api、engine、web、runner、broker、基础设施、文档和 E2E 放在同一个历史里，只有一个版本和一条流水线。所有者在 2026 年 11 月 2 日（EP-033，AT-688）决定将其拆分为 `viralabs-dev` 组织下的多个仓库。调研记录在 vault 的 AT-688 笔记中；本 ADR 记录决定和地图。**状态：已决定，迁移中（波次 A）。目前尚未拆分任何内容。**

## 决定

1. **新仓库，全部公开，带前缀 `brabo-`：** `brabo-api`、`brabo-engine`、`brabo-web`、`brabo-runner`、`brabo-broker`、`brabo-contracts`、`brabo-ci`、`brabo-infra`、`brabo-qa` 和 `brabo-workspace`。没有一个复用 `infra-viralabs`。
2. **每个仓库包含什么：**
   - `brabo-api`：`apps/api`、`gates.yml`、`openapi.json`；`brabo-engine`：`apps/engine`、`prompts/`、golden-set 的 fixtures；`brabo-web`：`apps/web`、`design/`；`brabo-runner`：`apps/runner` 以及二进制文件的构建与发布；`brabo-broker`：`apps/broker`。
   - `brabo-contracts`：`packages/shared`、`packages/docker-port`、`agent-areas` 的来源和 `fluxo.yml`，作为依赖通过 git TAG 被使用。
   - `brabo-ci`：PR 与分支政策、阶梯、归档、Dependabot 和社区模板，以可复用 workflow（`workflow_call`）的形式提供。
   - `brabo-infra`：compose、`deploy/k8s`、`Makefile`、`scripts/dev`、备份以及本地克隆的编排器。
   - `brabo-qa`：`e2e/`、golden-set、`scripts/jev`、`scripts/idioma` 以及 TP-01 的脚本。
   - `brabo-workspace`：父文件夹，含 `CLAUDE.md`、克隆脚本和快捷方式。
3. **入口：`viralabs-dev/brabo`**（已经存在的空仓库，改为公开）。它包含全部文档（站点和 README）、`install.sh`、产品的 RELEASE 和产品的 CHANGELOG。站点位于 `viralabs-dev.github.io/brabo`。安装者只需要知道这个仓库。
4. **每个仓库有自己的文档，并在代码的同一个 PR 中要求更新：** `docs/` 和 RN 位于拥有该代码的仓库，每个仓库的 `docs:check` 检查自己的文档，`brabo` 只负责汇总各文件夹并发布站点。
5. **版本：** 每个仓库有自己的版本，产品的版本在 `brabo` 中。全部从 **1.0.0** 重新开始。
6. **历史：** **带**历史提取（`git filter-repo`）；`#NNN` 变为 `daneiel/brabo#NNN`。
7. **遗留：** `daneiel/brabo` 被**转移**到组织下，名为 `viralabs-dev/brabo-legacy`；在本地，旧的检出移至 `~/dev/brabo/brabo-old`。
8. **机器人：** 立即采用组织的 GitHub App，取代个人 token（所有者在 AT-689 的手势）。
9. **AT-662**（不使用 Docusaurus 的站点）在拆分**之前**进行。
10. **波次顺序：** A（ADR 和上下文、固定在代码之外的所有者、隔离的契约、AT-662）→ B（每个领域内的文档、`brabo-contracts`、`brabo-ci`）→ C（api、engine、web、runner、broker、workspace）→ D（infra、`brabo`、qa、每个仓库的 CLAUDE.md、vault）→ E（协调发布 1.0.0、转移遗留仓库、本地安装）→ F（本地文件夹迁移，独立进行）。

## 什么不变

产品的行为、业务规则和绝对上限（RN-418、受保护分支的手动 merge、`decide.ts`）都不变。规则"不手工版本化"按仓库适用。`dev → main` 流水线（ADR 0235）按仓库适用。

## 后果

- `CLAUDE.md` 中的文档规则在迁移中性质会改变：docmap 不再在仓库之间的同一个 PR 中检查，计数和锚定的句子读取重建后的布局。每一波调整它所触及的部分。
- 供应链（GHCR 命名空间、cosign 身份、`images.json`）随发布仓库一起更换所有者。
- `CLAUDE.md` 和记忆将按仓库拆分（AT-708）；在此之前，仍以根目录的为准。
