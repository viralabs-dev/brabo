#!/usr/bin/env node
/**
 * Os links das páginas de RN dos irmãos que só resolvem no site viram URL do repo dono (AT-868, ADR 0288):
 *
 *   BRABO_IRMAOS=<pasta com os clones brabo-*> node scripts/docs/links-para-repo-dono.mjs --repo <area> [--escrever] [--brabo <dir, padrão: cwd>]
 *
 * Em `<docs>/business-rules/**` (e nas traduções) da área, cada link `.md` relativo que NÃO existe no próprio repo
 * mas existe na `docs/` de outra raiz vira `https://github.com/<org>/<repo>/blob/dev/<caminho>#frag`
 * (`urlDeEdicao`). Reprova alvo em mais de uma raiz ou em nenhuma. Sem `--escrever`, só lista.
 * O `render.mjs` faz o caminho inverso, então o `links.mjs` continua conferindo todos.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reescreverLinks } from './partir-rn.mjs';
import { DONOS_DAS_RAIZES, urlDeEdicao } from './site/repo-dono.mjs';

export const AREAS = { api: 'apps/api/docs', web: 'apps/web/docs', engine: 'apps/engine/docs', runner: 'apps/runner/docs', broker: 'apps/broker/docs', contracts: 'packages/docs', infra: 'deploy/docs', ci: 'scripts/ci/docs', qa: 'qa/docs' };
const LOCALES = ['en', 'ru', 'zh-Hans'];
const EXTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

const listarMd = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listarMd(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : [])) : []);

/**
 * @param {{area: string, irmaos: string, brabo: string, escrever?: boolean, org?: string}} o
 * @returns {{paginas: {arquivo: string, trocados: number}[], total: number, erros: string[]}}
 */
export function trocar({ area, irmaos, brabo, escrever = false, org = 'viralabs-dev' }) {
  const raizDaArea = AREAS[area];
  if (!raizDaArea) throw new Error(`área desconhecida: ${area} (${Object.keys(AREAS).join(', ')})`);
  const pastaDe = (raiz) => {
    const [repo, pasta] = DONOS_DAS_RAIZES[raiz];
    return path.join(repo === 'brabo' ? brabo : path.join(irmaos, repo), pasta);
  };
  const raizes = Object.keys(DONOS_DAS_RAIZES);
  const faltando = raizes.filter((r) => !existsSync(path.dirname(pastaDe(r)))).map((r) => DONOS_DAS_RAIZES[r][0]);
  if (faltando.length) throw new Error(`faltam clones em ${irmaos}: ${[...new Set(faltando)].join(', ')}`);
  const base = pastaDe(raizDaArea);
  const alvos = [['', path.join(base, 'business-rules')], ...LOCALES.map((l) => [l, path.join(base, 'i18n', l, 'business-rules')])];
  const erros = [];
  const paginas = [];
  const escritas = []; // só grava se nenhuma página tiver erro
  for (const [locale, dir] of alvos) {
    const topo = locale ? path.join(base, 'i18n', locale) : base; // o `relativo` da página é contado daqui
    const existe = (rel) => existsSync(path.join(base, rel)) || (locale && existsSync(path.join(topo, rel)));
    for (const arquivo of listarMd(dir)) {
      const pagDir = path.posix.dirname(path.relative(topo, arquivo).split(path.sep).join('/'));
      let trocados = 0;
      const novo = reescreverLinks(readFileSync(arquivo, 'utf8'), (href) => {
        if (EXTERNO.test(href)) return href;
        const [alvo, frag] = href.split('#');
        if (!alvo.endsWith('.md')) return href;
        const rel = path.posix.normalize(path.posix.join(pagDir, alvo));
        if (rel.startsWith('../') || existe(rel)) return href; // sai da docs/ (AT-826) ou já resolve no repo
        const donas = raizes.filter((r) => existsSync(path.join(pastaDe(r), rel)));
        if (donas.length !== 1) {
          erros.push(`${path.relative(base, arquivo)}: ${href} -> ${donas.length ? `em mais de uma raiz (${donas.join(', ')})` : 'em nenhuma raiz'}`);
          return href;
        }
        trocados++;
        return urlDeEdicao(`${org}/brabo`, donas[0], rel) + (frag === undefined ? '' : `#${frag}`);
      });
      paginas.push({ arquivo: path.relative(base, arquivo), trocados });
      if (trocados) escritas.push([arquivo, novo]);
    }
  }
  if (escrever && !erros.length) for (const [a, t] of escritas) writeFileSync(a, t);
  return { paginas, total: paginas.reduce((n, p) => n + p.trocados, 0), erros };
}

function main() {
  const args = process.argv.slice(2);
  const val = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const area = val('--repo');
  const irmaos = process.env.BRABO_IRMAOS;
  if (!area || !irmaos) {
    console.error('uso: BRABO_IRMAOS=<pasta> links-para-repo-dono.mjs --repo <area> [--escrever] [--brabo <dir>]');
    process.exit(2);
  }
  try {
    const escrever = args.includes('--escrever');
    const r = trocar({ area, irmaos: path.resolve(irmaos), brabo: path.resolve(val('--brabo') ?? '.'), escrever });
    for (const p of r.paginas.filter((x) => x.trocados)) console.log(`  ${p.arquivo}: ${p.trocados}`);
    for (const e of r.erros) console.error(`  ERRO ${e}`);
    console.log(`links-para-repo-dono: ${area}: ${r.total} link(s) ${escrever && !r.erros.length ? 'reescritos' : 'a reescrever'}.`);
    if (r.erros.length) process.exit(1);
  } catch (e) {
    console.error(`links-para-repo-dono: ${e.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
