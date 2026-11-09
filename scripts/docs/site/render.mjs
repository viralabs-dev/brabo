/**
 * Markdown -> HTML do site (AT-662, ADR 0253).
 *
 *   const render = await criarRenderizador({ paginas })       // paginas = descobrirPaginas(...)
 *   const { html, toc, texto } = render(pagina)
 *
 *   toc   = [{ nivel: 2|3, id, texto }]   -- o sumário "Nesta página" (A2)
 *   texto = texto corrido, sem marcação   -- insumo do índice de busca (A4)
 *   html  = corpo; `temMermaid` / `temH1` ao lado dizem o que o layout precisa saber
 *
 * Regras além do CommonMark (as mesmas que o Docusaurus aplicava):
 *  - `{#id}` ao fim do título vira o `id` (CONTRATO das RNs, `ancoras-de-rn.mjs`);
 *    sem ele, o id é o slug do texto (github-slugger, como o Docusaurus);
 *  - componentes `:::nome` ... `:::` (ver COMPONENTES): avisos (`nota|dica|cuidado|perigo [título]`, nomes em inglês aceitos),
 *    `historico AAAA-MM-DD`, `passos`, `cartoes`, `abas` (`=== Rótulo`); imagem com título vira `figure`;
 *  - ```mermaid -> `<pre class="mermaid" data-mermaid>`; demais cercas passam pelo shiki com
 *    tema de variáveis CSS (`--shiki-*`, definidas pelo CSS do site);
 *  - tabela embrulhada em `div.tabela-rolavel`;
 *  - link relativo `x.md#a` vira href relativo à URL da página no locale;
 *    `/rota/` vira `rota.html`; o resto (http, mailto, âncora, anexos) fica.
 */
import MarkdownIt from 'markdown-it';
import { createCssVariablesTheme, createHighlighter } from 'shiki';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LOGO_SVG } from './layout.mjs';
import { slugDe, urlDe, urlRelativa } from './paginas.mjs';
import { raizDeUrl, urlDeEdicao } from './repo-dono.mjs';

const LINGUAGENS = ['bash', 'json', 'sql', 'elixir', 'yaml', 'typescript', 'tsx', 'javascript', 'diff', 'dockerfile', 'markdown', 'html', 'css', 'toml', 'ini'];
// Avisos: nome canônico (pt-BR) e os sinônimos em inglês que o site já aceitava.
const AVISOS = { nota: 'nota', dica: 'dica', cuidado: 'cuidado', perigo: 'perigo', note: 'nota', tip: 'dica', info: 'nota', warning: 'cuidado', caution: 'cuidado', danger: 'perigo' };
/** Contrato com o linter (AT-861): os nomes de `:::nome` que a doc pode usar. */
export const COMPONENTES = ['nota', 'dica', 'cuidado', 'perigo', 'historico', 'passos', 'cartoes', 'abas', 'hero', 'diferenciais'];
export const COMPONENTES_ANTIGOS = Object.keys(AVISOS).filter((n) => !COMPONENTES.includes(n));
const NOMES = new Set([...COMPONENTES, ...COMPONENTES_ANTIGOS]);
// Título padrão por locale; `info` e `warning` (nomes antigos) mantêm o título deles.
const TITULOS = {
  'pt-BR': { nota: 'Nota', dica: 'Dica', cuidado: 'Cuidado', perigo: 'Perigo', info: 'Info', warning: 'Atenção' },
  en: { nota: 'Note', dica: 'Tip', cuidado: 'Caution', perigo: 'Danger', info: 'Info', warning: 'Warning' },
  ru: { nota: 'Примечание', dica: 'Совет', cuidado: 'Осторожно', perigo: 'Опасность', info: 'Инфо', warning: 'Внимание' },
  'zh-Hans': { nota: '注意', dica: '提示', cuidado: '小心', perigo: '危险', info: '信息', warning: '警告' },
};
const REGISTRO = {
  'pt-BR': (d) => `Registro de ${d}: descreve o Brabo daquela data`,
  en: (d) => `Record from ${d}: describes Brabo as it was on that date`,
  ru: (d) => `Запись от ${d}: описывает Brabo на ту дату`,
  'zh-Hans': (d) => `${d} 的记录：描述当时的 Brabo`,
};

const README = { 'pt-BR': 'README.md', en: 'README.en.md', ru: 'README.ru.md', 'zh-Hans': 'README.zh-Hans.md' };

