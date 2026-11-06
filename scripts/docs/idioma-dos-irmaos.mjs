/**
 * Guarda do idioma da doc dos irmãos (AT-745, ADR 0260): a doc dos 10 repos de
 * código é SÓ em inglês. Três regras, todas sobre as raízes de doc dos irmãos
 * (as do `raizes-de-doc.mjs` menos o agregador `produto` e o `ci`, que ficam
 * multilíngues):
 *   (a) toda página `.md` tem `idioma_original: en`;
 *   (b) a raiz não tem `i18n/`;
 *   (c) a prosa não tem pt-BR (contador abaixo; aviso, não reprova).
 */
import { RAIZES_DE_DOC } from './raizes-de-doc.mjs';
import { idiomaOriginal } from './faixa-de-traducao.mjs';

const FORA = new Set(['produto', 'ci']);
export const RAIZES_DOS_IRMAOS = Object.entries(RAIZES_DE_DOC)
  .filter(([nome]) => !FORA.has(nome))
  .map(([, raiz]) => raiz);

/** Páginas sem `idioma_original: en` e raízes com `i18n/`, dado `git ls-files`. */
export function conferirIdiomaDosIrmaos(arquivos, ler, raizes = RAIZES_DOS_IRMAOS) {
  const problemas = [];
  for (const arquivo of arquivos) {
    const raiz = raizes.find((r) => arquivo.startsWith(`${r}/`));
    if (!raiz) continue;
    if (arquivo.startsWith(`${raiz}/i18n/`)) {
      problemas.push({ arquivo, motivo: `\`${raiz}/i18n/\` não pode existir num irmão (ADR 0260)` });
    } else if (arquivo.endsWith('.md') && idiomaOriginal(ler(arquivo)) !== 'en') {
      problemas.push({ arquivo, motivo: 'falta `idioma_original: en` no frontmatter (ADR 0260)' });
    }
  }
  return problemas;
}

// Palavras funcionais do pt-BR que o inglês não usa, e os sufixos `ção`/`ções`
// em palavra minúscula (nome de tela em maiúscula, como "Configurações", é rótulo da UI).
// `\b` do JS é ASCII: com acento (é, ç) precisa de lookaround Unicode.
const PT = /(?<![\p{L}\p{N}_])(?:não|nao|são|está|então|também|quando|porque|pelo|pela|uma|para|com|que|dos|das|é)(?![\p{L}\p{N}_])/iu;
const PT_ACENTO = /(?<![\p{L}\p{N}_])\p{Ll}+(?:ção|ções)(?![\p{L}\p{N}_])/u;
// Cada trecho é apagado MANTENDO as quebras de linha, para o número da linha valer.
// Os limites {0,N} impedem que uma aspa ou crase solta engula o arquivo.
const EM_BRANCO = (m) => m.replace(/[^\n]/g, ' ');
const MASCARAS = [
  /```[\s\S]*?```/g, // cerca de código
  /(`+)[\s\S]{0,400}?\1/g, // código em linha (crase simples ou dupla), inclusive multilinha
  /^>.*$/gm, // citação em bloco (trecho de outro texto)
  /\*[^*\n]{1,200}\*(?!\*)/g, // itálico: rótulo da UI ou termo citado
  /\("[\s\S]{0,600}?"\)/g, // citação entre parênteses, com aspas dentro
  /\b[\w-]+(?:\.[\w-]+)*\.(?:com|org|io|dev|net)\b\S*/g, // domínio sem esquema
  /\\"[\s\S]{0,600}?\\"/g, // citação com aspas escapadas (vem antes: pode estar dentro de aspas)
  /"[^"]{0,600}"/g, // citação, inclusive atravessando linhas
  /“[^”]{0,600}”/g,
  /\{#[^}]*\}/g, // âncora
  /\]\([^)]*\)/g, // alvo de link
  /https?:\/\/[^\s)>\]]+/g, // URL
  /[\w.+-]+@[\w-]+\.[\w.-]+/g, // e-mail
  /<[^>\n]+>/g, // tag HTML
];

/** Linhas (1-based) de prosa que parecem pt-BR, fora de código, citação, URL e link. */
export function linhasEmPortugues(texto) {
  let t = texto.replace(/^---\r?\n[\s\S]*?\r?\n---/, EM_BRANCO);
  for (const m of MASCARAS) t = t.replace(m, EM_BRANCO);
  return t.split('\n').flatMap((l, i) => (PT.test(l) || PT_ACENTO.test(l) ? [i + 1] : []));
}

/** `[{arquivo, linhas}]` das páginas dos irmãos com prosa pt-BR. */
export function aferirPortugues(arquivos, ler, raizes = RAIZES_DOS_IRMAOS) {
  return arquivos
    .filter((a) => a.endsWith('.md') && raizes.some((r) => a.startsWith(`${r}/`)))
    .map((arquivo) => ({ arquivo, linhas: linhasEmPortugues(ler(arquivo)) }))
    .filter((r) => r.linhas.length > 0);
}
