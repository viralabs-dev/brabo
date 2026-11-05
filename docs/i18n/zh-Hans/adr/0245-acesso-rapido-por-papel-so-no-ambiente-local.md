---
traducao_de: 8ab4a94a8ad005489ee47bbc26e7f70b0c2dfa0b
---

# ADR 0245 — 按角色快速访问仅限本地环境

- **状态：** 已接受
- **日期：** 2026-11-03
- **引用：** ADR [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) 和 [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md)（会话与 cookie）、[0073](0073-o-caminho-publicado-nomeia-o-ambiente.md)（词汇 `dev`/`prd`）、[0119](0119-imagens-publicadas-no-ghcr-por-digest.md)（已发布的镜像）以及 [0155](0155-a-primeira-conta-nasce-no-terminal.md)（RN-546）。均不被编辑。

## 背景

所有者（AT-722，11 月 3 日）要求在登录界面提供一个对话框，选择角色即可进入，用于开发，以及在本机构建的安装上进行 TP-01。生产是经由 GitHub Actions 产出的一切。不带凭据就签发会话的入口是认证边界：它需要一道不依赖于"记得关掉它"的屏障。

## 决定

1. **一个环境变量，三个取值。** api 中为 `BRABO_AMBIENTE`，web 中为
   `VITE_BRABO_AMBIENTE`（Vite 只暴露 `VITE_*`）：`dev`（`dev` 上的 Actions）、`prd`（`main` 上的 Actions 以及发布 tag）和 `local`（仅在 Actions 之外）。快速访问**只在 `local` 时存在**；缺失、为空或任何其他值，它都不存在。
2. **四层保障。**
   - 构建：`docker-bake.hcl` 中的 `AMBIENTE`（默认为空）成为构建参数
     `BRABO_AMBIENTE`（api）和 `VITE_BRABO_AMBIENTE`（web）；在 web 中，死分支会从 bundle 中消失，不产生 chunk。
   - 镜像中的文件：api 的 Dockerfile 写入 `/app/AMBIENTE_DA_IMAGEM`
     （compose 的 `environment:` 会覆盖 `ENV`，但不会覆盖文件）。
   - 运行时：谓词 `acessoRapidoLigado` 要求变量为 `local` 且文件不存在（`pnpm dev`）或为 `local`；模块只在这种情况下注册，否则路由返回 404。`NODE_ENV` 不参与：安装运行的是 `production`。
   - 证明：谓词的 spec、模块的 spec、`scripts/ci/ambiente-nas-actions.spec.ts`
     （没有任何 workflow 开启 `local`）、`docker/smoke.sh` 的步骤以及 E2E 的测试。
3. **生产是经由 Actions 产出的一切**：`ci.yml` 根据 PR 的基础分支传入 `dev` 或 `prd`，`release.yml` 传入 `prd`。`install.sh` 不变；TP-01 通过 runbook 开启 `local`。
4. **账户 `<papel>@brabo.dev`**（`owner`、`maintainer`、`developer`、
   `viewer`，即 `ROLE_ORDER`）。`POST /auth/dev-login { papel }` 只解析这些账户，绝不解析任意邮箱，并通过与登录相同的 `EmitirSessaoUseCase` 签发会话。在安装中，该路由通过核心 `ProvisionarUsuarioUseCase` 保证这些账户存在，密码是被丢弃的**随机**密码，放在专属 workspace（"acesso rápido (local)"）中，无法访问真实项目。RN-546 保持不变：不存在已知密码，seed 仍拒绝生产。安装中没有用户时返回 409（`first-account` 创建第一个账户）。
5. **绑定到 `127.0.0.1`。** 在 `local` 时，安装的 api 和 web 端口绑定到 `127.0.0.1`（`BRABO_BIND`）。
6. seed 中的 `dev@brabo.dev` 改为 `developer@brabo.dev`。

## 后果

- 已声明的风险：在 `local` 时，能够访问该端口的人可以任意角色进入（因此要绑定）；该路由与 `/auth/login` 一样没有限流也没有 CSRF，防御在于它在 `local` 之外根本不存在；用 `AMBIENTE=local` 手工构建的镜像在定义上就是本地的；更早之前播种的数据库会保留孤立的 `dev@brabo.dev`，直到下一次重置。
- 该路由不出现在 `route-surface.spec` 和 `openapi.json` 中；它记录在 `docs/security-surface.md` 的正文中。
