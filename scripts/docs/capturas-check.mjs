#!/usr/bin/env node
/**
 * Guarda das imagens da doc (AT-859). As capturas atuais são geradas pelo `brabo-qa` e
 * entram por PR do bot em `docs/assets/capturas/` + `docs/assets/capturas.json`.
 *
 *   node scripts/docs/capturas-check.mjs
 *
 * REPROVA: (a) imagem fora de `historico/` (e fora do `logo.svg`) que não está no manifesto,
 * ou entrada do manifesto sem arquivo; (b) imagem acima de 400 KB (1,5 MB para animação
 * dentro de `historico/`); (c) imagem de `historico/` citada fora de `:::historico`;
 * (d) `web` do manifesto abaixo da pin de `componentes.json` (MAJOR.MINOR), SÓ em PR para a
 * `main` (`GITHUB_BASE_REF=main`); na `dev` só avisa (molde de `pins-dos-componentes.yml`).
 * A página que usa cada imagem é descoberta por grep nos `.md`, nunca gravada no manifesto.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMITE_ESTATICA = 400 * 1024;
export const LIMITE_ANIMACAO = 1.5 * 1024 * 1024;
const IMAGEM = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm)$/i;
const ANIMACAO = /\.(gif|mp4|webm)$/i;

const minor = (v) => {
  const m = /^v?(\d+)\.(\d+)/.exec(v ?? '');
  return m ? [Number(m[1]), Number(m[2])] : null;
};
/** -1, 0 ou 1; `null` se alguma das versões não for legível. */
export const compararMinor = (a, b) => {
  const x = minor(a), y = minor(b);
  return x && y ? Math.sign(x[0] - y[0] || x[1] - y[1]) : null;
};

/** Imagens (`caminho`) citadas num `.md`, com a flag "dentro de `:::historico`". */
export function citacoes(texto) {
  const out = [];
  let dentro = false;
  for (const linha of texto.split('\n')) {
    if (/^:::historico\b/.test(linha)) dentro = true;
    else if (/^:::\s*$/.test(linha)) dentro = false;
    for (const m of linha.matchAll(/!\[[^\]]*\]\(([^)\s]+)|(?:src|srcset)="([^"]+)"/g)) out.push({ caminho: m[1] ?? m[2], dentro });
  }
  return out;
}

/**
 * Puro: `imagens` = { 'capturas/x.png': bytes }, relativas a `docs/assets/`; `paginas` = { arquivo: texto };
 * `manifesto` = entradas de `capturas.json`; `pin` = tag do web em `componentes.json`; `naMain` = PR para a main.
 */
export function verificar({ imagens, manifesto, paginas, pin, naMain }) {
  const erros = [], avisos = [], uso = {};
  const noManifesto = new Set(manifesto.map((e) => `capturas/${e.arquivo}`));
  for (const [rel, bytes] of Object.entries(imagens)) {
    const hist = rel.startsWith('historico/');
    if (!hist && rel !== 'logo.svg' && !noManifesto.has(rel)) erros.push(`${rel}: imagem fora de historico/ e fora do manifesto capturas.json (gere pelo brabo-qa ou mova para historico/)`);
    const teto = hist && ANIMACAO.test(rel) ? LIMITE_ANIMACAO : LIMITE_ESTATICA;
    if (bytes > teto) erros.push(`${rel}: ${Math.ceil(bytes / 1024)} KB acima de ${teto / 1024} KB`);
  }
  for (const rel of noManifesto) if (!(rel in imagens)) erros.push(`${rel}: está no manifesto e não existe em docs/assets/`);
  for (const [arq, texto] of Object.entries(paginas)) {
    for (const { caminho, dentro } of citacoes(texto)) {
      const m = /assets\/((?:capturas|historico)\/[^)#?\s]+|logo\.svg)$/.exec(caminho);
      if (!m) continue;
      (uso[m[1]] ??= []).push(arq);
      if (m[1].startsWith('historico/') && !dentro) erros.push(`${arq}: ${m[1]} é histórica e precisa estar dentro de :::historico AAAA-MM-DD`);
      if (!(m[1] in imagens)) erros.push(`${arq}: cita ${m[1]}, que não existe`);
    }
  }
  for (const rel of Object.keys(imagens)) if (!uso[rel] && rel !== 'logo.svg') avisos.push(`${rel}: nenhuma página usa esta imagem`);
  for (const e of manifesto) {
    const c = compararMinor(e.web, pin);
    if (c === null) erros.push(`capturas.json: ${e.arquivo} tem web "${e.web}" ilegível (pin "${pin}")`);
    else if (c < 0) (naMain ? erros : avisos).push(`capturas.json: ${e.arquivo} é do web ${e.web}, abaixo da pin ${pin}${naMain ? ' (reprova na main; o bot recaptura)' : ' (só avisa na dev)'}`);
  }
  return { erros, avisos, uso };
}

function varrer(dir, filtro, base = dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === '.git' || n === 'build') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) varrer(p, filtro, base, out);
    else if (filtro(n)) out.push(p);
  }
  return out;
}

export function executar(raiz, env = process.env) {
  const assets = join(raiz, 'docs/assets');
  const imagens = Object.fromEntries(varrer(assets, (n) => IMAGEM.test(n)).map((p) => [relative(assets, p), statSync(p).size]));
  const manifesto = JSON.parse(readFileSync(join(assets, 'capturas.json'), 'utf8'));
  const pin = JSON.parse(readFileSync(join(raiz, 'componentes.json'), 'utf8')).imagens.web.tag;
  const mds = [...varrer(join(raiz, 'docs'), (n) => n.endsWith('.md')), ...readdirSync(raiz).filter((n) => /^README.*\.md$/.test(n)).map((n) => join(raiz, n))];
  const paginas = Object.fromEntries(mds.map((p) => [relative(raiz, p), readFileSync(p, 'utf8')]));
  return verificar({ imagens, manifesto, paginas, pin, naMain: env.GITHUB_BASE_REF === 'main' });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  if (!existsSync(join(raiz, 'docs/assets/capturas.json'))) { console.error('capturas.json ausente'); process.exit(1); }
  const { erros, avisos, uso } = executar(raiz);
  for (const [img, ps] of Object.entries(uso).sort()) console.log(`${img} <- ${[...new Set(ps)].join(', ')}`);
  for (const a of avisos) console.log(`::warning::${a}`);
  for (const e of erros) console.log(`::error::${e}`);
  console.log(erros.length ? `capturas-check: ${erros.length} erro(s)` : `capturas-check: ok (${avisos.length} aviso(s))`);
  process.exit(erros.length ? 1 : 0);
}
