import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * AT-726: `montar-layout.sh` com repos git temporários. O manifesto
 * `.git/layout-irmaos.lst` deixa a segunda rodada limpar o que a primeira
 * trouxe e já não existe no irmão (antes o `--update=none` mantinha a cópia velha).
 */
const SCRIPT = resolve(__dirname, 'montar-layout.sh');
const REPOS = ['api', 'engine', 'web', 'runner', 'broker', 'contracts', 'infra', 'ci', 'qa'];
const git = (cwd: string, ...a: string[]) =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' });

let raiz: string;
let irmaos: string;
let brabo: string;

const commit = (repo: string) => {
  const d = join(irmaos, `brabo-${repo}`);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '--allow-empty', '-m', 'x');
};
const montar = (env: Record<string, string> = { BRABO_REF: 'dev' }) => {
  const e = { ...process.env, BRABO_IRMAOS: irmaos, ...env };
  if (!('BRABO_REF' in env)) delete e.BRABO_REF;
  return execFileSync('bash', [join(brabo, 'scripts/docs/montar-layout.sh')], { cwd: brabo, env: e, encoding: 'utf8', stdio: 'pipe' });
};
const head = (repo: string) => git(join(irmaos, `brabo-${repo}`), 'rev-parse', 'HEAD').trim();
// commitada, como no repo real: o que está no índice e fora de HEAD o script trata como dos irmãos
const trava = (mexe: (linhas: string[]) => string[] = (l) => l) => {
  writeFileSync(join(brabo, 'irmaos.lock'), mexe(REPOS.map((r) => `brabo-${r} ${head(r)}`)).join('\n') + '\n');
  git(brabo, 'add', 'irmaos.lock');
  git(brabo, 'commit', '-q', '--allow-empty', '-m', 'trava', '--', 'irmaos.lock');
};
const falha = (env?: Record<string, string>) => {
  try {
    montar(env);
  } catch (e) {
    return String((e as { stdout?: string }).stdout) + String((e as { stderr?: string }).stderr);
  }
  return null;
};

beforeAll(() => {
  raiz = mkdtempSync(join(tmpdir(), 'layout-'));
  irmaos = join(raiz, 'irmaos');
  for (const r of REPOS) {
    const d = join(irmaos, `brabo-${r}`);
    mkdirSync(d, { recursive: true });
    git(d, 'init', '-q', '-b', 'dev');
    writeFileSync(join(d, `${r}.txt`), r);
    commit(r);
  }
  brabo = join(raiz, 'brabo');
  mkdirSync(join(brabo, 'scripts/docs'), { recursive: true });
  cpSync(SCRIPT, join(brabo, 'scripts/docs/montar-layout.sh'));
  git(brabo, 'init', '-q', '-b', 'dev');
  writeFileSync(join(brabo, 'README.md'), 'daqui');
  git(brabo, 'add', '-A');
  git(brabo, 'commit', '-q', '-m', 'base');
});
afterAll(() => rmSync(raiz, { recursive: true, force: true }));

