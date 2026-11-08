---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: How each repository is consumed
description: The six ways one Brabo repository delivers something to another (contract tag, policy SHA, sibling clone, image by digest, signed binary and component pin), each with who publishes, who consumes, the file that locks the version and the check that proves it.
---

# How each repository is consumed

**Who it is for:** anyone who must decide **how** one repository delivers something to another.

**After reading, you can:** choose the right channel for each edge of your map and say which file locks the version and which check proves it.

The rule that runs through everything: **every channel pins an exact version and has a check that verifies it**. Consuming "the latest" of another repository is what makes the same commit go from green to red.

## The six modes

| # | Mode | Who publishes | Who consumes | What locks it | Who proves it |
|---|---|---|---|---|---|
| 1 | **Contract by tag** | `brabo-contracts` | api, web, runner, broker, engine, qa, infra | the exact version in `package.json` and the lock | `contracts-alinhado` |
| 2 | **Policy by SHA** | `brabo-ci` | all 11 repositories | `uses: ...@<sha>` and `ci_ref` | `pins-do-brabo-ci` |
| 3 | **Sibling clone** | each repository (its `dev`) | `brabo-infra` and `brabo` | `irmaos.lock` (in `brabo`) | `docs:check` |
| 4 | **Image by digest** | api, engine, web, broker and the backup image | `brabo-qa` and the installer | the `sha256` digest | `E2E do brabo-qa` |
| 5 | **Signed binary** | `brabo-runner` | `install.sh` in `brabo` | signed `checksums.txt` | `install.sh` and `release.yml` |
| 6 | **Product pin** | all components | `brabo` | `componentes.json` | `Pins dos componentes` |

### 1. Contract by tag

`brabo-contracts` publishes packages to GitHub Packages (`@viralabs-dev/brabo-shared` and `@viralabs-dev/brabo-docker-port`) and three data files downloaded by raw URL **at the same tag**. Consumers pin the exact version through a pnpm alias, without changing the imports:

```bash
pnpm add "@brabo/shared@npm:@viralabs-dev/brabo-shared@1.2.0"
```

You never pin to a branch. When a new tag ships, each consumer bumps the version with the script [`subir-contracts.sh`](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/subir-contracts.sh), and the `contracts-alinhado` check fails if the alias, the lock and the download scripts' constant diverge.

### 2. Policy by SHA

Each repository calls the `brabo-ci` workflows like this:

```yaml
uses: viralabs-dev/brabo-ci/.github/workflows/pr-police.yml@<sha>  # v1.4.0
with:
  ci_ref: <the same sha>
```

`uses:` chooses the YAML and `ci_ref` chooses the scripts, so both must be the **same 40-character SHA**. The comment tells the reader the version, and the `pins-do-brabo-ci` check verifies that the comment matches the SHA ([ADR 0280](../../adr/0280-o-pin-do-brabo-ci-aponta-para-uma-tag.md)). The step-by-step is in the [adoption guide](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md).

### 3. Sibling clone

Two repositories read the others' **code**:
- `brabo-infra` has an `irmaos` action that checks out the siblings' `dev`, for the cross checks;
- `brabo` rebuilds everyone's layout with `scripts/docs/montar-layout.sh`, to generate the documentation. Here the version is locked: `irmaos.lock` holds each sibling's SHA, and the `regenera-gerados` bot bumps it ([ADR 0274](../../adr/0274-os-gerados-leem-os-irmaos-por-uma-trava-de-shas.md)). A human never edits that file.

Developers use the same principle on their machine: `clonar-tudo.sh` in `brabo-workspace` clones everything side by side, and the scripts read the neighbors through `BRABO_IRMAOS`.

### 4. Image by digest

Each tag of api, engine, web and broker publishes a container image signed with cosign. The `main` gate (`brabo-qa`) resolves the tag to the **digest** (`image@sha256:...`), checks that the running container has exactly that digest and verifies the signature. A tag is a pointer that can move; a digest cannot ([ADR 0267](../../adr/0267-o-e2e-do-brabo-qa-e-portao-da-main.md)).

### 5. Signed binary

`brabo-runner` does not publish an image: it runs on the user's machine. It attaches the binaries and a signed `checksums.txt` to the Release. `install.sh` downloads the binary of the tag that `componentes.json` pins and checks it against that signature.

### 6. Product pin

The `componentes.json` file, at the root of `brabo`, says **which tag of each component makes up the product**:

```json
"imagens": { "api": { "repo": "viralabs-dev/brabo-api", "tag": "v2.1.0" } }
```

The pin does not move on its own, but a bot bumps it: every 6 hours it reads each component's latest final Release and opens a PR changing only the tag, and the merge is human. The `Pins dos componentes` check fails the product promotion if a pin is behind ([product release](../../explanation/release-do-produto.md)).

> **For your project:** for each edge of your map, write four things: who publishes, who consumes, which file holds the version and which check fails if it diverges. If the check is missing, the edge is not ready.

Next: [The life of a change](vida-de-uma-mudanca.md).
