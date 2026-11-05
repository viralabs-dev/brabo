/**
 * montar-images — junta o `imagem.json` que cada repo de app anexa à Release da
 * tag dele no `images.json` do PRODUTO (o formato que o `install.sh` lê).
 *
 *   node scripts/ci/montar-images.ts <componentes.json> <dir-dos-imagem.json> <versao> <commit> > images.json
 *
 * `<dir>/<alvo>.json` tem `{"imagem":"ghcr.io/…/brabo-api","tag":"v1.0.0","digest":"sha256:…"}`.
 * Falta de alvo, digest malformado ou imagem/tag diferentes do `componentes.json`
 * REPROVAM: cinco de cinco ou nenhuma (mesma disciplina do monorepo).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const DIGEST = /^sha256:[0-9a-f]{64}$/;

interface Componente { repo: string; tag: string; imagem: string }
export interface ImagemDeApp { imagem?: unknown; tag?: unknown; digest?: unknown }

export function montarImages(
  componentes: Record<string, Componente>,
  lido: (alvo: string) => ImagemDeApp,
  versao: string,
  commit: string,
  publicadoEm = new Date().toISOString(),
) {
  const imagens = Object.entries(componentes).map(([alvo, c]) => {
    const i = lido(alvo);
    if (i.imagem !== c.imagem) throw new Error(`${alvo}: imagem ${String(i.imagem)} ≠ ${c.imagem}`);
    if (i.tag !== c.tag) throw new Error(`${alvo}: tag ${String(i.tag)} ≠ ${c.tag} (componentes.json)`);
    if (typeof i.digest !== 'string' || !DIGEST.test(i.digest)) throw new Error(`${alvo}: digest inválido`);
    return { alvo, repositorio: c.imagem, digest: i.digest, tags: [c.tag.replace(/^v/, '')] };
  });
  if (imagens.length === 0) throw new Error('componentes.json sem imagens');
  return { versao, commit, publicadoEm, imagens };
}

if (process.argv[1]?.endsWith('montar-images.ts')) {
  const [, , arquivo, dir, versao, commit] = process.argv;
  if (!arquivo || !dir || !versao || !commit) {
    console.error('uso: montar-images.ts <componentes.json> <dir> <versao> <commit>');
    process.exit(2);
  }
  try {
    const { imagens } = JSON.parse(readFileSync(arquivo, 'utf8'));
    const m = montarImages(imagens, (a) => JSON.parse(readFileSync(path.join(dir, `${a}.json`), 'utf8')), versao, commit);
    console.log(JSON.stringify(m, null, 2));
  } catch (e) {
    console.error(`::error::montar-images: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
