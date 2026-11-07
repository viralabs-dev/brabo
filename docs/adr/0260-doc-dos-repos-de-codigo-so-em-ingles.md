# ADR 0260 — A doc dos repos de código é só em inglês; o site serve a fonte inglesa com faixa

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `docs`
- **Referencia:** revisa os ADRs [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md) (a fonte pt-BR vale só para o `brabo`), [0219](0219-referencia-entra-na-traducao.md) (o contrato `idioma_original: en` passa a ser o caminho normal dos irmãos) e [0220](0220-api-traduzida-por-catalogo.md) (os catálogos passam a morar no `brabo`). AT-745, EP-033, decisão do dono de 05/11/2026: "a única documentação que ficará com mais de um idioma será a porta de entrada para o cliente, ou seja, `brabo`; os demais repos, tudo em inglês".

## Contexto

O ADR 0216 fez do pt-BR a fonte de TODA a documentação, com `en`, `ru` e `zh-Hans` como traduções em `docs/i18n/`. Depois da separação em onze repositórios (EP-033), os dez repos de código carregam essa regra sem terem público que a peça: a fonte deles está 94 a 100% em pt-BR, as cópias `i18n/en` são de 15/10 e estão defasadas (a api sem 47 RNs, o engine sem 22, o web sem 22), e nenhum irmão tem check de idioma. Só o `brabo` é a porta de entrada do cliente e sobe o site.

O contrato que torna isso possível já existia: `idioma_original: en` no frontmatter (AT-564, ADR 0219), lido por `faixa-de-traducao-check.mjs`, mas não por `paginas.mjs`.

## Decisão

1. **A doc dos 10 repos de código é só em inglês.** `docs/`, `README`, `CHANGELOG` e arquivos de comunidade. Doc nova e RN nova saem em inglês e sem `docs/i18n/`. O `CLAUDE.md` e o `.claude/` deles ficam em pt-BR (decisão do dono). Comentários e mensagens de commit não mudam por este ADR.
2. **O `brabo` continua multilíngue** (pt-BR fonte, `en`, `ru`, `zh-Hans`, ADR 0216), inclusive a doc da área `ci` que mora em `scripts/ci/docs/`.
3. **Página de irmão em inglês leva `idioma_original: en`.** O site, no `/en/`, serve a própria fonte, sem faixa. Em pt-BR, `ru` e `zh-Hans` serve a MESMA fonte inglesa, com a faixa nova "esta página só existe em inglês". Se um irmão ainda tem a tradução de um locale, ela vale nesse locale: o mecanismo aceita o estado misto, página a página.
4. **O que acompanha o mecanismo:**
   - o índice de RN de cada locale usa a tradução quando o arquivo dela existe e a fonte quando não existe, para não perder as RNs dos irmãos;
   - o bloco gerado numa fonte `idioma_original: en` sai com os textos em inglês;
   - `paridade-de-traducao` não conta como traduzível a página `idioma_original: en` (a AT-735 fica sem objeto);
   - as frases em prosa de irmão que o `docs:check` ancora no código (`contagens-do-codigo.mjs`, o runbook) aceitam o texto em pt-BR OU em inglês, para a conversão não deixar o check cego.
5. **A referência da API segue traduzida.** O dono manteve a página Redoc nos quatro idiomas; os catálogos `openapi-textos.json` saem do `brabo-api` e moram no `brabo`, em `docs/i18n/<locale>/`.

## Consequências

- Cada irmão converte a doc dele para inglês em lane própria, promovendo o `i18n/en` a fonte RN por RN e apagando `docs/i18n/`; os `ru` e `zh-Hans` dos irmãos são apagados (o git guarda).
- Enquanto um irmão não converte, o site mostra a fonte pt-BR com a faixa de sempre. Depois que converte, o leitor russo ou chinês vê o inglês com a faixa nova.
- `RNS_SEM_TRADUCAO` em `links.mjs` continua: o índice cai na fonte por ARQUIVO, não por RN, então a RN que falta numa tradução parcial ainda quebra a âncora no locale até a lane do irmão apagar o `i18n/`.
- **Guarda implementada (Rodada 201):** `scripts/docs/idioma-dos-irmaos.mjs`, chamada pelo `docs:check`, reprova página `.md` de raiz de irmão sem `idioma_original: en` e qualquer `i18n/` numa raiz de irmão, nomeando o arquivo e este ADR. As raízes do próprio `brabo` (`docs/`, `scripts/ci/docs/`) seguem multilíngues. Um contador de pt-BR (palavras funcionais e `ção`/`ções` fora de código, citação, URL e link) avisa, sem reprovar, quando uma página que já declara `en` ainda tem prosa em português; o resultado sobre a doc atual é zero linhas.

### Frases em inglês que as lanes de tradução copiam

As frases abaixo são as que os padrões novos reconhecem. O número vai por extenso, em minúsculas (a comparação ignora a caixa).

| arquivo (repo) | frase em pt-BR | frase em inglês |
|---|---|---|
| `deploy/docs/runbook.md` (infra) | `as cinco imagens que o produto publica já estão resolvidas` | `the five images the product publishes are already resolved` |
| `apps/api/docs/reference/git-providers.md` (api) | `O contrato tem **quinze operações** —` | `The contract has **fifteen operations** —` |
| `apps/api/docs/reference/git-providers.md` (api) | `implementar todas as quinze operações, declarando` | `implement all fifteen operations, declaring` |
| `apps/api/docs/reference/artifacts.md` (api), no frontmatter | `description: Os doze schemas de artefato` | `description: The twelve artifact schemas` |
| RN de imagens (infra) | `- as **cinco imagens** são assinadas **por DIGEST**` | `- the **five images** are signed **by DIGEST**` |
| RN de imagens (infra) | `- as cinco imagens vêm de **variável obrigatória**` | `- the five images come from a **required variable**` |

O padrão de `.claude/rules/broker-e-containers.md` (infra) segue só em pt-BR, porque o `.claude/` fica em pt-BR.

## Alternativas consideradas

- **Servir o irmão em inglês SEM faixa nos outros locales.** Recusada: a pessoa que lê em russo precisa saber que a página não é do idioma dela.
- **Esconder do site, em ru e zh-Hans, as páginas só em inglês.** Recusada: o link entre páginas quebraria e a busca perderia a referência técnica.
- **Manter as três traduções dos irmãos.** Recusada pelo dono: três cópias por mudança, sem leitor, e já defasadas.

## Referências

- [0216](0216-quatro-idiomas-com-pt-br-como-fonte.md), [0219](0219-referencia-entra-na-traducao.md), [0220](0220-api-traduzida-por-catalogo.md).
