# ADR 0264 — Depois do avanço da pasta, o app reinicia só o processo, sem recriar o container

- **Status:** aceito
- **Data:** 2026-11-06
- **Tema:** `container`
- **Referencia:** revisa as decisões 1 e 5 do ADR [0228](0228-comando-do-app-e-rede-do-container.md): o app era lançado uma vez, na criação do container, sem supervisão. Segue o ADR [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md) (a pasta acompanha a `main`) e usa a segunda raiz do broker do ADR [0144](0144-a-segunda-raiz-do-broker.md). Decisão do dono de 06/11/2026 (AT-617; primeiro app na AT-758).

## Contexto

O supervisor do app lançava o comando declarado uma vez, sem guardar o PID, e nada o reiniciava. Os comandos das lanes rodam no mesmo container. Parar e subir o container derrubaria esses comandos e voltaria a rodar o comando antigo. O `container_recreate` exige clique humano. Com a pasta avançando a cada merge (ADR 0263), o app ficaria rodando o código anterior.

## Decisão

1. **Operação nova na porta Docker:** `REINICIAR_APP` / `reiniciarApp`. Ela reinicia SÓ o processo do app supervisionado. O supervisor grava o `.pid` do app para achá-lo. Contrato no `brabo-contracts` (por TAG), rota no broker, porta e caso de uso na api.
2. **O engine pede o reinício só quando a pasta andou** (`{:avancou}`). Merges em sequência, dentro de uns 30 segundos, viram um reinício só.
3. **Linha do tempo:** `workspace.checkout_advanced` e, depois, `app.restarted`, `app.restart_failed` ou `app.restart_skipped`. Nenhum evento leva trecho do log, porque o comando do app pode ter segredo em texto.
4. **A falha só avisa.** A pasta não volta: a `main` já andou, e voltar contradiria o trunk.

## Consequências

- As lanes continuam rodando durante o reinício do app.
- O reinício só tem efeito visível depois que o app sobe a primeira vez. Hoje o container nasce antes de a PR de infra declarar o `run.app`, o que fica para a AT-758: propor o `container_recreate`, com clique, depois desse merge.
- "Subiu" é medido por uma espera curta. Um app que morre depois disso só aparece no próximo reinício ou no uso.

## Alternativas consideradas

- **Parar e subir o container.** Recusada: derruba os comandos das lanes e reroda o comando antigo.
- **`container_recreate` automático.** Recusada: a recriação continua exigindo o clique humano.
- **Voltar a pasta quando o reinício falha.** Recusada pelo dono.

## Referências

- [0144](0144-a-segunda-raiz-do-broker.md), [0228](0228-comando-do-app-e-rede-do-container.md), [0263](0263-o-projeto-do-usuario-trabalha-em-trunk.md).
