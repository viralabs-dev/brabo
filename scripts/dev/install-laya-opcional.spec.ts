import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// O Laya é OPCIONAL no manifesto (`images.json`): release sem o alvo `laya` não
// oferece e não recusa. A v2.3.0 saiu com o instalador morrendo em silêncio logo
// depois do `broker`: sem a entrada, o `grep` do repositório/digest saía 1 e o
// `set -euo pipefail` (que o `source` liga) derrubava o script. Aqui a função
// roda de verdade, com o mesmo `set`, contra um manifesto com e sem o Laya.

const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../install.sh');
const tmpRaiz = fs.mkdtempSync(path.join(os.tmpdir(), 'install-laya-'));
afterAll(() => fs.rmSync(tmpRaiz, { recursive: true, force: true }));

const texto = fs.readFileSync(SCRIPT, 'utf8');
const corpo = texto.replace(/\nmain\s+"\$@"\s*$/, '\n');
if (corpo === texto) throw new Error('não achei a chamada de main para recortar de install.sh');
const carregavel = path.join(tmpRaiz, 'install-sem-main.sh');
fs.writeFileSync(carregavel, corpo);

const imagem = (alvo: string) => ({
  alvo,
  repositorio: `ghcr.io/viralabs-dev/brabo-${alvo}`,
  digest: `sha256:${alvo.padEnd(64, '0').slice(0, 64)}`,
  tags: ['2.3.0'],
});

function resolver(alvos: string[]) {
  const manifesto = path.join(tmpRaiz, `images-${alvos.length}.json`);
  // indentado, como o da Release: a função compacta antes de procurar
  fs.writeFileSync(manifesto, JSON.stringify({ versao: '2.3.0', commit: 'abc', imagens: alvos.map(imagem) }, null, 2));
  const tmp = fs.mkdtempSync(path.join(tmpRaiz, 'r-'));
  return spawnSync(
    'bash',
    [
      '-c',
      'source "$BRABO_ALVO"\nbaixar_ou_recusar() { cp "$BRABO_MANIFESTO" "$2"; }\nresolver_imagens_do_ghcr "$BRABO_TMP"\necho "LAYA=[$BRABO_LAYA_IMAGE]"',
    ],
    { env: { ...process.env, NO_COLOR: '1', BRABO_ALVO: carregavel, BRABO_MANIFESTO: manifesto, BRABO_TMP: tmp }, encoding: 'utf8' },
  );
}

describe('install.sh: o Laya é opcional no manifesto', () => {
  it('release SEM o alvo laya: segue, sai 0 e não oferece o Laya', () => {
    const r = resolver(['api', 'engine', 'web', 'broker', 'backup']);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toContain('LAYA=[]');
  });

  it('release COM o alvo laya: devolve repositorio@digest', () => {
    const r = resolver(['api', 'engine', 'web', 'broker', 'backup', 'laya']);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toContain(`LAYA=[ghcr.io/viralabs-dev/brabo-laya@${imagem('laya').digest}]`);
  });
});
