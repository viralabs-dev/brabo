// De qual repositório e de qual caminho é cada página (AT-702): o site junta as
// `docs/` de vários repos, e "editar esta página" aponta para o dono dela.
import { posix } from 'node:path';

const DONOS = {
  docs: ['brabo', 'docs'],
  'scripts/ci/docs': ['brabo-ci', 'scripts/ci/docs'],
  'apps/api/docs': ['brabo-api', 'docs'],
  'apps/engine/docs': ['brabo-engine', 'docs'],
  'apps/web/docs': ['brabo-web', 'docs'],
  'apps/runner/docs': ['brabo-runner', 'docs'],
  'apps/broker/docs': ['brabo-broker', 'docs'],
  'packages/docs': ['brabo-contracts', 'packages/docs'],
  'deploy/docs': ['brabo-infra', 'deploy/docs'],
};

/** URL de edição no GitHub; `repo` é `dono/nome` do repositório que publica (só o dono da org importa). */
export function urlDeEdicao(repo, raiz, relativo) {
  const dono = DONOS[raiz];
  if (!dono) throw new Error(`raiz de doc sem repositório dono: ${raiz}`);
  return `https://github.com/${repo.split('/')[0]}/${dono[0]}/blob/dev/${posix.join(dono[1], relativo)}`;
}
