# ADR 0273 — A paridade de tradução mede só a doc do brabo

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `docs`
- **Referencia:** revisa o item 7 do ADR [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) (a seção de interface sai do relatório) e o item 2 e as consequências (linhas 24 e 25) do ADR [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md) (a paridade dos irmãos passa a ser medida no repositório dono, quando ele tiver `i18n/`). AT-779, Rodada 231.

## Contexto

`docs/reference/paridade-de-traducao.md` é gerado e conferido pelo `--check`. Ele somava a doc de TODAS as raízes que existem no disco, e no layout montado isso inclui a doc dos irmãos. Qualquer merge de doc em api, engine ou web mudava o total, e toda PR aberta do `brabo` ficava vermelha em "Gerados em dia" sem poder consertar a causa. Foi a causa de 19 das 28 PRs vermelhas em duas semanas.

Havia também um defeito: `docs/i18n/<locale>/` entrava como fonte, então a tabela dizia "306 de 1248" quando o certo era "306 de 311".

## Decisão

1. **A paridade mede só as páginas do `brabo`.** Um caminho é do `brabo` quando está em `HEAD` ou não consta do manifesto `.git/layout-irmaos.lst` do `montar-layout.sh`. A página nova ainda não commitada conta; a de irmão não.
2. **`i18n/` não é fonte**, nem no `brabo`.
3. **A seção "Interface" sai do relatório.** O portão dela é do `brabo-web` (`src/lib/i18n-paridade.test.ts`, chaves e plurais por locale).
4. **Os números da "API" saem do relatório.** A fonte é do `brabo-api`; a linha "N textos ainda na fonte" continua no log do `docs:generate`.
5. **Irmão com `i18n/`** mede a paridade no próprio repositório, quando tiver.

## Consequências

- Mudar uma página de irmão (ou o `locales/` do web) não altera mais a paridade nem reprova PR do `brabo`.
- O número publicado muda de 24,5% para cerca de 98%. É correção da conta, e aparece no site.
- Os irmãos ficam sem medição de tradução até ganharem `i18n/`; hoje nenhum tem.
- Os demais gerados que dependem dos irmãos (`scripts.md`, índice de RN, contagens em prosa, refs com símbolo) seguem como estão e têm AT própria.

## Referências

- [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md), [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md), [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md).
