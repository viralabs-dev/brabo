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
| `en` | 302 de 1212 (24.9%) | 27.4% de 13.678.412 | 279 | 22 | 1 | 910 | 0 |
| `ru` | 302 de 1212 (24.9%) | 27.4% de 13.678.412 | 279 | 22 | 1 | 910 | 0 |
| `zh-Hans` | 302 de 1212 (24.9%) | 27.4% de 13.678.412 | 279 | 22 | 1 | 910 | 0 |

> **TODO(humano):** revisão nativa por idioma — quem revisou e quando. Ainda não há revisão nativa registrada.

### Defasadas em `en`

- `adr/0260-doc-dos-repos-de-codigo-so-em-ingles.md` (tradução de 2026-11-05)
- `adr/index.md` (tradução de 2026-11-04)
- `architecture.md` (tradução de 2026-10-16)
- `business-rules.md` (tradução de 2026-10-15)
- `business-rules/autenticacao.md` (tradução de 2026-10-11)
- `business-rules/ci.md` (tradução de commit inexistente)
- `business-rules/custo.md` (tradução de 2026-10-15)
- `business-rules/produto.md` (tradução de 2026-10-15)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-10-15)
- `explanation/branching-policy.md` (tradução de commit inexistente)
- `explanation/cadeia-de-suprimentos-do-ci.md` (tradução de commit inexistente)
- `explanation/gates.md` (tradução de 2026-10-15)
- `explanation/modelo-de-time.md` (tradução de 2026-10-15)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `getting-started.md` (tradução de 2026-10-15)
- `glossary.md` (tradução de 2026-10-15)
- `intro.md` (tradução de 2026-10-15)
- `reference/brb.md` (tradução de 2026-10-15)
- `reference/configuration.md` (tradução de 2026-10-16)
- `reference/events.md` (tradução de 2026-10-16)
- `reference/internal-api.md` (tradução de 2026-10-15)
- `reference/rulesets.md` (tradução de commit inexistente)

### Defasadas em `ru`

- `adr/0260-doc-dos-repos-de-codigo-so-em-ingles.md` (tradução de 2026-11-05)
- `adr/index.md` (tradução de 2026-11-04)
- `architecture.md` (tradução de 2026-10-16)
- `business-rules.md` (tradução de 2026-10-15)
- `business-rules/autenticacao.md` (tradução de 2026-10-11)
- `business-rules/ci.md` (tradução de commit inexistente)
- `business-rules/custo.md` (tradução de 2026-10-15)
- `business-rules/produto.md` (tradução de 2026-10-15)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-10-15)
- `explanation/branching-policy.md` (tradução de commit inexistente)
- `explanation/cadeia-de-suprimentos-do-ci.md` (tradução de commit inexistente)
- `explanation/gates.md` (tradução de 2026-10-15)
- `explanation/modelo-de-time.md` (tradução de 2026-10-15)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `getting-started.md` (tradução de 2026-10-15)
- `glossary.md` (tradução de 2026-10-15)
- `intro.md` (tradução de 2026-10-15)
- `reference/brb.md` (tradução de 2026-10-15)
- `reference/configuration.md` (tradução de 2026-10-16)
- `reference/events.md` (tradução de 2026-10-16)
- `reference/internal-api.md` (tradução de 2026-10-15)
- `reference/rulesets.md` (tradução de commit inexistente)

### Defasadas em `zh-Hans`

- `adr/0260-doc-dos-repos-de-codigo-so-em-ingles.md` (tradução de 2026-11-05)
- `adr/index.md` (tradução de 2026-10-16)
- `architecture.md` (tradução de 2026-10-16)
- `business-rules.md` (tradução de 2026-10-15)
- `business-rules/autenticacao.md` (tradução de 2026-10-11)
- `business-rules/ci.md` (tradução de commit inexistente)
- `business-rules/custo.md` (tradução de 2026-10-15)
- `business-rules/produto.md` (tradução de 2026-10-15)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-10-15)
- `explanation/branching-policy.md` (tradução de commit inexistente)
- `explanation/cadeia-de-suprimentos-do-ci.md` (tradução de commit inexistente)
- `explanation/gates.md` (tradução de 2026-10-15)
- `explanation/modelo-de-time.md` (tradução de 2026-10-15)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `getting-started.md` (tradução de 2026-10-15)
- `glossary.md` (tradução de 2026-10-15)
- `intro.md` (tradução de 2026-10-15)
- `reference/brb.md` (tradução de 2026-10-15)
- `reference/configuration.md` (tradução de 2026-10-16)
- `reference/events.md` (tradução de 2026-10-16)
- `reference/internal-api.md` (tradução de 2026-10-15)
- `reference/rulesets.md` (tradução de commit inexistente)

## Interface

Chaves de `apps/web/src/locales/<locale>/` contra o pt-BR. Chave plural conta uma vez por forma de `Intl.PluralRules` do locale.

| locale | formas de plural | chaves presentes | plurais incompletos |
|---|---|---|---|
| `en` | one, other | 2692 de 2692 (100.0%) | 0 |
| `ru` | one, few, many, other | 2940 de 2940 (100.0%) | 0 |
| `zh-Hans` | other | 2568 de 2568 (100.0%) | 0 |

## API (Redoc)

Textos distintos da referência da API (`/reference/api/`) contra o catálogo `docs/i18n/<locale>/openapi-textos.json` (ADR 0220). A fonte é o texto dos decorators da api, quase todo em inglês: `pt-BR`, `ru` e `zh-Hans` traduzem todos, e `en` só os que estão em pt-BR (diacrítico do português ou palavra funcional como "não", "para", "que"). Não soma aos caracteres das páginas.

| locale | textos traduzidos |
|---|---|
| `pt-BR` | 1324 de 1451 (91.2%) |
| `en` | 1 de 1 (100.0%) |
| `ru` | 1324 de 1451 (91.2%) |
| `zh-Hans` | 1324 de 1451 (91.2%) |

