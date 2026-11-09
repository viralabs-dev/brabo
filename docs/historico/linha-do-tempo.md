---
id: linha-do-tempo
title: Linha do tempo do Brabo
sidebar_label: Linha do tempo
description: As grandes viradas do Brabo, da primeira fase à separação em repositórios, em uma leitura de cinco minutos, cada uma com o link da evidência.
keywords: [história, fases, linha do tempo, marcos]
tipo: historico
---

# Linha do tempo do Brabo

Cinco minutos de leitura. Cada marco diz o que mudou, por que importou e onde está a prova. O registro completo continua inteiro no [Histórico de fases](../explanation/historico-de-fases.md); aqui só ficam as viradas.

:::historico 2026-11-08
Esta linha do tempo descreve o caminho até a data acima. O que vale hoje mora nas regras de negócio e nos ADRs, não aqui.
:::

## Fundação (agosto de 2026)

**Fases 1 a 5.** Nasceram o IAM, as sessões com log de eventos imutável, o chat com roteador de LLM, os providers de git, os agentes e os gates de PR. A fase 5 levou tudo a imagens de produção e Kubernetes. Importou porque define a forma do produto até hoje. Prova: [ADR 0020](../adr/0020-destravar-gates-qa-secops.md), [ADR 0024](../adr/0024-fase5-imagens-producao-ci.md).

**Fases 6 a 9.** A política de branches virou código, o Keycloak saiu e a autenticação passou a ser própria, os agentes ganharam hierarquia por área e o catálogo de modelos passou a ter preço auditável. Importou porque tirou a regra da memória das pessoas. Prova: [ADR 0030](../adr/0030-politica-de-branches-mecanizada.md), [ADR 0032](../adr/0032-corte-do-keycloak-e-sessao-em-cookie.md), [ADR 0038](../adr/0038-hierarquia-de-agentes.md).

**Fases 10 a 12.** O Brabo construiu parte de si mesmo pela primeira vez (dogfooding) e achou 17 defeitos. A fase 12 fechou os três mais graves e provou isso numa execução só. Importou porque trocou a impressão de "funciona" por medição. Prova: [primeiro dogfooding](../explanation/primeiro-dogfooding.md), [ADR 0047](../adr/0047-operabilidade-pos-dogfooding.md).

**Fase 13.** Primeira execução com modelo de API e GitHub de verdade: a metade barata passou, a cara falhou de formas que nenhum teste mostrara. Importou porque virou a lição "toda métrica sai de script, nunca de anotação". Prova: [validação real](../explanation/validacao-real.md), [backlog triado](../explanation/backlog.md).

**Fases 14 e 15.** A 14 corrigiu o que a execução real exigiu (falha de turno virou evento durável). A 15 transformou os gates em dado declarativo, em `gates.yml`. Importou porque o contrato externo dos gates ficou estável. Prova: [parte 1 do histórico](../explanation/historico-de-fases-parte-1.md), [Gates](../explanation/gates.md).

**Pós-fase 15 (v2.5).** Correções que o uso, e não um roteiro, encontrou: tela branca em erro 429, estados de carregando, erro e vazio em toda tela. Importou porque a regra de três estados virou geral. Prova: [parte 1 do histórico](../explanation/historico-de-fases-parte-1.md).

## O uso passa a mandar (agosto e setembro de 2026)

**Programa 16 a 26.** Onze pedidos nascidos da primeira navegação real: o handoff de design foi adotado, o container passou a ser por projeto e o gasto ganhou duas audiências. Importou porque a fronteira de segurança deixou de ser política e virou isolamento. Prova: [ADR 0065](../adr/0065-container-por-projeto-a-fronteira-deixa-de-ser-politica.md), [parte 2 do histórico](../explanation/historico-de-fases-parte-2.md).

**Rodadas exp003 e exp001.** Sessões de teste ao vivo corrigiram pontos que nenhuma suíte pegava, como o Criativo que prometia corrigir e não corrigia. Importou porque o maior defeito era invisível a qualquer suíte e só o uso real o mostrou. Prova: [parte 2 do histórico](../explanation/historico-de-fases-parte-2.md).

