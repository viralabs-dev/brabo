# ADR 0274 — Os gerados do `brabo` leem os irmãos por uma trava de SHAs

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `docs`
- **Referencia:** revisa a consequência "o `docs-check` compara com a `dev` dos irmãos" do `montar-layout.sh` (AT-726) e complementa o ADR [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md). Usa a dispensa da escada do ADR [0255](0255-politica-de-pr-required-nos-11-repositorios.md). AT-780, Rodada 233.

## Contexto

O `montar-layout.sh` clonava a ponta da `dev` de cada irmão na hora do run. A mesma PR, sem commit novo, mudava de verde para vermelho quando um irmão fazia merge (cerca de 56 merges por dia nas `dev` dos nove irmãos). `scripts.md`, o índice de RN, a contagem de RN em prosa e as refs com símbolo reprovaram 9, 9, 6 e 10 runs em duas semanas, em PRs que não tocavam nada disso.

## Decisão

1. **`irmaos.lock` na raiz do `brabo`**, versionado: uma linha `<repo> <sha40>` para cada um dos nove irmãos; `#` é comentário.
2. **Precedência no `montar-layout.sh`:** `BRABO_REF` explícito vence a trava (deploy da `main`, release, "ver a `dev` de agora"); sem ele, vale o SHA da trava. Repo faltando, SHA inválido, repo que não é irmão ou SHA ausente reprovam (exit 1). O clone remoto busca por SHA (`git fetch --depth 1 origin <sha>`).
3. **Quem sobe a trava é o `regenera-gerados.yml`** (agendado, `git ls-remote` da `dev`), no mesmo commit dos gerados. A PR do bot dispensa a escada (ADR 0255); o merge segue humano. O gatilho por `repository_dispatch` em cada irmão fica como evolução, se o atraso (até 6 h) doer: custaria 8 PRs de repin no `brabo-ci`, cerca de 56 runs por dia e um token com escrita no `brabo` em cada irmão.
4. **Refs com símbolo de arquivo de irmão** são conferidas na subida da trava: o bot reancora, separa o que é de irmão e reprova nomeando o repo dono, com o patch como artefato. Só a PR do bot fica vermelha, e a trava fica parada até o irmão consertar. O check no próprio irmão é AT à parte.
5. **Deploy:** o degrau `dev` do `docs-deploy` usa a trava, e `irmaos.lock` entra no `paths:`, então a subida republica o `/dev/`. O degrau `main` mantém `BRABO_REF=main`, porque a trava aponta SHAs da `dev` dos irmãos.
6. **O SHA de cada irmão fica em `.git/irmaos-sha.lst`** (`owner/repo@sha`, uma linha por irmão), para a action `vinculos` do `brabo-ci` (AT-773).

## Consequências

- A PR humana do `brabo` passa a ser verde ou vermelha só pelo próprio diff.
- A deriva que um irmão introduziu aparece na próxima subida da trava, na PR do bot, e não mais em PR alheia.
- Uma PR do `brabo` que dependa de mudança recente num irmão espera a subida (ou dispara o `regenera-gerados` à mão).
- O `docs:check` local passa a bater com o CI; `BRABO_REF=dev` mostra o estado de agora.

## Referências

- [0255](0255-politica-de-pr-required-nos-11-repositorios.md), [0273](0273-a-paridade-de-traducao-mede-so-a-doc-do-brabo.md).
