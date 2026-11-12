---
id: adr-index
title: Decisões arquiteturais (ADR)
sidebar_label: Índice de ADRs
sidebar_position: 0
description: Os 288 registros de decisão arquitetural do Brabo, agrupados por tema, com o que cada um decidiu.
keywords: [ADR, decisão arquitetural, arquitetura, histórico]
---

# Decisões arquiteturais

Um ADR registra **por que** algo foi decidido, no momento em que foi decidido.
Eles são **imutáveis**: nenhum ADR é editado depois de aceito. Quando uma
decisão muda, nasce um ADR novo que substitui o anterior — foi o que aconteceu
com o [0018](0018-noop-dev-agent-modo-de-execucao.md), que registra a
substituição do NoopDevAgent decidida no [0011](0011-infra-dev-agents-worktrees-merge-lock.md).

Consequência prática: **um ADR pode descrever um estado que não é mais o
atual.** Para o estado atual, use [Regras de negócio](../business-rules.md),
[Arquitetura](../architecture.md) e o [Runbook](../runbook.md). Para o
raciocínio, venha aqui.

A tabela abaixo é **gerada** (`pnpm docs:generate`, [ADR 0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md)): número, título e status de cada ADR, em um tema só. Use o filtro por tema e por status, ou a busca do site. O texto completo de cada decisão está no próprio ADR.

O status vem da seção `## Status` do ADR; sem ela, vale **aceito**. O tema mora em `docs/adr/temas.yml`, ao lado desta página, e não no ADR, porque ADR aceito nunca é editado ([ADR 0202](0202-o-indice-de-adr-por-tema.md)); o `pnpm docs:check` reprova ADR sem tema.