/** `:::diferenciais`: os 4 `<td>` da primeira `<table>` do README do locale viram cartões (fonte única). */
function diferenciais(raiz, locale) {
  const arquivo = README[locale] ?? README['pt-BR'];
  const tabela = /<table[\s\S]*?<\/table>/.exec(readFileSync(path.join(raiz, arquivo), 'utf8'))?.[0];
  const celulas = [...(tabela ?? '').matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1].trim());
  if (!celulas.length) throw new Error(`:::diferenciais: ${arquivo} não tem a tabela de diferenciais (<table> com <td>)`);
  return `<div class="diferenciais">${celulas.map((c) => `<div class="diferencial">${c}</div>`).join('')}</div>\n`;
}

function dataDoRegistro(iso, locale) {
  const ok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  const d = ok && new Date(`${iso}T00:00:00Z`);
  if (!d || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) throw new Error(`:::historico exige data ISO válida (AAAA-MM-DD), recebeu "${iso ?? ''}"`);
  const fmt = locale === 'pt-BR' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { dateStyle: 'long' };
  return new Intl.DateTimeFormat(locale, { ...fmt, timeZone: 'UTC' }).format(d);
}

/** github-slugger: o que o Docusaurus usava para o id de título sem `{#id}`. */
export function slugDeTitulo(texto) {
  return texto.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => s.replace(/[&<>"]/g, (c) => ESC[c]);

const linhaDe = (state, n) => state.src.slice(state.bMarks[n] + state.tShift[n], state.eMarks[n]);

/** Tokeniza as linhas [de, ate) como Markdown comum, dentro do contêiner. */
function corpoDe(state, de, ate) {
  const antigoMax = state.lineMax;
  const antigoPai = state.parentType;
  state.parentType = 'admonicao';
  state.lineMax = ate;
  state.md.block.tokenize(state, de, ate);
  state.lineMax = antigoMax;
  state.parentType = antigoPai;
}

function comp(state, abre, texto) {
  const tk = state.push(abre ? 'comp_open' : 'comp_close', 'div', abre ? 1 : -1);
  tk.meta = { html: texto };
  return tk;
}

/** `:::nome [arg]` ... `:::` para avisos, historico, passos, cartoes e abas. */
function regraDeComponente(state, inicio, fim, silencioso) {
  const m = /^:::(\w+)(?:\[([^\]]*)\]|\s+(.*))?\s*$/.exec(linhaDe(state, inicio));
  if (!m || !NOMES.has(m[1])) return false;
  let prox = inicio + 1;
  while (prox < fim && linhaDe(state, prox).trim() !== ':::') prox++;
  if (prox >= fim) return false;
  if (silencioso) return true;
  const nome = m[1];
  const arg = (m[2] ?? m[3] ?? '').trim();
  const locale = state.env.pagina?.locale ?? 'pt-BR';
  const abre = comp(state, true, '');
  abre.map = [inicio, prox];
  if (AVISOS[nome]) {
    const titulo = arg || (TITULOS[locale] ?? TITULOS['pt-BR'])[nome === 'info' || nome === 'warning' ? nome : AVISOS[nome]];
    abre.meta.html = `<div class="admonicao admonicao-${nome}${nome === AVISOS[nome] ? '' : ` admonicao-${AVISOS[nome]}`}" data-admonicao="${nome}"><p class="admonicao-titulo">${esc(titulo)}</p>\n`;
    corpoDe(state, inicio + 1, prox);
    comp(state, false, '</div>\n');
  } else if (nome === 'historico') {
    const data = dataDoRegistro(arg, locale);
    abre.meta.html = `<div class="historico" data-historico="${esc(arg)}"><p class="historico-faixa">${esc((REGISTRO[locale] ?? REGISTRO['pt-BR'])(data))}</p>\n`;
    corpoDe(state, inicio + 1, prox);
    comp(state, false, '</div>\n');
  } else if (nome === 'diferenciais') {
    abre.meta.html = diferenciais(state.env.raiz, locale);
    comp(state, false, '');
  } else if (nome === 'hero') {
    abre.meta.html = `<div class="hero"><span class="hero-logo">${LOGO_SVG.replace('width="20" height="20"', 'width="32" height="32"')}</span>\n`;
    corpoDe(state, inicio + 1, prox);
    comp(state, false, '</div>\n');
  } else if (nome === 'abas') {
    abre.meta.html = '<div class="abas" data-abas>\n';
    const cortes = [];
    for (let n = inicio + 1; n < prox; n++) if (/^===\s+\S/.test(linhaDe(state, n))) cortes.push(n);
    if (!cortes.length) throw new Error(':::abas exige linhas "=== Rótulo"');
    cortes.forEach((c, i) => {
      const rotulo = linhaDe(state, c).replace(/^===\s+/, '').trim();
      comp(state, true, `<section class="aba" data-aba="${esc(rotulo)}"><p class="aba-rotulo">${esc(rotulo)}</p>\n`);
      corpoDe(state, c + 1, cortes[i + 1] ?? prox);
      comp(state, false, '</section>\n');
    });
    comp(state, false, '</div>\n');
  } else {
    abre.meta.html = `<div class="${nome}">\n`;
    corpoDe(state, inicio + 1, prox);
    comp(state, false, '</div>\n');
  }
  state.line = prox + 1;
  return true;
}

/** Imagem sozinha no parágrafo, com título, vira `figure`; no cartão, o ": " depois do link some. */
function regraDeFiguras(state) {
  const toks = state.tokens;
  let cartoes = false;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.type === 'comp_open' && t.meta.html === '<div class="cartoes">\n') cartoes = true;
    else if (t.type === 'comp_close' && cartoes && t.meta.html === '</div>\n') cartoes = false;
    if (cartoes && t.type === 'inline') {
      const c = t.children;
      const k = c.findIndex((x) => x.type === 'link_close');
      if (k >= 0 && c[k + 1]?.type === 'text') c[k + 1].content = c[k + 1].content.replace(/^\s*[:：-]\s*/, ' ');
    }
    if (t.type !== 'paragraph_open' || toks[i + 1]?.type !== 'inline') continue;
    const filhos = toks[i + 1].children;
    const img = filhos.length === 1 && filhos[0].type === 'image' ? filhos[0] : null;
    const legenda = img?.attrGet('title');
    if (!legenda) continue;
    img.attrs = img.attrs.filter(([k]) => k !== 'title');
    t.type = 'comp_open'; t.meta = { html: '<figure class="figura">' };
    toks[i + 2].type = 'comp_close'; toks[i + 2].meta = { html: `<figcaption>${esc(legenda)}</figcaption></figure>\n` };
  }
}

