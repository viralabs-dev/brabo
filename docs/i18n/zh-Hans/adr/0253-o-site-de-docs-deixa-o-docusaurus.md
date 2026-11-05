---
traducao_de: c87b5a0707f3fda92677bd57825eeef69194dbbe
---

# ADR 0253 — 文档站点离开 Docusaurus

- **状态：** 已接受
- **日期：** 2026-11-04
- **主题：** `docs`
- **引用：** ADR [0117](0117-lockfile-proprio-para-o-website.md)、[0206](0206-referencia-da-api-numa-pagina-redoc.md)、[0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) 和 [0220](0220-api-traduzida-por-catalogo.md)。均不被编辑。

## 背景

文档站点是读取 `docs/` 的 Docusaurus 3（AT-662，EP-031，所有者 2026 年 11 月 2 日的决定）。该框架带来的依赖树从未进入任何镜像，并且已经要求独立的 lockfile（0117）和十九个 overrides；搜索索引每种语言约 25 MB，而主题遵循的是 Infima，而不是产品的设计系统。自有生成器的模板已经存在于 Smartsky 项目的 `site/` 中（约 1,3 千行，`markdown-it`，无框架）。

## 决定

1. **自有生成器**位于 `scripts/docs/site/`（ESM，`markdown-it` 和 `shiki` 在 `scripts/package.json` 中），输出到 `build/docs-site/`，使用相对路径，并保持与当前站点**相同**的 URL 和 `{#id}` 锚点（`x.md` 变为 `x.html`，`pasta/index.md` 变为 `pasta.html`，`intro` 变为 `index.html`，其他语言位于 `/<locale>/` 之下）。每种语言都用**完整**的页面集合构建（译文，或同一地址上的 pt-BR 源文），因此链接永远不会离开所属语言。
2. **API 参考保留在 Redoc 3 中**，规范文本由 0220 的哈希目录翻译（不变），并明确**关闭遥测**。Redoc 3 移除了 `labels` 选项：Redoc **界面**的标签（Request samples、Responses……）在四种语言中都回到英文，所有者接受了这一代价。0206 更换渲染器（不再用 redocusaurus），0220 保留目录。
3. **译文移至 `docs/i18n/<locale>/`**，不再位于 `website/i18n/…/docusaurus-plugin-content-docs/current/`（对等性、`openapi-textos.json` 和指南都沿用新路径）。该路径是生成器的常量。
4. **子串搜索**，经规范化，无词干提取，每种语言一个索引，仅在用户搜索时加载；API 页面保留 Redoc 的搜索。
5. **0117 失去其对象**：`website/` 不再有 Docusaurus；lockfile 的隔离只对 Redoc 的依赖树继续有效。
6. **保留：** 0073 的按阶梯发布、0216 的四种语言和 pt-BR 源文、非 `main` 的 `noindex`、测试阶段的提示、"编辑此页"以及"最后更新"。

## 后果

- 失去 lunr 搜索的排名、目标页面上的词语高亮以及 `search.html`。
- 迁移分阶段进行：生成器并行运行（`pnpm docs:site`），直到切换 CI 和部署，这是一个单独的 PR。
- 引用 Docusaurus 的 CLAUDE.md 和上下文部分在切换时改变，而不是之前。
