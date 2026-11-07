---
sidebar_position: 8
---

# Regressivo por funcionalidade

O `brabo-qa` não aprova só "a stack sobe": ele tem um **regressivo por
funcionalidade do Brabo**. Toda PR que mexe numa funcionalidade roda o
regressivo dela, para atestar que ela não foi afetada. Na `dev` isso **não
bloqueia** nada; na `main` o catálogo inteiro roda e vale como portão. A decisão
está no [ADR 0268](../adr/0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md).

## O catálogo e o mapa

`brabo-qa/funcionalidades.yml` guarda as **14 funcionalidades** (autenticação,
sessão e canal, turno do agente, aprovações, time e handoffs, projetos, git,
backlog, gates, container e broker, runner, providers e gasto, RAG e grafo,
instalação) e, para cada uma, os **globs de caminho por repositório**. O `id` é
estável e nunca é renomeado; aposentar é `status: aposentada`. A spec do
Playwright se liga à funcionalidade pela tag do próprio teste
(`{ tag: '@f-<id>' }`), e o filtro é `--grep`. Mora no `brabo-qa` (e não no
`brabo-contracts`, consumido por tag) para que ajustar o mapa seja uma PR só
(RN-1031).

## PR para a `dev`: atesta, não bloqueia

1. O job `regressivo-dev` do `qa-e2e-gatilho.yml` do `brabo-ci` cruza os arquivos
   da PR com o mapa.
2. Três regras valem antes do mapa (RN-1033):
   docs e testes do repositório não tocam funcionalidade (`neutral`); lockfile,
   `Dockerfile`, entrada da app, schema e a subida de TAG do contracts rodam o
   catálogo inteiro; caminho sem dono no mapa roda o smoke `instalacao` +
   `autenticacao` e é listado como "sem dono no mapa".
3. O `brabo-qa` roda as specs das funcionalidades tocadas contra a imagem
   `sha-<12>` do head da PR, que o `ci.yml` publica e assina só para PR do
   próprio repositório; PR de fork não recebe segredo e fica sem regressivo
   (RN-1035).
4. O resultado volta como o check **`Regressivo do brabo-qa`** (`success`,
   `failure` ou `neutral`).

**Esse check nunca é exigido.** Nenhum ruleset o cita e o merge segue livre com
ele vermelho (RN-1032). O nome é distinto do
`E2E do brabo-qa` de propósito, para não se confundir com o portão da `main`.

## PR para a `main`: o catálogo inteiro

O check `E2E do brabo-qa` ([ADR 0267](../adr/0267-o-e2e-do-brabo-qa-e-portao-da-main.md))
roda todas as specs e traz a tabela `funcionalidade | specs | resultado`.
Funcionalidade do catálogo **sem spec aparece como "sem cobertura" e não
reprova** (RN-1034); hoje essa é a situação de
10 das 14, e cada uma deixa a lista quando ganha uma spec. O `/qa-aceitar
<justificativa>` do dono segue valendo para vermelho de `spec` ou `ambiente`.

## A regra do card

**PR que toca uma funcionalidade do catálogo ajusta o regressivo dela no
`brabo-qa` contra a `dev`, ou diz no card por que não precisa.** Quando um card
entra, o levantamento avalia se ele mexe numa funcionalidade e anota os `id` do
catálogo. Se o mapa diz que a funcionalidade foi tocada e nenhuma spec `@f-<id>`
mudou, o App comenta uma vez na PR, como lembrete.

## O que isto custa

Uma PR para a `dev` gasta de 8 a 12 minutos assíncronos de CI no `brabo-qa` e de 3
a 5 minutos no CI do repositório (a imagem). Os repositórios são públicos, e o
runner padrão não consome minutos pagos. Os golden-sets (`conhecimento`, `gates`)
continuam agendados: o resumo cita o último run, sem rodar na PR.

Para ver de qual run do Actions saiu cada resultado, e que irmãos ele leu, veja
os Vínculos no Summary ([ADR 0271](../adr/0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md)).
