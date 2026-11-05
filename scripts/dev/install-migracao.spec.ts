import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// AT-738 (ADR 0256): a migração do instalador para quem JÁ tem o Brabo. As
// funções rodam de verdade — o `install.sh` carregado por `source`, menos a
// chamada de `main` (o molde de install-llm.spec.ts) —, com `docker`, `curl` e a
// prova de restauração DE MENTIRA no PATH: cada uma grava o que recebeu (argv e
// o ambiente que importa), e o teste lê o registro. HOME e XDG_STATE_HOME são
// temporários: nenhum caso escreve no marcador de quem roda a suíte.

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(RAIZ, 'install.sh');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brabo-install-migracao-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

const fonte = () => fs.readFileSync(SCRIPT, 'utf8');

function carregavel(): string {
  const texto = fonte();
  const corpo = texto.replace(/\nmain\s+"\$@"\s*$/, '\n');
  if (corpo === texto) throw new Error('não achei a chamada de main para recortar de install.sh');
  const caminho = path.join(tmp, 'install-sem-main.sh');
  fs.writeFileSync(caminho, corpo);
  return caminho;
}

const IMAGENS = `BRABO_API_IMAGE=ghcr.io/viralabs-dev/brabo-api@sha256:${'a'.repeat(64)}
BRABO_ENGINE_IMAGE=ghcr.io/viralabs-dev/brabo-engine@sha256:${'b'.repeat(64)}
BRABO_WEB_IMAGE=ghcr.io/viralabs-dev/brabo-web@sha256:${'c'.repeat(64)}
BRABO_BACKUP_IMAGE=ghcr.io/viralabs-dev/brabo-backup@sha256:${'d'.repeat(64)}
BRABO_BROKER_IMAGE=ghcr.io/viralabs-dev/brabo-broker@sha256:${'e'.repeat(64)}`;

/**
 * Um caso: pasta própria, `docker`/`curl` de mentira que gravam cada chamada
 * (argv + o ambiente do backup) em `chamadas.txt`. `dockerFalha` faz o `docker`
 * sair 1 quando o argv contém o trecho; `donoDoVolume` é o que o `stat` responde.
 */
function caso(opcoes: { dockerFalha?: string; donoDoVolume?: string; curlCodigo?: string } = {}) {
  const dir = fs.mkdtempSync(path.join(tmp, 'caso-'));
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.mkdirSync(path.join(dir, 'home'));
  const registro = path.join(dir, 'chamadas.txt');
  const gravar = `printf '%s | USER=%s DIR=%s IMG=%s BACKUP_DIR=%s\\n' "$*" "\${BRABO_BACKUP_USER:-}" "\${BRABO_BACKUP_HOST_DIR:-}" "\${BRABO_BACKUP_IMAGE:-}" "\${BACKUP_DIR:-}" >> '${registro}'`;
  fs.writeFileSync(
    path.join(bin, 'docker'),
    `#!/usr/bin/env bash
${gravar}
${opcoes.dockerFalha ? `case "$*" in *'${opcoes.dockerFalha}'*) exit 1 ;; esac` : ''}
case "$*" in *' stat '*) printf '%s\\n' '${opcoes.donoDoVolume ?? ''}' ;; esac
exit 0
`,
    { mode: 0o755 },
  );
  fs.writeFileSync(
    path.join(bin, 'curl'),
    `#!/usr/bin/env bash
printf '%s\\n' "$*" >> '${registro}'
printf '%s' '${opcoes.curlCodigo ?? '200'}'
[ '${opcoes.curlCodigo ?? '200'}' = 200 ] || exit 22
`,
    { mode: 0o755 },
  );
  const prova = path.join(dir, 'prova.sh');
  fs.writeFileSync(prova, `#!/usr/bin/env bash\n${gravar.replace('"$*"', "'PROVA'")}\nexit 0\n`);

  const rodar = (corpo: string, entrada = '') => {
    const r = spawnSync('bash', ['-c', `source "$BRABO_ALVO"\ncd '${dir}'\n${IMAGENS.replace(/\n/g, '; ')}\n${corpo}`], {
      encoding: 'utf8',
      input: entrada,
      env: {
        PATH: `${bin}:${process.env.PATH ?? ''}`,
        HOME: path.join(dir, 'home'),
        XDG_STATE_HOME: path.join(dir, 'state'),
        NO_COLOR: '1',
        BRABO_ALVO: carregavel(),
      },
    });
    const chamadas = fs.existsSync(registro) ? fs.readFileSync(registro, 'utf8').trim().split('\n') : [];
    return { saida: (r.stdout ?? '') + (r.stderr ?? ''), stderr: r.stderr ?? '', codigo: r.status ?? -1, chamadas };
  };
  return { dir, prova, rodar };
}

