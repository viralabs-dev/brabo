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
  it.each([
    ['digest malformado', { ...ok, digest: 'sha256:xx' }],
    ['tag diferente', { ...ok, tag: 'v1.0.1' }],
    ['imagem diferente', { ...ok, imagem: 'ghcr.io/o/outra' }],
  ])('reprova %s', (_n, lido) => {
    expect(() => montarImages(comp, () => lido, '1.0.0', 'abc')).toThrow();
  });
});
