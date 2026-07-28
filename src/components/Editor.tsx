import { forwardRef, type HTMLAttributes, useImperativeHandle } from "react";
import { useRef, useState, useEffect } from "react";
import { Editor as EditorClass } from "../lib/Editor";

export type EditorProps = {
	code?: string;
	/** Callback appelé lorsque le code change dans l'éditeur. */
	onChange?: (code: string) => void;
} & HTMLAttributes<HTMLDivElement>;

export interface EditorExposeMethods {
	/** Formate le contenu de l'éditeur. */
	format: () => void;
	/** Met à jour le thème de l'éditeur (bascule entre light/dark). */
	updateTheme: () => void;
	/** Récupère le code actuel de l'éditeur. */
	getCode: () => string;
	/** Recalcule la taille de l'éditeur (à appeler après un redimensionnement manuel). */
	layout: () => void;
	/** Met à jour le contenu de l'éditeur. */
	setValue: (code: string) => void;
}

export const Editor = forwardRef<EditorExposeMethods, EditorProps>(
	(props, ref) => {
		const [editor, setEditor] = useState<EditorClass>();
		const divEditorRef = useRef<HTMLDivElement>(null);

		// Initialisation de l'éditeur et nettoyage
		useEffect(() => {
			if (!divEditorRef.current) return;

			const newEditor = new EditorClass(divEditorRef.current, props.code, {
				onChange: props.onChange,
			});
			setEditor(newEditor);

			// Nettoyage : dispose de l'éditeur Monaco
			return () => {
				newEditor.dispose();
			};
		}, []);

		// Mise à jour du code si la prop change
		useEffect(() => {
			if (editor && props.code !== undefined) {
				editor.setValue(props.code);
			}
		}, [props.code, editor]);

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

		const setValue = (code: string) => {
			editor?.setValue(code);
		};

		useImperativeHandle(ref, () => ({
			format,
			updateTheme,
			getCode,
			layout,
			setValue,
		}));

		return <div {...props} ref={divEditorRef} />;
	},
);
