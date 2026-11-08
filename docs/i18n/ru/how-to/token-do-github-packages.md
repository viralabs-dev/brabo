---
id: token-do-github-packages
title: Токен GitHub Packages
sidebar_label: Токен GitHub Packages
description: Для тех, кто собирает Brabo из исходников (--source=local) - создайте classic PAT только с read:packages, сохраните его в .npmrc и проверьте, не раскрывая значение.
keywords: [pat, github packages, npmrc, read:packages, install.sh, source local]
---

# Токен GitHub Packages

Кто устанавливает с `--source=local`, собирает образы api, web и broker на своей машине. Все три устанавливают `@viralabs-dev/brabo-shared` и `@viralabs-dev/brabo-docker-port` из реестра GitHub Packages. Пакеты публичные, но реестр требует токен даже для установки. Без него сборка падает с `401`, а установщик отказывается ещё до начала. Установке из GHCR (`--source=ghcr`, по умолчанию) всё это не нужно.

## Пошагово

1. На GitHub откройте **Settings > Developer settings > Personal access tokens > Tokens (classic)** и выберите **Generate new token (classic)**.
2. Отметьте **только** `read:packages`. Других прав не нужно.
3. Скопируйте токен и запишите эту строку в `~/.npmrc` (замените `<PAT>` токеном):

   ```text
   //npm.pkg.github.com/:_authToken=<PAT>
   ```

4. Проверьте, что строка есть, не показывая значение:

   ```bash
   grep -c '^//npm.pkg.github.com/:_authToken=.' ~/.npmrc
   ```

   Должно вывести `1`.
5. Запустите `./install.sh --source=local` из чекаута, на теге и с чистым деревом.

## Другой файл

`NPMRC=<файл>` направляет установщик, bake и `make dev` на другой файл вместо `~/.npmrc`.

## Безопасность

- Установщик лишь проверяет наличие строки; значение он никогда не выводит.
- При сборке файл попадает как секрет BuildKit (`id=npmrc`), никогда не как `ARG`, `ENV` или слой образа.
- Токен только читает пакеты. Если он утёк, отзовите его в **Personal access tokens** и создайте новый.

См. также раздел [Токен GitHub Packages](https://github.com/viralabs-dev/brabo-infra#token-do-github-packages) в README `brabo-infra`: он охватывает среду разработки и CI.
