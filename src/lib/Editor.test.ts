import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Editor, ensureMonacoGherkinRegistered, resolveTheme } from "./Editor";

let onDidChangeModelContentListener: (() => void) | null = null;
let currentModelLanguage = "GherkinLanguage-en";

jest.mock("monaco-editor/esm/vs/editor/editor.api", () => {
	const mockModel = {
		getLanguageId: jest.fn(() => currentModelLanguage),
	};

	const mockEditorInstance = {
		dispose: jest.fn(),
		getAction: jest.fn(),
		updateOptions: jest.fn(),
		getValue: jest.fn().mockReturnValue(""),
		setValue: jest.fn(),
		layout: jest.fn(),
		getModel: jest.fn().mockReturnValue(mockModel),
		onDidChangeModelContent: jest.fn((callback) => {
			onDidChangeModelContentListener = callback;
			return { dispose: jest.fn() };
		}),
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
			setTheme: jest.fn(),
			setModelLanguage: jest.fn((_model, lang) => {
				currentModelLanguage = lang;
			}),
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

describe("resolveTheme function", () => {
	test("resolves light and dark theme aliases correctly", () => {
		expect(resolveTheme("light")).toBe("defaultLightTheme");
		expect(resolveTheme("dark")).toBe("defaultDarkTheme");
		expect(resolveTheme("defaultLightTheme")).toBe("defaultLightTheme");
		expect(resolveTheme("defaultDarkTheme")).toBe("defaultDarkTheme");
		expect(resolveTheme("vs-dark")).toBe("vs-dark");
		expect(resolveTheme(undefined)).toBe("defaultLightTheme");
	});
});

describe("Editor class", () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		jest.clearAllMocks();
		container = {} as HTMLDivElement;
		onDidChangeModelContentListener = null;
		currentModelLanguage = "GherkinLanguage-en";
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

	test("Editor constructor initializes Monaco editor with code and options", () => {
		const editor = new Editor(container, {
			code: "Feature: Test",
			theme: "dark",
			readOnly: true,
			language: "GherkinLanguage-en",
		});

		expect(monaco.editor.create).toHaveBeenCalledWith(
			container,
			expect.objectContaining({
				value: "Feature: Test",
				theme: "defaultDarkTheme",
				language: "GherkinLanguage-en",
				readOnly: true,
			}),
		);
		expect(editor.editor).toBeDefined();
	});

	test("Editor constructor initializes with string parameter for backward compatibility", () => {
		new Editor(container, "Feature: Old API");
		expect(monaco.editor.create).toHaveBeenCalledWith(
			container,
			expect.objectContaining({
				value: "Feature: Old API",
				theme: "defaultLightTheme",
				readOnly: false,
			}),
		);
	});

	test("onDidChangeModelContent triggers onChange callback", () => {
		const onChangeMock = jest.fn();
		const editor = new Editor(container, {
			code: "Initial",
			onChange: onChangeMock,
		});

		(editor.editor.getValue as jest.Mock).mockReturnValue("Updated content");

		// Simulate Monaco model content change
		expect(onDidChangeModelContentListener).not.toBeNull();
		onDidChangeModelContentListener?.();

		expect(onChangeMock).toHaveBeenCalledWith("Updated content");
	});

	test("setTheme updates Monaco theme", () => {
		const editor = new Editor(container);
		editor.setTheme("dark");
		expect(monaco.editor.setTheme).toHaveBeenCalledWith("defaultDarkTheme");

		editor.setTheme("customTheme");
		expect(monaco.editor.setTheme).toHaveBeenCalledWith("customTheme");
	});

	test("updateTheme calls setTheme with defaultDarkTheme for legacy support", () => {
		const editor = new Editor(container);
		editor.updateTheme();
		expect(monaco.editor.setTheme).toHaveBeenCalledWith("defaultDarkTheme");
	});

	test("setReadOnly updates editor options", () => {
		const editor = new Editor(container);
		editor.setReadOnly(true);
		expect(editor.editor.updateOptions).toHaveBeenCalledWith({
			readOnly: true,
		});

		editor.setReadOnly(false);
		expect(editor.editor.updateOptions).toHaveBeenCalledWith({
			readOnly: false,
		});
	});

	test("setLanguage sets model language", () => {
		const editor = new Editor(container);
		editor.setLanguage("custom-language");
		expect(monaco.editor.setModelLanguage).toHaveBeenCalledWith(
			expect.anything(),
			"custom-language",
		);
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
