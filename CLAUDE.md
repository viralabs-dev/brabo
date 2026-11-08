# Brabo (porta de entrada) — documentação, instalador e release do produto

## O que é este repositório
`viralabs-dev/brabo` é a PORTA DE ENTRADA do Brabo (plataforma de engenharia
orquestrada por agentes). Quem instala ou lê só precisa conhecer este repo
(ADR 0252, decisão do dono de 02/11/2026). Ele guarda:
- `docs/` — o AGREGADOR: intro, getting-started, ADRs, explicações, o ÍNDICE de
  RN (`docs/business-rules.md`), traduções em `docs/i18n/` e `docs/assets/`;
- `scripts/docs/` — o gerador do site, os checks e o mapa `fontes.yml`;
- `scripts/ci/docs/` — NÃO mora aqui: a doc da área ci é do `brabo-ci` e entra no layout pela trava (AT-823); `website/` — só a árvore do Redoc;
- `CHANGELOG.md` (o do PRODUTO), `README.*`, `THIRD_PARTY_NOTICES.md` e os
  arquivos de comunidade;
- `install.sh` (+ `scripts/dev/install-*.spec.ts`, `scripts/ci/assets-do-instalador.ts`);
- os workflows `docs-check`, `docs-deploy`, `docs-audit` e, DORMENTES até a
  AT-704 (todo job exige a variável de repositório `PRODUTO_RELEASE_LIGADA=true`),
  `release`, `tag-release`, `install-e2e`.

O código mora nos repositórios irmãos `brabo-api`, `-engine`, `-web`, `-runner`,
`-broker`, `-contracts`, `-infra`, `-ci`, `-qa` (todos em `viralabs-dev`); o
monorepo antigo é `viralabs-dev/brabo-legacy`. O site publica em
`viralabs-dev.github.io/brabo/{prd,dev}/` (o GitHub Pages é ligado pelo dono).

## Como o docs lê o código dos irmãos
`bash scripts/docs/montar-layout.sh` RECONSTRÓI neste checkout o layout do
monorepo (`apps/api`, `apps/engine`, `apps/web`, `apps/runner`, `apps/broker`,
`packages/`, e a raiz de `brabo-infra` e `brabo-ci`), trazendo o SHA de cada um
em `irmaos.lock` (a trava, ADR 0274; `BRABO_REF` vence a trava, e `BRABO_REF=dev`
mostra a `dev` de agora; `BRABO_IRMAOS=<pasta>` usa clones locais). Os
arquivos entram no ÍNDICE do git (`git add -f`), nunca em commit: `git ls-files`
é a régua do gerador. As refs `caminho:N` das RNs e os globs do docmap seguem
iguais. Raiz opcional ausente vira AVISO. O `docs-check` e o `docs-deploy`
rodam esse script antes de `docs:check`/`docs:build`. A regra "doc no MESMO PR do
código" não vale entre repos: o drift só enxerga o diff deste repo.
O script grava o que trouxe em `.git/layout-irmaos.lst` e, na rodada seguinte,
remove o que já não está em `HEAD` (senão o `--update=none` esconde diff).
`.github/workflows/regenera-gerados.yml` (a cada 6 h e por `workflow_dispatch`)
sobe a trava, sobe as pins do `componentes.json` (e o `RUNNER_TAG` do `install.sh`) até a última Release final de cada componente (`scripts/ci/pins-dos-componentes.ts --subir`, AT-796, ADR 0282) e regenera os gerados que dependem dos irmãos no mesmo commit, e
abre/atualiza a PR fixa `chore/regenera-gerados` na `dev` (dispensa a escada,
ADR 0255; o merge é humano); pendência em arquivo
de irmão deixa o job vermelho nomeando o repo dono (AT-726).
A trava `--conferir` do mesmo script roda no check `Pins dos componentes` (PR para a `main`) e no `release.yml` (reprova na tag, avisa no ensaio).
O "editar esta página" aponta para o repo DONO (`scripts/docs/site/repo-dono.mjs`).

## Convenções do repositório
- Branches permanentes `dev` e `main`; trabalho nasce de `dev` com a taxonomia
  `funcao/descritivo` (descritivo até 32 caracteres); commits conventional em
  pt-BR; toda mudança entra por PR; merge em branch protegida é do dono.
