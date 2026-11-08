#!/usr/bin/env node
/**
 * O tipo de cada página e o grupo do menu em que ela mora (AT-854, Diátaxis):
 *   node scripts/docs/site/tipos.mjs        (lê a árvore de docs/ montada, como o `docs:build`)
 *
 * O tipo vem do frontmatter (`tipo:`) ou, sem ele, da pasta. Declarar só é
 * obrigatório onde a pasta não diz o tipo ou diz o errado; assim os ADRs aceitos
 * (que nunca se editam), as páginas geradas e as dos repos irmãos não precisam
 * de uma linha cada. Cada grupo de topo do menu declara os tipos que aceita
 * (`espera`, em `navegacao.mjs`).
 *
 *  - ERRO: página do `brabo` sem tipo; tipo fora de `TIPOS`; tipo fora do que o
 *    grupo espera (também para irmão que DECLAROU o tipo); página que existe e não está no menu.
 *  - AVISO: página de irmão que não declarou tipo e a pasta não bate com o grupo.
 *    O aviso nomeia o repo dono, que ajusta o frontmatter na próxima PR de doc dele.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirNavegacao, listaPlana } from './navegacao.mjs';
import { descobrirPaginas } from './paginas.mjs';
import { urlDeEdicao } from './repo-dono.mjs';

export const TIPOS = ['tutorial', 'guia', 'conceito', 'referencia', 'decisao', 'historico'];

const PASTAS = [
  [/^adr(\/|$)/, 'decisao'],
  [/^business-rules(\/|$)/, 'referencia'],
  [/^reference\//, 'referencia'],
  [/^how-to\//, 'guia'],
  [/^tutorials\//, 'tutorial'],
  [/^explanation\//, 'conceito'],
];

/** O tipo declarado, ou o da pasta; `undefined` quando nenhum dos dois diz. */
export function tipoDaPagina({ slug, dados = {} }) {
  return dados.tipo ?? PASTAS.find(([re]) => re.test(slug))?.[1];
}

export function conferirTipos({ paginas, navegacao }) {
  const grupoDe = new Map();
  for (const g of navegacao) for (const { slug } of listaPlana([g])) grupoDe.set(slug, g);
  const erros = [];
  const avisos = [];
  for (const p of paginas) {
    const dono = p.raiz === 'docs';
    const quem = `${dono ? 'brabo' : urlDeEdicao('x/y', p.raiz, p.relativo).split('/')[4]}: ${p.relativo}`;
    const declarado = p.dados?.tipo;
    const tipo = tipoDaPagina(p);
    if (declarado !== undefined && !TIPOS.includes(declarado)) { erros.push(`${quem}: tipo "${declarado}" não existe (${TIPOS.join('|')})`); continue; }
    const grupo = grupoDe.get(p.slug);
    if (!grupo) { erros.push(`${quem}: a página existe e não está no menu`); continue; }
    if (!tipo && dono) { erros.push(`${quem}: sem \`tipo:\` e a pasta não diz o tipo`); continue; }
    if (tipo && grupo.espera.includes(tipo)) continue;
    const msg = `${quem}: tipo ${tipo ? `"${tipo}"` : 'indefinido'} no grupo "${grupo.rotulo}" (espera ${grupo.espera.join('|')})`;
    (dono || declarado ? erros : avisos).push(msg);
  }
  return { erros, avisos };
}

function main() {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const paginas = descobrirPaginas({ raiz });
  const navegacao = construirNavegacao({ raiz, repo: 'viralabs-dev/brabo' });
  const { erros, avisos } = conferirTipos({ paginas, navegacao });
  for (const a of avisos) console.log(`  aviso  ${a}`);
  for (const e of erros) console.error(`  ERRO   ${e}`);
  console.log(`tipos: ${paginas.length} páginas, ${erros.length} erro(s), ${avisos.length} aviso(s).`);
  if (erros.length) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
