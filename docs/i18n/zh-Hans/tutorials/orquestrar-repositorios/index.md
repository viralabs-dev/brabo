---
traducao_de: f9981957e3564e59e86f24d25dde64cac77ab183
title: 跨多个仓库编排一个产品
description: 面向打算把产品拆成多个仓库、或已经拆分的人的七页路径。以 Brabo 的 11 个仓库为真实案例，包含地图、消费方式、一次变更的生命周期，以及搭建你自己的清单。
---

# 跨多个仓库编排一个产品

**适合谁：** 打算把产品拆成多个仓库、或已经拆分并感受到代价的人，并且**不了解 Brabo 的历史**。你不需要读过任何 ADR，也不必参与过任何一轮工作：ADR 只会作为"延伸阅读"出现。

**读完之后你可以：**
- 判断自己的产品是否真的该拆分，以及何时不该；
- 画出仓库地图，并在每条边上标明**消费方式**；
- 讲清一次变更从第一个 PR 到安装程序的路径；
- 按正确顺序搭建类似的一组仓库，知道哪些要照搬、哪些要调整。

**阅读时间：** 整条路径约 40 分钟；每页 5 到 8 分钟。

## 我们使用的案例

Brabo 是一个编排工程智能体的平台。它位于 [`viralabs-dev`](https://github.com/viralabs-dev) 组织下的 **11 个公开仓库**中。其中没有哪一个是"那个"产品：产品是整体，而入口是仓库 [`brabo`](https://github.com/viralabs-dev/brabo)。旧的单一仓库只供查阅，不在本路径之内。

## 页面顺序

| # | 页面 | 回答的问题 |
|---|---|---|
| 1 | [为什么拆分，何时不拆](por-que-separar.md) | 值得拆分吗？代价是什么？ |
| 2 | [地图](o-mapa.md) | 谁负责什么，谁依赖谁？ |
| 3 | [每个仓库如何被消费](como-cada-repo-e-consumido.md) | 一个仓库通过什么把东西交给另一个？ |
| 4 | [一次变更的生命周期](vida-de-uma-mudanca.md) | 一行代码如何变成发布？ |
| 5 | [搭建你自己的](monte-o-seu.md) | 按什么顺序复制这套做法？ |
| 6 | [我们犯过的错误](erros-que-ja-cometemos.md) | 我能避免什么？ |

## 如何阅读

- 正在决定是否拆分：读 1 和 6。
- 已经拆分、想理顺：读 2、3 和 4。
- 想直接动手：直接看 5，需要时它会指向其他页面。

每页开头都会说明适合谁，以及读完之后你能做什么。

:::nota[缺少证据的地方]
当路径缺少证据时，它会写 `TODO(humano)`，而不是凭空捏造。
:::

## 各仓库及其 README

[`brabo`](https://github.com/viralabs-dev/brabo#readme)、[`brabo-api`](https://github.com/viralabs-dev/brabo-api#readme)、[`brabo-engine`](https://github.com/viralabs-dev/brabo-engine#readme)、[`brabo-web`](https://github.com/viralabs-dev/brabo-web#readme)、[`brabo-runner`](https://github.com/viralabs-dev/brabo-runner#readme)、[`brabo-broker`](https://github.com/viralabs-dev/brabo-broker#readme)、[`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme)、[`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme)、[`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme)、[`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme) 和 [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme)。
