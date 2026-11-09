---
title: Orquestrar um produto em vários repositórios
description: Trilha de sete páginas para quem vai dividir, ou já dividiu, um produto em vários repositórios. Usa os 11 repositórios do Brabo como exemplo real, com o mapa, os modos de consumo, a vida de uma mudança e um checklist para montar o seu.
---

# Orquestrar um produto em vários repositórios

**Para quem é:** quem vai dividir um produto em vários repositórios, ou já dividiu e sente o custo, e **não conhece o histórico do Brabo**. Você não precisa ter lido nenhum ADR nem ter participado de nenhuma rodada: os ADRs aparecem só como "para saber mais".

**Depois de ler, você consegue:**
- decidir se o seu produto deve mesmo ser dividido, e quando não deve;
- desenhar o mapa dos repositórios com o **modo de consumo** de cada aresta;
- narrar o caminho de uma mudança, do primeiro PR até o instalador;
- montar um conjunto parecido, na ordem certa, sabendo o que copiar e o que adaptar.

**Tempo de leitura:** cerca de 40 minutos para a trilha toda; cada página tem de 5 a 8.

## O exemplo que usamos

O Brabo é uma plataforma que orquestra agentes de engenharia. Ele vive em **11 repositórios** públicos na organização [`viralabs-dev`](https://github.com/viralabs-dev). Nenhum deles é "o" produto: o produto é o conjunto, e há um repositório, o [`brabo`](https://github.com/viralabs-dev/brabo), que é a porta de entrada. O repositório antigo, único, é só consulta e fica fora da trilha.

## A ordem das páginas

| # | Página | Pergunta que responde |
|---|---|---|
| 1 | [Por que separar, e quando não](por-que-separar.md) | Vale a pena dividir? Quanto custa? |
| 2 | [O mapa](o-mapa.md) | Quem faz o quê, e quem depende de quem? |
| 3 | [Como cada repositório é consumido](como-cada-repo-e-consumido.md) | Por onde um repositório entrega algo a outro? |
| 4 | [A vida de uma mudança](vida-de-uma-mudanca.md) | Como uma linha de código vira release? |
| 5 | [Monte o seu](monte-o-seu.md) | Em que ordem eu replico isso? |
| 6 | [Erros que já cometemos](erros-que-ja-cometemos.md) | O que posso evitar? |

## E o jeito de trabalhar?

Esta trilha é a **estrutura**. O método que a faz andar (quadro, atividades, rodadas com agentes, o teste de aceite permanente) está em [Como o Brabo é construído](../como-o-brabo-e-construido/index.md).

## Como ler

- Vai decidir se divide: leia a 1 e a 6.
- Já dividiu e quer organizar: leia a 2, a 3 e a 4.
- Quer pôr a mão na massa: vá direto à 5, que aponta para as outras quando precisa.

Cada página diz, no começo, para quem é e o que você consegue depois dela.

:::nota[Onde falta evidência]
Onde a trilha não tem evidência para afirmar algo, ela escreve `TODO(humano)` em vez de inventar.
:::

## Os repositórios, com o README de cada um

[`brabo`](https://github.com/viralabs-dev/brabo#readme), [`brabo-api`](https://github.com/viralabs-dev/brabo-api#readme), [`brabo-engine`](https://github.com/viralabs-dev/brabo-engine#readme), [`brabo-web`](https://github.com/viralabs-dev/brabo-web#readme), [`brabo-runner`](https://github.com/viralabs-dev/brabo-runner#readme), [`brabo-broker`](https://github.com/viralabs-dev/brabo-broker#readme), [`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme), [`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme), [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme), [`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme) e [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme).
