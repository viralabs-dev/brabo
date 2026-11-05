---
traducao_de: e7f079cf5c07cda04fd640b5b0ee1bc41aeb181c
---

# ADR 0227 — OpenCode Zen входит как 11-й LLM-провайдер, только в диалекте OpenAI

## Статус

**Принято.** 2026-10-29 (AT-568, EP-026). Тема: `llm`. Расширяет
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) и
[0222](0222-provider-9router-de-llm.md) (список провайдеров, который растёт с десяти
до одиннадцати), не редактируя их, и следует
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) и
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): capability
становится `true` только при доказательстве на реальном API, а каталог — курация.

## Контекст

OpenCode Zen — шлюз моделей с линейкой моделей `-free`. Публичная документация
показывает три диалекта: `/chat/completions` (OpenAI, на
`https://opencode.ai/inference/openai/v1`), `/responses` и `/v1/messages`
(Anthropic), а также Google. База `OpenAICompatibleProvider` говорит только на
`/chat/completions`, а список моделей (`/inference/v1/models`) находится не в
`{baseUrl}/models`, куда обращается база. Среди бесплатных только
`deepseek-v4.1-flash-free` и `glm-5.3-flash-free` заявляют нулевое хранение и отсутствие
обучения на данных.

**Измерено 29.10.2026 на реальном ключе (smoke):** обе бесплатные модели
отвечают на сторонний API `429 FreeUsageLimitError`: «Free usage limit
reached. Free models work in OpenCode (https://opencode.ai); subscribe to
OpenCode Go to keep going». То есть бесплатное действует только ВНУТРИ клиента OpenCode,
не через API. Провайдер нормализовал верную ошибку (`rate_limit`, с сообщением
upstream). Платные модели Zen требуют баланса на счёте или подписки OpenCode
Go; этот путь НЕ доказан.

## Решение

1. **Только диалект OpenAI.** `opencode-zen` — это `OpenAICompatibleProvider` с
   базой `https://opencode.ai/inference/openai/v1` и `Authorization: Bearer`.
   Модели `/responses`, `/messages` и Google остаются вне, как и Jev
   для Zen (`ToolRouter` только у OpenRouter, ADR 0179).
2. **`listModels: false`.** Маршрут моделей другой и публичный; каталог берётся
   из курируемого seed. По той же причине тест соединения учётных данных не
   объявляет для него теста: публичный GET прошёл бы с недействительным ключом.
3. **Seed без моделей.** Две бесплатные с нулевым хранением удалены из seed
   29.10.2026: поставщик отказывает в бесплатном через API (429 выше). Платная модель
   входит ручной курацией на экране (ADR 0042), с реальной ценой. Capabilities
   рождаются `false`.
4. **Capabilities `false`, кроме `streaming`** (которого требует контрактный набор)
   и `streamOptionsIncludeUsage: false`, пока smoke с `OPENCODE_ZEN_TEST_KEY`
   не докажет tool call и `usage` на `deepseek-v4.1-flash-free` и
   `glm-5.3-flash-free`.

## Последствия

- Список провайдеров становится одиннадцатью в enum (миграция 0077), реестре,
  web и документации.
- Бесплатная модель «на ограниченное время»: каталог стареет сам, без
  синхронизации; пропавшая модель становится ошибкой upstream, нормализованной.
- Пока smoke не пройден, провайдер общается текстом и не годится для агента
  с инструментами. Smoke был запущен 29.10.2026 и проваливается из-за 429 поставщика.

## Ссылки

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — список
  провайдеров.
- [0222](0222-provider-9router-de-llm.md) — предыдущий провайдер, образец для этого.
