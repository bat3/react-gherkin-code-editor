import * as monaco2 from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { type SupportedLanguage, gherkinLanguages } from "./Gherkin";
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

export function resolveLanguage(language?: string): string {
	if (!language) return "GherkinLanguage-en";
	if (language === "en" || language === "fr" || language === "es") {
		return `GherkinLanguage-${language}`;
	}
	if (
		language === "GherkinLanguage-en" ||
		language === "GherkinLanguage-fr" ||
		language === "GherkinLanguage-es"
	) {
		return language;
	}
	return language;
}

let isMonacoRegistered = false;

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function registerLanguages() {
	const supportedLangs: SupportedLanguage[] = ["en", "fr", "es"];

	for (const langCode of supportedLangs) {
		const monacoLangId = `GherkinLanguage-${langCode}`;
		const keywords = gherkinLanguages[langCode];

		// Register a new language
		monaco.languages.register({ id: monacoLangId });

		const colonKeywords = [
			...keywords.Feature,
			...keywords.Background,
			...keywords.Rule,
			...keywords.Scenario,
			...keywords.ScenarioOutline,
			...keywords.Examples,
		];

		const stepKeywords = [
			...keywords.Given,
			...keywords.When,
			...keywords.Then,
			...keywords.And,
			...keywords.But,
		].filter((k) => k !== "*");

		const colonPattern = new RegExp(
			`(${colonKeywords.map(escapeRegex).join("|")}):`,
		);

		const stepPattern = new RegExp(
			`(${stepKeywords.map(escapeRegex).join("|")})( |$)`,
		);

		// Register a tokens provider for the language
		monaco.languages.setMonarchTokensProvider(monacoLangId, {
			tokenizer: {
				root: [
					[colonPattern, "primary-keyword"],
					[/^\t* *@.*/, "secondary-keyword"],
					[stepPattern, "primary-keyword"],
					[/\*( |$)/, "primary-keyword"],
					[/<.*?>/, "primary-keyword"],
					[/".*?"/, "primary-keyword"],
					[/^\t* *\#.*/, "secondary-keyword"],
				],
			},
		});
	}
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
	const supportedLangs: SupportedLanguage[] = ["en", "fr", "es"];

	for (const langCode of supportedLangs) {
		const monacoLangId = `GherkinLanguage-${langCode}`;
		const keywords = gherkinLanguages[langCode];

		const proposals = [
			{
				label: keywords.Given[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.Given[0]} step definition`,
				insertText: `${keywords.Given[0]} `,
			},
			{
				label: keywords.When[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.When[0]} step definition`,
				insertText: `${keywords.When[0]} `,
			},
			{
				label: keywords.Then[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.Then[0]} step definition`,
				insertText: `${keywords.Then[0]} `,
			},
			{
				label: keywords.And[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.And[0]} step definition`,
				insertText: `${keywords.And[0]} `,
			},
			{
				label: keywords.Feature[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.Feature[0]} description`,
				insertText: `${keywords.Feature[0]}: `,
			},
			{
				label: keywords.Scenario[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.Scenario[0]} description`,
				insertText: `${keywords.Scenario[0]}: `,
			},
			{
				label: keywords.ScenarioOutline[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.ScenarioOutline[0]} description`,
				insertText: `${keywords.ScenarioOutline[0]}: `,
			},
			{
				label: keywords.Examples[0],
				kind: monaco.languages.CompletionItemKind.Keyword,
				documentation: `${keywords.Examples[0]} table`,
				insertText: `${keywords.Examples[0]}:\n`,
			},
		];

		monaco.languages.registerCompletionItemProvider(monacoLangId, {
			provideCompletionItems: (model, position) => {
				const word = model.getWordUntilPosition(position);
				const range = {
					startLineNumber: position.lineNumber,
					endLineNumber: position.lineNumber,
					startColumn: word.startColumn,
					endColumn: word.endColumn,
				};

				const dependencySuggestions = proposals.map((p) => ({
					...p,
					range,
				}));

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

				return {
					suggestions: [
						...dependencySuggestions,
						...lineSuggestions,
						...wordSuggestions,
					],
				};
			},
		});
	}
}

function registerFormatters() {
	function formatMySpecialLanguage(model: monaco.editor.ITextModel) {
		const langId = model.getLanguageId();
		// Get all lines from the editor
		const linesContent = model.getLinesContent();
		const formattedLines = formatGherkinLines(linesContent, langId);

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

	const supportedLangs: SupportedLanguage[] = ["en", "fr", "es"];

	for (const langCode of supportedLangs) {
		const monacoLangId = `GherkinLanguage-${langCode}`;

		// Register formatter of gherkin on specific char
		monaco.languages.registerDocumentFormattingEditProvider(monacoLangId, {
			provideDocumentFormattingEdits: formatMySpecialLanguage,
		});

		// Register formatter of gherkin
		monaco.languages.registerOnTypeFormattingEditProvider(monacoLangId, {
			autoFormatTriggerCharacters: ["|"],
			provideOnTypeFormattingEdits: formatMySpecialLanguage,
		});
	}
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
		const initialLanguage = resolveLanguage(opts.language);
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
			monaco.editor.setModelLanguage(model, resolveLanguage(language));
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
