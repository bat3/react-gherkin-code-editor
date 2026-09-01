import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	Editor,
	type EditorExposeMethods,
	type EditorTheme,
} from "./components/Editor";

// Monaco web workers wiring for Vite
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

type MonacoEnvironmentType = {
	getWorker(moduleId: string, label: string): Worker;
};

(
	globalThis as unknown as { MonacoEnvironment?: MonacoEnvironmentType }
).MonacoEnvironment = {
	getWorker(_moduleId: string, label: string): Worker {
		if (label === "json") return new JsonWorker();
		if (label === "css" || label === "scss" || label === "less")
			return new CssWorker();
		if (label === "html" || label === "handlebars" || label === "razor")
			return new HtmlWorker();
		if (label === "typescript" || label === "javascript") return new TsWorker();
		return new EditorWorker();
	},
};

const defaultGherkin = [
	"# language: en",
	"Feature: Calculator",
	"",
	"Simple calculator for adding two numbers",
	"",
	"@mytag",
	"Scenario: Add two numbers",
	"Given I have entered 50 into the calculator",
	"And I have entered 70 into the calculator",
	'When I press "add"',
	"Then the result should be 120 on the screen",
	"",
	"@mytag",
	"Scenario Outline: Add two numbers",
	"Given I have entered <First> in the calculator",
	"And I have entered <Second> into the calculator",
	'When I press "add"',
	"Then the result should be <Result> on the screen",
	"",
	"Examples:",
	"  |   First    |  Second |   Result |",
	"  | 50    | 70     | 120    |",
	"  | 30    | 40     | 70     |",
	"  | 60    | 30     | 90     |",
].join("\n");

const Page = () => {
	const editorRef = useRef<EditorExposeMethods>(null);
	const [isBig, setIsBig] = useState<boolean>(true);
	const [editorContent, setEditorContent] = useState<string>(defaultGherkin);
	const [editorTheme, setEditorTheme] = useState<EditorTheme>("light");
	const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

	return (
		<main style={{ height: "70vh" }}>
			<h3>Give me a Gherkin</h3>
			<Editor
				data-testid="gherkin-editor"
				style={{
					width: isBig ? "100%" : "350px",
					height: isBig ? "100%" : "250px",
					border: "1px solid rgb(0, 0, 0)",
				}}
				ref={editorRef}
				value={editorContent}
				onChange={(newVal) => setEditorContent(newVal)}
				theme={editorTheme}
				readOnly={isReadOnly}
			/>
			<input
				type="button"
				data-testid="format-button"
				value="Format my Gherkin !"
				onClick={() => {
					editorRef.current?.format();
				}}
			/>
			<input
				type="button"
				data-testid="dark-theme-button"
				value="Dark"
				onClick={() => {
					setEditorTheme("dark");
				}}
			/>
			<input
				type="button"
				data-testid="light-theme-button"
				value="Light"
				onClick={() => {
					setEditorTheme("light");
				}}
			/>
			<input
				type="button"
				data-testid="toggle-readonly-button"
				value={isReadOnly ? "Make Editable" : "Make ReadOnly"}
				onClick={() => {
					setIsReadOnly(!isReadOnly);
				}}
			/>
			<input
				type="button"
				data-testid="copy-button"
				value="copy to clipboard"
				onClick={() => {
					navigator.clipboard.writeText(editorRef.current?.getCode() ?? "");
				}}
			/>
			<input
				type="button"
				data-testid="toggle-size-button"
				value="Toggle size"
				onClick={() => {
					setIsBig(!isBig);
				}}
			/>
			<div data-testid="content-preview" style={{ marginTop: "10px" }}>
				<strong>Live Content Length:</strong> {editorContent.length}
			</div>
		</main>
	);
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);
root.render(<Page />);
