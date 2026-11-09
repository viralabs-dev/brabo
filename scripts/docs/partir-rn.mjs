#!/usr/bin/env node
/**
 * Parte a página de RN de uma área em índice mais partes (AT-862, ADR 0287).
 * Roda UMA vez por repositório irmão, dentro da worktree dele:
 *
 *   node <brabo>/scripts/docs/partir-rn.mjs --repo <area> [--orcamento 90] [--simular]
 *       [--raiz <dir do repo, padrão: cwd>] [--docs <pasta de doc, padrão: docs ou scripts/ci/docs>]
 *
 * `<docs>/business-rules/<area>.md` vira o ÍNDICE (mesmo caminho, mesma URL, mesmo
 * frontmatter): uma tabela das partes e a grade CONGELADA de âncoras
 * `<a id="rn-NNN"></a>[NNN](<area>/parte-NN.md#rn-NNN)`, que é o contrato dos
 * links antigos. As RNs vão para `<docs>/business-rules/<area>/parte-NN.md`,
 * cortadas por faixa nas fronteiras de `## ` (e de `### RN-` quando uma seção
 * passa do orçamento), com ~90 KB de Markdown por parte. As traduções
 * (`<docs>/i18n/<l>/business-rules/<area>.md`) que existirem são partidas com
 * os MESMOS cortes (pelo número da RN).
 *
 * O script se confere sozinho, lendo o que escreveu: mesmos `{#rn-}` antes e
 * depois, toda âncora da grade existe na parte para onde aponta e nenhuma parte
 * passa do orçamento (uma RN sozinha maior que ele é aviso). Sai 1 se algo falha.
 * Nunca apaga: recusa rodar se `<area>/` já existe. É inerte até alguém rodá-lo.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LOCALES = ['en', 'ru', 'zh-Hans'];
export const ORCAMENTO_KB = 90;

const TXT = {
  'pt-BR': { parte: (n) => `parte ${n}`, desde: 'desde', intro: (x) => `Esta página é o índice das regras de negócio da área \`${x}\`. As RNs moram em partes (\`${x}/parte-NN.md\`), cortadas por faixa para a página abrir leve; a RN nova entra na ÚLTIMA parte (ADR 0287).`, grade: 'A grade abaixo preserva as âncoras antigas (`#rn-NNN`): cada número leva à parte onde a RN mora.', cols: ['Parte', 'Desde', 'RNs', 'Seções'] },
  en: { parte: (n) => `part ${n}`, desde: 'from', intro: (x) => `This page is the index of the \`${x}\` area business rules. The rules live in parts (\`${x}/parte-NN.md\`), cut by range so the page opens light; a new rule goes into the LAST part (ADR 0287).`, grade: 'The grid below keeps the old anchors (`#rn-NNN`): each number leads to the part where the rule lives.', cols: ['Part', 'From', 'Rules', 'Sections'] },
  ru: { parte: (n) => `часть ${n}`, desde: 'с', intro: (x) => `Эта страница — указатель бизнес-правил области \`${x}\`. Правила находятся в частях (\`${x}/parte-NN.md\`), разрезанных по диапазонам, чтобы страница открывалась быстро; новое правило попадает в ПОСЛЕДНЮЮ часть (ADR 0287).`, grade: 'Сетка ниже сохраняет старые якоря (`#rn-NNN`): каждый номер ведёт в часть, где находится правило.', cols: ['Часть', 'С', 'Правил', 'Разделы'] },
  'zh-Hans': { parte: (n) => `第 ${n} 部分`, desde: '自', intro: (x) => `本页是 \`${x}\` 领域业务规则的索引。规则分布在各部分中（\`${x}/parte-NN.md\`），按范围切分以便页面轻量打开；新规则放入最后一部分（ADR 0287）。`, grade: '下方网格保留了旧锚点（`#rn-NNN`）：每个编号指向该规则所在的部分。', cols: ['部分', '起始', '规则数', '章节'] },
};

/** Estado da cerca de código depois de `linha`: `null` (fora) ou o marcador que a abriu (fecha com o mesmo caractere e ao menos o mesmo tamanho). */
export function cercaDepois(cerca, linha) {
  const m = /^\s*(`{3,}|~{3,})(.*)$/.exec(linha);
  if (!m || (m[1][0] === '`' && m[2].includes('`'))) return cerca; // info de cerca com crase é código em linha
  if (!cerca) return m[1];
  return m[1][0] === cerca[0] && m[1].length >= cerca.length && !m[2].trim() ? null : cerca;
}

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const bytes = (s) => Buffer.byteLength(s);
const semId = (h) => h.replace(/\s*\{#[^}]*\}\s*$/, '').trim();
const pad = (n, k = 2) => String(n).padStart(k, '0');

export function separarFrontmatter(texto) {
  const fm = FRONTMATTER.exec(texto)?.[0] ?? '';
  return { fm, corpo: texto.slice(fm.length) };
}

/**
 * Corpo → `{pre, segs}`. `pre` é o que vem antes do primeiro `## `/`### RN-` (o H1 e a prosa);
 * `segs` são os pedaços em ordem, `h2` (o `## ` e a prosa até a próxima RN) ou `rn` (`### RN-N` até o
 * próximo `## `/`### RN-`). Cercas de código não abrem seção. Sem perda: juntar tudo devolve o corpo.
 */
export function segmentar(corpo) {
  const pre = [];
  const segs = [];
  let cerca = null;
  let atual = null;
  for (const l of corpo.split('\n')) {
    cerca = cercaDepois(cerca, l);
    const rn = !cerca && /^### RN-(\d+)\b/.exec(l);
    if (!cerca && /^## (?!#)/.test(l)) segs.push((atual = { tipo: 'h2', linhas: [l] }));
    else if (rn) {
      atual = { tipo: 'rn', n: Number(rn[1]), id: /\{#([^}\s]+)\}\s*$/.exec(l)?.[1] ?? `rn-${pad(rn[1], 3)}`, linhas: [l] };
      segs.push(atual);
    } else if (atual) atual.linhas.push(l);
    else pre.push(l);
  }
  return { pre: pre.join('\n'), segs: segs.map((s) => ({ ...s, texto: s.linhas.join('\n') })) };
}

/**
 * Onde cortar: devolve os NÚMEROS da primeira RN de cada parte, a partir da segunda. Guloso: estourou o
 * orçamento, a seção inteira vai para a próxima parte; se ela sozinha estoura, corta entre RNs.
 */
export function planejarCortes(segs, limite) {
  const tam = segs.map((s) => bytes(s.texto) + 1);
  const cortes = [];
  let ini = 0;
  let soma = 0;
  let secIni = 0;
  segs.forEach((s, i) => {
    if (s.tipo === 'h2' && (i === 0 || segs[i - 1].tipo !== 'h2')) secIni = i;
    while (soma + tam[i] > limite && i > ini) {
      if (s.tipo === 'h2' && secIni === ini) break; // não se corta entre dois `## `
      if (s.tipo === 'rn' && segs[i - 1].tipo === 'h2' && secIni === ini) break; // nem entre o `## ` e a RN dele
      const c = secIni > ini ? secIni : i;
      cortes.push(segs.slice(c).find((x) => x.tipo === 'rn')?.n);
      ini = c;
      soma = tam.slice(c, i).reduce((a, b) => a + b, 0);
    }
    soma += tam[i];
  });
  return cortes.filter((n) => n !== undefined);
}

/** Fatia os segmentos nos cortes (números de RN). Lança se uma RN do corte não existe no texto. */
export function fatiar(segs, cortes) {
  const inicios = [0];
  for (const n of cortes) {
    let i = segs.findIndex((s) => s.tipo === 'rn' && s.n === n);
    if (i < 0) throw new Error(`a RN-${n} (corte) não existe neste arquivo`);
    while (i > 0 && segs[i - 1].tipo === 'h2') i--;
    inicios.push(i);
  }
  return inicios.map((ini, k) => {
    const dentro = segs.slice(ini, inicios[k + 1] ?? segs.length);
    const vigente = segs.slice(0, ini).reverse().find((s) => s.tipo === 'h2');
    return { segs: dentro, h2Anterior: dentro[0]?.tipo === 'rn' ? vigente?.linhas[0] : undefined };
  });
}

const LINK = /(\]\()([^)\s]+)((?:\s+"[^"]*")?\))|^(\s*\[[^\]]+\]:\s*)(\S+)/;
const EXTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i;

/** Reescreve UM href de dentro de `business-rules/` para dentro de `business-rules/<area>/`. */
export function reescreverHref(href, { area, parteDe, atual }) {
  if (EXTERNO.test(href)) return href;
  const i = href.indexOf('#');
  const caminho = i < 0 ? href : href.slice(0, i);
  const frag = i < 0 ? '' : href.slice(i + 1);
  const alvo = frag ? parteDe.get(frag) : undefined;
  if (!caminho) return alvo === undefined || alvo === atual ? href : `parte-${pad(alvo)}.md#${frag}`;
  if (caminho === `${area}.md` || caminho === `./${area}.md`) {
    if (alvo === undefined) return `../${area}.md${frag ? `#${frag}` : ''}`;
    return alvo === atual ? `#${frag}` : `parte-${pad(alvo)}.md#${frag}`;
  }
  return `../${caminho}${frag ? `#${frag}` : ''}`;
}

/** Reescreve os links Markdown de um trecho, fora de cercas e de código em linha; `trocarHref(href)` devolve o href novo. */
export function reescreverLinks(texto, trocarHref) {
  let cerca = null;
  let span = 0; // tamanho da crase que abriu um código em linha ainda aberto (pode atravessar linhas do parágrafo)
  const trocar = (p) => p.replace(new RegExp(LINK.source, 'g'), (todo, a, h, fim, d, h2) => (h !== undefined ? `${a}${trocarHref(h)}${fim}` : `${d}${trocarHref(h2)}`));
  return texto
    .split('\n')
    .map((l) => {
      const antes = cerca;
      cerca = cercaDepois(cerca, l);
      if (antes || cerca) return l;
      if (!l.trim()) span = 0;
      let saida = '';
      let i = 0;
      for (const m of l.matchAll(/`+/g)) {
        const trecho = l.slice(i, m.index);
        saida += span ? trecho : trocar(trecho);
        saida += m[0];
        if (!span) span = m[0].length;
        else if (span === m[0].length) span = 0;
        i = m.index + m[0].length;
      }
      return saida + (span ? l.slice(i) : trocar(l.slice(i)));
    })
    .join('\n');
}

const tituloDe = (fm) => /^title:\s*(.+)$/m.exec(fm)?.[1].replace(/^['"]|['"]$/g, '').replace(/''/g, "'") ?? '';
const aspas = (s) => `'${s.replace(/'/g, "''")}'`;
const nomeDe = (pre) => /^# (.+)$/m.exec(pre)?.[1].trim() ?? '';

/**
 * Parte o texto de UM locale em `{indice, partes}` (strings dos arquivos).
 * @param {string} texto o `<area>.md` inteiro
 * @param {{area: string, locale: string, cortes?: number[], limite: number}} o
 */
export function partir(texto, { area, locale, cortes, limite }) {
  const T = TXT[locale];
  const { fm, corpo } = separarFrontmatter(texto);
  const { pre, segs } = segmentar(corpo);
  const fatias = fatiar(segs, cortes ?? planejarCortes(segs, limite));
  const parteDe = new Map();
  fatias.forEach((f, k) =>
    f.segs.forEach((s) => {
      parteDe.set(s.tipo === 'rn' ? s.id : (/\{#([^}\s]+)\}\s*$/.exec(s.linhas[0])?.[1] ?? '\0'), k + 1);
    }),
  );
  const nome = nomeDe(pre);
  const tituloBase = tituloDe(fm);
  const partes = fatias.map((f, k) => {
    const rns = f.segs.filter((s) => s.tipo === 'rn');
    const desde = rns[0] ? `RN-${pad(rns[0].n, 3)}` : '';
    const rotulo = `${T.parte(k + 1)} (${T.desde} ${desde})`;
    const cab = [];
    if (f.h2Anterior) cab.push(semId(f.h2Anterior));
    const corpoParte = reescreverLinks([...cab, ...f.segs.map((s) => s.texto)].join('\n'), (h) => reescreverHref(h, { area, parteDe, atual: k + 1 }));
    const novoFm = fm
      .replace(/^id:.*$/m, `id: rn-${area}-parte-${pad(k + 1)}`)
      .replace(/^title:.*$/m, `title: ${aspas(`${tituloBase} — ${rotulo}`)}`)
      .replace(/^sidebar_label:.*$/m, `sidebar_label: ${aspas(`${nome} — ${rotulo}`)}`)
      .replace(/^sidebar_position:.*\n/m, '');
    return { arquivo: `parte-${pad(k + 1)}.md`, texto: `${novoFm}\n# ${nome} — ${rotulo}\n\n${corpoParte.replace(/\s+$/, '')}\n`, rns, secoes: [...new Set(f.segs.filter((s) => s.tipo === 'h2').map((s) => semId(s.linhas[0]).replace(/^## /, '')))], h2Anterior: f.h2Anterior };
  });
  const linhas = partes.map((p, k) => `| [${T.parte(k + 1)}](${area}/${p.arquivo}) | ${p.rns[0] ? `RN-${pad(p.rns[0].n, 3)}` : ''} | ${p.rns.length} | ${[...(p.h2Anterior ? [semId(p.h2Anterior).replace(/^## /, '')] : []), ...p.secoes].join('; ').replace(/\|/g, '\\|')} |`);
  const grade = [];
  const todas = partes.flatMap((p, k) => p.rns.map((s) => `<a id="${s.id}"></a>[${pad(s.n, 3)}](${area}/${p.arquivo}#${s.id})`));
  for (let i = 0; i < todas.length; i += 10) grade.push(todas.slice(i, i + 10).join(' '));
  const indice = `${fm}${pre.replace(/\s+$/, '')}\n\n${T.intro(area)}\n\n| ${T.cols.join(' | ')} |\n|---|---|---|---|\n${linhas.join('\n')}\n\n${T.grade}\n\n${grade.join('\n')}\n`;
  return { indice, partes, rns: segs.filter((s) => s.tipo === 'rn').map((s) => s.id) };
}

/** A conferência: o que NÃO pode mudar. Devolve a lista de problemas (vazia = em dia). */
export function conferir({ antes, indice, partes, limite }) {
  const problemas = [];
  const idsAntes = antes.map((i) => i).sort();
  const idsPartes = partes.flatMap((p) => [...p.texto.matchAll(/^### RN-\d+\b.*\{#([^}\s]+)\}\s*$/gm)].map((m) => m[1])).sort();
  if (idsAntes.join() !== idsPartes.join()) problemas.push(`os {#rn-} das partes (${idsPartes.length}) não são os de antes (${idsAntes.length})`);
  for (const m of indice.matchAll(/<a id="(rn-\d+)"><\/a>\[\d+\]\(([^)#]+)#([^)]+)\)/g)) {
    const parte = partes.find((p) => m[2].endsWith(`/${p.arquivo}`));
    if (!parte) problemas.push(`a grade aponta ${m[2]}, que não existe`);
    else if (m[1] !== m[3] || !parte.texto.includes(`{#${m[1]}}`)) problemas.push(`a âncora ${m[1]} da grade não existe em ${parte.arquivo}`);
  }
  const grade = [...indice.matchAll(/<a id="(rn-\d+)"><\/a>/g)].map((m) => m[1]).sort();
  if (grade.join() !== idsAntes.join()) problemas.push(`a grade tem ${grade.length} âncoras, e a página tinha ${idsAntes.length} RNs`);
  for (const p of partes) {
    if (bytes(p.texto) > limite && p.rns.length > 1) problemas.push(`${p.arquivo} tem ${Math.round(bytes(p.texto) / 1024)} KB, acima de ${Math.round(limite / 1024)} KB`);
  }
  return problemas;
}

function docsDe(raiz, area, explicito) {
  const cand = explicito ? [explicito] : ['docs', 'scripts/ci/docs'];
  const achado = cand.find((c) => existsSync(path.join(raiz, c, 'business-rules', `${area}.md`)));
  if (!achado) throw new Error(`não achei <docs>/business-rules/${area}.md em ${cand.map((c) => path.join(raiz, c)).join(' nem ')}`);
  return achado;
}

/** Executa a divisão no disco. Devolve `{arquivos, problemas, avisos}`. `simular` não escreve. */
export function dividir({ raiz, area, docs, limite = ORCAMENTO_KB * 1024, simular = false }) {
  const base = docsDe(raiz, area, docs);
  const alvos = [['pt-BR', path.join(raiz, base, 'business-rules')], ...LOCALES.map((l) => [l, path.join(raiz, base, 'i18n', l, 'business-rules')])];
  const arquivos = [];
  const problemas = [];
  const avisos = [];
  const lidos = alvos.filter(([, dir]) => existsSync(path.join(dir, `${area}.md`))).map(([locale, dir]) => ({ locale, dir, fonte: path.join(dir, `${area}.md`), texto: readFileSync(path.join(dir, `${area}.md`), 'utf8') }));
  for (const { dir } of lidos) if (existsSync(path.join(dir, area))) throw new Error(`${path.join(dir, area)} já existe: nada foi escrito (o script nunca apaga nem refaz)`);
  // Os cortes são os mesmos nas línguas; planejá-los sobre a MAIOR evita que o `ru` estoure o orçamento.
  const maior = lidos.reduce((a, b) => (bytes(b.texto) > bytes(a.texto) ? b : a), lidos[0]);
  const cortes = planejarCortes(segmentar(separarFrontmatter(maior.texto).corpo).segs, limite - 2048); // folga: frontmatter, H1 e `##` repetido
  for (const { locale, dir, fonte, texto } of lidos) {
    const r = partir(texto, { area, locale, cortes, limite });
    const probs = conferir({ antes: r.rns, indice: r.indice, partes: r.partes, limite });
    problemas.push(...probs.map((p) => `${locale}: ${p}`));
    for (const p of r.partes) if (bytes(p.texto) > limite && p.rns.length === 1) avisos.push(`${locale}: ${p.arquivo} é uma RN só e passa do orçamento`);
    arquivos.push({ locale, fonte, indice: r.indice, partes: r.partes.map((p) => ({ caminho: path.join(dir, area, p.arquivo), texto: p.texto, kb: Math.round(bytes(p.texto) / 1024), rns: p.rns.length })) });
  }
  if (!problemas.length && !simular) {
    for (const a of arquivos) {
      mkdirSync(path.join(path.dirname(a.fonte), area), { recursive: true });
      for (const p of a.partes) writeFileSync(p.caminho, p.texto);
      writeFileSync(a.fonte, a.indice);
    }
  }
  return { arquivos, problemas, avisos };
}

function main() {
  const args = process.argv.slice(2);
  const val = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const area = val('--repo');
  if (!area) {
    console.error('uso: partir-rn.mjs --repo <area> [--orcamento 90] [--simular] [--raiz <dir>] [--docs <dir>]');
    process.exit(2);
  }
  try {
    const r = dividir({ raiz: path.resolve(val('--raiz') ?? '.'), area, docs: val('--docs'), limite: Number(val('--orcamento') ?? ORCAMENTO_KB) * 1024, simular: args.includes('--simular') });
    for (const a of r.arquivos) {
      console.log(`partir-rn: ${a.locale}: ${path.relative('.', a.fonte)} -> índice + ${a.partes.length} partes`);
      for (const p of a.partes) console.log(`  ${path.relative('.', p.caminho)}  ${p.kb} KB  ${p.rns} RNs`);
    }
    for (const w of r.avisos) console.warn(`  AVISO ${w}`);
    for (const p of r.problemas) console.error(`  ERRO ${p}`);
    if (r.problemas.length) { console.error('partir-rn: a conferência falhou; nada foi escrito.'); process.exit(1); }
    console.log(args.includes('--simular') ? 'partir-rn: simulação, nada foi escrito.' : 'partir-rn: escrito e conferido.');
  } catch (e) {
    console.error(`partir-rn: ${e.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
