# ADR 0263 — O projeto do usuário trabalha em trunk, e a pasta acompanha a main

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `git`
- **Referencia:** revisa, para o repositório do PROJETO do usuário, a escada do ADR [0030](0030-politica-de-branches-mecanizada.md), que o bootstrap commitava no repo dele, e o ramo de trabalho do ADR [0056](0056-o-engine-trabalha-em-repositorio-remoto.md). Estende o ADR [0141](0141-base-unica-dos-projetos-montados.md) (a pasta montada por identidade) e cita o ADR [0044](0044-adocao-de-repositorio-existente.md) (repo adotado). O desenvolvimento do próprio Brabo segue `dev → main` (ADR 0235), sem mudança. Decisão do dono de 06/11/2026 (AT-617).

## Contexto

O Brabo criava `dev` e `qa` no repositório do projeto e mergeava toda tarefa na `dev`. Nada promovia a `dev` para a `main`, e a pasta do projeto no computador do usuário ficava parada no commit da infra. No TP-01 de 06/11 ela estava 21 commits atrás da `dev`. O README e o app rodavam código velho, e testar o entregável exigia tirar o código de dentro do container.

## Decisão

1. **Trunk no projeto do usuário.** A tarefa nasce da `main` e volta para a `main`. O bootstrap cria e protege só a `main`, e a política commitada no repo do usuário descreve trunk. A branch de trabalho é a `main` fixa: a `default_branch` de repo adotado fica para depois.
2. **A pasta acompanha a `main`.** Depois de cada merge, a api grava `project.trunk_merged { projectId, sessionId, mergedSha }` no outbox, e o engine faz fast-forward da pasta (modos `container`, `mounted` e `runner`). A pasta não é tocada, e o motivo fica gravado na linha do tempo, quando:
   - a branch é outra;
   - a árvore rastreada está suja;
   - a branch divergiu;
   - um arquivo não rastreado seria sobrescrito.

   No runner desligado, o avanço é reaplicado quando ele reconecta.
3. **Projetos antigos,** que têm `dev` à frente da `main`, recebem o claim recusado com motivo nomeado. O dono roda um script de migração que faz fast-forward da `main` até a `dev` no bare do projeto. O script nunca apaga a `dev`.
4. **A proteção de `dev` e `qa` continua** na lista de branches protegidas (RN-1017/1019), por causa dos projetos antigos.

## Consequências

- O que o usuário vê na pasta é sempre o último merge. O app reinicia depois do avanço (ADR [0264](0264-o-app-reinicia-so-o-processo.md)).
- Sem a `dev`, o projeto deixa de ter um degrau de integração antes da `main`. Os gates de cada PR passam a ser a única barreira.
- O `origin` da pasta continua apontando para o bare dentro do Brabo, e o `git pull` manual na pasta segue sem funcionar.

## Alternativas consideradas

- **Avançar a pasta até a `dev`, mantendo a escada.** Recusada pelo dono: a `main` deve estar sempre atualizada depois de cada agente.
- **Só dizer onde está o código atual.** Recusada: quem segue o README sem ler o aviso roda código velho.
- **Trunk também nos repos do Brabo.** Recusada: a decisão vale só para o projeto do usuário.

## Referências

- [0030](0030-politica-de-branches-mecanizada.md), [0044](0044-adocao-de-repositorio-existente.md), [0056](0056-o-engine-trabalha-em-repositorio-remoto.md), [0141](0141-base-unica-dos-projetos-montados.md), [0264](0264-o-app-reinicia-so-o-processo.md).
