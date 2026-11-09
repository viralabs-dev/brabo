---
id: historico-de-fases-parte-2
title: "阶段历史，第 2 部分：16–26 计划与轮次"
sidebar_label: "16–26 计划与轮次，第 2 部分"
description: "16–26 计划以及 exp003 和 exp001 轮次：第 15 阶段之后真实使用提出了什么要求。"
keywords: [历史, 阶段, ADR, RN]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# 阶段历史，第 2 部分：16–26 计划与轮次

:::historico 2026-09-11
16–26 计划（第一次真实浏览所要求的）、随后使用提出的要求，以及 exp003 和 exp001 轮次。
文本原样移自[阶段历史](historico-de-fases.md)，未作改写。今天有效的内容位于 RN 和 ADR 中。
:::

## 16–26 计划——浏览所要求的（执行中） {#programa-1626--o-que-a-navegação-pediu-em-execução}
十一个请求，诞生于数据库重置后对应用的**第一次**真实浏览。这不是脚本：这是使用。调查中的三个发现定义了计划的规模和**顺序**，值得逐一记录，因为它们都不在原始请求中：

1. 在 `design_handoff_brabo/` 中存在一个**完整**的设计 handoff——8 个高保真界面、token、字体和品牌。决定是**完整**且**首先**采用它：这样十一个请求从新视觉中诞生，而不是做两遍。
2. Code 标签页的终端成了**架构**决策。每个项目都拥有自己的容器，由 **Arquiteto** 决定镜像。在容器内 agent 是自由的；`git push`、PR 和部署仍由人负责。这偿还了产品最大的未清债务——如今 agent 在与 Brabo monorepo **相同**的容器中执行，而 ADR 0055 自己也说它是策略，不是隔离。
3. 途中出现了两个真实缺陷，没有一个是被请求的：`agent_areas` **从未**被写入（`upsert` 没有调用方，API 返回 `[]`），铃铛的抽屉在 SQL 中按 `seq ASC` 排序——显示的是**最旧**的。

执行上限：最多**四个**并行子 agent。阶段按**争用的文件**切分，而不是按主题——这正是让并行成为可能的原因。后端的限制因素是 `apps/api/src/db/migrations/meta/_journal.json` 和 drizzle 的快照：每一波**一个** migration，因为手工解决快照冲突是走向 schema 分歧的道路。RN 区间和 ADR 编号在波次开始前**预先分配**：两个并行阶段都写 `RN-094` 会导致其中一个在合并时重新编号，而重新编号的 RN 会破坏 `pnpm docs:check` 会判定失败的 `#rn-0xx` 链接。

### 第 16 阶段——完成：基础（解锁并行） {#fase-16--concluída-fundações-destravar-o-paralelismo}
十一个请求中没有一个在这里交付。这个阶段之所以存在，是因为其中三个触及 `router.tsx`/`ProjectPage.tsx` 中**相同**的四个点，另外三个则卡在缺少公共部件上。没有它，各波次会退化为串行执行。
1. `design/tokens.css` 获得 `--violet`（agent/AI）以及 handoff 定义的其他内容。字体**继续**自托管——在这一点上照搬 handoff 会让应用在 nginx 的 CSP 下坏掉（ADR 0036）。对比度测试覆盖新的配对，已知的 4 对欠账仍被锁定。
2. 标签页不再是在**两个**地方的封闭列表：唯一的注册表，`PROJECT_TABS`、`type TabKey`、标尺和渲染都从它派生。测试会在一个地方有键而另一个地方缺失时失败——这正是真实的缺陷。
3. 设计系统中的 `Disclosure`，语义取自已有的最完整实现（`ModelCatalogSection`）。**只是组件**：六个临时实现都不在这里迁移，否则这个阶段会打开计划中争用最激烈的三个文件。
4. 会话标签变成辅助函数，五处内联的 `slice(0, 8)` 迁移过去。正是这次迁移让第 20 阶段不与第 19 阶段冲突。
5. `CLAUDE.md` 进入完成的定义（参见文档一节），在 docmap 中带 `warn` 规则。**已交付**：该规则是 docs/.docmap.yml 中的 `claude-md`，由 `package.json`、`pnpm-workspace.yaml`、`apps/*/package.json`、`apps/engine/mix.exs`、`docs/adr/*.md` 和 `docs/gates.yml` 触发——这里曾经的那句“如今它的覆盖为零”描述的是阶段**之前**的状态，此后一直在撒谎。

### 第 17 阶段——完成：符合 handoff 的 8 个界面 {#fase-17--concluída-as-8-telas-conforme-o-handoff}
视觉保真**先于**行为，以免返工。没有任何业务规则改变：如果某个界面需要不存在的数据，就成为已声明的待办，而不是搭便车的功能。
6. 登录和应用/项目列表。
7. 项目和会话，保留 RN-088 的三种状态（错误先于空）。
8. 审批和配置——审批是第 19 阶段的视觉基础。
9. 保真已经实现的证明：在 token 上测量对比度，并在**所有**触及的界面上用 `scripts/dev/validacao-visual.js` 验证布局。`.dc.html` 是参考，**不是**要复制的代码——handoff 自己的 README 就是这么说的。

