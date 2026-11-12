---
id: adr-index
title: Architectural decisions (ADR)
sidebar_label: ADR index
sidebar_position: 0
description: Brabo's 282 architectural decision records, grouped by theme, with what each one decided.
keywords: [ADR, architectural decision, architecture, history]
traducao_de: d7d790431657e61a049b452214cfd432da2199df
---

# Architectural decisions

An ADR records **why** something was decided, at the moment it was decided.
They are **immutable**: no ADR is edited after being accepted. When a
decision changes, a new ADR is born that supersedes the previous one — that's what happened
with [0018](0018-noop-dev-agent-modo-de-execucao.md), which records the
replacement of the NoopDevAgent decided in [0011](0011-infra-dev-agents-worktrees-merge-lock.md).

Practical consequence: **an ADR can describe a state that is no longer
current.** For the current state, use [Business rules](../business-rules.md),
[Architecture](../architecture.md) and the [Runbook](../runbook.md). For the
reasoning, come here.

The table below is **generated** (`pnpm docs:generate`, [ADR 0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md)): number, title and status of each ADR, under a single theme. Use the filter by theme and status, or the site search. The full text of each decision is in the ADR itself.

The status comes from the `## Status` section of the ADR; without it, **accepted** applies. The theme lives in `docs/adr/temas.yml`, next to this page, and not in the ADR, because an accepted ADR is never edited ([ADR 0202](0202-o-indice-de-adr-por-tema.md)); `pnpm docs:check` fails an ADR without a theme.

