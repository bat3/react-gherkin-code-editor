# AGENTS.md

## Overview

`react-gherkin-code-editor` is a React component library providing a Gherkin code editor built on top of Monaco Editor. It handles syntax highlighting, keyword completion, and Gherkin scenario formatting.

## Repository Structure

- `src/`: Core source code containing editor components, Monaco setup, and formatting logic.
- `index.html`: Vite development preview app entry point.

## Development & Workflows

### Package Manager
- `npm` is the package manager for this repository. Run `npm install` before running scripts.

### Key Commands
- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev` (starts Vite dev server)
- **Build**: `npm run build` (compiles `src/index.ts` using `tsup` to CJS, ESM, and type declarations in `dist/`)
- **Run Tests**: `npm test` (runs Jest test suite)
- **Test Watch Mode**: `npm run test:watch`
- **Lint / Check Code**: `npx biome check src`
- **Format Code**: `npx biome format --write src`

## Coding Standards & Style Conventions

- **Language**: TypeScript (`tsconfig.json`) targeting ES2020.
- **Indentation**: Tab indentation (`indentStyle: "tab"` in `biome.json`).
- **Formatter & Linter**: Biome (`@biomejs/biome`) is used for code formatting and linting.
- **Testing**: Jest with `ts-jest` for unit testing logic in `src/lib/`.
