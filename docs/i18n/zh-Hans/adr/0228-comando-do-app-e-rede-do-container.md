---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0228 — 项目容器通过声明的命令启动应用，并且仅在 loopback 上发布端口

## 状态

**已接受。** 2026-10-29（AT-610 和 AT-608，EP-030；所有者 29/10 的决定）。
主题：`container`。修订（不编辑）
[0130](0130-broker-de-container.md)（不含网络字段的**封闭** spec）以及
[0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md)（决定 1：
"broker 不发布端口"）。与 [0189](0189-o-piloto-automatico.md) 和
[0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) 并存。
本 lane 固定 `packages/docker-port` 和 broker 的**契约**；api、engine、runner 和 web 随后实现各自的一侧。

## 背景

项目容器以 `sleep infinity` 启动，应用只在 QA 测试期间运行。发布了端口但没有进程监听，就不会显示任何页面，而所有者要求按容器配置端口、DNS 和 `extra_hosts`（AT-608），应用由 Infra 声明（AT-610）。

## 决定

1. **应用命令（`comandoDoApp`，可选）。** 由 Infra 声明
   （`artifact.run_instructions` 中的 `run.app`）；api 通过
   `container-spec` 交付，broker **从不**从请求体读取它。最多 300 个字符，不含 `\n`、`\r` 和 NUL。有它时，`argsDeCriacao` 把 `sleep infinity` 换成一个**常量**监督器（`SUPERVISOR_DO_APP`），命令作为位置**参数**（`$1`，沿用 RN-807 的模式），绝不拼接：应用在后台启动，日志写入 `/tmp/brabo-app.log`，退出码写入 `/tmp/brabo-app.exit`，PID 1 仍是 `sleep infinity`。应用死了就保持死亡。没有该字段时，`docker run` 与现在逐字节相同（有测试证明）。
2. **端口。** `portas: [{ host, container, protocolo: 'tcp' }]`，始终是
   `-p 127.0.0.1:H:C`（接口是适配器的常量，没有选项）。主机端口 1024 到 65535，不得与安装使用的端口冲突（3000、4000、5173、5432、
   7474、7687、8088、8090、11434），最多 10 个，不得重复，网络为 `none` 时拒绝。只有**遏制**的形态改变：`egress` 网络本来就能到达机器上已发布的端口（ADR 0189），而发布仅限 loopback。
3. **DNS 与 `extra_hosts`。** `dns` 是字面 IP v4/v6 列表（最多 3 个）；
   `hostsExtras` 是 `{ nome, ip }`（最多 10 个），名称取自 `[a-z0-9.-]`（最长 253，首尾不能是点/连字符），绝不能是 `localhost` 或安装的服务名，IP 必须是字面 IPv4（IPv6 的 `:` 在 `--add-host` 中有歧义）。网络为 `none` 时同样拒绝。
4. **`inspect`** 开始读取 `NetworkSettings.Ports`，并在**观察到的**状态中返回 `portasPublicadas`；Infra 声明的内容仍是另一列（RN-468）。
5. **`DockerPort` 仍然是五个操作。** 新字段属于 SPEC；不新增任何操作。更改命令、端口、DNS 或 hosts 只对**重建**的容器生效（`start` 是幂等的）；重建动作和审批属于 api 的 lane。
6. **不在本 lane 内：** `runner`（之后在 `join` 中加入能力）、页面、动作 `container_recreate` 和命令的审批——所有者决定：开启自动驾驶则免去点击，没有它时，带 `run.app` 的 Infra PR 需要人工审批。

## 后果

- 0213 中"broker 不发布端口"这句话不再有效；其余仍有效。
- 容器获得一个由产品启动的长期进程，并受任何 `exec` 都有的约束（`--cap-drop ALL`、`--user`、pids/内存）。
- 镜像中缺少 `setsid` 不会阻止应用：监督器退回到直接使用 `sh`。

## 参考

- [0130](0130-broker-de-container.md)、[0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md)、
  [0189](0189-o-piloto-automatico.md)。
- [RN-928](../business-rules/contracts.md#rn-928)、[RN-929](../business-rules/contracts.md#rn-929)。
