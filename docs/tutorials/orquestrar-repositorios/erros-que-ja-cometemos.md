---
title: Erros que já cometemos
description: Nove lições curtas, cada uma com o sintoma, a causa e a regra que ficou, tiradas dos repositórios do Brabo e dos ADRs públicos.
---

# Erros que já cometemos

**Para quem é:** quem quer evitar o caminho mais caro.

**Depois de ler, você consegue:** reconhecer nove armadilhas de um conjunto de repositórios antes de cair nelas. Cada lição se explica sozinha e aponta para a fonte pública.

## 1. Copiar a lista de repositórios à mão
- **Sintoma:** a seção "Repositórios do Brabo" estava em 14 lugares, com 11 versões diferentes. O README do `brabo-ci` dizia que ele não dependia de ninguém, mas ele lê dados de dois outros repositórios.
- **Causa:** cópia sem fonte única nem conferência.
- **A regra que ficou:** uma fonte (`repos.yml`), o resto é gerado, e um check reprova o que divergir. [ADR 0281](../../adr/0281-o-mapa-dos-repos-tem-uma-fonte-so.md).

## 2. Ler a `dev` dos irmãos "de agora"
- **Sintoma:** a mesma PR, sem commit novo, passava de verde a vermelho. Eram cerca de 56 merges por dia nas `dev` dos irmãos.
- **Causa:** o gerador de documentação clonava a ponta da `dev` de cada irmão na hora.
- **A regra que ficou:** ler os irmãos por uma trava de SHAs, que só um bot sobe. [ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md).

## 3. Medir a tradução de todo mundo
- **Sintoma:** 19 das 28 PRs vermelhas em duas semanas não tinham culpa do que mudaram.
- **Causa:** a paridade de tradução somava a documentação de todos os repositórios, então um merge alheio mudava o total.
- **A regra que ficou:** cada repositório mede só a própria documentação. [ADR 0273](../../adr/0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md).

## 4. Deixar a ordem de merge na cabeça de alguém
- **Sintoma:** a `dev` da infra ficou vermelha entre dois merges em repositórios diferentes.
- **Causa:** o GitHub não tem dependência entre repositórios, e a ordem não estava escrita em lugar nenhum.
- **A regra que ficou:** a PR declara `Depende-de: dono/repo#N` e um check espera; na promoção, a ordem é inferida das camadas. [ADR 0276](../../adr/0276-a-pr-declara-de-que-pr-depende-o-merge.md) e [ADR 0284](../../adr/0284-a-promocao-infere-as-dependencias-pela-ordem-dos-repos.md).

## 5. Pin da política sem versão legível
- **Sintoma:** 5 SHAs diferentes entre 11 repositórios, e pins congelados sem aviso.
- **Causa:** o comentário do pin dizia `# dev` ou nada, e o Dependabot só atualiza pin cujo comentário é uma versão.
- **A regra que ficou:** o comentário é `vX.Y.Z`, o SHA é o da tag, e um check confere. [ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md).

## 6. Empurrar tag ou abrir PR com o `GITHUB_TOKEN`
- **Sintoma:** a PR de promoção chegava a "mergeável" sem o check de promoção ter rodado, e a tag nunca publicou a Release.
- **Causa:** o GitHub não dispara workflow a partir de eventos criados pelo `GITHUB_TOKEN`.
- **A regra que ficou:** o que precisa disparar outro workflow usa o token de um GitHub App. [Lições do CI, nº 3](../../explanation/licoes-do-ci.md).

## 7. Pôr `if:` num job exigido
- **Sintoma:** o check ficava verde depois de a base da PR mudar.
- **Causa:** o status é indexado por commit e nome; um job pulado deixa o verde antigo colado, e `skipped` conta como verde.
- **A regra que ficou:** o job exigido sempre roda, e o filtro vai dentro dele. [Lições do CI, nº 2](../../explanation/licoes-do-ci.md).

## 8. Pin do produto atrás da última Release
- **Sintoma:** o produto ficou com a tag sem Release, duas vezes seguidas (v2.1.0 e v2.1.1).
- **Causa:** um componente soltou Release entre o merge na `main` e o carimbo, e a trava reprovou.
- **A regra que ficou:** um bot sobe a pin, e a saída é mergear a PR dele e deixar sair um patch do produto. [Release do produto](../../explanation/release-do-produto.md).

## 9. Reescrever o lock inteiro ao subir um contrato
- **Sintoma:** o CI do `brabo-broker` quebrou depois de subir a versão do contrato.
- **Causa:** o `pnpm install` regenerou o lock inteiro, e não só as entradas do contrato.
- **A regra que ficou:** o script de subida enxerta no lock antigo só os blocos do contrato e recusa o resto. [`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh).

> **Para o seu projeto:** o padrão das nove lições é o mesmo. O que não é gerado ou conferido por máquina, desvia. Antes de dividir, decida qual check vai cobrar cada aresta.

Voltar ao [início da trilha](index.md).
