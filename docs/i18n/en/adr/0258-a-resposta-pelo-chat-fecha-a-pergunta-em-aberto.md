---
traducao_de: cca933f4b1f4f0b3cb2211c17da9937c78f9366f
---

# ADR 0258 — An answer given in the chat closes the open question

- **Status:** accepted
- **Date:** 2026-11-05
- **Theme:** `gates`
- **References:** ADR [0214](0214-pergunta-em-aberto-vira-pendencia.md) (extends items 2, 3 and 6; 0214 is not edited), RN-858, RN-860 and RN-862, and RN-1002 (api) and RN-1003 (engine), which implement this decision (AT-741, EP-030, owner's decision of 11/05/2026).

## Context

In the TP-01 of 11/05 (24th round), the Creative left four open questions. The user answered all four in the chat, and the Creative recorded the rules and the decision. The questions, however, stayed in the queue with "Accept suggestion": no `open_question.answered` was emitted.

ADR 0214 foresaw only one way to close a question: a click by the session author in the queue (`PerguntasEmAbertoUseCase.responder`). The engine had only the tool that opens the question (`declare_open_question`), none that closes it, and the central instruction did not say what to do when the answer comes through the chat. The answered question stayed open, and the gate parked by `needs_user_decision` stayed stopped.

## Decision

1. **The agent closes the question.** The tool `answer_open_question` (`questionId`, optional `resposta`; without it, the question's own suggestion stands) goes to the four askers of ADR 0214: Creative, PO, Architect and Dev Lead. Any of them closes a question of the project, not only the agent that opened it.
2. **Only with an unambiguous answer.** The central sentence of `fluxo_do_time` says to close only when the user's chat answer is UNAMBIGUOUS; when in doubt, the question stays open and the button still applies. For that, the open questions (with `questionId` and the suggestion) reach the turn of all four askers.
3. **Closing re-arms the gate, like the click.** The effect is the same as the button's: the `decision_record` + `open_question.answered` pair, and the parked gate of each affected task is resumed (RN-860).
4. **An internal route with the same core as `responder`.** The engine calls `POST /internal/projects/:projectId/open-questions/:questionId/answer` with a service token. The route and the human `responder` share a single core; the engine writes no event. `respondidaPor` is still the session author, and the agent goes in `viaAgente`. An already closed question returns `already_answered` (never 409), so the call is idempotent.

## Consequences

- A question answered in the chat leaves the queue without a second gesture from the user, and QA judges again with the decision in context.
- Item 3 of ADR 0214 ("only the session author answers") still holds for the click. The chat answer is the author's own, so the decision is still theirs; the agent only records it.
- Declared price: the agent may read as unambiguous an answer that was not. The yardstick is the central sentence, and the `decision_record` keeps the recorded answer, which the user can check.
- What does not change: the tool is still the only origin of a question (item 2 of 0214), the `needs_user_decision` verdict and the parking of ADR 0207.

## Alternatives considered

- **Only the screen making clear that the question is still open (option b).** Rejected by the owner: the user already answered, and asking for the click repeats the answer.
- **Only the agent that opened the question closes it.** Rejected: the answer may arrive in the chat of another asker of the same project.
- **Detecting the answer in the text, without a tool.** Rejected for the same reason as in 0214: a heuristic over prose errs both ways.

## References

- [0214](0214-pergunta-em-aberto-vira-pendencia.md), [0207](0207-ciclo-de-gate-velho-estaciona.md).
- PR #16 of `brabo-api` (RN-1002) and PR #16 of `brabo-engine` (RN-1003).
