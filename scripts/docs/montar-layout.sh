#!/usr/bin/env bash
# Reconstrói, DENTRO deste checkout, o layout do monorepo que o gerador de docs
# e o site esperam (EP-033, plano §2.4): cada repositório irmão vai para o lugar
# canônico dele (`apps/api`, `packages/`, `deploy/`, ...). Assim as ~3 800 refs
# `caminho:N` das RNs e os globs do docmap não mudam. Nada disto é commitado:
# os arquivos entram no ÍNDICE (`git add -f`) porque `git ls-files` é a régua do
# gerador, e o CI descarta o checkout depois.
#
#   BRABO_REF      ref dos irmãos (padrão `dev`; no release, a tag do produto)
#   BRABO_ORG      organização no GitHub (padrão `viralabs-dev`)
#   BRABO_IRMAOS   pasta com clones locais `brabo-*` (dev na máquina): usa-os em
#                  vez de baixar. Sem ela, clona por HTTPS (os repos são públicos).
#
# Raiz opcional ausente (ex.: `brabo-infra` ainda vazio) é AVISO, não erro: o
# `docs:check` reprova depois, nomeando o que falta, se ele depender dela.
set -euo pipefail
cd "$(dirname "$0")/../.."
REF="${BRABO_REF:-dev}"
ORG="${BRABO_ORG:-viralabs-dev}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# repo:destino-no-layout (o destino "." mescla na raiz SEM sobrescrever o que é daqui)
DESTINOS=(
  "brabo-api:apps/api"
  "brabo-engine:apps/engine"
  "brabo-web:apps/web"
  "brabo-runner:apps/runner"
  "brabo-broker:apps/broker"
  "brabo-contracts:."
  "brabo-infra:."
  "brabo-ci:."
  "brabo-qa:."
)

for par in "${DESTINOS[@]}"; do
  repo="${par%%:*}"; destino="${par#*:}"
  fonte="$TMP/$repo"
  if [ -n "${BRABO_IRMAOS:-}" ] && [ -d "$BRABO_IRMAOS/$repo" ]; then
    mkdir -p "$fonte"
    git -C "$BRABO_IRMAOS/$repo" archive "$REF" 2>/dev/null | tar -x -C "$fonte" \
      || { echo "::warning::$repo: ref '$REF' ausente no clone local — ignorado"; continue; }
  elif git clone -q --depth 1 --branch "$REF" "https://github.com/$ORG/$repo.git" "$fonte" 2>/dev/null; then
    rm -rf "$fonte/.git"
  else
    echo "::warning::$repo: não consegui clonar '$REF' (repositório vazio ou ref ausente) — raiz omitida"
    continue
  fi
  # os workflows de CI do QA têm imagens literais que o `imagens-pinadas` do infra reprova; são conferidos no CI do próprio brabo-qa
  [ "$repo" = "brabo-qa" ] && rm -rf "$fonte/.github"
  mkdir -p "$destino"
  # -n: nunca sobrescreve; README/LICENSE/CHANGELOG/workflows daqui vencem
  cp -a --update=none "$fonte/." "$destino/"
  echo "layout: $repo@$REF -> $destino"
  # os workflows de publicação do runner são citados pelo runbook no caminho da raiz
  if [ "$repo" = "brabo-runner" ]; then
    mkdir -p .github/workflows
    for w in build-runner-binaries publish-runner; do
      [ -f "$fonte/.github/workflows/$w.yml" ] && cp -a --update=none "$fonte/.github/workflows/$w.yml" .github/workflows/
    done
  fi
done

# ignorados pelo .gitignore daqui (ex.: node_modules) não entram
git add -f -A -- . ':!node_modules' ':!**/node_modules' >/dev/null 2>&1 || true
echo "layout reconstruído: $(git ls-files | wc -l) arquivo(s) no índice"
