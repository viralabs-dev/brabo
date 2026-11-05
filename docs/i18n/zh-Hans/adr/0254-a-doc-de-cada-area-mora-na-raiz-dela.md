---
traducao_de: 2fc4f085eec24047951a35401481ec08fd740a4c
---

# ADR 0254 — 每个领域的文档位于它自己的根目录

- **状态：** 已接受
- **日期：** 2026-11-04
- **主题：** `docs`
- **引用：** ADR [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md)、[0252](0252-o-brabo-vira-um-conjunto-de-repositorios.md) 和 [0253](0253-o-site-de-docs-deixa-o-docusaurus.md)。均不被编辑。

## 背景

0252 按领域把 Brabo 拆分为多个仓库，0253 给了站点一个自有的生成器。如果所有文档都在 `docs/` 中，每个新仓库诞生时都不会有自己代码的文档，而业务规则（RN）位于三个混杂了多个领域的大文件中（所有者 2026 年 11 月 2 日的决定，AT-688 问题 11，11 月 4 日确认，AT-693）。

## 决定

1. **每个领域的文档位于 `<raiz>/docs/`。** 根目录列表在 `scripts/docs/raizes-de-doc.mjs` 中；`docs/` 仍是聚合者（"产品"）。
2. **站点是各根目录的并集树：** 每个文件保持它在 `docs/` 中原有的**相同**相对路径（`reference/permissions.md` 变为 `apps/api/docs/reference/permissions.md`），公开 URL 不变，页面之间的链接以并集的坐标书写，而不是磁盘的坐标。不同根目录之间 slug 重复会导致失败。
3. **RN 按领域。** 每条 RN 位于 `<raiz>/docs/business-rules/<raiz>.md`，取决于哪个根目录承载正文中**第一个** `caminho:N` 引用（没有引用则取第一个被引用的路径；都没有则归产品）。编号是**全局**且唯一的（下一个是所有根目录之和的最大值），锚点 `{#rn-NNN}` 不变。
4. **`docs/business-rules.md` 变为生成的索引**（每条 RN 一行，链接到承载页面，使 `business-rules.html#rn-NNN` 继续可解析）。`custo.md` 和 `autenticacao.md` 变为**冻结**的存根，只写一次。新增检查：同一个 RN 编号出现在两个文件中会失败。
5. **来源与检查。** `scripts/docs/fontes.yml`（或由 `BRABO_FONTES` 指向的文件）把逻辑名称映射到根目录。检查增加 `--raiz <nome>`：**按**根目录运行只取决于它自己的内容（RN 的锚点、内部的 `caminho:N` 引用、docmap 的 glob、drift），**只**在聚合者上运行跨根目录的内容（计数、RN 的唯一性与索引、外部引用、对等性、各 locale 之间的链接、runbook 的流程）。在 monorepo 中，`pnpm docs:check` 全部运行。
6. **译文**位于 `<raiz>/docs/i18n/<locale>/<相同路径>`；`traducao.json` 仍然是**一个**，位于聚合者。移动文件的变更按构造会使所有译文"过期"，因此分**两次**提交：变更本身，以及第二次提交，用第一次的 SHA 重新盖章 `traducao_de`，只针对原本是最新的那些。
7. **RAG golden-set 的语料保持冻结**（ADR 0132）：文档位置的变化不能重写基线。

## 后果

- 将来每个仓库都带着自己的文档和自己的 RN；站点仍然只有一个，没有任何 URL 改变。
- **代价：** 跨根目录的链接在站点上可用，在 GitHub 的预览中会 404（链接的路径是并集的，而不是磁盘的）。
- 写 RN 的人需要知道拥有该代码的领域；`docs:check` 会指出重复的 RN、缺失的锚点和不匹配的引用。
- 文件和约 1,3 万个页面间链接的迁移，是紧接本 ADR 之后、同一个 PR 中的单个幂等脚本。