### 第 18 阶段——完成：领域存在于数据库中（缺陷，提前修复） {#fase-18--concluída-a-área-existe-no-banco-defeito-corrigido-antes}
10. `AgentAreaRepository.upsert` **没有任何**调用方，因此四个用例都在空表上运行。在创建项目时置备 + 回填，并用测试证明新建的项目**有**领域——这与第 14d 阶段是同一种失败：测试零件不等于测试通往它的路径。
11. 把领域列表的**三份**副本（api、web、engine）合并为一个来源。

### 第 19 阶段——完成：能读懂的审批 {#fase-19--concluída-aprovação-que-se-lê}
12. 去掉 `ApprovalCard` 的通用回退，它会倾倒
    `chave: JSON.stringify(valor)`——这很可能就是“难以阅读”的原因。每个类型都获得一句 pt-BR 的**句子**；没有句子的类型显示动词 + “ver detalhes”，原始 payload 以**折叠**状态出现，绝不倾倒。
13. 在**三个**地方折叠：审批、Insights 和聊天中的卡片，动词和句子来自**一个**模块。
14. 项目约束：折叠**不**为 `ApprovalCard` 引入新的必需 prop。正是这一点让 `SessionPage.tsx` 保持不动，并消除了与第 20 阶段的交叉。

### 第 20 阶段——完成：会话获得身份 {#fase-20--concluída-a-sessão-ganha-identidade}
15. `sessions` 在**同一个** migration 中获得 `kind` 和 `name`——同一张表上的两个 migration 会在 journal 和快照中冲突。
16. 与基于事件的派生调和：`kind` 分类的是创建时的**意图**，`execution.activated` 继续分类执行的**状态**，两者互不改写。咨询型会话中的 `execution.activated` 是显式错误，而不是静默转换。
17. 重命名时保留 hashtag；没有名字时，退化为只显示它。
18. 返回仪表盘的按钮——如今 `SessionPage.tsx` 既不导入 `Link` 也不导入 `useNavigate`，**没有任何**导航能离开这个界面。目标在之后一轮中修订：按钮返回会话所属的**项目**（`/projects/:projectId`），而不再返回根仪表盘——会话总是诞生在某个项目之内。

### 第 21 阶段——完成：事件的数量（RN-099/100） {#fase-21--concluída-o-volume-de-eventos-rn-099100}
19. `useSessionEvents` 仍然是**当前状态**（`latest`，四个使用方：名册、树、执行、审批）。**历史**变成了 `useSessionEventHistory`，只用于活动，使用 endpoint 本来就返回的 `afterSeq`。没有新路由，没有新参数。锚点是**尾部**，而不是会话的开头：endpoint 向前分页，不存在 `beforeSeq`，但在一个有数千事件的会话中从第 1 个事件打开动态，交付的是错误的界面。所以第一页是同一个 `latest` 读取（**相同**的 `queryKey`，已去重），每次点击向后回退一个固定窗口。
20. 铃铛在 SQL 中按 `DESC` 排序。“已读”截断的语义**没有**改变，所以没有 ADR：按 `seq` 截断标记的是一个**前缀**，而抽屉显示的是一个**后缀**，所以没有按事件的已读表，就无法表达“标记显示出来的 50 条”。改变的是抽屉不再隐藏推进所吞掉的内容——按项目的总数、`+ N mais antigos`，以及说明会标记多少条的按钮。缺少的数字来自**减法**（`latestSeq` 减去截断点），而不是请求。
21. RN-090/091 的节省没有倒退：每个周期一次请求，第一次“加载更早的”花费为**零**——`latest` 读取带来 200 条，窗口显示 100 条。旧页面具有 `staleTime: Infinity` 且没有 `refetchInterval`：不可变事件上封闭的 `seq` 窗口不会改变。

### 第 22 阶段——2026-08-09 完成（面向两类受众的花费） {#fase-22--concluída-em-2026-08-09-gasto-com-duas-audiências}
作为**花费**标签页交付（ADR 0063，RN-101）。
22. 缺失的**聚合**进入了一个方法——
    `sumGroupedBy(dimensao, escopo)`，维度为 `model`、`project`、`actor`、
    `session` 和 `day`。`provider` **不是**它的维度，这种缺失是结构性的：按 provider 拆分就是按**凭据**拆分，正是这一点防止成员视图因疏忽而获得这个轴——根本没有可以传入的参数。
23. 没有图表库：每日柱状图和排行用内联 SVG。每日序列从 api 以**密集**形式返回（没有花费的日子以零进入），否则三周内的三次调用会变成三根挤在一起的柱子。
24. 冲突通过分离**问题**而不是筛选器来解决。按**凭据**的报告仍然只属于 owner（RN-060），并在旁边增加了 workspace 按模型/项目/行动者/日的拆分，同样是 `owner`。成员视图按**行动者**，以 token 和估算成本显示，不带 provider 也不带凭据——行动者取自已认证的 **token**，没有可以写入他人 id 的参数。agent 不计入成员的账：`token_usage` 记录的是谁花了钱，而不是谁下令花钱。

