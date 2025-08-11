import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { type EditorExposeMethods, Editor } from "./components/Editor";
import { defaultEnGherkin, defaultFrGherkin } from "./tests/GherkinTexts";

const Page = () => {
	const editorRef = useRef<EditorExposeMethods>(null);
	return (
		<div>
			<main>
				<h3>Give me a Gherkin</h3>
				<Editor
					style={{ width: "700px", height: "500px" }}
					ref={editorRef}
					code={defaultEnGherkin}
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
					value="FR"
					onClick={() => {
						editorRef.current?.setGherkinLanguage("fr");
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
