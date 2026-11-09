/**
 * pins-dos-componentes — a pin do `componentes.json` (e o `RUNNER_TAG` do `install.sh`)
 * acompanha a última Release FINAL de cada componente (AT-796, ADR 0282).
 *
 *   node scripts/ci/pins-dos-componentes.ts --conferir componentes.json install.sh [--aviso]
 *   node scripts/ci/pins-dos-componentes.ts --subir    componentes.json install.sh
 *
 * `--conferir` (a trava) reprova quando a pin está atrás da `releases/latest`, não tem Release
 * final, falta o asset que o produto consome, `infra.ref` ≠ `imagens.backup.tag` ou o `RUNNER_TAG`
 * ≠ `runner.tag`. Com `--aviso` (ensaio do release) só avisa. `--subir` (o bot) só SOBE a pin,
 * trocando a tag na linha, sem reformatar o JSON; nunca desce.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const FINAL = /^v(\d+)\.(\d+)\.(\d+)$/;
export interface Release { tag: string; assets: string[]; draft?: boolean; prerelease?: boolean }
interface Pin { nome: string; repo: string; tag: string; requer: string[] }
export interface Lido { latest: Record<string, Release | null>; daPin: Record<string, Release | null> }

const ASSET_IMAGEM = ['imagem.json'];
const ASSET_RUNNER = ['checksums.txt', 'checksums.txt.bundle'];

const num = (t: string) => FINAL.exec(t)!.slice(1).map(Number);
export function maior(a: string, b: string): boolean {
  const [x, y] = [num(a), num(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}

export function pinsDe(c: any): Pin[] {
  const p: Pin[] = [
    { nome: 'infra', repo: c.infra.repo, tag: c.infra.ref, requer: ASSET_IMAGEM },
    { nome: 'runner', repo: c.runner.repo, tag: c.runner.tag, requer: ASSET_RUNNER },
  ];
  for (const [nome, i] of Object.entries<any>(c.imagens)) p.push({ nome, repo: i.repo, tag: i.tag, requer: ASSET_IMAGEM });
  return p;
}

const final = (r: Release | null | undefined): r is Release => !!r && !r.draft && !r.prerelease && FINAL.test(r.tag);

export function runnerTagDoInstall(install: string): string | undefined {
  return /^RUNNER_TAG='([^']*)'/m.exec(install)?.[1];
}

/** A trava: devolve um erro por problema (vazio = verde). Pura, sem rede. */
export function compararPins(c: any, install: string, lido: Lido): string[] {
  const erros: string[] = [];
  for (const p of pinsDe(c)) {
    const latest = lido.latest[p.repo];
    const daPin = lido.daPin[`${p.repo}@${p.tag}`];
    if (!final(daPin)) erros.push(`${p.nome}: ${p.tag} não tem Release final publicada em ${p.repo}`);
    else {
      const falta = p.requer.filter((a) => !daPin.assets.includes(a));
      if (falta.length) erros.push(`${p.nome}: a Release ${p.tag} não traz ${falta.join(', ')}`);
    }
    if (final(latest) && maior(latest.tag, p.tag)) erros.push(`${p.nome}: a pin ${p.tag} está atrás da Latest ${latest.tag} de ${p.repo}`);
  }
  if (c.infra.ref !== c.imagens.backup?.tag) erros.push(`infra.ref (${c.infra.ref}) ≠ imagens.backup.tag (${c.imagens.backup?.tag})`);
  const rt = runnerTagDoInstall(install);
  if (rt !== c.runner.tag) erros.push(`RUNNER_TAG do install.sh (${rt}) ≠ runner.tag (${c.runner.tag})`);
  return erros;
}

/** O bot: troca só a tag, na linha. Sobe se a Latest tem o asset e é maior; nunca desce. */
export function subirPins(texto: string, install: string, latest: Record<string, Release | null>) {
  const subidas: string[] = [];
  let runnerNovo: string | undefined;
  const json = texto.split('\n').map((linha) => {
    const repo = /"repo": "([^"]+)"/.exec(linha)?.[1];
    const r = repo ? latest[repo] : undefined;
    const m = /"(tag|ref)": "(v[^"]+)"/.exec(linha);
    if (!repo || !m || !final(r) || !maior(r.tag, m[2])) return linha;
    const requer = repo.endsWith('/brabo-runner') ? ASSET_RUNNER : ASSET_IMAGEM;
    if (requer.some((a) => !r.assets.includes(a))) {
      console.log(`::warning::${repo}: a Latest ${r.tag} ainda não traz ${requer.join(' e ')}; a pin fica em ${m[2]}`);
      return linha;
    }
    subidas.push(`${repo.replace('viralabs-dev/', '')}: ${m[2]} → ${r.tag}`);
    if (repo.endsWith('/brabo-runner')) runnerNovo = r.tag;
    return linha.replace(m[0], `"${m[1]}": "${r.tag}"`);
  }).join('\n');
  const novoInstall = runnerNovo ? install.replace(/^(RUNNER_TAG=')[^']*(')/m, `$1${runnerNovo}$2`) : install;
  return { json, install: novoInstall, subidas };
}

// --- rede (gh) -------------------------------------------------------------------------------
function gh(rota: string): Release | null {
  try {
    const j = JSON.parse(execFileSync('gh', ['api', rota], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    return { tag: j.tag_name, assets: j.assets.map((a: any) => a.name), draft: j.draft, prerelease: j.prerelease };
  } catch (e: any) {
    if (/HTTP 404/.test(String(e.stderr))) return null;
    throw e;
  }
}

function lerDaRede(c: any, comPins: boolean): Lido {
  const lido: Lido = { latest: {}, daPin: {} };
  for (const p of pinsDe(c)) {
    lido.latest[p.repo] ??= gh(`repos/${p.repo}/releases/latest`);
    if (comPins) lido.daPin[`${p.repo}@${p.tag}`] ??= gh(`repos/${p.repo}/releases/tags/${p.tag}`);
  }
  return lido;
}

if (process.argv[1]?.endsWith('pins-dos-componentes.ts')) {
  const [, , modo, arq, instalar, aviso] = process.argv;
  if (!['--conferir', '--subir'].includes(modo ?? '') || !arq || !instalar) {
    console.error('uso: pins-dos-componentes.ts --conferir|--subir <componentes.json> <install.sh> [--aviso]');
    process.exit(2);
  }
  try {
    const texto = readFileSync(arq, 'utf8');
    const install = readFileSync(instalar, 'utf8');
    const c = JSON.parse(texto);
    if (modo === '--subir') {
      const r = subirPins(texto, install, lerDaRede(c, false).latest);
      writeFileSync(arq, r.json);
      writeFileSync(instalar, r.install);
      for (const s of r.subidas) console.log(s);
    } else {
      const erros = compararPins(c, install, lerDaRede(c, true));
      for (const e of erros) console.log(`::${aviso === '--aviso' ? 'warning' : 'error'}::pins-dos-componentes: ${e}`);
      if (erros.length && aviso !== '--aviso') process.exit(1);
      if (!erros.length) console.log('Pins dos componentes em dia com as Releases finais.');
    }
  } catch (e) {
    console.error(`::error::pins-dos-componentes: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
