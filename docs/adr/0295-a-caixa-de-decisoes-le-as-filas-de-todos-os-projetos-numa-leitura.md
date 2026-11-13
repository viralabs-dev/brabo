# ADR 0295 — A Caixa de decisões lê as filas de todos os projetos numa leitura do workspace

- **Status:** aceito
- **Data:** 2026-11-12
- **Tema:** `execucao`
- **Referencia:** AT-928, EP-035. Levantamento da Rodada 376 (`brabo-api` `119b86db`, `brabo-web` `95454bf`). Decisões do dono de 11/11/2026 (Caixa agora, cinco cartões) e de 12/11/2026 (a rota agrega também as decididas; a quinta fila são as hipóteses do Psicólogo). Estende o ADR [0060](0060-superficie-de-leitura-de-codigo.md) (leitura contida, com teto e orçamento) e o ADR [0294](0294-a-estrutura-v9-oito-secoes-com-sub-abas-caixa-de-decisoes-e-agentes-agora.md) (a Caixa na v9). Apoia-se na RN-090 (resumo do workspace), na RN-467 (as filas nunca se somam), na RN-471 (o papel de projeto sobrepõe o de workspace) e na RN-1154 (decididas por janela).

## Contexto

A v9 põe a Caixa de decisões na sidebar como rota global (S07). Hoje cada fila só existe por projeto, e a tela a lê com quatro hooks por projeto, a cada 15 s. Para N projetos são 4N leituras por poll, o mesmo defeito que a RN-090 fechou no dashboard, e com 23 projetos passa do rate limit de 300 por minuto.

As cinco filas de decisão do projeto são aprovações, PRs para mergear (`git_merge`), promoções de história, pendências de arquitetura e hipóteses do Psicólogo. As perguntas abertas (ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md)) são pendência declarada por agente e não bloqueiam nada, então não entram.

## Decisão

1. **Uma rota de workspace só de leitura**, `GET /workspaces/:workspaceId/decision-inbox` (`viewer` no guard), que devolve as cinco filas de todos os projetos que o chamador pode decidir. A decisão continua nos endpoints de hoje, e nenhum teto muda (merge em branch protegida segue `require_approval` incondicional).
2. **Cinco filas separadas, nunca somadas.** Cada fila tem o próprio `total`, e a raiz da resposta não tem `total` nem campo que some filas. `projetos[]` traz cinco números separados por projeto. As aprovações são as pendentes exceto `git_merge`, e os PRs são só o `git_merge`, para o mesmo cartão não aparecer em duas filas.
3. **Pendentes e decididas.** A rota aceita `status=pending|decided`. Em `decided` vale `since`, com padrão de 24 h, no molde de `actions?status=decided&since` (RN-1154). Janela e teto valem para as decididas, e o `total` é o real.
4. **Papel efetivo resolvido em lote.** O caso de uso lê numa única consulta as linhas de `project_members` do usuário no workspace e aplica a mesma função pura `papelEfetivo(projectRole, workspaceRole)` que `ResolveEffectiveRoleUseCase.forProject` passa a chamar (RN-471). O papel mínimo por fila é o de decidir: `developer` em aprovações, PRs, promoções e hipóteses, e `viewer` em arquitetura, que não tem rota de decisão humana. O projeto abaixo do mínimo de uma fila não contribui com ela, nem com item nem com contagem. Quem não tem papel de workspace recebe 403, como em `projects-summary`.
5. **Orçamento de queries constante em N.** Cerca de nove consultas, as mesmas com 1 ou com 100 projetos, com `inArray(project_id, ids)` e `GROUP BY`. Um teste conta as consultas com 1 e com 25 projetos e exige o mesmo número.
6. **Teto por fila.** `TETO_DE_ITENS_POR_FILA = 50`, mais antigos primeiro, com `total` real e `truncada`. Truncar diz o total, nunca cala. É ponto de partida, a medir.
7. **A pendência de arquitetura vem de uma função pura única**, extraída de `GetArchitectureUseCase` e usada pela aba do projeto e pela Caixa. Ela não tem data própria: a linha leva `dataEmprestada` e a data da história.
8. **Não há migração.** A leitura é de tabelas existentes. Se a medição com volume pedir o índice parcial `proposed_actions (project_id) WHERE status = 'pending'`, ele nasce depois, em PR própria, com o número conferido.

## Consequências

- **Positivo:** uma leitura, e não 4N, por poll, e a tela guarda uma chave de query só.
- **Positivo:** o número da Caixa é o mesmo da aba do projeto, porque as duas usam a mesma função de arquitetura e a mesma régua de papel.
- **Custo:** superfície nova (`route-surface`, `openapi.json`), e só quem tem papel de workspace usa a rota.
- **Custo:** a arquitetura varre as histórias não arquivadas de todos os projetos em memória. Passar de cerca de 2 mil linhas por leitura reabre este ADR.
- **Custo:** `proposed_actions` não tem índice por `project_id`, e o resumo já lê assim hoje. Medir antes de indexar.
- **Custo:** a pendência de arquitetura segue sem data própria.
- **Fora de escopo:** canal vivo para a Caixa (RN-632).

## Alternativas descartadas

- **Fan-out no web (4N leituras).** Estoura o rate limit.
- **Estender `projects-summary` com os itens.** Mistura o cartão leve do dashboard com payload pesado.
- **Uma rota por fila.** Cinco leituras e cinco resoluções de papel por poll, e filas lidas em instantes diferentes.
- **Tabela ou projeção de pendências alimentada por evento.** É segunda fonte que diverge e pede migração. Reabrir se a medição passar do teto.
- **Perguntas abertas como quinta fila.** Não bloqueiam nada, e as hipóteses do Psicólogo são a fila do código.
