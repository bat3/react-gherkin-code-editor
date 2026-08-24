# Issue #1: Fix Monaco Editor Lifecycle, Memory Leaks, and Singleton Provider Registration

**Priority:** P0 (Critical)
**Type:** Refactoring / Bug Fix / Memory Optimization
**Labels:** `bug`, `performance`, `architecture`, `monaco`

---

## Description

Currently, in `src/components/Editor.tsx`, the `useEffect` hook that initializes `EditorClass` has a commented-out cleanup return value:

```typescript
useEffect(() => {
    if (divEditorRef) {
        setEditor((editor) => {
            if (editor) return editor;
            if (divEditorRef.current)
                return new EditorClass(divEditorRef.current, props.code);
        });
    }
    // Todo
    //return () => editor?.dispose();
}, [props.code]);
```

### Problems Identified:
1. **Memory Leak on Unmount/Re-render**: Monaco editor instances and DOM nodes are never disposed of when the React component unmounts or when `props.code` changes.
2. **Duplicate Monaco Provider Registration**: The `EditorClass` constructor in `src/lib/Editor.ts` calls `registerLanguages()`, `defineThemes()`, `addAutoComplete()`, `registerDocumentFormattingEditProvider()`, and `registerOnTypeFormattingEditProvider()` directly inside the constructor. Every time a component mounts or re-instantiates `EditorClass`, new completion item providers and formatting edit providers are registered with Monaco globally, causing memory leaks and duplicate suggestions/actions.

---

## Technical Solution & Architecture

1. **Monaco Registration Singleton**:
   - Extract `registerLanguages`, `defineThemes`, completion providers, and formatting providers into a global, idempotent `ensureMonacoGherkinRegistered()` singleton function.
   - Ensure providers are registered **once** per Monaco runtime session.

2. **Proper Editor Disposal**:
   - In `src/lib/Editor.ts`, add a `dispose()` method:
     ```typescript
     public dispose() {
         this.editor?.dispose();
     }
     ```
   - In `src/components/Editor.tsx`, properly handle cleanup in `useEffect`:
     ```typescript
     useEffect(() => {
         if (!divEditorRef.current) return;
         const editorInstance = new EditorClass(divEditorRef.current, props.code);
         setEditor(editorInstance);

         return () => {
             editorInstance.dispose();
         };
     }, []); // Run on mount/unmount
     ```

3. **Dynamic Value Updates**:
   - Instead of re-creating the `EditorClass` when `props.code` changes, use a separate `useEffect` to call `editor.setValue(props.code)` if the editor value differs from `props.code`.

---

## Acceptance Criteria

- [ ] Monaco instances are cleanly disposed of when `<Editor />` unmounts without leaving dangling DOM nodes or event listeners.
- [ ] Provider registrations (autocomplete, Monarch tokens, formatters) occur exactly once globally.
- [ ] Changing `props.code` updates the text inside the existing Monaco editor without instantiating a new `EditorClass`.
- [ ] No regressions in existing unit or Playwright E2E tests.

---

## Definition of Done

- Code updated and refactored.
- Unit test added verifying `dispose()` method and idempotent registration.
- `npx biome check src` passes without warnings/errors.
- `npm test` and `npm run test:e2e` pass cleanly.
