#!/usr/bin/env node
/**
 * Orçamento de peso da página gerada (AT-862, ADR 0287): 150 KB de HTML por
 * página, em TODOS os locales (o `ru` é o pior).
 *   node scripts/docs/site/orcamento.mjs [<dir-do-build>] [--relatorio]
 *
 *  - ERRO: página do `brabo` acima do teto (sai 1);
 *  - AVISO: página de RN dos irmãos acima do teto. Elas só se dividem na rodada B
 *    (`partir-rn.mjs` rodado em cada irmão); depois dela, esta lista vira ERRO
 *    (esvazie `IRMAOS_SO_AVISAM`);
 *  - `PENDENTES`: páginas do `brabo` já conhecidas acima do teto, com dono. A lista só encolhe.
 *  - `--relatorio`: todas as páginas acima do teto, ordenadas, e o total por locale.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TETO = 150 * 1024;

/**
 * Acima do teto e com dono; a lista só encolhe (slug, vale para os 4 locales):
 *  - `explanation/historico-de-fases-parte-4`: só o `ru` passa (194 KB; a fonte tem 138 KB); o cirílico pesa mais no HTML, e partir a tradução quebraria a paridade de slug com a fonte;
 *  - `runbook`: página do brabo-infra (464 KB), fora desta AT;
 *  - `reference/internal-api`: só o `ru` passa (202 KB), fora desta AT;
 *  - `business-rules/produto`: só o `ru` passa (200 KB); roda-se `partir-rn.mjs --repo produto` na rodada C;
 *  - `reference/configuration`: só o `ru` passa (170 KB); precisa de uma página por serviço.
 */
export const PENDENTES = ['explanation/historico-de-fases-parte-4', 'runbook', 'reference/internal-api', 'business-rules/produto', 'reference/configuration'];

/** Páginas de RN que moram nos irmãos (`business-rules/<x>.html` e `business-rules/<x>/parte-NN.html`). */
const IRMAO = /^business-rules\/(?:api|engine|web|runner|ci|broker|contracts|infra)(?:\/|$)/;
export const IRMAOS_SO_AVISAM = true;

const LOCALE = /^(?:en|ru|zh-Hans)\//;
const arquivosDe = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivosDe(path.join(dir, e.name)) : [path.join(dir, e.name)]));

/** `[{rel, slug, locale, bytes}]` de cada `.html` do build. */
export function medirPaginas(dir) {
  return arquivosDe(dir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const rel = path.relative(dir, f).split(path.sep).join('/');
      return { rel, slug: rel.replace(LOCALE, '').replace(/\.html$/, ''), locale: LOCALE.test(rel) ? rel.split('/')[0] : 'pt-BR', bytes: statSync(f).size };
    });
}

export function verificarOrcamento(dir, { teto = TETO, pendentes = PENDENTES, irmaosSoAvisam = IRMAOS_SO_AVISAM } = {}) {
  const paginas = medirPaginas(dir);
  const r = { paginas: paginas.length, erros: [], avisos: [], pendentes: [], acima: [] };
  for (const p of paginas.filter((x) => x.bytes > teto).sort((a, b) => b.bytes - a.bytes)) {
    const msg = `${p.rel}: ${Math.round(p.bytes / 1024)} KB, acima de ${Math.round(teto / 1024)} KB`;
    r.acima.push({ ...p, msg });
    if (IRMAO.test(p.slug) && irmaosSoAvisam) r.avisos.push(msg);
    else if (pendentes.includes(p.slug)) r.pendentes.push(msg);
    else r.erros.push(msg);
  }
  return r;
}

function main() {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const args = process.argv.slice(2);
  const dir = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(raiz, 'build/docs-site'));
  if (!existsSync(dir)) { console.error(`orcamento: o build não existe em ${dir} — rode \`pnpm docs:site\`.`); process.exit(2); }
  const r = verificarOrcamento(dir);
  if (r.paginas === 0) { console.error(`orcamento: CEGO — nenhum .html em ${dir}.`); process.exit(2); }
  console.log(`orcamento: ${r.paginas} páginas, teto de ${TETO / 1024} KB; ${r.erros.length} erro(s), ${r.avisos.length} aviso(s) de irmão, ${r.pendentes.length} pendente(s) declarado(s).`);
  if (args.includes('--relatorio')) for (const p of r.acima) console.log(`  ${String(Math.round(p.bytes / 1024)).padStart(5)} KB  ${p.rel}`);
  else for (const m of r.avisos) console.log(`  AVISO ${m}`);
  for (const m of r.erros) console.error(`  ERRO ${m}`);
  if (r.erros.length) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
