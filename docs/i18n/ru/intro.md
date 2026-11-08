---
id: intro
title: Что такое Brabo
sidebar_label: Введение
sidebar_position: 1
slug: /
description: Платформа, которая оркестрирует ИИ-агентов, ведущих полный жизненный цикл приложения, оставляя последнее слово за человеком.
keywords: [brabo, агенты ИИ, инженерия, оркестрация, одобрение]
tipo: conceito
traducao_de: c724b4226dc3d2dc6876c186a74cdb5db4192ba8
---

# Что такое Brabo {#o-que-é-o-brabo}

Brabo ведёт полный жизненный цикл приложения, от брифа до деплоя, с командой
ИИ-агентов, работающих над настоящим git-репозиторием. **Последнее слово за
вами**, и это свойство архитектуры, а не лозунг. Каждый агент отвечает за одну
роль (Criativo, PO, Arquiteto, разработчики, QA, SecOps), и ничто с внешним
эффектом не происходит в обход политики проекта.

## Чем он отличается от ассистента для кода

- **Ничто с внешним эффектом не происходит само.** Команда, commit, push, PR, merge
  и расход токенов рождаются как `proposed_action` и проходят через политику, где
  `deny` всегда сильнее `allow`. Merge в защищённую ветку не разрешает даже политика.
- **Агенту нельзя доверять по построению.** Ограничения структурные: потолок
  итераций, бюджет, который отказывает в вызове, закрытый каталог того, что
  может делать каждый агент. Промпт — не гарантия; код — гарантия.
- **Всё записывается и неизменяемо.** Event log работает только на добавление, и именно он
  делает стоимость проверяемой, а доказательства — прослеживаемыми.
- **Команда улучшается при вашем участии.** Psicólogo и Anamnese предлагают
  изменения в инструкциях агентов, и каждое действует только с вашего одобрения.

## Один ход, от начала до конца

```mermaid
sequenceDiagram
  participant U as Você
  participant W as web
  participant A as api
  participant E as engine
  participant L as LLM

  U->>W: abre uma sessão
  W->>A: POST /sessions
  A->>A: grava session.created (event log + outbox)
  A-->>E: Oban consome a outbox
  E->>E: sobe o SessionServer, monta o contexto (Harness)
  E->>L: turno
  L-->>E: "quero rodar esta ferramenta"
  E->>A: vira proposed_action
  A->>A: política: IAM → autonomy → permissions.json
  A-->>U: pede aprovação (ou aplica um teto)
  U->>A: aprova
  A-->>E: executa
  E->>A: evento imutável
  A-->>W: broadcast — o painel atualiza
```

## С чего начать

| вы хотите | перейдите к |
|---|---|
| **использовать** Brabo: установить и выполнить первый ход | [Первые шаги](getting-started.md) |
| **понять**, как он устроен и что гарантирует | [Архитектура](architecture.md) и [Гейты](explanation/gates.md) |
| **повторить** идею в собственном продукте, в нескольких репозиториях | [Оркестрация репозиториев](tutorials/orquestrar-repositorios/index.md) |

Хотите работать с кодом Brabo? См. [Разработка Brabo](how-to/desenvolver-o-brabo.md).

Текущая версия: **v2.0.0** — [заметки о релизе](https://github.com/viralabs-dev/brabo/releases)
