# ADR 0283 — A ADR proposta declara qual ADR substitui (`supersedes`)

- **Status:** aceito (decisão do dono de 08/11/2026, opção b, AT-806)
- **Data:** 2026-11-08
- **Tema:** `agentes`
- **Referencia:** AT-806, AT-804, RN-1058. RN-1069, na doc da `brabo-api`.

## Contexto

Uma ADR mergeada envelhece quando a pergunta que ela cita é respondida depois. No TP-01 27ª o Arquiteto não conseguiu corrigir a ADR e deixou só uma nota.

## Decisão

- A ADR nova declara qual substitui com `supersedes`.
- A api valida a ADR citada: ela é uma `open_adr_pr` do mesmo projeto e está `executed`.
- O engine escreve `Substitui:` na ADR, e a PR leva a mesma linha.
- A ADR substituída não é alterada.
- Uma ADR ainda pendente se corrige recusando e propondo de novo.

## Consequências

- O histórico fica rastreável.
- O engine lê `list_open_questions` e `listar_adrs_propostas` antes de substituir.
- A aba de PRs e ADRs ainda não liga as duas ADRs.

## Referências

- RN-1069, AT-806, AT-804, RN-1058.
