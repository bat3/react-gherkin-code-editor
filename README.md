# react-gherkin-code-editor

## Description

React gherkin code editor is a tool designed to write and format Gherkin features and scenarios.
The editor is based on Monaco editor.

## Installation

To install the project dependencies, run:

```bash
npm install react-gherkin-code-editor
```

## Usage

### Controlled Component Usage (Recommended)

```typescript
import { useState } from "react";
import { Editor, type EditorTheme } from "react-gherkin-code-editor";

const defaultGherkin = [
	"Feature: Calculator",
	"",
	"Scenario: Add two numbers",
	"  Given I have entered 50 into the calculator",
	"  And I have entered 70 into the calculator",
	'  When I press "add"',
	"  Then the result should be 120 on the screen",
].join("\n");

const EditorComponent = () => {
	const [code, setCode] = useState(defaultGherkin);
	const [theme, setTheme] = useState<EditorTheme>("light");

	return (
		<div>
			<button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
				Toggle Theme ({theme})
			</button>
			<Editor
				style={{ width: "700px", height: "500px" }}
				value={code}
				onChange={(newValue) => setCode(newValue)}
				theme={theme}
			/>
		</div>
	);
};
```

### Imperative Ref Usage (Legacy)

```typescript
import { useRef } from "react";
import { type EditorExposeMethods, Editor } from "react-gherkin-code-editor";

const EditorComponent = () => {
	const editorRef = useRef<EditorExposeMethods>(null);

	return (
		<div>
			<button onClick={() => editorRef.current?.format()}>Format</button>
			<button onClick={() => editorRef.current?.updateTheme()}>Dark Theme</button>
			<Editor
				style={{ width: "700px", height: "500px" }}
				ref={editorRef}
				code="Feature: Calculator"
			/>
		</div>
	);
};
```

## Props API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `undefined` | Controlled value of the editor content. |
| `code` | `string` | `""` | Initial / uncontrolled content of the editor (alias for value). |
| `onChange` | `(value: string) => void` | `undefined` | Callback invoked when the editor content changes. |
| `theme` | `EditorTheme` (`"light"` \| `"dark"` \| `"defaultLightTheme"` \| `"defaultDarkTheme"` \| `string`) | `"light"` | Editor theme name or alias. Updates reactively when changed. |
| `language` | `string` | `"GherkinLanguage-en"` | Monaco language ID. |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only. |
| `...` | `HTMLAttributes<HTMLDivElement>` | | Standard HTML div attributes (`style`, `className`, `id`, `data-testid`, etc.). |

## Imperative Ref Methods

- `format()`: Formats the Gherkin content in the editor.
- `updateTheme()`: Switches theme to dark (legacy helper).
- `getCode()`: Returns the current code in the editor as a string.
- `layout()`: Triggers Monaco editor layout recalculation.

## Contributing

To install the project dependencies, run:

```bash
npm install
```

This project uses the following npm scripts:

- `npm run dev`: Starts the development server using Vite
- `npm run build`: Compiles TypeScript and builds the project for production
- `npm run test`: Launch unit tests
- `npm run test:e2e`: Launch end-to-end tests with Playwright

## Publish
- `npm login`: Login with npm user account
- `npm run build`: Compiles TypeScript and builds the project for production
- `npm publish`: Publish the package in npm

## Demo
See https://www.gherkineditor.online/ web site.

## License
Released under the AGPL-3.0-or-later License.
