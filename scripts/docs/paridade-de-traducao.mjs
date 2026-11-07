/**
 * Paridade de tradução (AT-550, ADR 0216 itens 5–7).
 *
 * Mede, por locale (`en`, `ru`, `zh-Hans`), quanto da fonte pt-BR (`docs/`,
 * inclusive `docs/reference/**` desde o ADR 0219, menos o próprio relatório e
 * o `openapi.json` — `ehFonteTraduzivel`) tem tradução em
 * `docs/i18n/<locale>/`, e se cada
 * tradução está EM DIA ou DEFASADA. A procedência é o `traducao_de:` do
 * frontmatter (o commit da fonte que foi traduzido). Defasada = a fonte tem
 * commit MAIS NOVO (pela data de commit, nunca pelo relógio) que o
 * `traducao_de`, ou a fonte tem mudança não commitada, ou o SHA não existe.
 * Assim o `--check` é determinístico: antes do commit a fonte alterada já
 * conta como mudada, e depois dele também.
 *
 * Mede só a doc do PRÓPRIO `brabo` (ADR 0273): arquivo de repo irmão e `i18n/` não são fonte.
 * A interface é medida no `brabo-web` e o catálogo da API só avisa no log do generate.
 *
 * O núcleo é PURO (recebe leituras injetadas) para ser provado por mutação no
 * spec ao lado; `medirDoRepositorio` é a única função que toca disco e git.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { idiomaOriginal } from './faixa-de-traducao.mjs';
import { lerRaizesDeDoc } from './raizes-de-doc.mjs';

export const LOCALES = ['en', 'ru', 'zh-Hans'];
export const LOCALE_FONTE = 'pt-BR';

/** Lê `traducao_de:` do frontmatter; `null` sem frontmatter ou sem o campo. */
export function traducaoDe(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  if (!m) return null;
  const c = /^traducao_de:\s*["']?([0-9a-f]{7,40})["']?\s*$/m.exec(m[1]);
  return c ? c[1] : null;
}

/**
 * Classifica UMA página traduzida. `fonte` = { data: ISO | null, suja: bool }
 * (data do último commit da fonte; `suja` = mudança não commitada).
 * `commitDe(sha)` devolve a data ISO do commit, ou `null` se não existe.
 */
export function classificar(textoTraduzido, fonte, commitDe) {
  const sha = traducaoDe(textoTraduzido);
  if (sha === null) return { estado: 'sem-procedencia', sha: null, data: null };
  const data = commitDe(sha);
  if (data === null) return { estado: 'defasada', sha, data: null };
  if (fonte.suja || (fonte.data !== null && Date.parse(fonte.data) > Date.parse(data))) {
    return { estado: 'defasada', sha, data };
  }
  return { estado: 'em-dia', sha, data };
}

/**
 * Mede a documentação. `fontes`: Map rel → { chars, data, suja };
 * `traducoes`: { [locale]: Map rel → texto }.
 */
export function medirDocs(fontes, traducoes, commitDe) {
  const totalChars = [...fontes.values()].reduce((n, f) => n + f.chars, 0);
  const porLocale = {};
  for (const locale of LOCALES) {
    const mapa = traducoes[locale] ?? new Map();
    const r = {
      paginas: fontes.size,
      traduzidas: 0,
      chars: totalChars,
      charsTraduzidos: 0,
      emDia: [],
      defasadas: [],
      semProcedencia: [],
      ausentes: [],
      orfas: [],
      paginasDetalhe: {},
    };
    for (const [rel, fonte] of [...fontes].sort(([a], [b]) => a.localeCompare(b))) {
      const texto = mapa.get(rel);
      if (texto === undefined) {
        r.ausentes.push(rel);
        continue;
      }
      r.traduzidas++;
      r.charsTraduzidos += fonte.chars;
      const c = classificar(texto, fonte, commitDe);
      if (c.estado === 'em-dia') r.emDia.push(rel);
      else if (c.estado === 'defasada') r.defasadas.push(rel);
      else r.semProcedencia.push(rel);
      r.paginasDetalhe[rel] = {
        estado: c.estado,
        traducaoDe: c.sha,
        data: c.data ? c.data.slice(0, 10) : null,
      };
    }
    for (const rel of [...mapa.keys()].sort()) if (!fontes.has(rel)) r.orfas.push(rel);
    porLocale[locale] = r;
  }
  return porLocale;
}

const pct = (a, b) => (b === 0 ? '—' : `${((100 * a) / b).toFixed(1)}%`);

/** O relatório Markdown (determinístico: só depende das medições). */
export function relatorio(docs, aviso) {
  const l = [];
  l.push('---', 'id: paridade-de-traducao', 'title: Paridade de tradução', '---', '', aviso, '');
  l.push('# Paridade de tradução', '');
  l.push(
    'A fonte é o pt-BR em `docs/` do `brabo` (ADR 0216, ADR 0273), inclusive `docs/reference/**` (ADR 0219); só esta página fica fora. ' +
      'A doc dos repositórios irmãos e as traduções em `i18n/` não contam como fonte. A interface é medida no `brabo-web` e o catálogo da API só avisa no log do `docs:generate`. ' +
      'Uma tradução está **em dia** quando o `traducao_de:` do frontmatter é um commit tão ou mais novo ' +
      'que o último commit da fonte, e **defasada** quando a fonte mudou depois. Sem o campo, ela conta ' +
      'como **sem procedência**. As regras estão em [Localização](../explanation/localizacao.md).',
    '',
  );
  l.push('## Documentação', '');
  l.push('| locale | páginas traduzidas | caracteres traduzidos | em dia | defasadas | sem procedência | ausentes | órfãs |');
  l.push('|---|---|---|---|---|---|---|---|');
  for (const loc of LOCALES) {
    const r = docs[loc];
    l.push(
      `| \`${loc}\` | ${r.traduzidas} de ${r.paginas} (${pct(r.traduzidas, r.paginas)}) | ` +
        `${pct(r.charsTraduzidos, r.chars)} de ${r.chars.toLocaleString('pt-BR')} | ${r.emDia.length} | ${r.defasadas.length} | ` +
        `${r.semProcedencia.length} | ${r.ausentes.length} | ${r.orfas.length} |`,
    );
  }
  l.push('');
  l.push('> **TODO(humano):** revisão nativa por idioma — quem revisou e quando. Ainda não há revisão nativa registrada.', '');
  for (const loc of LOCALES) {
    const r = docs[loc];
    if (r.defasadas.length === 0) continue;
    l.push(`### Defasadas em \`${loc}\``, '');
    for (const rel of r.defasadas) l.push(`- \`${rel}\` (tradução de ${r.paginasDetalhe[rel].data ?? 'commit inexistente'})`);
    l.push('');
  }
  return l.join('\n');
}

/** O JSON que a faixa do site lê: só o que ela precisa, por locale e página. */
export function dadosDaFaixa(docs) {
  const out = {};
  for (const loc of LOCALES) {
    out[loc] = {};
    for (const [rel, d] of Object.entries(docs[loc].paginasDetalhe)) {
      out[loc][rel] = { defasada: d.estado === 'defasada', data: d.data };
    }
  }
  return JSON.stringify(out, null, 2) + '\n';
}

// ------------------------------------------------------------ leitura real

function listar(dir, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return listar(p, base);
    return /\.mdx?$/.test(n) ? [relative(base, p)] : [];
  });
}

