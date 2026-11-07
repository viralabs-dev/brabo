# ADR 0267 — O E2E do brabo-qa é portão da main, com aceite justificado

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `git`
- **Referencia:** revisa o ADR [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md) (lista de checks obrigatórios), o ADR [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) (imagem também no `-dev` e no `sha-*`) e o ADR [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md) (E2E contra as imagens publicadas). AT-765, decisões do dono de 06/11/2026. Os ADRs revisados não são editados.

## Contexto

O `brabo-qa` não aprova nada: o E2E de navegador não roda em CI, não existe gatilho entre repositórios e uma PR não gera imagem. Um merge na `main` de `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-broker`, `brabo-infra` ou do próprio `brabo-qa` podia quebrar a stack sem que o E2E fosse sequer executado.

## Decisão

1. **Imagens (D1).** Cada carimbo `vX.Y.Z-dev.N` de api, engine, web e broker publica imagem, com build, Trivy, `cosign sign` keyless e `imagem.json` pelo digest. A tag `-dev` não cria Release no GitHub: o `imagem.json` vai como artefato do run. A PR de `hotfix/*` para a `main` publica `ghcr.io/viralabs-dev/brabo-<app>:sha-<12 primeiros caracteres do head>`. Limpeza no GHCR: as `-dev.*` guardam as 10 mais novas, as `sha-*` saem quando a PR fecha e `vX.Y.Z` nunca sai.
2. **Aceite (D2).** O comando `/qa-aceitar <justificativa>`, num comentário de PR com destino `main`, é aceito só do `OWNER_HANDLE`, com pelo menos 20 caracteres de justificativa, e só vale como `issue_comment.created`. Aceita apenas com o check do head atual vermelho por `spec` ou `ambiente`. **Nunca** aceita vermelho de `digest` nem de `assinatura`. Ao aceitar, o check vira `success` com o título "Aceito com justificativa", entra a label `qa-aceito-com-justificativa` e o bot responde. Commit novo gera check novo, e o aceite antigo não vale para ele.
3. **Repositórios (D3).** Exigem o E2E: `brabo-api`, `brabo-engine`, `brabo-web`, `brabo-broker`, `brabo-infra` e `brabo-qa`. O `brabo-contracts` fica de fora, porque api e web o fixam por tag e o E2E não testaria a mudança de contrato.
4. **Check obrigatório (D4).** O check `E2E do brabo-qa`, publicado pelo App `viralabs-dev-brabo`, é exigido por um ruleset novo, **"main exige E2E"**: só `refs/heads/main`, contexto `E2E do brabo-qa` com o `integration_id` do App e bypass só para o próprio App (decisão do dono na execução da AT-765, por causa do gate de hotfix; ativado em 07/11/2026). O ruleset `main e dev sem force push` não muda. O gatilho resolve cada tag em digest e dispara o evento `e2e-pr` no `brabo-qa`. O check em andamento vira órfão depois de 90 min, e uma varredura horária o fecha como vermelho.
5. **Prova das imagens (D5).** O E2E roda as imagens por digest (`@sha256:`), confere que cada container de pé tem exatamente o digest esperado (basta um `RepoDigests` igual; lista vazia reprova) e verifica a assinatura cosign desse digest. A espera por um digest ainda não publicado é de 30 min, consultando a cada 30 s.
6. **Idioma (D6).** Este ADR e a documentação do trabalho são em pt-BR (ADR [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md)).
7. **A exceção registrada.** O `rulesets.md` dizia que check obrigatório não se burla. O aceite com justificativa é a **única exceção**, registrada aqui: vale para o vermelho de `spec` e de `ambiente`, e nunca para `digest` nem `assinatura`, porque aceitar uma imagem não provada não é escolha disponível. Os demais checks obrigatórios seguem sem exceção.

## Consequências

- A lista de checks obrigatórios do ADR 0255 ganha um contexto, só na `main` e só nos seis repositórios.
- O ADR 0119 passa a valer também para `-dev.N` e `sha-*`, que ficam sujeitas à retenção acima.
- O ADR 0120 passa a valer em PR: o E2E roda contra as imagens publicadas, por digest, e não contra o build local.
- Se a instalação do App não tiver `checks: write` nos seis repositórios e `contents: write` no `brabo-qa`, ampliar é um gesto do dono na org.

## Referências

- [0119](0119-imagens-publicadas-no-ghcr-por-digest.md), [0120](0120-e2e-de-navegador-contra-o-compose-de-producao.md), [0255](0255-politica-de-pr-obrigatoria-em-todos-os-repos.md), [0266](0266-doc-dos-repositorios-em-portugues-por-padrao.md).