**Programa 28.** O tema claro ficou alcançável, o ciclo de vida do container virou tabela, o Chat RAG ganhou pipeline e aba própria, e o login social foi liberado. Importou porque fechou cortes declarados de fases anteriores. Prova: [ADR 0081](../adr/0081-ciclo-de-vida-do-container-tabela-sem-orquestrador.md), [parte 3 do histórico](../explanation/historico-de-fases-parte-3.md).

**Auditoria do fluxo contra o código.** Uma leitura só de leitura cruzou `fluxo.yml` com o código. O plano do Dev Lead passou a exigir aprovação de verdade, e os agentes novos do time entraram em ondas. Importou porque o modelo-alvo deixou de ser aspiração. Prova: [auditoria](../explanation/auditoria-fluxo-vs-codigo.md), [ADR 0085](../adr/0085-fluxo-como-registro-declarativo.md), [ADR 0086](../adr/0086-dev-lead-plano-suspende-para-aprovacao.md).

## Do servidor para a máquina do usuário (agosto a setembro de 2026)

**Runner local (20/08).** O agente passou a rodar na máquina do usuário, na pasta dele, com terminal real. Importou porque mudou a política global de `git push` e `sudo`, com decisão explícita do dono. Prova: [ADR 0102](../adr/0102-revisao-do-adr-0065-teto-absoluto-substitui-deny.md), [ADR 0103](../adr/0103-runner-local-execucao-na-maquina-do-usuario.md).

**Fase 28, a pasta do usuário.** O modo `mounted` e o runner ganharam uma base consentida no bootstrap e um agente local que declara capacidades. Importou porque abrir o editor e ver o trabalho numa pasta própria era o mínimo que faltava. Prova: [fase 28](../explanation/fase-28-pasta-do-usuario.md), [ADR 0146](../adr/0146-base-consentida-no-bootstrap.md), [ADR 0147](../adr/0147-agente-local-com-capacidades.md).

**Fase 29, a instalação de uma linha.** Os artefatos publicados passaram a ser assinados e o `install.sh` verifica a própria origem. Importou porque a fase 28 recusou o instalador enquanto não houvesse assinatura. Prova: [fase 29](../explanation/fase-29-instalacao-de-uma-linha.md), [ADR 0149](../adr/0149-assinatura-dos-artefatos-publicados.md), [ADR 0150](../adr/0150-instalador-de-uma-linha.md).

**Fase 30, o runner por máquina.** O runner ganhou chave de dispositivo e a primeira conta passou a nascer no terminal. Importou porque instalar e usar ficou numa linha. Prova: [fase 30](../explanation/fase-30-runner-por-maquina.md), [ADR 0154](../adr/0154-chave-de-dispositivo-de-maquina.md), [ADR 0155](../adr/0155-a-primeira-conta-nasce-no-terminal.md).

## O produto vira um conjunto de repositórios (novembro de 2026)

**Separação em 11 repositórios (04/11).** O monorepo deu lugar a um repositório por área, com contratos entre eles por tag e a política de PR igual em todos. Importou porque cada área passou a ter dono, doc e esteira próprios. Prova: [ADR 0252](../adr/0252-o-brabo-vira-um-conjunto-de-repositorios.md).

## Onde está o resto

- Medições do caminho: [roteador Jev](../explanation/medicao-do-jev.md), [heurística de idioma](../explanation/medicao-do-idioma.md), [auditoria visual da rodada 29](../explanation/auditoria-visual-rodada-29.md).
- Achados das execuções reais: [achados da execução real](../explanation/achados-execucao-real.md), [hello world](../explanation/execucao-real-hello-world.md), [validação da fase 12](../explanation/validacao-fase-12.md).
- Texto integral das fases: [Histórico de fases](../explanation/historico-de-fases.md), em quatro partes.
