---
traducao_de: 000a507e4d7d886585f3f731f8a7a5ac4a6e6e52
---

# ADR 0230 — runner 导入用户机器上已有的 LLM API 密钥

## 状态

**已接受。** 2026-10-29（AT-611，EP-026，所有者 29/10 的决定）。主题：`runner`。
补充（不编辑）[0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md)（带 `key_id` 的信封）、
[0154](0154-chave-de-dispositivo-de-maquina.md)（机器设备密钥）和
[0050](0050-credencial-sempre-cifrada-verificacao-explicita.md)（保存与验证是两件事）。

## 背景

已经在使用 Claude Code、Codex、OpenCode、Kilo Code CLI 或 Hermes 的用户，在自己机器的磁盘上有 LLM API 密钥，而现在要在凭据界面里重新输入每一个。api 运行在容器中，够不到这块磁盘；够得到的是
`brabo-runner`。导入是对秘密产生的效应，因此需要对每个密钥的明确同意，绝不能悄悄发生。

## 决定

1. **只导入 API 密钥。** 订阅的 OAuth token（Claude Pro/Max、ChatGPT/Codex、Copilot）
   **不**导入：供应商条款把它绑定到官方客户端，在其他产品中使用会使所有者的账户面临风险。命令会把找到的列为"订阅登录，不可导入——请创建 API 密钥"，并说明原因。
2. **读取仅限交互式 runner**（`brabo-runner credentials import`，必须有 TTY，逐项选择）。api 绝不读取用户的磁盘。
3. **路由 `POST /runner/llm-credentials`**，`@RequirePatAuth()` + `PatAuthGuard`，委托给**同一个** `UpsertUserCredentialUseCase`（带 `key_id` 的信封），写入凭据所属用户。由于该路由没有 `:projectId`，guard 对所有绑定到项目的凭据返回 403；所有 PAT 都属于项目，因此实际上只有**机器**设备密钥可以进入。这是第一个由机器凭据写入用户秘密的路由。
4. **未经确认绝不覆盖：** 该 provider 已有凭据且没有 `substituir: true` 时返回 409 `credencial_existente`，不触碰现有凭据。
5. **值绝不进入日志、URL、事件、异常或响应。** 审计日志带 provider 和 `origem`（工具和路径）；响应为 `{ provider, substituida }`。
6. 该路由只负责保存（ADR 0050）；连接测试是单独的动作
   （`POST /users/me/credentials/:provider/test`），由客户端负责。
7. macOS 的 Keychain 留给单独的一个切片。

## 后果

- 被攻破的机器设备可以写入（并在 `substituir` 时替换）所有者的 LLM 密钥。上限是密钥的撤销（ADR 0201）以及作为默认的 409。
- 导入者在凭据界面看到与任何凭据相同的一行。
- 新的待导入工具是 runner 中的新读取器，不改变路由。
