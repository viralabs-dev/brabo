import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { itensDeRegras, partesDoRunbook, slugsDeRegras } from './navegacao.mjs';

function raiz() {
  const r = mkdtempSync(join(tmpdir(), 'nav-'));
  for (const f of ['docs/business-rules/custo.md', 'docs/business-rules/produto.md', 'apps/api/docs/business-rules/api.md', 'apps/api/docs/business-rules/api/parte-02.md', 'apps/api/docs/business-rules/api/parte-01.md', 'apps/web/docs/business-rules/web.md']) {
    mkdirSync(dirname(join(r, f)), { recursive: true });
    writeFileSync(join(r, f), '#');
  }
  return r;
}
const raizes = ['docs', 'apps/api/docs', 'apps/web/docs'];

describe('regras de negócio no menu (AT-862, ADR 0287)', () => {
  it('área partida vira subcategoria recolhida com o índice como link e as partes em ordem', () => {
    const itens = itensDeRegras(raiz(), raizes);
    expect(itens.map((i: any) => i.slug)).toEqual(['business-rules/custo', 'business-rules/api', 'business-rules/produto', 'business-rules/web']);
    expect(itens[1]).toMatchObject({ tipo: 'categoria', colapsada: true, itens: [{ slug: 'business-rules/api/parte-01' }, { slug: 'business-rules/api/parte-02' }] });
    expect(itens[3]).toEqual({ tipo: 'pagina', slug: 'business-rules/web' });
  });

  it('a lista plana de slugs (ordem de leitura) traz o índice antes das partes', () => {
    expect(slugsDeRegras(raiz(), raizes)).toEqual(['business-rules', 'business-rules/custo', 'business-rules/api', 'business-rules/api/parte-01', 'business-rules/api/parte-02', 'business-rules/produto', 'business-rules/web']);
  });
});

describe('runbook partido no menu (AT-869, ADR 0287)', () => {
  it('lista as partes de `deploy/docs/runbook/` em ordem, e nada quando o runbook é um arquivo só', () => {
    const r = mkdtempSync(join(tmpdir(), 'nav-rb-'));
    mkdirSync(join(r, 'deploy/docs/runbook'), { recursive: true });
    writeFileSync(join(r, 'deploy/docs/runbook.md'), '#');
    expect(partesDoRunbook(r, ['deploy/docs'])).toEqual([]);
    for (const f of ['restore', 'deploy']) writeFileSync(join(r, `deploy/docs/runbook/${f}.md`), '#');
    expect(partesDoRunbook(r, ['deploy/docs'])).toEqual(['runbook/deploy', 'runbook/restore']);
  });
});
