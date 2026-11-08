---
title: A rodada
description: Como o trabalho anda com pessoas e agentes - levantamento por um analista de leitura, execução por lanes com arquivos disjuntos, uma PR por repositório e o merge nas mãos do dono.
---

# A rodada

**Para quem é:** quem quer dividir um lote de atividades entre vários executores, humanos ou agentes, sem que eles pisem uns nos outros.

**Depois de ler, você consegue:** planejar uma rodada com lanes paralelas, dizer o que fica sequencial e por quê, e descrever o caminho até o merge.

## O que é uma rodada

Uma **rodada** é um lote de atividades já exploradas, executadas ao mesmo tempo. Cada atividade vai para uma **lane**, e cada lane é um executor (uma pessoa ou um agente). A rodada termina quando as mudanças estão integradas e validadas.

## Dois papéis, separados

| Papel | Pode escrever código? | Faz o quê |
|---|---|---|
| **Analista** | Não, só lê | Levanta requisitos e escreve o resultado na nota |
| **Executor** | Sim, na sua lane | Implementa, testa e documenta |

A separação é a regra mais valiosa do método. Quem levanta não corre o risco de "já ir arrumando". Quem executa recebe a especificação pronta. Os dois agentes de exemplo estão em [Copie o método](copie-o-metodo.md).

## Montando a rodada

1. **Releia o quadro.** Só entram atividades com `#explorada`.
2. **Divida em lanes.** Cada lane tem arquivos ou áreas **disjuntos** das outras da mesma rodada.
3. **Marque o que é sequencial.** Fica em fila o que tem dependência real, arquivo compartilhado, recurso único (um banco, um ambiente) ou um gesto humano.
4. **Dispare todas as lanes de uma vez.** O coordenador não espera uma terminar para soltar a próxima.
5. **Atualize o quadro no mesmo instante:** os cards das lanes vão para Em andamento.

:::dica[Arquivos compartilhados ficam com o coordenador]
Índices, listas de menu e o próprio quadro são pontos de colisão. Nenhuma lane os edita. Cada uma informa, no relatório, a linha que precisa entrar, e o coordenador as junta.
:::

## O que cada lane recebe

Um bom brief de lane cabe numa tela e diz:

- o ponto de partida (a base do código, com o SHA);
- a nota da atividade, que é a especificação;
- o que **não** tocar;
- os comandos de validação, com o código de saída esperado em cada um;
- o formato do relatório.

A lane não abre outros agentes. O teto de paralelismo é do coordenador, não de cada lane.

## Uma PR por repositório

Quando duas lanes mexem no mesmo repositório, elas **juntam** o trabalho numa branch e abrem **uma** PR para a rodada. A prova é o CI dessa PR. Isso reduz ruído de revisão e deixa o histórico legível.

O caminho da PR até a release está descrito em [A vida de uma mudança](../orquestrar-repositorios/vida-de-uma-mudanca.md). Não o repetimos aqui.

## Revisão e merge

O coordenador **integra**: confere o diff de cada lane, roda a validação e atualiza o quadro. O merge em branch protegida é do **dono** do produto. Nenhuma lane, e nenhum agente, mergeia na branch principal.

:::cuidado[Conferir o que a lane diz]
Relatório de lane não é prova. Rode o comando e leia o código de saída. "Os testes passam" sem o código de saída já enganou o time mais de uma vez.
:::

## Quando algo falha

Falha de uma lane não derruba as outras. O coordenador lê a causa, corrige o brief e dispara de novo só aquela lane. A causa vai para a nota da atividade.

## Um exemplo real

A [PR 89 do `brabo`](https://github.com/viralabs-dev/brabo/pull/89) foi uma rodada de documentação: várias lanes, cada uma com sua área, integradas numa única PR.

## Para saber mais

- [Quem faz o quê](../orquestrar-repositorios/o-mapa.md), para o mapa dos repositórios.
- [Erros que já cometemos](../orquestrar-repositorios/erros-que-ja-cometemos.md).
