---
title: Como cada repositório é consumido
description: Os seis modos pelos quais um repositório do Brabo entrega algo a outro (tag de contrato, SHA de política, clone irmão, imagem por digest, binário assinado e pin de componentes), cada um com quem publica, quem consome, o arquivo que trava a versão e o check que prova.
---

# Como cada repositório é consumido

**Para quem é:** quem precisa decidir **como** um repositório entrega algo a outro.

**Depois de ler, você consegue:** escolher o canal certo para cada aresta do seu mapa e dizer qual arquivo trava a versão e qual check prova.

A regra que atravessa tudo: **todo canal fixa uma versão exata e tem um check que confere**. Consumir "a última" de outro repositório é o que faz o mesmo commit passar de verde a vermelho.

## Os seis modos

| # | Modo | Quem publica | Quem consome | O que trava | Quem prova |
|---|---|---|---|---|---|
| 1 | **Contrato por tag** | `brabo-contracts` | api, web, runner, broker, engine, qa, infra | a versão exata no `package.json` e no lock | `contracts-alinhado` |
| 2 | **Política por SHA** | `brabo-ci` | os 11 repositórios | `uses: ...@<sha>` e `ci_ref` | `pins-do-brabo-ci` |
| 3 | **Clone irmão** | cada repositório (a `dev`) | `brabo-infra` e `brabo` | `irmaos.lock` (no `brabo`) | `docs:check` |
| 4 | **Imagem por digest** | api, engine, web, broker e a imagem de backup | `brabo-qa` e o instalador | o digest `sha256` | `E2E do brabo-qa` |
| 5 | **Binário assinado** | `brabo-runner` | `install.sh` do `brabo` | `checksums.txt` assinado | o `install.sh` e o `release.yml` |
| 6 | **Pin do produto** | todos os componentes | `brabo` | `componentes.json` | `Pins dos componentes` |

### 1. Contrato por tag

O `brabo-contracts` publica pacotes no GitHub Packages (`@viralabs-dev/brabo-shared` e `@viralabs-dev/brabo-docker-port`) e três arquivos de dados baixados por URL crua **na mesma tag**. Quem consome fixa a versão exata por um alias do pnpm, sem alterar os imports:

```bash
pnpm add "@brabo/shared@npm:@viralabs-dev/brabo-shared@1.2.0"
```

Nunca se fixa numa branch. Quando uma tag nova sai, cada consumidor sobe a versão com o script [`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh), e o check `contracts-alinhado` reprova se o alias, o lock e a constante dos scripts de download divergirem.

### 2. Política por SHA

Cada repositório chama os workflows do `brabo-ci` assim:

```yaml
uses: viralabs-dev/brabo-ci/.github/workflows/pr-police.yml@<sha>  # v1.4.0
with:
  ci_ref: <o mesmo sha>
```

O `uses:` escolhe o YAML e o `ci_ref` escolhe os scripts, então os dois têm de ser o **mesmo SHA de 40 caracteres**. O comentário diz a versão a quem lê, e o check `pins-do-brabo-ci` confere que o comentário corresponde ao SHA ([ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md)). O passo a passo está no [guia de adoção](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md).

### 3. Clone irmão

Dois repositórios leem o **código** dos outros:
- o `brabo-infra` tem uma action `irmaos` que faz o checkout da `dev` dos irmãos, para as aferições cruzadas;
- o `brabo` reconstrói o layout de todos com `scripts/docs/montar-layout.sh`, para gerar a documentação. Aqui a versão é travada: o `irmaos.lock` guarda o SHA de cada irmão, e quem o sobe é o bot `regenera-gerados` ([ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md)). Humano nunca edita esse arquivo.

Quem desenvolve usa o mesmo princípio na máquina: o `clonar-tudo.sh` do `brabo-workspace` clona todos lado a lado, e os scripts leem os vizinhos por `BRABO_IRMAOS`.

### 4. Imagem por digest

Cada tag de api, engine, web e broker publica uma imagem de contêiner, assinada com o cosign. O portão da `main` (`brabo-qa`) resolve a tag para o **digest** (`imagem@sha256:...`), confere que o contêiner em execução tem exatamente aquele digest e verifica a assinatura. Tag é um ponteiro que se move; digest não ([ADR 0267](../../adr/0267-o-e2e-do-brabo-qa-e-portao-da-main.md)).

### 5. Binário assinado

O `brabo-runner` não publica imagem: roda na máquina de quem usa. Ele anexa à Release os binários e um `checksums.txt` assinado. O `install.sh` baixa o binário da tag que o `componentes.json` fixa e o confere contra essa assinatura.

### 6. Pin do produto

O arquivo `componentes.json`, na raiz do `brabo`, diz **qual tag de cada componente forma o produto**:

```json
"imagens": { "api": { "repo": "viralabs-dev/brabo-api", "tag": "v2.1.0" } }
```

A pin não anda sozinha, mas um bot a sobe: a cada 6 horas ele lê a última Release final de cada componente e abre uma PR trocando só a tag, e o merge é humano. O check `Pins dos componentes` reprova a promoção do produto se uma pin estiver atrás ([release do produto](../../explanation/release-do-produto.md)).

> **Para o seu projeto:** para cada aresta do seu mapa, escreva quatro coisas: quem publica, quem consome, qual arquivo guarda a versão e qual check reprova se ela divergir. Se faltar o check, a aresta ainda não está pronta.

Próxima: [A vida de uma mudança](vida-de-uma-mudanca.md).
