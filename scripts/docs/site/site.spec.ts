import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { construir } from './build.mjs';
import { adrsPorTema, construirNavegacao, listaPlana } from './navegacao.mjs';
import { descobrirPaginas, lerFrontmatter, slugDe, urlDe, urlRelativa } from './paginas.mjs';
import { COMPONENTES, criarRenderizador, slugDeTitulo } from './render.mjs';

/** Repositório de mentira: duas páginas, uma tradução, um ADR com tema. */
function repo() {
  const raiz = mkdtempSync(path.join(tmpdir(), 'site-'));
  const w = (rel: string, txt: string) => {
    mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
    writeFileSync(path.join(raiz, rel), txt);
  };
  w('docs/intro.md', '---\ntitle: Início\nslug: /\n---\n# Início\n\nVeja [o ADR](adr/0001-x.md#decisao) e [API](/reference/api/).\n');
  w('docs/adr/index.md', '---\nid: adr-index\n---\n# ADRs\n');
  w('docs/adr/0001-x.md', '# ADR 0001 — x\n\n## Decisão {#decisao}\n\n:::warning[Cuidado!]\ncorpo\n:::\n\n```mermaid\nA-->B\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |\n');
  w('docs/adr/temas.yml', 'temas:\n  - id: docs\n    titulo: Documentação\n    descricao: x\nadrs:\n  "0001": docs\n');
  w('docs/missions/m.md', '# fora');
  w('docs/_parcial.md', '# fora');
  w('docs/i18n/en/adr/0001-x.md', '# ADR 0001 — x (en)\n\n## Decisão {#decisao}\n\n[home](../intro.md)\n');
  return raiz;
}

describe('paginas', () => {
  it('mantém as URLs do Docusaurus e exclui missions e parciais', () => {
    const p = descobrirPaginas({ raiz: repo(), locale: 'pt-BR' });
    expect(p.map((x) => x.url).sort()).toEqual(['adr.html', 'adr/0001-x.html', 'index.html']);
    expect(urlDe('a/b', 'ru')).toBe('ru/a/b.html');
    expect(slugDe('adr/index.md')).toBe('adr');
    expect(urlRelativa('en/adr/0001-x.html', 'en/index.html')).toBe('../index.html');
  });

  it('o locale tem o conjunto inteiro: tradução onde existe, fonte no resto', () => {
    const p = descobrirPaginas({ raiz: repo(), locale: 'en' });
    expect(p.map((x) => [x.url, x.traduzida])).toEqual([
      ['en/adr/0001-x.html', true], ['en/adr.html', false], ['en/index.html', false],
    ]);
  });

  it('frontmatter malformado reprova', () => {
    expect(() => lerFrontmatter('---\na: [\n---\n')).toThrow(/frontmatter/);
  });
});

describe('render', () => {
  it('âncora {#id}, admonição, mermaid, tabela e link .md relativo ao locale', async () => {
    const raiz = repo();
    const paginas = descobrirPaginas({ raiz, locale: 'en' });
    const render = await criarRenderizador({ paginas });
    const adr = render(paginas.find((p) => p.slug === 'adr/0001-x')!);
    expect(adr.html).toContain('id="decisao"');
    expect(adr.html).not.toContain('{#decisao}');
    expect(adr.toc).toEqual([{ nivel: 2, id: 'decisao', texto: 'Decisão' }]);
    const intro = render(paginas.find((p) => p.slug === '')!);
    expect(intro.html).toContain('href="adr/0001-x.html#decisao"');
    expect(intro.html).toContain('href="reference/api.html"');
    const pt = descobrirPaginas({ raiz, locale: 'pt-BR' });
    const fonte = (await criarRenderizador({ paginas: pt }))(pt.find((p) => p.slug === 'adr/0001-x')!);
    expect(fonte.html).toContain('admonicao-warning');
    expect(fonte.html).toContain('Cuidado!');
    expect(fonte.html).toContain('<pre class="mermaid" data-mermaid>');
    expect(fonte.html).toContain('tabela-rolavel');
    expect(fonte.temMermaid).toBe(true);
    expect(slugDeTitulo('O que é o Brabo?')).toBe('o-que-é-o-brabo');
  });

  it('link que atravessa para a tradução fica dentro do locale (caso de falha: alvo sumido fica cru)', async () => {
    const raiz = repo();
    const paginas = descobrirPaginas({ raiz, locale: 'en' });
    const render = await criarRenderizador({ paginas });
    const adr = paginas.find((p) => p.slug === 'adr/0001-x')!;
    expect(render(adr).html).toContain('href="../index.html"');
    const sumido = { ...adr, corpo: '[x](nao-existe.md)' };
    expect(render(sumido).html).toContain('href="nao-existe.md"');
  });
});

