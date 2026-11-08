#!/usr/bin/env bash
# Reconstrói, DENTRO deste checkout, o layout do monorepo que o gerador de docs
# e o site esperam (EP-033, plano §2.4): cada repositório irmão vai para o lugar
# canônico dele (`apps/api`, `packages/`, `deploy/`, ...). Assim as ~3 800 refs
# `caminho:N` das RNs e os globs do docmap não mudam. Nada disto é commitado:
# os arquivos entram no ÍNDICE (`git add -f`) porque `git ls-files` é a régua do
# gerador, e o CI descarta o checkout depois.
#
#   irmaos.lock    TRAVA (AT-780): `<repo> <sha40>` por irmão, na raiz. Sem
#                  BRABO_REF, cada irmão vem do SHA da trava, então a PR do brabo
#                  não muda de veredito quando um irmão faz merge. Repo ou SHA
#                  faltando/inválido reprova. Quem sobe a trava é o regenera-gerados.
#   BRABO_REF      ref dos irmãos; VENCE a trava (deploy da `main`, release, ver a
#                  `dev` de agora). O ref é resolvido e o SHA gravado do mesmo jeito.
#   BRABO_ORG      organização no GitHub (padrão `viralabs-dev`)
#   BRABO_IRMAOS   pasta com clones locais `brabo-*` (dev na máquina): usa-os em
#                  vez de baixar. Sem ela, clona por HTTPS (os repos são públicos).
#
# Raiz opcional ausente (ex.: `brabo-infra` ainda vazio) é AVISO, não erro: o
# `docs:check` reprova depois, nomeando o que falta, se ele depender dela.
set -euo pipefail
cd "$(dirname "$0")/../.."
REF="${BRABO_REF:-}"
LOCK="irmaos.lock"
ORG="${BRABO_ORG:-viralabs-dev}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Manifesto do que a rodada anterior trouxe dos irmãos. Sem limpá-lo, o
# `--update=none` abaixo deixava a cópia velha no disco e escondia o diff (AT-726).
MANIFESTO="$(git rev-parse --git-dir)/layout-irmaos.lst"
if [ -f "$MANIFESTO" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    git cat-file -e "HEAD:$f" 2>/dev/null && continue
    git rm -q --cached -f -- "$f" 2>/dev/null || true
    rm -f -- "$f"
  done < "$MANIFESTO"
  rm -f "$MANIFESTO"
fi

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

# SHA de cada irmão desta rodada, para o helper `vinculos` do brabo-ci (AT-773 A3)
SHAS="$(git rev-parse --git-dir)/irmaos-sha.lst"
: > "$SHAS"

# Trava: valida inteira ANTES de baixar qualquer coisa.
sha_da_trava() { awk -v r="$1" '$1 == r { print $2 }' "$LOCK"; }
if [ -z "$REF" ]; then
  [ -f "$LOCK" ] || { echo "::error::$LOCK ausente (e BRABO_REF não foi dado)"; exit 1; }
  for par in "${DESTINOS[@]}"; do
    s="$(sha_da_trava "${par%%:*}")"
    printf '%s' "$s" | grep -Eq '^[0-9a-f]{40}$' \
      || { echo "::error::$LOCK: '${par%%:*}' sem SHA de 40 hex (achei '$s')"; exit 1; }
  done
  awk '!/^[[:space:]]*(#|$)/ { print $1 }' "$LOCK" | while read -r r; do
    case " ${DESTINOS[*]%%:*} " in *" $r "*) ;; *) echo "::error::$LOCK: '$r' não é irmão conhecido"; exit 1;; esac
  done
fi

for par in "${DESTINOS[@]}"; do
  repo="${par%%:*}"; destino="${par#*:}"
  fonte="$TMP/$repo"
  if [ -z "$REF" ]; then
    sha="$(sha_da_trava "$repo")"; rotulo="${sha:0:12} (trava)"
    mkdir -p "$fonte"
    if [ -n "${BRABO_IRMAOS:-}" ] && [ -d "$BRABO_IRMAOS/$repo" ]; then
      git -C "$BRABO_IRMAOS/$repo" archive "$sha" 2>/dev/null | tar -x -C "$fonte" \
        || { echo "::error::$repo: SHA $sha ausente no clone local (git -C $BRABO_IRMAOS/$repo fetch)"; exit 1; }
    else
      git init -q "$fonte"
      git -C "$fonte" fetch -q --depth 1 "https://github.com/$ORG/$repo.git" "$sha" 2>/dev/null \
        && git -C "$fonte" checkout -q FETCH_HEAD \
        || { echo "::error::$repo: não consegui buscar o SHA $sha da trava"; exit 1; }
      rm -rf "$fonte/.git"
    fi
  elif [ -n "${BRABO_IRMAOS:-}" ] && [ -d "$BRABO_IRMAOS/$repo" ]; then
    mkdir -p "$fonte"
    git -C "$BRABO_IRMAOS/$repo" archive "$REF" 2>/dev/null | tar -x -C "$fonte" \
      || { echo "::warning::$repo: ref '$REF' ausente no clone local — ignorado"; continue; }
    sha="$(git -C "$BRABO_IRMAOS/$repo" rev-parse "$REF")"; rotulo="$REF (BRABO_REF)"
  elif git clone -q --depth 1 --branch "$REF" "https://github.com/$ORG/$repo.git" "$fonte" 2>/dev/null; then
    sha="$(git -C "$fonte" rev-parse HEAD)"; rotulo="$REF (BRABO_REF)"
    rm -rf "$fonte/.git"
  else
    echo "::warning::$repo: não consegui clonar '$REF' (repositório vazio ou ref ausente) — raiz omitida"
    continue
  fi
  echo "$ORG/$repo@$sha" >> "$SHAS"
  # os workflows de CI do QA têm imagens literais que o `imagens-pinadas` do infra reprova; são conferidos no CI do próprio brabo-qa
  [ "$repo" = "brabo-qa" ] && rm -rf "$fonte/.github"
  mkdir -p "$destino"
  # a docs/ de irmão posto em "." não pode cair na docs/ daqui: vai para <nome>/docs (AT-846)
  if [ "$destino" = "." ] && [ -d "$fonte/docs" ]; then
    mkdir -p "${repo#brabo-}/docs"
    cp -a --update=none "$fonte/docs/." "${repo#brabo-}/docs/" && rm -rf "$fonte/docs"
  fi
  # -n: nunca sobrescreve; README/LICENSE/CHANGELOG/workflows daqui vencem
  cp -a --update=none "$fonte/." "$destino/"
  echo "layout: $repo@$rotulo -> $destino"
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
# o que está no índice e não está em HEAD veio dos irmãos
git diff --cached --name-only --diff-filter=A -z | tr '\0' '\n' > "$MANIFESTO"
echo "layout reconstruído: $(git ls-files | wc -l) arquivo(s) no índice"
