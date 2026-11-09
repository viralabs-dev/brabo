---
id: rn-produto-parte-02
title: 'Regras de negócio — Produto — parte 2 (desde RN-543)'
sidebar_label: 'Produto — parte 2 (desde RN-543)'
description: 'As RNs hospedadas na raiz produto.'
keywords: [regras de negócio, produto]
---

# Produto — parte 2 (desde RN-543)

## A chave de dispositivo passa a poder ser da MÁQUINA (RN-543, FASE 30)

<a id="rn-543"></a>

### RN-543 — `runner_device_keys.project_id` nulo é a chave de MÁQUINA: vale para os projetos do DONO, resolvida contra o projeto pedido {#rn-543}

A identidade do agente local era por PROJETO. Uma máquina com três projetos em
modo `runner` tinha três chaves, três pastas com
`brabo-runner-device-key.jwk.json` e três units de serviço — e a pessoa passava
três vezes pelo mesmo fluxo de navegador ([RN-464](../api.md#rn-464)..[466](../runner.md#rn-466),
[RN-475](../web.md#rn-475)) para descrever **uma** máquina. É o item 4 dos cinco
acoplamentos que o [ADR 0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)
mediu; os itens 1, 2 e 3 (tópico, socket id, ticket) descrevem uma **conexão**
e N conexões os satisfazem byte a byte, então **nada no engine muda aqui**.

**Uma tabela, duas espécies.** `project_id` preenchido = a chave de PROJETO de
sempre. `project_id` NULL = a chave de MÁQUINA. Tabela irmã foi considerada e
recusada no ADR: `PatAuthGuard` acha a pública pelo `kid` e não precisa saber a
espécie, e duas tabelas fariam duas buscas — a segunda esquecida exatamente uma
vez. NULL e não sentinela: a FK é real, e `project_id = '00000000-…'` exigiria
uma linha falsa em `projects`. `user_id` continua `NOT NULL` — o ADR recusa
chave que atravesse usuários, porque a credencial descreve **quem** age.

**O ponto que decide tudo é um só.** `PatAuthGuard.autorizarPapel` recusava
quando o projeto da credencial diferia do projeto da rota. Essa comparação
**não** foi apagada: ela é o que impede a chave do projeto A servir o projeto
B, e ela some **só** para `project_id` nulo, porque aí não há o que comparar. O
papel passa a se resolver contra o projeto **PEDIDO**, que é o ADR 0154 ponto 2
ao pé da letra — *"a autorização continua sendo a de sempre, resolvida contra o
projeto pedido"*. **Nenhum teto novo e nenhum afrouxado**: a chave de máquina
não dá ao runner nada que o DONO dela já não tivesse, e papel insuficiente no
projeto pedido continua 403. O ramo do PAT não muda —
`personal_access_tokens.project_id` continua `NOT NULL`.

**O agente PERGUNTA quais projetos atende.** `GET runner/projects` devolve os
projetos em `execution_mode: 'runner'` nos quais o dono da credencial alcança
pelo menos `developer` — o MESMO mínimo de `runner-ticket`, porque listar
projeto cujo ticket seria recusado é prometer o que a rota seguinte nega. Ele
pergunta em vez de varrer o disco: a base da máquina é do usuário e pode ter
pasta que não é projeto nenhum, e adivinhar por nome de pasta é a classe de
erro que o [ADR 0141](../../adr/0141-base-unica-dos-projetos-montados.md) recusou.
O que viaja é o SEGMENTO (`workspaceDirName`, [RN-109](../api.md#rn-109)) e nunca um
caminho absoluto — o mesmo invariante do broker.

É a **primeira rota `@RequirePatAuth()` sem `:projectId` no caminho**, e as
duas consequências são travadas por teste: só credencial de MÁQUINA entra
(uma de projeto descreve um projeto só e não tem o que descobrir — 403 com
mensagem PRÓPRIA, nunca a de "projeto errado", que mentiria sobre o motivo), e
não há `@RequireRole`, porque não há projeto contra o que resolvê-lo. O mínimo
é aplicado por **LINHA**, com a régua ÚNICA do produto
(`ResolveEffectiveRoleUseCase.forProject`, `projectRole ?? workspaceRole` —
[RN-471](../web.md#rn-471)); a consulta de candidatos em SQL é `alcança`, nunca `tem
papel`, e reescrever o `??` ali seria uma segunda régua. Por isso
`route-surface.spec.ts` a classifica como `jwt` — o classificador lê
`@RequireRole` e não enxerga mecanismo — e `docs/security-surface.md` corrige a
leitura em prosa, exatamente como já faz para `runner-ticket`.

**A listagem da [RN-519](../api.md#rn-519) passa a dizer a ESPÉCIE.** Uma chave de
máquina serve todo projeto do dono, então ela entra na listagem de todos —
marcada (`especie: 'maquina'`, `projectId: null`). As duas metades são
obrigatórias: sem entrar na lista ela seria invisível e permanente em toda
tela, que é o defeito que a RN-519 fechou renascido na espécie nova; sem a
marca, a mesma linha apareceria em N projetos parecendo N chaves diferentes. A
espécie é DERIVADA de `project_id` num lugar só — não há coluna para ela, e não
deve haver.

**E a revogação passa a ter alvo PLURAL.** [RN-520](../api.md#rn-520) derruba a conexão
viva de `{projeto, usuário}`, e uma chave de máquina não nomeia projeto nenhum.
Não derrubar reabriria exatamente o que a RN-520 fechou — a chave morre para
ticket NOVO e as conexões vivas seguem executando comando aprovado —, agora em
N conexões em vez de uma. Então revogar uma chave de máquina pede um
`disconnectRunnerOfUser` **por projeto** em modo `runner` que o dono alcança. É
a consequência que o ADR declarou por antecipação (*"revogar passará a derrubar
todos os projetos daquela máquina"*), e ela cabe **sem tocar o engine**: a
assinatura `{projeto, usuário}` fica byte a byte, só é chamada N vezes. A lista
vem dos CANDIDATOS, sem filtro de papel, e isso é deliberado — desconectar não
é decisão de autorização, e faltar um projeto deixaria de pé o que a revogação
existe para matar.

- **Código:** `apps/api/src/db/schema/auth.ts` (`runnerDeviceKeys.projectId`,
  sem `.notNull()`); `apps/api/src/db/migrations/0058_public_war_machine.sql`;
  `apps/api/src/interfaces/http/auth/pat-auth.guard.ts` (`autorizarPapel`);
  `apps/api/src/interfaces/http/runner/runner-projects.controller.ts`;
  `apps/api/src/application/use-cases/runner/list-runner-projects.use-case.ts`;
  `apps/api/src/infrastructure/persistence/drizzle/project.repository.ts`
  (`listRunnerModeReachableBy`);
  `apps/api/src/infrastructure/persistence/drizzle/runner-device-key.repository.ts`;
  `apps/api/src/application/use-cases/auth/revoke-runner-device-key.use-case.ts`
- **Teste:** `apps/api/test/interfaces/pat-auth.guard.spec.ts` — *"chave de
  MÁQUINA"*, com os DOIS sentidos travados (a de máquina vale em qualquer
  projeto; a de PROJETO continua recusada em projeto diferente) e a rota sem
  `:projectId`; `apps/api/test/application/use-cases/runner/list-runner-projects.use-case.spec.ts`
  (papel abaixo de `developer` fica de fora);
  `apps/api/test/infrastructure/persistence/drizzle/runner-device-key.repository.spec.ts`
  e `.../project-runner-mode.repository.spec.ts` (contra o Postgres — o que
  mudou é um `NOT NULL` e um `WHERE`, e fake nenhum prova qualquer um dos
  dois); `apps/api/test/application/use-cases/auth/revoke-runner-device-key.use-case.spec.ts`
  (*"o alvo da desconexão vira PLURAL"*);
  `apps/api/test/interfaces/http/runner/runner-projects.controller.spec.ts`
- **Lacuna DECLARADA, e FECHADA pela [RN-552](../api.md#rn-552):** quando esta RN
  fechou, nenhuma rota da api **criava** chave de máquina — a rota nasceria no
  PR que tivesse o primeiro chamador real, o `install.sh`
  ([ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md) ponto 4), nunca
  antes. Foi o que aconteceu: `POST /internal/machine-device-keys`. O tipo da porta já é o da COLUNA
  (`projectId: string | null`), para o consumidor futuro não ter o que mudar
  ali. E o web continua sem tela onde listar ou revogar chave de dispositivo
  (a metade aberta da RN-519): a espécie nova torna a lacuna maior, e ela fica
  declarada, não fechada aqui. **FECHADA depois pela [RN-561](../web.md#rn-561)**, que é
  a tela — e a marca de espécie criada aqui é o que ela usa para não mentir
  sobre o alcance de revogar.
- **ADR:** [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)
- **Origem:** FASE 30, sessão 2 —
  [o recorte da fase](../../explanation/fase-30-runner-por-maquina.md)

## A primeira conta de uma instalação nasce no terminal (RN-546)

<a id="rn-546"></a>

### RN-546 — Rota interna cria a PRIMEIRA conta, já verificada, e recusa quando existe qualquer usuário {#rn-546}

Sessão 5 da [FASE 30](../../explanation/fase-30-runner-por-maquina.md), decidida pelo
[ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md). É a metade de api
do passo que fecha a instalação de uma linha; o `install.sh` que consome esta
rota é a sessão 6, e ele chegou na [RN-547](#rn-547).

**O buraco, medido.** Numa instalação nova ninguém consegue entrar. O `.env`
que o instalador gera não tem **nenhuma** variável de e-mail, `MAIL_TRANSPORT`
cai no default `log` (`docker/docker-compose.install.yml`), e o registro normal
exige verificar e-mail — que por um canal desligado não fecha. A instalação
termina dizendo "Pronto" e a única saída é pescar o link em
`docker compose logs api`.

**A rota.** `POST /internal/first-account`, `engine-service` — autenticada pelo
`BRABO_SERVICE_TOKEN`, no mesmo cabeçalho e com a mesma comparação em tempo
constante das outras rotas internas. Corpo `{ email, senha, nome? }`, resposta
`{ userId, email, workspaceId }`, `201`.

**Por que interna, e nunca pública.** Uma rota pública de "criar o primeiro
owner" é uma corrida entre quem instalou e quem escaneou a porta, e quem perde
a corrida perde a instalação: `owner` do primeiro workspace não é papel que se
recupere por HTTP. O service token fecha a corrida no lugar certo — ele é
gerado pelo próprio `install.sh` e escrito no `.env` com modo `600`, então
apresentá-lo prova controle da **máquina**, que é a credencial que este passo
realmente quer.

**A conta nasce VERIFICADA, e é a única coisa que esta rota afrouxa.** O que a
verificação de e-mail prova é *"esta pessoa controla esta caixa"*; quem roda o
instalador já provou algo mais forte — a máquina, o `.env` com os cinco
segredos e o daemon do Docker. Exigir dela a prova mais fraca, por um canal que
a instalação sabe estar desligado, é teatro. O **registro normal fica byte a
byte**: o ADR cria um caminho para um caso nomeado, não mexe no outro.

**A recusa é sobre a INSTALAÇÃO, não sobre o e-mail.**
`UserRepository.existeAlgumUsuario()` (`SELECT 1 … LIMIT 1`, nunca `count(*)`),
e `409` havendo qualquer usuário. A pergunta é sobre `users` e não sobre
`auth_credentials`, porque conta provisionada por login social
([RN-278](../api.md#rn-278)) nasce sem credencial e perguntar pela credencial diria "não
há ninguém" numa instalação povoada. Herdar a idempotência por e-mail de
`provisionarUsuario` transformaria a rota num criador de contas com nome
enganoso — bastaria variar o endereço. Numa migração
([RN-530](../infra.md#rn-530)) os usuários vêm no restore e o passo se cala pelo mesmo
critério.

**Workspace pessoal na MESMA transação** ([RN-410](../api.md#rn-410)). Este é o TERCEIRO
ponto de criação de conta, e ele não ganha regra de nome/slug própria: chama a
mesma `nomeESlugDoWorkspacePessoal` dos outros dois. Sem isso a instalação
fecharia com um login que atravessa e um dashboard onde "Novo projeto" não tem
onde criar — a metade do buraco que esta fase veio tapar, não a outra.

**A extração, e por que não `BRABO_FORCE_SEED`.** `provisionarUsuario` recusa
rodar com `NODE_ENV=production`, e o instalador roda exatamente em produção. O
que a recusa protege está escrito no docblock dela: senha **conhecida** criada
**sem interação humana**. A rota é outra categoria — a senha é escolhida por um
humano no TTY, lida sem eco e confirmada, atrás do service token, e só quando
não há usuário nenhum. Então o núcleo (o trio de escritas que faz a conta
nascer verificada) virou `ProvisionarUsuarioUseCase`, e **a recusa ficou no
script**, que é quem ela protege. Mandar o instalador se declarar "seed
forçado" o faria atravessar uma regra que nunca falou dele, e afrouxaria a
recusa justamente onde ela vale.

**Uma régua de senha, não duas.** `exigirSenhaValida` do domínio, chamada pelo
MESMO código que o registro chama — e por isso o DTO desta rota **não** repete
um `@MinLength`: a chamada cobre as CINCO recusas da política, não só o
comprimento. O `@MaxLength` fica, porque não é política: é proteção de
argon2id, que copia a entrada antes de derivar. `PoliticaDeSenhaError` é
`Error` de domínio e não tem filtro global, então o caso de uso **traduz** para
`400` — sem isso o instalador leria "erro do servidor" onde a resposta certa é
"escolha outra senha". Traduzir ali não toca o registro normal.

**Kind próprio na trilha de auth.** `first_account_created`, e não
`register_created`: a conta nasce verificada sem e-mail nenhum ter sido
enviado, e quem audita depois precisa ver isso escrito, não deduzir pela
ausência de um `email_verified` ao lado. União fechada no TypeScript, coluna
`text` no banco — kind novo não custa migração.

**Sem `GET`.** "Existe algum usuário?" é pergunta que ninguém precisa fazer de
fora: o `POST` responde `201` ou `409`, e o `409` já é a resposta. Uma rota de
leitura publicaria o mesmo fato com uma superfície a mais, e a resposta dela
seria o sinal exato que um scanner quer.

**A superfície nova está declarada, não escondida.** Passa a existir um segundo
caminho de criação de usuário que funciona em PRODUÇÃO. Ele é estreito em três
contagens independentes (primeira conta, rota interna, service token) e some
assim que a instalação tem gente. Está no
[`security-surface.md`](../../security-surface.md), nas Consequences do ADR e aqui.

**Uma janela declarada, não fechada.** A checagem de "existe algum usuário" roda
DENTRO da transação, mas `READ COMMITTED` não impede duas chamadas concorrentes
com e-mails diferentes de passarem juntas. Fechá-la exigiria lock consultivo
sobre a ausência de linhas, e não é onde a contenção mora: quem alcança a rota
já tem o service token, ou seja, já controla a instalação inteira. O que a
condição impede é a rota VIRAR superfície permanente de criação de conta, e
isso ela impede.

**O que NÃO entrou, por decisão do ADR:** rota pública de primeiro owner; senha
gerada pelo código ou default (a senha nunca é gravada — nem no `.env`, nem no
marcador, nem em log); SMTP ligado sozinho (`MAIL_TRANSPORT=log` continua o
default declarado); credencial de LLM (é de quem vai gastar,
[RN-058](../api.md#rn-058)); e qualquer mudança no registro normal.

- **Código:** `apps/api/src/application/use-cases/auth/criar-primeira-conta.use-case.ts`
  (a recusa por instalação povoada, a régua de senha, o workspace pessoal e o
  evento), `apps/api/src/application/use-cases/auth/provisionar-usuario.use-case.ts`
  (o núcleo extraído, sem a recusa de produção),
  `apps/api/src/scripts/provisionar-usuario.ts` (só a recusa, mais a
  delegação), `apps/api/src/interfaces/http/internal/internal-first-account.controller.ts`,
  `apps/api/src/interfaces/http/internal/dto/first-account-internal.dto.ts` e
  `…/first-account-internal.response.dto.ts`,
  `apps/api/src/application/ports/user-repository.port.ts` e
  `apps/api/src/infrastructure/persistence/drizzle/user.repository.ts`
  (`existeAlgumUsuario`), `apps/api/src/domain/auth/auth-event.ts`
  (`first_account_created`),
  `apps/api/src/domain/auth/password-policy.ts` (INTOCADO — é a régua reusada)
- **Teste:** `apps/api/test/application/use-cases/auth/criar-primeira-conta.use-case.spec.ts`
  (caminho feliz com conta verificada e workspace pessoal, o kind próprio, o
  `409` com instalação povoada, o `400` por comprimento e o `400` por motivo
  que NÃO é comprimento, e o fallback de nome);
  `apps/api/test/interfaces/http/internal/internal-first-account.controller.spec.ts`
  (o repasse ao caso de uso, o `nome` ausente virando `null`, e as três
  recusas do guard: cabeçalho ausente, token errado, token certo);
  `apps/api/test/scripts/provisionar-usuario.spec.ts` (a recusa de produção
  FICOU no script, e a delegação);
  `apps/api/test/interfaces/route-surface.spec.ts` (a rota classificada)
- **ADR:** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md), que depende
  do [0154](../../adr/0154-chave-de-dispositivo-de-maquina.md)

## O `install.sh` fecha a instalação (RN-547, FASE 30)

<a id="rn-547"></a>

### RN-547 — O instalador cria a primeira conta, registra a chave desta máquina e sobe o agente como serviço — e o que falha no meio é RELATADO, nunca desfeito nem engolido {#rn-547}

Sessão 6 da [FASE 30](../../explanation/fase-30-runner-por-maquina.md), decidida pelo
[ADR 0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md). A sessão tocaria
três workspaces de uma vez e foi **dividida em três**: as duas peças do agente
e da api já fecharam ([RN-546](#rn-546), [RN-551](../runner.md#rn-551), [RN-552](../api.md#rn-552),
sobre a unit da [RN-545](../runner.md#rn-545)), e o que sobrou aqui é o `install.sh` como
**orquestrador e nada mais** — nenhuma linha de `apps/` foi tocada, e nenhuma
rota nasceu.

**O buraco que fecha.** Uma instalação nova terminava dizendo "Pronto" com um
login que NINGUÉM atravessava: o `.env` gerado não tem variável de e-mail
nenhuma, `MAIL_TRANSPORT` cai no default `log`, e o registro normal exige
verificar e-mail. A única saída era pescar o link em
`docker compose logs api`. E o agente local ficava instalado sem credencial,
esperando que alguém voltasse ao navegador para parear uma pasta.

**A cadeia, e cada elo já existia.** `POST /internal/first-account`
([RN-546](#rn-546)) → `brabo-runner device-key create` ([RN-551](../runner.md#rn-551)) →
`POST /internal/machine-device-keys` ([RN-552](../api.md#rn-552)) → `device-key finish
--id <id>` → `brabo-runner service install --machine`
([RN-545](../runner.md#rn-545)). O `id` que a api devolve no registro é o que vira o `kid`
da privada, e a cadeia inteira só o REPASSA — ninguém o deriva de outra coisa
([RN-475](../web.md#rn-475)). O `--dir` do serviço sai do CAMINHO que o `finish`
imprimiu, não de uma segunda conta do script sobre onde a pasta de configuração
fica.

**O que acontece quando um elo do meio falha: nada é desfeito, tudo é
RELATADO, e o script sempre sai 0.** É a decisão desta entrega, e o argumento é
que os elos já cumpridos são úteis por si — com a conta criada a pessoa entra,
com a chave registrada a máquina está pareada, e o serviço é o único passo que
ela repete à mão com um comando que o script imprime. Desfazer exigiria apagar
conta e revogar chave, e não há rota para isso nem deveria haver uma que o
instalador chame sozinho. O preço é que uma instalação pode terminar pela
metade; o que ela nunca faz é terminar pela metade em SILÊNCIO — cada falha
vira uma linha nomeada num bloco **"O que ficou pendente"**, no fim, onde quem
instalou ainda está olhando. Derrubar a instalação inteira por causa do último
passo trocaria meia instalação por nenhuma.

**Idempotência é o CÓDIGO HTTP, e `409` não é falha.** As duas rotas respondem
`409` quando a instalação já tem gente — uma segunda execução, ou uma migração
([RN-530](../infra.md#rn-530)) cujo restore trouxe os usuários. Esse é o desfecho
ESPERADO: o passo se cala dizendo por quê, e **não** entra nas pendências.
Qualquer outro código é falha, e aparece com o código e a resposta da api ao
lado. `000` — o curl que não chegou a falar com a api — tem tratamento próprio
pelo mesmo motivo: colapsá-lo com um código de resposta faria "a api não subiu"
ser lida como "a api recusou". E o passo do agente só roda quando ESTA execução
criou a conta: com usuário preexistente, registrar uma chave de máquina
cunharia credencial duradoura para alguém que não pediu nada nesta rodada.

**A senha não toca disco nem `argv`.** Lida no TTY sem eco (`stty -echo`, com o
modo do terminal restaurado no fim), confirmada, e enviada à api pelo **STDIN**
do `curl` — nunca por `--data` em linha de comando, que `/proc/<pid>/cmdline`
publica para qualquer usuário da máquina, e nunca por arquivo. O cabeçalho com
o `BRABO_SERVICE_TOKEN` vai num `--config` de modo 600, apagado em seguida: ele
é segredo também, e esse segredo já mora em disco, no `.env`, com o mesmo modo.
Sem `stty` na máquina o passo é **recusado**, nunca degradado para perguntar
com eco — prometer sem eco e entregar com eco é pior que não perguntar. A senha
não vai para o `.env`, não vai para o marcador e não vai para log nenhum; o
marcador ganha o **e-mail**, que identifica e não é segredo, e o
`MARCADOR_SCHEMA` sobe para **3** junto com o campo, pela mesma régua que o fez
subir para 2 ao ganhar a `versao`.

**A recusa de senha é repetível, e o teto é 3.** A política é a do domínio
([RN-546](#rn-546)), a mesma do registro normal, e só é conhecida DEPOIS do
POST. Abortar a instalação ali deixaria alguém com o compose de pé e a segunda
execução caindo no caminho de migração — então o laço é do par
pergunta+resposta, e esgotar o teto vira pendência nomeada em vez de recusa.
Senha digitada diferente da confirmação não chega a sair da máquina.
Tabulação no que foi digitado é **recusada** e nunca removida em silêncio: um
instalador que reescreve a senha produz uma conta cuja senha não é a que a
pessoa digitou.

**A recusa do `service install --machine` é o caso COMUM numa máquina de
desenvolvedor, e ela chega com as palavras dela.** `install --machine` recusa
quando há unit por PROJETO instalada, sem `--force` ([RN-545](../runner.md#rn-545):
*"instalar e avisar deixaria a instalação errada de pé"*). O instalador
repassa a saída do CLI INTEIRA em vez de resumi-la — é ela que nomeia o
`uninstall` de cada unit encontrada, que é o gesto — e a pendência carrega o
comando exato para repetir depois.

**O `name` da chave é o `hostname`, e a escolha é deste script.** A
[RN-551](../runner.md#rn-551) declara por escrito que o CLI **não** nomeia: o `name` é
campo do registro, e quem nomeia é quem registra. Quem abrir a lista de chaves
de dispositivo precisa saber a QUAL máquina ir, e o hostname é o nome que a
pessoa já usa para falar das máquinas dela — é o que o prompt do shell mostra.
Não é segredo, não é único, e a api não deriva nada dele. Aspa e barra saem
(sairiam do lugar dentro do JSON), o corte é em 80 (o `@MaxLength(80)` do DTO,
aplicado aqui para a recusa não vir da api) e a ausência total de `hostname` e
`uname` devolve um nome fixo — vazio viraria `400` pelo `@MinLength(1)`, depois
de a conta já existir.

**O `.parcial` que sobra quando o registro não fecha FICA onde está, e é
nomeado.** O `create` grava a privada num arquivo com sufixo `.parcial` que o
runner ignora por construção ([RN-551](../runner.md#rn-551)), e se o registro falhar ele
sobra. Apagá-lo seria o instalador decidir que sabe algo que não sabe: um
timeout depois de a api gravar é indistinguível de um timeout antes, e o
arquivo pode ser a única cópia da metade privada de uma chave já registrada. Ele
é inerte, o próximo `device-key create` o nomeia e o substitui, e a mensagem
diz as duas coisas.

**O que este script NÃO faz, e agora diz certo.** A última linha da saída
anunciava, meses depois de as funções existirem, que ele *"não pareia o agente
local"* e que a chave *"continua vindo da tela do projeto"*. O texto foi
reescrito: SMTP continua desligado por decisão (`MAIL_TRANSPORT=log`, aqui como
em produção — e a conta criada nasce verificada justamente por isso), credencial
de LLM continua sendo de quem vai gastar
([RN-058](../api.md#rn-058)), e o pareamento pela tela do projeto
([ADR 0118](../../adr/0118-configuracao-automatica-do-runner-pelo-navegador.md))
continua existindo para quem quiser — o que mudou é que ele deixou de ser
obrigatório. O `--help` sofria do mesmo defeito num lugar que nenhum teste
alcançava (ele imprime o CABEÇALHO, que é comentário, e a regra que proíbe falar
de "sessões de fase" só lia linhas de código): ele dizia *"ESTA VERSÃO NÃO
INSTALA NADA"*. Corrigido, e o intervalo fixo de linhas que o cortava em
silêncio virou "até a primeira linha que não é comentário".

**O que NÃO entrou:** rota nova de qualquer espécie (a sessão é orquestração —
se faltasse algo do outro lado, o gesto era parar e relatar); SMTP; credencial
de LLM; senha gravada em qualquer lugar; e qualquer caminho que crie conta sem
TTY — sem terminal interativo o script relata e **sai 0**, no passo que já
existia, antes de qualquer escrita.

- **Código:** `install.sh:1850` (`fechar_a_instalacao`, o encadeamento e o
  "sempre 0"), `:1649` (`perguntar_e_criar_a_conta`, o consentimento, o laço e
  o teto), `:1749` (`parear_esta_maquina`, o `id` virando `--id`), `:1826`
  (`subir_o_agente_como_servico`, a recusa repassada inteira), `:1552`
  (`post_interno`, o corpo pelo stdin e o cabeçalho pelo `--config` 600),
  `:1571` (`criar_primeira_conta`) e `:1612` (`registrar_chave_de_maquina`) —
  os vereditos das duas rotas —, `:1627` (`ler_sem_eco`), `:1531`
  (`nome_da_maquina`), `:1790` (`avisar_chave_parcial`), `:1208`/`:1215`
  (`escapar_json`/`sem_controle`), `:109` (`MARCADOR_SCHEMA=4`, AT-738), `:1871` (a
  chamada, depois do runner e antes do marcador), `:1882` (o `ownerEmail`).
  Números relidos pelo símbolo em 18/09 (AT-096), em 27/09 (AT-065, que
  acrescentou o ramo do Mac Intel em `instalar_o_runner`) e em 01/10 (AT-122);
  os de `:966`/`:682` já não batiam em 17/09
- **Teste:** `scripts/dev/install-fechamento.spec.ts` — as funções de shell
  rodadas DE VERDADE (o script inteiro carregado por `source`, menos a chamada
  de `main`) contra um servidor `node:http` real e um `brabo-runner` dublê: o
  caminho feliz da conta (corpo, service token e senha chegando), `409`/`400`/
  `500`/sem-resposta com vereditos DIFERENTES, o laço de senha e o teto de 3, a
  ordem `create → registrar → finish → service install` com o `--id` sendo o
  `id` da api, a recusa do `service install` repassada com as palavras dela, o
  `.parcial` que fica quando o registro falha, o `create` que recusa sem nada
  ser registrado, e o fechamento sem binário do agente; `scripts/dev/install.spec.ts`
  (o plano imprimível, e o `--help` que deixou de mentir)
- **Lacuna DECLARADA:** a instalação de ponta a ponta numa máquina limpa —
  compose de verdade, api de verdade, binário do runner de verdade, unit escrita
  e agente esperando o primeiro projeto — é o **E2E** da sessão 8 da fase, e só
  ele pode provar. Aqui o `brabo-runner` é um dublê de shell e a api é um
  servidor de teste; o que se prova é o ENCADEAMENTO, nunca a integração. E o
  fluxo principal do `install.sh` (verificar a própria origem contra o
  `checksums.txt` assinado) continua sem cobertura, pelo motivo que
  `install.spec.ts` já registrava: nenhuma Release tem esse asset até a próxima
  tag final
- **ADR:** [0155](../../adr/0155-a-primeira-conta-nasce-no-terminal.md)
- **Origem:** FASE 30, sessão 6 —
  [o recorte da fase](../../explanation/fase-30-runner-por-maquina.md)

## O teto de auto-movimento no upsert de WORKSPACE, e a auto-promoção que fecha (RN-557)

<a id="rn-557"></a>

### RN-557 — Mudar o PRÓPRIO papel é recusado com 403 nas duas rotas de associação, nos dois sentidos {#rn-557}

> **Estendida pela [RN-615](../api.md#rn-615) (ADR 0173):** a rota de remoção de membro de
> workspace que abaixo se diz inexistente passou a existir, com o MESMO teto
> (remover a si mesmo é 403) — e é essa cláusula que segura o último owner, sem
> contar. O raciocínio abaixo sobre o teto 1 continua valendo.

Terceira e última porta da linha aberta pela [RN-472](../api.md#rn-472) e continuada pela
[RN-556](../api.md#rn-556). O [ADR 0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md)
declarou esta por escrito — *"`POST workspaces/:workspaceId/members` continua um
upsert sem teto nenhum — mesma classe de defeito, escopo acima"* — e o
[ADR 0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md) a reafirmou como
"escopo diferente, decisão separada". É o `BRB-002`, P1 de segurança.

**O defeito, medido.** `AddWorkspaceMemberUseCase.execute` recebia
`(workspaceId, userId, role)` e chamava `workspaces.addMember` — **não recebia o
ator** —, e o controller (`@Post(':workspaceId/members')`,
`@RequireRole('owner')`) chamava com o corpo puro, sem `@CurrentUser()`. Não
havia com o que aplicar teto nenhum.

**Por que é mais grave um escopo acima.** Duas coisas que existem no projeto não
existem aqui: (a) **não há nível acima para segurar a queda** — no projeto,
rebaixar-se derruba o efetivo para o papel de workspace, que muitas vezes o
segura; no workspace o papel é o papel, e um `owner` que se grava `viewer` perde
o workspace inteiro, com todos os projetos e a própria capacidade de convidar
quem o reponha; (b) **não existe rota de remoção de membro** —
`WorkspacesController` não tem `@Delete` de membro (medido, e o ADR 0156 já
tinha usado esse fato). Desfazer é esta mesma rota, que pede o `owner` recém
abandonado.

**A auto-PROMOÇÃO era brecha, e fecha.** O ADR 0127 registrou nas Consequences
que ela ficava: *"Um `maintainer` pode se gravar como `owner` do projeto (…) os
tetos são sobre descer"*. Esta RN **revisa** essa frase. As duas metades são o
mesmo movimento — uma pessoa decidindo sozinha qual autoridade tem — e a de cima
é a única que **escala privilégio**: o ADR 0127 pôde dizer que os tetos dele não
eram sobre escalação ("ninguém ganha papel que não tinha"), e sobre a promoção
isso é falso.

| movimento | desfecho |
|---|---|
| mudar o próprio papel no PROJETO, para baixo | **403** — [RN-472](../api.md#rn-472), inalterada |
| mudar o próprio papel no PROJETO, para cima | **403** — era permitido, e é o que muda |
| mudar o próprio papel no WORKSPACE, em qualquer sentido | **403** — a porta nova |
| reescrever o próprio papel com o MESMO valor | passa — upsert idempotente não é movimento |
| um `owner` rebaixando OUTRO `owner` no workspace | passa — é a única forma de revogar propriedade |
| associar/rebaixar OUTRA pessoa, em qualquer escopo | passa — capacidade legítima de sempre |
| auto-promoção pela REMOÇÃO da linha de projeto | passa — protegida pelo ADR 0156, ponto 3 |

**O teto NÃO conta owners.** Recusar só quando o chamador for o último dono foi
considerado e recusado pelo critério literal do ADR 0127: *"se enuncia numa
cláusula, não tem número para envelhecer"*. Uma contagem acrescenta uma leitura
que pode sair de fase com a escrita, tem de julgar se um segundo dono inativo
conta, e faz a mesma chamada com o mesmo corpo passar hoje e recusar amanhã sem
que nada do que o chamador controla tenha mudado. E a cláusula **já produz o
invariante que a contagem existiria para garantir**: um workspace nunca fica sem
`owner`, porque tirar o último exigiria que ele mesmo o fizesse.

**O teto 1 não tem par neste escopo, e foi considerado, não espelhado.**
Diferente da remoção ([RN-556](../api.md#rn-556)), aqui o movimento EXISTE — um `owner`
pode rebaixar outro. A recusa vem de o teto 1 ser regra sobre **inversão de
hierarquia**: no projeto a linha sobrepõe a de workspace ([RN-471](../web.md#rn-471)) e
um `maintainer` alcança quem está ACIMA dele; no workspace o
`@RequireRole('owner')` já garante que ninguém alcança alguém maior que si — a
precondição está ausente. Pôr o par, somado à ausência de rota de remoção, faria
de `owner` um **estado absorvente**: ninguém sairia dele por HTTP, e offboarding,
rotação de propriedade e correção de convite errado passariam a exigir escrita
direta no banco — a classe de estado que o ADR 0127 nasceu para eliminar, com o
sinal trocado.

**A régua não é copiada: a comparação vira UM classificador.**
`autoMovimentoDoProprioPapel` devolve o SENTIDO
(`'rebaixamento' | 'promocao' | null`) em vez de um booleano, porque quem chama
precisa dele para escolher a mensagem. `ehAutoRebaixamento` continua existindo
como uma LEITURA do classificador, e por motivo de comportamento e não de
compatibilidade: `remocaoEhAutoRebaixamento` delega a ela, e alargá-la faria a
REMOÇÃO recusar também a auto-promoção — tirar a própria linha que restringia
alguém é justamente como se desfaz a restrição que o teto 1 impede de criar,
movimento que o ADR 0156 protegeu por escrito.

**Quatro mensagens, uma por SENTIDO e por ESCOPO.** Quem tentou se promover não
recebe a frase de rebaixamento (não foi o que fez), e quem esbarra no teto do
workspace não é mandado falar com um `maintainer` — lá o papel que desfaz é
`owner`. Mesma disciplina do ponto 5 da [RN-556](../api.md#rn-556) e da
[RN-470](../web.md#rn-470).

**O papel do ator vem do repositório, não do `ResolveEffectiveRoleUseCase`** —
o inverso da escolha da RN-556, pela mesma razão que ela deu: nos casos de uso
de projeto o outro entra para o papel do ator não virar uma segunda composição
de `projectRole ?? workspaceRole` escrita à mão; no workspace não há composição
a proteger (`forWorkspace` É `workspaces.findMemberRole`), e este caso de uso já
tem o repositório na mão.

**A metade de PROMOÇÃO no workspace é inalcançável por HTTP, e é aplicada mesmo
assim.** Com `@RequireRole('owner')` o ator já está no topo e não há para onde
subir. Ela entra e é testada pelo motivo que o teto 2 sempre teve para não ter
limiar: o caso de uso não presume o guard, e é ele que fica certo no dia em que
a rota mudar de mínimo. Mesmo desenho da recusa por capacidade da
[RN-514](../engine.md#rn-514), implementada antes de ter disparo.

**Nenhuma linha de web muda, e não é omissão:** `POST /workspaces/:workspaceId/members`
não tem chamador em `apps/web` — medido; a única ocorrência é o tipo gerado em
`api-types.generated.ts`. Não há toast para ajustar nem `Select` para fechar.

- **Código:** `apps/api/src/domain/iam/tetos-de-rebaixamento.ts`
  (`autoMovimentoDoProprioPapel`, o tipo `SentidoDoAutoMovimento`, as três
  mensagens novas e o `ehAutoRebaixamento` que passou a ser leitura do
  classificador),
  `apps/api/src/application/use-cases/iam/add-workspace-member.use-case.ts`
  (a assinatura com `atorId`, a leitura do papel do ator e os dois 403),
  `apps/api/src/application/use-cases/iam/add-project-member.use-case.ts`
  (a troca de `ehAutoRebaixamento` pelo classificador, que é o que fecha a
  auto-promoção lá),
  `apps/api/src/interfaces/http/iam/workspaces.controller.ts`
  (`@CurrentUser()`, o `@ApiForbiddenResponse` e a descrição),
  `apps/api/src/interfaces/http/iam/dto/add-member.dto.ts` e
  `apps/api/src/interfaces/http/iam/projects.controller.ts` (as descrições que
  prometiam "sem teto nenhum" e "downgrading yourself"),
  `apps/api/src/db/seed.ts` (o `owner.id` como ator),
  `apps/api/src/application/use-cases/iam/resolve-effective-role.use-case.ts`
  (INTOCADO, terceiro ADR seguido)
- **Teste:** `apps/api/test/application/use-cases/iam/tetos-de-rebaixamento.use-case.spec.ts`,
  bloco *"Teto de auto-movimento no WORKSPACE — a quarta porta"* (a recusa com
  outro dono presente, a recusa do dono único, a promoção inalcançável, a
  mensagem por escopo, o upsert idempotente, o `owner` rebaixando outro `owner`
  e a associação de terceiros), mais os três casos no bloco do teto 2 — o teste
  da auto-promoção INVERTIDO, com o nome guardando a origem, a asserção de que
  cada sentido tem sua frase, e o upsert idempotente no projeto
- **ADR:** [0157](../../adr/0157-teto-de-auto-movimento-no-upsert-de-workspace.md),
  que referencia o [0127](../../adr/0127-tetos-de-rebaixamento-em-project-members.md)
  e o [0156](../../adr/0156-teto-de-auto-rebaixamento-na-remocao.md), e revisa a frase
  do primeiro sobre a auto-promoção
- **Origem:** `BRB-002`, P1 de Segurança do registro do mantenedor — o último
  movimento que os dois ADRs anteriores deixaram declarado

---

## A chave de dispositivo ganha tela, e a tela diz o alcance de revogar (RN-561)

<a id="rn-570"></a>

### RN-570 — O instalador sobe a instalação só com arquivos que a Release assinou, conferidos antes de perguntar ou gravar qualquer coisa {#rn-570}

A [RN-549](../ci.md#rn-549) mediu, na primeira vez que o instalador rodou numa máquina
limpa, que o `install.sh` publicado **não subia nada sozinho**: ele chamava
`docker compose -f docker/docker-compose.install.yml`, um caminho RELATIVO ao
diretório de onde rodava, e esse arquivo não era asset da Release, não entrava
no `checksums.txt` assinado e não era baixado em lugar nenhum. Quem seguia o
one-liner do runbook morria em *"no such file or directory"* DEPOIS de o script
ter gravado o `.env` com os segredos. O mantenedor decidiu a saída em
2026-09-13 — asset assinado, e não clone ([ADR 0160](../../adr/0160-o-compose-do-instalador-viaja-assinado.md)).

**A regra:**

1. **Quatro arquivos viajam com o instalador, no MESMO manifesto.** O compose de
   instalação e os três que a instalação usa por caminho relativo — o
   `postgres/init.sql` e o `ollama/pull-models.sh` que o compose bind-monta, e o
   `backup/test-restore-compose.sh` que a migração ([RN-530](../infra.md#rn-530)) executa —
   são publicados como assets `brabo-install-*` pelo job `checksums` e entram no
   `sha256sum` que gera o `checksums.txt` assinado. O quarto não estava no
   contorno do E2E e foi achado ao implementar: numa pasta sem checkout a
   migração morreria ali. O job confere cada linha do manifesto contra o arquivo
   (`sha256sum -c --strict`) antes de anexar.
2. **A tabela tem dois lados e um guarda.** Quem publica lê
   `scripts/ci/assets-do-instalador.ts`; quem baixa lê o `case` de
   `destino_do_asset_do_instalador` no `install.sh` (bash 3.2, sem Node). O spec
   reprova a divergência entre os dois E deriva do compose todo bind-mount `./…`
   que não estiver na tabela — que é exatamente como o defeito nasceu.
3. **Verificar vem logo depois da própria origem, e antes de tudo.** O
   instalador baixa os quatro e compara cada sha256 contra o `checksums.txt` que
   `verificar_a_si_mesmo` já verificou (nunca um segundo download), por
   igualdade EXATA de nome. As três recusas são distintas — asset não publicado,
   manifesto que não o cobre, hash que não bate — e todas acontecem com a
   máquina intocada.
4. **Nunca cai no relativo.** `COMPOSE_DE_INSTALACAO` nasce VAZIO e só ganha um
   caminho absoluto quando as cópias verificadas são postas sob a pasta da
   instalação, no primeiro instante em que são precisas (a migração ou a
   subida). O que já estiver lá é SUBSTITUÍDO, nunca lido — com `rm` antes do
   `cp`, para um symlink não levar a escrita para fora.

**O que esta regra NÃO fecha:** a prova ponta a ponta só acontece na primeira
tag final depois do merge — o `install-e2e.yml` não roda em PR (ADR 0150) —, e
nenhuma Release já publicada ganha os assets: elas seguem com o instalador
antigo e o contorno de rodá-lo de dentro de um checkout na tag. A adjacência
que o ADR 0160 declarou — `test-restore-compose.sh` chamava o Compose sem
`--env-file`, e o Compose procura o `.env` na pasta do compose — fechou na
AT-102: o instalador passa `BRABO_ENV_FILE` (`--env-file`, e não
`--project-directory`, que também mudaria o nome do projeto e a base dos
caminhos relativos) e o compose de instalação declara o volume `backup_local`
que o serviço `backup` referencia, cuja falta recusava o arquivo inteiro com o
profile ligado. Coberto por `scripts/dev/prova-de-restauracao-env.spec.ts`.

- **Código:** `install.sh:129` (`COMPOSE_DE_INSTALACAO` vazio até materializar),
  `:587` (`ASSETS_DO_INSTALADOR`), `:589` (`destino_do_asset_do_instalador`, a
  tabela do lado que baixa), `:614` (`baixar_e_verificar_os_arquivos_da_instalacao`),
  `:607`/`:615`/`:617` (as três recusas), `:648`
  (`materializar_os_arquivos_da_instalacao`), `:1573` (a migração materializa
  antes do backup), `:1677` (a verificação logo depois da própria origem),
  `:1831` (a subida materializa antes do `up`);
  `scripts/ci/assets-do-instalador.ts:55` (a tabela do lado que publica), `:93`
  (`problemasDoMapeamento`), `:135` (`prepararAssets`);
  `.github/workflows/build-runner-binaries.yml:468` (os assets preparados do
  checkout da tag), `:494` (no mesmo `sha256sum`), `:520` (a conferência
  `--strict`), `:527` (anexados junto do manifesto)
- **Teste:** `scripts/dev/install-arquivos-da-instalacao.spec.ts:144` (caminho
  feliz contra uma Release de mentira), `:162` (asset ausente, `.env` nunca
  gravado — caso de falha), `:179` (hash que não bate — caso de falha), `:191`
  (manifesto que não cobre), `:202` (nome parecido não cobre), `:217`
  (materializar sem verificar é recusa), `:225` (o que já estava é substituído,
  e o symlink não leva a escrita para fora), `:258`/`:273`/`:280` (a ordem em
  `main` e na migração); `scripts/ci/assets-do-instalador.spec.ts:89` (todo
  bind-mount relativo é asset), `:114` (o `case` do shell é a tabela do
  TypeScript), `:148`/`:152`/`:161` (a esteira assina, confere e anexa);
  `scripts/dev/install-e2e.spec.ts:247` (o contorno manual não volta, e o E2E
  afirma que o instalador os baixou), `:295` (o token que baixa o manifesto não
  está no ambiente do instalador)
- **Origem:** AT-026 — o achado da AT-008 (RN-549), decidido pelo mantenedor em
  2026-09-13

## O broker de container na instalação, com consentimento (RN-575)

<a id="rn-575"></a>

### RN-575 — O instalador só liga o broker de container com um "s" digitado, mede o grupo do socket de dentro de um container, e grava as quatro linhas juntas ou nenhuma {#rn-575}

Numa instalação por Release, projeto `container` ou `mounted` nunca executava:
quem sobe o container desses dois modos é o broker ([ADR 0144](../../adr/0144-a-segunda-raiz-do-broker.md)),
e a instalação não tinha o serviço porque a imagem não era publicada (ADR 0150,
decisão 7). O [ADR 0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md)
publica a imagem como a quinta e põe o serviço no compose de instalação,
DESLIGADO; esta regra é o que decide quando ele liga, porque ligar entrega o
socket do Docker da máquina a um serviço da instalação.

**A regra:**

1. **Só um "s"/"sim" digitado liga.** A pergunta vem depois da base (a segunda
   raiz do broker deriva dela) e antes do `.env`, e DIZ em texto o que concede —
   o socket do Docker desta máquina, e que quem comanda o broker comanda o
   Docker — e o que o contém. Enter, qualquer outra resposta e a falta de
   terminal deixam desligado, e a falta de terminal é DITA, nunca decidida em
   silêncio. Enquanto a resposta não é sim, o Docker não é tocado.
2. **O grupo do socket é MEDIDO, de dentro de um container**, com a própria
   imagem do broker, sem rede, rootfs read-only e o socket montado por
   `--mount type=bind` — que recusa uma origem inexistente em vez de criar uma
   pasta no host, como `-v` faria. É o gid visto de dentro que o `group_add`
   precisa (no Docker Desktop o do host não diz nada). Medição que falha, caminho
   que não é socket ou gid que não é número são RECUSA nomeada, que ensina a
   rodar de novo respondendo não — nunca o `999` do default do compose.
3. **As quatro linhas vão juntas ou nenhuma vai:** `COMPOSE_PROFILES=container-broker`,
   `BROKER_URL=http://broker:8090`, `DOCKER_GID` e `PROJECT_WORKSPACES_HOST_ROOT`.
   Profile sem URL sobe um broker que ninguém chama; URL sem profile aponta a
   api para um serviço que não sobe. `escrever_env` recusa gravar o bloco sem o
   gid medido — defeito do script, não da máquina. `BRABO_BROKER_IMAGE` é
   gravada SEMPRE, ligado ou não: o Compose interpola o arquivo inteiro antes de
   filtrar por profile.
4. **A raiz da pasta gerenciada é CALCULADA e depois CONFERIDA.** Antes da
   subida, `<DockerRootDir>/volumes/brabo_project_workspaces/_data`; depois,
   comparada com o `Mountpoint` do volume. Divergir, ou a api não alcançar o
   broker pela rede interna, vira PENDÊNCIA nomeada no fim — nunca recusa, que
   derrubaria uma instalação de pé por um passo que se conserta editando o
   `.env`.
5. **A decisão aparece no resumo final**, nos dois sentidos, e a frase do que
   o instalador NÃO faz deixa de dizer que só a Pasta montada fica sem
   container: `container` também fica.

**O que esta regra NÃO fecha:** o `DOCKER_GID` e a raiz calculada não foram
medidos no Docker Desktop do macOS, e o E2E da tag roda a metade interativa só
no Linux. Docker rootless ou remoto não tem o socket em `/var/run/docker.sock`,
que é o caminho que o compose monta, e cai na recusa do item 2 — ligar o broker
ali não é oferecido por outro caminho.

- **Código:** `install.sh:1211` (`consentir_broker`), `:1163`
  (`medir_gid_do_socket`), `:1198` (`calcular_raiz_gerenciada`), `:1335`
  (`conferir_o_broker`), `:792` (`escrever_env_do_broker`), `:855` (o broker no
  manifesto), `:1812` (a ordem: depois da base, antes do `.env`);
  `docker/docker-compose.install.yml` (o serviço `broker` e a rede `broker`)
- **Teste:** `scripts/dev/install-broker.spec.ts:158` (sem terminal: desligado,
  dito, Docker intocado — caso de falha), `:169` (Enter), `:179` (`n`), `:187`
  (`s` liga, com `--mount` e sem rede), `:208`/`:221`/`:229` (as três recusas),
  `:237` (a raiz como pendência), `:248` (a frase final);
  `scripts/dev/install-env.spec.ts:250`/`:259` (as quatro linhas juntas ou
  nenhuma), `:270` (a guarda do gid), `:291`/`:307` (o `.env` contra o parser do
  Compose: o broker sobe sem flag, com o token, as duas raízes e o gid, e a api
  aponta para ele — ou nada disso); `scripts/dev/composes-em-conformidade.spec.ts:114`
  (as camadas do ADR 0130 no arquivo que viaja)
- **ADR:** [0162](../../adr/0162-broker-publicado-e-oferecido-pelo-instalador.md)
- **Origem:** AT-097 — decidido pelo mantenedor em 2026-09-18

---

## O instalador oferece os modelos locais, e não confunde o dev com uma instalação (RN-691, RN-692)

<a id="rn-691"></a>

### RN-691 — O `install.sh` PERGUNTA se liga os modelos locais (profile `llm`), mede a porta do Ollama antes de gravar, e compõe UMA linha de `COMPOSE_PROFILES` {#rn-691}

Medido numa instalação real da v7.0.0 (AT-351): toda regra de negócio gravava
`backlog.semantic_duplicate_check_skipped` com `getaddrinfo EAI_AGAIN ollama`,
porque a instalação por Release sobe sem o profile `llm` e o instalador nunca
perguntava; ligá-lo à mão esbarrava em `address already in use` na 11434, a
porta de um Ollama NATIVO no host.

**A regra:** depois da pergunta do broker ([RN-575](#rn-575)), o instalador diz
o CUSTO (disco da imagem e dos modelos que o `ollama-model-loader` baixa, RAM
com modelo carregado) e o que se PERDE sem ele (a checagem semântica de
duplicata da [RN-681](../api.md#rn-681) e modelo local para os agentes), e só um "s"
digitado liga; sem terminal fica desligado DIZENDO isso. Ligar MEDE a porta do
host antes de gravar qualquer coisa — a 11434, ou a primeira livre até a 11443,
pelo `/dev/tcp` do próprio bash (3.2 incluso) — e a faixa inteira ocupada é
recusa NOMEADA, sem nada gravado, nunca um `address already in use` na subida.
O `.env` ganha `OLLAMA_PORT` e o profile `llm`; os profiles consentidos saem
numa ÚNICA linha `COMPOSE_PROFILES` (`container-broker,llm`), porque duas
linhas não somam — a última venceria e o broker sumiria calado.

Fica FORA, declarado: a sessão dizer UMA vez que a checagem semântica foi
pulada (lado da api, outra frente); e o E2E da tag responde NÃO (ligar
baixaria GBs de modelo), então a subida com o profile `llm` não é provada ponta
a ponta.

- **Onde:** `install.sh:1289` (`consentir_llm`), `:1274`
  (`escolher_porta_do_ollama`), `:1264` (`porta_em_uso`), `:800`
  (`escrever_env_do_llm`), `:821` (`escrever_env_dos_profiles`)
- **Teste:** `scripts/dev/install-llm.spec.ts` (sem terminal fica desligado
  dizendo o custo; 11434 ocupada escolhe a próxima; faixa inteira ocupada falha
  — caso de falha; um servidor escutando é medido como em uso; broker e modelos
  numa linha só); `scripts/dev/install-e2e.spec.ts` (a resposta da pergunta nova
  está na lista do driver de TTY, na ordem)
- **Origem:** AT-351

<a id="rn-692"></a>

### RN-692 — Só o projeto compose `brabo` é instalação anterior, e a migração oferece reinstalar DO ZERO depois do backup provado {#rn-692}

`detectar_por_sinais` casava `"Name":"brabo[^"]*"`, e o compose de DEV
(`brabo-dev`, ADR 0170) contava como instalação anterior — o instalador
oferecia migrar o ambiente de desenvolvimento. Agora casa só o nome EXATO
`brabo`.

E a confirmação da migração ganha uma terceira resposta: `z` reinstala DO
ZERO. A ordem do ADR 0150 não muda — backup, PROVA, pergunta, apaga, instala —,
mas os dados antigos NÃO são restaurados: o backup provado fica na pasta, e
restaurá-lo depois é o `#restore` do runbook. `s` restaura — e, desde a
[RN-998](#rn-998), restaura TUDO: o Postgres num banco recém-criado e vazio, os
repositórios git e a reprojeção do grafo e dos artefatos; até ali voltavam só
os repositórios git. Enter continua não apagando nada.

Junto, o fechamento deixa de dizer que parear uma pasta pela tela do projeto
"continua existindo (ADR 0118)": esse fluxo saiu no ADR 0203 ([RN-687](../web.md#rn-687)).

- **Onde:** `install.sh:440` (`detectar_por_sinais`), `:1935`
  (`migrar_instalacao_anterior`)
- **Teste:** `scripts/dev/install-llm.spec.ts` (`brabo-dev` não conta e `brabo`
  conta; `z` apaga depois da prova e deixa `MIGRAR_DE` vazio; Enter não apaga —
  caso de falha; a frase do ADR 0118 não volta)
- **Origem:** AT-358

## A migração do instalador traz a instalação anterior inteira de volta (RN-998)

<a id="rn-998"></a>

### RN-998 — A migração restaura o banco num banco vazio, mantém a chave mestra, é retomável e entende a linha de versões {#rn-998}

A primeira migração real de uma 7.0.0 para o produto 1.0.0 (AT-710) subiu uma
instalação VAZIA e com as credenciais ilegíveis. O [ADR 0256](../../adr/0256-a-migracao-restaura-o-banco-num-banco-vazio.md)
fecha os achados da AT-738, e as regras são estas:

1. **O Postgres volta sozinho.** Depois do `down -v`, o instalador sobe SÓ o
   `postgres`, roda `brabo-restore --banco-vazio` (recusa banco com qualquer
   tabela) e só então sobe o resto, com as migrations por cima do dump. Em
   seguida, os repositórios git e a reprojeção do grafo e dos artefatos; a
   reprojeção que falha é PENDÊNCIA com o comando, nunca recusa.
2. **O git volta como o dono do volume**, lido no container da api (`stat`),
   nunca suposto: o uid 70 da imagem de backup não escreve num volume de outro
   dono, e `--user 0:0` também não, por causa do `cap_drop`.
3. **Os segredos que cifram dado restaurado vêm do `.env` anterior**, no mínimo
   a `CREDENTIALS_MASTER_KEY` (ambiente → `.env` anterior → gerada), e toda
   chave que o `.env` novo não declara volta com o último valor
   (`CREDENTIALS_MASTER_KEY_PREVIOUS`, `ANAMNESE_ENABLED`, `BRABO_BIND`…). Ficam
   de fora as que o instalador decide na hora (`COMPOSE_PROFILES`,
   `BROKER_URL`, `DOCKER_GID`, `PROJECT_WORKSPACES_HOST_ROOT`, `OLLAMA_PORT`) e o
   `_PREVIOUS` dos segredos efêmeros, que nascem novos.
4. **Backup, prova e deleção rodam com o ambiente da migração:** as cinco
   `BRABO_*_IMAGE` desta versão (o `.env` anterior pode citar imagem local que
   sumiu), `BRABO_BACKUP_USER` = uid:gid de quem roda (a pasta é dele) e
   `BRABO_BACKUP_HOST_DIR` = o destino, para a prova restaurar o MESMO backup
   que fica na pasta. A pasta nasce `0755`, declarado.
5. **A migração é retomável.** O marcador (schema 4) é gravado logo depois do
   `down -v` com `restauracaoPendente` (`destino` e `etapas`: `banco git grafo
   artefatos`), e de novo a cada etapa e quando a versão nova sobe. A execução
   seguinte que acha a pendência RETOMA a restauração, sem migrar de novo e sem
   apagar nada; pasta de backup ausente é recusa nomeada.
6. **Linha de versões.** O marcador grava `linha`. Sem ela, a instalação é da
   linha anterior, salvo imagens em `ghcr.io/viralabs-dev/` (a 1.0.0 desta linha
   gravou schema 3). Entre linhas a relação é `nova-linha`, com frase própria e
   default sim ([RN-542](parte-01.md#rn-542)).
7. **Download com nova tentativa.** Todo download passa por `baixar` (`curl
   --retry 6 --retry-delay 10 --retry-connrefused`); 404 é "a Release não
   publica", e o resto é "o servidor não entregou, rode de novo" — frases
   diferentes.

Ela revisa a [RN-530](../infra.md#rn-530) (o dump deixa de ficar só na pasta) e
a frase de `s` da [RN-692](#rn-692).

- **Onde:** `install.sh:1935` (`migrar_instalacao_anterior`), `:1920`
  (`com_ambiente_do_backup`), `:2010` (`restaurar_o_banco`), `:2026`
  (`restaurar_os_repositorios_git`), `:2042` (`reprojetar`), `:2062`
  (`gravar_marcador`), `:930` (`relacao_com_o_instalado`), `:949`
  (`restauracao_pendente`), `:736` (`gerar_segredos`), `:971`
  (`preservar_do_env_anterior`), `:194` (`baixar`)
- **Teste:** `scripts/dev/install-migracao.spec.ts` (um caso por item, com
  `docker`, `curl` e a prova de mentira no PATH; o caso de falha de cada um —
  backup que falha não apaga, restore recusado fica pendente, dono ilegível
  recusa, 404 ≠ 504); `scripts/dev/install-fechamento.spec.ts` (o schema 4)
- **Origem:** AT-738 (EP-033), decisões do dono de 05/11/2026