没有 migration，但**有**测量：在 52.5 万行时，查询以顺序扫描分别耗时 55 ms 和 38 ms，而在 `token_usage(created_at)` 上建索引会让它们降到 32 ms 和 19 ms。数字记录在 ADR 中；索引在有空位的那一波中加入。

### 第 23 阶段——2026-08-09 完成（可按领域继承的模型） {#fase-23--concluída-em-2026-08-09-modelo-herdável-por-área}
25. `area` 范围进入了级联（`会话 > agent > 领域 > 项目 >
    workspace`），位于 agent 与项目**之间**：它是 lead 与子 agent 共享的默认值，agent 通过覆盖它来分歧（ADR 0064，RN-102）。
26. 在编码**之前**解决的不一致：agent 的 binding 曾是**全局**的（`scope_id` = 纯 slug，自第 9a 阶段起忽略路由中的 `:projectId`），而领域自 ADR 0053 起是按项目的。按项目的范围位于全局范围之上，会让同一个 agent 只在有领域的地方解析出不同的模型。决定：agent 的 binding 也改为按项目——`agent`/`area` 的 `scope_id` 变为复合的 `<projectId>:<slug|chave>`
    （RN-103）——而不是把领域放在 agent 之下，那会违背“可继承的默认值”（如今几乎所有 binding 都是 agent 的）。
27. UI 显示谁在**继承**、谁**分歧**了（`ProjectSettingsTab.tsx` 中的 `AreaModelsSection` 和 `ModelsSection` 的来源列）；“恢复继承”是对 agent/领域 binding 执行 `DELETE`，从不把下一级的模型写进去——复制会变成在领域下一次变更时自行分歧的副本。修改领域的模型需要 `maintainer` 角色（与并行上限同一标尺，RN-083）；agent 的仍是 `developer`。

### 第 24 阶段——完成：聊天和 Criativo 作为场所（RN-104） {#fase-24--concluída-chat-e-criativo-como-lugares-rn-104}
28. **项目**界面上的两个标签页，各自列出其 `kind` 的会话，并以该 `kind` 创建而无需再次询问。会话仍然是独立的界面——标签页没有变成聊天容器。
29. 冲突的解决方式是让“会话”**离开**标尺。它留下的是深链接的**键**：聊天带有 `key: 'sessions'`，正是这一点让旧的 `?tab=sessions` 在聊天中打开并**选中**该标签页。只在面板中解析别名，会打开正确的面板却让标尺没有选中项，因为 `Tabs` 把 `active` 与 `key` 比较，而写 `active` 的是 `ProjectPage`——这一波保持关闭的两个文件之一。
30. **关于“Iniciar ideação”的结论**：它**保留**。问题的一半在第 20 阶段已经关闭（按钮从咨询型会话中消失，RN-097），另一半并不是冗余：正是它带来了 Criativo，从那时起才开始消耗 owner 的密钥（RN-058）。错的是**位置**——邀请花了一段文字去指向顶栏。现在，邀请在界面上时动作就**在邀请之内**，邀请不在时回到顶栏；`conviteVisivel` 是两者共享的唯一问题，以免重复出现或消失。

### 第 25 阶段——带裁剪地完成：每个项目一个容器（边界不再只是策略） {#fase-25--concluída-com-corte-container-por-projeto-a-fronteira-deixa-de-ser-só-política}
计划中最大的架构变更，也偿还了 B 和 F 阶段已分别指出的债务。交付了 25a（Arquiteto 的决定和闸门）和 25c（外部效果边界）；25b（容器生命周期）被**裁剪**并声明——而不是实现一半（ADR 0065，RN-105 和 RN-106）。
30. 完成：**Arquiteto** 决定为项目启动哪个镜像，作为它的产物（event log 中的 `artifact.project_image`，版本化，无表）——可审计，而不是隐藏的配置。在它决定之前，Code 标签页返回 409 且不放行（RN-105）。
31. 当时**未交付**，已声明：按项目的生命周期（置备、回收、清理、真正施加的资源上限），agent 的 worktree 位于容器之内。容器状态是**可变**的，需要自己的表——仅仅为了不等待 migration 空位而在 event log 中临时拼凑，紧接着就会需要修正。
    被**部分撤销**——由 28 计划第 4 波/F1 前线：状态**表**（`project_containers`，ADR 0081）到来了。仍然缺失、不打折扣的是让这张表有意义的那一半：还没有任何真正的编排器调用 Docker，agent 的 worktree 仍在容器之外。终端策略中“容器内 agent 是自由的”那一半**仍未**改变——在容器真正启动之前，ADR 0055 照常有效。
