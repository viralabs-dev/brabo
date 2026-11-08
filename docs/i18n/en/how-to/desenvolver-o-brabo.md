---
id: desenvolver-o-brabo
title: Developing Brabo
sidebar_label: Developing Brabo
description: Clone Brabo's repositories with clonar-tudo.sh, bring up the dev environment through brabo-infra and learn where everything lives.
keywords: [development, clonar-tudo, brabo-infra, make dev, workspace, repositories]
tipo: guia
traducao_de: d1da65c914f6e3a228fceab257ea235aba5d88c5
---

# Developing Brabo

To **use** Brabo, see [Getting Started](../getting-started.md). This guide is
for whoever will change the code: clone the 11 repositories and bring up dev from them.

## Before you start

Git, Bash, Docker with Compose and ~6 GiB of free RAM. Node and pnpm only come in when
you run a repository's tests; Elixir runs in the container.

## 1. Clone everything

`brabo-workspace` is the parent folder: it only knows where each repository lives.

```bash
git clone https://github.com/viralabs-dev/brabo-workspace.git ~/dev/brabo
cd ~/dev/brabo
./clonar-tudo.sh
```

`clonar-tudo.sh` clones each missing `brabo-*` over HTTPS, runs `git fetch` on the
ones that already exist and never deletes anything.

**How to tell it worked:** the last line says `pronto: 11 repositórios`.

## 2. Bring up dev

What brings dev up is `brabo-infra`, building each service from the sibling clones:

```bash
cd brabo-infra
cp .env.example .env
make dev
```

`make dev` checks that the siblings are in place and brings up the compose. For another
parent folder, `BRABO_IRMAOS=/other/folder make dev`. What else `brabo-infra` does
is in its README.

**How to tell it worked:** <http://localhost:5173> opens the login screen. Create the
test accounts with `pnpm seed` in the `brabo-api` clone (`owner@brabo.dev`,
`maintainer@brabo.dev`, `developer@brabo.dev` and `viewer@brabo.dev`; the password comes from the
seed and is changed with `BRABO_SEED_PASSWORD`).

<details>
<summary>If it goes wrong: the two local modes fight over ports</summary>

There are two ways to run Brabo on your machine, and they **fight over the same ports**:

| mode | brought up with | web at |
|---|---|---|
| **development** | `make dev` | <http://localhost:5173> |
| **validation** | `make deploy-local` (k3d, production images) | <http://localhost:8088> |

Both publish the api on `:3000` and the engine on `:4000`, on purpose, so that
`smoke.sh` holds in both. With the cluster up, `5173` never opens: tear it down with
`make k8s-down`. Port taken by something else? Change `API_PORT`, `ENGINE_PORT`,
`WEB_PORT` or `OLLAMA_PORT` in `.env`; CORS follows `WEB_PORT`.

To know which mode you are in, the `preflight` of `make dev` tells you.

</details>

<details>
<summary>If it goes wrong: an installation and a checkout on the same machine</summary>

The dev compose is the Docker project **`brabo-dev`**; the `install.sh` installation
is **`brabo`**. The names are separate, but `make dev` and `reset-total.sh`
**refuse** while there is a container of the installation compose, and list them.
Tear the installation down **without** `-v`: the data stays, and `up -d` brings it back.

</details>

## 3. Workspaces folder {#pasta-dos-workspaces}

By default, what the agents write lives in a Docker volume. To use a real
folder on your disk, set both **together** in the `.env` of `brabo-infra`:

```bash
PROJECT_WORKSPACES_HOST_DIR=~/brabo-projetos
GIT_LOCAL_REPOS_HOST_DIR=~/brabo-projetos-bare
```

- Each project gets a subfolder `<slug>-<8 chars of the id>`, decided at creation.
- Do not point at your whole `$HOME` or at a folder with other secrets: it becomes the root of **all** projects.
- The containers run as root in dev, so what the agents write ends up owned by `root`. Run `sudo chown -R $USER ~/brabo-projetos` once.
- Only tested on Linux and macOS. On Windows, the bind mount has known traps.

## 4. Everyday commands

Each repository has its own commands, in its `CLAUDE.md`. In `brabo-api`:

```bash
pnpm test
pnpm build
pnpm db:generate  # depois de mudar apps/api/src/db/schema/<agregado>.ts
pnpm db:migrate
```

In the `brabo-api` clone the schema path is `src/db/schema/<agregado>.ts`.
The browser E2E (Playwright) lives in `brabo-qa` and runs against the installation compose; the step by step is in the README and in [Manual rounds](../rodadas-manuais.md).
Always work on `feature/*` from `dev`, with conventional commits in pt-BR.

## Where everything lives

| repository | what it is |
|---|---|
| `brabo` | front door: documentation, site, `install.sh` and the product release |
| `brabo-api` | NestJS, Drizzle and PostgreSQL: schema, RBAC, LLM, metering |
| `brabo-engine` | Elixir/OTP: agents, sessions, gates |
| `brabo-web` | React and Vite: screens and design system |
| `brabo-runner` | CLI on the user's machine |
| `brabo-broker` | the only process with the server's Docker socket |
| `brabo-contracts` | shared types and contracts, consumed by TAG |
| `brabo-ci` | reusable workflows and the PR policy |
| `brabo-infra` | composes, Kubernetes and `make dev` |
| `brabo-qa` | browser E2E and golden sets |
| `brabo-workspace` | the parent folder and `clonar-tudo.sh` |

The full map, with what each one consumes, is in [The map](../tutorials/orquestrar-repositorios/o-mapa.md).

## For more

- [ADR 0025](../adr/0025-fase5-deploy-kubernetes-kustomize.md) (dev modes), [ADR 0170](../adr/0170-compose-de-dev-brabo-dev.md) (dev compose) and [RN-109](../business-rules/api.md#rn-109) (each project's folder).
