---
title: Copie o método
description: Os modelos de quadro Kanban, de atividade e de ADR para baixar e adaptar, mais os agentes analista e executor do Brabo como exemplo de papéis, e um roteiro de uma tarde para rodar a primeira rodada.
---

# Copie o método

**Para quem é:** quem leu as páginas anteriores e quer sair com arquivos na mão. Esta página é só o que há para levar.

**Depois de ler, você consegue:** montar seu quadro, escrever sua primeira atividade e registrar sua primeira decisão em uma tarde.

## Os modelos

Três arquivos Markdown, para baixar e adaptar. O quadro usa o formato do plugin Kanban do Obsidian, mas é texto simples e abre em qualquer editor.

| Modelo | Para quê | Arquivo |
|---|---|---|
| Quadro | Colunas, regras de uso e uma rodada de exemplo | [`_kanban.md`](../../assets/modelos/_kanban.md) |
| Atividade | A nota com as seções da [página 1](do-pedido-a-atividade.md) | [`_atividade.md`](../../assets/modelos/_atividade.md) |
| ADR | Contexto, decisão e consequências | [`_adr.md`](../../assets/modelos/_adr.md) |

O prefixo `_` no nome é intencional: o site os serve como arquivos para baixar, sem transformá-los em páginas.

## Os agentes

Dois papéis, escritos como arquivos de agente do Claude Code, ficam públicos no `brabo-ci`:

- [`analista`](https://github.com/viralabs-dev/brabo-ci/blob/dev/.claude/agents/analista.md): só lê. Levanta requisitos e escreve na nota.
- [`executor`](https://github.com/viralabs-dev/brabo-ci/blob/dev/.claude/agents/executor.md): implementa uma lane, valida e relata.

Não copie sem ler. Eles citam convenções do Brabo (nomes de branch, formato de commit); troque pelas suas e mantenha o que importa: o analista não escreve código, o executor não decide escopo.

## Roteiro de uma tarde

:::passos
1. Copie `_kanban.md` para a pasta do seu projeto e renomeie. Crie um épico com um objetivo de verdade.
2. Copie `_atividade.md` duas vezes e escreva duas atividades pequenas. Deixe uma com uma pergunta aberta.
3. Responda a pergunta (ou faça-a a quem decide) e ponha `#explorada` só na atividade sem dúvidas.
4. Monte uma rodada de uma lane: dê a nota da atividade explorada a um executor, humano ou agente, com os comandos de validação e o código de saída esperado.
5. Integre, valide e abra uma PR. Mova o card no mesmo instante em que a situação muda.
6. Se a mudança foi estrutural, copie `_adr.md` e registre a decisão.
:::

Se você chegou ao passo 5 sem precisar perguntar nada ao executor, o método funcionou.

## O que adaptar primeiro

- **Nomes de coluna e tags:** use as palavras do seu time.
- **Quem é o "dono":** quem faz o merge na branch principal. Sem um nome, ninguém faz.
- **O teto de paralelismo:** comece com duas lanes. Suba quando a integração deixar de ser o gargalo.

## Quando não copiar

Equipe de uma pessoa, produto de um repositório e semanas de vida? O quadro e a atividade bastam. Rodadas e agentes pagam o custo quando há trabalho paralelo de verdade.

## Para saber mais

- [Monte o seu](../orquestrar-repositorios/monte-o-seu.md), o roteiro equivalente para a **estrutura** de repositórios.
