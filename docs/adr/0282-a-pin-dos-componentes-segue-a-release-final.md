# ADR 0282 — A pin dos componentes segue a última Release final

- **Status:** aceito (decisão do dono de 07/11/2026: bot e trava, AT-796)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** usa a dispensa de escada do ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) e o mesmo ciclo da trava do ADR [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md). A causa foi o Trivy reprovar um broker antigo (ADR [0172](0172-trivy-no-release-antes-de-assinar.md)). Mantém o `install.sh` como no ADR [0150](0150-instalador-de-uma-linha.md). Origem: separação do ADR [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md). Explicação em [release do produto](../explanation/release-do-produto.md). Sem RN: é CI e release, não regra do produto.

## Contexto

O `componentes.json` era editado à mão e nenhuma promoção o atualizava. O produto v2.1.x ia sair com componentes antigos e o Trivy reprovou o broker v1.0.0. Uma hora depois de a AT-793 subir as pins, o web v1.2.1 já era a Latest. O runner ficou em v1.0.0 no `componentes.json` e no `RUNNER_TAG` do `install.sh`, com a v1.1.1 publicada.

## Decisão

- **A pin segue a última Release final** (`releases/latest`, que ignora rascunho e pré-release) de cada componente, com o asset que o produto consome: `imagem.json` nas imagens e no backup, `checksums.txt` e a assinatura no runner.
- **O bot é um passo do `regenera-gerados.yml`** (a cada 6 h e por `workflow_dispatch`), que só SOBE a pin, nunca desce. `infra.ref` e `imagens.backup.tag` andam juntos, e o `RUNNER_TAG` do `install.sh` muda no mesmo commit. A mudança cai na PR fixa `chore/regenera-gerados`, o que amplia o escopo da dispensa de escada do ADR 0255 (que não é editado); o merge continua humano. Dispensa mudar o `brabo-ci`.
- **A trava é o mesmo script** (`scripts/ci/pins-dos-componentes.ts --conferir`). Reprova pin atrás, sem Release final, sem asset, backup diferente do infra e `RUNNER_TAG` diferente de `runner.tag`. Roda na PR `dev → main` (check `Pins dos componentes`) e no `release.yml`, que reprova na tag e só avisa no ensaio.
- **O `install.sh` mantém a tag do runner literal.** É o hash dele que o manifesto do produto assina; ler o `componentes.json` em tempo de execução abriria um segundo download a verificar.

## Consequências

- A defasagem máxima entre a Release e a PR do bot é de 6 h; a trava cobre essa janela na promoção.
- Se um componente soltar Release entre o merge na `main` e o carimbo, a tag fica sem Release. A recuperação é mergear a PR do bot e promover um patch.
- Tornar `Pins dos componentes` obrigatório no ruleset da `main` é gesto do dono (`TODO(humano)`).
- A chave `contracts` não entra: o `brabo-contracts` não tem Releases.
