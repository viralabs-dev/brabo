---
id: paridade-de-traducao
title: Paridade de tradução
---

> ⚠️ Arquivo gerado por `pnpm docs:generate`. Não edite à mão — o próximo build o sobrescreve.

# Paridade de tradução

A fonte é o pt-BR em `docs/` do `brabo` (ADR 0216, ADR 0273), inclusive `docs/reference/**` (ADR 0219); só esta página fica fora. A doc dos repositórios irmãos e as traduções em `i18n/` não contam como fonte. A interface é medida no `brabo-web` e o catálogo da API só avisa no log do `docs:generate`. Uma tradução está **em dia** quando o `traducao_de:` do frontmatter é um commit tão ou mais novo que o último commit da fonte, e **defasada** quando a fonte mudou depois. Sem o campo, ela conta como **sem procedência**. As regras estão em [Localização](../explanation/localizacao.md).

## Documentação

| locale | páginas traduzidas | caracteres traduzidos | em dia | defasadas | sem procedência | ausentes | órfãs |
|---|---|---|---|---|---|---|---|
| `en` | 327 de 357 (91.6%) | 97.2% de 3.459.270 | 311 | 14 | 2 | 30 | 6 |
| `ru` | 327 de 357 (91.6%) | 97.2% de 3.459.270 | 311 | 14 | 2 | 30 | 6 |
| `zh-Hans` | 327 de 357 (91.6%) | 97.2% de 3.459.270 | 311 | 14 | 2 | 30 | 6 |

> **TODO(humano):** revisão nativa por idioma — quem revisou e quando. Ainda não há revisão nativa registrada.

### Defasadas em `en`

- `adr/index.md` (tradução de 2026-11-08)
- `business-rules.md` (tradução de 2026-11-08)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-01.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-02.md` (tradução de 2026-11-06)
- `contribuir/como-escrevemos.md` (tradução de 2026-11-08)
- `explanation/documentation-workflow.md` (tradução de 2026-11-08)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `index.md` (tradução de 2026-11-08)
- `reference/configuration.md` (tradução de 2026-11-08)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-08)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

### Defasadas em `ru`

- `adr/index.md` (tradução de 2026-11-08)
- `business-rules.md` (tradução de 2026-11-08)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-01.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-02.md` (tradução de 2026-11-06)
- `contribuir/como-escrevemos.md` (tradução de 2026-11-08)
- `explanation/documentation-workflow.md` (tradução de 2026-11-08)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `index.md` (tradução de 2026-11-08)
- `reference/configuration.md` (tradução de 2026-11-08)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-08)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

### Defasadas em `zh-Hans`

- `adr/index.md` (tradução de 2026-11-08)
- `business-rules.md` (tradução de 2026-11-08)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-01.md` (tradução de 2026-11-06)
- `business-rules/produto/parte-02.md` (tradução de 2026-11-06)
- `contribuir/como-escrevemos.md` (tradução de 2026-11-08)
- `explanation/documentation-workflow.md` (tradução de 2026-11-08)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `index.md` (tradução de 2026-11-08)
- `reference/configuration.md` (tradução de 2026-11-08)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-08)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

