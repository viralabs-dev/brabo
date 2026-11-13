---
id: adr-index
title: Архитектурные решения (ADR)
sidebar_label: Индекс ADR
sidebar_position: 0
description: 282 записи архитектурных решений Brabo, сгруппированных по темам, с тем, что решила каждая из них.
keywords: [ADR, архитектурное решение, архитектура, история]
traducao_de: d7d790431657e61a049b452214cfd432da2199df
---

# Архитектурные решения

ADR фиксирует, **почему** что-то было решено, в тот момент, когда это было решено.
Они **неизменяемы**: ни один ADR не редактируется после принятия. Когда
решение меняется, появляется новый ADR, заменяющий предыдущий, — так произошло
с [0018](0018-noop-dev-agent-modo-de-execucao.md), который фиксирует
замену NoopDevAgent, решённую в [0011](0011-infra-dev-agents-worktrees-merge-lock.md).

Практическое следствие: **ADR может описывать состояние, которое уже не является
текущим.** Для текущего состояния используйте [Бизнес-правила](../business-rules.md),
[Архитектуру](../architecture.md) и [Runbook](../runbook.md). За
ходом рассуждений — сюда.

Таблица ниже **сгенерирована** (`pnpm docs:generate`, [ADR 0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md)): номер, название и статус каждого ADR, под одной темой. Пользуйтесь фильтром по теме и статусу или поиском по сайту. Полный текст каждого решения находится в самом ADR.

Статус берётся из раздела `## Status` ADR; без него действует **принято**. Тема хранится в `docs/adr/temas.yml`, рядом с этой страницей, а не в ADR, потому что принятый ADR никогда не редактируется ([ADR 0202](0202-o-indice-de-adr-por-tema.md)); `pnpm docs:check` отклоняет ADR без темы.

