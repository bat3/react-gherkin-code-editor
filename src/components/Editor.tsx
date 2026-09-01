import { type HTMLAttributes, forwardRef, useImperativeHandle } from "react";
import { useEffect, useRef, useState } from "react";
import { Editor as EditorClass, type EditorTheme } from "../lib/Editor";

export type { EditorTheme };

export interface EditorProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	code?: string;
	value?: string;
	onChange?: (value: string) => void;
	theme?: EditorTheme;
	language?: string;
	readOnly?: boolean;
}

export interface EditorExposeMethods {
	format: () => void;
	updateTheme: () => void;
	getCode: () => string;
	layout: () => void;
}

export const Editor = forwardRef<EditorExposeMethods, EditorProps>(
	(props, ref) => {
		const { code, value, onChange, theme, language, readOnly, ...divProps } =
			props;

		const [editor, setEditor] = useState<EditorClass>();
		const divEditorRef = useRef<HTMLDivElement>(null);

		// Store initial props in ref for constructor on mount
		const initialPropsRef = useRef({
			code,
			value,
			onChange,
			theme,
			language,
			readOnly,
		});

		// Keep latest onChange ref to avoid unnecessary re-subscriptions or stale closures
		const onChangeRef = useRef(onChange);
		useEffect(() => {
			onChangeRef.current = onChange;
			if (editor) {
				editor.setOnChange((val) => {
					onChangeRef.current?.(val);
				});
			}
		}, [editor, onChange]);

		// Mount/unmount lifecycle only
		useEffect(() => {
			if (!divEditorRef.current) return;

			const editorInstance = new EditorClass(divEditorRef.current, {
				code: initialPropsRef.current.code,
				value: initialPropsRef.current.value,
				theme: initialPropsRef.current.theme,
				language: initialPropsRef.current.language,
				readOnly: initialPropsRef.current.readOnly,
				onChange: (val) => {
					onChangeRef.current?.(val);
				},
			});
			setEditor(editorInstance);

			return () => {
				editorInstance.dispose();
			};
		}, []);

		// Handle content updates (value or code)
		useEffect(() => {
			if (editor) {
				const currentPropValue = value ?? code;
				if (
					currentPropValue !== undefined &&
					editor.getCode() !== currentPropValue
				) {
					editor.setValue(currentPropValue);
				}
			}
		}, [editor, value, code]);

		// Handle theme updates
		useEffect(() => {
			if (editor && theme !== undefined) {
				editor.setTheme(theme);
			}
		}, [editor, theme]);

		// Handle language updates
		useEffect(() => {
			if (editor && language !== undefined) {
				editor.setLanguage(language);
			}
		}, [editor, language]);

		// Handle readOnly updates
		useEffect(() => {
			if (editor && readOnly !== undefined) {
				editor.setReadOnly(readOnly);
			}
		}, [editor, readOnly]);

		// Handle resize events
		useEffect(() => {
			if (!editor || !divEditorRef.current) return;

			const resizeObserver = new ResizeObserver(() => {
				editor.layout();
			});

			resizeObserver.observe(divEditorRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		}, [editor]);

		const format = () => {
			editor?.format();
		};

		const updateTheme = () => {
			editor?.updateTheme();
		};

		const getCode = () => {
			return editor?.getCode() ?? "";
		};

		const layout = () => {
			editor?.layout();
		};

		useImperativeHandle(ref, () => ({
			format,
			updateTheme,
			getCode,
			layout,
		}));

		return (
			<div data-testid="gherkin-editor" {...divProps} ref={divEditorRef} />
		);
	},
);
