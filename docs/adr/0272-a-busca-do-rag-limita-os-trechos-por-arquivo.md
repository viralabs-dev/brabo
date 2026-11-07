# ADR 0272 — A busca híbrida do RAG limita os trechos por arquivo

- **Status:** aceito
- **Data:** 2026-11-07
- **Tema:** `conhecimento`
- **Referencia:** altera a composição do resultado que o ADR [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md) fixou (fusão, limiar e citação) e usa o piso do ADR [0132](0132-golden-set-de-acerto-do-rag.md). Consequência da indexação inteira do ADR [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md). Nenhum deles é editado. AT-778, decisões do dono de 07/11/2026.

## Contexto

Com o corpus indexado inteiro (ADR 0269), o golden-set caiu de 17/17 para 16/17. O caso `tetos-de-rebaixamento-project-members` esperava o ADR 0127 e viu o top-5 inteiro tomado por trechos de `docs/business-rules.md`, que repete a mesma regra (RN-472, RN-556 e RN-557) e antes tinha só parte indexada. A busca não errou de assunto: um arquivo só ocupou as cinco vagas. A busca híbrida não tinha deduplicação nem teto por arquivo; a única deduplicação era por chunk.

## Decisão

1. **No máximo 2 trechos por arquivo no resultado** (`RAG_SEARCH_MAX_CHUNKS_PER_FILE`), aplicados **depois da fusão e do limiar e antes do corte em `limit`**. O melhor trecho de cada arquivo é sempre mantido, porque o filtro só remove trechos de baixo score do mesmo arquivo. Trecho sem caminho (sessão) passa sem filtro. É a RN-1046 do `brabo-api`.
2. **O N vigente é gravado congelado na telemetria** (`maxPerFile` junto dos pesos, RN-479), para a calibração não comparar rodadas com regras diferentes. A coluna é jsonb: sem migração.
3. **O N começa em 2.** Se a prova do golden-set desse menos de 17, passaria para 1 sem nova pergunta. Deu 17/17 com N=2 (run 42332959893), então N=1 não foi preciso.
4. **O piso do golden-set volta a 17** (decisão do dono): ele tinha sido gravado em 16 por conta do caso acima, e a busca determinística o reproduz. Prova final na `dev` com o piso 17: 17/17 (run 42335099670). Vale a regra do ADR 0132 de que o piso só sobe.
5. **Recusado, com as razões:**
   - **Peso por tipo de documento** (ADR acima do agregado): é viés global sem calibração, mexe nos outros casos nos dois sentidos e favorece ADR em projeto de usuário que nem tem ADR.
   - **Tirar da indexação os arquivos "gerados que agregam":** a premissa não vale. O `business-rules.md` do corpus é texto escrito à mão e a fonte das RNs (`<repo>/docs/business-rules/*.md`) não é gerada; excluir por nome faria os dois casos que esperam `business-rules.md` errarem e tiraria as RNs da busca do usuário.
   - **Reranqueamento** (MMR, cross-encoder): perde a garantia de "nunca piora" ou exige modelo novo e segundos por busca, contra o requisito de busca determinística e barata do ADR 0132. Ficam como evolução, se o teto por arquivo deixar de bastar.

## Consequências

- Um documento grande e repetitivo deixa de ocupar todas as citações; o chat cita até 2 trechos do mesmo arquivo (com `limit` 10 o contexto vizinho se mantém).
- A busca é a mesma para a aba, o agente e a anamnese: mudar o top-k muda o que o chat cita.
- O regressivo da funcionalidade `conhecimento` (ADR [0268](0268-o-brabo-qa-tem-regressivo-por-funcionalidade.md)) é o golden-set agendado, e o piso 17 é o ajuste dele.
- Se o ADR esperado nem estiver entre os candidatos (20 por sinal), o filtro sozinho não basta e seria preciso abrir mais o conjunto. O seed passou a imprimir a posição do arquivo esperado no conjunto inteiro, para isso aparecer.

## Referências

- [0080](0080-busca-hibrida-pesos-limiar-e-citacao.md), [0132](0132-golden-set-de-acerto-do-rag.md), [0269](0269-indexacao-de-docs-com-teto-proprio-e-corte-declarado.md); RN-1046 em `brabo-api`.
