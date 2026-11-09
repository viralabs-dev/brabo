import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { ancorar, partesDe } from './ancorar-rn.mjs';

const parte = '# P\n\n### RN-001 — a {#rn-001}\n\ncorpo\n\n```md\n### RN-999 — falso {#rn-999}\n```\n\n### RN-002 — b {#rn-002}\n';

describe('ancorar', () => {
  it('põe a âncora antes de cada RN, fora de cerca, e é idempotente', () => {
    const n = ancorar(parte);
    expect(n).toContain('<a id="rn-001"></a>\n\n### RN-001');
    expect(n).toContain('<a id="rn-002"></a>\n\n### RN-002');
    expect(n).not.toContain('<a id="rn-999">');
    expect(ancorar(n)).toBe(n);
  });
  it('só acrescenta linhas (nada some)', () => {
    const n = ancorar(parte);
    expect(n.replace(/<a id="rn-\d+"><\/a>\n\n/g, '')).toBe(parte);
  });
});

describe('CLI', () => {
  const raiz = mkdtempSync(join(tmpdir(), 'ancorar-'));
  for (const rel of ['docs/business-rules/api/parte-01.md', 'docs/i18n/en/business-rules/api/parte-01.md', 'scripts/ci/docs/business-rules/ci/parte-01.md']) {
    mkdirSync(dirname(join(raiz, rel)), { recursive: true });
    writeFileSync(join(raiz, rel), parte);
  }
  const roda = (...a: string[]) => spawnSync('node', [join(__dirname, 'ancorar-rn.mjs'), '--raiz', raiz, ...a], { encoding: 'utf8' });
  it('acha as partes dos dois layouts e das traduções; --conferir reprova e não escreve; depois de escrever, passa', () => {
    expect(partesDe(raiz)).toHaveLength(3);
    expect(roda('--conferir').status).toBe(1);
    expect(readFileSync(join(raiz, 'docs/business-rules/api/parte-01.md'), 'utf8')).toBe(parte);
    expect(roda().status).toBe(0);
    expect(roda('--conferir').status).toBe(0);
  });
});
