---
id: adr-index
title: 架构决策（ADR）
sidebar_label: ADR 索引
sidebar_position: 0
description: Brabo 的 282 条架构决策记录，按主题分组，并附上每条决策的内容。
keywords: [ADR, 架构决策, 架构, 历史]
traducao_de: d7d790431657e61a049b452214cfd432da2199df
---

# 架构决策

ADR 记录的是某件事在被决定的那一刻**为什么**这样决定。
它们是**不可变的**：任何 ADR 在被接受之后都不再编辑。当一项
决策改变时，会产生一份新的 ADR 来取代旧的——这正是
[0018](0018-noop-dev-agent-modo-de-execucao.md) 的情况，它记录了对
[0011](0011-infra-dev-agents-worktrees-merge-lock.md) 中所决定的 NoopDevAgent 的取代。

实际后果：**一份 ADR 可能描述的是一个已不再是当前的状态。**
要了解当前状态，请看[业务规则](../business-rules.md)、
[架构](../architecture.md)和[运维手册](../runbook.md)。要了解
推理过程，请来这里。

下面的表格是**生成的**（`pnpm docs:generate`，[ADR 0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md)）：每份 ADR 的编号、标题和状态，归在唯一一个主题之下。可使用按主题和状态的过滤器，或站点搜索。每项决策的完整文本在 ADR 本身中。

状态来自 ADR 的 `## Status` 一节；没有该节则视为**已接受**。主题存放在 `docs/adr/temas.yml` 中，与本页并列，而不放在 ADR 里，因为已接受的 ADR 永远不会被编辑（[ADR 0202](0202-o-indice-de-adr-por-tema.md)）；`pnpm docs:check` 会拒绝没有主题的 ADR。

