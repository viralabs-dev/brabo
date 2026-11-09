# ADR 0289 — A recaptura segue a pin do web e só pede o dono quando a imagem muda

- **Status:** proposto (09/11/2026, AT-878)
- **Data:** 2026-11-09
- **Tema:** `engenharia`
- **Referencia:** ADR [0286](0286-as-capturas-da-doc-sao-geradas-pelo-qa-e-entram-por-pr.md) (as capturas são geradas pelo qa; este a estende), [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) (PR do bot na `dev` que dispensa a escada; este a emenda com uma segunda branch), [0282](0282-pins-dos-componentes-seguem-a-release-final.md) (a pin sobe com a Release final). AT-878. Sem RN: é processo de documentação.

## Contexto

- A AT-859 faz o `capturas-check` reprovar, na PR para a `main`, a captura cujo `web` está abaixo da pin (MAJOR.MINOR). A recaptura só nascia por `workflow_dispatch` manual: o `schedule` nunca rodou e nenhum gatilho ligava a mudança da pin à captura.
- A pin do `web` só sobe com a Release final, minutos antes da promoção do `brabo`. Resultado em 09/11/2026: a brabo#117 (promoção) parou por 24 capturas de `v1.2.1` contra a pin `v1.3.0`, e o dono teve de aprovar uma quarta PR de capturas (brabo#118) no meio da promoção.
- Medido na brabo#118: 6 de 24 PNG idênticos, 18 com bytes diferentes, e desses a maioria só por ruído (hash da sessão, horário), de 0,08% a 0,16% dos pixels. A mudança real ficou entre 1,1% e 2,1%.

## Decisão

- **Gatilho automático.** O workflow `capturas-gatilho.yml` do `brabo` roda no push na `dev` que toca `componentes.json`; só segue se a tag do `web` mudou em relação ao commit anterior. Então dispara `repository_dispatch` `capturas-pin-mudou` no `brabo-qa`, com o App `viralabs-dev-brabo` (`contents: write` em `all`, token só para `brabo-qa`).
- **Diff de pixels no qa.** O `capturas-da-doc.yml` compara cada PNG novo com o da `dev` do `brabo`, com a captura normalizada (sem hash nem horário), e segue por um de dois caminhos:
  - nenhuma imagem passa do limiar: o bot só atualiza os campos de versão de `capturas.json` e empurra `chore/capturas-versao`;
  - alguma passa: abre `chore/capturas-da-doc` como hoje, só com os PNG que mudaram, e o dono aprova.
- **Segunda branch isenta (emenda a 0255).** O `pr-police` do `brabo-ci` (v1.5.0-dev.1) isenta `chore/capturas-versao`, com a mesma régua: autor App, branch e base `dev`. O CONTEÚDO só de versão é cobrado aqui: com `GITHUB_HEAD_REF=chore/capturas-versao`, o `capturas-check` (guarda e) reprova PNG no diff, ou mudança em `capturas.json` fora de `web`, `api`, `engine` e `data`, ou entrada trocada. O `docs-check.yml` já faz `fetch-depth: 0`, então `origin/<base>...HEAD` resolve.
- O check (d) fica como está: a promoção com captura velha segue barrada.

## Alternativas rejeitadas

- **Comparar só o MAJOR, ou só avisar na `main`.** Enfraquece a garantia: a MINOR que mudou a tela passaria com imagem velha.
- **Capturar contra o `web` `-dev`.** A doc da `main` mostraria tela ainda não lançada.
- **Disparar pela Release final do web.** A captura sairia antes da pin, e o `decidir` lê a pin.
- **Isentar a PR do bot sem a guarda (e).** A isenção valeria para qualquer conteúdo; a guarda é o que impede imagem sem o dono.

## Consequências

- Uma promoção de web sem mudança visual leva ~10 min de bot e uma PR de versão que o condutor mergeia; o dono só entra quando a imagem muda.
- Risco: o `repository_dispatch` depende do App ter `contents: write` no `brabo-qa` (confirmado por `gh api orgs/viralabs-dev/installations`: `all`, `contents: write`) e dos segredos `BRABO_APP_ID` e `BRABO_APP_PRIVATE_KEY` no `brabo`. O ensaio ponta a ponta (`workflow_dispatch` do gatilho) é a prova.
- Ordem do ritual de promoção: final do componente, `regenera-gerados`, merge, captura automática, merge da PR de versão (ou aprovação do dono se mudou), promoção do `brabo`.
