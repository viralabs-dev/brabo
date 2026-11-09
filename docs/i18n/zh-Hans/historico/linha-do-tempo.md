---
id: linha-do-tempo
title: Brabo 时间线
sidebar_label: 时间线
description: Brabo 的重大转折，从第一个阶段到拆分为多个仓库，五分钟读完，每一项都附有证据链接。
keywords: [历史, 阶段, 时间线, 里程碑]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Brabo 时间线

五分钟阅读。每个里程碑都说明改变了什么、为什么重要、证据在哪里。完整记录仍然完整保存在[阶段历史](../explanation/historico-de-fases.md)中；这里只保留转折点。

:::historico 2026-11-08
这条时间线描述的是截至上述日期的历程。今天有效的内容位于业务规则和 ADR 中，而不在这里。
:::

## 奠基（2026 年 8 月）

**第 1 至 5 阶段。** IAM、带不可变事件日志的会话、带 LLM 路由器的聊天、git provider、智能体和 PR gate 相继诞生。第 5 阶段把一切带到了生产镜像和 Kubernetes。它之所以重要，是因为它至今仍定义着产品的形态。证据：[ADR 0020](../adr/0020-destravar-gates-qa-secops.md)、[ADR 0024](../adr/0024-fase5-imagens-producao-ci.md)。

**第 6 至 9 阶段。** 分支策略变成了代码，Keycloak 退场、认证改为自有实现，智能体获得了按区域划分的层级，模型目录有了可审计的价格。它之所以重要，是因为它把规则从人的记忆中拿了出来。证据：[ADR 0030](../adr/0030-politica-de-branches-mecanizada.md)、[ADR 0032](../adr/0032-corte-do-keycloak-e-sessao-em-cookie.md)、[ADR 0038](../adr/0038-hierarquia-de-agentes.md)。

**第 10 至 12 阶段。** Brabo 第一次构建了自己的一部分（dogfooding），并发现了 17 个缺陷。第 12 阶段关闭了最严重的三个，并在一次运行中证明了这一点。它之所以重要，是因为它用度量取代了“能用”的印象。证据：[第一次 dogfooding](../explanation/primeiro-dogfooding.md)、[ADR 0047](../adr/0047-operabilidade-pos-dogfooding.md)。

**第 13 阶段。** 第一次使用 API 模型和真实 GitHub 运行：便宜的那一半通过了，昂贵的那一半以任何测试都没有显示过的方式失败了。它之所以重要，是因为它变成了教训：“所有指标都来自脚本，绝不来自笔记”。证据：[真实验证](../explanation/validacao-real.md)、[已分诊的 backlog](../explanation/backlog.md)。

**第 14 和 15 阶段。** 第 14 阶段修复了真实运行所要求的东西（回合失败变成了持久事件）。第 15 阶段把 gate 变成了声明式数据，放在 `gates.yml` 中。它之所以重要，是因为 gate 的外部契约变得稳定。证据：[历史第 1 部分](../explanation/historico-de-fases-parte-1.md)、[Gates](../explanation/gates.md)。

**第 15 阶段之后（v2.5）。** 由使用而不是脚本发现的修复：429 错误时的白屏，以及每个界面的加载、错误和空状态。它之所以重要，是因为“三种状态”规则变成了通用规则。证据：[历史第 1 部分](../explanation/historico-de-fases-parte-1.md)。

## 使用开始主导（2026 年 8 月和 9 月）

**16 至 26 计划。** 十一个源自第一次真实浏览的请求：采用了设计 handoff，容器改为按项目划分，花费有了两类受众。它之所以重要，是因为安全边界不再是策略，而变成了隔离。证据：[ADR 0065](../adr/0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md)、[历史第 2 部分](../explanation/historico-de-fases-parte-2.md)。

**exp003 和 exp001 轮次。** 现场测试会话修复了任何测试套件都没抓到的问题，例如承诺会修复却没有修复的 Criativo。它之所以重要，是因为最大的缺陷对任何测试套件都不可见，只有真实使用才暴露出来。证据：[历史第 2 部分](../explanation/historico-de-fases-parte-2.md)。