/**
 * ADR 0219: `reference/` entra; o relatório (D4) e o spec OpenAPI não. ADR 0260:
 * página com `idioma_original: en` (doc dos repos de código) não tem o que traduzir.
 */
export const ehFonteTraduzivel = (rel, conteudo = '') =>
  !/^reference\/(paridade-de-traducao\.mdx?|openapi\.json)$/.test(rel) && idiomaOriginal(conteudo) !== 'en';

/**
 * `raizesDeDoc`: as pastas `docs/` a unir (AT-693), relativas a `raiz`. Padrão:
 * as que existem (`lerRaizesDeDoc`). A chave segue sendo o `rel` da UNIÃO; o
 * mesmo `rel` em duas raízes é erro.
 */
export function medirDoRepositorio(raiz, raizesDeDoc = lerRaizesDeDoc().map((r) => r.raiz)) {
  const git = (...a) => execFileSync('git', a, { cwd: raiz, encoding: 'utf8' }).trim();
  // ADR 0273: é do brabo o que está em HEAD, ou o que o layout dos irmãos não trouxe (página nova ainda não commitada).
  const emHead = new Set(git('ls-tree', '-r', '--name-only', 'HEAD').split('\n'));
  const lst = resolve(raiz, git('rev-parse', '--git-dir'), 'layout-irmaos.lst');
  const irmaos = new Set(existsSync(lst) ? readFileSync(lst, 'utf8').split('\n').filter(Boolean) : []);
  const doBrabo = (caminho) => emHead.has(caminho) || !irmaos.has(caminho);
  const fontes = new Map();
  const traducoes = Object.fromEntries(LOCALES.map((l) => [l, new Map()]));
  const unir = (mapa, rel, valor) => {
    if (mapa.has(rel)) throw new Error(`"${rel}" existe em duas raízes de doc`);
    mapa.set(rel, valor);
  };
  for (const base of raizesDeDoc) {
    const sujas = new Set(
      git('status', '--porcelain', '--', base)
        .split('\n')
        .filter(Boolean)
        .map((l) => relative(base, l.slice(3))),
    );
    for (const rel of listar(join(raiz, base))) {
      if (rel.startsWith('i18n/') || !doBrabo(`${base}/${rel}`)) continue;
      const texto = readFileSync(join(raiz, base, rel), 'utf8');
      if (!ehFonteTraduzivel(rel, texto)) continue;
      const data = git('log', '-1', '--format=%cI', '--', `${base}/${rel}`) || null;
      unir(fontes, rel, { chars: texto.length, data, suja: sujas.has(rel) });
    }
    for (const loc of LOCALES) {
      const dir = join(raiz, base, 'i18n', loc);
      for (const rel of listar(dir)) unir(traducoes[loc], rel, readFileSync(join(dir, rel), 'utf8'));
    }
  }
  const cache = new Map();
  const commitDe = (sha) => {
    if (!cache.has(sha)) {
      try {
        cache.set(sha, git('show', '-s', '--format=%cI', `${sha}^{commit}`) || null);
      } catch {
        cache.set(sha, null);
      }
    }
    return cache.get(sha);
  };
  return { docs: medirDocs(fontes, traducoes, commitDe) };
}
