---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: 每个仓库如何被消费
description: 一个 Brabo 仓库向另一个仓库交付内容的六种方式（契约标签、策略 SHA、兄弟克隆、按 digest 的镜像、已签名的二进制文件和组件固定版本），每种都说明谁发布、谁消费、哪个文件锁定版本、哪项检查来证明。
---

# 每个仓库如何被消费

**适合谁：** 需要决定一个仓库**如何**向另一个仓库交付内容的人。

**读完之后你可以：** 为自己地图上的每条边选择合适的渠道，并说出哪个文件锁定版本、哪项检查来证明。

贯穿始终的规则：**每个渠道都固定一个精确的版本，并有一项检查来校验它。** 消费另一个仓库的"最新"内容，正是同一个提交由绿变红的原因。

## 六种方式

| # | 方式 | 谁发布 | 谁消费 | 什么锁定 | 谁来证明 |
|---|---|---|---|---|---|
| 1 | **按标签的契约** | `brabo-contracts` | api、web、runner、broker、engine、qa、infra | `package.json` 和 lock 文件中的精确版本 | `contracts-alinhado` |
| 2 | **按 SHA 的策略** | `brabo-ci` | 全部 11 个仓库 | `uses: ...@<sha>` 和 `ci_ref` | `pins-do-brabo-ci` |
| 3 | **兄弟克隆** | 每个仓库（其 `dev`） | `brabo-infra` 和 `brabo` | `irmaos.lock`（在 `brabo` 中） | `docs:check` |
| 4 | **按 digest 的镜像** | api、engine、web、broker 和备份镜像 | `brabo-qa` 和安装程序 | `sha256` digest | `E2E do brabo-qa` |
| 5 | **已签名的二进制文件** | `brabo-runner` | `brabo` 的 `install.sh` | 已签名的 `checksums.txt` | `install.sh` 和 `release.yml` |
| 6 | **产品固定版本** | 所有组件 | `brabo` | `componentes.json` | `Pins dos componentes` |

### 1. 按标签的契约

`brabo-contracts` 把软件包发布到 GitHub Packages（`@viralabs-dev/brabo-shared` 和 `@viralabs-dev/brabo-docker-port`），并在**同一标签**下提供三个通过 raw URL 下载的数据文件。使用方通过 pnpm 别名固定精确版本，无需修改导入：

```bash
pnpm add "@brabo/shared@npm:@viralabs-dev/brabo-shared@1.2.0"
```

永远不要固定到分支。新标签发布后，每个使用方用脚本 [`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh) 升级版本，如果别名、lock 文件和下载脚本中的常量不一致，`contracts-alinhado` 检查就会拒绝。

### 2. 按 SHA 的策略

每个仓库这样调用 `brabo-ci` 的工作流：

```yaml
uses: viralabs-dev/brabo-ci/.github/workflows/pr-police.yml@<sha>  # v1.4.0
with:
  ci_ref: <相同的 sha>
```

`uses:` 选择 YAML，`ci_ref` 选择脚本，因此两者必须是**同一个 40 位 SHA**。注释向读者说明版本，`pins-do-brabo-ci` 检查则确认注释与 SHA 相符（[ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md)）。分步说明见[采用指南](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md)。

### 3. 兄弟克隆

有两个仓库读取其他仓库的**代码**：
- `brabo-infra` 有一个 `irmaos` action，用于检出兄弟仓库的 `dev`，做交叉检查；
- `brabo` 用 `scripts/docs/montar-layout.sh` 重建所有仓库的布局，以生成文档。这里版本是锁定的：`irmaos.lock` 记录每个兄弟仓库的 SHA，由机器人 `regenera-gerados` 更新（[ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md)）。人从不编辑该文件。

开发者在自己的机器上遵循同一原则：`brabo-workspace` 的 `clonar-tudo.sh` 把所有仓库并排克隆，脚本通过 `BRABO_IRMAOS` 读取相邻仓库。

### 4. 按 digest 的镜像

api、engine、web 和 broker 的每个标签都会发布一个用 cosign 签名的容器镜像。`main` 的关卡（`brabo-qa`）把标签解析为 **digest**（`image@sha256:...`），确认运行中的容器正是这个 digest，并校验签名。标签是可以移动的指针，digest 则不能（[ADR 0267](../../adr/0267-o-e2e-do-brabo-qa-e-portao-da-main.md)）。

### 5. 已签名的二进制文件

`brabo-runner` 不发布镜像：它运行在用户的机器上。它把二进制文件和已签名的 `checksums.txt` 附加到 Release。`install.sh` 下载 `componentes.json` 所固定标签的二进制文件，并用该签名校验。

### 6. 产品固定版本

`brabo` 根目录的 `componentes.json` 文件说明**每个组件的哪个标签构成产品**：

```json
"imagens": { "api": { "repo": "viralabs-dev/brabo-api", "tag": "v2.1.0" } }
```

固定版本不会自己移动，但有机器人来升级它：每 6 小时它读取各组件最新的正式 Release，并开一个只改标签的 PR，合并由人来完成。如果某个固定版本落后，`Pins dos componentes` 检查会拒绝产品的推进（[产品发布](../../explanation/release-do-produto.md)）。

> **对你的项目：** 为地图上的每条边写下四件事：谁发布、谁消费、哪个文件保存版本、版本不一致时哪项检查会失败。缺少检查，这条边就还没准备好。

下一页：[一次变更的生命周期](vida-de-uma-mudanca.md)。
