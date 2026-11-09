import { describe, expect, it } from 'vitest';
import { citacoes, compararMinor, executar, verificar } from './capturas-check.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const M = [{ arquivo: 'a-claro.png', web: 'v1.2.1' }];
const base = () => ({
  imagens: { 'capturas/a-claro.png': 100_000, 'logo.svg': 400, 'historico/x/h.gif': 900_000 } as Record<string, number>,
  manifesto: M,
  paginas: { 'docs/p.md': '![a](../assets/capturas/a-claro.png)\n:::historico 2026-10-31\n![h](../assets/historico/x/h.gif)\n:::\n' } as Record<string, string>,
  pin: 'v1.2.1',
  naMain: false,
});

describe('capturas-check (AT-859)', () => {
  it('o estado certo passa', () => expect(verificar(base()).erros).toEqual([]));

  it('MUTAÇÃO: imagem fora do manifesto e de historico/ reprova', () => {
    const b = base(); b.imagens['capturas/solta.png'] = 10;
    expect(verificar(b).erros.join()).toContain('capturas/solta.png: imagem fora de historico/');
  });
  it('MUTAÇÃO: entrada do manifesto sem arquivo reprova', () => {
    const b = base(); delete b.imagens['capturas/a-claro.png'];
    expect(verificar(b).erros.join()).toContain('está no manifesto e não existe');
  });
  it('MUTAÇÃO: acima de 400 KB reprova; animação do histórico vai até 1,5 MB', () => {
    const b = base(); b.imagens['capturas/a-claro.png'] = 401 * 1024;
    expect(verificar(b).erros.join()).toContain('acima de 400 KB');
    const c = base(); c.imagens['historico/x/h.gif'] = 2 * 1024 * 1024;
    expect(verificar(c).erros.join()).toContain('acima de 1536 KB');
  });
  it('MUTAÇÃO: imagem histórica fora de :::historico reprova', () => {
    const b = base(); b.paginas['docs/p.md'] = '![h](../assets/historico/x/h.gif)\n';
    expect(verificar(b).erros.join()).toContain('precisa estar dentro de :::historico');
  });
  it('versão do web abaixo da pin: avisa na dev e reprova na main', () => {
    const b = { ...base(), pin: 'v1.3.0' };
    expect(verificar(b)).toMatchObject({ erros: [] });
    expect(verificar(b).avisos.join()).toContain('só avisa na dev');
    expect(verificar({ ...b, naMain: true }).erros.join()).toContain('reprova na main');
  });
  it('a página que usa a imagem é descoberta por grep', () => {
    expect(verificar(base()).uso['capturas/a-claro.png']).toEqual(['docs/p.md']);
  });
  it('compararMinor e citacoes', () => {
    expect(compararMinor('v1.2.9', 'v1.3.0')).toBe(-1);
    expect(compararMinor('v2.0.0', 'v1.9.9')).toBe(1);
    expect(citacoes('<img src="docs/assets/logo.svg" />')[0].caminho).toBe('docs/assets/logo.svg');
  });
  it('o repositório real passa', () => {
    const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    expect(executar(raiz, {}).erros).toEqual([]);
  });
});
