# ADR 0281 — O mapa dos 11 repos tem uma fonte só, o `repos.yml` do `brabo`, e o README é gerado dela

- **Status:** aceito (08/11/2026, decisão do dono, AT-825)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** ADR [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md), ADR 0266, ADR 0271, ADR 0274. AT-825, AT-826 e AT-830. Sem RN: é documentação, não regra do produto.

## Contexto

- A seção "Repositórios do Brabo" estava copiada à mão em 14 lugares (11 READMEs e 3 traduções do `brabo`), com 11 versões diferentes. A linha do `brabo-ci` aparecia em 9 redações.
- O "depende de" era escrito à mão e não era conferido. O levantamento achou 9 divergências entre os READMEs e o que o código usa (por exemplo, o `brabo-ci` dizia não depender de ninguém, mas lê dados do `brabo-qa` e do `brabo`).
- A lista dos repos também mora em 7 lugares de máquina (`clonar-tudo.sh`, `irmaos.lock`, `componentes.json`, `montar-layout.sh` e outros).

## Decisão

- A fonte única é `repos.yml`, na raiz do `brabo`, ao lado de `componentes.json` e `irmaos.lock`. Por repo: `papel`, `proposito`, `como_e_usado` e `depende_de`, em que cada aresta diz o repo, o TIPO (`codigo`, `imagem`, `workflow`, `contrato` ou `doc`) e a `prova` (`arquivo:linha`).
- O bloco "Onde se encaixa" dos READMEs (tabela e Mermaid, com o repo atual destacado) é GERADO entre `<!-- mapa:inicio -->` e `<!-- mapa:fim -->` por `brabo-ci:scripts/ci/mapa-dos-repos.ts`. Ninguém edita o bloco à mão.
- O reutilizável `mapa-alinhado.yml` do `brabo-ci` reprova o README cujo bloco divergiu. Nasce informativo; ligá-lo nos 11 repos é a AT-826.
- Mudou uma dependência: edita-se o `repos.yml` e regenera-se o bloco em cada README.

## Alternativas rejeitadas

- **`brabo-workspace/repos.yml`.** O site não lê o workspace (ele não está no `irmaos.lock`), o que exigiria mexer na trava da ADR 0274, e o `clonar-tudo.sh` (bash 3.2) não lê YAML.
- **`brabo-contracts` por TAG.** Cada mudança do mapa viraria tag do contracts e bump em 10 repos, pesado demais para um dado de documentação.

## Consequências

- O `brabo-ci` passa a ler o `brabo` pela URL raw da `dev` (precedente: `componentes.json` em `contracts-alinhado.ts`); o gerador também aceita um caminho local.
- O site (AT-830) consome o mesmo arquivo.
- A prova mecânica do "depende de" (comparar o declarado com `uses:`, `package.json`, `irmaos.lock` e compose) fica para a parte (b) da AT-825.
