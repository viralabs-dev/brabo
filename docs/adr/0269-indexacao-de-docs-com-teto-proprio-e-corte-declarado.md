# ADR 0269 — A indexação de docs tem teto próprio de 4 MiB, e o corte é declarado

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `conhecimento`
- **Referencia:** revisa o que o ADR [0113](0113-pasta-local-anexada-via-navegador-vira-chunks-scope-local.md) registra sobre `docs`/`adr`, sem editá-lo, e mantém a regra de busca e de citação do [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md). Muda o corpus medido pelo golden-set do [0132](0132-golden-set-de-acerto-do-rag.md) e do [0138](0138-golden-set-do-rag-em-ci-agendado.md). Implementado pela AT-764 (RN-1036, decisão do dono de 06/11/2026).

## Contexto

A indexação de `docs`/`adr` lê cada `.md` do repositório do projeto por `ReadProjectCodeUseCase.file`, e esse método corta o conteúdo em `GIT_BLOB_MAX_BYTES` (512 KiB, RN-095). O corte existe para a aba Code: o payload vai para o navegador, a busca pula arquivo acima do teto e o rate limit do owner é gasto por leitura. A indexação herdou o mesmo teto sem ser desenhada para ele.

Dois efeitos ruins:

- **O corte é silencioso.** O indexador usa só o conteúdo do arquivo e descarta o `truncated`. Nenhum log, nenhum campo no relatório e nenhum aviso. A cobertura conta o arquivo como indexado porque ele tem ao menos um chunk, então mostra 100% com 70% do texto fora. No próprio Brabo, o `business-rules.md` de 1,7 MB perde cerca de 70%. No golden-set, o corpus de 842 KB perde ~318 KB, e o piso de 17 de 17 foi medido com esse corte.
- **O 0113 trata o corte como postura.** Ao justificar por que o `local` recusa o lote em vez de truncar, o 0113 contrasta com `docs`/`adr`, que são uma varredura em segundo plano sem ninguém olhando. Essa postura deixa implícito que um arquivo de `docs` pode ser cortado sem que o usuário saiba.

Um teto único não serve aos dois usos. A aba Code precisa de um limite pequeno, por causa do payload, da busca e do rate limit. A indexação precisa de um limite que cubra um documento real de regras de negócio (1,7 MB). Se o teto da aba subir, a aba e a busca carregam arquivos grandes à toa. Se ele ficar, a indexação continua cortando.

## Decisão

1. **Dois tetos, cada um com dono.**
   - `GIT_BLOB_MAX_BYTES`, 512 KiB, continua sendo o teto da aba Code (leitura de blob, busca e blame), com a RN-095 como está.
   - `RAG_INDEX_FILE_MAX_BYTES`, 4 MiB, é o teto da indexação de `docs`/`adr`. Ele entra como parâmetro com default na leitura do arquivo: a aba Code não muda, e só o indexador passa o teto novo.
2. **O corte é declarado.** Um arquivo acima de 4 MiB é indexado até o teto, e o relatório da indexação lista esse arquivo em `cutFiles`, com os bytes originais. Os chunks dele levam a marca `sourceCut`, que a cobertura conta. O botão "Reindexar agora" avisa quando há corte. Um `.md` com byte nulo, tratado como binário, também é pulado e declarado.
3. **O 0113 é revisado, não editado.** A recusa do `local` (lote inteiro recusado por teto agregado, arquivo individual só pulado) continua valendo. O que muda é `docs`/`adr`: ler um arquivo grande para indexação deixa de ser truncamento silencioso e passa a ser corte declarado no teto de 4 MiB.
4. **Leitura `raw` do GitHub.** O conteúdo de arquivo do GitHub é pedido no formato `raw`. Sem isso, a API de conteúdo devolve vazio para arquivo entre 1 e 100 MB, e o descarte acontece antes do teto. O `local` e o GitLab já devolvem o conteúdo inteiro.
5. **Golden-set remedido, piso não é baixado por esta mudança.** O corpus medido passa a ser o inteiro. Depois do merge, o `golden-set-rag` roda de novo, e o piso é gravado com o número medido no corpus inteiro, mesmo que seja menor que 17. Isso vale para esta mudança, cujo corpus muda. Não autoriza baixar o piso em outra mudança.

## Consequências

- **Custo de embedding e de tempo.** O corpus do golden-set cresce ~25% em chunks, e o `business-rules.md` vivo ganha ~1 500 chunks. O embedding é local (Ollama, `nomic-embed-text`), então não há custo pago, só tempo. A memória transitória de uma rodada sobe ~10 MB, porque o provider já entrega o arquivo inteiro e o cache já o guarda.
- **Pior caso.** Um arquivo de 4 MiB dá ~5 400 chunks. Muitos arquivos grandes na mesma rodada podem estourar o limite de parâmetros de um `INSERT` único no Postgres. Por isso a gravação dos chunks passa a ser em lotes. Este risco já existia e cresce com o teto novo.
- **O corte continua existindo.** Um arquivo acima de 4 MiB ainda não entra por inteiro, e o corte é por tamanho em bytes, não por seção. Ele fica declarado em `cutFiles`, e o teto sobe ou a leitura passa a ser em partes só quando um arquivo real precisar.
- **Ler em partes ficou para depois.** O contrato de leitura devolve a string inteira. Ler por faixa exigiria uma operação nova nos três providers, sem economia de memória, porque o texto inteiro já está no processo. Quando isso for necessário, a leitura por faixa abre outro ADR.
- **Os números do golden-set mudam.** O piso medido antes com o corte deixa de valer como referência. O resultado de depois do merge é a referência nova, gravada com a data da medição.
- **O aviso precisa chegar à tela.** Um relatório com `cutFiles` que ninguém lê repete o problema. Por isso o aviso aparece no toast do Reindexar e no painel de cobertura, que é o lugar em que ele sobrevive ao fechamento do toast.
