import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { TETO, medirPaginas, verificarOrcamento } from './orcamento.mjs';

const KB = 1024;
function build(paginas: Record<string, number>) {
  const dir = mkdtempSync(join(tmpdir(), 'orc-'));
  for (const [rel, kb] of Object.entries(paginas)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), 'x'.repeat(kb * KB));
  }
  return dir;
}

describe('orçamento de peso da página gerada (AT-862, ADR 0287)', () => {
  it('o teto é 150 KB e o locale sai do caminho', () => {
    expect(TETO).toBe(150 * KB);
    const m = medirPaginas(build({ 'a.html': 1, 'ru/b/c.html': 2 }));
    expect(m.map((p: any) => [p.slug, p.locale]).sort()).toEqual([['a', 'pt-BR'], ['b/c', 'ru']]);
  });

  it('página do brabo acima do teto reprova, em qualquer locale (o ru pesa mais)', () => {
    const r = verificarOrcamento(build({ 'x.html': 149, 'ru/x.html': 151, 'en/x.html': 100 }), { pendentes: [] });
    expect(r.erros).toEqual(['ru/x.html: 151 KB, acima de 150 KB']);
  });

  it('página de RN de irmão só avisa; a divisão em partes também conta como irmão', () => {
    const r = verificarOrcamento(build({ 'business-rules/api.html': 900, 'ru/business-rules/web/parte-01.html': 200, 'business-rules/produto.html': 200 }), { pendentes: [] });
    expect(r.avisos).toHaveLength(2);
    expect(r.erros).toEqual(['business-rules/produto.html: 200 KB, acima de 150 KB']);
  });

  it('mutação: com irmaosSoAvisam desligado a página do irmão reprova', () => {
    const r = verificarOrcamento(build({ 'business-rules/engine.html': 700 }), { pendentes: [], irmaosSoAvisam: false });
    expect(r.erros).toHaveLength(1);
  });

  it('pendente declarado não reprova, mas aparece', () => {
    const r = verificarOrcamento(build({ 'explanation/historico-de-fases.html': 300 }), { pendentes: ['explanation/historico-de-fases'] });
    expect([r.erros.length, r.pendentes.length]).toEqual([0, 1]);
  });
});
