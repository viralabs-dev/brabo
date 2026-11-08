/**
 * O índice de ADR GERADO (AT-862, ADR 0287): número, título e status, uma tabela
 * por tema, com filtro por tema e por status. O texto de cada decisão fica no
 * próprio ADR. Revisa o item 2 do ADR 0202 ("o índice é conferido, não gerado").
 *
 * O tema (e a ordem dos temas) continua em `docs/adr/temas.yml`; o título é o
 * `# ADR NNNN — <título>` do ADR, e o status vem da seção `## Status` dele. ADR
 * aceito não se edita, então o ADR sem seção de status vale `aceito`.
 *
 * Funções puras sobre texto: `generate.mjs` lê os arquivos e escreve o bloco.
 */
import { parse } from 'yaml';

export const STATUS = ['aceito', 'proposto', 'substituido'];

/** `aceito` | `proposto` | `substituido`, pela seção `## Status` ou pela linha `- **Status:** …` (sem elas, `aceito`). */
export function statusDoAdr(texto) {
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => /^##\s+(?:Status|Estado)\b/i.test(l));
  const marcada = linhas.find((l) => /^\s*[-*]?\s*\*\*Status:?\*\*:?/i.test(l));
  const primeira = i >= 0 ? (linhas.slice(i + 1).find((l) => l.trim()) ?? '') : (marcada ?? '').replace(/^\s*[-*]?\s*\*\*Status:?\*\*:?/i, '');
  const t = primeira.replace(/[*_`#>\s]+/g, ' ').trim();
  if (/^(?:Propos(?:ed|to)|Rascunho|Draft)\b/i.test(t)) return 'proposto';
  if (/^(?:Superseded|Substitu[ií]do|Obsolet|Deprecated)/i.test(t)) return 'substituido';
  return 'aceito';
}

/** O título do `# ADR NNNN — <título>`; sem o prefixo, o H1 inteiro. */
export function tituloDoAdr(texto) {
  const h1 = texto.split('\n').find((l) => l.startsWith('# ')) ?? '';
  return h1.replace(/^#\s+/, '').replace(/^ADR\s+\d{4}\s+[—-]\s+/, '').trim();
}

const celula = (s) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ');
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * O bloco do índice de UM locale.
 * @param {{ temasYml: string, adrs: {arquivo: string, titulo: string, status: string}[], T: Record<string,any>, locale?: string|null }} e
 *   `adrs` já com o título do locale; `T` são os textos gerados do locale; `locale` escolhe o `i18n:` do tema.
 */
export function gerarIndiceDeAdr({ temasYml, adrs, T, locale = null }) {
  const doc = parse(temasYml);
  const temaDe = new Map(Object.entries(doc.adrs ?? {}).map(([n, t]) => [String(n).padStart(4, '0'), t]));
  const temas = (doc.temas ?? []).map((t) => ({ id: t.id, ...(locale && t.i18n?.[locale] ? t.i18n[locale] : { titulo: t.titulo, descricao: t.descricao }) }));
  const rotuloStatus = { aceito: T.adrAceito, proposto: T.adrProposto, substituido: T.adrSubstituido };
  const usados = STATUS.filter((s) => adrs.some((a) => a.status === s));
  const saida = [
    `**${T.adrTemas}:** ${temas.map((t) => `[${t.titulo}](#tema-${t.id})`).join(' · ')}`,
    '',
    // Sem JS os seletores ficam escondidos e valem os links acima (`site.js` os mostra e filtra as linhas).
    `<div class="adr-filtro" data-adr-filtro hidden><label>${T.adrFiltroTema} <select data-adr-tema><option value="">${T.adrTodos}</option>${temas.map((t) => `<option value="tema-${t.id}">${attr(t.titulo)}</option>`).join('')}</select></label> <label>${T.adrFiltroStatus} <select data-adr-status><option value="">${T.adrTodos}</option>${usados.map((s) => `<option value="${rotuloStatus[s]}">${rotuloStatus[s]}</option>`).join('')}</select></label></div>`,
  ];
  for (const t of temas) {
    const linhas = adrs.filter((a) => temaDe.get(a.arquivo.slice(0, 4)) === t.id);
    saida.push('', `## ${t.titulo} {#tema-${t.id}}`, '', t.descricao, '', T.adrColunas, '|---|---|---|');
    for (const a of linhas) saida.push(`| [${a.arquivo.slice(0, 4)}](${a.arquivo}) | ${celula(a.titulo)} | ${rotuloStatus[a.status]} |`);
  }
  return saida.join('\n');
}
