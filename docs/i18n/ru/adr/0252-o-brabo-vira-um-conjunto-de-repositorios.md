---
traducao_de: 58f20f24eac7374db995438e278dbf37663f42f5
---

# ADR 0252 — Brabo становится набором репозиториев в `viralabs-dev`

- **Статус:** принято
- **Дата:** 2026-11-04
- **Ссылается на:** ADR [0030](0030-politica-de-branches-mecanizada.md), [0117](0117-lockfile-proprio-para-o-website.md), [0119](0119-imagens-publicadas-no-ghcr-por-digest.md), [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md), [0130](0130-broker-de-container.md), [0149](0149-assinatura-dos-artefatos-publicados.md), [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md), [0202](0202-o-indice-de-adr-por-tema.md) и [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md). Ни один из них не редактируется: каждый остаётся в силе для репозитория, наследующего предмет, а путь к файлу меняется без смены решения.

## Контекст

Монорепозиторий объединяет api, engine, web, runner, broker, инфраструктуру, документацию и E2E в одной истории, с одной версией и одним конвейером. Владелец решил 02.11.2026 (EP-033, AT-688) разделить его на репозитории в организации `viralabs-dev`. Обследование — в заметке AT-688 хранилища; этот ADR фиксирует решение и карту. **Состояние: решено, в миграции (волна A). Ничего пока не разделено.**

## Решение

1. **Новые репозитории, все ПУБЛИЧНЫЕ, с префиксом `brabo-`:** `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-runner`, `brabo-broker`, `brabo-contracts`, `brabo-ci`, `brabo-infra`, `brabo-qa` и `brabo-workspace`. Ни один не использует `infra-viralabs`.
2. **Что несёт каждый:**
   - `brabo-api`: `apps/api`, `gates.yml`, `openapi.json`; `brabo-engine`: `apps/engine`, `prompts/`, fixtures golden-sets; `brabo-web`: `apps/web`, `design/`; `brabo-runner`: `apps/runner` и сборка и публикация бинарников; `brabo-broker`: `apps/broker`.
   - `brabo-contracts`: `packages/shared`, `packages/docker-port`, источник `agent-areas` и `fluxo.yml`, потребляемый как git-зависимость по ТЕГУ.
   - `brabo-ci`: политика PR и веток, лестница, архивирование, Dependabot и шаблоны сообщества, как переиспользуемые workflows (`workflow_call`).
   - `brabo-infra`: compose, `deploy/k8s`, `Makefile`, `scripts/dev`, бэкап и оркестратор локальных клонов.
   - `brabo-qa`: `e2e/`, golden-sets, `scripts/jev`, `scripts/idioma` и сценарий TP-01.
   - `brabo-workspace`: родительская папка, с `CLAUDE.md`, скриптами клонирования и ярлыками.
3. **Точка входа: `viralabs-dev/brabo`** (уже существующий пустой репозиторий, ставший публичным). Несёт всю документацию (сайт и README), `install.sh`, RELEASE продукта и CHANGELOG продукта. Сайт находится на `viralabs-dev.github.io/brabo`. Устанавливающему нужно знать только этот репозиторий.
4. **У каждого репозитория своя документация, и он требует её в том же PR, что и код:** `docs/` и RN живут в репозитории — владельце кода, `docs:check` каждого проверяет свою, а `brabo` лишь собирает папки и публикует сайт.
5. **Версии:** у каждого репозитория своя, а у продукта своя, в `brabo`. Все начинают заново с **1.0.0**.
6. **История:** извлечение С историей (`git filter-repo`); `#NNN` становится `daneiel/brabo#NNN`.
7. **Наследие:** `daneiel/brabo` ПЕРЕДАЁТСЯ организации как `viralabs-dev/brabo-legacy`; локально старый checkout уходит в `~/dev/brabo/brabo-old`.
8. **Бот:** GitHub App организации, с этого момента, вместо личного токена (жест владельца в AT-689).
9. **AT-662** (сайт без Docusaurus) выполняется ДО разделения.
10. **Порядок волн:** A (ADR и контекст, фиксированный владелец вне кода, изолированные контракты, AT-662) → B (документация внутри каждой области, `brabo-contracts`, `brabo-ci`) → C (api, engine, web, runner, broker, workspace) → D (infra, `brabo`, qa, CLAUDE.md на репозиторий, хранилище) → E (скоординированный релиз 1.0.0, передача наследия, локальная установка) → F (миграция локальной папки, самостоятельно).

## Что НЕ меняется

Никакое поведение продукта, никакое бизнес-правило и никакой абсолютный потолок (RN-418, ручной merge в защищённую ветку, `decide.ts`). Правило «не версионировать вручную» действует по репозиторию. Конвейер `dev → main` (ADR 0235) действует по репозиторию.

## Последствия

- Правила документации в `CLAUDE.md` меняют природу при миграции: docmap перестаёт проверяться в том же PR между репозиториями, а подсчёты и привязанные фразы читают восстановленный layout. Каждая волна корректирует то, чего касается.
- Цепочка поставок (пространство имён GHCR, идентичность cosign, `images.json`) меняет владельца вместе с репозиторием релиза.
- `CLAUDE.md` и память делятся по репозиториям (AT-708); до тех пор действуют те, что в корне.
