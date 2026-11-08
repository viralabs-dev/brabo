---
traducao_de: 23e2f214c5dfa908580e5bb65ad5c7ecf7e0e64c
title: Build your own
description: An ordered checklist to replicate Brabo's pattern in another product - parent folder, CI repository with the policy, contracts repository, orchestrating repository, quality repository with the gate and front door - with what to copy and what to adapt at each step.
---

# Build your own

**Who it is for:** anyone who decided to split their own product and wants a route.

**After reading, you can:** list the repositories you will create, in order, and say for each what you copy from Brabo and what you adapt.

Order matters: each step depends only on the earlier ones. Do one at a time and **advance only when the step's example PR is green**.

## 0. Before anything: the map

Write the roles table from [page 2](o-mapa.md) for **your** product, with the consumption mode ([page 3](como-cada-repo-e-consumido.md)) on each edge. If some repository has no clear role, do not create it yet.

## 1. The parent folder and "clone everything"

- **Copy** the pattern of [`brabo-workspace`](https://github.com/viralabs-dev/brabo-workspace#readme): a folder that holds the clones side by side and a `clonar-tudo.sh` that clones them all and never deletes anything. The list of repositories is a single variable.
- **Adapt** the organization name and the list of repositories.
- **Careful:** the script is bash 3.2-compatible (macOS); avoid associative arrays and `mapfile`.
- **Done when:** `clonar-tudo.sh` on a clean machine leaves all clones in place.

## 2. The CI repository, with the policy

Do this one **first among the code ones**, because all the others call it.

- **Copy** [`brabo-ci`](https://github.com/viralabs-dev/brabo-ci#readme), or, without a fork, just call its workflows. The [adoption guide](https://github.com/viralabs-dev/brabo-ci/blob/dev/scripts/ci/docs/tutorials/adotar.md) takes a repository that has never seen Brabo to green `pr-police` and `escada`, and the example repository `daneiel/brabo-ci-exemplo` proves the steps.
- **Adapt:** the `ci_ref` (the SHA of the version you chose), the `OWNER_HANDLE` variable and, if you want approval by roles, the `community` mode.
- **Do not copy blindly:** the QA gate, `dependencias-de-merge` (which assumes the 11 repositories) and `contracts-alinhado` (which assumes the `@viralabs-dev/brabo-*` packages) are specific to Brabo.
- **Done when:** an example PR shows `Política de branches` and `Escada de aprovação` green.

## 3. The contracts repository

- **Copy** the pattern of [`brabo-contracts`](https://github.com/viralabs-dev/brabo-contracts#readme): `publishConfig` with GitHub Packages, `files: ["dist"]` and a `publish.yml` that calls CI's `publish-npm.yml` from the tag.
- **Adapt:** the packages' scope and what goes inside (types, schemas, data files).
- **Golden rule:** consumers pin the **exact version**, never a branch.
- **Done when:** a test consumer installs the package by tag with `pnpm add`.

## 4. The code repositories

- **Copy** the README skeleton with eight fixed sections ([`README.modelo.md`](https://github.com/viralabs-dev/brabo-ci/blob/dev/README.modelo.md)), the `pr-police`/`escada`/`tag-release` call and the tag stamp.
- **Adapt** what each repository publishes (image, binary, package) and the test commands.
- **Done when:** each repository publishes a `-dev.N` tag on every merge into `dev`.

## 5. The orchestrating repository

- **Copy** the idea of [`brabo-infra`](https://github.com/viralabs-dev/brabo-infra#readme): compose, development scripts and the action that clones the siblings.
- **Adapt** the compose services and the action's list of repositories.
- **Done when:** `docker compose up` brings the set up from the published images.

## 6. The quality repository, with the gate

- **Copy** the pattern of [`brabo-qa`](https://github.com/viralabs-dev/brabo-qa#readme): the E2E that runs **by digest**, the job that creates the App token only after a clean checkout and the feature catalog.
- **Adapt** the catalog and each repository's paths, and write the specs of **your** product.
- **Require** the gate check in the `main` ruleset, and only there.
- **Done when:** a PR to `main` turns red if the E2E breaks.

## 7. The front door

- **Copy** the structure of [`brabo`](https://github.com/viralabs-dev/brabo#readme): `repos.yml` (single source of the map), `componentes.json` (pins), `irmaos.lock` and `install.sh`.
- **Adapt** the list of repositories and the components that make up **your** product.
- **Turn on last** the product release: it depends on every component's Release existing.
- **Done when:** the installer checks the signed `checksums.txt` and installs the set on a clean machine.

## Once it is standing

Generate each README's "Onde se encaixa" block from `repos.yml`, turn on the merge-order and pin checks, and read the [mistakes we already made](erros-que-ja-cometemos.md) before assuming all is well.

> **TODO(humano):** this path has not yet been validated by someone outside the project. The agreed proof is that someone from the SmartSky team, reading only the path, draws the map and narrates a change's path to the release; the result and any divergences must be recorded here.
