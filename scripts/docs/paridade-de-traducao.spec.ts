import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classificar, ehFonteTraduzivel, dadosDaFaixa, medirDocs, medirDoRepositorio, relatorio, traducaoDe } from './paridade-de-traducao.mjs';

/**
 * AT-550 (ADR 0216 itens 6–7). Cada reprovação é uma MUTAÇÃO de um caso certo:
 * a forma certa sai "em dia"/completa, a mutada não.
 */

const SHA = 'a'.repeat(40);
const pagina = (sha: string | null) => (sha ? `---\ntitle: x\ntraducao_de: ${sha}\n---\n# X\n` : '---\ntitle: x\n---\n# X\n');
const commits: Record<string, string> = { [SHA]: '2026-10-10T12:00:00Z' };
const commitDe = (s: string) => commits[s] ?? null;
const fonte = (data: string, suja = false) => ({ chars: 100, data, suja });

describe('classificar', () => {
  it('em dia: a fonte não mudou depois do traducao_de', () => {
    expect(classificar(pagina(SHA), fonte('2026-10-10T12:00:00Z'), commitDe).estado).toBe('em-dia');
  });
  it('mutação: fonte com commit mais novo → defasada', () => {
    expect(classificar(pagina(SHA), fonte('2026-10-11T00:00:00Z'), commitDe).estado).toBe('defasada');
  });
  it('mutação: fonte com mudança não commitada → defasada', () => {
    expect(classificar(pagina(SHA), fonte('2026-10-01T00:00:00Z', true), commitDe).estado).toBe('defasada');
  });
  it('mutação: SHA inexistente → defasada', () => {
    expect(classificar(pagina('b'.repeat(40)), fonte('2026-10-01T00:00:00Z'), commitDe).estado).toBe('defasada');
  });
  it('mutação: sem traducao_de → sem procedência', () => {
    expect(classificar(pagina(null), fonte('2026-10-01T00:00:00Z'), commitDe).estado).toBe('sem-procedencia');
    expect(traducaoDe('# sem frontmatter\ntraducao_de: ' + SHA)).toBeNull();
  });
});

describe('medirDocs', () => {
  const fontes = new Map([
    ['a.md', fonte('2026-10-01T00:00:00Z')],
    ['b.md', { chars: 300, data: '2026-10-01T00:00:00Z', suja: false }],
  ]);
  it('conta páginas, caracteres, ausentes e órfãs', () => {
    const r = medirDocs(fontes, { en: new Map([['a.md', pagina(SHA)], ['velha.md', pagina(SHA)]]) }, commitDe);
    expect(r.en).toMatchObject({ paginas: 2, traduzidas: 1, chars: 400, charsTraduzidos: 100, emDia: ['a.md'], ausentes: ['b.md'], orfas: ['velha.md'] });
    expect(r.ru.ausentes).toEqual(['a.md', 'b.md']);
    expect(JSON.parse(dadosDaFaixa(r)).en['a.md']).toEqual({ defasada: false, data: '2026-10-10' });
  });
  it('o relatório é determinístico e nomeia a defasada', () => {
    const f = new Map([['a.md', fonte('2026-10-12T00:00:00Z')]]);
    const r = medirDocs(f, { en: new Map([['a.md', pagina(SHA)]]) }, commitDe);
    const md = relatorio(r, '> aviso');
    expect(md).toBe(relatorio(r, '> aviso'));
    expect(md).not.toContain('## Interface');
    expect(md).not.toContain('## API');
    expect(md).toContain('- `a.md` (tradução de 2026-10-10)');
  });
});

describe('ehFonteTraduzivel (ADR 0260)', () => {
  it('página com idioma_original: en não tem o que traduzir', () => {
    expect(ehFonteTraduzivel('reference/x.md', '---\nidioma_original: en\n---\n# X\n')).toBe(false);
    // mutação: sem o campo (ou fora do frontmatter) continua traduzível
    expect(ehFonteTraduzivel('reference/x.md', '---\ntitle: x\n---\n# X\n')).toBe(true);
    expect(ehFonteTraduzivel('reference/x.md', '# X\nidioma_original: en\n')).toBe(true);
  });
});

describe('ehFonteTraduzivel (ADR 0219)', () => {
  it('reference/ entra na paridade', () => {
    expect(ehFonteTraduzivel('reference/configuration.md')).toBe(true);
    expect(ehFonteTraduzivel('reference/brb.md')).toBe(true);
    expect(ehFonteTraduzivel('adr/0219-x.md')).toBe(true);
  });
  it('o próprio relatório e o openapi.json ficam fora', () => {
    expect(ehFonteTraduzivel('reference/paridade-de-traducao.md')).toBe(false);
    expect(ehFonteTraduzivel('reference/openapi.json')).toBe(false);
    // mutação: o nome sozinho fora de reference/ não é exceção
    expect(ehFonteTraduzivel('explanation/paridade-de-traducao.md')).toBe(true);
  });
});

// AT-779 (ADR 0273): a paridade mede só a doc do brabo.
describe('medirDoRepositorio: só a doc do brabo', () => {
  function repo() {
    const dir = mkdtempSync(join(tmpdir(), 'paridade-brabo-'));
    const escrever = (rel: string, texto: string) => {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), texto);
    };
    const git = (...a: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: dir, encoding: 'utf8' });
    escrever('docs/a.md', '# A\n');
    escrever('docs/i18n/en/a.md', pagina(null));
    escrever('docs/.docmap.yml', 'rules: []\n');
    git('init', '-q');
    git('add', '-A');
    git('commit', '-qm', 'x');
    return { dir, escrever, git };
  }
  const medir = (dir: string) => medirDoRepositorio(dir, ['docs', 'apps/api/docs']).docs.en;

  it('tradução em i18n/ não é fonte', () => {
    const { dir } = repo();
    expect(medir(dir)).toMatchObject({ paginas: 1, traduzidas: 1, ausentes: [] });
  });
  it('mutação: arquivo do manifesto fora de HEAD (irmão) não é fonte; página nova fora do manifesto é', () => {
    const { dir, escrever, git } = repo();
    escrever('apps/api/docs/irma.md', '# irmã\n');
    escrever('docs/nova.md', '# nova\n');
    expect(medir(dir).paginas).toBe(3);
    writeFileSync(join(dir, '.git/layout-irmaos.lst'), 'apps/api/docs/irma.md\n');
    expect(medir(dir)).toMatchObject({ paginas: 2, ausentes: ['nova.md'] });
    // mutação: o mesmo caminho dentro de HEAD volta a contar
    git('add', '-A');
    git('commit', '-qm', 'y');
    expect(medir(dir).paginas).toBe(3);
  });
  it('mudar um arquivo de irmão não muda o relatório', () => {
    const { dir, escrever } = repo();
    escrever('apps/api/docs/irma.md', '# irmã\n');
    writeFileSync(join(dir, '.git/layout-irmaos.lst'), 'apps/api/docs/irma.md\n');
    const antes = relatorio(medirDoRepositorio(dir, ['docs', 'apps/api/docs']).docs, '> aviso');
    escrever('apps/api/docs/irma.md', '# irmã X\n');
    expect(relatorio(medirDoRepositorio(dir, ['docs', 'apps/api/docs']).docs, '> aviso')).toBe(antes);
  });
});
