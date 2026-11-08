---
id: como-escrevemos
title: Como escrevemos a documentação
sidebar_label: Como escrevemos
description: O guia de escrita da doc do Brabo - frases curtas, uma ideia por parágrafo, orçamento de palavras por tipo de página e o check que cobra isso.
keywords: [estilo, escrita, guia de estilo, orçamento de palavras, estilo.mjs]
tipo: guia
---

# Como escrevemos a documentação

**Depois de ler:** você escreve uma página que passa no check de estilo sem pedir ajuda.
**Antes de começar:** saiba qual é o tipo da página (tutorial, guia, conceito ou referência) e tenha o repo clonado com `pnpm install` feito.

## As regras

1. **Frase curta, voz ativa.** Mire em 20 palavras por frase. Diga "o instalador grava o arquivo", não "o arquivo é gravado pelo instalador".
2. **Uma ideia por parágrafo.** Se o parágrafo tem dois "além disso", são dois parágrafos.
3. **Abra com o que a pessoa vai conseguir.** Logo depois do título, escreva "Depois de ler" e os pré-requisitos, como nesta página.
4. **O como vem antes do porquê.** Comece pelo que fazer. A razão vem depois, curta, e só se ajudar a decidir.
5. **Passos numerados e verificáveis.** Cada passo é uma ação. Termine o procedimento com "como saber que deu certo": o comando e o resultado esperado.
6. **ID interno só em "Para saber mais".** ADR, RN, AT, EP, HS, Fase e Rodada ficam na seção `## Para saber mais`, no fim da página. No corpo, diga a ideia com palavras.
7. **Imagem só do manifesto de imagens.** Não coloque print avulso na página. Esconda dados sensíveis em qualquer captura.
8. **Segredo nunca aparece**, nem de exemplo parecido com o real. Use `<TOKEN>`.

## Orçamento por tipo

O tipo vem do campo `tipo:` do frontmatter. A contagem é só de prosa: ficam de fora o frontmatter, blocos de código, tabelas, títulos e a seção "Para saber mais".

| Tipo | Limite de palavras |
|---|---|
| tutorial | 1 500 |
| guia | 800 |
| conceito | 1 200 |
| referência | sem limite, com índice |

Passou do limite? Divida a página em duas, ou mova o detalhe para uma referência e deixe um link.

## Rodar o check

Na raiz do repo:

```bash
node scripts/docs/estilo.mjs                          # todas as páginas
node scripts/docs/estilo.mjs docs/contribuir/como-escrevemos.md
```

O check imprime um `AVISO` por página acima do limite e um por ID interno fora de "Para saber mais". Por enquanto ele só avisa. A lista `PENDENTES` do `scripts/docs/estilo.spec.ts` guarda as páginas antigas que ainda estouram: ela só encolhe. Página nova, ou página que você acabou de ajustar, tem de passar.

Como saber que deu certo: o comando termina com `estilo: 0 aviso(s)` para a sua página, e `pnpm test:scripts` sai com código 0.

## Um modelo bom

A trilha `orquestrar-repositorios` segue este guia: abre com "Para quem é", tem frases de 15 a 18 palavras e cada página cabe em 825 palavras. Copie o formato dela.

## Para saber mais

- [Como a documentação se mantém viva](../explanation/documentation-workflow.md): o mecanismo que mantém a doc em dia, incluindo o `estilo.mjs`.
- Origem: AT-861, EP-034. Referências de mercado: Google Developer Documentation Style Guide, Microsoft Writing Style Guide, GitLab docs style e Write the Docs.