const id = (flag: string) => spawnSync('id', [flag], { encoding: 'utf8' }).stdout.trim();

// ---------------------------------------------------------------------------

describe('achado 9 — os segredos que cifram dado restaurado e a configuração da pessoa voltam do .env anterior', () => {
  const ANTERIOR = `# .env da instalação anterior
CREDENTIALS_MASTER_KEY=chave-mestra-antiga
CREDENTIALS_MASTER_KEY_PREVIOUS=chave-da-rotacao
AUTH_JWT_SECRET=jwt-antigo
AUTH_JWT_SECRET_PREVIOUS=jwt-mais-antigo
BRABO_SERVICE_TOKEN_PREVIOUS=token-antigo
ANAMNESE_ENABLED=false
BRABO_BIND=127.0.0.1
ANAMNESE_ENABLED=true
COMPOSE_PROFILES=container-broker
OLLAMA_PORT=11435
BRABO_API_IMAGE=brabo-api:prod
`;

  const gerar = (comAnterior: boolean) => {
    const c = caso();
    const anterior = path.join(c.dir, 'env-anterior');
    if (comAnterior) fs.writeFileSync(anterior, ANTERIOR);
    const novo = path.join(c.dir, '.env');
    const r = c.rodar(`BASE_DE_PROJETOS=/base
gerar_segredos '${anterior}'
escrever_env '${novo}'
preservar_do_env_anterior '${anterior}' '${novo}'
printf 'PRESERVADAS=[%s] CHAVE=%s\\n' "$PRESERVADAS_DO_ENV" "$ORIGEM_DA_CHAVE_MESTRA"`);
    expect(r.codigo, r.saida).toBe(0);
    const linhas = fs.readFileSync(novo, 'utf8').split('\n').filter((l) => /^[A-Z_]+=/.test(l));
    const valor = (k: string) => linhas.filter((l) => l.startsWith(`${k}=`)).map((l) => l.slice(k.length + 1));
    return { r, linhas, valor };
  };

  it('a chave mestra é a ANTERIOR, e a anterior da rotação também volta', () => {
    const { r, valor } = gerar(true);
    expect(valor('CREDENTIALS_MASTER_KEY')).toEqual(['chave-mestra-antiga']);
    expect(valor('CREDENTIALS_MASTER_KEY_PREVIOUS')).toEqual(['chave-da-rotacao']);
    expect(r.saida).toContain('CHAVE=anterior');
  });

  it('a configuração que o .env novo não declara volta, com o ÚLTIMO valor e uma vez só', () => {
    const { valor, r } = gerar(true);
    expect(valor('ANAMNESE_ENABLED')).toEqual(['true']);
    expect(valor('BRABO_BIND')).toEqual(['127.0.0.1']);
    expect(r.saida).toMatch(/PRESERVADAS=\[[^\]]*ANAMNESE_ENABLED/);
    // O nome é dito, o valor nunca.
    expect(r.saida).not.toContain('chave-da-rotacao');
  });

  it('o que o .env novo declara vence, e os segredos efêmeros nascem NOVOS', () => {
    const { valor } = gerar(true);
    expect(valor('BRABO_API_IMAGE')).toEqual([`ghcr.io/viralabs-dev/brabo-api@sha256:${'a'.repeat(64)}`]);
    expect(valor('AUTH_JWT_SECRET')).toHaveLength(1);
    expect(valor('AUTH_JWT_SECRET')[0]).not.toBe('jwt-antigo');
  });

  it('o que o instalador decide agora não volta calado (profiles, Ollama, _PREVIOUS de segredo efêmero)', () => {
    const { valor } = gerar(true);
    expect(valor('COMPOSE_PROFILES')).toEqual([]);
    expect(valor('OLLAMA_PORT')).toEqual([]);
    expect(valor('AUTH_JWT_SECRET_PREVIOUS')).toEqual([]);
    expect(valor('BRABO_SERVICE_TOKEN_PREVIOUS')).toEqual([]);
  });

  it('sem .env anterior: chave mestra gerada e nada preservado', () => {
    const { valor, r } = gerar(false);
    expect(valor('CREDENTIALS_MASTER_KEY')[0]).toMatch(/^[A-Za-z0-9+/]{43}=$/);
    expect(r.saida).toContain('PRESERVADAS=[] CHAVE=gerada');
  });

  it('main lê a cópia do .env anterior ANTES de sobrescrevê-lo, e preserva DEPOIS de escrever', () => {
    const main = fonte().slice(fonte().indexOf('\nmain() {'));
    const copia = main.indexOf('cp "$env_arquivo" "$env_anterior"');
    const segredos = main.indexOf('gerar_segredos "$env_anterior"');
    const escreve = main.indexOf('escrever_env "$env_arquivo"');
    const preserva = main.indexOf('preservar_do_env_anterior "$env_anterior" "$env_arquivo"');
    expect(copia).toBeGreaterThan(0);
    expect(segredos).toBeGreaterThan(copia);
    expect(escreve).toBeGreaterThan(segredos);
    expect(preserva).toBeGreaterThan(escreve);
  });
});

