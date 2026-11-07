# ADR 0268 — O `brabo-qa` tem regressivo por funcionalidade, e o da PR para a `dev` nunca é exigido

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `engenharia`
- **Referencia:** complementa o ADR [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) (o portão da `main`) e usa o ADR [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) (imagem por digest). Não edita nenhum dos dois. AT-769, decisões do dono de 06/11/2026.

## Contexto

O ADR 0267 fez o E2E do `brabo-qa` valer só na PR para a `main`. Na `dev`, nenhuma PR atesta que a funcionalidade que ela toca continua de pé, e o E2E é um bloco único de quatro specs, sem recorte por funcionalidade. O pedido do dono foi: o `brabo-qa` ter regressivo por funcionalidade do Brabo, ativado em toda PR que mexa naquela funcionalidade na `dev`, sem limitar o merge, e a PR para a `main` rodar o regressivo completo.

## Decisão

1. **Catálogo e mapa num arquivo só.** `brabo-qa/funcionalidades.yml` guarda as 14 funcionalidades (`id` estável em kebab-case, nunca renomeado; aposentar é `status: aposentada`) e o mapa `caminhos: {<repo>: [globs]}`. Mora no `brabo-qa`, e não no `brabo-contracts`, porque o contracts é consumido por tag e cada ajuste do mapa viraria tag e bump em seis consumidores. A spec se liga à funcionalidade pela tag do Playwright `@f-<id>`, e o filtro é `--grep`. Um teste do `brabo-qa` reprova id repetido, tema fora do `temas.yml`, glob que não casa arquivo e tag sem entrada.
2. **PR para a `dev` roda só o que tocou.** O `brabo-ci` (`qa-regressivo-selecao`, job `regressivo-dev` do `qa-e2e-gatilho.yml`) cruza os arquivos da PR com o mapa e dispara o `brabo-qa` com as funcionalidades tocadas. O resultado volta como o check `Regressivo do brabo-qa`, publicado pelo mesmo App.
3. **`Regressivo do brabo-qa` NUNCA é exigido.** Nenhum ruleset o cita, o merge segue livre com ele vermelho, e o `rulesets.md` registra a linha "não exigido, por decisão do dono (06/11)". O nome é distinto de propósito: o ruleset "main exige E2E" amarra o contexto `E2E do brabo-qa`, e um nome próprio impede que o regressivo se confunda com o portão ou vire obrigatório por engano. O `/qa-aceitar` não se aplica na `dev`.
4. **Arquivo transversal, em ordem.** (1) docs, `*.md`, `CHANGELOG`, `.github/**` (exceto o `qa-e2e.yml`), testes do próprio repo e `.claude/**` não tocam funcionalidade: check `neutral`. (2) Lockfile, manifesto, `Dockerfile`, entrada da app, schema e migrações, cliente HTTP do web e `config/**` do engine rodam o catálogo inteiro; é também o caso da subida de TAG do contracts. (3) Caminho sem dono no mapa roda o smoke `instalacao` + `autenticacao` e o resumo o lista como "sem dono no mapa", para o mapa ser corrigido.
5. **PR para a `main` roda o catálogo completo.** O check `E2E do brabo-qa` do ADR 0267 passa a montar a tabela `funcionalidade | specs | resultado`. Funcionalidade sem spec aparece como **"sem cobertura" e não reprova** (decisão do dono); com a regra oposta a `main` ficaria vermelha por semanas e o `/qa-aceitar` viraria rotina, esvaziando o portão. Os testes que existem passam sem alteração.
6. **Alvo da PR para a `dev`: imagem `sha-<12>`.** O `ci.yml` de api, engine, web e broker publica `ghcr.io/viralabs-dev/brabo-<app>:sha-<12 primeiros caracteres do head>` também para `base_ref == dev`, com Trivy e `cosign sign`, só em PR do próprio repositório (PR de fork não recebe segredo e o regressivo avisa "não roda em PR de fork"). O gatilho usa a `sha-<12>` no repo da PR e a `-dev.N` mais nova nos outros. O `limpeza-ghcr.yml` apaga toda `sha-*` de PR fechada e as com mais de 7 dias, porque cada `synchronize` deixa uma imagem órfã. A alternativa de construir dentro do job do `brabo-qa`, sem publicar, foi recusada: sem digest nem assinatura o atestado valeria menos que o da `main`.
7. **Processo.** PR que toca uma funcionalidade do catálogo ajusta o regressivo dela no `brabo-qa` contra a `dev`, ou diz no card por que não precisa. Se o mapa diz que a funcionalidade foi tocada e nenhuma spec `@f-<id>` mudou, o App comenta uma vez, como lembrete e sem bloquear. A regra mora no `CLAUDE.md` e no `CONTRIBUTING` de cada repositório.

## Consequências

- A lista de checks obrigatórios do ADR 0255 e do ADR 0267 não muda: o regressivo da `dev` só atesta.
- Uma PR para a `dev` custa de 8 a 12 minutos assíncronos de CI no `brabo-qa` e de 3 a 5 minutos no CI do repositório, pela imagem. Os repositórios são públicos e o runner padrão não consome minutos pagos.
- Código de PR não mergeada fica público no GHCR até a PR fechar ou 7 dias, o que a retenção limita.
- Hoje 10 das 14 funcionalidades não têm spec; elas aparecem como "sem cobertura" até virem specs (uma por card).
- Os golden-sets (`conhecimento`, `gates`) continuam agendados (ADR [0138](0138-golden-set-do-rag-em-ci-agendado.md), ADR 0168): o resumo cita o último run, sem rodar na PR.
- As provas ao vivo dependem de o App ter `checks: write` nos repositórios, gesto do dono.

## Referências

- [0119](0119-imagens-publicadas-no-ghcr-por-digest.md), [0138](0138-golden-set-do-rag-em-ci-agendado.md), [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md), [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md).
- Página: [Regressivo por funcionalidade](../explanation/regressivo-por-funcionalidade.md).