describe('componentes da doc (AT-857)', () => {
  const pag = (locale: string, corpo: string, extra = {}) => ({ locale, url: locale === 'pt-BR' ? 'a/b.html' : `${locale}/a/b.html`, relativo: 'a/b.md', slug: 'a/b', corpo, ...extra });
  const render = async (locale: string, corpo: string) => {
    const r = await criarRenderizador({ paginas: [pag(locale, '') as never, { ...pag(locale, ''), relativo: 'a/c.md', url: 'a/c.html' } as never] });
    return r(pag(locale, corpo) as never).html;
  };

  it('aviso: nomes novos com título por locale, sinônimos em inglês e título explícito', async () => {
    expect(await render('pt-BR', ':::dica\nx\n:::')).toMatch(/admonicao-dica[^>]*><p class="admonicao-titulo">Dica</);
    expect(await render('en', ':::perigo\nx\n:::')).toContain('>Danger<');
    expect(await render('ru', ':::nota\nx\n:::')).toContain('>Примечание<');
    expect(await render('zh-Hans', ':::cuidado\nx\n:::')).toContain('>小心<');
    const velho = await render('pt-BR', ':::warning\nx\n:::');
    expect(velho).toContain('admonicao-warning');
    expect(velho).toContain('admonicao-cuidado');
    expect(velho).toContain('>Atenção<');
    expect(await render('pt-BR', ':::nota[Meu título]\nx\n:::')).toContain('>Meu título<');
  });

  it('historico: faixa com a data por locale; sem data ou data inválida reprova o build', async () => {
    expect(await render('pt-BR', ':::historico 2026-10-31\ncorpo\n:::')).toContain('Registro de 31/10/2026');
    expect(await render('en', ':::historico 2026-10-31\ncorpo\n:::')).toContain('Record from October 31, 2026');
    await expect(render('pt-BR', ':::historico\ncorpo\n:::')).rejects.toThrow(/data ISO/);
    await expect(render('pt-BR', ':::historico 2026-02-31\ncorpo\n:::')).rejects.toThrow(/data ISO/);
  });

  it('passos, cartoes (link .md resolvido) e abas', async () => {
    expect(await render('pt-BR', ':::passos\n1. um\n2. dois\n:::')).toMatch(/<div class="passos">\s*<ol>/);
    const c = await render('pt-BR', ':::cartoes\n- [Título](c.md): uma frase\n:::');
    expect(c).toContain('<div class="cartoes">');
    expect(c).toContain('href="c.html"');
    expect(c).not.toContain('</a>: ');
    const a = await render('pt-BR', ':::abas\n=== Linux\num\n=== macOS\ndois\n:::');
    expect(a).toContain('data-abas');
    expect(a.match(/<section class="aba"/g)).toHaveLength(2);
    expect(a).toContain('data-aba="macOS"');
    await expect(render('pt-BR', ':::abas\nsem rótulo\n:::')).rejects.toThrow(/===/);
  });

  it('imagem com título sozinha vira figure; sem título segue parágrafo', async () => {
    expect(await render('pt-BR', '![alt](x.png "Legenda")')).toContain('<figure class="figura"><img src="x.png" alt="alt"><figcaption>Legenda</figcaption></figure>');
    expect(await render('pt-BR', '![alt](x.png)')).toContain('<p><img');
  });

  it('COMPONENTES lista os nomes canônicos (contrato com o linter)', () => {
    expect(COMPONENTES).toEqual(['nota', 'dica', 'cuidado', 'perigo', 'historico', 'passos', 'cartoes', 'abas']);
  });
});

