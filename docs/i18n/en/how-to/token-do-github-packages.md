---
id: token-do-github-packages
title: GitHub Packages token
sidebar_label: GitHub Packages token
description: For people building Brabo from source (--source=local) - create the classic PAT with read:packages only, save it in .npmrc and check it without exposing the value.
keywords: [pat, github packages, npmrc, read:packages, install.sh, source local]
---

# GitHub Packages token

Anyone installing with `--source=local` builds the api, web and broker images on their own machine. Those three install `@viralabs-dev/brabo-shared` and `@viralabs-dev/brabo-docker-port` from the GitHub Packages registry. The packages are public, but the registry asks for a token even to install. Without it the build dies with a `401`, and the installer refuses before starting. Installing from GHCR (`--source=ghcr`, the default) needs none of this.

## Step by step

1. On GitHub, open **Settings > Developer settings > Personal access tokens > Tokens (classic)** and choose **Generate new token (classic)**.
2. Tick `read:packages` **only**. No other permission is needed.
3. Copy the token and write this line to `~/.npmrc` (replace `<PAT>` with the token):

   ```text
   //npm.pkg.github.com/:_authToken=<PAT>
   ```

4. Check the line exists, without showing the value:

   ```bash
   grep -c '^//npm.pkg.github.com/:_authToken=.' ~/.npmrc
   ```

   It must print `1`.
5. Run `./install.sh --source=local` from inside the checkout, on a tag with a clean tree.

## Another file

`NPMRC=<file>` points the installer, the bake and `make dev` at another file instead of `~/.npmrc`.

## Security

- The installer only checks that the line exists; it never prints the value.
- In the build, the file enters as a BuildKit secret (`id=npmrc`), never as `ARG`, `ENV` or an image layer.
- The token only reads packages. If it leaks, revoke it under **Personal access tokens** and create another.

See also the [GitHub Packages token](https://github.com/viralabs-dev/brabo-infra#token-do-github-packages) section in the `brabo-infra` README, which covers the dev environment and CI.