<!-- BEGIN:GENERATED:indice-de-adr -->
**Temas:** [Git, repositório e política de branches](#tema-git) · [Harness de agente, turnos e sessões](#tema-agentes) · [O time de agentes — papéis, áreas e handoffs](#tema-time) · [Gates, QA e revisão de segurança](#tema-gates) · [Execução, política de terminal e aprovações](#tema-execucao) · [Onde o código mora — modos de execução](#tema-modos) · [Container do projeto e broker](#tema-container) · [O runner local](#tema-runner) · [Autenticação, acesso e segredos](#tema-iam) · [Providers de LLM, modelos e gasto](#tema-llm) · [RAG, grafo de conhecimento e artefatos](#tema-conhecimento) · [Interface web e design system](#tema-web) · [Operação, deploy e instalação](#tema-operacao) · [CI, release e cadeia de suprimentos](#tema-engenharia) · [Documentação](#tema-docs)

<div class="adr-filtro" data-adr-filtro hidden><label>Tema <select data-adr-tema><option value="">Todos</option><option value="tema-git">Git, repositório e política de branches</option><option value="tema-agentes">Harness de agente, turnos e sessões</option><option value="tema-time">O time de agentes — papéis, áreas e handoffs</option><option value="tema-gates">Gates, QA e revisão de segurança</option><option value="tema-execucao">Execução, política de terminal e aprovações</option><option value="tema-modos">Onde o código mora — modos de execução</option><option value="tema-container">Container do projeto e broker</option><option value="tema-runner">O runner local</option><option value="tema-iam">Autenticação, acesso e segredos</option><option value="tema-llm">Providers de LLM, modelos e gasto</option><option value="tema-conhecimento">RAG, grafo de conhecimento e artefatos</option><option value="tema-web">Interface web e design system</option><option value="tema-operacao">Operação, deploy e instalação</option><option value="tema-engenharia">CI, release e cadeia de suprimentos</option><option value="tema-docs">Documentação</option></select></label> <label>Status <select data-adr-status><option value="">Todos</option><option value="aceito">aceito</option><option value="proposto">proposto</option></select></label></div>

## Git, repositório e política de branches {#tema-git}

O contrato do provider de git, o nascimento e a adoção do repositório, a proteção e a política de branches.

| # | decisão | status |
|---|---|---|
| [0001](0001-git-provider-contract-shape.md) | Formato do contrato normalizado do GitProvider | aceito |
| [0002](0002-git-error-normalization.md) | Normalização de erros do GitProvider | aceito |
| [0003](0003-git-provider-retry-policy.md) | Política de retry para providers remotos | aceito |
| [0004](0004-git-credential-registration.md) | Cadastro de credenciais de git do usuário | aceito |
| [0005](0005-repo-bootstrap-idempotent-steps.md) | Bootstrap de Gitflow idempotente e retomável | aceito |
| [0028](0028-protecao-de-branch-divergencia-entre-providers.md) | Proteção de branch: divergência entre providers e a matriz de aprovação | aceito |
| [0030](0030-politica-de-branches-mecanizada.md) | Política de branches mecanizada | aceito |
| [0044](0044-adocao-de-repositorio-existente.md) | Adoção de repositório existente, e o plano como portão | aceito |
| [0056](0056-o-engine-trabalha-em-repositorio-remoto.md) | O engine trabalha em repositório remoto | aceito |
| [0139](0139-o-alarme-de-esteira-ganha-destinatario.md) | O alarme de merge de esteira ganha destinatário, e a regra de `dev` | aceito |
| [0165](0165-o-repositorio-nasce-no-handoff-ao-arquiteto.md) | O repositório nasce no aceite do handoff ao Arquiteto, e a execução não começa sem ele | aceito |
| [0217](0217-promocao-automatica-para-qa-em-fase-de-teste.md) | Promoção automática `dev` → `qa` enquanto a QA está em fase de teste | aceito |
| [0235](0235-a-qa-e-aposentada-e-a-esteira-fica-dev-e-main.md) | A `qa` é aposentada por hora e a esteira do repositório fica `dev → main` | aceito |
| [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) | O Dependabot dispensa revisão na `dev` e fica mergeável com os outros checks verdes | aceito |
| [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) | A política de PR é obrigatória em todos os repositórios e a PR de regeneração do bot dispensa a escada na dev | aceito |
| [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md) | O projeto do usuário trabalha em trunk, e a pasta acompanha a main | aceito |
| [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) | O E2E do brabo-qa é portão da main, com aceite justificado | aceito |
| [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) | A PR declara de que PR de outro repo depende, e um check do App espera o merge | aceito |
| [0284](0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) | A promoção infere as dependências pela ordem dos repos | aceito |
| [0292](0292-o-merge-automatico-e-opcao-do-projeto-desligada-por-padrao.md) | O merge automático é opção do projeto, desligada por padrão | aceito |

## Harness de agente, turnos e sessões {#tema-agentes}

Como um agente roda — contexto, o laço de ferramentas, o turno conversacional, a sessão e seus estados.

| # | decisão | status |
|---|---|---|
| [0006](0006-prompt-assembler-context-harness.md) | Harness de agentes: montagem determinística de contexto | aceito |
| [0007](0007-toolloop-tools-context-manager.md) | ToolLoop, ferramentas, ContextManager (harness com LLM) | aceito |
| [0061](0061-tipo-da-sessao-na-criacao.md) | O tipo da sessão é dado da criação, e a execução continua sendo evento | aceito |
| [0098](0098-limites-de-transporte-e-janela-efetiva-de-compactacao.md) | Limites de transporte e janela efetiva de compactação coerentes | aceito |
| [0163](0163-o-clique-responde-ao-aceitar.md) | O clique responde ao ACEITAR o comando, e o turno segue pelo canal | aceito |
| [0175](0175-infra-lead-conversa-pelo-composer.md) | O Infra Lead conversa pelo composer, e antes o turno dele passa pelo `TurnoAssincrono` | aceito |
| [0177](0177-idioma-das-respostas-por-conta-sessao-e-projeto.md) | O idioma das respostas mora em três lugares — conta, sessão e projeto —, em lista aberta de BCP-47 e nunca no `users.locale` | aceito |
| [0179](0179-o-laco-pergunta-ao-jev-qual-ferramenta.md) | O laço pergunta ao Jev qual ferramenta, e o modelo do usuário vê só o menu que sobra | aceito |
| [0183](0183-reabrir-sessao-encerrada.md) | A sessão encerrada pode ser reaberta: uma saída própria dos terminais, para `active`, com evento novo | aceito |
| [0184](0184-reabrir-sessao-decisoes-do-dono.md) | Reabrir sessão: as três decisões do dono, e `developer` reabre | aceito |
| [0191](0191-a-mensagem-com-turno-em-curso-entra-numa-fila.md) | A mensagem que chega com turno em curso entra numa fila persistida e é lida no fim do turno | aceito |
| [0226](0226-diario-vivo-e-retomada-dos-agentes.md) | Diário vivo e retomada dos agentes: o turno interrompido volta uma vez, do plano | aceito |
| [0246](0246-anexos-do-chat-bytes-no-postgres-referencia-no-evento.md) | Anexos do chat: bytes no Postgres, referência no evento, visão por capability | aceito |
| [0247](0247-uma-mensagem-varios-destinatarios.md) | Uma mensagem, vários destinatários | aceito |
| [0249](0249-o-raciocinio-do-agente-e-gravado-e-mostrado-so-a-developer.md) | O raciocínio do agente é gravado e mostrado só a developer ou mais | aceito |
| [0283](0283-a-adr-proposta-declara-qual-substitui.md) | A ADR proposta declara qual ADR substitui (`supersedes`) | aceito |

## O time de agentes — papéis, áreas e handoffs {#tema-time}

Quais agentes existem, o que cada um entrega a quem, a delegação dentro de uma área e o handoff entre eles.

| # | decisão | status |
|---|---|---|
| [0008](0008-agente-criativo-conversacional-handoffs.md) | Agente Criativo conversacional no harness + fundação de handoffs | aceito |
| [0009](0009-agente-po-backlog-rastreabilidade.md) | Agente PO, backlog (epics/stories/tasks) e rastreabilidade | aceito |
| [0010](0010-agente-arquiteto-adr-pr-module-map.md) | Agente Arquiteto: ADRs via PR real, module_map e validação cruzada | aceito |
| [0014](0014-infra-agent-painel-phoenix.md) | InfraAgent e painel do time ao vivo (fechamento da Fase 4a) | aceito |
| [0015](0015-psicologo-real-toolloop-hipoteses-evidencia.md) | Psicólogo real: ToolLoop, hipóteses com evidência e triagem de custo | aceito |
| [0016](0016-anamnese-proficiencia-patches-instrucao.md) | Anamnese: perfil de proficiência, patches de instrução e loop fechado | aceito |
| [0022](0022-fechamento-4b-psicologo.md) | Fechamento da Fase 4b (sessão 1): evidência que chega, custo que aparece, análise que sobrevive ao kill | aceito |
| [0023](0023-fechamento-4b-anamnese.md) | Fechamento da Fase 4b (sessão 2): catálogo que funciona, dedup que distingue quem negou, e fila que sobrevive à rodada | aceito |
| [0038](0038-hierarquia-de-agentes.md) | Hierarquia de agentes: áreas, leads e delegação | aceito |
| [0046](0046-promocao-de-story-com-autoridade-do-usuario.md) | Promoção de história com autoridade do usuário | aceito |
| [0053](0053-dev-lead-e-paralelismo-autorizado.md) | Dev Lead como área, e paralelismo autorizado pelo usuário | aceito |
| [0068](0068-diagrama-c4-do-arquiteto.md) | Diagrama C4 do Arquiteto | aceito |
| [0069](0069-fusao-condicional-do-handoff-com-a-ativacao-de-execucao.md) | Fusão condicional do aceite do handoff com a ativação de execução | aceito |
| [0085](0085-fluxo-como-registro-declarativo.md) | Fluxo de papéis como registro declarativo (fluxo.yml) | proposto |
| [0086](0086-dev-lead-plano-suspende-para-aprovacao.md) | O plano do Dev Lead suspende o turno para aprovação | aceito |
| [0087](0087-ux-designer-agente.md) | O UX Designer entra como agente conversacional | aceito |
| [0088](0088-staff-agente-dormente-para-disparo-automatico.md) | Staff: código pronto, dormente para disparo automático | aceito |
| [0089](0089-analytics-e-delivery-metricas-como-relatorio.md) | `analytics` e `delivery-metricas` viram script de relatório | aceito |
| [0092](0092-platform-relatorio-de-telemetria-sob-demanda.md) | `platform` nasce como script de relatório sob demanda, não agente | aceito |
| [0093](0093-dbre-linter-de-migracao-e-relatorio-de-backup.md) | O papel `dbre` vira dois scripts: linter de migration e relatório de backup | aceito |
| [0094](0094-delegacao-dev-lead-vira-dado.md) | A delegação Dev Lead → dev vira dado, com `parecerArtifactId` redefinido | aceito |
| [0109](0109-handoff-manual-a-agente-a-escolha.md) | Handoff manual a um agente à escolha reusa oferta+aceite, nunca um terceiro estado de handoff | aceito |
| [0182](0182-ciclo-de-vida-do-handoff.md) | A oferta de handoff ganha ciclo de vida: uma pendente por destino, e `superseded` | aceito |
| [0185](0185-estou-pronto-fecha-os-dois-gates.md) | "Estou pronto — a necessidade está validada": um clique fecha a prontidão, o gate `necessidade-validada` e o aceite do PO | aceito |
| [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) | O handoff do PO ao Arquiteto é aceito sem clique quando o backlog está coberto e o repositório é local | aceito |
| [0194](0194-aprovar-o-plano-ativa-a-execucao.md) | Aprovar o plano do Dev Lead ativa a execução, e a tarefa ganha o módulo que ele atribui | aceito |
| [0212](0212-historia-arquivada.md) | A história arquivada: uma coluna, não um estado da máquina | aceito |
| [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md) | O entregável roda na máquina do usuário pelo compose da Infra | aceito |
| [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) | O módulo de que outros dependem tem dono no plano de execução | aceito |
| [0261](0261-o-dev-lead-e-avisado-de-bloqueios-e-pede-ao-arquiteto.md) | O Dev Lead é avisado de bloqueios e pede ao Arquiteto por um canal próprio | aceito |
| [0262](0262-o-agente-retira-a-regra-de-negocio-obsoleta.md) | O agente retira a regra de negócio obsoleta, citando a substituta ou a resposta | aceito |

## Gates, QA e revisão de segurança {#tema-gates}

O registro de gates, os vereditos de QA e SecOps e os golden-sets que os medem.

| # | decisão | status |
|---|---|---|
| [0013](0013-gates-qa-secops-pr.md) | Gates de PR: QAAgent e SecOpsAgent | aceito |
| [0020](0020-destravar-gates-qa-secops.md) | Destravar os gates de QA e SecOps: gitleaks na árvore, pareceres validados e tool call em texto | aceito |
| [0021](0021-fechamento-4a-infra-e-painel.md) | Fechamento da Fase 4a: gate de infra que valida, e painel que diz a verdade | aceito |
| [0054](0054-gates-como-registro-declarativo.md) | Gates como registro declarativo | proposto |
| [0057](0057-o-gate-espera-a-aprovacao.md) | O agente de gate espera a aprovação, como o dev espera | aceito |
| [0067](0067-o-gate-sobrevive-ao-restart.md) | O gate sobrevive ao restart | aceito |
| [0090](0090-qa-estrategia-e-appsec-segundo-momento.md) | QA-estratégia e AppSec como segundo MOMENTO, não agente novo | aceito |
| [0091](0091-secops-runtime-relatorio-de-abuso.md) | `secops-runtime` como script de relatório sobre `rate_limit_hits` | aceito |
| [0095](0095-gate-necessidade-validada.md) | O gate `necessidade-validada` se fecha com confirmação humana separada, não com o Criativo se autovalidando | aceito |
| [0123](0123-golden-set-regressao-qa-automacao.md) | Golden-set de casos de regressão para o julgamento semântico do agente de QA Automação | aceito |
| [0168](0168-golden-set-do-qa-em-ci-semanal.md) | O golden-set do QA passa a rodar em CI, agendado e semanal | aceito |
| [0192](0192-plano-de-teste-depois-da-entrega.md) | O plano de teste nasce depois da entrega do dev, e o gate `implementavel` passa a se julgar sobre a história e o `module_map` | aceito |
| [0207](0207-ciclo-de-gate-velho-estaciona.md) | Ciclo de gate parado há mais de 2 h estaciona, e só gesto humano o retoma | aceito |
| [0214](0214-pergunta-em-aberto-vira-pendencia.md) | Pergunta em aberto vira pendência a resolver | aceito |
| [0215](0215-decisao-do-projeto-chega-ao-dev-e-ao-qa.md) | A decisão do projeto chega ao dev e ao QA | aceito |
| [0258](0258-a-resposta-pelo-chat-fecha-a-pergunta-em-aberto.md) | A resposta dada pelo chat fecha a pergunta em aberto | aceito |

## Execução, política de terminal e aprovações {#tema-execucao}

O dev agent trabalhando, `proposed_action`, a política de terminal, o escopo de caminho, o modo automático e os tetos absolutos.

| # | decisão | status |
|---|---|---|
| [0011](0011-infra-dev-agents-worktrees-merge-lock.md) | Infraestrutura dos dev agents: worktrees, executores git e trava de merge | aceito |
| [0012](0012-dev-agent-real-toolloop-orcamento-bloqueio.md) | DevAgent real: ToolLoop, orçamento por task e disciplina de bloqueio | aceito |
| [0017](0017-lock-de-workspace-e-monitor-de-dev-agents.md) | Lock de inicialização do workspace, Monitor de dev agents e herança de teto | aceito |
| [0018](0018-noop-dev-agent-modo-de-execucao.md) | NoopDevAgent como modo de execução permanente | aceito |
| [0019](0019-destravar-dev-agent-adr-por-modulo-orcamento-projeto.md) | Destravar o DevAgent real: escrita, terminal, ADR por módulo e orçamento por projeto | aceito |
| [0045](0045-reagendamento-por-evento-do-dev-agent.md) | Reagendamento por evento do dev agent, e o circuit breaker | aceito |
| [0047](0047-operabilidade-pos-dogfooding.md) | Operabilidade pós-dogfooding: o fechamento da Fase 12 | aceito |
| [0048](0048-decisao-no-log-e-a-ordem-do-gate.md) | A decisão no event log, e a ordem do gate | aceito |
| [0052](0052-dev-agent-espera-aprovacao-no-meio-do-laco.md) | O dev agent espera a aprovação no meio do laço | aceito |
| [0055](0055-escopo-de-caminho-na-politica-de-terminal.md) | Escopo de caminho na política de terminal | aceito |
| [0102](0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md) | Revisão do ADR 0065: a fronteira de efeito externo deixa de ser `deny` e vira teto absoluto | aceito |
| [0167](0167-modo-automatico-libera-o-escopo-de-caminho.md) | O modo automático libera o escopo de caminho, e só ele | aceito |
| [0189](0189-o-piloto-automatico.md) | O piloto automático: o modo automático aprova tudo, menos os tetos, o escopo compara com a pasta real de execução, e "Sempre permitir" grava verbo + subcomando | aceito |
| [0204](0204-modo-automatico-libera-push-e-pr.md) | O modo automático libera push e PR | aceito |

## Onde o código mora — modos de execução {#tema-modos}

Os três modos de execução, a pasta do usuário, a base de projetos e a conversão de um projeto entre modos.

| # | decisão | status |
|---|---|---|
| [0066](0066-nome-de-pasta-legivel-do-workspace.md) | Nome de pasta legível do workspace | aceito |
| [0072](0072-projeto-local-ou-container.md) | O projeto escolhe onde o código mora: pasta do usuário ou pasta gerenciada | aceito |
| [0104](0104-execution-mode-tres-valores-e-workspace-verificado-pelo-runner.md) | `execution_mode` em três valores, e o workspace nasce `unverified` quando o runner é quem verifica | aceito |
| [0107](0107-navegacao-de-pasta-local-via-o-runner.md) | Navegação de pasta local via o Runner | aceito |
| [0108](0108-projeto-runner-nasce-ao-navegar-pasta-no-wizard.md) | No modo `runner`, o projeto nasce ao clicar em "Navegar pasta...", não só na confirmação | aceito |
| [0111](0111-conversao-de-execution-mode-de-projeto-existente.md) | Converter o `execution_mode` de um projeto existente: recusar com dev agent ativo, realocar o `permissions.json`, aposentar a linha do container | aceito |
| [0141](0141-base-unica-dos-projetos-montados.md) | A base única dos projetos montados, montada por identidade | aceito |
| [0142](0142-validacao-de-workspace-montado-adiada.md) | A validação do workspace montado é adiada até a materialização | aceito |
| [0146](0146-base-consentida-no-bootstrap.md) | A base consentida no bootstrap, e `mounted` como padrão local | aceito |

## Container do projeto e broker {#tema-container}

O ciclo de vida do container do projeto, a decisão de imagem, a porta de Docker e o broker que fala com o daemon.

| # | decisão | status |
|---|---|---|
| [0065](0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md) | Container por projeto: a fronteira deixa de ser política | aceito |
| [0081](0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md) | Ciclo de vida do container: tabela de estado, sem orquestrador | aceito |
| [0083](0083-terminal-mostra-estado-real-do-container.md) | A aba Terminal ganha o consumidor real do ciclo de vida, não o terminal | aceito |
| [0128](0128-porta-de-docker-e-a-prova-de-empacotamento.md) | A porta de Docker, e a prova de empacotamento que escolheu a implementação | aceito |
| [0130](0130-broker-de-container.md) | O broker de container: quem fala com o Docker do servidor, e por que ele não aceita especificação | aceito |
| [0131](0131-roteamento-de-modulos-para-infra.md) | O Arquiteto roteia módulos para infra: ele CANDIDATA, a Infra ELEGE | aceito |
| [0133](0133-infra-elege-imagem-do-roteamento.md) | A Infra elege entre as candidatas do roteamento, e a eleição vira nova versão de `artifact.project_image` | aceito |
| [0134](0134-dev-agents-executam-dentro-do-container.md) | Dev agents executam DENTRO do container real do projeto, e o terminal ganha um piso de auto-aprovação lá dentro | aceito |
| [0135](0135-portao-de-imagem-nos-tres-modos.md) | O portão da imagem do Arquiteto (RN-105) passa a valer nos três modos de execução | aceito |
| [0136](0136-pagina-global-de-containers.md) | Página global de containers: teto por carga no broker, e `container_remove` no teto absoluto | aceito |
| [0137](0137-o-runner-sobe-o-container-do-projeto.md) | O `brabo-runner` sobe o container do projeto na máquina do usuário | aceito |
| [0143](0143-agentes-de-dev-so-depois-do-container.md) | Agentes de dev só depois do container | aceito |
| [0144](0144-a-segunda-raiz-do-broker.md) | A segunda raiz do broker, e o localizador discriminado que a escolhe | aceito |
| [0180](0180-container-com-o-dono-da-pasta.md) | O container do projeto roda com o dono da pasta, medido pela api | aceito |
| [0190](0190-a-infra-sobe-o-container-no-aceite.md) | A Infra sobe o container no aceite do handoff, por passo do servidor e com a autonomia semeada, e é ela quem entrega ao Dev Lead | aceito |
| [0199](0199-recurso-minimo-derivado-do-module-map.md) | O recurso mínimo do container é derivado do `module_map`: cada módulo declara o seu, e a Infra sobe com a soma | aceito |
| [0208](0208-a-infra-herda-a-rede-do-arquiteto.md) | A Infra herda a rede que o Arquiteto declarou | aceito |
| [0228](0228-comando-do-app-e-rede-do-container.md) | O container do projeto sobe o app pelo comando declarado e publica porta só no loopback | aceito |
| [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) | O QA testa numa instância efêmera, com os serviços que a Infra declarou | aceito |
| [0264](0264-o-app-reinicia-so-o-processo.md) | Depois do avanço da pasta, o app reinicia só o processo, sem recriar o container | aceito |
| [0265](0265-o-app-declarado-propoe-recriar-o-container.md) | O app declarado pela Infra propõe recriar o container, com a porta na faixa 13000+ | aceito |

## O runner local {#tema-runner}

O CLI na máquina do usuário — o canal, as credenciais, as chaves de dispositivo, a distribuição, a base e o serviço.

| # | decisão | status |
|---|---|---|
| [0103](0103-runner-local-execucao-na-maquina-do-usuario.md) | Runner local: execução na máquina do usuário por canal Phoenix com ticket de uso único | aceito |
| [0105](0105-personal-access-token-do-runner-escopado-por-construcao.md) | Personal Access Token (`brb_…`) pro runner, escopado por construção a uma rota | aceito |
| [0106](0106-distribuicao-do-runner-via-tsup-e-npm-publish.md) | Distribuição do `@brabo/runner` via `tsup` e `npm publish`, versão injetada só em CI | aceito |
| [0112](0112-binario-standalone-do-runner-via-bun-build-compile.md) | Binário standalone do `@brabo/runner` via `bun build --compile`, com o addon nativo `.node` embutido por extração real para um diretório temporário | aceito |
| [0118](0118-configuracao-automatica-do-runner-pelo-navegador.md) | Configuração do runner pelo navegador: uma chave de dispositivo Ed25519 como segunda credencial do `runner-ticket`, um proxy do GitHub Releases para o binário e a File System Access API para uma pasta configurada com um clique | aceito |
| [0145](0145-docker-pre-requisito-do-runner.md) | Docker vira pré-requisito real do modo `runner` | aceito |
| [0147](0147-agente-local-com-capacidades.md) | Um agente local, capacidades declaradas na conexão | aceito |
| [0151](0151-base-consentida-no-runner.md) | A base consentida no runner, e a criação de pasta pelo canal | proposto |
| [0154](0154-chave-de-dispositivo-de-maquina.md) | A chave de dispositivo de máquina | aceito |
| [0174](0174-runner-sem-binario-darwin-x64.md) | O binário standalone do runner deixa de prometer o Mac Intel | aceito |
| [0187](0187-runner-sem-binario-win32-x64.md) | O binário standalone do runner deixa de prometer o Windows | aceito |
| [0193](0193-git-credenciado-no-host-do-runner.md) | O git credenciado roda no HOST do runner; o código roda no container | aceito |
| [0201](0201-revogacao-por-chave.md) | A revogação mira a CHAVE, e não o par `{projeto, usuário}` | aceito |
| [0203](0203-aposenta-o-fluxo-do-runner-pelo-navegador.md) | O fluxo do runner pelo navegador é aposentado, e o caminho é o instalador | aceito |
| [0230](0230-importar-chave-de-llm-pelo-runner.md) | O runner importa a chave de API de LLM que o usuário já tem na máquina | aceito |

## Autenticação, acesso e segredos {#tema-iam}

Autenticação first-party, papéis e seus tetos, associação ao workspace, endurecimento entre origens e envelopes de segredo.

| # | decisão | status |
|---|---|---|
| [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) | Auth first-party: argon2id, EdDSA e rotação de refresh | aceito |
| [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) | O corte do Keycloak: emissor próprio, service token e sessão em cookie | aceito |
| [0037](0037-cors-do-engine-e-a-porta-como-contrato.md) | O CORS que o engine não tinha, e a porta como parte do contrato | aceito |
| [0050](0050-credencial-sempre-cifrada-verificacao-explicita.md) | Credencial sempre cifrada; verificação vira ação explícita | aceito |
| [0058](0058-csp-fechado-na-api-e-escopo-de-projeto-contido.md) | CSP fechado na api, e o escopo de projeto contido na raiz | aceito |
| [0059](0059-segredo-do-state-de-oauth-sem-default.md) | A chave que assina o `state` do OAuth de git não tem default | aceito |
| [0084](0084-login-social-github-e-gitlab.md) | Login social (GitHub/GitLab), revisando o backlog dos ADRs 0031/0032 | aceito |
| [0096](0096-smtp-real-no-mailsender.md) | SMTP real no `MailSender`, atrás de um toggle explícito | aceito |
| [0127](0127-tetos-de-rebaixamento-em-project-members.md) | Dois tetos de rebaixamento em `project_members`, e a sobreposição fica | aceito |
| [0156](0156-teto-de-auto-rebaixamento-na-remocao.md) | O teto de auto-rebaixamento também na remoção de membro de projeto | aceito |
| [0157](0157-teto-de-auto-movimento-no-upsert-de-workspace.md) | O teto de auto-movimento no upsert de workspace, e a auto-promoção que era brecha | aceito |
| [0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md) | O id da chave mestra gravado no envelope, como observabilidade e nunca como autoridade | aceito |
| [0173](0173-remocao-de-membro-de-workspace.md) | A remoção de membro de workspace nasce, protegida pela mesma cláusula | aceito |
| [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md) | Acesso rápido por papel só no ambiente local | aceito |

## Providers de LLM, modelos e gasto {#tema-llm}

O contrato de provider, o catálogo de modelos e a curadoria, os bindings de modelo, o metering e os orçamentos.

| # | decisão | status |
|---|---|---|
| [0040](0040-moeda-do-dashboard.md) | Moeda do dashboard: USD por ora, câmbio manual por workspace adiado | aceito |
| [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) | Uma base OpenAI-compatível, um contrato de LLM providers e capabilities que recusam binding | aceito |
| [0042](0042-catalogo-vivo-ciclo-de-vida-do-modelo-e-preco-auditavel.md) | Catálogo vivo, ciclo de vida do modelo e preço auditável | aceito |
| [0043](0043-seis-providers-de-llm-e-o-fechamento-da-fase-9b.md) | Seis providers de LLM sobre a base, e a Fase 9b finalmente fechada | aceito |
| [0049](0049-curadoria-de-modelo-por-workspace.md) | Curadoria de modelo por workspace | aceito |
| [0051](0051-facetas-de-capability-e-curadoria-por-uso.md) | Facetas de capability provadas; "para que serve" é curadoria | aceito |
| [0063](0063-duas-audiencias-para-o-mesmo-gasto.md) | Duas audiências para o mesmo gasto: a fatura do owner e o consumo do membro | aceito |
| [0064](0064-escopo-de-area-na-cascata-e-o-binding-de-agente-global.md) | Escopo de área na cascata de modelo, e o binding de agente global | aceito |
| [0075](0075-embeddings-no-contrato-de-llm-provider.md) | Embeddings no contrato de LLMProvider | aceito |
| [0076](0076-provider-volta-a-ser-dimensao-de-gasto.md) | `provider` volta a ser dimensão de gasto, e a contenção passa a ser do tipo | aceito |
| [0077](0077-ranking-de-modelos-por-capacidade-sem-nota-inventada.md) | Ranking de modelos por capacidade, sem nota inventada | aceito |
| [0110](0110-budget-por-area-aditivo-nao-cascata.md) | Orçamento por área é ADITIVO, ao lado de projeto/sessão — não uma cascata, e não uma tabela nova | aceito |
| [0114](0114-deteccao-de-ollama-nativo-no-bootstrap-dev.md) | Detecção de Ollama nativo no bootstrap de dev: perguntar uma vez, persistir no `.env`, pôr os serviços do compose atrás de um profile | aceito |
| [0115](0115-pedido-de-pull-de-modelo-huggingface-tabela-propria.md) | Pull de modelo do Hugging Face: tabela própria, confirmação em dois passos e allowlist de publicadores oficiais — nunca `proposed_actions` | aceito |
| [0166](0166-preferencia-de-roteamento-no-binding-de-modelo.md) | A preferência de roteamento mora no binding de modelo, viaja com ele, e congela no metering | aceito |
| [0188](0188-o-custo-real-do-provider-vira-o-numero-do-metering.md) | O custo real que o provider devolve vira o número do metering | aceito |
| [0198](0198-duplicata-semantica-por-embedding-com-limiar-que-so-avisa.md) | A duplicata semântica de história e regra é avisada por embedding com limiar, e o gasto entra no metering | aceito |
| [0221](0221-upstream-preso-por-sessao.md) | O hub prende a conversa de cada agente ao upstream que a atendeu, por `session_id` | aceito |
| [0222](0222-provider-9router-de-llm.md) | O 9Router entra como o 10º provider de LLM, com URL por instalação | aceito |
| [0223](0223-orcamento-de-raciocinio-por-modelo.md) | O orçamento de raciocínio é capability POR MODELO, curada à mão | aceito |
| [0224](0224-raciocinio-abortado-no-stream.md) | O raciocínio é contado no stream e abortado no limite, e o custo é estimado e reconciliado | aceito |
| [0225](0225-teto-de-preco-do-upstream-no-openrouter.md) | O OpenRouter recebe um teto de preço por chamada (`provider.max_price` = catálogo × 1,5) | aceito |
| [0227](0227-provider-opencode-zen-de-llm.md) | O OpenCode Zen entra como o 11º provider de LLM, só no dialeto OpenAI | aceito |
| [0233](0233-membro-ve-o-gasto-do-projeto-sem-credencial.md) | O membro vê o gasto do projeto por agente e por área, nunca por provider | aceito |
| [0251](0251-preco-de-lista-datado-para-provider-sem-preco.md) | Preço de lista datado no código para provider que não informa preço | aceito |
| [0257](0257-na-anthropic-direta-o-raciocinio-desligado-e-por-modelo.md) | Na Anthropic direta o raciocínio desligado é por modelo e o esforço reduz o Opus | aceito |
| [0279](0279-provider-de-llm-duble-do-regressivo.md) | Provider de LLM dublê do regressivo, dentro da api | aceito |
| [0296](0296-o-teto-de-gasto-e-mensal-e-o-workspace-tem-teto-proprio.md) | O teto de gasto é mensal e o workspace tem teto próprio | aceito |

## RAG, grafo de conhecimento e artefatos {#tema-conhecimento}

Chunks e busca híbrida, a medição dela, o grafo Neo4j e os artefatos projetados do event log.

| # | decisão | status |
|---|---|---|
| [0079](0079-tabela-de-chunks-vetor-e-tsvector-juntos.md) | Tabela de chunks: vetor e `tsvector` na mesma linha | aceito |
| [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md) | Busca híbrida: pesos, limiar e o que é citação | aceito |
| [0082](0082-chat-rag-aba-de-busca-hibrida.md) | Chat RAG: aba própria de busca híbrida, sem renomear "Chat" | aceito |
| [0099](0099-neo4j-grafo-de-conhecimento-e-templates.md) | Neo4j como grafo de conhecimento e templates de prompt, driver na api | aceito |
| [0100](0100-rag-search-e-modelos-garantidos-no-boot.md) | `rag_search` para agentes e modelos Ollama garantidos no boot | aceito |
| [0101](0101-memoria-relacional-como-projecao-do-event-log.md) | Memória relacional como projeção do event log; templates consumidos sem tocar GenServers | aceito |
| [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) | Pasta local anexada vira `chunks.scope = 'local'`, lida pelo NAVEGADOR, nunca um caminho do host | aceito |
| [0129](0129-telemetria-de-busca-do-rag-como-tabela.md) | A telemetria de busca do RAG é TABELA, com os pesos congelados na linha | aceito |
| [0132](0132-golden-set-de-acerto-do-rag.md) | Golden-set de acerto do RAG, e o gate `rag-acertivo` | aceito |
| [0138](0138-golden-set-do-rag-em-ci-agendado.md) | O golden-set do RAG passa a rodar em CI, agendado — e continua `warn` | aceito |
| [0148](0148-artefatos-projetados-em-arquivo.md) | Os artefatos dos agentes projetados em arquivo, numa pasta `docs/` | aceito |
| [0196](0196-anamnese-religada-com-sujeito-e-fato-do-perfil.md) | A Anamnese religada: não roda sem sujeito, e a hipótese aceita vira fato do perfil | aceito |
| [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md) | O contrato entre módulos vira artefato versionado do Arquiteto, e o dev agent o lê em vez do worktree alheio | aceito |
| [0205](0205-desvio-do-agente-como-sinal-do-produto.md) | O desvio do agente que a Anamnese observa vira sinal do produto, sem dado pessoal | aceito |
| [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md) | A indexação de docs tem teto próprio de 4 MiB, e o corte é declarado | aceito |
| [0272](0272-a-busca-do-rag-limita-os-trechos-por-arquivo.md) | A busca híbrida do RAG limita os trechos por arquivo | aceito |
| [0291](0291-as-percepcoes-olham-o-produto-do-usuario-e-a-falha-tecnica-e-sinal-interno-do-tp-01.md) | As Percepções olham o produto do usuário; a falha técnica é sinal interno do TP-01 | aceito |
| [0293](0293-a-memoria-do-projeto-e-markdown-versionado-e-o-grafo-e-o-rag-sao-indices.md) | O projeto tem memória em markdown que o dev lê antes de explorar | proposto |

## Interface web e design system {#tema-web}

Telas, navegação, temas e a estrutura dos maiores arquivos do app web.

| # | decisão | status |
|---|---|---|
| [0036](0036-telas-de-auth-fieis-ao-design-e-fontes-auto-hospedadas.md) | Telas de auth fiéis ao design, e as três fontes que não carregavam | aceito |
| [0060](0060-superficie-de-leitura-de-codigo.md) | A superfície de leitura de código, contida e com orçamento | aceito |
| [0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) | Tema alcançável, e o boot sob CSP | aceito |
| [0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) | Moldura de tela, e o registro de abas diverge do handoff de propósito | aceito |
| [0097](0097-leitura-direta-do-schema-do-engine-para-online-agent-count.md) | Leitura direta do schema do engine para o "N agentes online" do dashboard | aceito |
| [0116](0116-tipos-do-web-gerados-do-openapi.md) | `ActionType` (e tipos futuros) gerados do contrato OpenAPI, não copiados à mão | aceito |
| [0122](0122-sessionpage-dividido-em-cinco-prs.md) | `SessionPage.tsx` dividido em cinco PRs mecânicos, declarados de antemão | aceito |
| [0124](0124-hook-do-canal-de-turno-do-sessionpage.md) | Agrupamento de estado do canal de turno extraído para `useTurnoDoAgente` | aceito |
| [0125](0125-projectsettingstab-dividido-por-secao.md) | `ProjectSettingsTab.tsx` dividido em um arquivo por seção, atrás de um barrel | aceito |
| [0126](0126-trilho-vertical-de-navegacao-do-projeto.md) | A página do projeto navega por um trilho vertical, e a aba Código para de recolher a sidebar sozinha | aceito |
| [0176](0176-sessionpage-abaixo-de-mil-linhas.md) | `SessionPage.tsx` abaixo de 1 000 linhas, em dez PRs mecânicos, e a trava só depois | aceito |
| [0181](0181-tema-preto-neutro.md) | O tema escuro vira preto neutro, e a dívida de contraste acaba | aceito |
| [0210](0210-animacao-de-texto-com-motion.md) | Animação de texto com `motion` | aceito |
| [0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) | Uma navegação só: a sidebar absorve o trilho do projeto | aceito |
| [0232](0232-shadcn-com-base-ui-no-apps-web.md) | shadcn/ui com Base UI e Tailwind 4 no `apps/web` | aceito |
| [0234](0234-shiki-e-recharts-por-carga-dinamica.md) | `shiki` no Code Block e `recharts` no Chart, sempre por carga dinâmica | aceito |
| [0237](0237-o-visual-v3-liga-o-preflight-e-sobe-os-raios.md) | O visual v3 liga o preflight e sobe os raios | aceito |
| [0238](0238-o-grafo-de-modulos-vira-canvas-xyflow.md) | O grafo de módulos da Arquitetura vira Canvas (`@xyflow/react`) | aceito |
| [0239](0239-csp-frame-src-local-para-o-web-preview.md) | CSP `frame-src` local para o Web preview do entregável | aceito |
| [0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md) | O motivo de controle inerte pode morar num "?" ativo na página de Containers | aceito |
| [0241](0241-a-sidebar-adota-o-block-sidebar-07-do-shadcn.md) | A sidebar adota o block `sidebar-07` do shadcn | aceito |
| [0242](0242-containers-em-tabela-linear-com-tanstack-react-table.md) | Containers em tabela linear com `@tanstack/react-table` | aceito |
| [0243](0243-consequencia-irreversivel-pode-morar-num-botao-de-perigo.md) | Consequência irreversível pode morar num botão de perigo | aceito |
| [0244](0244-coluna-das-abas-do-projeto-alinhada-a-esquerda.md) | Coluna das abas do projeto alinhada à esquerda | aceito |
| [0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) | O conteúdo das páginas ocupa a largura inteira | aceito |
| [0250](0250-chat-da-sessao-ocupa-a-largura-inteira.md) | O chat da Sessão ocupa a largura inteira | aceito |

## Operação, deploy e instalação {#tema-operacao}

Imagens de produção, Kubernetes, observabilidade, backup, o compose de dev e o instalador de uma linha.

| # | decisão | status |
|---|---|---|
| [0024](0024-fase5-imagens-producao-ci.md) | Fase 5 (sessão 1): imagens de produção, compose.prod, CI e teste de fumaça | aceito |
| [0025](0025-fase5-deploy-kubernetes-kustomize.md) | Fase 5 (sessão 2): deploy Kubernetes com Kustomize, métrica de fila e overlay local | aceito |
| [0026](0026-fase5-observabilidade-e-graceful-shutdown.md) | Fase 5 (sessão 3): graceful shutdown, OpenTelemetry, métricas, logs e dashboards | aceito |
| [0027](0027-fase5-backup-hardening-release.md) | Backup/restore, hardening da api, superfície exposta e release | aceito |
| [0035](0035-observabilidade-legivel-e-trace-sem-coletor.md) | Trace sem coletor, e o caminho entre camadas no log | aceito |
| [0070](0070-observabilidade-no-compose-local.md) | Observabilidade no Compose local: métrica e log, sem trace | aceito |
| [0150](0150-instalador-de-uma-linha.md) | O instalador de uma linha, com fonte escolhida e marcador | proposto |
| [0152](0152-backup-de-volumes-contra-compose.md) | Backup e restore de volumes, contra compose | proposto |
| [0153](0153-deploy-enabled-o-gatilho-que-ninguem-cria.md) | `DEPLOY_ENABLED`: o gatilho que dez documentos citam e nenhum cria | proposto |
| [0155](0155-a-primeira-conta-nasce-no-terminal.md) | A primeira conta nasce no terminal, e o agente local sobe pareado | aceito |
| [0160](0160-o-compose-do-instalador-viaja-assinado.md) | O compose do instalador viaja com ele, como asset assinado | aceito |
| [0161](0161-a-tela-so-oferece-o-modo-que-a-instalacao-executa.md) | A tela só oferece o modo que a instalação executa, e a instalação por Release não tem broker | aceito |
| [0162](0162-broker-publicado-e-oferecido-pelo-instalador.md) | O broker vira a quinta imagem publicada, e o instalador PERGUNTA se o liga | aceito |
| [0169](0169-seaweedfs-no-lugar-do-minio-no-overlay-local.md) | O destino S3 do overlay local deixa de ser o MinIO e passa a ser o SeaweedFS | aceito |
| [0170](0170-compose-de-dev-brabo-dev.md) | O compose de dev vira `brabo-dev`, e o dev recusa subir ao lado de uma instalação | aceito |
| [0209](0209-engine-em-otp-29.md) | O engine sobe para Elixir 1.20.4 / OTP 29.1.1 | aceito |
| [0256](0256-a-migracao-restaura-o-banco-num-banco-vazio.md) | A migração do instalador restaura o banco num banco recém-criado e vazio | aceito |

## CI, release e cadeia de suprimentos {#tema-engenharia}

O pipeline, as imagens publicadas, a assinatura, a varredura, o pin, as camadas de teste e a estrutura do próprio repositório.

| # | decisão | status |
|---|---|---|
| [0039](0039-actionlint-e-validacao-do-pipeline-de-ci-gerado.md) | actionlint e a validação do pipeline de CI gerado | aceito |
| [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) | Imagens publicadas no GHCR a cada tag final, e o overlay de produção preso por digest | aceito |
| [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md) | E2E de navegador contra o compose de produção, num pacote fora do workspace | aceito |
| [0121](0121-schema-dividido-por-agregado-de-dominio.md) | O schema dividido por agregado de domínio, atrás de um barrel | aceito |
| [0140](0140-timeout-do-audit-como-risco-assumido.md) | Timeout repetido do `pnpm audit` é risco assumido; achado continua reprovando | aceito |
| [0149](0149-assinatura-dos-artefatos-publicados.md) | Assinatura dos artefatos publicados | proposto |
| [0159](0159-imagem-de-terceiro-por-digest.md) | Imagem de terceiro entra por digest, e o lint reprova quem esquecer | aceito |
| [0172](0172-trivy-no-release-antes-de-assinar.md) | O release escaneia com Trivy o que publica, por digest, antes de assinar | aceito |
| [0178](0178-tag-inline-na-imagem-de-terceiro.md) | A tag da imagem de terceiro mora DENTRO da referência, antes do digest | aceito |
| [0197](0197-a-imagem-dos-workflows-vem-do-compose.md) | A imagem dos workflows vem do compose, e o Dependabot de imagem é ligado | aceito |
| [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) | O Brabo vira um conjunto de repositórios em `viralabs-dev` | aceito |
| [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md) | O `brabo-qa` tem regressivo por funcionalidade, e o da PR para a `dev` nunca é exigido | aceito |
| [0270](0270-o-contracts-e-publicado-no-github-packages.md) | O brabo-contracts é publicado no GitHub Packages, com o `shared` só de tipos | aceito |
| [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) | Cada run do Actions mostra os vínculos entre os repositórios | aceito |
| [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md) | O regressivo roda num compose só; o grafo mostra cada funcionalidade por uma matrix de exibição, e o relatório é a fonte da decisão | aceito |
| [0278](0278-a-mudanca-e-vista-num-painel-do-brabo-ci.md) | A mudança é vista num painel do brabo-ci, sem check nas PRs | aceito |
| [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) | O pin do brabo-ci nos consumidores aponta para uma tag, e a branch decide qual | aceito |
| [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md) | O mapa dos 11 repos tem uma fonte só, o `repos.yml` do `brabo`, e o README é gerado dela | aceito |
| [0282](0282-a-pin-dos-componentes-segue-a-release-final.md) | A pin dos componentes segue a última Release final | aceito |
| [0285](0285-a-prova-de-uma-aresta-e-arquivo-mais-trecho.md) | A prova de uma aresta do `repos.yml` é arquivo mais trecho literal, não arquivo:linha | aceito |
| [0286](0286-as-capturas-da-doc-sao-geradas-pelo-qa-e-entram-por-pr.md) | As capturas da doc são geradas pelo brabo-qa e entram no brabo por PR do App | proposto |
| [0289](0289-a-recaptura-segue-a-pin-e-so-pede-o-dono-quando-a-imagem-muda.md) | A recaptura segue a pin do web e só pede o dono quando a imagem muda | proposto |

## Documentação {#tema-docs}

Como a documentação é gerada, verificada e publicada.

| # | decisão | status |
|---|---|---|
| [0029](0029-sincronizacao-continua-da-documentacao.md) | Sincronização contínua da documentação | aceito |
| [0033](0033-referencia-de-api-gerada-do-openapi.md) | A referência de API sai do código, e o teste de tabela cobra os metadados | aceito |
| [0034](0034-documentacao-publicada-por-degrau.md) | Documentação publicada por degrau, em subdiretório do Pages | aceito |
| [0071](0071-publicacao-simetrica-por-degrau.md) | Publicação simétrica por degrau, e uma raiz que escolhe | aceito |
| [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) | O caminho publicado nomeia o ambiente, não a branch | aceito |
| [0117](0117-lockfile-proprio-para-o-website.md) | `website/` ganha lockfile próprio, fora do `pnpm audit` do produto | aceito |
| [0202](0202-o-indice-de-adr-por-tema.md) | O índice de ADR por tema, com o tema fora do ADR | aceito |
| [0206](0206-referencia-da-api-numa-pagina-redoc.md) | A referência da API vira uma página Redoc | aceito |
| [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) | Quatro idiomas, com pt-BR como FONTE e padrão: a documentação e a interface em português, inglês, russo e chinês simplificado | aceito |
| [0218](0218-titulo-de-adr-com-prefixo.md) | Todo ADR se chama "ADR NNNN — título" | aceito |
| [0219](0219-referencia-entra-na-traducao.md) | A referência entra na tradução | aceito |
| [0220](0220-api-traduzida-por-catalogo.md) | A página da API sai traduzida por catálogo | aceito |
| [0253](0253-o-site-de-docs-deixa-o-docusaurus.md) | O site de docs deixa o Docusaurus | aceito |
| [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) | A doc de cada área mora na raiz dela | aceito |
| [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md) | A doc dos repos de código é só em inglês; o site serve a fonte inglesa com faixa | aceito |
| [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md) | A doc dos repositórios é em pt-BR por padrão, com traduções permitidas nos irmãos | aceito |
| [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) | A paridade de tradução mede só a doc do brabo | aceito |
| [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) | Os gerados do `brabo` leem os irmãos por uma trava de SHAs | aceito |
| [0275](0275-cada-irmao-confere-as-proprias-refs-com-simbolo.md) | Cada irmão confere as próprias refs com símbolo no PR | aceito |
| [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) | O índice de ADR é gerado, e a referência grande vira índice mais partes | proposto |
| [0288](0288-link-entre-repos-nas-rns-e-url-do-repo-dono.md) | O link entre repos nas RNs é a URL do repo dono, e o site a devolve para relativo | proposto |
<!-- END:GENERATED:indice-de-adr -->

## A convenção

- **Um arquivo por decisão**, em `docs/adr/NNNN-short-title.md`, com
  numeração sequencial de 4 dígitos, e título `# ADR NNNN — <título>`
  ([0218](0218-titulo-de-adr-com-prefixo.md)). **Sem reuso de número**, nem quando um ADR
  é substituído — o próximo é **0297**.
- **Um tema por decisão**, escolhido por quem escreve o ADR, no mesmo
  PR: uma linha em `docs/adr/temas.yml`; a linha do índice é gerada. Quem revisa confirma. Um tema novo é uma
  mudança na lista em `temas.yml`, justificada no PR que o acrescenta; passar
  de 15 exige um ADR que revise o [0202](0202-o-indice-de-adr-por-tema.md).
- **Três seções, só elas:** **Contexto** (o problema ou a força que o motivou),
  **Decisão** (o que foi decidido), **Consequências** (os trade-offs aceitos e
  o que ficou para depois).
- **Sem template de terceiros** — nada de Nygard, MADR ou variantes. As três
  seções bastam.
- **Em português**, como o resto do projeto.
- **ADR aceito não é editado.** Um substituído por decisão posterior fica como
  está; o ADR novo referencia o antigo e explica o que mudou.

O que dá valor a estes ADRs é registrar o que **não** funcionou: o 0020
documenta nove execuções fracassadas seguidas, e o 0027 registra uma justificativa
que foi revista dentro da mesma sessão que a produziu. Uma consequência ruim
omitida é a parte que faz falta seis meses depois.
