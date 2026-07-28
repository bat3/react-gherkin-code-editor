import { forwardRef, type HTMLAttributes, useImperativeHandle } from "react";
import { useRef, useState, useEffect } from "react";
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

		// Initialisation de l'éditeur et nettoyage
		useEffect(() => {
			if (!divEditorRef.current) return;

			const newEditor = new EditorClass(divEditorRef.current, props.code);
			setEditor(newEditor);

			// Nettoyage : dispose de l'éditeur Monaco
			return () => {
				newEditor.dispose();
			};
		}, []);

		// Gestion du redimensionnement
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

		return <div {...props} ref={divEditorRef} />;
	},
);
