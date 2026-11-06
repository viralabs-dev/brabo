# ADR 0261 — O Dev Lead é avisado de bloqueios e pede ao Arquiteto por um canal próprio

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `time`
- **Referencia:** complementa o ADR [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md) (o plano recusa a tarefa com rota de outro módulo, RN-1011) e estende o ADR [0038](0038-hierarquia-de-agentes.md) (o único caminho entre agentes era o handoff). Cita o ADR [0045](0045-reagendamento-por-evento-do-dev-agent.md) (o `Wake` entrega no máximo uma vez) e o ADR [0163](0163-o-clique-responde-ao-aceitar.md) (o aceite na hora). Implementado pelas RN-1011 e RN-1012 (AT-748, engine#25 e engine#26, decisão do dono de 05/11/2026).

## Contexto

Só o usuário falava com o Arquiteto, pelo chat. O handoff para um agente que já está ativo dá 409 `agente_ja_ativo`, então o Dev Lead não tinha como pedir um contrato ao Arquiteto. E o Dev Lead não era avisado quando uma tarefa bloqueava: o bloqueio ficava visível só para o humano, que precisava reparar nele.

## Decisão

1. **O sistema avisa o Dev Lead.** Por `Engine.Dev.Wake`, dois eventos o acordam: `:tarefa_bloqueada` (do `report_blocked` com origem `modelo`) e `:contrato_publicado` (do `declare_module_contracts`). O aviso é lido como um turno iniciado pelo sistema, ou entra em `fila_de_mensagens` se o Dev Lead já tem turno em curso ou aprovação suspensa (RN-1012).
2. **O Dev Lead pede ao Arquiteto pela ferramenta `pedir_ao_arquiteto`.** Ela grava um `chat.message` durável do ator `dev-lead`, com o prefixo `[Pedido do Dev Lead]`, e o entrega por `ArquitetoServer.user_message`: o Arquiteto aceita na hora (ADR 0163) ou enfileira se estiver ocupado. A reidratação já trata `chat.message` de qualquer ator como `user`, então o pedido sobrevive ao restart.
3. **Desbloquear a tarefa presa continua humano** (RN-826, RN-777). O aviso informa o Dev Lead; não destrava nada.

## Consequências

- O Dev Lead passa a ter turno iniciado pelo sistema, caso que o ADR 0038 não previa (só o handoff abria turno).
- Limite: o `Wake` entrega no máximo uma vez (ADR 0045). Sem Dev Lead de pé, o aviso se perde e resta o caminho humano (RN-826).
- O `chat.message` pode aparecer duplicado no histórico se o Arquiteto estiver ocupado quando o pedido chega.
- O usuário continua vendo o pedido no chat do Arquiteto, com o prefixo que o separa da fala dele.

## Alternativas consideradas

- **Liberar o handoff para o agente ativo.** Recusada: o 409 `agente_ja_ativo` protege o turno em curso, e o pedido não é uma passagem de bastão.
- **O Dev Lead escrever no chat como se fosse o usuário.** Recusada: perderia a autoria, e o Arquiteto não distinguiria o pedido do agente da fala do dono.

## Referências

- [0038](0038-hierarquia-de-agentes.md), [0045](0045-reagendamento-por-evento-do-dev-agent.md), [0053](0053-dev-lead-e-paralelismo-autorizado.md), [0163](0163-o-clique-responde-ao-aceitar.md), [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md), [0259](0259-o-modulo-de-que-outros-dependem-tem-dono.md).
