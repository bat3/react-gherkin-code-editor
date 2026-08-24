# Issue #3: Implement Multi-Language (i18n) Gherkin Support & `# language:` Auto-Detection

**Priority:** P2 (Medium)
**Type:** Feature / Internationalization
**Labels:** `i18n`, `gherkin`, `monaco`, `feature`

---

## Description

Gherkin specification natively supports multiple spoken languages (e.g., English, French, Spanish, German, Dutch, Portuguese, etc.). In Gherkin feature files, the language is defined either:
1. Via a header comment at the top of the file: `# language: fr`
2. Or via configuration/props (`language="fr"`).

Currently, `react-gherkin-code-editor` hardcodes English keywords (`GherkinLanguage-en`) in `Gherkin.ts` and Monarch tokenizer regex patterns in `Editor.ts`. Keywords in other languages (such as `Fonctionnalité`, `Scénario`, `Étant donné que`, `Dado que`, `Funktionalität`) are not highlighted or auto-completed.

---

## Technical Solution & Architecture

1. **Gherkin Dialect Dictionaries (`src/lib/i18n/dialects.ts`)**:
   - Define keyword maps for major supported Gherkin languages (English `en`, French `fr`, Spanish `es`, German `de`, etc.):
     ```typescript
     export interface GherkinDialect {
         name: string;
         native: string;
         feature: string[];
         background: string[];
         rule: string[];
         scenario: string[];
         scenarioOutline: string[];
         examples: string[];
         given: string[];
         when: string[];
         then: string[];
         and: string[];
         but: string[];
     }
     ```

2. **Dynamic Language Header Parser**:
   - Implement `detectLanguageFromContent(code: string): string`:
     - Parses line 1 for regex `#\s*language:\s*([a-zA-Z\-]+)`.
     - Defaults to `"en"` if header is absent.

3. **Dynamic Monaco Tokenizer & Completion Providers**:
   - Register Monarch tokenizers dynamically based on the active dialect keywords.
   - Update autocomplete proposals to suggest localized step keywords (`Given` / `Étant donné` / `Dado`, etc.) matching the active language dialect.

4. **Formatter Keyword Integration**:
   - Update `formatGherkinLines` in `formatterHelpers.ts` to inspect keywords against the active dialect instead of hardcoded English arrays.

---

## Acceptance Criteria

- [ ] Support `language` prop on `<Editor language="fr" />`.
- [ ] Automatically detect language from `# language: fr` header directive in editor text.
- [ ] Syntax highlighting properly highlights localized Gherkin keywords for supported languages.
- [ ] Autocomplete suggestions offer localized keywords based on active dialect.
- [ ] Formatter correctly aligns tables and indents scenarios for localized Gherkin features.

---

## Definition of Done

- Dialect definitions added to `src/lib/i18n/`.
- Unit tests added verifying language detection, tokenization, and formatting for non-English features (e.g. French/Spanish).
- `npm test` and `npm run test:e2e` pass cleanly.
