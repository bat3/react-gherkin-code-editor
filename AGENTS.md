# AGENTS.md

## Overview

`react-gherkin-code-editor` is a React component library providing a Gherkin code editor built on top of Monaco Editor. It handles syntax highlighting, keyword completion, and Gherkin scenario formatting.

## Repository Structure

- `src/`
  - `components/`
    - `Editor.tsx`: React component interface wrapping the Monaco Editor instance (`EditorExposeMethods`, props, auto-formatting on blur/mount).
  - `lib/`
    - `Editor.ts`: Monaco editor initialization, language registration, custom token completion provider, document formatting provider, and theme settings.
    - `Gherkin.ts`: Gherkin keywords, syntax definitions, and Monarch tokenizer rules.
    - `formatterHelpers.ts`: Core Gherkin string/line formatting logic (table alignment, indentation for Steps, Background, Examples, DocStrings, Tags).
    - `formatterHelpers.test.ts`: Jest unit tests for Gherkin formatting helpers.
  - `index.ts`: Entry point exporting the `Editor` component, props, and expose method types.
- `index.html`: Vite development preview app entry point.

## Development & Workflows

### Package Manager
- `pnpm` is the preferred package manager (v10+). Run `pnpm install` before running scripts if `node_modules` is absent.

### Key Commands
- **Install Dependencies**: `pnpm install`
- **Development Server**: `pnpm dev` (starts Vite dev server)
- **Build**: `pnpm build` (compiles `src/index.ts` using `tsup` to CJS, ESM, and type declarations in `dist/`)
- **Run Tests**: `pnpm test` (runs Jest test suite)
- **Test Watch Mode**: `pnpm test:watch`
- **Lint / Check Code**: `npx biome check src`
- **Format Code**: `npx biome format --write src`

## Coding Standards & Style Conventions

- **Language**: TypeScript (`tsconfig.json`) targeting ES2020.
- **Indentation**: Tab indentation (`indentStyle: "tab"` in `biome.json`).
- **Formatter & Linter**: Biome (`@biomejs/biome`) is used for code formatting and linting.
- **Testing**: Jest with `ts-jest` for unit testing logic in `src/lib/`.
