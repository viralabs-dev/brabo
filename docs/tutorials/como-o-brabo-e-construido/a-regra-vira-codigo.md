---
title: A regra vira código, e a doc vai junto
description: Como uma decisão de negócio deixa rastro verificável - regra com arquivo, linha e teste, decisão estrutural em registro imutável - e por que a documentação faz parte do pronto, no mesmo PR da mudança.
---

# A regra vira código, e a doc vai junto

**Para quem é:** quem já viu a doc envelhecer ao lado do código e quer um jeito de impedir isso.

**Depois de ler, você consegue:** decidir se algo é uma regra de negócio ou uma decisão de arquitetura, registrá-lo no lugar certo e saber o que entra no mesmo PR da mudança.

## Dois tipos de decisão, dois registros

| É... | Vira... | Muda? |
|---|---|---|
| Uma regra que o produto cumpre ("o convite expira em 7 dias") | Uma **regra de negócio**, numerada | Sim, quando o negócio muda |
| Uma escolha estrutural ("usamos fila para os jobs") | Um **registro de decisão** (ADR) | Nunca: um novo o substitui |

## A regra de negócio aponta para o código

Uma regra sem ponteiro é opinião. Cada regra do Brabo diz **onde** é cumprida e **que teste** a prova:

```markdown
### Convite expira em 7 dias
O convite deixa de valer 7 dias depois de enviado.
- Código: `src/convites/expira.ts:42`
- Teste: `src/convites/expira.spec.ts`
```

Um check confere que o arquivo existe e que a linha ainda aponta para o símbolo. Se alguém move o código e esquece a regra, o check falha. A regra não envelhece em silêncio.

:::nota[Âncoras que não se repetem]
Cada regra tem um número único. Antes de criar uma, procure o próximo número livre em **todas** as branches abertas, não só na principal. Duas frentes paralelas costumam escolher o mesmo.
:::

## O ADR registra o porquê

Um ADR é uma página curta com contexto, decisão e consequências. Regra de ouro: **ADR aceito não se edita.** Se a decisão mudar, escreva um novo e diga qual substitui. O histórico de decisões é lido como um diário, e diário não se reescreve. O [modelo de ADR](copie-o-metodo.md) está pronto para copiar.

Nem toda mudança pede ADR. Pede quem mexe numa fronteira, no banco, no modelo de consistência ou numa dependência pesada.

## A doc vai no mesmo PR

A definição de pronto do Brabo inclui:

1. o código e os testes;
2. a doc do repositório (`docs/`) atualizada;
3. uma linha no `CHANGELOG.md`, em "Unreleased";
4. o README e o guia de contribuição, quando mudam;
5. o site, que agrega as docs dos repositórios.

Não existe "documento depois". PR que muda comportamento observável sem tocar a doc correspondente não está pronto.

## O mapa que diz o que atualizar

Para não depender de memória, um arquivo (`docs/.docmap.yml`) liga **caminhos de código** a **documentos**. Quem altera `src/convites/` vê que `docs/convites.md` depende dele. O mapa é um **piso**: ele lembra o mínimo, mas quem escreve ainda varre a pasta atrás de outras páginas afetadas.

Arquivos marcados como gerados nunca se editam à mão; o gerador os reescreve.

## Quando falta informação

Se quem escreve não tem como saber algo, deixa uma marca visível:

```markdown
> **TODO(humano):** o prazo de 7 dias vale para convites reenviados?
```

Doc inventada é pior que doc faltando. A marca vira pergunta no quadro, e a [atividade](do-pedido-a-atividade.md) fica sem `#explorada` até alguém responder.

## Para saber mais

- [Fluxo de documentação](https://github.com/viralabs-dev/brabo/blob/dev/docs/documentation-workflow.md), com o mecanismo completo.
- [Como contribuir](https://github.com/viralabs-dev/brabo/blob/dev/CONTRIBUTING.md), seção "Documentação faz parte do PR".
