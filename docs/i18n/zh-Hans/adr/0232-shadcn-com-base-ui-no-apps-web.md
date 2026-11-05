---
traducao_de: cba75d8600bf8985f8a3c8bb3ad62e8bfdac7571
---

# ADR 0232 — `apps/web` 中使用 Base UI 的 shadcn/ui 与 Tailwind 4

## 状态

**已接受。** 2026-10-31（AT-645，AT-636 的第 1 波；所有者 31/10 的决定）。
不编辑 ADR 0074（两种模式下的主题）和 0181（中性调色板）：以它们的 token 为来源。编号 0231 保留给 AT-626。

## 背景

聊天和 AI 界面开始使用 AI Elements 的模式，shadcn 已将其吸收。`apps/web` 目前是基于 `design/tokens.css` 的 CSS Modules，没有 Tailwind，也没有别名 `@/`。主题由 `public/theme-boot.js` 写入 `[data-theme]`；shadcn 期望的是 `.dark`。Brabo 的 token 与 shadcn 的原始变量之间存在命名冲突（`--accent`、`--radius-*`、`--font-mono`）。

## 决定

- **基础：** shadcn/ui，样式 `base-nova`，基于 **Base UI**（`@base-ui/react`），而不是 Radix。Tailwind 4 通过 `@tailwindcss/vite`。
- **主题：** 带赤陶色的中性调色板以及 Space Grotesk、Archivo 和 IBM Plex Mono 字体保留。shadcn 由 Brabo 的 token 来设定主题，绝不反过来。
- **共存：** `*.module.css` 保留到最后的清理。**Tailwind 的 preflight 最后才加入**；在此之前 `src/shadcn.css` 只导入
  `tailwindcss/theme` 和 `utilities`，放在 layers 中（输给没有 layer 的 CSS），使用
  `source(none)`，且仅在 `components/shadcn/` 中使用 `@source`，避免从 `src` 的其余部分生成零散的工具类（`.absolute`、`.container`）。
- **颜色：** `@theme { --color-*: initial }` 以及 `@theme inline`，将语义颜色映射到 token（`primary`→`--accent`、`accent`→`--surface-2`……）。项目**不**声明 shadcn 的原始变量。`--radius-*` 和 `--font-mono`
  已经属于 Brabo，无 layer 的 `:root` 优先于 Tailwind 的默认值。
- **深色：** 基于 `[data-theme='dark']` 的 `@custom-variant dark`。
- **别名** `@/` → `apps/web/src`（vite 和 tsconfig）；现有代码不重写。`components.json`：`aliases.ui` = `@/components/shadcn`（不是
  `components/ui`，那是本项目自有的基础组件），`utils` = `@/lib/utils`（`cn`）。
- **依赖**，各附理由：
  - `tailwindcss` 和 `@tailwindcss/vite`：shadcn 工具类的引擎；
  - `@base-ui/react`：组件之下无样式的基础组件；
  - `class-variance-authority`：被复制组件的变体；
  - `clsx` 和 `tailwind-merge`：`cn`，用于解决类名冲突；
  - `lucide-react`：shadcn `iconLibrary` 的图标（尚未使用）。
- **Bundle：** 在 `codeSplitting.groups` 的允许列表中加入 `vendor-ui` 组
  （Base UI、cva、clsx、tailwind-merge、lucide）。
- **最小验证：** `components/shadcn/button.tsx`（`base-nova` registry，替换了 `cn` 的导入，并把引用 `var(--secondary)`/`var(--foreground)`
  换成 Brabo 的 token），未在界面中使用，附带测试。

## 后果

- 没有任何界面改变。全局 CSS 因主题 layer 和 Button 的工具类而增长；初始 chunk 的 JS 不变（Button 没有导入者）。
- shadcn 的新组件在 `components/shadcn/` 中诞生；CLI 会尝试运行
  `pnpm add`，在 PATH 里没有 `pnpm` 时可能失败，此时文件取自 registry 并手工调整。
- 不在本波内：自有适配器、ai-elements 模式、界面、preflight 以及移除 `module.css`。
