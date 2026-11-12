---
id: escolher-o-laya
title: Escolher o Laya no lugar do Jev
sidebar_label: Escolher o Laya
description: Para quem tem GPU NVIDIA - confira os requisitos, ligue o Laya no instalador, escolha o roteador do workspace e saiba o que acontece quando ele cai.
keywords: [laya, jev, gpu, tool-router, roteador de ferramentas, install.sh]
---

# Escolher o Laya no lugar do Jev

O roteador de ferramentas reduz o menu que o modelo vê a cada passo. O padrão é o Jev (serviço do OpenRouter). Com uma GPU NVIDIA que aguente, você pode usar o Laya, que roda na sua máquina e roteia turnos de qualquer provider. Decisão: [ADR 0290](../adr/0290-o-usuario-escolhe-o-laya-no-lugar-do-jev-quando-a-maquina-tem-gpu.md).

## Requisitos

- GPU NVIDIA com runtime `nvidia` (ou CDI) no Docker.
- 6 GiB de RAM livres para o serviço.
- VRAM livre: o instalador exige 4 096 MiB hoje.
- A imagem `laya` no manifesto da release (alvo opcional). Sem ela a oferta não aparece.

> **TODO(humano):** valor final da VRAM mínima, que sai da medição do ensemble na AT-630.

## Passos

1. Rode o instalador. Com GPU e recursos suficientes ele pergunta se liga o Laya (padrão NÃO). Se um critério falhar, ele diz qual. Sem terminal interativo, o Laya fica desligado.
2. Responder sim grava `BRABO_LAYA_IMAGE` no `.env` e soma `tool-router-gpu` aos profiles.
3. Escolha o roteador do workspace (`owner`): `PUT /workspaces/:id/tool-router` com `{"roteador": "laya"}`. Não há tela ainda.
4. Confira com `GET /workspaces/:id/tool-router` (`viewer`): o estado deve ser `proficiente`.

## Se der errado

- 409 `roteador_local_indisponivel` no PUT: o serviço não está `proficiente`. O GET diz o estado (`nao_configurado`, `sem_resposta`, `sem_gpu` ou `lento`).
- Laya fora do ar ou lento no meio do turno: o passo usa o catálogo inteiro de ferramentas e o turno segue. Ele não volta para o Jev.
- Para voltar ao padrão: `{"roteador": "jev"}`.
