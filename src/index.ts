// Export components
export { Editor } from "./components/Editor";
export type {
	EditorExposeMethods,
	EditorProps,
	EditorTheme,
} from "./components/Editor";
export type { editor } from "monaco-editor";
export type { SupportedLanguage, GherkinKeywords } from "./lib/Gherkin";
export { gherkinLanguages, combinedGherkinKeywords } from "./lib/Gherkin";
export { resolveLanguage } from "./lib/Editor";
