---
id: desenvolver-o-brabo
title: Разработка Brabo
sidebar_label: Разработка Brabo
description: Клонируйте репозитории Brabo с помощью clonar-tudo.sh, поднимите среду разработки через brabo-infra и узнайте, где что лежит.
keywords: [разработка, clonar-tudo, brabo-infra, make dev, workspace, репозитории]
tipo: guia
traducao_de: d1da65c914f6e3a228fceab257ea235aba5d88c5
---

# Разработка Brabo

Чтобы **использовать** Brabo, см. [Первые шаги](../getting-started.md). Это руководство
для тех, кто будет менять код: клонировать 11 репозиториев и поднимать из них dev.

## Прежде чем начать

Git, Bash, Docker с Compose и ~6 ГиБ свободной RAM. Node и pnpm нужны только
для запуска тестов репозитория; Elixir работает в контейнере.

## 1. Клонировать всё

`brabo-workspace` — это родительская папка: она знает только, где живёт каждый репозиторий.

```bash
git clone https://github.com/viralabs-dev/brabo-workspace.git ~/dev/brabo
cd ~/dev/brabo
./clonar-tudo.sh
```

`clonar-tudo.sh` клонирует по HTTPS каждый недостающий `brabo-*`, делает `git fetch` в
уже существующих и никогда ничего не удаляет.

**Как понять, что получилось:** последняя строка говорит `pronto: 11 repositórios`.

## 2. Поднять dev

Dev поднимает `brabo-infra`, собирая каждый сервис из соседних клонов:

```bash
cd brabo-infra
cp .env.example .env
make dev
```

`make dev` проверяет, что соседние репозитории на месте, и поднимает compose. Для другой
родительской папки — `BRABO_IRMAOS=/outra/pasta make dev`. Что ещё делает `brabo-infra`,
описано в его README.

**Как понять, что получилось:** <http://localhost:5173> открывает экран входа. Создайте
тестовые учётные записи командой `pnpm seed` в клоне `brabo-api` (`owner@brabo.dev`,
`maintainer@brabo.dev`, `developer@brabo.dev` и `viewer@brabo.dev`; пароль берётся из
seed и меняется через `BRABO_SEED_PASSWORD`).

<details>
<summary>Если что-то пошло не так: два локальных режима спорят за порты</summary>

Brabo можно запустить на своей машине двумя способами, и они **спорят за одни и те же порты**:

| режим | поднимается командой | web на |
|---|---|---|
| **разработка** | `make dev` | <http://localhost:5173> |
| **валидация** | `make deploy-local` (k3d, продакшен-образы) | <http://localhost:8088> |

Оба публикуют api на `:3000`, а engine на `:4000` — намеренно, чтобы
`smoke.sh` годился для обоих. Пока кластер поднят, `5173` не откроется: остановите его командой
`make k8s-down`. Порт занят чем-то другим? Измените `API_PORT`, `ENGINE_PORT`,
`WEB_PORT` или `OLLAMA_PORT` в `.env`; CORS следует за `WEB_PORT`.

Чтобы узнать, в каком вы режиме, скажет `preflight` команды `make dev`.

</details>

<details>
<summary>Если что-то пошло не так: установка и checkout на одной машине</summary>

Compose для dev — это проект Docker **`brabo-dev`**; установка через `install.sh` —
**`brabo`**. Имена разные, но `make dev` и `reset-total.sh`
**отказываются** работать, пока есть контейнер compose установки, и перечисляют их.
Остановите установку **без** `-v`: данные остаются, а `up -d` вернёт её обратно.

</details>

## 3. Папка workspace {#pasta-dos-workspaces}

По умолчанию то, что пишут агенты, живёт в томе Docker. Чтобы использовать настоящую
папку на диске, задайте обе переменные **вместе** в `.env` у `brabo-infra`:

```bash
PROJECT_WORKSPACES_HOST_DIR=~/brabo-projetos
GIT_LOCAL_REPOS_HOST_DIR=~/brabo-projetos-bare
```

- Каждый проект получает подпапку `<slug>-<8 символов id>`, определяемую при создании.
- Не указывайте весь `$HOME` и папку с другими секретами: она становится корнем **всех** проектов.
- Контейнеры в dev работают от root, поэтому то, что пишут агенты, получает владельца `root`. Один раз выполните `sudo chown -R $USER ~/brabo-projetos`.
- Проверено только на Linux и macOS. В Windows у bind mount есть известные ловушки.

## 4. Повседневные команды

У каждого репозитория свои команды, в его `CLAUDE.md`. В `brabo-api`:

```bash
pnpm test
pnpm build
pnpm db:generate  # depois de mudar apps/api/src/db/schema/<agregado>.ts
pnpm db:migrate
```

В клоне `brabo-api` путь к схеме — `src/db/schema/<agregado>.ts`.
E2E в браузере (Playwright) живёт в `brabo-qa` и запускается против compose установки; пошаговая инструкция — в README и в [Ручных прогонах](../rodadas-manuais.md).
Работайте всегда в `feature/*` от `dev`, с conventional commits на pt-BR.

## Где что лежит

| репозиторий | что это |
|---|---|
| `brabo` | входная дверь: документация, сайт, `install.sh` и релиз продукта |
| `brabo-api` | NestJS, Drizzle и PostgreSQL: схема, RBAC, LLM, metering |
| `brabo-engine` | Elixir/OTP: агенты, сессии, гейты |
| `brabo-web` | React и Vite: экраны и дизайн-система |
| `brabo-runner` | CLI на машине пользователя |
| `brabo-broker` | единственный процесс с сокетом Docker сервера |
| `brabo-contracts` | общие типы и контракты, потребляемые по TAG |
| `brabo-ci` | переиспользуемые workflow и политика PR |
| `brabo-infra` | compose, Kubernetes и `make dev` |
| `brabo-qa` | E2E в браузере и golden-наборы |
| `brabo-workspace` | родительская папка и `clonar-tudo.sh` |

Полная карта с тем, что потребляет каждый репозиторий, — в [Карте](../tutorials/orquestrar-repositorios/o-mapa.md).

## Подробнее

- [ADR 0025](../adr/0025-fase5-deploy-kubernetes-kustomize.md) (режимы dev), [ADR 0170](../adr/0170-compose-de-dev-brabo-dev.md) (compose для dev) и [RN-109](../business-rules/api.md#rn-109) (папка каждого проекта).
