#!/usr/bin/env bash
# AT-947: patch dos arquivos de irmãos que o gerador mudou, aplicável no repo dono com
# `git apply -p3` (o prefixo é `a/apps/<repo>/`). Roda ANTES do `git reset` do workflow:
# os irmãos só existem no índice (o layout deu `git add -A`), então o diff é worktree x índice.
# Uso: patch-dos-irmaos.sh <lista-de-arquivos> <saida.patch>
set -euo pipefail
xargs -d '\n' -a "$1" git diff -- > "$2"
