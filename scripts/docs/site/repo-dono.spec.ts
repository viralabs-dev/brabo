import { describe, expect, it } from 'vitest';
import { RAIZES_DE_DOC } from '../raizes-de-doc.mjs';
import { urlDeEdicao } from './repo-dono.mjs';

describe('repo dono da página (AT-702)', () => {
  it('aponta para o repositório dono, com o caminho dentro dele', () => {
    expect(urlDeEdicao('viralabs-dev/brabo', 'apps/api/docs', 'reference/x.md')).toBe(
      'https://github.com/viralabs-dev/brabo-api/blob/dev/docs/reference/x.md',
    );
    expect(urlDeEdicao('viralabs-dev/brabo', 'docs', 'intro.md')).toBe('https://github.com/viralabs-dev/brabo/blob/dev/docs/intro.md');
  });

  it('um caminho que sai da docs/ vira arquivo da raiz do repo dono', () => {
    expect(urlDeEdicao('viralabs-dev/brabo', 'apps/runner/docs', '../README.md')).toBe('https://github.com/viralabs-dev/brabo-runner/blob/dev/README.md');
  });

  it('toda raiz de doc tem dono; raiz desconhecida reprova', () => {
    for (const raiz of Object.values(RAIZES_DE_DOC)) expect(() => urlDeEdicao('o/r', raiz, 'a.md')).not.toThrow();
    expect(() => urlDeEdicao('o/r', 'apps/nova/docs', 'a.md')).toThrow(/sem repositório dono/);
  });
});