- A release do PRODUTO (1.0.0, AT-704) nasce daqui; nunca versionar à mão.
- PR que toca uma funcionalidade do catálogo (`brabo-qa/funcionalidades.yml`) ajusta o regressivo dela no `brabo-qa` contra a `dev`, ou diz no card por que não precisa. `Regressivo do brabo-qa` (PR para a `dev`) só atesta e NUNCA é exigido; o `E2E do brabo-qa` (PR para a `main`) roda o catálogo inteiro (ADR 0268).
- Os workflows que leem irmãos publicam `## Vínculos` no Summary pela action `vinculos` do `brabo-ci` (SHAs do `.git/irmaos-sha.lst`, ADR 0271); o helper nunca reprova o job.
- Responder e escrever docs em pt-BR (a FONTE); `en`, `ru`, `zh-Hans` são
  traduções com paridade medida (no `brabo`, só da doc dele; ADR 0273). Vale para TODOS os repos (ADR 0266, que
  substitui o 0260): os irmãos também podem ter `docs/i18n/`, e o `Unreleased`
  dos CHANGELOGs é em pt-BR. Página com `idioma_original: en` ainda é aceita
  (o site a serve com a faixa "só em inglês") até o irmão retraduzi-la.
- `install.sh` é bash 3.2 (sem Node); mudar o `case` dos assets exige mudar
  `scripts/ci/assets-do-instalador.ts` junto (o spec reprova a divergência).

## Documentação é parte da definição de pronto (permanente)
- Ao alterar código, consulte docs/.docmap.yml e atualize os docs
  mapeados NA MESMA mudança, mostrando o diff da doc junto com o do
  código. Não pergunte se deve fazer — faça.
- Fonte de verdade do Markdown: docs/ na raiz. NUNCA crie website/docs/
  — o site lê de docs/ via path.
- Arquivos generated: true no docmap são gerados por pnpm docs:generate
  — nunca editados à mão (o próximo build sobrescreve). Se o gerador
  marcar algo como "sem descrição acima", é lacuna real: escreva a
  descrição na prosa.
- Mudança de comportamento observável → entrada em CHANGELOG.md
  (Unreleased).
- Mudança estrutural (fronteira de camada, banco, modelo de
  consistência, dependência pesada) → ADR novo com o próximo número.
  ADR aceito NUNCA é editado: o novo referencia o antigo.
- Regra de negócio nova → RN-XXX com arquivo:linha e o teste que a cobre, no
  `<raiz>/docs/business-rules/<raiz>.md` da ÁREA DONA DO CÓDIGO (a raiz que
  hospeda a 1ª ref `caminho:N`; ADR 0254). `docs/business-rules.md` é ÍNDICE
  GERADO e `custo.md`/`autenticacao.md` são stubs congelados: não escreva RN
  neles. A numeração é GLOBAL (nunca reinicie por raiz) e o `docs:check` soma
  todas as raízes e reprova número duplicado. Âncora `{#rn-NNN}` é o contrato:
  não muda quando a RN muda de arquivo; cabeçalho sem ela, ou com outro
  número, REPROVA o `docs:check` — também nas traduções (`en`, `ru`,
  `zh-Hans`, ADR 0216) (`scripts/docs/ancoras-de-rn.mjs`, AT-230).
- TODA mudança verifica se ESTE arquivo — com as partes que ele importa de
  `.claude/contexto/` — precisa mudar: Stack, Convenções, "O que NÃO fazer"
  e o estado das fases. Não pergunte se deve: verifique.
  O gatilho é o mesmo do docmap, e o motivo é que este arquivo e as partes
  são os únicos documentos lidos em TODA sessão: desatualizados, eles não são
  neutros, eles ensinam errado. Têm regra `warn` no docmap (não `block`,
  porque não moram sob docs/ e o checker valida glob e link dentro de docs/ —
  promover sem estender o checker criaria regra que se burla com
  `docs-not-needed`); tocar qualquer um deles satisfaz a regra. Parte nova
  entra no import daqui, no `docs_alternativos` da regra `claude-md` e, se
  tiver frase contada, em `scripts/docs/contagens-do-codigo.mjs`. O teto é a
  SOMA do que é lido em toda sessão — este arquivo, as partes importadas e os
  `CLAUDE.md` do usuário —, que não passa de 150 mil caracteres (o aviso do
  Claude Code, medido com `wc -m`, nunca `wc -c`). Crescendo, o que só vale
  para uma área vira regra de caminho em `.claude/rules/` (com `paths:` e
  entrada no `docs_alternativos`), e índice que só serve para localizar sai do
  import.