32. 当时完成，后由本地 runner **修订**（ADR 0102/0103，RN-418）：外部效果的边界。`git push`、PR 和部署不能通过终端发出——即使在项目范围之内——当时的规则**是** `deny`
    （不是 `require_approval`，因为“sempre permitir”），消息会重定向到**类型化**的动作（`git_push`/`git_merge`/
    `pr_open`），后者以 `proposed_action` 诞生（RN-106，已修订）。`deny` 变成了**绝对上限**（无条件的 `require_approval`，绝不可自动批准）——产品所有者的决定，“sempre permitir”在源头关闭，以免它变成装饰（参见本地 runner 一节）。受保护分支上的合并仍是手动的（RN-014），未受影响。网络和花费在镜像的**产物**中有自己的结论（`network: none`/`egress`，cpus/内存/pids 上限会拒绝而不是静默降级）——一次性决定，而不是逐条命令，原因与 Z 和 AD 证明动词 allowlist 不收敛相同。Z 和 AD 本身的关闭取决于 25b（物理隔墙），而它尚未启动。

### 第 26 阶段——完成：Code，只读 {#fase-26--concluída-code-só-leitura}
33. 完成（26a）：`GitProviderContract` 获得了 `listTree` 和 PR diff（第 11/12 个操作），capability **只**在测试套件证明时才声明。
34. 完成（26b）：`code.controller.ts` 的四个路由——树、文件、搜索和 diff——位于 RN-092/095 的**集中**检查之后，搜索带有上限和缓存（搜索是**组合**操作，不是契约中的操作）。
35. 完成：界面（`ProjectCodeTab`/`code/*`），在 `project-tabs.ts` 中注册，无需触碰 `router.tsx`/`ProjectPage.tsx`。侧栏（资源管理器/搜索——唯一有真实数据的两个），按**目录**加载的资源管理器，带面包屑的编辑器标签页，带 `filesScanned`/`truncated` 的真实搜索，按已知 id 的 PR diff（`patch: null` 被当作“没有文本”，从不是“没有变化”）。语法高亮是基于正则的**自有**分词器（`code/highlight.ts`）——**零**新依赖，相比 Prism/highlight.js/Shiki 为标签页所需功能要付出的 15-90 KB；三个新的颜色 token（`--syntax-function/
    -comment/-operator`）在**两个**主题下针对 `--code-bg` 校准到 4,5:1。RN-088 的第四种状态——被 Arquiteto 的待决事项阻塞（RN-105）——成为 RN-107，在尝试读取代码**之前**询问，被阻塞期间每 15s 自行重新查询。

    **已声明**的待办，背后没有真实数据：交互式终端（第 25b 阶段，仍被裁剪——标签页中诚实的空状态）、blame、标签页内的 PR 列表（diff 只能通过来自审批的已知 id 访问）以及问题/lint/测试面板。行虚拟化当时也被排除——handoff 本身称代码标签页为“计划中代价最高的”；每个文件 512 KB 的上限（`GIT_BLOB_MAX_BYTES`）在那之前限制了最坏情况。由 28 计划第 4 波/E2 前线**关闭**（RN-239..242）：只有可见窗口会变成 DOM 节点，迷你地图复用同一次分词而不需第二遍。

### 第 26b 阶段——完成：blame 基础、可浏览的 PR 和丰富的分支 {#fase-26b--concluída-fundação-de-blame-prs-navegáveis-e-branch-rica}
该阶段一开始**只有** API 层，这里曾留下的“没有 UI”一句描述的是**第一批**的状态——它过时了，开始误导人。**三个** UI 都已存在：丰富的分支下拉框（第 38 项，`CodeBranchPicker.tsx`）、按需 blame 开关（`CodeEditor.tsx`，RN-113）和标签页内的 PR 列表（`CodeDiffPanel.tsx`），后两者在 v3.0.0 中交付。blame、丰富分支下拉框和 PR 列表这三项已声明的待办，如果由并行 agent 分别处理，会触及**相同**的文件（契约、三个 provider、用例、controller、契约测试套件）；决定是一次性把三者一起交付，把每一项的 UI 留给后续三个 agent，没有冲突风险。
36. `GitProviderContract` 获得了 `blame`、`listPullRequests` 和
    `listBranchesDetailed`（第 13、14、15 个操作——RN-110/111/112），capability 只在契约测试套件针对三个 provider 证明时才声明（`local` 针对真实 git；`github`/`gitlab` 为 mock——真实 smoke 在环境中没有 `GITHUB_TEST_TOKEN`/`GITLAB_TEST_TOKEN` 时仍被跳过，与第 13a 阶段情况相同）。`listBranchesDetailed` 是**独立**操作，而不是 `listBranches` 的扩展（RN-112）——丰富信息需要对 provider **每个分支**多调用一次，而 `listBranches` 仍是 Gitflow bootstrap 使用的那个，不承担这一成本。
