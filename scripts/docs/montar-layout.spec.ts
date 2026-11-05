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
const montar = () =>
  execFileSync('bash', [join(brabo, 'scripts/docs/montar-layout.sh')], {
    cwd: brabo,
    env: { ...process.env, BRABO_IRMAOS: irmaos, BRABO_REF: 'dev' },
    encoding: 'utf8',
  });

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
});
