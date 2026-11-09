/**
 * Barra lateral do site (AT-662, ADR 0253): porte de `website/sidebars.ts`.
 *
 *   construirNavegacao({ raiz, repo, rotulos }) -> Item[]
 *   listaPlana(itens) -> [{ slug, rotulo }]    -- ordem de leitura (anterior/próximo)
 *
 *   Item = { tipo: 'categoria', rotulo, colapsada, slug?, espera?, itens }   -- `slug` = página que a categoria abre; `espera` = tipos aceitos (grupo de topo, AT-854)
 *        | { tipo: 'pagina',    slug, rotulo? }                      -- sem `rotulo`, vale o da página
 *        | { tipo: 'rota',      slug, rotulo }                       -- página gerada fora do Markdown (a da API, A3)
 *        | { tipo: 'link',      rotulo, href }                       -- URL externa
 *
 * `slug` é o de `paginas.mjs` (`adr/index.md` -> `adr`). Os rótulos estão em
 * pt-BR; `rotulos` (mapa pt-BR -> texto do locale, de `lerRotulosDaBarra`) é
 * aplicado aqui, e o layout (A2) nunca traduz de novo.
 * Os ADRs agrupados por tema são DERIVADOS de `docs/adr/temas.yml`; parse que se
 * perdeu LANÇA, como o `sidebars.ts` fazia.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { CAMINHO_DAS_TRADUCOES, raizesExistentes } from './paginas.mjs';

export function adrsPorTema(raiz) {
  const dir = path.join(raiz, 'docs/adr');
  const yml = readFileSync(path.join(dir, 'temas.yml'), 'utf8');
  const temas = [...yml.matchAll(/^\s+- id: (\S+)\n\s+titulo: (.+)$/gm)].map((m) => ({ id: m[1], titulo: m[2].trim() }));
  const temaDe = new Map([...yml.matchAll(/^\s+"(\d{4})": (\S+)\s*$/gm)].map((m) => [m[1], m[2]]));
  const grupos = new Map([...temas.map((t) => [t.id, []]), ['', []]]);
  for (const arq of readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort()) {
    (grupos.get(temaDe.get(arq.slice(0, 4)) ?? '') ?? grupos.get('')).push(`adr/${arq.slice(0, -3)}`);
  }
  const semTema = grupos.get('');
  if (!temas.length || !temaDe.size || semTema.length) {
    throw new Error(`navegacao: o parse de docs/adr/temas.yml se perdeu (${temas.length} temas, ${temaDe.size} ADRs mapeados, sem tema: ${semTema.join(', ') || 'nenhum'}).`);
  }
  return temas.map((t) => ({ rotulo: t.titulo, itens: grupos.get(t.id) })).filter((c) => c.itens.length);
}

/** Rótulos da barra traduzidos (`current.json` do locale), como mapa pt-BR -> texto. */
export function lerRotulosDaBarra(raiz, locale) {
  const arq = path.join(raiz, CAMINHO_DAS_TRADUCOES(locale), 'current.json');
  const mapa = {};
  try {
    for (const [k, v] of Object.entries(JSON.parse(readFileSync(arq, 'utf8')))) {
      const m = /^sidebar\.docs\.(?:category|link)\.(.+)$/.exec(k);
      if (m) mapa[m[1]] = v.message;
    }
  } catch { /* locale sem catálogo: cai nos rótulos pt-BR */ }
  return mapa;
}

/**
 * Índice `business-rules` + uma página por `business-rules/<x>.md` de cada raiz; custo e autenticação primeiro (ordem histórica), o resto alfabético.
 * Área partida (AT-862, ADR 0287): `business-rules/<x>/parte-NN.md` existe, e o `<x>.md` é o índice dela. Devolve só os slugs de página
 * (`business-rules/<x>` e as partes), que é o que a ordem de leitura precisa; `itensDeRegras` monta a árvore.
 */
export function regrasPorArea(raiz, raizesDeDoc) {
  const nomes = new Set();
  const partes = new Map(); // <x> -> ['parte-01', ...]
  for (const rd of raizesExistentes(raiz, raizesDeDoc)) {
    try {
      for (const e of readdirSync(path.join(raiz, rd, 'business-rules'), { withFileTypes: true })) {
        if (e.isFile() && e.name.endsWith('.md')) nomes.add(e.name.slice(0, -3));
        else if (e.isDirectory()) {
          const ps = readdirSync(path.join(raiz, rd, 'business-rules', e.name)).filter((f) => /^parte-\d+\.md$/.test(f)).map((f) => f.slice(0, -3));
          if (ps.length) partes.set(e.name, [...new Set([...(partes.get(e.name) ?? []), ...ps])].sort());
        }
      }
    } catch { /* raiz sem regras */ }
  }
  const fixos = ['custo', 'autenticacao'];
  const resto = [...nomes].filter((n) => !fixos.includes(n)).sort();
  return [...fixos.filter((n) => nomes.has(n)), ...resto].map((n) => ({ nome: n, partes: partes.get(n) ?? [] }));
}