<!-- BEGIN:GENERATED:indice-de-adr -->
**主题:** [Git、仓库与分支策略](#tema-git) · [智能体的 harness、回合与会话](#tema-agentes) · [智能体团队——角色、领域与 handoffs](#tema-time) · [Gates、QA 与安全审查](#tema-gates) · [执行、终端策略与审批](#tema-execucao) · [代码住在哪里——执行模式](#tema-modos) · [项目容器与 broker](#tema-container) · [本地 runner](#tema-runner) · [认证、访问与秘密](#tema-iam) · [LLM providers、模型与开销](#tema-llm) · [RAG、知识图谱与工件](#tema-conhecimento) · [Web 界面与设计系统](#tema-web) · [运维、部署与安装](#tema-operacao) · [CI、发布与供应链](#tema-engenharia) · [文档](#tema-docs)

<div class="adr-filtro" data-adr-filtro hidden><label>主题 <select data-adr-tema><option value="">全部</option><option value="tema-git">Git、仓库与分支策略</option><option value="tema-agentes">智能体的 harness、回合与会话</option><option value="tema-time">智能体团队——角色、领域与 handoffs</option><option value="tema-gates">Gates、QA 与安全审查</option><option value="tema-execucao">执行、终端策略与审批</option><option value="tema-modos">代码住在哪里——执行模式</option><option value="tema-container">项目容器与 broker</option><option value="tema-runner">本地 runner</option><option value="tema-iam">认证、访问与秘密</option><option value="tema-llm">LLM providers、模型与开销</option><option value="tema-conhecimento">RAG、知识图谱与工件</option><option value="tema-web">Web 界面与设计系统</option><option value="tema-operacao">运维、部署与安装</option><option value="tema-engenharia">CI、发布与供应链</option><option value="tema-docs">文档</option></select></label> <label>状态 <select data-adr-status><option value="">全部</option><option value="已接受">已接受</option><option value="已提议">已提议</option></select></label></div>

## Git、仓库与分支策略 {#tema-git}

git provider 的契约、仓库的创建与采纳、分支的保护与策略。

| # | 决定 | 状态 |
|---|---|---|
| [0001](0001-git-provider-contract-shape.md) | GitProvider 规范化契约的形态 | 已接受 |
| [0002](0002-git-error-normalization.md) | GitProvider 错误的规范化 | 已接受 |
| [0003](0003-git-provider-retry-policy.md) | 远程 provider 的重试策略 | 已接受 |
| [0004](0004-git-credential-registration.md) | 用户 git 凭据的登记 | 已接受 |
| [0005](0005-repo-bootstrap-idempotent-steps.md) | 幂等且可恢复的 Gitflow bootstrap | 已接受 |
| [0028](0028-protecao-de-branch-divergencia-entre-providers.md) | 分支保护：provider 之间的分歧与审批矩阵 | 已接受 |
| [0030](0030-politica-de-branches-mecanizada.md) | 机制化的分支策略 | 已接受 |
| [0044](0044-adocao-de-repositorio-existente.md) | 采纳现有仓库，以及作为关口的计划 | 已接受 |
| [0056](0056-o-engine-trabalha-em-repositorio-remoto.md) | engine 在远程仓库上工作 | 已接受 |
| [0139](0139-o-alarme-de-esteira-ganha-destinatario.md) | 流水线合并的告警获得接收方，以及 `dev` 的规则 | 已接受 |
| [0165](0165-o-repositorio-nasce-no-handoff-ao-arquiteto.md) | 仓库在接受给 Arquiteto 的 handoff 时诞生，没有它执行就不会开始 | 已接受 |
| [0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) | QA 处于测试阶段时，`dev` → `qa` 自动晋升 | 已接受 |
| [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md) | `qa` 暂时退役，仓库的流水线变为 `dev → main` | 已接受 |
| [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) | Dependabot 在 `dev` 上免于审查，其他检查全绿即可合并 | 已接受 |
| [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) | PR 政策在所有仓库中都是强制的，机器人的重新生成 PR 在 dev 上免除阶梯 | 已接受 |
| [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md) | O projeto do usuário trabalha em trunk, e a pasta acompanha a main | 已接受 |
| [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) | O E2E do brabo-qa é portão da main, com aceite justificado | 已接受 |
| [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) | A PR declara de que PR de outro repo depende, e um check do App espera o merge | 已接受 |
| [0284](0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) | A promoção infere as dependências pela ordem dos repos | 已接受 |

## 智能体的 harness、回合与会话 {#tema-agentes}

一个智能体如何运行——上下文、工具循环、对话回合、会话及其状态。

| # | 决定 | 状态 |
|---|---|---|
| [0006](0006-prompt-assembler-context-harness.md) | agent 的 harness：确定性的上下文组装 | 已接受 |
| [0007](0007-toolloop-tools-context-manager.md) | ToolLoop、工具、ContextManager（带 LLM 的 harness） | 已接受 |
| [0061](0061-tipo-da-sessao-na-criacao.md) | 会话的类型是创建时的数据，而执行仍然是事件 | 已接受 |
| [0098](0098-limites-de-transporte-e-janela-efetiva-de-compactacao.md) | 一致的传输限制与有效的压缩窗口 | 已接受 |
| [0163](0163-o-clique-responde-ao-aceitar.md) | 点击在**接受**命令时响应，轮次经由通道继续 | 已接受 |
| [0175](0175-infra-lead-conversa-pelo-composer.md) | Infra Lead 通过 composer 对话，在此之前它的回合先经过 `TurnoAssincrono` | 已接受 |
| [0177](0177-idioma-das-respostas-por-conta-sessao-e-projeto.md) | 回答的语言存放在三个地方——账户、会话和项目——采用开放的 BCP-47 列表，绝不放在 `users.locale` 中 | 已接受 |
| [0179](0179-o-laco-pergunta-ao-jev-qual-ferramenta.md) | 循环向 Jev 询问用哪个工具，用户的模型只看到剩下的菜单 | 已接受 |
| [0183](0183-reabrir-sessao-encerrada.md) | 已结束的会话可以重新打开：终止状态的专属出口，通向 `active`，带新事件 | 已接受 |
| [0184](0184-reabrir-sessao-decisoes-do-dono.md) | 重新打开会话：所有者的三个决定，`developer` 即可重新打开 | 已接受 |
| [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md) | 在轮次进行中到达的消息进入持久化队列，并在轮次结束时被读取 | 已接受 |
| [0226](0226-diario-vivo-e-retomada-dos-agentes.md) | 活的日志与智能体恢复：被中断的回合凭计划恢复一次 | 已接受 |
| [0246](0246-anexos-do-chat-bytes-no-postgres-referencia-no-evento.md) | 聊天附件：字节存于 Postgres，事件中存引用，视觉能力由 capability 决定 | 已接受 |
| [0247](0247-uma-mensagem-varios-destinatarios.md) | 一条消息，多个收件人 | 已接受 |
| [0249](0249-o-raciocinio-do-agente-e-gravado-e-mostrado-so-a-developer.md) | 智能体的推理被记录，且仅向 developer 及以上显示 | 已接受 |
| [0283](0283-a-adr-proposta-declara-qual-substitui.md) | A ADR proposta declara qual ADR substitui (`supersedes`) | 已接受 |

## 智能体团队——角色、领域与 handoffs {#tema-time}

有哪些智能体，每个向谁交付什么，领域内部的委派，以及它们之间的 handoff。

| # | 决定 | 状态 |
|---|---|---|
| [0008](0008-agente-criativo-conversacional-handoffs.md) | harness 中的对话式 Criativo agent + handoff 的基础 | 已接受 |
| [0009](0009-agente-po-backlog-rastreabilidade.md) | PO agent、backlog（epics/stories/tasks）与可追溯性 | 已接受 |
| [0010](0010-agente-arquiteto-adr-pr-module-map.md) | Arquiteto agent：通过真实 PR 的 ADR、module_map 和交叉验证 | 已接受 |
| [0014](0014-infra-agent-painel-phoenix.md) | InfraAgent 与实时团队面板（Fase 4a 收尾） | 已接受 |
| [0015](0015-psicologo-real-toolloop-hipoteses-evidencia.md) | 真正的 Psicólogo：ToolLoop、带证据的假设与成本分诊 | 已接受 |
| [0016](0016-anamnese-proficiencia-patches-instrucao.md) | Anamnese：熟练度画像、指令补丁与闭环 | 已接受 |
| [0022](0022-fechamento-4b-psicologo.md) | 阶段 4b 的收尾（第 1 次会话）：能送达的证据、能显示的成本、能在 kill 之后存活的分析 | 已接受 |
| [0023](0023-fechamento-4b-anamnese.md) | 阶段 4b 的收尾（第 2 次会话）：能工作的目录、能区分谁拒绝的去重，以及能在一轮之后存活的队列 | 已接受 |
| [0038](0038-hierarquia-de-agentes.md) | agent 的层级：领域、lead 与委派 | 已接受 |
| [0046](0046-promocao-de-story-com-autoridade-do-usuario.md) | 由用户拥有权限的故事晋升 | 已接受 |
| [0053](0053-dev-lead-e-paralelismo-autorizado.md) | Dev Lead 作为区域，以及由用户授权的并行 | 已接受 |
| [0068](0068-diagrama-c4-do-arquiteto.md) | Arquiteto 的 C4 图 | 已接受 |
| [0069](0069-fusao-condicional-do-handoff-com-a-ativacao-de-execucao.md) | 有条件地合并 handoff 的接受与执行的启用 | 已接受 |
| [0085](0085-fluxo-como-registro-declarativo.md) | 角色流作为声明式登记（fluxo.yml） | 已提议 |
| [0086](0086-dev-lead-plano-suspende-para-aprovacao.md) | Dev Lead 的计划挂起轮次以等待审批 | 已接受 |
| [0087](0087-ux-designer-agente.md) | UX Designer 作为对话式 agent 加入 | 已接受 |
| [0088](0088-staff-agente-dormente-para-disparo-automatico.md) | Staff：代码就绪，自动触发处于休眠 | 已接受 |
| [0089](0089-analytics-e-delivery-metricas-como-relatorio.md) | `analytics` 和 `delivery-metricas` 成为报表脚本 | 已接受 |
| [0092](0092-platform-relatorio-de-telemetria-sob-demanda.md) | `platform` 以按需报告脚本的形式诞生，而不是 agent | 已接受 |
| [0093](0093-dbre-linter-de-migracao-e-relatorio-de-backup.md) | `dbre` 角色变成两个脚本：迁移 linter 和备份报告 | 已接受 |
| [0094](0094-delegacao-dev-lead-vira-dado.md) | Dev Lead → dev 的委派成为数据，`parecerArtifactId` 被重新定义 | 已接受 |
| [0109](0109-handoff-manual-a-agente-a-escolha.md) | 向任选 agent 的手动 handoff 复用"提供 + 接受"，绝不引入第三种 handoff 状态 | 已接受 |
| [0182](0182-ciclo-de-vida-do-handoff.md) | handoff 提议获得生命周期：每个目标一个待处理，以及 `superseded` | 已接受 |
| [0185](0185-estou-pronto-fecha-os-dois-gates.md) | "Estou pronto — a necessidade está validada"：一次点击同时关闭就绪确认、gate `necessidade-validada` 和 PO 的接受 | 已接受 |
| [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) | 当 backlog 已覆盖且仓库为本地时，PO 给 Arquiteto 的 handoff 无需点击即被接受 | 已接受 |
| [0194](0194-aprovar-o-plano-ativa-a-execucao.md) | 批准 Dev Lead 的计划会激活执行，任务获得它所分配的模块 | 已接受 |
| [0212](0212-historia-arquivada.md) | 已归档的故事：一列，而不是状态机中的一个状态 | 已接受 |
| [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md) | 交付物通过 Infra 的 compose 在用户的机器上运行 | 已接受 |
| [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) | 被其他模块依赖的模块在执行计划中必须有负责人 | 已接受 |
| [0261](0261-o-dev-lead-e-avisado-de-bloqueios-e-pede-ao-arquiteto.md) | Dev Lead 会收到阻塞通知，并通过专用通道向架构师提请求 | 已接受 |
| [0262](0262-o-agente-retira-a-regra-de-negocio-obsoleta.md) | agent 撤销过时的业务规则，并引用替代规则或回答 | 已接受 |

## Gates、QA 与安全审查 {#tema-gates}

gates 的注册表、QA 和 SecOps 的裁决，以及衡量它们的 golden-sets。

| # | 决定 | 状态 |
|---|---|---|
| [0013](0013-gates-qa-secops-pr.md) | PR 的 gate：QAAgent 和 SecOpsAgent | 已接受 |
| [0020](0020-destravar-gates-qa-secops.md) | 解锁 QA 与 SecOps 的 gate：在工作树上运行 gitleaks、经过校验的意见书，以及文本形式的 tool call | 已接受 |
| [0021](0021-fechamento-4a-infra-e-painel.md) | 阶段 4a 的收尾：真正做校验的 infra gate，以及说真话的面板 | 已接受 |
| [0054](0054-gates-como-registro-declarativo.md) | gate 作为声明式登记 | 已提议 |
| [0057](0057-o-gate-espera-a-aprovacao.md) | gate agent 等待审批，就像 dev 那样等待 | 已接受 |
| [0067](0067-o-gate-sobrevive-ao-restart.md) | gate 在重启后存活 | 已接受 |
| [0090](0090-qa-estrategia-e-appsec-segundo-momento.md) | QA 策略和 AppSec 作为第二个**时刻**，而不是新 agent | 已接受 |
| [0091](0091-secops-runtime-relatorio-de-abuso.md) | `secops-runtime` 作为基于 `rate_limit_hits` 的报告脚本 | 已接受 |
| [0095](0095-gate-necessidade-validada.md) | gate `necessidade-validada` 由单独的人工确认关闭，而不是由 Criativo 自我验证 | 已接受 |
| [0123](0123-golden-set-regressao-qa-automacao.md) | 为 QA Automação agent 的语义判断建立回归用例 golden-set | 已接受 |
| [0168](0168-golden-set-do-qa-em-ci-semanal.md) | QA 的 golden-set 开始在 CI 中按周定时运行 | 已接受 |
| [0192](0192-plano-de-teste-depois-da-entrega.md) | 测试计划在 dev 交付之后诞生，gate `implementavel` 改为基于故事和 `module_map` 进行判断 | 已接受 |
| [0207](0207-ciclo-de-gate-velho-estaciona.md) | 停滞超过 2 小时的 gate 周期会被搁置，只有人工操作才能恢复 | 已接受 |
| [0214](0214-pergunta-em-aberto-vira-pendencia.md) | 悬而未决的问题成为待解决的待办 | 已接受 |
| [0215](0215-decisao-do-projeto-chega-ao-dev-e-ao-qa.md) | 项目的决定传达到 dev 和 QA | 已接受 |
| [0258](0258-a-resposta-pelo-chat-fecha-a-pergunta-em-aberto.md) | 在聊天中给出的回答关闭悬而未决的问题 | 已接受 |

## 执行、终端策略与审批 {#tema-execucao}

工作中的 dev agent、`proposed_action`、终端策略、路径范围、自动模式和绝对上限。

| # | 决定 | 状态 |
|---|---|---|
| [0011](0011-infra-dev-agents-worktrees-merge-lock.md) | dev agent 的基础设施：worktree、git 执行器和合并锁 | 已接受 |
| [0012](0012-dev-agent-real-toolloop-orcamento-bloqueio.md) | 真正的 DevAgent：ToolLoop、按 task 的预算与阻塞纪律 | 已接受 |
| [0017](0017-lock-de-workspace-e-monitor-de-dev-agents.md) | 工作区初始化锁、dev agent 的 Monitor 以及上限继承 | 已接受 |
| [0018](0018-noop-dev-agent-modo-de-execucao.md) | NoopDevAgent 作为永久的执行模式 | 已接受 |
| [0019](0019-destravar-dev-agent-adr-por-modulo-orcamento-projeto.md) | 解锁真实的 DevAgent：写入、终端、按模块的 ADR 和按项目的预算 | 已接受 |
| [0045](0045-reagendamento-por-evento-do-dev-agent.md) | dev agent 的按事件重新调度，以及熔断器 | 已接受 |
| [0047](0047-operabilidade-pos-dogfooding.md) | dogfooding 之后的可运维性：Fase 12 的收尾 | 已接受 |
| [0048](0048-decisao-no-log-e-a-ordem-do-gate.md) | event log 中的决定，以及 gate 的顺序 | 已接受 |
| [0052](0052-dev-agent-espera-aprovacao-no-meio-do-laco.md) | dev agent 在循环中途等待审批 | 已接受 |
| [0055](0055-escopo-de-caminho-na-politica-de-terminal.md) | 终端策略中的路径范围 | 已接受 |
| [0102](0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md) | 修订 ADR 0065：外部效果的边界不再是 `deny`，而是绝对上限 | 已接受 |
| [0167](0167-modo-automatico-libera-o-escopo-de-caminho.md) | 自动模式放行路径范围，而且只有它放行 | 已接受 |
| [0189](0189-o-piloto-automatico.md) | 自动驾驶：自动模式批准一切（上限除外），作用域与真实执行目录比较，"始终允许"记录动词 + 子命令 | 已接受 |
| [0204](0204-modo-automatico-libera-push-e-pr.md) | 自动模式放行 push 和 PR | 已接受 |

## 代码住在哪里——执行模式 {#tema-modos}

三种执行模式、用户的文件夹、项目的基目录，以及项目在模式之间的转换。

| # | 决定 | 状态 |
|---|---|---|
| [0066](0066-nome-de-pasta-legivel-do-workspace.md) | 可读的 workspace 文件夹名称 | 已接受 |
| [0072](0072-projeto-local-ou-container.md) | 项目选择代码存放在哪里：用户目录还是托管目录 | 已接受 |
| [0104](0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md) | `execution_mode` 取三个值，由 runner 负责验证时 workspace 以 `unverified` 诞生 | 已接受 |
| [0107](0107-navegacao-de-pasta-local-via-o-runner.md) | 通过 Runner 浏览本地文件夹 | 已接受 |
| [0108](0108-projeto-runner-nasce-ao-navegar-pasta-no-wizard.md) | 在 `runner` 模式下，项目在点击“Navegar pasta...”时诞生，而不只是在确认时 | 已接受 |
| [0111](0111-conversao-de-execution-mode-de-projeto-existente.md) | 转换已有项目的 `execution_mode`：dev agent 活动时拒绝，迁移 `permissions.json`，退役容器行 | 已接受 |
| [0141](0141-base-unica-dos-projetos-montados.md) | 挂载项目的唯一 base，按同一路径挂载 | 已接受 |
| [0142](0142-validacao-de-workspace-montado-adiada.md) | 挂载 workspace 的验证推迟到实体化时进行 | 已接受 |
| [0146](0146-base-consentida-no-bootstrap.md) | 在 bootstrap 中经同意设定的 base，以及 `mounted` 作为本地默认值 | 已接受 |

## 项目容器与 broker {#tema-container}

项目容器的生命周期、镜像的决定、Docker 端口，以及与守护进程对话的 broker。

| # | 决定 | 状态 |
|---|---|---|
| [0065](0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md) | 每个项目一个容器：边界不再是策略 | 已接受 |
| [0081](0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md) | 容器生命周期：状态表，没有编排器 | 已接受 |
| [0083](0083-terminal-mostra-estado-real-do-container.md) | 终端标签页获得生命周期的真实使用者，而不是终端 | 已接受 |
| [0128](0128-porta-de-docker-e-a-prova-de-empacotamento.md) | Docker 端口，以及选定实现的打包证明 | 已接受 |
| [0130](0130-broker-de-container.md) | 容器 broker：谁与服务器的 Docker 对话，以及它为什么不接受规格 | 已接受 |
| [0131](0131-roteamento-de-modulos-para-infra.md) | Arquiteto 把模块路由给 infra：它**提名**，Infra **选定** | 已接受 |
| [0133](0133-infra-elege-imagem-do-roteamento.md) | Infra 在路由的候选项中做出选择，选择结果成为 `artifact.project_image` 的新版本 | 已接受 |
| [0134](0134-dev-agents-executam-dentro-do-container.md) | dev agent 在项目的真实容器**内部**执行，终端在其中获得一个自动批准的下限 | 已接受 |
| [0135](0135-portao-de-imagem-nos-tres-modos.md) | Arquiteto 的镜像关口（RN-105）开始在三种执行模式下生效 | 已接受 |
| [0136](0136-pagina-global-de-containers.md) | 全局容器页面：broker 按加载设上限，`container_remove` 纳入绝对上限 | 已接受 |
| [0137](0137-o-runner-sobe-o-container-do-projeto.md) | `brabo-runner` 在用户的机器上启动项目容器 | 已接受 |
| [0143](0143-agentes-de-dev-so-depois-do-container.md) | dev agent 只在容器之后 | 已接受 |
| [0144](0144-a-segunda-raiz-do-broker.md) | broker 的第二个根，以及选择它的可辨识定位符 | 已接受 |
| [0180](0180-container-com-o-dono-da-pasta.md) | 项目容器以文件夹所有者身份运行，由 api 测量 | 已接受 |
| [0190](0190-a-infra-sobe-o-container-no-aceite.md) | Infra 在接受 handoff 时启动容器，由服务器执行这一步并预置自主度，并由它交接给 Dev Lead | 已接受 |
| [0199](0199-recurso-minimo-derivado-do-module-map.md) | 容器的最低资源从 `module_map` 派生：每个模块声明自己的，Infra 按总和启动 | 已接受 |
| [0208](0208-a-infra-herda-a-rede-do-arquiteto.md) | Infra 继承 Arquiteto 声明的网络 | 已接受 |
| [0228](0228-comando-do-app-e-rede-do-container.md) | 项目容器通过声明的命令启动应用，并且仅在 loopback 上发布端口 | 已接受 |
| [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) | QA 在临时实例中测试，使用 Infra 声明的服务 | 已接受 |
| [0264](0264-o-app-reinicia-so-o-processo.md) | Depois do avanço da pasta, o app reinicia só o processo, sem recriar o container | 已接受 |
| [0265](0265-o-app-declarado-propoe-recriar-o-container.md) | O app declarado pela Infra propõe recriar o container, com a porta na faixa 13000+ | 已接受 |

## 本地 runner {#tema-runner}

用户机器上的 CLI——通道、凭据、设备密钥、分发、基目录和服务。

| # | 决定 | 状态 |
|---|---|---|
| [0103](0103-runner-local-execucao-na-maquina-do-usuario.md) | 本地 runner：通过带一次性 ticket 的 Phoenix 通道在用户机器上执行 | 已接受 |
| [0105](0105-personal-access-token-do-runner-escopado-por-construcao.md) | 给 runner 的 Personal Access Token（`brb_…`），按构造限定到一条路由 | 已接受 |
| [0106](0106-distribuicao-do-runner-via-tsup-e-npm-publish.md) | 通过 `tsup` 和 `npm publish` 分发 `@brabo/runner`，版本只在 CI 中注入 | 已接受 |
| [0112](0112-binario-standalone-do-runner-via-bun-build-compile.md) | 通过 `bun build --compile` 构建 `@brabo/runner` 的独立二进制，原生插件 `.node` 通过真实解压到临时目录的方式嵌入 | 已接受 |
| [0118](0118-configuracao-automatica-do-runner-pelo-navegador.md) | 通过浏览器配置 runner：Ed25519 设备密钥作为 `runner-ticket` 的第二种凭据、GitHub Releases 的二进制代理，以及用 File System Access API 一键配置文件夹 | 已接受 |
| [0145](0145-docker-pre-requisito-do-runner.md) | Docker 成为 `runner` 模式的真正前提 | 已接受 |
| [0147](0147-agente-local-com-capacidades.md) | 一个本地 agent，在连接时声明能力 | 已接受 |
| [0151](0151-base-consentida-no-runner.md) | runner 中经同意的基础目录，以及通过通道创建文件夹 | 已提议 |
| [0154](0154-chave-de-dispositivo-de-maquina.md) | 机器级的设备密钥 | 已接受 |
| [0174](0174-runner-sem-binario-darwin-x64.md) | runner 的独立二进制不再承诺 Mac Intel | 已接受 |
| [0187](0187-runner-sem-binario-win32-x64.md) | runner 的独立二进制不再承诺 Windows | 已接受 |
| [0193](0193-git-credenciado-no-host-do-runner.md) | 带凭据的 git 在 runner 的**宿主机**上运行；代码在容器中运行 | 已接受 |
| [0201](0201-revogacao-por-chave.md) | 吊销针对的是**密钥**，而不是 `{projeto, usuário}` 这一对 | 已接受 |
| [0203](0203-aposenta-o-fluxo-do-runner-pelo-navegador.md) | 通过浏览器配置 runner 的流程退役，路径改为安装程序 | 已接受 |
| [0230](0230-importar-chave-de-llm-pelo-runner.md) | runner 导入用户机器上已有的 LLM API 密钥 | 已接受 |

## 认证、访问与秘密 {#tema-iam}

first-party 认证、角色及其上限、workspace 成员关系、跨源加固以及秘密的信封。

| # | 决定 | 状态 |
|---|---|---|
| [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) | 自有认证：argon2id、EdDSA 与 refresh 轮换 | 已接受 |
| [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) | 切除 Keycloak：自有签发方、service token 与 cookie 中的会话 | 已接受 |
| [0037](0037-cors-do-engine-e-a-porta-como-contrato.md) | engine 所缺的 CORS，以及端口作为契约的一部分 | 已接受 |
| [0050](0050-credencial-sempre-cifrada-verificacao-explicita.md) | 凭据总是被加密；验证成为显式动作 | 已接受 |
| [0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md) | api 中封闭的 CSP，以及约束在根内的项目范围 | 已接受 |
| [0059](0059-segredo-do-state-de-oauth-sem-default.md) | 签署 git OAuth `state` 的密钥没有默认值 | 已接受 |
| [0084](0084-login-social-github-e-gitlab.md) | 社交登录（GitHub/GitLab），修订 ADR 0031/0032 的 backlog | 已接受 |
| [0096](0096-smtp-real-no-mailsender.md) | `MailSender` 中的真实 SMTP，置于显式开关之后 | 已接受 |
| [0127](0127-tetos-de-rebaixamento-em-project-members.md) | `project_members` 中的两道降级上限，覆盖关系保留 | 已接受 |
| [0156](0156-teto-de-auto-rebaixamento-na-remocao.md) | 自我降级上限同样适用于移除项目成员 | 已接受 |
| [0157](0157-teto-de-auto-movimento-no-upsert-de-workspace.md) | workspace upsert 中的自我变动上限，以及原本是漏洞的自我晋升 | 已接受 |
| [0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md) | 主密钥的 id 写入信封，作为可观测性，绝不作为权威 | 已接受 |
| [0173](0173-remocao-de-membro-de-workspace.md) | workspace 成员的移除诞生，由同一条款保护 | 已接受 |
| [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md) | 按角色快速访问仅限本地环境 | 已接受 |

## LLM providers、模型与开销 {#tema-llm}

provider 的契约、模型目录与人工筛选、模型的 bindings、计量和预算。

| # | 决定 | 状态 |
|---|---|---|
| [0040](0040-moeda-do-dashboard.md) | 仪表盘的货币：暂用 USD，按 workspace 的手动汇率推迟 | 已接受 |
| [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) | 一个 OpenAI 兼容基类、一份 LLM provider 合约，以及会拒绝 binding 的 capabilities | 已接受 |
| [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) | 活目录、模型生命周期与可审计的价格 | 已接受 |
| [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) | 在基础之上的六个 LLM provider，Fase 9b 终于关闭 | 已接受 |
| [0049](0049-curadoria-de-modelo-por-workspace.md) | 按 workspace 的模型策展 | 已接受 |
| [0051](0051-facetas-de-capability-e-curadoria-por-uso.md) | 已证明的能力维度；“用来做什么”是策展 | 已接受 |
| [0063](0063-duas-audiencias-para-o-mesmo-gasto.md) | 同一笔花费的两种受众：owner 的账单与成员的消耗 | 已接受 |
| [0064](0064-escopo-de-area-na-cascata-e-o-binding-de-agente-global.md) | 模型级联中的领域范围，以及全局的 agent 绑定 | 已接受 |
| [0075](0075-embeddings-no-contrato-de-llm-provider.md) | LLMProvider 合约中的 embedding | 已接受 |
| [0076](0076-provider-volta-a-ser-dimensao-de-gasto.md) | `provider` 重新成为花费维度，约束改由类型承担 | 已接受 |
| [0077](0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) | 按能力的模型排名，不编造评分 | 已接受 |
| [0110](0110-budget-por-area-aditivo-nao-cascata.md) | 按区域的预算是叠加的，与项目/会话并列——不是级联，也不是新表 | 已接受 |
| [0114](0114-deteccao-de-ollama-nativo-no-bootstrap-dev.md) | 在开发引导中检测原生 Ollama：只问一次，持久化到 `.env`，把 compose 的服务放到 profile 之后 | 已接受 |
| [0115](0115-pedido-de-pull-de-modelo-huggingface-tabela-propria.md) | 从 Hugging Face 拉取模型：独立的表、两步确认以及官方发布者 allowlist——绝不使用 `proposed_actions` | 已接受 |
| [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) | 路由偏好住在模型 binding 中，随它一起传递，并在计量中冻结 | 已接受 |
| [0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md) | provider 返回的真实成本成为计量的数字 | 已接受 |
| [0198](0198-duplicata-semantica-por-embedding-com-limiar-que-so-avisa.md) | 故事与规则的语义重复通过带阈值的 embedding 提醒，花费进入计量 | 已接受 |
| [0221](0221-upstream-preso-por-sessao.md) | hub 按 `session_id` 将每个智能体的对话绑定到服务它的 upstream | 已接受 |
| [0222](0222-provider-9router-de-llm.md) | 9Router 成为第 10 个 LLM provider，URL 按安装配置 | 已接受 |
| [0223](0223-orcamento-de-raciocinio-por-modelo.md) | 推理预算是按模型的 capability，人工策展 | 已接受 |
| [0224](0224-raciocinio-abortado-no-stream.md) | 推理在 stream 中被计数并在上限处中止，成本先估算再对账 | 已接受 |
| [0225](0225-teto-de-preco-do-upstream-no-openrouter.md) | OpenRouter 每次调用获得价格上限（`provider.max_price` = 目录价 × 1,5） | 已接受 |
| [0227](0227-provider-opencode-zen-de-llm.md) | OpenCode Zen 成为第 11 个 LLM provider，仅使用 OpenAI 方言 | 已接受 |
| [0233](0233-membro-ve-o-gasto-do-projeto-sem-credencial.md) | 成员按智能体和领域查看项目开销，绝不按 provider | 已接受 |
| [0251](0251-preco-de-lista-datado-para-provider-sem-preco.md) | 对不提供价格的 provider，在代码中标注日期的标价 | 已接受 |
| [0257](0257-na-anthropic-direta-o-raciocinio-desligado-e-por-modelo.md) | 在直连 Anthropic 时，关闭推理是按模型的，而 effort 会降低 Opus 的推理 | 已接受 |
| [0279](0279-provider-de-llm-duble-do-regressivo.md) | Provider de LLM dublê do regressivo, dentro da api | 已接受 |

## RAG、知识图谱与工件 {#tema-conhecimento}

chunks 和混合搜索、对它的测量、Neo4j 图谱，以及从事件日志投影出的工件。

| # | 决定 | 状态 |
|---|---|---|
| [0079](0079-tabela-de-chunks-vetor-e-tsvector-juntos.md) | chunk 表：向量与 `tsvector` 在同一行 | 已接受 |
| [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md) | 混合搜索：权重、阈值，以及什么算引用 | 已接受 |
| [0082](0082-chat-rag-aba-de-busca-hibrida.md) | Chat RAG：混合搜索的独立标签页，不重命名“Chat” | 已接受 |
| [0099](0099-neo4j-grafo-de-conhecimento-e-templates.md) | Neo4j 作为知识图谱和 prompt 模板，驱动放在 api 中 | 已接受 |
| [0100](0100-rag-search-e-modelos-garantidos-no-boot.md) | 面向 agent 的 `rag_search`，以及启动时确保存在的 Ollama 模型 | 已接受 |
| [0101](0101-memoria-relacional-como-projecao-do-event-log.md) | 关系记忆作为事件日志的投影；在不触碰 GenServer 的情况下使用模板 | 已接受 |
| [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) | 附加的本地目录成为 `chunks.scope = 'local'`，由**浏览器**读取，绝不是主机路径 | 已接受 |
| [0129](0129-telemetria-de-busca-do-rag-como-tabela.md) | RAG 搜索的遥测是**表**，权重冻结在行中 | 已接受 |
| [0132](0132-golden-set-de-acerto-do-rag.md) | RAG 命中率的 golden-set，以及 gate `rag-acertivo` | 已接受 |
| [0138](0138-golden-set-do-rag-em-ci-agendado.md) | RAG 的 golden-set 开始在 CI 中定时运行——并且仍然是 `warn` | 已接受 |
| [0148](0148-artefatos-projetados-em-arquivo.md) | agent 的工件以文件形式投影到一个 `docs/` 目录 | 已接受 |
| [0196](0196-anamnese-religada-com-sujeito-e-fato-do-perfil.md) | 重新启用的 Anamnese：没有主体就不运行，被接受的假设成为画像事实 | 已接受 |
| [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md) | 模块间合约成为 Arquiteto 的版本化工件，dev agent 读取它而不是别人的 worktree | 已接受 |
| [0205](0205-desvio-do-agente-como-sinal-do-produto.md) | Anamnese 观察到的 agent 偏差成为产品信号，不含个人数据 | 已接受 |
| [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md) | A indexação de docs tem teto próprio de 4 MiB, e o corte é declarado | 已接受 |
| [0272](0272-a-busca-do-rag-limita-os-trechos-por-arquivo.md) | A busca híbrida do RAG limita os trechos por arquivo | 已接受 |
| [0291](0291-as-percepcoes-olham-o-produto-do-usuario-e-a-falha-tecnica-e-sinal-interno-do-tp-01.md) | As Percepções olham o produto do usuário; a falha técnica é sinal interno do TP-01 | 已接受 |
| [0293](0293-a-memoria-do-projeto-e-markdown-versionado-e-o-grafo-e-o-rag-sao-indices.md) | O projeto tem memória em markdown que o dev lê antes de explorar | 已提议 |

## Web 界面与设计系统 {#tema-web}

界面、导航、主题，以及 web 应用中最大文件的结构。

| # | 决定 | 状态 |
|---|---|---|
| [0036](0036-telas-de-auth-fieis-ao-design-e-fontes-auto-hospedadas.md) | 忠实于设计的认证界面，以及三种无法加载的字体 | 已接受 |
| [0060](0060-superficie-de-leitura-de-codigo.md) | 代码的读取面，受约束且有预算 | 已接受 |
| [0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) | 可切换的主题，以及 CSP 下的启动 | 已接受 |
| [0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) | 界面框架，以及标签页注册表刻意偏离 handoff | 已接受 |
| [0097](0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md) | 为仪表盘的“N 个 agent 在线”直接读取 engine 的 schema | 已接受 |
| [0116](0116-tipos-do-web-gerados-do-openapi.md) | `ActionType`（以及将来的类型）由 OpenAPI 契约生成，而不是手工复制 | 已接受 |
| [0122](0122-sessionpage-dividido-em-cinco-prs.md) | `SessionPage.tsx` 拆分为五个机械式 PR，并事先声明 | 已接受 |
| [0124](0124-hook-do-canal-de-turno-do-sessionpage.md) | 轮次通道的状态分组抽取到 `useTurnoDoAgente` | 已接受 |
| [0125](0125-projectsettingstab-dividido-por-secao.md) | 把 `ProjectSettingsTab.tsx` 拆分为每个分区一个文件，置于一个 barrel 之后 | 已接受 |
| [0126](0126-trilho-vertical-de-navegacao-do-projeto.md) | 项目页面通过垂直轨道导航，代码标签页不再自行折叠侧边栏 | 已接受 |
| [0176](0176-sessionpage-abaixo-de-mil-linhas.md) | `SessionPage.tsx` 降到 1 000 行以下，分十个机械式 PR，之后才加锁 | 已接受 |
| [0181](0181-tema-preto-neutro.md) | 深色主题变为中性黑，对比度债务结束 | 已接受 |
| [0210](0210-animacao-de-texto-com-motion.md) | 用 `motion` 做文本动画 | 已接受 |
| [0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) | 只有一种导航：侧边栏吸收项目轨道 | 已接受 |
| [0232](0232-shadcn-com-base-ui-no-apps-web.md) | `apps/web` 中使用 Base UI 的 shadcn/ui 与 Tailwind 4 | 已接受 |
| [0234](0234-shiki-e-recharts-por-carga-dinamica.md) | Code Block 的 `shiki` 与 Chart 的 `recharts`，始终动态加载 | 已接受 |
| [0237](0237-o-visual-v3-liga-o-preflight-e-sobe-os-raios.md) | 视觉 v3 启用 preflight 并加大圆角 | 已接受 |
| [0238](0238-o-grafo-de-modulos-vira-canvas-xyflow.md) | 架构页的模块图变为 Canvas（`@xyflow/react`） | 已接受 |
| [0239](0239-csp-frame-src-local-para-o-web-preview.md) | 用于交付物 Web preview 的本地 CSP `frame-src` | 已接受 |
| [0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md) | 控件失效的原因可以放在容器页面的可用"?"中 | 已接受 |
| [0241](0241-a-sidebar-adota-o-block-sidebar-07-do-shadcn.md) | 侧边栏采用 shadcn 的 `sidebar-07` block | 已接受 |
| [0242](0242-containers-em-tabela-linear-com-tanstack-react-table.md) | 容器使用 `@tanstack/react-table` 的线性表格 | 已接受 |
| [0243](0243-consequencia-irreversivel-pode-morar-num-botao-de-perigo.md) | 不可逆的后果可以放在危险按钮中 | 已接受 |
| [0244](0244-coluna-das-abas-do-projeto-alinhada-a-esquerda.md) | 项目标签页的列左对齐 | 已接受 |
| [0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) | 页面内容占满整个宽度 | 已接受 |
| [0250](0250-chat-da-sessao-ocupa-a-largura-inteira.md) | 会话聊天占满整个宽度 | 已接受 |

## 运维、部署与安装 {#tema-operacao}

生产镜像、Kubernetes、可观测性、备份、dev 的 compose 以及一行安装程序。

| # | 决定 | 状态 |
|---|---|---|
| [0024](0024-fase5-imagens-producao-ci.md) | 阶段 5（第 1 次会话）：生产镜像、compose.prod、CI 与冒烟测试 | 已接受 |
| [0025](0025-fase5-deploy-kubernetes-kustomize.md) | 阶段 5（第 2 次会话）：使用 Kustomize 部署 Kubernetes、队列指标与本地 overlay | 已接受 |
| [0026](0026-fase5-observabilidade-e-graceful-shutdown.md) | 阶段 5（第 3 次会话）：优雅关闭、OpenTelemetry、指标、日志与仪表盘 | 已接受 |
| [0027](0027-fase5-backup-hardening-release.md) | 备份/还原、api 加固、暴露面与发布 | 已接受 |
| [0035](0035-observabilidade-legivel-e-trace-sem-coletor.md) | 没有 collector 的 trace，以及日志中跨层的路径 | 已接受 |
| [0070](0070-observabilidade-no-compose-local.md) | 本地 Compose 中的可观测性：指标和日志，没有 trace | 已接受 |
| [0150](0150-instalador-de-uma-linha.md) | 一行安装程序，带可选来源和标记文件 | 已提议 |
| [0152](0152-backup-de-volumes-contra-compose.md) | 针对 compose 的卷备份与恢复 | 已提议 |
| [0153](0153-deploy-enabled-o-gatilho-que-ninguem-cria.md) | `DEPLOY_ENABLED`：十份文档引用、却无人创建的触发器 | 已提议 |
| [0155](0155-a-primeira-conta-nasce-no-terminal.md) | 第一个账户在终端中诞生，本地 agent 启动时即已配对 | 已接受 |
| [0160](0160-o-compose-do-instalador-viaja-assinado.md) | 安装程序的 compose 随它一起传送，作为已签名的 asset | 已接受 |
| [0161](0161-a-tela-so-oferece-o-modo-que-a-instalacao-executa.md) | 界面只提供安装能执行的模式，而通过 Release 的安装没有 broker | 已接受 |
| [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md) | broker 成为第五个发布的镜像，安装程序**询问**是否启用它 | 已接受 |
| [0169](0169-seaweedfs-no-lugar-do-minio-no-overlay-local.md) | 本地 overlay 的 S3 目标不再是 MinIO，改为 SeaweedFS | 已接受 |
| [0170](0170-compose-de-dev-brabo-dev.md) | 开发用 compose 改名为 `brabo-dev`，开发环境拒绝在安装旁边启动 | 已接受 |
| [0209](0209-engine-em-otp-29.md) | engine 升级到 Elixir 1.20.4 / OTP 29.1.1 | 已接受 |
| [0256](0256-a-migracao-restaura-o-banco-num-banco-vazio.md) | 安装程序的迁移把数据库恢复到一个新创建的空库中 | 已接受 |

## CI、发布与供应链 {#tema-engenharia}

管道、发布的镜像、签名、扫描、固定版本、测试层次以及仓库自身的结构。

| # | 决定 | 状态 |
|---|---|---|
| [0039](0039-actionlint-e-validacao-do-pipeline-de-ci-gerado.md) | actionlint 与生成的 CI 管道的验证 | 已接受 |
| [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) | 每个正式 tag 都把镜像发布到 GHCR，生产 overlay 按 digest 固定 | 已接受 |
| [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md) | 针对生产 compose 的浏览器 E2E，放在 workspace 之外的包中 | 已接受 |
| [0121](0121-schema-dividido-por-agregado-de-dominio.md) | schema 按领域聚合拆分，置于一个 barrel 之后 | 已接受 |
| [0140](0140-timeout-do-audit-como-risco-assumido.md) | `pnpm audit` 反复超时是承担的风险；发现问题仍然失败 | 已接受 |
| [0149](0149-assinatura-dos-artefatos-publicados.md) | 已发布工件的签名 | 已提议 |
| [0159](0159-imagem-de-terceiro-por-digest.md) | 第三方镜像按 digest 引入，lint 让忘记的人失败 | 已接受 |
| [0172](0172-trivy-no-release-antes-de-assinar.md) | 发布在签名之前按 digest 用 Trivy 扫描它所发布的东西 | 已接受 |
| [0178](0178-tag-inline-na-imagem-de-terceiro.md) | 第三方镜像的 tag 住在引用**之内**，位于 digest 之前 | 已接受 |
| [0197](0197-a-imagem-dos-workflows-vem-do-compose.md) | workflow 的镜像来自 compose，并启用镜像的 Dependabot | 已接受 |
| [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) | Brabo 变成 `viralabs-dev` 中的一组仓库 | 已接受 |
| [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md) | O `brabo-qa` tem regressivo por funcionalidade, e o da PR para a `dev` nunca é exigido | 已接受 |
| [0270](0270-o-contracts-e-publicado-no-github-packages.md) | O brabo-contracts é publicado no GitHub Packages, com o `shared` só de tipos | 已接受 |
| [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) | Cada run do Actions mostra os vínculos entre os repositórios | 已接受 |
| [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md) | O regressivo roda num compose só; o grafo mostra cada funcionalidade por uma matrix de exibição, e o relatório é a fonte da decisão | 已接受 |
| [0278](0278-a-mudanca-e-vista-num-painel-do-brabo-ci.md) | A mudança é vista num painel do brabo-ci, sem check nas PRs | 已接受 |
| [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) | O pin do brabo-ci nos consumidores aponta para uma tag, e a branch decide qual | 已接受 |
| [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md) | O mapa dos 11 repos tem uma fonte só, o `repos.yml` do `brabo`, e o README é gerado dela | 已接受 |
| [0282](0282-a-pin-dos-componentes-segue-a-release-final.md) | A pin dos componentes segue a última Release final | 已接受 |
| [0285](0285-a-prova-de-uma-aresta-e-arquivo-mais-trecho.md) | A prova de uma aresta do `repos.yml` é arquivo mais trecho literal, não arquivo:linha | 已接受 |
| [0286](0286-as-capturas-da-doc-sao-geradas-pelo-qa-e-entram-por-pr.md) | As capturas da doc são geradas pelo brabo-qa e entram no brabo por PR do App | 已提议 |
| [0289](0289-a-recaptura-segue-a-pin-e-so-pede-o-dono-quando-a-imagem-muda.md) | A recaptura segue a pin do web e só pede o dono quando a imagem muda | 已提议 |

## 文档 {#tema-docs}

文档如何生成、核验和发布。

| # | 决定 | 状态 |
|---|---|---|
| [0029](0029-sincronizacao-continua-da-documentacao.md) | 文档的持续同步 | 已接受 |
| [0033](0033-referencia-de-api-gerada-do-openapi.md) | API 参考由代码产出，表格测试对元数据提出要求 | 已接受 |
| [0034](0034-documentacao-publicada-por-degrau.md) | 按阶梯发布的文档，位于 Pages 的子目录中 | 已接受 |
| [0071](0071-publicacao-simetrica-por-degrau.md) | 按阶梯对称发布，以及一个供选择的根 | 已接受 |
| [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) | 发布路径命名的是环境，而不是分支 | 已接受 |
| [0117](0117-lockfile-proprio-para-o-website.md) | `website/` 拥有自己的 lockfile，脱离产品的 `pnpm audit` | 已接受 |
| [0202](0202-o-indice-de-adr-por-tema.md) | 按主题组织的 ADR 索引，主题放在 ADR 之外 | 已接受 |
| [0206](0206-referencia-da-api-numa-pagina-redoc.md) | API 参考变成一个 Redoc 页面 | 已接受 |
| [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) | 四种语言，以 pt-BR 作为**来源**和默认：文档与界面提供葡萄牙语、英语、俄语和简体中文 | 已接受 |
| [0218](0218-titulo-de-adr-com-prefixo.md) | 每个 ADR 都命名为“ADR NNNN — 标题” | 已接受 |
| [0219](0219-referencia-entra-na-traducao.md) | 参考文档纳入翻译 | 已接受 |
| [0220](0220-api-traduzida-por-catalogo.md) | API 页面按目录翻译 | 已接受 |
| [0253](0253-o-site-de-docs-deixa-o-docusaurus.md) | 文档站点离开 Docusaurus | 已接受 |
| [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) | 每个领域的文档位于它自己的根目录 | 已接受 |
| [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md) | 代码仓库的文档只用英文；站点以横幅提供英文原文 | 已接受 |
| [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md) | A doc dos repositórios é em pt-BR por padrão, com traduções permitidas nos irmãos | 已接受 |
| [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) | A paridade de tradução mede só a doc do brabo | 已接受 |
| [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) | Os gerados do `brabo` leem os irmãos por uma trava de SHAs | 已接受 |
| [0275](0275-cada-irmao-confere-as-proprias-refs-com-simbolo.md) | Cada irmão confere as próprias refs com símbolo no PR | 已接受 |
| [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) | O índice de ADR é gerado, e a referência grande vira índice mais partes | 已提议 |
| [0288](0288-link-entre-repos-nas-rns-e-url-do-repo-dono.md) | O link entre repos nas RNs é a URL do repo dono, e o site a devolve para relativo | 已提议 |
<!-- END:GENERATED:indice-de-adr -->

## 约定 {#a-convenção}

- **每个决策一个文件**，位于 `docs/adr/NNNN-short-title.md`，使用
  4 位顺序编号，标题为 `# ADR NNNN — <título>`（[0218](0218-titulo-de-adr-com-prefixo.md)）。**编号不复用**，即使一份 ADR
  被取代——下一个是 **0263**。
- **每个决策一个主题**，由编写 ADR 的人在同一个
  PR 中选择：`docs/adr/temas.yml` 中的一行，以及该主题章节下的索引行，
  按数字顺序。审阅者确认。新主题是
  对 `temas.yml` 中列表的修改，在添加它的 PR 中说明理由；超过
  15 个需要一份修订 [0202](0202-o-indice-de-adr-por-tema.md) 的 ADR。
- **三个章节，仅此三个：** **背景**（促成它的问题或力量），
  **决策**（决定了什么），**后果**（接受的权衡以及
  留待以后的事）。
- **不使用第三方模板**——不用 Nygard、MADR 或其变体。三个
  章节就够了。
- **用葡萄牙语**，与项目的其余部分一样。
- **已接受的 ADR 不被编辑。**被后续决策取代的 ADR 保持
  原样；新的 ADR 引用旧的并解释改变了什么。

让这些 ADR 有价值的，是它们记录了**没有**奏效的东西：0020
记录了连续九次失败的执行，0027 记录了一个
在产生它的同一次会话中就被修订的理由。被省略的坏后果
正是六个月后会缺失的那一部分。
