import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Editor, ensureMonacoGherkinRegistered } from "./Editor";

jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
	const mockEditorInstance = {
		dispose: jest.fn(),
		getAction: jest.fn(),
		updateOptions: jest.fn(),
		getValue: jest.fn().mockReturnValue(""),
		setValue: jest.fn(),
		layout: jest.fn(),
	};

	return {
		languages: {
			register: jest.fn(),
			setMonarchTokensProvider: jest.fn(),
			registerCompletionItemProvider: jest.fn(),
			registerDocumentFormattingEditProvider: jest.fn(),
			registerOnTypeFormattingEditProvider: jest.fn(),
			CompletionItemKind: {
				Keyword: 14,
				Snippet: 27,
				Text: 1,
			},
		},
		editor: {
			defineTheme: jest.fn(),
			create: jest.fn().mockReturnValue(mockEditorInstance),
		},
	};
});

jest.mock(
	"monaco-editor",
	() => ({
		languages: {
			typescript: {},
		},
	}),
	{ virtual: true },
);

describe("Editor class", () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		jest.clearAllMocks();
		container = {} as HTMLDivElement;
	});

	test("ensureMonacoGherkinRegistered should register languages, themes, providers idempotently", () => {
		ensureMonacoGherkinRegistered();
		ensureMonacoGherkinRegistered();

		// Should only register once globally
		expect(monaco.languages.register).toHaveBeenCalledTimes(1);
		expect(monaco.languages.register).toHaveBeenCalledWith({
			id: "GherkinLanguage-en",
		});
		expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledTimes(1);
		expect(monaco.editor.defineTheme).toHaveBeenCalledTimes(2); // defaultLightTheme, defaultDarkTheme
		expect(
			monaco.languages.registerCompletionItemProvider,
		).toHaveBeenCalledTimes(1);
		expect(
			monaco.languages.registerDocumentFormattingEditProvider,
		).toHaveBeenCalledTimes(1);
		expect(
			monaco.languages.registerOnTypeFormattingEditProvider,
		).toHaveBeenCalledTimes(1);
	});

	test("Editor constructor initializes Monaco editor with code", () => {
		const editor = new Editor(container, "Feature: Test");
		expect(monaco.editor.create).toHaveBeenCalledWith(
			container,
			expect.objectContaining({
				value: "Feature: Test",
				language: "GherkinLanguage-en",
			}),
		);
		expect(editor.editor).toBeDefined();
	});

	test("dispose() disposes underlying monaco editor instance", () => {
		const editor = new Editor(container, "Feature: Test");
		editor.dispose();
		expect(editor.editor.dispose).toHaveBeenCalledTimes(1);
	});

	test("setValue() updates code when different from current value", () => {
		const editor = new Editor(container, "Feature: Test");
		(editor.editor.getValue as jest.Mock).mockReturnValue("Feature: Test");

		// Same value should not call setValue
		editor.setValue("Feature: Test");
		expect(editor.editor.setValue).not.toHaveBeenCalled();

		// Different value should call setValue
		editor.setValue("Feature: Updated");
		expect(editor.editor.setValue).toHaveBeenCalledWith("Feature: Updated");
	});
});
