# Meet Trace

Capture meeting captions in Google Meet and Microsoft Teams (web).
Translate live captions with Chrome's built-in Translator API (on-device, no API keys).

## Tech stack

- pnpm, WXT (web extension framework), React 19, TypeScript, Tailwind CSS v4

## Project layout

- `src/entries/` — WXT entrypoints: `background`, `popup`, `options` (settings), `live.content` (meeting page overlay, alias `@live`), `transcripts` (meeting history page)
- `src/core/` — shared logic: constants, i18n (`i18n/locales`, one file per language), colour themes, Chrome built-in AI typings
- `src/ui-kit/` — shared React providers (i18n, theme), toasts and design tokens
- `public/` — icons

## Important notes

- Follow the existing patterns in the codebase.
- Every UI string goes through i18n; add new keys to all files in `src/core/i18n/locales/`.
- Check package.json before installing anything.

## Design style

- Minimal, clean and modern, in the spirit of Apple's apps.

## Coding style

- File names are kebab-case (e.g. `line-row.tsx`).
- Components and functions are arrow functions; component props types are named `Props`.
- Avoid `any`; prefer narrow types and type guards over assertions.
- Modern React patterns: custom hooks, container/presentational components.
- Keep files around 100–120 lines; split longer ones.
