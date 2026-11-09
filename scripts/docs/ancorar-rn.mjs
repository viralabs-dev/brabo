// Põe `<a id="rn-NNN"></a>` antes de cada `### RN-NNN … {#rn-NNN}` das partes de RN (AT-871): o GitHub não gera id de `{#…}`.
// Uso: node ancorar-rn.mjs [--raiz <dir>] [--conferir]  (rode na raiz do repo; idempotente; nunca apaga; `--conferir` só lê e sai 1 se faltar).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cercaDepois } from './partir-rn.mjs';

export function ancorar(texto) {
  const out = [];
  let cerca = null;
  for (const l of texto.split('\n')) {
    const antes = cerca;
    cerca = cercaDepois(cerca, l);
    const m = !antes && !cerca && /^### RN-\d+\b.*\{#(rn-\d+)\}\s*$/.exec(l);
    if (m) {
      const a = `<a id="${m[1]}"></a>`;
      let k = out.length - 1;
      while (k >= 0 && !out[k].trim()) k--;
      // O `<a id>` colado ao item de lista anterior vira continuação do `<li>` e o id se repete no HTML (AT-875): linha em branco antes.
      if (out[k] === a) { if (k > 0 && out[k - 1].trim()) out.splice(k, 0, ''); } else out.push(...(out.length && out[out.length - 1].trim() ? [''] : []), a, '');
    }
    out.push(l);
  }
  return out.join('\n');
}

/** As partes `…/business-rules/<area>/parte-NN.md` do pt-BR e das traduções, na pasta de doc `docs` ou `scripts/ci/docs`. */
export function partesDe(raiz) {
  const achadas = [];
  for (const d of ['docs', 'scripts/ci/docs']) {
    for (const base of [d, ...['en', 'ru', 'zh-Hans'].map((l) => `${d}/i18n/${l}`)]) {
      const br = path.join(raiz, base, 'business-rules');
      if (!existsSync(br)) continue;
      for (const a of readdirSync(br, { withFileTypes: true }).filter((e) => e.isDirectory())) {
        for (const f of readdirSync(path.join(br, a.name)).filter((n) => /^parte-\d+\.md$/.test(n))) achadas.push(path.join(br, a.name, f));
      }
    }
  }
  return achadas;
}

function main() {
  const args = process.argv.slice(2);
  const raiz = path.resolve(args.includes('--raiz') ? args[args.indexOf('--raiz') + 1] : '.');
  const conferir = args.includes('--conferir');
  const partes = partesDe(raiz);
  let faltam = 0;
  let mudadas = 0;
  for (const f of partes) {
    const t = readFileSync(f, 'utf8');
    const n = ancorar(t);
    if (n === t) continue;
    if (conferir) { faltam += (n.match(/<a id=/g) ?? []).length - (t.match(/<a id=/g) ?? []).length; console.error(`ancorar-rn: ${path.relative(raiz, f)} sem âncora`); } else { writeFileSync(f, n); mudadas++; }
  }
  if (!partes.length) { console.error(`ancorar-rn: nenhuma parte de RN em ${raiz}`); process.exit(1); }
  if (conferir && faltam) { console.error(`ancorar-rn: faltam ${faltam} âncoras; rode sem --conferir.`); process.exit(1); }
  console.log(`ancorar-rn: ${partes.length} partes, ${mudadas} escritas.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