describe('achados 1, 3, 9b e 12 — backup, prova e deleção rodam com o ambiente da migração', () => {
  const migrar = (resposta: string, opcoes: Parameters<typeof caso>[0] = {}) => {
    const c = caso(opcoes);
    const destino = path.join(c.dir, 'brabo-backup-x');
    const r = c.rodar(
      `umask 0002
materializar_os_arquivos_da_instalacao() { :; }
COMPOSE_DE_INSTALACAO=/compose.yml; PROVA_DE_RESTAURACAO='${c.prova}'
migrar_instalacao_anterior '${destino}'
printf 'MIGRAR_DE=[%s] ETAPAS=[%s]\\n' "$MIGRAR_DE" "$ETAPAS_PENDENTES"`,
      `${resposta}\n`,
    );
    return { ...r, destino };
  };

  it('as três etapas recebem o uid de quem roda, o MESMO destino e a imagem de backup DESTA versão', () => {
    const r = migrar('s');
    expect(r.codigo, r.saida).toBe(0);
    const backup = r.chamadas.find((l) => l.includes('brabo-backup |'));
    const prova = r.chamadas.find((l) => l.startsWith('PROVA'));
    const delecao = r.chamadas.find((l) => l.includes('down -v'));
    for (const chamada of [backup, prova, delecao]) {
      expect(chamada).toContain(`USER=${id('-u')}:${id('-g')}`);
      expect(chamada).toContain(`DIR=${r.destino}`);
      expect(chamada).toContain(`IMG=ghcr.io/viralabs-dev/brabo-backup@sha256:${'d'.repeat(64)}`);
      expect(chamada).toContain('BACKUP_DIR=/backups');
    }
    // A pasta vai pelo BRABO_BACKUP_HOST_DIR, e nunca por um `-v` a mais.
    expect(backup).not.toContain(' -v ');
  });

  it('a ordem: backup, prova, e só então o down -v', () => {
    const r = migrar('s');
    const pos = (t: string) => r.chamadas.findIndex((l) => l.includes(t));
    expect(pos('brabo-backup |')).toBeGreaterThanOrEqual(0);
    expect(pos('PROVA')).toBeGreaterThan(pos('brabo-backup |'));
    expect(pos('down -v')).toBeGreaterThan(pos('PROVA'));
  });

  it('a pasta de backup nasce 0755 DECLARADO, não pelo umask de quem roda', () => {
    const r = migrar('s');
    expect((fs.statSync(r.destino).mode & 0o777).toString(8)).toBe('755');
  });

  it('"s" deixa a restauração INTEIRA pendente; "z" não deixa nenhuma', () => {
    expect(migrar('s').saida).toMatch(/ETAPAS=\[banco git grafo artefatos\]/);
    expect(migrar('z').saida).toContain('MIGRAR_DE=[] ETAPAS=[]');
  });

  it('backup que falha recusa sem apagar nada', () => {
    const r = migrar('s', { dockerFalha: 'brabo-backup' });
    expect(r.codigo).toBe(1);
    expect(r.saida).toContain('NADA foi apagado');
    expect(r.chamadas.some((l) => l.includes('down -v'))).toBe(false);
  });
});

