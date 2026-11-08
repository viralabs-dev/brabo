---
id: token-do-github-packages
title: Token do GitHub Packages
sidebar_label: Token do GitHub Packages
description: Para quem constrói o Brabo de fonte (--source=local) - crie o PAT classic só com read:packages, grave no .npmrc e confira sem expor o valor.
keywords: [pat, github packages, npmrc, read:packages, install.sh, source local]
---

# Token do GitHub Packages

Quem instala com `--source=local` constrói as imagens da api, da web e do broker na própria máquina. Esses três instalam `@viralabs-dev/brabo-shared` e `@viralabs-dev/brabo-docker-port` do registry do GitHub Packages. Os pacotes são públicos, mas o registry pede um token até para instalar. Sem ele o build morre com um `401`, e o instalador recusa antes de começar. Quem instala pelo GHCR (`--source=ghcr`, o padrão) não precisa de nada disto.

## Passo a passo

1. No GitHub, abra **Settings > Developer settings > Personal access tokens > Tokens (classic)** e escolha **Generate new token (classic)**.
2. Marque **só** `read:packages`. Nenhuma outra permissão é necessária.
3. Copie o token e grave esta linha no `~/.npmrc` (troque `<PAT>` pelo token):

   ```text
   //npm.pkg.github.com/:_authToken=<PAT>
   ```

4. Confira que a linha existe, sem mostrar o valor:

   ```bash
   grep -c '^//npm.pkg.github.com/:_authToken=.' ~/.npmrc
   ```

   Deve imprimir `1`.
5. Rode `./install.sh --source=local` de dentro do checkout, numa tag e com a árvore limpa.

## Outro arquivo

`NPMRC=<arquivo>` aponta o instalador, o bake e o `make dev` para outro arquivo no lugar do `~/.npmrc`.

## Segurança

- O instalador só confere se a linha existe; nunca imprime o valor.
- No build, o arquivo entra como secret do BuildKit (`id=npmrc`), nunca como `ARG`, `ENV` ou camada de imagem.
- O token só lê pacotes. Se vazar, revogue-o em **Personal access tokens** e crie outro.

Veja também o [Token do GitHub Packages](https://github.com/viralabs-dev/brabo-infra#token-do-github-packages) no README do `brabo-infra`, que cobre o ambiente de dev e o CI.
