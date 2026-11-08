import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { avisos, medirPagina, paginas, tipoDoTexto } from './estilo.mjs';

const raiz = join(__dirname, '..', '..');

/**
 * Catraca (AT-861): páginas com `tipo:` que ainda reprovam. Só encolhe:
 * página fora da lista que estoura reprova; página da lista que já passa
 * também reprova ("tire da lista").
 */
const PENDENTES: string[] = [];

const pagina = (tipo: string, corpo: string) => `---\ntipo: ${tipo}\n---\n# T\n\n${corpo}\n`;
const palavras = (n: number) => Array.from({ length: n }, () => 'a').join(' ');

describe('estilo.mjs', () => {
  it('conta só a prosa: sem frontmatter, código, tabela, título nem Para saber mais', () => {
    const texto = pagina('guia', `um dois\n\n\`\`\`\ncodigo codigo\n\`\`\`\n\n| a | b |\n\n## Para saber mais\n\ntres quatro cinco ADR 0025`);
    expect(medirPagina(texto)).toEqual({ palavras: 2, ids: [] });
  });

  it('guia com 801 palavras reprova e com 800 passa', () => {
    expect(avisos(pagina('guia', palavras(801)))).toHaveLength(1);
    expect(avisos(pagina('guia', palavras(800)))).toEqual([]);
  });

  it('limites de tutorial (1500) e conceito (1200); referência é isenta', () => {
    expect(avisos(pagina('tutorial', palavras(1501)))).toHaveLength(1);
    expect(avisos(pagina('conceito', palavras(1201)))).toHaveLength(1);
    expect(avisos(pagina('referencia', palavras(5000)))).toEqual([]);
  });

  it('tutorial com RN-123 fora de Para saber mais reprova; dentro, código ou título "Para saber mais" passa', () => {
    expect(avisos(pagina('tutorial', 'veja RN-123 aqui'))[0]).toContain('RN-123');
    expect(avisos(pagina('tutorial', 'veja `RN-123` aqui\n\n## Para saber mais\n\nRN-123, ADR 0025'))).toEqual([]);
  });

  it('página sem tipo é ignorada', () => {
    expect(tipoDoTexto('# sem frontmatter')).toBeNull();
    expect(avisos('# T\n\nRN-1 ' + palavras(5000))).toEqual([]);
  });
});

describe('catraca PENDENTES', () => {
  const reprovadas = paginas(raiz).filter((p) => avisos(readFileSync(join(raiz, p), 'utf8')).length > 0);

  it('nenhuma página reprova fora da lista', () => {
    expect(reprovadas.filter((p) => !PENDENTES.includes(p))).toEqual([]);
  });

  it('nenhuma página da lista já passa (tire da lista)', () => {
    expect(PENDENTES.filter((p) => !reprovadas.includes(p))).toEqual([]);
  });

  it('o guia Como escrevemos cabe no próprio orçamento (guia, 800)', () => {
    const texto = readFileSync(join(raiz, 'docs/contribuir/como-escrevemos.md'), 'utf8');
    expect(tipoDoTexto(texto)).toBe('guia');
    expect(avisos(texto)).toEqual([]);
  });
});