/** Um título `Texto {#id}` perde o sufixo e ganha o `id`; ids repetidos ganham `-1`, `-2`. */
function regraDeTitulos(state) {
  const usados = new Map();
  const toc = [];
  state.env.toc = toc;
  const toks = state.tokens;
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].type !== 'heading_open') continue;
    const inline = toks[i + 1];
    const m = /\s*\{#([^}\s]+)\}\s*$/.exec(inline.content);
    let id;
    if (m) {
      id = m[1];
      inline.content = inline.content.slice(0, m.index);
      const ultimo = inline.children?.[inline.children.length - 1];
      if (ultimo?.type === 'text') ultimo.content = ultimo.content.replace(/\s*\{#[^}\s]+\}\s*$/, '');
    } else {
      const base = slugDeTitulo(inline.children.map((c) => (c.type === 'text' || c.type === 'code_inline' ? c.content : '')).join('').trim()) || 'secao';
      const n = usados.get(base) ?? 0;
      usados.set(base, n + 1);
      id = n ? `${base}-${n}` : base;
    }
    toks[i].attrSet('id', id);
    const nivel = Number(toks[i].tag.slice(1));
    if (nivel === 1) state.env.temH1 = true;
    const texto = inline.children.map((c) => (c.type === 'text' || c.type === 'code_inline' ? c.content : '')).join('').trim();
    if (nivel === 2 || nivel === 3) toc.push({ nivel, id, texto });
  }
}

/** `<a id="X"></a>` sozinho num parágrafo logo antes do título de id X existe só para o GitHub (AT-871): sai do HTML. */
function regraDeAncoraDoGithub(state) {
  const t = state.tokens;
  for (let i = t.length - 4; i >= 0; i--) {
    const m = t[i].type === 'paragraph_open' && /^<a id="([^"]+)"><\/a>$/.exec(t[i + 1].content.trim());
    if (m && t[i + 2].type === 'paragraph_close' && t[i + 3].type === 'heading_open' && t[i + 3].attrGet('id') === m[1]) t.splice(i, 3);
  }
}

