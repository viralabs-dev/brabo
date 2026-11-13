# ADR 0291 — As Percepções olham o produto do usuário; a falha técnica é sinal interno do TP-01

- **Status:** aceito
- **Data:** 2026-11-11
- **Tema:** `conhecimento`
- **Referencia:** substitui o ADR [0205](0205-desvio-do-agente-como-sinal-do-produto.md) (o desvio do agente vira sinal do produto pela Anamnese). A RN-717, que o ADR 0205 criou, é revogada. Revisa a RN-079 (o que o Psicólogo considera analisável). AT-898, Rodada 362, decisões do dono de 10/11/2026 e a escolha da marcação de 11/11/2026 (achado 34 da 28ª do TP-01). Entrega: `brabo-engine#81` e `brabo-api#96`.

## Contexto

Na 28ª rodada do TP-01, o Psicólogo emitiu 8 hipóteses, e todas eram sobre a plataforma: orquestração, teto de custo, validador, contrato e ordem de início dos agentes. Nenhuma dizia se o app que estava sendo construído estava errado em relação ao pedido do usuário. As oito foram para a Anamnese, que ajustava a instrução de algum agente, e a aba Percepções não servia ao usuário.

O ADR 0205 criou o `anamnese.agent_deviation` para o desvio do agente (laço, cancelamento pelo usuário, reparo pelo usuário). O evento tinha um leitor só: o mantenedor, por consulta ao event log. Não havia tela nem agregação, e a falha técnica entrava em outro lugar, sem quem a lesse no fluxo do produto.

A ordem do dono (10/11/2026) separa as duas coisas: Percepções tratam do que está sendo construído com o usuário e está de fato errado; falha técnica da plataforma é assunto do teste do TP-01.

## Decisão

1. **Escopo das Percepções.** O Psicólogo só emite hipótese sobre o produto do usuário: requisito mal entendido, entrega fora do pedido ou regra de negócio do projeto quebrada. Cada item da ferramenta `emit_hypotheses` traz `escopo`, com o valor `produto` ou `plataforma`. O engine classifica; a api roteia.
2. **Roteamento na api.** O lote inteiro passa pela validação de evidência, como antes. Depois:
   - `produto` vira hipótese em `psychologist_hypotheses`, aparece em Percepções, pode ser aceito e entra na fila da Anamnese;
   - `plataforma` nunca vira hipótese. Em sessão de teste do TP-01 vira o evento **`psychologist.platform_signal`** no log da sessão, gravado na mesma transação da análise. Em qualquer outra sessão é descartado sem evento.
3. **Evento `psychologist.platform_signal`.** Payload: `agenteAlvo`, `observacao`, `hipotese`, `sugestao`, `confiancaPercent`, `evidenceEventIds` e `terminationAnalysis` (quando houver). Não vira linha em `psychologist_hypotheses`, então não aparece em Percepções e não pode ser aceito. Fica fora do grafo: o tipo não está na lista `EVENTOS_DO_LOG_PROJETAVEIS`. O `psychologist.analysis_completed` ganha `platformSignalCount`, para a análise com zero hipóteses ser diagnosticável.
4. **Marcação de sessão de teste (opção A).** A coluna `projects.sessao_de_teste boolean default false` (migração 0085 na api) marca o projeto. O operador a liga com `pnpm projeto:marcar-teste <id>`, sem tela. O contexto do Psicólogo devolve `sessaoDeTeste`, e o engine o repassa no envio das hipóteses. O flag fica fora da entidade `Project`, para não aparecer no DTO público. Foram consideradas as opções B (flag da instalação), que marcaria todo projeto da instalação, e C (conta `@brabo.dev`), que acopla regra de produto a um domínio de e-mail. A convenção de nome do projeto foi descartada, porque qualquer usuário pode nomeá-lo assim.
5. **Término anormal só no teste.** `terminationAnalysis` passa a ser exigida apenas em sessão de teste, porque término anormal é assunto da plataforma. Fora do TP-01 o prompt não a pede, e a api não a exige.
6. **Lote vazio é válido.** Uma sessão sem nada errado no produto termina com análise de zero hipóteses, não com `analysis_skipped`. O `createMany` com lista vazia não é chamado.
7. **Anamnese sem desvio.** A ferramenta `report_agent_deviation` é removida, junto com o evento `anamnese.agent_deviation` e a regra do kickoff que mandava registrá-lo. A parte "reparo não é traço da pessoa" da RN-716 continua. A projeção no grafo do tipo removido sai, e o spec de ausência passa a cobrir `psychologist.platform_signal`.
8. **Regra nova.** A RN-1076 (engine, `parte-06`) registra o escopo das Percepções e o sinal interno só no TP-01. A RN-717 recebe a nota de revogação, com a âncora mantida (é contrato do gerador). A RN-079 ganha nota de revisão: uma sessão com evento analisável mas sem nada errado no produto termina com análise de zero hipóteses.
9. **Leitura do sinal.** O TP-01 lê o sinal pelo endpoint de eventos da sessão, filtrando `type`, ou por consulta só-leitura ao event log da instalação. O condutor copia os sinais para o `achados.md` da rodada. Não há tela nova.

## Alternativas rejeitadas

- **Flag da instalação (B).** Menor mudança, mas todo projeto daquela instalação viraria sessão de teste, e um projeto real ali geraria o sinal fora da letra da decisão do dono.
- **Conta `@brabo.dev` (C).** Frágil: a conta de acesso rápido também é usada em dev e em captura, e o TP-01 pode não usá-la.
- **Manter `anamnese.agent_deviation` e somar o sinal de plataforma.** Mantém um evento com leitor só do mantenedor e a Anamnese produzindo uma falha que não é do perfil.

## Consequências

- Percepções passa a mostrar só o que está errado no produto do usuário. Uma sessão comum com falha técnica da plataforma não gera nada na aba.
- A falha técnica do TP-01 chega ao condutor por `platform_signal`, sem poluir o produto. O roteiro do TP-01 ganha o passo de marcar o projeto logo depois de criá-lo. Esquecer a marcação faz o sinal se perder.
- A 0205 não é editada, por ser aceita. A ADR nova a substitui pela referência. O índice gerado mostra o status de cada ADR pelo próprio arquivo.
- **Dados antigos ficam.** As hipóteses já gravadas e os eventos `anamnese.agent_deviation` continuam no banco. Nada é migrado. As 8 percepções da 28ª ficam como evidência do comportamento anterior.
- **Lacuna declarada:** o reconhecimento do escopo é do modelo. O código garante a forma (`escopo` obrigatório, com enum fechado), a evidência e o destino, mas não garante que o modelo classificou certo. A prova é a rodada seguinte do TP-01, com o `achados.md` lendo os sinais e as Percepções do projeto só com hipóteses de produto.
- Percepções ainda não tem funcionalidade no catálogo do `brabo-qa`. O regressivo do engine e da api cobre a mudança, sem spec E2E nova, porque a aba não está no mapa e o Psicólogo é chamado a LLM, fora do E2E com dublê.
