---
traducao_de: c165be09458a5dfdc42010867a29adf8a36ccd99
id: rn-produto-parte-01
title: 'Regras de negócio — Produto — 第 1 部分 (自 RN-012)'
sidebar_label: 'Produto — 第 1 部分 (自 RN-012)'
description: 'As RNs hospedadas na raiz produto.'
keywords: [regras de negócio, produto]
---

# Produto — 第 1 部分 (自 RN-012)

## Backlog

<a id="rn-012"></a>

### RN-012 — 从 `module_map` 中移除的模块会使用户故事降级 {#rn-012}

关联到一个已不存在的模块的用户故事会回到 `draft`，并产生一个
`backlog.story_demoted` 事件。

- **位置：** `apps/api/src/domain/architecture/module-resolution.ts`；事件在
  `application/use-cases/architecture/create-module-map.use-case.ts:73` 中发出
- **测试：** `test/domain/architecture/module-resolution.spec.ts`

## 项目面板

<a id="rn-096"></a>

### RN-096 — 每个决定都用葡萄牙语说明会发生什么；原始 payload 生来折叠 {#rn-096}

每种 `proposed_action` 都有一句描述批准效果的**葡萄牙语句子**，它是卡片上第一眼可见的东西——在任何细节之前，在需要做出决定的三个屏幕上（审批队列、会话聊天中的卡片和 Insights 标签页）。原始 payload 仍然可以访问，**放在一个生来关闭的折叠区内**，永远不会被倾倒在屏幕上。

**过去存在的是一次倾倒。** 每种没有自己视觉主体的类型都落入一个
`Object.entries(payload).map(([k, v]) => k + ': ' + JSON.stringify(v))`，总是展开。打开队列的人读到的是 `worktree: /workspaces/dev-api`、
`coAuthor: Brabo User <user@brabo.dev>` 和 `proposto: 4`——还得自己推断点击批准会发生什么。需要推断的审批就是会被自动放行的审批，而整个产品都依赖于用户是最终权威。

**句子会降级，正是这一点让它可信。** 没有一句假设 payload 中的某个键存在：payload 为空时，句子仍然是一句真实的句子，只是不那么具体（"Registra um commit no repositório do
projeto."）。payload 来自 engine 和十个不同的用例，没有一个承诺格式——只在正确的测试夹具下才成立的句子，会在第一次真实审批时崩溃。

**web 尚不认识的类型不是理论情况。** web 的 `ActionType` 联合类型已经两次落后：第一次是 Gitflow 引导的三种类型，又一次是 FASE
14d 引入的 `parallelize`/`raise_max_parallel`。编译器发现不了：规范列表在 `apps/api` 中，web 不导入它。因此同时做两件事——卡片**降级**（中性动词 + “查看详情”，payload 折叠，而不是在图标映射中得到 `undefined` 从而搞垮整个 React 树），并且**测试读取后端的 `decide.ts`**，在某个类型没有句子就进入时失败。

**展开/关闭的默认值是推导的，而不是配置的。** 规则只有一条——展开仍在等待当前观看者做决定的内容：在聊天中，是 `pending` 的操作；在队列中，从不展开（有 N 张卡片，N 个展开的细节就是同一堵文字墙）；在 Insights 中，是 `proposed` 的假设。而原始 payload 在任何变体中都不展开。设计上的结果是 `ApprovalCard` **没有获得新的必填 prop**：默认值来自本已存在的 `variant` 和 `status`。

**动词和句子出自同一个模块**，由三个屏幕消费。Psicólogo 的假设逐字使用 `instruction_patch` 的动词，而不是一套平行词汇——它的句子说的是 accept 实际做的事（排入 Anamnese 队列，后者**可能**提出调整，而调整仍需审批），永远不是“指令将被修改”。

**`write_file` 有句子，但没有主体。** 它生于
`COM_CORPO_PROPRIO` 之外：句子只显示 `path`，细节落入本 RN 要避免的那种折叠的原始 JSON 倾倒——于是一个真正需要审批的写入（不在 `dev-` 前缀下，或路径超出智能体范围）需要多点一次才能看到 `content`。它以自己的主体进入了 `COM_CORPO_PROPRIO`：`path` 和 `content` 的预览（最多 25 行/4,000 个字符，带截断提示——从不是整个文件，与原始 payload 规则相同），在聊天中待处理时默认展开，与 `terminal` 一样。

**空 payload 不是缺失的 payload。** `command`（terminal）或
`path`/`content`（write_file）以空字符串到达——模型生成的畸形工具调用，而不是渲染缺陷——过去会降级为一个
`$ ` 提示符或空白预览，用户把它读成屏幕的缺陷。两个主体现在区分这两种情况，并显示“模型没有为此操作生成有效的 X”而不是一片空白。

- **位置：** `apps/web/src/lib/aprovacoes.ts`（`VERBO_DA_ACAO`、`fraseDaAcao`、
  `descreverAcao`、`descreverHipotese`），由
  `apps/web/src/components/ApprovalCard.tsx`（审批 + 会话聊天，
  `COM_CORPO_PROPRIO`、用于 `write_file` 的 `content` 的 `previewConteudo`）和
  `apps/web/src/components/HypothesisCard.tsx`（Insights）消费；折叠通过
  `apps/web/src/components/ui/Disclosure.tsx` 的 `Disclosure` 实现
- **测试：** `apps/web/src/lib/aprovacoes.test.ts`（读取
  `apps/api/src/domain/actions/decide.ts` 的 `ACTION_TYPES`，要求每种类型都有动词 + 句子，payload 为空）；`apps/web/src/components/ApprovalCard.test.tsx`
  （`frase e colapso`——两种变体中 payload 都折叠，展开时 JSON 可读，未知类型不会搞垮屏幕，`write_file` 有自己的主体且默认展开、预览截断，`command`/`path`/`content`
  为空时显示后备消息）；
  `apps/web/src/components/HypothesisCard.test.tsx`（`frase e colapso`）
- **来源：** 16–26 计划的 FASE 19，源于在数据库重置后的第一次真实浏览中提出的“hoje está muito difícil a
  leitura”请求

---

## 仪表盘上的“N 个智能体在线”——**实时**状态，从不是历史在场（RN-409，ADR 0097）

之前 backlog 中的一项。事先调查（`docs/explanation/backlog.md`）确认不存在任何活跃度聚合——无论按项目还是按工作区：存在的只有**历史**在场
（`RosterFacts`——“曾在会话中出现过”），而**真正**的实时状态只在客户端，从事件日志推导，并且只在项目**打开**时才有（`deriveAgentRoster`）。仪表盘卡片过去强制使用
`() => 'ocioso'`，因为它不绘制任何状态——这就是本 RN 替换的硬编码。

<a id="rn-409"></a>

### RN-409 — “N 在线”以**同一个**标准汇总两种机制：非空闲、非卡死 {#rn-409}

