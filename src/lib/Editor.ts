import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { formatGherkinLines } from "./formatterHelpers";

/** Options pour la configuration de l'éditeur. */
export interface EditorOptions {
	/** Callback appelé lorsque le code change. */
	onChange?: (code: string) => void;
}

export class Editor {
	editor: monaco.editor.IStandaloneCodeEditor;
	private onChangeCallback?: (code: string) => void;

	/**
	 * Crée une nouvelle instance de l'éditeur Monaco.
	 * @param elementRef - Référence vers l'élément DOM où monter l'éditeur.
	 * @param code - Code initial à afficher.
	 * @param options - Options de configuration (ex: onChange).
	 */
	constructor(elementRef: HTMLDivElement, code?: string, options?: EditorOptions) {
		this.onChangeCallback = options?.onChange;

		// Initialisation de Monaco
		this.registerLanguages();
		this.defineThemes();
		this.addAutoComplete();

		function formatMySpecialLanguage(model: monaco.editor.ITextModel) {
			const linesContent = model.getLinesContent();
			const formattedLines = formatGherkinLines(linesContent);

			// Trouver la ligne avec le nombre maximal de colonnes
			let maxColumnLineNumber = 0;
			let maxColumnCount = 0;

			for (let i = 1; i <= model.getLineCount(); i++) {
				const lineMaxColumn = model.getLineMaxColumn(i);
				if (lineMaxColumn > maxColumnCount) {
					maxColumnCount = lineMaxColumn;
					maxColumnLineNumber = i;
				}
			}

			// Retourner l'édition de formatage
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

		// Enregistrer le fournisseur de formatage pour Gherkin
		monaco.languages.registerDocumentFormattingEditProvider(
			"GherkinLanguage-en",
			{
				provideDocumentFormattingEdits: formatMySpecialLanguage,
			},
		);

		// Enregistrer le formatage automatique sur certains caractères
		monaco.languages.registerOnTypeFormattingEditProvider(
			"GherkinLanguage-en",
			{
				autoFormatTriggerCharacters: ["|"],
				provideOnTypeFormattingEdits: formatMySpecialLanguage,
			},
		);

		// Créer l'éditeur Monaco
		this.editor = monaco.editor.create(elementRef, {
			theme: "defaultLightTheme",
			formatOnType: true,
			value: code,
			language: "GherkinLanguage-en",
			acceptSuggestionOnEnter: "off",
			accessibilitySupport: "on",
		});

		// Écouter les changements de contenu
		this.editor.onDidChangeModelContent(() => {
			const newCode = this.editor.getValue();
			this.onChangeCallback?.(newCode);
		});
	}

	/**
	 * Nettoie les ressources de l'éditeur Monaco.
	 */
	public dispose(): void {
		if (this.editor) {
			this.editor.dispose();
		}
	}

	/**
	 * Met à jour le contenu de l'éditeur.
	 * @param code - Le nouveau code à afficher.
	 */
	public setValue(code: string): void {
		if (this.editor) {
			this.editor.setValue(code);
		}
	}

	/**
	 * Formate le contenu de l'éditeur.
	 */
	public format() {
		this.editor?.getAction("editor.action.formatDocument")?.run();
	}

	/**
	 * Met à jour le thème de l'éditeur (bascule entre light/dark).
	 */
	public updateTheme() {
		const currentTheme = this.editor.getOption(monaco.editor.EditorOption.theme);
		const newTheme = currentTheme === "defaultLightTheme" ? "defaultDarkTheme" : "defaultLightTheme";
		this.editor.updateOptions({
			theme: newTheme,
		});
	}

	/**
	 * Récupère le code actuel de l'éditeur.
	 */
	public getCode() {
		return this.editor.getValue();
	}

	/**
	 * Recalcule la taille de l'éditeur.
	 */
	public layout() {
		this.editor.layout();
	}

	/**
	 * Enregistre le langage Gherkin et son syntax highlighting.
	 */
	private registerLanguages() {
		monaco.languages.register({ id: "GherkinLanguage-en" });

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

	/**
	 * Définit les thèmes light et dark pour l'éditeur.
	 */
	private defineThemes() {
		monaco.editor.defineTheme("defaultLightTheme", {
			base: "vs",
			inherit: false,
			rules: [
				{
					token: "primary-keyword",
					foreground: "7dd956",
					fontStyle: "bold",
				},
				{ token: "secondary-keyword", foreground: "7dd956", fontStyle: "italic" },
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
				{ token: "secondary-keyword", foreground: "7dd956", fontStyle: "italic" },
			],
			colors: {
				"editor.foreground": "#ffffff",
			},
		});
	}

	/**
	 * Ajoute l'auto-complétion pour les mots-clés Gherkin.
	 */
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

				const text = model.getValue();
				const wordRegex = /\b\w+\b/g;
				const words = new Set<string>();
				let match: RegExpExecArray | null;
				match = wordRegex.exec(text);
				while (match !== null) {
					words.add(match[0]);
					match = wordRegex.exec(text);
				}

				const lines = model.getLinesContent();
				const lineSuggestions = lines
					.filter((line) => line.trim().length > 0)
					.map((line) => ({
						label: line,
						kind: monaco.languages.CompletionItemKind.Snippet,
						documentation: "Reuse existing line",
						insertText: line,
						range: range,
					}));

				const wordSuggestions = Array.from(words).map((word) => ({
					label: word,
					kind: monaco.languages.CompletionItemKind.Text,
					insertText: word,
					range: range,
				}));

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
