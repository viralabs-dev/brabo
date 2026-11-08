---
title: Do pedido à atividade
description: Como um pedido vira trabalho que alguém pode começar - épico, atividade e card no quadro Kanban - e o que significa uma atividade estar explorada, com uma pergunta aberta bloqueando o início.
---

# Do pedido à atividade

**Para quem é:** quem recebe pedidos soltos (de um dono, de um cliente, de um achado de teste) e quer transformá-los em trabalho que se pode começar sem reunião.

**Depois de ler, você consegue:** escrever uma atividade que outra pessoa, ou um agente, executa sem perguntar nada, e decidir quando ela está pronta para entrar numa rodada.

## Três níveis, cada um com um papel

- **Épico:** um objetivo que dura semanas. Exemplo: "Login corporativo".
- **Atividade:** o menor pedaço que se entrega sozinho e se verifica. Exemplo: "ATV-001: o login aceita SSO".
- **Card:** a atividade como aparece no quadro Kanban, com uma linha de resumo e um link para a nota.

O card é curto de propósito. Tudo o que importa mora na **nota** da atividade, porque o quadro muda todo dia e a nota é o registro.

## O quadro

Um quadro simples tem as colunas **A fazer**, **Em andamento**, **Bloqueado** e **Feito**. Duas regras o mantêm honesto:

1. **Em andamento é só o que tem alguém trabalhando agora.** Card parado vai para A fazer ou Bloqueado.
2. **O quadro é atualizado no mesmo passo da mudança.** Começou, concluiu, bloqueou: o card muda naquele instante, com data e evidência.

## A nota da atividade

Toda nota tem as mesmas seções. Elas respondem às perguntas que um executor faria:

| Seção | Pergunta |
|---|---|
| O problema | Por que isso existe? |
| O que fazer | O que muda, concretamente? |
| Onde | Quais arquivos ou áreas? |
| Regras ligadas | Que decisões e regras valem aqui? |
| Aceite | Como saber que terminou? |
| Perguntas | O que ainda depende de uma decisão humana? |

O [modelo de atividade](copie-o-metodo.md) traz essa estrutura pronta.

## O que é "explorada"

Uma atividade só **começa** quando está **explorada**: a nota já tem todos os requisitos levantados e **nenhuma pergunta aberta** para o dono. O card ganha a tag `#explorada` nesse momento.

Isso evita o desperdício mais comum: alguém começa, descobre no meio que faltava uma decisão e para.

:::nota[Pergunta aberta bloqueia]
Se a nota ainda tem uma pergunta sem resposta, a atividade **não** vai para execução. Ela vai para um **levantamento**, em que alguém lê o código e a doc, escreve o que falta e formula a pergunta com opções e uma recomendação. Só quando a resposta chega a tag entra.
:::

## Um exemplo curto

Pedido: "quero que o login aceite SSO".

1. O pedido vira o épico "Login corporativo" e a atividade ATV-001.
2. Sem tag, a ATV-001 passa por levantamento. A pessoa que levanta descobre duas coisas: o arquivo do login e uma dúvida ("qual provedor?").
3. Ela escreve as duas na nota, com as opções A, B e C e uma recomendação.
4. O dono responde "B". A resposta entra na nota e o card ganha `#explorada`.
5. Só agora a ATV-001 pode entrar numa [rodada](a-rodada.md).

## Quando um achado vira atividade

Todo achado de teste, issue aberta ou erro visto em produção segue o mesmo caminho: vira uma atividade com card, nunca fica só numa conversa. Assim nada se perde, e o quadro é a lista única do que falta.

## Para saber mais

- [A vida de uma mudança](../orquestrar-repositorios/vida-de-uma-mudanca.md), para o que acontece depois que o trabalho começa.
- [Como contribuir](https://github.com/viralabs-dev/brabo/blob/dev/CONTRIBUTING.md), com o fluxo de PRs.
