# ADR 0298 — O projeto guarda o registro do que subiu, e o broker lê o host e remove o que é do projeto apagado

- **Status:** aceito
- **Data:** 2026-11-17
- **Tema:** `container`
- **Referencia:** AT-980 (EP-036), levantamento da Rodada 382 e decisões do dono de 17/11/2026 (P1 e P2). Estende o ADR [0130](0130-broker-de-container.md) (broker sem especificação livre) e o ADR [0264](0264-o-app-reinicia-so-o-processo.md), e revisa a escolha de porta do ADR [0265](0265-o-app-declarado-propoe-recriar-o-container.md) (porta na faixa 13000+) e a frase "seis operações/rotas" do `CLAUDE.md` do `brabo-broker`: o ADR aceito não se edita, esta ADR é quem acrescenta as rotas.

## Contexto

- No TP-01 da 29ª rodada a porta 13000 foi escolhida pelos eventos de rede da api, sem olhar o host (atalho declarado em `propor-recriacao-do-app.use-case.ts`). O container órfão de um projeto apagado ainda a publicava. O `run` falhou com bind e deixou um `Created` sem rede, que o `start` seguinte religou.
- A api não enxerga o daemon, e o broker só tinha seis operações, todas presas ao contexto de um projeto que existe.
- Apagar o projeto é `DELETE` com `cascade` (`project_containers.project_id … onDelete: 'cascade'`). Depois disso nenhum caminho alcança o container: o broker devolve `ProjetoDesconhecidoError`.

## Decisão

1. **O broker lê o host.** Operação nova, só de leitura e sem parâmetro: `GET /host/recursos`. Devolve as portas publicadas de todo container `running` (para o que não tem `brabo.managed=true`, só o número da porta, com `projectId: null`: nome e imagem de terceiro não saem do broker) e os containers e redes `brabo.managed` com o rótulo `brabo.project.id`. Nada vindo do chamador chega ao daemon.
2. **O broker remove o órfão por rótulo.** Operação nova: `POST /containers/:id/orfao/remove`. Só age quando a api responde 404 para aquele `projectId`; então remove, por `brabo.managed=true` mais `brabo.project.id=<id>`, containers, serviços de QA e redes. Com o projeto vivo, recusa com 409 e manda usar `remove`.
3. **A api escolhe a porta lendo o host**, na proposta e de novo no clique, antes do `remove` do recreate. Conta como ocupada a porta publicada por qualquer container que não seja do próprio projeto e a declarada na rede vigente de outro projeto. A porta tomada entre a proposta e o clique gera nova versão da rede, com ator = quem clicou. O `start` com a porta ocupada falha nomeado, antes do broker. Broker fora do ar: usa só as declaradas e nomeia "porta não conferida no host".
4. **Todo recurso criado leva o rótulo `brabo.project.id`**, inclusive a rede de QA (hoje só `brabo.managed`). É a verdade do que existe e sobrevive à api e ao banco.
5. **O projeto tem memória do que foi subido.** A api mantém a tabela `project_resources`, sem FK com `cascade` para `projects`, com o estado de cada recurso pedido ao broker: `pedido`, `criado`, `falhou`, `removendo`, `removido`. Escreve `pedido` antes de `start`/`startQa`, `criado` ou `falhou` (com motivo) depois, e `removido` depois do `remove`. `project_containers` e `project_qa_environments` seguem como ciclo de vida; o registro é o inventário.
6. **Um laço de reconciliação** (no boot e periódico, intervalo por variável de ambiente) retoma as linhas `removendo`, remove o resto de subida que `falhou` em projeto sem ciclo `running` e transforma em linha `removendo` todo `brabo.project.id` do host que não existe em `projects`. Broker fora do ar: registra o motivo e tenta no tique seguinte.
7. **Apagar o projeto não espera o broker.** Na mesma transação do `DELETE` as linhas viram `removendo`; depois do commit a api tenta `orfao/remove` e, se falhar, a remoção fica pendente (e visível na página global de containers) até o laço retomá-la. Modo `runner`: nada vai ao broker.

> **Confirmado pelo dono em 18/11/2026:** o item 7 vale como escrito. Apagar o projeto com o broker fora do ar o faz sumir na hora; o registro marca os recursos como `removendo` e o laço de reconciliação limpa o host quando o broker voltar.

Nas palavras do dono (17/11/2026): "Cada projeto deve ter memória do que foi subido, logo conseguirá resolver e deletar o que não ocorreu e erro para conseguir resolver."

## Alternativas recusadas pelo dono (17/11/2026)

- **(A) Tentar a próxima porta às cegas**, até 10, a partir da mensagem de erro do daemon (`port is already allocated`). Recusada: escolhe sem olhar o host e classifica a falha por texto do vendor, o que o `executar` do `docker-port` proíbe (ADR 0002 e 0041).
- **(B) Só falhar com nome e o humano tentar de novo.** Recusada: a 13001 também pode estar ocupada, e o humano vira a sonda.

## Consequências

- A leitura do host passa a ser a fonte da porta. Processo do host fora do Docker continua invisível ao broker (ele roda numa rede bridge e só vê porta publicada por container); a falha desse caso sai pelo motivo do daemon, repassado inteiro.
- A remoção de órfão existe e é segura por construção: quem prova que o projeto não existe é a api (404), e o broker só toca o que é `brabo.managed`.
- Fecha a lacuna declarada em `instancia-de-qa.use-case.ts` (serviço compartilhado e rede `brabo-qa-<wd>` sem operação de remoção).
- O broker passa de seis para oito operações; o cabeçalho de `operacoes.ts`, o 404 de `servidor.ts` e a regra "são seis operações" mudam junto. O `docker-port` ganha `recursosDoHost` e `removerPorProjeto`, com nova TAG do `brabo-contracts`.
- A api ganha migração (`project_resources`), o helper de registro e o laço de reconciliação; a web mostra "remoção pendente" na página global de containers. O órfão de hoje some pelo laço, sem gesto manual.
- Volumes nomeados ficam fora do registro: o broker só cria bind, e a prova de compose limpa com `down -v`.
- A RN-1025 não muda. Nenhum teto absoluto muda (merge em branch protegida, nenhum `privileged`/`cap_add`/`network: host`/`-v` livre).
