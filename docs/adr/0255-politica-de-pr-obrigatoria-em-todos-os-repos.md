# ADR 0255 — A política de PR é obrigatória em todos os repositórios e a PR de regeneração do bot dispensa a escada na dev

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `git`
- **Referencia:** os ADRs [0236](0236-o-dependabot-dispensa-revisao-na-dev.md) e [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md), e as atividades AT-726 e AT-733. Nenhum deles é editado.

## Contexto

Com a separação em repositórios (0252), os checks `Política de branches` e `Escada de aprovação` só sinalizavam: nenhum ruleset os exigia, então uma PR vermelha neles ainda podia ser mergeada. Três repositórios (`brabo`, `brabo-qa`, `brabo-infra`) nem tinham ruleset contra force push. E a PR que o GitHub App `viralabs-dev-brabo` abre por agenda para regenerar os gerados (AT-726) esperaria aprovação humana a cada 6 h. Decisões do dono de 05/11/2026.

## Decisão

1. **`Política de branches` e `Escada de aprovação` são checks REQUIRED** no ruleset de `dev` e `main` dos 11 repositórios `viralabs-dev/brabo*`.
2. **`brabo`, `brabo-qa` e `brabo-infra` ganham o ruleset "main e dev sem force push"**, que os demais já tinham.
3. **A PR do GitHub App `viralabs-dev-brabo` na branch fixa `chore/regenera-gerados` com destino `dev` dispensa a escada**, reconhecida por autor E branch (as duas), no molde do ADR 0236. A `main` continua com a escada inteira.

## Consequências

- PR que reprova a política ou a escada deixa de poder ser mergeada em qualquer repositório do conjunto.
- Os gerados regenerados chegam à `dev` sem espera humana; os outros checks da `dev` seguem sendo a revisão, e a promoção para a `main` continua exigindo aprovação.
- Autor ou branch isolados não bastam para a dispensa.
