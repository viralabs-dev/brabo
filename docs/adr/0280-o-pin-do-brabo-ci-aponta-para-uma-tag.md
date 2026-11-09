# ADR 0280 — O pin do brabo-ci nos consumidores aponta para uma tag, e a branch decide qual

- **Status:** aceito (08/11/2026, decisão do dono, AT-817)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** ADR [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md), ADR 0159, ADR 0236. AT-816, AT-819 e AT-827. Sem RN: é CI, não regra do produto.

## Contexto

- Os pins `uses: viralabs-dev/brabo-ci/...@<sha>` usavam comentários como `# dev`, `# feature/x` ou nenhum. O Dependabot só atualiza pin cujo comentário é uma versão, então os pins congelavam sem aviso.
- Havia 5 SHAs diferentes entre os 11 repos, e nada conferia que o comentário correspondia ao SHA.

## Decisão

- O comentário do pin tem a forma `vX.Y.Z` ou `vX.Y.Z-dev.N`, e o SHA é o da tag citada.
- Na `dev` do consumidor, o pin pode apontar para uma tag `-dev.N`. Na `main`, só para uma release final.
- A promoção `dev → main` de cada consumidor troca o pin `-dev.N` pela release final.
- A regra é o job informativo `pins-do-brabo-ci` do reutilizável `cadeia.yml` (`scripts/ci/pins-do-brabo-ci.ts`). Ele recebe a branch alvo e roda nos consumidores pelo `ci.yml`.

## Alternativas rejeitadas

- **(a) Só versão final em `dev` e `main`.** Uma correção do brabo-ci só chegaria aos consumidores depois da promoção do próprio brabo-ci.
- **(c) `-dev.N` em qualquer branch.** A `main` rodaria código que só existe na `dev`.

## Consequências

- O brabo-ci passa a ser testado cedo nos consumidores.
- A promoção ganha um passo, e a regra o cobra.
- O Dependabot subir um `-dev.N` para o próximo ainda não foi medido. O `ci_ref` continua à mão.
- A regra nasce informativa e vira obrigatória depois do repin dos 11 repos.
