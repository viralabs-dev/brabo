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
    expect(h).not.toMatch(/(src|href)="https?:/);
    expect(h).not.toMatch(/<script>/);
    expect(layout({ ...base, degrau: 'prd' })).not.toContain('noindex');
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