37. `code.controller.ts` 中的三个新路由（`GET .../code/blame`、
    `GET .../code/pull-requests`、`GET .../code/branches`），与之前四个相同的 `role:
    viewer` 和相同的集中路径检查（RN-095）。`apps/web/src/lib/api-client.ts`/`api-types.ts` 获得了对应的函数和类型（`getCodeBlame`、`getCodePullRequests`、
    `getCodeBranches`）供下一波使用——`CodeShell.tsx` 和
    `CodeDiffPanel.tsx` 除了记录基础已存在的注释外**没有**被触碰。
38. 完成：丰富的分支下拉框（RN-112）——`CodeBranchPicker.tsx`，从 `CodeShell.tsx` 打开，把简单的文本框换成一个选择器，列出每个分支相对于默认分支的 `ahead`/`behind` 以及关联的 PR（如有，`aberta`/`mesclada`/`fechada`）。列表之外的 ref（tag 或 sha）仍可访问——`listBranchesDetailed` 不枚举这两种，所以下拉框底部有一个手动输入框。

**计划的冻结：**每个阶段都声明它不做什么，最严格的是第 26 阶段——代码**只读**，不能通过标签页保存。编辑是后续阶段，到时写入是外部效果：以 `proposed_action` 诞生。

## 16–26 计划之后——使用随后提出的要求（RN-148） {#pós-programa-1626--o-que-o-uso-pediu-depois-rn-148}
与第 15 阶段之后同样的精神：不是计划中的阶段，而是**使用**所要求的。PO 一次产出多个故事时，同时待推进的故事（RN-048/RN-126）会在 PO 会话的时间线上变成 N 张零散卡片。`Carousel`（`apps/web/src/components/ui/Carousel.tsx`）是设计系统中第一个逐项导航的组件——2 个以上的待办变成**一个**可导航的轮播（箭头、圆点、键盘），“Aprovar todas”在一次调用中推进整批（`promoteStories` 本来就是批量的，契约不变）；1 个待办仍是一贯的简单卡片。何时形成一“批”在每次渲染时重新评估——即会话中**仍待处理**的推进集合，而不是“连续不间断地创建”——这样在轮播中途解决一个故事会自动重新计算这一批，无需同步自身状态。

**本地项目或容器项目（RN-169/RN-170，ADR 0072）。** 产品所有者的请求：“越过只在容器中写代码的边界，能够从用户的目录写代码”，他选择了**自由输入路径**的变体，并清楚它只有挂载到容器中才能工作。`projects` 在 migration
`0043` 中获得（`workspace_mode`、`workspace_path`），默认 `container`——不选择的人什么都不变。ADR 0072 **修订**了 0065 的一部分，并触及 0055 的领域，它们曾决定相反的方向（容器隔墙），因此后果被如实写出，不打折扣：`join(env, coluna)` 的**结构性**约束——任何损坏的列都不会逃出受管根目录——对本地项目不复存在，剩下的是创建时的守卫加上读取时的词法再校验。第 25b 阶段仍被裁剪：本地项目在今天的**同一个**容器中运行，只是目录变了。

**Arquiteto 的 C4 图（RN-149，ADR 0068）。** 新的交付物：
`create_c4_diagram` 以 Mermaid 生成 Context + Container（Simon Brown），在概览中渲染。Container 层由用例从当前的 `module_map` **派生**——从不由模型重新输入——以免开启一个与第一个来源分歧的第二来源；只有 Context（系统名称和外部参与者）来自工具调用。`artifact.c4_diagram` 是无表的产物，在 event log 中版本化，与 `artifact.project_image` 的设计相同（ADR 0065）。`mermaid` 作为 `apps/web` 新的**运行时**依赖进入——同类中的第一个（文档站点已经使用 Mermaid，但在构建时）——隔离在 `apps/web/src/lib/mermaid-render.ts` 之后，通过动态 `import()` 加载；`vite build` 确认只有入口点是即时加载的，Mermaid 的大块按需加载，并且没有一个使用 `eval`/`new Function`——ADR 0058 的封闭 CSP 保持完好，配置无需改动。

## exp003 轮次——完成（RN-150..162，PR #278–#293） {#rodada-exp003--concluída-rn-150162-prs-278293}
这不是阶段：这是**使用**在 `exp003` 项目的一次现场测试会话中发现的 17 个问题，按**争用的文件**分五个顺序波次修复——其中四波汇聚到 `SessionPage.tsx`，迫使串行化。来源值得一提：没有一个是由测试发现的。

**这一轮教会我们的、比清单更有价值的东西**：最大的修复（RN-155）对任何测试套件都不可见，因为缺陷在于比较两个**不同**的数值空间，而它们碰巧都是 `number`——`event.seq`（无间隙，按**会话**）与 `action.seq`
（`proposed_actions.seq`，整张表的全局 `bigserial`，由系统中每个项目和每个会话共享，并在 schema 中被记录为有意的对照）。只有在表还小时，顺序才看起来是对的。修复没有发明新字段：它使用了 `ProposeActionUseCase` 已经在**同一个**事务中写入的 `proposed_action.created` 事件，其 `payload.actionId` 指回该动作。