export function slugsDeRegras(raiz, raizesDeDoc) {
  return ['business-rules', ...regrasPorArea(raiz, raizesDeDoc).flatMap(({ nome, partes }) => [`business-rules/${nome}`, ...partes.map((p) => `business-rules/${nome}/${p}`)])];
}

/** Os itens do menu de "Regras de negócio": uma página por área, ou (partida) uma subcategoria recolhida, com o índice como link dela. */
export function itensDeRegras(raiz, raizesDeDoc) {
  return regrasPorArea(raiz, raizesDeDoc).map(({ nome, partes }) =>
    partes.length
      ? { tipo: 'categoria', colapsada: true, slug: `business-rules/${nome}`, itens: partes.map((p) => ({ tipo: 'pagina', slug: `business-rules/${nome}/${p}` })) }
      : { tipo: 'pagina', slug: `business-rules/${nome}` },
  );
}

/** As partes de `deploy/docs/runbook/<tema>.md` (AT-869, ADR 0287), alfabético; vazio enquanto o runbook do infra é um arquivo só. */
export function partesDoRunbook(raiz, raizesDeDoc) {
  const nomes = new Set();
  for (const rd of raizesExistentes(raiz, raizesDeDoc)) {
    try {
      for (const f of readdirSync(path.join(raiz, rd, 'runbook'))) if (f.endsWith('.md')) nomes.add(f.slice(0, -3));
    } catch { /* raiz sem runbook partido */ }
  }
  return [...nomes].sort().map((n) => `runbook/${n}`);
}

/** Uma página por `reference/workflows/<x>.md` de cada raiz (hoje só as do brabo-ci), alfabético. */
export function slugsDeWorkflows(raiz, raizesDeDoc) {
  const nomes = new Set();
  for (const rd of raizesExistentes(raiz, raizesDeDoc)) {
    try {
      for (const f of readdirSync(path.join(raiz, rd, 'reference/workflows'))) if (f.endsWith('.md')) nomes.add(f.slice(0, -3));
    } catch { /* raiz sem workflows */ }
  }
  return [...nomes].sort().map((n) => `reference/workflows/${n}`);
}

