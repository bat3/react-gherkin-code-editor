import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { formatGherkinLines } from "./formatterHelpers";
import * as monaco2 from "monaco-editor";

export class Editor {
  editor: monaco.editor.IStandaloneCodeEditor;

  constructor(elementRef: HTMLDivElement, code?: string) {
    monaco2.languages.typescript
    this.registerLanguages()
    this.defineThemes()

    function formatMySpecialLanguage(model: monaco.editor.ITextModel) {
      // Get all lines from the editor
      const linesContent = model.getLinesContent();
      const formattedLines = formatGherkinLines(linesContent);

      // Return the formatting edit
      return [
        {
          // Todo manage the range of text to update
          range: {
            endColumn: model.getLineMaxColumn(model.getLineCount() - 1),
            endLineNumber: model.getLineCount(),
            startColumn: 0,
            startLineNumber: 0,
          },
          text: formattedLines.join('\n'),
        },
      ];
    }

    // Register formatter of gherkin on specific char
    monaco.languages.registerDocumentFormattingEditProvider("GherkinLanguage-en", {
      provideDocumentFormattingEdits: formatMySpecialLanguage
    });

    // Register formatter of gherkin
    monaco.languages.registerOnTypeFormattingEditProvider("GherkinLanguage-en", {
      autoFormatTriggerCharacters: ["|"],
      provideOnTypeFormattingEdits: formatMySpecialLanguage,
    });

    this.editor = monaco.editor.create(elementRef, {
      theme: "defaultLightTheme",
      formatOnType: true,
      value: code,
      language: "GherkinLanguage-en",
    });
  }

  public format() {
    this.editor?.getAction('editor.action.formatDocument')?.run();
  }

  public updateTheme() {
    this.editor.updateOptions({
      theme: "defaultDarkTheme",
    });
  }

  private registerLanguages() {
    // Register a new language
    monaco.languages.register({ id: "GherkinLanguage-en" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("GherkinLanguage-en", {
      tokenizer: {
        root: [
          [/Feature:/, "Feature-keyword"],
          [/\@.*/, "tag-keyword"],
          [/Scenario/, "Scenario-keyword"],
          [/Scenario Outline/, "ScenarioOutline-keyword"],
          [/Given/, "Given-keyword"],
          [/When/, "When-keyword"],
          [/Then/, "Then-keyword"],
          [/And/, "And-keyword"],
          [/<.*>/, "DelimitedParameters-keyword"],
          [/Examples/, "Examples-keyword"],
        ],
      },
    });
  }

  private defineThemes() {
    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme("defaultLightTheme", {
      base: "vs",
      inherit: false,
      rules: [
        { token: "Feature-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "tag-keyword", foreground: "1fff3d00", fontStyle: "italic" },
        { token: "Scenario-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        {
          token: "ScenarioOutline-keyword",
          foreground: "1fff3d00",
          fontStyle: "bold",
        },
        { token: "Given-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "When-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "Then-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "And-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        {
          token: "DelimitedParameters-keyword",
          foreground: "1fff3d00",
          fontStyle: "bold",
        },
        { token: "Examples-keyword", foreground: "1fff3d00", fontStyle: "bold" },
      ],
      colors: {
        "editor.foreground": "#000000",
      },
    });

    monaco.editor.defineTheme("defaultDarkTheme", {
      base: "vs-dark",
      inherit: false,
      rules: [
        { token: "Feature-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "tag-keyword", foreground: "1fff3d00", fontStyle: "italic" },
        { token: "Scenario-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        {
          token: "ScenarioOutline-keyword",
          foreground: "1fff3d00",
          fontStyle: "bold",
        },
        { token: "Given-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "When-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "Then-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        { token: "And-keyword", foreground: "1fff3d00", fontStyle: "bold" },
        {
          token: "DelimitedParameters-keyword",
          foreground: "1fff3d00",
          fontStyle: "bold",
        },
        { token: "Examples-keyword", foreground: "1fff3d00", fontStyle: "bold" },
      ],
      colors: {
        "editor.foreground": "#ffffff",
      },
    });
  }
}