**engine 与受控读取（RN-150）**——`search_workspace` 返回**所有**命中，没有上限：这是在修复 `read_file` 之后，PR 审查中 `413` 的第二个真实原因。两个**独立**的上限，因为搜索会以两种方式溢出——命中数量（`SEARCH_WORKSPACE_MAX_HITS`，500，作用于一个在 `max_hits + 1` 处**停止**扫描的 `Stream`）和最终文本的字节数（`SEARCH_WORKSPACE_MAX_BYTES`，32.768）。独立的变量，不复用另外两个：同一类溢出，调整一个不应要求触碰其他。截断标记是写给**模型**的（让它细化搜索词），从不编造总数，因为统计总数会再次付出上限所要避免的 I/O。

**会撒谎的数字（RN-151）**——侧栏中项目的徽标统计的是**任何**未读事件：`exp003` 显示 392，而同一项目的审批标签页显示 8。一个点击后不对应任何可操作内容的数字，比没有数字更糟。它变成了已有读模型（RN-090）中的 `pendingApprovalsCount`，在 `Promise.all` 中多一个聚合——从不 N+1。

**agent 产出的可追溯性（RN-152）**——Code 标签页下拉框中的 `feature/task-XXXXXXXX` 分支开始说明它属于哪个 dev agent 和模块。模块取自当前的 `module_map`，经由生成它的**同一组**函数，从不对名字做反向正则；没有关联时，退化为 `null` 而不是猜测。

**自动模式（RN-153/154，参见约定）**——通配符 `actionType: "*"`。重要的是它所在的位置：解析属于**仓库**（`findMode`），`decide.ts` 没有增加一行——正是这一点让三个绝对上限**从构造上**成立，而不是靠又一个某天有人会忘记的 `if`。

**能读懂的会话消息流（RN-155..159）**——排序（见上）；5s 指示器使用固定文本 "Reunindo informações..." 而不是插入 agent 名称，后者已出现在标题中（RN-156）；PO 创建史诗/故事变成紧凑提示，而不是与真正回复同等视觉权重的气泡（RN-157）；聊天中带高亮的轻量 Markdown，用**自有**正则解析器，零新依赖、没有
`dangerouslySetInnerHTML`，并且只渲染 agent 的**输出**——人输入的内容保持字面（RN-158）；以及按 agent 分组、使用 RN-138 的 `Disclosure` 的“Artefatos gerados”，每个产物都导航到它所在的位置（RN-159）。module_map/C4 按已记录的决定被**排除**：它是项目的**当前**状态，而不是按会话标注日期的产物。

**权威顺序（RN-160/161，ADR 0069）**——“Confirmar arquitetura
pronta”只在至少有 1 个**已推进**的故事时启用（仅有已捕获的规则还不够）；而当接受者的有效角色已经授权时，接受交给 Dev Lead 的 handoff 会串联激活执行。合并只发生在客户端：后端仍然要求 `maintainer`（RN-137），所以它省去了一次多余的点击，而没有移动授权边界。

**结构化输入（RN-162）**——Criativo 的 `ask_structured_questions`：模型以 schema 声明问题，表单由
`StructuredQuestionCard` 渲染，回答**复用** `SendAgentMessageUseCase`，而不是开辟第二条消息路径。回答是一次性动作——重新提交是 409，而不是覆盖。

## exp001 轮次——Criativo 兑现承诺（RN-163） {#rodada-exp001--o-criativo-cumpre-a-promessa-rn-163}
与其他轮次同样的精神：来自**使用**，而不是脚本。报告是“Criativo 在说它会修正并重试之后没有回应”，而这句话在代码中是字面成立的——`run_turn_capturing/1` 调用模型**一次**，分派工具，然后返回。工具的结果进入内存中的历史，再也没有人读取，所以承诺的修正只有在用户再发一条消息时才会发生。

Criativo 是唯一没有 tool use 循环的对话型 agent；它获得了与 PO 相同的循环，自己的上限为 12。修复之外的价值：**决定宣布什么的变成了上限**，而不是固定文本——只有在还有回合可以兑现时，重试的承诺才会出现在句子中。上限耗尽变成了被叙述的 `agent.error`（`po_server` 在这种情况下会沉默结束，这是下一个显而易见的债——紧接着由 RN-166 关闭），工具失败不再是 `agent.response`
——在 event log 中它与正常回复无法区分，也不说明任何来源，这正是 RN-059 为回合失败所关闭的问题。

## exp001 轮次——PO 读取已有内容并被督促（RN-164..166） {#rodada-exp001--o-po-lê-o-que-já-existe-e-é-cobrado-rn-164166}
这不是阶段：这是真实**使用**发现的缺陷，来源很重要，因为任何测试套件都抓不到。backlog 产出了史诗而**没有任何故事**——因此没有任务，因此执行被卡住而**没有任何错误**。调查发现四个叠加的原因，前三个其实是同一个：PO 没有办法知道，也没有办法提醒。

