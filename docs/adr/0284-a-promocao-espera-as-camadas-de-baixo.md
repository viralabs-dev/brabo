# ADR 0284 — A promoção `dev → main` espera as promoções das camadas de baixo, e o check infere a ordem

- **Status:** aceito (decisões do dono de 08/11/2026, P1 a P4, AT-788)
- **Data:** 2026-11-08
- **Tema:** `git`
- **Referencia:** revisa a decisão 7 do ADR [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md) (a promoção com `Depende-de` automático, "fase 2"), sem editá-lo, e a regra do pin do `brabo-ci` do ADR [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md) (P4, abaixo). Usa o check `Dependências de merge` do 0276 e o mapa dos repos do ADR [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md). AT-788. As RNs da promoção ficam em `scripts/ci/docs/business-rules/ci.md` do `brabo-ci`, junto das RN-1047 a RN-1050; o número é alocado lá, quando a regra entrar.

## Contexto

O 0276 deixou a ordem de promoção para uma fase 2: o `promote` escreveria uma linha `Depende-de` por promoção aberta dos predecessores. O levantamento da AT-788 mediu que isso não cobre o caso real. Ninguém chama o `promote.yml` hoje: as promoções de 05/11 e 07/11 foram abertas à mão (`gh pr create --base main --head dev`), com corpo livre. E a linha tem um furo: se a promoção do predecessor ainda não foi aberta, não há número para citar, e a PR passaria.

A ordem também tinha sido escrita de cabeça em 07/11. O grafo medido conta só a aresta em que a `main` do consumidor usa um artefato FINAL do produtor. O clone da `dev` de um irmão no CI (engine para api e runner, api para infra) não ordena promoção.

## Decisão

1. **P1, as duas coisas.** O check `Dependências de merge` INFERE a dependência: numa PR de promoção (base `main`, head `dev`, mesmo repo), ele soma às linhas declaradas uma dependência para cada PR de promoção ABERTA dos repos das camadas de baixo. Cobre a PR aberta à mão. E a abertura automática (`promote.yml` e `abrir-pr-de-promocao.sh`) também escreve a linha `Depende-de` no corpo, como o 0276 previa. O título do check já mostra o resultado (`esperando viralabs-dev/brabo-ci#N`). O re-check no merge de uma promoção e o cron horário passam a incluir as promoções abertas das camadas seguintes.
2. **P2, amarelo até promover.** Um repo de baixo com a `dev` à frente da `main` e SEM promoção aberta também deixa a promoção de cima amarela (pendente), até ser promovido. O check é exigido na `main` (0276), então a espera segura o merge do dono. Isso fecha o furo do 0276.
3. **P3, as camadas medidas.**

   | Camada | Repos | Por quê (aresta de versão) |
   |---|---|---|
   | 0 | `brabo-ci` | os outros 10 pinam o `brabo-ci`, e a `main` só aceita versão final (0280) |
   | 1 | `brabo-contracts`, `brabo-workspace` | api, web, runner, broker e qa usam o pacote; o infra usa a `ref`. O workspace só depende do ci |
   | 2 | `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-runner`, `brabo-broker` | o portão da `main` exige a tag final de cada componente |
   | 3 | `brabo-infra` | o compose e o portão usam os componentes |
   | 4 | `brabo-qa` | o E2E roda as imagens dos componentes e do infra |
   | 5 | `brabo` | o `componentes.json` pina as finais, e o `release.yml` clona o infra |

   A lista mora no `brabo-ci` (`CAMADAS_DE_PROMOCAO`), com spec que confere que a união das camadas é o `REPOS` e sem repetição.
4. **P4, o `pins-do-brabo-ci` isenta o próprio `brabo-ci`.** Na promoção dele, o pin dele mesmo seria sempre `-dev.N` (a final só nasce no merge, pelo `tag-release`), e a regra do 0280 nunca ficaria verde. O `brabo-ci` roda o próprio código de qualquer jeito, então a regra não cobra o pin do `brabo-ci` nele mesmo. Os outros 10 consumidores seguem o 0280 sem mudança.
5. **O ritual de promoção:** (1) promover o `brabo-ci` (o merge do dono gera a `vX.Y.Z` pelo `tag-release`); (2) repinar os 10 consumidores na final, uma PR para a `dev` em cada; (3) abrir as outras promoções, que já nascem esperando as de baixo. O check ordena os passos 1 e 3. O passo 2 é cobrado pelo `pins-do-brabo-ci`, e a PR de promoção, de head `dev`, recebe o repin sozinha.

## Consequências

- A ordem sai do código e vira lista testada, legível no título do check, sem depender de quem abre a PR nem de memória.
- O `runner` desce para a camada 2 e o `workspace` sobe para a 1, diferente da ordem de 07/11: nada consome a `main` do runner antes do `brabo`, e o workspace só depende do ci. Tira uma espera inútil.
- O amarelo por `dev` à frente (P2) tem custo: um agente que mergeia na `dev` de um repo de baixo segura a promoção de cima até esse repo ser promovido. Foi o que o dono quis, e vale como lembrete de promover.
- A inferência pede até 10 chamadas de API por avaliação de promoção.
- A entrega da inferência e a do pin único pegam carona no repin da release final (o chamador roda o script do SHA pinado), sem PR extra nos 11 repos.
- Fora de escopo: o teste que confere `CAMADAS_DE_PROMOCAO` contra o `repos.yml` (ADR 0281) entra com a AT-825.

## Referências

- [0276](0276-a-pr-declara-de-que-pr-depende-o-merge.md), [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md), [0281](0281-o-mapa-dos-repos-tem-uma-fonte-so.md).
- AT-788 (levantamento de 08/11 e decisões do dono), AT-787 (o check), AT-817 (o repin da release final), AT-825 (o `repos.yml`).
