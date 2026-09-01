# Issue #4: Fix Formatting Edge Cases & Preserve Whitespace in DocStrings/Quotes

**Priority:** P3 (Low)
**Type:** Bug Fix / Quality / Formatting
**Labels:** `formatter`, `bug`, `testing`

---

## Description

The Gherkin formatter (`formatGherkinLines` in `src/lib/formatterHelpers.ts`) currently uses `removeMultipleSpaces(rawLine.trim())` across all lines before processing formatting logic:

```typescript
export function removeMultipleSpaces(line: string) {
    return line.replace(/\s+/g, " ");
}
```

### Problems Identified:
1. **Inside DocStrings (`"""` or ```` ````)**:
   - Code snippets, JSON payloads, or multiline text blocks inside DocStrings have their indentation and multiple spaces stripped or collapsed into single spaces.
2. **Inside Quoted Strings**:
   - Quoted parameters like `'Given a user with name "John   Doe"'` have consecutive spaces compressed into a single space, modifying user data unexpectedly.
3. **Trailing Spaces in Table Cells**:
   - Spacing inside table cells should be padded uniformly without altering string content inside cell boundaries.

---

## Technical Solution & Architecture

1. **Context-Aware Space Normalization**:
   - Modify `formatGherkinLines` to only apply `removeMultipleSpaces` on Gherkin structure keywords and unquoted step prefixes, while bypassing or preserving exact character content inside:
     - DocStrings (`inDocString === true`)
     - Quoted string literals (`"..."` or `'...'`)
     - Comment lines (`# ...`)

2. **DocString Indentation Model**:
   - Ensure DocString delimiter (`"""` or ```` ````) and inner body lines are indented consistently relative to their parent step, but internal line structure (leading/internal spaces) is preserved intact.

3. **Expanded Formatter Unit Test Suite**:
   - Add test cases covering:
     - JSON / YAML content inside DocStrings (preserving indentation and key alignment).
     - Step strings containing multiple spaces inside quotes or parameters.
     - Mixed comment and table formatting.

---

## Acceptance Criteria

- [ ] Spaces and formatting inside DocString blocks (`"""` / ```` ````) are preserved without collapsing spaces.
- [ ] Quoted string parameter values in steps retain exact spacing.
- [ ] Comments starting with `#` preserve internal formatting.
- [ ] All existing 14 unit tests in `formatterHelpers.test.ts` pass without regression.

---

## Definition of Done

- `formatGherkinLines` updated in `src/lib/formatterHelpers.ts`.
- Additional unit tests added to `src/lib/formatterHelpers.test.ts`.
- `npm test` passes cleanly with 100% pass rate.
