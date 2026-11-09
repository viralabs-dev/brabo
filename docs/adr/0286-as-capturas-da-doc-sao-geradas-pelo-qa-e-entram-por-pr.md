# ADR 0286 — As capturas da doc são geradas pelo brabo-qa e entram no brabo por PR do App

- **Status:** proposto (08/11/2026, AT-859)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) (PR do bot na `dev`), [0279](0279-provider-de-llm-duble-do-regressivo.md) (dublê de LLM), [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md) (acesso rápido só em imagem sem marca) e [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md). AT-859 e AT-864. Sem RN: é processo de documentação, não regra do produto.

## Contexto

- As imagens de `docs/assets` do `brabo` eram gravadas à mão, sem versão nem data. Algumas ficaram para trás da interface (o tutorial foi gravado em 14/10, antes do shadcn) e ensinam errado.
- O dono pediu que o que for didático use prints, mas que dados sensíveis sejam sempre ocultados (AT-864). Gravar à mão depende de alguém lembrar das duas coisas.
- O `brabo-qa` já sobe as imagens da release num compose, semeia por HTTP e dirige um navegador. Só ele tem, juntos, a interface de pé e o dublê de LLM que dá um texto didático sem custo.
- A conta de acesso rápido (`<papel>@brabo.dev`) só existe em imagem sem marca (ADR 0245). As imagens da release saem marcadas, então a captura entra com o `owner@brabo.dev` que o seed de produção cria, uma conta fictícia.

## Decisão

- O `brabo-qa` gera as capturas: uma config própria do Playwright (`playwright.capturas.config.ts`), fora do `pnpm test` e do portão da `main`, roda um cenário por tela usada na doc, em 1366×768, nos temas claro e escuro, contra as imagens das pins do `componentes.json`.
- A ocultação é embutida na captura: `mask` cobre e-mail, nome, avatar, campos de senha e de chave e caminhos de pasta, e uma guarda de texto FAZ A CAPTURA FALHAR se aparecer `/home/`, o usuário da máquina, um token ou um e-mail fora do domínio de teste.
- O workflow `capturas-da-doc.yml` tem três jobs: `decidir` (segue só quando o MAJOR.MINOR do `web` mudou em relação ao do manifesto), `capturar` (sem token do App) e `publicar` (com o token do App, `repositories: brabo`, valida o artefato na fronteira e abre a PR fixa `chore/capturas-da-doc` na `dev`).
- A PR do bot passa pela escada INTEIRA. Não se acrescenta isenção no `pr-police`: a aprovação do dono é a conferência com zoom que a AT-864 exige.
- O manifesto `docs/assets/capturas.json` do `brabo` registra arquivo, tela, versões (`web`, `api`, `engine`) e data. O check que o usa mora no `brabo` e é a onda seguinte.

## Alternativas rejeitadas

- **Gravar à mão e conferir no review.** É o que gerou imagens velhas e o caminho `/home/...` no histórico.
- **Gerar dentro do `brabo`.** O `brabo` não tem o compose nem o dublê, e passaria a ter navegador e Docker no CI da doc.
- **Commit direto do bot na `dev`.** Pularia a escada e a conferência humana da imagem.
- **Conta de acesso rápido.** Só funciona em imagem sem marca, que não é a da release que a doc descreve.

## Consequências

- Um canal novo de escrita entre repos: o App `viralabs-dev-brabo` precisa de `contents` e `pull-requests: write` no `brabo`. O token mintado no `brabo-qa` pede só `repositories: brabo`.
- O `publicar` é o único job com o token, e não executa código vindo da captura: só copia `.png` de nomes do manifesto, cada um com até 400 KB.
- A captura acompanha a interface sem depender de memória, e dado sensível não sai sem a guarda acusar.
- O custo é uma PR do bot a cada MINOR do `web`, para o dono aprovar.
