---
traducao_de: ef850f307d04a45ee51b6a0918652f46941addd2
---

# ADR 0256 — 安装程序的迁移把数据库恢复到一个新创建的空库中

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `operacao`
- **参考：** ADR [0150](0150-instalador-de-uma-linha.md) 和 [0152](0152-backup-de-volumes-contra-compose.md)、[RN-530](../business-rules/infra.md#rn-530)、[RN-542](../business-rules/produto.md#rn-542)、[RN-692](../business-rules/produto.md#rn-692) 以及活动 AT-738。均不被编辑。

## 背景

第一次真实的迁移，从 7.0.0 安装到产品 1.0.0（AT-710，2026-11-05），启动了一个空的安装。ADR 0150 的链条（备份 → 证明 → 提问 → `down -v` → 安装 → 恢复）止步于 git 仓库的恢复：Postgres 没有回来。[RN-530](../business-rules/infra.md#rn-530) 说明了原因——`brabo-restore` 在一个测试 database 中验证，并且“从不覆盖源”（ADR 0152）——而回答 `s = restaurar` 让人以为数据会回来。在 `down -v` 之后没有需要保护的源：新库生来为空，不恢复它才会丢失数据。

同一次迁移还发现了本 ADR 一并关闭的其余问题：迁移生成了新的密钥而丢失了主密钥（已恢复的凭据无法读取）；备份和证明没有写入运行者 uid 的文件夹；证明恢复的是另一个备份（`backup_local` 卷中的那个，而它会被 `down -v` 删除）；恢复失败时不写入标记；而版本从 1.0.0 重新开始被显示为“降级”。所有者 2026-11-05 的决定。

## 决定

1. **迁移自行把 Postgres 恢复到一个新创建的空库中。** 在 `down -v` 之后，安装程序只启动 `postgres`，运行 `brabo-restore --banco-vazio`（如果 `public`、`drizzle` 或 `engine` 中有任何表就拒绝，在一个事务中恢复，并运行相同的验证），然后才启动其余部分——新版本的 migrations 叠加在 dump 之上运行，绝不是反过来。
2. **澄清 ADR 0152 的决定 5：**“restore 从不覆盖源”适用于有数据的库。一个新创建的空库不是任何东西的源，在其中恢复是迁移的终点，而不是对它的风险。
3. **数据库之后，是 git 仓库和重新投影。** `brabo-restore-git --restaurar` 以从卷 `git_local_repos` 读取的**所有者**身份运行；图谱和制品从事件日志重新投影（ADR 0152 的决定 4）。重新投影失败是被点名的待办，而不是拒绝：数据已经回来了。
4. **迁移可恢复。** 标记（schema 4）在 `down -v` 之后立即写入，带有 `restauracaoPendente`（备份的目的地和尚缺的步骤），并在每个步骤再次写入。下一次发现待办的执行会**恢复**这次恢复，而不是再次迁移。
5. **加密已恢复数据的密钥来自之前的 `.env`。** 至少是 `CREDENTIALS_MASTER_KEY`；新 `.env` 未声明的一切都会回来，但安装程序当场决定的（profiles、broker、Ollama）以及临时密钥的 `_PREVIOUS` 除外。
6. **版本线。** 标记获得 `linha`；没有它，该安装属于上一条线，除非镜像位于 `ghcr.io/viralabs-dev/`。线与线之间的关系是 `nova-linha`，有自己的措辞且默认为是。

## 后果

- 回答 `s` 现在会带回问题所承诺的东西：数据库、仓库、图谱和制品。`z` 仍是在文件夹中保留已证明备份的前提下从零重新安装。
- 被证明的备份与留在文件夹中、供恢复使用的备份是**同一个**。
- `down -v` 之后被中断的迁移不会成为孤儿：下一次 `install.sh` 会恢复它。如果库中已有表，`--banco-vazio` 会拒绝并说明原因——安装程序绝不会在数据之上恢复。
- dump 位于一个已声明的 `0755` 文件夹中：机器上的其他用户可读，但不含主密钥。
- `install-e2e` 需要一个带种子数据的迁移步骤，以便在 tag 上证明这一点；在 PR 中，证明是 `scripts/dev/install-migracao.spec.ts`。
