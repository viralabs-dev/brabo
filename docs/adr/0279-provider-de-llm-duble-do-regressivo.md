# ADR 0279 — Provider de LLM dublê do regressivo, dentro da api

- **Status:** aceito (08/11/2026, decisão do dono, AT-815 P1)
- **Data:** 2026-11-08
- **Tema:** `llm`
- **Referencia:** RN-1065 da api, que linka este ADR. Usa o mesmo mecanismo de guarda do acesso rápido (ADR [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md), AT-722). AT-815, Rodada 251.

## Contexto

O regressivo do `brabo-qa` precisa de agentes que respondam sem custo e de forma determinística. A alternativa (a) era um servidor de LLM falso no job, apontado por `OLLAMA_HOST`.

## Decisão

Um provider dublê dentro da api (opção b).

- Ocupa o lugar do provider `ollama` no `LLMProviderRegistry`, porque o nome do provider vem do `@brabo/shared` e um nome novo exigiria mudar o contrato.
- Só carrega com `LLM_DUBLE=1` **e** com a imagem sem a marca `prd` em `/app/AMBIENTE_DA_IMAGEM`, o mesmo mecanismo do acesso rápido (AT-722). Na `prd` não carrega nem com a variável: só registra um aviso no log.
- `LLM_DUBLE=1` sem `LLM_DUBLE_ROTEIRO` derruba a subida.
- Responde por um roteiro JSON (`LLM_DUBLE_ROTEIRO`), por agente e por passo, com texto e/ou `tool_calls` no formato do parser.
- Cada chamada sai com custo 0 e `resolvedModel` `"duble-llm"` no `token_usage`.

## Consequências

- O regressivo roda agentes reais sem LLM pago. LLM real só no TP-01 (P2).
- O risco é o dublê chegar à produção. A guarda em duas camadas e os testes dos quatro casos cobrem isso.
- O dublê não implementa `embed` nem `listModels`.

## Referências

- [0245](0245-acesso-rapido-por-papel-so-no-ambiente-local.md), [0277](0277-o-regressivo-roda-num-compose-so-e-o-relatorio-decide.md).
