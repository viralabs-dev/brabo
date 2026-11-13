# ADR 0296 — O teto de gasto é mensal e o workspace tem teto próprio

- **Status:** aceito
- **Data:** 2026-11-11
- **Tema:** `llm`
- **Referencia:** AT-934 (o teto do projeto passa a ser mensal) e AT-935 (o workspace tem teto de gasto), EP-035. Levantamento da Rodada 374 (lane L-adr), com os SHAs `brabo-api` `c540dde`, `brabo-engine` `e0032da`, `brabo-web` `a58dbc9` e `brabo` `d0cbc89`. Decisões do dono de 11/11/2026, com as recomendações do levantamento adotadas como padrão. Estende o ADR [0110](0110-budget-por-area-aditivo-nao-cascata.md) (teto de área aditivo, não cascata) e o ADR [0012](0012-dev-agent-real-toolloop-orcamento-bloqueio.md) (bloqueio por orçamento).

## Contexto

O teto de gasto de projeto é um contador acumulado: `budgets.spent_micros` só soma e nunca zera (`brabo-api:src/infrastructure/persistence/drizzle/budget.repository.ts:92`). Depois que o projeto gasta o teto, ele fica bloqueado para sempre, até alguém aumentar o limite à mão. O teto de área também é acumulado (RN-443), e o cartão do plano compara um resto que zera com outro que não zera.

O workspace não tem fuso, nem no usuário, nem na tabela `workspaces`. O único "mês" que existe é o `date_trunc('month', now())` no fuso da sessão do Postgres, e o relatório por dia já usa UTC. Duas pessoas no mesmo workspace veriam viradas diferentes para o mesmo teto se o fuso fosse do usuário.

A tela da v9 da aba Gastos pede teto do mês, dias restantes e previsão de fim de mês. Ela também pede um teto de gasto do workspace, que hoje não existe: `budgets` aceita só `project_id` ou `session_id`.

## Decisão

1. **Teto de projeto mensal.** O gasto do projeto conta por mês civil em **UTC** e zera na primeira gravação do mês seguinte. A virada é preguiçosa, feita na própria gravação do gasto (`incrementSpent`), sem tarefa agendada. A chamada conta no mês em que é registrada.
2. **Teto de área mensal**, com o mesmo mecanismo.
3. **Teto de sessão acumulado.** A sessão é uma conversa, não um mês, e continua sem virada.
4. **Teto de workspace mensal**, com o mesmo mecanismo. Ele soma toda chamada de LLM de todos os projetos do workspace, de qualquer ator. Só o `owner` lê e define o teto. A política padrão é `block`, e `allow` (só avisar) é aceito.
5. **Quatro tetos independentes.** O gate verifica workspace, projeto, sessão e área. Nenhum herda nem limita o valor do outro, e basta um deles no limite, com política `block`, para recusar a chamada. O primeiro a chegar bloqueia. Não existe "vence o menor valor".
6. **Previsão linear de fim de mês.** `previsão = gasto × duração do mês ÷ dias decorridos`, com no mínimo um dia decorrido. É derivada na leitura e nunca gravada. Na sessão não há previsão.
7. **A tarefa bloqueada não retoma sozinha.** Uma tarefa ou um turno bloqueado pelo teto do mês continua bloqueado na virada. A retomada é o Desbloquear ou o Rearmar que já existem. Retomar à meia-noite gastaria sem ninguém olhando.
8. **Fuso fixo em UTC**, igual para o workspace inteiro. A tela mostra "o mês vira no dia 1 às 00:00 UTC" e converte para a hora local só na legenda. Os `date_trunc` existentes passam a usar `at time zone 'UTC'` explícito, para não depender do fuso do servidor.
9. **Migração recalcula o mês.** Para cada teto mensal, a migração grava o mês corrente e recalcula `spent` como a soma de `token_usage` desse mês, em UTC, de todos os atores. O último limiar já cruzado é marcado para não reavisar. A sessão apagada leva o `token_usage` junto, por cascata, então o recálculo pode ficar abaixo do real. Isso é aceito e fica registrado aqui.

Os avisos de 70, 90 e 100% são rearmados a cada mês. O evento `budget.threshold_crossed` passa a trazer o período (`YYYY-MM`) e, no workspace, o escopo `workspace`.

## Consequências

- **Positivo:** o projeto deixa de ficar bloqueado para sempre por gasto antigo, e o teto passa a dizer quanto resta no mês e quanto deve sobrar no fim dele.
- **Positivo:** a virada sem cron mantém o gate certo já na primeira chamada do mês, e não depende de um job que pode falhar.
- **Positivo:** o workspace ganha um teto que cobre o gasto de todos os projetos, sem mexer no gate além de um quarto teto independente.
- **Custo:** o teto de sessão continua acumulado, e isso é uma exceção que a tela precisa explicar ao lado do rótulo "mês".
- **Custo:** o fuso fixo em UTC pode não bater com o dia do usuário. A tela mostra o horário da virada, mas o teto é compartilhado e não tem fuso por pessoa.
- **Custo:** a tarefa bloqueada no fim do mês exige um clique para voltar no dia 1, e isso é intencional.
- **Custo:** o recálculo da migração pode ficar abaixo do real quando uma sessão foi apagada no mês.
- **Custo:** o número de tetos cresce para quatro, e cada um precisa ser conferido no gate e na tela.

## Alternativas descartadas

- **Fuso por usuário ou por workspace.** Duas pessoas no mesmo teto veriam viradas diferentes. Um fuso por workspace fica para uma AT própria, se o dono pedir.
- **Virada por cron ou job agendado.** Cria um ponto de falha fora do caminho da chamada e não ajuda o gate na primeira chamada do mês. A virada preguiçosa na gravação resolve sem job.
- **Tarefa bloqueada retomada sozinha na virada.** Gasta sem ninguém olhando. Ficou o Desbloquear.
- **Teto de workspace com "vence o menor valor" entre os tetos.** Não captura o caso de três projetos abaixo do próprio teto que, somados, passam do teto do workspace. Por isso os tetos são independentes e o primeiro a chegar bloqueia.
- **Teto de workspace visível a todo membro.** A fatura é de quem paga, e a régua da RN-060 já é de `owner`. Quem não é `owner` vê só a recusa, com o motivo "teto do workspace", sem valores.
- **Aumentar a janela de cálculo para um mês deslizante.** A rota de gasto por agente segue como janela de 30 dias deslizante, com o rótulo "30 dias". Ela não é um teto e não muda com esta decisão.
