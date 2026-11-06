# ADR 0262 — O agente retira a regra de negócio obsoleta, citando a substituta ou a resposta

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `time`
- **Referencia:** usa a régua do ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md) (a resposta do usuário autoriza a correção, RN-859). Cita o ADR [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md) (a cobertura do backlog decide o aceite) e o ADR [0212](0212-historia-arquivada.md) (estado novo sem mudar o portão do claim). Implementado pela RN-1018 (api#34) e completado no engine e no web (AT-755, decisão do dono de 06/11/2026).

## Contexto

A regra de negócio é o evento imutável `artifact.business_rule`, e o log só acumula. Ninguém tinha como retirar uma regra que ficou obsoleta. No TP-01 26ª (06/11), o Criativo pediu ao condutor "remova a regra manualmente" quatro vezes, e a história passou a citar a regra antiga e a nova ao mesmo tempo.

## Decisão

1. **O agente retira a regra sozinho,** sem cartão de aprovação. Ele cita a regra substituta (`replacedBy`) ou a resposta do usuário (`questionId`), com a mesma régua da RN-859. Sem citação, a retirada é recusada (400 `retirada_sem_citacao`).
2. **Só o Criativo e o PO retiram.** Outro papel recebe 403 `papel_nao_retira_regra`.
3. **Estado novo, sem mexer no log.** O evento `artifact.business_rule_retired { ruleId, reason, storyIds, replacedBy?, questionId? }` marca a retirada. A regra continua no log, mas sai de toda leitura que decide algo: lista, cobertura, duplicata, contexto do dev, aceite automático, `afeta.regras` e resumo de contexto. Criar ou completar história não liga mais regra retirada.
4. **As histórias passam a citar a substituta,** inclusive a história `ready`, sem nova promoção. Nada é gravado, e a retirada é recusada, em dois casos:
   - uma história ficaria sem nenhuma regra (409 `historia_ficaria_sem_regra`);
   - a história tem tarefa em execução (409 `historia_com_tarefa_em_execucao`).

## Consequências

- O Criativo e o PO ganham a ferramenta `retire_business_rule`, e a linha do tempo mostra a retirada.
- Retirar só pela resposta, sem substituta, só passa quando nenhuma história ficaria sem regra.
- A recusa por tarefa em execução protege o trabalho em curso. A retirada fica para depois do merge ou do bloqueio da tarefa.

## Alternativas consideradas

- **Cartão de aprovação.** Recusada pelo dono: devolve ao usuário a fricção que o TP-01 apontou.
- **Botão só na tela.** Recusada: não resolve o caso em que o agente percebe a regra obsoleta.
- **Apagar ou alterar o evento da regra.** Recusada: quebra a imutabilidade do log.

## Referências

- [0186](0186-aceite-automatico-do-handoff-ao-arquiteto.md), [0212](0212-historia-arquivada.md), [0214](0214-pergunta-em-aberto-vira-pendencia.md).
