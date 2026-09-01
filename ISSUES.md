# Prioritized Roadmap & GitHub/GitLab Issues

This document provides a comprehensive overview of the architectural analysis, prioritized backlog, and technical recommendations for `react-gherkin-code-editor`. Detailed, import-ready issue specifications for GitHub/GitLab can be found in the `ISSUES/` directory.

---

## Detailed Architectural Analysis & Justification

### 1. Memory Leaks & Lifecycle Management (Priority: P0 - Critical)

* **What is currently happening?**
  In `src/components/Editor.tsx`, the `useEffect` hook initializes Monaco via `new EditorClass(divEditorRef.current, props.code)`. However, the cleanup function `return () => editor?.dispose()` is commented out. Additionally, every time `props.code` changes, `setEditor` triggers and instantiates a *brand new* Monaco Editor instance attached to the same HTML `div` element without disposing of the previous editor. Furthermore, the `EditorClass` constructor registers Monaco completion item providers, tokens, formatters, and themes globally every time it is called.

* **What needs to be done?**
  1. Extract global Monaco registrations (completion provider, monarch tokens, formatting edit providers, themes) into an idempotent singleton initialization function (`ensureMonacoGherkinRegistered()`) that runs exactly once across the application lifecycle.
  2. Implement proper cleanup in `useEffect` in `Editor.tsx` by returning `() => editorInstance.dispose()`.
  3. Decouple editor creation from value updates: mount the Monaco editor once in `useEffect`, and update its value using `editor.setValue()` in a separate effect when `props.code` changes.

* **Why is this important?**
  - **Memory Leaks**: Every re-render or code update retains previous Monaco DOM nodes, web worker listeners, and text models in memory. Long-running single-page applications (SPAs) embedding this editor will suffer from steadily increasing RAM consumption and potential browser tab crashes.
  - **Duplicate Operations & Performance Overhead**: Registering global providers on every constructor call creates hundreds of duplicate event listeners. Pressing `Ctrl+Space` for autocomplete or triggering auto-format causes Monaco to execute identical completion/formatting providers multiple times, degrading editor responsiveness.

---

### 2. React Component API & State Synchronization (Priority: P1 - High)

* **What is currently happening?**
  The `<Editor />` component operates strictly as an uncontrolled component with a initial `code?: string` prop. It does not provide an `onChange` callback when users type inside the editor. Theme switching is only accessible via an imperative ref method (`editorRef.current.updateTheme()`), which hardcodes a switch to dark mode without supporting light mode toggle or standard prop-driven state (`theme="vs" | "vs-dark"`).

* **What needs to be done?**
  1. Expand `EditorProps` to accept `value?: string`, `onChange?: (value: string) => void`, `theme?: string`, `language?: string`, and `readOnly?: boolean`.
  2. Attach a listener to `editor.onDidChangeModelContent` inside `EditorClass` to emit `onChange` events whenever editor text changes.
  3. Support reactive prop updates for `theme` and `value` while preserving backwards compatibility for `EditorExposeMethods` (`format`, `updateTheme`, `getCode`, `layout`).

* **Why is this important?**
  - **React Ecosystem Standard**: Modern React components expect controlled component semantics (`value` + `onChange`). Lacking `onChange` forces consumers to query the editor state imperatively via refs, making integration into forms (e.g. Formik, React Hook Form) difficult.
  - **Declarative Theme Switching**: Supporting a `theme` prop allows host applications to seamlessly synchronize editor styling with application-wide light/dark theme toggles.

---

### 3. Multi-Language (i18n) Gherkin Support & `# language:` Auto-Detection (Priority: P2 - Medium)

* **What is currently happening?**
  Syntax highlighting tokens, keywords, and autocomplete proposals are currently hardcoded in English (`GherkinLanguage-en`). Gherkin specifications written in other supported languages (e.g., French, Spanish, German) are not highlighted or auto-completed correctly.

* **What needs to be done?**
  1. Add Gherkin dialect dictionaries (`src/lib/i18n/dialects.ts`) containing localized keywords (e.g., *Fonctionnalité*, *Scénario*, *Étant donné que*, *Dado que*, etc.).
  2. Implement automatic detection of the `# language: <lang>` directive at the top of Gherkin documents to dynamically set keyword tokenization and auto-completion.
  3. Add a `language` prop to `<Editor language="fr" />` for explicit language selection.

* **Why is this important?**
  - **International Adoption**: Gherkin is used globally across international teams. Supporting localized keywords unlocks usage for non-English QA engineers and product managers.

---

### 4. Formatting Edge Cases & Whitespace Preservation (Priority: P3 - Low)

* **What is currently happening?**
  The formatter (`formatGherkinLines`) calls `removeMultipleSpaces(rawLine.trim())` on every line. This replaces consecutive spaces with a single space across all lines, including lines inside multiline DocStrings (`"""` or ```` ````) and quoted strings.

* **What needs to be done?**
  1. Update `formatGherkinLines` to bypass aggressive space compression for lines inside DocString blocks, quoted strings, and comments.
  2. Preserve exact formatting and indentation within DocStrings and code snippets.

* **Why is this important?**
  - **Data Integrity**: Code snippets, JSON/YAML bodies, or multiline parameters placed in DocStrings rely on whitespace formatting. Compressing spaces alters user data and breaks payload structure inside test scenarios.

---

## Index of GitHub/GitLab Issues

| Issue ID | Priority | Title | Key Actions & Impact |
| :--- | :--- | :--- | :--- |
| [Issue #1](./ISSUES/01-p0-monaco-editor-lifecycle-and-memory-leaks.md) | **P0 (Critical)** | Fix Monaco Editor Lifecycle, Memory Leaks, and Singleton Provider Registration | Dispose Monaco on unmount, isolate provider registration to run once globally. Fixes severe memory leaks & duplicate provider calls. |
| [Issue #2](./ISSUES/02-p1-react-editor-component-api-and-state-sync.md) | **P1 (High)** | Enhance React `Editor` Component API (`value`/`code` sync, `onChange`, `theme`, `language`) | Add `onChange`, controlled `value`, dynamic `theme` props. Aligns component with React standard practices. |
| [Issue #3](./ISSUES/03-p2-multi-language-gherkin-i18n-support.md) | **P2 (Medium)** | Implement Multi-Language (i18n) Gherkin Support & `# language:` Auto-Detection | Add dialect keyword maps & auto-detect `# language:` comments. Enables full international Gherkin support. |
| [Issue #4](./ISSUES/04-p3-formatting-edge-cases-and-whitespace-preservation.md) | **P3 (Low)** | Fix Formatting Edge Cases & Preserve Whitespace in DocStrings/Quotes | Preserve internal spaces in DocStrings, quotes, and comments. Ensures data integrity in scenario payloads. |
