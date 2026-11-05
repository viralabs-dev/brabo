# ADR 0257 — Na Anthropic direta o raciocínio desligado é por modelo e o esforço reduz o Opus

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `llm`
- **Referencia:** o ADR [0223](0223-orcamento-de-raciocinio-por-modelo.md) (revisa o item 4, "`effort` nunca é usado", só para o provider `anthropic`; o 0223 não é editado), o ADR [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md), as RN-741, RN-782, RN-783 e RN-916 e a RN-1000, que as substitui para este provider (AT-739, EP-030, decisões do dono de 05/11/2026).

## Contexto

No TP-01 de 05/11, 10 de 10 tarefas dos dev agents no Haiku 5.5 bloquearam com "resposta só de raciocínio". O adaptador da Anthropic omitia o `thinking` com o raciocínio desligado (RN-783), porque "o `disabled` é 400 nos 5.5". Nos modelos de pensamento adaptativo, porém, omitir é o adaptativo no esforço padrão. E o 400 vale para o Sonnet e o Opus 5.5, não para o Haiku 5.5. No adaptativo ligado, o `max_tokens` ficava 4096 TOTAL e cortou a Infra. O `reasoning_tokens` saía NULL.

## Decisão

1. Com o raciocínio desligado, o corpo é por modelo:
   - Haiku 5.5: `thinking: disabled`;
   - Sonnet 5.5: `thinking: between_tools`;
   - Opus 5.5: `output_config.effort: low`, declarado como REDUZIDO, não desligado;
   - modelo adaptativo desconhecido: o padrão do modelo, até haver prova.
2. Para este provider, `effort` passa a ser usado, e só no Opus 5.5 desligado. Os agentes que raciocinam ficam no esforço padrão do modelo.
3. Adaptativo ligado e os casos que ainda pensam: `max_tokens` = saída visível + (`reasoningBudget` ?? 4096), a folga da RN-741.
4. O provider declara `aceitaRaciocinioDesligado` (RN-916).
5. `reasoning_tokens` = `thinking_tokens` do último `message_delta`, só quando é inteiro ≥ 0; senão fica omitido e NULL (RN-666).

## Consequências

- Prova: smoke pago de 05/11, cerca de US$ 0,009 (PR #12 do `brabo-api`):
  - Haiku, Sonnet e Opus 5.5 aceitos com uma ferramenta;
  - `disabled` no Opus 5.5 deu 400;
  - trocar o `system` com o bloco de raciocínio reenviado foi aceito.
- No Opus 5.5, a retentativa sem raciocínio da RN-916 só REDUZ o raciocínio.
- Modelo novo da Anthropic entra na tabela por modelo só com smoke próprio citado no PR.

## Referências

- [0223](0223-orcamento-de-raciocinio-por-modelo.md), [0041](0041-base-openai-compativel-e-contrato-de-llm-providers.md).
- Doc oficial: <https://platform.claude.com/docs/en/build-with-claude/effort> e <https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost>.
