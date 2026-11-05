import { describe, expect, it } from 'vitest';
import { conferirIdiomaDosIrmaos, linhasEmPortugues } from './idioma-dos-irmaos.mjs';

/** AT-745, ADR 0260: cada reprovação é uma MUTAÇÃO da forma correta. */
const EN = '---\nidioma_original: en\n---\n# Page\nThe rule holds.\n';
const lerDe = (m: Record<string, string>) => (f: string) => m[f];
const problemas = (m: Record<string, string>) => conferirIdiomaDosIrmaos(Object.keys(m), lerDe(m));

describe('conferirIdiomaDosIrmaos', () => {
  it('páginas em inglês nas raízes dos irmãos passam', () => {
    expect(problemas({ 'apps/api/docs/a.md': EN, 'deploy/docs/b.md': EN, 'packages/docs/c.md': EN })).toEqual([]);
  });

  it('MUTAÇÃO (a): tirar o idioma_original reprova, nomeando arquivo e ADR', () => {
    const r = problemas({ 'apps/web/docs/a.md': '# Página\n' });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ arquivo: 'apps/web/docs/a.md' });
    expect(r[0].motivo).toMatch(/idioma_original: en.*0260/);
  });

  it('MUTAÇÃO (a): idioma_original de outro idioma reprova', () => {
    expect(problemas({ 'apps/api/docs/a.md': '---\nidioma_original: pt-BR\n---\nx' })).toHaveLength(1);
  });

  it('MUTAÇÃO (b): existir i18n/ numa raiz de irmão reprova', () => {
    const r = problemas({ 'apps/engine/docs/i18n/en/a.md': EN });
    expect(r).toHaveLength(1);
    expect(r[0].motivo).toMatch(/i18n.*0260/);
  });

  it('as raízes do brabo (docs/ e scripts/ci/docs/) continuam multilíngues', () => {
    expect(problemas({ 'docs/a.md': '# pt\n', 'docs/i18n/en/a.md': '# en\n', 'scripts/ci/docs/b.md': '# pt\n' })).toEqual([]);
  });

  it('arquivo que não é .md não é página', () => {
    expect(problemas({ 'apps/api/docs/.docmap.yml': 'rules: []' })).toEqual([]);
  });
});

describe('linhasEmPortugues', () => {
  it('prosa em inglês não conta', () => {
    expect(linhasEmPortugues(EN)).toEqual([]);
  });

  it('MUTAÇÃO: prosa pt-BR reprova, com o número da linha', () => {
    expect(linhasEmPortugues('# T\nThe rule holds.\nA regra não vale quando a conta está vazia.\n')).toEqual([3]);
    expect(linhasEmPortugues('A validação feita\n')).toEqual([1]);
  });

  it('citação entre aspas que atravessa linhas é ignorada', () => {
    const t = 'The prompt says "Mantenha o turno\nno idioma original; não traduza\ncitações" and stops.\n';
    expect(linhasEmPortugues(t)).toEqual([]);
  });

  it('MUTAÇÃO: sem fechar a aspa a prosa volta a contar', () => {
    expect(linhasEmPortugues('The prompt says "Mantenha o turno\nno idioma original; não traduza\n')).toEqual([2]);
  });

  it('aspas escapadas, crases (simples, duplas, multilinha), URL, e-mail e link são ignorados', () => {
    expect(linhasEmPortugues('It logs \\"não respondeu\\" once.\n')).toEqual([]);
    // escapadas dentro de aspas: sem a regra própria, o par errado fecha e a prosa vaza
    expect(linhasEmPortugues('(failure: "CASO: erro e a mensagem fica \\"não enviada\\"\n (RN-831)")\n')).toEqual([]);
    expect(linhasEmPortugues('It says ``não respondeu `x` dentro``.\n')).toEqual([]);
    expect(linhasEmPortugues('Run `o comando não\npassou` now.\n')).toEqual([]);
    expect(linhasEmPortugues('See https://exemplo.local/não/para/que and nao@para.xyz.\n')).toEqual([]);
    expect(linhasEmPortugues('See [docs](../uma/pagina-que-nao.md) and docs.api.nvidia.com/nim.\n')).toEqual([]);
  });

  it('frontmatter, cerca de código, citação em bloco, itálico e rótulo da UI ficam de fora', () => {
    expect(linhasEmPortugues('---\ntitle: Não sei\n---\nText.\n')).toEqual([]);
    expect(linhasEmPortugues('```\nnão é prosa\n```\nText.\n')).toEqual([]);
    expect(linhasEmPortugues('> Mantenha o turno; não traduza.\n')).toEqual([]);
    expect(linhasEmPortugues('The *Última execução* line and the Aprovações tab.\n')).toEqual([]);
    expect(linhasEmPortugues('("o aceite é o primário; "Ativar execução" é secundário")\n')).toEqual([]);
  });
});
