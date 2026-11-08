<div align="center">

[Português](README.md) · [English](README.en.md) · **Русский** · [简体中文](README.zh-Hans.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo.svg" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/logo.svg" />
  <img src="docs/assets/logo.svg" alt="Логотип Brabo" width="96" />
</picture>

<h1>Brabo</h1>

**Команда ИИ-агентов ведёт ваше приложение от брифа до деплоя.
Последнее слово остаётся за вами — по устройству системы, а не по договорённости.**

[![Docs check](https://img.shields.io/github/actions/workflow/status/viralabs-dev/brabo/docs-check.yml?branch=dev&label=docs-check&style=flat-square)](https://github.com/viralabs-dev/brabo/actions/workflows/docs-check.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/viralabs-dev/brabo/release.yml?label=release&style=flat-square)](https://github.com/viralabs-dev/brabo/actions/workflows/release.yml)
[![Лицензия: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Версия](https://img.shields.io/github/v/release/viralabs-dev/brabo?label=version&color=informational&style=flat-square)](https://github.com/viralabs-dev/brabo/releases/latest)
[![Документация](https://img.shields.io/badge/docs-viralabs--dev.github.io/brabo-8A2BE2.svg?style=flat-square)](https://viralabs-dev.github.io/brabo/prd/ru/)
[![Поддержать на Ko-fi](https://img.shields.io/badge/Ko--fi-%D1%83%D0%B3%D0%BE%D1%81%D1%82%D0%B8%D1%82%D1%8C%20%D0%BA%D0%BE%D1%84%D0%B5-FF5E5B?logo=ko-fi&logoColor=white&style=flat-square)](https://ko-fi.com/daneiel)

[Документация](https://viralabs-dev.github.io/brabo/prd/ru/) · [С нуля до результата](https://viralabs-dev.github.io/brabo/prd/ru/tutorials/from-zero-to-deliverable) · [CHANGELOG](CHANGELOG.md) · [Безопасность](SECURITY.md) · [Участие](CONTRIBUTING.md)

<img src="docs/assets/readme/perguntas-no-chat.png" alt="Экран сессии Brabo: Креатив записывает бизнес-правила и возвращает в чат открытые вопросы, каждый с предложенным ответом и затронутыми правилами" />

<sub>Идея превращается в правила, а то, чего не хватает, — в вопрос: Креатив возвращает сомнения в чат.</sub>

[Отличия](#отличия) · [Возможности](#возможности) · [Что это](#что-это) · [Начало](#начало) · [Репозитории](#репозитории-brabo) · [Релиз](#как-собирается-релиз) · [Документация](#документация) · [Лицензия](#лицензия)

</div>

> Источник и проверяемая версия — [README.md](README.md) на португальском: в нём
> указаны текущая версия и количество бизнес-правил. Этот
> перевод намеренно опускает числа.

---

## Отличия

<table>
  <tr>
    <td width="25%" valign="top">🛑 <b>Ничего без одобрения</b><br />Любой внешний эффект рождается как <code>proposed_action</code> и проходит политику проекта; merge в защищённую ветку — всегда ваше решение.</td>
    <td width="25%" valign="top">🧱 <b>Агенту не доверяют по устройству</b><br />Потолки итераций, исправлений и бюджета — в коде. Промпт не гарантия; код — гарантия.</td>
    <td width="25%" valign="top">📜 <b>Всё записано и неизменяемо</b><br />Журнал событий только на добавление, с плотной нумерацией в каждой сессии: проверяемая стоимость и проверяемый бэкап.</td>
    <td width="25%" valign="top">👥 <b>Одна команда от брифа до результата</b><br />Креатив, PO, Архитектор, Dev Lead, разработчики по модулям, Infra, QA и SecOps над настоящим git-репозиторием.</td>
  </tr>
</table>

## Возможности

### Идея превращается в правила, а то, чего не хватает, — в вопрос

<img src="docs/assets/readme/perguntas-no-chat.png" alt="Креатив записывает правила и возвращает открытые вопросы в чат, каждый с предложенным ответом" />

Креатив возвращает сомнения в чат, с предложенным ответом и правилами, которые
затрагивает каждый вопрос. Вы отвечаете прямо там, и ответы становятся
бизнес-правилами.

### Архитектор решает письменно

<img src="docs/assets/readme/arquitetura-e-adr.png" alt="Архитектор предлагает архитектурное решение как pull request и просит подтвердить архитектуру" />

Архитектурное решение рождается как pull request, а архитектура идёт дальше только после вашего
подтверждения.

### Разработчики работают внутри контейнера

<img src="docs/assets/readme/dev-agent-trabalhando.png" alt="Dev-агент рассказывает, что исправляет, работая внутри контейнера" />

Каждая команда проходит политику проекта, а то, что делает dev-агент,
остаётся в ленте сессии.

### Merge всегда за вами

<img src="docs/assets/readme/merges-pelo-chat.png" alt="Очередь pull request, готовых к merge, в чате Креатива, с кнопками Одобрить и Отклонить" />

Pull request, прошедшие гейты, приходят в чат, и один клик на «Одобрить»
подтверждает merge.

**С нуля до результата, в реальном прогоне:** [пошаговый разбор с записями](https://viralabs-dev.github.io/brabo/prd/ru/tutorials/from-zero-to-deliverable) — 8 из 8 задач, 102/102 тестов, US$ 1,07.

---

## Что это

Brabo оркестрирует специализированных агентов — Креатив, PO, Архитектор,
Dev Lead и разработчики по модулям, Infra, QA, SecOps, Психолог и Анамнез —
работающих над настоящим git-репозиторием с автоматически настроенным Gitflow.

У областей (dev, QA, Infra) есть **lead** — единственный внешний адрес: кто
передаёт handoff, говорит с lead, а делегирование субагентам — внутреннее дело
области.

Чем он отличается от ассистента для кода:

**Ничто с внешним эффектом не происходит само.** Команда терминала, commit,
push, PR, merge, расход токенов — всё рождается как `proposed_action`, проходит
политику проекта (`deny` всегда сильнее `allow`) и только потом выполняется.
Два случая не может разрешить даже политика: **merge в защищённую ветку** и
**изменение инструкции агента**. Это потолки, применяемые после всей политики,
а не значения по умолчанию.

**Агенту не доверяют по устройству, и система это учитывает.** Потолок
итераций, потолок исправлений на задачу, бюджет, отклоняющий вызов, закрытый
каталог того, что может профилировать Анамнез. Промпт не гарантия; код —
гарантия.

**Всё записано и неизменяемо.** Журнал событий — только на добавление, с
плотной нумерацией в каждой сессии. Именно это делает доказательства Психолога
отслеживаемыми, стоимость — проверяемой, а бэкап — проверяемым.

**Команда становится лучше, а вы остаётесь в контуре.** Психолог предлагает
гипотезы, опирающиеся на реальные события; Анамнез выводит ваш профиль
квалификации и предлагает версионированные патчи инструкций. Каждый патч
требует вашего согласия, а откат создаёт новую версию вместо удаления истории.

## Начало

### Установить Brabo

```bash
curl -fsSLO https://github.com/viralabs-dev/brabo/releases/latest/download/install.sh && bash install.sh
```

Установщик — это скрипт на bash: скачайте файл и запустите его через `bash`,
никогда не через `curl | sh`. Прежде чем использовать любой файл, он проверяет
подпись `checksums.txt` релиза, поднимает стек с образами, закреплёнными по
digest, создаёт первую учётную запись и включает runner на этой машине. Каждый
шаг сообщает, что сделал, а то, что не удалось, названо в конце.
`bash install.sh --print-plan` показывает, что он сделал бы, ничего не выполняя.
Пошаговое описание — в [Первых шагах](https://viralabs-dev.github.io/brabo/prd/ru/getting-started).

### Разрабатывать Brabo

Код живёт в соседних репозиториях, которые
[`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace) клонирует рядом друг с другом. Среду
разработки поднимает [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra), собирая каждый сервис
из этих клонов:

```bash
git clone https://github.com/viralabs-dev/brabo-workspace.git ~/dev/brabo
cd ~/dev/brabo && ./clonar-tudo.sh
cd brabo-infra && make dev
```

`make dev` проверяет, что соседние репозитории на месте, и поднимает Docker
Compose. Меню повседневных команд (Docker, Kubernetes, база данных и тесты)
тоже живёт в `brabo-infra`: `bash scripts/dev/bootstrap.sh`. Подробности — в
его README.

Этот репозиторий хранит документацию, установщик и релиз. Чтобы работать с
документацией: `pnpm install`, `bash scripts/docs/montar-layout.sh` (подтягивает
документацию соседних репозиториев), `pnpm docs:check` и `pnpm docs:build`.

## Репозитории Brabo

Brabo разделён на репозитории по слоям ([ADR 0252](https://viralabs-dev.github.io/brabo/prd/ru/adr/0252-o-brabo-vira-um-conjunto-de-repositorios)).
`brabo` — центр документации: сайт <https://viralabs-dev.github.io/brabo/prd/ru/> объединяет папки `docs/` соседних
репозиториев в одно дерево.

<!-- mapa:inicio -->
<!-- Gerado do repos.yml do brabo por brabo-ci:scripts/ci/mapa-dos-repos.ts. Não edite à mão. -->
### Onde se encaixa

**brabo** — Porta de entrada do produto — documentação agregada, site, instalador e release. Quem instala usa o `install.sh` e as imagens e o binário das tags de `componentes.json`; o brabo-infra o clona nas aferições cruzadas.

| repo | propósito | como é usado | depende de | é usado por |
|---|---|---|---|---|
| **brabo** | Porta de entrada do produto — documentação agregada, site, instalador e release. | Quem instala usa o `install.sh` e as imagens e o binário das tags de `componentes.json`; o brabo-infra o clona nas aferições cruzadas. | brabo-api (imagem, doc), brabo-engine (imagem, doc), brabo-web (imagem, doc), brabo-broker (imagem, doc), brabo-runner (imagem, doc), brabo-infra (imagem, código, doc), brabo-contracts (doc), brabo-ci (doc, workflow), brabo-qa (doc) | brabo-ci (contrato), brabo-infra (código), brabo-workspace (código) |
| brabo-api | API do produto (NestJS, Drizzle, PostgreSQL/pgvector) — schema, RBAC, LLM, metering e gates. | Imagem publicada por tag e consumida pelo brabo e pelo brabo-infra; o brabo-web, o brabo-engine e o brabo-qa leem o código ou o `openapi.json` dele. | brabo-contracts (contrato), brabo-infra (código), brabo-qa (workflow), brabo-ci (workflow) | brabo (imagem, doc), brabo-engine (código), brabo-web (contrato), brabo-contracts (contrato), brabo-infra (código), brabo-qa (código), brabo-workspace (código) |
| brabo-engine | Engine (Elixir/OTP, Phoenix, Oban) — agentes, sessões, gates e roteamento de runners. | Imagem publicada por tag, usada pelo brabo e pelo brabo-infra. | brabo-contracts (contrato), brabo-api (código), brabo-runner (código), brabo-qa (workflow), brabo-ci (workflow) | brabo (imagem, doc), brabo-infra (código), brabo-qa (código), brabo-workspace (código) |
| brabo-web | Interface web (React 19, Vite) — telas, i18n e design system. | Imagem publicada por tag, usada pelo brabo e pelo brabo-infra. | brabo-contracts (contrato), brabo-api (contrato), brabo-qa (workflow), brabo-ci (workflow) | brabo (imagem, doc), brabo-infra (código), brabo-qa (código), brabo-workspace (código) |
| brabo-runner | CLI `brabo-runner` na máquina do usuário — PTY, container local e espelho. | Binário publicado por tag, instalado pelo brabo; o brabo-engine e o brabo-qa leem o código dele nos testes. | brabo-contracts (contrato), brabo-ci (workflow) | brabo (imagem, doc), brabo-engine (código), brabo-infra (código), brabo-qa (código), brabo-workspace (código) |
| brabo-broker | Único processo com o socket do Docker do servidor. | Imagem publicada por tag, usada pelo brabo e pelo brabo-infra. | brabo-contracts (contrato), brabo-qa (workflow), brabo-ci (workflow) | brabo (imagem, doc), brabo-infra (código), brabo-qa (código), brabo-workspace (código) |
| brabo-contracts | Contratos compartilhados — os pacotes `shared` e `docker-port`, `areas.json` e `fluxo.yml`. | Consumido por TAG (pacote no GitHub Packages ou arquivo baixado por raw na mesma tag); uma tag nova pede bump em api, web, runner, broker, engine, qa e infra. | brabo-api (contrato), brabo-ci (workflow) | brabo (doc), brabo-api (contrato), brabo-engine (contrato), brabo-web (contrato), brabo-runner (contrato), brabo-broker (contrato), brabo-infra (código), brabo-qa (contrato), brabo-workspace (código) |
| brabo-ci | Workflows reutilizáveis e a política de PR, escada de aprovação, promoção, tag e Dependabot. | Cada repo chama `uses: viralabs-dev/brabo-ci/...@<sha>`, fixado por SHA. | brabo-qa (contrato, workflow), brabo (contrato) | brabo (doc, workflow), brabo-api (workflow), brabo-engine (workflow), brabo-web (workflow), brabo-runner (workflow), brabo-broker (workflow), brabo-contracts (workflow), brabo-infra (workflow), brabo-qa (workflow), brabo-workspace (código, workflow) |
| brabo-infra | Composes, Dockerfiles de integração, `deploy/k8s`, scripts de dev, release e cadeia de suprimentos. | O brabo clona o brabo-infra no ref de `componentes.json` para subir a instalação; o brabo-api e o brabo-qa o clonam no CI. | brabo-api (código), brabo-engine (código), brabo-web (código), brabo-broker (código), brabo-runner (código), brabo-contracts (código), brabo (código), brabo-qa (workflow), brabo-ci (workflow) | brabo (imagem, código, doc), brabo-api (código), brabo-qa (código), brabo-workspace (código) |
| brabo-qa | E2E de navegador (Playwright), golden-sets e catálogo de funcionalidades — o portão da `main`. | O brabo-ci dispara o `e2e-pr` dele e lê o `funcionalidades.yml`; api, engine, web, broker e infra o chamam como portão. | brabo-api (código), brabo-engine (código), brabo-web (código), brabo-runner (código), brabo-broker (código), brabo-infra (código), brabo-contracts (contrato), brabo-ci (workflow) | brabo (doc), brabo-api (workflow), brabo-engine (workflow), brabo-web (workflow), brabo-broker (workflow), brabo-ci (contrato, workflow), brabo-infra (workflow), brabo-workspace (código) |
| brabo-workspace | Pasta-mãe `~/dev/brabo/` com os clones lado a lado e o `clonar-tudo.sh`. | Quem desenvolve roda `clonar-tudo.sh` uma vez; as sessões do Claude abrem nela. | brabo (código), brabo-api (código), brabo-engine (código), brabo-web (código), brabo-runner (código), brabo-broker (código), brabo-contracts (código), brabo-ci (código, workflow), brabo-infra (código), brabo-qa (código) | — |

```mermaid
flowchart LR
  brabo["brabo"]
  brabo_api["brabo-api"]
  brabo_engine["brabo-engine"]
  brabo_web["brabo-web"]
  brabo_runner["brabo-runner"]
  brabo_broker["brabo-broker"]
  brabo_contracts["brabo-contracts"]
  brabo_ci["brabo-ci"]
  brabo_infra["brabo-infra"]
  brabo_qa["brabo-qa"]
  brabo_workspace["brabo-workspace"]
  brabo -->|imagem| brabo_api & brabo_engine & brabo_web & brabo_broker & brabo_runner & brabo_infra
  brabo -->|código| brabo_infra
  brabo -->|doc| brabo_api & brabo_engine & brabo_web & brabo_runner & brabo_broker & brabo_contracts & brabo_infra & brabo_ci & brabo_qa
  brabo -->|workflow| brabo_ci
  brabo_api -->|contrato| brabo_contracts
  brabo_api -->|código| brabo_infra
  brabo_api -->|workflow| brabo_qa & brabo_ci
  brabo_engine -->|contrato| brabo_contracts
  brabo_engine -->|código| brabo_api & brabo_runner
  brabo_engine -->|workflow| brabo_qa & brabo_ci
  brabo_web -->|contrato| brabo_contracts & brabo_api
  brabo_web -->|workflow| brabo_qa & brabo_ci
  brabo_runner -->|contrato| brabo_contracts
  brabo_runner -->|workflow| brabo_ci
  brabo_broker -->|contrato| brabo_contracts
  brabo_broker -->|workflow| brabo_qa & brabo_ci
  brabo_contracts -->|contrato| brabo_api
  brabo_contracts -->|workflow| brabo_ci
  brabo_ci -->|contrato| brabo_qa & brabo
  brabo_ci -->|workflow| brabo_qa
  brabo_infra -->|código| brabo_api & brabo_engine & brabo_web & brabo_broker & brabo_runner & brabo_contracts & brabo
  brabo_infra -->|workflow| brabo_qa & brabo_ci
  brabo_qa -->|código| brabo_api & brabo_engine & brabo_web & brabo_runner & brabo_broker & brabo_infra
  brabo_qa -->|contrato| brabo_contracts
  brabo_qa -->|workflow| brabo_ci
  brabo_workspace -->|código| brabo & brabo_api & brabo_engine & brabo_web & brabo_runner & brabo_broker & brabo_contracts & brabo_ci & brabo_infra & brabo_qa
  brabo_workspace -->|workflow| brabo_ci
  classDef atual fill:#fde68a,stroke:#b45309,color:#000
  class brabo atual
```
<!-- mapa:fim -->

## Как собирается релиз

Релиз продукта рождается здесь, из тега `vX.Y.Z`, в workflow
[`release.yml`](.github/workflows/release.yml):

1. **[`componentes.json`](componentes.json)** закрепляет версию каждого
   компонента: ref `brabo-infra`, тег `brabo-runner` и тег каждого образа
   (api, engine, web, broker и backup).
2. **`imagem.json` каждого репозитория.** Релиз каждого тега приложения несёт
   `imagem.json` с `imagem`, `tag` и `digest`. Workflow скачивает все пять и
   собирает `images.json` продукта с образами, закреплёнными по digest.
3. **Trivy по digest.** Каждый образ сканируется по digest, и уязвимость HIGH
   или CRITICAL, у которой есть исправление, проваливает релиз до подписи.
4. **Подписанный `checksums.txt`.** `install.sh`, ассеты `brabo-install-*` и
   `images.json` попадают в один `checksums.txt`, подписанный cosign keyless
   идентичностью workflow. Именно эту подпись проверяет `install.sh`.

`workflow_dispatch` без тега — это репетиция: он собирает, сканирует и
проверяет всё, но не подписывает и не публикует.

## Документация

**📖 [viralabs-dev.github.io/brabo](https://viralabs-dev.github.io/brabo/prd/ru/)** — документация с навигацией и
поиском, на четырёх языках. Сайт объединяет папку `docs/` этого репозитория с
папками соседних и публикует два окружения: [`/prd/`](https://viralabs-dev.github.io/brabo/prd/ru/) из `main` и
[`/dev/`](https://viralabs-dev.github.io/brabo/dev/ru//) из `dev`. Для самого свежего состояния используйте `/dev/`.

| документ | для чего |
|---|---|
| [Введение](https://viralabs-dev.github.io/brabo/prd/ru/) | общая картина |
| [Первые шаги](https://viralabs-dev.github.io/brabo/prd/ru/getting-started) | от установки до первого хода агента |
| [Архитектура](https://viralabs-dev.github.io/brabo/prd/ru/architecture) | карта кода, границы, инварианты, технический долг |
| [Бизнес-правила](https://viralabs-dev.github.io/brabo/prd/ru/business-rules) | RN, каждое с `файл:строка` и тестом, который его покрывает (количество — в [португальском README](README.md)) |
| [Runbook](https://viralabs-dev.github.io/brabo/prd/ru/runbook) | deploy, rollout, восстановление, ротация ключа, инцидент расходов |
| [Глоссарий](https://viralabs-dev.github.io/brabo/prd/ru/glossary) | harness, gate, handoff, DEK, outbox, цикл K |
| [Наблюдаемость](https://viralabs-dev.github.io/brabo/prd/ru/explanation/observability) | как проследить действие через три процесса: trace, log и путь между слоями |
| [Конфигурация](https://viralabs-dev.github.io/brabo/prd/ru/reference/configuration) | все переменные окружения |
| [Скрипты](https://viralabs-dev.github.io/brabo/prd/ru/reference/scripts) | каждая команда `pnpm` и цель `Makefile`, извлечённые из исходников |
| [События](https://viralabs-dev.github.io/brabo/prd/ru/reference/events) | типы event log, broadcasts и spans |
| [Права](https://viralabs-dev.github.io/brabo/prd/ru/reference/permissions) | формат `permissions.json` и порядок принятия решения |
| [Артефакты](https://viralabs-dev.github.io/brabo/prd/ru/reference/artifacts) | схемы и кто может выпускать каждую |
| [Git-провайдеры](https://viralabs-dev.github.io/brabo/prd/ru/reference/git-providers) | контракт операций и capabilities |
| [Внутренний API](https://viralabs-dev.github.io/brabo/prd/ru/reference/internal-api) | контракт api ↔ engine |
| [Безопасность](SECURITY.md) | как сообщить об уязвимости |
| [Участие](CONTRIBUTING.md) | процесс, Definition of Done, что принимается |
| [Управление](GOVERNANCE.md) | модель сегодня (единственный мейнтейнер), три роли режима `community` и кто попадает в каждую |
| [Где получить помощь](SUPPORT.md) | какой канал для какой темы |
| [Кодекс поведения](CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 |

## Стек

- **api** — NestJS, Drizzle, PostgreSQL 16 с pgvector
- **engine** — Elixir/OTP, Phoenix и Oban (очереди в Postgres)
- **web** — React 19, Vite и TanStack
- **runner** — CLI `brabo-runner` на машине пользователя, который выполняет одобренные команды
- **broker** — единственный процесс с сокетом Docker, который поднимает контейнеры проектов
- **Ollama** — локальные модели в собственном контейнере
- **Neo4j** — необязательно: граф знаний, память, производная от event log
- **deploy** — Docker Compose (разработка, production и установка) и Kubernetes с Kustomize, в `brabo-infra`

Без Redis: очереди живут в Postgres через Oban, а rate limit — это скользящее
окно в SQL.

## Лицензия

[MIT](LICENSE) © 2026 Daniel Souza — официальный текст, без дополнительных
условий.

Образ engine включает сторонние инструменты, от которых зависят gates
(gitleaks, hadolint, semgrep, yamllint), **некоторые под GPL**. Запуск их
отдельным процессом ничего не «заражает», но **публикация образа** в registry
создаёт обязанность предоставить исходный код. Всё перечислено, с версией и
лицензией каждого, в [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Образ web включает три шрифта дизайн-системы, все под **OFL 1.1** — разрешающей
лицензией, которая всё же требует распространять уведомление об авторских
правах вместе с бинарником. Оно лежит в [`brabo-web`](https://github.com/viralabs-dev/brabo-web), в
`public/fonts/LICENSE.txt`, отдаётся вместе с остальной статикой, а
обязанность записана в том же файле уведомлений.
