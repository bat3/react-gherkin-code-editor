import * as monaco2 from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { formatGherkinLines } from "./formatterHelpers";

export type EditorTheme =
	| "light"
	| "dark"
	| "defaultLightTheme"
	| "defaultDarkTheme"
	| (string & {});

export interface EditorOptions {
	code?: string;
	value?: string;
	theme?: EditorTheme;
	language?: string;
	readOnly?: boolean;
	onChange?: (value: string) => void;
}

export function resolveTheme(theme?: EditorTheme): string {
	if (!theme || theme === "light") {
		return "defaultLightTheme";
	}
	if (theme === "dark") {
		return "defaultDarkTheme";
	}
	return theme;
}

let isMonacoRegistered = false;

function registerLanguages() {
	// Register a new language
	monaco.languages.register({ id: "GherkinLanguage-en" });

	// Register a tokens provider for the language
	monaco.languages.setMonarchTokensProvider("GherkinLanguage-en", {
		tokenizer: {
			root: [
				[/Feature:/, "primary-keyword"],
				[/^\t* *@.*/, "secondary-keyword"],
				[/Background:/, "primary-keyword"],
				[/Scenario:/, "primary-keyword"],
				[/Scenario Outline:/, "primary-keyword"],
				[/Given( |$)/, "primary-keyword"],
				[/When( |$)/, "primary-keyword"],
				[/Then( |$)/, "primary-keyword"],
				[/And( |$)/, "primary-keyword"],
				[/\*( |$)/, "primary-keyword"],
				[/<.*?>/, "primary-keyword"],
				[/".*?"/, "primary-keyword"],
				[/Examples:/, "primary-keyword"],
				[/^\t* *\#.*/, "secondary-keyword"],
			],
		},
	});
}

function defineThemes() {
	// Define a new theme that contains only rules that match this language
	monaco.editor.defineTheme("defaultLightTheme", {
		base: "vs",
		inherit: false,
		rules: [
			{
				token: "primary-keyword",
				foreground: "7dd956",
				fontStyle: "bold",
			},
			{
				token: "secondary-keyword",
				foreground: "7dd956",
				fontStyle: "italic",
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
				token: "primary-keyword",
				foreground: "7dd956",
				fontStyle: "bold",
			},
			{
				token: "secondary-keyword",
				foreground: "7dd956",
				fontStyle: "italic",
			},
		],
		colors: {
			"editor.foreground": "#ffffff",
		},
	});
}

function addAutoComplete() {
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

function registerFormatters() {
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
	monaco.languages.registerOnTypeFormattingEditProvider("GherkinLanguage-en", {
		autoFormatTriggerCharacters: ["|"],
		provideOnTypeFormattingEdits: formatMySpecialLanguage,
	});
}

export function ensureMonacoGherkinRegistered() {
	if (isMonacoRegistered) return;
	isMonacoRegistered = true;

	monaco2.languages.typescript;
	registerLanguages();
	defineThemes();
	addAutoComplete();
	registerFormatters();
}

export class Editor {
	editor: monaco.editor.IStandaloneCodeEditor;
	private onChangeCallback?: (value: string) => void;

	constructor(elementRef: HTMLDivElement, options?: string | EditorOptions) {
		ensureMonacoGherkinRegistered();

		const opts: EditorOptions =
			typeof options === "string" ? { code: options } : (options ?? {});

		const initialCode = opts.value ?? opts.code ?? "";
		const initialTheme = resolveTheme(opts.theme);
		const initialLanguage = opts.language ?? "GherkinLanguage-en";
		const initialReadOnly = opts.readOnly ?? false;

		this.onChangeCallback = opts.onChange;

		this.editor = monaco.editor.create(elementRef, {
			theme: initialTheme,
			formatOnType: true,
			value: initialCode,
			language: initialLanguage,
			readOnly: initialReadOnly,
			acceptSuggestionOnEnter: "off",
		});

		this.editor.onDidChangeModelContent(() => {
			const newValue = this.editor.getValue();
			this.onChangeCallback?.(newValue);
		});
	}

	public dispose() {
		this.editor?.dispose();
	}

	public format() {
		this.editor?.getAction("editor.action.formatDocument")?.run();
	}

	public setTheme(theme?: EditorTheme) {
		const resolvedTheme = resolveTheme(theme);
		monaco.editor.setTheme(resolvedTheme);
	}

	public updateTheme() {
		this.setTheme("defaultDarkTheme");
	}

	public getCode() {
		return this.editor.getValue();
	}

	public setValue(code?: string) {
		const newCode = code ?? "";
		if (this.editor && this.editor.getValue() !== newCode) {
			this.editor.setValue(newCode);
		}
	}

	public setLanguage(language?: string) {
		if (!this.editor) return;
		const model = this.editor.getModel();
		if (model) {
			monaco.editor.setModelLanguage(model, language ?? "GherkinLanguage-en");
		}
	}

	public setReadOnly(readOnly?: boolean) {
		this.editor?.updateOptions({ readOnly: readOnly ?? false });
	}

	public setOnChange(callback?: (value: string) => void) {
		this.onChangeCallback = callback;
	}

	public layout() {
		this.editor.layout();
	}
}