describe('montar-layout.sh', () => {
  it('traz os irmãos e grava o manifesto', () => {
    montar();
    expect(readFileSync(join(brabo, 'apps/api/api.txt'), 'utf8')).toBe('api');
    expect(readFileSync(join(brabo, '.git/layout-irmaos.lst'), 'utf8')).toContain('apps/api/api.txt');
  });

  it('a docs/ de irmão posto em "." vai para <nome>/docs e não cai na docs/ daqui (AT-846; sem o desvio reprova)', () => {
    mkdirSync(join(irmaos, 'brabo-qa', 'docs'), { recursive: true });
    writeFileSync(join(irmaos, 'brabo-qa', 'docs', 'x.md'), 'qa');
    commit('qa');
    montar();
    expect(readFileSync(join(brabo, 'qa/docs/x.md'), 'utf8')).toBe('qa');
    expect(existsSync(join(brabo, 'docs/x.md'))).toBe(false);
    expect(git(brabo, 'ls-files', 'qa/docs')).toContain('qa/docs/x.md');
  });

  it('arquivo que saiu do irmão some na rodada seguinte; o que é daqui fica', () => {
    git(join(irmaos, 'brabo-api'), 'rm', '-q', 'api.txt');
    commit('api');
    montar();
    expect(existsSync(join(brabo, 'apps/api/api.txt'))).toBe(false);
    expect(git(brabo, 'ls-files', 'apps/api')).toBe('');
    expect(existsSync(join(brabo, 'README.md'))).toBe(true);
  });

  it('conteúdo novo do irmão vence a cópia velha (a mutação sem manifesto reprova)', () => {
    writeFileSync(join(irmaos, 'brabo-web', 'web.txt'), 'novo');
    commit('web');
    montar();
    expect(readFileSync(join(brabo, 'apps/web/web.txt'), 'utf8')).toBe('novo');
  });

  it('node_modules aninhado (website/) nunca entra no índice: o ls-tree passava de 1 MB e o gerador dava ENOBUFS (AT-870)', () => {
    mkdirSync(join(brabo, 'website/node_modules/pkg'), { recursive: true });
    writeFileSync(join(brabo, 'website/node_modules/pkg/index.js'), 'x');
    montar();
    expect(git(brabo, 'ls-files', 'website')).toBe('');
    expect(git(brabo, 'ls-files', '--', 'website/node_modules/pkg')).toBe('');
  });

  describe('trava irmaos.lock (AT-780)', () => {
    it('sem BRABO_REF, usa o SHA da trava e não a ponta da dev', () => {
      writeFileSync(join(irmaos, 'brabo-web', 'web.txt'), 'travado');
      commit('web');
      trava();
      writeFileSync(join(irmaos, 'brabo-web', 'web.txt'), 'depois da trava');
      commit('web');
      const saida = montar({});
      expect(readFileSync(join(brabo, 'apps/web/web.txt'), 'utf8')).toBe('travado');
      expect(saida).toContain(`brabo-web@${git(join(irmaos, 'brabo-web'), 'rev-parse', 'HEAD~1').trim().slice(0, 12)} (trava)`);
    });

    it('BRABO_REF explícito vence a trava', () => {
      montar({ BRABO_REF: 'dev' });
      expect(readFileSync(join(brabo, 'apps/web/web.txt'), 'utf8')).toBe('depois da trava');
    });

    it('grava repo@sha40 de cada irmão para o Vínculos (A3), na trava e no BRABO_REF', () => {
      for (const env of [{}, { BRABO_REF: 'dev' }]) {
        montar(env);
        const l = readFileSync(join(brabo, '.git/irmaos-sha.lst'), 'utf8').trim().split('\n');
        expect(l).toHaveLength(REPOS.length);
        expect(l).toContain(`viralabs-dev/brabo-api@${head('api')}`);
      }
    });

    it('repo faltando na trava reprova', () => {
      trava((l) => l.filter((x) => !x.startsWith('brabo-qa ')));
      expect(falha({})).toContain("'brabo-qa' sem SHA");
    });

    it('SHA inválido, ausente no clone ou repo desconhecido reprova', () => {
      trava((l) => l.map((x) => (x.startsWith('brabo-ci ') ? 'brabo-ci zzz' : x)));
      expect(falha({})).toContain("'brabo-ci' sem SHA");
      trava((l) => l.map((x) => (x.startsWith('brabo-ci ') ? `brabo-ci ${'a'.repeat(40)}` : x)));
      expect(falha({})).toContain('ausente');
      trava((l) => [...l, `brabo-fantasma ${'a'.repeat(40)}`]);
      expect(falha({})).toContain('brabo-fantasma');
    });

    it('sem trava e sem BRABO_REF reprova', () => {
      git(brabo, 'rm', '-q', '-f', 'irmaos.lock');
      git(brabo, 'commit', '-q', '-m', 'sem trava', '--', 'irmaos.lock');
      expect(falha({})).toContain('irmaos.lock');
    });
  });
});
