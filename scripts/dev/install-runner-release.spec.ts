import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// AT-704: o binário do runner vem da Release do `viralabs-dev/brabo-runner`, conferido contra o
// `checksums.txt` ASSINADO de lá (identidade `build-runner-binaries.yml`), na tag que o
// `componentes.json` fixa. Aqui o shell roda de verdade, com `curl` e `cosign` de mentira no PATH.
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const instalador = fs.readFileSync(path.join(RAIZ, 'install.sh'), 'utf8');
const tmpRaiz = fs.mkdtempSync(path.join(os.tmpdir(), 'brabo-runner-rel-'));
afterAll(() => fs.rmSync(tmpRaiz, { recursive: true, force: true }));

const carregavel = path.join(tmpRaiz, 'install-sem-main.sh');
fs.writeFileSync(carregavel, instalador.replace(/\nmain\s+"\$@"\s*$/, '\n'));

const sha = (t: string) => createHash('sha256').update(t).digest('hex');

function rodar(opcoes: { binario: string; hashNoManifesto: string; cosignOk: boolean }) {
  const dir = fs.mkdtempSync(path.join(tmpRaiz, 'caso-'));
  const bin = path.join(dir, 'bin');
  const tmp = path.join(dir, 'tmp');
  const home = path.join(dir, 'home');
  fs.mkdirSync(bin);
  fs.mkdirSync(tmp);
  fs.mkdirSync(home);
  const falso = (nome: string, corpo: string, onde = bin) => {
    fs.writeFileSync(path.join(onde, nome), corpo, { mode: 0o755 });
  };
  const servido: Record<string, string> = {
    'brabo-runner-linux-x64': opcoes.binario,
    'checksums.txt': `${opcoes.hashNoManifesto}  brabo-runner-linux-x64\n`,
    'checksums.txt.bundle': '{}',
  };
  fs.writeFileSync(path.join(dir, 'servido.json'), JSON.stringify(servido));
  falso(
    'curl',
    `#!/bin/sh
while [ $# -gt 0 ]; do case "$1" in -o) o="$2"; shift 2;; -*) shift;; *) u="$1"; shift;; esac; done
echo "$u" >> '${dir}/urls.txt'
node -e 'const s=require(process.argv[1]);const n=process.argv[2].split("/").pop();if(!(n in s))process.exit(22);require("fs").writeFileSync(process.argv[3],s[n])' '${dir}/servido.json' "$u" "$o"
`,
  );
  falso('cosign', `#!/bin/sh\necho "$*" >> '${dir}/cosign.txt'\nexit ${opcoes.cosignOk ? 0 : 1}\n`, tmp);
  const r = spawnSync('bash', ['-c', `source '${carregavel}'; exigir_ferramenta_de_hash; instalar_o_runner linux-amd64 '${tmp}'; echo SAIU=$?`], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}:${process.env.PATH ?? ''}`, HOME: home },
  });
  const ler = (f: string) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : '');
  return { ...r, urls: ler('urls.txt'), cosign: ler('cosign.txt'), instalado: fs.existsSync(path.join(home, '.local/bin/brabo-runner')) };
}

// a tag sobe com o bot (AT-796): o spec lê a que o componentes.json fixa, sem repetir o literal
const tagDoRunner = JSON.parse(fs.readFileSync(path.join(RAIZ, 'componentes.json'), 'utf8')).runner.tag;

describe('install.sh — o runner vem do brabo-runner', () => {
  it('a tag do instalador é a que o componentes.json fixa', () => {
    const c = JSON.parse(fs.readFileSync(path.join(RAIZ, 'componentes.json'), 'utf8'));
    expect(c.runner.repo).toBe('viralabs-dev/brabo-runner');
    expect(instalador).toContain(`RUNNER_REPO='${c.runner.repo}'`);
    expect(instalador).toContain(`RUNNER_TAG='${c.runner.tag}'`);
  });

  it('caminho feliz: baixa do brabo-runner, verifica a identidade do workflow dele e instala', () => {
    const r = rodar({ binario: 'binario', hashNoManifesto: sha('binario'), cosignOk: true });
    expect(r.stdout).toContain('binário do runner verificado');
    expect(r.instalado).toBe(true);
    expect(r.urls).toContain(`https://github.com/viralabs-dev/brabo-runner/releases/download/${tagDoRunner}/brabo-runner-linux-x64`);
    expect(r.urls).not.toContain('viralabs-dev/brabo/releases');
    expect(r.cosign).toContain('viralabs-dev/brabo-runner/\\.github/workflows/build-runner-binaries\\.yml@');
  });

  it('hash divergente recusa, e não instala', () => {
    const r = rodar({ binario: 'binario', hashNoManifesto: sha('outro'), cosignOk: true });
    expect(r.stdout).not.toContain('SAIU=0');
    expect(r.stderr).toContain('NÃO bate com o manifesto assinado');
    expect(r.instalado).toBe(false);
  });

  it('assinatura que não confere recusa com frase própria (não é hash)', () => {
    const r = rodar({ binario: 'binario', hashNoManifesto: sha('binario'), cosignOk: false });
    expect(r.stderr).toContain('assinatura do checksums.txt do runner NÃO confere');
    expect(r.stderr).not.toContain('NÃO bate com o manifesto');
    expect(r.instalado).toBe(false);
  });
});
