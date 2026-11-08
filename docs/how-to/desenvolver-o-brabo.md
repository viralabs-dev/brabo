---
id: desenvolver-o-brabo
title: Desenvolver o Brabo
sidebar_label: Desenvolver o Brabo
description: Clone os repositórios do Brabo com o clonar-tudo.sh, suba o ambiente de dev pelo brabo-infra e saiba onde cada coisa mora.
keywords: [desenvolvimento, clonar-tudo, brabo-infra, make dev, workspace, repositórios]
tipo: guia
---

# Desenvolver o Brabo

Para **usar** o Brabo, veja [Primeiros passos](../getting-started.md). Este guia é
para quem vai mexer no código: clonar os 11 repositórios e subir o dev a partir deles.

## Antes de começar

Git, Bash, Docker com Compose e ~6 GiB de RAM livre. Node e pnpm só entram quando
você roda os testes de um repositório; o Elixir roda no container.

## 1. Clonar tudo

O `brabo-workspace` é a pasta-mãe: ele só sabe onde cada repositório mora.

```bash
git clone https://github.com/viralabs-dev/brabo-workspace.git ~/dev/brabo
cd ~/dev/brabo
./clonar-tudo.sh
```

O `clonar-tudo.sh` clona por HTTPS cada `brabo-*` que falta, dá `git fetch` nos
que já existem e nunca apaga nada.

**Como saber que deu certo:** a última linha diz `pronto: 11 repositórios`.

## 2. Subir o dev

Quem sobe o dev é o `brabo-infra`, construindo cada serviço a partir dos clones irmãos:

```bash
cd brabo-infra
cp .env.example .env
make dev
```

O `make dev` confere que os irmãos estão no lugar e sobe o compose. Para outra
pasta-mãe, `BRABO_IRMAOS=/outra/pasta make dev`. O que mais o `brabo-infra` faz
está no README dele.

**Como saber que deu certo:** <http://localhost:5173> abre a tela de login. Crie as
contas de teste com `pnpm seed` no clone do `brabo-api` (`owner@brabo.dev`,
`maintainer@brabo.dev`, `developer@brabo.dev` e `viewer@brabo.dev`; a senha vem do
seed e se troca por `BRABO_SEED_PASSWORD`).

<details>
<summary>Se der errado: os dois modos locais disputam as portas</summary>

Há duas formas de rodar o Brabo na sua máquina, e elas **disputam as mesmas portas**:

| modo | sobe com | web em |
|---|---|---|
| **desenvolvimento** | `make dev` | <http://localhost:5173> |
| **validação** | `make deploy-local` (k3d, imagens de produção) | <http://localhost:8088> |

Os dois publicam a api em `:3000` e o engine em `:4000`, de propósito, para o
`smoke.sh` valer nos dois. Com o cluster de pé, a `5173` nunca abre: derrube-o com
`make k8s-down`. Porta ocupada por outra coisa? Mude `API_PORT`, `ENGINE_PORT`,
`WEB_PORT` ou `OLLAMA_PORT` no `.env`; o CORS acompanha o `WEB_PORT`.

Para saber em qual modo você está, o `preflight` do `make dev` diz.
Veja o [ADR 0025](../adr/0025-fase5-deploy-kubernetes-kustomize.md).

</details>

<details>
<summary>Se der errado: uma instalação e um checkout na mesma máquina</summary>

O compose de dev é o projeto Docker **`brabo-dev`**; a instalação do `install.sh`
é **`brabo`**. Os nomes são separados, mas o `make dev` e o `reset-total.sh`
**recusam** enquanto houver container do compose de instalação, e os listam.
Derrube a instalação **sem** `-v`: os dados ficam, e `up -d` a traz de volta.
Veja o [ADR 0170](../adr/0170-compose-de-dev-brabo-dev.md).

</details>

## 3. Pasta dos workspaces {#pasta-dos-workspaces}

Por padrão, o que os agentes escrevem vive num volume Docker. Para usar uma pasta
real do seu disco, defina as duas **juntas** no `.env` do `brabo-infra`:

```bash
PROJECT_WORKSPACES_HOST_DIR=~/brabo-projetos
GIT_LOCAL_REPOS_HOST_DIR=~/brabo-projetos-bare
```

- Cada projeto ganha uma subpasta `<slug>-<8 chars do id>` ([RN-109](../business-rules/api.md#rn-109)), decidida na criação.
- Não aponte para `$HOME` inteiro nem para uma pasta com outros segredos: ela vira a raiz de **todos** os projetos.
- Os containers rodam como root em dev, então o que os agentes escrevem sai dono de `root`. Rode uma vez `sudo chown -R $USER ~/brabo-projetos`.
- Só testado em Linux e macOS. No Windows, o bind mount tem armadilhas conhecidas.

## 4. Os comandos do dia a dia

Cada repositório tem os próprios comandos, no `CLAUDE.md` dele. No `brabo-api`:

```bash
pnpm test
pnpm build
pnpm db:generate  # depois de mudar apps/api/src/db/schema/<agregado>.ts
pnpm db:migrate
```

No clone do `brabo-api` o caminho do schema é `src/db/schema/<agregado>.ts`.
O E2E de navegador (Playwright) mora no `brabo-qa` e roda contra o compose de instalação; o passo a passo está no README e em [Rodadas manuais](../rodadas-manuais.md).
Trabalhe sempre em `feature/*` a partir de `dev`, com conventional commits em pt-BR.

## Onde fica cada coisa

| repositório | o que é |
|---|---|
| `brabo` | porta de entrada: documentação, site, `install.sh` e a release do produto |
| `brabo-api` | NestJS, Drizzle e PostgreSQL: schema, RBAC, LLM, metering |
| `brabo-engine` | Elixir/OTP: agentes, sessões, gates |
| `brabo-web` | React e Vite: telas e design system |
| `brabo-runner` | CLI na máquina do usuário |
| `brabo-broker` | o único processo com o socket do Docker do servidor |
| `brabo-contracts` | tipos compartilhados e contratos, consumidos por TAG |
| `brabo-ci` | workflows reutilizáveis e a política de PR |
| `brabo-infra` | composes, Kubernetes e o `make dev` |
| `brabo-qa` | E2E de navegador e golden-sets |
| `brabo-workspace` | a pasta-mãe e o `clonar-tudo.sh` |

O mapa completo, com o que cada um consome, está em [O mapa](../tutorials/orquestrar-repositorios/o-mapa.md).
