# ADR 0293 — O projeto tem memória em markdown que o dev lê antes de explorar

- **Status:** proposto
- **Data:** 2026-11-11
- **Tema:** `conhecimento`
- **Referencia:** AT-923 (EP-036), pergunta do dono de 11/11/2026 sobre o modelo escolhido e o contexto máximo. Levantamento da Rodada 370 (lane L1), com os SHAs de `brabo-engine` `8ec860f`, `brabo-api` `46d41b5` e `brabo` `8555ed765`. Relaciona-se com o ADR [0148](0148-artefatos-projetados-em-arquivo.md) (artefatos em arquivo), o [0099](0099-neo4j-grafo-de-conhecimento-e-templates.md) e o [0101](0101-memoria-relacional-como-projecao-do-event-log.md) (grafo e projeção), o [0100](0100-rag-search-e-modelos-garantidos-no-boot.md) (`rag_search`) e o [0200](0200-contrato-entre-modulos-artefato-do-arquiteto.md) (contrato entre módulos).

## Contexto

Na 28ª rodada do TP-01, o dev do módulo de agendamento precisou de um modelo maior que o Haiku 5.5 para fechar a tarefa. O problema não estava só no modelo. Os números do banco do dev mostram o custo de contexto e de exploração:

- **Contexto por chamada, Haiku 5.5:** média de 57 mil tokens, p95 de 107 mil e máximo de 149 mil, em 604 chamadas. A janela de trabalho do dev é de 128 mil tokens, e acima disso o `ContextManager` compacta. O Sonnet 5 rodou com o mesmo perfil e fechou a tarefa por força bruta.
- **Exploração:** 886 chamadas de ferramenta. São 464 `read_file`, 544 `terminal`, 33 `listar_contratos_de_modulos`, 30 `search_workspace` e apenas 5 `rag_search`. O dev descobre os módulos vizinhos lendo arquivo por arquivo.
- **Causas somadas:** o contrato do Arquiteto não batia com o código, e o QA mudava a régua. O limite de iterações foi o sintoma.

A compactação apaga o que o dev já leu. O conteúdo dos arquivos, as assinaturas, a saída dos testes e o contrato lido por `listar_contratos_de_modulos` não são fixados, e por isso o dev os relê. Na correção, a volta do QA recomeça só com o enunciado, e cada reprovação obriga a reexplorar o módulo inteiro.

Hoje o projeto não tem memória própria que o dev leia:

- o `Engine.Harness.InstructionFiles` lê os `AGENTS.md` do workspace, da raiz e de cada diretório, mas **nada os escreve** à medida que o projeto evolui;
- o grafo Neo4j guarda só a memória do **usuário** (handoff, hipótese do Psicólogo, perfil da Anamnese, fechamento de sessão). Não há nó de módulo, contrato, decisão ou código, e os templates do grafo ficam desligados por `GRAPH_INSTRUCTION_TEMPLATES_ENABLED` (padrão `false`). Ligar a flag hoje não entrega nada, porque não há template com o nome do agente;
- o `rag_search` indexa só os `.md` de `docs/` e `docs/adr/` do repo do projeto e as sessões. Código e memória de módulo não entram, e a reindexação é manual. Por isso o dev quase não o usa.

O pedido do dono é uma memória do projeto gravada localmente em markdown, que o dev consulte antes de explorar, em vez de depender de um grafo que hoje não funciona como memória do projeto.

## Decisão

1. **A memória do projeto fica em `.brabo/memoria/`, versionada no repositório do projeto.** Ela tem um cartão por módulo, em `modulos/<m>.md`, e um `decisoes.md`, com as ADRs do projeto resumidas em uma linha cada. Cada cartão tem seções geradas (entre marcadores `<!-- brabo:gerado -->`), como o que o módulo expõe, os scripts, as dependências, as migrações e o contrato declarado, e uma seção humana "Como usar". Nenhum arquivo compartilhado é editado por todos, para não repetir o conflito de README entre tarefas paralelas.

2. **A escrita é mecânica no `report_done`, sem LLM.** O engine regenera o cartão do módulo da tarefa no worktree antes do `propose_commit`, de modo que o cartão entra no mesmo commit e na mesma PR, passa pelos gates e chega à `main` junto com o código. A seção "Como usar" vem do próprio dev, por um parâmetro novo `como_usar` no `report_done`, e só substitui essa seção. A primeira versão cobre TS/Node (`package.json`, exports do ponto de entrada, rotas por regex ou `openapi.json`, pasta de migrações); outras linguagens saem só com a seção humana e a lista de arquivos.

3. **O contrato é renderizado no cartão, mas a fonte continua no banco.** O contrato declarado pelo Arquiteto segue versionado e validado pela api, e o gate o lê. O cartão mostra o contrato declarado e também a divergência entre o contrato e o código, nos dois sentidos. A divergência é dita no cartão, nunca corrigida em silêncio.

