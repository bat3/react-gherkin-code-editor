# Prioritized Roadmap & GitHub/GitLab Issues

This document provides an overview of the architectural analysis and prioritized backlog for `react-gherkin-code-editor`. The detailed, import-ready issue templates can be found in the `ISSUES/` directory.

## Summary of Architectural Analysis

An architectural review of `react-gherkin-code-editor` identified four main areas for structural improvement:

1. **Memory Leaks & Lifecycle Management (P0)**:
   - `useEffect` in `Editor.tsx` contains commented-out cleanup code (`// Todo return () => editor?.dispose();`).
   - Every update to `props.code` instantiates a new Monaco `Editor` instance without disposing of the previous one.
   - Monaco providers (completion items, tokens, themes, formatters) are registered on every constructor call, leading to duplicate provider registrations and memory retention.

2. **React Component API & State Synchronization (P1)**:
   - The editor is largely uncontrolled and lacks an `onChange` prop for real-time text updates.
   - Props like `theme` and `language` are not accepted directly; theme switching is only exposed via imperative ref methods (`updateTheme`) and only supports hardcoded dark theme.

3. **Multi-Language (i18n) Gherkin Support (P2)**:
   - Keywords and tokenizer rules are currently hardcoded in English (`GherkinLanguage-en`).
   - Gherkin files frequently use headers like `# language: fr` or `# language: es` to define localized step keywords (e.g. *Fonctionnalité*, *Scénario*, *Étant donné*, *Dado*, etc.).

4. **Formatting Robustness & Edge Cases (P3)**:
   - `removeMultipleSpaces` compresses consecutive spaces across all lines, including inside DocStrings (`"""` / ```` ````) and quoted strings where spacing may be intentional.

---

## Index of Issues

| Issue ID | Priority | Title | Description |
| :--- | :--- | :--- | :--- |
| [Issue #1](./ISSUES/01-p0-monaco-editor-lifecycle-and-memory-leaks.md) | **P0 (Critical)** | Fix Monaco Editor Lifecycle, Memory Leaks, and Singleton Provider Registration | Dispose Monaco instances properly and extract language/theme/provider registration out of constructor into a singleton manager. |
| [Issue #2](./ISSUES/02-p1-react-editor-component-api-and-state-sync.md) | **P1 (High)** | Enhance React `Editor` Component API (`value`/`code` sync, `onChange`, `theme`, `language`) | Support controlled/uncontrolled state, `onChange` callback, dynamic `theme` ("vs" \| "vs-dark") and `language` props. |
| [Issue #3](./ISSUES/03-p2-multi-language-gherkin-i18n-support.md) | **P2 (Medium)** | Implement Multi-Language (i18n) Gherkin Support & `# language:` Auto-Detection | Add dialect keyword dictionaries (EN, FR, ES, DE, etc.), support `language` prop and dynamic `# language:` header parsing. |
| [Issue #4](./ISSUES/04-p3-formatting-edge-cases-and-whitespace-preservation.md) | **P3 (Low)** | Fix Formatting Edge Cases & Preserve Whitespace in DocStrings/Quotes | Prevent space collapse inside DocStrings and quotes, add robust formatting unit tests for multiline blocks. |
