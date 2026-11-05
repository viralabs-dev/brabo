---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0228 — The project container starts the app with the declared command and publishes ports on loopback only

## Status

**Accepted.** 2026-10-29 (AT-610 and AT-608, EP-030; owner's decisions of
10/29). Theme: `container`. Revises, without editing them,
[0130](0130-broker-de-container.md) (the CLOSED spec with no network field) and
[0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md) (Decision 1:
"the broker does NOT publish ports"). Coexists with
[0189](0189-o-piloto-automatico.md) and
[0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md).
This lane fixes the CONTRACT of `packages/docker-port` and of the broker; the
api, the engine, the runner and the web come later and implement their side.

## Context

The project container starts with `sleep infinity` and the app only runs during
the QA test. A published port with no process listening shows no page at all,
and the owner asked to configure ports, DNS and `extra_hosts` per container
(AT-608), with the app declared by the Infra (AT-610).

## Decision

1. **App command (`comandoDoApp`, optional).** The Infra declares it
   (`run.app` in `artifact.run_instructions`); the api delivers it in the
   `container-spec` and the broker NEVER reads it from the request body. Up to
   300 characters, no `\n`, `\r` or NUL. With it, `argsDeCriacao` swaps the
   `sleep infinity` for a CONSTANT supervisor (`SUPERVISOR_DO_APP`), with the
   command as a positional ARGUMENT (`$1`, the mold of RN-807), never
   concatenated: the app starts in the background, with the log at
   `/tmp/brabo-app.log` and the exit code at `/tmp/brabo-app.exit`, and PID 1
   remains `sleep infinity`. An app that dies stays dead. Without the field,
   the `docker run` is byte for byte today's (proven by test).
2. **Ports.** `portas: [{ host, container, protocolo: 'tcp' }]`, always
   `-p 127.0.0.1:H:C` (the interface is a constant of the adapter, with no
   option). Host from 1024 to 65535, outside the installation's ports (3000,
   4000, 5173, 5432, 7474, 7687, 8088, 8090, 11434), at most 10, no duplicates,
   and refused with network `none`. Only the CONTAINMENT changes form: the
   `egress` network already reached the machine's published ports (ADR 0189) and
   publication is on loopback only.
3. **DNS and `extra_hosts`.** `dns` is a list of literal v4/v6 IPs (up to 3);
   `hostsExtras` is `{ nome, ip }` (up to 10), with name in `[a-z0-9.-]` (up to
   253, no dot/hyphen at the ends), never `localhost` or the name of an
   installation service, and a literal IPv4 (the `:` of IPv6 is ambiguous in
   `--add-host`). Also refused with network `none`.
4. **`inspect`** now reads `NetworkSettings.Ports` and returns
   `portasPublicadas` in the OBSERVED state; what the Infra declared remains
   another column (RN-468).
5. **The `DockerPort` stays at five operations.** The new fields belong to the
   SPEC; no new operation is born. Changing the command, ports, DNS or hosts
   only takes effect in a RECREATED container (`start` is idempotent); the
   recreate action and the approval belong to the api lane.
6. **Out of this lane:** `runner` (capability in the `join`, later), the page,
   the `container_recreate` action and the command's approval — the owner
   decided that the autopilot, when on, waives the click and, without it, the
   Infra PR with `run.app` asks for human approval.

## Consequences

- 0213 stops holding in the sentence "the broker does NOT publish ports"; the
  rest holds.
- The container now has a long-running process fired by the product, with the
  containment of any `exec` (`--cap-drop ALL`, `--user`, pids/memory).
- A missing `setsid` in the image does not prevent the app: the supervisor
  falls back to plain `sh`.

## References

- [0130](0130-broker-de-container.md), [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md),
  [0189](0189-o-piloto-automatico.md).
- [RN-928](../business-rules/contracts.md#rn-928), [RN-929](../business-rules/contracts.md#rn-929).