<!-- BEGIN:GENERATED:indice-de-adr -->
**Themes:** [Git, repository and branch policy](#tema-git) · [Agent harness, turns and sessions](#tema-agentes) · [The agent team — roles, areas and handoffs](#tema-time) · [Gates, QA and security review](#tema-gates) · [Execution, terminal policy and approvals](#tema-execucao) · [Where the code lives — execution modes](#tema-modos) · [Project container and broker](#tema-container) · [The local runner](#tema-runner) · [Auth, access and secrets](#tema-iam) · [LLM providers, models and spend](#tema-llm) · [RAG, knowledge graph and artifacts](#tema-conhecimento) · [Web UI and design system](#tema-web) · [Operation, deploy and installation](#tema-operacao) · [CI, release and supply chain](#tema-engenharia) · [Documentation](#tema-docs)

<div class="adr-filtro" data-adr-filtro hidden><label>Theme <select data-adr-tema><option value="">All</option><option value="tema-git">Git, repository and branch policy</option><option value="tema-agentes">Agent harness, turns and sessions</option><option value="tema-time">The agent team — roles, areas and handoffs</option><option value="tema-gates">Gates, QA and security review</option><option value="tema-execucao">Execution, terminal policy and approvals</option><option value="tema-modos">Where the code lives — execution modes</option><option value="tema-container">Project container and broker</option><option value="tema-runner">The local runner</option><option value="tema-iam">Auth, access and secrets</option><option value="tema-llm">LLM providers, models and spend</option><option value="tema-conhecimento">RAG, knowledge graph and artifacts</option><option value="tema-web">Web UI and design system</option><option value="tema-operacao">Operation, deploy and installation</option><option value="tema-engenharia">CI, release and supply chain</option><option value="tema-docs">Documentation</option></select></label> <label>Status <select data-adr-status><option value="">All</option><option value="accepted">accepted</option><option value="proposed">proposed</option></select></label></div>

## Git, repository and branch policy {#tema-git}

The git provider contract, the repository's birth and adoption, protection and the branch policy.

| # | decision | status |
|---|---|---|
| [0001](0001-git-provider-contract-shape.md) | Shape of the normalized GitProvider contract | accepted |
| [0002](0002-git-error-normalization.md) | GitProvider error normalization | accepted |
| [0003](0003-git-provider-retry-policy.md) | Retry policy for remote providers | accepted |
| [0004](0004-git-credential-registration.md) | Registration of the user's git credentials | accepted |
| [0005](0005-repo-bootstrap-idempotent-steps.md) | Idempotent and resumable Gitflow bootstrap | accepted |
| [0028](0028-protecao-de-branch-divergencia-entre-providers.md) | Branch protection: divergence between providers and the approval matrix | accepted |
| [0030](0030-politica-de-branches-mecanizada.md) | Mechanized branch policy | accepted |
| [0044](0044-adocao-de-repositorio-existente.md) | Adoption of an existing repository, and the plan as a gate | accepted |
| [0056](0056-o-engine-trabalha-em-repositorio-remoto.md) | The engine works on a remote repository | accepted |
| [0139](0139-o-alarme-de-esteira-ganha-destinatario.md) | The pipeline merge alarm gains a recipient, and the rule covers `dev` | accepted |
| [0165](0165-o-repositorio-nasce-no-handoff-ao-arquiteto.md) | The repository is born at the acceptance of the handoff to the Arquiteto, and execution does not start without it | accepted |
| [0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) | Automatic `dev` → `qa` promotion while QA is in a test phase | accepted |
| [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md) | `qa` is retired for now and the repository's pipeline becomes `dev → main` | accepted |
| [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) | Dependabot is exempt from review on `dev` and is mergeable with the other checks green | accepted |
| [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) | The PR policy is mandatory in every repository and the bot's regeneration PR skips the ladder on dev | accepted |
| [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md) | O projeto do usuário trabalha em trunk, e a pasta acompanha a main | accepted |
| [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) | O E2E do brabo-qa é portão da main, com aceite justificado | accepted |
| [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) | A PR declara de que PR de outro repo depende, e um check do App espera o merge | accepted |
| [0284](0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) | A promoção infere as dependências pela ordem dos repos | accepted |
| [0292](0292-o-merge-automatico-e-opcao-do-projeto-desligada-por-padrao.md) | O merge automático é opção do projeto, desligada por padrão | accepted |

## Agent harness, turns and sessions {#tema-agentes}

How an agent runs — context, the tool loop, the conversational turn, the session and its states.

| # | decision | status |
|---|---|---|
| [0006](0006-prompt-assembler-context-harness.md) | Agent harness: deterministic context assembly | accepted |
| [0007](0007-toolloop-tools-context-manager.md) | ToolLoop, tools, ContextManager (harness with LLM) | accepted |
| [0061](0061-tipo-da-sessao-na-criacao.md) | The session's type is data set at creation, and execution stays an event | accepted |
| [0098](0098-limites-de-transporte-e-janela-efetiva-de-compactacao.md) | Consistent transport limits and effective compaction window | accepted |
| [0163](0163-o-clique-responde-ao-aceitar.md) | The click answers on ACCEPTING the command, and the turn continues through the channel | accepted |
| [0175](0175-infra-lead-conversa-pelo-composer.md) | The Infra Lead converses through the composer, and first its turn goes through `TurnoAssincrono` | accepted |
| [0177](0177-idioma-das-respostas-por-conta-sessao-e-projeto.md) | The response language lives in three places — account, session and project —, as an open BCP-47 list and never in `users.locale` | accepted |
| [0179](0179-o-laco-pergunta-ao-jev-qual-ferramenta.md) | The loop asks Jev which tool, and the user's model sees only the menu that remains | accepted |
| [0183](0183-reabrir-sessao-encerrada.md) | A closed session can be reopened: a dedicated exit from the terminal states, to `active`, with a new event | accepted |
| [0184](0184-reabrir-sessao-decisoes-do-dono.md) | Reopening a session: the owner's three decisions, and `developer` reopens | accepted |
| [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md) | A message arriving during a turn enters a persisted queue and is read at the end of the turn | accepted |
| [0226](0226-diario-vivo-e-retomada-dos-agentes.md) | Living diary and agent resumption: the interrupted turn comes back once, from the plan | accepted |
| [0246](0246-anexos-do-chat-bytes-no-postgres-referencia-no-evento.md) | Chat attachments: bytes in Postgres, reference in the event, vision by capability | accepted |
| [0247](0247-uma-mensagem-varios-destinatarios.md) | One message, several recipients | accepted |
| [0249](0249-o-raciocinio-do-agente-e-gravado-e-mostrado-so-a-developer.md) | The agent's reasoning is recorded and shown only to developer or above | accepted |
| [0283](0283-a-adr-proposta-declara-qual-substitui.md) | A ADR proposta declara qual ADR substitui (`supersedes`) | accepted |

## The agent team — roles, areas and handoffs {#tema-time}

Which agents exist, what each delivers to whom, delegation inside an area and the handoff between them.

| # | decision | status |
|---|---|---|
| [0008](0008-agente-criativo-conversacional-handoffs.md) | Conversational Creative agent in the harness + handoff foundation | accepted |
| [0009](0009-agente-po-backlog-rastreabilidade.md) | PO agent, backlog (epics/stories/tasks) and traceability | accepted |
| [0010](0010-agente-arquiteto-adr-pr-module-map.md) | Architect agent: ADRs via a real PR, module_map and cross-validation | accepted |
| [0014](0014-infra-agent-painel-phoenix.md) | InfraAgent and the live team panel (Phase 4a closure) | accepted |
| [0015](0015-psicologo-real-toolloop-hipoteses-evidencia.md) | Real Psychologist: ToolLoop, evidence-backed hypotheses and cost triage | accepted |
| [0016](0016-anamnese-proficiencia-patches-instrucao.md) | Anamnesis: proficiency profile, instruction patches and closed loop | accepted |
| [0022](0022-fechamento-4b-psicologo.md) | Closing Phase 4b (session 1): evidence that arrives, cost that shows up, analysis that survives a kill | accepted |
| [0023](0023-fechamento-4b-anamnese.md) | Closing Phase 4b (session 2): a catalog that works, a dedup that distinguishes who denied, and a queue that survives the run | accepted |
| [0038](0038-hierarquia-de-agentes.md) | Agent hierarchy: areas, leads and delegation | accepted |
| [0046](0046-promocao-de-story-com-autoridade-do-usuario.md) | Story promotion with user authority | accepted |
| [0053](0053-dev-lead-e-paralelismo-autorizado.md) | Dev Lead as an area, and parallelism authorized by the user | accepted |
| [0068](0068-diagrama-c4-do-arquiteto.md) | Architect's C4 diagram | accepted |
| [0069](0069-fusao-condicional-do-handoff-com-a-ativacao-de-execucao.md) | Conditional merge of handoff acceptance with execution activation | accepted |
| [0085](0085-fluxo-como-registro-declarativo.md) | Role flow as a declarative registry (fluxo.yml) | proposed |
| [0086](0086-dev-lead-plano-suspende-para-aprovacao.md) | The Dev Lead's plan suspends the turn for approval | accepted |
| [0087](0087-ux-designer-agente.md) | The UX Designer enters as a conversational agent | accepted |
| [0088](0088-staff-agente-dormente-para-disparo-automatico.md) | Staff: code ready, dormant for automatic trigger | accepted |
| [0089](0089-analytics-e-delivery-metricas-como-relatorio.md) | `analytics` and `delivery-metricas` become a report script | accepted |
| [0092](0092-platform-relatorio-de-telemetria-sob-demanda.md) | `platform` starts as an on-demand reporting script, not an agent | accepted |
| [0093](0093-dbre-linter-de-migracao-e-relatorio-de-backup.md) | The `dbre` role becomes two scripts: migration linter and backup report | accepted |
| [0094](0094-delegacao-dev-lead-vira-dado.md) | The Dev Lead → dev delegation becomes data, with `parecerArtifactId` redefined | accepted |
| [0109](0109-handoff-manual-a-agente-a-escolha.md) | Manual handoff to an agent of choice reuses offer+accept, never a third handoff state | accepted |
| [0182](0182-ciclo-de-vida-do-handoff.md) | The handoff offer gains a lifecycle: one pending per destination, and `superseded` | accepted |
| [0185](0185-estou-pronto-fecha-os-dois-gates.md) | "I'm ready — the need is validated": one click closes readiness, the `necessidade-validada` gate and the PO's acceptance | accepted |
| [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) | The PO's handoff to the Arquiteto is accepted without a click when the backlog is covered and the repository is local | accepted |
| [0194](0194-aprovar-o-plano-ativa-a-execucao.md) | Approving the Dev Lead's plan activates execution, and the task gains the module it assigns | accepted |
| [0212](0212-historia-arquivada.md) | The archived story: a column, not a state of the machine | accepted |
| [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md) | The deliverable runs on the user's machine through Infra's compose | accepted |
| [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) | The module others depend on has an owner in the execution plan | accepted |
| [0261](0261-o-dev-lead-e-avisado-de-bloqueios-e-pede-ao-arquiteto.md) | The Dev Lead is told about blockers and asks the Architect through a channel of its own | accepted |
| [0262](0262-o-agente-retira-a-regra-de-negocio-obsoleta.md) | The agent retires the obsolete business rule, citing the replacement or the answer | accepted |

## Gates, QA and security review {#tema-gates}

The gate registry, the QA and SecOps verdicts and the golden-sets that measure them.

| # | decision | status |
|---|---|---|
| [0013](0013-gates-qa-secops-pr.md) | PR gates: QAAgent and SecOpsAgent | accepted |
| [0020](0020-destravar-gates-qa-secops.md) | Unblocking the QA and SecOps gates: gitleaks on the tree, validated verdicts, and tool call in text | accepted |
| [0021](0021-fechamento-4a-infra-e-painel.md) | Closing Phase 4a: an infra gate that actually validates, and a panel that tells the truth | accepted |
| [0054](0054-gates-como-registro-declarativo.md) | Gates as a declarative registry | proposed |
| [0057](0057-o-gate-espera-a-aprovacao.md) | The gate agent waits for approval, like the dev agent waits | accepted |
| [0067](0067-o-gate-sobrevive-ao-restart.md) | The gate survives a restart | accepted |
| [0090](0090-qa-estrategia-e-appsec-segundo-momento.md) | QA-strategy and AppSec as a second MOMENT, not a new agent | accepted |
| [0091](0091-secops-runtime-relatorio-de-abuso.md) | `secops-runtime` as a report script over `rate_limit_hits` | accepted |
| [0095](0095-gate-necessidade-validada.md) | The `necessidade-validada` gate closes with a separate human confirmation, not with the Creative self-validating | accepted |
| [0123](0123-golden-set-regressao-qa-automacao.md) | Golden-set of regression cases for the QA Automation agent's semantic judgment | accepted |
| [0168](0168-golden-set-do-qa-em-ci-semanal.md) | The QA golden-set now runs in CI, scheduled and weekly | accepted |
| [0192](0192-plano-de-teste-depois-da-entrega.md) | The test plan is born after the dev's delivery, and the `implementavel` gate starts judging itself on the story and the `module_map` | accepted |
| [0207](0207-ciclo-de-gate-velho-estaciona.md) | A gate cycle stalled for more than 2 h parks, and only a human gesture resumes it | accepted |
| [0214](0214-pergunta-em-aberto-vira-pendencia.md) | An open question becomes a pending item to resolve | accepted |
| [0215](0215-decisao-do-projeto-chega-ao-dev-e-ao-qa.md) | The project's decision reaches the dev and QA | accepted |
| [0258](0258-a-resposta-pelo-chat-fecha-a-pergunta-em-aberto.md) | An answer given in the chat closes the open question | accepted |

## Execution, terminal policy and approvals {#tema-execucao}

The dev agent at work, `proposed_action`, the terminal policy, path scope, auto mode and the absolute ceilings.

| # | decision | status |
|---|---|---|
| [0011](0011-infra-dev-agents-worktrees-merge-lock.md) | Dev agent infrastructure: worktrees, git executors and the merge lock | accepted |
| [0012](0012-dev-agent-real-toolloop-orcamento-bloqueio.md) | Real DevAgent: ToolLoop, per-task budget and blocking discipline | accepted |
| [0017](0017-lock-de-workspace-e-monitor-de-dev-agents.md) | Workspace initialization lock, dev agent Monitor and ceiling inheritance | accepted |
| [0018](0018-noop-dev-agent-modo-de-execucao.md) | NoopDevAgent as a permanent execution mode | accepted |
| [0019](0019-destravar-dev-agent-adr-por-modulo-orcamento-projeto.md) | Unblocking the real DevAgent: writing, terminal, ADR by module, and per-project budget | accepted |
| [0045](0045-reagendamento-por-evento-do-dev-agent.md) | Event-based rescheduling of the dev agent, and the circuit breaker | accepted |
| [0047](0047-operabilidade-pos-dogfooding.md) | Post-dogfooding operability: closing Phase 12 | accepted |
| [0048](0048-decisao-no-log-e-a-ordem-do-gate.md) | The decision in the event log, and the gate's ordering | accepted |
| [0052](0052-dev-agent-espera-aprovacao-no-meio-do-laco.md) | The dev agent waits for approval mid-loop | accepted |
| [0055](0055-escopo-de-caminho-na-politica-de-terminal.md) | Path scope in the terminal policy | accepted |
| [0102](0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md) | Revision of ADR 0065: the external-effect boundary stops being `deny` and becomes an absolute ceiling | accepted |
| [0167](0167-modo-automatico-libera-o-escopo-de-caminho.md) | Automatic mode releases the path scope, and only it | accepted |
| [0189](0189-o-piloto-automatico.md) | The autopilot: automatic mode approves everything except the ceilings, the scope compares against the real execution folder, and "Always allow" records verb + subcommand | accepted |
| [0204](0204-modo-automatico-libera-push-e-pr.md) | Automatic mode releases push and PR | accepted |

## Where the code lives — execution modes {#tema-modos}

The three execution modes, the user's folder, the projects base and converting a project between modes.

| # | decision | status |
|---|---|---|
| [0066](0066-nome-de-pasta-legivel-do-workspace.md) | Readable workspace folder name | accepted |
| [0072](0072-projeto-local-ou-container.md) | The project chooses where the code lives: user folder or managed folder | accepted |
| [0104](0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md) | `execution_mode` in three values, and the workspace is born `unverified` when the runner is the one who verifies it | accepted |
| [0107](0107-navegacao-de-pasta-local-via-o-runner.md) | Local folder navigation via the Runner | accepted |
| [0108](0108-projeto-runner-nasce-ao-navegar-pasta-no-wizard.md) | In `runner` mode, the project is born when clicking "Browse folder...", not only at confirmation | accepted |
| [0111](0111-conversao-de-execution-mode-de-projeto-existente.md) | Converting `execution_mode` on an existing project: refuse with an active dev agent, relocate `permissions.json`, retire the container row | accepted |
| [0141](0141-base-unica-dos-projetos-montados.md) | The single base for mounted projects, mounted by identity | accepted |
| [0142](0142-validacao-de-workspace-montado-adiada.md) | Validation of the mounted workspace is deferred until materialization | accepted |
| [0146](0146-base-consentida-no-bootstrap.md) | The base consented at bootstrap, and `mounted` as the local default | accepted |

## Project container and broker {#tema-container}

The project container's lifecycle, the image decision, the Docker port and the broker that talks to the daemon.

| # | decision | status |
|---|---|---|
| [0065](0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md) | Container per project: the boundary stops being policy | accepted |
| [0081](0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md) | Container lifecycle: state table, no orchestrator | accepted |
| [0083](0083-terminal-mostra-estado-real-do-container.md) | The Terminal tab gets the real consumer of the lifecycle, not the terminal | accepted |
| [0128](0128-porta-de-docker-e-a-prova-de-empacotamento.md) | The Docker port, and the packaging proof that chose the implementation | accepted |
| [0130](0130-broker-de-container.md) | The container broker: who talks to the server's Docker, and why it does not accept a specification | accepted |
| [0131](0131-roteamento-de-modulos-para-infra.md) | The Arquiteto routes modules to infra: it NOMINATES, Infra ELECTS | accepted |
| [0133](0133-infra-elege-imagem-do-roteamento.md) | Infra elects among the routing's candidates, and the election becomes a new version of `artifact.project_image` | accepted |
| [0134](0134-dev-agents-executam-dentro-do-container.md) | Dev agents execute INSIDE the project's real container, and the terminal gains an auto-approval floor in there | accepted |
| [0135](0135-portao-de-imagem-nos-tres-modos.md) | The Arquiteto's image gate (RN-105) now applies in all three execution modes | accepted |
| [0136](0136-pagina-global-de-containers.md) | Global containers page: a per-load ceiling on the broker, and `container_remove` under the absolute ceiling | accepted |
| [0137](0137-o-runner-sobe-o-container-do-projeto.md) | `brabo-runner` brings up the project's container on the user's machine | accepted |
| [0143](0143-agentes-de-dev-so-depois-do-container.md) | Dev agents only after the container | accepted |
| [0144](0144-a-segunda-raiz-do-broker.md) | The broker's second root, and the discriminated locator that chooses it | accepted |
| [0180](0180-container-com-o-dono-da-pasta.md) | The project container runs as the folder's owner, measured by the api | accepted |
| [0190](0190-a-infra-sobe-o-container-no-aceite.md) | Infra brings up the container on handoff acceptance, as a server step and with seeded autonomy, and it is Infra that hands over to the Dev Lead | accepted |
| [0199](0199-recurso-minimo-derivado-do-module-map.md) | The container's minimum resource is derived from the `module_map`: each module declares its own, and Infra starts with the sum | accepted |
| [0208](0208-a-infra-herda-a-rede-do-arquiteto.md) | Infra inherits the network the Arquiteto declared | accepted |
| [0228](0228-comando-do-app-e-rede-do-container.md) | The project container starts the app with the declared command and publishes ports on loopback only | accepted |
| [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) | QA tests on an ephemeral instance, with the services the Infra declared | accepted |
| [0264](0264-o-app-reinicia-so-o-processo.md) | Depois do avanço da pasta, o app reinicia só o processo, sem recriar o container | accepted |
| [0265](0265-o-app-declarado-propoe-recriar-o-container.md) | O app declarado pela Infra propõe recriar o container, com a porta na faixa 13000+ | accepted |

## The local runner {#tema-runner}

The CLI on the user's machine — its channel, credentials, device keys, distribution, base and service.

| # | decision | status |
|---|---|---|
| [0103](0103-runner-local-execucao-na-maquina-do-usuario.md) | Local runner: execution on the user's machine over a Phoenix channel with a single-use ticket | accepted |
| [0105](0105-personal-access-token-do-runner-escopado-por-construcao.md) | Personal Access Token (`brb_…`) for the runner, scoped by construction to a single route | accepted |
| [0106](0106-distribuicao-do-runner-via-tsup-e-npm-publish.md) | Distribution of `@brabo/runner` via `tsup` and `npm publish`, version injected only in CI | accepted |
| [0112](0112-binario-standalone-do-runner-via-bun-build-compile.md) | Standalone binary of `@brabo/runner` via `bun build --compile`, native `.node` addon embedded by real extraction to a temp directory | accepted |
| [0118](0118-configuracao-automatica-do-runner-pelo-navegador.md) | Browser-driven runner setup: an Ed25519 device key as a second `runner-ticket` credential, a GitHub Releases proxy for the binary, and the File System Access API for a one-click configured folder | accepted |
| [0145](0145-docker-pre-requisito-do-runner.md) | Docker becomes a real prerequisite of the `runner` mode | accepted |
| [0147](0147-agente-local-com-capacidades.md) | One local agent, capabilities declared on connection | accepted |
| [0151](0151-base-consentida-no-runner.md) | The base consented in the runner, and folder creation through the channel | proposed |
| [0154](0154-chave-de-dispositivo-de-maquina.md) | The machine device key | accepted |
| [0174](0174-runner-sem-binario-darwin-x64.md) | The runner's standalone binary stops promising Intel Mac | accepted |
| [0187](0187-runner-sem-binario-win32-x64.md) | The runner's standalone binary stops promising Windows | accepted |
| [0193](0193-git-credenciado-no-host-do-runner.md) | Credentialed git runs on the runner's HOST; the code runs in the container | accepted |
| [0201](0201-revogacao-por-chave.md) | Revocation targets the KEY, not the `{project, user}` pair | accepted |
| [0203](0203-aposenta-o-fluxo-do-runner-pelo-navegador.md) | The runner flow through the browser is retired, and the path is the installer | accepted |
| [0230](0230-importar-chave-de-llm-pelo-runner.md) | The runner imports the LLM API key the user already has on the machine | accepted |

## Auth, access and secrets {#tema-iam}

First-party auth, roles and their ceilings, workspace membership, cross-origin hardening and secret envelopes.

| # | decision | status |
|---|---|---|
| [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) | First-party auth: argon2id, EdDSA and refresh rotation | accepted |
| [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) | Cutting Keycloak: our own issuer, service token and cookie-based session | accepted |
| [0037](0037-cors-do-engine-e-a-porta-como-contrato.md) | The CORS the engine didn't have, and the port as part of the contract | accepted |
| [0050](0050-credencial-sempre-cifrada-verificacao-explicita.md) | Credential always encrypted; verification becomes an explicit action | accepted |
| [0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md) | Closed CSP on the api, and project scope contained at the root | accepted |
| [0059](0059-segredo-do-state-de-oauth-sem-default.md) | The key that signs the git OAuth `state` has no default | accepted |
| [0084](0084-login-social-github-e-gitlab.md) | Social login (GitHub/GitLab), revising the ADR 0031/0032 backlog | accepted |
| [0096](0096-smtp-real-no-mailsender.md) | Real SMTP in `MailSender`, behind an explicit toggle | accepted |
| [0127](0127-tetos-de-rebaixamento-em-project-members.md) | Two downgrade ceilings on `project_members`, and the override stays | accepted |
| [0156](0156-teto-de-auto-rebaixamento-na-remocao.md) | The self-downgrade ceiling also on project member removal | accepted |
| [0157](0157-teto-de-auto-movimento-no-upsert-de-workspace.md) | The self-movement ceiling on the workspace upsert, and the self-promotion that was a loophole | accepted |
| [0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md) | The master key's id recorded in the envelope, as observability and never as authority | accepted |
| [0173](0173-remocao-de-membro-de-workspace.md) | Workspace member removal is born, protected by the same clause | accepted |
| [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md) | Quick access by role only in the local environment | accepted |

## LLM providers, models and spend {#tema-llm}

The provider contract, the model catalog and curation, model bindings, metering and budgets.

| # | decision | status |
|---|---|---|
| [0040](0040-moeda-do-dashboard.md) | Dashboard currency: USD for now, manual per-workspace exchange rate deferred | accepted |
| [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) | An OpenAI-compatible base, an LLM provider contract, and capabilities that refuse a binding | accepted |
| [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) | Living catalog, model lifecycle and auditable price | accepted |
| [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) | Six LLM providers on top of the base, and Phase 9b finally closed | accepted |
| [0049](0049-curadoria-de-modelo-por-workspace.md) | Model curation per workspace | accepted |
| [0051](0051-facetas-de-capability-e-curadoria-por-uso.md) | Proven capability facets; "what it's good for" is curation | accepted |
| [0063](0063-duas-audiencias-para-o-mesmo-gasto.md) | Two audiences for the same spend: the owner's bill and the member's consumption | accepted |
| [0064](0064-escopo-de-area-na-cascata-e-o-binding-de-agente-global.md) | Area scope in the model cascade, and the global agent binding | accepted |
| [0075](0075-embeddings-no-contrato-de-llm-provider.md) | Embeddings in the LLMProvider contract | accepted |
| [0076](0076-provider-volta-a-ser-dimensao-de-gasto.md) | `provider` becomes a spend dimension again, and containment moves to the type | accepted |
| [0077](0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) | Model ranking by capability, with no invented score | accepted |
| [0110](0110-budget-por-area-aditivo-nao-cascata.md) | Budget per area is ADDITIVE, next to project/session — not a cascade, and not a new table | accepted |
| [0114](0114-deteccao-de-ollama-nativo-no-bootstrap-dev.md) | Native Ollama detection in dev bootstrap: ask once, persist to `.env`, gate the compose services behind a profile | accepted |
| [0115](0115-pedido-de-pull-de-modelo-huggingface-tabela-propria.md) | Hugging Face model pull: a dedicated table, two-step confirmation, and an official-publisher allowlist — never `proposed_actions` | accepted |
| [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) | The routing preference lives in the model binding, travels with it, and freezes in metering | accepted |
| [0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md) | The real cost the provider returns becomes the metering number | accepted |
| [0198](0198-duplicata-semantica-por-embedding-com-limiar-que-so-avisa.md) | Semantic duplicates of stories and rules are warned by embedding with a threshold, and the spending enters metering | accepted |
| [0221](0221-upstream-preso-por-sessao.md) | The hub pins each agent's conversation to the upstream that served it, by `session_id` | accepted |
| [0222](0222-provider-9router-de-llm.md) | The 9Router LLM provider | accepted |
| [0223](0223-orcamento-de-raciocinio-por-modelo.md) | Reasoning budget per model | accepted |
| [0224](0224-raciocinio-abortado-no-stream.md) | Reasoning is counted in the stream and aborted at the limit, and the cost is estimated and reconciled | accepted |
| [0225](0225-teto-de-preco-do-upstream-no-openrouter.md) | OpenRouter gets a price ceiling per call (`provider.max_price` = catalog × 1.5) | accepted |
| [0227](0227-provider-opencode-zen-de-llm.md) | OpenCode Zen comes in as the 11th LLM provider, in the OpenAI dialect only | accepted |
| [0233](0233-membro-ve-o-gasto-do-projeto-sem-credencial.md) | The member sees the project's spend by agent and by area, never by provider | accepted |
| [0251](0251-preco-de-lista-datado-para-provider-sem-preco.md) | Dated list price in code for a provider that does not report a price | accepted |
| [0257](0257-na-anthropic-direta-o-raciocinio-desligado-e-por-modelo.md) | On direct Anthropic, switched-off reasoning is per model and the effort reduces Opus | accepted |
| [0279](0279-provider-de-llm-duble-do-regressivo.md) | Provider de LLM dublê do regressivo, dentro da api | accepted |
| [0296](0296-o-teto-de-gasto-e-mensal-e-o-workspace-tem-teto-proprio.md) | O teto de gasto é mensal e o workspace tem teto próprio | accepted |

## RAG, knowledge graph and artifacts {#tema-conhecimento}

Chunks and hybrid search, its measurement, the Neo4j graph and the artifacts projected from the event log.

| # | decision | status |
|---|---|---|
| [0079](0079-tabela-de-chunks-vetor-e-tsvector-juntos.md) | Chunks table: vector and `tsvector` on the same row | accepted |
| [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md) | Hybrid search: weights, threshold, and what counts as a citation | accepted |
| [0082](0082-chat-rag-aba-de-busca-hibrida.md) | Chat RAG: its own hybrid-search tab, without renaming "Chat" | accepted |
| [0099](0099-neo4j-grafo-de-conhecimento-e-templates.md) | Neo4j as knowledge graph and prompt templates, driver in the api | accepted |
| [0100](0100-rag-search-e-modelos-garantidos-no-boot.md) | `rag_search` for agents and Ollama models guaranteed at boot | accepted |
| [0101](0101-memoria-relacional-como-projecao-do-event-log.md) | Relational memory as an event log projection; templates consumed without touching GenServers | accepted |
| [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) | Locally attached folder becomes `chunks.scope = 'local'`, read by the BROWSER, never a host path | accepted |
| [0129](0129-telemetria-de-busca-do-rag-como-tabela.md) | RAG search telemetry is a TABLE, with the weights frozen in the row | accepted |
| [0132](0132-golden-set-de-acerto-do-rag.md) | RAG accuracy golden-set, and the `rag-acertivo` gate | accepted |
| [0138](0138-golden-set-do-rag-em-ci-agendado.md) | The RAG golden-set now runs in CI, scheduled — and remains `warn` | accepted |
| [0148](0148-artefatos-projetados-em-arquivo.md) | The agents' artifacts projected to files, in a `docs/` folder | accepted |
| [0196](0196-anamnese-religada-com-sujeito-e-fato-do-perfil.md) | The Anamnese turned back on: it does not run without a subject, and the accepted hypothesis becomes a profile fact | accepted |
| [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md) | The contract between modules becomes a versioned Arquiteto artifact, and the dev agent reads it instead of someone else's worktree | accepted |
| [0205](0205-desvio-do-agente-como-sinal-do-produto.md) | The agent deviation the Anamnese observes becomes a product signal, without personal data | accepted |
| [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md) | A indexação de docs tem teto próprio de 4 MiB, e o corte é declarado | accepted |
| [0272](0272-a-busca-do-rag-limita-os-trechos-por-arquivo.md) | A busca híbrida do RAG limita os trechos por arquivo | accepted |
| [0291](0291-as-percepcoes-olham-o-produto-do-usuario-e-a-falha-tecnica-e-sinal-interno-do-tp-01.md) | As Percepções olham o produto do usuário; a falha técnica é sinal interno do TP-01 | accepted |
| [0293](0293-a-memoria-do-projeto-e-markdown-versionado-e-o-grafo-e-o-rag-sao-indices.md) | O projeto tem memória em markdown que o dev lê antes de explorar | proposed |

## Web UI and design system {#tema-web}

Screens, navigation, themes and the structure of the web app's largest files.

| # | decision | status |
|---|---|---|
| [0036](0036-telas-de-auth-fieis-ao-design-e-fontes-auto-hospedadas.md) | Auth screens faithful to the design, and the three fonts that weren't loading | accepted |
| [0060](0060-superficie-de-leitura-de-codigo.md) | The code-reading surface, contained and budgeted | accepted |
| [0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) | Reachable theme, and the boot under CSP | accepted |
| [0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) | Screen frame, and the tab registry diverges from the handoff on purpose | accepted |
| [0097](0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md) | Direct read of the engine schema for the dashboard's "N agents online" | accepted |
| [0116](0116-tipos-do-web-gerados-do-openapi.md) | `ActionType` (and future types) generated from the OpenAPI contract, not hand-copied | accepted |
| [0122](0122-sessionpage-dividido-em-cinco-prs.md) | `SessionPage.tsx` split into five mechanical PRs, declared upfront | accepted |
| [0124](0124-hook-do-canal-de-turno-do-sessionpage.md) | Turn-channel state cluster extracted into `useTurnoDoAgente` | accepted |
| [0125](0125-projectsettingstab-dividido-por-secao.md) | `ProjectSettingsTab.tsx` split into one file per section, behind a barrel | accepted |
| [0126](0126-trilho-vertical-de-navegacao-do-projeto.md) | The project page navigates by a vertical rail, and the Code tab stops auto-collapsing the sidebar | accepted |
| [0176](0176-sessionpage-abaixo-de-mil-linhas.md) | `SessionPage.tsx` below 1,000 lines, in ten mechanical PRs, and the lock only afterwards | accepted |
| [0181](0181-tema-preto-neutro.md) | The dark theme becomes neutral black, and the contrast debt ends | accepted |
| [0210](0210-animacao-de-texto-com-motion.md) | Text animation with `motion` | accepted |
| [0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) | A single navigation: the sidebar absorbs the project rail | accepted |
| [0232](0232-shadcn-com-base-ui-no-apps-web.md) | shadcn/ui with Base UI and Tailwind 4 in `apps/web` | accepted |
| [0234](0234-shiki-e-recharts-por-carga-dinamica.md) | `shiki` in the Code Block and `recharts` in the Chart, always by dynamic loading | accepted |
| [0237](0237-o-visual-v3-liga-o-preflight-e-sobe-os-raios.md) | Visual v3 turns on the preflight and raises the radii | accepted |
| [0238](0238-o-grafo-de-modulos-vira-canvas-xyflow.md) | The Architecture module graph becomes a Canvas (`@xyflow/react`) | accepted |
| [0239](0239-csp-frame-src-local-para-o-web-preview.md) | Local CSP `frame-src` for the deliverable's Web preview | accepted |
| [0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md) | The reason for an inert control can live in an active "?" on the Containers page | accepted |
| [0241](0241-a-sidebar-adota-o-block-sidebar-07-do-shadcn.md) | The sidebar adopts shadcn's `sidebar-07` block | accepted |
| [0242](0242-containers-em-tabela-linear-com-tanstack-react-table.md) | Containers in a linear table with `@tanstack/react-table` | accepted |
| [0243](0243-consequencia-irreversivel-pode-morar-num-botao-de-perigo.md) | An irreversible consequence can live in a danger button | accepted |
| [0244](0244-coluna-das-abas-do-projeto-alinhada-a-esquerda.md) | Project tabs column aligned to the left | accepted |
| [0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) | Page content takes up the full width | accepted |
| [0250](0250-chat-da-sessao-ocupa-a-largura-inteira.md) | The Session chat takes up the full width | accepted |

## Operation, deploy and installation {#tema-operacao}

Production images, Kubernetes, observability, backup, the dev compose and the one-line installer.

| # | decision | status |
|---|---|---|
| [0024](0024-fase5-imagens-producao-ci.md) | Phase 5 (session 1): production images, compose.prod, CI, and smoke test | accepted |
| [0025](0025-fase5-deploy-kubernetes-kustomize.md) | Phase 5 (session 2): Kubernetes deploy with Kustomize, queue metric and local overlay | accepted |
| [0026](0026-fase5-observabilidade-e-graceful-shutdown.md) | Phase 5 (session 3): graceful shutdown, OpenTelemetry, metrics, logs and dashboards | accepted |
| [0027](0027-fase5-backup-hardening-release.md) | Backup/restore, api hardening, exposed surface and release | accepted |
| [0035](0035-observabilidade-legivel-e-trace-sem-coletor.md) | Trace without a collector, and the path between layers in the log | accepted |
| [0070](0070-observabilidade-no-compose-local.md) | Observability in the local Compose: metric and log, no trace | accepted |
| [0150](0150-instalador-de-uma-linha.md) | The one-line installer, with a chosen source and a marker | proposed |
| [0152](0152-backup-de-volumes-contra-compose.md) | Volume backup and restore, against compose | proposed |
| [0153](0153-deploy-enabled-o-gatilho-que-ninguem-cria.md) | `DEPLOY_ENABLED`: the trigger ten documents cite and none creates | proposed |
| [0155](0155-a-primeira-conta-nasce-no-terminal.md) | The first account is born in the terminal, and the local agent comes up paired | accepted |
| [0160](0160-o-compose-do-instalador-viaja-assinado.md) | The installer's compose travels with it, as a signed asset | accepted |
| [0161](0161-a-tela-so-oferece-o-modo-que-a-instalacao-executa.md) | The screen only offers the mode the installation executes, and the Release installation has no broker | accepted |
| [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md) | The broker becomes the fifth published image, and the installer ASKS whether to turn it on | accepted |
| [0169](0169-seaweedfs-no-lugar-do-minio-no-overlay-local.md) | The local overlay's S3 destination stops being MinIO and becomes SeaweedFS | accepted |
| [0170](0170-compose-de-dev-brabo-dev.md) | The dev compose becomes `brabo-dev`, and dev refuses to come up next to an installation | accepted |
| [0209](0209-engine-em-otp-29.md) | The engine moves up to Elixir 1.20.4 / OTP 29.1.1 | accepted |
| [0256](0256-a-migracao-restaura-o-banco-num-banco-vazio.md) | The installer's migration restores the database into a freshly created, empty database | accepted |

## CI, release and supply chain {#tema-engenharia}

The pipeline, the published images, signing, scanning, pinning, the test layers and the repository's own structure.

| # | decision | status |
|---|---|---|
| [0039](0039-actionlint-e-validacao-do-pipeline-de-ci-gerado.md) | actionlint and validation of the generated CI pipeline | accepted |
| [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) | Images published to GHCR on every final tag, and the production overlay pinned by digest | accepted |
| [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md) | Browser E2E against the production compose, in a package outside the workspace | accepted |
| [0121](0121-schema-dividido-por-agregado-de-dominio.md) | The schema split by domain aggregate, behind a barrel | accepted |
| [0140](0140-timeout-do-audit-como-risco-assumido.md) | A repeated `pnpm audit` timeout is an accepted risk; a finding still fails | accepted |
| [0149](0149-assinatura-dos-artefatos-publicados.md) | Signature of published artifacts | proposed |
| [0159](0159-imagem-de-terceiro-por-digest.md) | A third-party image comes in by digest, and the lint fails whoever forgets | accepted |
| [0172](0172-trivy-no-release-antes-de-assinar.md) | The release scans with Trivy what it publishes, by digest, before signing | accepted |
| [0178](0178-tag-inline-na-imagem-de-terceiro.md) | The third-party image tag lives INSIDE the reference, before the digest | accepted |
| [0197](0197-a-imagem-dos-workflows-vem-do-compose.md) | The workflows' image comes from the compose, and image Dependabot is turned on | accepted |
| [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) | Brabo becomes a set of repositories in `viralabs-dev` | accepted |
| [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md) | O `brabo-qa` tem regressivo por funcionalidade, e o da PR para a `dev` nunca é exigido | accepted |
| [0270](0270-o-contracts-e-publicado-no-github-packages.md) | O brabo-contracts é publicado no GitHub Packages, com o `shared` só de tipos | accepted |
| [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) | Cada run do Actions mostra os vínculos entre os repositórios | accepted |
| [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md) | O regressivo roda num compose só; o grafo mostra cada funcionalidade por uma matrix de exibição, e o relatório é a fonte da decisão | accepted |
| [0278](0278-a-mudanca-e-vista-num-painel-do-brabo-ci.md) | A mudança é vista num painel do brabo-ci, sem check nas PRs | accepted |
| [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) | O pin do brabo-ci nos consumidores aponta para uma tag, e a branch decide qual | accepted |
| [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md) | O mapa dos 11 repos tem uma fonte só, o `repos.yml` do `brabo`, e o README é gerado dela | accepted |
| [0282](0282-a-pin-dos-componentes-segue-a-release-final.md) | A pin dos componentes segue a última Release final | accepted |
| [0285](0285-a-prova-de-uma-aresta-e-arquivo-mais-trecho.md) | A prova de uma aresta do `repos.yml` é arquivo mais trecho literal, não arquivo:linha | accepted |
| [0286](0286-as-capturas-da-doc-sao-geradas-pelo-qa-e-entram-por-pr.md) | As capturas da doc são geradas pelo brabo-qa e entram no brabo por PR do App | proposed |
| [0289](0289-a-recaptura-segue-a-pin-e-so-pede-o-dono-quando-a-imagem-muda.md) | A recaptura segue a pin do web e só pede o dono quando a imagem muda | proposed |

## Documentation {#tema-docs}

How documentation is generated, verified and published.

| # | decision | status |
|---|---|---|
| [0029](0029-sincronizacao-continua-da-documentacao.md) | Continuous documentation synchronization | accepted |
| [0033](0033-referencia-de-api-gerada-do-openapi.md) | The API reference comes out of code, and the table test enforces the metadata | accepted |
| [0034](0034-documentacao-publicada-por-degrau.md) | Documentation published per stage, in a Pages subdirectory | accepted |
| [0071](0071-publicacao-simetrica-por-degrau.md) | Symmetric publishing per stage, and a root that chooses | accepted |
| [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) | The published path names the environment, not the branch | accepted |
| [0117](0117-lockfile-proprio-para-o-website.md) | `website/` gets its own lockfile, out of the product's `pnpm audit` | accepted |
| [0202](0202-o-indice-de-adr-por-tema.md) | The ADR index by theme, with the theme outside the ADR | accepted |
| [0206](0206-referencia-da-api-numa-pagina-redoc.md) | The API reference becomes a Redoc page | accepted |
| [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) | Four languages, with pt-BR as SOURCE and default: documentation and interface in Portuguese, English, Russian and Simplified Chinese | accepted |
| [0218](0218-titulo-de-adr-com-prefixo.md) | Every ADR is titled "ADR NNNN — title" | accepted |
| [0219](0219-referencia-entra-na-traducao.md) | The reference enters translation | accepted |
| [0220](0220-api-traduzida-por-catalogo.md) | The API page is translated by catalog | accepted |
| [0253](0253-o-site-de-docs-deixa-o-docusaurus.md) | The docs site leaves Docusaurus | accepted |
| [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) | Each area's doc lives at its root | accepted |
| [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md) | The documentation of the code repos is English-only; the site serves the English source with a banner | accepted |
| [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md) | A doc dos repositórios é em pt-BR por padrão, com traduções permitidas nos irmãos | accepted |
| [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) | A paridade de tradução mede só a doc do brabo | accepted |
| [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) | Os gerados do `brabo` leem os irmãos por uma trava de SHAs | accepted |
| [0275](0275-cada-irmao-confere-as-proprias-refs-com-simbolo.md) | Cada irmão confere as próprias refs com símbolo no PR | accepted |
| [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) | O índice de ADR é gerado, e a referência grande vira índice mais partes | proposed |
| [0288](0288-link-entre-repos-nas-rns-e-url-do-repo-dono.md) | O link entre repos nas RNs é a URL do repo dono, e o site a devolve para relativo | proposed |
<!-- END:GENERATED:indice-de-adr -->

## The convention

- **One file per decision**, at `docs/adr/NNNN-short-title.md`, with
  sequential 4-digit numbering, and the title `# ADR NNNN — <title>`
  ([0218](0218-titulo-de-adr-com-prefixo.md)). **No number reuse**, not even when an ADR
  is superseded — the next one is **0255**.
- **One theme per decision**, chosen by whoever writes the ADR, in the same
  PR: a line in `docs/adr/temas.yml` and the index row under that theme's
  section, in numeric order. The reviewer confirms it. A new theme is a
  change to the list in `temas.yml`, justified in the PR that adds it; going
  past 15 takes an ADR that revises [0202](0202-o-indice-de-adr-por-tema.md).
- **Three sections, only those:** **Context** (the problem or force that motivated it),
  **Decision** (what was decided), **Consequences** (the accepted trade-offs and
  what's left for later).
- **No third-party template** — no Nygard, MADR or variants. The three
  sections are enough.
- **In Portuguese**, like the rest of the project.
- **An accepted ADR is not edited.** One superseded by a later decision stays as
  it is; the new ADR references the old one and explains what changed.

What gives these ADRs their value is recording what did **not** work: 0020
documents nine failed executions in a row, and 0027 records a justification
that was revised within the same session that produced it. An omitted bad
consequence is the part that's missed six months later.
