import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

const sh = (cwd: string, ...a: string[]) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const script = resolve(__dirname, 'patch-dos-irmaos.sh');

it('o patch dos irmãos sai com conteúdo e aplica no repo dono com -p3', () => {
  const d = mkdtempSync(join(tmpdir(), 'irmaos-'));
  const brabo = join(d, 'brabo');
  const api = join(d, 'api');
  for (const r of [brabo, api]) { mkdirSync(r); sh(r, 'init', '-q'); sh(r, 'config', 'user.email', 'a@b'); sh(r, 'config', 'user.name', 'x'); }
  writeFileSync(join(brabo, 'meu.md'), 'a\n');
  sh(brabo, 'add', 'meu.md'); sh(brabo, 'commit', '-qm', 'base');
  // o layout: arquivo do irmão no índice, fora de HEAD
  mkdirSync(join(brabo, 'apps/api/docs'), { recursive: true });
  writeFileSync(join(brabo, 'apps/api/docs/p.md'), 'um\ndois\n');
  sh(brabo, 'add', '-A');
  mkdirSync(join(api, 'docs'));
  writeFileSync(join(api, 'docs/p.md'), 'um\ndois\n');
  sh(api, 'add', '-A'); sh(api, 'commit', '-qm', 'base');
  // o gerador mexe; MEUS > 0 e o reset do workflow viria depois
  writeFileSync(join(brabo, 'apps/api/docs/p.md'), 'um\ntres\n');
  writeFileSync(join(d, 'irmaos.lst'), 'apps/api/docs/p.md\n');
  execFileSync('bash', [script, join(d, 'irmaos.lst'), join(d, 'irmaos.patch')], { cwd: brabo });
  const patch = readFileSync(join(d, 'irmaos.patch'), 'utf8');
  expect(patch).toContain('+tres');
  sh(api, 'apply', '-p3', join(d, 'irmaos.patch'));
  expect(readFileSync(join(api, 'docs/p.md'), 'utf8')).toBe('um\ntres\n');
});
