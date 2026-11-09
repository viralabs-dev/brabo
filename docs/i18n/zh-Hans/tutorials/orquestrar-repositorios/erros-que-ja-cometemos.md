---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: 我们犯过的错误
description: 九条简短的教训，每条都包含现象、原因和留下的规则，取自 Brabo 的各仓库和公开的 ADR。
---

# 我们犯过的错误

**适合谁：** 想避开代价最高那条路的人。

**读完之后你可以：** 在掉进去之前认出一组仓库的九个陷阱。每条教训自成一体，并指向公开来源。

## 1. 手工复制仓库列表
- **现象：** "Repositórios do Brabo" 这一节出现在 14 个地方，有 11 个不同版本。`brabo-ci` 的 README 说它不依赖任何仓库，但它其实读取另外两个仓库的数据。
- **原因：** 没有单一来源，也没有校验的复制。
- **留下的规则：** 一个来源（`repos.yml`），其余都是生成的，由检查拒绝不一致。[ADR 0281](../../adr/0281-o-mapa-dos-repos-tem-uma-fonte-so.md)。

## 2. 读取兄弟仓库"此刻"的 `dev`
- **现象：** 同一个 PR 在没有新提交的情况下由绿变红。兄弟仓库的 `dev` 每天约有 56 次合并。
- **原因：** 文档生成器在运行时当场克隆每个兄弟仓库 `dev` 的最新提交。
- **留下的规则：** 通过只有机器人才会更新的 SHA 锁来读取兄弟仓库。[ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md)。

## 3. 度量所有人的翻译
- **现象：** 两周内 28 个红色 PR 中有 19 个与它们所改动的内容无关。
- **原因：** 翻译对等性汇总了所有仓库的文档，因此别人的一次合并就改变了总数。
- **留下的规则：** 每个仓库只度量自己的文档。[ADR 0273](../../adr/0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md)。

## 4. 把合并顺序留在某个人的脑子里
- **现象：** infra 的 `dev` 在两个不同仓库的合并之间变红。
- **原因：** GitHub 没有仓库之间的依赖，而顺序没有写在任何地方。
- **留下的规则：** PR 声明 `Depende-de: 所有者/仓库#N`，由检查等待；推进时，顺序由层级推断。[ADR 0276](../../adr/0276-a-pr-declara-de-que-pr-depende-o-merge.md) 和 [ADR 0284](../../adr/0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md)。

## 5. 版本不可读的策略固定
- **现象：** 11 个仓库中有 5 个不同的 SHA，固定版本在没有任何提示的情况下被冻结。
- **原因：** 固定版本的注释写的是 `# dev` 或什么都没有，而 Dependabot 只更新注释为版本号的固定项。
- **留下的规则：** 注释为 `vX.Y.Z`，SHA 为该标签的 SHA，由检查校验。[ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md)。

## 6. 用 `GITHUB_TOKEN` 推送标签或开 PR
- **现象：** 推进 PR 在推进检查没有运行的情况下就变成"可合并"，标签也从未发布 Release。
- **原因：** GitHub 不会由 `GITHUB_TOKEN` 创建的事件触发工作流。
- **留下的规则：** 需要触发其他工作流的操作使用 GitHub App 的令牌。[CI 教训第 3 条](../../explanation/licoes-do-ci.md)。

## 7. 在必需的作业上加 `if:`
- **现象：** PR 的基础分支改变后，检查仍然是绿色。
- **原因：** 状态按提交和名称索引；被跳过的作业会让旧的绿色一直粘在上面，而 `skipped` 算作绿色。
- **留下的规则：** 必需的作业始终运行，过滤放在作业内部。[CI 教训第 2 条](../../explanation/licoes-do-ci.md)。

## 8. 产品固定版本落后于最新 Release
- **现象：** 产品连续两次（v2.1.0 和 v2.1.1）只有标签而没有 Release。
- **原因：** 某个组件在合并到 `main` 与打标签之间发布了 Release，锁因此拒绝。
- **留下的规则：** 由机器人升级固定版本，解决办法是合并它的 PR，并让产品发布一个补丁。[产品发布](../../explanation/release-do-produto.md)。

## 9. 升级契约时重写了整个 lock 文件
- **现象：** 契约版本升级后，`brabo-broker` 的 CI 坏了。
- **原因：** `pnpm install` 重新生成了整个 lock 文件，而不只是契约的条目。
- **留下的规则：** 升级脚本只把契约的块嫁接到旧的 lock 文件上，并拒绝其余改动。[`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh)。

> **对你的项目：** 九条教训的规律是一样的。凡是没有由机器生成或检查的，都会漂移。拆分之前，先决定由哪项检查来看管每一条边。

回到[路径开头](index.md)。
