# ADR 0276 — A PR declara de que PR de outro repo depende, e um check do App espera o merge

- **Status:** aceito (o check nasce informativo; a exigência em `dev` e `main` entra depois das provas, ver a Decisão)
- **Data:** 2026-11-07
- **Tema:** `git`
- **Referencia:** usa a regra de checks obrigatórios do ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md), o job `anunciar` do ADR [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md), que já atualiza um check-run pelo App, e a trava de SHAs do ADR [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md), que cuida dos gerados e deixa a ordem de merge sem regra. AT-787, Rodada 244.

## Contexto

A `dev` do `brabo-infra` ficou vermelha entre os merges da `brabo-api#56` e da `brabo-infra#26` (AT-774): o spec do infra lê a `dev` dos irmãos, e a ordem dos merges não estava escrita em lugar nenhum. A promoção `dev → main` também tem ordem (ci, contracts, componentes, infra, qa e por último o `brabo`), e essa ordem vivia só na cabeça de quem promovia.

O GitHub não tem dependência entre repositórios. A merge queue é de um repo só, e "linked issues" não segura merge. Os checks exigidos hoje são só `Política de branches` e `Escada de aprovação` (ADR 0255), e nenhum deles olha outro repo.

O levantamento de 07/11 (AT-787) mediu o que existe: o App `viralabs-dev-brabo` está instalado em `all`, com `checks:read` e sem `checks:write`. Escrever check em outro repo exige esse `checks: write`, o mesmo gesto do dono que bloqueia a AT-765. Os 11 repositórios `brabo*` são públicos, então qualquer token autenticado lê a PR de outro repo.

## Decisão

1. **A declaração é uma linha no corpo da PR.** Uma linha por dependência, em qualquer lugar do corpo, com ou sem `- ` na frente:

   ```
   Depende-de: viralabs-dev/brabo-api#56
   ```

   A regex casa linha por linha, sem flag `i`. Validação, sempre com motivo:
   - repo fora da allowlist (os 11 `brabo*` do mapa da pasta-mãe, constante no script e testada contra o `REPOS` do `clonar-tudo.sh`);
   - owner diferente de `viralabs-dev`;
   - autorreferência (a própria PR);
   - PR inexistente (404);
   - linha que parece declaração (`Depende-de` ou `depende de`) mas não casa a regex. Assim um erro de digitação não passa calado.

   O corpo é texto de terceiro: entra por `env`, nunca interpolado em `run:`, como no `pr-police`.

2. **O check `Dependências de merge` é publicado pelo App no `head_sha` da PR.** Ele mora num reutilizável novo do `brabo-ci`, `dependencias-de-merge.yml`, chamado por um `dependencias.yml` em cada um dos 11 repos, com os gatilhos `pull_request` (`opened`, `edited`, `reopened`, `synchronize`, `closed`) e `secrets: BRABO_APP_*`. Não é um passo do `pr-police`, por três motivos: o `pr-police` é exigido e não pode ficar vermelho por uma espera legítima; o `politica.yml` não passa secrets; e o evento `closed` não pode rodar a política e a escada em toda PR fechada. O job em si nunca reprova (`continue-on-error`). O nome é o do check-run, não o do job.

   Estados de cada dependência, e do check:
   - sem linha `Depende-de`: `success` "Sem dependências declaradas", publicado sempre, para não deixar check velho colado;
   - alguma `OPEN` (rascunho ou não): `in_progress`, o amarelo, com o título `esperando viralabs-dev/<repo>#<n>` (as que faltam, separadas por vírgula) e uma tabela no summary;
   - todas `MERGED`: `success` "Dependências mergeadas", com o link de cada uma;
   - `CLOSED` sem merge: `failure` com a mensagem "a dependência foi fechada sem merge: tire a linha ou aponte a PR que a substituiu". Não espera para sempre;
   - inválida, ciclo ou 404: `failure` com o motivo.

   **`neutral` não entra em nenhum caso.** Para ruleset, `neutral` conta como verde, e a espera passaria.

