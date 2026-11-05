import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { caminhoDoCatalogo, lerCatalogo, LOCALES_DA_API } from './openapi-por-locale.mjs';

// AT-745 (ADR 0260). Fica fora de `openapi-por-locale.spec.ts`, que o CI exclui até o api regenerar o catálogo.
describe('catálogos da referência da API moram no brabo', () => {
  it('lê docs/i18n/<locale>/ da raiz e ignora o catálogo da api', () => {
    const raiz = mkdtempSync(join(tmpdir(), 'cat-'));
    const w = (rel: string, cat: object) => {
      mkdirSync(join(raiz, rel, '..'), { recursive: true });
      writeFileSync(join(raiz, rel), JSON.stringify(cat));
    };
    w('docs/i18n/ru/openapi-textos.json', { dono: { fonte: 'a', traducao: 'б' } });
    w('apps/api/docs/i18n/ru/openapi-textos.json', { api: { fonte: 'a', traducao: 'в' } });
    w('apps/api/docs/i18n/zh-Hans/openapi-textos.json', { api: { fonte: 'a', traducao: 'в' } });
    expect(caminhoDoCatalogo(raiz, 'ru')).toBe(join(raiz, 'docs/i18n/ru/openapi-textos.json'));
    expect(Object.keys(lerCatalogo(raiz, 'ru'))).toEqual(['dono']);
    // mutação: só o catálogo do api existe -> vazio, o do api não é lido
    expect(lerCatalogo(raiz, 'zh-Hans')).toEqual({});
  });
  it('os 4 catálogos reais existem no brabo', () => {
    for (const l of LOCALES_DA_API) expect(Object.keys(lerCatalogo(join(__dirname, '../..'), l)).length, l).toBeGreaterThan(0);
  });
});
