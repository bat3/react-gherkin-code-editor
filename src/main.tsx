import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	Editor,
	type EditorExposeMethods,
	type EditorTheme,
	type SupportedLanguage,
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

const gherkinDemos: Record<SupportedLanguage, string> = {
	en: [
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
	].join("\n"),
	fr: [
		"# language: fr",
		"Fonctionnalité: Calculatrice",
		"",
		"Calculatrice simple pour additionner deux nombres",
		"",
		"@mytag",
		"Scénario: Additionner deux nombres",
		"Etant donné que j'ai saisi 50 dans la calculatrice",
		"Et que j'ai saisi 70 dans la calculatrice",
		'Quand j\'appuie sur "ajouter"',
		"Alors le résultat doit être 120 à l'écran",
		"",
		"Plan du scénario: Additionner deux nombres",
		"Etant donné que j'ai saisi <Premier> dans la calculatrice",
		"Et que j'ai saisi <Second> dans la calculatrice",
		'Quand j\'appuie sur "ajouter"',
		"Alors le résultat doit être <Résultat> à l'écran",
		"",
		"Exemples:",
		"  |   Premier    |  Second |   Résultat |",
		"  | 50    | 70     | 120    |",
		"  | 30    | 40     | 70     |",
	].join("\n"),
	es: [
		"# language: es",
		"Característica: Calculadora",
		"",
		"Calculadora simple para sumar dos números",
		"",
		"@mytag",
		"Escenario: Sumar dos números",
		"Dado que he ingresado 50 en la calculadora",
		"Y que he ingresado 70 en la calculadora",
		'Cuando presiono "sumar"',
		"Entonces el resultado debe ser 120 en la pantalla",
		"",
		"Esquema del escenario: Sumar dos números",
		"Dado que he ingresado <Primero> en la calculadora",
		"Y que he ingresado <Segundo> en la calculadora",
		'Cuando presiono "sumar"',
		"Entonces el resultado debe ser <Resultado> en la pantalla",
		"",
		"Ejemplos:",
		"  |   Primero    |  Second |   Resultado |",
		"  | 50    | 70     | 120    |",
		"  | 30    | 40     | 70     |",
	].join("\n"),
};

const Page = () => {
	const editorRef = useRef<EditorExposeMethods>(null);
	const [isBig, setIsBig] = useState<boolean>(true);
	const [selectedLanguage, setSelectedLanguage] =
		useState<SupportedLanguage>("en");
	const [editorContent, setEditorContent] = useState<string>(gherkinDemos.en);
	const [editorTheme, setEditorTheme] = useState<EditorTheme>("light");
	const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

	const handleLanguageChange = (lang: SupportedLanguage) => {
		setSelectedLanguage(lang);
		setEditorContent(gherkinDemos[lang]);
	};

	return (
		<main style={{ height: "70vh" }}>
			<h3>Give me a Gherkin</h3>
			<div style={{ marginBottom: "10px" }}>
				<label htmlFor="language-select">Language: </label>
				<select
					id="language-select"
					data-testid="language-select"
					value={selectedLanguage}
					onChange={(e) =>
						handleLanguageChange(e.target.value as SupportedLanguage)
					}
				>
					<option value="en">English (en)</option>
					<option value="fr">French (fr)</option>
					<option value="es">Spanish (es)</option>
				</select>
			</div>
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
				language={selectedLanguage}
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
