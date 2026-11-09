import { describe, expect, it } from 'vitest';
import { criarRenderizador } from './render.mjs';
import { raizDeUrl } from './repo-dono.mjs';

const pag = (slug: string, raiz: string, relativo: string, corpo = '') =>
  ({ slug, url: `${slug}.html`, arquivo: '', raiz, relativo, locale: 'pt-BR', traduzida: true, somenteIngles: false, titulo: slug, descricao: '', rotulo: slug, dados: {}, corpo: `# ${slug}\n\n${corpo}\n` }) as never;

describe('URL do repo dono volta a ser link interno (AT-868, ADR 0288)', () => {
  const adr = pag('adr/0001-x', 'docs', 'adr/0001-x.md');
  const base = 'https://github.com/viralabs-dev';
  const html = async (corpo: string) => {
    const regra = pag('business-rules/api', 'apps/api/docs', 'business-rules/api.md', corpo);
    return (await criarRenderizador({ paginas: [adr, regra] }))(regra).html;
  };

  it('raiz conhecida com a página no layout vira relativo, com a âncora', async () => {
    expect(await html(`[a](${base}/brabo/blob/dev/docs/adr/0001-x.md#decisao)`)).toContain('href="../adr/0001-x.html#decisao"');
  });

  it('raiz conhecida sem a página vira relativo quebrado (o links.mjs reprova); raiz errada também', async () => {
    expect(await html(`[a](${base}/brabo/blob/dev/docs/adr/9999-y.md)`)).toContain('href="../adr/9999-y.html"');
    expect(await html(`[a](${base}/brabo-api/blob/dev/docs/adr/0001-x.md)`)).toContain('href="../adr/0001-x.html"'); // a página existe, mas é da raiz docs
  });

  it('outra origem, caminho fora das raízes e não-.md ficam como estão', async () => {
    for (const u of ['https://example.com/brabo/blob/dev/docs/adr/0001-x.md', `${base}/brabo-api/blob/dev/README.md`, `${base}/brabo/blob/main/docs/adr/0001-x.md`, `${base}/brabo/blob/dev/docs/assets/x.png`]) {
      expect(await html(`[a](${u})`)).toContain(`href="${u}"`);
    }
  });

  it('raizDeUrl é o inverso do urlDeEdicao', () => {
    expect(raizDeUrl(`${base}/brabo-ci/blob/dev/scripts/ci/docs/adr/a.md#x`)).toEqual({ raiz: 'scripts/ci/docs', relativo: 'adr/a.md' });
    expect(raizDeUrl(`${base}/brabo-nada/blob/dev/docs/a.md`)).toBeNull();
  });
});
