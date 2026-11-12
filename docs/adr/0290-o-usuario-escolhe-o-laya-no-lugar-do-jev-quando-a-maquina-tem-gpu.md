# ADR 0290 — O usuário escolhe o Laya no lugar do Jev quando a máquina tem GPU que o roda

- **Status:** proposto (12/11/2026, AT-626; a implementação está em `brabo-api#94` e `brabo#123`, a imagem e a tela ainda não)
- **Data:** 2026-11-12
- **Tema:** `llm`
- **Referencia:** revisa o item 1 da RN-625 (só o OpenRouter é roteado) e estende o [ADR 0179](0179-o-laco-pergunta-ao-jev-qual-ferramenta.md). AT-626 (EP-026), pedido do dono de 31/10/2026, decisões do dono de 31/10 e de 07/11/2026 (AT-627/AT-630).

## Contexto

O ADR 0179 pôs o Jev atrás da porta `ToolRouter`: a cada passo, ele reduz o menu de ferramentas que o modelo do usuário vê. O Jev é um serviço de terceiro (Decisions API do OpenRouter), então só roteia turno de provider OpenRouter. Nenhum turno de Ollama, NIM ou 9Router era roteado.

O Laya é um classificador nosso, treinado na AT-627. Na AT-592 (22/10) ele foi medido com p95 de 55 ms em GPU e de 3,8 s em CPU, acima do teto de 2 s. A AT-627 passou a régua da Rodada 120 em 31/10: IC inferior estrito de 91,4%, recorte 1 099 × 1 024, p95 de 59 ms. Faltava deixar o usuário escolhê-lo quando a máquina o roda bem.

## Decisão

1. **O Laya é um segundo adaptador da porta `ToolRouter`**, o `LayaToolRouter`, na api. Faz uma chamada a `POST /v1/systemone`, sem a opção reservada, com a regra `p3` e um limiar. O Jev continua o padrão.
2. **A escolha mora no workspace**: o enum `tool_router` (`jev`, `laya`, `desligado`) substitui o booleano `tool_router_enabled`, que vira coluna derivada (o `false` antigo migra para `desligado`). `GET /workspaces/:id/tool-router` (`viewer`) devolve a escolha e o estado do serviço; `PUT` (`owner`) grava. Gravar `laya` exige o serviço `proficiente` confirmado na hora, senão 409 `roteador_local_indisponivel`. Os cinco estados (`nao_configurado`, `sem_resposta`, `sem_gpu`, `lento`, `proficiente`) nunca se colapsam. O turno nunca consulta o `/health`.
3. **Com `laya`, todo provider é roteado**, não só o OpenRouter. É a revisão do item 1 da RN-625.
4. **Queda para o catálogo inteiro, nunca para o Jev** (decisão do dono, 31/10). Laya fora do ar, lento ou que falha num passo deixa o passo com todas as ferramentas, e o turno nunca falha por causa dele (RN-625). O Laya não grava `token_usage`.
5. **"Proficiente" é medido pelo próprio serviço no boot** (decisão do dono, 31/10): p95 da sonda de boot de até 500 ms e VRAM livre acima do mínimo. Máquina sem GPU sobe o serviço, mas responde `sem_gpu`.
6. **O serviço é a 6ª imagem, nossa, opcional**, no profile `tool-router-gpu` do compose de instalação, sem porta publicada, com reserva de device NVIDIA. O instalador só oferece o Laya com GPU NVIDIA, imagem no manifesto (alvo `laya`, fora do kustomize) e recursos mínimos, e diz qual critério falhou. O padrão é NÃO, e sem TTY fica desligado.
7. **Ensemble (decisão do dono de 07/11, AT-627/AT-630).** A média das probabilidades dos 4 modelos fica dentro da imagem: `/v1/systemone` devolve a distribuição já em média e o `/health` diz os modelos e os sha. A api faz uma chamada.

## Requisitos mínimos da máquina

| recurso | mínimo | origem |
|---|---|---|
| GPU | NVIDIA, runtime `nvidia` ou CDI | AT-592 |
| RAM do serviço | 6 GiB | OOM medido com 2 GiB no ensemble de 4; 2,06 GiB de uso com 6 GiB |
| VRAM livre | 4 096 MiB no instalador hoje (`LAYA_VRAM_MIN_MIB`) | estimativa de ~3–3,5 GiB para o ensemble (não medida) |
| p95 da sonda | até 500 ms | decisão do dono, 31/10 (medido: 251 ms com o ensemble de 4 na RTX 4060) |

O Ollama do profile `llm` e o ensemble não cabem juntos em ~5,6 GiB de VRAM livre (o `qwen2.5-coder:7b` Q4 usa 4,7 GB).

> **TODO(humano):** o critério final de VRAM livre é "pico medido do ensemble + 512 MiB", e o número sai da AT-630 (L1). Qual valor fixar quando a medição chegar? E o instalador deve recusar o Laya quando o Ollama está na mesma GPU?

## Alternativas rejeitadas

- **Cair para o Jev quando o Laya falha.** O dono decidiu pelo catálogo inteiro (31/10).
- **Aceitar o teto de 2 s como "proficiente".** O dono fixou 500 ms.
- **Detectar só no instalador.** A GPU pode sumir depois: o estado é medido pelo serviço e lido pela api.

## Consequências

- Quem tem GPU escolhe o Laya sem depender de terceiro, e provider fora do OpenRouter passa a ser roteado.
- O release ganha a 6ª imagem (CUDA, vários GB). O job do bake precisa liberar disco no runner (~14 GB) e um CVE corrigível na base CUDA pode bloquear o release.
- A primeira tela do roteador (seção `tool-router` em Configurações) vem na lane web.
- A RN-625 ganha nota de revisão no repo do engine (RN-1070 e RN-1071 moram na api).

> **TODO(humano):** a tela diz "desde quando" o serviço está fora do ar? O estado atual da api não guarda o instante da queda.
