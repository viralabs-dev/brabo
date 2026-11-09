# ADR 0285 — A prova de uma aresta do `repos.yml` é arquivo mais trecho literal, não arquivo:linha

- **Status:** aceito (08/11/2026, AT-848)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** ADR [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md), que continua aceito e cujo formato de `prova` este ADR substitui. AT-825 (parte b) e AT-848. Sem RN: é documentação, não regra do produto.

## Contexto

- O ADR 0281 fixou a `prova` de cada aresta como `arquivo:linha`. A prova mecânica (`brabo-ci:scripts/ci/arestas-dos-repos.ts`, AT-825 parte b) achou 34 das 68 arestas desalinhadas no dia em que nasceu: 33 provas fora da linha e 1 aresta que faltava (`brabo → brabo-contracts`).
- O número da linha deriva a cada commit num irmão (uma chave nova no `componentes.json`, um passo a mais no `ci.yml`). Corrigir à mão a cada vez não se sustenta, e o check vermelho passaria a avisar de coisa que não mudou.
- Provar só o arquivo seria verde demais: o bloco gerado "Onde se encaixa" cita os 11 repos em todo README.

## Decisão

- A `prova` passa a ser `{ arquivo, trecho }`: o caminho do arquivo no repo que declara a aresta e um TRECHO LITERAL de uma linha (sem regex e sem quebra de linha) que aparece nele. Exemplo: `prova: { arquivo: componentes.json, trecho: '"repo": "viralabs-dev/brabo-api"' }`.
- O número da linha nunca é gravado. A prova o calcula na hora e o log o mostra (`componentes.json:6`).
- O trecho tem de citar o destino da aresta (mesmo critério de nome e apelido do formato antigo), para a prova seguir dizendo POR QUE aquilo é a aresta.
- O trecho não vale dentro do bloco gerado `<!-- mapa:inicio -->` … `<!-- mapa:fim -->`.
- Trecho que sumiu é mudança real da dependência: corrige-se o trecho (ou a aresta) no `repos.yml`, sem caça a número de linha.
- O `brabo-ci` aceita os dois formatos na transição (o antigo, obsoleto); o `repos.yml` já usa só o novo. Tirar o antigo é uma PR à parte no `brabo-ci`.
- O `arestas-alinhadas.yml` ganha chamador no `brabo` (semanal e `workflow_dispatch`), para a prova rodar de fato. É informativo.

## Alternativas rejeitadas

- **Arquivo mais símbolo ou chave (JSON path).** Cobriria só os ~45 arestas em JSON e YAML; `clonar-tudo.sh`, `irmaos.lock`, `.sh` e `.ts` ficam sem chave, e o plano B seria o trecho literal. Exigiria dois parsers.
- **Só o arquivo.** Nunca quebra, nem quando devia: passaria quase tudo.
- **Manter `arquivo:linha` com janela de ±3 linhas** (molde de `refs-com-simbolo`). Detecta a deriva, mas não deixa de depender do número.

## Consequências

- Uma linha inserida no topo do arquivo citado mantém a prova verde (provado por mutação no spec do `brabo-ci`).
- A aresta `brabo → brabo-contracts` (`contrato`, pela pin `contracts` do `componentes.json`) entra no mapa; os blocos "Onde se encaixa" dos 11 READMEs mudam e o `mapa-alinhado` de cada irmão fica vermelho até o README ser regenerado.
- Quem lê o `repos.yml` acha a dependência com `grep -F '<trecho>' <arquivo>`.
