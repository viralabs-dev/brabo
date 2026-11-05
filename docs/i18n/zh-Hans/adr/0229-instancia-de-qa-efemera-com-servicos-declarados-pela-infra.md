---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0229 — QA 在临时实例中测试，使用 Infra 声明的服务

## 状态

**已接受。** 2026-10-29（AT-612，EP-030；所有者 29/10 的决定）。主题：
`container`。扩展
[0130](0130-broker-de-container.md) 与
[0228](0228-comando-do-app-e-rede-do-container.md)，均不编辑。本 lane 固定
`packages/docker-port` 和 broker 的契约；生命周期（api、engine、环境表）随后实现。

## 背景

QA 运行在**工作**容器中，而 RN-817 会杀掉项目遗留的运行中进程，这会杀掉 ADR 0228 声明的应用。所有者决定：e2e 运行在独立的 QA 容器中，仅在 gate 需要时启动，应用的基础设施（数据库、S3……）放在同一个实例内，由 Infra 而不是我们的目录来决定服务。

## 决定

1. **角色 `qa`。** 带有 `qa: { chave, servicos }` 的 spec 是每个任务一个的临时实例：名称
   `brabo-qa-<workspace_dir_name>-<chave>`（`chave` = 8 个 `[a-z0-9]` 字符，取自 `taskId` 的开头；唯一来源是
   `nomeDoContainerDeQa`），与工作容器相同的镜像、网络、资源、用户和 `/work` bind，**没有** `--restart`，带标签 `brabo.papel=qa` 和
   `brabo.qa.instancia=<chave>`。不接受 `comandoDoApp` 和 `portas`。
   `DockerPort` 仍是五个操作：`stop`、`remove`、`inspect` 和 `exec`
   获得可选参数 `alvo: { papel: 'qa', chave }`。
2. **只处理带标签的。** 有 QA 的 `alvo` 时，适配器按 `brabo.papel=qa` 过滤；没有该角色的同名容器是"非受管"，绝不触碰。
   QA 的移除先删除实例**自己的**服务
   （`brabo.qa.dono=<QA 的名称>`），再删除实例本身；它不受 `container_remove` 绝对上限的约束（所有者的决定），因为它只能触及带 QA 标签的对象。
3. **由 Infra 声明的服务。** `{ nome, imagem, env?, dados?,
   compartilhado? }`，最多 6 个。镜像必须使用 DIGEST（`@sha256:` + 64 个十六进制字符）；`env` 的键为 `[A-Z_][A-Z0-9_]*`（最多 20 个，值不含换行）；`dados` 是 `--tmpfs` 中的路径（最多 3 个）。每个服务以
   `--network container:<qa>`（共用一个 `localhost`）、`--cap-drop ALL`、无特权也无 `--cap-add`、无发布端口、**常量**上限 1 cpu、
   512 MB 和 256 pids、`--tmpfs /tmp`、标签 `brabo.papel=qa` 启动。中途失败会撤销已启动的部分。
4. **共享服务。** `--network container:` 只能把容器连到**一个**命名空间，因此在实例之间共享的服务放不进去。最小设计：它位于项目的 `--internal` 私有网络
   （`brabo-qa-<workspace_dir_name>`）中，服务名作为网络别名，容器
   `brabo-qa-<workspace_dir_name>-svc-<nome>` 带标签
   `brabo.qa.compartilhado=1`，若已运行则复用；每个实例通过 `docker network connect` 连入该网络。需要 `egress` 网络（处于 `none` 的容器无法连接）。谁在何时移除共享服务，是留给 api lane 的开放问题。
5. **Broker。** 封闭路由器中的新路由：
   `/containers/:projectId/qa/:chave/{start,remove,exec}`。服务列表来自 api 的 `container-spec`（`?papel=qa&task=<chave>`），绝不来自请求体；路由中的 chave 必须是 api 返回的那个。

## 后果

- 每个项目可以同时运行两个测试进程，而不触碰工作用的应用。
- 带 `--cap-drop ALL` 和 tmpfs 的官方 Postgres/MinIO，本 lane 中**没有**用真实 Docker 测量过；需要 capability 的镜像会在启动时失败，并给出命名的 `failed`。
- 服务的 pull 必须在 30 秒的控制上限内完成（RN-604），否则命名失败：大镜像第一次无法启动。

## 参考

- [0130](0130-broker-de-container.md)、[0189](0189-o-piloto-automatico.md)、
  [0228](0228-comando-do-app-e-rede-do-container.md)。
- [RN-930](../business-rules/contracts.md#rn-930)。
