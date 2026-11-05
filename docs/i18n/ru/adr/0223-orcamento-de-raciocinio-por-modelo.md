---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0223 — Бюджет рассуждения — capability НА МОДЕЛЬ, курируемая вручную

## Статус

**Принято.** 2026-10-22 (AT-569, EP-026, вариант C владельца). Тема: `llm`. Следует
[0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) и
[0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) (capability
утверждается только при доказательстве; ручная курация) и пересматривает, не редактируя её,
[RN-782](../business-rules/api.md#rn-782) через [RN-914](../business-rules/api.md#rn-914).

## Контекст

PO на `deepseek/deepseek-v4.1-flash` потратил 8192 из 8192 токенов только на
рассуждение, три раза подряд, и ни одна история не была создана (TP-01 18-й). RN-782
убрала поле `reasoning` у всех моделей, потому что у Haiku оно игнорировалось
или включало рассуждение. Платное измерение от 22.10 (16 вызовов, id генераций в
`~/brabo-gravacoes/raciocinio-smoke-2026-10-22/resultados.jsonl`,
сверены через `GET /api/v1/generation`) разделило модели.

## Решение

1. Capability `reasoningBudget` НА МОДЕЛЬ: колонка `models.reasoning_budget`
   (целое, `NULL` = не доказано), курируется вручную миграцией, никогда не
   обнаруживается — upsert синхронизации её не пишет.
2. `qwen/qwen3.7-flash` = доказано: `reasoning: { max_tokens: N }` соблюдено
   точно (запрошено 1024, 1024 в `native_tokens_reasoning`, в обоих вызовах).
   N = **2048**. `buildBody` отправляет поле только для модели с бюджетом, с
   `max_tokens` = видимый вывод + N (RN-741).
3. `deepseek/deepseek-v4.1-flash` = `NULL` по измерению: `reasoning.max_tokens`
   (1024 и 256), `reasoning.effort` и `reasoning_effort` дали те же 8192
   рассуждения, без текста и без tool call. Остаётся вне по доказательству, а не по упущению; его
   сдерживание по-прежнему — `reasoningOff` (RN-783/838).
4. `effort` никогда не используется: игнорируется в qwen (1191 против 643 без поля) и в
   deepseek.
5. Оговорка по qwen: лимит содержит рассуждение, но НЕ гарантирует tool call —
   на сложном промпте он продолжил думать в видимом тексте (11 551 символ)
   и исчерпал потолок, не вызвав инструмент.

## Последствия

- Модель без бюджета: тело байт в байт как прежде (RN-782).
- Отметка другой модели требует собственного smoke, указанного в PR.
- Хвост: грань thinking на экране каталога не показывает бюджет.

## Ссылки

- [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md),
  [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md).
- [RN-782](../business-rules/api.md#rn-782), [RN-914](../business-rules/api.md#rn-914).
