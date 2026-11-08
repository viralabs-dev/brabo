import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { TETO_DE_TEXTO, indiceDoLocale, normalizar, tagDeBusca } from './busca.mjs';

const cliente = (() => {
  const ctx: any = {};
  ctx.globalThis = ctx;
  runInNewContext(readFileSync(new URL('./assets/busca.js', import.meta.url), 'utf8'), ctx);
  return ctx.BrabuBusca;
})();

const paginas: Record<string, { slug: string; titulo: string; texto: string }[]> = {
  'pt-BR': [{ slug: 'acao', titulo: 'Ação aprovada', texto: 'Fila de decisão do projeto' }, { slug: 'x', titulo: 'Outra', texto: 'nada' }],
  en: [{ slug: 'gates', titulo: 'Gates', texto: 'Merge on protected branches is manual' }],
  ru: [{ slug: 'ustanovka', titulo: 'Установка', texto: 'Запуск через установщик' }],
  'zh-Hans': [{ slug: 'anzhuang', titulo: '安装', texto: '通过安装脚本运行运行器' }],
};

describe('busca', () => {
  it.each([
    ['pt-BR', 'acao', 'acao'],
    ['pt-BR', 'DECISAO', 'acao'],
    ['en', 'protected', 'gates'],
    ['ru', 'УСТАНОВЩИК', 'ustanovka'],
    ['zh-Hans', '脚本', 'anzhuang'],
  ])('%s: "%s" acha a página certa', (loc, termo, slug) => {
    const idx = JSON.parse(indiceDoLocale(paginas[loc]).json);
    expect(cliente.buscar(idx, termo).map((p: any) => p.u)).toEqual([slug]);
  });

  it('termo ausente ou vazio não acha nada', () => {
    const idx = JSON.parse(indiceDoLocale(paginas.en).json);
    expect(cliente.buscar(idx, 'zzz')).toEqual([]);
    expect(cliente.buscar(idx, '  ')).toEqual([]);
  });

  it('corta o texto no teto e a normalização do cliente é a do gerador', () => {
    const { json } = indiceDoLocale([{ slug: 'g', titulo: 'T', texto: 'a'.repeat(TETO_DE_TEXTO * 2) }]);
    expect(JSON.parse(json)[0].x.length).toBe(TETO_DE_TEXTO);
    expect(cliente.normalizar('Ação  É')).toBe(normalizar('Ação  É'));
  });

  it('a tag de script aponta o índice do locale', () => {
    expect(tagDeBusca({ locale: 'ru', base: '../' })).toContain('data-indice="../assets/busca-ru.json"');
  });
});

describe('busca: títulos de seção e âncoras (AT-862)', () => {
  const pagina = {
    slug: 'reference/configuration',
    titulo: 'Configuração',
    texto: 'x'.repeat(TETO_DE_TEXTO * 2) + ' ENGINE_PUBLIC_URL',
    secoes: [{ id: 'api', texto: 'api' }, { id: 'env-ENGINE_PUBLIC_URL', texto: 'ENGINE_PUBLIC_URL' }, { id: 'configuracao', texto: 'Configuração' }],
  };
  const rn = { slug: 'business-rules/api/parte-09', titulo: 'API — parte 9', texto: 'x', secoes: [{ id: 'rn-497', texto: 'RN-497 — Um nome de regra' }] };
  const idx = JSON.parse(indiceDoLocale([pagina, rn]).json);

  it('acha a variável e a RN pelo nome, mesmo fora dos 4 000 caracteres, com o fragmento', () => {
    expect(cliente.buscar(idx, 'engine_public_url')).toMatchObject([{ u: 'reference/configuration', h: 'env-ENGINE_PUBLIC_URL' }]);
    expect(cliente.buscar(idx, 'RN-497')).toMatchObject([{ u: 'business-rules/api/parte-09', h: 'rn-497' }]);
  });

  it('seção com o mesmo título da página não duplica o resultado', () => {
    expect(idx.filter((i: any) => i.t === 'Configuração')).toHaveLength(1);
  });
});