4. **A leitura é uma mensagem fixada no kickoff e na correção, com até 8 mil tokens estimados.** A mensagem "Memória dos módulos" traz o cartão do módulo da tarefa e, dos módulos de que ele depende, só as seções que o dev precisa para integrar (expõe, como usar e contrato). Se o total passar do orçamento, o corte é declarado. Como a mensagem é fixada, a compactação não a apaga. A correção leva a mesma memória, o retrato do worktree e o resumo do `report_done` anterior. O resto fica a um `read_file` de distância, e o cartão diz o caminho.

5. **O markdown é a fonte, e o RAG e o grafo são índices.** O markdown é o que o sistema escreve e o dev lê. O RAG passa a indexar `.brabo/memoria/` e a reindexar no merge, numa fase seguinte. O grafo passa a projetar os cartões (nós de módulo, contrato e decisão) numa AT própria, e fica fora do caminho crítico. Com o grafo e o RAG desligados, a memória continua funcionando, porque o caminho principal é o kickoff.

## Alternativas descartadas

- **`AGENTS.md` por módulo, como memória.** O `InstructionFiles` já lê esses arquivos, mas o desenho não serve. Ele lê **todos** os `AGENTS.md` da árvore, sem filtro por tarefa. Os 4 000 tokens da camada `instruction_files` são divididos entre instrução e memória, e o corte descarta por profundidade e caminho, sem olhar relevância. A semântica também não bate: `AGENTS.md` é **instrução** ("o mais profundo vence"), e a memória é **fato com dono**. O arquivo é do usuário, e o sistema reescrevê-lo misturaria texto humano com texto gerado. O cache dele é um ETS sem TTL e sem invalidação no merge, e a varredura desce em `node_modules`. Por isso ficou um `.brabo/memoria/` à parte. A raiz ganha só uma linha de ponteiro, e o `AGENTS.md` continua sendo instrução. Codex e Claude Code leem o `AGENTS.md` nativamente, então a linha basta para as ferramentas de fora.
- **`projeto.md` e `contratos.md` próprios dentro da memória.** O pedido e as regras já entram pelas camadas `regras_negocio` e `estado_tarefa`. Trocar a fonte do contrato para o markdown tiraria a validação da api e a leitura do gate. O contrato só é renderizado no cartão.
- **O grafo como memória do projeto, já na fase 1.** O grafo não funciona ponta a ponta para isso. Não projeta nada do projeto do usuário, e o dev não lê nada dele. Ligar a flag não resolve. Ele fica como índice, numa fase posterior.
- **Só o RAG, sem cartão.** O RAG indexa só `docs/` e sessões, a reindexação é manual, e o dev usou cinco buscas. Um índice sem fonte não ensina o dev a começar pelo módulo certo.
- **Aumentar a janela de 128 mil tokens.** Trataria o sintoma. A causa é a reexploração que a compactação força, e a correção recomeçando do zero. Com a memória fixada e a correção com contexto, o contexto deve cair abaixo do gatilho sem mudar a janela.

## Consequências

- **Positivo:** o dev começa pelo que os módulos expõem, sem ler arquivo por arquivo. A memória é gerada sem custo de LLM e entra na PR, com revisão. O projeto ganha uma memória que sobrevive à compactação e à troca de sessão.
- **Positivo:** o desenho não depende do grafo nem do RAG para funcionar. Os dois são acréscimos, e a falha deles não derruba a leitura.
- **Custo:** a cobertura mecânica começa em TS/Node. Outras linguagens têm só a seção humana e a lista de arquivos, até uma fase posterior.
- **Custo:** a seção "Como usar" depende do dev escrevê-la. O `initial_message` pede o parâmetro quando a tarefa muda o que o módulo expõe, mas a disciplina é do processo, não do código.
- **Custo:** o cartão aumenta o diff de cada PR, e a seção gerada é sobrescrita a cada `report_done`. Um arquivo por módulo limita o conflito, mas não o elimina.
- **Custo:** o orçamento de 8 mil tokens é estimativa, e o total real é dito quando corta. Projeto antigo, sem cartão, começa com a mensagem dizendo que não há memória ainda. Nada quebra, mas o ganho só aparece depois da primeira tarefa.
- **Medição:** o critério de aceite é medido no próximo TP-01 pelo banco do dev, com a linha de base da 28ª: tarefa de integração fechando no Haiku 5.5, `read_file` por tarefa no máximo da metade, contexto p95 abaixo de 64 mil tokens e `context.compacted` no máximo um por tarefa.
- **Fora desta decisão:** o raciocínio do dev, que hoje roda desligado por decisão do dono (RN-783), e a projeção no grafo (fase 3). Cada um tem a própria AT.
