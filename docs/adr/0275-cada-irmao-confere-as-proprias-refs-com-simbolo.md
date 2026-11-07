# ADR 0275 — Cada irmão confere as próprias refs com símbolo no PR

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `docs`
- **Referencia:** complementa a trava do ADR [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md) (a conferência das refs entre irmãos, no item 4) e usa a regra de checks obrigatórios do ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md). Não revisa nada. AT-782, Rodada 237.

## Contexto

Com a trava (ADR 0274), uma ref `caminho:N` (`símbolo`) desalinhada num irmão só aparece na PR do bot que sobe a trava, e a trava inteira para até o irmão consertar. O levantamento de 07/11 contou 1 705 refs com símbolo nos irmãos: 1 434 apontam para o próprio repo e 268 para outro irmão. Nas PRs mescladas de 05/11 a 07/11 (170), 29 teriam reprovado por introduzir uma ref interna quebrada. O conserto saía em PR separada de `docs: reancora`, em 24 PRs do mesmo período.

O check de refs com símbolo do `brabo` (`verificarRefsComSimbolo`) roda só no layout inteiro. Rodar o gerador no irmão exigiria o layout e os outros 16 geradores, que rodam inteiros (a nota do `--raiz` em `docs/explanation/documentation-workflow.md`).

## Decisão

1. **Cada irmão confere as próprias refs no CI**, pelo reutilizável `refs-com-simbolo.yml` do `brabo-ci`, chamado pelo mesmo SHA em `uses:` e em `ci_ref:`, como os demais reutilizáveis do `brabo-ci`. O checador é um script sem dependências no `brabo-ci` (`scripts/ci/refs-com-simbolo.ts`). Ele lê só o checkout do próprio irmão, sem layout e sem `pnpm install`, e usa o mesmo núcleo do gerador: janela de ±3 linhas, padrão estreito, `CEGO` com zero refs e distância máxima de 40 linhas para a reancoragem.
   - Descartada: o irmão baixar o `scripts/docs` do `brabo` por SHA. Isso faria o irmão depender do `brabo`, criaria um segundo pin em cada repo e mexeria no gerador que todo `docs:check` usa.
2. **Classificação do caminho citado.** Prefixo `apps/<eu>/` é interna, e o caminho no repo é o que sobra. Prefixo `apps/<outro>/` ou `packages/` é externa. Sem prefixo, é interna quando o primeiro segmento é arquivo ou pasta da raiz do próprio repo. O resto é externa.
   - Interna que não resolve a um arquivo só (nenhum sufixo ou mais de um) reprova. Externa não entra na conta.
3. **Ref entre irmãos só é listada.** A ref de A para código de B vai no `$GITHUB_STEP_SUMMARY` como contagem ("N externas, conferidas na subida da trava"), sem anotação `::warning::` e sem reprovar. A PR de A não confere contra a `dev` de B: quem quebra é a PR de B, e conferir traria de volta o não determinismo da trava. O portão continua sendo a trava (ADR 0274, item 4), que sobe o patch nomeando o repo dono.
4. **O patch sai como artefato.** Quando reprova, o reutilizável roda o reancoramento no checkout (`--escrever`), grava `git diff -- docs/` em `refs.patch` e sobe o artefato `refs-patch`, no molde do `irmaos-patch`. O summary lista cada ref com `doc:linha → caminho:N (símbolo)`, diz se a correção é "reancora" ou "corrija pelo símbolo", e traz a receita `gh run download` com `git apply`.
   - Sem comentário na PR: exigiria `pull-requests: write` em cada chamador, falha nas PRs do Dependabot, que têm token só de leitura, e vira um comentário a cada push.
5. **O check fica fora dos obrigatórios.** Ele não entra no ruleset. Pela regra de 06/11 (ADR 0255), só `pr-police` e `escada` são exigidos. O vermelho dele avisa quem abriu a PR, e o que escapar cai na trava.

## Consequências

- A PR de um irmão que quebra uma ref interna fica vermelha no próprio CI, com o patch pronto. O conserto entra na PR causadora. A reancoragem resolve sozinha cerca de 80% dos casos (301 das 377 refs ruins do período estavam a até 40 linhas, com ocorrência única do símbolo). O resto é releitura pelo símbolo.
- A trava deixa de parar por ref interna. Continua parando por ref entre irmãos, como antes.
- Custo: cerca de 10 s de CI por irmão, sem `pnpm install`.
- Há duas cópias do núcleo puro (janela, padrão e distância), uma no `brabo` e outra no `brabo-ci`. Os cabeçalhos dos dois arquivos apontam um para o outro. Uma divergência só aparece na subida da trava, como hoje.
- Diferença conhecida: um sufixo que é único no repo e ambíguo na árvore unificada passa no irmão e reprova no agregador. Isso cai na trava, que continua sendo a última palavra.
- Para depois, sem data:
  - o `brabo` importar o núcleo do `brabo-ci`, em vez de manter a cópia;
  - o "check reverso" na PR de B: conferir as refs que outros irmãos fazem para B contra o head da PR, sem reprovar, com um patch para o irmão que cita.
- A entrega é em etapas: o reutilizável primeiro no `brabo-ci`, depois o job `refs` em cada irmão, cada um com o SHA do reutilizável pinado.

## Referências

- [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md), [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md).
- AT-122 (o `docs:check` reprova a ref que não bate), AT-782 (este ADR) e o levantamento da AT-780 (Rodada 232 e 233).
