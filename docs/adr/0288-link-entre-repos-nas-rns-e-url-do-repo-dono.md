# ADR 0288 — O link entre repos nas RNs é a URL do repo dono, e o site a devolve para relativo

- **Status:** proposto (09/11/2026, AT-868)
- **Data:** 2026-11-09
- **Tema:** `docs`
- **Referencia:** ADR [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) (as páginas de RN em partes), [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md) (a doc de cada área mora na raiz dela), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) (a trava de SHAs)

## Contexto

- As páginas de RN dos irmãos trazem links relativos herdados do monorepo (`../adr/…`, `api.md`, `produto.md`) para docs que não existem no próprio repo: 1313 links em 8 repos (api 468, ci 280, web 241, engine 167, runner 96, contracts 41, infra 18, broker 2). No site eles resolvem, porque o `montar-layout` junta as raízes; no GitHub dão 404.
- O EP-034 quer os repos como material de estudo para quem os lê no GitHub.
- O `links.mjs` só confere o que resolve dentro do build: link externo sai da conferência.

## Decisão

- **O link de uma RN para um arquivo de outro repo é a URL dele no GitHub, na `dev`:** `https://github.com/viralabs-dev/<repo>/blob/dev/<caminho>#frag`. O mapa raiz para repo dono é a tabela `DONOS` de `scripts/docs/site/repo-dono.mjs` (a mesma do "editar esta página").
- **O site faz o caminho inverso.** `render.mjs:resolverLink` reconhece a URL de uma raiz conhecida (`raizDeUrl`) cuja página existe no layout e a devolve como link relativo interno. Se a página não existe, vira o relativo que não existe, e o `links.mjs` reprova. A cobertura de links do site não muda.
- **A troca é mecânica e se confere.** `scripts/docs/links-para-repo-dono.mjs --repo <área> [--escrever]` reescreve, nas páginas `business-rules/**` (e traduções) da área, só o link `.md` que não resolve no próprio repo e que existe em exatamente uma raiz; alvo em nenhuma ou em mais de uma raiz reprova, e nada é escrito. Reusa o varredor `reescreverLinks` do `partir-rn.mjs`, que não toca cerca nem código em linha.
- **RN nova** cita o arquivo de outro repo já pela URL do repo dono; o link para dentro do próprio repo segue relativo.

## Alternativas rejeitadas

- **URL da página no site `prd`:** o que só existe na `dev` dá 404 até a promoção, e o leitor das traduções cai no pt-BR.
- **Só documentar que a leitura oficial é o site:** os 1313 links continuam 404 no GitHub, e cada RN nova herda o problema.

## Consequências

- Cada irmão roda a ferramenta uma vez e commita só as páginas de RN; o `brabo` precisa entrar antes, senão a subida da trava traz links que o site deixaria de conferir.
- A âncora `#rn-NNN` de uma parte segue sem resolver no GitHub (o cabeçalho tem `{#…}`, que o GitHub não lê); é outro assunto.
- A guarda contra o link relativo novo nas RNs dos irmãos fica para o `brabo-ci`.
