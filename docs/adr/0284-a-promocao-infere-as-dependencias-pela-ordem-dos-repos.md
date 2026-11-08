# ADR 0284 — A promoção infere as dependências pela ordem dos repos

- **Status:** aceito (decisão do dono de 08/11/2026, AT-788)
- **Data:** 2026-11-08
- **Tema:** `git`
- **Referencia:** revê a decisão 7 do ADR [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) (o `promote` escreveria o `Depende-de`), sem editá-lo, e usa o mapa dos repos do ADR [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md). RN-1071 e RN-1072, em `scripts/ci/docs/business-rules/ci.md` do `brabo-ci`. A isenção do `brabo-ci` no pin (decisão 7) complementa o ADR [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) sem editá-lo.

## Contexto

O ADR 0276 previa que o `promote` escrevesse o `Depende-de` na PR de promoção. Na prática, ninguém chama o `promote.yml`: as promoções são abertas à mão, com corpo livre. A linha escrita só na abertura não cobre esse caso, e deixa o furo de "a promoção anterior ainda não foi aberta", em que não há número para citar.

## Decisão

1. **O check `Dependências de merge` infere.** Numa PR com base `main` e head `dev`, ele soma às linhas declaradas as promoções abertas dos repos das camadas anteriores.
2. **A abertura automática (`promote.yml` e `abrir-pr-de-promocao.sh`) TAMBÉM escreve a linha `Depende-de`.**
3. **Camada anterior com a `dev` à frente da `main` e nenhuma promoção aberta:** o check fica amarelo e diz qual repo promover.
4. **As camadas.** Só conta a aresta em que a `main` do consumidor usa um artefato final do produtor (o clone da `dev` de um irmão no CI não ordena promoção):

   | Camada | Repos |
   |---|---|
   | 0 | `brabo-ci` |
   | 1 | `brabo-contracts`, `brabo-workspace` |
   | 2 | `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-runner`, `brabo-broker` |
   | 3 | `brabo-infra` |
   | 4 | `brabo-qa` |
   | 5 | `brabo` |

5. **A ordem vive na constante `CAMADAS_DE_PROMOCAO` do `brabo-ci`,** testada contra o `REPOS`. Quando houver teste com o `repos.yml` (ADR 0281), ele confere as duas listas.
6. **O merge de uma promoção e o cron horário reavaliam as camadas seguintes.**
7. **O `pins-do-brabo-ci` não cobra o pin do brabo-ci quando o repo chamador é o próprio `viralabs-dev/brabo-ci`;** isso complementa o ADR 0280 sem editá-lo. Ele roda o próprio código de qualquer forma, e a tag final só nasce no merge da promoção dele. Só esse repo é isento.

## Consequências

- Vale também para a PR aberta à mão.
- Quem promove vê "esperando viralabs-dev/brabo-ci#N".
- Se a dependência for fechada sem merge, a linha escrita na abertura passa a dar "fechada sem merge" e tem de ser tirada.
- O check chega aos 11 repos pelo repin único da AT-817.
- O `runner` desce para a camada 2 e o `workspace` sobe para a 1, em relação à ordem de 07/11: nada consome a `main` do runner antes do `brabo`.

## Referências

- RN-1071, RN-1072, ADR 0276 (decisão 7), ADR 0281.
- AT-788 (levantamento e decisões do dono), AT-787, AT-817.
