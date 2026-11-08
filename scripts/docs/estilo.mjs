/**
 * Check de estilo da doc (AT-861): orçamento de palavras por tipo de página e
 * ID interno (ADR, RN, AT...) fora de "Para saber mais".
 *
 * Por enquanto só AVISA: a CLI sai 0. Quem cobra é a catraca `PENDENTES` do
 * `estilo.spec.ts`, que só encolhe.
 *
 *   node scripts/docs/estilo.mjs [arquivo…]   (padrão: docs/**\/*.md, sem i18n)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerFrontmatter } from './site/paginas.mjs';
import { tipoDaPagina } from './site/tipos.mjs';

/** Limite de palavras de prosa por tipo; tipo fora daqui é isento. */
export const LIMITES = { tutorial: 1500, guia: 800, conceito: 1200 };

const ID_INTERNO = /\b(?:ADR \d{3,4}|RN-\d+|AT-\d+|EP-\d+|HS-\d+|Fase \d+|Rodada \d+)\b/g;
const PARA_SABER_MAIS = /^##\s+Para saber mais\b/;

/** Palavras da prosa + IDs internos (linha 1-based). Funções puras sobre texto. */
export function medirPagina(texto) {
  const linhas = texto.replace(/^---\n[\s\S]*?\n---\n?/, (m) => '\n'.repeat(m.split('\n').length - 1)).split('\n');
  let palavras = 0;
  const ids = [];
  let cerca = false;
  let livre = false; // dentro de "Para saber mais"
  linhas.forEach((linha, i) => {
    if (/^\s*(```|~~~)/.test(linha)) {
      cerca = !cerca;
      return;
    }
    if (cerca) return;
    const titulo = /^#{1,6}\s/.test(linha);
    if (titulo) livre = PARA_SABER_MAIS.test(linha) || (livre && !/^##?\s/.test(linha));
    if (livre) return;
    const semCodigo = linha.replace(/`[^`]*`/g, '');
    for (const m of semCodigo.matchAll(ID_INTERNO)) ids.push({ linha: i + 1, id: m[0] });
    if (!titulo && !/^\s*\|/.test(linha)) palavras += semCodigo.split(/\s+/).filter(Boolean).length;
  });
  return { palavras, ids };
}

/** Avisos de uma página; vazio quando passa ou quando o tipo é isento. */
export function avisos(texto, slug = '') {
  const tipo = tipoDaPagina({ slug, dados: lerFrontmatter(texto).dados });
  const limite = LIMITES[tipo];
  if (limite === undefined) return [];
  const { palavras, ids } = medirPagina(texto);
  const saida = [];
  if (palavras > limite) saida.push(`${palavras} palavras, acima de ${limite} (${tipo})`);
  for (const { linha, id } of ids) saida.push(`linha ${linha}: ID interno "${id}" fora de "Para saber mais"`);
  return saida;
}

/** docs/**\/*.md em pt-BR (sem i18n), caminhos relativos à raiz do repo. */
export function paginas(raiz) {
  const lista = [];
  const andar = (dir) => {
    for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) {
        if (rel !== 'docs/i18n') andar(rel);
      } else if (e.name.endsWith('.md')) lista.push(rel);
    }
  };
  andar('docs');
  return lista.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raiz = process.cwd();
  const alvos = process.argv.length > 2 ? process.argv.slice(2) : paginas(raiz);
  let n = 0;
  for (const arq of alvos) {
    for (const a of avisos(readFileSync(join(raiz, arq), 'utf8'), arq.replace(/^docs\//, '').replace(/\.md$/, ''))) {
      console.warn(`AVISO ${arq}: ${a}`);
      n++;
    }
  }
  console.log(`estilo: ${n} aviso(s) em ${alvos.length} página(s)`);
}
