---
traducao_de: 8ab4a94a8ad005489ee47bbc26e7f70b0c2dfa0b
---

# ADR 0245 — Быстрый доступ по роли только в локальном окружении

- **Статус:** принято
- **Дата:** 2026-11-03
- **Ссылается на:** ADR [0031](0031-auth-first-party-argon2id-e-rotacao-de-refresh.md) и [0032](0032-corte-do-keycloak-e-sessao-em-cookie.md) (сессия и cookie), [0073](0073-o-caminho-publicado-nomeia-o-ambiente.md) (словарь `dev`/`prd`), [0119](0119-imagens-publicadas-no-ghcr-por-digest.md) (опубликованные образы) и [0155](0155-a-primeira-conta-nasce-no-terminal.md) (RN-546). Ни один из них не редактируется.

## Контекст

Владелец (AT-722, 03.11) попросил диалог на экране входа, в котором
выбор роли сразу выполняет вход, для разработки и для TP-01 на установке,
собранной на этой машине. Продакшен — это всё, что выходит через GitHub Actions. Дверь,
выдающая сессию без учётных данных, — это граница аутентификации: ей нужен барьер,
не зависящий от того, что кто-то не забудет её отключить.

## Решение

1. **Одна переменная окружения, три значения.** `BRABO_AMBIENTE` в api и
   `VITE_BRABO_AMBIENTE` в web (Vite экспонирует только `VITE_*`): `dev` (Actions на
   `dev`), `prd` (Actions на `main` и теги релиза) и `local` (только вне
   Actions). Быстрый доступ существует **только при `local`**; если значение отсутствует, пусто или
   любое другое, его нет.
2. **Четыре слоя.**
   - Сборка: `AMBIENTE` в `docker-bake.hcl` (по умолчанию пусто) становится build-arg
     `BRABO_AMBIENTE` (api) и `VITE_BRABO_AMBIENTE` (web); в web мёртвая ветка
     исчезает из бандла, без чанка.
   - Файл образа: Dockerfile api записывает `/app/AMBIENTE_DA_IMAGEM`
     (`environment:` в compose перезаписывает `ENV`, но не файл).
   - Runtime: предикат `acessoRapidoLigado` требует переменную `local` И
     отсутствие файла (`pnpm dev`) или `local`; модуль регистрируется только так,
     иначе маршруты отвечают 404. `NODE_ENV` не участвует: установка работает в
     `production`.
   - Доказательства: spec предиката, spec модуля, `scripts/ci/ambiente-nas-actions.spec.ts`
     (ни один workflow не включает `local`), шаги `docker/smoke.sh` и тест E2E.
3. **Продакшен — это всё, что выходит через Actions**: `ci.yml` передаёт `dev` или `prd`
   по базе PR, а `release.yml` передаёт `prd`. `install.sh` не меняется; TP-01
   включает `local` через runbook.
4. **Учётные записи `<papel>@brabo.dev`** (`owner`, `maintainer`, `developer`,
   `viewer`, `ROLE_ORDER`). `POST /auth/dev-login { papel }` разрешает только эти
   учётные записи, никогда произвольный e-mail, и выдаёт сессию тем же `EmitirSessaoUseCase`,
   что и вход. В установке маршрут гарантирует учётные записи через ядро
   `ProvisionarUsuarioUseCase` со СЛУЧАЙНЫМ отброшенным паролем, в отдельном
   workspace («acesso rápido (local)»), без доступа к реальным проектам. RN-546
   остаётся нетронутой: известного пароля нет, а seed по-прежнему отказывает продакшену.
   Без пользователя в установке — 409 (`first-account` создаёт первую учётную запись).
5. **Bind на `127.0.0.1`.** При `local` порты api и web установки
   привязываются к `127.0.0.1` (`BRABO_BIND`).
6. `dev@brabo.dev` из seed становится `developer@brabo.dev`.

## Последствия

- Заявленные риски: при `local` тот, кто достаёт до порта, входит с любой
  ролью (поэтому bind); у маршрута нет rate limit и CSRF, как у
  `/auth/login`, а защита — в том, что его не существует вне `local`; образ,
  собранный вручную с `AMBIENTE=local`, локален по определению; база, засеянная
  ранее, сохраняет осиротевший `dev@brabo.dev` до следующего сброса.
- Маршрут не появляется ни в `route-surface.spec`, ни в `openapi.json`; он описан
  прозой в `docs/security-surface.md`.
