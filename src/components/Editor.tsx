import { type HTMLAttributes, forwardRef, useImperativeHandle } from "react";
import { useEffect, useRef, useState } from "react";
import { Editor as EditorClass } from "../lib/Editor";

export type EditorProps = {
	code?: string;
} & HTMLAttributes<HTMLDivElement>;

export interface EditorExposeMethods {
	format: () => void;
	updateTheme: () => void;
	getCode: () => string;
	layout: () => void;
}

export const Editor = forwardRef<EditorExposeMethods, EditorProps>(
	(props, ref) => {
		const [editor, setEditor] = useState<EditorClass>();
		const divEditorRef = useRef<HTMLDivElement>(null);

		// biome-ignore lint/correctness/useExhaustiveDependencies: mount/unmount lifecycle only; props.code dynamic updates are handled in separate useEffect below
		useEffect(() => {
			if (!divEditorRef.current) return;

			const editorInstance = new EditorClass(divEditorRef.current, props.code);
			setEditor(editorInstance);

			return () => {
				editorInstance.dispose();
			};
		}, []);

		useEffect(() => {
			if (editor && props.code !== undefined) {
				editor.setValue(props.code);
			}
		}, [editor, props.code]);

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

		return <div data-testid="gherkin-editor" {...props} ref={divEditorRef} />;
	},
);
