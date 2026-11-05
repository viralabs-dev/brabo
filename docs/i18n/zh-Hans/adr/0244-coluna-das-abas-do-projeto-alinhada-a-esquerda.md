---
traducao_de: 4eec59c50143afbc7650e5d4d564efd4167f88d1
---

# ADR 0244 — 项目标签页的列左对齐

- **状态：** 已接受
- **日期：** 2026-11-03
- **修订：** [ADR 0078](0078-moldura-de-tela-e-o-registro-de-abas-diverge-do-handoff.md) 中关于内容列在 1040px 处居中的部分。

## 背景

项目标签页把内容绘制在居中的 1040px 列中（`margin: 0 auto`），而标题则靠左。所有者（AT-720，11 月 3 日）要求内容与标题对齐。

## 决定

1. `ProjectPage.module.css` 的 `.body` 保留 `max-width: 1040px`（阅读宽度），去掉居中：该列从左侧开始。
2. 代码标签页和 `semRespiro` 标签页不使用该列（ADR 0211/0241），不变。

## 后果

- 在宽屏上右侧会留出空白，这是有意的。
