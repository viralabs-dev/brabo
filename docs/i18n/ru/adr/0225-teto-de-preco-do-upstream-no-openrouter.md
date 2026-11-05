---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0225 — OpenRouter получает потолок цены на вызов (`provider.max_price` = каталог × 1,5)

## Статус

**Принято.** 2026-10-28 (AT-606, EP-026, решения владельца от 27.10). Тема: `llm`.
Расширяет [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) (который отправлял только
`provider.sort` и оставлял `max_price` отдельным продуктовым решением)
и сосуществует с [0221](0221-upstream-preso-por-sessao.md) (`session_id`), не
редактируя ни один из них. Следует
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md): capability
становится `true` только при доказательстве на реальном API.

## Контекст

В 18-м раунде TP-01 `deepseek/deepseek-v4.1-flash` прошёл через 17
upstream, и реальная стоимость была 1,85× каталожной; стоимость за миллион входа
колебалась от US$ 0,044 до 0,268. `session_id` из 0221 привязывает агента к обслужившему его
upstream, но может привязать его к ДОРОГОМУ upstream (Together, к которому прилип smoke
AT-580, стоит 2,1× каталожного входа и 2,9× выхода). `provider.max_price`
OpenRouter — это ФИЛЬТР по цене (US$ за миллион, вход и выход), который сочетается с
`sort`, являющимся ПОРЯДКОМ.

## Решение

1. Brabo отправляет `provider.max_price = { prompt, completion }` = **каталожная цена
   модели × 1,5**, на каждый вызов, в вызовах OpenRouter
   (`StreamLlmTurnUseCase`, `RunLlmTurnUseCase`, `SendChatMessageUseCase`).
   Коэффициент (`FATOR_DO_TETO_DE_PRECO`) **зашит в код** и **включён по умолчанию**
   для каждой модели с каталожной ценой > 0 на обоих концах; цена 0
   (неизвестна) потолок не отправляет. При 1,5 проходят около 11 из 41 endpoint
   deepseek, а Together и те, что от US$ 0,30+, остаются вне. Смена коэффициента — новый
   ADR.
2. Новая capability `priceCeiling` в `LLMProviderCapabilities`, `false` у остальных
   девяти провайдеров и `true` у OpenRouter после smoke
   `openrouter-provider.teto.smoke.spec.ts`. Объявление её без хука
   `campoDeTetoDePreco` падает при конструировании. Объект `provider` потолка
   СЛИВАЕТСЯ с объектом `sort` (раскладка их рядом стёрла бы `sort`).
3. **404 из-за отсутствия upstream в потолке**: 404 вызова с потолком становится
   ИМЕНОВАННОЙ ошибкой `LLMPriceCeilingError` (`code: price_ceiling`), отличной от
   `LLMModelNotFoundError`. Три use case **повторяют ОДИН раз без потолка**
   (в том же цикле RN-916), записывают `token_usage.price_ceiling_factor` пустым
   в этой строке и предупреждают в логе; ход не падает из-за ценовой политики.
4. **Метеринг:** `token_usage.price_ceiling_factor` (`real`, nullable) фиксирует
   коэффициент, который УШЁЛ В ПРОВОД, по образцу `routing_preference` (RN-583). `null` =
   ничего не отправлено.
5. **Вне объёма**: фильтр квантизации (качество по upstream не измерялось, и
   это был бы второй критерий), `provider.only`/`ignore` (кураторский список на модель
   стареет сам и требует карты имя→slug) и `order` (отключает sticky). Jev
   (ADR 0179) потолок не получает.

## Последствия

- `sort` выбирает порядок среди дешёвых; `session_id` удерживает upstream;
  потолок убирает дорогие из розыгрыша, когда прилипание падает.
- Устаревшая или ручная каталожная цена (`manual_pricing`) даёт неверный потолок; без
  upstream в потолке повтор без потолка измеряет превышение (строка с пустым коэффициентом).
- DTO `GET /llm/provider-capabilities` получает `priceCeiling`.

## Ссылки

- [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) — предпочтение
  маршрутизации.
- [0221](0221-upstream-preso-por-sessao.md) — `session_id`.
- [RN-917](../business-rules/api.md#rn-917).
