import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const fonte = readFileSync(new URL('./assets/site.js', import.meta.url), 'utf8');

/** `site.js` num DOM de mentira: só o que o redirecionamento de RN e o filtro de ADR tocam. */
function rodar({ hash, pathname = '/business-rules/api.html', ancora, filtro }: { hash: string; pathname?: string; ancora?: any; filtro?: any }) {
  const replaced: string[] = [];
  const vazio = { forEach() {}, length: 0 };
  const doc: any = {
    querySelectorAll: (sel: string) => (sel.startsWith('.doc h2') && filtro ? filtro.h2s : vazio),
    querySelector: (sel: string) => (sel === '[data-adr-filtro]' ? (filtro?.barra ?? null) : null),
    getElementById: (id: string) => (ancora && id === hash.slice(1) ? ancora : null),
    documentElement: { getAttribute: () => 'dark', setAttribute() {}, classList: { toggle() {} } },
    body: { classList: { toggle() {} } },
  };
  runInNewContext(fonte, { document: doc, window: {}, location: { hash, pathname, replace: (u: string) => replaced.push(u) }, getComputedStyle: () => ({ getPropertyValue: () => '' }) });
  return replaced;
}

const link = (hash: string, pathname: string) => ({ tagName: 'A', href: `https://x${pathname}${hash}`, hash, pathname });
const vazio = (irmao: any) => ({ tagName: 'A', href: '', nextElementSibling: irmao });

describe('site.js: RN que mudou de página (ADR 0287)', () => {
  it('âncora antiga vazia colada ao link da parte com o mesmo #hash leva à parte', () => {
    const r = rodar({ hash: '#rn-497', ancora: vazio(link('#rn-497', '/business-rules/api/parte-09.html')) });
    expect(r).toEqual(['https://x/business-rules/api/parte-09.html#rn-497']);
  });

  it('a grade do brabo, onde o próprio <a id> é o link, também redireciona', () => {
    expect(rodar({ hash: '#rn-012', pathname: '/business-rules.html', ancora: link('#rn-012', '/business-rules/produto.html') })).toHaveLength(1);
  });

  it.each([
    ['sem hash', { hash: '' }],
    ['hash sem elemento', { hash: '#rn-1' }],
    ['id de título (o vizinho não é link)', { hash: '#rn-1', ancora: { tagName: 'H3', href: undefined, nextElementSibling: { tagName: 'P' } } }],
    ['vizinho com outro hash', { hash: '#rn-1', ancora: vazio(link('#rn-2', '/outra.html')) }],
    ['link para a própria página (sem laço)', { hash: '#rn-1', ancora: vazio(link('#rn-1', '/business-rules/api.html')) }],
  ])('não redireciona: %s', (_n, args) => {
    expect(rodar(args as any)).toEqual([]);
  });
});

describe('site.js: filtro do índice de ADR', () => {
  function tabela(linhas: [string, string][]) {
    const trs = linhas.map(([, status]) => ({ hidden: false, lastElementChild: { textContent: ` ${status} ` } }));
    return { trs, el: { tagName: 'TABLE', nextElementSibling: null, querySelectorAll: () => ({ forEach: (f: any) => trs.forEach(f) }) } };
  }
  function secao(id: string, linhas: [string, string][], proximo: any = null) {
    const t = tabela(linhas);
    const h2: any = { id, tagName: 'H2', hidden: false, nextElementSibling: t.el };
    t.el.nextElementSibling = proximo;
    return { h2, trs: t.trs, tabela: t.el };
  }
  function montar() {
    const git = secao('tema-git', [['0001', 'aceito'], ['0002', 'proposto']]);
    const web = secao('tema-web', [['0003', 'aceito']]);
    const eventos: Record<string, () => void> = {};
    const sel = (valor: string, nome: string) => ({ value: valor, addEventListener: (_e: string, f: () => void) => { eventos[nome] = f; } });
    const st = sel('', 'status');
    const tm = sel('', 'tema');
    const barra: any = { hidden: true, querySelector: (s: string) => (s === '[data-adr-status]' ? st : tm) };
    rodar({ hash: '', filtro: { h2s: { forEach: (f: any) => [git.h2, web.h2].forEach(f) }, barra } });
    return { git, web, st, tm, barra, eventos };
  }

  it('mostra a barra (nasce escondida) e filtra linhas por status e seções por tema', () => {
    const { git, web, st, tm, barra, eventos } = montar();
    expect(barra.hidden).toBe(false);
    st.value = 'proposto';
    eventos.status();
    expect(git.trs.map((t) => t.hidden)).toEqual([true, false]);
    expect(web.h2.hidden).toBe(true); // tema sem linha visível some
    expect(git.h2.hidden).toBe(false);
    st.value = '';
    tm.value = 'tema-web';
    eventos.tema();
    expect([git.h2.hidden, web.h2.hidden, web.tabela.hidden]).toEqual([true, false, false]);
  });
});
