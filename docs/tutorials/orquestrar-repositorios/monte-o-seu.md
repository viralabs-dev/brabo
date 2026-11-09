---
title: Monte o seu
description: Checklist em ordem para replicar o padrão do Brabo em outro produto - pasta-mãe, repositório de CI com a política, repositório de contratos, repositório que orquestra, repositório de qualidade com o portão e porta de entrada - com o que copiar e o que adaptar em cada passo.
---

# Monte o seu

**Para quem é:** quem decidiu dividir o próprio produto e quer um roteiro.

**Depois de ler, você consegue:** listar os repositórios que vai criar, na ordem, e dizer em cada um o que copia do Brabo e o que adapta.

:::dica[A ordem importa]
Cada passo só depende dos anteriores. Faça um de cada vez e **só avance quando a PR de exemplo do passo estiver verde**.
:::

## 0. Antes de tudo: o mapa

Escreva a tabela de papéis da [página 2](o-mapa.md) para o **seu** produto, com o modo de consumo ([página 3](como-cada-repo-e-consumido.md)) em cada aresta. Se algum repositório não tiver papel claro, não o crie ainda.

## 1. A pasta-mãe e o "clonar tudo"

- **Copie** o padrão do [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme): uma pasta que guarda os clones lado a lado e um `clonar-tudo.sh` que clona todos e nunca apaga nada. A lista dos repositórios é uma variável só.
- **Adapte** o nome da organização e a lista de repositórios.
- **Cuidado:** o script é bash 3.2-compatível (macOS); evite arrays associativos e `mapfile`.
- **Pronto quando:** `clonar-tudo.sh` em uma máquina limpa deixa todos os clones no lugar.

## 2. O repositório de CI, com a política

Faça este **primeiro entre os de código**, porque todos os outros o chamam.

- **Copie** o [`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme), ou, sem fork, apenas chame os workflows dele. O [guia de adoção](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md) leva um repositório que nunca viu o Brabo a ter `pr-police` e `escada` verdes, e o repositório-exemplo `daneiel/brabo-ci-exemplo` prova os passos.
- **Adapte:** o `ci_ref` (o SHA da versão que você escolheu), a variável `OWNER_HANDLE` e, se quiser aprovação por papéis, o modo `community`.
- **Não copie sem pensar:** o portão do QA, o `dependencias-de-merge` (que presume os 11 repositórios) e o `contracts-alinhado` (que presume os pacotes `@viralabs-dev/brabo-*`) são específicos do Brabo.
- **Pronto quando:** uma PR de exemplo mostra `Política de branches` e `Escada de aprovação` verdes.

## 3. O repositório de contratos

- **Copie** o padrão do [`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme): `publishConfig` com o GitHub Packages, `files: ["dist"]` e um `publish.yml` que chama o `publish-npm.yml` do CI a partir da tag.
- **Adapte:** o escopo dos pacotes e o que vai dentro (tipos, esquemas, arquivos de dados).
- **Regra de ouro:** consumidores fixam a **versão exata**, nunca uma branch.
- **Pronto quando:** um consumidor de teste instala o pacote pela tag com o `pnpm add`.

## 4. Os repositórios de código

- **Copie** o esqueleto de README com oito seções fixas ([`README.modelo.md`](https://github.com/viralabs-dev/brabo-ci/blob/dev/README.modelo.md)), a chamada do `pr-police`/`escada`/`tag-release` e o carimbo de tag.
- **Adapte** o que cada repositório publica (imagem, binário, pacote) e os comandos de teste.
- **Pronto quando:** cada repositório publica uma tag `-dev.N` a cada merge na `dev`.

## 5. O repositório que orquestra

- **Copie** a ideia do [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme): compose, scripts de desenvolvimento e a action que clona os irmãos.
- **Adapte** os serviços do compose e a lista de repositórios da action.
- **Pronto quando:** `docker compose up` sobe o conjunto a partir das imagens publicadas.

## 6. O repositório de qualidade, com o portão

- **Copie** o padrão do [`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme): o E2E que roda **por digest**, o job que cria o token do App só depois do checkout limpo e o catálogo de funcionalidades.
- **Adapte** o catálogo e os caminhos de cada repositório, e escreva as specs do **seu** produto.
- **Exija** o check do portão no ruleset da `main`, e só nela.
- **Pronto quando:** uma PR para a `main` fica vermelha se o E2E quebrar.

## 7. A porta de entrada

- **Copie** a estrutura do [`brabo`](https://github.com/viralabs-dev/brabo#readme): o `repos.yml` (fonte única do mapa), o `componentes.json` (pins), o `irmaos.lock` e o `install.sh`.
- **Adapte** a lista de repositórios e os componentes que formam **o seu** produto.
- **Ligue por último** a release do produto: ela depende de todas as Releases dos componentes existirem.
- **Pronto quando:** o instalador confere o `checksums.txt` assinado e instala o conjunto numa máquina limpa.

## Depois que estiver de pé

:::passos
1. Gere o bloco "Onde se encaixa" de cada README a partir do `repos.yml`.
2. Ligue os checks de ordem de merge e de pin.
3. Leia os [erros que já cometemos](erros-que-ja-cometemos.md) antes de achar que está tudo certo.
:::

> **TODO(humano):** esta trilha ainda não foi validada por uma pessoa de fora do projeto. A prova combinada é que alguém do time da SmartSky, lendo só a trilha, desenhe o mapa e narre o caminho de uma mudança até a release; o resultado e as divergências precisam ser registrados aqui.