3. **Ciclo.** O script segue as linhas `Depende-de` das dependências abertas até a profundidade 5. Se volta à PR avaliada, reprova com o caminho inteiro (`A → B → A`) e os links. Profundidade estourada também reprova.

4. **Re-check quando a dependência é mergeada.** O evento `pull_request: closed` com `merged` roda no repo DONO da dependência (job `avisar-dependentes`): busca as PRs abertas que citam a PR mergeada (`search/issues?q=org:viralabs-dev is:pr is:open in:body "viralabs-dev/<repo>#<n>"`), reparseia o corpo de cada uma, e atualiza o check delas com o token do App. A busca é difusa, por isso o reparse é obrigatório. Escolhido sobre o `repository_dispatch`, que exigiria um ouvinte em cada repo e `contents:write` no destino. Além disso, um cron de hora em hora no `brabo-ci` varre as PRs abertas com `Depende-de`, como rede para o merge perdido quando o run do dono quebra. O `schedule` só roda da branch padrão, então o cron liga quando o `brabo-ci` chegar à `main`.

5. **Exigido em `dev` e `main` (decisão do dono, 07/11/2026).** O check entra no ruleset como obrigatório nas duas branches, mas **só depois das provas** (P1 a P6 da AT-787, com prints em `16-quality/prints/`) e com o App já com `checks: write`. Ligar antes disso travaria toda PR sem o check. Até lá, ele é informativo: aparece amarelo na PR e o vigia já o lista como não verde. Quem liga é o dono, no ruleset, e a ligação fica registrada em `rulesets.md`.

6. **Risco aceito e como destravar.** Com o check exigido, há quatro maneiras de travar uma PR:
   - **ciclo** e **dependência fechada sem merge**: destravam **editando o corpo** (tirar ou corrigir a linha). Não pedem bypass;
   - **App sem `checks: write`** ou **PR de fork** (fork não recebe secrets, então não publica check): nenhuma edição destrava. O destrave é o bypass do ruleset, por pessoa e com registro, ou a correção do App.

   Esse é o risco que o dono aceitou ao exigir o check.

7. **Promoção com `Depende-de` automático: fase 2, na AT-788.** O `promote` abriria a PR de promoção com uma linha por PR de promoção aberta dos predecessores, na ordem ci → contracts → (api, engine, web, runner, broker) → infra → qa → brabo. Fica fora desta decisão porque tem um furo: se a promoção do predecessor ainda não foi aberta, não há número para citar, e a PR passaria. Fechar o furo pede outra regra ("a `main` do predecessor contém a `dev` dele"), que é outro check.

## Consequências

- A ordem de merge fica escrita na PR, legível por quem merge e por quem vigia, e não depende de memória.
- Dependência resolvida atualiza a PR dependente em segundos, sem push. O cron cobre o caso do run perdido.
- Custo: um run curto por merge de PR com dependentes, e a varredura horária no `brabo-ci`. Os repos são públicos, então não há custo de minutos.
- Um check `in_progress` há mais de 14 dias vira `stale`, e `stale` também não é verde. A espera longa precisa de quem a leia, não de um timeout.
- Nenhuma Action de terceiros: `z0al/dependent-issues` e `gregsdennis/dependencies-action` não atualizam a PR dependente no merge, não conhecem o formato em pt-BR nem a allowlist, e exigiriam pin por SHA e permissão de escrita de terceiros. A lógica é nossa, em TypeScript com teste, no molde de `qa-e2e-disparar.ts`.
- Para depois: a fase 2 da promoção (AT-788), e a decisão de tornar o cron de hora em hora permanente quando o `brabo-ci` estiver na `main`.

## Referências

- [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md), [0271](0271-os-runs-do-actions-mostram-os-vinculos-entre-os-repos.md), [0274](0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md).
- AT-787 (este ADR, com o levantamento de 07/11 e as decisões do dono), AT-788 (promoção com `Depende-de`), AT-765 (o `checks: write` do App, gesto pendente do dono), AT-774 (a `dev` do infra vermelha entre os merges).
- RN-1047 a RN-1050, em `scripts/ci/docs/business-rules/ci.md`.
