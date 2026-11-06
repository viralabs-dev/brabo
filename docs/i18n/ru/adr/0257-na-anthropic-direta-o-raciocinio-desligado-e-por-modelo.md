---
traducao_de: ef03b3bddfbc5314b59e4ccc957c774fc5d9f8db
---

# ADR 0257 — В прямом Anthropic отключённое рассуждение задаётся по модели, а усилие снижает Opus

- **Статус:** принято
- **Дата:** 2026-11-05
- **Тема:** `llm`
- **Ссылается на:** ADR [0223](0223-orcamento-de-raciocinio-por-modelo.md) (пересматривает пункт 4, «`effort` никогда не используется», только для provider `anthropic`; 0223 не редактируется), ADR [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md), RN-741, RN-782, RN-783 и RN-916, а также RN-1000, которая заменяет их для этого provider (AT-739, EP-030, решения владельца от 05.11.2026).

## Контекст

В TP-01 от 05.11 10 из 10 задач dev-агентов на Haiku 5.5 заблокировались с «ответ только из рассуждения». Адаптер Anthropic опускал `thinking` при отключённом рассуждении (RN-783), потому что «`disabled` — это 400 в 5.5». Но в моделях адаптивного мышления пропуск означает адаптивный режим со стандартным усилием. А 400 действует для Sonnet и Opus 5.5, а не для Haiku 5.5. При включённом адаптивном режиме `max_tokens` составлял 4096 ВСЕГО и обрезал Infra. `reasoning_tokens` выходил NULL.

## Решение

1. При отключённом рассуждении тело задаётся по модели:
   - Haiku 5.5: `thinking: disabled`;
   - Sonnet 5.5: `thinking: between_tools`;
   - Opus 5.5: `output_config.effort: low`, объявлено как СНИЖЕННОЕ, а не отключённое;
   - неизвестная адаптивная модель: стандарт модели, пока нет доказательства.
2. Для этого provider `effort` начинает использоваться, и только в Opus 5.5 с отключённым рассуждением. Агенты, которые рассуждают, остаются на стандартном усилии модели.
3. Адаптивный включённый режим и случаи, которые всё ещё думают: `max_tokens` = видимый вывод + (`reasoningBudget` ?? 4096), запас из RN-741.
4. Provider объявляет `aceitaRaciocinioDesligado` (RN-916).
5. `reasoning_tokens` = `thinking_tokens` последнего `message_delta`, только когда это целое ≥ 0; иначе опускается и остаётся NULL (RN-666).

## Последствия

- Доказательство: платный smoke от 05.11, около 0,009 долл. США (PR #12 в `brabo-api`):
  - Haiku, Sonnet и Opus 5.5 приняли с одним инструментом;
  - `disabled` в Opus 5.5 дал 400;
  - смена `system` с повторно отправленным блоком рассуждения принята.
- В Opus 5.5 повтор без рассуждения из RN-916 лишь СНИЖАЕТ рассуждение.
- Новая модель Anthropic входит в таблицу по модели только с собственным smoke, указанным в PR.

## Ссылки

- [0223](0223-orcamento-de-raciocinio-por-modelo.md), [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md).
- Официальная документация: <https://platform.claude.com/docs/en/build-with-claude/effort> и <https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost>.
