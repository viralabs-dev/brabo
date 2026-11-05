---
traducao_de: a4f29048d747d6a2d5d5feb944f31d9beadbd364
---

# ADR 0246 — Chat attachments: bytes in Postgres, reference in the event, vision by capability

- **Status:** accepted
- **Date:** 2026-11-03
- **References:** ADRs [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md) (a capability without proof is `false`), [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) (JSON upload, "reject, never truncate") and [0152](0152-backup-de-volumes-contra-compose.md) (what goes into the backup). None of them is edited.

## Context

AT-715 (EP-031): no agent chat accepts a file. The owner answered the survey's 11 questions on 11/02: text/code and image; 5 MB per image, 512 KB per text, 4 per message; Postgres; lives with the session; the image goes to the LLM only in the turn in which it arrived; every `viewer` sees it; no antivirus; chat without an agent is out. The event log is append-only, so the bytes cannot live in it.

## Decision

1. **Bytes in Postgres.** Table `chat_attachments` (`bytea`, `cascade` FK to project and session), no UPDATE. The backup's `pg_dump` already covers it and the RBAC is the project's. Nothing goes to disk or to the worktree, so there is no new path containment (RN-092/095).
2. **Reference in the event.** `chat.message` records `anexos: [{id, nome, mime, tamanho}]` and the engine receives the same list; the bytes only leave the database when the api assembles the call to the provider (lane L2) or when someone reads the attachment.
3. **Vision by capability.** `ChatMessage.content` accepts `string` or `text`/`image` parts, and `LLMProviderCapabilities.vision` is born `false` on the eleven providers (ADR 0041; only the real smoke turns it on). The engine sends the attachment by id in the `llm-turn` (`{type:'anexo',id}`) and the api resolves it: the image only goes out with a provider AND a model with vision; otherwise it becomes a warning text (RN-989). Anthropic and Ollama have their own format (`image` base64, `images`), without capability proof.
4. **Who sees it.** Every `viewer` of the project, the same reach as `GET .../events`. Someone else's is 404.
5. **JSON with base64, not multipart.** 5 MB becomes ~6.7 MB, within the 10 MB body, with no `multer` or new parser; it is the mold of the RAG upload.
6. **Type by the bytes.** Signature for png/jpeg/gif/webp; text is valid UTF-8 without NUL. SVG is not an accepted image (it would fall as text and is served `nosniff`/`attachment`).

## Consequences

- **Declared gap: no antivirus.** The bytes never execute (they stay in `bytea` and leave with `nosniff` and `attachment`), but nobody scans them; ClamAV would be a new service and the owner's decision. Recorded in `docs/security-surface.md`.
- The `pg_dump` grows with the attachments; measure later (retention is the session's life, with no purge).
- The 10 MB JSON upload body is the route's ceiling, and each request loads the whole file into memory.
