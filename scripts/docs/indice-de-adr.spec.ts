import { describe, expect, it } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import { gerarIndiceDeAdr, statusDoAdr, tituloDoAdr } from './indice-de-adr.mjs';
// @ts-expect-error módulo .mjs sem tipos
import { conferirTemas } from './temas-de-adr.mjs';
import { TEXTOS } from './textos-gerados.mjs';

const temasYml = `temas:
  - id: git
    titulo: Git
    descricao: Contrato do git.
    i18n:
      en: {titulo: "Git (en)", descricao: "Git contract."}
  - id: web
    titulo: Web
    descricao: Telas.
adrs:
  "0001": git
  "0002": web
  "0003": git
`;
const adrs = [
  { arquivo: '0001-a.md', titulo: 'Contrato | do git', status: 'aceito' },
  { arquivo: '0002-b.md', titulo: 'Telas', status: 'proposto' },
  { arquivo: '0003-c.md', titulo: 'Retry', status: 'aceito' },
];

describe('status e título do ADR', () => {
  it.each([
    ['# ADR 0001 — x\n\n## Status\n\n**Accepted.** 2026-10-01\n', 'aceito'],
    ['# ADR 0002 — x\n\n## Status\n\nProposto. aguardando\n', 'proposto'],
    ['# ADR 0003 — x\n\n- **Status:** proposto (08/11/2026)\n', 'proposto'],
    ['# ADR 0004 — x\n\n## Status\n\nSuperseded by ADR 0009\n', 'substituido'],
    ['# ADR 0005 — x\n\n## Contexto\n\ntexto\n', 'aceito'],
  ])('%j -> %s', (texto, esperado) => {
    expect(statusDoAdr(texto)).toBe(esperado);
  });

  it('título sem o prefixo "ADR NNNN —"', () => {
    expect(tituloDoAdr('---\nx: y\n---\n# ADR 0287 — O índice é gerado\n\ncorpo')).toBe('O índice é gerado');
  });
});

describe('índice de ADR gerado', () => {
  const bloco: string = gerarIndiceDeAdr({ temasYml, adrs, T: TEXTOS['pt-BR'] });

  it('uma seção por tema, na ordem do temas.yml, com número, título e status; barra escapada', () => {
    expect(bloco).toContain('## Git {#tema-git}\n\nContrato do git.\n\n| # | decisão | status |\n|---|---|---|\n| [0001](0001-a.md) | Contrato \\| do git | aceito |\n| [0003](0003-c.md) | Retry | aceito |');
    expect(bloco.indexOf('{#tema-git}')).toBeLessThan(bloco.indexOf('{#tema-web}'));
    expect(bloco).toContain('| [0002](0002-b.md) | Telas | proposto |');
  });

  it('os seletores de filtro nascem escondidos (sem JS valem os links de tema) e só listam o status que existe', () => {
    expect(bloco).toContain('<div class="adr-filtro" data-adr-filtro hidden>');
    expect(bloco).toContain('[Git](#tema-git) · [Web](#tema-web)');
    expect(bloco).toContain('<option value="proposto">proposto</option>');
    expect(bloco).not.toContain('substituído');
  });

  it('o tema e as colunas saem no idioma do locale (i18n do tema, com queda para o pt-BR)', () => {
    const en: string = gerarIndiceDeAdr({ temasYml, adrs, T: TEXTOS.en, locale: 'en' });
    expect(en).toContain('## Git (en) {#tema-git}');
    expect(en).toContain('## Web {#tema-web}');
    expect(en).toContain('| # | decision | status |');
  });

  it('o índice gerado passa no conferirTemas (a ordem, a seção e a linha certas)', () => {
    const r = conferirTemas({ temasYml, arquivosAdr: adrs.map((a) => a.arquivo), indice: bloco });
    expect(r.cego).toBeNull();
    expect(r.problemas).toEqual([]);
  });

  it('mutação: ADR no tema errado no índice reprova', () => {
    const errado = bloco.replace('| [0003](0003-c.md) | Retry | aceito |\n', '').replace('| [0002](0002-b.md) | Telas | proposto |', '| [0002](0002-b.md) | Telas | proposto |\n| [0003](0003-c.md) | Retry | aceito |');
    const r = conferirTemas({ temasYml, arquivosAdr: adrs.map((a) => a.arquivo), indice: errado });
    expect(r.problemas.some((p: any) => p.regra === 'LINHA')).toBe(true);
  });
});
