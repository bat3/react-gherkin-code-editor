import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { formatGherkinLines } from "./formatterHelpers";
import * as monaco2 from "monaco-editor";

export class Editor {
	editor: monaco.editor.IStandaloneCodeEditor;

	constructor(elementRef: HTMLDivElement, code?: string) {
		monaco2.languages.typescript;
		this.registerLanguages();
		this.defineThemes();
		this.addAutoComplete();

		function formatMySpecialLanguage(model: monaco.editor.ITextModel) {
			// Get all lines from the editor
			const linesContent = model.getLinesContent();
			const formattedLines = formatGherkinLines(linesContent);

			// Find the line with the maximum column count
			let maxColumnLineNumber = 0;
			let maxColumnCount = 0;

			for (let i = 1; i <= model.getLineCount(); i++) {
				const lineMaxColumn = model.getLineMaxColumn(i);
				if (lineMaxColumn > maxColumnCount) {
					maxColumnCount = lineMaxColumn;
					maxColumnLineNumber = i;
				}
			}

			// Return the formatting edit
			return [
				{
					range: {
						endColumn: model.getLineMaxColumn(maxColumnLineNumber),
						endLineNumber: model.getLineCount(),
						startColumn: 0,
						startLineNumber: 0,
					},
					text: formattedLines.join("\n"),
				},
			];
		}

		// Register formatter of gherkin on specific char
		monaco.languages.registerDocumentFormattingEditProvider(
			"GherkinLanguage-en",
			{
				provideDocumentFormattingEdits: formatMySpecialLanguage,
			},
		);

		// Register formatter of gherkin
		monaco.languages.registerOnTypeFormattingEditProvider(
			"GherkinLanguage-en",
			{
				autoFormatTriggerCharacters: ["|"],
				provideOnTypeFormattingEdits: formatMySpecialLanguage,
			},
		);

		this.editor = monaco.editor.create(elementRef, {
			theme: "defaultLightTheme",
			formatOnType: true,
			value: code,
			language: "GherkinLanguage-en",
			acceptSuggestionOnEnter: "off",
		});
	}

	public format() {
		this.editor?.getAction("editor.action.formatDocument")?.run();
	}

	public updateTheme() {
		this.editor.updateOptions({
			theme: "defaultDarkTheme",
		});
	}

	public getCode() {
		return this.editor.getValue();
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
					[/Scenario:/, "Scenario-keyword"],
					[/Scenario Outline:/, "ScenarioOutline-keyword"],
					[/Given( |$)/, "Given-keyword"],
					[/When( |$)/, "When-keyword"],
					[/Then( |$)/, "Then-keyword"],
					[/And( |$)/, "And-keyword"],
					[/<.*?>/, "DelimitedParameters-keyword"],
					[/Examples:/, "Examples-keyword"],
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
				{
					token: "Feature-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{ token: "tag-keyword", foreground: "7dd956", fontStyle: "italic" },
				{
					token: "Scenario-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{
					token: "ScenarioOutline-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{ token: "Given-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "When-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "Then-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "And-keyword", foreground: "7dd956", fontStyle: "bold" },
				{
					token: "DelimitedParameters-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{
					token: "Examples-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
			],
			colors: {
				"editor.foreground": "#000000",
			},
		});

		monaco.editor.defineTheme("defaultDarkTheme", {
			base: "vs-dark",
			inherit: false,
			rules: [
				{
					token: "Feature-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{ token: "tag-keyword", foreground: "7dd956", fontStyle: "italic" },
				{
					token: "Scenario-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{
					token: "ScenarioOutline-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{ token: "Given-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "When-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "Then-keyword", foreground: "7dd956", fontStyle: "bold" },
				{ token: "And-keyword", foreground: "7dd956", fontStyle: "bold" },
				{
					token: "DelimitedParameters-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{
					token: "Examples-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
			],
			colors: {
				"editor.foreground": "#ffffff",
			},
		});
	}

	private addAutoComplete() {
		function createDependencyProposals(range: {
			startLineNumber: number;
			endLineNumber: number;
			startColumn: number;
			endColumn: number;
		}) {
			return [
				{
					label: "Given",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Given step definition",
					insertText: "Given ",
					range: range,
				},
				{
					label: "When",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "When step definition",
					insertText: "When ",
					range: range,
				},
				{
					label: "Then",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Then step definition",
					insertText: "Then ",
					range: range,
				},
				{
					label: "And",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "And step definition",
					insertText: "And ",
					range: range,
				},
				{
					label: "Feature",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Feature description",
					insertText: "Feature: ",
					range: range,
				},
				{
					label: "Scenario",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Scenario description",
					insertText: "Scenario: ",
					range: range,
				},
				{
					label: "Scenario Outline",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Scenario Outline description",
					insertText: "Scenario Outline: ",
					range: range,
				},
				{
					label: "Examples",
					kind: monaco.languages.CompletionItemKind.Keyword,
					documentation: "Examples table",
					insertText: "Examples:\n",
					range: range,
				},
			];
		}

		monaco.languages.registerCompletionItemProvider("GherkinLanguage-en", {
			provideCompletionItems: (model, position) => {
				const word = model.getWordUntilPosition(position);
				const range = {
					startLineNumber: position.lineNumber,
					endLineNumber: position.lineNumber,
					startColumn: word.startColumn,
					endColumn: word.endColumn,
				};

				// Get all words from the current document
				const text = model.getValue();
				const wordRegex = /\b\w+\b/g;
				const words = new Set<string>();
				let match: RegExpExecArray | null;
				match = wordRegex.exec(text);
				while (match !== null) {
					words.add(match[0]);
					match = wordRegex.exec(text);
				}

				// Get all lines from the current document
				const lines = model.getLinesContent();
				const lineSuggestions = lines
					.filter((line) => line.trim().length > 0) // Filter out empty lines
					.map((line) => ({
						label: line,
						kind: monaco.languages.CompletionItemKind.Snippet,
						documentation: "Reuse existing line",
						insertText: line,
						range: range,
					}));

				// Create word suggestions
				const wordSuggestions = Array.from(words).map((word) => ({
					label: word,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: word,
					range: range,
				}));

				// Combine all suggestions
				return {
					suggestions: [
						...createDependencyProposals(range),
						...lineSuggestions,
						...wordSuggestions,
					],
				};
			},
		});
	}
}
