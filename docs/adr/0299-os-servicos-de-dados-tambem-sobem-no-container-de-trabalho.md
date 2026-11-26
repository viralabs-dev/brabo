# ADR 0299 — Os serviços de dados também sobem no container de trabalho, e `run.env` leva a URL de conexão aos dois containers

- **Status:** proposto (26/11/2026, AT-1015)
- **Data:** 2026-11-26
- **Tema:** `container`
- **Referencia:** AT-1015 (EP-036), TP-01 30ª (achados 24, 30 e 34). Estende o ADR [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) sem editá-lo.

## Contexto
No TP-01 30ª (26/11), achados 24, 30 e 34: o projeto tinha ADR de PostgreSQL, mas nem o container de trabalho (devs) nem a instância de QA tinham Postgres ou `DATABASE_URL`; nenhuma migração rodava antes do compose. O ADR 0229 já sobe serviços na instância de QA (`run.qa.services`, `--network container:<qa>`, digest obrigatório), mas (1) o container de trabalho nunca teve serviço nem `--env`; (2) a Infra só declarava serviço "se os testes precisam de banco", e a PR de infra nasce antes de haver teste; (3) o digest obrigatório não tem como ser descoberto pela Infra (sem terminal, o broker não tem operação de registro, ADR 0130), então a saída do modelo era perguntar ao dono; (4) uma PR de infra sem arquivo passa na proposta e morre na execução.

O ADR 0229 deixou em aberto que nunca se mediu o Postgres oficial sob as restrições do container de trabalho.

## Decisão
1. Os serviços NÃO compartilhados de `run.qa.services` sobem também ao lado do container de trabalho, em `--network container:<trabalho>` (o mesmo `localhost`), com a mesma contenção constante do QA (`--cap-drop ALL`, sem porta, tetos, `--user` diferente de 0) e dados em `tmpfs` (banco efêmero: recriar o container recria o banco vazio e as migrações rodam de novo). `stop`, `remove` e a recriação do trabalho levam os serviços junto (rótulo de dono); o hash da spec inclui os serviços. Serviço `shared` segue só para QA. Implementado no `docker-port` (brabo-contracts, RN-1518); nenhuma operação nova na `DockerPort` nem no broker.
2. `run.env` (novo, opcional): até 20 variáveis `[A-Z_][A-Z0-9_]*`, valor de uma linha, injetadas com `--env` no container de trabalho E na instância de QA, com o mesmo valor nos dois (o `localhost` é o mesmo). É por onde chegam `DATABASE_URL` e afins.
3. A Infra declara o banco sempre que o compose dela tem banco (todo serviço de dados do compose vai também em `run.qa.services`, com `run.env` trazendo a URL em `127.0.0.1`). Guarda determinística no engine, antes do HALT: compose com `image:` de banco conhecido sem serviço equivalente declarado é recusa nomeada que volta ao modelo (RN-163).
4. O digest é resolvido pela api, não pelo dono: na PROPOSTA, a api resolve cada `image` sem digest no registro OCI v2 público (token anônimo + `HEAD /v2/<repo>/manifests/<tag>`) e regrava o payload como `nome:tag@sha256:<64>`; falha de resolução é 400 nomeado que volta à Infra. O engine passa a aceitar tag explícita (sem `latest`) ou digest; da api para dentro (`recusaDoQa`, docker-port) o digest segue obrigatório, então o ADR 0229 se mantém: o digest continua fixado, só muda quem o descobre.
5. PR de infra sem arquivo não é proposta: recusa nomeada no engine (antes do HALT) e 400 `infra_pr_sem_arquivos` na api, também revalidada antes do `commitFiles`.

## Alternativas rejeitadas
- Rede nova ou serviço no host para o banco do dev: rede e porta novas, endereço diferente entre dev e QA. O `localhost` compartilhado dá o mesmo `127.0.0.1:5432` nos dois sem rede nova.
- Banco persistente em volume no trabalho: dado de dev sobrevive à recriação e esconde migração quebrada; o efêmero obriga as migrações a rodarem do zero. Volumes não são criados pelo adaptador (RN-1502).
- Operação de registro no broker para achar o digest: exige ADR próprio e amplia a superfície do único processo com o socket do Docker (ADR 0130). A api já chama serviços externos e tem a superfície documentada em `security-surface.md`.
- Manter a pergunta do dono sobre o digest: contraria o desenho (a Infra não deveria bloquear em dado que a máquina descobre).
- Exceção "PR só de `run`" sem arquivo: a mudança de serviço sempre tem o compose para acompanhar.

