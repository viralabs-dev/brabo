# ADR 0278 — A mudança é vista num painel do brabo-ci, sem check nas PRs

- **Status:** aceito (decisão (b) do dono, AT-792)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** complementa o ADR [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) (os Vínculos entre os runs) e o ADR [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md). Explicação em [painel da mudança](../explanation/painel-da-mudanca.md). Origem: AT-792.

## Contexto

As runs de uma mudança se espalham por 7 a 11 repositórios. O vermelho depois do merge (o `release v2.1.1`, de 07/11) só aparecia para quem abria o `brabo`, e ninguém via a mudança inteira num lugar só.

## Decisão

- Um run `Painel da mudança` no `brabo-ci`, acordado por `repository_dispatch` pelo reutilizável de dependências, com a chave igual ao componente do `Depende-de`.
- O Summary traz uma tabela por repo e um diagrama Mermaid.
- O link de volta vai nas runs de origem, pelos Vínculos (`linhaDoPainel`, RN-1055).

## Alternativas descartadas

- **Check agregado nas PRs** (opção (b) do dono): faz menos ruído e evita um check verde que descreve um vermelho de outro repo. Além disso, `in_progress` ou `neutral` travariam o vigia e o merge.
- **Página no site:** exige um commit por atualização, e a API sem token estoura em 60 req/h.
- **Issue fixo:** perde o histórico e colide com a regra "issues viram atividade".

## Consequências

- O Summary não é ao vivo; aparece só no fim do run.
- Não é preciso `checks: write`.
- O remetente precisa de `contents: write`, e só no `brabo-ci`.
- A Rodada B da AT-787 repina os consumidores no SHA do merge desta AT.
