import { describe, expect, it } from 'vitest';
import { chavesFaltando, LOCALES_GERADOS, TEXTOS, textosDaFonte } from './textos-gerados.mjs';

describe('textos-gerados', () => {
  it('todo locale tem toda chave da fonte pt-BR', () => {
    expect(chavesFaltando(TEXTOS)).toEqual([]);
  });

  it('mutação: tirar um texto de um locale reprova', () => {
    const { aviso: _fora, ...ruSemAviso } = TEXTOS.ru;
    expect(chavesFaltando({ ...TEXTOS, ru: ruSemAviso })).toEqual(['ru.aviso']);
  });

  it('mutação: chave sobrando num locale também reprova', () => {
    expect(chavesFaltando({ ...TEXTOS, en: { ...TEXTOS.en, extra: 'x' } })).toEqual(['en.extra (sobra)']);
  });

  it('a nota de llm tem o mesmo número de linhas em todo locale', () => {
    for (const l of LOCALES_GERADOS) expect(TEXTOS[l].llmNota).toHaveLength(TEXTOS['pt-BR'].llmNota.length);
  });
});

describe('textosDaFonte (AT-745)', () => {
  it('fonte com idioma_original: en recebe os textos em inglês; sem o campo, pt-BR', () => {
    expect(textosDaFonte('---\nidioma_original: en\n---\n# X', TEXTOS)).toBe(TEXTOS.en);
    expect(textosDaFonte('---\ntitle: x\n---\n# X', TEXTOS)).toBe(TEXTOS['pt-BR']);
  });
  it('mutação: o campo no corpo (fora do frontmatter) não conta', () => {
    expect(textosDaFonte('# X\nidioma_original: en\n', TEXTOS)).toBe(TEXTOS['pt-BR']);
  });
});