function resolverLink(href, pagina, porRelativo, repo) {
  // O inverso do `urlDeEdicao` (AT-868): a URL do GitHub do repo dono, de uma raiz conhecida, volta a ser link interno.
  // Sem a página, vira o relativo que não existe, e o `links.mjs` reprova (a URL externa escaparia dele).
  const dono = href.startsWith('https://github.com/') && raizDeUrl(href);
  if (dono) {
    const destino = porRelativo.get(dono.relativo);
    const alvo = destino?.raiz === dono.raiz ? destino.url : urlDe(slugDe(dono.relativo), pagina.locale);
    return urlRelativa(pagina.url, alvo) + (href.includes('#') ? `#${href.split('#').slice(1).join('#')}` : '');
  }
  if (!href || /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) return href;
  const [alvo, frag = ''] = href.split('#');
  const ancora = frag ? `#${frag}` : '';
  if (alvo.startsWith('/')) {
    const rota = alvo.replace(/^\/+|\/+$/g, '');
    return urlRelativa(pagina.url, `${pagina.locale === 'pt-BR' ? '' : `${pagina.locale}/`}${rota || 'index'}.html`) + ancora;
  }
  if (!alvo.endsWith('.md')) return href;
  const rel = path.posix.normalize(path.posix.join(path.posix.dirname(pagina.relativo), alvo));
  const destino = porRelativo.get(rel);
  if (destino) return urlRelativa(pagina.url, destino.url) + ancora;
  // `../README.md` de uma página de repo irmão sai da `docs/` do site: vira o arquivo no GitHub do repo dono (AT-826).
  if (rel.startsWith('../')) return urlDeEdicao(repo, pagina.raiz, rel) + ancora;
  return href; // quebrado: o checador (A5) reprova
}

export async function criarRenderizador({ paginas, repo = 'viralabs-dev/brabo', raiz = process.cwd() }) {
  const porRelativo = new Map(paginas.map((p) => [p.relativo, p]));
  const realce = await createHighlighter({ themes: [createCssVariablesTheme({ name: 'brabo', variablePrefix: '--shiki-' })], langs: LINGUAGENS });
  const md = new MarkdownIt({ html: true, linkify: false });
  md.block.ruler.before('fence', 'admonicao', regraDeComponente, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.core.ruler.push('titulos_brabo', regraDeTitulos);
  md.core.ruler.push('figuras_brabo', regraDeFiguras);
  md.core.ruler.push('ancora_github_brabo', regraDeAncoraDoGithub);
  md.renderer.rules.comp_open = md.renderer.rules.comp_close = (t, i) => t[i].meta.html;
  md.renderer.rules.table_open = () => '<div class="tabela-rolavel"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';
  md.renderer.rules.fence = (t, i, _o, env) => {
    const tk = t[i];
    const lang = tk.info.trim().split(/\s+/)[0];
    if (lang === 'mermaid') { env.temMermaid = true; return `<pre class="mermaid" data-mermaid>${esc(tk.content)}</pre>\n`; }
    if (LINGUAGENS.includes(lang)) return `${realce.codeToHtml(tk.content, { lang, theme: 'brabo' })}\n`;
    return `<pre class="codigo"><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(tk.content)}</code></pre>\n`;
  };
  const linkAberto = md.renderer.rules.link_open ?? ((t, i, o, _e, s) => s.renderToken(t, i, o));
  md.renderer.rules.link_open = (t, i, o, env, self) => {
    const h = t[i].attrGet('href');
    if (h != null) t[i].attrSet('href', resolverLink(h, env.pagina, porRelativo, repo));
    return linkAberto(t, i, o, env, self);
  };

  // A fonte traduzida mora em website/i18n/…, então cita `../../…/docs/assets/x`; no site as imagens vivem em `<locale>/assets/`.
  const imagemAberta = md.renderer.rules.image ?? ((t, i, o, _e, s) => s.renderToken(t, i, o));
  md.renderer.rules.image = (t, i, o, env, self) => {
    const src = t[i].attrGet('src');
    const m = src && /^(?:\.\.\/)+docs\/assets\/(.+)$/.exec(src);
    if (m) {
      const noLocale = env.pagina.locale === 'pt-BR' ? env.pagina.url : env.pagina.url.slice(env.pagina.locale.length + 1);
      t[i].attrSet('src', `${'../'.repeat(noLocale.split('/').length - 1)}assets/${m[1]}`);
    }
    return imagemAberta(t, i, o, env, self);
  };

  return (pagina) => {
    const env = { pagina, raiz };
    const tokens = md.parse(pagina.corpo, env);
    const html = md.renderer.render(tokens, md.options, env);
    const texto = tokens.filter((t) => t.type === 'inline').map((t) => t.content).join('\n')
      .replace(/\s*\{#[^}\s]+\}/g, '').replace(/[`*_>#|]|\[([^\]]*)\]\([^)]*\)/g, (m, a) => a ?? '').replace(/\s+/g, ' ').trim();
    return { html, toc: env.toc ?? [], texto, temMermaid: !!env.temMermaid, temH1: !!env.temH1 };
  };
}
