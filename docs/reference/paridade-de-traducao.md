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
| `en` | 310 de 338 (91.7%) | 97.3% de 3.726.389 | 276 | 32 | 2 | 28 | 4 |
| `ru` | 310 de 338 (91.7%) | 97.3% de 3.726.389 | 276 | 32 | 2 | 28 | 4 |
| `zh-Hans` | 310 de 338 (91.7%) | 97.3% de 3.726.389 | 276 | 32 | 2 | 28 | 4 |

> **TODO(humano):** revisão nativa por idioma — quem revisou e quando. Ainda não há revisão nativa registrada.

### Defasadas em `en`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `explanation/achados-execucao-real.md` (tradução de 2026-11-04)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-11-04)
- `explanation/auditoria-visual-rodada-29.md` (tradução de 2026-11-04)
- `explanation/backlog.md` (tradução de 2026-11-04)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/execucao-real-hello-world.md` (tradução de 2026-11-04)
- `explanation/fase-28-pasta-do-usuario.md` (tradução de 2026-11-04)
- `explanation/fase-29-instalacao-de-uma-linha.md` (tradução de 2026-11-04)
- `explanation/fase-30-runner-por-maquina.md` (tradução de 2026-11-04)
- `explanation/historico-de-fases.md` (tradução de 2026-11-04)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `explanation/medicao-do-idioma.md` (tradução de 2026-11-04)
- `explanation/medicao-do-jev.md` (tradução de 2026-11-04)
- `explanation/modelo-de-time.md` (tradução de 2026-11-04)
- `explanation/primeiro-dogfooding.md` (tradução de 2026-11-04)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `explanation/validacao-fase-12.md` (tradução de 2026-11-04)
- `explanation/validacao-real.md` (tradução de 2026-11-04)
- `getting-started.md` (tradução de 2026-11-04)
- `glossary.md` (tradução de 2026-11-04)
- `intro.md` (tradução de 2026-11-04)
- `reference/configuration.md` (tradução de 2026-11-05)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-04)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-04)
- `tutorials/orquestrar-repositorios/index.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/monte-o-seu.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

### Defasadas em `ru`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `explanation/achados-execucao-real.md` (tradução de 2026-11-04)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-11-04)
- `explanation/auditoria-visual-rodada-29.md` (tradução de 2026-11-04)
- `explanation/backlog.md` (tradução de 2026-11-04)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/execucao-real-hello-world.md` (tradução de 2026-11-04)
- `explanation/fase-28-pasta-do-usuario.md` (tradução de 2026-11-04)
- `explanation/fase-29-instalacao-de-uma-linha.md` (tradução de 2026-11-04)
- `explanation/fase-30-runner-por-maquina.md` (tradução de 2026-11-04)
- `explanation/historico-de-fases.md` (tradução de 2026-11-04)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `explanation/medicao-do-idioma.md` (tradução de 2026-11-04)
- `explanation/medicao-do-jev.md` (tradução de 2026-11-04)
- `explanation/modelo-de-time.md` (tradução de 2026-11-04)
- `explanation/primeiro-dogfooding.md` (tradução de 2026-11-04)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `explanation/validacao-fase-12.md` (tradução de 2026-11-04)
- `explanation/validacao-real.md` (tradução de 2026-11-04)
- `getting-started.md` (tradução de 2026-11-04)
- `glossary.md` (tradução de 2026-11-04)
- `intro.md` (tradução de 2026-11-04)
- `reference/configuration.md` (tradução de 2026-11-05)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-04)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-04)
- `tutorials/orquestrar-repositorios/index.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/monte-o-seu.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

### Defasadas em `zh-Hans`

- `adr/index.md` (tradução de 2026-11-06)
- `architecture.md` (tradução de 2026-11-06)
- `business-rules.md` (tradução de 2026-11-06)
- `business-rules/produto.md` (tradução de 2026-11-06)
- `explanation/achados-execucao-real.md` (tradução de 2026-11-04)
- `explanation/auditoria-fluxo-vs-codigo.md` (tradução de 2026-11-04)
- `explanation/auditoria-visual-rodada-29.md` (tradução de 2026-11-04)
- `explanation/backlog.md` (tradução de 2026-11-04)
- `explanation/documentation-workflow.md` (tradução de 2026-11-05)
- `explanation/execucao-real-hello-world.md` (tradução de 2026-11-04)
- `explanation/fase-28-pasta-do-usuario.md` (tradução de 2026-11-04)
- `explanation/fase-29-instalacao-de-uma-linha.md` (tradução de 2026-11-04)
- `explanation/fase-30-runner-por-maquina.md` (tradução de 2026-11-04)
- `explanation/historico-de-fases.md` (tradução de 2026-11-04)
- `explanation/localizacao.md` (tradução de 2026-11-05)
- `explanation/medicao-do-idioma.md` (tradução de 2026-11-04)
- `explanation/medicao-do-jev.md` (tradução de 2026-11-04)
- `explanation/modelo-de-time.md` (tradução de 2026-11-04)
- `explanation/primeiro-dogfooding.md` (tradução de 2026-11-04)
- `explanation/release-do-produto.md` (tradução de 2026-11-05)
- `explanation/validacao-fase-12.md` (tradução de 2026-11-04)
- `explanation/validacao-real.md` (tradução de 2026-11-04)
- `getting-started.md` (tradução de 2026-11-04)
- `glossary.md` (tradução de 2026-11-04)
- `intro.md` (tradução de 2026-11-04)
- `reference/configuration.md` (tradução de 2026-11-05)
- `reference/events.md` (tradução de 2026-11-06)
- `tutorials/from-zero-to-deliverable.md` (tradução de 2026-11-04)
- `tutorials/interface-antes-e-depois-shadcn.md` (tradução de 2026-11-04)
- `tutorials/orquestrar-repositorios/index.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/monte-o-seu.md` (tradução de 2026-11-08)
- `tutorials/orquestrar-repositorios/o-mapa.md` (tradução de 2026-11-08)

