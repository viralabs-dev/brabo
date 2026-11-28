# ADR 0301 — O projeto novo nasce em Container, mesmo com base consentida

- **Status:** aceito (27/11/2026, AT-1034, decisão do dono)
- **Data:** 2026-11-27
- **Tema:** `modos`
- **Referencia:** ADR [0146](0146-base-consentida-no-bootstrap.md) (este revisa o ponto 4), [0072](0072-projeto-local-ou-container.md) (o padrão `container` que volta), [0141](0141-base-unica-dos-projetos-montados.md) (a base continua como está).

## Contexto

O ponto 4 do ADR 0146 pré-seleciona "Pasta montada" no assistente de criação de projeto quando a instalação tem base consentida. Na prática, quem decide é quem instalou: o usuário do Brabo é leigo, abre o assistente e herda um modo que ele não escolheu nem entende. O TP-01 31ª (achado 4, 27/11/2026) mostrou isso. O dono decidiu em 27/11/2026 reverter a pré-seleção.

## Decisão

- **Com base de projetos consentida e broker confirmado, o projeto novo volta a nascer em `container`**, o padrão do ADR 0072, para todo mundo.
- **"Pasta montada" continua oferecida**, como escolha consciente: aparece com a base e o caminho sugerido `<base>/<slug>`, mas **não vem pré-selecionada**.
- Sem base (`projectsBase: null`), nada muda: "Pasta montada" não é oferecida (RN-500).
- Não mudam: o enum `projectExecutionModeEnum`, a conversão entre modos (ADR 0111), o consentimento no bootstrap, a sonda de compartilhamento e o broker sem profile no compose local (pontos 1, 2, 3 e 5 do 0146).

## Alternativas rejeitadas

- **Manter `mounted` pré-selecionado e explicar na tela:** exige do leigo entender a diferença antes de começar.
- **Retirar "Pasta montada":** tira de quem quer abrir os arquivos no editor o único modo que o permite sem configuração.

## Consequências

- A RN-513 do `brabo-web` (pré-seleção de `mounted` com base) é revisada na PR do web; esta PR só registra a decisão.
- Quem quer ver os arquivos na própria máquina marca "Pasta montada" no assistente, ou converte depois (ADR 0111).
- O ponto 4 do 0146 deixa de valer; o resto do 0146 segue aceito.
