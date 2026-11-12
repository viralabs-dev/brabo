# ADR 0292 — O merge automático é opção do projeto, desligada por padrão

- **Status:** aceito
- **Data:** 2026-11-11
- **Tema:** `git`
- **Referencia:** AT-902 (EP-036), decisão do dono de 11/11/2026 (opção D do levantamento R364-L2). Achado 10 da 28ª rodada do TP-01. Revisa, só para o projeto que liga a opção, a RN-006, a RN-670 (ADR 0189), as RN-418 e RN-663 citadas no levantamento, e a regra "merge em branch protegida é sempre manual" do `CLAUDE.md` de cada repo. Depende da AT-911 (`brabo-engine#82`, mergeada em 11/11/2026), que faz o gate avaliar o commit que vai ser mergeado.

## Contexto

Na 28ª rodada do TP-01, com o piloto automático ligado, o merge continuava com o usuário. Cada PR verde parava os 7 devs (`devs_trabalhando=0/7`) até o clique. Fora do chat, o único aviso era o "(1)" no título da aba.

O merge manual é regra em quatro lugares:

- **Teto da trava de merge** (RN-006, `brabo-api` `decide.ts`): o `git_merge` para branch protegida nunca é `auto_approve`, nem com piloto automático.
- **Piloto automático** (RN-670, ADR 0189): "merge em branch protegida" fica fora do piloto.
- **"Sempre permitir"** (`brabo-api` `sempre-permitir.ts`): recusa gravar o padrão do `git_merge`, porque o merge é decisão a cada vez.
- **Regra transversal**: o `CLAUDE.md` de cada repo diz que o merge em branch protegida é sempre manual.

Como a RN-1005 faz o módulo dependente esperar o merge, cada PR verde segurava os dependentes. O aviso que existia (AT-810, RN-1063) não dizia quantas tarefas a PR destrava.

## Decisão

A opção D do levantamento, tomada pelo dono:

1. **Merge automático opcional por projeto.** Uma PR para a branch de trabalho (a `dev`), com todos os gates verdes e sem conflito, entra sozinha quando o projeto liga a opção.
2. **A opção nasce desligada.** Projeto que não liga a chave continua com a RN-006 e a RN-670 como estão, sem mudança de comportamento.
3. **Revogação só para quem liga.** A RN-006, a RN-670 e as RN-418 e RN-663 deixam de valer para o projeto que liga a opção. A regra "merge manual" continua valendo para todos os outros. O merge na `main` segue do dono.
4. **Pré-requisito AT-911.** A opção só pode ser ligada depois da AT-911, porque o gate precisa avaliar o commit que vai ser mergeado. Sem ela, o gate aprovava a versão do worktree e o merge usava a do repositório bare (achado 21 da 28ª, com um commit `wip` que entrou na `main`).
5. **Aviso "destrava N tarefas"** entra junto, na mesma decisão. A faixa de PR pronta diz quantas tarefas o merge destrava, para quem deixa a opção desligada.

A implementação (a chave por projeto com migração, `decide.ts`, `sempre-permitir.ts`, o gatilho no engine a partir de `task.gate_resolved`, e a tela, com prévia em `13-design` antes do merge) fica para uma rodada própria. Esta ADR só fixa a decisão.

## Alternativas

- **A. Só o aviso "destrava N tarefas".** Não ficou de fora: entra junto com a decisão (item 5). Sozinho não resolve o gargalo serial, porque o clique continua sendo obrigatório para cada PR.
- **B. Notificação do navegador.** Ficou de fora. Exige permissão do navegador, gera ruído quando há muitas PRs prontas e sai do "sem notificação do navegador" da AT-810, sem resolver a espera pelo clique.
- **C. "Mergear as prontas" em lote, com um clique.** Ficou de fora. É a recomendação intermediária do levantamento, mas o dono escolheu D. O lote mantém o humano como ponto de merge, então o dev ainda para até o clique.
- **Automatizar sem a AT-911.** Ficou de fora. Mergearia código que nenhum gate viu, pelo mesmo caminho do achado 21.

## Consequências

- **Para quem liga:** a PR verde deixa de esperar um clique, e os dependentes andam sem parar a cada entrega. O humano deixa de ver cada merge antes de ele acontecer.
- **Para quem não liga:** nada muda. A RN-006 e a RN-670 seguem como estão.
- **Risco:** código entra na `dev` sem olhar humano, confiando nos gates. Os controles são a chave desligada por padrão, o pré-requisito da AT-911 e o escopo limitado à branch de trabalho, sem merge na `main`.
- **Lacuna declarada:** a ADR não garante que os gates pegam tudo. A prova é a rodada seguinte do TP-01, com o `achados.md` conferindo que nenhum merge automático trouxe código que um gate não viu.
- Nenhuma RN nova é escrita aqui. As revogações entram com a implementação, no mesmo PR que muda `decide.ts`.
