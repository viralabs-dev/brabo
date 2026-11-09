import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// A pré-checagem do token do GitHub Packages (AT-849) do `--source=local`.
// `conferir_npmrc` roda DE VERDADE: o script é carregado com `source` (menos a
// chamada de `main`) e a função é invocada por `bash`, no molde de
// `install-fechamento.spec.ts`. Nada aqui baixa ou constrói coisa alguma.

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const texto = fs.readFileSync(path.join(RAIZ, 'install.sh'), 'utf8');
const corpo = texto.replace(/\nmain\s+"\$@"\s*$/, '\n');
if (corpo === texto) throw new Error('não achei a chamada de main para recortar de install.sh');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brabo-install-npmrc-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
const carregavel = path.join(tmp, 'install-sem-main.sh');
fs.writeFileSync(carregavel, corpo);

const SEGREDO = 'ghp_SEGREDO_QUE_NAO_PODE_APARECER';

function conferir(conteudo: string | null) {
  const npmrc = path.join(tmp, `npmrc-${Math.random().toString(36).slice(2)}`);
  if (conteudo !== null) fs.writeFileSync(npmrc, conteudo);
  const r = spawnSync('bash', ['-c', 'source "$BRABO_ALVO"\nconferir_npmrc'], {
    env: { ...process.env, NO_COLOR: '1', NPMRC: npmrc, BRABO_ALVO: carregavel },
    encoding: 'utf8',
  });
  return { codigo: r.status, saida: `${r.stdout}${r.stderr}` };
}

describe('conferir_npmrc (--source=local)', () => {
  it('recusa sem arquivo e ensina o PAT read:packages', () => {
    const r = conferir(null);
    expect(r.codigo).toBe(1);
    expect(r.saida).toContain('read:packages');
    expect(r.saida).toContain('token-do-github-packages');
  });

  it('recusa arquivo sem a linha do registry e não imprime o outro token', () => {
    const r = conferir(`//registry.npmjs.org/:_authToken=${SEGREDO}\n`);
    expect(r.codigo).toBe(1);
    expect(r.saida).not.toContain(SEGREDO);
  });

  it('recusa a linha com token vazio', () => {
    expect(conferir('//npm.pkg.github.com/:_authToken=\n').codigo).toBe(1);
  });

  it('segue com a linha válida e não imprime o token', () => {
    const r = conferir(`//npm.pkg.github.com/:_authToken=${SEGREDO}\n`);
    expect(r.codigo).toBe(0);
    expect(r.saida).not.toContain(SEGREDO);
  });
});
