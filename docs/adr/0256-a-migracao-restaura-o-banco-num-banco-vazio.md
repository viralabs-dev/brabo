# ADR 0256 — A migração do instalador restaura o banco num banco recém-criado e vazio

- **Status:** aceito
- **Data:** 2026-11-05
- **Tema:** `operacao`
- **Referencia:** os ADRs [0150](0150-instalador-de-uma-linha.md) e [0152](0152-backup-de-volumes-contra-compose.md), a [RN-530](../business-rules/infra.md#rn-530), a [RN-542](../business-rules/produto.md#rn-542), a [RN-692](../business-rules/produto.md#rn-692) e a atividade AT-738. Nenhum deles é editado.

## Contexto

A primeira migração real de uma instalação 7.0.0 para o produto 1.0.0 (AT-710, 05/11/2026) subiu uma instalação VAZIA. A cadeia do ADR 0150 (backup → prova → pergunta → `down -v` → instalação → restore) parava no restore dos repositórios git: o Postgres não voltava. A [RN-530](../business-rules/infra.md#rn-530) dizia por quê — `brabo-restore` valida numa database de teste e "nunca sobrescreve a origem" (ADR 0152) —, e a resposta `s = restaurar` levava a crer que os dados voltavam. Depois do `down -v` não há origem a proteger: o banco novo nasce vazio, e não restaurá-lo é que perde o dado.

A mesma migração achou o resto que este ADR fecha junto: a migração gerava segredos novos e perdia a chave mestra (as credenciais restauradas ficavam ilegíveis), o backup e a prova não escreviam na pasta do uid de quem roda, a prova restaurava outro backup (o do volume `backup_local`, que o `down -v` apaga), o marcador não era gravado quando o restore falhava, e o recomeço das versões em 1.0.0 aparecia como "rebaixamento". Decisões do dono de 05/11/2026.

## Decisão

1. **A migração restaura o Postgres sozinha, num banco recém-criado e vazio.** Depois do `down -v`, o instalador sobe SÓ o `postgres`, roda `brabo-restore --banco-vazio` (que recusa se houver qualquer tabela em `public`, `drizzle` ou `engine`, restaura numa transação e roda as mesmas validações), e só então sobe o resto — as migrations da versão nova rodam por cima do dump, nunca o contrário.
2. **Esclarece a decisão 5 do ADR 0152:** "o restore nunca sobrescreve a origem" vale para banco com dado. Um banco recém-criado e vazio não é origem de nada, e restaurar nele é o fim da migração, não um risco a ela.
3. **Depois do banco, os repositórios git e a reprojeção.** O `brabo-restore-git --restaurar` roda como o DONO lido do volume `git_local_repos`; o grafo e os artefatos são reprojetados do event log (a decisão 4 do ADR 0152). A falha da reprojeção é pendência nomeada, não recusa: o dado já voltou.
4. **A migração é retomável.** O marcador (schema 4) é gravado logo depois do `down -v`, com `restauracaoPendente` (o destino do backup e as etapas que faltam), e de novo a cada etapa. A execução seguinte que acha a pendência RETOMA a restauração em vez de migrar de novo.
5. **Os segredos que cifram dado restaurado vêm do `.env` anterior.** No mínimo a `CREDENTIALS_MASTER_KEY`; e tudo o que o `.env` novo não declara volta, salvo o que o instalador decide na hora (profiles, broker, Ollama) e o `_PREVIOUS` de segredo efêmero.
6. **Linha de versões.** O marcador ganha `linha`; sem ela, a instalação é da linha anterior, salvo imagens em `ghcr.io/viralabs-dev/`. Entre linhas a relação é `nova-linha`, com frase própria e default sim.

## Consequências

- Responder `s` passa a trazer de volta o que a pergunta promete: banco, repositórios, grafo e artefatos. `z` segue reinstalando do zero com o backup provado na pasta.
- O backup provado é o MESMO que fica na pasta e que a restauração usa.
- Uma migração interrompida depois do `down -v` não fica órfã: o próximo `install.sh` retoma. Se o banco já tiver tabela, o `--banco-vazio` recusa e diz por quê — o instalador nunca restaura por cima de dado.
- O dump fica numa pasta `0755` declarada: legível por outros usuários da máquina, sem a chave mestra.
- O `install-e2e` precisa de um passo de migração com dado semeado para provar isto numa tag; em PR, a prova é `scripts/dev/install-migracao.spec.ts`.