describe('estado misto: fonte em inglês e fonte em pt-BR com i18n (AT-745, ADR 0260)', () => {
  const misto = () => {
    const raiz = repo();
    const w = (rel: string, txt: string) => {
      mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
      writeFileSync(path.join(raiz, rel), txt);
    };
    // raiz em inglês: marcada, sem i18n
    w('apps/api/docs/reference/gates.md', '---\nidioma_original: en\n---\n# Gates\n');
    // raiz ainda em pt-BR, com tradução para en
    w('apps/engine/docs/reference/agentes.md', '# Agentes\n');
    w('apps/engine/docs/i18n/en/reference/agentes.md', '# Agents\n');
    return raiz;
  };
  const raizesDeDoc = ['docs', 'apps/api/docs', 'apps/engine/docs'];
  const pagina = (raiz: string, locale: string, slug: string) =>
    descobrirPaginas({ raiz, locale, raizesDeDoc }).find((p) => p.slug === slug);

  it('no /en/ a fonte inglesa é a própria página, sem faixa', () => {
    expect(pagina(misto(), 'en', 'reference/gates')).toMatchObject({ traduzida: true, somenteIngles: false, titulo: 'Gates' });
  });
  it.each(['pt-BR', 'ru', 'zh-Hans'])('em %s serve a fonte inglesa com a faixa "só em inglês"', (loc) => {
    expect(pagina(misto(), loc, 'reference/gates')).toMatchObject({ traduzida: false, somenteIngles: true, titulo: 'Gates' });
  });
  it('mutação: sem o idioma_original a mesma página cai na faixa comum, não na de inglês', () => {
    const raiz = misto();
    writeFileSync(path.join(raiz, 'apps/api/docs/reference/gates.md'), '# Gates\n');
    expect(pagina(raiz, 'ru', 'reference/gates')).toMatchObject({ traduzida: false, somenteIngles: false });
    expect(pagina(raiz, 'en', 'reference/gates')).toMatchObject({ traduzida: false });
  });
  it('a raiz pt-BR com i18n segue como era: traduzida no en, fallback no ru, sem somenteIngles', () => {
    const raiz = misto();
    expect(pagina(raiz, 'en', 'reference/agentes')).toMatchObject({ traduzida: true, somenteIngles: false, titulo: 'Agents' });
    expect(pagina(raiz, 'ru', 'reference/agentes')).toMatchObject({ traduzida: false, somenteIngles: false });
    expect(pagina(raiz, 'pt-BR', 'reference/agentes')).toMatchObject({ traduzida: true });
  });
  it('o HTML: faixa de inglês no pt-BR e no ru, nenhuma no en, e a faixa comum no fallback pt-BR', async () => {
    const raiz = misto();
    const saida = path.join(raiz, 'out');
    await construir({ raiz, saida, degrau: 'dev', git: false, raizesDeDoc });
    const h = (rel: string) => readFileSync(path.join(saida, rel), 'utf8');
    expect(h('reference/gates.html')).toContain('só existe em inglês');
    expect(h('ru/reference/gates.html')).toContain('существует только на английском');
    expect(h('zh-Hans/reference/gates.html')).toContain('仅有英文版本');
    expect(h('en/reference/gates.html')).not.toContain('class="site-faixa"');
    expect(h('ru/reference/agentes.html')).toContain('ещё не переведена');
  }, 120_000);
});

