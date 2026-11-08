import { describe, expect, it } from 'vitest';
import { compararPins, subirPins, type Lido, type Release } from './pins-dos-componentes.ts';

const TEXTO = `{
  "infra": { "repo": "o/brabo-infra", "ref": "v1.0.0" },
  "runner": { "repo": "o/brabo-runner", "tag": "v1.0.0" },
  "imagens": {
    "web": { "repo": "o/brabo-web", "tag": "v1.0.0", "imagem": "ghcr.io/o/brabo-web" },
    "backup": { "repo": "o/brabo-infra", "tag": "v1.0.0", "imagem": "ghcr.io/o/brabo-backup" }
  }
}
`;
const INSTALL = "A=1\nRUNNER_TAG='v1.0.0'\nB=2\n";
const img = (tag: string): Release => ({ tag, assets: ['imagem.json'] });
const run = (tag: string): Release => ({ tag, assets: ['checksums.txt', 'checksums.txt.bundle', 'x'] });
const emDia: Lido = {
  latest: { 'o/brabo-infra': img('v1.0.0'), 'o/brabo-runner': run('v1.0.0'), 'o/brabo-web': img('v1.0.0') },
  daPin: {
    'o/brabo-infra@v1.0.0': img('v1.0.0'), 'o/brabo-runner@v1.0.0': run('v1.0.0'), 'o/brabo-web@v1.0.0': img('v1.0.0'),
  },
};
const c = JSON.parse(TEXTO);

describe('compararPins', () => {
  it('em dia', () => expect(compararPins(c, INSTALL, emDia)).toEqual([]));
  it('atrás da Latest', () => {
    const e = compararPins(c, INSTALL, { ...emDia, latest: { ...emDia.latest, 'o/brabo-web': img('v1.0.1') } });
    expect(e).toEqual([expect.stringContaining('web: a pin v1.0.0 está atrás da Latest v1.0.1')]);
  });
  it('sem Release final (inexistente, rascunho)', () => {
    expect(compararPins(c, INSTALL, { ...emDia, daPin: { ...emDia.daPin, 'o/brabo-web@v1.0.0': null } })[0]).toContain('web: v1.0.0 não tem Release final');
    expect(compararPins(c, INSTALL, { ...emDia, daPin: { ...emDia.daPin, 'o/brabo-runner@v1.0.0': { ...run('v1.0.0'), draft: true } } })[0]).toContain('runner');
  });
  it('falta o asset', () => {
    const e = compararPins(c, INSTALL, { ...emDia, daPin: { ...emDia.daPin, 'o/brabo-runner@v1.0.0': { tag: 'v1.0.0', assets: ['checksums.txt'] } } });
    expect(e[0]).toContain('checksums.txt.bundle');
  });
  it('backup diverge do infra', () => {
    const d = JSON.parse(TEXTO.replace('"ref": "v1.0.0"', '"ref": "v1.0.1"'));
    expect(compararPins(d, INSTALL, emDia).some((x) => x.includes('infra.ref'))).toBe(true);
  });
  it('RUNNER_TAG diverge', () => {
    expect(compararPins(c, "RUNNER_TAG='v0.9.0'\n", emDia)[0]).toContain('RUNNER_TAG');
  });
});

describe('subirPins', () => {
  it('sobe só a tag da linha, infra e backup juntos, e o RUNNER_TAG', () => {
    const latest = { 'o/brabo-infra': img('v1.1.0'), 'o/brabo-runner': run('v1.1.1'), 'o/brabo-web': img('v1.2.1') };
    const r = subirPins(TEXTO, INSTALL, latest);
    expect(r.json).toBe(TEXTO.replaceAll('v1.0.0', 'v1.1.0').replace(/(brabo-runner", "tag": ")v1.1.0/, '$1v1.1.1').replace(/(brabo-web", "tag": ")v1.1.0/, '$1v1.2.1'));
    expect(r.install).toBe("A=1\nRUNNER_TAG='v1.1.1'\nB=2\n");
    expect(r.subidas).toHaveLength(4);
  });
  it('nunca desce e ignora Latest sem o asset', () => {
    const r = subirPins(TEXTO.replace('"tag": "v1.0.0", "imagem": "ghcr.io/o/brabo-web"', '"tag": "v2.0.0", "imagem": "ghcr.io/o/brabo-web"'), INSTALL, {
      'o/brabo-web': img('v1.9.0'), 'o/brabo-runner': { tag: 'v1.1.0', assets: ['checksums.txt'] },
    });
    expect(r.subidas).toEqual([]);
    expect(r.install).toBe(INSTALL);
  });
});
