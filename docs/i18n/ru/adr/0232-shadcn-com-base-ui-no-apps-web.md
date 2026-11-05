---
traducao_de: cba75d8600bf8985f8a3c8bb3ad62e8bfdac7571
---

# ADR 0232 — shadcn/ui с Base UI и Tailwind 4 в `apps/web`

## Статус

**Принято.** 2026-10-31 (AT-645, волна 1 из AT-636; решения владельца от 31.10).
Не редактирует ADR 0074 (тема в обоих режимах) и 0181 (нейтральная палитра): использует
их токены как источник. Номер 0231 зарезервирован за AT-626.

## Контекст

Чат и ИИ-интерфейс переходят на паттерны AI Elements, которые
поглотил shadcn. `apps/web` — это CSS Modules поверх `design/tokens.css`, без
Tailwind и без алиаса `@/`. Тема записывается в `[data-theme]` через
`public/theme-boot.js`; shadcn ожидает `.dark`. Есть коллизии имён между
токенами Brabo и сырыми переменными shadcn (`--accent`, `--radius-*`,
`--font-mono`).

## Решение

- **База:** shadcn/ui, стиль `base-nova`, поверх **Base UI** (`@base-ui/react`),
  а не Radix. Tailwind 4 через `@tailwindcss/vite`.
- **Тема:** нейтральная палитра с терракотой и шрифты Space Grotesk, Archivo и
  IBM Plex Mono остаются. shadcn темизируется токенами Brabo, а не наоборот.
- **Сосуществование:** `*.module.css` остаются до финальной чистки.
  **Preflight Tailwind входит только в конце**; до тех пор `src/shadcn.css` импортирует только
  `tailwindcss/theme` и `utilities`, в layers (проигрывают CSS без layer), с
  `source(none)` и `@source` только в `components/shadcn/`, чтобы не порождать
  россыпь утилит (`.absolute`, `.container`) из остального `src`.
- **Цвета:** `@theme { --color-*: initial }` и `@theme inline`, сопоставляющий
  семантические цвета с токенами (`primary`→`--accent`, `accent`→`--surface-2`...).
  Проект НЕ объявляет сырые переменные shadcn. `--radius-*` и `--font-mono`
  уже принадлежат Brabo, а `:root` без layer побеждает default Tailwind.
- **Dark:** `@custom-variant dark` поверх `[data-theme='dark']`.
- **Алиас** `@/` → `apps/web/src` (vite и tsconfig); существующий код не
  переписывается. `components.json`: `aliases.ui` = `@/components/shadcn` (не
  `components/ui`, которая принадлежит собственным примитивам), `utils` = `@/lib/utils` (`cn`).
- **Зависимости**, каждая с причиной:
  - `tailwindcss` и `@tailwindcss/vite`: движок утилит shadcn;
  - `@base-ui/react`: примитивы без стилей под компонентами;
  - `class-variance-authority`: варианты копируемых компонентов;
  - `clsx` и `tailwind-merge`: `cn`, разрешающий конфликты классов;
  - `lucide-react`: иконки `iconLibrary` shadcn (пока не используются).
- **Бандл:** группа `vendor-ui` в списке разрешённых `codeSplitting.groups`
  (Base UI, cva, clsx, tailwind-merge, lucide).
- **Минимальное доказательство:** `components/shadcn/button.tsx` (реестр `base-nova`, с
  заменённым импортом `cn` и ссылками `var(--secondary)`/`var(--foreground)`,
  заменёнными токенами Brabo), не используется на экране, с тестом.

## Последствия

- Ни один экран не меняется. Глобальный CSS растёт за счёт layer темы и утилит
  Button; JS начального чанка не меняется (у Button нет импортёра).
- Новый компонент shadcn рождается в `components/shadcn/`; CLI пытается запустить
  `pnpm add` и может упасть без `pnpm` в PATH, и тогда файл берётся из реестра
  и правится вручную.
- Вне этой волны: собственные адаптеры, паттерны ai-elements, экраны, preflight и
  удаление `module.css`.