- A documentação publica um site por branch permanente, e o CAMINHO nomeia o
  AMBIENTE, não a branch (ADR 0073): `main` → `/brabo/prd/`,
  `dev` → `/brabo/dev/` (a `qa` foi aposentada, ADR 0235), com a raiz sendo o índice gerado por
  `scripts/docs/landing.mjs`. O mapa branch→caminho existe num ponto por
  processo (o passo do `docs-deploy.yml`, `DEGRAUS` em `scripts/docs/site/layout.mjs` e
  no `landing.mjs`) — nunca interpole `$GITHUB_REF_NAME` num caminho.
- A versão anunciada em PROSA é verificada por `pnpm docs:check` em DOIS
  arquivos, contra o primeiro `## vX.Y.Z` do CHANGELOG: `README.md` e
  `docs/intro.md` (a primeira página do site). Quem escreve os dois é
  `scripts/ci/readme-version.ts`, no mesmo commit do corte do CHANGELOG —
  cobrar o que o gerador não escreve faria todo release nascer vermelho numa
  PR do bot. Frase alterada sem ajustar o padrão reprova como `CEGO`, de
  propósito.
- Frase ancorada num lugar do CÓDIGO entra em
  `verificarFrasesAncoradasNoCodigo` (`scripts/docs/generate.mjs`) — mesma
  tabela-por-frase das contagens, só que o esperado é DERIVADO do artefato e
  não é um número. Hoje são cinco: a escada da esteira no `description` do
  `branching-policy.md`, derivada de `ESCADA` em `scripts/ci/pr-police.ts`
  (NUNCA de `PROTECTED_BRANCHES`, que tem `rc` de propósito), a frase
  de `db:generate` (`docs/getting-started.md`; o README é só vitrine desde a
  AT-558 e não tem mais detalhe técnico), derivada de
  `apps/api/src/db/schema.ts` ser ou não barrel; e, desde a AT-123, as três
  frases de QUANTAS imagens o produto publica (`THIRD_PARTY_NOTICES.md`,
  `deploy/docs/runbook.md`, `docs/reference/brb.md`), derivadas de `ALVOS` em
  `scripts/ci/images-manifest.ts`. Consequência prática: mudar a
  escada ou desfazer o barrel reprova o `docs:check` até a prosa acompanhar.
  Padrão que para de casar reprova como `CEGO`, e a FONTE sumir também.
  CONTAGEM em prosa cuja fonte é um lugar do código (overrides, perguntas do
  golden-set, operações do contrato de git e da `DockerPort`, abas, tabelas,
  tipos de ação, serviços do compose…) entra em
  `scripts/docs/contagens-do-codigo.mjs` (AT-123) — uma linha por FRASE, um
  extrator por fonte, cada extrator provado por MUTAÇÃO no `.spec.ts` ao lado.
  Número que muda a cada PR (arquivos por app) é DATADO, não derivado.
  As contagens de ADR/RN, o próximo ADR e o recuo de `docs/adr/temas.yml` são
  reescritos pelo `pnpm docs:generate` (AT-399); o `docs:check` só reprova o
  arquivo commitado desatualizado.
  Irmã em `block` desde a AT-122 (nasceu `warn` na AT-096):
  `verificarRefsComSimbolo` confere, nos três arquivos
  de RN, toda ref `` `caminho:N` (`símbolo` `` — e a continuação `` `:N` (`símbolo` ``,
  que herda o caminho do MESMO item — contra o código, ±3 linhas. Só esse
  padrão: ref sem símbolo, par por `/` e símbolo que não é identificador ficam
  de FORA, de propósito (aferição barulhenta é desligada no primeiro mês).
  REPROVA a ref que não bate e a que não resolve a um arquivo só, e ZERO refs
  extraídas é `CEGO` (`veredito` em `refs-com-simbolo.mjs`, provado por
  mutação no spec ao lado). O `warn` não segurou a deriva: a lista zerou em
  26/09 e voltou a 140 em cinco dias. As traduções pt-BR das RNs NÃO são
  aferidas. Ao escrever RN nova, cite `caminho:N` (`símbolo`) — é o que a
  torna conferível. Desde a AT-399 o `pnpm docs:generate` reancora a ref cujo
  símbolo tem ocorrência mais próxima ÚNICA a até 40 linhas
  (`DISTANCIA_MAXIMA_DE_REANCORA`); PR que desloca código citado por RN roda o
  gerador e commita. Ref cujo símbolo sumiu, moveu mais de 40 linhas ou empata
  entre duas ocorrências segue relida pelo símbolo, à mão, nunca por um número
  antigo. NÃO alargue a janela
  para o vermelho sumir, nem estreite o padrão para esconder ref real.
  Desde o ADR 0275 cada irmão confere as próprias refs com símbolo no CI (`refs-com-simbolo.yml`
  do `brabo-ci`); a ref entre irmãos só é listada, e a trava (ADR 0274) segue o portão.
- O runbook termina com a tabela `procedure | anchor | verification |
  schedule` dos procedimentos de OPERAÇÃO (AT-193, EP-015), e o `docs:check` a
  confere em `block` (`scripts/docs/procedimentos-do-runbook.mjs`, provado por
  mutação no spec ao lado): arquivo citado em `verification` que não está no
  git, `make <alvo>` que o `Makefile` não tem, célula vazia ou "see below",
  âncora que não é `{#id}` explícito de cabeçalho, e workflow cujo `on:` não
  tem o gatilho que a classe do segmento afirma (`weekly` → `schedule:`,
  `every PR` → `pull_request`, `every tag` → `push: tags`; `manual` não cita
  workflow). Sem prova, a célula começa com `**None**` — DECLARA, nunca fica
  vazia. Procedimento de operação novo no runbook ganha linha ali; renomear um
  spec ou tirar o `schedule:` de um workflow citado reprova o PR que o fez.
  Desde a AT-549 a fonte do runbook é pt-BR (ADR 0216) e a tabela mora nela; o
  script acha a seção pela âncora `{#procedimentos-e-verificacao}`, nunca pelo
  título, e o cabeçalho da tabela e as classes ficam literais (vocabulário de
  máquina). A cópia em inglês em `docs/i18n/en/` NÃO é conferida.
- O índice de ADR é agrupado por TEMA, e o tema mora FORA do ADR (ADR 0202,
  AT-137): `docs/adr/temas.yml` tem a lista fechada (15 temas) e UM tema por
  ADR. ADR novo ganha a linha dele ali e a linha do índice na seção do tema, em
  ordem numérica, no MESMO PR — o `docs:check`
  (`scripts/docs/temas-de-adr.mjs`, `block`) reprova ADR sem tema, tema fora
  da lista ou sem ADR, e linha na seção errada. O índice é CONFERIDO, nunca
  gerado (as frases são curadas). Tema novo é mudança da lista, justificada no
  PR; passar de 15 exige ADR.
- Variável de ambiente tem ESCOPO no inventário gerado — `produto` (o que o
  operador põe no `.env`) ou `ferramenta` (só CI e quem desenvolve) —, e a
  fonte nova nasce com o dele. Fonte que mora direto numa pasta precisa de
  DOIS globs: `**/` no pathspec do git exige pelo menos um nível de diretório,
  e um inventário que nasce vazio não avisa, passa verde. As fontes moram em
  `scripts/docs/fontes-de-env.mjs`, provadas contra a árvore real pelo spec ao
  lado, e em `e2e/` o `.spec.ts` NÃO é filtrado: ali o spec É o código que lê
  o ambiente (AT-124). Os `deploy/k8s/*.sh` são fonte `ferramenta` desde a
  AT-212, casados SÓ pela expansão com default (`${X:-…}`): `${X}` puro é
  variável do próprio script. E o ⚠️ é PORTÃO desde a AT-211, nas DUAS espécies de
  fonte: o `docs:check` reprova toda variável sem descrição mesmo com o bloco
  regenerado (antes, regenerado, o ⚠️ ficava commitado e passava), nomeando a
  variável, o arquivo que a lê e a seção de `configuration.md` onde escrever
  (`scripts/docs/inventario-de-env.mjs`, provado por mutação no spec ao lado).
  Um `**TODO(humano):**` na linha que cita a variável NÃO reprova, de
  propósito: é lacuna DECLARADA, e reprová-lo empurraria quem não sabe a
  resposta a inventar uma. O ⚠️ do inventário de EVENTOS segue sem reprovar.
- Antes de finalizar: pnpm docs:check e pnpm docs:build verdes (glob
  morto, gerado fora de dia e link quebrado reprovam).
- Nunca inventar conteúdo de doc: sem informação suficiente, use
  > **TODO(humano):** <pergunta específica>.
- Diagramas em Mermaid no próprio Markdown. Nunca imagem de diagrama.
- O mecanismo inteiro está explicado em
  docs/explanation/documentation-workflow.md — leia antes de desligar
  qualquer peça dele.

Pages: o site só responde depois que o dono liga o GitHub Pages (fonte: branch `gh-pages`).
