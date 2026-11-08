import { describe, expect, it } from 'vitest';
import { TIPOS, conferirTipos, tipoDaPagina } from './tipos.mjs';

const pg = (slug: string, rotulo?: string) => ({ tipo: 'pagina', slug, rotulo });
const grupo = (rotulo: string, espera: string[], itens: unknown[]) => ({ tipo: 'categoria', rotulo, colapsada: false, espera, itens });
const nav = [
  grupo('Guias', ['guia'], [pg('how-to/x'), pg('runbook')]),
  grupo('Histórico', ['historico'], [pg('explanation/fase-1'), pg('explanation/velha')]),
];
const pagina = (slug: string, dados: Record<string, unknown> = {}, raiz = 'docs') => ({ slug, raiz, relativo: `${slug}.md`, dados });

describe('tipo da página (AT-854)', () => {
  it('declarado vence; sem ele vale a pasta; sem nenhum dos dois é indefinido', () => {
    expect(tipoDaPagina({ slug: 'adr/0001-x' })).toBe('decisao');
    expect(tipoDaPagina({ slug: 'business-rules/api' })).toBe('referencia');
    expect(tipoDaPagina({ slug: 'how-to/x' })).toBe('guia');
    expect(tipoDaPagina({ slug: 'explanation/fase-1', dados: { tipo: 'historico' } })).toBe('historico');
    expect(tipoDaPagina({ slug: 'runbook' })).toBeUndefined();
    expect(TIPOS).toContain('decisao');
  });
});

describe('conferirTipos', () => {
  const ok = [pagina('how-to/x'), pagina('explanation/fase-1', { tipo: 'historico' }), pagina('explanation/velha', { tipo: 'historico' }), pagina('runbook', {}, 'deploy/docs')];

  it('árvore certa não dá erro; irmão sem tipo derivável vira só aviso', () => {
    const r = conferirTipos({ paginas: ok, navegacao: nav });
    expect(r.erros).toEqual([]);
    expect(r.avisos).toHaveLength(1);
    expect(r.avisos[0]).toContain('brabo-infra');
  });

  it('página do brabo sem tipo e sem pasta que o diga reprova', () => {
    const r = conferirTipos({ paginas: [pagina('runbook')], navegacao: nav });
    expect(r.erros[0]).toMatch(/sem `tipo:`/);
  });

  it('página histórica sem o tipo declarado cai no grupo errado e reprova', () => {
    const r = conferirTipos({ paginas: [pagina('explanation/velha')], navegacao: nav });
    expect(r.erros[0]).toMatch(/tipo "conceito" no grupo "Histórico"/);
  });

  it('tipo inexistente e página fora do menu reprovam', () => {
    expect(conferirTipos({ paginas: [pagina('how-to/x', { tipo: 'receita' })], navegacao: nav }).erros[0]).toMatch(/não existe/);
    expect(conferirTipos({ paginas: [pagina('how-to/solta')], navegacao: nav }).erros[0]).toMatch(/não está no menu/);
  });

  it('irmão que não bate vira aviso, mas se DECLAROU o tipo errado reprova', () => {
    const pasta = conferirTipos({ paginas: [pagina('explanation/velha', {}, 'apps/api/docs')], navegacao: nav });
    expect(pasta.erros).toEqual([]);
    expect(pasta.avisos[0]).toContain('brabo-api');
    const declarado = conferirTipos({ paginas: [pagina('explanation/velha', { tipo: 'conceito' }, 'apps/api/docs')], navegacao: nav });
    expect(declarado.erros).toHaveLength(1);
  });
});