1. **PO 有四个工具，全部是**写入**工具。** 上下文只在 kickoff 时组装**一次**，取自**会话**最近的 200 个事件——此后它再也不重新读取任何东西：它不知道存在哪些规则、已覆盖了哪些，甚至不知道自己已经创建了什么。加入了
   `listar_regras_de_negocio` 和 `listar_backlog`（RN-164），由两个限定在**项目**范围的内部路由提供——范围正是要点：按会话读取恰恰是之前隐藏已捕获规则的原因。它们复用已有的管道（`listByTypeForProject`、`ListBacklogUseCase`、
   `computeCoverage`）；缺的是路由、客户端中的方法和工具。
2. **史诗之后没有任何东西督促故事**，并且**循环沉默地结束**。没有故事的史诗变成了**显式**结果——`backlog.epic_without_story`，持久化，遵循 RN-059 的模式（RN-165）——`PoServer` 的迭代上限开始发出 `toolloop.limit_reached`，与 `ToolLoop` **相同**的类型，而对话型 agent 因为有自己的循环从未发出过它（RN-166）。
3. **kickoff 指令对信息缺失时该怎么做只字未提**——面对没有指令的缺口，模型只能在编造和停止之间选择。它选择了停止。第三条出路被写了下来，并附上行使它的工具：`ask_structured_questions`，与 Criativo **相同**（RN-162），现在也提示给了 PO。

两个超出本案例价值的设计决定：只有**成功的** `create_story` 才能清偿史诗的义务（被 api 拒绝的故事什么也没覆盖，把它当作覆盖了就是用一种沉默替换另一种）；督促按**发生次数**进行，只报告一次，从不是每个回合都重复、直到有人学会忽略它的告警。

## exp001 轮次——消息流按回合发生的方式阅读（RN-172/173） {#rodada-exp001--o-fio-se-lê-como-o-turno-acontece-rn-172173}
与其他轮次相同的来源：**使用**，而不是脚本。关于会话界面的四条抱怨——PO 的 handoff 出现在他最后一句话的**上方**，审批跳到 Arquiteto 回复的中间、直到他说完才落下来，审批卡片“排版糟糕”，以及滚动不跟随对话。

**调查发现排序是**正确**的**，这就是这一轮的教训。RN-155 忠实于 event log；日志说的是
`po_server.ex#run_turn/2` 在**同一次**迭代中先发出 `agent.response`，**然后**是 `offer_handoff` 的 `tool.call`，**之后才**递归进入收尾发言——因此 handoff 的 `seq` 确实**小于**最后一句话的。`proposed_action.created` 也一样。所以修复不在排序：它是一条声明的**呈现**规则（RN-172），在按 `seq` 的 `sort` **之后**的单独一遍中（`afundarDesfechos`）——而不是一个一年后没人能解释的三项比较器。

防止回合相互混合的是三道屏障，每一道都源于一个真实案例：**回合**（两个回合之间的边界可能没有**可见**的条目——`agent.activated` 打开回合，但不会成为消息流中的条目）、**作者**（在执行会话中，多个 agent 在用户一次都没说话的情况下写入，它们都处于同一个回合）以及**非结果**（两个连续的结果保持彼此之间的顺序——Infra 先于 Dev Lead）。

RN-173 关闭了另外两条抱怨，而它们其实是同一个：滚动效果只依赖 `[events.length, streamingText]`，而 `actions` 是一个**单独**的查询——一张卡片到来会把对话推出屏幕而不滚动任何东西。修正了依赖，并在内容上加了一个 `ResizeObserver`，用于**任何**依赖列表都覆盖不到的情况（`Disclosure` 的折叠、Markdown 的重排）。距离底部 120px 的守卫故意保持不变：消息流跟随对话，而不劫持已经向上翻阅的人的阅读。

## exp001 轮次——消息流说明谁在说话、用哪个模型、问的是什么（RN-171/174/175/176） {#rodada-exp001--o-fio-diz-quem-fala-com-qual-modelo-e-o-que-pergunta-rn-171174175176}
相同的来源：**使用**。关于会话界面的四条抱怨，其中三条共享同一个教训——**产品知道这个信息却没有显示**。

**问题居中，并且有出口（RN-171）。** 报告是字面的：“当用户选择 Escreva 时，总是给出用户输入的选项”。模型提供了“自己写”之类的选项，而表单没有可以书写的地方——`ask_structured_questions` 的 schema 无法表达“除了这些，你想要的任何内容”。`allowOther` 以**默认 `true`** 进入 `select`，这种不对称就是论据：因**遗忘**而封闭的列表会卡住对话，用户无法从外部解锁；被误设为开放的列表只是多提供一个输入框。界面的哨兵值从不传到后端，提交按钮仍要求全部填写（后端无论如何都会以 400 拒绝）。这个框也改为居中，采用 `ApprovalCard` 的 560px 上限并加上了头像：它曾是消息流中唯一不与任何东西对齐的条目。

