---
id: token-do-github-packages
title: GitHub Packages 令牌
sidebar_label: GitHub Packages 令牌
description: 面向从源码构建 Brabo（--source=local）的人——创建只有 read:packages 的 classic PAT，写入 .npmrc，并在不暴露值的情况下检查。
keywords: [pat, github packages, npmrc, read:packages, install.sh, source local]
---

# GitHub Packages 令牌

使用 `--source=local` 安装的人会在本机构建 api、web 和 broker 的镜像。这三者都从 GitHub Packages 注册表安装 `@viralabs-dev/brabo-shared` 和 `@viralabs-dev/brabo-docker-port`。这些包是公开的，但注册表即使在安装时也要求令牌。没有令牌，构建会以 `401` 失败，安装程序会在开始前拒绝。从 GHCR 安装（`--source=ghcr`，默认）不需要这些。

## 步骤

1. 在 GitHub 打开 **Settings > Developer settings > Personal access tokens > Tokens (classic)**，选择 **Generate new token (classic)**。
2. **只**勾选 `read:packages`。不需要其他权限。
3. 复制令牌，把这一行写入 `~/.npmrc`（把 `<PAT>` 换成令牌）：

   ```text
   //npm.pkg.github.com/:_authToken=<PAT>
   ```

4. 在不显示值的情况下检查该行存在：

   ```bash
   grep -c '^//npm.pkg.github.com/:_authToken=.' ~/.npmrc
   ```

   应输出 `1`。
5. 在检出目录内、处于某个标签且工作树干净时运行 `./install.sh --source=local`。

## 其他文件

`NPMRC=<文件>` 让安装程序、bake 和 `make dev` 使用另一个文件，而不是 `~/.npmrc`。

## 安全

- 安装程序只检查该行是否存在；绝不打印其值。
- 构建时该文件作为 BuildKit secret（`id=npmrc`）传入，绝不作为 `ARG`、`ENV` 或镜像层。
- 令牌只能读取包。如果泄露，请在 **Personal access tokens** 中撤销并重新创建。

另见 `brabo-infra` README 中的 [GitHub Packages 令牌](https://github.com/viralabs-dev/brabo-infra#token-do-github-packages) 一节，它涵盖开发环境和 CI。