describe('achado 5 — o Postgres volta sozinho, num banco recém-criado e vazio, antes do resto', () => {
  it('sobe SÓ o postgres e restaura com --banco-vazio, no ambiente do backup', () => {
    const c = caso();
    const r = c.rodar(`COMPOSE_DE_INSTALACAO=/compose.yml\nrestaurar_o_banco /bk`);
    expect(r.codigo, r.saida).toBe(0);
    const postgres = r.chamadas.findIndex((l) => / up -d --wait postgres \|/.test(l));
    const restore = r.chamadas.findIndex((l) => l.includes('run --rm backup brabo-restore --banco-vazio'));
    expect(postgres).toBeGreaterThanOrEqual(0);
    expect(restore).toBeGreaterThan(postgres);
    expect(r.chamadas[restore]).toContain('DIR=/bk');
  });

  it('restore recusado (banco com tabela, validação) RECUSA dizendo que fica pendente', () => {
    const c = caso({ dockerFalha: 'brabo-restore --banco-vazio' });
    const r = c.rodar(`COMPOSE_DE_INSTALACAO=/compose.yml\nrestaurar_o_banco /bk`);
    expect(r.codigo).toBe(1);
    expect(r.stderr).toContain('o Postgres NÃO foi restaurado');
    expect(r.stderr).toContain('PENDENTE no marcador');
  });

  it('em main: banco restaurado ANTES do up inteiro; o resto da restauração DEPOIS da saúde', () => {
    const main = fonte()
      .slice(fonte().indexOf('\nmain() {'))
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('#'))
      .join('\n');
    const banco = main.indexOf('restaurar_o_banco "$MIGRAR_DE"');
    const up = main.indexOf('--env-file "$env_arquivo" up -d --wait');
    const saude = main.indexOf("ok 'api e engine respondendo'");
    const resto = main.indexOf('restaurar_apos_migrar "$MIGRAR_DE" "$plataforma"');
    expect(banco).toBeGreaterThan(0);
    expect(up).toBeGreaterThan(banco);
    expect(saude).toBeGreaterThan(up);
    expect(resto).toBeGreaterThan(saude);
  });
});

