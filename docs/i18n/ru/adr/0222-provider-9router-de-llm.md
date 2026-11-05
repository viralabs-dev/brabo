---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0222 — 9Router входит как 10-й LLM-провайдер, с URL на установку

## Статус

**Принято.** 2026-10-22 (AT-576a, EP-026). Тема: `llm`. Расширяет
[0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) (список
провайдеров, который растёт с девяти до десяти), не редактируя его, и следует
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) и
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): capability
становится `true` только при доказательстве на реальном API, а цена — ручная
курация.

## Контекст

9Router — локальный шлюз владельца (Node, MIT) с OpenAI-совместимым
endpoint `http://localhost:20128/v1` и маршрутизацией по комбо. Он
работает ВНЕ compose, на машине владельца, и использует его аккаунты и
подписки. В отличие от девяти облачных провайдеров, адрес не фиксирован.

## Решение

1. **URL на установку.** `NINE_ROUTER_BASE_URL`, по умолчанию
   `http://host.docker.internal:20128/v1` (по образцу `OLLAMA_HOST`), читается
   провайдером и тестом соединения. Compose установки и продакшена
   получают `extra_hosts: host.docker.internal:host-gateway` в api.
2. **Обязательные учётные данные.** API-ключ создаётся в панели 9Router;
   провайдер входит в `LLM_PROVIDER_NAMES_COM_CREDENCIAL`. Чтение или создание комбо
   через панель потребовало бы его ПАРОЛЬ как второй секрет и остаётся вне объёма
   (576b).
3. **Ручная цена, по публичной цене.** Ответ не содержит стоимости. По
   решению владельца (22.10) модель по подписке записывает **публичную цену
   эквивалентного API**, а не ноль: бюджет учитывает альтернативную стоимость. Это
   курация (ADR 0042), никогда не обнаружение.
4. **Capabilities `false` до smoke** (`toolCalling`, `routingPreference`,
   `embeddings`, `promptCaching`, `stickySession`), с `listModels: true` и
   `streaming: true` (контрактный набор требует `streaming` от каждого провайдера) и собственным парсером `capabilities` из `GET /v1/models`.
5. **Token Saver выключен.** RTK Token Saver сжимает `tool_result`; провайдер
   отправляет `x-9router-token-saver: off` в каждом вызове, а smoke проверяет, что
   `tool_result` приходит нетронутым. Smoke и TP-01 — только с моделями
   `free`/`auto:free`.

## Последствия

- Список провайдеров становится десятью в enum, миграции, реестре, web и
  документации.
- Недоступность 9Router — нормализованная ошибка инфраструктуры, как у любого провайдера.
- Значение заголовка Token Saver в источнике не найдено
  (**TODO(humano)**): ответ даёт smoke — действует ли `off`.

## Ссылки

- [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) — список
  провайдеров.
- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — маршрутизация
  принадлежит хабу; комбо — это не `provider.sort`.
- [RN-909](../business-rules/api.md#rn-909).
