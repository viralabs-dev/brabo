---
id: historico-de-fases-parte-1
title: "阶段历史，第 1 部分：第 1 至 15 阶段"
sidebar_label: "第 1 至 15 阶段，第 1 部分"
description: "从第 1 至 12 阶段到第 15 阶段之后（v2.5）：每个阶段交付了什么、砍掉了什么、发现了什么。"
keywords: [历史, 阶段, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# 阶段历史，第 1 部分：第 1 至 15 阶段

:::historico 2026-08-08
从第 1 至 12 阶段，经过第 13 阶段（证明与分诊）、第 14 阶段（真实执行所要求的）和第 15 阶段（gate 作为数据），直到第 15 阶段之后（v2.5.0 和 v2.5.1）。
文本原样移自[阶段历史](historico-de-fases.md)，未作改写。今天有效的内容位于 RN 和 ADR 中。
:::

## 状态 {#status}
- 第 1 阶段（MVP）——已完成：IAM/RBAC、带不可变 event log 的会话、带 LLM 路由器的聊天（Ollama + API）、token 的计量/预算、proposed_actions 管道 + permissions.json、带监督和终止事件的 Elixir/OTP 引擎。
- 第 2 阶段——已完成：带契约测试套件和 capabilities 的 GitProvider（Local/GitHub/GitLab）、加密凭据、通过管道实现的幂等且可恢复的 Gitflow bootstrap、带实时进度的向导。
- 第 3 阶段——已完成：Harness（PromptAssembler、ToolLoop、ContextManager、InstructionFiles、Hooks）、显式 handoff、带产物和领域校验的 Criativo、PO 和 Arquiteto agent。
- 第 4 阶段——已完成：执行型 agent（在隔离 worktree 中按模块动态生成的 dev、作为 PR gate 的 QA 和 SecOps、提议式的 Infra）、受保护的合并锁、实时团队面板；真正的 Psicólogo 和闭环的 Anamnese。gate 经真实执行验证（ADR 0020）。
- 第 5 阶段——已完成：非 root 生产镜像和 CI（ADR 0024），带 Kustomize 的 Kubernetes、按 Oban 队列的 HPA、NetworkPolicy 和 ESO（ADR 0025），graceful shutdown + OpenTelemetry + 仪表盘（ADR 0026），经测试可恢复的备份、运维手册和加固（ADR 0027）。
- DOC 阶段——已完成：docs/ 作为采用 Diátaxis 的唯一来源，website/ 中读取 docs/ 的 Docusaurus 站点，生成的参考文档，docs/.docmap.yml + CI 中的漂移检查（docs:check），社区层，已核实的 MIT，机制记录在 docs/explanation/documentation-workflow.md 中。
- 第 6 阶段——已完成：机械化的分支策略（ADR 0030）——pr-police、带两种模式的 approval-ladder、带计算版本和按目录树锚定的 promote/tag-release、带自动反向传播的 backmerge gate、版本化的 ruleset。流水线端到端演练（v0.1.0 → v0.2.0），hotfix 链路经真实执行验证。
- 第 7 阶段——已完成：取代 Keycloak 的 first-party auth——argon2id、Ed25519 access、带家族吊销的 refresh 轮换、渐进式 lockout、账号 token 和仅记日志的 MailSender（ADR 0031，RN-030..033）；以自有签发者进行原子切换，RBAC 不变，/internal/* 使用 service token，httpOnly cookie + CSRF，用户迁移并彻底移除 Keycloak（ADR 0032，RN-034/035）；23 个 controller 上的 OpenAPI，DTO 按类型锁定，表格测试要求元数据，生成带哈希清单的 docs/reference/api/（ADR 0033）。
- 第 8 阶段——带裁剪地完成：agent 层级——以唯一 lead 作为对外联系人的领域、私有的内部委派（`delegations` 表，`area` 为 TEXT）、可追溯的合并结论、带来源的失败；QA 作为领域（Lead + 自动化 + 性能/安全，gate 的外部契约不变——第 4 阶段的测试套件无需修改即为绿色）；Infra 作为领域，带有按 provider 生成 CI 的 Workflows 子 agent；按领域划分的团队面板，以及以子 agent 为目标的 Psicólogo/Anamnese（ADR 0038）。
  当时的范围裁剪，已被第 14d 阶段撤销：
  `agent_areas`/`agent_area_members` 自那以后按项目存在，`max_parallel` 可配置——迫使这一点的是 dev 领域，第一个**动态**领域。仍被裁剪的只有**按领域的预算**（真正的预算上限仍然是项目、会话和任务）。
  `apps/web/src/lib/agents.ts` 中的列表保留了颜色、图标和寻址**规则**；dev 的成员来自表。
- 第 9 阶段——已完成：针对现有 provider 运行的 LLMProvider 契约测试套件，基于 node:http、带**空闲**超时的 OpenAICompatibleProvider 基础，按 `code` 规范化的错误，两层 capabilities（ADR 0041）；目录同步——新发现的模型以禁用状态进入，消失的模型被标记而不是删除，价格冻结在 `token_usage` 中并带有仅追加的审计（ADR 0042）；按来源重新分组并带策展的 ModelPicker。
  第 9b 的六个 provider 由第 11 阶段引入（ADR 0043）。
- 第 10 阶段——已完成：Bitbucket + GenericGitProvider **通过** dogfooding 交付（Brabo 第一次真实地构建 Brabo 自身，在一个手工 seed 的 fork 中，分批进行、任务之间重启，Criativo 在链路中为必需）。收获写在第 12d 阶段的 docs/explanation/primeiro-dogfooding.md 中——带有 arquivo:linha 的 17 个发现是真实的；**定量**的那一半（重启、干预、成本）仍是 `não medido`，因为观察表从未填写。三个可运维性 P1 由第 12 阶段关闭。其余 14 个仍然开放并列在收获中——不要顺手修复。
- 第 11 阶段——已完成：第 9b 阶段的六个 provider 作为基础之上的配置，每个都对照官方文档从零调研（禁止继承怪癖）；LLM_PROVIDER_NAMES 从 3 个增加到 9 个；凭据 DTO 和连接测试器派生自单一列表；capability 只在经证明时才声明，现场有两次回退（DeepInfra 和 Vultr）；基础中唯一的新 hook（`parseErrorFrame`，+31 行）由 OpenRouter 证明为必要（ADR 0043）。
  使用真实凭据的 smoke 待办：由第 13 阶段吸收。
- 第 12 阶段——已完成：dogfooding 之后的可运维性，三个 P1 发现在一次执行中关闭并证明（ADR 0047）。
  12a——采纳已有仓库：独立路由、`getRepo` 在写入前校验访问权限、两张表中的 `origin`（created|adopted），以及作为闸门的**计划**——描述差异、在决定为空期间不做任何更改的 dry-run；重新采纳会收敛（ADR 0044，RN-045/046）。
  12b——按事件重新调度 dev agent：持久化的状态机（working|awaiting_gate|idle|idle_tripped）对现有 outbox 的两个事件作出反应，`awaiting_gate` 保留 worktree（它是按 **agent** 而不是按任务的）直到 gate 结束，并带有显式 rearm 的断路器（ADR 0045，RN-047）。
  12c——以用户权威推进故事：按项目的 `story_promotion`，以 `manual` 作为**新的默认值**（定向回填把已有项目设为 `auto`），`proposed_ready` 作为提议而非状态，推进复用 TransitionStoryUseCase（发现 #13 的死代码），拒绝会把原因固定在 PO 的会话中退回给他（ADR 0046，RN-048）。
  12d——Noop 进入了 12b 的状态机；脚本
  `pnpm --filter api validacao:fase-12` 在标准不满足时以非 0 退出，并从数据库提取证据；第 10 阶段的收获已写成；docmap 覆盖 engine/dev 和 engine/agents。
  待办（执行验证；声明的 Local/Noop 限制）：由第 13 阶段吸收。
- 未经明确请求，不要重构已完成的东西。

## 第 13 阶段——2026-08-07 完成（真正地证明并分诊） {#fase-13--concluída-em-2026-08-07-provar-de-verdade-e-triar}
没有新功能。该阶段关闭已声明的待办，证明 Local/Noop 验证明确无法证明的内容，并把 19 个开放的发现变成有优先级的计划。吸取的教训：第 10 阶段的手工表从未被填写——在这个阶段，**所有**指标都由脚本从 event log/token_usage 中提取，从不手工记录。

### 13a——关闭已声明的待办 {#13a--fechar-as-pendências-declaradas}
1. 2026-08-07 完成：`pnpm --filter api validacao:fase-12` 以 `0` 退出，event id 表在 docs/explanation/validacao-fase-12.md 中（TODO(humano) 已移除）。代价是四项修复——三项属于**工具**（实验对象诞生在 /tmp，engine 看不到；Noop 不打开 gate；Noop 死在 `pr_settled`），一项属于**产品**（发现 W：队列清空时 dev agent 会死掉）。
2. 2026-08-07 部分完成：**OpenRouter** 的 smoke 以真实凭据运行并通过（真实成本 US$ 0,000005，从 `token_usage` 读取）。其他五个仍被跳过——环境中没有它们的密钥。该 smoke 相对于 ADR 0049 已经腐坏，从未运行过；一并修正。带日期的结果在 docs/explanation/aceite-providers.md 中。

### 13b——2026-08-07 完成（v2.4.0） {#13b--concluída-em-2026-08-07-v240}
整条链路针对**真实** GitHub（`daneiel/test`）在十次执行中得到证明：远程采纳 → 带用户决定的计划 → 手动推进**一个**故事 → 真实的 dev agent 编写代码 → 提交、推送和**远程** PR → gate 打开 → 领域委派并附理由豁免 → 子 agent 在审批处**挂起** → 用户的拒绝**恢复**循环 → 由 LLM 给出 `changes_requested` 结论。engine 零重启。合并按设计排除在外（RN-014）。
3. 脚本是 `pnpm --filter api validacao:real`，按**成本**分阶段（`--ate adocao|backlog|execucao`）——便宜的先单独跑，配置错误就是这样在花钱之前暴露出来的。需要**在 api 容器内部**执行：策略是共享卷中的文件，从主机执行时它会诞生在 engine 看不到的文件系统中。
4. `pnpm --filter api medir:execucao` 是测量工具，并且已经**证明**：它独立复现了上一次 dogfooding 手工记录的数字（18 次调用，292.211 个 token，约 US$ 0,03）。
5. 结果在 docs/explanation/validacao-real.md 中，包含十次执行以及每一次的教训。

途中关闭了**七个** P1，全部由**执行**而非测试发现：W（队列为空时 dev agent 会死掉）、Y（搜索无法区分为空与未找到）、AA（git 凭据由点击者而不是付费者解析——RN-082）、AB（gate 把待决事项称作基础设施失败——ADR 0057）、AC（重定向让任何命令都无法批准）、路径范围中的 ReDoS（CodeQL HIGH），以及 postgrex 的 CVE。

在该阶段打开的发现中，X 后来关闭了（第 14d 阶段，RN-085——迭代上限改为按 agent **类型**）。**两个**仍然开放，它们的论证比数字更有价值：Z 和 AD（动词 allowlist **不**收敛：动词、形式和调用是不同的空间，第 6/7/8 次执行各卡在其中一个），以及 AE（QA agent 试图修复它所评判的代码，违背了自己的 prompt——由两道独立的屏障约束：allowlist 和范围）。两者都不是要修复的 bug：它们是产品决定，记录在 docs/explanation/achados-execucao-real.md 中。

该阶段交付的、比 PR 更重要的结论：通往自主的道路**不**经过放松策略。它经过让 agent **等待**决定而不是死掉——ADR 0057 为 gate 做到了这一点，扩展了 0052。

### 13c——完成：分诊变成了 docs/explanation/backlog.md {#13c--concluída-a-triagem-virou-docsexplanationbacklogmd}
19 个发现都已关闭（19 个中的 19 个）。该文档仍然是活的，并接收了 13b 的新发现。
6. 分诊会议：阅读 docs/explanation/primeiro-dogfooding.md，把 19 个发现分为 P1/P2/P3，并提出按内聚阶段分组的建议（按主题及其相互依赖）、估计的相对成本（P/M/G）以及等待的风险。产出是**提议**——优先级的决定属于用户。
7. 把完整的 backlog 整合到一份活文档中（docs/explanation/backlog.md 或等效文档）：已分诊的发现 + 旧条目——按领域的预算（ADR 0038；领域机制和 Dev Lead 随 ADR 0053 离开了 backlog，由第 14d 阶段实现）、手动 handoff 给所选 agent、MFA/社交/OIDC/联合（ADR 0031）、MailSender 中的真实 SMTP、部署（DEPLOY_ENABLED + Environments）、rc/rcfix 的回归（ADR 0030）、approval-ladder 的 community 模式、仪表盘上的“N 个 agent 在线”、带手动汇率的货币偏好。

## 第 14 阶段——2026-08-07 完成（真实执行所要求的） {#fase-14--concluída-em-2026-08-07-o-que-a-execução-real-exigiu}
hello world 的执行没有越过第一个回合，暴露了任何测试套件都没有捕获的缺陷，因为之前的一切都用**本地**模型运行。修复已经合入；剩下的是用户在执行期间决定的功能。

### 14a——agent 的可运维性（已完成） {#14a--operabilidade-dos-agentes-concluída}
- 回合失败变成了带来源的**持久** `agent.error`，agent 会在消息流中**说话**；四个对话型 agent 不再记录空的 `agent.response`（RN-059）。在最终帧中叙述、却不发出任何事件的错误路径也关闭了。
- Criativo 的聊天以邀请而不是空白开场：它被激活后等待用户先开口，界面现在会说明这一点——包括技术和代码**不**归它管。
- agent 消耗的密钥是 workspace **owner** 的（RN-058）。之前回合在一个 UUID 列中按 agent 的 **SLUG** 查找凭据：没有任何 agent 用过带凭据的 provider，只有 `ollama` 能工作。
- 密钥花费报告，仅限 owner，agent 与人分开（RN-060）。
- GitHub 上的 Gitflow bootstrap：新建的仓库在整个 Git Data API 上返回 409，第一次提交改走 Contents API。测试中的伪造后端撒了谎（在 GitHub 返回 409 的地方返回 404）——一并修正，正是它让测试套件在产品坏掉时仍然是绿色。

### 14b——树状时间线（已完成） {#14b--linha-do-tempo-em-árvore-concluída}
每个 agent 一个分支，从第一个里程碑到它**此刻**正在做的事，100% 派生自界面已经获取的 event log。按时间排序的动态仍保留在活动列中：它回答“发生了什么”，树回答“谁在做什么”。

在第 26 阶段之后重新审视（没有新阶段，与 12d/第 15 阶段之后同样的定点修正精神）：默认展开标准从仅“活跃/停止”改为活动**最近**的 5 个 agent——活跃的仍然优先（RN-118）；每个折叠的分支都有了自己的**新内容**计数器，在 `read-state.ts` 中按 agent 记录“最后查看”（与铃铛相同的机制，现在更细粒度）；`tool.call`/`tool.result`/`agent.response` 改为**逐个**展开（参数、结果、迭代），按 ToolLoop 的迭代边界分组。

### 14c——UI 的自动验证（已完成） {#14c--validação-automática-de-ui-concluída}
对比度变成了针对 `design/tokens.css` 的测试，已知的欠账被测量并锁定；布局（被截断的文本、视口外的菜单、被祖先裁切的下拉框、< 24px 的目标）变成了 `scripts/dev/validacao-visual.js` 中的浏览器检查器。没有新依赖。

### 14d——完成：并行度由 LEAD 决定，由你授权 {#14d--concluída-paralelismo-decidido-pelo-lead-autorizado-por-você}
分四个 PR 交付（#181、#182、#183、#184）。ADR 0053 变为**已接受**，彻底撤销了三项裁剪（Dev Lead、通过 module_map 的动态领域，以及通用的领域机制）。

1. **领域变成了数据**：按项目的 `agent_areas`/`agent_area_members`，`max_parallel` 默认 2。迫使这一点的是 **dev** 领域——第一个**动态**领域，其成员是 module_map 中每个模块各一个。无法在代码中枚举的东西必须是数据。
2. **上限属于会话，而不属于模块**（RN-083）。按模块计数会允许 N 个模块 × 2 而无需任何授权——换了个名字的旧漏洞。超过上限就变成 `proposed_action`。
3. **可在配置中按领域配置**，需要 `maintainer`，理由与激活执行相同：修改上限就是在不询问的情况下决定产品花多少钱。
4. **当授权变成例行公事时，Anamnese 会提议调高**——三次批准且**没有**拒绝（RN-086）。一次拒绝就会撤销这个信号：如果你曾经拒绝过，说明上限在发挥作用。
5. **Dev Lead 存在了**（RN-087），对话型，在已经交付给 Infra 的同一次确认中接收 Arquiteto 的 handoff，并提出计划：每个模块几个 agent 以及原因。`dev-<modulo>` 不再能通过 handoff 寻址——ADR 0038 的规则开始对 dev 生效，就像它早已对 QA 和 Infra 生效一样。

**发现 X** 在这里关闭（RN-085）：`TOOL_LOOP_MAX_ITERATIONS` 变成了按**类型**的上限——对话型 8，执行和 gate 60。谁能调高的标准**不是**“谁干得多”：而是谁底下有 `token_budget_micros` 在控制花费。`infra-workflows` 使用重型工具却保持在 8，因为它在没有预算的情况下运行。

**该阶段自身的三个缺口，是我在写下一个切片时发现的，而且全是同一种失败**：上限规则带着绿色测试合入，但产品并不演练它——没有任何路由调用该用例，批准动作并不执行任何东西，而该类型可以被 permissions.json 自动批准（由 RN-086 关闭）。测试零件不等于测试通往它的路径。

**按声明的决定不在范围内**（ADR 0053 第 5 项）：“Ativar execução”按钮更换所有者。同一项也声明过的、经由 `delegations` 表以 `area = "dev"` 进行的 Dev Lead → `dev-<modulo>` 委派，**已不再**超出范围——由 ADR 0094 关闭（fluxo.yml × 代码审计，第 2 波，RN-405）。按钮仍可撤销；执行仍走当前路径，gate 之后的修正仍直接交给打开 PR 的 dev。

## 第 15 阶段——2026-08-07 完成（gate 作为数据） {#fase-15--concluída-em-2026-08-07-gates-como-dado}
没有**新的** gate。该阶段把产品中**已经**隐式存在的 gate 提取到 docs/gates.yml 中，附带脚本验证和严重程度，与 docs/.docmap.yml 的精神相同。尚不存在的 agent gate（dev-lead、platform）以引用 backlog 的 `status: planned` 进入——从不是 active。gate 的外部契约**不**变。

### 15a——完成：声明式注册表 {#15a--concluída-registro-declarativo}
1. 包含现有 gate 的 docs/gates.yml（参见扩展了 ADR 0048 的 ADR 0054——event log 中的决定正是让 gate 的通过变得可测量的东西），schema 由测试校验。
2. api 中读取注册表的加载器；内部读取 endpoint。
3. 脚本 `pnpm --filter api validacao:gates`，从 event log 中提取每个 active gate 的最后一次通过，如果某个 `block` gate 没有脚本验证的证据就以非 0 退出。

并非每个 gate 在 event log 中都有证明，注册表会说明证明在哪里：`merge-protegida` 由**测试**保证（decide.ts 中的锁不发出自己的事件），`backmerge` 是 CI，状态在 .release/gate.json 中。因此每个 gate 都声明 `evidencia: event_log | teste | ci` 及其定位器——把它们降级为 `warn` 就是在产品最硬的锁上撒谎。

### 15b——完成：消费 {#15b--concluída-consumo}
4. 团队面板显示每个故事/PR 正在等待的 gate，派生自注册表（而非硬编码）。
5. docs/explanation/gates.md 解释该机制，纳入 docmap。

## 第 15 阶段之后——2026-08-08 完成（v2.5.0 和 v2.5.1） {#pós-fase-15--concluído-em-2026-08-08-v250-e-v251}
这不是计划中的阶段：它是第 15 阶段之后**使用**中发现的东西，之所以放在这里，是因为每一项的来源很重要。这些都不是来自脚本——而是来自在 Chrome 中浏览应用、阅读安全面板。

**UI 缺陷，浏览时发现**（RN-088..091）：
- `429` 会变成**白屏**，而应用以更多流量回应。规则变成了通用的：每个界面都区分**三种**状态——加载中、错误（带 `trace_id` 和按钮）和空。`if (!dado) return null` 会把三者合而为一。
- 仪表盘为每个项目发一次请求：**3.824 → 12 req/min**，借助
  `GET /workspaces/:id/projects-summary`。铃铛是缺失的另一半：每个周期 **289 → 一次**请求（RN-090/091）。

**安全加固，两个面板都清零**：
- ADR 0058——api 上封闭的 CSP（`default-src 'none'`），修订了 ADR 0027 的第 7 项；以及被限制在根目录内的 `projectId`（RN-092），它影响的不只是 `permissions.json`，还有**授权**终端的范围。
- ADR 0059——生产中没有默认值的 `GIT_OAUTH_STATE_SECRET`（RN-093）。默认值是**公开**的（`.env.example`），生产 compose 把它作为回退值提供：要求“非空”什么也抓不到，因为在真实的出错路径上该变量是**已定义**的。
- 站不住脚的告警被附上书面理由**驳回**，从不静默——而驳回是用户的决定，不是 agent 的。

**三条耗费了 CI 周期、值得作为规则的运维教训：**
1. **PR 上的 CodeQL 绿色不能证明旧告警已关闭**——PR 检查报告的是**新**告警。告警在**默认**分支的扫描中关闭，也就是说，只有在修复到达 `main` 之后。
2. **Gitleaks 扫描的是 `refs/heads/*` 可达的提交，而不是目录树。** 一个高熵值只要提交过一次，就会让那个分支的 CI 永远失败；在其上修正**不能**清除它。出路是让该提交变得不可达（从 `dev` 重建，并在打开新 PR **之前删除**旧分支）——绝不用 allowlist，那会让扫描器在那个路径上对所有提交失明。PR 的 ref 不在范围内。代表机密的 fixture 从一开始就**不带**熵。
3. **位于另一个函数中的屏障，CodeQL 看不到**——这就是三个 `js/path-injection` 在修复后仍然存在的原因。保留了集中检查（RN-092），在面板上付出代价：在每个调用方重复它，就会成为某天出现分歧的检查。
