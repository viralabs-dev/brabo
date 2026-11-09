---
title: Qualidade e o teste de aceite permanente
description: Como o Brabo sabe que o produto inteiro ainda funciona - regressivo por funcionalidade, portão de teste ponta a ponta na promoção e um teste de aceite permanente que usa o produto de verdade e transforma achados em atividades.
---

# Qualidade e o teste de aceite permanente

**Para quem é:** quem tem testes verdes e mesmo assim encontra defeitos quando alguém usa o produto de ponta a ponta.

**Depois de ler, você consegue:** montar três camadas de teste com papéis diferentes e explicar por que a última nunca termina.

## Três camadas

| Camada | Quando roda | O que prova |
|---|---|---|
| **Regressivo por funcionalidade** | Na PR | A funcionalidade que você tocou continua certa |
| **Portão de ponta a ponta** | Na promoção para a branch principal | O conjunto inteiro funciona e bloqueia o merge se quebrar |
| **Teste de aceite permanente** | Continuamente, a cada rodada | Um usuário consegue ir da ideia ao resultado, no produto de verdade |

## Regressivo por funcionalidade

O produto tem um catálogo de funcionalidades. Cada uma lista os caminhos de código que a compõem e tem seus testes de navegador. Quando a sua PR toca um desses caminhos, **aquela** funcionalidade é testada, não o produto todo. Se ela não tem teste ainda, aparece como "sem cobertura" e não reprova.

Na PR para a `dev` esse check só **atesta**: ele nunca é exigido. A regra é de honestidade: ajuste o regressivo da funcionalidade que você mudou, ou escreva no card por que não precisa.

Detalhes em [Regressivo por funcionalidade](../../explanation/regressivo-por-funcionalidade.md).

## Portão de ponta a ponta

Na promoção para a `main`, o catálogo **inteiro** roda e bloqueia o merge. É o único ponto em que o custo de rodar tudo vale a pena: acontece pouco e protege o que o usuário instala. Existe uma saída explícita para aceitar uma falha conhecida, que deixa registro de quem aceitou.

Como funciona: [O portão E2E](../../e2e-portao/como-funciona.md).

## O teste de aceite permanente

Os dois primeiros testam o que alguém **previu**. O terceiro procura o que ninguém previu.

Ele é um roteiro fixo que usa o produto como um cliente usaria: cria um projeto, pede uma entrega, aprova, faz o merge e recebe o resultado. Roda **sempre contra a versão que o usuário instala**, a cada rodada de trabalho, e nunca é "terminado".

### O que ele devolve

- **Achados:** cada falha ou atrito vira uma [atividade](do-pedido-a-atividade.md) com card, como qualquer pedido.
- **Uma nota por rodada:** qualidade da entrega, do que os agentes produziram e do tempo da ideia até o merge. Medir só a interação, sem contar pausas do condutor, mantém a série comparável.
- **Comparação:** a nota da rodada é lida contra as anteriores. Uma queda é um sinal antes de ser um incidente.

:::nota[Por que contra a versão instalada]
Testar na branch de desenvolvimento só prova que a próxima versão funciona. O teste permanente existe para provar que a versão que **já está** nas mãos do usuário funciona.
:::

## Como o resultado volta ao método

Fecha-se um ciclo: o teste permanente acha, o achado vira atividade, a atividade é explorada, entra numa [rodada](a-rodada.md), vira PR e o teste roda de novo. Quando um achado se repete, ele ganha um teste no regressivo, e a camada de baixo passa a pegá-lo mais cedo.

## O que copiar

Comece pequeno: um roteiro de **dez passos** que percorre o caminho principal do seu produto, executado à mão toda semana. Escreva o que doeu. Só depois automatize, e só os passos que dói repetir.

## Para saber mais

- [A vida de uma mudança](../orquestrar-repositorios/vida-de-uma-mudanca.md), seções do regressivo e do portão.
