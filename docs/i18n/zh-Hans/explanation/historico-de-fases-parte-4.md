---
id: historico-de-fases-parte-4
title: "阶段历史，第 4 部分：从本地 runner 起"
sidebar_label: "从本地 runner 起，第 4 部分"
description: "从本地 runner 到独立二进制，以及从 CLAUDE.md 索引迁出的章节（包含第 28 至 30 阶段）。"
keywords: [历史, 阶段, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# 阶段历史，第 4 部分：从本地 runner 起

:::historico 2026-09-11
从本地 runner（ADR 0102 和 0103）起，加上从 CLAUDE.md 索引迁出的章节，第 28、29 和 30 阶段就在其中。
文本原样移自[阶段历史](historico-de-fases.md)，未作改写。今天有效的内容位于 RN 和 ADR 中。
:::

## 本地 runner——在用户机器上执行（RN-418/419/420，ADR 0102/0103） {#runner-local--execução-na-máquina-do-usuário-rn-418419420-adr-01020103}
产品所有者的请求：agent 在**用户的机器**上、在项目的本地目录中、通过用户的默认终端运行——外加 Code 标签页中真正的交互式终端。两项变更，一项依赖另一项。

**策略（ADR 0102——**全局**决定，在一条关于该变更的自动安全警告之后，由产品所有者明确确认）**：
`git push`/PR/部署（RN-106）和 `sudo`/`doas`（新增）从无条件的 `deny` 变为**绝对上限**——无条件的 `require_approval`，与相邻上限位于**同一**区块、采用**相同**模式（`current.policy ===
'auto_approve'`），永远不能被 `agent_autonomy`（通配符 `"*"`）或 `permissions.json` 自动批准。原先的 `deny` 强行堵住的缝隙在**源头**被关闭：`ApproveAlwaysActionUseCase`/`patternForAction` 拒绝为带 git 外部效果或特权命令的动作在 `allow` 中写入模式——对于这两种情况，“sempre permitir”只批准该实例，从不批准模式。没有这另一半，上限就只是装饰。`sudo`/`doas` 在 `comandoPrivilegiadoNoComando`
（`external-effect.ts`）中按**动词**匹配，扫描命令的所有段，与 `efeitoExternoNoComando` 原则相同。

**Runner（`apps/runner`，新的 Node/TS workspace，ADR 0103）**：用户在自己机器上运行的 CLI
（`brabo-runner --project <id> --dir <pasta> --token brb_...`），通过**新的** Phoenix 通道连接到 **ENGINE**
（`/runner`，
主题 `terminal:<projectId>`），由**一次性**ticket 认证（与 RN-108 模式相同，但 ticket 由 **ENGINE 签发**——schema `"engine"`，有自己的 migration——由 api 通过内部 HTTP 路由请求，与会话 ticket 的流程相反）。它在用户的 `$SHELL` 中执行 `exec`（**已经批准**的 agent 命令——`TerminalExecutor` 中的路由只在一贯的 `decide()`/`proposed_action` 管道**之后**发生，从不在之前），并为终端标签页提供交互式 PTY 模式（`pty_open`/`pty_data`/
`pty_input`/`pty_resize`/`pty_close`——engine 做纯粹的**中继**，从不解释字节）。每个项目只有**一个** runner（`Engine.Runners.Registry`、
`:global`，`:global.register_name/3` 的排他性）；`runner` 模式在**没有**已验证的 workspace 或**没有**已连接的 runner 时会显式**拒绝**——从不退回到 `System.cmd`/bind-mount，对 `runner` 项目来说那并不存在
（由 ADR 0104/RN-423 修订，见上文；退回到一贯路径的行为仍然有效，但只针对 `container`/`mounted`）。PTY 是已认证**用户**的动作，不经过 `proposed_action`，但会被审计（event log 中的 `terminal.session.started`/`ended`，包括标签页在没有显式 `pty_close` 的情况下掉线时）。

runner 的安全边界**不是**沙箱——而是认证（CLI 出示用户**账号**的 Personal Access Token）+ 一贯的审批管道 + 用户同意以自己的权限在自己的机器上运行 CLI。`apps/runner/src/guard.ts` 通过词法解析校验 `cwd` 位于根目录之内，但它被声明为**尽力而为**，不是真正的保证。

**PAT 填补了自动化 token 的缺口（ADR 0105/RN-424..426）。** 第 1 波的真实发现——“产品没有用于自动化的**长期**账号 token 机制，所以 runner 复制了浏览器的登录（cookie/CSRF 持久化在 `~/.brabo/runner-credentials.json` 中）”——在第 2 波中关闭：`personal_access_tokens`（`brb_…`，通过 `hashDeToken()` 的 HMAC-SHA256+pepper 哈希，从不用 argon2——它不适用于**高**熵机密）在项目配置中签发，限定于**一个**项目，可吊销，可选过期。`apps/runner/src/auth.ts` 完全去掉了交互式登录、cookie 和凭据文件——只校验格式并转发 `--token`/`BRABO_ACCOUNT_TOKEN`，CLI **从不**把它写入磁盘。PAT 从构造上**从不**在
`POST .../runner-ticket` 之外认证（`IS_PAT_ROUTE_KEY`/
`@RequirePatAuth()` + `PatAuthGuard`）——从不是全局 `JwtAuthGuard` 中的一个分支，那会让 `RolesGuard` 为用户角色的任何路由授权 PAT。

**`maintainer` 可以吊销其他用户的 PAT（RN-427）**，关闭了 ADR 0105 暂时声明为超出范围的条目（事件响应——离职的 dev 的 token 泄露）。同一模型的扩展，没有新 ADR：**单独**的路由（`GET .../personal-access-tokens/all`、
`DELETE .../personal-access-tokens/:tokenId/admin`），范围按
`projectId` 而不是 `userId`——每个用户的自我吊销（RN-426）不变。

`@xterm/xterm`/`@xterm/addon-fit`（web）和 `phoenix`/`node-pty`（runner）是四个新依赖——与 `mermaid` 同一把例外标尺（ADR 0068）：动态 `import()`，通过对已安装包的 grep 确认没有 `eval`/`new Function`（这不是针对混淆的正式保证，只是强证据——声明为不确定性，而不是断言为确定）。

**ADR 0104——第 1 波完成（RN-421/422/423）：** ADR 0072 和 0103 从未相互沟通——RN-170 在创建时要求 bind-mount，而到 runner 的路由（RN-420）复用了同一个 `workspace_mode == 'local'` 标志而没有任何 bind-mount，所以真正使用 runner 仍然必须通过挂载目录的校验。`workspace_mode`（2 个值）变成了
`execution_mode`（`container`/`mounted`/`runner`，migration `0048`）——RN-170（现为 RN-422）只对 `mounted` 生效；`runner` 诞生时路径只做**词法**校验（没有 I/O），`workspaceVerifiedAt: null`，当某个 runner 连接并在**主机**上确认路径时提升为已验证（`POST /internal/projects/:projectId/workspace-verification`，RN-423）——runner 是路径的**事实来源**，会覆盖向导中输入的内容。`Engine.Actions.TerminalExecutor.decisao_de_execucao/1`
获得了**四个**出口：只有在 workspace 已验证**且** runner 已连接时才路由；两者缺一时显式**拒绝**——从不退回到 `mounted` 的
`System.cmd`/bind-mount，对 `runner` 项目来说那并不存在。

**实现中的发现，更正 ADR（ADR 不被编辑——更正位于这里和
[backlog.md](backlog.md#backlog-of-the-runnerexecution_mode-adr-0104)）：**
ADR 0104 中所说的已有项目在三种模式之间的转换“开始被允许而无需重建项目”是**不正确**的。`UpdateProjectDto` 仍然故意排除 `executionMode`/`workspacePath`——这不是简单的 PATCH（worktree、permissions.json 和 engine 的缓存都指向旧的范围）。第 1 波只交付了**创建**时的三值字段；已有项目的转换是未来的波次，有自己的设计，尚未计划。runner 的 backlog：第 2 波（PAT，ADR 0105）关闭了阻碍 `npm publish @brabo/runner` 的条目，第 3 波（ADR 0106）交付了分发本身——`tsup` 把
`apps/runner` 打包成单个 `dist/index.cjs`（`node-pty` 作为必需的 `external`，原生绑定），由一个独立的 workflow（`publish-runner.yml`）在每个最终 tag 上发布，与 `release.yml` 并行。经实际测试的真实发现：`index.ts` 的自动运行守卫需要对 `process.argv[1]` 使用 `realpathSync`——没有它，当 CLI 通过 `npm install -g` 安装的 `bin` 调用时 `main()` 从不运行（符号链接，`process.argv[1]` 从不通过 realpath 解析，而 `import.meta.url` 总会解析）。声明的运维待办：真正的发布需要产品所有者创建 npm 的 Automation Token 并配置 secret `NPM_TOKEN`——没有它，workflow 会发出警告并跳过，从不失败。按 `{project_id, machine_id}` 的排他性继续推迟，直到真正出现第二个并发开发者；尽力而为的 `guard.ts` 是**重申**的不变量，而不是缺口。参见
[ADR 0104](../adr/0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md)/
[ADR 0105](../adr/0105-personal-access-token-do-runner-escopado-por-construcao.md)/
[ADR 0106](../adr/0106-distribuicao-do-runner-via-tsup-e-npm-publish.md)。

## 开发工具——`pnpm bootstrap` {#ferramenta-de-desenvolvimento--pnpm-bootstrap}
`scripts/dev/bootstrap.sh` 中的终端菜单，汇集日常要做的事：Docker、K8s、Database 和 Test。它之所以存在，是因为这些命令位于**三个**互不相通的地方——`package.json`、`Makefile` 以及 `deploy/k8s/`/`docker/` 中的脚本——而死记硬背的知识会腐烂。

它**不重新实现任何东西**：每个叶子都调用已有的命令。`--print-commands` 模式在没有 TTY、不执行的情况下解析整棵树，测试（`scripts/dev/bootstrap.spec.ts`）就运行在它之上——TUI 无法做单元测试，但菜单→命令的映射可以，而出错的正是它。零新依赖；颜色取自 `design/tokens.css`，以 24 位 ANSI 输出，并降级到 256 色和无色。

正在执行的命令的输出是**可滚动**的（SGR 鼠标滚轮、`j`/`k`、PageUp/PageDown、`G` 回到末尾）。缺的不是读取滚轮：而是**偏移**——`tail -n` 只会显示末尾——所以窗口变成了用 `sed -n 'a,bp'` 截取的片段，可以通过 `--print-window` 在没有 TTY 的情况下测试。页脚会说明两个后果：向后滚动会**冻结**窗口（像 `less +F` 一样，否则 5 Hz 的重绘会撤销滚动），而只在执行界面开启的鼠标追踪会在**每一种**退出时关闭——`restaurar_terminal` 中的 `\e[?1006l\e[?1000l`，由 EXIT trap 覆盖。转义解析器是通用 CSI 的（读取到结束字节为止）：读取固定的两个字节会把序列的其余部分留在缓冲区中，而菜单把 `[1-9]` 当作选择，滚轮一转就会触发菜单项。

记录的三项决定：`Create` 从零置备，`Deploy` 发布到已存在的环境（所以只有 `Deploy` 可以按服务选择）；在 K8s 中只有 `All` 可用，Api/Engine/Web 显示为**禁用**而不是消失，因为菜单应该说出产品不做什么；`Database › Delete` 会重建 pgvector 扩展，因为
`docker/postgres/init.sql` 只在卷首次初始化时运行——单纯的 `DROP SCHEMA` 会让下一次 migration 失败，而由于 engine 共享同一个数据库，恢复需要 `db:migrate` **和** `engine:migrate`。

**`Docker › Reset total`**（`scripts/dev/reset-total.sh`）把整个序列合并到一个叶子中——preflight、`up --build --wait`（Compose v2.17+ 的 `--wait` 就是“直到全部健康”，无需手写健康检查循环）、与 Delete 相同的 `DROP SCHEMA`、`db:migrate` +
`engine:migrate` 以及种子——带有**自己的**确认界面（`confirmar_reset`，要求输入 `RESET`），不同于 Delete 的确认界面（要求输入数据库**名称**），并且没有 Delete 的“postgres 已运行”前提，因为正是这个命令从零启动 compose。种子
（`apps/api/src/db/seed.ts`）增加了一个从 `.env` 激活 provider 凭据的步骤，复用 LLM smoke 已在使用的**同一组**
`<PROVIDER>_TEST_KEY` 变量
（`apps/api/test/infrastructure/llm/*.smoke.spec.ts`）——一个命名约定，两个使用方；没有定义变量的 provider 不会加入，也不报错，凭据归属 **OWNER**（RN-058）。

第一次运行重置时的两个发现，而不是因为这一项本身——两个都不是假设的，两个都破坏了真实执行：

1. `gemma:1b` 在 Ollama 的 registry 中不存在（`manifest unknown`——只有 `gemma3:1b` 存在），所以 `ollama-model-loader` 总是失败，`--wait` 从不以绿色结束。在以**代码**形式携带错误值的六个地方修正——`docker-compose.yml`/`.prod.yml`、
   `.env.example`、`docker/ollama/pull-models.sh`、
   `scripts/dev/verificar-modelos-ollama.sh`、
   `deploy/k8s/base/ollama/job-model-loader.yaml` 以及 `docs/business-rules.md` 中的 RN-415——不触碰 ADR 0099/0100（已接受），也不触碰 CLAUDE.md 同一节中的历史叙述，它们描述的是当时请求/决定的内容，而不是当前的运维值。
2. 更严重，也更久远——`Database › Delete`（第 3.4 项，自菜单创建时就存在）从未真正删除：`DROP SCHEMA public
   CASCADE` 触及不到 `engine.*`（Ecto/Oban 位于**自己的** schema `engine` 中），也触及不到 `drizzle.__drizzle_migrations`（drizzle-kit 的控制表位于**自己的** schema `drizzle` 中）。结果：`mix ecto.migrate` 在幸存的 engine 表上撞到 `duplicate_table`，而 `pnpm db:migrate`——更糟，**没有任何**错误——看到 drizzle-kit 的控制表完好，断定已经全部运行过，于是**没有**重建任何 api 的表。`Delete`/`Reset total` 现在也会删除 `engine` 和 `drizzle`，按此顺序，在 `public` 之前。

## 分组标签页、项目级 PR、通过 Runner 的本地目录、PO 轮播（2026-08-20） {#abas-agrupadas-prs-project-wide-pasta-local-via-runner-carrossel-do-po-2026-08-20}
五个独立波次，按争用文件并行运行，来自对项目界面的真实使用——没有一个是事先计划的。同一计划的第六波（产品和文档的完整翻译，i18n）比五波加起来还大；它的**基础**（第 6a 波——机制，尚无内容翻译）已经关闭：web 中的 `react-i18next`+`i18next`
（`en` 成为应用的默认语言，`pt-BR` 保留——RN-425）、`users` 中嵌入登录/refresh payload 的 `locale` 列、证明该机制的新 `AccountPage`（`/account`），以及带有
`i18n.defaultLocale: 'en'`/`locales: ['en', 'pt-BR']` 的 Docusaurus——`docs/` 当前的 pt-BR 快照已保存在
`website/i18n/pt-BR/docusaurus-plugin-content-docs/current/` 中。第 6b 波（界面的批量提取 + `docs/` 的翻译）在 2026-08-22 以四条并行前线取得了很大进展——各前线的细节见 CHANGELOG.md（Unreleased/文档）——但**仍未**关闭：还缺 `docs/business-rules.md`（只翻译了 front-matter；包含数百条 RN 的正文仍 100% 是葡萄牙语——这是整个文档中最大的文件，增长速度快于顺手翻译的速度）以及一小部分较小的 `.tsx` 组件。真正关闭时，本节会加入最终总结，CLAUDE.md 的其余部分（Stack、“文档”）也会全面修订，以记录英语真正成为主要语言。

- **分组的标签标尺**：11 个零散标签页变成顶部的 6 个——概览、**Agentes ▾**（执行者、Criativo、聊天、Insights）、**Dev ▾**
  （代码、PR、审批）、**Documentação ▾**（Backlog、架构）、花费、配置——通过新的 `GroupedTabs`（`apps/web/src/components/
  ui/GroupedTabs.tsx`），构建在通用 `Tabs` **之上**，后者在其他界面中继续不分组。`ChaveDeAba` 仍然是扁平的——只有呈现被分组，以免改动 `?tab=` 深链接。聊天和 Chat RAG 变成**一个**标签页（`ProjectChatShell.tsx`），带有内部分段控件（"Conversar"/"Buscar"）——两者之间的业务区别（RN-202：对话会激活 agent 并在每个回合消耗 owner 的密钥；RAG 是对索引的读取，没有 agent）没有改变，只是 UI 容器变了。
- **PR 标签页，项目级**：`ProjectApprovalsTab` 把“审查中的 PR”限定在最近的会话——一旦新会话提议了另一个 PR，旧会话中某个 PR 的审查就会从界面上消失。新的 `prs` 标签页直接从 git provider 列出（从不按会话），并通过新的 `findPendingByProject` 与待处理的 `proposed_action` 交叉，它位于已有的按会话方法旁边——决定使用动作**自身**的 `sessionId`，从不使用 `latestSession`（RN-423）。它是 UI 上第一个真正产出 `git_merge` 的地方；受保护分支锁（RN-154）仍然是绝对的、未被触碰——“Merge”按钮只**提议**，人工审批仍是执行的唯一途径。
- **架构标签页**：从概览中提取（module_map、C4 图、ADR、待办），概览保留一个精简摘要 + 链接。设计系统中的第一个 lightbox——`Modal` 获得了 `size="full"`——用于放大 C4 图（SVG，无损）（RN-424）。
- **通过 Runner 浏览本地目录（RN-422，ADR 0104）**：修订 ADR 0072（它曾明确拒绝目录选择器）而**不**编辑它——浏览是存在的，但通过 Runner，它已经以用户在自己机器上的真实权限运行，从不通过 api 枚举容器的文件系统。现有通道上的两个新事件（`fs_list_dir`/`fs_home_dir`），engine 纯中继，与 PTY 模式相同。`FolderBrowserModal` 在项目已存在的地方可用。在创建时（`NewProjectWizard.tsx`），这个缺口一直声明到 ADR 0108：在 `mounted` 模式中项目仍只在确认时诞生（路径校验在那里会触及磁盘），但在 `runner` 模式中，“Procurar pasta...”开始**提前**创建项目——通过身份快照复用，而不是每次点击都重复创建——以便在确认之前锚定通道的 ticket（RN-437，ADR 0108）。新的 `RunnerOnboardingPanel`（与终端标签页共享）取代了之前原始的 `<code>`。`apps/runner` 有了 README——真正发布到 npm/打包签名二进制仍然超出范围，在 README 中声明。目录浏览器本身变成三栏（快捷方式、单击选择/双击进入的列表、详情面板——RN-436），遵循产品所有者的视觉参考。
- **修复 PO 轮播的 bug（RN-421）**：待推进的那一批依赖于对最近 200 个事件（`useSessionEvents`）的扫描——在长会话中，提议会滑出窗口，轮播退化为单张卡片或消失。与 RN-180 已为 `ContextAside` 修复的同一类 bug；现在的来源是 `useBacklog`（完整，没有窗口），在 backlog 尚未响应时按故事回退。

## 手动 handoff 给所选 agent（RN-440/441，ADR 0109） {#handoff-manual-a-agente-à-escolha-rn-440441-adr-0109}
关闭自第 13c 阶段以来一直开放的 backlog 项。`CreateHandoffUseCase` 仍然是写入 `toAgent` 的**唯一**地方（ADR 0038）——只增加了一个可选的 `actor?: Actor`，默认值仍是一贯的 `{kind:'agent', id: fromAgent}`。`RequestManualHandoffUseCase`（新路由，`POST
.../sessions/:sessionId/handoffs`，`developer` 角色）对照 `addressableAgents()` 校验 `toAgent`——**封闭**的目录（领域 lead ∪
`SOLO_CONVERSATIONAL_AGENTS`），比 `assertHandoffTargetAllowed`（只拒绝子 agent）更严格——按会话中最近的 `agent.activated` 解析 `fromAgent`（没有时用哨兵值 `"usuario"`），并写入 `actor: {kind:'user'}`。handoff 与自动的一样以 `offered` 诞生：已有的接受卡片（`SessionPage.tsx`）会自动接住它，接受路径零改动。

编码**之前**的调查发现 `ux-designer`（ADR 0087）与促成这一项的 Staff（ADR 0088）处于**同样**的境地：`agent_command_controller.ex` 中 `message/2` 的子句已经就绪，却没有任何人工路径通往它。两者在同一次改动中加入 `AGENTES_DE_CHAT`——`infra`/`qa` 仍被排除，与那里已记录的模式相同（没有 `kickoff/1` 也没有 `message` 子句的 lead）。已声明，未隐藏：web 侧的 `SOLO_CONVERSATIONAL_AGENTS` 镜像（`apps/web/src/lib/agents.ts`）**没有**通过测试与 api 的交叉核对——出现分歧时，最坏情况是选择器中出现一个后端仍会以 400 拒绝的过时选项。

## 按领域的预算——关闭 ADR 0038 的裁剪（RN-443，ADR 0110） {#budget-por-área--fecha-o-corte-do-adr-0038-rn-443-adr-0110}
backlog 中已批准的一项（“Older backlog”，`docs/explanation/backlog.md`）。
`agent_areas` 获得 `budget_micros`/`spent_micros`，完全镜像 `max_parallel`——同一行，同一个决定所有者（`maintainer`），没有新表。它是与项目和会话并列的**第三个**、**附加**的上限（`CheckBudgetGateUseCase` 并行检查三者，任何一个阻塞就拒绝），**不是** ADR 0064 的模型 binding 级联（`会话 >
agent > 领域 > 项目 > workspace`，“最具体的胜出”）——两个机制只共享“领域”这个词；不混淆两者是 ADR 0110 的核心要点，正如 RN-101/ADR 0063 已在花费报告中把 owner 视图与成员视图分开。只要行动者属于某个领域（lead 或成员，通过 `areaDo`——纯函数，对没有领域的行动者不触碰数据库），`spent_micros` **总是**累加，无论是否配置了 `budget_micros`（`null` 是默认值，没有上限）。

## runner 的独立二进制（2026-08-23，RN-451/452，ADR 0112） {#binário-standalone-do-runner-2026-08-23-rn-451452-adr-0112}
ADR 0104 的 backlog 项（“standalone binary，`pkg`/`bun build
--compile`”），是 ADR 0106（通过 npm 分发）的伴随项。产品所有者的明确决定：真正的**单一**二进制，从 v1 起就是包含 Windows 的完整矩阵——更便宜的替代方案（“二进制 + 旁边的 `node-pty-native/` 目录”）被提出并被拒绝。

`bun build --compile` 通过 `with { type: 'file' }` 嵌入 `node-pty` 的原生 `.node`，并在运行时把它解压到一个**真实**的临时目录（`native-pty-loader.ts`）——这是必要的，因为 `node-pty` 通过一个**计算出的**路径的 `require()` 解析自己的插件
（`lib/utils.js#loadNativeModule`），Bun 无法自行嵌入（构建通过，运行时抛出 `Cannot find module`，在设计修复之前已测试过）。五个平台
（`linux-x64`/`linux-arm64`/`darwin-x64`/`darwin-arm64`/`win32-x64`），每个都在自己的**原生** runner 上构建
（`.github/workflows/build-runner-binaries.yml`，最终 tag 触发，与 `publish-runner.yml` 同样的模式），二进制附加到已有的 Release 上。

**按平台诚实地验证**：只有 `linux-x64` 在这个环境中真正执行过（`build:bin`+`smoke:bin` 为绿色，反复执行——正是运行真实二进制时下面两个 bug 才出现）。其他四个——尤其是 Windows，有**三个**原生文件而不是一个——是通过阅读 `node-pty` 的源代码推理出来的，从未在该操作系统的真实机器上执行过；它们的第一次真实执行是**下一个**版本 tag，而不是这个 PR。没有预防性地按平台应用任何回退——这次调查中没有任何东西**证明**五个之中有哪一个以这种方式无法工作；如果某个真实 tag 表明确实如此，那会成为新的条目，而不是今天的假设。

两个只有在运行编译出的二进制时才发现、而不是阅读 API 发现的缺陷：
`--external node-pty` 必须出现在 `bun build` 命令中，即使代码中没有任何对 `node-pty` 的静态 `import`——回退用的 `await import(...)`（只在二进制之外使用）无论如何都会被 Bun 发现并嵌入，并在运行时以误导性的错误失败；自动运行守卫（ADR 0106）需要第二个分支——二进制内部的 `process.argv[1]` 是一个**虚拟**路径（`/$bunfs/root/...`），`realpathSync` 无法到达，会在尝试 `main()` 之前、在任何 `try/catch` 之外抛出 `ENOENT`。

## 转换已有项目的 execution_mode（RN-447..450，ADR 0111） {#converter-execution_mode-de-projeto-existente-rn-447450-adr-0111}
关闭 runner 第 1 波（ADR 0104）在
`docs/explanation/backlog.md` 中记录的更正：该 ADR 的第 4 项说，在已存在的项目中把 `execution_mode` 在 `container`/`mounted`/`runner` 之间转换“开始被允许而无需重建项目”，而这在此之前都是假的——`UpdateProjectDto` 仍然故意排除这两个字段。
`PUT projects/:projectId/execution-mode`（`maintainer`，
`ConvertProjectExecutionModeUseCase`）是**专用**路由，不是放宽的 `PATCH`：它编排迁移，而不只是更换列。

只要项目中有任何 dev agent（在**任何**会话中，按 `project_id` 直接从 `engine.dev_agent_states` 读取，与 RN-409 相同的路径）不是 `idle`，就以 409 拒绝——`idle_tripped` 在这里**算作**活跃，与 RN-409 的“在线”标准相反，因为 agent 仍在内存中持有 `workspace_root`，等待人工解除阻塞（RN-447）。`PermissionsFileStore` 获得了 `move(from, to)`：permissions.json 的内容从不改变，只有物理路径改变，因为 `projectScopeRoot` 派生自（模式，路径）这一对（RN-448）。离开带有已置备容器的 `container` 时，生命周期（ADR 0081）被带到 `removed`——如果原本是 `running`，先经过 `stopped`——在列改变**之前**，因为
`RegistrarTransicaoDeContainerUseCase` 拒绝 `container` 模式之外的转换；进入 `container` 从不自动置备（RN-449）。`workspaceVerifiedAt` 在每次真实转换中都会清零，包括以看起来相同的路径回到 `runner`（RN-450）。与当前相同的（模式，路径）是空操作——甚至不检查活跃的 dev agent。

**已声明、未隐藏的后果**：转换**从不**在旧根目录与新根目录之间复制已写的代码。这对已**提交**的内容是安全的——每当目标目录尚未标记为就绪时，engine 都会从 bare 仓库从零派生 worktree
（`Engine.Actions.Workspace.ensure!/4`），所以下一个 agent 会从真实的 git 在新根目录中重建工作树。**无法**保留的是被遗弃的 worktree 中**未**提交的 diff——它会在旧磁盘上成为孤儿，从不迁移也从不删除。活跃 dev agent 的上限（RN-447）降低了风险（从不在有 `working` agent 时转换），但不能消除：一个处于任务之间的 `idle` agent 可能正守着一个脏的 diff，而这里没有任何东西会在转换前检查工作树是否干净。

## 本地目录作为 Chat RAG 的参考附加（2026-08-23，RN-455..457，ADR 0113） {#pasta-local-anexada-como-referência-do-chat-rag-2026-08-23-rn-455457-adr-0113}
产品所有者的请求：把用户**自己**机器上的一个目录附加到项目，作为 agent 的**只读**参考——不需要 CLI
`brabo-runner`（ADR 0103）。明确**不是**项目的执行/workspace：`execution_mode: runner`（ADR 0104）需要 CLI，是因为它需要一个真实的**主机**路径供容器路由命令；这更像是“把文件附加到一次对话”。浏览器读取所选文件的**内容**
（`File.text()`）和**相对**路径（`File.webkitRelativePath`）——从不读取主机的绝对路径（`File` API 对任何网站都不暴露），因此 ADR 0113 明确指出这**不是**对 ADR 0072/0107 所拒绝内容的修订：它们拒绝的是从浏览器**解析**主机路径；这里根本没有要解析的路径，只有浏览器本来就有权读取的字节。

`chunks.scope`（ADR 0079/0080）获得**第四个**值 `'local'`（migration
`0052`，`ALTER TYPE ... ADD VALUE`，附加性的——migration `0045` 的两个 CHECK 已经写成“是 `session` 或不是”，所以 `local` 与 `docs`/`adr` 落在同一侧，无需新 CHECK）。`IndexLocalFolderUseCase` 紧密镜像 `IndexProjectDocsUseCase`——对 `.md`/`.mdx` 进行感知 Markdown 的分块、`RagEmbeddingService`、embedding 宕掉时写入不带向量的块而不是失败（RN-233）——但当**聚合**上限超出（文件数量、字节总和）时，它会**拒绝**（400）整个上传，从不静默截断：这是用户在界面上用目录选择器做出的**单次**动作，而不是后台扫描。过大或扩展名不被识别的单个文件只会被**跳过**（`filesSkipped`），从不让整批失败（RN-456）。`origemDoChunk` 不需要任何新分支：`local` 像 `docs`/`adr` 一样携带 `sourcePath`，落入引用早已会渲染的 `kind: 'file'`。

**从不进入通用的“Reindexar agora”（RN-457）**：`ReindexProjectUseCase` 通过读取**服务器**能够重新访问的来源（项目仓库、event log）来重新索引；`local` 没有任何可重新访问的来源——文本只存在于附加者的浏览器中。重新附加目录（在 `POST .../rag/local` 上重新上传，`maintainer`）**就是**重新同步的机制，是一个故意分开的按钮，两个用例中都有交叉注释互相指向对方以及 ADR 0113，以免将来的“修复”把两者重新连起来、抹掉用户的资料。覆盖率（`RagCoverage.local`）有**自己的**形式——没有可比较的“仓库总数”——而 `lastAttachedAt` 是“从不写 Xmin”规则（RN-237）唯一真正的例外：一个真正的 `MAX(chunks.created_at)`，不是猜的（RN-458）。

## 回合活动条——消息流只在结束时收到回复（RN-459/460） {#faixa-de-atividade-do-turno--o-fio-só-recebe-a-resposta-no-fim-rn-459460}

产品所有者的请求：会话界面开始在输入框**上方**显示一条活动条，用人类语言叙述对话型 agent（Criativo、PO、Arquiteto、Dev Lead、UX Designer、Staff）在回合**期间**正在做什么——视觉参考：Claude Code 的状态行。消息流只在回合结束**之后**才收到回复气泡；这条规则属于**聊天**（Phoenix 通道），只对六个对话型 agent 有效——没有活跃 agent 的咨询型聊天（SSE，
`streamChatMessage`）保持一贯的流式气泡，不受影响。

**机制**：六个服务器本来就发出**持久**的 `tool.call`；现在还会发出 `broadcast(state, "tool.call", %{tool: name, agent: @agent})`——**临时**的，不带 `args`（RN-096/RN-412）——由通道实时投递。六个 `dispatch_tool` 之间没有共享的 behaviour/宏（四种不同的结构形式，经完整阅读确认）——改动是适应各自本地形式的六处编辑，而不是一次重构。在 web 侧，一个**纯**的 reducer
（`reduzirAtividadeDoTurno`/`lib/atividade-do-turno.ts`）把 `agent.delta` 累积为当前文本；当 `tool.call` 到来时，把非空的当前文本归档为一行叙述、清零，并总是加入一行带有 `fraseDaFerramenta(tool)` 的工具行（19 个工具的词典，`lib/narracao-de-ferramentas.ts`，没有自己的 RN）。一个**专属**标志（`turnoViaCanal`，从不从 `statusAgent`/`streamingAgent` 派生，它们在回合中途会经过合理为 `null` 的窗口）决定显示活动条还是旧的气泡——从不同时显示。

**呈现规则（历史）**：`agruparNarracoesDoTurno`，在同一个 `useMemo` 中位于 `afundarDesfechos`（RN-172）之后的新纯函数一遍——同一 `turno`+`autor` 的连续 `agent.response` 变成一个紧凑的 `Disclosure`（“Passos do turno · N”），只有最后一个原样留在其外。`turno === 0`（`turnoDoSeq` 的哨兵序言）被**排除**在分组之外——旧的 fixture 为测试另一个机制（RN-138/RN-177）堆叠了没有回合边界的 `agent.response`，没有这个排除，新的分组会在那里产生 `Disclosure` 套 `Disclosure`。`afundarDesfechos` 本身没有改变。

**途中的发现，范围由产品所有者决定扩展**：调查发现六个服务器中有**四个**（Arquiteto、Dev Lead、UX
Designer、Staff）在迭代上限处**沉默**地结束——
`defp run_turn(state, remaining) when remaining <= 0, do: state`，没有任何事件，违背了 agent 循环不沉默结束的永久规则。只有 PO 已经在发出 `toolloop.limit_reached`（RN-166）；Criativo 故意以 `agent.error` 分歧（在代码本身中记录的决定）。修正后的四个开始发出
`toolloop.limit_reached`，与 PO 相同的事件（RN-459）。


## 2026-09-11 从 CLAUDE.md 的索引迁移而来 {#migrado-do-índice-do-claudemd-em-2026-09-11}

下面的条目来自 `CLAUDE.md` 的索引表，**在本文件中没有自己的章节**——它们的叙述只存在于一个地方。当该表被缩减为索引时，它们被原样、按原顺序移到这里。这里的内容是历史；今天有效的内容位于 RN、ADR 以及 `CLAUDE.md` 的“当前与开放状态”一节中。

### 16–26 计划（ADR 0060–0072） {#programa-1626-adr-00600072}
采用设计 handoff；8 个界面；会话 kind；分页事件；花费；按领域的模型；每个项目一个容器（25b 被裁剪）；Code 标签页

### pnpm bootstrap {#pnpm-bootstrap}
基于已有命令的终端菜单；完全重置

### 原生 Ollama / 从 Hugging Face 拉取（RN-461..463，ADR 0114–0115） {#ollama-nativo--pull-de-hugging-face-rn-461463-adr-01140115}
dev bootstrap 询问一次并把 Ollama 的模式持久化到 `.env`；Hub 的模型浏览器，分两步拉取，并带有官方发布者的 allowlist

### website 的独立 lockfile（ADR 0117） {#lockfile-próprio-do-website-adr-0117}
`website/` 离开根目录的 pnpm workspace——lockfile 和安全 override 被隔离，产品的 `pnpm audit` 不再报告 Docusaurus 的依赖树

### 通过浏览器自动配置 runner（RN-464..466，ADR 0118） {#configuração-automática-do-runner-pelo-navegador-rn-464466-adr-0118}
在浏览器中生成 Ed25519 设备密钥，作为 PAT 的补充；通过 GitHub Releases 代理二进制；File System Access API 写入配置好的目录，在 Chromium 之外回退为下载；`--project/--dir/--token` 在 CLI 中变为可选

### 发布到 GHCR 的镜像（ADR 0119） {#imagens-publicadas-no-ghcr-adr-0119}
`release.yml` 在每个最终 tag 上发布四个镜像，并在 `.release/images.json` 中记录 digest；生产 overlay 不再指向占位符

### 按聚合划分的 schema（ADR 0121） {#schema-por-agregado-adr-0121}
`db/schema.ts` 变成 barrel；51 张表和 34 个枚举变成 `db/schema/` 下的 16 个文件，每个对应 `domain/*` 的一个聚合

### `SessionPage.tsx` 拆成 5 个机械 PR（ADR 0122） {#sessionpagetsx-em-5-prs-mecânicos-adr-0122}
3 807 → 2 661 行；时间线/回合、`StorySlide`、`StructuredQuestionCard`、backlog 树 + `ContextAside`、hook `useSessionReadiness`——回合通道簇和 `ProjectSettingsTab.tsx` 仍被排除，已声明

### `SessionPage.tsx` 的回合通道 hook（ADR 0124） {#hook-do-canal-de-turno-do-sessionpagetsx-adr-0124}
2 661 → 2 479 行；去重的机械 PR
（`iniciarTurnoDoAgente`/`finalizarTurnoDoAgente`/`cancelarTurnoOtimista`），随后把 Phoenix 通道的状态 + 副作用提取到 hook
`useTurnoDoAgente`（`lib/session-turno.ts`）——关闭了 ADR 0122 声明为开放的条目；`ProjectSettingsTab.tsx` 仍被排除，另作决定

### 按章节拆分的 `ProjectSettingsTab.tsx`（ADR 0125） {#projectsettingstabtsx-por-seção-adr-0125}
2 532 → 77 行；17 个章节各自成为 `routes/settings/` 下的一个文件（+ 包含**两个**多调用方辅助函数的 `shared.ts`），旧文件留在原路径作为入口和 barrel——该路径和 11 个导出名称是 3 个测试的契约。关闭了 `docs/architecture.md` 中债务条目的**最后**一半

### 项目的竖向导航轨道（ADR 0126，RN-201） {#trilho-vertical-de-navegação-do-projeto-adr-0126-rn-201}
两级的横向标尺（`GroupedTabs`）变成竖向轨道，**三个**分组同时展开；`CodeShell` 轨道的几何形状，移植了键盘操作，5 个计数器仍分开。修订 RN-201：代码标签页不再自动折叠侧栏

### 配置的锚定目录（CHANGELOG） {#sumário-ancorado-de-configurações-changelog}
标签页的 17 个章节获得 `id`、带可访问名称的 `<section>`，以及在内容区**之内**分为四组的目录——没有新的竖向条带，框架保持在 ADR 0126 的 444px。注册表位于 `routes/settings/sumario.ts`（与 `project-tabs.ts` 同一设计的第三个列表），深链接 `?section=`，通过 `IntersectionObserver` 监视；只有**已挂载**的章节才进入目录

### 继承值的统一模式（CHANGELOG） {#padrão-único-de-valor-herdado-changelog}
配置标签页中“没有自己的值”的**四种**措辞，变成来自同一来源（`routes/settings/heranca.tsx`）的两个极点和一个动词：标签说明**状态**，细节说明**后果**。词汇统一了，形式没有——标记只出现在控件本身不显示状态的地方

### 配置中按章节保存（RN-469） {#salvar-por-seção-em-configurações-rn-469}
并行度和花费上限把 N 个行内按钮换成章节的**一个**按钮
（`settings/secao-salvavel.tsx`），带有待处理行数和**按行**的结果——保存是 N 次调用，而不是一个事务，界面从不断言它没有得到的东西。三个自动保存的章节和凭据被排除，各有已声明的理由

### “需要你”面板（RN-467） {#painel-precisa-de-você-rn-467}
项目顶部的标签在一个地方打开**五个**决策队列——分开、按紧急程度排序、没有任何求和（标签上也没有）。审批和合并在那里通过 `ApprovalCard` 决定；其他三个链接到标签页。架构待办借用了故事的日期，并**说明**是借用的

### 模型级联作为可见的链条（RN-470） {#cascata-de-modelo-como-cadeia-visível-rn-470}
来源列不再打印数据库的枚举，而是变成 `workspace › projeto ›
área › agente`，每个节点有四种状态（`settings/cascata.tsx`）——在不触碰 api 的情况下区分 `origin: 'agent'` 的**两种**含义。被丢弃级别的提示进入链条；三个 `—` 获得三种文本。关闭了 UI 改进画布（7 项中完成 7 项）

### 先选目录，再选 runner（RN-473/474） {#pasta-antes-do-runner-rn-473474}
通过浏览器配置 runner（ADR 0118）颠倒了顺序：
`showDirectoryPicker` 是**第一**步，二进制是**最后**一步，尽力而为——没有资产的 release 曾在选择器打开之前就返回 502，目录因此无法到达。二进制失败时保留已写入的两个文件，并把说明换成 `npm install -g @brabo/runner` 路径。说明之后，
`EsperaDoRunner` 以三种状态和上限探测 `workspaceVerifiedAt`

### 设备密钥中的 `kid`（RN-475） {#o-kid-na-chave-de-dispositivo-rn-475}
ADR 0118 的自动模式**从未**认证成功：浏览器丢弃了注册返回的 `id`，写入的 JWK 诞生时没有 `kid`——CLI 总是拒绝它。注册和导出变成**一个**函数
（`registrarChaveEExportarPrivada`），在**两条**路径上都是；CLI 的拒绝也不再与“没有密钥”无法区分。让问题漏过的测试断言的是文件被**打开**，从不是内容

### 不再沉默的置备（RN-477） {#provisionamento-que-não-fica-calado-rn-477}
两个失败不会变成任何状态——`try` 之外的 `step.check`，以及在 bootstrap 行存在**之前**的 `createRepo` 拒绝——界面永远轮询“Iniciando…”，没有按钮。所有问题的根本原因：`/data/git-repos` 和
`/data/project-workspaces` 在 **DEV** 镜像中以 `root` 诞生，而 `Dockerfile.prod` 早已知道要在 `USER` 之前创建它们

### 策略文件与终端范围（RN-478） {#o-arquivo-de-política-e-o-escopo-do-terminal-rn-478}
`projectScopeRoot` 有**两个**需求相反的使用方，而 `runner` 模式（没有 bind-mount）把它们分开了：范围仍指向**主机**，`permissions.json` 改为位于**受管**根目录。激活执行曾返回 500（`mkdir '/home/<usuario>'`），**读取**则静默降级——在 `runner` 项目中这个文件从未存在过。一并修复：用带 400 的类型化错误取代原始的 `Error`，概览不再吞掉 api 的消息，以及 OpenAPI 注解曾为两种从来不是 409 的情况承诺 409

### 点击之前提示人工步骤（RN-473/477） {#aviso-do-passo-humano-antes-do-clique-rn-473477}
runner 的终端步骤以前只在成功状态中宣布；现在在初始状态中也会说明，当能断言所选目录就是项目目录时，最终命令会加上 `cd <caminho>`。按钮标签**不**变——它说的是目录，而目录确实是自动的

### 一个模型用于所有 agent（RN-476） {#um-modelo-para-todos-os-agentes-rn-476}
`Modelos por agente` 表增加了一个条，一次把**一个**模型应用到 17 个 agent，写入 **AGENT** 级别（按项目会需要 `maintainer`，还会改动会话的默认值）。这是 RN-469 中“具名值在 `onChange` 时保存”规则的第一个**例外**——选择器是动作的参数，而不是配置——采用 RN-469 本身的三状态结果

### `project_members` 中的降级上限（ADR 0127，RN-472） {#tetos-de-rebaixamento-em-project_members-adr-0127-rn-472}
`projectRole ?? workspaceRole` 的覆盖在两个方向上都**保留**（它是能力，不是 bug）；加入的是用例中两个 403 上限——没有人能降级 workspace 的 `owner`，没有人能降级自己。RN-471 宣布为虚假的三个 OpenAPI 描述现在描述的是代码；`Select` 的 gate 是单独的 PR，因为界面无法计算第一个上限

### RAG 的搜索遥测（RN-479..481） {#telemetria-de-busca-do-rag-rn-479481}
混合搜索留下痕迹：`rag_searches`（权重**冻结**在行中）和 `rag_feedback`（有用/不相关的投票，唯一真实的信号）。是**表**而不只是事件，因为 `session_events.session_id` 是 `NOT NULL`，而标签页中的搜索没有会话——`rag.search`/`rag.feedback` 事件是**叙述**，只在有会话时存在。在已有 `rag_search` 的六个 agent 中加入工具 `rag_feedback`（`:direct`），并用 `medir:rag` 读取。**没有**任何校准——这一步只做埋点

### 容器 broker（ADR 0130，RN-485/486） {#broker-de-container-adr-0130-rn-485486}
`apps/broker` 诞生，它是服务器上与 Docker 守护进程通信的**唯一**进程——并且它**不**接受规格：它接收 `projectId` + 操作，从 api **读取** Arquiteto 的决定，并**组装**镜像、网络、资源和唯一的挂载。ADR 0128 的端口从 `apps/runner/src/` **移到** `packages/docker-port`（两个使用方都打包它；api 不能使用它）。生命周期路由开始在登记状态旁边返回观察状态，二者不合并

### 为 infra 路由模块（PR 1.4）（ADR 0131，RN-487） {#roteamento-de-módulos-para-infra-pr-14-adr-0131-rn-487}
Arquiteto 的第七个工具 `route_modules_to_infra`：当前 `module_map` 中每个模块一项 `{modulo,
imagemCandidata, porque}`，记录为
`artifact.module_routing`（无表，与
`artifact.project_image`/`artifact.c4_diagram` 设计相同）。它**提名候选**——每一项的镜像都经过与 `choose_project_image` 相同的 `validarDecisaoDeImagem`——而在候选中**选定**的是 Infra，在单独的 PR 中（1.5，紧随其后关闭）

### RAG 命中率的 golden-set（ADR 0132，RN-490） {#golden-set-de-acerto-do-rag-adr-0132-rn-490}
把 QA golden-set（ADR 0123）的模板应用到混合搜索：由于判断不在 engine 中（它是 api 中的 `HybridSearchUseCase`），
`seed-golden-set-rag.ts` 置备**一个**带有真实策展语料（`docs/` 中的 22 个文件）的项目，**并**针对由真实 RN/ADR 组成的 17 个问题运行搜索；`rag_golden_test.exs` 只调用该脚本并应用下限。命中标准——文件路径、top-5，从不是精确的块/排名 1——是经过测试的纯函数。新 gate `rag-acertivo`，`warn`（没有带 LLM 的 CI）。真正测量过，两次，确定性地：top-5 中 17/17

### dev agent 在真实容器**内部**执行（PR 1.6）（ADR 0134，RN-492/493） {#dev-agents-executam-dentro-do-container-real-pr-16-adr-0134-rn-492493}
关闭 RN-491 声明为待办的内容：`Engine.Actions.TerminalExecutor`
获得**第五个**出口 `:executar_no_container`——`execution_mode:
container` 且有一行**已登记** `running` 的项目
（`Engine.Containers.ProjectContainerLifecycle`，直接读取，与 `Engine.Projects.Project` 相同的模式）——命令穿过 engine → api（`POST
internal/projects/:projectId/container-exec`，
`ExecutarComandoNoContainerUseCase`）→ broker（`ContainerBrokerPort.exec`，ADR 0128/0130 五个操作中最后一个的**第一个**真实调用方），通过 `docker exec` 而不是本地 `System.cmd` 运行。`cwd` 在调用**之前**在 engine 中从**主机**路径转换到 `/work` 之内——代码中确认它与 `Workspace.ensure!/4` 已经写入的是**同一个**物理目录（dev agent 的 worktree 位置和机制都不变）。
`BrokerRecusouError`/`BrokerIndisponivelError`/传输失败变成正常的 `failed_result`，从不崩溃，也从不静默退回到容器之外（RN-486：登记为 `running` 从不保证容器在运行）。容器**内部**的终端获得自动批准的**下限**
（`ProposeActionUseCase`/`decide.ts`，`containerExecutionActive`）——五个绝对上限和一贯的词法范围继续在其上运行，逐字节不变

### runner 启动项目容器（PR 1.3，第 1 部分不按顺序——关闭 RN-494/PR 1.7 声明的那一半）（ADR 0137，RN-497） {#o-runner-sobe-o-container-do-projeto-pr-13-parte-1-fora-de-ordem--fecha-a-metade-que-a-rn-494pr-17-tinha-deixado-declarada-adr-0137-rn-497}
`container_start`/`container_stop`/`container_remove` 获得**第二条**执行路径，按 `executionMode` 分支：`container` 继续通过 broker（不变）；`mounted`/`runner` 改为请求已连接的 **RUNNER**，通过 Phoenix 通道上的**三对**新消息（`container_start`/`_result`、
`container_stop`/`_result`、`container_remove`/`_result`，与
`exec`/`exec_result` 同一模具）——`EngineWeb.ContainerCommandController` 转发给
`RunnerRouter`，runner 用 `DockerViaCli` 处理（**用户自己**的 Docker，
`@brabo/docker-port`，在 `--self-test-docker` 之外获得了真实用途）。镜像是**读取**的（`ObterSpecDeContainerUseCase`，与 broker 相同的用例），从不重新选择。“没有 runner”/“超时”（`RunnerNaoConectadoError`）和“runner 拒绝”（`RunnerRecusouContainerError`）变成具名的 `failed`，从不是异常。`Engine.Actions.TerminalExecutor` 没有获得新出口——它本来就无条件地把已连接 `runner` 项目的每个命令路由到通道；主机与容器之间的选择是 runner **内部**的（`EstadoDoRunner.containerAtivo`，`tratarExec` 通过 `docker exec` 路由，`cwd` 通过替换前缀转换，`cwdParaContainer`）。`guard.ts`/RN-434 开始覆盖 bind-mount，而**没有任何**新校验——挂载**就是** CLI 启动时已确认的根目录

### Infra 的 handoff 没有任何界面能接受（D0）（RN-499） {#o-handoff-da-infra-podia-ser-aceito-por-tela-nenhuma-d0-rn-499}
`offeredHandoff` 按 `AGENTES_DE_CHAT` 过滤消息流中的卡片，而后者排除了
`infra`——这个过滤是**正确**的（engine 没有给 Infra Lead 的 `message` 子句；放宽它会让界面提供一个不存在的消息流，并让输入框把消息发给 Criativo）。缺陷在于后果，而代码自己的注释把它记录为已接受：`acceptHandoff` 只有**一个**使用方，就在这个过滤之后，所以 `OfferInfraHandoffUseCase` 的 handoff 永远停在 `offered`，Infra Lead 从未被激活，`propose_container_start` 从未被调用，**任何**模式的**任何**项目都从未有过运行中的容器。修复：一个**独立**的可操作卡片，位于消息流之外，在滚动区域和输入框之间的固定条带上——这个条带已经承载手动 handoff，并自称是非对话类 handoff 动作的位置——调用已有的 `acceptHandoff`，由同一个 `activeFor` 关闭。Infra 的 `handoff.offered` 仍在消息流中作为无声分隔符被**叙述**

### 挂载项目的单一 base（PR 1，BREAKING）（ADR 0141，RN-500） {#a-base-única-dos-projetos-montados-pr-1-breaking-adr-0141-rn-500}
创建 `mounted` 项目需要在 `api` **和** `engine` 中**手写**一行 bind-mount，再重启两者——这会杀死安装中所有进行中的 agent 回合、终端 socket 和 LLM 调用，只为了接入**一个**项目。`BRABO_PROJECTS_BASE` 诞生：**一个** base，由操作者配置一次，在两个服务中以**同一身份**（`$X:$X`）挂载，所有挂载项目都在其中，**不**按项目编辑任何东西。用同一身份而不是固定挂载点，是因为 `workspace_path` 由用户输入并回显给用户——正是这一点让 `projectScopeRoot`/`workspace_dir/2` 无需新代码就继续正确。**独立**的变量（与 UNIQUE 的 `workspace_dir_name` 命名空间冲突会在另一个项目的目录中执行 `git init`；所有者相反；base 可以浏览，而受管根目录不应如此）。**缺失**是正常的：`projectsBase:
null`（`GET workspaces/:id/projects-base`，`maintainer`），该模式不提供。并且当 base 与 checkout 重叠时 `pnpm dev` 会**拒绝**启动——唯一可能的检查，因为 api 是与 `/workspace` 比较的。两项声明的代价：base 下的符号链接和只有一个 base

### 挂载项目的容器（PR 3）（ADR 0144，RN-503） {#container-de-projeto-montado-pr-3-adr-0144-rn-503}
`mounted` 项目**无法**获得任何容器，原因是两个独立的阻碍——api 把所有非 `container` 模式交给 **RUNNER**（需要已连接的 `brabo-runner`），而 broker 在源头拒绝非 `container`。两者都关乎**几何**，而不是模式的名字，而 ADR
0141 的单一 base 改变了几何。分支改为按**目标**：`container` **和**
`mounted` → broker，只有 `runner` → runner（`container_stop`/`_remove` 与 `_start` **一起**改变，否则会在服务器上启动、却在用户机器上停止）。ADR 0130 的不变量不动——任何绝对路径都不会穿过网络：broker 获得**第二个**根（`BRABO_PROJECTS_HOST_BASE`），api 发送一个**带判别**的定位器（`gerenciada` \|`montada` \|`indisponivel`），说明相对路径段针对哪个根有效。**三个**变体是因为 `indisponivel` 有两种不同的修复（`runner` × base 之外的遗留 `mounted`），缺失的根**从不**由另一个补位。`mounted` 像 `container` 一样**选定**镜像——broker 根据 `artifact.project_image` 组装，所以未记录的选定是惰性的选定（ADR 0133 用在第二种模式上）

### dev agent 只在容器之后（PR 7）（ADR 0143，RN-502） {#agentes-de-dev-só-depois-do-container-pr-7-adr-0143-rn-502}
在 `exp001` 的一次真实执行中，**十个** dev 任务同时卡住——发现的不是哪个目录失败了，而是**没有任何东西把容器排在 dev agent 之前**。`Engine.Dev.AgentIo.try_claim/2`——**唯一**的认领点——开始在调用 api **之前**查询 `ProjectContainerLifecycle.running?/1`（ADR 0134 早已有的谓词）：没有**已登记** `running` 的行时，agent 落入 `:idle`，持久化并发出 `dev.blocked_by_container`。放在 **ENGINE** 中而不只是放在 api 的 `activate-execution` 中，是因为**重新水合**会在不经过任何路由的情况下到达 `try_claim/2`（`init/1` → `finish_restart_recovery/1`）。是 `:idle` 而**不是**新状态，原因是 `try_claim/2` 自己的 docblock 自第 12b 阶段起就已记录的——它是唤醒仍能挽救的唯一状态，`handle_info/2` 的所有守卫都依赖这一点；区分“队列为空”与“没有容器”的是**事件**，从不是状态。唤醒经由 outbox 到来：
`RegistrarTransicaoDeContainerUseCase` 在记录到达 `running` 的**同一个**事务中发布 `container.running`，使用一个**新**的 `aggregate_type`
（`container`，`Engine.Outbox.Drain` 读取的第三个）而不是借用 `task`，以**项目**作为 `aggregateId`；投递的消息是已有的 `{:wake,
:became_claimable}`。第二部分：`TerminalExecutor` 不再静默降级——没有 `running` 的 `container` 过去会在 engine 进程**内部**落入 `System.cmd`，现在会**拒绝**，`mounted` 在同一分支中

### 有接收者的流水线合并告警（ADR 0139） {#alarme-de-merge-de-esteira-com-destinatário-adr-0139}
“推进使用 `--no-ff`”这条规则被打破了**三**次（#367、#394、#464——第三次是修复前两次的那个 PR）。发现：检测**早已**存在，**也已**生效过（`tag-release` 以正确的消息让前两次失败）——缺的是告诉**谁**，因为在永久分支上失败的 `push` workflow 没有可以变红的 PR，而仓库中的 issue 为零。`tag-release` 增加了 `avisar` 作业，它用 `github.token`、从不用 PAT 打开 issue（并在已开启的 issue 中评论，从不重复）——无效的 PAT 正是它报告的失败之一——这已不再是假设：`BRABO_BOT_TOKEN` 在 2026-09-03 晚上过期，让 `tag-release` 的两次运行失败，并在 2026-09-04 轮换；v4.0.0 盖上标记并**触发**了 Release，这只有在 PAT 有效时才会发生（用 `GITHUB_TOKEN` 创建的 tag 不会触发 workflow）。这条规则开始**狭义地**覆盖 `dev`：只有带来**新边**的 PR 才是缺陷（head 是一个合并，其第二个父提交不在 base 中），从不是工作 PR 的 squash，那是约定。在仓库中关闭 squash 经过**测量**后被否决（会给每个 PR 增加负担，并影响以 `--no-merges` 运行的 `changelog.mjs`）

### 对话型 agent 的决策产物（第 3 前线，通用切片）（RN-505） {#o-artefato-de-decisão-dos-conversacionais-frente-3-fatia-genérica-rn-505}
`decision_record` 复用 `emit_artifact`/`ArtifactSchemas` 的**通用**模式（与 `note`/`business_rule` 相同），而不是 `project_image`/`c4_diagram` 的专用模式——决策是仅追加的日志，从不是会被替换的“当前值”。PO、Arquiteto、Dev Lead、UX Designer 和 Staff 获得了这个工具（别名 + `tool_specs` + `run_tool/3` + `system_prompt/1` 中的同一句话）；Criativo 自第 3b 阶段起就已有 `emit_artifact`，只获得了新类型，自身没有改动。不同于 `open_adr_pr`（只有 Arquiteto，真实提交 + PR + 人工审批）：两者**共存**，用于不同规模的决策。已声明不在范围内：执行型 agent（`ToolLoop`，没有共同的 harness），以及与 Infra Lead 的衔接——在提议 `container_start_via_runner` 时发出 `decision_record`——它依赖同一计划中另一条前线的工具，在单独的分支中

### 按模块 Dev Agent 分开的“sempre permitir”（RN-509） {#sempre-permitir-separado-por-dev-agent-de-módulo-rn-509}
在 `dev-<modulo>` 的动作上点击“sempre permitir”会写入 `permissions.json`，即**整个项目**的范围——为任何其他 agent 放行同一命令。改为写入 `agent_autonomy(projeto, agente,
tipo)`，即激活执行时为 3 个 git 动作种入所用的**同一**机制。`dev-lead`（领导该领域，而不是其成员）和任何非模块化的行动者仍写入一贯的 `permissions.json`；两个绝对上限（带外部效果/特权命令的终端、
`container_remove`）仍在新分支**之前**拒绝整个点击。没有迁移：旧条目留在 `permissions.json` 中，这是有意识的决定

### Docker 成为 Runner 模式真正的前提（RN-507/508，ADR 0145） {#docker-vira-pré-requisito-real-do-modo-runner-rn-507508-adr-0145}
`runner` 在 workspace 已验证 + runner 已连接时，就把每个已批准的终端路由给 CLI，而不检查容器是否 `running`——没有运行中的 Docker 时，runner 会自行落到纯**主机**上，这正是 ADR 0143 已为 `container`/`mounted` 关闭的同一种静默回退。`Engine.Runners.RunnerReadiness`
统一了**三个**前置条件（已验证、已连接、容器 `running`），有两个使用方：`TerminalExecutor` 和 dev agent 的 worktree 物化——后者不再尝试针对**主机**路径在**本地**执行 `File.mkdir_p!`/`git init`（自 RN-478 起开放的缺口），而是改为在用户机器上的真实容器**内部**运行，经由**同一个** `exec`/`exec_result` 通道
（`Engine.Actions.Workspace.RunnerGit`，新增）——`WorktreeManager` 按同一标准分叉，周期性清理作业会静默**跳过**当前没有就绪 runner 的 `runner` 项目。`exec` 协议获得可选的 `env`，让 git 凭据（ADR 0056）在**主机**子进程的环境中传递——合并到 `process.env` 之上，从不转发给 `docker exec`，也从不记录。`container_start` 不再服务 `runner`（它带有镜像选定的 payload 在那里从来没有意义）；`container_start_via_runner` 诞生——schema 只有 `rationale`，启动已经决定的镜像——Infra Lead 的新工具会在盲目提议之前**本地**拒绝（不经 HTTP）

### dev 中重复的 RN-505，已更正 {#rn-505-duplicada-em-dev-corrigida}
“决策产物”和“按 Dev Agent 的 sempre permitir”相隔 2 分钟合并，各自分配了 RN-505 而没有看到对方；“按 Dev Agent 的 sempre permitir”被重新编号为 RN-509（`docs/business-rules.md`、CHANGELOG、`approve-always-action.use-case.ts` 和
`ApprovalCard.test.tsx` 中的注释），把锚点 `{#rn-505}` 留给
`decision_record`。一并发现：在解决另一个 PR（Docker/runner，ADR 0145）的冲突时所做的 505→507/506→508 重新编号是**不完整**的——本文件中还剩三处提到“RN-505”，也更正为“RN-507”

### 第 28 阶段（第 5 次会话）——本地 agent 的 `join` 不再沉默（RN-514，ADR 0147 第 1 点） {#fase-28-sessão-5--o-join-do-agente-local-deixa-de-ser-mudo-rn-514-adr-0147-ponto-1}
`terminal:<projectId>` 通道的 `join` 在**两侧**都是沉默的——runner 发送 `{}`，服务器处理 `_params`——所以服务器无法知道另一端的二进制是否理解某条新消息，而缺陷是最糟糕的那种：消息到达，处理程序不存在，**什么也没**发生，没有错误也没有日志。现在 runner 在参数中**声明**
（`Engine.Runners.Capacidades`，词汇 `exec`/`pty`/`espelho`），服务器**授予**与它**认识**的能力的交集，放在 `socket.assigns` 中，**从不**放在表中（能力是那个**连接**的属性）。runner 只声明
`exec` 和 `pty`——在没有实现 `espelho` 时声明它，正是协商所要防止的缺陷；它只作为词汇中的**名字**进入，别无其他，第 6 次会话实现它。缺失/为空的参数是**遗留**二进制，授予
`{exec, pty}`——这是**事实**，不是宽容：它们是 runner 诞生时具备的两项功能，拒绝遗留版本会是 `breaking/` 和 MAJOR。未知的能力被**忽略**（比 engine **更新**的 runner 连接时）；要求但未声明的会在 `Registry` **之前**拒绝 join，并**点名**缺少的能力——已实现并测试的机制，如今**不会**触发（`runner` 要求 `exec`，每个二进制都有；还没有东西要求 `espelho`），这正是设计。如今就提供价值的那一半：没有该能力的消息会以具名响应被**拒绝**——`exec` 以 `exec_result` 的格式回应（126 + 原因），而不是让 `RunnerRouter` 等到超时，`pty_*` 在标签页中变成 `pty_error` 而不是消失。`RunnerReadiness` 逐字节保持原样

### 第 28 阶段（第 6 次会话，B 半）——镜像开始存在（RN-516，ADR 0147 第 2/3/4/8 点） {#fase-28-sessão-6-metade-b--o-espelho-passa-a-existir-rn-516-adr-0147-pontos-2348}
`espelho` 能力从词汇中的名字变成了**两侧**的代码。**目标**在 `join` 的**授予**中传递（对 `:runner` 而言响应不再为空：`%{espelho: %{destino: ...}}`），只存在于那个连接中，runner 会**拒绝**针对未授予目标的 `mirror_sync`——从不是全局配置或变量，那会让项目 B 的产物落进 A 的目录。非空的 `mirror_path` 开始**要求**该能力，这是 RN-514 拒绝机制的**第一次**真实触发：在有目标的项目中，旧二进制**不再**能连接，具名且致命——选择性开启，代价在 ADR 中声明。
`espelho-guard.ts` 作为 `guard.ts` 的**兄弟**诞生（复用三个辅助函数和双遍处理，书面继承 TOCTOU 的注意事项），拒绝 ADR 中的三件事；实现时的发现：`realpathMaisProximo` 会落到祖先目录上，而由于目标几乎从不存在，把两边折叠会让 `/base-outra` 和 `/base` 都变成 `/`——第二遍解析祖先并**放回**后缀。**单向**且**从不**删除：源中删除的文件**保留**在目标中（用户的目录是累积，不是副本）。复制的是 **GIT 的列表**（已跟踪 + 未跟踪且未忽略），没有自己的排除列表；失败的 git 变成**具名**错误，从不以 `cp -r` 作为备选方案；嵌套的 git 仓库（dev agent 的 worktree）作为**一个**条目返回而不深入，源中的符号链接被跳过。**独立**的谓词（`Engine.Runners.Espelho`），**两个**前置条件，**从不**是带标志的 `RunnerReadiness`——`runner_readiness.ex` 逐字节保持不变。触发器：**提交**，具名的时刻，发出即不管，从不是 watcher；“agent 回合结束”被**声明**而未接入，因为没有无歧义的挂钩点

### 从未启动的 broker（RN-512 的更正）（RN-512，ADR 0130/0146） {#o-broker-que-nunca-subiu-correção-da-rn-512-rn-512-adr-01300146}
RN-512 把 broker 从 `profiles` 中移出，让它在 dev 中运行，而它**从未**启动过：`corepack prepare` 在构建时以 **ROOT** 运行（缓存在 `/root/.cache`），容器以 uid 1000 运行，没有缓存时 corepack 会尝试在一个唯一网络为 `internal: true` 的服务中**下载** pnpm——`EAI_AGAIN registry.npmjs.org`，五秒后 `Exited (1)`。没有 healthcheck 时，`up --wait` 显示
`Healthy`，完全重置在进程已死时宣布 "reset completo"；只要还有 profile，启动 broker 的人本来就在盯着它。修复把 registry 从**运行时**移走，而**不**开放网络（ADR 0130 五层中的第一层）：在构建时以运行时 uid 为所有者准备 `COREPACK_HOME`，`pnpm install` 作为**构建**步骤，并且——因为三个 `node_modules` 卷覆盖了镜像所安装的内容，而 Docker 只为**空**卷播种——用一个 entrypoint 把它们与 `/workspace` 之外的一份副本协调，该副本以构建时 lockfile 的 sha256 标记（同一个标记会**警告**镜像已经落后，而不拒绝启动）。服务中加入 healthcheck，从容器内部执行。生产不受此影响，也没有改变

### 第 28 阶段（第 7 次会话）——本地 agent 变成用户服务（RN-518，ADR 0147 第 5 点） {#fase-28-sessão-7--o-agente-local-vira-serviço-de-usuário-rn-518-adr-0147-ponto-5}
`brabo-runner service install|uninstall|status`，而先例为**零**（`apps/runner/` 中没有任何提到 `systemd`/`launchd` 的地方；模型是前台运行、被 SIGINT 杀掉）。始终是**用户**级——`systemd
--user`/`LaunchAgent`——root 是**拒绝**而不是警告：`guard.ts` 的 docblock 把“以**用户自己**的权限运行”声明为三条真实边界的前提，而 root 服务会让尽力而为的 `cwd` 守卫成为已批准命令与磁盘之间的唯一屏障。Windows 是**具名**拒绝（第三种机制，不是两者的变体）。每个**项目**一个 unit，因为服务器已经强制每个项目一个 runner——按目录命名会产生两个永远不会同时启动的 unit，第二个会表现为连接失败而不是安装错误；在 Linux 上，文件放在 systemd **查找**的地方
（`$XDG_CONFIG_HOME/systemd/user`，否则 `~/.config`）。`Restart=on-abnormal`，**从不**用 `on-failure`（在 plist 中为 `KeepAlive`/`Crashed`）：runner 的 exit 1 是致命的 join 拒绝（RN-514）或重试上限用尽，重启就是 CLI 拒绝自行进行的那种循环。服务通过**设备密钥**认证，从不通过 token——把它写进 unit 会让它留在磁盘上，而这个 CLI 从未把凭据写到磁盘。`uninstall` 通过读取 **unit** 的目录、从不是 `cwd`，删除**三者**（没有 unit 时只能用 `--dir`——猜测会删除另一个项目的密钥），并**说明**密钥已从磁盘移除、但**没有**在服务器上吊销。`status` 以各自的句子和代码回答**四种**状态（0/3/4/5），第一个答案来自**磁盘**——所以在没有管理器的机器上它依然正确；失败的 `spawn` 从不变成“管理器说不”。BRB-031 **不**在这里关闭

### runner 的 spec 缺少 `projectId`，这条路径**从未**启动过容器（RN-508，ADR 0145） {#a-spec-do-runner-ia-sem-projectid-e-o-caminho-nunca-subiu-container-rn-508-adr-0145}
`container_start_via_runner`（RN-508，ADR 0145）100% 以 `failed` 结束——*"especificação de container recusada em `projectId`: esperava texto
não vazio, recebi undefined"*——在 `exp004` 的一次真实执行中，看到的是**效果**：十个 dev 任务没有任何 agent 认领。这个阻塞是**正确**的（RN-507 和 RN-502/ADR 0143 在没有**已登记**的 `running` 容器时拒绝）；错的是前一步。
`EspecificacaoDeContainerParaRunner` 诞生时有**九个**字段，而
`especificacaoValidada`（`packages/docker-port`）一直要求**十个**——数据就在 `SpecDeContainer.projectId` 中，只是没有被复制；engine **不透明地**转发映射，所以中间什么也没丢。相比之下，**broker** 一直能工作，因为它从 api **获取** spec 并收到完整的
`SpecDeContainer`——这就是为什么只有 `runner` 模式坏了。三个绿色的测试套件没有发现它，因为每个环节都构建了自己的 fixture：没有人测试**链条**。加入的就是这个——**真实**用例组装的 payload 穿过**真实**的校验器，字段**集合**被锁定（`raizDoProjeto` 是 api 唯一不发送的）——放在 api 的测试套件中，通过**相对** import，这是两边都活着存在的唯一地方；不变量
`api-nao-consome-docker-port` 仍为绿色，并被**扩展**为拒绝从 `src/` 发起的相对 import。检查过的兄弟操作都是**正确**的：
`container_stop`/`container_remove` 只发送 `workspaceDirName`，这正是 `nomeDeWorkspaceValidado` 所要求的全部

### 无法撤销的暂停（RN-540） {#a-pausa-que-não-podia-ser-desfeita-rn-540}
Anamnese 和 Psicólogo 自 2026-08-10 起处于**暂停**状态，而有三个地方称这种暂停是可逆的——
`AnamneseSchedulerWorker.enabled?/0`/`PsychologistWorker.enabled?/0` 的 docblock（"Ligar
de volta é `X=true` e reiniciar o engine"）以及
`docs/reference/configuration.md`。它在**任何**环境中都不可逆：`engine` 服务的
`environment:` 映射了 Anamnese/Psicólogo 的**十三**个变量——全是成本**上限**——却没有映射两个**产品**变量中的任何一个，而
`docker compose` **不**传递主机环境，所以 `.env` 中的 `ANAMNESE_ENABLED=true` 是惰性的，`runtime.exs` **静默地**落到默认值 `"false"`。在 dev 容器中测得：`[true] [] []`。可能的来源：当默认值变成 `false` 时，没有人需要这个变量来**关闭**——只有尝试**打开**的人才会在几个月后发现这根线不存在。**八个**布尔开关
（`System.get_env("X", "true"|"false") == "true"`）以与代码**相同**的默认值进入**两个** compose——四个额外的（`START_MODEL_SYNC`、
`START_GATE_RESCUE`、两个 `GRAPH_*`）也加入，因为它们是同一缺陷，由该机制本身发现，排除它们需要四个借口。行为零变化：保持两者关闭的产品决定逐字节保持，新出现的是**开关**本身。机制是
`scripts/ci/flags-do-engine-no-compose.spec.ts`，它从
`runtime.exs` **派生**列表（其他 50 个变量是带有良好默认值的上限以及 release 相关的东西，理应缺席），只在 **DEV** compose 中要求默认值一致——生产 compose 故意关闭后台 agent。`deploy/k8s/` **不**变，出于一致性：那里不存在出问题的那一层

### 第 29 阶段（第 1 次会话）——单行安装，仅规划（ADR 0149-0152，fase-29-instalacao-de-uma-linha.md） {#fase-29-sessão-1--instalação-de-uma-linha-só-planejamento-adr-0149-0152-fase-29-instalacao-de-uma-linhamd}
安装 Brabo 是**三个**互不相连的动作（手工填写五个机密的 compose、通过浏览器配置并需要 `chmod +x` 的 runner、只存在于 checkout 中的 `pnpm bootstrap`），而第 28 阶段书面拒绝了单行安装程序，只要产物还没有签名（BRB-005）——因此这个阶段先签名**再**安装。四个 `Proposed` ADR：按 **DIGEST** 的 `cosign` keyless 签名，外加**一个**已签名的 `checksums.txt`，从不是五个签名（0149）；安装程序通过 `sh -c "$(curl …)"` 调用，**从不**用 `curl|sh`，因为用管道时脚本**就是** stdin，同意环节会死掉（0150）；runner 的同意 base，复用 `dentroDoEscopo` 以及 `espelho-guard.ts` 中按**路径段**拒绝循环的逻辑，而不是第四份规则副本（0151）；以及针对 compose 的备份/恢复（0152）。测量纠正了原始范围中的**五**点：`workspace.verified` **不**存在（存在的是
`workspace_confirm`，而且它是**单向**的），ADR 0146 的第 5 点版本化的是
`consentir-base.mjs` 而不是 `install.sh`，`docker-compose.prod.yml` 不使用 GHCR，并自称是**验证**用 compose，`make test-restore` 是只备份 Postgres 的 Kubernetes 路径，而“每个项目一个 runner”在**五个**独立的地方被强制——这把按机器的 runner 从本阶段移到了第 30 阶段。自己的发现：**`git_local_repos` 不在任何备份中**，丢失它就是丢失 `local` 项目的代码。`docs/reference/brb.md` 诞生——而发现是 BRB 的注册表**不属于仓库**：它位于维护者的 vault 中，有 33 项，而这里只有两个 id 出现在散文中。测量结果：BRB-032 和 BRB-033 描述的缺陷**已不再复现**，**BRB-004 不是 id 所暗示的那样**——它要求的是按 **DIGEST** 引用第三方镜像，而不是 #419 固定的 tag。这里的文件保存**证据**（测得的状态、`arquivo:linha`）；vault 仍是发现的所有者。区间 RN-524..538 和 ADR 0149-0152，跳过**正在进行**中的：同一时刻观察到三处冲突（ADR 0148 ×2、RN-522 ×2、RN-523 ×2），之后按**日期**标准解决——先分配者保留编号，9月8日的分支变成 ADR 0153、RN-539 和 RN-540

### 第 29 阶段（第 2 次会话）——流水线为它发布的东西签名（RN-524，ADR 0149） {#fase-29-sessão-2--a-esteira-assina-o-que-publica-rn-524-adr-0149}
产品**什么都没**签名：`.github/`、`scripts/` 或 `docker/` 中不存在 `cosign`/`sigstore`/`attestation`，唯一的来源证明是 runner 的 **npm** 包的
`--provenance`。`release.yml` 发布四个镜像时**没有** `id-token: write`；`build-runner-binaries.yml` 用 `gh release upload` 上传五个二进制，别无其他——而已有的 `sha256sum -c` 验证的是**第三方**二进制，这是仓库懂得应用、却从未应用到自己身上的模式。现在镜像按 **DIGEST** 签名（从不按 tag，那是可移动的指针），二进制获得**一个**已签名的
`checksums.txt`，由一个等待矩阵完成的 `checksums` 作业产生——不是五个签名，因为验证了四个而忘了第五个的人不会知道自己忘了。该作业故意是 `if: always()`（矩阵为 `fail-fast: false`），并且**点名清单没有覆盖的内容**。两个 workflow 都**先验证再发布**。按本仓库的历史选择 keyless：私钥会是又一个 CI 机密，而 PAT 已经静默过期过一次（ADR 0139）。验证流程在运维手册中，两个 `--certificate-*` 标志为**必需**——没有它们，`cosign` 会接受**任何人**的有效签名。为镜像和二进制关闭 BRB-005；操作系统代码签名和下载代理被排除在外，已声明

### 第 29 阶段（第 3 次会话）——还不会安装的安装程序（RN-526，ADR 0150） {#fase-29-sessão-3--o-instalador-que-ainda-não-instala-rn-526-adr-0150}
`install.sh` 在**根目录**诞生，版本化并由 Release 提供。形式是 `sh
-c "$(curl …)"`，**从不**是 `curl|sh`，原因是**机制上**的：用管道时，进程的
`stdin` **就是**下载内容，每次 `read` 都会读到脚本自身的字节或遇到 EOF——一个不提问的安装程序会自行决定在别人的机器上把目录创建在哪里。它**验证自己的来源**（RN-524 的 `checksums.txt` 签名，以及它自身在已验证清单**之内**的哈希），使用固定版本的 `cosign`，并以 `sha256sum` 对照写在脚本中的哈希检查；**检测**会在提问之前点名它发现的东西；没有 TTY 时报告并以 0 退出；并且**从不删除用户目录**——项目 base 和镜像目录不在任何确认的范围之内，依据镜像的规则（RN-516）。标记文件在
`$XDG_STATE_HOME/brabo/` 中，从不在 `~/.brabo/` 中，后者是**按项目**的。**这个版本不安装任何东西，并且会说明这一点**，而不是沉默地结束。
`--print-plan`/`--print-state` 在没有 TTY、没有网络、没有副作用的情况下公开决策——以 `bootstrap.sh` 的 `--print-commands` 为模板，测试方式相同。运行时发现两个 bash bug，属于同一类：在 `set -e`+`pipefail` 下，结果为假的 `[
cond ] && 赋值` 会**杀死**脚本，一个没有匹配的 `ls` 会让整个命令替换失败——而在一个正常情况就是“什么也没找到”的函数中。仓库**根目录**没有被任何 docmap 覆盖（根目录的 glob 是字面名称）；`instalador` 规则诞生

### 第 29 阶段（第 4 次会话）——安装从自己的 compose 启动（RN-527，ADR 0150） {#fase-29-sessão-4--a-instalação-sobe-de-um-compose-próprio-rn-527-adr-0150}
`docker/docker-compose.install.yml` 诞生，由生产 compose **生成**，在三点上不同：四个镜像来自**必需变量**
（`${BRABO_API_IMAGE:?…}`——如果有默认值，缺少变量时会用一个没人选择的镜像启动半个栈，错误会变成奇怪的行为而不是拒绝），**没有** `build:` 留存，并且**`broker` 服务不存在**，因为它的镜像没有发布（bake 有四个目标）——使用
`--source=ghcr` 时，`mounted` 不会启动容器，compose 在 `BROKER_URL` 的注释中**说明**了这一点。`docker-compose.prod.yml` 保持不变：它自称是**验证**用 compose，是 `smoke.sh` 在本地构建时使用的。维护两个文件的代价已声明，上限是**机械**的——
`composes-em-conformidade.spec.ts` 会因多出的服务/卷/端口、残留的 `build:` 以及被放松的第三方镜像而失败。计划中的两件事在接触磁盘时就死了，原因相反：**migrate 不是一个步骤**
（compose 以 `service_completed_successfully` 串联 `api`→`migrate-api`，两个地方都下令迁移会是同一事实的两个来源），以及**不复用 `smoke.sh`**（它会**构建**安装程序已按 digest 下载的东西，并在最后停掉整个栈）——取而代之，安装程序在断言之前先**询问**，请求两者的 `/health`

### 第 29 阶段（第 6 次会话）——迁移需要**已证明**的备份（RN-530，ADR 0150/0152） {#fase-29-sessão-6--migrar-exige-backup-provado-rn-530-adr-01500152}
在已有安装之上安装**不被提供**——要么迁移，要么停止：在另一个版本的卷上执行 `up` 是不会预警的损坏。顺序是备份 → **证明** → 询问 → 删除 → 安装 → 恢复，中间这一步正是赋予安装程序删除权的东西：一个没有人尝试恢复过的备份只是一个文件，而发现这一点的时机不该是在
`down -v` 之后。证明运行 `test-restore-compose.sh`（ADR 0152 的**同样**三项校验）；失败的备份或证明会停止迁移，**不删除任何东西**。目标是**主机**目录——compose 的默认值是 `backup_local` 卷，`down -v` 会把它与想要保留的东西**一起**删除。Postgres 的 dump **不会**被自动恢复到有数据的数据库上（这是破坏性的，`brabo-restore` 从不触碰源库）；本地 git 仓库会，因为它们会以空的状态诞生

### 第 29 阶段（第 7 次会话）——两侧共用一个 base，BRB-031 关闭（RN-531，ADR 0150/0151） {#fase-29-sessão-7--uma-base-para-os-dois-lados-e-o-brb-031-fecha-rn-531-adr-01500151}
安装程序**一次**询问 base，并写入**两个**地方：
`.env` 中的 `BRABO_PROJECTS_BASE`（服务器，ADR 0141）和
`runner.json` 的 `base` 字段（本地 agent，RN-529）——`mounted` 和 `runner` 的区别在于**谁**执行，而不是代码放在哪里，同一个目录有两个 base 就是 ADR 0141 所拒绝的冲突。双向拒绝与 checkout 的重叠，`~` 故意不展开（值进入配置文件，在那里 `~` 按字面读取）。runner 的二进制对照脚本已经用来验证自身的**同一个** `checksums.txt` 检查——再次下载它就有两次机会拿到不同的清单，而第二次不会被验证——并以 `install -m 0755` 安装。**BRB-031 在此关闭**：它之所以挺过了第 28 阶段，是因为安装不是来自版本化的产物，走到 `service install` 的人早已需要过
`chmod`。没有该平台二进制的 Release **不会**中断安装

### 第 29 阶段（第 8-10 次会话）——协议、选择器和 E2E（RN-532..534，ADR 0149/0150/0151） {#fase-29-sessões-8-10--o-protocolo-o-picker-e-o-e2e-rn-532534-adr-014901500151}
**8（RN-532）**：`workspace_create`/`_result` 这一对以
`exec`/`exec_result` 为模板诞生，确认**复用**已有的 `workspace_confirm`——没有新的写入路由，engine 仍然不写这张表。谓词是**独立**的，理由比镜像更强：在那里第三个前置条件会是**循环**的——`runner` 项目只有在 runner 启动容器之后才有 `running` 的容器，而容器建立在这条消息所创建的目录**之上**。`workspace` 能力是唯一一个其声明取决于**状态**（经同意的 base）而不是二进制版本的能力。**9（RN-533）**：选择器重新通过 `fs_list_dir` 读取用户的磁盘，**不**在没有 runner 时隐藏该模式的决定与 RN-513 是对称的而不是相反的——那里 api **有**信号，没有 base 时创建以 400 结束；这里没有存在信号（RN-521 已声明），隐藏就是从“不知道”推出“没有”。发现：界面通过匹配位于 engine 某个 `.ex` 中的**句子** `'Nenhum runner conectado'` 来决定——改成了带判别的原因。**10（RN-534）**：`install.sh` 进入已签名的 `checksums.txt`（没有这一点，它对**自身**所做的验证就是一纸空文），并在干净的机器上演练，用 `script -qec` 模拟 TTY，从不用管道——管道正是扼杀同意环节的东西。**不**在 PR 中运行，与签名的原因相同

### 第 29 阶段（第 8 次会话）——本地 agent 的 base 有了使用方（RN-532，ADR 0151 第 3–6 点） {#fase-29-sessão-8--a-base-do-agente-local-ganha-um-consumidor-rn-532-adr-0151-pontos-36}
RN-529 构建了 **BASE**，并书面声明没有任何东西使用它。加入了
`workspace_create`/`workspace_create_result` 这一对，采用 `exec`/`exec_result` 的**请求-响应**模板——**从不**采用 `workspace_confirm` 的模板，后者是**单向**的（`{:noreply, socket}`，不会推回任何东西），这一精确点本阶段早已与“`workspace.verified` **不**存在”一起记录过。只有**相对**路径段穿过网络（ADR 0130/0144 的不变量：持有根目录的是执行者），**绝对**路径段会被词法拒绝。确认**复用**已有的 `workspace_confirm`，正是它省下了整整一条前线：**没有诞生任何新的写入路由**，engine 仍然不写这张表，为 `workspace_verified_at` 盖章的路径仍然只有一条——以**顺序**作为机制（confirm 在结果**之前**，因为两者按顺序到达同一个通道进程，而 confirm 的处理程序是同步的）。`workspace` 能力在**代码进入的同一次会话中**进入词汇，两侧皆然——RN-514 用 `espelho` 做了相反的赌注，它之所以有回报只是因为有人去督促——并且它是四个能力中**唯一**一个其声明取决于那次执行的**状态**的：runner 只在有经同意的 base 时才声明它，服务器正是通过这一行、而不是别的任何东西，**知道** base 存在（engine 不读用户的磁盘）。**没有人**在 join 时要求它，这是有意的：在 `runner` 中要求它会因为一个该项目也许永远用不到的功能而成为 `breaking/` 和 MAJOR。**独立**的谓词
（`Engine.Runners.PastaDoProjeto`），**两个**前置条件，`RunnerReadiness` 逐字节不变——在这里第三个前置条件比不必要更糟，它会是**循环**的：`runner` 项目只有在 runner 启动容器之后才会有 `running` 的容器，而容器建立在这条消息要创建的目录之上。它也不询问 `workspace_verified_at`（在这里那是**结果**），也不询问模式。**两个**前置条件在不同的地方回答，因为“经同意的 base”是**连接**的属性（`socket.assigns`，从不是表）：通道在推送**之前**就拒绝，以同一个 `ref` 返回 `motivo: "sem-base"`，采用模块所期望的格式——从不是超时。五个不会合并的具名原因、带有**自己**结果的幂等性（`ja-era-repositorio` 是成功），并且 `estado.dir` **不**变。它不是 `proposed_action`，也没有任何上限获得例外

### 第 29 阶段（第 5 次会话）——备份开始覆盖丢了会痛的东西（ADR 0152，RN-528） {#fase-29-sessão-5--o-backup-passa-a-cobrir-o-que-perder-dói-adr-0152-rn-528}
备份只覆盖**一个**数据库，只在**一个**地方运行：`make test-restore` 是 Kubernetes 路径（需要 `kubectl`、集群和 CronJob），而 `docker-compose.prod.yml` **没有任何** `backup` 服务——迁移 compose 安装没有经过证明的路径。决定首先**拒绝**容易的做法（“备份所有卷”），并对七个卷进行**分类**：`neo4j_data` 和
`project_workspaces` 是派生的，`ollama_data` 可以重新获取，
`brabo_projects_base` 属于用户——复制它们只会给人覆盖的印象，而不增加可恢复性。事实来源有**两个**，发现在于第二个：
**`git_local_repos` 不在任何备份中**，而 provider 为 `local` 的项目把 *bare* 仓库保存在那里——它无法从 Postgres 重建（event log 保存的是**叙事**，不是 git 对象），所以丢失这个卷就是丢失 agent 的代码。运维手册的文字曾断言相反（"the real
repositories live in GitHub/GitLab"），正是它解释了多年来没有覆盖的原因：这对 `github`/`gitlab` 成立，而对 `local` 没有上游。归档的保证是**声明**的，比“快照”更弱——按**引用**的一致性（git 在移动 ref 之前写入对象，并通过原子 rename 替换 ref），没有全局时间点，也没有 `git fsck`（镜像故意不包含 git）；并发的 `gc` 变成**失败**而不是部分归档，`tar` 的状态被记录到一个**文件**中，因为在 POSIX `sh` 中管道的状态是最后一个命令的状态。五个 S3 变量不再是必需的，而成为**一个**目标的配置（`BACKUP_DIR` 选择磁盘；缺失时为 S3——这种推断正是让 CronJob 保持**原样**的原因）。`make test-restore-compose` 触发**真实**备份，并以**同样**的三项校验调用**同一个** `brabo-restore`：改变的是**外壳**，从不是判断，而
`deploy/k8s/test-restore.sh` 保持**原样**（合并会让 compose 版本依赖 `kubectl`）；`restore.sh` 仍然不触碰**源**数据库。恢复仓库是**同类**命令（`brabo-restore-git`，默认只验证，只有 `--restaurar` 才写入），而不是另一个命令的阶段——两个产物、两种判断，合并会让 git 失败导致 event log 校验失败。**运行时**发现、阅读不会发现的问题：该卷由三个使用不同 uid 的镜像共享，其所有者是最先挂载它的一方（测得 `1000:1000`，模式 0755），而镜像以 uid 70 运行——提取会在中途失败，留下写了一半的卷；现在它会在 `tar` **之前**拒绝并点名 `--user 0:0`，以 root 提取的内容会交还给**目录**的所有者，否则卷会完好无损地回来却**毫无用处**（非 root 的 api 和 engine 无法写入刚恢复的内容）。Neo4j 获得的是**重新投影**而不是备份——这里没有构建（BRB-018）：迁移后的安装诞生时图谱为**空**，这是具名的降级而不是数据丢失（RAG 位于 pgvector 中，在 dump 之内）

### 第 30 阶段——机器级本地 agent（ADR 0154/0155，RN-543..552，在第 8 次会话以 RN-549 关闭） {#fase-30--o-agente-local-da-máquina-adrs-01540155-rn-543552-fecha-na-sessão-8-com-a-rn-549}
第 29 阶段交付了单行安装，并**停**在产品本身已书面声明的两个点上：本地 agent 仍然按**项目**配对（想使用已安装二进制的人要回到浏览器，复制一条命令粘贴到终端），而且**没有人能登录**——生成的 `.env` 没有电子邮件变量，`MAIL_TRANSPORT` 落到 `log`，注册要求验证电子邮件，所以出路是去 `docker compose logs api` 里捞链接。两者在同一个地方解决，这就是它们合为一个阶段的原因。决定其**规模**的发现，来自用 `arquivo:linha` 重新测量第 29 阶段“每个项目一个 runner 在五个地方被强制”的说法：**五个中有三个不需要改变**，因为主题、socket id 和 ticket 描述的是一个**连接**，而一个打开 N 个连接——每个项目一个——的进程逐字节满足它们，同时保留对同一项目第二个 runner 的拒绝，这是真实的保证，不是偶然。**整个阶段中 engine 没有任何改变**，正是这一点让 `RunnerReadiness`、镜像和 `workspace_create` 保持原样。剩下的是属于**进程**的东西：凭据（`runner_device_keys.project_id` 变为可空，RN-543——列表开始返回带标记的**两种**密钥，否则机器密钥会是不可见且永久的，即 RN-519 所关闭的缺陷重生）和 unit（RN-545，`service install --machine`，每台机器一个，与按项目的 unit **共存**）。两项决定违背了 ADR 的字面，而两者都经过了**测量**：unit 的判别依据是 `--machine` 标志而不是没有 `--project`（`resolverProjeto` 有两个来源，正常路径是在浏览器配置好的目录中不带标志运行 `install`——照字面执行，ADR 会静默地转换已在使用产品的人的安装），并且当另一种已安装时 `install` 会**拒绝**，没有 `--force`，因为两者同时存在会是两个进程争夺同一个项目。第 6 次会话会一次触及三个 workspace，因此被**拆分**为三次，两个不相交的部分先出，`install.sh` 在它们之后，只作为编排器。这次拆分带来了本阶段最有趣的修订：在**零**连接时，agent 不再**退出**，而是**等待**，以 15s/30s/60s 重新查询（RN-550）——RN-544 反对重新查询的论证在它成立的地方完全保留（变**短**的列表是有歧义的，因歧义而断开**活跃**连接是用确定的状态换取猜测），而在零连接时没有可以断开的东西；倒下的是 `exit 0` 的论证（“一个什么也不做的活跃服务”），因为进程开始做事并**说明**它在做。测得：`Restart=on-abnormal`
**不看退出码**，所以没有任何 unit 改变，效果是机器级 unit 真正处于 `active (running)`。另一部分（RN-551）从 agent 一侧关闭了“没有人**创建**机器密钥”，那里的决定是**切分**：CLI **不**与 api 通信，因为注册者是持有 `BRABO_SERVICE_TOKEN` 的安装程序——每一侧保管一个机密，谁也看不到对方的。由此产生两步设计，由此又产生不变量：`kid` **就是**注册的 id，只在注册之后才存在，所以 `create` 写入一个读取方会忽略的 `.parcial`，`finish` 写入真正的名字——**runner 读取的文件永远不会缺少
`kid`**，RN-475 的缺陷从构造上变得不可能。api 一半（RN-552）声明了代价而不是隐藏它：凭据是 service token，泄露的 token 将能够**制造**持久凭据——因此三项约束位于**路由**中而不是文本中（请求体中没有 `userId`；注册会在同一事务中**替换**所有者活跃的机器密钥，所以重装的机器可以通过，而一千把密钥因条款而不可能，无需会过时的数字；带 `d` 的 JWK 会被点名拒绝）。第 6 次会话（RN-547）串联了五条命令并确定了三条规则：中间环节失败不会撤销任何东西，它会在最后的区块中变成一行具名条目，脚本**总是**以 0 退出（撤销需要删除账号和吊销密钥，而没有这样的路由，也不应该有一个让安装程序自行调用的路由）；幂等性就是 **HTTP 代码**，`409` 是**预期**结果而不是失败，`000` 被单独处理，以免“api 没启动”被读作“api 拒绝了”；密码通过 `curl` 的 **STDIN** 传递，从不通过
`argv`，因为 `/proc/<pid>/cmdline` 对机器上的任何用户都可读。该次会话的发现：`--help` 已经**撒谎**了好几个月（*"ESTA VERSÃO NÃO INSTALA
NADA"*），因为它打印的是头部，而头部是注释，而禁止谈论“阶段会话”的规则只读取代码行。第 7 次会话（RN-548）为密钥种类标记提供了使用方，那里的决定关乎**诚实**：有密钥而没有活跃连接时——最常见的情况——界面说出它知道的两件事，并点名它不知道的两件事（*已注册的密钥不等于正在运行的 agent*，*这个列表属于你的**账号**而不是这个浏览器*），使用 `accent` 色调，从不用 `success`。第 8 次会话
（RN-549）是唯一能证明整体的一次，它**扩展**了第 29 阶段已有的 workflow，而不是创建第二个。它的核心决定是**信号**：
`perguntarEstado` 把 `activating` 映射为 `rodando`——这是有道理的——所以
`systemctl is-active` 和 `service status --machine` 会对一个两秒后就会死掉的进程给出绿色；所选的信号是 agent 进入等待时写下的那一**行**，它只有在 agent 读取了密钥、拿到 ticket、与 api 通信并收到**空**列表之后才存在，并且它是一个**记录下来的事实**，而不是对状态的采样。结果通过 API 而不是浏览器证明，因为断言的主体是 **AGENT**，它观察的是
`GET /runner/projects`——浏览器会通过同一条路由创建项目，只是多了一层会因无关原因失败的东西，而断言仍然会是 journal 中的那一行。E2E 仍然**不在** `pull_request` 中，后果被声明而不是隐藏（**写下它的 PR 并没有执行它**）：打开这扇门就是给安装程序一个跳过来源验证的方法，这正是 ADR 0150 所拒绝的——因此在 PR 中运行的那一半是一个**测试**
（`scripts/dev/install-e2e.spec.ts`），守护 workflow 无声腐坏的两种方式：被放松的 gate，以及被改写的 `install.sh` 句子（它不会让断言失败，而是让断言**消失**）。出现了两个缺陷，两者都不可见，因为 workflow 从未运行过：TTY 的回答以
`nao-migrar` 开头，在干净的机器上这会落到**标记文件**的问题上，让脚本以 0 退出并说 "Nada foi gravado"；以及作为发现保留下来的**发现**——已发布的 `install.sh` **在干净的机器上无法自行启动任何东西**，因为
`docker/docker-compose.install.yml`（连同 `./postgres/init.sql`）不是 Release 的资产，不在已签名的 `checksums.txt` 中，它也不会在任何地方下载它，所以按运维手册中 `curl … install.sh` 操作的人会在**已经**验证了签名并写入了
`.env` **之后**死在 "no
such file or directory" 上。修复它需要在签名资产与克隆之间做出选择，这是单独的交付。本阶段**声明**而未做的：吊销仍然作用于
`{projeto, usuário}`，从不作用于 `{chave}`，而现在代价更高（会让那台机器上**所有**项目的 agent 掉线）；没有可以列出和吊销设备密钥的界面，而本阶段增加了一种要列出的密钥却没有构建界面——缺口**变大**了，这是有意的；每台机器一个进程是单点故障，是设计的代价；`install --machine` 仍然不知道该目录中的密钥是否真的是机器密钥，因为在磁盘上两种密钥是同一种文件，知道的是服务器

### QA 的 golden-set 恢复测量，并按周定时运行（AT-076/AT-149，ADR 0168） {#o-golden-set-do-qa-volta-a-medir-e-roda-agendado-semanal-at-076at-149-adr-0168}

两次交付，中间有一个人的决定。AT-067 测得时钟可以容纳在没有 GPU 的 `ubuntu-latest` 中，而测量工具并没有在测量：自 RN-502 起，没有 `running` 容器的 `container` 项目的 `npm test` 会被拒绝，而种子从未启动过一个容器——从构造上就是 0/6。维护者选择了“路径 1”，AT-076 交付了它：种子通过**生产**路径为每个用例启动容器（`module_map` → 路由 → 由 Infra 提议并由所有者批准的 `container_start` → `ExecuteContainerStartUseCase` → broker → 经状态机进入 `running`），使用按 digest 固定的 `node:24.11.1-bookworm-slim`，RN-502 保持不变，无法启动的容器变成让 ExUnit 失败的**具名**错误（之前主体中的 `{:skip, _}` 会静默地通过为绿色）。CI 中两轮得到 3/6 和 3/6，对照 1/6 的下限，用例不同，作业耗时 52 和 86 分钟。AT-149 确定了节奏：**每周**（周六 01:17 UTC，加上
`workflow_dispatch`，从不 `pull_request`），在 `golden-set-qa.yml` 中，以
`golden-set-rag.yml` 为模板。选择每周而不是每晚，是因为一轮最多要 86 分钟并且会**变化**——同样的总数来自不同的用例——每周一次足以让下限发现下降。按测得的最坏情况设置 `timeout-minutes: 150`。结论来自测试本身；workflow 只增加两道**工具**层面的守卫（记分行必须存在，event log 中不能有 RN-502 的拒绝），失败时像 RAG 的那样打印日志——不开 issue。种子之前要拉取的镜像从种子的常量中**读取**，从不使用第二个字面值，因为 broker 的 `docker run` 运行在 30 s 的控制上限之下（RN-604）。证明轮次——带有在 PR 之前移除的临时 `push` 触发器——是 36327281774：又是 3/6，RN-502 拒绝为零，`mix golden_set.qa` 10 分钟，作业 13 min 41 s。已声明：CI 的 broker 没有 compose 的五层，心跳会在 QA 仍在处理种子会话时关闭它们（没有可见影响），修改 workflow 的 PR 不会执行它。

### Infra Lead 通过输入框对话（AT-141，ADR 0175，RN-617） {#o-infra-lead-conversa-pelo-composer-at-141-adr-0175-rn-617}

RN-584（AT-098）去掉了聊天的默认接收者，并书面留下了一个产品问题：Infra Lead 会对话吗？维护者在 2026-09-27 回答是，附带 RN-584 本身提出的条件——先解决回合。Infra Lead 的回合**整个**在 `handle_call`/`handle_cast` 中运行：没有接受、没有“Parar”、不在 `TurnoOrfao` 范围内，循环的第 14 步沉默地结束，而 180 s 的上限小于容器 `propose_action` 的 225 s（RN-605）。kickoff 是 `cast`，不会卡住点击，但会卡住进程——AT-089 测得 8.4 分钟——期间的消息会在队列中等待。第 1 步把三种回合（kickoff、gate 修正、消息）放进
`TurnoAssincrono`，Workflows 的整合在 Task 之内；在回合进行中到达的 gate 修正获得了一个队列，因为没有 `from` 的 `TurnoAssincrono` 会丢弃它。第 2 步给了 `infra` `message/2` 子句（`agente_sem_conversa` 拒绝被移除）、“Parar”的 `via_for`，以及在
`AGENTES_DE_CHAT` 中的位置；对它的 handoff 的接受保留在 RN-499 的专用卡片中，消息流中的卡片按名称排除它。`SOLO_CONVERSATIONAL_AGENTS` 没有改变：Infra Lead 是领域 lead。已声明：它没有获得结构化问题，也没有 backlog 读取。

### 带凭据的 git 在 runner 的主机上运行，代码在容器中（AT-116，ADR 0193，RN-676） {#o-git-credenciado-roda-no-host-do-runner-o-código-no-container-at-116-adr-0193-rn-676}

2026-10-01，第 36 轮。RN-558 关闭了**沉默**的那一半——在 `runner` 模式下、容器运行时，认证的 `git
fetch` 不再以空变量运行，而是带着标记
`credencial-nao-atravessa-o-container` 被拒绝——并把另一半声明为待定 ADR，因为所有已知选项都触及 ADR 0130 的隔离端口。所有者的决定（10月1日）选择了不触及它的那个：带凭据的 git 操作在**主机**上，代码在容器中。事先测得：engine 中唯一带 `env` 的 `exec` 是 `RunnerGit.fetch!/3` 的 fetch；没有通过 `exec` 的带凭据 `push` 或 `clone`（创建目录时的 clone 本来就在主机上运行，RN-532）；目录在两侧相同（`estado.dir` 挂载在 `/work`）。所选的判别依据是 engine 的显式**标记**（`gitCredenciado: true`，只由 `RunnerRouter.exec_git_credenciado/5` 设置），而不是已有的 `env`——以 `env` 为键，任何带 `env` 的命令都会逃出容器。RN-558 的拒绝缩小后保留下来，用于没有标记的 `env`，实际上变成了“早于 ADR 0193 的 runner”的意思。证明是 AT-111，两侧皆有：在 runner 中，使用 `GitAuth` 辅助程序的真实 `git credential fill` 和 `git fetch origin` 在容器活跃时于主机上成功；在 engine 中，经过真实 `TerminalChannel` 的链条以 `{:ok, _}` 结束。ExUnit 没有在交付环境中运行（`repo.hex.pm` 403），留给 CI。

### 没有 agent 的咨询型会话会要求选择一个 agent（AT-254，RN-682） {#a-consultiva-sem-agente-pede-um-agente-at-254-rn-682}

2026-10-01，第 36 轮。在 9月29日的真实使用中，一个没有 agent 的咨询型会话回答“我无法访问之前的对话”：没有接收者的消息进入 `POST .../chat` 的 SSE，它只把当前文本发送给绑定的模型——没有历史，没有系统 prompt——并以模型名称作为行动者记录回复。所有者的决定（10月1日）是要求一个 agent，而不是给自由聊天提供历史。事先测得：界面是该路由唯一的客户端（种子打印的 `curl` 是开发提示，用于创意型会话），而用例 `SendChatMessageUseCase` 有第二个合理的使用方——provider 的 smoke，它们在没有 agent 的会话中把它当作端到端的工具使用。因此 api 的拒绝位于**路由**中，作为独立的守卫，用例保持不变。在界面上，没有 agent 时，接收者一行开始带有手动 handoff 本身的选择器——一贯的动作，现在放在它是让消息有目标的唯一方式的地方——Criativo 被排除在列表之外，因为咨询型会话承诺它不会进入。

### 吊销针对的是密钥，而不是 `{projeto, usuário}` 对（AT-013，ADR 0201，RN-685） {#a-revogação-mira-a-chave-e-não-o-par-projeto-usuário-at-013-adr-0201-rn-685}

2026-10-01，第 36 轮。RN-520 让吊销能够触及活跃连接，以 `{projeto, usuário}` 为目标，因为凭据的身份在 `PatAuthGuard` 中就消失了；ADR 0154 把 *"按密钥吊销"* 列为它不做的事，而 PR #534 给了机器密钥同样的对，逐项目应用。AT-013 因范围和决定一直被阻塞，直到所有者选择（10月1日）：按**密钥**，带 ADR，改动 engine。事先测得：ticket 由 `{userId, kind}` 生成，socket 只保存项目/用户/kind，通道比较的是用户——同一用户使用 PAT 或另一把密钥的 runner 会一起掉线；机器密钥在 api 列表之外项目中的连接会保持运行；吊销之前签发的 ticket 在吊销之后仍能进入；吊销 PAT 不会让任何东西掉线。交付内容：ticket 中两个可空列（Ecto migration，这张表属于 engine——Drizzle 的日志停留在 `0068`），guard 在授权之后记录凭据，socket 的 id 加入凭据的种类和 id，以及一条 `runner/disconnect-credential` 路由，它作废待处理的 ticket，并询问集群中的每个 runner 是否源于该凭据。AT-013 的禁令（不能不再断开原本会断开的东西）变成了两个过渡部件：遗留连接在该行的项目中按对掉线，没有该路由的 engine 会让 api 回退到按对。按对的方式保留为移除成员的目标。界面只改变了确认文本（RN-561）。runner 没有改变。ExUnit 没有在交付环境中运行（`repo.hex.pm` 403），留给 CI。
