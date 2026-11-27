# ADR 0300 — O índice de RN é gerado das partes, e o CI de cada repo confere o que cruza a fronteira

- **Status:** proposto (27/11/2026, AT-1029)
- **Data:** 2026-11-27
- **Tema:** `docs`
- **Referencia:** ADR [0287](0287-o-indice-de-adr-e-gerado-e-as-referencias-grandes-viram-indice-mais-partes.md) (este revisa a grade congelada e a regra de citar a parte), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) (este fecha os itens 3 e 4), [0288](0288-link-entre-repos-nas-rns-e-url-do-repo-dono.md) (o link entre repos é a URL do repo dono), [0275](0275-cada-irmao-confere-as-proprias-refs-com-simbolo.md) (as refs internas). Sem RN: é convenção de documentação e de CI.

## Contexto

Em 26/11/2026 a PR do bot `regenera-gerados` (brabo#162) reprovou por quatro causas seguidas, todas criadas por PRs de outros repos e invisíveis no CI deles: número de RN definido em dois repos (RN-1507, 1508, 1516 e 1517), refs `arquivo:linha` para outro repo fora de lugar (46), link de RN de um repo para `parte-NN.md` de outro e página de RN acima do teto de 150 KB. O ADR 0274 já tinha deixado o check de refs no irmão como "AT à parte" (itens 3 e 4).

A grade de âncoras do índice (ADR 0287) era "congelada" e só crescia à mão: a do `api.md` parava na RN-1352 (faltavam 44 RNs; no engine 28, no web 103), e `api.md#rn-N` de uma RN fora da grade abria o índice no topo.

## Decisão

- **A grade do índice de RN é gerada das partes e completa.** `scripts/ci/indice-de-rn.ts` do `brabo-ci` (workflow reutilizável `indice-de-rn`, a partir da v1.6.0) reescreve, em `business-rules/<x>.md`, a tabela (parte, desde, número de RNs, seções `## `) e a grade `<a id="rn-NNN"></a>` de TODA RN de cabeçalho `RN-NNN` das partes `<x>/parte-NN.md`, na ordem das partes. Frontmatter e texto de abertura ficam. Se o índice do repo difere do gerado, o check reprova e sobe o patch `indice-de-rn-patch` (`git apply` na raiz). Isto **revisa o ADR 0287**: a grade deixa de ser "congelada, uma linha por RN que existia na divisão" e passa a ser um superconjunto gerado (nenhuma linha some, porque toda RN da grade antiga está numa parte).
- **Link de RN para OUTRO repo aponta para o índice** (`…/business-rules/<x>.md#rn-N`, na URL do repo dono, ADR 0288), nunca para `parte-NN.md`: assim dividir ou renumerar uma parte não quebra link de fora. A consequência do 0287 "quem cita RN deve citar a parte" passa a valer só dentro do MESMO repo.
  - **O que o `links-das-rns.ts` aplica hoje:** o link relativo `.md` precisa resolver no checkout (existência do arquivo) e, quando traz `#rn-N`, o alvo precisa ter a âncora (`{#rn-N}` ou `<a id="rn-N">`). É o que pega `parte-06.md#rn-935` no engine, RN que é da api.
  - **O que fica como convenção, sem check:** a regra "URL do GitHub para `…/<x>/parte-NN.md#rn-N` de outro repo reprova" (a "regra 3c" do levantamento) NÃO foi implementada, e o `--nova-parte` do `indice-de-rn.ts` também não. Quem cita RN de outro repo escreve a URL do índice; quem estoura uma parte cria a `parte-NN+1.md` à mão e roda `indice-de-rn.ts --escrever`.
- **Peso das páginas de RN medido no repo dono, em Markdown:** o `indice-de-rn` avisa acima de 90 KB (a RN nova já vai para a parte seguinte) e reprova acima de 105 KB (`AVISO_KB` e `TETO_KB`). **Os 105 KB são uma estimativa, não calibrada contra o `docs:build`**: a razão HTML/MD não foi medida para fixar o número. O `orcamento.mjs` do `brabo` (150 KB de HTML por locale) continua sendo a rede e a medida de verdade; se ele reprovar uma parte abaixo de 105 KB, a constante desce.
- **Refs e RN única conferidas no CI do repo que cria a mudança (fecha os itens 3 e 4 do ADR 0274).**
  - `refs-entre-repos`: lê a `dev` dos vizinhos por clone raso, sem credencial. (a) Ref `caminho:N` externa que a PR acrescenta ou muda e não bate REPROVA; a que já estava quebrada só avisa. (b) A PR que move código e quebra ref que batia na base, nas RNs de um vizinho, só AVISA e sobe o `refs-irmaos-patch` para o repo dono da doc.
  - `rn-unica`: a PR que acrescenta um cabeçalho `### RN-NNN` já definido na `dev` de outro repo REPROVA, nomeando número, repo, arquivo e o próximo livre. Citação não conta e a duplicata herdada não trava.
  - Nenhum dos três checks é obrigatório (ADR 0255: só `pr-police` e `escada`).
- **Fica fora:** abrir a PR de conserto no repo dono. Exige um token do App com escrita em todos os repos e PR de bot em cada irmão, o custo que o ADR 0274 (item 3) já adiou. O aviso mais o patch atendem. Também fica fora um registro único de números de RN e a leitura das PRs ABERTAS dos vizinhos: duas PRs abertas ao mesmo tempo não se veem, e a segunda a mergear é a pega.

## Alternativas rejeitadas

- **Manter a grade congelada e completá-la à mão:** voltou a ficar velha em duas semanas.
- **Registro único de números de RN** (arquivo no `brabo-contracts` ou no `brabo-ci`): custa PR e TAG ou repin por RN, mais que o problema.
- **Reprovar a PR do engine por doc da api quebrada:** o autor não é o dono da doc; avisa e entrega o patch.

## Consequências

- A PR que cria qualquer das quatro situações recebe o aviso (ou a reprovação) no PRÓPRIO repo, antes do merge; a PR do bot deixa de ser o primeiro lugar a ver.
- Cada irmão repina o `brabo-ci` e regenera o próprio índice numa PR de dados; `contracts` e `infra` ainda não têm o workflow `refs.yml`.
- A regra de crescimento do 0287 vale como está (RN nova na última parte; estourou, nova parte), agora com aviso em 90 KB.
- Pendências conhecidas: o teto de 105 KB sem calibração, a regra 3c e o `--nova-parte` sem implementação.