<!-- BEGIN:GENERATED:indice-de-adr -->
**Темы:** [Git, репозиторий и политика веток](#tema-git) · [Harness агента, ходы и сессии](#tema-agentes) · [Команда агентов — роли, области и handoff](#tema-time) · [Gates, QA и ревью безопасности](#tema-gates) · [Исполнение, политика терминала и одобрения](#tema-execucao) · [Где живёт код — режимы исполнения](#tema-modos) · [Контейнер проекта и broker](#tema-container) · [Локальный runner](#tema-runner) · [Аутентификация, доступ и секреты](#tema-iam) · [LLM-провайдеры, модели и расходы](#tema-llm) · [RAG, граф знаний и артефакты](#tema-conhecimento) · [Web-интерфейс и дизайн-система](#tema-web) · [Эксплуатация, deploy и установка](#tema-operacao) · [CI, релиз и цепочка поставок](#tema-engenharia) · [Документация](#tema-docs)

<div class="adr-filtro" data-adr-filtro hidden><label>Тема <select data-adr-tema><option value="">Все</option><option value="tema-git">Git, репозиторий и политика веток</option><option value="tema-agentes">Harness агента, ходы и сессии</option><option value="tema-time">Команда агентов — роли, области и handoff</option><option value="tema-gates">Gates, QA и ревью безопасности</option><option value="tema-execucao">Исполнение, политика терминала и одобрения</option><option value="tema-modos">Где живёт код — режимы исполнения</option><option value="tema-container">Контейнер проекта и broker</option><option value="tema-runner">Локальный runner</option><option value="tema-iam">Аутентификация, доступ и секреты</option><option value="tema-llm">LLM-провайдеры, модели и расходы</option><option value="tema-conhecimento">RAG, граф знаний и артефакты</option><option value="tema-web">Web-интерфейс и дизайн-система</option><option value="tema-operacao">Эксплуатация, deploy и установка</option><option value="tema-engenharia">CI, релиз и цепочка поставок</option><option value="tema-docs">Документация</option></select></label> <label>Статус <select data-adr-status><option value="">Все</option><option value="принято">принято</option><option value="предложено">предложено</option></select></label></div>

## Git, репозиторий и политика веток {#tema-git}

Контракт git-провайдера, рождение и усыновление репозитория, защита и политика веток.

| № | решение | статус |
|---|---|---|
| [0001](0001-git-provider-contract-shape.md) | Формат нормализованного контракта GitProvider | принято |
| [0002](0002-git-error-normalization.md) | Нормализация ошибок GitProvider | принято |
| [0003](0003-git-provider-retry-policy.md) | Политика повторов для удалённых providers | принято |
| [0004](0004-git-credential-registration.md) | Регистрация git-учётных данных пользователя | принято |
| [0005](0005-repo-bootstrap-idempotent-steps.md) | Идемпотентный и возобновляемый bootstrap Gitflow | принято |
| [0028](0028-protecao-de-branch-divergencia-entre-providers.md) | Защита веток: расхождение между providers и матрица одобрения | принято |
| [0030](0030-politica-de-branches-mecanizada.md) | Механизированная политика веток | принято |
| [0044](0044-adocao-de-repositorio-existente.md) | Усыновление существующего репозитория и план как шлюз | принято |
| [0056](0056-o-engine-trabalha-em-repositorio-remoto.md) | Engine работает в удалённом репозитории | принято |
| [0139](0139-o-alarme-de-esteira-ganha-destinatario.md) | Сигнал тревоги о merge конвейера получает адресата и правило для `dev` | принято |
| [0165](0165-o-repositorio-nasce-no-handoff-ao-arquiteto.md) | Репозиторий рождается при принятии handoff Arquiteto, и исполнение без него не начинается | принято |
| [0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) | Автоматическое продвижение `dev` → `qa`, пока QA находится в тестовой фазе | принято |
| [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md) | `qa` пока выводится из обращения, а конвейер репозитория становится `dev → main` | принято |
| [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) | Dependabot освобождается от ревью в `dev` и становится пригоден к merge при зелёных остальных проверках | принято |
| [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) | Политика PR обязательна во всех репозиториях, а PR регенерации от бота освобождается от лестницы в dev | принято |
| [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md) | O projeto do usuário trabalha em trunk, e a pasta acompanha a main | принято |
| [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) | O E2E do brabo-qa é portão da main, com aceite justificado | принято |
| [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) | A PR declara de que PR de outro repo depende, e um check do App espera o merge | принято |
| [0284](0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) | A promoção infere as dependências pela ordem dos repos | принято |
| [0292](0292-o-merge-automatico-e-opcao-do-projeto-desligada-por-padrao.md) | O merge automático é opção do projeto, desligada por padrão | принято |

## Harness агента, ходы и сессии {#tema-agentes}

Как работает агент — контекст, цикл инструментов, разговорный ход, сессия и её состояния.

| № | решение | статус |
|---|---|---|
| [0006](0006-prompt-assembler-context-harness.md) | Harness агентов: детерминированная сборка контекста | принято |
| [0007](0007-toolloop-tools-context-manager.md) | ToolLoop, инструменты, ContextManager (harness с LLM) | принято |
| [0061](0061-tipo-da-sessao-na-criacao.md) | Тип сессии — это данные создания, а выполнение остаётся событием | принято |
| [0098](0098-limites-de-transporte-e-janela-efetiva-de-compactacao.md) | Согласованные пределы транспорта и эффективное окно сжатия | принято |
| [0163](0163-o-clique-responde-ao-aceitar.md) | Клик отвечает при ПРИНЯТИИ команды, а ход продолжается через канал | принято |
| [0175](0175-infra-lead-conversa-pelo-composer.md) | Infra Lead разговаривает через composer, а прежде его ход проходит через `TurnoAssincrono` | принято |
| [0177](0177-idioma-das-respostas-por-conta-sessao-e-projeto.md) | Язык ответов живёт в трёх местах — учётная запись, сессия и проект, — в открытом списке BCP-47 и никогда в `users.locale` | принято |
| [0179](0179-o-laco-pergunta-ao-jev-qual-ferramenta.md) | Цикл спрашивает Jev, какой инструмент, а модель пользователя видит только оставшееся меню | принято |
| [0183](0183-reabrir-sessao-encerrada.md) | Закрытую сессию можно открыть снова: собственный выход из терминальных состояний, в `active`, с новым событием | принято |
| [0184](0184-reabrir-sessao-decisoes-do-dono.md) | Повторное открытие сессии: три решения владельца, и `developer` открывает снова | принято |
| [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md) | Сообщение, пришедшее во время идущего хода, попадает в сохраняемую очередь и читается в конце хода | принято |
| [0226](0226-diario-vivo-e-retomada-dos-agentes.md) | Живой дневник и возобновление агентов: прерванный ход возвращается один раз, по плану | принято |
| [0246](0246-anexos-do-chat-bytes-no-postgres-referencia-no-evento.md) | Вложения чата: байты в Postgres, ссылка в событии, зрение по capability | принято |
| [0247](0247-uma-mensagem-varios-destinatarios.md) | Одно сообщение, несколько адресатов | принято |
| [0249](0249-o-raciocinio-do-agente-e-gravado-e-mostrado-so-a-developer.md) | Рассуждение агента записывается и показывается только developer и выше | принято |
| [0283](0283-a-adr-proposta-declara-qual-substitui.md) | A ADR proposta declara qual ADR substitui (`supersedes`) | принято |

## Команда агентов — роли, области и handoff {#tema-time}

Какие агенты существуют, что каждый передаёт кому, делегирование внутри области и handoff между ними.

| № | решение | статус |
|---|---|---|
| [0008](0008-agente-criativo-conversacional-handoffs.md) | Разговорный агент Criativo в harness + фундамент handoffs | принято |
| [0009](0009-agente-po-backlog-rastreabilidade.md) | Агент PO, backlog (epics/stories/tasks) и прослеживаемость | принято |
| [0010](0010-agente-arquiteto-adr-pr-module-map.md) | Агент Arquiteto: ADR через настоящую PR, module_map и перекрёстная валидация | принято |
| [0014](0014-infra-agent-painel-phoenix.md) | InfraAgent и живая панель команды (закрытие Фазы 4a) | принято |
| [0015](0015-psicologo-real-toolloop-hipoteses-evidencia.md) | Настоящий Psicólogo: ToolLoop, гипотезы с доказательствами и сортировка по стоимости | принято |
| [0016](0016-anamnese-proficiencia-patches-instrucao.md) | Anamnese: профиль владения навыками, патчи инструкций и замкнутый цикл | принято |
| [0022](0022-fechamento-4b-psicologo.md) | Закрытие Фазы 4b (сессия 1): доказательство, которое доходит, стоимость, которая видна, анализ, который переживает kill | принято |
| [0023](0023-fechamento-4b-anamnese.md) | Закрытие Фазы 4b (сессия 2): работающий каталог, дедупликация, различающая, кто отказал, и очередь, переживающая раунд | принято |
| [0038](0038-hierarquia-de-agentes.md) | Иерархия агентов: области, leads и делегирование | принято |
| [0046](0046-promocao-de-story-com-autoridade-do-usuario.md) | Продвижение истории с полномочиями пользователя | принято |
| [0053](0053-dev-lead-e-paralelismo-autorizado.md) | Dev Lead как область и параллелизм, разрешённый пользователем | принято |
| [0068](0068-diagrama-c4-do-arquiteto.md) | Диаграмма C4 Arquiteto | принято |
| [0069](0069-fusao-condicional-do-handoff-com-a-ativacao-de-execucao.md) | Условное слияние принятия handoff с включением выполнения | принято |
| [0085](0085-fluxo-como-registro-declarativo.md) | Поток ролей как декларативный реестр (fluxo.yml) | предложено |
| [0086](0086-dev-lead-plano-suspende-para-aprovacao.md) | План Dev Lead приостанавливает ход до одобрения | принято |
| [0087](0087-ux-designer-agente.md) | UX Designer входит как разговорный агент | принято |
| [0088](0088-staff-agente-dormente-para-disparo-automatico.md) | Staff: код готов, спящий для автоматического запуска | принято |
| [0089](0089-analytics-e-delivery-metricas-como-relatorio.md) | `analytics` и `delivery-metricas` становятся скриптом отчёта | принято |
| [0092](0092-platform-relatorio-de-telemetria-sob-demanda.md) | `platform` рождается как скрипт отчёта по требованию, а не агент | принято |
| [0093](0093-dbre-linter-de-migracao-e-relatorio-de-backup.md) | Роль `dbre` становится двумя скриптами: линтер миграций и отчёт о резервном копировании | принято |
| [0094](0094-delegacao-dev-lead-vira-dado.md) | Делегирование Dev Lead → dev становится данными, с переопределённым `parecerArtifactId` | принято |
| [0109](0109-handoff-manual-a-agente-a-escolha.md) | Ручной handoff агенту по выбору переиспользует предложение+принятие, а не третье состояние handoff | принято |
| [0182](0182-ciclo-de-vida-do-handoff.md) | Предложение handoff получает жизненный цикл: одно ожидающее на получателя и `superseded` | принято |
| [0185](0185-estou-pronto-fecha-os-dois-gates.md) | «Estou pronto — a necessidade está validada»: один клик закрывает готовность, gate `necessidade-validada` и принятие PO | принято |
| [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) | Handoff от PO к Arquiteto принимается без клика, когда backlog покрыт и репозиторий локальный | принято |
| [0194](0194-aprovar-o-plano-ativa-a-execucao.md) | Одобрение плана Dev Lead активирует выполнение, а задача получает модуль, который он назначает | принято |
| [0212](0212-historia-arquivada.md) | Архивированная история: колонка, а не состояние машины | принято |
| [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md) | Результат работает на машине пользователя через compose от Infra | принято |
| [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) | У модуля, от которого зависят другие, есть владелец в плане исполнения | принято |
| [0261](0261-o-dev-lead-e-avisado-de-bloqueios-e-pede-ao-arquiteto.md) | Dev Lead узнаёт о блокировках и обращается к Архитектору по отдельному каналу | принято |
| [0262](0262-o-agente-retira-a-regra-de-negocio-obsoleta.md) | Агент снимает устаревшее бизнес-правило, указывая заменяющее или ответ | принято |

## Gates, QA и ревью безопасности {#tema-gates}

Реестр gates, вердикты QA и SecOps и golden-set, которые их измеряют.

| № | решение | статус |
|---|---|---|
| [0013](0013-gates-qa-secops-pr.md) | Gates PR: QAAgent и SecOpsAgent | принято |
| [0020](0020-destravar-gates-qa-secops.md) | Разблокировать gates QA и SecOps: gitleaks по рабочему дереву, валидируемые заключения и tool call в тексте | принято |
| [0021](0021-fechamento-4a-infra-e-painel.md) | Закрытие Фазы 4a: gate infra, который проверяет, и панель, которая говорит правду | принято |
| [0054](0054-gates-como-registro-declarativo.md) | Gates как декларативный реестр | предложено |
| [0057](0057-o-gate-espera-a-aprovacao.md) | Агент gate ждёт одобрения, как ждёт dev | принято |
| [0067](0067-o-gate-sobrevive-ao-restart.md) | Gate переживает перезапуск | принято |
| [0090](0090-qa-estrategia-e-appsec-segundo-momento.md) | QA-стратегия и AppSec как второй МОМЕНТ, а не новый агент | принято |
| [0091](0091-secops-runtime-relatorio-de-abuso.md) | `secops-runtime` как скрипт отчёта по `rate_limit_hits` | принято |
| [0095](0095-gate-necessidade-validada.md) | Gate `necessidade-validada` закрывается отдельным подтверждением человека, а не самопроверкой Criativo | принято |
| [0123](0123-golden-set-regressao-qa-automacao.md) | Golden-set регрессионных случаев для семантического суждения агента QA Automação | принято |
| [0168](0168-golden-set-do-qa-em-ci-semanal.md) | Golden-set QA начинает работать в CI, по расписанию и еженедельно | принято |
| [0192](0192-plano-de-teste-depois-da-entrega.md) | План тестирования рождается после сдачи dev, а gate `implementavel` начинает судить по истории и `module_map` | принято |
| [0207](0207-ciclo-de-gate-velho-estaciona.md) | Цикл gate, простаивающий более 2 ч, паркуется, и возобновить его может лишь жест человека | принято |
| [0214](0214-pergunta-em-aberto-vira-pendencia.md) | Открытый вопрос становится ожидающим решения пунктом | принято |
| [0215](0215-decisao-do-projeto-chega-ao-dev-e-ao-qa.md) | Решение проекта доходит до dev и QA | принято |
| [0258](0258-a-resposta-pelo-chat-fecha-a-pergunta-em-aberto.md) | Ответ, данный в чате, закрывает открытый вопрос | принято |

## Исполнение, политика терминала и одобрения {#tema-execucao}

Работающий dev agent, `proposed_action`, политика терминала, область путей, автоматический режим и абсолютные потолки.

| № | решение | статус |
|---|---|---|
| [0011](0011-infra-dev-agents-worktrees-merge-lock.md) | Инфраструктура dev agents: worktrees, git-исполнители и замок merge | принято |
| [0012](0012-dev-agent-real-toolloop-orcamento-bloqueio.md) | Настоящий DevAgent: ToolLoop, бюджет на task и дисциплина блокировки | принято |
| [0017](0017-lock-de-workspace-e-monitor-de-dev-agents.md) | Блокировка инициализации workspace, Monitor dev agents и наследование пределов | принято |
| [0018](0018-noop-dev-agent-modo-de-execucao.md) | NoopDevAgent как постоянный режим выполнения | принято |
| [0019](0019-destravar-dev-agent-adr-por-modulo-orcamento-projeto.md) | Разблокировать реальный DevAgent: запись, терминал, ADR по модулю и бюджет по проекту | принято |
| [0045](0045-reagendamento-por-evento-do-dev-agent.md) | Перепланирование dev agent по событию и circuit breaker | принято |
| [0047](0047-operabilidade-pos-dogfooding.md) | Эксплуатируемость после dogfooding: закрытие Фазы 12 | принято |
| [0048](0048-decisao-no-log-e-a-ordem-do-gate.md) | Решение в event log и порядок gate | принято |
| [0052](0052-dev-agent-espera-aprovacao-no-meio-do-laco.md) | Dev agent ждёт одобрения посреди цикла | принято |
| [0055](0055-escopo-de-caminho-na-politica-de-terminal.md) | Область пути в политике терминала | принято |
| [0102](0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md) | Пересмотр ADR 0065: граница внешнего эффекта перестаёт быть `deny` и становится абсолютным пределом | принято |
| [0167](0167-modo-automatico-libera-o-escopo-de-caminho.md) | Автоматический режим снимает область путей, и только он | принято |
| [0189](0189-o-piloto-automatico.md) | Автопилот: автоматический режим одобряет всё, кроме потолков, область сравнивается с реальной папкой исполнения, а «Всегда разрешать» записывает глагол + подкоманду | принято |
| [0204](0204-modo-automatico-libera-push-e-pr.md) | Автоматический режим разрешает push и PR | принято |
| [0295](0295-a-caixa-de-decisoes-le-as-filas-de-todos-os-projetos-numa-leitura.md) | A Caixa de decisões lê as filas de todos os projetos numa leitura do workspace | принято |

## Где живёт код — режимы исполнения {#tema-modos}

Три режима исполнения, папка пользователя, база проектов и перевод проекта между режимами.

| № | решение | статус |
|---|---|---|
| [0066](0066-nome-de-pasta-legivel-do-workspace.md) | Читаемое имя папки workspace | принято |
| [0072](0072-projeto-local-ou-container.md) | Проект выбирает, где живёт код: папка пользователя или управляемая папка | принято |
| [0104](0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md) | `execution_mode` с тремя значениями, и workspace рождается `unverified`, когда проверяет его runner | принято |
| [0107](0107-navegacao-de-pasta-local-via-o-runner.md) | Навигация по локальной папке через Runner | принято |
| [0108](0108-projeto-runner-nasce-ao-navegar-pasta-no-wizard.md) | В режиме `runner` проект рождается при клике на "Navegar pasta...", а не только при подтверждении | принято |
| [0111](0111-conversao-de-execution-mode-de-projeto-existente.md) | Конвертация `execution_mode` существующего проекта: отказ при активном dev agent, перемещение `permissions.json`, вывод из эксплуатации строки контейнера | принято |
| [0141](0141-base-unica-dos-projetos-montados.md) | Единая база монтируемых проектов, смонтированная по тождеству | принято |
| [0142](0142-validacao-de-workspace-montado-adiada.md) | Проверка смонтированного workspace откладывается до материализации | принято |
| [0146](0146-base-consentida-no-bootstrap.md) | База, согласованная в bootstrap, и `mounted` как локальный режим по умолчанию | принято |

## Контейнер проекта и broker {#tema-container}

Жизненный цикл контейнера проекта, решение об образе, порт Docker и broker, который говорит с демоном.

| № | решение | статус |
|---|---|---|
| [0065](0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md) | Контейнер на проект: граница перестаёт быть политикой | принято |
| [0081](0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md) | Жизненный цикл контейнера: таблица состояния, без оркестратора | принято |
| [0083](0083-terminal-mostra-estado-real-do-container.md) | Вкладка Terminal получает реального потребителя жизненного цикла, а не терминал | принято |
| [0128](0128-porta-de-docker-e-a-prova-de-empacotamento.md) | Порт Docker и доказательство упаковки, которое выбрало реализацию | принято |
| [0130](0130-broker-de-container.md) | Broker контейнеров: кто говорит с Docker сервера и почему он не принимает спецификацию | принято |
| [0131](0131-roteamento-de-modulos-para-infra.md) | Arquiteto направляет модули в инфраструктуру: он ВЫДВИГАЕТ кандидатов, Infra ВЫБИРАЕТ | принято |
| [0133](0133-infra-elege-imagem-do-roteamento.md) | Infra выбирает среди кандидатов маршрутизации, и выбор становится новой версией `artifact.project_image` | принято |
| [0134](0134-dev-agents-executam-dentro-do-container.md) | Dev agents выполняются ВНУТРИ реального контейнера проекта, а terminal получает там нижнюю границу автоодобрения | принято |
| [0135](0135-portao-de-imagem-nos-tres-modos.md) | Шлюз образа от Arquiteto (RN-105) начинает действовать во всех трёх режимах выполнения | принято |
| [0136](0136-pagina-global-de-containers.md) | Глобальная страница контейнеров: потолок на загрузку в broker и `container_remove` в абсолютном потолке | принято |
| [0137](0137-o-runner-sobe-o-container-do-projeto.md) | `brabo-runner` поднимает контейнер проекта на машине пользователя | принято |
| [0143](0143-agentes-de-dev-so-depois-do-container.md) | Агенты dev только после контейнера | принято |
| [0144](0144-a-segunda-raiz-do-broker.md) | Второй корень broker и дискриминированный локатор, который его выбирает | принято |
| [0180](0180-container-com-o-dono-da-pasta.md) | Контейнер проекта работает от владельца папки, измеренного api | принято |
| [0190](0190-a-infra-sobe-o-container-no-aceite.md) | Infra поднимает контейнер при принятии handoff, шагом сервера и с засеянной автономией, и именно она передаёт работу Dev Lead | принято |
| [0199](0199-recurso-minimo-derivado-do-module-map.md) | Минимальный ресурс контейнера выводится из `module_map`: каждый модуль объявляет свой, а Infra поднимает с суммой | принято |
| [0208](0208-a-infra-herda-a-rede-do-arquiteto.md) | Infra наследует сеть, объявленную Arquiteto | принято |
| [0228](0228-comando-do-app-e-rede-do-container.md) | Контейнер проекта запускает приложение по объявленной команде и публикует порт только на loopback | принято |
| [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) | QA тестирует в эфемерном экземпляре, с сервисами, объявленными Infra | принято |
| [0264](0264-o-app-reinicia-so-o-processo.md) | Depois do avanço da pasta, o app reinicia só o processo, sem recriar o container | принято |
| [0265](0265-o-app-declarado-propoe-recriar-o-container.md) | O app declarado pela Infra propõe recriar o container, com a porta na faixa 13000+ | принято |
| [0297](0297-o-broker-prova-o-compose-do-projeto-num-ambiente-descartavel.md) | O broker prova o compose do projeto num ambiente descartável | принято |

## Локальный runner {#tema-runner}

CLI на машине пользователя — канал, учётные данные, ключи устройства, распространение, база и служба.

| № | решение | статус |
|---|---|---|
| [0103](0103-runner-local-execucao-na-maquina-do-usuario.md) | Локальный runner: выполнение на машине пользователя через канал Phoenix с одноразовым тикетом | принято |
| [0105](0105-personal-access-token-do-runner-escopado-por-construcao.md) | Personal Access Token (`brb_…`) для runner, ограниченный по построению одним маршрутом | принято |
| [0106](0106-distribuicao-do-runner-via-tsup-e-npm-publish.md) | Распространение `@brabo/runner` через `tsup` и `npm publish`, версия внедряется только в CI | принято |
| [0112](0112-binario-standalone-do-runner-via-bun-build-compile.md) | Автономный бинарник `@brabo/runner` через `bun build --compile`, со встроенным нативным аддоном `.node` через реальное извлечение во временный каталог | принято |
| [0118](0118-configuracao-automatica-do-runner-pelo-navegador.md) | Настройка runner через браузер: ключ устройства Ed25519 как вторая учётная запись `runner-ticket`, прокси GitHub Releases для бинарника и File System Access API для папки, настраиваемой одним кликом | принято |
| [0145](0145-docker-pre-requisito-do-runner.md) | Docker становится реальным предусловием режима `runner` | принято |
| [0147](0147-agente-local-com-capacidades.md) | Один локальный агент, возможности, объявляемые при подключении | принято |
| [0151](0151-base-consentida-no-runner.md) | Согласованная база в runner и создание папки через канал | предложено |
| [0154](0154-chave-de-dispositivo-de-maquina.md) | Ключ устройства машины | принято |
| [0174](0174-runner-sem-binario-darwin-x64.md) | Автономный бинарник runner перестаёт обещать Mac Intel | принято |
| [0187](0187-runner-sem-binario-win32-x64.md) | Автономный бинарник runner перестаёт обещать Windows | принято |
| [0193](0193-git-credenciado-no-host-do-runner.md) | Git с учётными данными выполняется на ХОСТЕ runner; код выполняется в контейнере | принято |
| [0201](0201-revogacao-por-chave.md) | Отзыв нацелен на КЛЮЧ, а не на пару `{проект, пользователь}` | принято |
| [0203](0203-aposenta-o-fluxo-do-runner-pelo-navegador.md) | Поток runner через браузер выводится из употребления, путь — установщик | принято |
| [0230](0230-importar-chave-de-llm-pelo-runner.md) | Runner импортирует API-ключ LLM, который у пользователя уже есть на машине | принято |

## Аутентификация, доступ и секреты {#tema-iam}

Собственная аутентификация, роли и их потолки, членство в workspace, усиление защиты между источниками и конверты секретов.

| № | решение | статус |
|---|---|---|
| [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) | Собственная аутентификация: argon2id, EdDSA и ротация refresh | принято |
| [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) | Отказ от Keycloak: собственный эмитент, service token и сессия в cookie | принято |
| [0037](0037-cors-do-engine-e-a-porta-como-contrato.md) | CORS, которого не было у engine, и порт как часть контракта | принято |
| [0050](0050-credencial-sempre-cifrada-verificacao-explicita.md) | Учётные данные всегда зашифрованы; проверка становится явным действием | принято |
| [0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md) | Закрытый CSP в api и область проекта, удержанная в корне | принято |
| [0059](0059-segredo-do-state-de-oauth-sem-default.md) | У ключа, подписывающего `state` git OAuth, нет значения по умолчанию | принято |
| [0084](0084-login-social-github-e-gitlab.md) | Социальный вход (GitHub/GitLab), пересматривающий backlog ADR 0031/0032 | принято |
| [0096](0096-smtp-real-no-mailsender.md) | Настоящий SMTP в `MailSender`, за явным переключателем | принято |
| [0127](0127-tetos-de-rebaixamento-em-project-members.md) | Два потолка понижения в `project_members`, а перекрытие остаётся | принято |
| [0156](0156-teto-de-auto-rebaixamento-na-remocao.md) | Потолок самопонижения также при удалении участника проекта | принято |
| [0157](0157-teto-de-auto-movimento-no-upsert-de-workspace.md) | Потолок самоперемещения в upsert workspace и самоповышение, которое было брешью | принято |
| [0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md) | Id мастер-ключа, записанный в конверте, как наблюдаемость и никогда как полномочие | принято |
| [0173](0173-remocao-de-membro-de-workspace.md) | Удаление участника workspace рождается, защищённое тем же условием | принято |
| [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md) | Быстрый доступ по роли только в локальном окружении | принято |

## LLM-провайдеры, модели и расходы {#tema-llm}

Контракт провайдера, каталог моделей и курирование, binding моделей, metering и бюджеты.

| № | решение | статус |
|---|---|---|
| [0040](0040-moeda-do-dashboard.md) | Валюта дашборда: пока USD, ручной курс по workspace отложен | принято |
| [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) | Одна OpenAI-совместимая база, один контракт LLM providers и capabilities, отклоняющие binding | принято |
| [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) | Живой каталог, жизненный цикл модели и проверяемая цена | принято |
| [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) | Шесть providers LLM поверх базы, и Фаза 9b наконец закрыта | принято |
| [0049](0049-curadoria-de-modelo-por-workspace.md) | Курирование моделей по workspace | принято |
| [0051](0051-facetas-de-capability-e-curadoria-por-uso.md) | Доказанные грани capability; "для чего годится" — это курирование | принято |
| [0063](0063-duas-audiencias-para-o-mesmo-gasto.md) | Две аудитории для одного и того же расхода: счёт owner и потребление участника | принято |
| [0064](0064-escopo-de-area-na-cascata-e-o-binding-de-agente-global.md) | Область как уровень каскада модели и глобальный binding агента | принято |
| [0075](0075-embeddings-no-contrato-de-llm-provider.md) | Embeddings в контракте LLMProvider | принято |
| [0076](0076-provider-volta-a-ser-dimensao-de-gasto.md) | `provider` снова становится измерением расходов, а сдерживание переходит к типу | принято |
| [0077](0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) | Рейтинг моделей по возможностям, без выдуманной оценки | принято |
| [0110](0110-budget-por-area-aditivo-nao-cascata.md) | Бюджет по области АДДИТИВЕН, рядом с проектом/сессией — не каскад и не новая таблица | принято |
| [0114](0114-deteccao-de-ollama-nativo-no-bootstrap-dev.md) | Обнаружение нативного Ollama в dev bootstrap: спросить один раз, сохранить в `.env`, поставить сервисы compose за profile | принято |
| [0115](0115-pedido-de-pull-de-modelo-huggingface-tabela-propria.md) | Pull модели из Hugging Face: собственная таблица, подтверждение в два шага и allowlist официальных издателей — никогда `proposed_actions` | принято |
| [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) | Предпочтение маршрутизации живёт в binding модели, путешествует вместе с ним и замораживается в metering | принято |
| [0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md) | Реальная стоимость, которую возвращает provider, становится числом metering | принято |
| [0198](0198-duplicata-semantica-por-embedding-com-limiar-que-so-avisa.md) | О семантическом дубликате истории и правила предупреждает embedding с порогом, а расход попадает в metering | принято |
| [0221](0221-upstream-preso-por-sessao.md) | Хаб привязывает разговор каждого агента к обслужившему его upstream по `session_id` | принято |
| [0222](0222-provider-9router-de-llm.md) | 9Router входит как 10-й LLM-провайдер, с URL на установку | принято |
| [0223](0223-orcamento-de-raciocinio-por-modelo.md) | Бюджет рассуждения — capability НА МОДЕЛЬ, курируемая вручную | принято |
| [0224](0224-raciocinio-abortado-no-stream.md) | Рассуждение считается в потоке и обрывается на лимите, а стоимость оценивается и сверяется | принято |
| [0225](0225-teto-de-preco-do-upstream-no-openrouter.md) | OpenRouter получает потолок цены на вызов (`provider.max_price` = каталог × 1,5) | принято |
| [0227](0227-provider-opencode-zen-de-llm.md) | OpenCode Zen входит как 11-й LLM-провайдер, только в диалекте OpenAI | принято |
| [0233](0233-membro-ve-o-gasto-do-projeto-sem-credencial.md) | Участник видит расходы проекта по агентам и областям, никогда по провайдерам | принято |
| [0251](0251-preco-de-lista-datado-para-provider-sem-preco.md) | Датированная в коде прайс-цена для провайдера, не сообщающего цену | принято |
| [0257](0257-na-anthropic-direta-o-raciocinio-desligado-e-por-modelo.md) | В прямом Anthropic отключённое рассуждение задаётся по модели, а усилие снижает Opus | принято |
| [0279](0279-provider-de-llm-duble-do-regressivo.md) | Provider de LLM dublê do regressivo, dentro da api | принято |
| [0290](0290-o-usuario-escolhe-o-laya-no-lugar-do-jev-quando-a-maquina-tem-gpu.md) | O usuário escolhe o Laya no lugar do Jev quando a máquina tem GPU que o roda | предложено |
| [0296](0296-o-teto-de-gasto-e-mensal-e-o-workspace-tem-teto-proprio.md) | O teto de gasto é mensal e o workspace tem teto próprio | принято |

## RAG, граф знаний и артефакты {#tema-conhecimento}

Чанки и гибридный поиск, их измерение, граф Neo4j и артефакты, проецируемые из event log.

| № | решение | статус |
|---|---|---|
| [0079](0079-tabela-de-chunks-vetor-e-tsvector-juntos.md) | Таблица chunks: вектор и `tsvector` в одной строке | принято |
| [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md) | Гибридный поиск: веса, порог и что такое цитата | принято |
| [0082](0082-chat-rag-aba-de-busca-hibrida.md) | Chat RAG: собственная вкладка гибридного поиска, без переименования "Chat" | принято |
| [0099](0099-neo4j-grafo-de-conhecimento-e-templates.md) | Neo4j как граф знаний и шаблоны prompt, драйвер в api | принято |
| [0100](0100-rag-search-e-modelos-garantidos-no-boot.md) | `rag_search` для агентов и модели Ollama, гарантированные при загрузке | принято |
| [0101](0101-memoria-relacional-como-projecao-do-event-log.md) | Реляционная память как проекция event log; шаблоны потребляются без трогания GenServers | принято |
| [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) | Локальная папка, приложенная через браузер, становится `chunks.scope = 'local'`, читаемым БРАУЗЕРОМ, никогда путём хоста | принято |
| [0129](0129-telemetria-de-busca-do-rag-como-tabela.md) | Телеметрия поиска RAG — это ТАБЛИЦА, с весами, замороженными в строке | принято |
| [0132](0132-golden-set-de-acerto-do-rag.md) | Golden-set попаданий RAG и gate `rag-acertivo` | принято |
| [0138](0138-golden-set-do-rag-em-ci-agendado.md) | Golden-set RAG начинает работать в CI, по расписанию — и остаётся `warn` | принято |
| [0148](0148-artefatos-projetados-em-arquivo.md) | Артефакты агентов, спроецированные в файлы, в папку `docs/` | принято |
| [0196](0196-anamnese-religada-com-sujeito-e-fato-do-perfil.md) | Anamnese снова включена: не работает без субъекта, а принятая гипотеза становится фактом профиля | принято |
| [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md) | Контракт между модулями становится версионируемым артефактом Arquiteto, и dev agent читает его вместо чужого worktree | принято |
| [0205](0205-desvio-do-agente-como-sinal-do-produto.md) | Отклонение агента, которое наблюдает Anamnese, становится сигналом продукта, без персональных данных | принято |
| [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md) | A indexação de docs tem teto próprio de 4 MiB, e o corte é declarado | принято |
| [0272](0272-a-busca-do-rag-limita-os-trechos-por-arquivo.md) | A busca híbrida do RAG limita os trechos por arquivo | принято |
| [0291](0291-as-percepcoes-olham-o-produto-do-usuario-e-a-falha-tecnica-e-sinal-interno-do-tp-01.md) | As Percepções olham o produto do usuário; a falha técnica é sinal interno do TP-01 | принято |
| [0293](0293-a-memoria-do-projeto-e-markdown-versionado-e-o-grafo-e-o-rag-sao-indices.md) | O projeto tem memória em markdown que o dev lê antes de explorar | предложено |

## Web-интерфейс и дизайн-система {#tema-web}

Экраны, навигация, темы и структура самых больших файлов web-приложения.

| № | решение | статус |
|---|---|---|
| [0036](0036-telas-de-auth-fieis-ao-design-e-fontes-auto-hospedadas.md) | Экраны аутентификации, верные дизайну, и три шрифта, которые не загружались | принято |
| [0060](0060-superficie-de-leitura-de-codigo.md) | Поверхность чтения кода, ограниченная и с бюджетом | принято |
| [0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) | Достижимая тема и загрузка под CSP | принято |
| [0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) | Рамка экрана, и реестр вкладок намеренно расходится с handoff | принято |
| [0097](0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md) | Прямое чтение схемы engine для "N агентов онлайн" на дашборде | принято |
| [0116](0116-tipos-do-web-gerados-do-openapi.md) | `ActionType` (и будущие типы) генерируются из контракта OpenAPI, а не копируются вручную | принято |
| [0122](0122-sessionpage-dividido-em-cinco-prs.md) | `SessionPage.tsx`, разделённый на пять механических PR, объявленных заранее | принято |
| [0124](0124-hook-do-canal-de-turno-do-sessionpage.md) | Группировка состояния канала хода, извлечённая в `useTurnoDoAgente` | принято |
| [0125](0125-projectsettingstab-dividido-por-secao.md) | `ProjectSettingsTab.tsx` разделён на файл на раздел, за barrel | принято |
| [0126](0126-trilho-vertical-de-navegacao-do-projeto.md) | Страница проекта навигируется вертикальной рейкой, а вкладка Código перестаёт сама сворачивать sidebar | принято |
| [0176](0176-sessionpage-abaixo-de-mil-linhas.md) | `SessionPage.tsx` меньше 1 000 строк, за десять механических PR, а замок — только после | принято |
| [0181](0181-tema-preto-neutro.md) | Тёмная тема становится нейтрально-чёрной, и долг контраста заканчивается | принято |
| [0210](0210-animacao-de-texto-com-motion.md) | Анимация текста с `motion` | принято |
| [0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) | Одна навигация: боковая панель поглощает рельс проекта | принято |
| [0232](0232-shadcn-com-base-ui-no-apps-web.md) | shadcn/ui с Base UI и Tailwind 4 в `apps/web` | принято |
| [0234](0234-shiki-e-recharts-por-carga-dinamica.md) | `shiki` в Code Block и `recharts` в Chart, всегда динамической загрузкой | принято |
| [0237](0237-o-visual-v3-liga-o-preflight-e-sobe-os-raios.md) | Визуал v3 включает preflight и увеличивает радиусы | принято |
| [0238](0238-o-grafo-de-modulos-vira-canvas-xyflow.md) | Граф модулей вкладки Arquitetura становится Canvas (`@xyflow/react`) | принято |
| [0239](0239-csp-frame-src-local-para-o-web-preview.md) | Локальный CSP `frame-src` для Web preview результата | принято |
| [0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md) | Причина неактивного элемента управления может жить в активном «?» на странице Containers | принято |
| [0241](0241-a-sidebar-adota-o-block-sidebar-07-do-shadcn.md) | Sidebar принимает блок `sidebar-07` из shadcn | принято |
| [0242](0242-containers-em-tabela-linear-com-tanstack-react-table.md) | Containers в линейной таблице с `@tanstack/react-table` | принято |
| [0243](0243-consequencia-irreversivel-pode-morar-num-botao-de-perigo.md) | Необратимое последствие может жить в кнопке опасности | принято |
| [0244](0244-coluna-das-abas-do-projeto-alinhada-a-esquerda.md) | Колонка вкладок проекта выровнена по левому краю | принято |
| [0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) | Содержимое страниц занимает всю ширину | принято |
| [0250](0250-chat-da-sessao-ocupa-a-largura-inteira.md) | Чат сессии занимает всю ширину | принято |
| [0294](0294-a-estrutura-v9-oito-secoes-com-sub-abas-caixa-de-decisoes-e-agentes-agora.md) | A estrutura v9: oito seções com sub-abas, Caixa de decisões e Agentes agora | принято |

## Эксплуатация, deploy и установка {#tema-operacao}

Production-образы, Kubernetes, наблюдаемость, бэкап, dev-compose и установщик в одну строку.

| № | решение | статус |
|---|---|---|
| [0024](0024-fase5-imagens-producao-ci.md) | Фаза 5 (сессия 1): production-образы, compose.prod, CI и smoke-тест | принято |
| [0025](0025-fase5-deploy-kubernetes-kustomize.md) | Фаза 5 (сессия 2): деплой в Kubernetes с Kustomize, метрика очереди и локальный overlay | принято |
| [0026](0026-fase5-observabilidade-e-graceful-shutdown.md) | Фаза 5 (сессия 3): graceful shutdown, OpenTelemetry, метрики, логи и дашборды | принято |
| [0027](0027-fase5-backup-hardening-release.md) | Backup/restore, усиление api, открытая поверхность и релиз | принято |
| [0035](0035-observabilidade-legivel-e-trace-sem-coletor.md) | Trace без коллектора и путь между слоями в логе | принято |
| [0070](0070-observabilidade-no-compose-local.md) | Наблюдаемость в локальном Compose: метрики и журналы, без трассировки | принято |
| [0150](0150-instalador-de-uma-linha.md) | Установщик одной строкой, с выбранным источником и маркером | предложено |
| [0152](0152-backup-de-volumes-contra-compose.md) | Резервное копирование и восстановление томов для compose | предложено |
| [0153](0153-deploy-enabled-o-gatilho-que-ninguem-cria.md) | `DEPLOY_ENABLED`: триггер, который упоминают десять документов и не создаёт ни один | предложено |
| [0155](0155-a-primeira-conta-nasce-no-terminal.md) | Первая учётная запись рождается в терминале, а локальный агент поднимается сопряжённым | принято |
| [0160](0160-o-compose-do-instalador-viaja-assinado.md) | Compose установщика едет вместе с ним, как подписанный asset | принято |
| [0161](0161-a-tela-so-oferece-o-modo-que-a-instalacao-executa.md) | Экран предлагает только тот режим, который выполняет установка, а у установки через Release нет broker | принято |
| [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md) | Broker становится пятым опубликованным образом, а установщик СПРАШИВАЕТ, включать ли его | принято |
| [0169](0169-seaweedfs-no-lugar-do-minio-no-overlay-local.md) | Назначением S3 локального overlay перестаёт быть MinIO и становится SeaweedFS | принято |
| [0170](0170-compose-de-dev-brabo-dev.md) | Dev-compose становится `brabo-dev`, и dev отказывается подниматься рядом с установкой | принято |
| [0209](0209-engine-em-otp-29.md) | Engine переходит на Elixir 1.20.4 / OTP 29.1.1 | принято |
| [0256](0256-a-migracao-restaura-o-banco-num-banco-vazio.md) | Миграция установщика восстанавливает базу в только что созданную пустую базу | принято |

## CI, релиз и цепочка поставок {#tema-engenharia}

Конвейер, публикуемые образы, подпись, сканирование, закрепление версий, слои тестов и структура самого репозитория.

| № | решение | статус |
|---|---|---|
| [0039](0039-actionlint-e-validacao-do-pipeline-de-ci-gerado.md) | actionlint и валидация генерируемого конвейера CI | принято |
| [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) | Образы, публикуемые в GHCR с каждым финальным тегом, и production overlay, закреплённый по digest | принято |
| [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md) | Браузерный E2E против продакшен-compose, в пакете вне workspace | принято |
| [0121](0121-schema-dividido-por-agregado-de-dominio.md) | Схема, разделённая по доменным агрегатам, за barrel | принято |
| [0140](0140-timeout-do-audit-como-risco-assumido.md) | Повторяющийся timeout `pnpm audit` — принятый риск; находка по-прежнему отклоняет | принято |
| [0149](0149-assinatura-dos-artefatos-publicados.md) | Подпись опубликованных артефактов | предложено |
| [0159](0159-imagem-de-terceiro-por-digest.md) | Сторонний образ входит по digest, и lint проваливает того, кто забудет | принято |
| [0172](0172-trivy-no-release-antes-de-assinar.md) | Релиз сканирует Trivy то, что публикует, по digest, до подписи | принято |
| [0178](0178-tag-inline-na-imagem-de-terceiro.md) | Тег стороннего образа живёт ВНУТРИ ссылки, перед digest | принято |
| [0197](0197-a-imagem-dos-workflows-vem-do-compose.md) | Образ workflows берётся из compose, и Dependabot для образов включается | принято |
| [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) | Brabo становится набором репозиториев в `viralabs-dev` | принято |
| [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md) | O `brabo-qa` tem regressivo por funcionalidade, e o da PR para a `dev` nunca é exigido | принято |
| [0270](0270-o-contracts-e-publicado-no-github-packages.md) | O brabo-contracts é publicado no GitHub Packages, com o `shared` só de tipos | принято |
| [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) | Cada run do Actions mostra os vínculos entre os repositórios | принято |
| [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md) | O regressivo roda num compose só; o grafo mostra cada funcionalidade por uma matrix de exibição, e o relatório é a fonte da decisão | принято |
| [0278](0278-a-mudanca-e-vista-num-painel-do-brabo-ci.md) | A mudança é vista num painel do brabo-ci, sem check nas PRs | принято |
| [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) | O pin do brabo-ci nos consumidores aponta para uma tag, e a branch decide qual | принято |
| [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md) | O mapa dos 11 repos tem uma fonte só, o `repos.yml` do `brabo`, e o README é gerado dela | принято |
| [0282](0282-a-pin-dos-componentes-segue-a-release-final.md) | A pin dos componentes segue a última Release final | принято |
| [0285](0285-a-prova-de-uma-aresta-e-arquivo-mais-trecho.md) | A prova de uma aresta do `repos.yml` é arquivo mais trecho literal, não arquivo:linha | принято |
| [0286](0286-as-capturas-da-doc-sao-geradas-pelo-qa-e-entram-por-pr.md) | As capturas da doc são geradas pelo brabo-qa e entram no brabo por PR do App | предложено |
| [0289](0289-a-recaptura-segue-a-pin-e-so-pede-o-dono-quando-a-imagem-muda.md) | A recaptura segue a pin do web e só pede o dono quando a imagem muda | предложено |

## Документация {#tema-docs}

Как документация генерируется, проверяется и публикуется.

| № | решение | статус |
|---|---|---|
| [0029](0029-sincronizacao-continua-da-documentacao.md) | Непрерывная синхронизация документации | принято |
| [0033](0033-referencia-de-api-gerada-do-openapi.md) | Справочник API выводится из кода, а табличный тест требует метаданных | принято |
| [0034](0034-documentacao-publicada-por-degrau.md) | Документация, публикуемая по ступеням, в подкаталоге Pages | принято |
| [0071](0071-publicacao-simetrica-por-degrau.md) | Симметричная публикация по ступеням и корень, который предлагает выбор | принято |
| [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) | Публикуемый путь называет окружение, а не ветку | принято |
| [0117](0117-lockfile-proprio-para-o-website.md) | `website/` получает собственный lockfile, вне `pnpm audit` продукта | принято |
| [0202](0202-o-indice-de-adr-por-tema.md) | Индекс ADR по темам, с темой вне ADR | принято |
| [0206](0206-referencia-da-api-numa-pagina-redoc.md) | Справочник API становится страницей Redoc | принято |
| [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) | Четыре языка, с pt-BR как ИСТОЧНИКОМ и языком по умолчанию: документация и интерфейс на португальском, английском, русском и упрощённом китайском | принято |
| [0218](0218-titulo-de-adr-com-prefixo.md) | Каждый ADR называется «ADR NNNN — заголовок» | принято |
| [0219](0219-referencia-entra-na-traducao.md) | Справочник входит в перевод | принято |
| [0220](0220-api-traduzida-por-catalogo.md) | Страница API переводится по каталогу | принято |
| [0253](0253-o-site-de-docs-deixa-o-docusaurus.md) | Сайт документации отказывается от Docusaurus | принято |
| [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) | Документация каждой области живёт в её корне | принято |
| [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md) | Документация репозиториев с кодом только на английском; сайт отдаёт английский источник с полосой | принято |
| [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md) | A doc dos repositórios é em pt-BR por padrão, com traduções permitidas nos irmãos | принято |
| [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) | A paridade de tradução mede só a doc do brabo | принято |
| [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) | Os gerados do `brabo` leem os irmãos por uma trava de SHAs | принято |
| [0275](0275-cada-irmao-confere-as-proprias-refs-com-simbolo.md) | Cada irmão confere as próprias refs com símbolo no PR | принято |
| [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) | O índice de ADR é gerado, e a referência grande vira índice mais partes | предложено |
| [0288](0288-link-entre-repos-nas-rns-e-url-do-repo-dono.md) | O link entre repos nas RNs é a URL do repo dono, e o site a devolve para relativo | предложено |
<!-- END:GENERATED:indice-de-adr -->

## Соглашение {#a-convenção}

- **Один файл на решение**, в `docs/adr/NNNN-short-title.md`, с
  последовательной 4-значной нумерацией, и заголовком `# ADR NNNN — <título>`
  ([0218](0218-titulo-de-adr-com-prefixo.md)). **Номера не переиспользуются**, даже когда ADR
  заменён, — следующий **0263**.
- **Одна тема на решение**, выбираемая автором ADR, в том же
  PR: строка в `docs/adr/temas.yml` и строка индекса под разделом этой
  темы, в числовом порядке. Ревьюер подтверждает. Новая тема — это
  изменение списка в `temas.yml`, обоснованное в PR, который её добавляет; превышение
  15 требует ADR, пересматривающего [0202](0202-o-indice-de-adr-por-tema.md).
- **Три раздела, и только они:** **Контекст** (проблема или сила, которая его вызвала),
  **Решение** (что было решено), **Последствия** (принятые компромиссы и
  то, что осталось на потом).
- **Без сторонних шаблонов** — никаких Nygard, MADR или вариантов. Трёх
  разделов достаточно.
- **На португальском**, как и остальной проект.
- **Принятый ADR не редактируется.** Заменённый более поздним решением остаётся
  как есть; новый ADR ссылается на старый и объясняет, что изменилось.

Ценность этих ADR — в фиксации того, что **не** сработало: 0020
документирует девять неудачных исполнений подряд, а 0027 фиксирует обоснование,
пересмотренное в той же сессии, которая его породила. Опущенное плохое
последствие — та часть, которой не хватает полгода спустя.
