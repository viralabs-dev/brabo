---
sidebar_position: 9
---

# Painel da mudança

Uma mudança do Brabo pode tocar sete a onze repositórios. O painel da mudança é o
run `Painel da mudança` no `brabo-ci`: ele junta, num lugar só, as runs dessa mudança.

## O que ele junta

Cada mudança (um componente do `Depende-de`, uma PR solta ou uma tag) tem um painel.
Ele reúne as runs pelo head SHA, pelo merge SHA, pela tag e pelo `c=` do E2E.
O Summary traz uma tabela por repo e um diagrama Mermaid.

## Quando ele atualiza e quando para

- Acompanha a mudança a cada 60 s, com ETag. Se restarem menos de 500 requisições, o
  intervalo passa a 5 min.
- Para quando tudo terminou e há 3 min de quietude, ou no teto de 45 min. Um run ainda
  em andamento no teto sai como "em andamento há N min".
- O painel **nunca reprova**. Ele descreve; quem reprova é o run de origem.

## Onde o link aparece

O painel não publica check nas PRs. O link fica nas runs de origem, na linha
`Disparado | Painel da mudança` dos Vínculos. Ele aponta para
`brabo-ci/actions/workflows/painel.yml` com a busca pelo repo e pelo número da PR.

## Um painel por componente

Antes de disparar, o remetente (job `avisar-painel`) confere se já existe um painel
`queued` ou `in_progress` com o `<repo>#<n>` no título. Se sim, não dispara outro.
Quando o componente cresce (outra chave `m=<hash>`), o painel em curso escreve
"superado" e sai, e o remetente dispara o novo.

## Permissões

O token do App do painel só lê (`actions`, `pull-requests` e `contents`). O único
token com escrita é o do dispatch (`contents: write`, restrito ao `brabo-ci`).

Regras: [RN-1054 a RN-1056](../business-rules/ci.md). Decisão: [ADR 0278](../adr/0278-a-mudanca-e-vista-num-painel-do-brabo-ci.md).