**触发回合的动作会启动指示器（RN-174）。** “思考中”的动画早已存在——缺的是**覆盖**。界面上有两个动作会在 engine 中触发同步回合，却什么也不开启：回答表单
（`AnswerStructuredQuestionUseCase` 复用 `SendAgentMessageUseCase`）和把故事退回给 PO（`ReturnStoryUseCase` 调用 `reviseStory`，即
`handle_call({:revise, …})`）。Phoenix 通道无法填补这个空洞：在 join 仍在进行时（RN-108），"working" 的 `agent.status` 没有监听者，会丢失。

**模型，对所有人（RN-175）。** 缺陷属于 PO 的前提站不住：四个对话型 agent 自 RN-146 起就记录 `modelName`，测试为绿色。从未记录的是 **`ToolLoop`**——每个执行型和 gate agent 的路径——以及 api 中没有活跃 agent 的聊天。没有新调用：`RunLlmTurnUseCase` 本来就在响应体中返回该字段。界面不再写一个孤零零的“modelo”一词（读起来像是模型就叫这个名字），而是变成可读的标签；没有数据时，它会**说明**未记录——按当前 binding 猜测，会把一个可能根本不存在的模型归给旧回复，这与 RN-044 的冻结价格所避免的错误相同。

**Markdown 中的表格成为表格（RN-176）。** 有两种可能的出路，选择的是在聊天的 Markdown 中支持表格，使用设计系统的 `Table`。在消息流中渲染 `artifact.module_map` 被一个已记录的决定**拒绝**：它是项目的**当前**状态，不是按会话标注日期的产物（RN-159），它位于概览中。此外，请求针对的是**消息之内**的表格——修复服务于任何写表格的 agent，而不只是模块地图。分隔行仍然是必需的（GFM），所以带有 `|` 的散文永远不会被误当作表格。

## exp001 轮次——面板会分组、排序，并说明它没有显示什么（RN-177..181） {#rodada-exp001--o-painel-agrupa-ordena-e-diz-o-que-não-mostra-rn-177181}
与其他轮次相同的来源：**使用**，而不是脚本。关于会话的上下文面板和日志的五条抱怨，这一轮的教训只有一个——**面板把一个切片当作全部来显示，而且同时在三个不同维度上**：它隐藏了六种事件类型却不提供替代方式，按从旧到新的顺序阅读，并且在没有说明的情况下把会话截断在 200 个事件。

**来源作为新的分类（RN-177）。** `ActivityKind` 回答“事件谈论的是什么**主题**”，决定图标和颜色；`origem` 回答“它来自哪一**层**”，正是它让历史可读——`eventos`、`sistema`、`llm`、
`harness`、`agente`、`usuario`，派生自**存在**的数据（`actor.kind` 和 `type` 的前缀）。优先级让它可预测，体现在 `if` 的顺序中：机制胜过行动者（一个 `tool.call` 属于 harness，不管是谁），行动者胜过 agent 前缀（`chat.message` 在两边都存在）。最近的 5 个保持展开，其余按来源折叠，**在两个地方都是如此**——日志面板和消息流，在消息流中轴是反向的（消息流是升序的，所以历史在**顶部**）。机器噪声过滤器**仍然默认开启**：它的理由没有变（193 个真实事件中有 116 个），变化的是它成了一种**选择**，而不是既成事实。

**顺序和分页（RN-178）。** 四个部分都改为降序，“Carregar mais antigos”按钮也因此换到另一边——还是之前的论证，只是符号反了过来。超过 5 条的业务规则会分页，页码通过 *clamp* 而不是同步副作用来解析。

**PO 的树（RN-179）。** `backlog.task_created` 从未进入面板；现在史诗 → 故事 → 任务形成一棵树，依据事件本身已携带的**关联**（`epicId`/`storyId`），从不依据日志中的邻近关系——父节点未加载的节点会上升到根部，而不是靠猜测挂上去。

**开始显现的上限（RN-180），这是最有价值的一项。** 面板通过 prop 读取 200 个事件，无法说明还有更多。它改为读取 RN-099 的分页历史（与尾部相同的 `queryKey`，**零**额外请求——RN-090/091），获得了 `ActivityFeed` 一直都有、但没有任何调用点传入的分页器，注释通过对 `seq` 做**减法**统计还缺多少，就像 RN-100 的铃铛一样。派生部分读取 `baixados`（已经到达的全部内容），而不是动态的窗口，否则它们会显示得比之前**更少**。

**消息流中的委派（RN-181）。** `delegation.completed|failed|dispensed` 只存在于日志面板中：gate 打开又关闭，而没有任何迹象表明底下发生过第二次尝试。它们变成了 RN-157 格式的紧凑提示，句子来自 `classifyEvent`——与面板中相同。领域的外部契约不变（ADR 0038）：消息流叙述 lead 记录的内容，而不是开始直接寻址子 agent。
