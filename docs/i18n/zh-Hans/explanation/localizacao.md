---
id: localizacao
title: 本地化
description: Brabo 的四种语言（pt-BR 作为来源，以及 en、ru 和 zh-Hans）、语言代码、复数形式、语言如何解析、缺失文本如何处理，以及永不翻译的内容。
traducao_de: 2d508b95c379df9edb51cc94523fd3f05edd83b2
---

# 本地化

Brabo 在文档和界面中使用四种语言，而**巴西葡萄牙语是这两个产品的来源和默认语言**（[ADR 0216](../adr/0216-quatro-idiomas-com-pt-br-como-fonte.md)）。所有新文本都以 pt-BR 写成；其他语言是它的翻译。

**例外（ADR [0260](../adr/0260-doc-dos-repos-de-codigo-so-em-ingles.md)）：** 这条规则只适用于面向客户的入口 `brabo`。十个代码仓库的文档**只用英文**：英文的同级页面在 frontmatter 中带 `idioma_original: en`，且没有 `docs/i18n/`。它们的 `CLAUDE.md` 和 `.claude/` 保持 pt-BR。

## 语言与代码 {#idiomas-e-códigos}

| 语言 | 代码 | 复数形式（`Intl.PluralRules`） | 说明 |
|---|---|---|---|
| Português (Brasil) | `pt-BR` | one, many, other（界面中另须 `_zero`） | 来源 |
| English | `en` | one, other | [英语说明](localizacao-en.md) |
| Русский | `ru` | one, few, many, other | [俄语说明](localizacao-ru.md) |
| 简体中文 | `zh-Hans` | other | [中文说明](localizacao-zh-hans.md) |

这些代码在 Docusaurus、i18next、`<html lang>` 和 `users.locale` 中是一样的。站点的本地搜索使用它自己的代码（`pt`、`en`、`ru`、`zh`）。

在站点上，语言选择器位于顶部栏（`website/docusaurus.config.ts` 中的 `localeDropdown`），使用上表中的标签，并跳转到所选语言的同一页面；每种语言都有自己的路径（`/en/`、`/ru/`、`/zh-Hans/`；pt-BR 位于该阶段的根路径）。

## 界面中的语言解析 {#resolução-do-idioma-na-interface}

账户中保存的选择**始终优先**，绝不会被检测结果覆盖。没有选择时，由浏览器语言给出建议（`resolverIdiomaDoNavegador`，`apps/web/src/lib/idioma.ts`）：

- `pt*` → `pt-BR`；
- `zh`、`zh-CN`、`zh-SG` 和 `zh-Hans*` → `zh-Hans`；
- `ru*` → `ru`；
- `en*` → `en`；
- 其他任何语言——德语、繁体中文（`zh-TW`、`zh-Hant`）——→ `pt-BR`。

agent **回答**所用的语言是另一项偏好，有自己的机制（ADR 0177），不取决于界面语言。

## 缺失的文本 {#o-texto-que-falta}

- **在站点中**，某个 locale 下没有翻译的页面会在同一地址以 pt-BR 来源提供，顶部的横幅用读者的语言**说明**这一点。翻译之后来源又发生变化的已翻译页面，会说明翻译日期以及原文已改变。
- **在站点上，带 `idioma_original: en` 的同级页面**在 `/en/` 中就是原文本身，没有横幅；在 pt-BR、`ru` 和 `zh-Hans` 中，站点提供同一份英文原文，并带横幅“此页仅有英文版本”。如果同级仓库仍有该语言的译文，则在该语言中生效（逐页的混合状态）。
- **在界面中**，文本不会缺失：键和复数的一致性是被测量的，`fallbackLng` 是 pt-BR。

每个已翻译页面的 frontmatter 中都带有 `traducao_de: <SHA>`——它所翻译的来源的最后一次提交。正是它区分“最新”与“过时”。当前的测量见[翻译一致性](../reference/paridade-de-traducao.md)，由 `pnpm docs:generate` 生成。

侧边栏“参考”中的标签和顶部导航栏的标签来自 `website/sidebars.ts` 以及各语言的 `navbar.json`/`current.json`；自 ADR 0219 起，`reference/` 页面的内容（包括生成块）也会翻译，只有平价页面除外。

## 永不翻译的内容 {#o-que-nunca-se-traduz}

- **Brabo**，以及[术语表](../glossary.md)中的 agent 名称和角色名称（Criativo、PO、Arquiteto、Dev Lead、Infra Lead、`owner`、`maintainer`…）；
- 用户数据（项目名称、消息、构件）；
- 命令、路径、变量名、分支名和事件名；
- RN 和 ADR 的编号以及锚点 `{#rn-NNN}`。
