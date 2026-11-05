---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0221 — Хаб привязывает разговор каждого агента к обслужившему его upstream по `session_id`

## Статус

**Принято.** 2026-10-21 (AT-580). Тема: `llm`. Расширяет
[0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) (который отправлял только
`provider.sort`; его docblock говорил, что остальные поля объекта
`provider` — отдельное продуктовое решение), не редактируя его, и следует
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) и
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md): capability
становится `true` только при доказательстве на реальном API.

## Контекст

В TP-01 18-го раунда одну и ту же модель обслужили 17 разных upstream,
и попадание в кэш у dev-агентов упало. У OpenRouter уже есть нужная
память (*provider sticky routing*): он привязывает разговор к обслужившему его upstream и
переходит к следующему, только если тот откажет, при 10 минутах бездействия.
Без `session_id` «разговор» — это хэш первого сообщения `system` плюс
первого не-`system`, а прилипание включается лишь после попадания в кэш; каждая
задача dev открывается другим первым сообщением, поэтому каждая выбирала
новый upstream. С `session_id` в теле (до 256 символов) прилипание включается на
первом успешном ответе.

## Решение

1. Brabo отправляет `session_id` = `brabo:<sessionId>:<agentId>` (без агента —
   `brabo:<sessionId>`) в вызовах OpenRouter, собираемый в
   `StreamLlmTurnUseCase` и `RunLlmTurnUseCase` (`chaveDeSessao`) и передаваемый в
   `ChatOptions.sessionKey`. **По агенту + сессии**, никогда по проекту:
   у каждого агента свой префикс (инструкции + инструменты), и смешение двух
   в одном прилипании не даёт выигрыша в кэше.
2. Новая capability `stickySession` в `LLMProviderCapabilities`, обязательная
   у девяти провайдеров, `false` у восьми; у OpenRouter она `true` после
   smoke `openrouter-provider.sessao.smoke.spec.ts` (6 из 6 вызовов на одном
   upstream с ключом, 4 upstream из 6 без него). Объявление её без хука
   `campoDeSessao` падает при конструировании.
3. **Вне объёма**: `provider.order`, `only` и `allow_fallbacks` — `order` отключает
   sticky routing, требует slug (а мы записываем имя frame), и выбор
   «лучшего» потребовал бы читать `token_usage` на каждый вызов (потолок ADR 0060). Добавляется
   как эволюция только если измерение после поставки покажет, что прилипший upstream
   плох.
4. Без таблицы, без engine: ключ выводится из `token_usage`
   (`session_id` + `actor_id`), а память хранит хаб. Jev (ADR 0179) ключ
   не получает.

## Последствия

- `routingPreference` (`sort`) сосуществует: `sort` выбирает первый
  upstream, прилипание удерживает его.
- Прилипание действует как для неявного, так и для явного кэша (RN-892).
- Ожидание gate или одобрения более 10 минут отпускает прилипание; следующий
  выбор — за хабом.
- DTO `GET /llm/provider-capabilities` получает `stickySession`.

## Ссылки

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — предпочтение
  маршрутизации.
- [RN-907](../business-rules/api.md#rn-907).
