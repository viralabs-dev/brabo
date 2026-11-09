---
traducao_de: c165be09458a5dfdc42010867a29adf8a36ccd99
id: rn-produto-parte-02
title: 'Regras de negócio — Produto — 第 2 部分 (自 RN-543)'
sidebar_label: 'Produto — 第 2 部分 (自 RN-543)'
description: 'As RNs hospedadas na raiz produto.'
keywords: [regras de negócio, produto]
---

# Produto — 第 2 部分 (自 RN-543)

## 设备密钥可以属于「机器」（RN-543，FASE 30）

<a id="rn-543"></a>

### RN-543 — `runner_device_keys.project_id` 为空即「机器」密钥：对其「所有者」的项目有效，针对所请求的项目解析 {#rn-543}

本地代理的身份原本是按「项目」的。一台有三个 `runner` 模式项目的机器有三把密钥、三个带 `brabo-runner-device-key.jwk.json` 的文件夹和三个服务 unit——人要把同一个浏览器流程（[RN-464](../api.md#rn-464)..[466](../runner.md#rn-466)，[RN-475](../web.md#rn-475)）走三遍，来描述**一台**机器。这是 [ADR 0154](../../adr/0154-chave-de-dispositivo-de-maquina.md) 测量的五个耦合中的第 4 项；第 1、2、3 项（主题、socket id、票据）描述的是一条**连接**，N 条连接逐字节满足它们，所以**这里 engine 中没有任何变化**。

**一张表，两个种类。** `project_id` 有值 = 一直以来的「项目」密钥。`project_id` 为 NULL = 「机器」密钥。ADR 中考虑过并拒绝了姊妹表：`PatAuthGuard` 通过 `kid` 找到公钥，不需要知道种类，而两张表就要两次查找——第二次恰好会被遗忘一次。用 NULL 而不是哨兵值：FK 是真实的，`project_id = '00000000-…'` 会要求 `projects` 中有一行假数据。`user_id` 仍然是 `NOT NULL`——ADR 拒绝跨用户的密钥，因为凭据描述的是**谁**在行动。

**决定一切的点只有一个。** `PatAuthGuard.autorizarPapel` 原本在凭据的项目与路由的项目不同时拒绝。这项比较**没有**被删除：它正是阻止项目 A 的密钥服务项目 B 的东西，它**只**对空的 `project_id` 消失，因为那时没有可比较的东西。角色改为针对**所请求**的项目解析，这正是 ADR 0154 第 2 点的字面意思——*"a autorização continua sendo a de sempre, resolvida contra o
projeto pedido"*。**没有新的上限，也没有放宽任何上限**：机器密钥不会给 runner 任何其「所有者」本来没有的东西，在所请求项目中角色不足仍然是 403。PAT 分支不变——`personal_access_tokens.project_id` 仍然是 `NOT NULL`。

**代理「询问」它服务哪些项目。** `GET runner/projects` 返回处于 `execution_mode: 'runner'`、且凭据所有者至少达到 `developer` 的项目——与 `runner-ticket` 的「同一」最低角色，因为列出一个票据会被拒绝的项目，就是承诺下一个路由会否认的东西。它询问而不是扫描磁盘：机器的基目录属于用户，可能有不属于任何项目的文件夹，按文件夹名猜测是 [ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md) 拒绝过的那类错误。传输的是「段」（`workspaceDirName`，[RN-109](../api.md#rn-109)），绝不是绝对路径——与 broker 相同的不变量。

这是**第一个路径中没有 `:projectId` 的 `@RequirePatAuth()` 路由**，两个后果都由测试锁定：只有「机器」凭据能进入（项目凭据只描述一个项目，没有可发现的东西——以「自己的」消息返回 403，绝不用「项目错误」的那条，那会对原因撒谎），也没有 `@RequireRole`，因为没有可以针对它解析的项目。最低角色按「行」应用，使用产品「唯一」的尺子（`ResolveEffectiveRoleUseCase.forProject`，`projectRole ?? workspaceRole`——[RN-471](../web.md#rn-471)）；SQL 中的候选查询是 `alcança`，绝不是 `tem
papel`，在那里重写 `??` 就是第二把尺子。因此 `route-surface.spec.ts` 将其归类为 `jwt`——分类器读取 `@RequireRole`，看不到机制——而 `docs/security-surface.md` 在文字中纠正这一解读，正如它对 `runner-ticket` 已经做的那样。

**[RN-519](../api.md#rn-519) 的列表开始说明「种类」。** 机器密钥服务所有者的每个项目，所以它进入所有项目的列表——带标记（`especie: 'maquina'`，`projectId: null`）。两半都是必需的：不进入列表，它会在每个界面上不可见且永久存在，这正是 RN-519 关闭的缺陷在新种类中重生；没有标记，同一行会出现在 N 个项目中，看起来像 N 把不同的密钥。种类在「一个」地方从 `project_id` 派生——没有它的列，也不应该有。

**吊销的目标变成「复数」。** [RN-520](../api.md#rn-520) 断开 `{projeto, usuário}` 的活动连接，而机器密钥不点名任何项目。不断开会重新打开 RN-520 恰恰关闭的东西——密钥对「新」票据失效，而活动连接继续执行已批准的命令——，现在是 N 条连接而不是一条。所以吊销机器密钥会对所有者能到达的、处于 `runner` 模式的**每个项目**请求一次 `disconnectRunnerOfUser`。这是 ADR 事先声明的后果（*"revogar passará a derrubar
todos os projetos daquela máquina"*），而且它**无需触碰 engine** 就能实现：`{projeto, usuário}` 签名逐字节不变，只是被调用 N 次。列表来自「候选」，没有角色过滤，这是有意的——断开连接不是授权决定，漏掉一个项目会让吊销存在就是为了杀掉的东西继续运行。

- **代码：** `apps/api/src/db/schema/auth.ts`（`runnerDeviceKeys.projectId`，没有 `.notNull()`）；`apps/api/src/db/migrations/0058_public_war_machine.sql`；
  `apps/api/src/interfaces/http/auth/pat-auth.guard.ts`（`autorizarPapel`）；
  `apps/api/src/interfaces/http/runner/runner-projects.controller.ts`；
  `apps/api/src/application/use-cases/runner/list-runner-projects.use-case.ts`；
  `apps/api/src/infrastructure/persistence/drizzle/project.repository.ts`
  （`listRunnerModeReachableBy`）；
  `apps/api/src/infrastructure/persistence/drizzle/runner-device-key.repository.ts`；
  `apps/api/src/application/use-cases/auth/revoke-runner-device-key.use-case.ts`
- **测试：** `apps/api/test/interfaces/pat-auth.guard.spec.ts`——*"chave de
  MÁQUINA"*，「两个」方向都锁定（机器密钥在任何项目中有效；「项目」密钥在不同项目中仍被拒绝）以及没有 `:projectId` 的路由；`apps/api/test/application/use-cases/runner/list-runner-projects.use-case.spec.ts`
  （低于 `developer` 的角色被排除）；
  `apps/api/test/infrastructure/persistence/drizzle/runner-device-key.repository.spec.ts`
  和 `.../project-runner-mode.repository.spec.ts`（针对 Postgres——改变的是一个 `NOT NULL` 和一个 `WHERE`，没有任何假实现能证明其中任何一个）；`apps/api/test/application/use-cases/auth/revoke-runner-device-key.use-case.spec.ts`
  （*"o alvo da desconexão vira PLURAL"*）；
  `apps/api/test/interfaces/http/runner/runner-projects.controller.spec.ts`
- **已「声明」的缺口，由 [RN-552](../api.md#rn-552)「关闭」：** 本 RN 关闭时，api 中没有任何路由**创建**机器密钥——该路由会在拥有第一个真实调用方的 PR 中诞生，即 `install.sh`（[ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md) 第 4 点），绝不提前。事实正是如此：`POST /internal/machine-device-keys`。端口的类型已经是「列」的类型（`projectId: string | null`），这样未来的消费者在那里没有需要改的东西。而 web 仍然没有可以列出或吊销设备密钥的界面（RN-519 开放的一半）：新种类让缺口变得更大，它保持已声明，而不在这里关闭。**之后由 [RN-561](../web.md#rn-561)「关闭」**，它就是那个界面——而这里创建的种类标记正是它用来不对吊销范围撒谎的东西。
- **ADR：** [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)
- **来源：** FASE 30，第 2 次会话——
  [阶段的范围划定](../../explanation/fase-30-runner-por-maquina.md)

## 安装的第一个账户在终端中诞生（RN-546）

<a id="rn-546"></a>

### RN-546 — 内部路由创建「第一个」账户，已验证，并在存在任何用户时拒绝 {#rn-546}

[FASE 30](../../explanation/fase-30-runner-por-maquina.md) 的第 5 次会话，由 [ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md) 决定。这是完成一行安装那一步的 api 一半；消费这条路由的 `install.sh` 是第 6 次会话，它已在 [RN-547](#rn-547) 中到来。

**漏洞，已测量。** 在新安装中没有人能进入。安装程序生成的 `.env` **没有任何**电子邮件变量，`MAIL_TRANSPORT` 落入默认值 `log`（`docker/docker-compose.install.yml`），而正常注册要求验证电子邮件——通过一个关闭的通道无法完成。安装以「Pronto」结束，唯一的出路是从 `docker compose logs api` 中捞出链接。

**路由。** `POST /internal/first-account`，`engine-service`——由 `BRABO_SERVICE_TOKEN` 认证，与其他内部路由使用同一个请求头和同样的常数时间比较。请求体 `{ email, senha, nome? }`，回应 `{ userId, email, workspaceId }`，`201`。

**为什么是内部的，绝不公开。** 一个公开的「创建第一个 owner」路由，是安装者与端口扫描者之间的赛跑，输掉赛跑的人就输掉了安装：第一个 workspace 的 `owner` 不是能通过 HTTP 找回的角色。service token 在正确的地方关闭了这场赛跑——它由 `install.sh` 本身生成，并以模式 `600` 写入 `.env`，所以出示它证明的是对**机器**的控制，而这正是这一步真正想要的凭据。

**账户诞生时即已「验证」，这是这条路由唯一放宽的东西。** 电子邮件验证证明的是*"esta pessoa controla esta caixa"*；运行安装程序的人已经证明了更强的东西——机器、带有五个密钥的 `.env` 以及 Docker 守护进程。通过安装知道已关闭的通道向她索要更弱的证明，是表演。**正常注册逐字节保持不变**：ADR 为一个点名的情况创建了一条路径，不碰另一条。

**拒绝针对的是「安装」，而不是电子邮件。**
`UserRepository.existeAlgumUsuario()`（`SELECT 1 … LIMIT 1`，绝不用 `count(*)`），存在任何用户时返回 `409`。问题针对 `users` 而不是 `auth_credentials`，因为通过社交登录配置的账户（[RN-278](../api.md#rn-278)）诞生时没有凭据，询问凭据会在一个有人的安装中回答「没有任何人」。继承 `provisionarUsuario` 按电子邮件的幂等性，会把这条路由变成一个名不副实的账户创建器——只要换个地址就行。在迁移中（[RN-530](../infra.md#rn-530)），用户随恢复而来，这一步按同一标准保持沉默。

**个人 workspace 在「同一」事务中**（[RN-410](../api.md#rn-410)）。这是「第三个」账户创建点，它不获得自己的名称/slug 规则：调用与另外两个相同的 `nomeESlugDoWorkspacePessoal`。没有它，安装会以一个能通过的登录和一个「新项目」无处可建的 dashboard 结束——这是本阶段要填补的漏洞的一半，而不是另一半。

**抽取，以及为什么不用 `BRABO_FORCE_SEED`。** `provisionarUsuario` 拒绝在 `NODE_ENV=production` 下运行，而安装程序恰恰运行在生产环境。拒绝所保护的东西写在它的 docblock 中：**无人工交互**创建的**已知**密码。这条路由是另一类——密码由人在 TTY 中选择，无回显读取并经确认，位于 service token 之后，并且只在没有任何用户时。所以核心（让账户以已验证状态诞生的三次写入）变成了 `ProvisionarUsuarioUseCase`，而**拒绝留在脚本中**，那才是它所保护的。让安装程序把自己声明为「强制 seed」，会让它越过一条从未谈论过它的规则，并恰恰在拒绝有效的地方放宽它。

**一把密码尺子，而不是两把。** 领域的 `exigirSenhaValida`，由注册所调用的「同一」代码调用——因此这条路由的 DTO **不**重复一个 `@MinLength`：这次调用覆盖策略的「五种」拒绝，而不只是长度。`@MaxLength` 保留，因为它不是策略：它是对 argon2id 的保护，后者在派生之前会复制输入。`PoliticaDeSenhaError` 是领域 `Error`，没有全局过滤器，所以用例把它**转换**为 `400`——否则安装程序会把正确答案「选另一个密码」读成「服务器错误」。在那里转换不触及正常注册。

**认证轨迹中有「自己的」kind。** `first_account_created`，而不是 `register_created`：账户在没有发送任何电子邮件的情况下以已验证状态诞生，事后审计的人需要看到这一点被写下来，而不是凭旁边缺少 `email_verified` 来推断。TypeScript 中是封闭联合，数据库中是 `text` 列——新的 kind 不需要迁移。

**没有 `GET`。** 「存在任何用户吗？」是没有人需要从外部提出的问题：`POST` 回应 `201` 或 `409`，`409` 本身就是答案。一个读取路由会以多一个暴露面的方式发布同一事实，而它的回应正是扫描器想要的那个信号。

**新的暴露面是已声明的，而不是隐藏的。** 开始存在第二条在「生产」中有效的用户创建路径。它在三个独立的维度上都很窄（第一个账户、内部路由、service token），一旦安装有了人就消失。它写在 [`security-surface.md`](../../security-surface.md)、ADR 的 Consequences 以及这里。

**一个已声明、未关闭的窗口。** 「存在任何用户」的检查在事务「之内」运行，但 `READ COMMITTED` 并不阻止两个电子邮件不同的并发调用同时通过。关闭它需要针对「行不存在」的咨询锁，而这不是约束所在之处：能到达这条路由的人已经拥有 service token，也就是说已经控制了整个安装。这个条件阻止的是这条路由「成为」永久的账户创建暴露面，而这一点它做到了。

**依 ADR 决定「未」纳入的：** 公开的第一个 owner 路由；由代码生成或默认的密码（密码绝不被记录——不在 `.env` 中，不在标记中，也不在日志中）；自行开启的 SMTP（`MAIL_TRANSPORT=log` 仍是已声明的默认值）；LLM 凭据（属于要花钱的人，[RN-058](../api.md#rn-058)）；以及对正常注册的任何改动。

- **代码：** `apps/api/src/application/use-cases/auth/criar-primeira-conta.use-case.ts`
  （对有人安装的拒绝、密码尺子、个人 workspace 以及事件），`apps/api/src/application/use-cases/auth/provisionar-usuario.use-case.ts`
  （抽取出的核心，没有生产拒绝），
  `apps/api/src/scripts/provisionar-usuario.ts`（只有拒绝，加上委托），`apps/api/src/interfaces/http/internal/internal-first-account.controller.ts`，
  `apps/api/src/interfaces/http/internal/dto/first-account-internal.dto.ts` 和
  `…/first-account-internal.response.dto.ts`，
  `apps/api/src/application/ports/user-repository.port.ts` 和
  `apps/api/src/infrastructure/persistence/drizzle/user.repository.ts`
  （`existeAlgumUsuario`），`apps/api/src/domain/auth/auth-event.ts`
  （`first_account_created`），
  `apps/api/src/domain/auth/password-policy.ts`（「未改动」——这是复用的尺子）
- **测试：** `apps/api/test/application/use-cases/auth/criar-primeira-conta.use-case.spec.ts`
  （已验证账户和个人 workspace 的正常路径、自己的 kind、有人安装时的 `409`、因长度的 `400` 和因「非」长度原因的 `400`，以及名称的回退）；
  `apps/api/test/interfaces/http/internal/internal-first-account.controller.spec.ts`
  （转交给用例、缺失的 `nome` 变成 `null`，以及守卫的三种拒绝：缺少请求头、令牌错误、令牌正确）；
  `apps/api/test/scripts/provisionar-usuario.spec.ts`（生产拒绝「留在」脚本中，以及委托）；
  `apps/api/test/interfaces/route-surface.spec.ts`（路由的分类）
- **ADR：** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md)，它依赖 [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)

## `install.sh` 完成安装（RN-547，FASE 30）

<a id="rn-547"></a>

### RN-547 — 安装程序创建第一个账户、登记本机的密钥并把代理作为服务启动——中途失败的东西会被「报告」，绝不撤销，也绝不吞掉 {#rn-547}

[FASE 30](../../explanation/fase-30-runner-por-maquina.md) 的第 6 次会话，由 [ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md) 决定。这次会话会同时触及三个 workspace，因此被**分成三次**：代理和 api 的两块已经关闭（[RN-546](#rn-546)、[RN-551](../runner.md#rn-551)、[RN-552](../api.md#rn-552)，基于 [RN-545](../runner.md#rn-545) 的 unit），这里剩下的是作为**编排者、仅此而已**的 `install.sh`——`apps/` 中没有改动任何一行，也没有诞生任何路由。

**它填补的漏洞。** 一个新安装以「Pronto」结束，带着一个「没有人」能通过的登录：生成的 `.env` 没有任何电子邮件变量，`MAIL_TRANSPORT` 落入默认值 `log`，而正常注册要求验证电子邮件。唯一的出路是从 `docker compose logs api` 中捞出链接。而本地代理在没有凭据的情况下被安装，等待有人回到浏览器去配对一个文件夹。

**链条，每一环都已存在。** `POST /internal/first-account`（[RN-546](#rn-546)）→ `brabo-runner device-key create`（[RN-551](../runner.md#rn-551)）→
`POST /internal/machine-device-keys`（[RN-552](../api.md#rn-552)）→ `device-key finish
--id <id>` → `brabo-runner service install --machine`（[RN-545](../runner.md#rn-545)）。api 在登记中返回的 `id` 就是成为私钥 `kid` 的那个，整条链只是「转交」它——没有人从别的东西推导它（[RN-475](../web.md#rn-475)）。服务的 `--dir` 取自 `finish` 打印的「路径」，而不是脚本对配置文件夹位置的第二次计算。

**中间某一环失败时会发生什么：什么都不撤销，一切都被「报告」，脚本总是以 0 退出。** 这是本次交付的决定，论点是已完成的环节本身就有用——账户创建了，人就能进入；密钥登记了，机器就配对了；而服务是她唯一需要用脚本打印的一条命令手动重复的步骤。撤销需要删除账户和吊销密钥，而没有这样的路由，也不应该有一个安装程序会自行调用的路由。代价是一次安装可能只完成一半；它绝不会做的是「静默地」只完成一半——每个失败都变成最后的 **「O que ficou pendente」** 块中点名的一行，就在安装者还在看的地方。因为最后一步而推倒整个安装，就是用零个安装换半个。

**幂等性就是 HTTP 状态码，`409` 不是失败。** 当安装已有人时，两个路由都回应 `409`——第二次执行，或一次其恢复带回了用户的迁移（[RN-530](../infra.md#rn-530)）。这是「预期」的结果：这一步说明原因后保持沉默，**不**进入待办。任何其他状态码都是失败，并附上状态码和 api 的回应。`000`——没能和 api 对话的 curl——出于同样原因有自己的处理：把它与回应码坍缩，会把「api 没起来」读成「api 拒绝了」。而代理那一步只在「本次」执行创建了账户时运行：已有用户时，登记机器密钥就会为一个在这一轮中什么都没要求的人铸造持久凭据。

**密码不碰磁盘也不碰 `argv`。** 在 TTY 中无回显读取（`stty -echo`，终端模式在结束时恢复），经确认后通过 `curl` 的 **STDIN** 发送给 api——绝不通过命令行上的 `--data`，`/proc/<pid>/cmdline` 会把它公开给机器上的任何用户，也绝不通过文件。带有 `BRABO_SERVICE_TOKEN` 的请求头放在模式为 600 的 `--config` 中，随后删除：它也是密钥，而这个密钥已经以同样的模式住在磁盘上的 `.env` 中。机器上没有 `stty` 时这一步会被**拒绝**，绝不降级为带回显的询问——承诺无回显却交付有回显，比不问更糟。密码不进入 `.env`、不进入标记、也不进入任何日志；标记获得的是**电子邮件**，它用于识别而不是秘密，`MARCADOR_SCHEMA` 随该字段升到 **3**，与它获得 `versao` 时升到 2 的尺子相同。

**密码拒绝可以重复，上限是 3。** 策略是领域的（[RN-546](#rn-546)），与正常注册相同，只有在 POST 「之后」才知道。在那里中止安装会让某人的 compose 处于运行状态，而第二次执行落入迁移路径——所以循环是「询问+回答」这一对的，耗尽上限变成点名的待办而不是拒绝。与确认不一致的密码根本不会离开机器。输入中的制表符会被**拒绝**，绝不静默删除：一个改写密码的安装程序会产生一个密码不是本人所输入的账户。

**`service install --machine` 的拒绝在开发者机器上是「常见」情况，它会带着自己的原话到来。** 当安装了按「项目」的 unit 时，`install --machine` 拒绝，没有 `--force`（[RN-545](../runner.md#rn-545)：*"instalar e avisar deixaria a instalação errada de pé"*）。安装程序「完整」转发 CLI 的输出而不是概括它——正是它点名了找到的每个 unit 的 `uninstall`，那就是要做的动作——而待办携带之后重复的确切命令。

**密钥的 `name` 是 `hostname`，这是本脚本的选择。** [RN-551](../runner.md#rn-551) 以书面形式声明 CLI **不**命名：`name` 是登记的字段，命名的是登记的一方。打开设备密钥列表的人需要知道要去「哪台」机器，而 hostname 是人已经用来称呼自己机器的名字——就是 shell 提示符显示的那个。它不是秘密，不唯一，api 不从它推导任何东西。引号和反斜杠被去掉（它们会在 JSON 中错位），截断为 80（DTO 的 `@MaxLength(80)`，在这里应用，免得拒绝来自 api），完全没有 `hostname` 和 `uname` 时返回一个固定名称——空值会在账户已经存在之后因 `@MinLength(1)` 变成 `400`。

**登记未完成时剩下的 `.parcial` 「留在」原处，并被点名。** `create` 把私钥写入一个带 `.parcial` 后缀的文件，runner 按构造会忽略它（[RN-551](../runner.md#rn-551)），如果登记失败，它就会剩下。删除它就是安装程序认定自己知道某件它并不知道的事：api 写入之后的超时与之前的超时无法区分，而这个文件可能是一把已登记密钥私有一半的唯一副本。它是惰性的，下一次 `device-key create` 会点名并替换它，消息说明这两点。

**这个脚本「不」做的事，现在说对了。** 输出的最后一行在这些函数存在数月之后仍宣布它 *"não pareia o agente
local"*，密钥 *"continua vindo da tela do projeto"*。文字已重写：SMTP 仍出于决定保持关闭（`MAIL_TRANSPORT=log`，这里和生产一样——而创建的账户正因如此以已验证状态诞生），LLM 凭据仍属于要花钱的人（[RN-058](../api.md#rn-058)），而通过项目界面配对（[ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md)）仍为想要的人存在——变化在于它不再是必需的。`--help` 在一个没有任何测试到达的地方也有同样的缺陷（它打印的是「文件头」，那是注释，而禁止谈论「阶段会话」的规则只读取代码行）：它说 *"ESTA VERSÃO NÃO
INSTALA NADA"*。已更正，静默截断它的固定行区间改为「直到第一个非注释行」。

**「未」纳入的：** 任何种类的新路由（这次会话是编排——如果另一边缺了什么，该做的是停下并报告）；SMTP；LLM 凭据；在任何地方写入密码；以及任何没有 TTY 就创建账户的路径——没有交互终端时，脚本在已有的那一步、在任何写入之前报告并**以 0 退出**。

- **代码：** `install.sh:1835`（`fechar_a_instalacao`，串联以及「总是 0」）、`:1634`（`perguntar_e_criar_a_conta`，同意、循环和上限）、`:1734`（`parear_esta_maquina`，`id` 变成 `--id`）、`:1811`
  （`subir_o_agente_como_servico`，完整转发的拒绝）、`:1537`
  （`post_interno`，通过 stdin 的请求体和通过 600 `--config` 的请求头）、
  `:1578`（`criar_primeira_conta`）和 `:1597`（`registrar_chave_de_maquina`）——两个路由的裁决——、`:1612`（`ler_sem_eco`）、`:1516`
  （`nome_da_maquina`）、`:1798`（`avisar_chave_parcial`）、`:1208`/`:1215`
  （`escapar_json`/`sem_controle`）、`:109`（`MARCADOR_SCHEMA=4`，AT-738）、`:1871`（调用，位于 runner 之后、标记之前）、`:1882`（`ownerEmail`）。行号在 9月18日（AT-096）、9月27日（AT-065，在 `instalar_o_runner` 中加入了 Mac Intel 分支）和 10月1日（AT-122）按符号重新读取；`:966`/`:682` 在 9月17日就已对不上
- **测试：** `scripts/dev/install-fechamento.spec.ts`——「真正」运行的 shell 函数（整个脚本以 `source` 加载，只去掉 `main` 的调用），针对真实的 `node:http` 服务器和一个替身 `brabo-runner`：账户的正常路径（请求体、service token 和密码到达）、`409`/`400`/
  `500`/无回应各有「不同」裁决、密码循环和 3 次上限、`create → registrar → finish → service install` 的顺序且 `--id` 是 api 的 `id`、`service install` 的拒绝带着原话被转发、登记失败时留下的 `.parcial`、拒绝且什么都没登记的 `create`，以及没有代理二进制时的收尾；`scripts/dev/install.spec.ts`
  （可打印的计划，以及不再撒谎的 `--help`）
- **已「声明」的缺口：** 在干净机器上的端到端安装——真实的 compose、真实的 api、真实的 runner 二进制、写入的 unit 以及等待第一个项目的代理——是本阶段第 8 次会话的 **E2E**，只有它能证明。这里 `brabo-runner` 是 shell 替身，api 是测试服务器；证明的是「串联」，绝不是集成。而 `install.sh` 的主流程（对照已签名的 `checksums.txt` 校验自身来源）仍没有覆盖，原因是 `install.spec.ts` 已经记录的：在下一个正式 tag 之前，没有任何 Release 有这个资产
- **ADR：** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md)
- **来源：** FASE 30，第 6 次会话——
  [阶段的范围划定](../../explanation/fase-30-runner-por-maquina.md)

## WORKSPACE upsert 中的自我变动上限，以及被关闭的自我提升（RN-557）

<a id="rn-557"></a>

### RN-557 — 在两个关联路由中、两个方向上改变「自己」的角色都以 403 被拒绝 {#rn-557}

> **由 [RN-615](../api.md#rn-615) 扩展（ADR 0173）：** 下文说不存在的 workspace 成员移除路由开始存在，带有「同一个」上限（移除自己是 403）——正是这一条款在不计数的情况下守住最后一个 owner。下面关于上限 1 的推理仍然有效。

由 [RN-472](../api.md#rn-472) 开启、[RN-556](../api.md#rn-556) 延续的这条线上的第三道也是最后一道门。[ADR 0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md) 以书面形式声明了它——*"`POST workspaces/:workspaceId/members` continua um
upsert sem teto nenhum — mesma classe de defeito, escopo acima"*——[ADR 0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md) 将其重申为「不同的范围，单独的决定」。这是 `BRB-002`，安全 P1。

**缺陷，已测量。** `AddWorkspaceMemberUseCase.execute` 接收 `(workspaceId, userId, role)` 并调用 `workspaces.addMember`——**不接收执行者**——，而 controller（`@Post(':workspaceId/members')`，`@RequireRole('owner')`）以纯请求体调用，没有 `@CurrentUser()`。根本没有可以用来施加任何上限的东西。

**为什么在上一层范围更严重。** 项目中存在的两样东西这里不存在：(a) **没有更高的层级来接住下落**——在项目中，自我降级会把有效角色降到 workspace 角色，而它常常能接住；在 workspace 中角色就是角色，一个把自己写成 `viewer` 的 `owner` 会失去整个 workspace，连同所有项目以及邀请能恢复它的人的能力；(b) **不存在成员移除路由**——`WorkspacesController` 没有成员的 `@Delete`（已测量，ADR 0156 已用过这一事实）。撤销就是这同一个路由，而它要求刚刚放弃的 `owner`。

**自我「提升」曾是漏洞，现在关闭。** ADR 0127 在 Consequences 中记录了它会保留：*"Um `maintainer` pode se gravar como `owner` do projeto (…) os
tetos são sobre descer"*。本 RN **修订**这句话。两半是同一个动作——一个人独自决定自己拥有什么权威——而向上的那一半是唯一**升级权限**的：ADR 0127 可以说它的上限不是关于升级的（「没有人获得原本没有的角色」），而对提升而言这是假的。

| 动作 | 结果 |
|---|---|
| 在「项目」中改变自己的角色，向下 | **403**——[RN-472](../api.md#rn-472)，不变 |
| 在「项目」中改变自己的角色，向上 | **403**——原本允许，这就是变化之处 |
| 在「WORKSPACE」中改变自己的角色，任何方向 | **403**——新的那道门 |
| 用「相同」的值重写自己的角色 | 通过——幂等的 upsert 不是变动 |
| 一个 `owner` 在 workspace 中降级「另一个」`owner` | 通过——这是撤销所有权的唯一方式 |
| 在任何范围内关联/降级「另一个人」 | 通过——一直以来的正当能力 |
| 通过「移除」项目行实现自我提升 | 通过——受 ADR 0156 第 3 点保护 |

**上限「不」计数 owner。** 只在调用者是最后一个所有者时才拒绝，这一做法被考虑过，并按 ADR 0127 的字面标准被拒绝：*"se enuncia numa
cláusula, não tem número para envelhecer"*。计数会增加一次可能与写入不同步的读取，必须判断一个不活跃的第二所有者算不算，还会让同一请求体的同一调用今天通过、明天被拒绝，而调用者能控制的东西一样都没变。而该条款**已经产生了计数本该保证的不变量**：workspace 永远不会没有 `owner`，因为移除最后一个需要他自己来做。

**上限 1 在这个范围内没有对应项，这是考虑后的结果，不是照搬。** 与移除（[RN-556](../api.md#rn-556)）不同，这里这个动作「存在」——一个 `owner` 可以降级另一个。拒绝的原因在于上限 1 是关于**层级倒置**的规则：在项目中，项目行覆盖 workspace 的行（[RN-471](../web.md#rn-471)），一个 `maintainer` 能够到比他「更高」的人；在 workspace 中，`@RequireRole('owner')` 已经保证没有人能够到比自己更大的人——前提条件不存在。加上对应项，再加上没有移除路由，会让 `owner` 成为一个**吸收态**：没有人能通过 HTTP 离开它，离职、所有权轮换以及纠正错误邀请都会变得需要直接写数据库——这正是 ADR 0127 生来要消除的那类状态，只是符号反了。

**尺子不被复制：比较变成「一个」分类器。**
`autoMovimentoDoProprioPapel` 返回「方向」（`'rebaixamento' | 'promocao' | null`）而不是布尔值，因为调用方需要它来选择消息。`ehAutoRebaixamento` 继续作为分类器的一种「读取」存在，这是出于行为原因而不是兼容性：`remocaoEhAutoRebaixamento` 委托给它，而放宽它会让「移除」也拒绝自我提升——移除限制着某人的自己那一行，恰恰是撤销上限 1 阻止创建的那种限制的方式，这一动作被 ADR 0156 以书面形式保护。

**四条消息，按「方向」和「范围」各一条。** 试图提升自己的人不会收到降级的语句（那不是他做的事），碰到 workspace 上限的人也不会被告知去找 `maintainer`——在那里能撤销的角色是 `owner`。与 [RN-556](../api.md#rn-556) 第 5 点以及 [RN-470](../web.md#rn-470) 相同的纪律。

**执行者的角色来自仓储，而不是 `ResolveEffectiveRoleUseCase`**——与 RN-556 的选择相反，原因与它给出的相同：在项目用例中引入另一个，是为了不让执行者的角色变成手写的第二个 `projectRole ?? workspaceRole` 组合；在 workspace 中没有需要保护的组合（`forWorkspace` 「就是」`workspaces.findMemberRole`），而这个用例手里已经有仓储。

**workspace 中「提升」那一半通过 HTTP 无法到达，但照样施加。** 在 `@RequireRole('owner')` 下，执行者已在顶端，无处可升。它被加入并测试，原因与上限 2 一直不设阈值的原因相同：用例不假设守卫的存在，路由改变最低角色的那天，正确的就是它。与 [RN-514](../engine.md#rn-514) 按能力的拒绝相同的设计，在有触发之前就已实现。

**web 一行都不变，这不是遗漏：** `POST /workspaces/:workspaceId/members` 在 `apps/web` 中没有调用方——已测量；唯一的出现是 `api-types.generated.ts` 中生成的类型。没有要调整的 toast，也没有要关闭的 `Select`。

- **代码：** `apps/api/src/domain/iam/tetos-de-rebaixamento.ts`
  （`autoMovimentoDoProprioPapel`、类型 `SentidoDoAutoMovimento`、三条新消息，以及成为分类器读取的 `ehAutoRebaixamento`），
  `apps/api/src/application/use-cases/iam/add-workspace-member.use-case.ts`
  （带 `atorId` 的签名、执行者角色的读取以及两个 403），
  `apps/api/src/application/use-cases/iam/add-project-member.use-case.ts`
  （把 `ehAutoRebaixamento` 换成分类器，这正是关闭那里自我提升的东西），
  `apps/api/src/interfaces/http/iam/workspaces.controller.ts`
  （`@CurrentUser()`、`@ApiForbiddenResponse` 以及描述），
  `apps/api/src/interfaces/http/iam/dto/add-member.dto.ts` 和
  `apps/api/src/interfaces/http/iam/projects.controller.ts`（曾承诺「sem teto nenhum」和「downgrading yourself」的描述），
  `apps/api/src/db/seed.ts`（以 `owner.id` 作为执行者），
  `apps/api/src/application/use-cases/iam/resolve-effective-role.use-case.ts`
  （「未改动」，连续第三个 ADR）
- **测试：** `apps/api/test/application/use-cases/iam/tetos-de-rebaixamento.use-case.spec.ts`，
  块 *"Teto de auto-movimento no WORKSPACE — a quarta porta"*（存在另一所有者时的拒绝、唯一所有者的拒绝、无法到达的提升、按范围的消息、幂等 upsert、`owner` 降级另一个 `owner` 以及第三方的关联），以及上限 2 块中的三个用例——自我提升的测试「反转」过来、名称保留来源，每个方向有自己语句的断言，以及项目中的幂等 upsert
- **ADR：** [0157](../../adr/0157-teto-de-auto-movimento-no-upsert-de-workspace.md)，它引用 [0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md) 和 [0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md)，并修订前者关于自我提升的那句话
- **来源：** `BRB-002`，维护者登记表中的安全 P1——前两个 ADR 留下声明的最后一个动作

---

## 设备密钥获得界面，界面说明吊销的范围（RN-561）

<a id="rn-570"></a>

### RN-570 — 安装程序只用 Release 签过名的文件来启动安装，并在询问或写入任何东西之前核对它们 {#rn-570}

[RN-549](../ci.md#rn-549) 在安装程序第一次于干净机器上运行时测得，已发布的 `install.sh` **无法独自启动任何东西**：它调用 `docker compose -f docker/docker-compose.install.yml`，这是相对于其运行目录的「相对」路径，而这个文件不是 Release 的资产，不进入已签名的 `checksums.txt`，也不在任何地方被下载。按 runbook 的一行命令操作的人，会在脚本写入带密钥的 `.env` 「之后」死于 *"no such file or directory"*。维护者于 2026-09-13 决定了出路——签名的资产，而不是克隆（[ADR 0160](../../adr/0160-o-compose-do-instalador-viaja-assinado.md)）。

**规则：**

1. **四个文件随安装程序一起传输，在「同一个」清单中。** 安装 compose 以及安装通过相对路径使用的三个文件——compose bind-mount 的 `postgres/init.sql` 和 `ollama/pull-models.sh`，以及迁移（[RN-530](../infra.md#rn-530)）执行的 `backup/test-restore-compose.sh`——由 `checksums` 作业作为 `brabo-install-*` 资产发布，并进入生成已签名 `checksums.txt` 的 `sha256sum`。第四个不在 E2E 的变通办法中，是在实现时发现的：在没有检出的文件夹中，迁移会死在那里。作业在附加之前对照文件核对清单的每一行（`sha256sum -c --strict`）。
2. **表有两面和一个守卫。** 发布方读取 `scripts/ci/assets-do-instalador.ts`；下载方读取 `install.sh` 中 `destino_do_asset_do_instalador` 的 `case`（bash 3.2，没有 Node）。spec 在两者分歧时失败，「并且」从 compose 推导出每个不在表中的 `./…` bind-mount——这正是缺陷诞生的方式。
3. **校验紧随自身来源之后，并先于一切。** 安装程序下载这四个文件，并以名称「完全」相等的方式，对照 `verificar_a_si_mesmo` 已校验过的 `checksums.txt`（绝不是第二次下载）比较每个 sha256。三种拒绝各不相同——资产未发布、清单不覆盖它、哈希不匹配——并且都在机器未被触碰的情况下发生。
4. **绝不落回相对路径。** `COMPOSE_DE_INSTALACAO` 初始为「空」，只有当已校验的副本被放到安装文件夹下时——在首次需要它们的那一刻（迁移或启动）——才获得绝对路径。已经在那里的东西会被「替换」，绝不读取——在 `cp` 之前先 `rm`，这样 symlink 就不会把写入带到外面。

**本规则「不」关闭的：** 端到端的证明只在合并后的第一个正式 tag 中发生——`install-e2e.yml` 不在 PR 中运行（ADR 0150）——，已发布的 Release 也不会获得这些资产：它们继续使用旧安装程序，以及在 tag 的检出中运行它的变通办法。ADR 0160 声明的相邻问题——`test-restore-compose.sh` 调用 Compose 时不带 `--env-file`，而 Compose 在 compose 的文件夹中查找 `.env`——在 AT-102 中关闭：安装程序传入 `BRABO_ENV_FILE`（`--env-file`，而不是 `--project-directory`，后者还会改变项目名和相对路径的基准），安装 compose 声明了 `backup` 服务引用的 `backup_local` 卷，它的缺失会在开启 profile 时拒绝整个文件。由 `scripts/dev/prova-de-restauracao-env.spec.ts` 覆盖。

- **代码：** `install.sh:129`（实体化之前为空的 `COMPOSE_DE_INSTALACAO`）、
  `:587`（`ASSETS_DO_INSTALADOR`）、`:589`（`destino_do_asset_do_instalador`，下载方的表）、`:614`（`baixar_e_verificar_os_arquivos_da_instalacao`）、
  `:607`/`:615`/`:617`（三种拒绝）、`:648`
  （`materializar_os_arquivos_da_instalacao`）、`:1573`（迁移在备份之前实体化）、`:1677`（紧随自身来源之后的校验）、
  `:1831`（启动在 `up` 之前实体化）；
  `scripts/ci/assets-do-instalador.ts:55`（发布方的表）、`:93`
  （`problemasDoMapeamento`）、`:135`（`prepararAssets`）；
  `.github/workflows/build-runner-binaries.yml:468`（从 tag 的检出准备的资产）、`:494`（在同一个 `sha256sum` 中）、`:520`（`--strict` 核对）、`:527`（与清单一起附加）
- **测试：** `scripts/dev/install-arquivos-da-instalacao.spec.ts:144`（针对假 Release 的正常路径）、`:162`（资产缺失，`.env` 从未写入——失败用例）、`:179`（哈希不匹配——失败用例）、`:191`
  （不覆盖的清单）、`:202`（相似的名称不算覆盖）、`:217`
  （未校验就实体化是拒绝）、`:225`（已有的被替换，symlink 不会把写入带到外面）、`:258`/`:273`/`:280`（`main` 和迁移中的顺序）；`scripts/ci/assets-do-instalador.spec.ts:89`（每个相对 bind-mount 都是资产）、`:114`（shell 的 `case` 就是 TypeScript 的表）、`:148`/`:152`/`:161`（流水线签名、核对并附加）；
  `scripts/dev/install-e2e.spec.ts:247`（手工变通办法不会回来，E2E 断言安装程序下载了它们）、`:295`（下载清单的令牌不在安装程序的环境中）
- **来源：** AT-026——AT-008 的发现（RN-549），由维护者于 2026-09-13 决定

## 安装中的容器 broker，经同意开启（RN-575）

<a id="rn-575"></a>

### RN-575 — 安装程序只在键入「s」后才开启容器 broker，从容器内部测量 socket 的组，四行要么一起写入要么都不写 {#rn-575}

在通过 Release 的安装中，`container` 或 `mounted` 项目从未执行过：启动这两种模式容器的是 broker（[ADR 0144](../../adr/0144-a-segunda-raiz-do-broker.md)），而安装中没有这个服务，因为镜像未发布（ADR 0150，决定 7）。[ADR 0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md) 将该镜像作为第五个发布，并把服务放进安装 compose，默认「关闭」；本规则决定它何时开启，因为开启意味着把机器的 Docker socket 交给安装中的一个服务。

**规则：**

1. **只有键入的「s」/「sim」才会开启。** 问题出现在基目录之后（broker 的第二个根由它推导）、`.env` 之前，并以文字「说明」它授予了什么——这台机器的 Docker socket，以及控制 broker 的人就控制了 Docker——以及是什么约束着它。回车、任何其他回答以及没有终端都会保持关闭，而没有终端这一点会被「说明」，绝不静默决定。在回答不是「是」之前，Docker 不会被触碰。
2. **socket 的组是从容器「内部」测量的**，使用 broker 自己的镜像，没有网络，根文件系统只读，socket 通过 `--mount type=bind` 挂载——它会拒绝不存在的源，而不是像 `-v` 那样在宿主机上创建一个文件夹。`group_add` 需要的是从内部看到的 gid（在 Docker Desktop 中宿主机的 gid 说明不了任何东西）。测量失败、路径不是 socket 或 gid 不是数字，都是点名的「拒绝」，并指导以回答「否」重新运行——绝不使用 compose 默认值中的 `999`。
3. **四行一起写入，否则都不写：** `COMPOSE_PROFILES=container-broker`、
   `BROKER_URL=http://broker:8090`、`DOCKER_GID` 和 `PROJECT_WORKSPACES_HOST_ROOT`。有 profile 没有 URL 会启动一个没人调用的 broker；有 URL 没有 profile 会让 api 指向一个不会启动的服务。`escrever_env` 拒绝在没有测量到 gid 的情况下写入这一块——这是脚本的缺陷，不是机器的。`BRABO_BROKER_IMAGE` 「总是」写入，无论是否开启：Compose 在按 profile 过滤之前会插值整个文件。
4. **托管文件夹的根先「计算」再「核对」。** 启动前为 `<DockerRootDir>/volumes/brabo_project_workspaces/_data`；之后与卷的 `Mountpoint` 比较。不一致，或 api 无法通过内部网络到达 broker，会在最后变成点名的「待办」——绝不是拒绝，那会因为一个编辑 `.env` 就能修复的步骤而推倒一个已在运行的安装。
5. **决定出现在最终摘要中**，两个方向都有，而说明安装程序「不」做什么的语句不再说只有挂载文件夹没有容器：`container` 也没有。

**本规则「不」关闭的：** `DOCKER_GID` 和计算出的根没有在 macOS 的 Docker Desktop 上测量过，tag 的 E2E 只在 Linux 上运行交互式那一半。Rootless 或远程 Docker 的 socket 不在 `/var/run/docker.sock`，而那是 compose 挂载的路径，会落入第 2 项的拒绝——在那里开启 broker 不通过其他路径提供。

- **代码：** `install.sh:1196`（`consentir_broker`）、`:1148`
  （`medir_gid_do_socket`）、`:1183`（`calcular_raiz_gerenciada`）、`:1320`
  （`conferir_o_broker`）、`:792`（`escrever_env_do_broker`）、`:855`（清单中的 broker）、`:1812`（顺序：基目录之后、`.env` 之前）；
  `docker/docker-compose.install.yml`（`broker` 服务和 `broker` 网络）
- **测试：** `scripts/dev/install-broker.spec.ts:158`（没有终端：关闭、说明、Docker 未被触碰——失败用例）、`:169`（回车）、`:179`（`n`）、`:187`
  （`s` 开启，带 `--mount` 且没有网络）、`:208`/`:221`/`:229`（三种拒绝）、
  `:237`（作为待办的根）、`:248`（最终语句）；
  `scripts/dev/install-env.spec.ts:250`/`:259`（四行一起或都没有）、`:270`（gid 的守卫）、`:291`/`:307`（`.env` 对照 Compose 的解析器：broker 不带标志就启动，带令牌、两个根和 gid，api 指向它——或者这些都没有）；`scripts/dev/composes-em-conformidade.spec.ts:114`
  （传输的文件中的 ADR 0130 各层）
- **ADR：** [0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md)
- **来源：** AT-097——由维护者于 2026-09-18 决定

---

## 安装程序提供本地模型，并且不把 dev 环境误认为一次安装（RN-691，RN-692）

<a id="rn-691"></a>

### RN-691 — `install.sh`「询问」是否开启本地模型（profile `llm`），在写入前测量 Ollama 的端口，并组成「一行」`COMPOSE_PROFILES` {#rn-691}

在 v7.0.0 的一次真实安装中测得（AT-351）：每条业务规则都写入 `backlog.semantic_duplicate_check_skipped`，带 `getaddrinfo EAI_AGAIN ollama`，因为通过 Release 的安装启动时没有 profile `llm`，而安装程序从不询问；手动开启它会在 11434 上遇到 `address already in use`，那是宿主机上「原生」Ollama 的端口。

**规则：** 在 broker 的问题（[RN-575](#rn-575)）之后，安装程序说明「成本」（镜像和 `ollama-model-loader` 下载的模型所占磁盘、加载模型时的 RAM）以及没有它会「失去」什么（[RN-681](../api.md#rn-681) 的语义重复检查和供 agent 使用的本地模型），只有输入「s」才开启；没有终端时保持关闭并「说明」这一点。开启会在写入任何东西之前「测量」宿主机端口——11434，或直到 11443 的第一个空闲端口，通过 bash 自身的 `/dev/tcp`（包括 3.2）——整个范围都被占用时是「命名」的拒绝，不写入任何东西，绝不是启动时的 `address already in use`。`.env` 获得 `OLLAMA_PORT` 和 profile `llm`；同意的 profiles 放在「唯一一行」`COMPOSE_PROFILES` 中（`container-broker,llm`），因为两行不会相加——最后一行会胜出，broker 会静默消失。

已声明排除在外的：会话「一次」说明语义检查被跳过（api 那一侧，另一条战线）；tag 的 E2E 回答「否」（开启会下载数 GB 的模型），因此带 profile `llm` 的启动没有端到端证明。

- **位置：** `install.sh:1274`（`consentir_llm`），`:1259`
  （`escolher_porta_do_ollama`），`:1249`（`porta_em_uso`），`:800`
  （`escrever_env_do_llm`），`:821`（`escrever_env_dos_profiles`）
- **测试：** `scripts/dev/install-llm.spec.ts`（没有终端时保持关闭并说明成本；11434 被占用时选择下一个；整个范围被占用时失败——失败情形；一个正在监听的服务器被测为已占用；broker 和模型在同一行）；`scripts/dev/install-e2e.spec.ts`（新问题的回答在 TTY 驱动的列表中，顺序正确）
- **来源：** AT-351

<a id="rn-692"></a>

### RN-692 — 只有 compose 项目 `brabo` 才是之前的安装，迁移在备份得到证明后提供「从零」重新安装 {#rn-692}

`detectar_por_sinais` 匹配 `"Name":"brabo[^"]*"`，于是 DEV 的 compose（`brabo-dev`，ADR 0170）被算作之前的安装——安装程序会提议迁移开发环境。现在只匹配「精确」名称 `brabo`。

迁移的确认增加了第三种回答：`z` 「从零」重新安装。ADR 0150 的顺序不变——备份、「证明」、询问、删除、安装——但旧数据「不」恢复：经证明的备份留在文件夹中，之后恢复它是 runbook 的 `#restore`。`s` 是恢复——并且自 [RN-998](#rn-998) 起，恢复**全部**：Postgres 恢复到一个新创建的空库中，再恢复 git 仓库，并重新投影图谱和制品；在此之前回来的只有 git 仓库。Enter 仍不删除任何东西。

同时，收尾不再说通过项目界面配对文件夹「continua existindo (ADR 0118)」：该流程已在 ADR 0203 中移除（[RN-687](../web.md#rn-687)）。

- **位置：** `install.sh:440`（`detectar_por_sinais`），`:1918`
  （`migrar_instalacao_anterior`）
- **测试：** `scripts/dev/install-llm.spec.ts`（`brabo-dev` 不算而 `brabo` 算；`z` 在证明之后删除并让 `MIGRAR_DE` 为空；Enter 不删除——失败情形；ADR 0118 的句子不再回来）
- **来源：** AT-358

## 安装程序的迁移把之前的整个安装带回来（RN-998）

<a id="rn-998"></a>

### RN-998 — 迁移把数据库恢复到空库中，保留主密钥，可恢复，并理解版本线 {#rn-998}

第一次真实的迁移，从 7.0.0 到产品 1.0.0（AT-710），启动了一个空的安装，且凭据不可读。
[ADR 0256](../../adr/0256-a-migracao-restaura-o-banco-num-banco-vazio.md)
关闭了 AT-738 的发现，规则如下：

1. **Postgres 自行恢复。** 在 `down -v` 之后，安装程序只启动 `postgres`，运行
   `brabo-restore --banco-vazio`（拒绝含有任何表的库），然后才启动其余部分，migrations 叠加在 dump 之上。
   接着是 git 仓库以及图谱和制品的重新投影；失败的重新投影是带命令的待办，绝不是拒绝。
2. **git 以卷所有者的身份恢复**，通过在 api 容器中读取（`stat`）得到，绝不假定：
   备份镜像的 uid 70 无法写入其他所有者的卷，`--user 0:0` 也不行，因为有 `cap_drop`。
3. **加密已恢复数据的密钥来自之前的 `.env`**，至少是 `CREDENTIALS_MASTER_KEY`
   （环境 → 之前的 `.env` → 生成），新 `.env` 未声明的每个键都带着最后的值回来
   （`CREDENTIALS_MASTER_KEY_PREVIOUS`、`ANAMNESE_ENABLED`、`BRABO_BIND`……）。
   安装程序当场决定的键（`COMPOSE_PROFILES`、`BROKER_URL`、`DOCKER_GID`、
   `PROJECT_WORKSPACES_HOST_ROOT`、`OLLAMA_PORT`）以及临时密钥的 `_PREVIOUS` 除外，它们是新生成的。
4. **备份、证明和删除使用迁移的环境运行：** 此版本的五个 `BRABO_*_IMAGE`
   （之前的 `.env` 可能引用已不存在的本地镜像），`BRABO_BACKUP_USER` = 运行者的 uid:gid（文件夹属于他），
   以及 `BRABO_BACKUP_HOST_DIR` = 目的地，让证明恢复的是留在文件夹中的**同一个**备份。
   文件夹以 `0755` 创建，已声明。
5. **迁移可恢复。** 标记（schema 4）在 `down -v` 之后立即写入，带有 `restauracaoPendente`
   （`destino` 和 `etapas`：`banco git grafo artefatos`），并在每个步骤以及新版本启动时再次写入。
   下一次发现待办的执行会**恢复**这次恢复，不再次迁移，也不删除任何东西；备份文件夹缺失是被点名的拒绝。
6. **版本线。** 标记记录 `linha`。没有它，该安装属于上一条线，除非镜像位于
   `ghcr.io/viralabs-dev/`（这条线的 1.0.0 记录的是 schema 3）。线与线之间的关系是 `nova-linha`，
   有自己的措辞且默认为是（[RN-542](parte-01.md#rn-542)）。
7. **下载带重试。** 每次下载都经过 `baixar`（`curl
   --retry 6 --retry-delay 10 --retry-connrefused`）；404 是“Release 不发布”，其余是
   “服务器没有交付，请再运行”——是不同的措辞。

它修订 [RN-530](../infra.md#rn-530)（dump 不再只留在文件夹中）以及 [RN-692](#rn-692) 的 `s` 措辞。

- **位置：** `install.sh:1918`（`migrar_instalacao_anterior`），`:1903`
  （`com_ambiente_do_backup`），`:1993`（`restaurar_o_banco`），`:2009`
  （`restaurar_os_repositorios_git`），`:2025`（`reprojetar`），`:2062`
  （`gravar_marcador`），`:930`（`relacao_com_o_instalado`），`:949`
  （`restauracao_pendente`），`:736`（`gerar_segredos`），`:971`
  （`preservar_do_env_anterior`），`:194`（`baixar`）
- **测试：** `scripts/dev/install-migracao.spec.ts`（每项一个用例，PATH 中带有 `docker`、`curl`
  和假的证明；每项的失败用例——失败的备份不删除，被拒绝的 restore 保持待办，
  无法读取所有者则拒绝，404 ≠ 504）；`scripts/dev/install-fechamento.spec.ts`（schema 4）
- **来源：** AT-738（EP-033），所有者 2026-11-05 的决定
