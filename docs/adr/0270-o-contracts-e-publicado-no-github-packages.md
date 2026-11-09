# ADR 0270 — O brabo-contracts é publicado no GitHub Packages, com o `shared` só de tipos

- **Status:** aceito (decisões do dono de 06/11 e 07/11/2026, AT-770)
- **Data:** 2026-11-08
- **Tema:** `engenharia`
- **Referencia:** revisa o item 2 do ADR [0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) ("consumido como dependência git por TAG"), sem editá-lo, e o "Stack decidida" do `CLAUDE.md` do `brabo-contracts`. Mantém a origem dos tipos do web do ADR [0116](0116-tipos-do-web-gerados-do-openapi.md) e usa a cadeia do ADR [0280](0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md). RN-1037 a RN-1041, nos repos que as testam.

## Contexto

O `brabo-contracts` (`shared`, `docker-port`, `areas.json`, `fluxo.yml`) era consumido por dependência git em uma TAG. Em 06/11 havia quatro tags em uso ao mesmo tempo, o `pnpm-lock.yaml` reescrito inteiro quebrou o CI do broker (broker#14), o engine lia as constantes do `docker-cli.ts` por um arquivo TypeScript, e o runner carregava um loader (`strip-node-modules.mjs`) por causa do type stripping. O broker instalava `git` na imagem só para resolver a dependência.

O levantamento comparou manter a TAG com um check (A+), publicar no npmjs (B) e gerar um SDK da api (C). O dono escolheu arrumar o mecanismo e publicar como lib já, no GitHub Packages. Fatos que mandam: o registry npm do GitHub só aceita pacote com escopo, o escopo é a org dona (`@viralabs-dev`), instalar pede token (até pacote público) e só aceita PAT classic fora do Actions. O `npm publish --provenance` só está documentado para o npmjs.

## Decisão

1. **Dois pacotes, `@viralabs-dev/brabo-shared` e `@viralabs-dev/brabo-docker-port`,** públicos (decisão do dono), publicados no GitHub Packages pela TAG. Os dois saem sempre com a mesma versão, a da TAG: `vX.Y.Z-dev.N` com o dist-tag `dev`, a final `vX.Y.Z` com `latest`. O consumidor fixa a versão exata, sem `^`. A versão é escrita pelo workflow a partir da TAG, sem commit.
2. **O import não muda:** o consumidor usa o alias do pnpm (`"@brabo/shared": "npm:@viralabs-dev/brabo-shared@1.2.0"`, idem `@brabo/docker-port`). Renomear os imports custaria cerca de 150 arquivos e não ganha nada.
3. **O `shared` continua só com tipos,** mesmo com `dist`: nenhum `export` de valor sobrevive (RN-1037). A regra "só o broker fala com o socket" também fica: o spec `api-nao-consome-docker-port` da api não sai.
4. **Publicação no `brabo-ci`:** o reutilizável `publish-npm.yml` faz `pnpm pack`, atesta os `.tgz` com `actions/attest` e publica o mesmo arquivo atestado. Sem `--provenance`. O `brabo-contracts` o chama pelo `publish.yml` na TAG, que o token do App empurra (o `GITHUB_TOKEN` não dispararia o workflow).
5. **Token por ponto de instalação.** CI dos consumidores: `GITHUB_TOKEN` com `packages: read` e `setup-node` com `registry-url` e `scope`. Dev local: PAT classic só com `read:packages` em `~/.npmrc`; o repo versiona só a linha do registry, nunca o token. Docker (build e dev): secret do BuildKit, nunca `ARG`, `ENV` nem camada (RN-1039).
6. **`install.sh --source=ghcr` não muda.** `--source=local` exige o PAT (decisão do dono, P2): confere o `~/.npmrc` antes e, sem `read:packages`, para dizendo como criar o token.
7. **O runner do npmjs não depende do GitHub Packages:** `dependencies` não declara `@viralabs-dev/*` (RN-1040). O contracts continua devDependency embutida pelo `tsup`.
8. **Os dados continuam por raw na TAG** (`areas.json`, `fluxo.yml`). O `docker-cli.json` passa a ser o espelho das constantes do `docker-cli.ts` (RN-1041), e o engine o lê no lugar do `.ts`. O engine continua sem npm.
9. **Uma versão para todos:** a chave `contracts` do `componentes.json` (`{ "repo": "viralabs-dev/brabo-contracts", "tag": "v1.2.0" }`) é a fonte da versão vigente. O check `contracts-alinhado` do `brabo-ci` reprova versão diferente entre `package.json`, lock e scripts de download do mesmo repo (RN-1038), e só avisa se o repo difere do `componentes.json`. Ele não é obrigatório.
10. **A chave `contracts` não entra na trava `pins-dos-componentes`.** O contracts não tem Release (só TAG), e a trava mede Release final. Quem a cobrar um dia declara a régua dele (TAG, não Release).

## Consequências

- Acabam as quatro tags em uso, a reescrita do lock inteiro (o `subir-contracts.sh` do `brabo-ci` recusa diff fora das duas entradas) e o `git` na imagem do broker. O `dist` dá semver e integridade sha512 no lock.
- Uma queda do `npm.pkg.github.com` derruba build de imagem, CI e dev local, o que antes só o github.com fazia.
- Quem constrói de fonte (`--source=local`, inclusive contribuidor de fora) precisa de conta GitHub e PAT.
- Sem `--provenance`: o atestado do `.tgz` o substitui, e a publicação vale mesmo se o atestado precisar de ajuste.
- O Dependabot de npm segue só em segurança (limite 0). O `GITHUB_TOKEN` dele basta se o repo estiver em "Manage Actions access"; se falhar, o plano B é o `registries` com PAT.
- Sai um `-dev.N` por merge na `dev`. A limpeza das versões antigas fica para depois.
- Fora de escopo: o SDK da api (C), que, se um dia existir, mora no `brabo-api`, e o npmjs público.
- A página do PAT (passo a passo) fica como entrega à parte, ainda sem ADR próprio.

## Referências

- AT-770 (levantamento de 06/11, plano da R222 e decisões do dono), AT-764, AT-796 (a trava de pins que deixa o contracts fora).