describe('achados 4 e 8 — git como o dono do volume, e a reprojeção que vira pendência', () => {
  const restaurar = (opcoes: Parameters<typeof caso>[0], etapas = 'git grafo artefatos') => {
    const c = caso(opcoes);
    return c.rodar(`COMPOSE_DE_INSTALACAO=/compose.yml; VERSAO_A_INSTALAR=1.0.1; COMMIT_A_INSTALAR=abc; MIGRAR_DE=/bk
ETAPAS_PENDENTES='${etapas}'
restaurar_apos_migrar /bk linux-amd64
printf 'ETAPAS=[%s]\\nPENDENCIAS=[%s]\\n' "$ETAPAS_PENDENTES" "$PENDENCIAS"
cat "$XDG_STATE_HOME/brabo/install-state.json"`);
  };

  it('restore-git roda com --user = o dono LIDO do volume, e depois as duas reprojeções', () => {
    const r = restaurar({ donoDoVolume: '1000:1000' });
    expect(r.codigo, r.saida).toBe(0);
    const git = r.chamadas.findIndex((l) => l.includes('run --rm --user 1000:1000 backup brabo-restore-git --restaurar'));
    const grafo = r.chamadas.findIndex((l) => l.includes('exec -T api node scripts/reprojetar-grafo.js'));
    const artefatos = r.chamadas.findIndex((l) => l.includes('exec -T api node scripts/reprojetar-artefatos.js'));
    expect(git).toBeGreaterThan(r.chamadas.findIndex((l) => l.includes('exec -T api stat')));
    expect(grafo).toBeGreaterThan(git);
    expect(artefatos).toBeGreaterThan(grafo);
    expect(r.saida).toContain('ETAPAS=[]');
    expect(r.saida).toContain('"restauracaoPendente": null');
  });

  it('dono que não se lê RECUSA, e a etapa continua no marcador', () => {
    const r = restaurar({ donoDoVolume: '' });
    expect(r.codigo).toBe(1);
    expect(r.stderr).toContain('não consegui ler o dono de /data/git-repos');
    expect(r.chamadas.some((l) => l.includes('brabo-restore-git'))).toBe(false);
  });

  it('reprojeção que falha é PENDÊNCIA com o comando, nunca recusa', () => {
    const r = restaurar({ donoDoVolume: '1000:1000', dockerFalha: 'reprojetar-grafo' });
    expect(r.codigo, r.saida).toBe(0);
    expect(r.saida).toMatch(/PENDENCIAS=\[o grafo não foi reprojetado[^\]]*exec api node scripts\/reprojetar-grafo\.js/);
    expect(r.chamadas.some((l) => l.includes('reprojetar-artefatos'))).toBe(true);
  });
});

describe('achado 6 — o marcador registra a restauração pendente, e a próxima execução a RETOMA', () => {
  const gravarELer = (etapas: string) => {
    const c = caso();
    const r = c.rodar(`COMPOSE_DE_INSTALACAO=/compose.yml; VERSAO_A_INSTALAR=1.0.1; COMMIT_A_INSTALAR=abc
MIGRAR_DE='/tmp/backup "x"'; ETAPAS_PENDENTES='${etapas}'
gravar_marcador linux-amd64
printf 'LIDO=[%s]\\n' "$(restauracao_pendente "$(ler_marcador)")"`);
    expect(r.codigo, r.saida).toBe(0);
    const json = JSON.parse(fs.readFileSync(path.join(c.dir, 'state/brabo/install-state.json'), 'utf8'));
    return { r, json };
  };

  it('schema 4, linha, e o bloco com destino e etapas — JSON válido mesmo com aspas no caminho', () => {
    const { json } = gravarELer('banco git grafo artefatos');
    expect(json.schemaVersion).toBe(4);
    expect(json.linha).toBe('multirrepo');
    expect(json.restauracaoPendente).toEqual({ destino: '/tmp/backup "x"', etapas: 'banco git grafo artefatos' });
  });

  it('sem pendência o bloco é null, e a leitura devolve nada', () => {
    const { json, r } = gravarELer('');
    expect(json.restauracaoPendente).toBeNull();
    expect(r.saida).toContain('LIDO=[]');
  });

  it('a leitura devolve destino e etapas', () => {
    const c = caso();
    const r = c.rodar(`restauracao_pendente '{ "restauracaoPendente": { "destino": "/bk/a", "etapas": "git grafo" }, "imagens": { "api": "x" } }'`);
    expect(r.saida).toBe('/bk/a\tgit grafo\n');
  });

  it('em main: com pendência a migração NÃO roda de novo, e o marcador vai ao disco depois do down -v e da subida', () => {
    const main = fonte()
      .slice(fonte().indexOf('\nmain() {'))
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('#'))
      .join('\n');
    expect(main).toContain('if [ -z "$MIGRAR_DE" ] && { [ -n "$marcador" ] || [ -n "$sinais" ]; }; then');
    const migra = main.indexOf('migrar_instalacao_anterior "');
    const aposMigrar = main.indexOf('gravar_marcador "$plataforma"', migra);
    expect(aposMigrar).toBeGreaterThan(migra);
    expect(aposMigrar).toBeLessThan(main.indexOf('consentir_base'));
    const saude = main.indexOf("ok 'api e engine respondendo'");
    expect(main.indexOf('gravar_marcador "$plataforma"', saude)).toBeLessThan(main.indexOf('conferir_o_broker'));
  });
});

