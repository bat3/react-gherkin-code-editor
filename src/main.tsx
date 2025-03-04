import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { type EditorExposeMethods, Editor } from "./components/Editor";

const defaultGherkin = [
  "Feature: Calculator",
  "",
  "Simple calculator for adding two numbers",
  "",
  "@mytag",
  "Scenario: Add two numbers",
  "Given I have entered 50 into the calculator",
  "And I have entered 70 into the calculator",
  "When I press add",
  "Then the result should be 120 on the screen",
  "",
  "@mytag",
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
].join("\n")

const Page = () => {
  const editorRef = useRef<EditorExposeMethods>(null)
  return (
    <div>
      <main>
        <h3>Give me a Gherkin</h3>
        <Editor style={{ width: "700px", height: "500px" }} ref={editorRef} code={defaultGherkin} />
        <input type="button" value="Format my Gherkin !" onClick={() => { editorRef.current?.format() }} />
        <input type="button" value="Dark" onClick={() => { editorRef.current?.updateTheme() }} />
      </main>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById("root")
);