describe('navegacao', () => {
  it('agrupa ADRs pelo temas.yml e lança se o parse se perde', () => {
    const raiz = repo();
    expect(adrsPorTema(raiz)).toEqual([{ rotulo: 'Documentação', itens: ['adr/0001-x'] }]);
    writeFileSync(path.join(raiz, 'docs/adr/0002-y.md'), '# y');
    expect(() => adrsPorTema(raiz)).toThrow(/se perdeu/);
  });

  it('aplica rótulos traduzidos e lista na ordem de leitura', () => {
    const nav = construirNavegacao({ raiz: repo(), rotulos: { '🛠️ Operação': 'Ops' } });
    expect(nav.some((i) => i.rotulo === 'Ops')).toBe(true);
    expect(listaPlana(nav)[0]?.slug).toBe('');
  });
});

describe('build', () => {
  it('escreve uma página por url em cada locale, com noindex fora da main', async () => {
    const raiz = repo();
    const saida = path.join(raiz, 'out');
    await construir({ raiz, saida, degrau: 'dev', git: false });
    expect(readFileSync(path.join(saida, 'index.html'), 'utf8')).toContain('noindex');
    expect(readFileSync(path.join(saida, 'zh-Hans/adr/0001-x.html'), 'utf8')).toContain('lang="zh-Hans"');
    await construir({ raiz, saida, degrau: 'main', git: false });
    expect(readFileSync(path.join(saida, 'index.html'), 'utf8')).not.toContain('noindex');
  }, 120_000);
});

describe('árvore de união das raízes (AT-693)', () => {
  const duas = () => {
    const raiz = repo();
    const w = (rel: string, txt: string) => {
      mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
      writeFileSync(path.join(raiz, rel), txt);
    };
    w('apps/api/docs/reference/permissions.md', '# Permissões\n');
    w('apps/api/docs/business-rules/api.md', '# RN api\n');
    w('apps/api/docs/i18n/en/reference/permissions.md', '# Permissions\n');
    return { raiz, w };
  };
  const raizesDeDoc = ['docs', 'apps/api/docs'];

  it('une as raízes, guarda a raiz de cada página e traduz por raiz', () => {
    const { raiz } = duas();
    const pt = descobrirPaginas({ raiz, locale: 'pt-BR', raizesDeDoc });
    expect(pt.find((p) => p.slug === 'reference/permissions')?.raiz).toBe('apps/api/docs');
    expect(pt.find((p) => p.slug === 'adr')?.raiz).toBe('docs');
    const en = descobrirPaginas({ raiz, locale: 'en', raizesDeDoc });
    expect(en.find((p) => p.slug === 'reference/permissions')).toMatchObject({ traduzida: true, titulo: 'Permissions' });
  });

  it('slug duplicado entre raízes lança nomeando as duas', () => {
    const { raiz, w } = duas();
    w('docs/reference/permissions.md', '# Outra\n');
    expect(() => descobrirPaginas({ raiz, raizesDeDoc })).toThrow(/docs\/reference\/permissions\.md e apps\/api\/docs\/reference\/permissions\.md|apps\/api\/docs\/reference\/permissions\.md e docs\/reference\/permissions\.md/);
  });

  it('as Regras listam uma página por raiz e a edição aponta para a raiz da página', async () => {
    const { raiz } = duas();
    const nav = construirNavegacao({ raiz, repo: 'x/y', raizesDeDoc });
    const regras = nav.find((i: any) => i.rotulo.includes('Regras'));
    expect(regras.itens.map((i: any) => i.slug)).toEqual(['business-rules', 'business-rules/api']);
    const saida = path.join(raiz, 'out');
    await construir({ raiz, saida, git: false, repo: 'x/y', raizesDeDoc });
    expect(readFileSync(path.join(saida, 'reference/permissions.html'), 'utf8')).toContain('/brabo-api/blob/dev/docs/reference/permissions.md');
    expect(readFileSync(path.join(saida, 'index.html'), 'utf8')).toContain('/brabo/blob/dev/docs/intro.md');
  }, 120_000);
});
