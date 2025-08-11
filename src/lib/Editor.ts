import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { formatGherkinLines } from "./formatterHelpers";
import * as monaco2 from "monaco-editor";
import { GherkinMonacoTokenAdapter } from "./GherkinMonacoTokenAdapter";
import type { SupportedGherkinLanguage, TokenName } from "./Gherkin";
export class Editor {
	editor: monaco.editor.IStandaloneCodeEditor;
	private tokensProvider: monaco.IDisposable | null = null;
	private documentFormattingEditProvider: monaco.IDisposable | null = null;
	private onTypeFormattingEditProvider: monaco.IDisposable | null = null;
	private tokens: [RegExp, TokenName][];
	private gherkinLanguage: SupportedGherkinLanguage;
	private gherkinMonacoTokenAdapter: GherkinMonacoTokenAdapter;

	constructor(elementRef: HTMLDivElement, code?: string) {
		this.tokens = [];
		monaco2.languages.typescript;
		this.gherkinMonacoTokenAdapter = new GherkinMonacoTokenAdapter();
		this.registerLanguages();
		this.gherkinLanguage = "en";
		this.setGherkinLanguage("en");
		this.defineThemes();
		this.addAutoComplete();

		this.editor = monaco.editor.create(elementRef, {
			theme: "defaultLightTheme",
			formatOnType: true,
			value: code,
			language: "GherkinLanguage",
		});
	}

	private formatMySpecialLanguage = (model: monaco.editor.ITextModel) => {
		// Get all lines from the editor
		const linesContent = model.getLinesContent();
		const formattedLines = formatGherkinLines(
			linesContent,
			this.gherkinMonacoTokenAdapter.getGherkinLanguageKeywords(
				this.gherkinLanguage,
			),
		);

		// Return the formatting edit
		return [
			{
				range: {
					endColumn: model.getLineMaxColumn(model.getLineCount() - 1),
					endLineNumber: model.getLineCount(),
					startColumn: 0,
					startLineNumber: 0,
				},
				text: formattedLines.join("\n"),
			},
		];
	};

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
		// Register Gherkin language
		monaco.languages.register({ id: "GherkinLanguage" });
	}

	private unregisterDocumentFormattingEditProvider() {
		if (this.documentFormattingEditProvider) {
			this.documentFormattingEditProvider.dispose();
			this.documentFormattingEditProvider = null;
		}
	}

	private unregisterOnTypeFormattingEditProvider() {
		if (this.onTypeFormattingEditProvider) {
			this.onTypeFormattingEditProvider.dispose();
			this.onTypeFormattingEditProvider = null;
		}
	}

	private unregisterTokensProvider() {
		if (this.tokensProvider) {
			this.tokensProvider.dispose();
			this.tokensProvider = null;
		}
	}

	public setGherkinLanguage(language: SupportedGherkinLanguage) {
		// First Language providers
		this.unregisterTokensProvider();
		this.unregisterDocumentFormattingEditProvider();
		this.unregisterOnTypeFormattingEditProvider();

		// Register the new provider
		this.tokens = this.gherkinMonacoTokenAdapter.getTokens(language);

		// Register a tokens provider for the language
		this.tokensProvider = monaco.languages.setMonarchTokensProvider(
			"GherkinLanguage",
			{
				tokenizer: {
					root: this.tokens,
				},
			},
		);

		// Register formatter of gherkin on specific char
		this.documentFormattingEditProvider =
			monaco.languages.registerDocumentFormattingEditProvider(
				"GherkinLanguage",
				{
					provideDocumentFormattingEdits: this.formatMySpecialLanguage,
				},
			);

		// Register formatter of gherkin
		this.onTypeFormattingEditProvider =
			monaco.languages.registerOnTypeFormattingEditProvider("GherkinLanguage", {
				autoFormatTriggerCharacters: ["|"],
				provideOnTypeFormattingEdits: this.formatMySpecialLanguage,
			});

		this.gherkinLanguage = language;
	}

	private getRules(
		foreground?: monaco.editor.ITokenThemeRule["foreground"],
		background?: monaco.editor.ITokenThemeRule["background"],
		fontStyle?: monaco.editor.ITokenThemeRule["fontStyle"],
	): monaco.editor.ITokenThemeRule[] {
		const rules: {
			token: TokenName;
			foreground: monaco.editor.ITokenThemeRule["foreground"];
			background: monaco.editor.ITokenThemeRule["background"];
			fontStyle: monaco.editor.ITokenThemeRule["fontStyle"];
		}[] = [];

		for (const element of this.tokens) {
			rules.push({
				token: `${element[1]}`,
				foreground: foreground,
				background: background,
				fontStyle: fontStyle,
			});
		}
		return rules;
	}

	private defineThemes() {
		// Define a new theme that contains only rules that match this language
		monaco.editor.defineTheme("defaultLightTheme", {
			base: "vs",
			inherit: false,
			rules: this.getRules("7dd956", undefined, "bold"),
			colors: {
				"editor.foreground": "#000000",
			},
		});

		monaco.editor.defineTheme("defaultDarkTheme", {
			base: "vs-dark",
			inherit: false,
			rules: this.getRules("7dd956", undefined, "bold"),
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

		monaco.languages.registerCompletionItemProvider("GherkinLanguage", {
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
