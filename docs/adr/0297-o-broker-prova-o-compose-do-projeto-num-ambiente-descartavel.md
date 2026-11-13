# ADR 0297 — O broker prova o compose do projeto num ambiente descartável

- **Status:** aceito
- **Data:** 2026-11-12
- **Tema:** `container`
- **Referencia:** AT-922 (EP-036), levantamento da Rodada 376 e decisões do dono de 12/11/2026 (isolamento, Q6 e Q7). Estende o ADR [0130](0130-broker-de-container.md) (broker sem especificação livre), o ADR [0229](0229-instancia-de-qa-efemera-com-servicos-declarados-pela-infra.md) (instância de QA efêmera) e o ADR [0189](0189-o-piloto-automatico.md) (bordas declaradas: descrever, não remendar). Revisa a frase "seis operações/rotas" do `CLAUDE.md` do `brabo-broker`: o ADR aceito não se edita, esta ADR é quem acrescenta a rota.

## Contexto

O pedido do usuário é "roda com `docker compose`", e só um `docker compose up --build` de verdade prova isso. Mas construir a imagem do projeto põe código arbitrário do usuário (o `RUN` do Dockerfile, o `docker-compose.yml`) para rodar no daemon do servidor, o único com o socket. Um compose livre aceita `privileged`, `cap_add`, `network_mode: host`, `pid: host`, `devices`, volumes do host e portas em `0.0.0.0`: tudo o que a contenção do broker proíbe por construção (sem campo `privileged`, sem rede `host`, sem `-v` livre). O broker de hoje não constrói imagem nem tem o plugin `compose`.

## Decisão

1. **Isolamento por broker com allowlist** (opção B do levantamento). O broker NÃO executa o compose como está: lê o clone limpo (somente leitura), roda `docker compose config --format json` e aprova só o que está na allowlist (`build` com contexto dentro do clone, `image`, `environment`, `ports` só em `127.0.0.1`, `depends_on`, `healthcheck`, `command`). Recusa pelo nome `privileged`, `cap_add`, `network_mode`, `pid`, `ipc`, `devices`, `extra_hosts`, `include`, `extends` externo, volumes do host, `env_file` fora do contexto, `secrets`/`ssh` e `additional_contexts` fora do clone. As recusas voltam nomeadas no resultado.
2. **Limites e rede forçados.** Um `override` gerado pelo broker dá ao projeto o nome `brabo-qa-compose-<workspace>-<chave>`, rede própria, `mem_limit`, `cpus`, `pids_limit`, `cap_drop: [ALL]` e `no-new-privileges` onde o serviço permite.
3. **Sobe, sonda e limpa sempre.** `up --build --wait`, sonda `/docs` e `/openapi.json` por dentro da rede do compose e, em sucesso, falha, exceção ou teto, `down -v --rmi local --remove-orphans` mais `builder prune`. Uma prova viva por projeto (molde da RN-935).
4. **Teto: 10 minutos e 4 GB** por execução. Estourou, o resultado é origem `infra`.
5. **Sem prova, aprova com aviso.** Sem broker (instalação em Kubernetes, que não tem Deployment de broker), no modo `runner` (a pasta mora noutra máquina), com o plugin ausente ou com o teto estourado, o parecer **aprova com o aviso "sem prova de compose"**, nunca calado e nunca reprovando por infraestrutura. Falha do projeto (build quebrado, serviço que não sobe, `/docs` fora) vira item do parecer.
6. **Só na última tarefa** de integração do backlog, só em `container`/`mounted`, por ação tipada de QA auto-aprovada. A ação não entra no teto da RN-418 (`git push`, comando privilegiado, `container_remove`).
7. **Contrato.** A operação é `provaDeCompose`, numa porta própria do `docker-port` (`ProvaDeComposePort`), com o resultado `{ subiu, sondas: [{caminho, status}], recusas?, origem }` e os limites como dado. Só o broker a implementa; o runner não é afetado.

## Risco residual aceito pelo dono (12/11/2026)

O `RUN` do Dockerfile ainda executa código do projeto, com saída para a internet, no BuildKit do daemon do servidor (sem `network.host` nem `security.insecure`, que o BuildKit nega por padrão). Isso fica como as outras bordas declaradas do ADR 0189: descrever, não remendar. A alternativa A (daemon isolado por execução) exigiria `privileged`, que viola a regra que sustenta o broker, e foi recusada; a C (não construir no servidor) não prova o que o usuário pediu.

## Consequências

- A lista fechada de rotas do broker ganha `POST /containers/:id/qa/:chave/compose`, com teste de contenção para cada recusa nomeada e para a limpeza em falha.
- A imagem do broker ganha o plugin `compose` (Trivy e digest) e um volume de trabalho; `brabo-infra` ajusta os composes e a doc de instalação.
- Os tetos de tempo respeitam a cadeia broker < api < engine (RN-604/757).
- Nova TAG do `brabo-contracts`; o runner empacota o código novo sem usá-lo.
- Nenhum teto absoluto muda: merge em branch protegida, RN-418 e "nenhum `privileged`/`cap_add`/`network: host`/`-v` livre" seguem valendo.