**28 计划。** 浅色主题变得可以访问，容器生命周期变成了表，Chat RAG 获得了流水线和独立标签页，社交登录被放开。它之所以重要，是因为它补上了此前阶段中声明的砍掉的部分。证据：[ADR 0081](../adr/0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md)、[历史第 3 部分](../explanation/historico-de-fases-parte-3.md)。

**流程与代码的审计。** 一次只读审查把 `fluxo.yml` 与代码做了交叉比对。Dev Lead 的计划开始要求真正的批准，团队的新智能体分批加入。它之所以重要，是因为目标模型不再只是愿望。证据：[审计](../explanation/auditoria-fluxo-vs-codigo.md)、[ADR 0085](../adr/0085-fluxo-como-registro-declarativo.md)、[ADR 0086](../adr/0086-dev-lead-plano-suspende-para-aprovacao.md)。

## 从服务器到用户的机器（2026 年 8 月至 9 月）

**本地 runner（8 月 20 日）。** 智能体开始在用户的机器上、在用户自己的文件夹里、用真正的终端运行。它之所以重要，是因为它在负责人明确决定之下，改变了关于 `git push` 和 `sudo` 的全局策略。证据：[ADR 0102](../adr/0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md)、[ADR 0103](../adr/0103-runner-local-execucao-na-maquina-do-usuario.md)。

**第 28 阶段，用户的文件夹。** `mounted` 模式和 runner 获得了在 bootstrap 时经同意的基础目录，以及一个声明自身能力的本地智能体。它之所以重要，是因为打开编辑器就能在自己的文件夹里看到工作，是此前缺失的最低要求。证据：[第 28 阶段](../explanation/fase-28-pasta-do-usuario.md)、[ADR 0146](../adr/0146-base-consentida-no-bootstrap.md)、[ADR 0147](../adr/0147-agente-local-com-capacidades.md)。

**第 29 阶段，一行安装。** 发布的产物开始签名，`install.sh` 会验证自己的来源。它之所以重要，是因为第 28 阶段在没有签名之前拒绝了安装器。证据：[第 29 阶段](../explanation/fase-29-instalacao-de-uma-linha.md)、[ADR 0149](../adr/0149-assinatura-dos-artefatos-publicados.md)、[ADR 0150](../adr/0150-instalador-de-uma-linha.md)。

**第 30 阶段，每台机器一个 runner。** runner 获得了设备密钥，第一个账户开始在终端中诞生。它之所以重要，是因为安装和使用合成了一行。证据：[第 30 阶段](../explanation/fase-30-runner-por-maquina.md)、[ADR 0154](../adr/0154-chave-de-dispositivo-de-maquina.md)、[ADR 0155](../adr/0155-a-primeira-conta-nasce-no-terminal.md)。

## 产品变成一组仓库（2026 年 11 月）

**拆分为 11 个仓库（11 月 4 日）。** 单体仓库让位于每个区域一个仓库，彼此之间通过 tag 约定契约，所有仓库的 PR 策略一致。它之所以重要，是因为每个区域都有了自己的负责人、文档和流水线。证据：[ADR 0252](../adr/0252-o-brabo-vira-um-conjunto-de-repositorios.md)。

## 其余内容在哪里

- 沿途的度量：[Jev 路由器](../explanation/medicao-do-jev.md)、[语言启发式](../explanation/medicao-do-idioma.md)、[第 29 轮的视觉审计](../explanation/auditoria-visual-rodada-29.md)。
- 真实运行的发现：[真实运行的发现](../explanation/achados-execucao-real.md)、[hello world](../explanation/execucao-real-hello-world.md)、[第 12 阶段验证](../explanation/validacao-fase-12.md)。
- 各阶段全文：[阶段历史](../explanation/historico-de-fases.md)，分为四部分。