`ProjectCardSummary.onlineAgentCount`（`GET /workspaces/:workspaceId/
projects-summary`）是此刻**在线**的智能体数量——正在工作或有等待决定的待处理项——从不是团队规模。把实际上是“曾经出现过”的数字称为“在线”会产生误导（与 [ADR 0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/
[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md)/
[0077](../../adr/0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) 反对伪造数据的原则相同）。

两个**来源**，一个标准：

- **Dev agent**——`engine.dev_agent_states.status`，按
  `project_id` 批量聚合（`status NOT IN ('idle', 'idle_tripped')`）。`working`、
  `awaiting_gate` 和 `awaiting_approval` 计入（RN-047/ADR 0052——dev 状态机的五种状态）；`idle`/`idle_tripped` 不计入。`dev-<modulo>` 和
  `dev-<modulo>-2` 是**不同**的键（表中的 `agent_id`），所以无需任何努力就能分开计数——主键本身就已分开。
- **对话型智能体**（criativo/po/arquiteto/dev-lead/ux-designer/
  staff/infra）——项目**最近**会话中每个 `actor_id` 的最后一个 `agent.status` 事件（与 `RosterFacts` 其余部分使用的会话范围相同，RN-090）。`agent.status` 只有三个可能的值
  （`Engine.Sessions.LiveBroadcast.agent_status/4` 拒绝任何其他值）：
  `working`/`awaiting_approval` 计入，`idle` 不计入。

**QA/SecOps 从不计入**——这不是筛选，而是数据**缺失**：两者都不发出 `agent.status`（每次调用运行一次判定，在调用之间没有“空闲”的概念——它们的状态来自 `pr.gate_changed`/
`infra.gate_changed`，一个 `deriveAgentRoster` 早已单独处理的独立机制）。不需要显式排除：查询只汇总具有正确事件类型的东西。

这个标准与项目打开时 `deriveAgentRoster` 本来就会应用的**相同**（客户端的 `'trabalhando'`/`'aguardando'` ≅ 后端的 `working`/
`awaiting_gate`/`awaiting_approval`）——**两条**路径从同一个最终状态（事件日志/持久化的状态表）计算“在线”，只是通过不同的**机制**（后端的 SQL 聚合，客户端对已获取事件的折叠），与
`infraActive`/`uxDesignerActive`/`staffActive` 的精神相同（RN-090/RN-287：两个来源，一个标准）。`apps/api` 和 `apps/web` 之间没有为此共享的函数——两者在 `RosterFacts` 的其余部分本来就在语言/运行时上分道扬镳，仅为一个计数引入共享包，代价会比问题本身更大。

**针对 api 不迁移的 schema 的新查询。** `engine.dev_agent_states`
是 **ENGINE** 的表（Ecto，Postgres schema `"engine"`），同一个物理数据库，同一个连接——不是第二个数据源，而是同一个 Postgres 中的第二个**命名空间**。先例早已存在：`apps/api/scripts/medir-execucao.ts`
已经通过同样的路径（经由 Drizzle 的原始 SQL）读取 `engine.oban_peers`，只是作为手动**脚本**，从未被测试。这条 RN 把这一模式提升为经过测试的**生产**代码——关于**不**把它作为 engine 中的内部 HTTP 路由暴露的决定，见 [ADR 0097](../../adr/0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md)。

**成本是测量的，不是假装免费的。** 两个新查询使读模型的总数从**十二**增加到**十四**（RN-090 仍然有效——十四是**恒定**的，由 `projects-summary.repository.spec.ts` 在 2 个和 20 个项目下统计数据库往返次数来证明）。两者都没有按时间的 `WHERE`——`agent.status` 的那个扫描的是 `lastEvents`/`marcos` 在旁边已经扫描的最近会话的相同 `session_events`，因此边际成本是在一个本来就会发生的查询计划上多一个 `type` 筛选，而不是从零扫描一张新表。**声明**的缺口：没有近期的、具有生产量级的真实运行（dogfooding）来对照第 22 阶段的标准（52.5 万行，`EXPLAIN ANALYZE`）测量真正的 `ms`——两个新查询没有测量数字，只有上面的结构性论证。

- **位置：** `apps/api/src/application/ports/projects-summary-repository.port.ts`、
  `apps/api/src/infrastructure/persistence/drizzle/projects-summary.repository.ts`、
  `apps/api/src/interfaces/http/iam/dto/iam.response.dto.ts`、
  `apps/web/src/lib/api-types.ts`、`apps/web/src/components/ProjectCard.tsx`、
  `apps/web/src/routes/Dashboard.tsx`
- **测试：** `apps/api/test/infrastructure/persistence/drizzle/projects-summary.repository.spec.ts`
  （`describe('onlineAgentCount (RN-409)')`——dev agent working/idle/
  idle_tripped、awaiting_gate/awaiting_approval、同一基础智能体的两个实例、对话型智能体 working/idle/awaiting_approval、只有**最后一个** `agent.status` 计入、QA/SecOps 从不计入、两个来源之间的求和、项目之间的隔离）；
  `apps/api/test/support/global-setup.ts`（`ensureEngineFixture`——engine 的表作为**最小**且已声明的测试夹具创建，只为让上面的测试得以存在）；
  `apps/web/src/components/ProjectCard.test.tsx`（徽章“N online”在
  `0`/`undefined` 时消失，在 `onlineAgentCount > 0` 时出现）
- **来源：** `docs/explanation/backlog.md`（继承自 FASE 13c/dogfooding 收获的项）；数字必须是真正的活跃度而不是历史在场，这一产品决定记录在委托这次修正的提示词中

---

## Runner 的文件夹浏览器变成三列，`runner` 项目的创建不再等待最后一步（RN-436/436）

<a id="rn-451"></a>

### RN-451 — 独立二进制的冒烟测试运行真实的**子进程**，从不模拟 {#rn-451}

`smoke-dist.mjs`（ADR 0106）已经应用于发布到 npm 的
`dist/index.cjs` 的同一纪律，现在也适用于
`dist-bin/brabo-runner-<platform>-<arch>[.exe]`（ADR 0112）：没有任何测试套件能通过阅读源代码来证明一个**打包**后的制品可以工作——只能真正执行该制品，作为子进程，并观察真实输出。`scripts/smoke-bin.mjs` 运行**编译后**的二进制（从不是
`node src/index.ts` 或任何未编译的形式），带上 `--self-test-pty`
——一个内部标志，没有在 `uso()` 中记录——它完全按生产方式解析 `node-pty`，并通过 `GerenciadorDePty` 派生一个真实的 PTY，向其写入并从中读取。只有真实进程 stdout 中的 `node-pty carregado com sucesso` 这一行 +
`SELF_TEST_PTY_OK:` 才算证明；对这个特定测试，模拟 `node-pty` 或 `child_process` 都是不可接受的，因为它存在的目的恰恰是证明嵌入的原生 `.node`（`with { type: 'file' }`，`native-pty-embed.generated.ts`）在二进制**内部**加载并工作——模拟路径上的任何部件都会抹掉测试唯一需要证明的东西。

- **位置：** `apps/runner/scripts/smoke-bin.mjs`；`apps/runner/src/index.ts`
  （`rodarAutoTestePty`，`--self-test-pty` 的实现）
- **测试：** `smoke-bin.mjs` 本身——有意没有替代它的单元测试（与 `smoke-dist.mjs` 的设计相同，后者也没有对应的单元测试）
- **ADR：** [0112](../../adr/0112-binario-standalone-do-runner-via-bun-build-compile.md)
- **来源：** 产品负责人对这个 backlog 项的明确要求（“no mocking”）

---

## 本地 runner 的终端永远卡在“Abrindo terminal...”（RN-433）

<a id="rn-453"></a>

### RN-453 — 本地 runner 的相对 `--dir` 针对 `INIT_CWD` 解析，而不是针对 pnpm 重设的 cwd {#rn-453}

`lerArgumentos()` 中的 `resolve(dirBruto)` 过去针对
`process.cwd()` 解析相对的 `--dir`——当 CLI 直接运行时（独立二进制，`npm install -g @brabo/runner`）是正确的，但在如今没有真正发布到 npm 时唯一存在的调用路径上是**错误**的（真实发现，ADR 0106/backlog）：`pnpm --filter runner start` 把 `process.cwd()` **重设**为**包**的文件夹（`apps/runner`），而不是用户输入命令所在的文件夹。从 `~/dev/brabo` 运行的
`pnpm --filter runner start -- --dir ../exp001` 会创建 `~/dev/brabo/apps/exp001` 而不是 `~/dev/exp001`——悄无声息，没有错误，因为 RN-435 已经让不存在的 `--dir` 被创建而不是被拒绝。

`resolverDir()`（`apps/runner/src/guard.ts`）在存在时针对 `INIT_CWD` 解析——npm/pnpm **总是**用原始调用文件夹设置的变量，只在进程由 `package.json` 的脚本产生时才存在——不存在时回落到 `process.cwd()`（直接运行二进制，那里本来就是正确的文件夹）。当 `dirBruto` 是绝对路径时，Node 的 `resolve()` 本就忽略基准，所以绝对路径（README 中记录的情况）的行为不变。

- **位置：** `apps/runner/src/guard.ts`（`resolverDir`）、`apps/runner/src/index.ts`（`lerArgumentos`）
- **测试：** `apps/runner/src/guard.spec.ts`（`describe('resolverDir', …)`
  ——存在 `INIT_CWD` 时相对路径针对它解析，不存在时回落到进程的 cwd，绝对路径忽略两种基准）
- **ADR：** [0104](../../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)
  （附加扩展，与 RN-435 同类——降低调用摩擦，不改变 runner 作为路径事实来源的地位）
- **来源：** 在真实使用中发现，从单仓库检出内部运行 `pnpm --filter runner start --
  dir ../exp001`——这是如今唯一可用的调用路径，因为 `@brabo/runner` 还没有真正发布到 npm（`NPM_TOKEN` 待定，见 ADR 0106 的 backlog）

---

## RAG 检索留下痕迹，痕迹冻结权重（RN-479..481）

<a id="rn-481"></a>

### RN-481 — `rag.search`/`rag.feedback` 是时间线的**叙述**，只在有会话时存在 {#rn-481}

这两个事件**只在智能体路径中**进入事件日志——标签页中的检索属于项目，没有可以叙述的会话。这是声明的不对称，不是缺口：**表是测量的来源，事件是叙述**。按事件日志测量会丢失一半的检索，而且恰好是有人工判断的那一半。

叙述失败既不让检索失败也不让投票失败：表中的行已经写入，测量读取的就是它。失败变成来源为 `infra` 的日志，从不是沉默。

`'rag'` 在同一个 commit 中加入 `PREFIXOS_DE_EVENTO`（`scripts/docs/generate.mjs`）——没有它，生成的 `docs/reference/events.md` 清单看不到这两种类型，而 `pnpm docs:check` 会在一个不完整的列表上保持绿色：一份撒谎却通过的文档比一份失败的文档更糟。

- **位置：** `apps/api/src/domain/rag/rag-telemetry.ts`
  （`EVENTO_RAG_SEARCH`/`EVENTO_RAG_FEEDBACK`）、
  `apps/api/src/application/use-cases/rag/hybrid-search.use-case.ts`、
  `apps/api/src/application/use-cases/rag/record-rag-feedback.use-case.ts`、
  `scripts/docs/generate.mjs`（`PREFIXOS_DE_EVENTO`）
- **测试：**
  `apps/api/test/application/use-cases/rag/hybrid-search.use-case.spec.ts`
  （有会话时叙述；没有会话时**不**叙述）、
  `apps/api/test/application/use-cases/rag/record-rag-feedback.use-case.spec.ts`
  （投票的同一对用例）
- **ADR：** [0129](../../adr/0129-telemetria-de-busca-do-rag-como-tabela.md)
- **来源：** 产品负责人的计划，第 2 部分 / 第 1 步

<a id="rn-485"></a>

### RN-485 — 容器 broker 不接受规格：它接收一个项目并**组装** {#rn-485}

broker（`apps/broker`）是产品中唯一能访问服务器上 Docker 守护进程的进程。让它不随意的规则不是允许列表：而是**输入的形状**。

**它接收 `projectId` 和五种操作之一——仅此而已。** 这五种是
[ADR 0128](../../adr/0128-porta-de-docker-e-a-prova-de-empacotamento.md) 的 `DockerPort` 的操作
（`start`、`stop`、`remove`、`inspect`、`exec`），第六种是带 ADR 的产品决定，永远不是多一个参数。`start`、`stop` 和 `remove` 的请求体为**空**；`exec` 带命令和 `cwd`，别无其他。

**规格从 api 读取并在这里**组装**。** broker 调用
`GET /internal/projects/:projectId/container-spec`，它返回项目身份、执行模式和 Arquiteto 当前的镜像决定。镜像、网络、资源和唯一的挂载都出自那里。不存在可以写入 `privileged`、`cap_add`、`network: host` 或自由 `-v` 的字段——因为根本没有字段。如果规格随请求体传递，一个在宿主机上等同 root 的进程的约束就会依赖于**调用方**是否正确，而依赖调用方的约束不是约束。

**它重新校验 api 返回的内容，两种校验并不相同。**
`validarDecisaoDeImagem`（api）问的是“这个架构决定可审阅吗？”——要求 `rationale`，拒绝 `latest`，应用 `RECURSOS_MAXIMOS`，并通过工具结果把拒绝返回给**模型**（RN-061）。`especificacaoValidada`（broker）问的是“我能把这个交给守护进程吗？”——它是把不可信 JSON **解析**进封闭类型。这里的上限是 **broker** 的，即它无论请求来自哪里都绝不越过的最后防线；如今这些数字有意与 api 的一致，若有一天出现分歧，较小者胜出而不会破坏任何东西，因为两者都不声称自己是对方。有一项检查只存在于这一侧：以 `-` 开头的镜像引用会被 CLI 读作**标志**，而不带 shell 的 `execFile` 解决的是**命令**注入，而不是**参数**注入。

**api 不发送任何路径。** `docker run` 的 `-v` 由**守护进程**针对**宿主机**的文件系统解析——api 容器内的路径会让守护进程创建并挂载一个**空**文件夹，dev agent 在没有代码的目录中工作，而没有任何迹象表明原因。broker 用**它自己的**配置 `PROJECT_WORKSPACES_HOST_ROOT` 加上创建时冻结的 `workspaceDirName`（RN-109）组装路径。没有这个变量，`start` 会**拒绝**并点名它；另外四个操作继续工作。拒绝是规则：猜测会静默地产生空挂载。

**`mounted`/`runner` 项目以 409 拒绝**，因为它们的文件夹位于用户的机器上，broker 的宿主机看不到它——在那里启动容器的是 runner。这与 `RegistrarTransicaoDeContainerUseCase` 在 api 中已经应用的策略相同，在 broker 能说出它的地方说出来。

**没有任何东西触发启动。** 没有循环，没有队列，没有 `container_start` 的 `proposed_action`：broker 在被调用时才行动，而如今存在的唯一调用方只做**读取**。外部效果仍然需要审批。

- **位置：** `apps/broker/src/operacoes.ts`（五种操作，以及在
  `especificacaoDoProjeto` 中的组装）、`apps/broker/src/servidor.ts`（封闭的路由列表和状态表）、
  `packages/docker-port/src/spec-de-container.ts`（解析和上限）、
  `apps/api/src/application/use-cases/containers/obter-spec-de-container.use-case.ts`
  （api 返回的内容，以及它不返回的路径）、
  `apps/api/src/interfaces/http/internal/internal-containers.controller.ts`
- **测试：** `apps/broker/src/servidor.spec.ts`（请求体中发送的镜像、网络、资源和挂载被**忽略**；镜像以 `-` 开头的制品是 422，什么都不触碰；第六种操作是 404；`/work` 之外的 `cwd` 被拒绝，包括 `/workspace`；没有 `PROJECT_WORKSPACES_HOST_ROOT` 时 `start` 拒绝并说出缺少哪个变量）、
  `packages/docker-port/src/spec-de-container.spec.ts`（逐字段解析）、
  `apps/api/test/application/use-cases/containers/spec-e-observacao-de-container.use-case.spec.ts`
  （api 不返回任何路径，也不返回 `rationale`）、
  `apps/api/test/infrastructure/http-clients/container-broker.client.spec.ts`
  （`start` 发送空请求体）
- **ADR：** [0130](../../adr/0130-broker-de-container.md)

<a id="rn-497"></a>

### RN-497 — `brabo-runner` 在**用户的机器上**、用**用户的** Docker 启动项目的容器 {#rn-497}

关闭 RN-494（ADR 0135）声明的那一半：`mounted`/`runner` 开始**要求**已决定的镜像（RN-105 的门槛在三种模式下都有效），却仍然不启动**任何**容器——只有 `execution_mode: container` 有一个能真正调用 Docker 的角色（broker，`apps/broker`）。`container_start`/`container_stop`/`container_remove`（RN-491/495）现在有了**第二**条执行路径，在 `ExecuteContainerStartUseCase`/`ExecuteContainerStopUseCase`/
`ExecuteContainerRemoveUseCase` 内部按项目的 `executionMode` 分支——从不在操作的**提议**或**批准**中分支，它们仍与模式无关（`decide.ts` 不变）。

**`container` 继续经由 broker，没有任何变化。** `mounted`/`runner`
请求 **ENGINE**（`ApiToEngineClient.startContainerViaRunner`/
`stopContainerViaRunner`/`removeContainerViaRunner`，与
`executeTerminalAction` 一样同步）转交给已连接的 **RUNNER**——早已维持 `terminal:<projectId>` 频道的 CLI（ADR 0103/0104）获得**三**对新事件，`container_start`/`_result`、`container_stop`/`_result`、
`container_remove`/`_result`（`apps/runner/src/channel.ts`），与
`exec`/`exec_result` **相同**的模子：`Engine.Runners.RunnerRouter` 把它分派到按 `ref` 关联的频道并阻塞在 `receive` 上，runner 用**用户的 Docker**——而不是服务器的——调用 `DockerViaCli.start/stop/remove`（`@brabo/docker-port`，ADR 0128）并回应。`EngineWeb.
ContainerCommandController`（路由 `POST internal/projects/:projectId/
containers/{start,stop,remove}`）是唯一的调用方；engine 一侧没有其他路径能到达这三个操作。

**启动的镜像不会被**再次**选出**——与 `container` 路径相反，后者复用 `DecidirImagemDoProjetoUseCase` 来写入新版本的 `artifact.project_image`。`mounted`/`runner` 路径只**读取**当前的决定（`ObterSpecDeContainerUseCase`，即早已为 broker 组装 `GET .../container-spec` 的**同一个**用例——直接调用，不经 HTTP，因为两者都在 api 进程中运行）并把它发给 runner；没有已决定的镜像（RN-105）时，在询问 engine **之前**就失败。

**“没有已连接的 runner”是**普通失败**，从不是通用异常**——与 `container` 路径中 `BrokerIndisponivelError`/`BrokerRecusouError` 相同的纪律。`RunnerNaoConectadoError`（没有 runner，或超时）和
`RunnerRecusouContainerError`（runner 回应了并**拒绝**——用户机器上 Docker 不可用、规格无效）是 `HttpApiToEngineClient` 抛出的两个类；三个用例捕获它们并以原因写入 `failed`，从不让它们传播。在 engine 一侧，响应**总是** 200——正文中 `sucesso: false`，只有当 engine **甚至没有**询问 runner 时（`RunnerRouter` 返回了 `{:error, _}`）才带 `motivoCodigo`（"not_connected"/"timeout"），对于命令的普通失败从不使用错误 HTTP 状态。

**`Engine.Actions.TerminalExecutor` **没有**获得新出口。** “在宿主机上运行命令，还是在这个 runner 启动的容器内运行”的决定是 runner **内部**的——`decisao_de_execucao/1` 早已把已连接 `runner` 项目的每个命令**无条件**路由到 `RunnerRouter.exec/4`（RN-423）。改变的只有 `apps/runner/src/index.ts`：`EstadoDoRunner` 获得
`containerAtivo`（**这个** runner 启动的容器的**名称**，或 `null`），`tratarExec` 在有活动容器时改为路由到 `DockerViaCli.exec`（经由 `docker exec`），没有时走一贯的路径（直接在宿主机上 `executarComando`）——`cwd` 已经由
`validarCwdDentroDaRaiz` 针对项目根目录校验，通过**前缀**替换（`cwdParaContainer`，`guard.ts`）转换到 `/work` 内，与 engine 一侧 `cwd_para_container/2` 的推理相同（RN-492）。

**`guard.ts`（Linux 上 `$HOME` 内的约束，RN-434）开始也覆盖挂载的路径，**无需任何**新校验。** 容器的 bind-mount **就是**
`estado.dir`——`validarDirDentroDoHomeNoLinux` 在 CLI 启动时、任何容器启动之前就已校验过的同一个根。不存在第二项“挂载路径有效”的检查，因为不需要存在：挂载**就是**已确认的根，仅此而已。

- **位置：** `apps/runner/src/channel.ts`、`apps/runner/src/index.ts`
  （`EstadoDoRunner.containerAtivo`、`tratarContainerStart/Stop/Remove`、
  `tratarExec`）、`apps/runner/src/guard.ts`（`cwdParaContainer`）、
  `apps/engine/lib/engine/runners/runner_router.ex`
  （`start_container/stop_container/remove_container`）、
  `apps/engine/lib/engine_web/channels/terminal_channel.ex`、
  `apps/engine/lib/engine_web/controllers/container_command_controller.ex`、
  `apps/engine/lib/engine_web/router.ex`、
  `apps/api/src/application/ports/api-to-engine-client.port.ts`
  （`RunnerNaoConectadoError`、`RunnerRecusouContainerError`）、
  `apps/api/src/infrastructure/http-clients/api-to-engine-client.ts`、
  `apps/api/src/application/use-cases/actions/execute-container-start.use-case.ts`、
  `apps/api/src/application/use-cases/actions/execute-container-stop.use-case.ts`、
  `apps/api/src/application/use-cases/actions/execute-container-remove.use-case.ts`
- **测试：**
  `apps/runner/src/channel.spec.ts`（三对新事件的往返）、
  `apps/runner/src/index-handlers.spec.ts`（`tratarExec` 在宿主机与容器之间路由；`tratarContainerStart/Stop/Remove` 从不抛出）、
  `apps/runner/src/guard.spec.ts`（`cwdParaContainer`）、
  `apps/engine/test/engine/runners/runner_router_test.exs`、
  `apps/engine/test/engine_web/channels/terminal_channel_test.exs`、
  `apps/api/test/infrastructure/http-clients/api-to-engine-client.spec.ts`、
  `apps/api/test/application/use-cases/actions/execute-container-start.use-case.spec.ts`、
  `apps/api/test/application/use-cases/actions/execute-container-stop.use-case.spec.ts`、
  `apps/api/test/application/use-cases/actions/execute-container-remove.use-case.spec.ts`
  （三者都有 describe "mounted/runner (ADR 0137)"）
- **架构决策：** [ADR 0137](../../adr/0137-o-runner-sobe-o-container-do-projeto.md)
- **来源：** 产品负责人的计划，第 1 部分 / PR 1.3

## FASE 29 — 一行安装：为所发布的东西签名

<a id="rn-525"></a>

### RN-525 — 二进制代理对照同一发布的清单核对哈希，无法核对时拒绝，并「说明」这是完整性而不是来源 {#rn-525}

`GET /runner-releases/binary` 是 `@Public()`，没有认证，是通过浏览器配置流程的第 4 步（[RN-473](../web.md#rn-473)，[ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md)）。直到 FASE 29 的第 3 次会话，它只校验「输入」（`platform` 对照封闭的允许列表），并把 GitHub 的字节直接传给客户端，**什么都不校验**——它就是 [ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md) 点名、[RN-524](../ci.md#rn-524) 留待处理的那个消费者。

现在它在回应任何东西之前**对照「同一」发布的 `checksums.txt` 核对字节的 sha256**，`Content-Digest` 头（RFC 9530）重复核对过的哈希，让接收方可以重新计算。

**这项校验「不」做什么，写在执行它的地方。** 它**不校验**清单的签名（`checksums.txt.bundle`）。这是**对照清单的完整性，不是来源**：能改写 Release 的人可以改写两个文件并通过。关闭这一点的两种方式在本次会话中都被「测量」过，两者都被拒绝：

| 路径 | 测量结果 | 为什么不 |
|---|---|---|
| api 镜像中的 `cosign` | **155 MB**（`cosign-linux-amd64` v2.6.1） | 几乎让运行时镜像（Alpine + Node）翻倍，该镜像按 digest 发布在 GHCR 上（[ADR 0119](../../adr/0119-imagens-publicadas-no-ghcr-por-digest.md)），只为校验一个可选的下载 |
| `@sigstore/verify` + `@sigstore/tuf` | **2.5 MB，12 个包** | 大小不是代价。`getTrustedRoot()` 会对照 `tuf-repo-cdn.sigstore.dev` 刷新 TUF 元数据（包的 `seeds.json` 只播种 `root.json`），所以一个今天依赖「一个」第三方主机的公开路由将依赖两个。而且，按 ADR [0041](../../adr/0041-base-openai-compativel-e-contrato-de-llm-providers.md)/[0042](../../adr/0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) 的尺子——能力只有在**被证明**时才声明——，今天无法证明这条路径：**没有任何 Release 有 `checksums.txt.bundle`**，因为 `checksums` 作业在第 2 次会话中诞生，只在正式 tag 中运行，这一缺口 [RN-524](../ci.md#rn-524) 本身已在签名一侧声明 |

校验「签名」的是 `install.sh`（第 4/7 次会话），它有真正的 `cosign`，并以 `sha256sum -c` 固定方式下载它（ADR 0149 的决定 4）。**对于这条路由的来源一半，BRB-005 仍然开放**，[登记表](../../reference/brb.md)说明了这一点——这不是脚注，而是这条路由所能证明之事的边界。

**没有 `checksums.txt` 的 Release 就「拒绝」，绝不是「带警告地提供」。** 点一下就能接受的警告，就是不存在的校验（ADR 0149，决定 3）——而且这会是最廉价的降级：删除 Release 中 400 个字节就能关掉所有人的核对。代价已测量且很小：v5.0.0 中有两个二进制（`linux-x64`、`linux-arm64`），没有清单，而二进制这一步在浏览器流程中是**尽力而为**的（[RN-473](../web.md#rn-473)，第 4 步）——它会留下没有本地代理的状态并如实说明（npm 已在 AT-774 中移除）。ADR 0149 之后第一个 tag 之前的每个发布，按构造都落入这条路径。

**六种 502 结果不坍缩。** 仅凭状态码无法区分它们，而它们要求调用方采取不同的行动，所以拒绝在正文中携带一个 `motivo`——`plataforma_nao_publicada`、`release_sem_manifesto`、
`manifesto_nao_cobre_a_plataforma`、`manifesto_ilegivel`、`download_falhou`、
`hash_divergente`。这是 [RN-470](../web.md#rn-470) 的尺子用在 api 回应上：「该平台还没发布」让人等下一个发布，「发布没有清单」让人用 npm，「哈希不一致」是事件。尤其是，「清单未在发布中列出」和「清单已列出但下载失败」是「不同」的结果——混淆它们会因为一次瞬时网络故障而让人改用 npm 安装。

**核对哈希需要读取所有字节，而这要经过磁盘。** 把二进制的约 79 MB 缓冲在内存中，在公开路由上会是轻而易举的耗尽（api 的 pod 有 `limits.memory: 512Mi`），而缓存字节会更糟——五个平台 × 79 MB。字节以**流**的方式写入 `/tmp` 中的临时文件（一个 `emptyDir`，之所以挂载正是因为 api 的根文件系统是只读的），哈希在途中计算，文件**只在**哈希匹配之后才以流的方式重新读给客户端：内存恒定，没有任何未经核对的字节到达客户端。256 MiB 的上限会在填满 `/tmp` 之前中止荒谬的回应。现有的缓存（URL，5 分钟）**保留**，并开始同时保存已解析的清单——几百字节的「文本」，绝不是二进制字节——放在「同一个」条目中，绝不放在自己的缓存中：在不同的窗口里，中途发布的一个版本会让新哈希被拿去对照旧二进制，结果会是一个看起来像篡改的 `hash_divergente`。

- **位置：** `apps/api/src/interfaces/http/runner/runner-releases.controller.ts`
  （校验、字节上限、临时文件以及 `Content-Digest`），
  `apps/api/src/interfaces/http/runner/checksums.ts`（清单的纯读取以及 `MotivoDaRecusa` 联合类型），
  `apps/web/src/lib/runner-bootstrap.ts`（`baixarBinario` 开始从正文读取 `message` 和 `motivo`，这句话到达 `falhaDoBinario`）
- **测试：** `apps/api/test/interfaces/runner-releases.controller.spec.ts`
  （带 `Content-Digest` 的正常路径；哈希不一致时正文中「没有」任何字节或头；没有清单的发布在下载二进制之前拒绝；不覆盖该平台的清单；不可读的清单；下载失败；以及把发布和清单一起保存的缓存）以及同一文件的 `describe('parsearChecksums')`；`apps/web/src/lib/runner-bootstrap.test.ts`（api 的语句和 `motivo` 到达调用方，非 JSON 正文不会变成第二个异常）
- **来源：** FASE 29，第 3 次会话。[ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md)，决定 3 表格中的第三个消费者——就 api 今天能证明的那「一半」而言，另一半被点名而不是假装
| `BACKUP_DIR` 指向一个存在但「不」接受写入的目录 | 备份在 `pg_dump` 「之前」拒绝，说明问题在于「写入」——只读目标会通过存在性测试，之后才失败，诊断会指向错误的地方（RN-528） |
| 并发的 `git gc` 在裸仓库 `tar` 中途删除了一个 packfile | 该次执行在 `backup_runs` 中变为 **`failed`**，点名 `tar` 的状态——绝不是宣称自己完好的不完整归档，因为只有失败会变成告警（RN-528） |
| `git_local_repos` 卷未挂载在备份容器中（k8s 的 CronJob） | 该步骤被**跳过并在日志中说明**——「未挂载」绝不与「已挂载且为空」坍缩，后者是没有 `local` 项目的安装的正常状态（RN-528） |
| 卷中有裸仓库，而 `git-daily/` 前缀中「没有」任何归档 | `brabo-restore-git` **否决**，说明这个卷没有覆盖——不存在且为空是另一种结果，以成功退出（RN-528） |
| 裸仓库的归档被截断 | 在「读取」时否决（`tar -tzf`），绝不按大小：截断的 tar 字节还绰绰有余。这是 git 一侧的 `pg_restore --list`（RN-528） |
| 在已有裸仓库的卷上运行 `brabo-restore-git --restaurar` | 拒绝：叠加两种仓库状态不会报任何错误，只会在某次历史错误的 `fetch` 中显现。真想这么做的人用 `RESTORE_GIT_FORCE=1`（RN-528） |
| 无法写入卷时运行 `brabo-restore-git --restaurar`（uid 70 × api 的所有者） | 在 `tar` 「之前」拒绝，点名 `--user 0:0`——在解压途中才发现会让卷只完成一半。而以 root 解压的内容会交还给「目录」的所有者（RN-528） |

<a id="rn-526"></a>

### RN-526 — 安装程序校验自身的来源，在提问之前「点名」它发现的东西，绝不删除用户文件夹 {#rn-526}

`install.sh`（仓库根目录，版本化并作为 Release 的资产发布）是唯一的安装入口。四项保证，每一项都针对一个具体缺陷：

**调用方式保留 stdin 并留下一个「文件」。** 文档化的形式是 `curl -fsSLO …/install.sh && bash install.sh`——下载一个文件并用 `bash` 运行——，**绝不是** `curl … | sh`：脚本经由管道到达时，进程的 `stdin` 「就是」下载内容，任何 `read` 都会读到脚本自身的字节或遇到 EOF。一个无法提问的安装程序会自行选择在别人电脑上的哪里创建文件夹——与 RN-511 已经应用于基目录同意的尺子相反。直到 AT-083，文档化的形式都是 `sh -c "$(curl -fsSL …)"`，而它**从未奏效**：对自身来源的校验（下一段）计算 `$0` 的哈希，而在 `X -c "…"` 中 `$0` 是 shell 的名字，不是文件；当 `sh` 是 `dash` 时，脚本更早就死在 `set -o pipefail` 上。维护者的决定（9月18日）是改「文档」并保留按 `$0` 的校验，**没有**跳过的后门（ADR 0150）。错误的形式变成了**点名的拒绝**，在第一次下载之前，并打印正确的形式：在不是 bash 的 shell 下运行（顶部的 POSIX 块，在 `set -o pipefail` 之前），以及在没有文件的情况下运行（`exigir_o_proprio_arquivo`，它要求顶层的 `BASH_SOURCE` **以及**可读的 `$0`——`/bin/bash -c` 会留下 `$0=/bin/bash`，它确实存在，没有前一半的话，它的哈希会被送去对照清单，人会读到篡改的那句话）。这种形式是「一个」常量（`COMO_RODAR`），由拒绝和无 TTY 的报告使用。

**它在行动前校验自身的来源**，链条有两环：Release 中 `checksums.txt` 的签名（RN-524），以及已校验清单中**本文件**的哈希。执行校验的 `cosign` 本身也按版本固定，并对照脚本中写下的值核对哈希——信任 `install.sh` 到足以执行它的人，也信任它携带的哈希，链条不会比起始的那一环更脆弱。任何一环失败都是**点名的拒绝，绝不是警告**。

**计算哈希只有「一个」函数和「两种」可接受的工具**——`sha256sum` 或 `shasum -a 256`——，在**第一次下载之前**解析，绝不在校验中途：没有东西可用来核对的机器，就不应该拿到需要核对的东西。两者都缺是**「自己的」拒绝**，点名两种工具，说明各自在哪里，并断言什么都没有下载——绝不是哈希不一致的拒绝，那是**事件**的拒绝（*"pare e investigue"*）。这种区分不是风格：脚本原本在五个校验点直接调用 `sha256sum`，macOS 不带它，`command not found` 以篡改指控的形式传达给安装者——阻断了脚本自身支持的平台上的所有安装（其中固定了 `darwin-*` 的 `cosign`），并教人在那句话为真的那天忽略它。`--print-plan` 在两者都没有的情况下运行，并声明脚本接受哪个（`conferir-hash`）。自 AT-083 起还有「第三种」拒绝：工具存在但**无法读取文件**。没有它，`hash_sha256` 会从命令替换内部返回空值（`errexit` 到不了子 shell），随后的比较会以调用方的事件文本失败——经由另一条路的 AT-091 篡改指控。现在是 `falha_ao_calcular_hash`，它点名文件并说明没有可比较的东西。

**检测会点名它发现的东西。** 有标记（`$XDG_STATE_HOME/brabo/install-state.json`）时依据标记；没有时依据信号（compose 项目 `brabo*`、unit `brabo-runner-*`、PATH 中的二进制）——列表在任何提问**之前**打印。不存在这样的路径
「我发现了某样东西并自行决定」。没有 TTY 时，脚本**报告并以 0 退出**，就像 `consentir-base.mjs` 已经做的那样。

**它绝不删除用户文件夹。** 项目基目录和镜像文件夹不在任何确认的范围之内——与镜像相同的尺子（RN-516）：用户文件夹是累积，不是产品状态。具名卷只有在确认后才删除，并在提问之前逐一列出。

标记存放在 `$XDG_STATE_HOME` 中，**而不是** `~/.brabo/`，后者是 runner 存放按「项目」的东西的地方：安装状态和项目配置是不同的生命，把它们放在一起会让删除其中一个时抹掉另一个。

**位置：** `install.sh`（根目录）。
**测试：** `scripts/dev/install.spec.ts`——`--print-state` 和 `--print-plan` 模式在没有 TTY、没有网络、没有副作用的情况下证明「决定」，仿照 `bootstrap.spec.ts`；而 *"o hash num PATH sem sha256sum"* 块在真实的 shell 中运行哈希函数，`PATH` 逐个工具地组装，核对「两种」拒绝（工具缺失 × 哈希不一致），以及前者绝不使用后者的措辞；
`scripts/dev/install-invocacao.spec.ts` 以错误的形式运行脚本（`bash -c`、`/bin/bash -c`、管道、`dash -c`、`dash install.sh`），要求在任何下载之前给出带正确形式的点名拒绝、第三种哈希拒绝，以及 runbook、bootstrap 和文件头教的是「同一种」形式。
**来源：** FASE 29，第 3 次会话（[ADR 0150](../../adr/0150-instalador-de-uma-linha.md)）。在本次会话中脚本**什么都不安装**——启动 compose、生成密钥和安装 runner 是第 4 和第 7 次会话，它在输出中**说明这一点**，而不是悄无声息地结束。

<a id="rn-531"></a>

### RN-531 — 安装程序为两边同意「一个」基目录，并安装已可执行的本地代理 {#rn-531}

**一个基目录，同意一次。** `install.sh` 询问项目将住在哪里，并把同一路径写入「两个」地方：`.env` 中的 `BRABO_PROJECTS_BASE`（服务器，[ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md)）以及 `runner.json` 的 `base` 字段（本地代理，[RN-529](../runner.md#rn-529)）。`mounted` 与 `runner` 之间的差别是**谁来执行**，而不是代码住在哪里——同一文件夹的两个不同基目录，就是 ADR 0141 明文拒绝的命名空间冲突。

基目录在不是绝对路径、位于 Brabo 检出**之内**以及**包含**检出时被拒绝——两个方向都检查，就像 `preflight.mjs` 在服务器一侧已经做的那样。`~` 有意不展开：值会写进配置文件，而写在那里的 `~` 会被按字面读取。

**本地代理以已可执行的状态安装。** 二进制被下载，对照脚本为核对自身而已经校验过的**同一个**签名 `checksums.txt` 核对（RN-524）——下载两次会有两次拿到不同清单的机会，而第二次不会被校验——并用 `install -m 0755` 安装，它在复制的同一动作中设置执行位。

**这关闭了 BRB-031。** 手动的 `chmod +x` 在 FASE 28 中幸存下来，因为作为服务的安装并非来自一个版本化的产物：走到运行 `brabo-runner service install` 的人，为了到达这个命令，已经必须让二进制可执行。来自安装程序时，这一步消失了——浏览器的 File System Access API 不保留该位，脚本保留。

没有该平台二进制的 Release **不会中断安装**：其余部分已经运行起来，消息指向 `brabo-runner` 上的 issue（npm 已在 AT-774 中移除）。这与通过浏览器配置时二进制那一步的处置相同（RN-473），原因也相同——本地代理是最后一步，不是前置条件。

**位置：** `install.sh`、`consentir_base` 和 `instalar_o_runner`。
**测试：** `scripts/dev/install.spec.ts`——存在 `install -m 0755`，不存在面向用户的 `chmod` 指令，以及点名的对照已签名清单的核对。
**来源：** FASE 29，第 7 次会话（[ADR 0150](../../adr/0150-instalador-de-uma-linha.md)，
[ADR 0151](../../adr/0151-base-consentida-no-runner.md)）。

<a id="rn-534"></a>

### RN-534 — 安装程序进入已签名的清单，并在一台干净的机器上得到演练 {#rn-534}

同一保证的两半。

**`install.sh` 进入 `checksums.txt` 和 Release。** 没有这一点，它对自身的校验（RN-526）就是一纸空文：它对照已签名的清单核对自己的哈希，而清单却不覆盖它。该文件来自 **tag 的检出**，而不是下载——这与在同一作业中被签名的所有其他东西出自同一个提交。

**它在一台干净的机器上得到演练**，这就是 Actions 的临时 runner：新创建的主机，没有 Brabo、没有 `.env`、没有标记。E2E 按这个顺序证明：**计划**没有停止承诺它绝不删除的东西；干净机器上的**状态**不捏造标记或信号；**没有 TTY** 时安装程序报告、以 0 退出且**不写入**；而在真正的 TTY 下（不是管道——管道恰恰会扼杀同意），完整安装会校验签名、核对自身哈希、写入标记，并让 `.env` 处于模式 **600**。

**更正（AT-083）：** 本段曾断言的「由 `script -qec` 模拟的 TTY」**对安装程序而言从来不是 TTY**。该步骤运行的是
`script -qec "… ./install.sh … < respostas"`，`<` 位于 `script` 的命令「之内」：安装程序的 stdin 是那个文件，`[ -t 0 ]` 永远为假，交互流程从未被演练。如今运行安装程序的是一个 Python 写的 PTY 驱动（`python3 -I`，没有新依赖），它把安装程序放在 pty 的从端，并在回答之前「等待」每个问题——对于两个密码问题，它等待回显「关闭」，这证明了 RN-547 的「无回显」，并防止密码出现在输出中。E2E 还以 runbook 规定的「同一种」形式下载并运行安装程序（`curl -fsSLO` + `bash install.sh`，RN-526），如果安装程序说出「Sem terminal interativo」，就立即否决。由于该工作流仍不在 PR 中运行，驱动被从中抽出，并在 `scripts/dev/install-e2e.spec.ts` 中针对一个假的安装程序进行演练（看到终端、按顺序回答、密码不出现在输出中，以及两个点名的停止点），旧形式被固定为「不」提供终端的那种。

**它不在 `pull_request` 中运行**，原因与签名相同：已签名的清单只在正式 tag 之后才存在。让脚本在 PR 中运行，就需要给它一个「跳过」校验的后门——ADR 0150 拒绝的那扇门，一旦打开就对任何人有效，而不只是 CI。这是 RAG 的 golden-set 出于同样推理早已做出的决定（[ADR 0138](../../adr/0138-golden-set-do-rag-em-ci-agendado.md)）：无法在 PR 中演练的东西按自己的节奏运行，工作流会**说明原因**，而不是假装有覆盖。

**位置：** `.github/workflows/install-e2e.yml`；
`.github/workflows/build-runner-binaries.yml`，作业 `checksums`。
**测试：** 工作流本身——`scripts/dev/install.spec.ts` 继续在无网络的情况下覆盖决定；`scripts/dev/install-e2e.spec.ts`（*"o TTY
do E2E é um TTY para o INSTALADOR"* 块）在 PR 中演练 PTY 驱动。
**来源：** FASE 29，第 10 次会话（[ADR 0149](../../adr/0149-assinatura-dos-artefatos-publicados.md)，
[ADR 0150](../../adr/0150-instalador-de-uma-linha.md)）。

> **TODO(humano):** 以上 RN 提取自代码和测试。还需要确认是否存在**未实现**、却应该列在这里的业务规则——已商定但尚未编码的东西不会出现在这次扫描中。

---

## 代理的产物变成文件，放在 `docs/` 中（RN-523）

<a id="rn-542"></a>

### RN-542 — 安装程序比较已安装的版本与将要安装的版本，提供的选项按关系而定 {#rn-542}

`install.sh` 自 [RN-530](../infra.md#rn-530) 起就能检测之前的安装，并提供带有经证明备份的迁移。它**不**知道的是那里装的是**哪个**版本：标记（`$XDG_STATE_HOME/brabo/install-state.json`）记录了 `schemaVersion`、`instaladoEm`、平台、来源、digest 和路径——却没有任何说明 5.0.0 的东西。*"migrar esta instalação?"* 这个问题两边都是盲的，回答的人无从知道那是升级、降级还是重复。

这个信息一直触手可及却被忽略：Release 的 `images.json` 带有
`"versao"`，与 `commit` 和 `publicadoEm` 并列，而 `resolver_imagens_do_ghcr` 只读取 `repositorio` 和 `digest`。在另一端，`--source=local` 已经要求工作树**干净且位于 tag 上**——所以在那里 `git describe` 是可信的版本，凭借之前已经发生的两种拒绝。

**顺序就是决定。** 镜像改为在检测**之前**解析：知道要装进来的是什么，是询问现有的是否要移除的前提。标记升级为 `schemaVersion: 2`，并写入 `versao` 和 `commit`——两者一起，因为缺少该字段的新标记会被当成旧的。

手里有了两个版本，提供的选项就不再是一个问题，而是四个，每种关系一个：

| 关系 | 提供的选项 | 默认 |
|---|---|---|
| 更高 | `Atualizar 5.0.0 → 5.1.0?` | **是**——这是人来要做的事，而经证明的备份让它可逆 |
| 相同 | `Já é a 5.0.0. Reinstalar do zero mesmo assim?` | 否——没有可提供的收益 |
| 更低 | 点名**降级**，警告数据库迁移不会倒退 | 否——可能无法回头 |
| 未知 | schema 1 的标记没有版本：说明这一点，**不猜测** | 否 |
| 新线 | `Atualizar 7.0.0 (linha anterior) → 1.0.0 (linha nova)?`——[RN-998](parte-02.md#rn-998) | **是**——版本从 1.0.0 重新开始并不是降级 |

`maior` 分支**曾是唯一**默认为是的，也是唯一可以这样的：这一步可以通过刚刚证明过的备份撤销。自 [RN-998](parte-02.md#rn-998) 起，`nova-linha` 关系出于同样的原因共享这个默认值（这是更新，只是编号不同）。其他三个要求键入 `s`。

**在任何分支中，安装都会被删除并从零重建**，绝不在上面覆盖启动——产品负责人的决定，与 RN-530 的理由相同：在另一版本的卷上执行 `up` 是不会提前告警的破坏，半次迁移比没有更糟。备份 → **证明** → 询问 → 删除 → 安装 → 恢复的链条在任何分支中都不变。

`comparar_versoes` 是手工实现的，**不**用 `sort -V`：macOS 的 BSD `sort` 很晚才有 `-V`，而这个脚本运行在别人的机器上——这正是已经让 `sha_do_cosign` 因 bash 3.2 而拒绝关联数组的那种纪律。它回显裁决而不是返回退出码，因为在 `set -e` 下一个合法的 `return 1` 会杀死脚本。

在 `pnpm bootstrap` 的菜单中，*Docker › Instalar (install.sh)* **报告**计划而不安装——这是机制，不是偏好：菜单项以 stdin 为 `/dev/null` 运行，以便菜单继续从同一终端读取按键，而这个安装程序的存在就是为了「提问」（这就是 [ADR 0150](../../adr/0150-instalador-de-uma-linha.md) 拒绝 `curl | sh` 的原因）。这与 *Base de projetos* 菜单项（[RN-511](../infra.md#rn-511)）的设计相同，菜单项的说明带有真正执行安装的命令。

- **代码：** `install.sh`（`comparar_versoes`、`campo_do_marcador`、
  `resolver_imagens_do_ghcr`、`resolver_imagens_locais`、`main`）；
  `scripts/dev/bootstrap.sh`（菜单项 `1.7`）
- **测试：** `scripts/dev/install.spec.ts`——*"a comparação de versões"* 和
  *"o marcador registra a versão"*；函数从脚本中提取出来由 `bash` 运行，绝不在 TS 中重新实现（拷贝在 shell 坏掉之后仍会通过）
- **运行时而非阅读时发现：** 对一个**没有点**的字符串执行 `cut -d.` 会返回整行，而不是空——所以 `5.0.0` 对 `5` 回答 `menor`。已在末尾补 `.0.0` 进行规范化，并有回归测试。
- **ADR：** [0150](../../adr/0150-instalador-de-uma-linha.md)
- **来源：** 产品负责人的要求——*"o sh deve ser inteligente de
  entender que já há uma versão e verificar se será uma nova versão a ser
  executada ou não... caso seja uma nova ou escolhido isso pelo usuário deverá
  deletar a anterior e instalar do zero para evitar possíveis erros"*
