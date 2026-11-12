# ADR 0294 — A estrutura v9: oito seções com sub-abas, Caixa de decisões e Agentes agora

- **Status:** aceito
- **Data:** 2026-11-11
- **Tema:** `web`
- **Referencia:** AT-885 (EP-035), respostas do dono na AT-882 (11/11/2026) e levantamento da AT-883. Revisa o [ADR 0211](0211-uma-navegacao-so-a-sidebar-absorve-o-trilho.md) só no CONTEÚDO da lista (12 abas em três grupos): a sidebar segue a única navegação, a aba ativa vem da moldura, o teclado, o flyout recolhido, a gaveta no telefone e os contadores por aba nunca somados. Continuam valendo o [0241](0241-a-sidebar-adota-o-block-sidebar-07-do-shadcn.md) (larguras 256/48, Configurações em abas), o [0248](0248-conteudo-das-paginas-ocupa-a-largura-inteira.md) e o [0250](0250-chat-da-sessao-ocupa-a-largura-inteira.md) (largura inteira) e o [0181](0181-tema-preto-neutro.md) (pisos de contraste). RN-467, RN-731. A referência visual vigente passa a ser a prévia `13-design/v9-estrutura/` do Vault, registrada em `design/` do `brabo-web`.

## Contexto

A v1 a v8 mudaram o visual. A v9 muda a estrutura: o que cada tela mostra primeiro. Medido nas capturas da v8, a Visão geral tem 2.846 px, quase tudo linha do tempo; o fio da sessão com os passos abertos chega a 8.000 px; a sidebar lista 12 abas e uma lista "Atividades" que conta eventos e não diz o que fazer; a única entrada para o que espera o dono é o chip "Precisa de você". A promessa do produto é a autoridade final do dono, e a tela mostrava primeiro o log e por último a decisão. O dono aprovou a v9 em 11/11/2026 (AT-882).

## Decisão

1. **Oito seções.** Visão geral, Sessões, Trabalho, Código, Decisões, Arquitetura, Gastos e Configurações. O registro `project-tabs.ts` passa de 12 abas para 8 seções, e as abas antigas viram sub-abas numa faixa no topo do conteúdo (a de Configurações do 0241):

   | seção | sub-abas | vinha de |
   |---|---|---|
   | Visão geral | — | Visão geral |
   | Sessões | Todas, Ideação, Conversa | Criativo, Chat |
   | Trabalho | Backlog, Execução | Histórias, Executores |
   | Código | Arquivos, PRs | Código, PRs |
   | Decisões | Aprovações, Hipóteses, Permissões | Aprovações, Percepções |
   | Arquitetura | — | Arquitetura |
   | Gastos | — | Gastos |
   | Configurações | Modelos, Projeto e execução, Pessoas e acesso, Avançado | Configurações |

   As chaves de URL de hoje viram as chaves das sub-abas, e todo link antigo abre a mesma tela. Ficam fora desta decisão as vistas "ADRs" e "Contratos" da Arquitetura e a sub-aba "Commits", que dependem de fonte (levantamento da AT-883).
2. **Caixa de decisões global.** Entra agora (resposta 2 da AT-882): item fixo da sidebar e rota global `/decisions`, com as filas de TODOS os projetos. São **5 filas**, iguais às de `useContagensDoProjeto`: Aprovações, PRs para mergear, Hipóteses, Promoções de história e Pendências de arquitetura. Cada fila mostra a própria contagem; nunca são somadas (RN-467), e a sidebar mostra só presença (ponto). Na Visão geral, a faixa "Precisa de você" abre a página, com o item mais urgente; ela renderiza o mesmo `ApprovalCard` e chama os mesmos endpoints, e nenhum teto muda. A fonte das filas de vários projetos é a AT-928 (uma leitura do workspace, na `brabo-api`).
3. **Agentes agora.** Substitui a lista "Atividades" da sidebar (resposta 3). Mostra no máximo 5 agentes, com avatar, nome e status (`trabalhando`, `aguardando`, `ocioso`, `falhou`), mais "ver todos", e deixa de mostrar contagem de eventos.
4. **Tokens aprovados** (resposta 4): corpo 13 para 14 px (`--fs-body`), rótulo 10 para 11 px (`--fs-label`), meta 11 para 12 px (`--fs-meta`), títulos 22/18 para 24/20 px (`--fs-h1`/`--fs-title`), o novo `--surface-3` (`#24242a` no escuro, `#ececef` no claro) e uma cor por papel de agente (`--ag-*`, oito papéis, nos dois temas). Os pisos de contraste do 0181 não são afrouxados; os pares novos entram no `design-contraste.test.ts`. A aplicação é da AT-884.
5. **Superfície quente: fica de fora** (resposta 5). Cada tema a mais dobra a medição de contraste. Volta só por decisão nova.
6. **Resumo de turno.** Um turno é uma linha: agente, passos, a linha "Gravado neste turno" do engine (RN-731, resposta 6), custo e hora. O texto vem do engine, nunca do modelo. Os passos abrem sob demanda, agrupados por intenção a partir de um mapa tipado ferramenta para grupo, no web. Para a linha ser dado e não texto colado, o fecho do turno grava como campos o que foi gravado, o custo, as chamadas, o raciocínio e a duração (AT-933, destrava a AT-891).
7. **Teto mensal e teto de workspace entram por ATs próprias.** O medidor do cabeçalho só mostra o que tem fonte. O teto do projeto passa a ser mensal e zera a cada mês, com previsão de fim de mês (AT-934, que pede o ADR 0296), e o workspace ganha teto de gasto (AT-935). Até lá a tela não afirma o que o produto ainda não calcula.
8. **"Próximo passo" é regra do produto** (AT-936): uma RN e uma tabela tipada dizem o próximo passo de cada tipo de item; a coluna da Visão geral lê essa tabela.
9. **Cabeçalho do projeto:** trilha seção, repositório e branch, medidor do mês e uma ação primária por tela.

## Consequências

- A sidebar do projeto cai de 12 para 8 itens, e a lista de agentes para de crescer com os eventos.
- `resolverChaveDeAba` passa a devolver seção e sub-aba e resolve as 12 chaves e os aliases de hoje; os testes de teclado cobrem 8 itens e os `*.orcamento.test.tsx` não sobem teto.
- Depois deste ADR, qualquer agente que mexer em tela segue `design/` do `brabo-web`, e `design/` é a v9. Cada tela é conferida contra a imagem de mesmo id da prévia (AT-897).
- O "Gravado neste turno" vira peça de tela: mudar o rótulo no engine muda a tela.
- O regressivo do `brabo-qa` das funcionalidades de navegação muda junto.
- Ordem das lanes: AT-884 (tokens) e AT-885 (este registro) primeiro; endpoints (AT-928 a AT-933) antes das telas que os leem; AT-934 a AT-936 não bloqueiam a v9, e o que depende delas fica fora da tela até chegarem.
