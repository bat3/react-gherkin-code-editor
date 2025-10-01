import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { type EditorExposeMethods, Editor } from "./components/Editor";

// Monaco web workers wiring for Vite
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
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
	"Feature: Calculator",
	"",
	"Simple calculator for adding two numbers",
	"",
	"@mytag",
	"Scenario: Add two numbers",
	"Given I have entered 50 into the calculator",
	"And I have entered 70 into the calculator",
	"When I press add",
	"Then the result should be 120 on the screen",
	"",
	"@mytag",
	"Scenario Outline: Add two numbers",
	"Given I have entered <First> in the calculator",
	"And I have entered <Second> into the calculator",
	"When I press add",
	"Then the result should be <Result> on the screen <Result>",
	"",
	"Examples:",
	"  |   First    |  Second |   Result |",
	"  | 50    | 70     | 120    |",
	"  | 30    | 40     | 70     |",
	"  | 60    | 30     | 90     |",
].join("\n");

const Page = () => {
	const editorRef = useRef<EditorExposeMethods>(null);
	return (
		<div>
			<main>
				<h3>Give me a Gherkin</h3>
				<Editor
					style={{ width: "700px", height: "500px" }}
					ref={editorRef}
					code={defaultGherkin}
				/>
				<input
					type="button"
					value="Format my Gherkin !"
					onClick={() => {
						editorRef.current?.format();
					}}
				/>
				<input
					type="button"
					value="Dark"
					onClick={() => {
						editorRef.current?.updateTheme();
					}}
				/>
				<input
					type="button"
					value="copy to clipboard"
					onClick={() => {
						navigator.clipboard.writeText(editorRef.current?.getCode() ?? "");
					}}
				/>
			</main>
		</div>
	);
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);
root.render(<Page />);
