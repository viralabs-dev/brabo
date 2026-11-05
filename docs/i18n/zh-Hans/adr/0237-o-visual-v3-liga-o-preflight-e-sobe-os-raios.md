---
traducao_de: 0cbbd50333145ac8c13420e50db0d94e83d1748f
---

# ADR 0237 — 视觉 v3 启用 preflight 并加大圆角

- **状态：** 已接受
- **日期：** 2026-11-02
- **修订：** [ADR 0232](0232-shadcn-com-base-ui-no-apps-web.md)，仅涉及
  preflight（"在最后清理之前不启用 preflight"）。对 Brabo 设计系统的忠实度保持不变。

## 背景

所有者评估了三个视觉预览（v1、v2 和 v3，位于 vault 的 `13-design`）。2026 年 11 月 2 日他批准了 v3，即折中方案：采用 Tailwind 的 preflight 和 shadcn 的圆角，同时保留 Brabo 的赤陶色、字体排印和表面。

## 决定

1. `src/shadcn.css` 在 `base` 层导入 `tailwindcss/preflight`。由于 `index.css` 不在任何 layer 中，它优先于 preflight。
2. `index.css` 恢复被 preflight 清零的内容：h1–h6 的字号、h4–h6 的字重与外边距，以及 `p`、`ul` 和 `ol` 的外边距（列表带标记和缩进），仅针对**没有** `class` 的元素。
3. 圆角源自 `design/tokens.css` 中的 `--radius: 0.625rem`：
   `--radius-sm/md/lg` = 6/8/10px，`--r-xs/sm` = 6/8px。`--radius-full` 和
   `--r-pill` 不变。`--r-sm` 和 `--radius-sm` 仍是不同的档位。

## 后果

- 在 CSS 模块中使用字面圆角的界面不变；使用 token 的界面变得更圆。
- 对比度底线不变。
