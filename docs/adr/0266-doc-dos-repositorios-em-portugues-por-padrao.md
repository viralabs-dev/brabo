# ADR 0266 — A doc dos repositórios é em pt-BR por padrão, com traduções permitidas nos irmãos

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `docs`
- **Referencia:** substitui o ADR [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md) (a doc dos repos de código deixa de ser só em inglês) e volta à regra do ADR [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) (pt-BR como fonte) em todos os repositórios. AT-766, Rodada 217, decisão do dono de 06/11/2026: a documentação de repositório público é em português por padrão.

## Contexto

O ADR 0260 (Rodada 200, AT-745) decidiu que só o `brabo` seria multilíngue e que a doc dos dez repositórios de código seria só em inglês. Uma guarda no `docs:check` (`scripts/docs/idioma-dos-irmaos.mjs`) passou a reprovar página de irmão sem `idioma_original: en` e qualquer `i18n/` num irmão, além de avisar sobre prosa pt-BR. Dezessete páginas de irmão foram convertidas para inglês.

Em 06/11/2026 o dono reverteu a decisão: os repositórios do Brabo são públicos, o público do produto lê português e a fonte da documentação é pt-BR em todos eles, como já era no `brabo`.

## Decisão

1. **A doc de todos os repositórios é em pt-BR por padrão**: `docs/`, `README`, `CHANGELOG` e arquivos de comunidade. Página sem `idioma_original` é pt-BR, que já é o padrão de `faixa-de-traducao.mjs`.
2. **Traduções são permitidas nos irmãos**, em `<raiz>/docs/i18n/<locale>/`, no mesmo mecanismo do `brabo` (ADR 0216 e ADR 0254): paridade medida e faixa de tradução no site.
3. **O `Unreleased` dos CHANGELOGs é traduzido** para pt-BR. Entradas de versões já cortadas ficam como estão.
4. **A guarda de idioma sai.** `idioma-dos-irmaos.mjs` e o spec dele são apagados, e o `docs:check` deixa de reprovar página de irmão sem `idioma_original: en` e `i18n/` em irmão.
5. **O mecanismo de estado misto fica.** Página com `idioma_original: en` continua aceita: o site a serve com a faixa "só em inglês", a paridade não a conta como traduzível e as frases ancoradas no código aceitam pt-BR ou inglês. Assim o check fica verde antes e depois de os irmãos retraduzirem as páginas que hoje estão em inglês.

## Consequências

- Cada irmão retraduz para pt-BR, em lane própria, as páginas que o ADR 0260 converteu para inglês, e tira o `idioma_original: en` delas. Os gerados que dependem dos irmãos (índice de RN, paridade) mudam quando isso aterra e são regenerados pela PR `chore/regenera-gerados`.
- Página de irmão que volta a pt-BR sem tradução aparece na paridade como ausente nos outros locales e ganha a faixa comum no site. É o mesmo estado das páginas do `brabo` ainda não traduzidas.
- O `CLAUDE.md`, a `documentation-workflow.md` e a `localizacao.md` deixam de repetir a regra do inglês.
- As frases em inglês da tabela do ADR 0260 seguem reconhecidas pelos padrões do `docs:check`. Nada obriga a usá-las: a frase em pt-BR volta a ser a principal.

## Referências

- [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md), [0254](0254-a-doc-de-cada-area-mora-na-raiz-dela.md), [0260](0260-doc-dos-repos-de-codigo-so-em-ingles.md).
