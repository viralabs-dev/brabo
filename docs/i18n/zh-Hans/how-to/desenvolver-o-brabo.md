---
id: desenvolver-o-brabo
title: 开发 Brabo
sidebar_label: 开发 Brabo
description: 用 clonar-tudo.sh 克隆 Brabo 的仓库，通过 brabo-infra 启动开发环境，并了解每样东西在哪里。
keywords: [开发, clonar-tudo, brabo-infra, make dev, 工作区, 仓库]
tipo: guia
traducao_de: d1da65c914f6e3a228fceab257ea235aba5d88c5
---

# 开发 Brabo

要**使用** Brabo，请看[快速开始](../getting-started.md)。本指南面向要改代码的人：克隆 11 个仓库，并从它们启动 dev。

## 开始之前

Git、Bash、带 Compose 的 Docker 和约 6 GiB 空闲内存。只有在运行某个仓库的测试时才需要 Node 和 pnpm；Elixir 在容器中运行。

## 1. 克隆全部仓库

`brabo-workspace` 是父文件夹：它只知道每个仓库在哪里。

```bash
git clone https://github.com/viralabs-dev/brabo-workspace.git ~/dev/brabo
cd ~/dev/brabo
./clonar-tudo.sh
```

`clonar-tudo.sh` 通过 HTTPS 克隆每个缺失的 `brabo-*`，对已存在的执行 `git fetch`，并且从不删除任何东西。

**如何确认成功：** 最后一行写着 `pronto: 11 repositórios`。

## 2. 启动 dev

启动 dev 的是 `brabo-infra`，它从相邻的克隆构建每个服务：

```bash
cd brabo-infra
cp .env.example .env
make dev
```

`make dev` 会确认相邻仓库都在位，然后启动 compose。要使用其他父文件夹，运行 `BRABO_IRMAOS=/outra/pasta make dev`。`brabo-infra` 还能做什么，见它的 README。

**如何确认成功：** <http://localhost:5173> 打开登录界面。在 `brabo-api` 的克隆中用 `pnpm seed` 创建测试账号（`owner@brabo.dev`、`maintainer@brabo.dev`、`developer@brabo.dev` 和 `viewer@brabo.dev`；密码来自 seed，可用 `BRABO_SEED_PASSWORD` 修改）。

<details>
<summary>如果出了问题：两种本地模式争用端口</summary>

在你的机器上有两种运行 Brabo 的方式，它们**争用相同的端口**：

| 模式 | 启动方式 | web 地址 |
|---|---|---|
| **开发** | `make dev` | <http://localhost:5173> |
| **验证** | `make deploy-local`（k3d，生产镜像） | <http://localhost:8088> |

两者都有意把 api 发布在 `:3000`、engine 发布在 `:4000`，这样 `smoke.sh` 在两种模式下都有效。集群在运行时，`5173` 永远打不开：用 `make k8s-down` 把它关掉。端口被别的东西占用？在 `.env` 中修改 `API_PORT`、`ENGINE_PORT`、`WEB_PORT` 或 `OLLAMA_PORT`；CORS 会跟随 `WEB_PORT`。

要知道你处在哪种模式，`make dev` 的 `preflight` 会告诉你。

</details>

<details>
<summary>如果出了问题：同一台机器上的一个安装和一个检出</summary>

dev 的 compose 是 Docker 项目 **`brabo-dev`**；`install.sh` 的安装是 **`brabo`**。名称是分开的，但只要还有安装版 compose 的容器，`make dev` 和 `reset-total.sh` 就会**拒绝**运行，并列出这些容器。关闭安装时**不要**加 `-v`：数据会保留，`up -d` 可以把它带回来。

</details>

## 3. 工作区文件夹 {#pasta-dos-workspaces}

默认情况下，智能体写出的内容保存在 Docker 卷中。要使用磁盘上的真实文件夹，请在 `brabo-infra` 的 `.env` 中**同时**设置这两项：

```bash
PROJECT_WORKSPACES_HOST_DIR=~/brabo-projetos
GIT_LOCAL_REPOS_HOST_DIR=~/brabo-projetos-bare
```

- 每个项目会得到一个子文件夹 `<slug>-<id 的前 8 个字符>`，在创建时确定。
- 不要指向整个 `$HOME`，也不要指向含有其他机密的文件夹：它会成为**所有**项目的根目录。
- 容器在 dev 中以 root 运行，所以智能体写出的内容属主是 `root`。运行一次 `sudo chown -R $USER ~/brabo-projetos`。
- 只在 Linux 和 macOS 上测试过。在 Windows 上，bind mount 有已知的陷阱。

## 4. 日常命令

每个仓库都有自己的命令，写在它的 `CLAUDE.md` 中。在 `brabo-api` 中：

```bash
pnpm test
pnpm build
pnpm db:generate  # depois de mudar apps/api/src/db/schema/<agregado>.ts
pnpm db:migrate
```

在 `brabo-api` 的克隆中，schema 的路径是 `src/db/schema/<agregado>.ts`。浏览器 E2E（Playwright）位于 `brabo-qa`，针对安装版 compose 运行；具体步骤见 README 和[手动轮次](../rodadas-manuais.md)。请始终从 `dev` 出发在 `feature/*` 上工作，并使用 pt-BR 的 conventional commits。

## 每样东西在哪里

| 仓库 | 它是什么 |
|---|---|
| `brabo` | 入口：文档、网站、`install.sh` 和产品发布 |
| `brabo-api` | NestJS、Drizzle 和 PostgreSQL：schema、RBAC、LLM、metering |
| `brabo-engine` | Elixir/OTP：智能体、会话、闸门 |
| `brabo-web` | React 和 Vite：界面和设计系统 |
| `brabo-runner` | 用户机器上的 CLI |
| `brabo-broker` | 唯一持有服务器 Docker 套接字的进程 |
| `brabo-contracts` | 共享类型和契约，按 TAG 使用 |
| `brabo-ci` | 可复用的工作流和 PR 策略 |
| `brabo-infra` | compose、Kubernetes 和 `make dev` |
| `brabo-qa` | 浏览器 E2E 和 golden set |
| `brabo-workspace` | 父文件夹和 `clonar-tudo.sh` |

完整的地图，包括每个仓库使用什么，见[地图](../tutorials/orquestrar-repositorios/o-mapa.md)。

## 延伸阅读

- [ADR 0025](../adr/0025-fase5-deploy-kubernetes-kustomize.md)（dev 模式）、[ADR 0170](../adr/0170-compose-de-dev-brabo-dev.md)（dev 的 compose）和 [RN-109](../business-rules/api.md#rn-109)（每个项目的文件夹）。
