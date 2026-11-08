import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// O site de docs segue os tokens do produto (AT-561, ADR 0181): este spec
// resolve os --site-* do site até hex, nos dois temas, e cobra 4,5:1.
const raiz = resolve(__dirname, '../..');
const TOKENS = readFileSync(resolve(raiz, 'apps/web/design/tokens.css'), 'utf8');
const SITE = readFileSync(resolve(raiz, 'scripts/docs/site/assets/site.css'), 'utf8');

function bloco(css: string, seletor: string): Record<string, string> {
  const inicio = css.indexOf(`${seletor} {`);
  if (inicio < 0) return {};
  const corpo = css
    .slice(inicio, css.indexOf('\n}', inicio))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const vars: Record<string, string> = {};
  for (const m of corpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

// Divide `a, b, c` só nas vírgulas de fora dos parênteses.
function partes(txt: string, sep: RegExp | string): string[] {
  const out: string[] = [];
  let prof = 0;
  let atual = '';
  for (const ch of txt) {
    if (ch === '(') prof++;
    if (ch === ')') prof--;
    if (prof === 0 && (typeof sep === 'string' ? ch === sep : sep.test(ch))) {
      if (atual.trim()) out.push(atual.trim());
      atual = '';
    } else atual += ch;
  }
  if (atual.trim()) out.push(atual.trim());
  return out;
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

// Resolve hex, var() e `color-mix(in srgb, X N%, Y)` (os --*-panel do design system) até hex.
function valor(vars: Record<string, string>, expr: string | undefined, prof = 0): string | null {
  if (!expr || prof > 12) return null;
  const e = expr.trim();
  if (/^#[0-9a-f]{6}$/i.test(e)) return e.toLowerCase();
  const ref = /^var\((--[\w-]+)\)$/.exec(e);
  if (ref) return valor(vars, vars[ref[1]], prof + 1);
  const mix = /^color-mix\((.*)\)$/s.exec(e);
  if (!mix) return null;
  const [espaco, a, b] = partes(mix[1], ',');
  if (espaco !== 'in srgb' || !b) return null;
  const [corA, pctA] = partes(a, /\s/);
  const pct = parseFloat(pctA?.startsWith('var(') ? (vars[pctA.slice(4, -1)] ?? '') : (pctA ?? ''));
  const ca = valor(vars, corA, prof + 1);
  const cb = valor(vars, b, prof + 1);
  if (!ca || !cb || Number.isNaN(pct)) return null;
  const canal = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return `#${[1, 3, 5].map((i) => hex2((canal(ca, i) * pct) / 100 + (canal(cb, i) * (100 - pct)) / 100)).join('')}`;
}

function resolver(vars: Record<string, string>, nome: string): string | null {
  return valor(vars, `var(${nome})`);
}

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// [texto, fundo]: os pares que o site.css realmente desenha.
const PARES: [string, string][] = [
  ['--site-texto', '--site-fundo'],
  ['--site-texto-2', '--site-fundo'],
  ['--site-texto-mudo', '--site-fundo'],
  ['--site-link', '--site-fundo'],
  ['--site-texto', '--site-fundo-lateral'],
  ['--site-texto-2', '--site-fundo-lateral'],
  ['--site-link', '--site-fundo-lateral'],
  ['--site-codigo-texto', '--site-codigo-fundo'],
  ['--site-passo-texto', '--site-passo-fundo'],
  ['--site-texto', '--site-historico-fundo'],
  ['--site-texto-2', '--site-historico-fundo'],
  ['--site-link', '--site-historico-fundo'],
  ...(['nota', 'dica', 'cuidado', 'perigo'] as const).flatMap((t): [string, string][] => [
    ['--site-texto', `--site-aviso-${t}-fundo`],
    ['--site-texto-2', `--site-aviso-${t}-fundo`],
    [`--site-aviso-${t}-titulo`, `--site-aviso-${t}-fundo`],
  ]),
];

function medir(tokens: string, site: string) {
  const escuro = bloco(tokens, ':root');
  const claro = { ...escuro, ...bloco(tokens, "[data-theme='light']") };
  const mapa = bloco(site, ':root');
  const out: { tema: string; nome: string; razao: number }[] = [];
  for (const [tema, base] of [
    ['escuro', escuro],
    ['claro', claro],
  ] as const) {
    const vars = { ...base, ...mapa };
    for (const [texto, fundo] of PARES) {
      const c = resolver(vars, texto);
      const f = resolver(vars, fundo);
      if (c && f) out.push({ tema, nome: `${texto} / ${fundo}`, razao: contraste(c, f) });
    }
  }
  return out;
}

describe('contraste do site de documentação', () => {
  it('todo texto resolvido passa 4,5:1 contra o fundo nos dois temas', () => {
    const medidas = medir(TOKENS, SITE);
    console.log(medidas.map((m) => `${m.tema} ${m.nome} ${m.razao.toFixed(2)}`).join('\n'));
    expect(medidas.length, 'CEGO: nenhum valor resolvido').toBe(PARES.length * 2);
    for (const m of medidas) expect(m.razao, `${m.tema} ${m.nome}`).toBeGreaterThanOrEqual(4.5);
  });

  it('mutação: primary claro #c4552d sobre branco reprova (4,48)', () => {
    const mutado = TOKENS.replace(
      /(\[data-theme='light'\] \{[\s\S]*?--accent:\s*)#a4502c/,
      '$1#c4552d',
    );
    expect(mutado).not.toBe(TOKENS);
    const m = medir(mutado, SITE).find(
      (x) => x.tema === 'claro' && x.nome === '--site-link / --site-fundo',
    );
    expect(m?.razao).toBeLessThan(4.5);
  });

  it('mutação: tinta do aviso a 60% (color-mix) reprova, então os fundos de aviso não são cegos', () => {
    const mutado = TOKENS.replace('--tint-panel: 8%;', '--tint-panel: 60%;');
    expect(mutado).not.toBe(TOKENS);
    const reprovados = medir(mutado, SITE).filter((x) => x.nome.includes('aviso') && x.razao < 4.5);
    expect(reprovados.length).toBeGreaterThan(0);
  });

  it('o color-mix do aviso resolve: 8% de accent sobre --surface-1 (escuro) fica entre os dois', () => {
    const v = bloco(TOKENS, ':root');
    expect(resolver(v, '--accent-panel')).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolver(v, '--accent-panel')).not.toBe(resolver(v, '--surface-1'));
  });

  it('mutação: sem o mapa do site é CEGO (zero valores)', () => {
    expect(medir(TOKENS, '')).toHaveLength(0);
  });
});
