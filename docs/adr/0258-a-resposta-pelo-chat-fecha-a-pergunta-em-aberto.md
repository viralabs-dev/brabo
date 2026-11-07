# ADR 0258 — A resposta dada pelo chat fecha a pergunta em aberto

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `gates`
- **Referencia:** o ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md) (estende os itens 2, 3 e 6; o 0214 não é editado), as RN-858, RN-860 e RN-862, e as RN-1002 (api) e RN-1003 (engine), que implementam esta decisão (AT-741, EP-030, decisão do dono de 05/11/2026).

## Contexto

No TP-01 de 05/11 (24ª rodada), o Criativo deixou quatro perguntas em aberto. O usuário respondeu as quatro pelo chat, e o Criativo gravou as regras e a decisão. As perguntas, porém, seguiram na fila com "Aceitar sugestão": nenhum `open_question.answered` saiu.

O ADR 0214 só previa um caminho para fechar a pergunta: o clique do autor da sessão na fila (`PerguntasEmAbertoUseCase.responder`). O engine tinha só a ferramenta que abre a pergunta (`declare_open_question`), nenhuma que a feche, e a instrução central não dizia o que fazer quando a resposta vem pelo chat. A pergunta respondida continuava aberta, e o gate estacionado pelo `needs_user_decision` continuava parado.

## Decisão

1. **O agente fecha a pergunta.** A ferramenta `answer_open_question` (`questionId`, `resposta` opcional; sem ela, vale a sugestão da própria pergunta) entra nos quatro perguntadores do ADR 0214: Criativo, PO, Arquiteto e Dev Lead. Qualquer um deles fecha uma pergunta do projeto, não só o agente que a abriu.
2. **Só com resposta inequívoca.** A frase central do `fluxo_do_time` manda fechar só quando a resposta do usuário no chat é INEQUÍVOCA; na dúvida, a pergunta segue aberta e o botão segue valendo. Para isso, as perguntas abertas (com `questionId` e a sugestão) chegam ao turno dos quatro perguntadores.
3. **Fechar religa o gate, como o clique.** O efeito é o mesmo do botão: o par `decision_record` + `open_question.answered`, e o gate estacionado de cada tarefa afetada é retomado (RN-860).
4. **Uma rota interna com o mesmo núcleo do `responder`.** O engine chama `POST /internal/projects/:projectId/open-questions/:questionId/answer` com token de serviço. A rota e o `responder` humano compartilham um núcleo só; o engine não grava evento. `respondidaPor` continua sendo o autor da sessão, e o agente vai em `viaAgente`. A pergunta já fechada devolve `already_answered` (nunca 409), para que a chamada seja idempotente.

## Consequências

- A pergunta respondida pelo chat sai da fila sem um segundo gesto do usuário, e o QA volta a julgar com a decisão no contexto.
- O item 3 do ADR 0214 ("quem responde é só o autor da sessão") continua valendo para o clique. A resposta pelo chat é do próprio autor, então a decisão continua dele; o agente só a registra.
- Preço declarado: o agente pode ler como inequívoca uma resposta que não era. A régua é a frase central, e o `decision_record` guarda a resposta registrada, que o usuário pode conferir.
- O que não muda: a ferramenta continua sendo a única origem da pergunta (item 2 do 0214), o veredito `needs_user_decision` e o estacionamento do ADR 0207.

## Alternativas consideradas

- **Só a tela deixar claro que a pergunta segue aberta (opção b).** Recusada pelo dono: o usuário já respondeu, e pedir o clique repete a resposta.
- **Fechar só o agente que abriu a pergunta.** Recusada: a resposta pode chegar no chat de outro perguntador do mesmo projeto.
- **Detectar a resposta no texto, sem ferramenta.** Recusada pelo mesmo motivo do 0214: heurística sobre prosa erra nos dois sentidos.

## Referências

- [0214](0214-pergunta-em-aberto-vira-pendencia.md), [0207](0207-ciclo-de-gate-velho-estaciona.md).
- PR #16 do `brabo-api` (RN-1002) e PR #16 do `brabo-engine` (RN-1003).
