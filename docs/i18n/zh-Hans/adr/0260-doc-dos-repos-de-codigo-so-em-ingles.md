---
traducao_de: 12ad1a2f3a2d9318e9a9ea0443fa78af6a98079d
---

# ADR 0260 — 代码仓库的文档只用英文；站点以横幅提供英文原文

- **状态：** 已接受
- **日期：** 2026-11-05
- **主题：** `docs`
- **参考：** 修订 ADR [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md)（pt-BR 原文只适用于 `brabo`）、[0219](0219-referencia-entra-na-traducao.md)（`idioma_original: en` 契约成为同级仓库的常规路径）和 [0220](0220-api-traduzida-por-catalogo.md)（目录迁到 `brabo`）。AT-745、EP-033，所有者 2026-11-05 的决定：“唯一会有多种语言的文档是面向客户的入口，即 `brabo`；其余仓库，一律英文”。

## 背景

ADR 0216 让 pt-BR 成为全部文档的原文，`en`、`ru` 和 `zh-Hans` 是 `docs/i18n/` 下的译文。拆分为十一个仓库（EP-033）之后，十个代码仓库背着这条规则，却没有需要它的读者：它们的原文 94% 到 100% 是 pt-BR，`i18n/en` 副本停在 10 月 15 日且已过时（api 缺 47 条 RN，engine 缺 22 条，web 缺 22 条），也没有任何同级仓库检查语言。只有 `brabo` 是客户的入口并发布站点。

使之成为可能的契约早已存在：frontmatter 中的 `idioma_original: en`（AT-564、ADR 0219），由 `faixa-de-traducao-check.mjs` 读取，但 `paginas.mjs` 不读。

## 决定

1. **10 个代码仓库的文档只用英文。** 包括 `docs/`、`README`、`CHANGELOG` 和社区文件。新文档和新 RN 用英文撰写，且没有 `docs/i18n/`。它们的 `CLAUDE.md` 和 `.claude/` 保持 pt-BR（所有者的决定）。代码注释和提交信息不受本 ADR 影响。
2. **`brabo` 保持多语言**（pt-BR 原文、`en`、`ru`、`zh-Hans`，ADR 0216），包括位于 `scripts/ci/docs/` 的 `ci` 领域文档。
3. **英文的同级页面带 `idioma_original: en`。** 在 `/en/` 中站点提供原文本身，没有横幅。在 pt-BR、`ru` 和 `zh-Hans` 中，它提供同一份英文原文，并带新的横幅“此页仅有英文版本”。如果同级仓库仍有某个语言的译文，该译文在该语言中生效：机制接受逐页的混合状态。
4. **随机制一起的内容：**
   - 每种语言的 RN 索引在其文件存在时使用译文，不存在时使用原文，使同级仓库的 RN 不会丢失；
   - 原文为 `idioma_original: en` 的生成块以英文文本输出；
   - `paridade-de-traducao` 不把带 `idioma_original: en` 的页面算作可翻译（AT-735 因此失去对象）；
   - `docs:check` 锚定到代码的同级仓库正文中的句子（`contagens-do-codigo.mjs`、runbook）接受 pt-BR 或英文文本，避免转换使检查失明。
5. **API 参考保持翻译。** 所有者保留了四种语言的 Redoc 页面；`openapi-textos.json` 目录离开 `brabo-api`，放在 `brabo` 的 `docs/i18n/<locale>/` 中。

## 后果

- 每个同级仓库在自己的通道中把文档转换为英文，逐条 RN 把 `i18n/en` 升为原文并删除 `docs/i18n/`；同级仓库的 `ru` 和 `zh-Hans` 被删除（git 保留）。
- 同级仓库转换之前，站点显示带常规横幅的 pt-BR 原文。转换之后，俄语或中文读者看到带新横幅的英文。
- `links.mjs` 中的 `RNS_SEM_TRADUCAO` 保留：索引按文件而不是按 RN 回退到原文，所以部分译文中缺失的 RN 仍会让该语言的锚点失效，直到同级仓库的通道删除 `i18n/`。
- **守卫已实现（第 201 轮）：** `docs:check` 调用的 `scripts/docs/idioma-dos-irmaos.mjs` 会拒绝同级文档根中没有 `idioma_original: en` 的 `.md` 页面，以及同级文档根中的任何 `i18n/`，并指出文件和本 ADR。`brabo` 自身的根（`docs/`、`scripts/ci/docs/`）仍为多语言。pt-BR 计数器（代码、引文、URL 和链接之外的功能词与 `ção`/`ções`）在已声明 `en` 的页面仍有葡萄牙语正文时只警告、不拒绝；对当前文档，它报告零行。

### 翻译通道要复制的英文句子

下表是新模式识别的句子。数字用小写拼写（比较忽略大小写）。

| 文件（仓库） | pt-BR 句子 | 英文句子 |
|---|---|---|
| `deploy/docs/runbook.md` (infra) | `as cinco imagens que o produto publica já estão resolvidas` | `the five images the product publishes are already resolved` |
| `apps/api/docs/reference/git-providers.md` (api) | `O contrato tem **quinze operações** —` | `The contract has **fifteen operations** —` |
| `apps/api/docs/reference/git-providers.md` (api) | `implementar todas as quinze operações, declarando` | `implement all fifteen operations, declaring` |
| `apps/api/docs/reference/artifacts.md` (api), no frontmatter | `description: Os doze schemas de artefato` | `description: The twelve artifact schemas` |
| RN (infra) | `- as **cinco imagens** são assinadas **por DIGEST**` | `- the **five images** are signed **by DIGEST**` |
| RN (infra) | `- as cinco imagens vêm de **variável obrigatória**` | `- the five images come from a **required variable**` |

`.claude/rules/broker-e-containers.md`（infra）的模式仍只用 pt-BR，因为 `.claude/` 保持 pt-BR。

## 考虑过的替代方案

- **在其他语言中不带横幅地提供英文同级页面。** 否决：俄语读者需要知道该页面不是他们的语言。
- **在 `ru` 和 `zh-Hans` 中隐藏仅英文页面。** 否决：页面之间的链接会断，搜索会丢失技术参考。
- **保留同级仓库的三种译文。** 所有者否决：每次改动三份副本，无人阅读，且已经过时。

## 参考

- [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md)、[0219](0219-referencia-entra-na-traducao.md)、[0220](0220-api-traduzida-por-catalogo.md)。
