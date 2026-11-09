---
id: historico-de-fases-parte-3
title: "阶段历史，第 3 部分：28 计划与审计"
sidebar_label: "28 计划与审计，第 3 部分"
description: "28 计划、fluxo.yml × 代码审计以及团队的智能体，直到知识图谱。"
keywords: [历史, 阶段, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# 阶段历史，第 3 部分：28 计划与审计

:::historico 2026-09-11
28 计划（一波接一波）、fluxo.yml × 代码审计、团队的新智能体和知识图谱。
文本原样移自[阶段历史](historico-de-fases.md)，未作改写。今天有效的内容位于 RN 和 ADR 中。
:::

## 28 计划——第 1 波，A 前线：主题不再无法访问（RN-182..185） {#programa-28--onda-1-frente-a-o-tema-deixa-de-ser-inalcançável-rn-182185}
浅色主题存在于 `design/tokens.css` 中，有奇偶测试，并且在 `design/README.md` 中被描述得像是一个界面——而**`apps/web` 中没有任何东西写入 `data-theme`**。看到它的唯一方法是在 DevTools 中手动输入该属性。两个对比度测试都知道并说了出来：其中一个用 `expect` 断言浅色主题中有**三**对不通过，“是对所继承内容的记录，而不是对所渲染内容的保证”。在此期间，这个论证是诚实的——测量一个谁都打不开的界面，就是在测量一个意图。随着主题按钮的到来，它的符号反了过来。

**启动是一个**文件**（`apps/web/public/theme-boot.js`），在 `<head>` 中同步执行，在 bundle 之前。handoff 要求使用**内联**脚本；镜像在 `script-src 'self'`（ADR 0058）下提供服务，所以内联在 `pnpm dev:web` 中能工作，在生产中却会被阻止——换了主角的 ADR 0036 式失败。`tema.ts` 是 shell 使用的 API；按钮不在其中。会抛异常的 `localStorage` 退化为“绘制但不持久化”，未知值退回到默认值。

**浅色主题的六个 token 改变了值**（ADR 0074），因为浅色中要求最高的背景是纸质的 `--code-bg`：accent 3,56 → 4,81，warning
3,15 → 4,98，success 3,89 → 5,12，violet 4,16 → 4,95，text-muted 2,76 → 5,17，再加上低一级的 accent-hover。**深色**主题没有改变任何一个，它的欠账仍锁定在同样的五个数字上。记录了两个副作用：在深色中属于欠账的五对在浅色中**通过**，而“设计系统的已知例外”（`--accent` 上的 `--on-accent`，3,20:1）在浅色中消失——测试注释所描述的修复，即加深到 `--terracota-500`，正是浅色主题现在所做的。

**handoff 的八个 `--syn-*` 值中有五个因测量而被**拒绝**（最差的 `--syn-cm` 在浅色中只有 2,32:1）。handoff 不通过的地方，以测得的数字为准：这与字体是同一把尺。八个角色以 `--syntax-*` 前缀开始存在；仍在着色的五个语义 token 被测量后放在它们旁边。

## 28 计划——第 1 波，D0 前线：按 provider 的花费（RN-186..188） {#programa-28--onda-1-frente-d0-gasto-por-provider-rn-186188}
**约束改变了性质，这才是重要的——而不是新的轴。**
`provider` 重新成为 `sumGroupedBy` 的维度，根据产品所有者的决定修订了 ADR 0063。之前，成员够不到按**凭据**的拆分，因为它不存在——ADR 0063 写道“没有可以传入的参数”。现在它存在了，约束它的是**类型**：两个重载，而携带 `actor` 的范围（成员视图唯一的范围）只接受
`Exclude<SpendDimension, 'provider'>`。保证从“无法表达”变成了“无法编译”，后者更弱——这就是为什么屏障有**两道**且相互独立：成员的路由也没有任何维度参数。故意没有任何针对该组合的 `if`（与 RN-153/154 相同的教训），证明是通过**反转**完成的：没有 `@ts-expect-error` 时，`tsc` 会在确切的行上报 `TS2769`。

`porOwner`/`porAgente` 是 `porAtor` 按 `actor_kind` 的划分，没有额外查询；`system` 不属于两者，仍计入总数。ADR 0063 测量并推迟的 `token_usage(created_at)` 索引进入了 migration `0044`。**界面**没有变化——那是后续的波次。

## 28 计划——第 2 波，H2 前线：不编造评分的模型排行（RN-210，ADR 0077） {#programa-28--onda-2-frente-h2-ranking-de-modelos-sem-nota-inventada-rn-210-adr-0077}
handoff 要求两样东西，它们都依赖产品所没有的**同一项**数据：按能力的质量评分（mock："código → claude-sonnet-4 /
qwen2.5-coder:14b (9.4)"），以及当模型覆盖“agent 所要求的所有能力”时在 `ModelPicker` 中显示“ideal”徽章。调查两次确认第二项数据不存在：`ModelsSection` 本身已因此把“Agente · capacidades”一列重命名为只有“Agente”，而 agent binding 的 `ModelPicker` 读取
`GET /projects/:id/models`（`viewer` 角色）——策展（`uses`，ADR 0051）只存在于 `ModelComCuradoria` 中，来自一个仅限 `maintainer` 的路由。徽章**没有**构建；“Melhores modelos por capacidade”表格**构建了**，使用两个真实信号：项目中已有多少 agent 通过级联解析到每个策展过的模型，以及作为平局决胜的目录成本——从不使用计算出的评分。
## 28 计划——第 2 波，B 前线：侧栏可折叠（RN-195..201） {#programa-28--onda-2-frente-b-sidebar-recolhe-rn-195201}
264px/62px，折叠时为图标轨道；可展开的项目会显示标签页（从 `project-tabs.ts` 读取，从不硬编码）；活动区按**真实**的基础 agent/实例分组——`extraDevAgentId` 的 `-2` 后缀，从不是编造的 `-01/-02` 计数器（第 1 波/B0 前线的发现）——并限定在当前路由的项目中，而不是全部，以免产生事件的 N+1。主题按钮在底部；两个无效的全局条目移除，只有项目和活动是全局的；代码标签页通过 `AutoCollapseContext`（`sidebar-state.ts`）自动折叠，不写入偏好。持久化集中在 `sidebar-state.ts` 中，即 handoff 的六个 `brabo.*` 键。

两处与 handoff 的分歧已记录且**未**解决（RN-197）：项目徽章仍然是 `pendingApprovalsCount`（RN-151 胜出，它更新），handoff 的身份颜色只出现在折叠的轨道中——展开的行只保留现有的状态圆点（RN-039），两个圆点会是噪声。
## 28 计划——第 2 波，C 前线：界面框架（RN-202/203，ADR 0078） {#programa-28--onda-2-frente-c-moldura-de-tela-rn-202203-adr-0078}
handoff 中“界面框架”检查清单的四项字面修正：
`.headerTop` 获得了 `min-height: var(--header-h)`——下限，而不是上限，因为项目的标题（身份 + 紧凑的 `TokenMeter`）比 handoff 中 6 个内部界面的通用标题更丰富，强制 60px 会截掉预算告警，这正是 RN-088 禁止的那类错误；活动标签页使用 `box-shadow: inset 0 -2px 0 var(--accent)` 而不是 `border-bottom`；标尺的水平滚动；文档式标签页中内容容器的 `max-width: 1040px`（不包括 `semRespiro` 的）。自第 16 阶段起作为后代 CSS 覆盖存在于 `ProjectPage.module.css` 中的标尺间距值迁移到了 `Tabs.module.css`，现在归属同一个所有者。

需要决定、而不只是 CSS 的部分：handoff 列出 7 个项目标签页，而注册表（`project-tabs.ts`）有 10 个。`executores`（RN-121）、`backlog`
（RN-048）和 `insights`（Psicólogo 的假设）诞生于 handoff **之后**，有真实数据和自己的 RN，它们**保留**——handoff 是**视觉**保真的参考，而不是产品标签页数量的上限（RN-203，ADR 0078）。并且 `sessions` 键仍标为“Chat”，从不是较新的 handoff 所要求的“Chat RAG”（RN-202）：“Chat RAG”会描述一个不存在的功能——embedding 契约已就绪（ADR 0075），但还没有任何东西使用它，没有索引管道，也没有引用 UI——今天重命名标签页，就是 ADR 0042 已经对目录模型拒绝过的错误：在能力存在之前就宣布它。导出的**形式**都没有改变（`AbaDoProjeto`、`ABAS_DO_PROJETO`）；只有 `code` 的标签从 "Code" 改为 "Código"。

## 28 计划——第 2 波，H1 前线：可见焦点（ADR 0036） {#programa-28--onda-2-frente-h1-foco-visível-adr-0036}
`Select`、`Modal`（关闭按钮）和 `ProjectCard` 获得了 `:focus-visible`，与 `Input.module.css` 采用同样经过校准的处理，包括 `forced-colors` 区块：三者都没有仅凭键盘可达的焦点指示。`Modal` 的关闭按钮从 30px 增加到 32px，即桌面端触控目标的下限。`Table` 和 `Badge` 经过审计，**不**需要修改——两者都不暴露自己的交互能力：`Table` 的行纯属展示（需要可点击行的地方已经在单元格内通过 `render` 使用 `<button>`/`<a>`），而 `Badge` 在产品中任何地方都没有配合 `onClick` 使用。

## 28 计划——第 3 波，H3 前线：Criativo 标签页获得 KPI，而不假装拥有不存在的数据（RN-227..230） {#programa-28--onda-3-frente-h3-a-aba-criativo-ganha-kpis-sem-fingir-dado-que-não-existe-rn-227230}
handoff 为会话的 5 种真实状态（`created/active/closing/closed/closed_abnormally`）要求 4 个状态标签。`closed_abnormally`→
中止、`created`→等待 是直接对应的；`closing` **没有**与“已关闭”合并——它获得自己的标签（“encerrando”，`accent` 色调，脉动），因为在 `closing` 状态下结果尚不可知，称它为“已关闭”会就此撒谎。药丸式筛选器（同样原因只有 4 个）按**轨迹**而不是外观把
`created` 和 `closing` 分组：`created` 归入“Ativas”（仍在进行中），`closing` 归入“Fechadas”（正在无错误地关闭）——行上的标签从不被筛选器改写，只改变分组。4 个 KPI 中有两个因数据缺失而保持诚实：“本月成本”**复用** `getMySpend`（与花费标签页相同的 `queryKey`，成员视图/RN-101），从不显示项目总额——那是 owner 的数据（`porProjeto`），而 Criativo 标签页对任何成员可见；“构思 → 提交 比率”被**声明**为缺失（显示“—”），因为如今产品中会话与提交之间不存在关联——编造计算就是 ADR 0042 对模型评分已经拒绝的那类错误。

## 28 计划——第 4 波，G2 前线：Chat RAG 获得索引管道和混合搜索（RN-231..238，ADR 0080） {#programa-28--onda-4-frente-g2-o-chat-rag-ganha-pipeline-de-indexação-e-busca-híbrida-rn-231238-adr-0080}
基于第 3 波的 `chunks` 表（ADR 0079）：对三个诚实的范围进行**手动**索引（没有 watcher，`POST .../rag/reindex`，幂等的完全重建——在重建之前删除该范围/会话）——`docs`/`adr` 通过 `ReadProjectCodeUseCase`（与 Code 标签页相同的凭据/闸门/路径检查），`session` 只取 `chat.message`/`agent.response`。按标题/段落分块，1200 个字符、150 个字符重叠——记录为起点，而不是针对真实数据的校准（目前还不存在针对索引运行的问题集）。混合搜索是**两个**独立的查询（通过 HNSW 的向量、通过 GIN 的词法），以加权和（0.6/0.4）融合，并在阈值（0.2）处截断——这些数字同样是起点。当 embedding provider（固定为
`ollama`）没有响应时，管道会写入**不带**向量的块，并在报告中声明这一缺口——从不假装索引完整，搜索会降级为仅词法并发出警告。界面（Chat RAG 作为独立标签页）属于第 5 波；这条前线只有后端。

## 28 计划——第 4 波，F1 前线：容器生命周期变成表，没有编排器（RN-243..248，ADR 0081） {#programa-28--onda-4-frente-f1-ciclo-de-vida-do-container-vira-tabela-sem-orquestrador-rn-243248-adr-0081}
参见第 25 阶段的第 31 项（**部分撤销**）：`project_containers`
（migration `0046`）记录可变的**状态**——`provisioning → running ⇄
stopped`，`failed` 可从三者到达，`removed` 只能通过重新置备离开——不同于 `artifact.project_image`（Arquiteto 不可变的**决定**）。经调查确认（grep，零出现）：产品中**没有任何**服务挂载 `/var/run/docker.sock` 或以 `privileged` 运行——两个用例都只**写入**和**读取**，没有对 Docker 的任何真实调用。第一次转换要求镜像已经决定（RN-105），并在行中**冻结**版本/资源；`local` 项目（ADR 0072）被拒绝，因为它不启动自己的容器。资源上限（`cpus`/`memory_mb`/`pids_limit`）是**声明**的，而不是施加的——没有任何界面断言“容器被限制为 X”，只说“记录的意图是 X”。当时没有新的 HTTP 路由：在还没有真实使用方时公开一个，就是在猜测契约——由紧随其后的第 5 波/F2 前线关闭。

## 28 计划——第 5 波，G3 前线：Chat RAG 获得独立标签页（RN-252..254，ADR 0082） {#programa-28--onda-5-frente-g3-o-chat-rag-ganha-aba-própria-rn-252254-adr-0082}
RN-202（第 2 波/C）推迟的界面——“Chat RAG”会描述一个尚不存在的能力——随第 4 波/G2 的后端一起到来：`key: 'rag'`，**新**标签页（`ordem: 28`，位于代码和 Backlog 之间），**从不**重命名 `sessions`。区别保持不变，只是理由变了：`sessions` 是与**已激活** agent 的对话（每个回合消耗 owner 的密钥，RN-058）；`rag` 是在已构建索引上的搜索，中间没有任何 agent，本质上只读。界面使用 ADR 0080 的三个契约而不猜测其形式，并显示后端早已声明、却没有任何界面读取的两种诚实降级——`vectorAvailable:
false` 变成可见的警告，覆盖率从不编造“Xmin 前重新索引”。来源为 `session` 的引用会导航到确切的**事件**，复用 Psicólogo 证据标签已在使用的机制；来源为 `file` 的引用以文本显示路径/标题，不带链接——代码标签页如今没有按路径的深链接，不在此范围内。

## 28 计划——第 5 波，F2 前线：容器生命周期的真实使用方（不是终端）（RN-267/268，ADR 0083） {#programa-28--onda-5-frente-f2-o-consumidor-real-do-ciclo-de-vida-do-container-não-o-terminal-rn-267268-adr-0083}
这条前线最初的计划是完整的交互式终端。调查确认第 25b 阶段仍被裁剪：没有服务挂载 `/var/run/docker.sock`，即使在 ADR 0081 之后，生产中也没有任何东西转换 `project_containers`——不存在可以在其**内部**打开终端的真实容器。实现一个假的终端，或者在 Brabo monorepo 的同一个容器中运行的终端（ADR 0055 已经描述为策略而非隔离的那笔债），就是在编造能力——与 ADR 0041/0042 对 LLM provider 和目录模型所拒绝的错误相同。真实的交付：`GET /projects/:projectId/container/lifecycle`
（role:viewer），生命周期第一次通过 HTTP 公开（修订了因缺少使用方而推迟该路由的 ADR
0081），以及显示该状态的终端标签页——翻译后的徽章、失败原因——位于已有说明文字**之下**，从不取代它，只在标签页打开时获取。`null`（从未置备）是如今诚实且最常见的结果。

## 28 计划——第 5 波，I 前线：社交登录撤销 ADR 0031 backlog 的禁令（RN-272..283，ADR 0084） {#programa-28--onda-5-frente-i-login-social-revoga-a-proibição-do-backlog-do-adr-0031-rn-272283-adr-0084}
产品所有者的明确请求，清楚其安全后果——禁令只对 GitHub/GitLab 解除；MFA、OIDC provider 和通用联合仍不在范围内（参见“O que NÃO fazer”）。
`SocialLoginCallbackUseCase` 最终落到与密码登录**相同**的 `EmitirSessaoUseCase`——没有第二种会话格式。它复用现有的 OAuth 客户端，但 `state` 有**自己的**用途
（`purpose: 'social_login'`，在任何其他字段**之前**检查）：从不接受把 git 连接到项目这一**连接**流程的 `state`，那会是权限提升。新表 `social_identities`（migration
`0047`），键为 `(provider, provider_user_id)`——从不是电子邮件/登录名。三步决策：已知身份 → 登录；电子邮件与现有账号匹配**并且**已由 provider 验证 → 关联（如果账号的电子邮件尚未验证，则一并验证）；电子邮件匹配但**未**验证 → 拒绝——输入的电子邮件不是所有权的证明，接受它会打开账号接管的口子；没有对应账号 → 置备一个没有密码的新账号，与 Keycloak 迁移时相同的“待定”状态。复用 git 连接的**同一个** OAuth 应用——零新环境变量，只是每个流程的 `redirect_uri`/`scope` 不同；**操作者**需要在 provider 中登记第二个回调，这一动作正是 `breaking/` 分支的理由。

## fluxo.yml × 代码审计——Dev Lead 的计划变成真正的审批（RN-284，ADR 0086） {#auditoria-fluxoyml--código--o-plano-do-dev-lead-vira-aprovação-de-verdade-rn-284-adr-0086}
这不是计划中的阶段：它关闭了一次只读审计在
`docs/fluxo.yml` × 代码之间发现的分歧（发现 A2，
`docs/explanation/auditoria-fluxo-vs-codigo.md`）——自 ADR 0085 起，流程就已把 `dev-lead` 的输出 `plano-de-paralelismo` 声明为 `via: proposed_action`，而代码从未调整以与之一致。产品所有者判定是代码错了。

`propose_execution_plan` 进入了 `decide.ts`（最低角色
`maintainer`），**故意**放在绝对上限区块之外——它可以被配置为自动批准，不同于
`parallelize`/`raise_max_parallel`。Dev Lead 是**第一个**挂起等待人工决定的对话型 agent（它们都通过最长 180s 的 `GenServer.call` 运行同步回合）——这种模式早已存在于 dev agent（ADR 0052）以及 QA/Infra 的 gate（ADR 0057）中，但这两者由 `cast` 触发，从不需要处理一个待决的同步 `from`。`TurnoAssincrono.tratar_resultado/2` 增加了一个分支：当存在 `:aguardando_aprovacao` 键时（按**值**检查，而不是按存在与否——Dev Lead 自 `init/1` 起就带着 `nil`），它以一贯的方式、在一贯的时刻回复 `from`，但只发出 `agent.status:
awaiting_approval` 而不是 `agent.done`——回合并没有结束。`LiveBroadcast.agent_status/4` 在守卫中加入了这个新状态。恢复使用 `QaLeadServer` 已为 QA 子 agent 复用的**同一个** `Engine.Dev.Wake`（投递按 **agent**，而不是按类型）。

**接受的缺口，已声明**：没有自己的状态表，engine 在 Dev Lead 挂起期间重启会丢失订阅——决定仍然被记录并在审批中可见，但它不会自行叙述结果。关闭这一点需要与 ADR
0052 相同的持久化机制；不在本次修正的范围内，本次修正只是让行为与
`docs/fluxo.yml` 早已声明的内容一致。

## UX Designer——第五个对话型 agent，提前引入（RN-285..287，ADR 0087） {#ux-designer--o-quinto-agente-conversacional-antecipado-rn-285287-adr-0087}
这不是被触发的拆分条件——`docs/fluxo.yml` 一直把“当**被管理**的项目有自己要设计的界面时”声明为标准，而它并没有触发：设计系统仍是静态输入。这是产品所有者**有意识**的决定，仍然提前引入这个角色。

`Engine.Agents.UxDesignerServer` 镜像了 `DevLeadServer`——每个会话一个 GenServer，上限 14 次迭代，由已有的**通用**机制通过寻址到 "ux-designer" 的 `accepted` handoff 激活（`ActivateAgentUseCase` 中没有改动一行）。**独立**：没有领域，没有子 agent。kickoff 读取最新的 `artifact.product_brief`——Criativo 产出的**同一个**“业务需求”，没有新产物——而设计系统（`design/tokens.css`、`design/COMPONENTS.md`）在 agent 的身份中被**描述**（`Engine.Harness.Agents`），是静态文本：对话型 agent 没有读取仓库文件的工具。

`propose_prototype` 是**唯一**的工具（`personas`、`jornadas`、带有 `telas`/`anotacoes` 的 `prototipo`、`resumo`）。它写入
`artifact.prototipo_navegavel`，**在 api 中没有专门的用例**——不同于 `choose_project_image`/`create_c4_diagram`，它们需要用例，是因为其内容**派生**自另一个产物或有共享的领域拒绝；这两个理由在这里都不成立，所以形式校验放在 engine 中（`ArtifactSchemas`），写入使用 api 已公开的通用 `append_event_returning`，与 `artifact.product_brief` 的路径相同。一个产物，基于它的两个 handoff——给 "po" 和给 "dev-lead"——从不为 "spec-visual" 创建第二个产物：原型（界面 + 注释）**就是**视觉规格，复制它会冒两份副本日后分歧的风险。复用了 ADR 0086 设计中脱离其挂起机制后仍成立的那一半：成功的 `propose_prototype` 结束回合，以免模型再次提议而重复产物——没有 "aguardando_aprovacao"，因为提议原型没有外部效果。

`apps/web/src/lib/agents.ts` 增加了条目（`color: var(--accent)`，名册中复用最少的语义 token；`icon: PencilIcon`）。
`uxDesignerActive` 进入了名册，位于 RN-090 要求保持同步的**两个**来源中——团队面板（`agent-status.ts`）和仪表盘卡片（`projects-summary.repository.ts`，扩展了 `infraActive` 的同一查询，没有新查询）。

**超出能力范围，已声明**：`teste-de-usabilidade` 需要真实的人类用户——任何 agent 都无法替代。`metricas-de-uso` 即使在 `analytics` 为 `active` 时仍是缺口（ADR 0089）：漏斗报告衡量的是
会话→提交→PR→合并，而不是 Brabo 所构建项目的**最终**用户对功能的采用——“按功能的采用证据”被**声明**为如今没有途径存在的指标，而不是下一轮要关闭的待办。

## Staff——代码就绪，自动触发处于休眠（RN-305/306，ADR 0088） {#staff--código-pronto-dormente-para-disparo-automático-rn-305306-adr-0088}
这不是计划中的阶段：自 ADR 0085 起，`docs/fluxo.yml` 就把 Staff/Principal Engineer 声明为 `status: planned`（“契约就绪，激活已决定，等待触发器”）。产品所有者**有意识**的决定：提前引入**代码**，即便知道**自动**触发器（Anamnese 注意到一个**反复出现**的系统性问题）不会触发——Anamnese 处于暂停状态（`ANAMNESE_ENABLED=false`，2026-08-10 的决定）。对自动触发是休眠的，对**手动**调用则不是。

第六个独立的对话型 agent（`Engine.Agents.StaffServer`），与 Criativo/PO/Arquiteto/Dev Lead/UX Designer 并列，镜像了 Arquiteto（有界循环，上限 14），有两点不同：**没有** `kickoff/1`（没有可总结的会话产物——它启动后保持空闲，直到第一条 `user_message`，即发出 handoff 的人如何说明问题），以及通过 `canActivateAgent` 的**通用**路径激活（寻址到 "staff" 的 `accepted` handoff），而不进入 `USER_STARTED_AGENTS`——调查确认 api 中不需要任何领域改动，因为
`assertHandoffTargetAllowed` 只拒绝领域的子 agent，而 Staff 没有领域。唯一的工具 `propose_rfc`（问题、带取舍的选项、建议、可丢弃的 PoC）通过 `append_event_returning` **直接**写入 `artifact.rfc_staff`——与 `emit_insight` 同样的无表模式，而不是 `artifact.c4_diagram` 的模式（后者在 api 中从 module_map 派生 Container 层）——并在**同一次**工具调用中把 handoff 交还给 Arquiteto，没有 `proposed_action`（记录一份文档不是外部效果）。

`staffActive` 进入了团队面板的名册和仪表盘卡片（`ProjectCardSummary.roster`），标准与 `infraActive` 相同，以免出现 `RosterFacts` 注释早已警告过的分歧。
**已声明，未隐藏**：`SessionPage.tsx`/`AGENTES_DE_CHAT` 没有被触碰——与已被接受的 `infra` 模式相同（一个**真实**且**活跃**的 lead 同样不在这个列表中）。如今端到端的使用路径是内部路由（`POST .../agent/message`，`agent: "staff"`），而不是会话界面；“手动 handoff 给所选 agent”的通用 UI 仍在 backlog 中。

## `implementavel` gate 激活——QA 策略作为 qa-lead 的第二个时刻（ADR 0090） {#o-gate-implementavel-ativo--qa-estratégia-como-segundo-momento-do-qa-lead-adr-0090}
产品所有者有意识地提前了 `docs/fluxo.yml` 早已预见的触发器（“当 implementavel gate 激活时”）——**这里**的触发器就是构建该机制的工作本身，而不是等待发生的使用症状。`docs/gates.yml`，`implementavel`：
`status: planned` → `active`（所有者 `dev-lead`，`severidade: warn` 不变——注册表早已写明“即使激活也以 warn 诞生”）。

**QA 策略不再是 `proposto` 角色**：它就是 `qa-lead` **本身**，在第二个**时刻**——同一个进程，与 PR 结论分开的交付物，正如 `docs/fluxo.yml` 早已声明的（“可以是 qa-lead 本身在第二个**时刻**，不一定是新 agent：拆分在于交付物”）。`Engine.Gates.QaLeadServer.run_design/3` 是一个**新的**、**附加的**入口（不触碰 `run/2`，即与 `DevAgentState.find_by_task_id` 绑定的一贯路径），由
`Engine.Gates.Dispatcher.run_qa_estrategia/3` 触发（与 `run_qa/2`/`run_secops/2` 已使用的测试中可替换的间接层相同）。

`Engine.Gates.QaEstrategiaAgent` 是**无状态**模块（不是 `GenServer`），与 `QaPerformanceSegurancaAgent` 形式相同——没有 `Terminal` 的注册表（`ReadFile`、`SearchWorkspace`、`EmitPlanoDeTeste`）——但**上下文**不同：`Engine.Gates.QaEstrategiaContext.fetch/3` **只**获取故事（来自 `list_backlog`）和当前的 `module_map`（来自 `get_infra_context`，只复用 `moduleMap` 字段——零新路由），没有 `dev_state` 也没有 `worktree_path`，因为该 gate 在 **DEV 之前**运行：还没有 dev agent、worktree 或 `task_id`。三个工具都不经过 `ActionPipeline`（只有 `terminal`/`write_file` 经过），所以这个 agent **从不**挂起——`run_design/3` 在自身的 `handle_cast` 中同步运行。迭代上限为 8（对话型），而不是 60（gate）——**故意如此**：底下没有 `token_budget_micros`（没有任务，DEV 之前），与 `infra-workflows` 即使使用工具也保持在 8 的原因相同（RN-085）。交付物（`emit_plano_de_teste`：综述、可执行的标准、**通用**且不绑定框架的自动化策略）在发起调用的会话的 event log 中成为 `artifact.plano_de_teste`。

`assess_implementability` 是 Dev Lead 的新工具，读取**自身**会话历史中该故事最新的 `artifact.plano_de_teste`：还没有计划时，触发评估并返回请求重试的错误（工具错误是循环的**输入**，而不是终点——RN-163）；有计划时，以 `proposed_action` 提出意见（`implementavel`/`inviavel` + 理由，计划嵌入 payload），与 `propose_execution_plan`（ADR 0086）**相同**的三结果模式——`maintainer`，**故意**放在 `decide.ts` 绝对上限区块之外。

**`appsec` 不再是 `proposto`**——SecOps 的第二个时刻在下一节中引入。

## appsec 获得 secops 的第二个时刻（RN-360/361，ADR 0090） {#o-appsec-ganha-o-segundo-momento-do-secops-rn-360361-adr-0090}
`docs/fluxo.yml`（`id: appsec`，camada_seguranca）预先声明了“与 QA 相同的模式：两个**时刻**，暂不是两个 agent”——产品所有者有意识地提前激活，不等待注册表本身作为触发器引用的 `implementavel` gate（`qa-estrategia` 前线，同属概念上的 ADR 0090）。

`Engine.Gates.SecOpsAgentServer.run_design/2` 在 PR 的 secops **同一个**进程中运行（相同的 `Registry` 键），没有任何 `Diff`/`Scanner`/
`DevAgentState`：它在 backlog 中获取故事 + 当前的 `module_map`
（`Engine.Gates.AppSecContextBuilder`，没有 `dev_state`/`worktree_path`），并调用 `Engine.Gates.AppSecAgent.run/3`——**无状态**模块（不是 GenServer，与 `QaPerformanceSegurancaAgent` 形式相同），工具注册表**没有** `Terminal`，通过 `ToolLoop.run/1` 在故事的**设计**上（从不是代码上）运行一个 STRIDE-lite 检查清单。它以发出 `artifact.threat_model` 结束，并为声明的三个 lead 创建 handoff（arquiteto、dev-lead、
`infra`——id `area-infra` 的可寻址 **agent**，RN-361）。

**已声明的缺口，不是 bug**：`run_design/2` 是**可触发**的，但还没有任何东西会自动触发它——自然的触发器是 Dev Lead 的 `assess_implementability`
（`qa-estrategia` 前线），不在本次交付范围内，本次交付保持自包含（`decide.ts`/`docs/gates.yml`/`dev_lead_tools.ex` 未被触碰）。

## `analytics`/`delivery-metricas` 变成报告（RN-320..322，ADR 0089） {#analyticsdelivery-metricas-viram-relatório-rn-320322-adr-0089}
产品所有者有意识地**提前**引入目标模型的两个角色（`docs/fluxo.yml`，`status: proposto`），而不等待它们各自已声明的自然触发器。形式正是流程本身所规定的：`analytics` “被 `medicao` 吸收”，直到**产品**指标成为 PO 的必需输入；`delivery-metricas` “从不成为 agent——成为 `medicao` 的**报告**”。两者变成**一个**脚本——
`apps/api/scripts/analise-funil.ts`（`pnpm --filter api analise:funil --
--projeto <uuid> [--json]`），与 `medir-execucao.ts`（第 13b 阶段）**相同**的格式：通过 Drizzle 纯读取，零写入，没有 GenServer，没有 LLM agent。

它基于 dev agent 三个 git 动作（`git_commit`/`pr_open`/`git_merge`，只取 `status:
'executed'`）的 `proposed_actions.execution_result` **真正**测量：真实漏斗（多少会话产生了提交 / 打开了 PR / 合并了 PR，以及各阶段之间的转化——计数的是**会话**，不是动作）、真实的前置时间（会话从第一次提交到第一次合并，依据**执行**的 `updated_at`，而不是提议的）以及真实的部署频率（合并到 `PROTECTED_BRANCHES` 分支，按天，通过引用与 `docs/gates.yml` 的 `backmerge` gate 交叉——后者的证据是 CI，超出了只读数据库的脚本的能力范围）。

三个指标放在“Não medido, de propósito”一节中——这是**永久**声明，而不是下一轮要关闭的缺口：**完整的产品漏斗 构思 → 提交**（`sessions` 没有 `storyId`，RN-230，需要新的 schema——本前线没有 migration）；**按功能的采用证据**（这不是缺少收集的数据——Brabo 不对它所**构建**的项目做埋点，如今没有任何途径让这种遥测存在）；**MTTR 和变更失败率**（需要真实生产**事件**的信号，与 `secops-runtime`/`platform` 相同的依赖——另一条前线）。

## `secops-runtime` 作为报告脚本（RN-375..377，ADR 0091） {#secops-runtime-como-script-de-relatório-rn-375377-adr-0091}
产品所有者决定提前引入 `secops-runtime` 角色
（`docs/fluxo.yml`，`camada_seguranca`，之前为 `proposto`），而不等待声明的触发器（“有真实流量的生产，在 `DEPLOY_ENABLED` +
`platform` 激活之后”）。只有触发器**不**需要的部分进入：`pnpm --filter api
relatorio:seguranca-runtime` 读取 `rate_limit_hits`——ADR 0027 的 `RateLimitGuard` 已经在写入的数据，包括在 dev/CI 流量下——并生成桶的排行（`user:<uuid>`/`ip:<endereço>`，仅有的两种记录格式；没有路由也没有原因，表从未保存过它们）以及固定时间片的时间分布。它是**脚本**，不是 LLM agent 也不是
`GenServer`：对数据没有要做的决定，只有聚合。

自动事件检测、事件响应和安全事后复盘仍然**排除在外**——它们依赖同一个未触发的触发器——报告把它们列在一个**永久**的“não medido”一节中，不模拟示例事件，也不编造数字（与 ADR 0041/0042/0077 相同的原则）。保留的窗口按设计很短
（`DomainGaugesCollector.pruneRateLimit` 删除早于
`2 × RATE_LIMIT_WINDOW_MS` 的命中，默认 240s），报告声明两个窗口——**配置的**和**观察到的**——从不让后者冒充比实际更长的历史。

## `platform` 获得第一个交付：按需遥测报告（RN-385/386，ADR 0092） {#platform-ganha-uma-primeira-entrega-relatório-de-telemetria-sob-demanda-rn-385386-adr-0092}
产品所有者有意识地提前引入 `platform` 角色的一部分
（`docs/fluxo.yml`，`camada_plataforma`）——其 `status` 仍为 `planned`，其 `ativacao` 仍与不存在的 `DEPLOY_ENABLED` 同步。
`pnpm --filter api relatorio:telemetria [--projeto <uuid>] [--json]` 是一个**脚本**（不是 LLM agent，不是 `GenServer`），按需读取 `DomainGaugesCollector` 已经为 Prometheus 抓取所收集的**相同**问题——按项目的活跃/closing 会话、按项目被阻塞的任务、最后一次备份的状态（总是**全局**的，从不按项目，因为产品备份的是整个数据库）——打印后即结束。SQL 查询是**复制**的，而不是从采集器导入的：采集器的方法是私有的，并且以写入 Prometheus gauge 结束，没有可以复用的纯“只查询”的一半，复用会把 CLI 脚本耦合到一个 `@Injectable` 的生命周期上。

输出总是带有“哪里可以看到更多”（`deploy/k8s/observability/dashboards/*.json` 中的版本化仪表盘、
`deploy/k8s/observability/alerts/brabo-alerts.yaml` 中的告警、`docs/runbook.md
#observabilidade`、用于本地可观测性的 `pnpm dev:obs`）——链接，从不重复——以及一个**声明**而不编造的“não medido”一节：产品中没有定义任何数值 SLO，事后复盘依赖尚未发生的真实事件，而以闭环方式回流到产品的遥测才是让 `platform` 变为 `active` 的东西——触发器（`DEPLOY_ENABLED`）仍然缺失。该角色的
`gate_saida: { id: operavel, status: planned }` 不变；`docs/fluxo.yml` 只在输出 `telemetria-consolidada` 上增加一条 `nota`，说明手动/按需版本已经是真实的。

## dbre 变成两个机械脚本（RN-400..403，ADR 0093） {#dbre-vira-dois-scripts-mecânicos-rn-400403-adr-0093}
fluxo.yml 的 `dbre` 角色的四个交付物中，只有两个依赖真实的数据量（`plano-de-capacidade`、`tuning`——仍是缺口，没有期限）。另外两个不需要真实负载：`parecer-de-
migracao` 是对 SQL 文本的模式识别
（`apps/api/scripts/lint-migracao.ts`，扫描 `apps/api/src/db/migrations/
*.sql`，标出 `DROP TABLE`/`TRUNCATE`/`DROP COLUMN`/`ALTER COLUMN ...
TYPE`/不带 `DEFAULT` 的 `ADD COLUMN ... NOT NULL`，发现任何情况就 `!= 0`——如今在已合并并被接受的 migration 中发现 3 处，仅供参考，没有顺手修正）；`backup-restore-testado` 自第 5 阶段起就已是真实的（CronJob + `backup_runs` + 已执行的 `make test-restore`，RTO 约 40s）——只缺一个按需报告（`relatorio:backup`，与 `DomainGaugesCollector.collectBackup()` 相同的读取）。两者都还没有进入 CI：linter 扫描的是整个仓库，而不是某个 PR 的 diff，会变成因不属于该 PR 的发现而让 PR 失败的 gate——当这一点改变时，范围限定的技术参见 ADR 0093（`pr-police.ts`）。“每波一个 migration”的规则（`meta/_journal.json`）不再被称为这个角色的“机械化版本”：它避免的是并行 agent 之间的快照冲突，这与“这段 SQL 有风险模式”是正交的关注点。

## fluxo.yml × 代码审计——第 1 波：fluxo.yml/gates.yml 保持最新 {#auditoria-fluxoyml--código--onda-1-fluxoymlgatesyml-em-dia}
审计计划（D 节，
`docs/explanation/auditoria-fluxo-vs-codigo.md`）六个波次中第一个关闭的——第 3、4、5 波已经提前且不按顺序完成（analytics/DORA、`implementavel` gate、QA 策略/appsec）；这一波只是元数据，没有 ADR，没有一行生产代码。

`docs/gates.yml`（`paralelismo-autorizado`）：`status: planned` → `active`，`evidencia` 与相邻的 `implementavel` gate **格式相同**——
`event_types: [proposed_action.created/approved/denied]`、`filtro: {
actionType: parallelize }`、`onde:
request-parallelization.use-case.ts`（发现 A1/B5——自 ADR 0053/第 14d 阶段起 `fluxo.yml` 就已写着 `ativo`，只有 `gates.yml` 落在后面）。
`docs/fluxo.yml` 又获得了审计的三项修正，全是引用或标签，没有一项涉及行为：`dev` 的状态机从 4 个状态变为 5 个（加入了 `awaiting_approval`，第 12e 阶段/ADR 0052——A3）；RN-160 的引用从 Arquiteto 的 `backlog-promovido` 输入移到了它真正适用的地方，即 `handoff-duplo` 输出（它所锁定的“Confirmar arquitetura pronta”按钮——A4）；RN-161 的引用从 `handoff-duplo` 移出，变成 Dev Lead 输入上的一条注释（串联激活执行的是**接受** handoff 这一步，而不是双重 handoff 本身——A5）；`dev` 的 `worktree-por-agente` 的来源不再写作
`harness`（`Engine.Dev.WorktreeManager` 不是 `harness` 角色的 4 个组件之一——A8）。`docs/explanation/backlog.md` 也已更新：过时的 `gates.yml` 那一行从待办表中移除（在此关闭），连同 `implementavel` gate（B3，在本波之前已由 ADR 0090 关闭，却没有人把它从表中删掉），以及 `analise:funil`
（ADR 0089）已经真正交付的 B7 部分（部署频率/前置时间）——MTTR/变更失败率仍被排除，但作为已在 `fluxo.yml` 中声明的**永久**缺口，而不是工程待办。

验证：`pnpm --filter api validacao:gates -- --sem-banco`（注册表有效，没有 `ativo-sem-evidencia`）和 `pnpm docs:check` 为绿色。脚本的第 3 阶段（event log 中的真实证据）需要针对有数据的数据库使用 `--projeto <uuid>`——超出本次只涉及元数据的修正范围。

**同一计划中的待办，不属于本波**：第 2 波（Dev Lead → dev 委派，RN-160 在后端重新校验）和第 6 波（`necessidade-validada` gate，编码前需要 ADR 和产品决定）。

## fluxo.yml × 代码审计——第 2 波：后端中的 RN-160 以及 Dev Lead → dev 委派（RN-404/405，ADR 0094） {#auditoria-fluxoyml--código--onda-2-rn-160-no-backend-e-delegação-dev-lead--dev-rn-404405-adr-0094}
审计计划（D 节）六个波次中的第二个，是第 1 波之后范围**最大的两项**——其余四个中，3、4、5 已提前且不按顺序完成；6 仍待处理，需要 ADR 和产品决定。两项都只存在于 `apps/api` 中；`engine`/`web` 不需要任何改动。

**B6——RN-160 在后端重新校验。** 该规则（“Confirmar arquitetura
pronta”至少需要 1 个已推进的故事）只在**客户端**得到保证
（`SessionPage.tsx`，`hasPromotedStory`）——直接对
`POST /agents/arquiteto/handoff-infra` 发起 HTTP 调用会完全绕过该规则。
`OfferInfraHandoffUseCase.execute` 现在会查询
`StoryRepository.findByProject`，当没有任何故事的 `status !== 'draft'` 时，在写入事件或调用 engine **之前**以 `BadRequestException` 拒绝。

**B1——Dev Lead → dev 委派变成数据。** ADR 0053（第 5 项）早已预见这一点，并在当时声明为超出范围——CLAUDE.md 将其列为可撤销的裁剪。在此关闭：`AcceptParallelizationUseCase.execute`
（API 侧，顺带覆盖直接路径**和**已批准路径，因为两者本来就汇聚于此）写入 `delegations`，`area: 'dev'`、`leadAgent:
'dev-lead'`、`subagent` = 刚激活的 `dev-<modulo>` 的 id。与 QA/Infra 不同（它们在 **ENGINE** 侧写入，因为子 agent 在那里产出意见），`status: 'completed'` 对这个领域被**重新定义**：它表示“委派已**生效**”（agent 已启动），而不是“已出具意见”——`parecerArtifactId` 指向项目最新的 `artifact.module_map`（通过 `SessionEventRepository.listByTypeForProject`，已有方法，没有新查询）。项目中没有 module_map 时——这本不该发生——委派不会以伪造的 id 写入：只记录这一意外状态并继续，因为在尝试写入时 dev agent 的激活已经成功；`RecordDelegationUseCase` 的失败出于同样理由也不会让激活失败。该决定记录在 ADR 0094 中，它也撤销了 ADR 0053 第 5 项的裁剪。

`docs/fluxo.yml`（`dev-lead`，输出 `delegacao`）：`status: lacuna` →
`status: ativo, regra: RN-405`。

## fluxo.yml × 代码审计——第 6 波（最后一波）：`necessidade-validada` gate（RN-406，ADR 0095） {#auditoria-fluxoyml--código--onda-6-última-o-gate-necessidade-validada-rn-406-adr-0095}
关闭审计计划（D 节，
`docs/explanation/auditoria-fluxo-vs-codigo.md`）六个波次中的**最后**一个——六个都已关闭：3、4、5 已提前且不按顺序完成（analytics/DORA、`implementavel` gate、QA 策略/appsec，ADR 0089/0090）；1 和 2 在之前的 PR 中关闭（fluxo.yml/gates.yml 保持最新；后端中的 RN-160 + Dev Lead → dev 委派）。这是第 6 个：`necessidade-validada` gate（Criativo → PO），自 ADR
0085 起声明为 `proposto`，背后没有任何机制。

`modelo-de-time.md` 早已记录它为何停滞：由 Criativo（模型）自行判定它自己产出的需求已经验证，是自我验证，而不是真正的 gate。产品所有者的决定是**单独**的人工确认——`SessionPage.tsx` 中的第三个按钮“Confirmar necessidade validada”，与“Confirmar arquitetura pronta”（RN-160）**相同**的模式：专用路由
（`POST .../agents/criativo/validate-necessity`）、专用用例
（`ValidateNecessityUseCase`）、自己的事件（`necessity.validated`）。从不复用 `confirm_readiness`/RN-142（它仍然只是结构性的底线，“≥1 条已捕获的规则”），也不复用 PO 对 handoff 的接受（`AcceptHandoffUseCase`，结构性的，不对内容作判断）。

选择的串联方式：按钮只在 `confirm_readiness` 已经整合出 `artifact.product_brief`（`hasProductBrief`）**之后**才启用——“验证”一个尚不存在的摘要没有意义，这也是与 `docs/fluxo.yml` 最一致的解读（该 gate 是 Criativo 的**输出** gate，即它的工作已交付具体产物的时刻）。与 `OfferInfraHandoffUseCase` 不同，这次确认**不**通知 engine——Criativo→PO 的 handoff 已经在 `confirm_readiness` 内部发生，所以新事件只是对**实质**的记录，没有任何触发器在等待它。

`docs/gates.yml` 增加了 `necessidade-validada` gate：`active`、
`aprovacao_humana: true`，但 `severidade: warn`——如今产品中没有任何东西会在放行 PO 之前**查询**这个 gate 的通过情况，不同于 `story-promovida`/`plano-de-adocao` 的 `block`，它们背后有真正的代码锁。`docs/fluxo.yml`（`criativo`，`gate_saida`）：`status:
proposto` → `status: ativo, regra: RN-406`。

## fluxo.yml × 代码审计——B4（**最后**一项待办）：PO 读取产品指标（RN-407） {#auditoria-fluxoyml--código--b4-a-última-pendência-o-po-lê-métricas-de-produto-rn-407}
关闭 B4 项——`docs/explanation/backlog.md` 中“团队模型 backlog（ADR 0085）”表格的最后一行；此次修正后该表为**空**，fluxo.yml × 代码审计到此结束。没有新 ADR：遵循 RN-164 已确立的模式（限定在项目范围的 agent 读取，没有外部效果，没有 `proposed_action`），只新增一条 RN。`docs/fluxo.yml`（`po` 角色，输入 `metricas-de-produto`）：
`status: lacuna` → `regra: RN-407`。

**数据**自 ADR 0089 起就已存在（`analise:funil`——真实漏斗 会话 → 提交 → PR → 合并、真实前置时间、真实部署频率）；缺的只是 PO 能在回合内**读取**这份报告。PO 的第三个读取工具 `listar_metricas_de_produto`
（`GET .../product-metrics`），与 RN-164 的两个姊妹工具设计完全相同——`:direct`，无参数，范围封闭在项目中。纯**计算**函数和查询（`calcularFunil`/`calcularLeadTimes`/
`leadTimeMedioMs`/`deploymentFrequencyPorDia`/`buscarAcoesGitDoFunil`）从 `apps/api/scripts/analise-funil.ts` 迁移到
`apps/api/src/application/services/funil-metrics.ts`——**机械且必要**的重构（`scripts/` 不能放在 `src/` 中，`src/` 也不从 `scripts/` 导入）：脚本改为从那里**重新导出**，签名和行为都不变，脚本的回归测试未经修改仍为绿色。JSON 响应体中没有字段表示脚本早已只用文字声明的三项永久缺失（完整的产品漏斗 构思 → 提交、按功能的采用证据、MTTR/变更失败率）——PO 的工具总是在它返回给模型的**文本**中点名它们，以免模型因数字缺席而得出不存在缺口的结论。

## GOVERNANCE.md——`community` 模式的标准，而不是它的机制 {#governancemd--o-critério-do-modo-community-não-o-mecanismo-dele}
之前 backlog 中的一项（“approval-ladder 的 community 模式”）变成了记录上的修正，而不是实现：调查确认 `community` 模式自第 6 阶段起就已存在于代码中（`scripts/ci/approval-ladder.ts`），两侧都经过测试，只是被 `APPROVAL_MODE=solo`（默认）关闭。backlog 中的那句话（“变成 gate 注册表中 `aprovacao_humana` 的变更”）来自 ADR 0054 中一行**推测性**的文字——按规则未编辑，但这种不精确已记录在 `docs/explanation/backlog.md` 中：`aprovacoes-da-escada` gate 的 `aprovacao_humana` 在两种模式下都已固定为 `true`，`Gate` 的 schema 中没有任何对 `APPROVAL_MODE` 作出反应的字段。

真正缺失的是另一个 `TODO(humano)`，位于
`docs/explanation/branching-policy.md`：每个审批人列表（`devs`/`po`/`gestão`）由谁加入的标准——谁加入、谁退出、依据什么。`GOVERNANCE.md`（仓库根目录，新文件）关闭了这一点：**机制**仍在 `branching-policy.md` 中（阶梯、不同的人、更换变量的分步说明），**标准**改为位于 `GOVERNANCE.md`。它是提议，而不是正在运作的委员会——项目仍然只有一位维护者，文档对此直言不讳：其大部分内容描述的是**当**有更多人时开始生效的东西，而不是已经运转的结构。docmap 中新的 `warn` 规则（`governanca`）在 `approval-ladder.ts`/
`branching-policy.md` 变化时要求复审——与现有的 `block` 规则
（`politica-de-branches`）分开，原因与 `checks-e-rulesets` 与它分开相同：**机制**源于代码，**标准**是人的决定。

## MailSender 中的真实 SMTP（RN-408，ADR 0096） {#smtp-real-no-mailsender-rn-408-adr-0096}
关闭自移除 Keycloak（ADR 0032，“真实 SMTP 仍是未来的配置”）以来一直开放的 backlog 项。基于纯 SMTP 传输的 `nodemailer`（带状态/MIME/STARTTLS/AUTH 的**行**协议，不同于产品其余部分集成的 JSON HTTP API），位于 `MAIL_TRANSPORT` 之后——`log`
（默认，**包括**生产：真正发送邮件是操作者的选择性开启）或 `smtp`，由 `AuthUseCasesModule` 中的 `useFactory` 选择，不触碰任何用例（`RegisterUseCase`、
`RequestPasswordResetUseCase`、`LoginUseCase`、脚本
`migrate-keycloak-users.ts` 仍然只是注入 `MailSender`）。
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` 在模式为 `smtp` 时在生产中遵循 RN-114 模式——但**没有**最初四个 RN-114 机密那样的公开默认值，所以只有当操作者选择了 `smtp` 时这把尺才会生效；校验在 `SmtpMailSender` 的构造函数中运行，由组装 provider 图时的 `useFactory` 触发（与 `CREDENTIALS_MASTER_KEY` 设计相同），而不是在 `main.ts` 中的即时调用。正文为**纯文本**，从不是 HTML——端口不承载富正文的结构，模板引擎会是毫无收益的注入面。

调查在编码前发现了一个真实缺口：`email_verification` 没有任何 web 路由——`verificarEmail` 自第 7a 阶段起就存在于
`apps/web/src/lib/auth.ts` 中，却**没有任何**调用方，所以一旦 SMTP 开始真正发送邮件，验证邮件中的链接将通往无处。`/verificar-email`
（`VerifyEmailPage.tsx`）关闭了这一点，镜像 `SetPasswordPage.tsx`——`router.tsx` 中相同的 `validateSearch` 模式，对不存在/过期/已使用的链接给出相同的唯一响应——只有一点不同：没有表单，确认在挂载时自动触发，所以界面需要 RN-088 的三种状态（加载中/错误/成功），而不只是两种。
## 仪表盘上的“N 个 agent 在线”——**实时**状态，从不是历史存在（RN-409，ADR 0097） {#n-agentes-online-no-dashboard--status-ao-vivo-nunca-presença-histórica-rn-409-adr-0097}
之前 backlog 中的一项已关闭。事先调查确认，无论按项目还是按 workspace，都不存在任何存活性聚合——只有**历史**存在（`RosterFacts`，“曾经出现过”），而真正的实时状态只在客户端，派生自 event log，并且只在项目**打开**时才有。`ProjectCardSummary.onlineAgentCount` 用**同一把**尺（“不空闲，不卡住”）把两个机制加总：dev agent
（`engine.dev_agent_states.status NOT IN ('idle', 'idle_tripped')`，在 engine 中批量聚合）和对话型 agent（最近会话的最后一个 `agent.status` 满足 `status !== 'idle'`，`payload` 只接受
`working`/`idle`/`awaiting_approval`）。QA/SecOps 从不计入——它们不发出
`agent.status`，每次调用只给出一个结论，在调用之间没有“空闲”的概念。

值得记录的架构决定：查询**直接**读取
`engine.dev_agent_states`，通过按 workspace 批处理的原始 SQL，放在 RN-090 读模型已经汇总十一个查询的**同一个** `Promise.all` 中（十二 → 十四，仍然**恒定**）——而不是在 engine 中打开一条新的内部 HTTP 路由。`api` 和 `engine` 共享**同一个**物理数据库，只由 Postgres schema 分隔，并且已有先例
（`apps/api/scripts/medir-execucao.ts` 已经读取 `engine.oban_peers`）；这个决定把这一模式从手动脚本提升为**经过测试**的生产代码（在
`test/support/global-setup.ts` 中为 engine 的表提供最小且声明的 fixture）。ADR
0097 中接受并声明的后果：查询假定运维产品的人会同时迁移两侧（`db:migrate` **和** `engine:migrate`），如果只有 api 迁移，它会响亮/可见地失败——没有 try/catch 隐藏错误。

## 有待处理 dev agent 时，执行会话不再关闭（RN-411） {#sessão-de-execução-não-fecha-mais-com-dev-agent-pendente-rn-411}
修复的是在一次**真实**执行会话中发现的缺陷，而不是脚本条目：五个 dev agent 启动，进入 `idle_tripped`（RN-047，断路器），卡住等待用户逐个解除任务阻塞，而会话 30s 的心跳（`Engine.Sessions.SessionServer`）在手动解除阻塞仍在进行时从底下关闭了会话。`GetSessionPendingWorkUseCase` 的第三个信号（RN-064）只读取
`agent.status`，即对话型 agent 的词汇——dev agent 使用 `dev.*`（`Engine.Dev.AgentIo`），从不发出 `agent.status`，所以没有任何 dev agent 曾经通过这个信号保住会话。第四个信号读取会话中每个 `dev-<modulo>`/`dev-<modulo>-2` 的最后一个 `dev.*` 事件：`dev.working`/`dev.blocked`/`dev.idle_tripped` 保住会话（卡住等待人工决定**就是**待处理的工作）；只有 `dev.idle`（真正排空）不保住。`dev.awaiting_gate`/`dev.awaiting_approval` 由 RN-412 **加入**了这把尺——见下文；本段所描述的残留缺口已关闭。
## 注册时自动创建个人 workspace（RN-410） {#workspace-pessoal-automático-no-cadastro-rn-410}
浏览时发现：仪表盘上的“Novo projeto”按钮什么也**不**做，也没有错误。根本原因：`RegisterUseCase` 和 `SocialLoginCallbackUseCase`（在置备新账号的分支中）创建了用户和凭据，却**从未**创建 workspace——**每一次**新注册都撞上这堵墙，之前没有显现只是因为 `seed.ts` 总是随演示数据一起创建一个 workspace。现在这两处都在创建账号的**同一个**事务中创建 workspace，并把用户添加为 `owner`。名称/slug 来自唯一的纯函数 `nomeESlugDoWorkspacePessoal`（`domain/auth/personal-workspace.ts`），以免规则在两个文件中分歧；slug 总是加上
`userId.slice(0, 8)` 后缀（与 `extraDevAgentId` 相同的模式），从而无需往返数据库即可唯一（RN-410）。

## PR 上的 413 与“没有执行”的执行者——两端以及串联（RN-412，ADR 0098） {#413-nas-prs-e-executores-sem-execução--as-duas-pontas-e-o-encadeamento-rn-412-adr-0098}
这不是计划中的阶段：由真实**使用**提出的修复（“nas PRs sempre está
estourando entity too large”），加上姊妹缺陷——执行者标签页在真实工作进行时显示为空。调查发现两者是串联的：gate 以 `413` 死掉 → dev 卡在
`dev.awaiting_gate` → 这个状态不保住会话（RN-411 的缺口）→ 30s 的心跳从底下关闭会话 → 标签页要求活跃会话，整个名册随之消失。

**413 的原因在 Brabo 的 API，而不在 LLM provider**——把错误归咎于 provider 的注释（`runtime.exs`、
`terminal_executor.ex`、`docker-compose.yml`）是错的；
`FalhaDeTurno.origem({413, _})` 早已把它归类为 `"codigo"`，这是对的。`apps/api/src/main.ts` 从未配置 Express 的请求体限制——使用的是 100 KB 的默认值，远低于 Phoenix 接受的 8 MB，而且是在传输最重的方向上（engine → api，
`POST /internal/sessions/:sessionId/llm-turn`，在 ToolLoop 的每次迭代中重新发送**整个**历史）。`API_JSON_BODY_LIMIT`（默认 10 MB）堵住了传输这一端。

第二端——没有它，提高限制只会推迟溢出：engine 的 `ContextManager`（ADR 0098）有**两个**缺陷，让压缩在请求体溢出之前无法触发——`estimate/1` 只计算 `content`，所以满是 `toolCalls` 的 `assistant` 消息在估算中几乎为零 token；压缩窗口只使用 `context_window`（gate agent 中为 128.000 个 token），这相当于压缩前约 350 KB——远远超过任何合理的传输上限。**有效**窗口现在是
`min(context_window, teto_de_transporte)`，截断总是在 ToolLoop 的**迭代边界**上（从不把带 `toolCalls` 的 `assistant` 与回应它的 `role: "tool"` 分开——那会破坏 provider 的 tool-use 协议）。

**RN-412** 扩展了 RN-411：`DEV_PENDING_TYPES` 加入了
`dev.awaiting_gate`（原始论证——gate 可能死掉，把 dev agent 无限期卡在这个状态），也加入了 `dev.awaiting_approval`，依据调查中发现的新论证：审批决定**同步**写入 `proposed_actions.status`，但通过 outbox/Oban 恢复 dev agent 是**异步**的——在两者之间的窗口中，没有任何东西保住会话，这是 RN-411 的同一缺陷，只是深了一层。

**执行者/概览标签页**在 web 侧有姊妹缺陷：
`executionActivated` 派生自对 `useSessionEvents` 仅 200 个事件窗口的 `events.some(...)`——`execution.activated` 是会话**最早**的事件之一，在任何真实执行中都会滑出窗口，抹掉整个名册。正确的值早已存在，聚合了**所有**事件，位于 workspace 摘要中（RN-090，
`projects-summary.repository.ts`）——两个界面都改为使用这个值。途中的额外发现：`ExecutionSection`（概览）又在同一个窗口上独立地重新计算了一次 `activated`——长时间的执行会再次提供“Ativar execução”，就像从未开始过一样；一并修复。`gatesEverOpened` 存在**同一类**缺陷，被**声明**为已知限制，这里没有修复——修复它需要改变 `deriveAgentRoster`/`rosterFactsFromEvents` 的签名，超出本次定点修正的范围。

## Neo4j 作为知识图谱——基础（RN-413/414/415，ADR 0099/0100） {#neo4j-como-grafo-de-conhecimento--a-fundação-rn-413414415-adr-00990100}
产品所有者的请求：Neo4j + `ollama-model-loader`（gemma:1b、
yi-coder:1.5b、nomic-embed-text），明确受到仓库
[ErickWendel/neo4j-ai-experiments](https://github.com/ErickWendel/neo4j-ai-experiments)
的启发——在 ADR 0099 和 `prompts/README.md` 中记录了致谢，感谢它对“prompt 作为版本化文件，而不是困在代码中的字符串”这一模式以及将图谱作为 agent 记忆的具体启发。

两项职责，一个基础：**版本化的 prompt 模板**
（`PromptTemplate`/`PromptVersion`，按哈希幂等——RN-413）和
**关系型记忆**（交互、带证据的 Psicólogo 假设、Anamnese 画像、handoff——真正的消费是未来的波次，本次交付只构建机制）。图谱是**派生**记忆，从不是事实来源；pgvector 仍然是块的向量索引，不在两个数据库中重复 embedding。驱动 `neo4j-driver` 在 api 中（而不是在 engine 中）——api 已经拥有全部持久化和 RAG，engine 一如既往通过带 service token 的内部 HTTP 使用它。

`rag_search`（RN-414）填补了现有 RAG 最大的空白：没有任何 agent 查询它，只有 web 的“Chat RAG”标签页。engine 中的新工具，有自己的上限（RN-150），降级总是在给模型的文本开头可见。
`ollama-model-loader`（RN-415）修复了一个独立的真实 bug：`nomic-embed-text` 从不会被自动拉取，在任何干净的环境中 RAG 都会静默地降级为仅词法。

第一批模板提取到 `prompts/*.md` 中（ux-designer、Psicólogo、Anamnese、`ContextManager` 的摘要）。

## 图谱的消费——模板不触碰 GenServer，相关性不取代时效性（RN-416/417，ADR 0101） {#consumo-do-grafo--templates-sem-tocar-genservers-relevância-sem-substituir-recência-rn-416417-adr-0101}
`InstructionFiles` 获得了 `:graph` 来源（`db > graph > dir > root`——用户的 `instruction_patch` 仍然胜过一切），**三个** agent 开始**尝试**在内联文本之前从图谱解析模板，内联文本变成了必需的回退：ux-designer（`graph_instruction_templates_enabled?`）、Psicólogo 和 Anamnese（`graph_templates_enabled?`，两者共用同一个键）。两个开关，而不是一个——如果共享键，在并行前线之间会因**相反**的默认值而冲突；两个默认值都是 `false`。在这批四个模板中，当时只有 `context-manager-summarize` 没有使用方——ADR 0101 声明为开放的缺口，后来由**同一个** `graph_templates_enabled?` 的**第四个**使用方关闭：`ContextManager` 的摘要 prompt（`prompt/1`，参见 RN-417）。

`Psychologist.ContextBuilder`/`Anamnese.ContextBuilder` 获得了**第二个**上下文来源——`rag_search`，查询派生自分析的触发器——与一贯的最近/时间窗口读取**组合**，从不取代：没有命中时，行为与以前完全相同。片段进入 `Triage` **现有**的预算，RAG 的 `degraded: true` 在上下文中总是可见，从不隐藏。

图谱自行写入：`GraphProjector`（api）排出**第二**条 outbox 行（`aggregateType: 'graph_projection'`，同一事务，engine 的过滤器——`IN ('session', 'task')`——永远不会匹配这个值，从而避免与已经在约 2s 内排出 `'session'` 的 `Engine.Outbox.Drain` 竞争），并调用已有的写入用例。engine **从不**直接写入图谱——这保持了 event log 作为唯一事实来源；图谱可以通过重放重建。

**验证期间的真实发现，之所以记录是因为它有教益**：RN-412 的请求体限制测试（`apps/api/test/main.spec.ts`）有一个**潜在**的 bug——在文件顶部**静态**导入的 `AppModule` 会在 `beforeAll` 能把 `DATABASE_URL` 指向测试库**之前**就求值 `DrizzleModule`（它在**模块**作用域、而不是在 Nest 的 factory 中创建连接池）。只要本地 dev 库也已迁移，问题就被掩盖了（同一张表，所以即使指向错误的地方，查询也“找得到”）；一旦 dev 库被重建为空（由这一波本身针对 Neo4j+Postgres 的真实冒烟测试导致），问题就暴露了。修复方法是在 `beforeAll` 中、在 `DATABASE_URL` 设置之后使用**动态**的 `await import(...)`——每当测试需要为真实的 `AppModule` 重定向 `DATABASE_URL` 时，都应遵循这一模式。
