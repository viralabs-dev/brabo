---
traducao_de: c3b4a27053c341eae6d6d88ff06651d79e7dccec
---

# ADR 0243 — 不可逆的后果可以放在危险按钮中

- **状态：** 已接受
- **日期：** 2026-11-03
- **修订：** `design/COMPONENTS.md` 中"?"的规则（"不可逆的后果始终可见"），仅针对执行模式转换的提示，并扩展 [ADR 0240](0240-o-motivo-de-controle-inerte-mora-num-ponto-de-interrogacao-nos-containers.md) 的模式。

## 背景

`execution_mode` 转换的提示（RN-560，AT-144）说明转换留下什么、丢失什么、拒绝什么以及带走什么。它曾是始终显示在界面上的多行 `Alert`。所有者（AT-719，11 月 2 日）要求该节简短，并把提示放进一个带危险图标的说明按钮。该规则所保护的是后果在点击"转换"**之前**被告知，而不是文字必须占据该节。

## 决定

1. 创建 `components/ui/Perigo.tsx`，是 `Ajuda` 的兄弟组件：同样带 `openOnHover` 的 Popover（点击、键盘和悬停均可打开；Esc 关闭），图标 `TriangleAlert`（`aria-hidden`）使用 token `--danger` 的颜色。可访问名称为"注意：{主题}"（`ui:perigo.rotulo`）。
2. 该按钮位于模式选择器旁边，出现的条件与提示出现时**相同**，popover 承载整个提示，内容和条件均不变（RN-560、AT-144、AT-372）。风险由始终可见的图标宣告；文字在 popover 中。
3. 该例外**仅**适用于模式转换的提示。`Perigo` 的其他用法需要另一个 ADR。

## 后果

- `design/COMPONENTS.md` 记录 `Perigo` 及例外的界限。
- "?"的规则在其余一切之处仍然有效：不可逆的后果和绝对上限保持为可见文字。
