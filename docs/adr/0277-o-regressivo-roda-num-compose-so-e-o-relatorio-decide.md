# ADR 0277 — O regressivo roda num compose só; o grafo mostra cada funcionalidade por uma matrix de exibição, e o relatório é a fonte da decisão

- **Status:** aceito (decisão do dono de 07/11/2026: comentário fixo na PR só quando vermelho)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** complementa o ADR [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md) (o regressivo por funcionalidade) e o ADR [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md) (os Vínculos no Summary). Usa o `resultado.json` do Playwright e a regra de checks do ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md). AT-791, Rodada 253.

## Contexto

O dono pediu que o run do regressivo mostre cada funcionalidade, com o que passou e o que falhou, e que gere um relatório para compor a decisão de aprovar ou não quando houver falha. Hoje o grafo do run tem três caixas, e as specs de todas as funcionalidades caem num único step `Specs do E2E`. O levantamento de 07/11 (AT-791) mediu as opções de visibilidade.

## Decisão

O regressivo continua num compose só, e a visibilidade vem de três partes.

1. **Relatório como fonte.** O `brabo-qa` grava um JSON único (`relatorio-regressivo.json`, versão 1) a partir do `resultado.json` do Playwright. O Markdown do Summary, o texto do check e o comentário saem dele. A recomendação segue a regra de RN-1051.
2. **Grafo por funcionalidade, em matrix de exibição.** Depois do `Rodar o E2E`, um job leve por funcionalidade **com spec executada** (`Funcionalidade · <id> (n specs)`) mostra a linha no grafo. O job não roda compose, não pega token e não faz checkout da PR: lê o resultado que o job anterior passou. Ele sai vermelho se alguma spec falhou. Funcionalidade sem cobertura não vira job. O portão continua no job `fechar`.
3. **Summary, anotações e artefatos.** O Summary tem uma seção por funcionalidade. A spec que falhou vira anotação, pelo reporter `github` do Playwright. O HTML do Playwright sobe num artefato à parte, `relatorio-html-<run>`.

Foram **descartadas** as duas opções que rodam um compose por funcionalidade:

- **(a) matrix com compose por funcionalidade.** Custa cerca de 1m40s fixos por job (setup, cosign, compose de 61 s, Playwright de 22 s). Com 14 funcionalidades no portão, dá cerca de 14 runners e 25 minutos de runner por run, contra 2m30s hoje. Uma spec com duas tags roda duas vezes, o login sofre lockout por IP, e o `fechar` precisaria juntar N resultados. Rever quando as specs passarem de cerca de 10 minutos.
- **(a') sharding (`--shard`).** Divide por arquivo, não por funcionalidade, e portanto não atende o pedido, além de ter o mesmo custo fixo por shard.

## Consequências

- O run ganha cerca de 15 s, mais os jobs de exibição, que duram cerca de 10 s cada.
- Os dados de exibição vêm de um job que roda código de PR. Por isso só servem para mostrar: quem decide é o `fechar`, que sanitiza o que recebe e aplica a recomendação.
- O aceite (`/qa-aceitar`) não apaga mais o resumo do vermelho (RN-1052).
- Spec sem tag `@f-*` aparece como "sem funcionalidade" e nunca some (RN-1053).
- A PR de origem ganha um comentário fixo só quando o run é vermelho. É decisão reversível: basta tirar um step.
- Os limites do Summary (1 MiB por step), do check (65 535 caracteres por campo) e dos job outputs (1 MB por job) entram no desenho: o relatório corta o detalhe das specs verdes primeiro e avisa o corte.

## Referências

- [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md), [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md), [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md).
- Página: [Regressivo por funcionalidade](../explanation/regressivo-por-funcionalidade.md).
- Regras: RN-1051, RN-1052, RN-1053.
