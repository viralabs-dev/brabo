---
traducao_de: 09eb04ce992b84f7116ad74aacaf73d44800624b
---

# ADR 0234 — Code Block 的 `shiki` 与 Chart 的 `recharts`，始终动态加载

- **状态：** 已接受
- **日期：** 2026-11-01
- **修订：** 通过正则实现代码高亮（`MarkdownMessage`、代码标签页）和自有 SVG 图表（`SpendCharts.tsx`）所依据的"无依赖"理由；
  [ADR 0232](0232-shadcn-com-base-ui-no-apps-web.md)
  仍然完全有效
- **先前背景：** [ADR 0068](0068-diagrama-c4-do-arquiteto.md) 和
  [ADR 0103](0103-runner-local-execucao-na-maquina-do-usuario.md)（把重依赖放在 `import()` 之后的模式）、[ADR 0074](0074-tema-alcancavel-e-o-boot-sob-csp.md) 和
  [ADR 0181](0181-tema-preto-neutro.md)（两种主题，对比度作为底线）

## 背景

采用 shadcn/AI Elements（AT-636）带来四个额外项，所有者在 31/10 放行（决定 4）：⌘K、Code Block 的 `shiki`、开销 Chart 的 `recharts` 和 Questionnaire 的 `@shadcn/react`。⌘K 没有引入新依赖（使用已安装的 `@base-ui/react` 的 `Autocomplete`，而不是会带来 Radix 的 `cmdk`），`@shadcn/react` 已在 AT-653 中加入。剩下两个依赖，其体积在 01/11 的调研中已测量（esbuild + gzip）：`shiki@4.5.0`（核心约 55 KB gz，每种语言 0,1 到 16 KB；44 个传递包；MIT）和
`recharts@3.8.0`（约 105 KB gz；37 个许可宽松的传递依赖）。`pnpm
audit --prod`：两者均零漏洞。

## 决定

1. 两者以**精确**版本进入 `apps/web`，**绝不**进入初始 JS，也不进入 `codeSplitting.groups`（允许列表）：只通过 `import()`/`React.lazy`，放在使用者的 chunk 中。
2. `shiki` 位于 `lib/realce-shiki.ts` 之后：`shiki/core` 配 JS 版正则引擎（无 WASM），语言按需加载，使用带 `var(--syntax-*)` 的自有主题（无十六进制，两种主题皆然）。当前的正则高亮作为回退保留：在 `shiki` 加载期间，以及它不认识的语言。
3. `recharts` 位于 `GraficoDeGastoPorDia.tsx`（lazy）之后，只用于每日开销序列，以现有 SVG 作为回退，并在旁边提供替代表格。它不能被 `SpendCharts.tsx` 导入，因为"会话"标签页也导入后者。
4. 图表和高亮的颜色来自 token（`var(--accent)`、`var(--syntax-*)`）；必须离开 CSS 的颜色经由 `lib/tokens-padrao.ts`。

## 后果

- 初始 JS 不变；不打开开销界面或代码块的人不会下载任何新内容。每个涉及这些界面的 PR 都要在前后测量 chunk。
- 需要维护两个依赖，若出现传递依赖的告警则使用 `overrides`（`pnpm-workspace.yaml` 的规范）。
- 若其中一个被移除，回退方案（正则、SVG）已经在代码中。
