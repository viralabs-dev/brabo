import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { cercaDepois, conferir, dividir, fatiar, partir, planejarCortes, reescreverHref, reescreverLinks, segmentar } from './partir-rn.mjs';

const rn = (n: number, kb = 1, extra = '') => `### RN-${String(n).padStart(3, '0')} — regra ${n} {#rn-${String(n).padStart(3, '0')}}\n\n${'x'.repeat(kb * 1024)}\n${extra}`;
const doc = (corpo: string) => `---\nid: rn-x\ntitle: 'Regras — X'\nsidebar_label: X\nsidebar_position: 3\n---\n\n# X\n\nIntro.\n\n${corpo}`;

describe('segmentar', () => {
  it('cerca de código não abre seção, nem a de 4 crases, nem crase em linha que parece cerca', () => {
    const corpo = '## A\n\n```md\n## falso\n### RN-999 — falso {#rn-999}\n```\n\n````md\n```\n## falso 2\n````\n\n```` ```sh ```` em linha\n\n### RN-001 — a {#rn-001}\n\ncorpo\n';
    const { segs } = segmentar(corpo);
    expect(segs.map((s: any) => [s.tipo, s.n])).toEqual([['h2', undefined], ['rn', 1]]);
  });

  it('sem perda: pre + segmentos devolvem o corpo', () => {
    const corpo = '# X\n\nintro\n\n## A\n\nprosa\n\n### RN-001 — a {#rn-001}\n\nx\n\n## B\n\n### RN-002 — b {#rn-002}\n\ny\n';
    const { pre, segs } = segmentar(corpo);
    expect([pre, ...segs.map((s: any) => s.texto)].join('\n')).toBe(corpo);
  });

  it('cercaDepois: só fecha com o mesmo caractere e tamanho igual ou maior', () => {
    expect(cercaDepois(cercaDepois(null, '````md'), '```')).toBe('````');
    expect(cercaDepois('````', '````')).toBeNull();
    expect(cercaDepois('```', '~~~')).toBe('```');
    expect(cercaDepois(null, '```` ```sh ````')).toBeNull();
  });
});

describe('cortes', () => {
  const corpo = `## A\n\n${rn(1, 40)}\n## B\n\n${rn(2, 40)}\n${rn(3, 40)}\n## C\n\n${rn(4, 100)}\n${rn(5, 30)}`;
  const { segs } = segmentar(corpo);

  it('a seção inteira vai para a próxima parte; a seção maior que o orçamento corta entre RNs', () => {
    const cortes = planejarCortes(segs, 90 * 1024);
    expect(cortes).toEqual([2, 4, 5]); // B só entra com a RN-002 (nunca separa o `##` da primeira RN)
    const f = fatiar(segs, cortes);
    expect(f.map((p: any) => p.segs.filter((s: any) => s.tipo === 'rn').map((s: any) => s.n))).toEqual([[1], [2, 3], [4], [5]]);
    expect(f[1].segs[0].tipo).toBe('h2');
    expect(f[3].h2Anterior).toBe('## C'); // parte que começa no meio da seção repete o título dela
  });

  it('RN de corte que não existe reprova', () => {
    expect(() => fatiar(segs, [77])).toThrow(/RN-77/);
  });
});

describe('links', () => {
  const ctx = { area: 'api', parteDe: new Map([['rn-001', 1], ['rn-002', 2]]), atual: 1 };
  it.each([
    ['../reference/x.md', '../../reference/x.md'],
    ['engine.md#rn-016', '../engine.md#rn-016'],
    ['api.md#rn-002', 'parte-02.md#rn-002'],
    ['api.md#rn-001', '#rn-001'],
    ['api.md', '../api.md'],
    ['#rn-002', 'parte-02.md#rn-002'],
    ['#rn-001', '#rn-001'],
    ['#sem-dono', '#sem-dono'],
    ['https://x.y/a.md', 'https://x.y/a.md'],
    ['../assets/a.png', '../../assets/a.png'],
  ])('%s -> %s', (de, para) => {
    expect(reescreverHref(de, ctx)).toBe(para);
  });

  it('só reescreve fora de cerca e de código em linha', () => {
    const t = 'veja [a](../a.md) e `[b](../b.md)`\n```\n[c](../c.md)\n```\n[d]: ../d.md\n![i](../i.png "t")';
    expect(reescreverLinks(t, (h) => reescreverHref(h, ctx))).toBe('veja [a](../../a.md) e `[b](../b.md)`\n```\n[c](../c.md)\n```\n[d]: ../../d.md\n![i](../../i.png "t")');
  });

  it('código em linha que atravessa linhas não troca a paridade das crases (link depois dele é reescrito)', () => {
    const t = 'abre `x [a](../a.md)\n--id` e ([b](../b.md)) `[c](../c.md)`\n\n[d](../d.md)';
    expect(reescreverLinks(t, (h) => reescreverHref(h, ctx))).toBe('abre `x [a](../a.md)\n--id` e ([b](../../b.md)) `[c](../c.md)`\n\n[d](../../d.md)');
  });
});

