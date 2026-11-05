# ADR 0259 — O módulo de que outros dependem tem dono no plano de execução

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `time`
- **Referencia:** o ADR [0194](0194-aprovar-o-plano-ativa-a-execucao.md) (revisa a RN-678, "quem cria tarefa é o PO", só para a tarefa de fundação; o 0194 não é editado), o ADR [0053](0053-dev-lead-e-paralelismo-autorizado.md), e as RN-1004, RN-1005 e RN-1006, que implementam esta decisão (AT-742, EP-030, decisão do dono de 05/11/2026).

## Contexto

No TP-01 de 05/11 (24ª rodada), o plano do Dev Lead marcou `persistencia` e `api-http` como "sem tarefa, sem agente". As tarefas de agenda e de reservas bloquearam por falta do contrato de `api-http`, e a de `deploy` bloqueou 13 a 16 segundos depois do plano. A rodada anterior teve o mesmo padrão: os módulos sem dono eram a BASE (`dependsOn` vazio) e a camada HTTP.

Quatro causas se somavam:

- o PO cria as tarefas ANTES de o `module_map` existir, e o módulo de fundação não vira história;
- o Dev Lead não pode criar tarefa (RN-678), e o kickoff não lhe mostra o `dependsOn` dos módulos;
- a api só CONTA os `modulosSemTarefa` do plano, sem recusar;
- o `claimNext` entrega a tarefa sem olhar o `dependsOn`, então o dev começa antes de a dependência existir.

## Decisão

1. **O Dev Lead cria a tarefa de fundação.** Ele ganha `create_task`, restrito à história cujos `module_ids` contêm o módulo, e o kickoff e o `module_map_vigente` passam a mostrar o `dependsOn` de cada módulo e a regra da fundação (RN-1006). Fora disso, quem cria tarefa continua sendo o PO (RN-678).
2. **A api recusa o plano que deixa sem dono um módulo de que outro depende.** `lerPlanoDeExecucao` devolve 400 nomeando o par (o módulo sem tarefa e quem depende dele). O módulo sem tarefa de que NENHUM outro depende continua passando, só contado (RN-1004).
3. **O claim espera a dependência direta.** O `claimNext` não entrega a tarefa de um módulo enquanto algum módulo do seu `dependsOn` DIRETO tiver tarefa aberta. A dependência transitiva não é olhada: ela já segura o módulo do meio (RN-1005).

## Consequências

- Preço declarado: **menos paralelismo.** Os devs dos módulos dependentes esperam a fundação terminar, em vez de começar juntos e bloquear sem contrato. No plano típico do TP-01, a camada HTTP e os módulos de domínio passam a esperar a persistência.
- O plano que antes era aprovado com um buraco agora volta ao Dev Lead com o par nomeado, e ele corrige criando a tarefa que falta.
- O kickoff do Dev Lead cresce com o `dependsOn` de cada módulo.
- O que não muda: aprovar o plano continua ativando a execução (ADR 0194), o módulo da tarefa continua atribuído pelo Dev Lead, e só o dev daquele módulo a pega.

## Alternativas consideradas

- **O PO criar a tarefa de fundação.** Recusada: o PO trabalha antes do `module_map`, e quem conhece os módulos e as dependências é o Dev Lead.
- **Recusar todo plano com módulo sem tarefa.** Recusada pelo dono: o módulo de que ninguém depende pode ficar para depois sem travar ninguém.
- **O claim seguir o `dependsOn` transitivo.** Recusada: a dependência direta basta, porque cada elo segura o seguinte, e o transitivo só custa leitura.

## Referências

- [0194](0194-aprovar-o-plano-ativa-a-execucao.md), [0053](0053-dev-lead-e-paralelismo-autorizado.md), [0086](0086-dev-lead-plano-suspende-para-aprovacao.md).
