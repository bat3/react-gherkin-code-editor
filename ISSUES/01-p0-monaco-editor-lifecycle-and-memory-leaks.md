# Issue #1: Fix Monaco Editor Lifecycle, Memory Leaks, and Singleton Provider Registration

**Priority:** P0 (Critical)
**Type:** Refactoring / Bug Fix / Memory Optimization
**Labels:** `bug`, `performance`, `architecture`, `monaco`

---

## 1. Problem Description & Root Cause

In `src/components/Editor.tsx`, the `useEffect` hook that initializes `EditorClass` has a commented-out cleanup return value:

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

### Technical Flaws:
1. **Unmanaged Lifecycle**: Monaco editor instances, internal workers, and DOM event bindings are never disposed of when `<Editor />` unmounts or re-renders.
2. **Re-instantiation on Prop Change**: Every change to `props.code` causes `setEditor` to create a *new* instance of `EditorClass` on the same DOM element without tearing down the existing Monaco instance.
3. **Global State Pollution & Leak**: The `EditorClass` constructor in `src/lib/Editor.ts` executes `registerLanguages()`, `defineThemes()`, `addAutoComplete()`, `registerDocumentFormattingEditProvider()`, and `registerOnTypeFormattingEditProvider()`. Registering providers on every constructor call adds duplicate global completion providers and formatters to Monaco's global registry on every render.

---

## 2. Why This Is Important

- **Memory Leaks**: In Single Page Applications (SPAs) or dashboards where this component mounts/unmounts or updates frequently, old Monaco instances and web workers remain trapped in memory. Over time, browser memory consumption grows continuously, leading to performance degradation and eventual tab crashes.
- **Duplicate Execution**: When completion or formatting providers are registered repeatedly, pressing key combinations (e.g. `Ctrl+Space` or typing `|`) triggers dozens of identical providers concurrently. This degrades UI responsiveness and produces redundant console warnings or duplicate auto-complete items.
- **Deterministic Component Lifecycle**: React components must cleanly manage setup and cleanup to adhere to standard React lifecycle expectations and strict mode compliance.

---

## 3. What to Do (Step-by-Step Implementation)

1. **Create Monaco Registry Module (`src/lib/MonacoGherkinRegistry.ts`)**:
   - Extract `registerLanguages()`, `defineThemes()`, `addAutoComplete()`, and document formatting edit providers into a singleton registration module.
   - Guard execution using a boolean flag (`isRegistered`) so that provider registration occurs exactly **once** globally per runtime session:
     ```typescript
     let registered = false;
     export function ensureMonacoGherkinRegistered() {
         if (registered) return;
         // Register languages, monarch tokens, themes, completion providers, formatters once
         registered = true;
     }
     ```

2. **Add `dispose()` Method to `EditorClass`**:
   - In `src/lib/Editor.ts`, store disposables and expose a public `dispose()` method:
     ```typescript
     public dispose() {
         this.editor?.dispose();
     }
     ```

3. **Update React `useEffect` in `Editor.tsx`**:
   - Mount the editor instance once upon component mount and return a cleanup function:
     ```typescript
     useEffect(() => {
         if (!divEditorRef.current) return;
         ensureMonacoGherkinRegistered();
         const editorInstance = new EditorClass(divEditorRef.current, props.code);
         setEditor(editorInstance);

         return () => {
             editorInstance.dispose();
         };
     }, []); // Mount once
     ```

4. **Decouple Value Synchronization**:
   - Create a separate `useEffect` for syncing `props.code` changes to the editor without re-instantiating Monaco:
     ```typescript
     useEffect(() => {
         if (editor && props.code !== undefined && props.code !== editor.getCode()) {
             editor.setValue(props.code);
         }
     }, [editor, props.code]);
     ```

---

## 4. Acceptance Criteria

- [ ] Monaco instances and web workers are cleanly disposed of on component unmount.
- [ ] Provider registrations (autocomplete, Monarch tokens, formatters) occur exactly once globally.
- [ ] Updating `props.code` updates editor text in-place without instantiating a new `EditorClass`.
- [ ] React 18 / React 19 StrictMode double-mounting test passes without memory leaks or duplicate providers.

---

## 5. Definition of Done

- Code refactored in `src/lib/Editor.ts`, `src/components/Editor.tsx`, and new registry module.
- Unit test added verifying `dispose()` and singleton registration logic.
- `npx biome check src` and `npm test` pass with 100% success rate.
