# ADR 0271 — Cada run do Actions mostra os vínculos entre os repositórios

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `engenharia`
- **Referencia:** complementa o ADR [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md) (o dispatch do gatilho para o `brabo-qa`) e o ADR [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) (o `.git/irmaos-sha.lst`). AT-773, decisões do dono de 06/11/2026.

## Contexto

Com o Brabo em onze repositórios, ficou difícil ver, num run do Actions, quem de fato o disparou ou quem tem vínculo com aquela rodada. Nenhum workflow tinha `run-name`, nenhum Summary dizia a origem nem o SHA dos irmãos, o check publicado pelo App só apontava para o run do `brabo-qa` no fechamento, e o run de origem nunca recebia o link do run que ele disparou. O vínculo existia só no código: no payload do dispatch e nos `ref: dev` dos checkouts.

## Decisão

1. **Uma action única, `vinculos`, no `brabo-ci`** (`.github/actions/vinculos`, script `scripts/ci/vinculos.ts`). Escreve no topo do Summary de cada job a tabela `## Vínculos` (origem, irmãos `repo@SHA`, destino e runs disparados, com links) e um diagrama Mermaid. Grava `vinculos.md` para o alarme e o resumo do check reaproveitarem. Entradas: `origem` (JSON, vazio é o próprio run), `irmaos` (caminho de checkout ou `owner/repo@sha`), `destino` e `disparados`.
2. **O helper nunca reprova um job.** O step leva `continue-on-error`. Todo valor passa por regex antes de entrar (repo `viralabs-dev/brabo(-x)?`, SHA de 40 hex, PR numérica, URL do GitHub da organização, ator); o que não casa vira `?` e um `::warning::`, nunca entra no Markdown nem no Mermaid. A `origem` inválida é só descartada, com aviso. Se o Summary não renderizar o Mermaid, é limite da plataforma: a tabela continua e o bloco aparece como código.
3. **`run-name` com a origem no workflow de destino.** O `run-name` de um reutilizável é ignorado, o nome vem do chamador. No `brabo-qa` o `e2e-pr.yml` vira `E2E ← <repo>#<pr> · <sha> · <ator> · c=<correlação>`; os runs de tag viram `release <tag> ← tag do carimbo`. PR e push já têm o título da PR ou do commit; só ganham `run-name` os runs cujo gatilho esconde a origem (dispatch, agenda, tag).
4. **Correlação `c=<run_id>-<attempt>`.** O `repository_dispatch` responde 204 sem id e o `client_payload` não aparece na API de runs. O gatilho manda `origem.correlacao` no payload; ela entra no `run-name`; depois do dispatch o `qa-e2e-disparar.ts` consulta os runs do `brabo-qa` e casa o `display_title` com `c=<correlação>`, a cada 5 s, por até 60 s. Achou, registra o run em `disparados`; não achou, registra o link do check e um aviso. O `attempt` torna a correlação única por re-run.
5. **Link de volta pelo check.** Um job `anunciar`, sem `needs` e em paralelo ao `e2e`, atualiza o check do App para apontar para o run do `brabo-qa` desde o início (`details_url` e resumo), com o token do App só com `checks: write`. O `fechar` mantém o `details_url` no fim e anexa os Vínculos. Se o `anunciar` falhar, só avisa.
6. **A origem de um run disparado por tag vem da tag.** O `tag-release` do `brabo-ci` grava a linha `Carimbo: <url do run do carimbo>` na mensagem da tag anotada, e o `vinculos` a lê (`git for-each-ref refs/tags/<tag> --format='%(contents)'`). O carimbo não procura o run que disparou: a tabela mora no run disparado.
7. **No `brabo`** o `montar-layout.sh` já grava `.git/irmaos-sha.lst` (ADR 0274); o `docs-check`, o `docs-deploy`, o `docs-audit` e o `regenera-gerados` o passam à action. O `release.yml` passa o `infra` por caminho e a origem pela tag. Os chamadores fixam o `brabo-ci` em `13f3697aaf3e4a151637755babb58422a44db303`.

## Consequências

- Todo run que lê outro repositório mostra, no primeiro bloco do Summary, quem o originou e quais SHAs de irmãos usou, sem abrir o código.
- Um payload antigo, sem `origem`, gera campos vazios e não quebra nada.
- O alarme (`alarmar-prova.sh`) anexa o `vinculos.md` ao corpo da issue quando existir.
- As provas ao vivo (run do `brabo-qa` com nome e tabela, check apontando para o qa, `← tag do carimbo`) dependem de o App ter `checks: write`, gesto do dono, e rodam na mesma PR `dev → main` das provas do ADR 0267.

## Referências

- [0267](0267-o-e2e-do-brabo-qa-e-portao-da-main.md), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md).
