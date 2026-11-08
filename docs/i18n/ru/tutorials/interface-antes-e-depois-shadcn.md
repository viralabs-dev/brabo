---
tipo: historico
traducao_de: c262a6ba5d5df58cf58dd0092a43c2cbcd3763e2
title: Интерфейс до и после shadcn (31.10.2026)
description: Запись экранов и сессии Criativo до и после миграции примитивов на shadcn/ui (ADR 0232) и исправления инструментов в 9Router (RN-950).
---

# Интерфейс до и после shadcn (31.10.2026)

Визуальная запись раунда, который сменил основу фронтенда на shadcn/ui с Base UI
([ADR 0232](../adr/0232-shadcn-com-base-ui-no-apps-web.md)) и в тот же день
заставил 9Router получать инструменты агентов
([RN-950](../business-rules/api.md#rn-950)). **До** — это установка с `dev`
утра 31.10; **после** — `dev` `5851354c7c`, где собственные примитивы
(`Button`, `Badge`, `Card`, `Alert`, `Table`, `Input`, `Select`, `Modal`,
`Disclosure`, вкладки) уже обслуживаются компонентами shadcn.

Как записывалось: браузер без интерфейса (Playwright) против локальной установки,
на новой тестовой учётной записи, экраны 1440×900 в обеих темах. Чат использует 9Router
с бесплатной моделью (`ollama/gpt-oss:120b`), без затрат.

## Прогулка по экранам

Вход, главная, Containers, Providers, Account и Status — сначала в тёмной теме, затем
в светлой. Цель миграции — **чтобы ни один экран не менялся**; между
двумя записями меняются данные (тестовый проект, созданный между записями)
и новая страница Gastos.

| До | После |
|---|---|
| ![Прогулка до](../assets/shadcn-antes-depois/percurso-antes.gif) | ![Прогулка после](../assets/shadcn-antes-depois/percurso-depois.gif) |

![Account, светлая тема: до слева, после справа](../assets/shadcn-antes-depois/comparacao-04-conta-light.png)

![Providers, светлая тема: до слева, после справа](../assets/shadcn-antes-depois/comparacao-03-providers-light.png)

## Сессия Criativo

Один и тот же разговор в обеих установках: Criativo открывает сессию, получает идею
(«приложение для хранения рецептов моей бабушки»), затем аудиторию и
требования.

- **До:** 9Router не получал инструменты, и модель писала их как
  текст (блок `declare_open_question` в YAML в ленте). Ни одно бизнес-правило
  не было записано: боковая панель остаётся на нуле.
- **После:** Criativo вызывает инструменты по-настоящему. Вопрос становится
  структурированной формой, а панель показывает записанные бизнес-правила.

| До | После |
|---|---|
| ![Чат Criativo до](../assets/shadcn-antes-depois/chat-criativo-antes-dark.gif) | ![Чат Criativo после](../assets/shadcn-antes-depois/chat-criativo-depois-dark.gif) |

![Второй ответ Criativo: до слева, после справа](../assets/shadcn-antes-depois/comparacao-12-chat-resposta-2-dark.png)

## Новая страница Gastos

Глобальной страницы `/spend` ([RN-952](../business-rules/api.md#rn-952)) в версии «до»
не существовало. В записи «после» она появляется без полей страницы — содержимое
прижато к боковой панели; дефект зафиксирован для исправления.

![Gastos, светлая тема, после](../assets/shadcn-antes-depois/depois-gastos-light.png)
