---
traducao_de: efdead964c2245ce1900dfb47140b0af64a2492f
---

# ADR 0229 — QA tests on an ephemeral instance, with the services the Infra declared

## Status

**Accepted.** 2026-10-29 (AT-612, EP-030; owner's decisions of 10/29). Theme:
`container`. Extends [0130](0130-broker-de-container.md) and
[0228](0228-comando-do-app-e-rede-do-container.md) without editing them. This
lane fixes the contract of `packages/docker-port` and of the broker; the
lifecycle (api, engine, environments table) comes later.

## Context

QA runs in the WORK container and RN-817 kills what the project left up, which
would kill the app declared in ADR 0228. The owner decided: the e2e runs in a
separate QA container, brought up only when the gate needs it, with the app's
infrastructure (database, S3...) inside the same instance, and the Infra, not a
catalog of ours, decides the services.

## Decision

1. **Role `qa`.** A spec with `qa: { chave, servicos }` is an ephemeral
   instance per task: name `brabo-qa-<workspace_dir_name>-<chave>` (`chave` = 8
   characters `[a-z0-9]`, the first ones of the `taskId`; single source in
   `nomeDoContainerDeQa`), same image, network, resources, user and `/work`
   bind as the work container, WITHOUT `--restart`, with `brabo.papel=qa` and
   `brabo.qa.instancia=<chave>`. It accepts neither `comandoDoApp` nor
   `portas`. The `DockerPort` stays at five operations: `stop`, `remove`,
   `inspect` and `exec` gain the optional parameter `alvo: { papel: 'qa', chave
   }`.
2. **Only the labeled.** With a QA `alvo`, the adapter filters
   `brabo.papel=qa`; a same-named container without the role is "unmanaged" and
   is never touched. QA removal first deletes the instance's OWN services
   (`brabo.qa.dono=<QA name>`) and then the instance; it is outside the
   absolute ceiling of `container_remove` (owner's decision), because it only
   reaches what carries a QA label.
3. **Services declared by the Infra.** `{ nome, imagem, env?, dados?,
   compartilhado? }`, up to 6. Image by DIGEST (`@sha256:` + 64 hex) MANDATORY;
   `env` with keys `[A-Z_][A-Z0-9_]*` (up to 20, value without line breaks);
   `dados` are paths in `--tmpfs` (up to 3). Each service starts with
   `--network container:<qa>` (a single `localhost`), `--cap-drop ALL`, no
   privilege or `--cap-add`, no published port, a CONSTANT ceiling of 1 cpu,
   512 MB and 256 pids, `--tmpfs /tmp`, label `brabo.papel=qa`. A failure in the
   middle undoes what came up.
4. **Shared service.** `--network container:` only links containers to ONE
   namespace, so a service shared across instances does not fit in it. The
   minimal design: it lives on a private `--internal` network of the project
   (`brabo-qa-<workspace_dir_name>`), service name as network alias, container
   `brabo-qa-<workspace_dir_name>-svc-<nome>` with label
   `brabo.qa.compartilhado=1`, reused if already up; each instance connects to
   that network by `docker network connect`. It requires the `egress` network
   (a container on `none` does not connect). Who removes the shared one and when
   is an open question for the api lane.
5. **Broker.** New routes in the closed router:
   `/containers/:projectId/qa/:chave/{start,remove,exec}`. The service list
   comes from the api's `container-spec` (`?papel=qa&task=<chave>`), never from
   the body; the route's key must be the one the api returned.

## Consequences

- Two test processes can run per project without touching the work app.
- Official Postgres/MinIO with `--cap-drop ALL` and tmpfs were NOT measured
  with real Docker in this lane; an image that requires a capability fails on
  startup, with a named `failed`.
- The pull of the services fits in the 30 s control ceiling (RN-604) or fails
  named: a large image does not come up on the first attempt.

## References

- [0130](0130-broker-de-container.md), [0189](0189-o-piloto-automatico.md),
  [0228](0228-comando-do-app-e-rede-do-container.md).
- [RN-930](../business-rules/contracts.md#rn-930).