## Consequências
- Mudança de contrato aditiva em `brabo-contracts` (MINOR) e repasse em cadeia: contracts, broker (repin e repasse de `servicos`/`env` no papel de trabalho), api (`Run.env`, resolução de digest, `files` vazio, spec sem `qaTask`), engine (aceita tag, guarda do compose, prompt). Cada elo depende da TAG do anterior.
- O container de trabalho passa a ter processos a mais (o banco, até 512 MB e 1 CPU por serviço, teto de 6 serviços) além do próprio teto; `stop`/`remove` do trabalho ganham um `ps` a mais.
- Os serviços do trabalho usam o rótulo `brabo.papel=qa` e `brabo.qa.dono=<trabalho>`; quem listar serviços de QA por papel os vê juntos.
- `CHAMADAS_DE_CONTROLE_NO_START` (9) não conta as chamadas dos serviços (nem contava as do QA); com imagem de banco ainda não baixada o `start` fica mais longo, mas cada `pull` segue sob o teto de 30 s e falha nomeado (`PullExcedeuTetoError`).
- A api passa a fazer uma chamada de rede ao registro na proposta; registro fora do ar vira 400 nomeado, nunca pergunta ao dono.
- Religar o trabalho parado recria os serviços (o `localhost` novo deixa os antigos órfãos): o banco do dev volta vazio.

## Medição (26/11/2026, Docker real, container descartável `r402-b1015-pg`, sem porta publicada)
Flags reproduzidas do `docker-cli.ts` do contracts (`argsBase` do trabalho e `argsDeServicoDeQa`; o broker só compõe a spec, as flags moram no docker-port):
- Trabalho (dono do namespace de rede, só para a medição): `docker run --detach --init --network bridge --cpus 2 --memory 1024m --pids-limit 512 --cap-drop ALL --user 1000:1000 --env HOME=/tmp postgres:16 sleep infinity`.
- Serviço: `docker run --detach --network container:<trabalho> --cpus 1 --memory 512m --pids-limit 256 --cap-drop ALL --tmpfs /tmp --user 999:999 --tmpfs /var/lib/postgresql/data:uid=999,gid=999,mode=0700 --env POSTGRES_PASSWORD=teste --env POSTGRES_USER=teste --env POSTGRES_DB=teste postgres:16` (senha de teste óbvia).
- Resultado: o `postgres:16` oficial SOBE com `--cap-drop ALL`, usuário sem root, dados e `/tmp` em tmpfs e sem porta publicada, sem nenhuma concessão (nem capability, nem tmpfs extra, nem root). Pronto e respondendo `select 1` em `127.0.0.1:5432`, a partir de outro container no mesmo namespace de rede, em 1,3 s (imagem já local). `pg_isready -h 127.0.0.1` do container de trabalho e do próprio serviço: `accepting connections`. Memória em repouso: 66 a 98 MiB de 512 MiB; 6 processos de 256 permitidos.
- Ressalvas: imagem já baixada (o `pull` de `postgres:16` fica sob o teto de controle de 30 s por chamada); a imagem de trabalho da medição foi o próprio `postgres:16` com `sleep infinity` (só dono do `localhost`), não a imagem real do projeto; `pg_isready -q` sem `-h` ou `-U` saiu 3 ("no attempt") em um laço de espera e não deve ser a sonda de prontidão: use `psql -h 127.0.0.1 -c 'select 1'` ou `pg_isready -h 127.0.0.1 -U <usuário>`.

## Implementação (mergeada na `dev` em 26/11/2026)
- `brabo-contracts` PR #48: serviços no trabalho e `run.env` no `docker-port` (RN-1518), TAG `v1.5.0-dev.1`.
- `brabo-broker` PR #55: repin da TAG e repasse de `servicos`/`env` no papel de trabalho.
- `brabo-api` PRs #156 e #159: `Run.env`, resolução de digest na proposta, `files` vazio recusado (RN-1507, RN-1508, RN-1520).
- `brabo-engine` PRs #136 e #140: tag explícita aceita, guarda do compose, recusa de PR sem arquivo, prompt (RN-1507, RN-1508, RN-1521).
Cada elo depende da TAG do anterior.

## Ressalvas
- A medição usou a própria imagem do Postgres como container de trabalho, não a imagem real do projeto.
- Não houve prova ponta a ponta com Docker real da cadeia completa (contracts, broker, api, engine); só a medição acima e os testes de cada repo.
- `run.env` é valor de desenvolvimento: a régua não detecta segredo, então segredo de verdade não pode entrar ali.
- A guarda do compose no engine usa uma lista fixa de imagens de banco; banco fora da lista passa sem recusa.
