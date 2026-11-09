import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { trocar } from './links-para-repo-dono.mjs';

const REPOS: Record<string, string> = { brabo: 'docs', 'brabo-api': 'docs', 'brabo-web': 'docs', 'brabo-engine': 'docs', 'brabo-runner': 'docs', 'brabo-broker': 'docs', 'brabo-qa': 'docs', 'brabo-contracts': 'packages/docs', 'brabo-infra': 'deploy/docs', 'brabo-ci': 'scripts/ci/docs' };

function montar(extra: Record<string, string> = {}) {
  const irmaos = mkdtempSync(path.join(tmpdir(), 'lrd-'));
  const brabo = path.join(irmaos, 'brabo');
  const pagina = ['# API', '[adr](../adr/0001-x.md#d) [web](web.md#rn-1) [própria](#rn-1) [uma](api/parte-01.md)', '`[c](../adr/0001-x.md)`', '```', '[c](../adr/0001-x.md)', '```', '[ext](https://x.y/a.md) ![i](../assets/a.png)'].join('\n');
  const arquivos: Record<string, string> = { 'brabo/docs/adr/0001-x.md': '# x', 'brabo-web/docs/business-rules/web.md': '# w', 'brabo-api/docs/business-rules/api.md': pagina, 'brabo-api/docs/business-rules/api/parte-01.md': '# p', ...extra };
  for (const [repo, pasta] of Object.entries(REPOS)) mkdirSync(path.join(irmaos, repo, pasta), { recursive: true });
  for (const [f, t] of Object.entries(arquivos)) { mkdirSync(path.dirname(path.join(irmaos, f)), { recursive: true }); writeFileSync(path.join(irmaos, f), t); }
  return { irmaos, brabo, api: path.join(irmaos, 'brabo-api/docs/business-rules/api.md') };
}

describe('links-para-repo-dono (AT-868)', () => {
  it('sem --escrever só lista; com --escrever troca só o que não resolve no repo, fora de cerca e de código', () => {
    const { irmaos, brabo, api } = montar();
    const antes = readFileSync(api, 'utf8');
    const r = trocar({ area: 'api', irmaos, brabo });
    expect(r.erros).toEqual([]);
    expect(r.total).toBe(2);
    expect(readFileSync(api, 'utf8')).toBe(antes);
    trocar({ area: 'api', irmaos, brabo, escrever: true });
    const depois = readFileSync(api, 'utf8');
    expect(depois).toContain('[adr](https://github.com/viralabs-dev/brabo/blob/dev/docs/adr/0001-x.md#d)');
    expect(depois).toContain('[web](https://github.com/viralabs-dev/brabo-web/blob/dev/docs/business-rules/web.md#rn-1)');
    expect(depois).toContain('[própria](#rn-1) [uma](api/parte-01.md)');
    expect(depois).toContain('`[c](../adr/0001-x.md)`\n```\n[c](../adr/0001-x.md)\n```');
    expect(depois).toContain('![i](../assets/a.png)');
    expect(trocar({ area: 'api', irmaos, brabo }).total).toBe(0); // idempotente
  });

  it('reprova alvo em nenhuma raiz e alvo em mais de uma, e não escreve', () => {
    const a = montar({ 'brabo-api/docs/business-rules/z.md': '[n](../nada.md)' });
    expect(trocar({ area: 'api', irmaos: a.irmaos, brabo: a.brabo, escrever: true }).erros[0]).toMatch(/nada\.md.*nenhuma raiz/);
    expect(readFileSync(a.api, 'utf8')).toContain('](../adr/0001-x.md#d)');
    const b = montar({ 'brabo-engine/docs/adr/0001-x.md': '# dup' });
    expect(trocar({ area: 'api', irmaos: b.irmaos, brabo: b.brabo }).erros[0]).toMatch(/mais de uma raiz/);
  });

  it('a tradução conta pela raiz do locale e a área desconhecida reprova', () => {
    const { irmaos, brabo } = montar({ 'brabo-api/docs/i18n/en/business-rules/api.md': '[a](../adr/0001-x.md)' });
    expect(trocar({ area: 'api', irmaos, brabo }).total).toBe(3);
    expect(() => trocar({ area: 'xis', irmaos, brabo })).toThrow(/desconhecida/);
  });
});
