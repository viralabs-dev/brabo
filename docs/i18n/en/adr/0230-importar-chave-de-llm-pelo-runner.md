---
traducao_de: 000a507e4d7d886585f3f731f8a7a5ac4a6e6e52
---

# ADR 0230 — The runner imports the LLM API key the user already has on the machine

## Status

**Accepted.** 2026-10-29 (AT-611, EP-026, owner's decisions of 10/29). Theme:
`runner`. Complements, without editing them,
[0158](0158-o-id-da-chave-mestra-gravado-no-envelope.md) (envelope with
`key_id`), [0154](0154-chave-de-dispositivo-de-maquina.md) (machine device key)
and [0050](0050-credencial-sempre-cifrada-verificacao-explicita.md) (storing and
verifying are two subjects).

## Context

A user who already uses Claude Code, Codex, OpenCode, Kilo Code CLI or Hermes
has LLM API keys on their own machine's disk, and today types each one again on
the credentials screen. The api runs in a container and does not reach that
disk; `brabo-runner` does. Importing is an effect on a secret, so it needs
explicit consent per key and never happens silently.

## Decision

1. **API keys only.** A subscription OAuth token (Claude Pro/Max,
   ChatGPT/Codex, Copilot) is NOT imported: the vendors' terms bind it to the
   official client, and using it in another product risks the owner's account.
   The command lists what it found as "subscription login, not importable —
   create an API key" and gives the reason.
2. **Reading is done only by the interactive runner** (`brabo-runner
   credentials import`, TTY mandatory, choice per item). The api never reads
   the user's disk.
3. **Route `POST /runner/llm-credentials`**, `@RequirePatAuth()` +
   `PatAuthGuard`, which delegates to the SAME `UpsertUserCredentialUseCase`
   (envelope with `key_id`) for the user who owns the credential. Since the
   route has no `:projectId`, the guard refuses with 403 any credential tied to
   a project; every PAT is a project one, so in practice only the MACHINE
   device key gets in. It is the first route where a machine credential writes
   a user secret.
4. **Never overwrites without confirmation:** an existing credential of the
   provider without `substituir: true` is 409 `credencial_existente`, without
   touching the existing one.
5. **The value never goes to a log, URL, event, exception or response.** The
   audit log carries provider and `origem` (tool and path); the response is
   `{ provider, substituida }`.
6. The route only stores (ADR 0050); the connection test is a separate action
   (`POST /users/me/credentials/:provider/test`), left to the client.
7. The macOS keychain is left for a slice of its own.

## Consequences

- A compromised machine device can now write (and, with `substituir`, replace)
  the owner's LLM key. The ceiling is revoking the key (ADR 0201) and the 409
  as the default.
- Whoever imports sees on the credentials screen the same row as any
  credential.
- A new tool to import from is a new reader in the runner, without changing the
  route.
