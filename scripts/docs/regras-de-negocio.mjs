/**
 * As RNs vistas de TODAS as raízes de doc (AT-693): uma função só diz quais
 * arquivos hospedam RN, em vez de três listas fixas (contagem, âncoras, refs).
 * Arquivo sem cabeçalho `### RN-` (índice, stubs) está na lista mas não conta.
 */
import { lerRaizesDeDoc } from './raizes-de-doc.mjs';
import { copiaDoLocale } from './textos-gerados.mjs';

/** Os locales traduzidos (ADR 0216): pt-BR é a fonte, em `<raiz>/`. */
export const LOCALES_TRADUZIDOS = ['en', 'ru', 'zh-Hans'];

const CABECALHO = /^### RN-(\d+)\b(.*)$/gm;

/**
 * Os arquivos de RN (fonte pt-BR e traduções) de cada raiz existente.
 * @param {(glob: string) => string[]} arquivos `git ls-files <glob>`
 * @param {{raiz: string}[]} raizes
 */
export function arquivosDeRn(arquivos, raizes = lerRaizesDeDoc()) {
  const bases = raizes.flatMap(({ raiz }) => [raiz, ...LOCALES_TRADUZIDOS.map((l) => `${raiz}/i18n/${l}`)]);
  return bases.flatMap((b) => [...arquivos(`${b}/business-rules.md`), ...arquivos(`${b}/business-rules/*.md`)]);
}

const ehTraducao = (arquivo) => arquivo.includes('/i18n/');

/** Cabeçalhos `### RN-NNN` de um texto: `[{numero, titulo}]`. */
export function rnsDoTexto(texto) {
  return [...texto.matchAll(CABECALHO)].map(([, numero, resto]) => ({
    numero: Number(numero),
    titulo: resto.replace(/\s*\{#[^}]*\}\s*$/, '').replace(/^\s*[—-]\s*/, '').trim(),
  }));
}

/** Só a fonte pt-BR: `[{numero, titulo, arquivo}]`. */
export function rnsDaFonte(arquivos, ler) {
  return arquivos
    .filter((a) => !ehTraducao(a))
    .flatMap((arquivo) => rnsDoTexto(ler(arquivo)).map((r) => ({ ...r, arquivo })));
}

export const contarRegras = (arquivos, ler) => rnsDaFonte(arquivos, ler).length;

/** O maior número de RN de todas as raízes (o próximo é este + 1). */
export const maiorRn = (arquivos, ler) => Math.max(0, ...rnsDaFonte(arquivos, ler).map((r) => r.numero));

/** O mesmo número em mais de um lugar (fonte pt-BR): `[{numero, arquivos}]`. */
export function numerosDuplicados(arquivos, ler) {
  const onde = new Map();
  for (const r of rnsDaFonte(arquivos, ler)) onde.set(r.numero, [...(onde.get(r.numero) ?? []), r.arquivo]);
  return [...onde].filter(([, a]) => a.length > 1).map(([numero, a]) => ({ numero, arquivos: a }));
}

/**
 * As RNs de um locale (`null` = fonte): a tradução quando o arquivo dela existe,
 * a fonte quando não (AT-745: irmão ainda sem `i18n/` ou com fonte em inglês).
 * `pagina` é o caminho de `business-rules/…`, igual com ou sem tradução.
 */
export function rnsDoLocale(todos, locale, ler) {
  return todos
    .filter((a) => !a.includes('/i18n/'))
    .flatMap((fonte) => {
      const copia = locale ? copiaDoLocale(locale, fonte) : fonte;
      const a = todos.includes(copia) ? copia : fonte;
      return rnsDoTexto(ler(a)).map((r) => ({ ...r, pagina: fonte.slice(fonte.indexOf('business-rules')) }));
    });
}

/** Coordenadas da união: tira o `<raiz>/` (`apps/api/docs/business-rules/api.md` → `business-rules/api.md`). */
export function paginaNaUniao(arquivo, raizes = lerRaizesDeDoc()) {
  const r = raizes.find((x) => arquivo.startsWith(`${x.raiz}/`));
  return r ? arquivo.slice(r.raiz.length + 1) : arquivo;
}

/**
 * O bloco do índice (AT-862, ADR 0287): uma linha por domínio (contagem e link
 * para a página dele) e, por baixo, a GRADE de números, uma âncora `rn-NNN` por
 * RN com o link para a página hospedeira (a parte, quando a área foi partida).
 * Os títulos moram nas páginas; a grade só preserva as âncoras, que são contrato.
 * `rns`: `[{numero, titulo, pagina}]`.
 */
export function gerarIndiceDeRn(rns) {
  const ordenadas = [...rns].sort((a, b) => a.numero - b.numero);
  const dominios = new Map();
  for (const r of ordenadas) {
    const d = r.pagina.replace(/^business-rules\//, '').replace(/\.md$/, '').split('/')[0];
    dominios.set(d, (dominios.get(d) ?? 0) + 1);
  }
  const linhasDeDominio = [...dominios]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([d, n]) => `- [${d}](business-rules/${d}.md) — ${n} RN`);
  const celulas = ordenadas.map((r) => {
    const n = String(r.numero).padStart(3, '0');
    return `<a id="rn-${n}"></a>[${n}](${r.pagina}#rn-${n})`;
  });
  const grade = [];
  for (let i = 0; i < celulas.length; i += 10) grade.push(celulas.slice(i, i + 10).join(' '));
  return ['<!-- BEGIN:GENERATED:indice-de-rn -->', ...linhasDeDominio, '', ...grade, '<!-- END:GENERATED:indice-de-rn -->'].join('\n');
}
