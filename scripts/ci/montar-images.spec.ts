import { describe, expect, it } from 'vitest';
import { montarImages } from './montar-images.ts';

const comp = { api: { repo: 'r/brabo-api', tag: 'v1.0.0', imagem: 'ghcr.io/o/brabo-api' } };
const ok = { imagem: 'ghcr.io/o/brabo-api', tag: 'v1.0.0', digest: 'sha256:' + 'a'.repeat(64) };

describe('montarImages', () => {
  it('monta o formato que o install.sh lê', () => {
    const m = montarImages(comp, () => ok, '1.0.0', 'abc', 'agora');
    expect(m.imagens).toEqual([
      { alvo: 'api', repositorio: 'ghcr.io/o/brabo-api', digest: ok.digest, tags: ['1.0.0'] },
    ]);
  });
  it('componente opcional: sem arquivo pula, com arquivo entra', () => {
    const c = { ...comp, laya: { repo: 'r/brabo-infra', tag: 'v1.0.0', imagem: 'ghcr.io/o/brabo-laya', opcional: true } };
    expect(montarImages(c, (a) => (a === 'api' ? ok : undefined), '1.0.0', 'abc', 'agora').imagens.map((i) => i.alvo)).toEqual(['api']);
    const laya = { ...ok, imagem: 'ghcr.io/o/brabo-laya' };
    expect(montarImages(c, (a) => (a === 'api' ? ok : laya), '1.0.0', 'abc', 'agora').imagens.map((i) => i.alvo)).toEqual(['api', 'laya']);
  });
  it('obrigatório sem arquivo reprova', () => {
    expect(() => montarImages(comp, () => undefined, '1.0.0', 'abc')).toThrow('sem imagem.json');
  });
  it.each([
    ['digest malformado', { ...ok, digest: 'sha256:xx' }],
    ['tag diferente', { ...ok, tag: 'v1.0.1' }],
    ['imagem diferente', { ...ok, imagem: 'ghcr.io/o/outra' }],
  ])('reprova %s', (_n, lido) => {
    expect(() => montarImages(comp, () => lido, '1.0.0', 'abc')).toThrow();
  });
});