describe('achado 2 — a linha de versões: 7.0.0 → 1.0.0 não é rebaixamento', () => {
  const relacao = (marcador: string, aInstalar = '1.0.0') => {
    const c = caso();
    return c.rodar(`relacao_com_o_instalado '${aInstalar}' '${marcador}'`).saida.trim();
  };
  const marcador = (campos: string) => `{ "schemaVersion": 3, ${campos} }`;

  it('sem `linha` e imagens de fora do prefixo: nova-linha', () => {
    expect(relacao(marcador('"versao": "7.0.0", "imagens": { "api": "ghcr.io/daneiel/brabo-api@sha256:x" }'))).toBe('nova-linha');
    expect(relacao(marcador('"versao": "7.0.0", "imagens": { "api": "brabo-api:prod" }'))).toBe('nova-linha');
  });

  it('sem `linha` mas com imagens do prefixo desempata para ESTA linha, e compara a versão', () => {
    const m = marcador('"versao": "1.0.0", "imagens": { "api": "ghcr.io/viralabs-dev/brabo-api@sha256:x" }');
    expect(relacao(m, '1.0.1')).toBe('maior');
    expect(relacao(m, '1.0.0')).toBe('igual');
  });

  it('com a `linha` desta, a versão manda — rebaixar continua sendo rebaixar', () => {
    expect(relacao(marcador('"linha": "multirrepo", "versao": "7.0.0"'))).toBe('menor');
  });

  it('`linha` de outra série é nova-linha, e sem versão segue desconhecida', () => {
    expect(relacao(marcador('"linha": "outra", "versao": "0.1.0"'))).toBe('nova-linha');
    expect(relacao(marcador('"imagens": { "api": "brabo-api:prod" }'))).toBe('desconhecida');
  });

  it('a frase é própria e o default é SIM', () => {
    const texto = fonte();
    expect(texto).toMatch(/nova-linha\)\n\s+pergunta="Atualizar \$\{VERSAO_INSTALADA\} \(linha anterior\) → \$\{VERSAO_A_INSTALAR\} \(linha nova\)\?[^"]*\[S\/n\] "/);
    expect(texto).toContain(`if [ "$RELACAO" = 'maior' ] || [ "$RELACAO" = 'nova-linha' ]; then`);
  });
});

describe('achado 7 — download com nova tentativa, e 404 dito diferente de "fora do ar"', () => {
  const baixar = (codigo: string) => {
    const c = caso({ curlCodigo: codigo });
    return c.rodar(`baixar_ou_recusar https://x/images.json "$PWD/images.json" 'a Release não publica images.json'`);
  };

  it('repete: --retry 6, 10 s, e conexão recusada', () => {
    const r = baixar('200');
    expect(r.codigo, r.saida).toBe(0);
    expect(r.chamadas[0]).toMatch(/--retry 6 --retry-delay 10 --retry-connrefused/);
  });

  it('404 é a frase da Release que não publica', () => {
    const r = baixar('404');
    expect(r.codigo).toBe(1);
    expect(r.stderr).toContain('a Release não publica images.json');
  });

  it('504 (CDN fora) é OUTRA frase, e manda tentar de novo', () => {
    const r = baixar('504');
    expect(r.codigo).toBe(1);
    expect(r.stderr).not.toContain('não publica');
    expect(r.stderr).toContain('6 novas tentativas');
  });

  it('nenhum download do script escapa de `baixar`', () => {
    expect(fonte()).not.toMatch(/curl -fsSL -o /);
  });
});
