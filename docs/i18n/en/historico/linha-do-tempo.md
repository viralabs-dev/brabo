---
id: linha-do-tempo
title: Brabo timeline
sidebar_label: Timeline
description: Brabo's big turning points, from the first phase to the split into repositories, in a five-minute read, each with a link to the evidence.
keywords: [history, phases, timeline, milestones]
tipo: historico
traducao_de: 9d7eae2505b22c873aea004c17b7f0f3abab09d3
---

# Brabo timeline

Five minutes of reading. Each milestone says what changed, why it mattered and where the proof is. The full record remains intact in the [Phase history](../explanation/historico-de-fases.md); only the turning points are kept here.

:::historico 2026-11-08
This timeline describes the path up to the date above. What holds today lives in the business rules and the ADRs, not here.
:::

## Foundation (August 2026)

**Phases 1 to 5.** IAM, sessions with an immutable event log, chat with an LLM router, git providers, agents and PR gates came into being. Phase 5 took everything to production images and Kubernetes. It mattered because it defines the shape of the product to this day. Proof: [ADR 0020](../adr/0020-destravar-gates-qa-secops.md), [ADR 0024](../adr/0024-fase5-imagens-producao-ci.md).

**Phases 6 to 9.** Branch policy became code, Keycloak left and authentication became our own, agents gained a hierarchy by area and the model catalog got auditable pricing. It mattered because it took the rule out of people's memory. Proof: [ADR 0030](../adr/0030-politica-de-branches-mecanizada.md), [ADR 0032](../adr/0032-corte-do-keycloak-e-sessao-em-cookie.md), [ADR 0038](../adr/0038-hierarquia-de-agentes.md).

**Phases 10 to 12.** Brabo built part of itself for the first time (dogfooding) and found 17 defects. Phase 12 closed the three most serious and proved it in a single run. It mattered because it replaced the impression of "it works" with measurement. Proof: [first dogfooding](../explanation/primeiro-dogfooding.md), [ADR 0047](../adr/0047-operabilidade-pos-dogfooding.md).

**Phase 13.** First run with an API model and a real GitHub: the cheap half passed, the expensive one failed in ways no test had shown. It mattered because it became the lesson "every metric comes from a script, never from a note". Proof: [real validation](../explanation/validacao-real.md), [triaged backlog](../explanation/backlog.md).

**Phases 14 and 15.** Phase 14 fixed what the real run demanded (a turn failure became a durable event). Phase 15 turned the gates into declarative data, in `gates.yml`. It mattered because the gates' external contract became stable. Proof: [part 1 of the history](../explanation/historico-de-fases-parte-1.md), [Gates](../explanation/gates.md).

**Post-phase 15 (v2.5).** Fixes that use, not a script, found: a blank screen on a 429 error, loading, error and empty states on every screen. It mattered because the three-state rule became general. Proof: [part 1 of the history](../explanation/historico-de-fases-parte-1.md).

## Use starts to lead (August and September 2026)

**Program 16 to 26.** Eleven requests born from the first real navigation: the design handoff was adopted, the container became per project and spending gained two audiences. It mattered because the security boundary stopped being policy and became isolation. Proof: [ADR 0065](../adr/0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md), [part 2 of the history](../explanation/historico-de-fases-parte-2.md).

**Rounds exp003 and exp001.** Live test sessions fixed things no suite caught, such as the Criativo that promised to fix and didn't. It mattered because the biggest defect was invisible to any suite and only real use showed it. Proof: [part 2 of the history](../explanation/historico-de-fases-parte-2.md).

**Program 28.** The light theme became reachable, the container lifecycle became a table, the RAG Chat gained a pipeline and its own tab, and social login was released. It mattered because it closed declared cuts from earlier phases. Proof: [ADR 0081](../adr/0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md), [part 3 of the history](../explanation/historico-de-fases-parte-3.md).

**Audit of the flow against the code.** A read-only pass crossed `fluxo.yml` with the code. The Dev Lead's plan began to require real approval, and the team's new agents came in waves. It mattered because the target model stopped being aspiration. Proof: [audit](../explanation/auditoria-fluxo-vs-codigo.md), [ADR 0085](../adr/0085-fluxo-como-registro-declarativo.md), [ADR 0086](../adr/0086-dev-lead-plano-suspende-para-aprovacao.md).

## From the server to the user's machine (August to September 2026)

**Local runner (20/08).** The agent began to run on the user's machine, in their folder, with a real terminal. It mattered because it changed the global policy on `git push` and `sudo`, by an explicit decision of the owner. Proof: [ADR 0102](../adr/0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md), [ADR 0103](../adr/0103-runner-local-execucao-na-maquina-do-usuario.md).

**Phase 28, the user's folder.** The `mounted` mode and the runner gained a base consented to at bootstrap and a local agent that declares capabilities. It mattered because opening the editor and seeing the work in a folder of one's own was the missing minimum. Proof: [phase 28](../explanation/fase-28-pasta-do-usuario.md), [ADR 0146](../adr/0146-base-consentida-no-bootstrap.md), [ADR 0147](../adr/0147-agente-local-com-capacidades.md).

**Phase 29, the one-line install.** Published artifacts became signed and `install.sh` verifies its own origin. It mattered because phase 28 refused the installer until there was a signature. Proof: [phase 29](../explanation/fase-29-instalacao-de-uma-linha.md), [ADR 0149](../adr/0149-assinatura-dos-artefatos-publicados.md), [ADR 0150](../adr/0150-instalador-de-uma-linha.md).

**Phase 30, the runner per machine.** The runner gained a device key and the first account began to be born in the terminal. It mattered because installing and using became one line. Proof: [phase 30](../explanation/fase-30-runner-por-maquina.md), [ADR 0154](../adr/0154-chave-de-dispositivo-de-maquina.md), [ADR 0155](../adr/0155-a-primeira-conta-nasce-no-terminal.md).

## The product becomes a set of repositories (November 2026)

**Split into 11 repositories (04/11).** The monorepo gave way to one repository per area, with contracts between them by tag and the same PR policy in all. It mattered because each area got its own owner, docs and pipeline. Proof: [ADR 0252](../adr/0252-o-brabo-vira-um-conjunto-de-repositorios.md).

## Where the rest is

- Measurements along the way: [Jev router](../explanation/medicao-do-jev.md), [language heuristic](../explanation/medicao-do-idioma.md), [visual audit of round 29](../explanation/auditoria-visual-rodada-29.md).
- Findings from the real runs: [findings from the real run](../explanation/achados-execucao-real.md), [hello world](../explanation/execucao-real-hello-world.md), [phase 12 validation](../explanation/validacao-fase-12.md).
- Full text of the phases: [Phase history](../explanation/historico-de-fases.md), in four parts.
