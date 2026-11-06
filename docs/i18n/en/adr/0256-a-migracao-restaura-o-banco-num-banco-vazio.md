---
traducao_de: ef850f307d04a45ee51b6a0918652f46941addd2
---

# ADR 0256 — The installer's migration restores the database into a freshly created, empty database

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `operacao`
- **References:** ADRs [0150](0150-instalador-de-uma-linha.md) and [0152](0152-backup-de-volumes-contra-compose.md), [RN-530](../business-rules/infra.md#rn-530), [RN-542](../business-rules/produto.md#rn-542), [RN-692](../business-rules/produto.md#rn-692) and activity AT-738. None of them is edited.

## Context

The first real migration of a 7.0.0 installation to product 1.0.0 (AT-710, 11/05/2026) brought up an EMPTY installation. The chain of ADR 0150 (backup → proof → question → `down -v` → installation → restore) stopped at the restore of the git repositories: Postgres did not come back. [RN-530](../business-rules/infra.md#rn-530) said why — `brabo-restore` validates in a test database and "never overwrites the origin" (ADR 0152) —, and the answer `s = restore` led one to believe the data came back. After `down -v` there is no origin to protect: the new database is born empty, and not restoring it is what loses the data.

The same migration found the rest, which this ADR closes along with it: the migration generated new secrets and lost the master key (the restored credentials became unreadable), the backup and the proof did not write to the folder of the uid of whoever runs it, the proof restored another backup (the one in the `backup_local` volume, which `down -v` erases), the marker was not written when the restore failed, and the restart of the versions at 1.0.0 showed up as a "downgrade". Owner's decisions of 11/05/2026.

## Decision

1. **The migration restores Postgres on its own, into a freshly created, empty database.** After `down -v`, the installer brings up ONLY `postgres`, runs `brabo-restore --banco-vazio` (which refuses if there is any table in `public`, `drizzle` or `engine`, restores in a transaction and runs the same validations), and only then brings up the rest — the migrations of the new version run on top of the dump, never the other way around.
2. **It clarifies decision 5 of ADR 0152:** "the restore never overwrites the origin" holds for a database with data. A freshly created, empty database is the origin of nothing, and restoring into it is the end of the migration, not a risk to it.
3. **After the database, the git repositories and the reprojection.** `brabo-restore-git --restaurar` runs as the OWNER read from the `git_local_repos` volume; the graph and the artifacts are reprojected from the event log (decision 4 of ADR 0152). A reprojection failure is a named pending item, not a refusal: the data has already come back.
4. **The migration is resumable.** The marker (schema 4) is written right after `down -v`, with `restauracaoPendente` (the backup destination and the steps still missing), and again at each step. The next run that finds the pending item RESUMES the restoration instead of migrating again.
5. **The secrets that encrypt restored data come from the previous `.env`.** At the minimum `CREDENTIALS_MASTER_KEY`; and everything the new `.env` does not declare comes back, except what the installer decides on the spot (profiles, broker, Ollama) and the `_PREVIOUS` of an ephemeral secret.
6. **Line of versions.** The marker gains `linha`; without it, the installation belongs to the previous line, except for images under `ghcr.io/viralabs-dev/`. Between lines the relation is `nova-linha`, with its own sentence and a default of yes.

## Consequences

- Answering `s` now brings back what the question promises: database, repositories, graph and artifacts. `z` still reinstalls from scratch with the proven backup in the folder.
- The proven backup is the SAME one that stays in the folder and that the restoration uses.
- A migration interrupted after `down -v` is not left orphaned: the next `install.sh` resumes. If the database already has a table, `--banco-vazio` refuses and says why — the installer never restores on top of data.
- The dump stays in a declared `0755` folder: readable by other users of the machine, without the master key.
- `install-e2e` needs a migration step with seeded data to prove this on a tag; in a PR, the proof is `scripts/dev/install-migracao.spec.ts`.
