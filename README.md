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
Import Editor from react-gherkin-code-editor into your project, define some props and you're good to go!

```typescript
import { type EditorExposeMethods, Editor } from "react-gherkin-code-editor";

const defaultGherkin = [
	"Feature: Calculator",
	"",
	"Simple calculator for adding two numbers",
	"",
	"@Add",
	"Scenario Outline: Add two numbers",
	"Given I have entered <First> in the calculator",
	"And I have entered <Second> into the calculator",
	"When I press add",
	"Then the result should be <Result> on the screen",
	"",
	"Examples:",
	"  |   First    |  Second |   Result |",
	"  | 50    | 70     | 120    |",
	"  | 30    | 40     | 70     |",
	"  | 60    | 30     | 90     |",
].join("\n");

const EditorComponent = () => {
	const editorRef = useRef<EditorExposeMethods>(null);
	return (
        <Editor
            style={{ width: "700px", height: "500px" }}
            ref={editorRef}
            code={defaultGherkin}
        />
	);
};
```

## Contributing

To install the project dependencies, run:

```bash
npm install
```

This project uses the following npm scripts:

- `npm run dev`: Starts the development server using Vite
- `npm run build`: Compiles TypeScript and builds the project for production

## Publish
- `npm login`: Login with npm user account
- `npm run build`: Compiles TypeScript and builds the project for production
- `npm publish`: Publish the package in npm

## Demo
See https://www.gherkineditor.online/ web site.

## License
Released under the AGPL-3.0-or-later License.