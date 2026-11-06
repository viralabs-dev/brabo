---
id: paridade-de-traducao
title: Paridade de tradução
---

> ⚠️ Arquivo gerado por `pnpm docs:generate`. Não edite à mão — o próximo build o sobrescreve.

# Paridade de tradução

A fonte é o pt-BR em `docs/` (ADR 0216), inclusive `docs/reference/**` (ADR 0219); só esta página fica fora. Uma tradução está **em dia** quando o `traducao_de:` do frontmatter é um commit tão ou mais novo que o último commit da fonte, e **defasada** quando a fonte mudou depois. Sem o campo, ela conta como **sem procedência**. As regras estão em [Localização](../explanation/localizacao.md).

## Documentação

| locale | páginas traduzidas | caracteres traduzidos | em dia | defasadas | sem procedência | ausentes | órfãs |
|---|---|---|---|---|---|---|---|
| `en` | 306 de 1229 (24.9%) | 27.3% de 13.792.596 | 296 | 9 | 1 | 923 | 0 |
| `ru` | 306 de 1229 (24.9%) | 27.3% de 13.792.596 | 296 | 9 | 1 | 923 | 0 |
| `zh-Hans` | 306 de 1229 (24.9%) | 27.3% de 13.792.596 | 296 | 9 | 1 | 923 | 0 |

> **TODO(humano):** revisão nativa por idioma — quem revisou e quando. Ainda não há revisão nativa registrada.

### Defasadas em `en`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `explanation/branching-policy.md` (tradução de 2026-11-06)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `intro.md` (tradução de 2026-11-04)
- `reference/events.md` (tradução de 2026-11-06)
- `reference/rulesets.md` (tradução de 2026-11-05)

### Defasadas em `ru`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `explanation/branching-policy.md` (tradução de 2026-11-06)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `intro.md` (tradução de 2026-11-04)
- `reference/events.md` (tradução de 2026-11-06)
- `reference/rulesets.md` (tradução de 2026-11-05)

### Defasadas em `zh-Hans`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `explanation/branching-policy.md` (tradução de 2026-11-06)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `intro.md` (tradução de 2026-11-04)
- `reference/events.md` (tradução de 2026-11-06)
- `reference/rulesets.md` (tradução de 2026-11-05)

## Interface

Chaves de `apps/web/src/locales/<locale>/` contra o pt-BR. Chave plural conta uma vez por forma de `Intl.PluralRules` do locale.

| locale | formas de plural | chaves presentes | plurais incompletos |
|---|---|---|---|
| `en` | one, other | 2693 de 2693 (100.0%) | 0 |
| `ru` | one, few, many, other | 2941 de 2941 (100.0%) | 0 |
| `zh-Hans` | other | 2569 de 2569 (100.0%) | 0 |

## API (Redoc)

Textos distintos da referência da API (`/reference/api/`) contra o catálogo `docs/i18n/<locale>/openapi-textos.json` (ADR 0220). A fonte é o texto dos decorators da api, quase todo em inglês: `pt-BR`, `ru` e `zh-Hans` traduzem todos, e `en` só os que estão em pt-BR (diacrítico do português ou palavra funcional como "não", "para", "que"). Não soma aos caracteres das páginas.

| locale | textos traduzidos |
|---|---|
| `pt-BR` | 1324 de 1455 (91.0%) |
| `en` | 1 de 1 (100.0%) |
| `ru` | 1324 de 1455 (91.0%) |
| `zh-Hans` | 1324 de 1455 (91.0%) |

