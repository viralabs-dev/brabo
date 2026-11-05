---
traducao_de: 3a78654798305970710cc343ac2e70156f6b266b
---

# 产品发布 {#product-release}

> Brabo 存在于多个 `viralabs-dev/brabo*` 仓库中，它如何发布**一个**产品版本（AT-704，EP-033）。每个仓库有自己的版本；产品的版本在 `brabo` 中。全部从 `1.0.0` 重新开始。本页是整体视图；镜像和签名的细节见 [CI 供应链](cadeia-de-suprimentos-do-ci.md)。

## 三个阶段 {#stages}

1. **每个仓库给自己盖 tag。** 每次推送到 `dev` 和 `main`，仓库的 workflow `tag-release.yml` 会调用 `brabo-ci` 中可复用的 `tag-release.yml`，以 SHA 固定。可复用的 workflow 按分支的功能计算版本（`breaking/` 提升 MAJOR，`feature/` 提升 MINOR，其余为 PATCH），并使用机器人 GitHub App 的 token（`BRABO_APP_ID` / `BRABO_APP_PRIVATE_KEY`，组织的 secrets）推送 tag。使用的是 App 的 token，而不是 `GITHUB_TOKEN`，因为只有它才能让 tag 触发发布 workflow。
2. **镜像仓库发布。** 在最终 tag 上，`brabo-api`、`brabo-engine`、`brabo-web`、`brabo-broker` 和 `brabo-infra`（备份镜像）构建镜像，在签名**之前**用 Trivy 扫描，按 **digest** 用 cosign keyless 签名，并在同一次运行中验证签名。它们把 `imagem.json`（`{imagem, tag, digest}`）附到各自的 Release 上，这就是与产品之间的契约。`brabo-runner` 不发布镜像：它由自己的 `build-runner-binaries.yml` 附上二进制文件和已签名的 `checksums.txt`。
3. **`brabo` 组装产品的 release。** `release.yml` 读取 `componentes.json`（每个组件的 tag），下载每个 Release 的 `imagem.json`，组装 `images.json`（`scripts/ci/montar-images.ts`），按 digest 用 Trivy 扫描镜像，汇集 `install.sh` 和 `brabo-install-*` 资产，并签署**一个** `checksums.txt`（cosign keyless，身份为 `brabo` 的 `release.yml`）。`install.sh` 核对的就是这份清单。runner 的二进制文件另行核对，对照 `brabo-runner` 的已签名 `checksums.txt`，其 tag 由 `componentes.json` 在 `.runner.tag` 中固定。

```mermaid
flowchart LR
  subgraph apps["Repositórios de imagem e runner"]
    A["brabo-api / engine / web / broker / infra"]
    R["brabo-runner"]
  end
  CI["brabo-ci<br/>tag-release (token do App)"]
  CI -->|"carimba vX.Y.Z"| A
  CI -->|"carimba vX.Y.Z"| R
  A -->|"build, Trivy, cosign por digest<br/>imagem.json na Release"| IMG[("ghcr.io/viralabs-dev/brabo-*")]
  R -->|"binários + checksums.txt assinado"| RB[("Release do brabo-runner")]
  CI -->|"carimba vX.Y.Z"| B["brabo"]
  B -->|"componentes.json + imagem.json de cada app<br/>images.json, Trivy por digest<br/>assina checksums.txt"| REL[("Release do produto")]
  REL --> INST["install.sh"]
  INST -->|"binário do runner, cosign contra build-runner-binaries.yml"| RB
  INST -->|"imagens por digest"| IMG
```

## 开关 {#gate}

`brabo` 中的仓库变量 `PRODUTO_RELEASE_LIGADA=true` 是唯一用来盖 tag 并发布产品 Release 的开关。关闭时，`tag-release.yml` 和 `release.yml` 不会运行（下面的演练除外）。由所有者来打开。

**演练。** 在某个分支上对 `release.yml` 执行 `workflow_dispatch`，`tag` 字段留空，会组装并核对所有可能核对的内容，但**不**签名也不发布，即使开关关闭也会运行。没有各组件的 Release 时，镜像不会被组装，Trivy 和镜像验证留到第一个 tag。

## `componentes.json` 固定了什么 {#components}

| 字段 | 用途 |
|---|---|
| `infra` | compose、`.trivyignore.yaml` 和 `trivy-do-release.ts` 所来自的仓库与 ref |
| `imagens.<alvo>` | 每个镜像组件的仓库、tag 和镜像；`imagem.json` 必须与之吻合 |
| `runner` | `brabo-runner` 的仓库和 tag；`install.sh` 从那里下载二进制文件（`RUNNER_TAG`，由 `scripts/dev/install-runner-release.spec.ts` 核对） |

升级一个组件，就是在 PR 中编辑这里的 tag，产品在下一个 tag 中就带着它发布。五个镜像要么全部具备，要么都没有：有组件缺少 `imagem.json` 的产品 Release 会被拒绝。

## 尚未做出的决定 {#open}

> **TODO(humano):** 谁来决定、并按什么顺序决定何时打开 `PRODUTO_RELEASE_LIGADA` 并给各仓库盖上第一批 `v1.0.0` tag（顺序很重要：`brabo` 需要各组件的 Release 先于它自己的存在）。

> **TODO(humano):** `componentes.json` 是手工编辑的；还需决定：在某个组件盖上新 tag 时由机器人更新它，还是仍由 PR 来决定。

> **TODO(humano):** 某个组件的 hotfix（从 `main` 创建）以及承载它的产品 tag：产品的 hotfix 流程尚未编写。