describe('partir + conferir', () => {
  const texto = doc(`## A\n\nprosa [x](../x.md)\n\n${rn(1, 40, 'ver [RN-2](api.md#rn-002) e [RN-1](#rn-001)')}\n## B\n\n${rn(2, 40)}\n${rn(3, 40)}\n`);
  const r = partir(texto, { area: 'api', locale: 'pt-BR', limite: 90 * 1024 });

  it('índice com a tabela das partes e a grade congelada; partes com frontmatter e título próprios', () => {
    expect(r.partes).toHaveLength(2);
    expect(r.indice).toContain('| [parte 1](api/parte-01.md) | RN-001 | 1 | A |');
    expect(r.indice).toContain('<a id="rn-002"></a>[002](api/parte-02.md#rn-002)');
    expect(r.indice).toContain('title: \'Regras — X\''); // o índice mantém o frontmatter
    expect(r.partes[1].texto).toContain("title: 'Regras — X — parte 2 (desde RN-002)'");
    expect(r.partes[1].texto).toContain('id: rn-api-parte-02');
    expect(r.partes[0].texto).not.toContain('sidebar_position');
    expect(r.partes[1].texto).toContain('<a id="rn-002"></a>\n\n### RN-002');
  });

  it('AT-875: RN depois de item de lista leva linha em branco antes do <a id>', () => {
    const t = doc(`## A\n\n### RN-001 — t 1 {#rn-001}\n\n- item\n### RN-002 — t 2 {#rn-002}\n\ncorpo\n`);
    const p = partir(t, { area: 'api', locale: 'pt-BR', limite: 90 * 1024 }).partes[0].texto;
    expect(p).toContain('- item\n\n<a id="rn-002"></a>\n\n### RN-002');
  });

  it('link da RN movida aponta a parte nova; o relativo ganha um nível', () => {
    expect(r.partes[0].texto).toContain('[RN-2](parte-02.md#rn-002)');
    expect(r.partes[0].texto).toContain('[RN-1](#rn-001)');
    expect(r.partes[0].texto).toContain('[x](../../x.md)');
  });

  it('a conferência passa, e cada mutação reprova', () => {
    const ok = { antes: r.rns, indice: r.indice, partes: r.partes, limite: 90 * 1024 };
    expect(conferir(ok)).toEqual([]);
    expect(conferir({ ...ok, indice: r.indice.replace('<a id="rn-003"></a>[003](api/parte-02.md#rn-003)', '') }).length).toBeGreaterThan(0);
    expect(conferir({ ...ok, indice: r.indice.replace('parte-02.md#rn-003', 'parte-01.md#rn-003') }).join()).toMatch(/rn-003/);
    expect(conferir({ ...ok, partes: [{ ...r.partes[0] }, { ...r.partes[1], texto: r.partes[1].texto.replace('{#rn-003}', '') }] }).length).toBeGreaterThan(0);
    expect(conferir({ ...ok, partes: [r.partes[0], { ...r.partes[1], texto: r.partes[1].texto.replace('<a id="rn-003"></a>\n\n', '') }] }).join()).toMatch(/rn-003 sem o <a id>/);
    expect(conferir({ ...ok, limite: 10 * 1024 }).join()).toMatch(/acima de/);
  });
});

describe('dividir no disco', () => {
  function repo() {
    const raiz = mkdtempSync(join(tmpdir(), 'partir-'));
    const w = (rel: string, t: string) => {
      mkdirSync(dirname(join(raiz, rel)), { recursive: true });
      writeFileSync(join(raiz, rel), t);
    };
    const corpo = `## A\n\n${rn(1, 40)}\n## B\n\n${rn(2, 40)}\n${rn(3, 40)}\n`;
    w('docs/business-rules/api.md', doc(corpo));
    w('docs/i18n/en/business-rules/api.md', doc(corpo).replace('Intro.', 'Intro (en).'));
    return raiz;
  }

  it('simular não escreve; escrever parte o pt-BR e as traduções com os MESMOS cortes; refazer recusa', () => {
    const raiz = repo();
    const sim = dividir({ raiz, area: 'api', limite: 90 * 1024, simular: true });
    expect(sim.problemas).toEqual([]);
    expect(existsSync(join(raiz, 'docs/business-rules/api'))).toBe(false);
    const r = dividir({ raiz, area: 'api', limite: 90 * 1024 });
    expect(r.problemas).toEqual([]);
    for (const base of ['docs/business-rules', 'docs/i18n/en/business-rules']) {
      expect(existsSync(join(raiz, base, 'api/parte-02.md'))).toBe(true);
      expect(readFileSync(join(raiz, base, 'api/parte-02.md'), 'utf8')).toContain('### RN-002');
    }
    expect(readFileSync(join(raiz, 'docs/i18n/en/business-rules/api.md'), 'utf8')).toContain('part 1');
    expect(() => dividir({ raiz, area: 'api', limite: 90 * 1024 })).toThrow(/já existe/);
  });

  it('acha a pasta de doc do brabo-ci e falha com mensagem quando não há a página', () => {
    expect(() => dividir({ raiz: mkdtempSync(join(tmpdir(), 'partir-')), area: 'api' })).toThrow(/não achei/);
  });
});
