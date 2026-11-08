import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { copiarAssets, layout, renderizarPagina } from './layout.mjs';

const base = {
  locale: 'en',
  slug: 'guides/x.html',
  titulo: 'X <b>',
  conteudo: '<p>oi</p>',
  nav: [{ rotulo: 'G', itens: [{ rotulo: 'X', href: 'guides/x.html' }] }],
  degrau: 'dev',
  degraus: ['dev', 'prd'],
};

describe('layout do site', () => {
  it('caminhos relativos, noindex fora de prd, nada de fora e escape do título', () => {
    const h: string = layout(base);
    expect(h).toContain('href="../../assets/site.css"');
    expect(h).toContain('noindex');
    expect(h).toContain('X &lt;b&gt; | Brabo');
    expect(h).toContain('aria-current="page"');
    expect(h).not.toMatch(/(src|href)="https?:(?!\/\/github\.com\/)/); // só o link do GitHub sai do site
    expect(h).not.toMatch(/<script>/);
    expect(layout({ ...base, degrau: 'prd' })).not.toContain('noindex');
  });

  it('topo: LogoMark inline + Brabo + link do GitHub do repo', () => {
    const h: string = layout({ ...base, repo: 'org/rep' });
    expect(h).toMatch(/<a class="marca" href="[^"]*"><span class="marca-logo"><svg[^>]*>.*<\/svg><\/span>Brabo<\/a>/);
    expect(h).toContain('href="https://github.com/org/rep"');
    expect(layout(base)).toContain('https://github.com/viralabs-dev/brabo');
  });

  it('variante inicio: sem barra lateral, sumário e paginador; as demais mantêm', () => {
    const toc = [{ id: 'a', texto: 'A', nivel: 2 }];
    const h: string = layout({ ...base, variante: 'inicio', toc });
    expect(h).toContain('class="site-corpo inicio"');
    expect(h).not.toContain('site-side');
    expect(h).not.toContain('site-toc');
    const normal: string = layout({ ...base, toc });
    expect(normal).toContain('site-side');
    expect(normal).toContain('site-toc');
    const r: string = renderizarPagina({
      locale: 'pt-BR', pagina: { url: 'index.html', titulo: 'I', traduzida: true, dados: { layout: 'inicio' } }, corpo: { html: '', toc: [] },
      degrau: 'dev', edicao: {}, urlDe: (s: string) => `${s}.html`, rotuloDe: (s: string) => s, navegacao: [], anterior: { slug: 'x', rotulo: 'X' },
    });
    expect(r).not.toContain('site-pager');
  });

  it('falha: seletor de idioma leva ao mesmo slug nos outros locales', () => {
    const h: string = layout({ ...base, locale: 'pt-BR', slug: 'a.html' });
    expect(h).toContain('value="en/a.html"');
  });

  it('categoria recolhível: aberta se não recolhida ou se contém a página atual; link da própria categoria vira item', () => {
    const nav = [
      {
        rotulo: 'Arq',
        colapsada: false,
        itens: [
          {
            rotulo: 'ADR',
            href: 'adr.html',
            colapsada: false,
            itens: [
              { rotulo: 'Git', colapsada: true, itens: [{ rotulo: 'A1', href: 'adr/a1.html' }] },
              { rotulo: 'Web', colapsada: true, itens: [{ rotulo: 'A2', href: 'adr/a2.html' }] },
            ],
          },
        ],
      },
      { rotulo: 'Fim', colapsada: true, itens: [{ rotulo: 'Z', href: 'z.html' }] },
    ];
    const h: string = layout({ ...base, slug: 'adr/a1.html', nav });
    const abertos = (h.match(/<details[^>]*>/g) ?? []).map((d) => d.includes(' open'));
    // Arq (aberta), ADR (aberta), Git (tem a atual), Web (fechada), Fim (fechada)
    expect(abertos).toEqual([true, true, true, false, false]);
    expect(h).toContain('<summary><span>ADR</span></summary><ul><li><a href="../adr.html">ADR</a></li>');
    expect(h).not.toMatch(/<summary>[^<]*<a /);
    expect(h).not.toMatch(/<script>/);
  });

  it('menu enxuto (AT-862): categoria recolhida com href e sem a página atual por dentro sai só como link, sem os filhos', () => {
    const nav = [
      {
        rotulo: 'Dec',
        href: 'adr.html',
        colapsada: true,
        itens: [{ rotulo: 'Git', colapsada: true, itens: [{ rotulo: 'A1', href: 'adr/a1.html' }] }],
      },
      { rotulo: 'G', itens: [{ rotulo: 'Reg', href: 'br.html', colapsada: true, itens: [{ rotulo: 'P1', href: 'br/p1.html' }] }] },
    ];
    const fora: string = layout({ ...base, slug: 'z.html', nav });
    expect(fora).toContain('<h2><a href="adr.html">Dec</a></h2>');
    expect(fora).toContain('<li><a href="br.html">Reg</a></li>');
    expect(fora).not.toContain('A1');
    expect(fora).not.toContain('<summary><h2>Dec');
    // na própria página da categoria também sai só o link (o índice de ADR não carrega a árvore de 280 folhas)
    const propria: string = layout({ ...base, slug: 'adr.html', nav });
    expect(propria).toContain('<h2><a href="adr.html" aria-current="page">Dec</a></h2>');
    expect(propria).not.toContain('A1');
    // dentro dela a árvore segue aberta
    const dentro: string = layout({ ...base, slug: 'adr/a1.html', nav });
    expect(dentro).toContain('A1');
    expect(dentro).toContain('<details open><summary><h2>Dec</h2>');
  });

  it('renderizarPagina repassa colapsada da navegação ao menu', () => {
    const cat = (rotulo: string, slug: string, colapsada: boolean) => ({ tipo: 'categoria', rotulo, colapsada, itens: [{ tipo: 'pagina', slug }] });
    const h: string = renderizarPagina({
      locale: 'pt-BR', pagina: { url: 'a.html', titulo: 'A', traduzida: true }, corpo: { html: '', toc: [] },
      degrau: 'dev', edicao: {}, urlDe: (s: string) => `${s}.html`, rotuloDe: (s: string) => s,
      navegacao: [cat('Aberta', 'x', false), cat('Fechada', 'y', true), cat('Atual', 'a', true)],
    });
    expect((h.match(/<details[^>]*>/g) ?? []).map((d) => d.includes(' open'))).toEqual([true, false, true]);
  });

  it('copiarAssets grava tokens, fontes relativas e scripts', () => {
    const d = mkdtempSync(join(tmpdir(), 'site-'));
    copiarAssets(d);
    for (const f of ['site.css', 'tema.js', 'site.js', 'tokens.css', 'fonts/archivo-latin.woff2'])
      expect(existsSync(join(d, 'assets', f)), f).toBe(true);
    expect(readFileSync(join(d, 'assets/fonts.css'), 'utf8')).not.toContain("url('/fonts/");
  });
});
