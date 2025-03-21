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
}

export const Editor = forwardRef<EditorExposeMethods, EditorProps>(
	(props, ref) => {
		const [editor, setEditor] = useState<EditorClass>();
		const divEditorRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (divEditorRef) {
				setEditor((editor) => {
					if (editor) return editor;
					if (divEditorRef.current)
						return new EditorClass(divEditorRef.current, props.code);
				});
			}
			// Todo
			//return () => editor?.dispose();
		}, [props.code]);

		const format = () => {
			editor?.format();
		};

		const updateTheme = () => {
			editor?.updateTheme();
		};

		const getCode = () => {
			return editor?.getCode() ?? "";
		};

		useImperativeHandle(ref, () => ({
			format,
			updateTheme,
			getCode,
		}));

		return <div {...props} ref={divEditorRef} />;
	},
);
