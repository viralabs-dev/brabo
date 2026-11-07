# ADR 0265 — O app declarado pela Infra propõe recriar o container, com a porta na faixa 13000+

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `container`
- **Referencia:** completa o ADR [0264](0264-o-app-reinicia-so-o-processo.md): o reinício só tem efeito depois que o app sobe a primeira vez. Usa o comando e a rede do ADR [0228](0228-comando-do-app-e-rede-do-container.md) e o aceite na hora do ADR [0163](0163-o-clique-responde-ao-aceitar.md). Implementado pela RN-1029 (api#43) e pelo cartão da web#24 (AT-758, decisão do dono de 06/11/2026).

## Contexto

Nos TP-01 de 05 e 06/11, o app entregável nunca rodou. O container do projeto subia no aceite da Infra, antes de a PR de infra declarar o `run.app`, e ficava em `sleep infinity`, sem porta publicada. Nada propunha recriá-lo. A porta, além disso, só era publicada quando uma pessoa declarava a rede (RN-932), e o `app.port` dos três testes era 3000, porta reservada da instalação.

## Decisão

1. **Proposta depois do merge.** Quando a PR de infra que declara `run.app` é mergeada na `main` (e é a PR vigente do `run_instructions`), a api propõe um `container_recreate` como `agent/infra`, na sessão do merge, fora da transação e em melhor esforço. O payload é `{ reason: 'app_declared', pullRequestId, ports: [{ host, container, protocol: 'tcp' }] }`.
2. **O clique continua humano.** A recriação segue exigindo aprovação (RN-934). O cartão mostra `http://127.0.0.1:<host>`.
3. **Porta no host sempre na faixa 13000+:** o primeiro valor livre a partir de 13000, pulando as portas já declaradas por qualquer projeto. A porta no container é o `app.port`.
4. **O clique vale como a declaração humana da rede.** Se o projeto não tem rede vigente, o recreate grava `artifact.container_network` com o ator `user/<quem clicou>` antes de remover o container antigo.
5. **Não propor duas vezes.** A proposta é pulada nestes casos:
   - projeto `runner`;
   - sem container, ou container `removed`, `failed` ou `provisioning`;
   - recreate já pendente;
   - container que já entrou em `running` depois do `run_instructions` vigente.

## Consequências

- Depois do primeiro clique, os merges seguintes só reiniciam o processo (ADR 0264). O recreate volta a ser proposto só quando a porta precisa mudar.
- Limites, registrados na RN-1029:
  - qualquer versão antiga de rede conta como porta ocupada;
  - um recreate pendente de outro projeto ainda não reserva a porta dele;
  - um container religado à mão passa por "em dia".
- Se o app escutar só em `127.0.0.1` dentro do container, a porta publicada não o alcança. Isso vai ser medido no próximo TP-01 e, se acontecer, vira AT do prompt da Infra.

## Alternativas consideradas

- **Usar o próprio `app.port` quando permitido.** Recusada pelo dono: a faixa 13000+ fica previsível e nunca colide com a instalação.
- **O cartão só recria, e a rede é declarada à mão.** Recusada: o app não abriria no navegador sem um passo a mais.
- **Recriar sem clique.** Recusada: a recriação continua sendo gesto humano.

## Referências

- [0163](0163-o-clique-responde-ao-aceitar.md), [0213](0213-o-entregavel-roda-na-maquina-pelo-compose-da-infra.md), [0228](0228-comando-do-app-e-rede-do-container.md), [0264](0264-o-app-reinicia-so-o-processo.md).
