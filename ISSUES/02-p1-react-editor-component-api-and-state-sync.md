# Issue #2: Enhance React `Editor` Component API (`value`/`code` sync, `onChange`, `theme`, `language` props)

**Priority:** P1 (High)
**Type:** Feature / API Enhancement
**Labels:** `enhancement`, `react`, `api`, `ux`

---

## Description

The current `<Editor />` component has a limited React API:
- Props accepts `code?: string` and standard `HTMLAttributes<HTMLDivElement>`.
- Theme updates are only supported via imperative ref method (`editorRef.current.updateTheme()`), which hardcodes `"defaultDarkTheme"` without allowing toggling back to light or specifying custom theme names.
- Lacks an `onChange` prop to notify parent components of content changes (standard requirement for form controls and controlled components).

---

## Technical Solution & Architecture

1. **Extend `EditorProps` Interface**:
   ```typescript
   export type EditorTheme = "light" | "dark" | "defaultLightTheme" | "defaultDarkTheme" | string;

   export interface EditorProps extends HTMLAttributes<HTMLDivElement> {
       code?: string;
       value?: string; // Alias for code / controlled usage
       onChange?: (value: string) => void;
       theme?: EditorTheme;
       language?: string;
       readOnly?: boolean;
   }
   ```

2. **Monaco Model Listener for `onChange`**:
   - In `src/lib/Editor.ts`, listen to `this.editor.onDidChangeModelContent`:
     ```typescript
     this.editor.onDidChangeModelContent(() => {
         const newValue = this.editor.getValue();
         this.onChangeCallback?.(newValue);
     });
     ```

3. **Dynamic Theme & Language Updates**:
   - Add `setTheme(theme: EditorTheme)` and `setValue(value: string)` methods on `EditorClass`.
   - Update `Editor.tsx` to handle reactive prop changes in `useEffect`:
     - When `props.theme` changes, update Monaco theme via `monaco.editor.setTheme(...)`.
     - When `props.value` / `props.code` changes externally, update editor value if it differs from current editor content (avoiding cursor displacement).

4. **Backward Compatibility**:
   - Maintain `EditorExposeMethods` (`format`, `updateTheme`, `getCode`, `layout`) to ensure zero breaking changes for existing library users.

---

## Acceptance Criteria

- [ ] Support both controlled (`value` + `onChange`) and uncontrolled (`code` / `defaultValue`) usage patterns.
- [ ] `onChange` callback fires with updated string whenever user types in the editor.
- [ ] Prop `theme="dark"` / `theme="light"` dynamically updates editor appearance.
- [ ] Imperative ref methods (`format()`, `getCode()`, `layout()`, `updateTheme()`) continue to function as expected.

---

## Definition of Done

- API updated in `src/components/Editor.tsx` and `src/index.ts`.
- Documentation in `README.md` updated with new props and usage examples.
- Unit and Playwright E2E tests written for `onChange` and reactive `theme`/`value` props.
- `npx biome check src` and `npm test` pass cleanly.
