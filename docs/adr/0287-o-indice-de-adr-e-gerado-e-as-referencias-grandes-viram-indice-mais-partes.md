# ADR 0287 — O índice de ADR é gerado, e a referência grande vira índice mais partes

- **Status:** proposto (08/11/2026, AT-862)
- **Data:** 2026-11-08
- **Tema:** `docs`
- **Referencia:** ADR [0202](0202-o-indice-de-adr-por-tema.md) (o índice por tema; este revisa o item 2), [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) (a RN mora na área dona), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) (os gerados leem os irmãos), [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) (locales)

## Contexto

- Quem procura uma decisão, uma regra de negócio ou uma variável chegava a páginas de centenas de KB: o índice de ADR (299 KB de Markdown, 395 KB de HTML), a página de RN da api (1,1 MB de HTML), as do engine e do web (cerca de 670 KB cada) e a `configuration` (176 KB). O menu lateral levava, em toda página, a árvore das 280 decisões (44 KB), mesmo recolhida.
- O índice de ADR era curado à mão (ADR 0202, item 2: "conferido, não gerado"). Cada linha era uma frase de 60 a 4 700 caracteres, e a frase envelhecia (o texto dizia "dos 61" com 280 ADRs).
- As âncoras `#rn-NNN` são contrato: milhares de links, de dentro e de fora do repo (`ancoras-de-rn.mjs`), e as URLs publicadas são externas.
- A busca cortava cada página em 4 000 caracteres e não indexava títulos de seção: não achava variável nem RN pelo nome.

## Decisão

- **O índice de ADR é gerado.** `docs/adr/index.md` tem o bloco `indice-de-adr`, escrito por `pnpm docs:generate` a partir de `temas.yml` (tema e ordem), do `# ADR NNNN — <título>` de cada ADR e do status (a seção `## Status` ou a linha `- **Status:**`; sem elas, aceito). É uma tabela compacta por tema (número, título, status), com filtro por tema e por status. O texto completo fica no ADR. Isto **revisa o item 2 do ADR 0202** (o resto do 0202 vale: o tema mora fora do ADR, o `docs:check` confere). Os títulos e descrições dos temas nas outras línguas moram no `i18n:` de cada tema em `temas.yml`.
- **A página de RN de cada área vira índice mais partes.** `business-rules/<x>.md` continua no mesmo caminho e vira o índice da área; as RNs vão para `business-rules/<x>/parte-NN.md`, cortadas por faixa nas fronteiras de `## ` (e de `### RN-` quando um `## ` passa do orçamento), com cerca de 90 KB de Markdown por parte. A faixa, e não o domínio, porque os `## ` são ondas cronológicas e classificar 830 RNs à mão não é mecânico nem reversível. O nome é `parte-NN.md`, e o título diz "desde RN-NNN", para a última parte poder crescer sem renomear.
- **A grade de âncoras congelada é o contrato.** O índice da área guarda uma linha `<a id="rn-NNN"></a>[RN-NNN](<x>/parte-NN.md#rn-NNN)` por RN que existia na divisão. O `links.mjs` prova os dois lados: o link antigo acha o `id` no índice, e a grade acha o `{#rn-NNN}` na parte. O `business-rules.md` do `brabo` segue o mesmo molde: uma grade compacta de números, por baixo de um índice por domínio.
- **O runbook do infra segue o molde, cortado por tema (AT-869).** `deploy/docs/runbook.md` não tem RN nem tradução, e quem opera procura por tema, não por faixa: ele vira o índice (triagem, tabela de procedimentos e a grade `<a id>` congelada) e as partes moram em `deploy/docs/runbook/<tema>.md`, cortadas nas fronteiras de `## `. O gerador, o check de procedimentos e o menu leem os dois layouts (arquivo único ou índice mais partes); o menu mostra a categoria "Manual de operação".
- **Redirecionamento no navegador.** Cerca de 5 linhas no `site.js` levam `…/<x>.html#rn-NNN` à parte certa: se o `#hash` aponta para um `<a id>` vazio cujo vizinho é um link com o mesmo hash para outra página, `location.replace`. Sem JS, a pessoa vê o índice com o link. Links novos apontam direto para a parte.
- **Teto por locale.** Nenhuma página gerada passa de 150 KB de HTML, em nenhum dos 4 locales (o `ru` é o pior). `orcamento.mjs` roda no `docs:build`. Página do `brabo` acima do teto reprova, salvo a lista `PENDENTES` com dono, que só encolhe. Página de RN dos irmãos só AVISA até a divisão chegar a cada irmão (rodada B da AT-862); depois ela passa a reprovar.
- **Menu enxuto.** Categoria recolhida que tem página própria e não contém a página atual sai como link, sem os filhos (recolher com `<details>` não tira bytes do HTML). Dentro dela a árvore abre.
- **Regra de crescimento.** RN nova entra na ÚLTIMA parte da área; quando ela estoura o orçamento, o autor roda `node scripts/docs/partir-rn.mjs` (que só acrescenta partes e nunca renumera) ou cria a `parte-NN+1.md`. Variável nova nasce no inventário gerado, com a âncora `{#env-NOME}`.
- **A busca indexa títulos de seção e âncoras** de variável, além do texto cortado: RN e variável se acham pelo nome.

## Alternativas rejeitadas

- **Reescrever os links `#rn-NNN`** (cerca de 6 000 trocas em 6 repos): quebra a URL publicada e conflita com toda PR aberta.
- **Cortar por domínio.** Exige classificar as RNs à mão, e as ondas são o contexto de cada decisão.
- **Frase curada por ADR.** É o que envelheceu; o título do ADR é a fonte única.
- **Teto só aviso para todas as páginas.** Sem reprovar, a página volta a crescer.

## Consequências

- O índice de ADR cai de 395 KB para algumas dezenas de KB, e o menu de 55 KB para cerca de 11 KB.
- A divisão das páginas de RN dos irmãos é mecânica e se confere sozinha (mesmos `{#rn-}` antes e depois, toda âncora da grade existe numa parte, nenhuma parte passa do orçamento). Cada irmão roda o script uma vez, numa PR dele.
- Quem cita RN deve citar a parte (`business-rules/<x>/parte-NN.md#rn-NNN`); o link antigo segue valendo pela grade e pelo redirecionamento.
- O `ru` e o `zh-Hans` pesam mais por byte; é por isso que o teto se mede em todo locale.
- Custo: um gerador a mais para manter (`indice-de-adr.mjs`, `partir-rn.mjs`) e a grade congelada, que não pode perder linha.
- Cada RN da parte leva `<a id="rn-NNN"></a>` antes do título (AT-871), porque o GitHub não gera id de `{#rn-NNN}` e o link `parte-NN.md#rn-NNN` abria a parte no topo. O `render.mjs` tira essa âncora do HTML do site (o título já tem o id); `ancorar-rn.mjs` migra as partes existentes.
