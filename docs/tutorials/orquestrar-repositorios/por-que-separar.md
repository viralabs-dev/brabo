---
title: Por que separar, e quando não
description: Os motivos que levaram o Brabo a 11 repositórios, o custo que veio junto (trava de SHAs, paridade de tradução, ordem de merge) e os sinais de que o seu produto ainda não deve ser dividido.
---

# Por que separar, e quando não

**Para quem é:** quem está decidindo se divide um produto em repositórios.

**Depois de ler, você consegue:** listar o que se ganha e o que se paga ao dividir, e dizer se o seu caso justifica o custo.

## O ponto de partida

O Brabo nasceu como um **monorepo**: api, engine, web, runner, broker, infraestrutura, documentação e testes de ponta a ponta no mesmo repositório, com **uma versão, um histórico e um pipeline**. O dono do produto decidiu, em novembro de 2026, separá-lo em repositórios dentro de uma organização. A decisão e o mapa estão no [ADR 0252](../../adr/0252-o-brabo-vira-um-conjunto-de-repositorios.md), para quem quiser ler depois.

## O que a separação trouxe

O que o ADR registra como motivo e consequência direta:

- **Versões independentes.** Cada repositório tem a versão dele, e o produto tem a dele, no repositório da porta de entrada. Corrigir a api não obriga a republicar a web.
- **Dono claro para cada pedaço de documentação.** A `docs/` e as regras de negócio moram no repositório dono do código, e o `docs:check` de cada um confere a sua.
- **Artefatos próprios.** Quem publica imagem de contêiner, binário ou pacote publica no próprio repositório, com a cadeia de assinatura dele.
- **Uma porta de entrada.** Quem só quer instalar precisa conhecer um repositório, e não onze.

> **TODO(humano):** o ADR 0252 não lista critérios numerados de "quando separar" (por exemplo, tamanho do time ou ritmo de release). Se o dono quiser que a trilha os afirme, eles precisam ser escritos por ele.

## O que a separação custou

Dividir move a complexidade para as **arestas** entre os repositórios. Estes são os custos que o Brabo mediu e teve de resolver, cada um com a página onde a solução aparece:

| Custo | O que acontecia | Solução adotada |
|---|---|---|
| **O site lê o código dos irmãos** | O site de documentação precisa do código dos outros repositórios. Ler a ponta da `dev` de cada um fazia a mesma PR passar de verde a vermelho sem nenhum commit novo. | Uma **trava de SHAs** (`irmaos.lock`) no repositório da porta de entrada, subida por um bot. [ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) |
| **Paridade de tradução** | A medição de tradução somava a documentação de todos os repositórios, então um merge em outro repositório deixava PRs alheias vermelhas. | A paridade mede **só** a documentação do repositório dono. [ADR 0273](../../adr/0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md) |
| **Ordem de merge entre repositórios** | O GitHub não tem dependência entre repositórios. A `dev` de um repositório ficou vermelha entre dois merges em ordem errada, e a ordem só existia na memória de quem promovia. | A PR **declara** de qual PR depende (`Depende-de:`), e um check espera. [ADR 0276](../../adr/0276-a-pr-declara-de-que-pr-depende-o-merge.md) |
| **A ordem de promoção** | Promover `dev` para `main` também tem ordem. | A ordem é **inferida** das camadas dos repositórios. [ADR 0284](../../adr/0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md) |
| **O mapa se desatualiza** | A lista dos repositórios estava copiada à mão em 14 lugares, com 11 redações diferentes. | Uma **fonte única** (`repos.yml`) gera o bloco de cada README. [ADR 0281](../../adr/0281-o-mapa-dos-repos-tem-uma-fonte-so.md) |
| **O pin da política de CI** | Cada repositório fixava uma versão diferente da política; havia 5 SHAs diferentes entre 11 repositórios. | O pin aponta para uma **tag**, e um check confere. [ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) |
| **Contratos compartilhados** | Uma tag nova do repositório de contratos pede bump em vários consumidores. | Consumo **por tag exata**, e um script sobe a versão em cada consumidor. Veja a [página 3](como-cada-repo-e-consumido.md). |

Repare no padrão: **cada custo virou uma peça de automação**. Dividir sem essa automação é o caminho mais comum para um conjunto de repositórios que ninguém consegue manter.

## Quando não separar

Estes sinais vêm do custo acima, não de uma regra do Brabo. Se vários valem para você, adie a divisão:

- **Ninguém precisa de versão independente.** Se tudo sempre sai junto, o monorepo já dá isso de graça.
- **Uma pessoa ou um time pequeno cuida de tudo.** O custo das arestas (trava, ordem de merge, pins) é fixo, e o ganho de autonomia é pequeno.
- **Você não tem como automatizar o que cruza repositórios.** Sem checks de ordem de merge, de pin e de mapa, o conjunto apodrece em silêncio.
- **O código muda sempre em conjunto.** Se quase toda mudança toca três repositórios, você criou um monorepo difícil de usar.

O Brabo separou mesmo assim porque queria artefatos e documentação com dono, e aceitou pagar com automação. A próxima página mostra o resultado.

Próxima: [O mapa](o-mapa.md).