export function construirNavegacao({ raiz, repo, rotulos = {}, raizesDeDoc }) {
  const t = (r) => rotulos[r] ?? r;
  const cat = (rotulo, itens, extra = {}) => ({ tipo: 'categoria', rotulo: t(rotulo), colapsada: false, itens, ...extra });
  const pg = (slug, rotulo) => (rotulo ? { tipo: 'pagina', slug, rotulo: t(rotulo) } : { tipo: 'pagina', slug });
  const pgs = (...slugs) => slugs.map((s) => pg(s));
  const link = (rotulo, arq) => ({ tipo: 'link', rotulo: t(rotulo), href: `https://github.com/${repo}/blob/dev/${arq}` });
  // `espera` (AT-854): os tipos de página que o grupo de topo aceita; `tipos.mjs` reprova o resto.
  // runbook partido: categoria recolhida com o índice como link dela; inteiro: uma página só
  const partesRb = partesDoRunbook(raiz, raizesDeDoc);
  const runbook = partesRb.length ? [cat('Manual de operação', pgs(...partesRb), { slug: 'runbook', colapsada: true })] : pgs('runbook');
  const orquestrar = ['por-que-separar', 'o-mapa', 'como-cada-repo-e-consumido', 'vida-de-uma-mudanca', 'monte-o-seu', 'erros-que-ja-cometemos'].map((s) => `tutorials/orquestrar-repositorios/${s}`);
  return [
    cat('🚀 Comece aqui', pgs('', 'getting-started'), { espera: ['conceito', 'tutorial', 'guia', 'referencia'] }),
    cat('🎓 Tutoriais', [
      pg('tutorials/from-zero-to-deliverable'),
      cat('Orquestrar repositórios', pgs(...orquestrar), { slug: 'tutorials/orquestrar-repositorios', colapsada: true }),
      cat('Como o Brabo é construído', pgs(...['do-pedido-a-atividade', 'a-rodada', 'a-regra-vira-codigo', 'qualidade-e-o-teste-permanente', 'copie-o-metodo'].map((s) => `tutorials/como-o-brabo-e-construido/${s}`)), { slug: 'tutorials/como-o-brabo-e-construido', colapsada: true }),
    ], { espera: ['tutorial'] }),
    cat('🧭 Guias práticos', [
      ...pgs('how-to/desenvolver-o-brabo', 'how-to/usar-o-runner', 'how-to/token-do-github-packages'),
      ...runbook,
      ...pgs('tutorials/adotar', 'explanation/usar-em-outra-org', 'rodadas-manuais'),
      cat('Contribuir', [pg('contribuir/como-escrevemos', 'Como escrevemos'), link('Como contribuir', 'CONTRIBUTING.md'), link('Onde pedir ajuda', 'SUPPORT.md'), link('Reportar vulnerabilidade', 'SECURITY.md')]),
    ], { espera: ['guia'] }),
    cat('💡 Conceitos', [
      pg('intro', 'O que é o Brabo'),
      ...pgs('architecture', 'explanation/gates', 'explanation/modelo-de-time', 'explanation/regressivo-por-funcionalidade', 'e2e-portao/como-funciona', 'regressivo/como-funciona'),
      pg('capturas/como-funciona', 'Capturas da doc'),
      ...pgs('explanation/observability'),
      cat('Processo e esteira', pgs('explanation/painel-da-mudanca', 'explanation/politica-em-10-minutos', 'explanation/branching-policy', 'explanation/ordem-da-promocao', 'explanation/reutilizaveis-sem-chamador', 'explanation/cadeia-de-suprimentos-do-ci', 'explanation/release-do-produto', 'explanation/licoes-do-ci')),
      cat('Localização', pgs('explanation/localizacao', 'explanation/localizacao-en', 'explanation/localizacao-ru', 'explanation/localizacao-zh-hans'), { colapsada: true }),
      cat('Notas técnicas', pgs('explanation/tanstack-ai'), { colapsada: true }),
    ], { espera: ['conceito'] }),
    cat('📖 Referência', [
      pg('glossary'), pg('reference/componentes-da-doc', 'Componentes da doc'), pg('explanation/documentation-workflow'),
      pg('reference/configuration', 'Configuração'), pg('reference/events', 'Eventos'), pg('reference/permissions', 'Permissões'),
      pg('reference/artifacts', 'Artefatos'), pg('reference/git-providers', 'Provedores de git'), pg('reference/llm-providers', 'Provedores de LLM'),
      pg('reference/internal-api', 'API interna'), pg('reference/internal-open-questions-api', 'Perguntas em aberto da API interna'),
      pg('reference/scripts', 'Scripts e comandos'), pg('reference/rulesets', 'Rulesets do repositório'),
      pg('reference/codigos-de-violacao', 'Códigos de violação'), pg('reference/glossario-da-politica', 'Glossário da política'),
      cat('Workflows do brabo-ci', pgs(...slugsDeWorkflows(raiz, raizesDeDoc)), { colapsada: true }),
      pg('reference/paridade-de-traducao', 'Paridade de tradução'), pg('reference/brb', 'Registro BRB'),
      pg('security-surface'), pg('dependencias-e-imagens', 'Dependências e imagens do broker'), pg('reference/contratos-e-imagem', 'Contratos e imagem da api'),
      cat('Regras de negócio', itensDeRegras(raiz, raizesDeDoc), { slug: 'business-rules', colapsada: true }),
      { tipo: 'rota', slug: 'reference/api', rotulo: t('Referência da API') },
    ], { espera: ['referencia'] }),
    cat('🏛️ Decisões (ADR)', adrsPorTema(raiz).map((c) => ({ tipo: 'categoria', rotulo: c.rotulo, colapsada: true, itens: c.itens.map((s) => pg(s)) })), { slug: 'adr', colapsada: true, espera: ['decisao'] }),
    // sempre o ÚLTIMO grupo
    cat('🗂️ Histórico do projeto', [
      ...pgs('historico/linha-do-tempo', 'tutorials/interface-antes-e-depois-shadcn', 'explanation/historico-de-fases', 'explanation/historico-de-fases-parte-1', 'explanation/historico-de-fases-parte-2', 'explanation/historico-de-fases-parte-3', 'explanation/historico-de-fases-parte-4', 'explanation/fase-28-pasta-do-usuario', 'explanation/fase-29-instalacao-de-uma-linha', 'explanation/fase-30-runner-por-maquina', 'explanation/backlog'),
      cat('Validações e medições', pgs('explanation/primeiro-dogfooding', 'explanation/execucao-real-hello-world', 'explanation/achados-execucao-real', 'explanation/validacao-fase-12', 'explanation/validacao-real', 'explanation/aceite-providers', 'explanation/medicao-do-idioma', 'explanation/medicao-do-jev', 'explanation/auditoria-fluxo-vs-codigo', 'explanation/auditoria-visual-rodada-29'), { colapsada: true }),
    ], { colapsada: true, espera: ['historico'] }),
  ];
}

export function listaPlana(itens) {
  return itens.flatMap((i) => {
    if (i.tipo === 'categoria') return [...(i.slug != null ? [{ slug: i.slug, rotulo: i.rotulo }] : []), ...listaPlana(i.itens)];
    return i.tipo === 'pagina' || i.tipo === 'rota' ? [{ slug: i.slug, rotulo: i.rotulo }] : [];
  });
}
