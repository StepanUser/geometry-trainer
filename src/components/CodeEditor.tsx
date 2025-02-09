import React, { useEffect, useRef, useState } from "react";
import { Braces, Eye, Play, Trash2 } from "lucide-react";
import * as monaco from "monaco-editor";
import loader from "@monaco-editor/loader";
import styles from "../styles/CodeEditor.module.css";
import * as ts from "typescript";
import * as AllTypes from "../types";

interface CodeEditorProps {
  initialCode: string;
  onRunCode: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  onRunCode,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [jsonObjects, setJsonObjects] = useState<string[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const savedJson = localStorage.getItem("geometry-trainer-json-data");
    const savedCode = localStorage.getItem("geometry-trainer-code");
    const codeToUse = savedCode || initialCode;

    if (savedJson) {
      try {
        setJsonObjects(JSON.parse(savedJson));
      } catch (e) {
        console.error("Error loading saved JSON:", e);
      }
    }

    if (!editorRef.current) return;

    loader.init().then((monaco) => {
      const existingModel = monaco.editor.getModel(
        monaco.Uri.parse("file:///main.tsx")
      );
      if (existingModel) {
        existingModel.dispose();
      }

      const model = monaco.editor.createModel(
        codeToUse,
        "typescript",
        monaco.Uri.parse("file:///main.tsx")
      );

      configureEditorOptions();

      const setupTypes = (monaco: typeof import("monaco-editor")) => {
        const jsonArrayType = jsonObjects
          .map((_, index) => `json${index}: any;`)
          .join("\n");

        const objectDefinitions = Object.entries(AllTypes)
          .map(([name, type]) => {
            if (typeof type === "function") {
              return type.toString();
            }
            return `type ${name} = ${JSON.stringify(type, null, 2)};`;
          })
          .join("\n\n");

        const typeDefinitions = `
          declare class Visualizer {
            constructor(scene: any);
            show(object: Point3D | Line3D): void;
            private visualizePoint(point: Point3D, color?: number, size?: number): void;
            private visualizeLine(line: Line3D, color?: number): void;
          }

          ${objectDefinitions}
          declare const scene: any;
          declare const THREE: any;
          declare let visualizer: Visualizer;
          declare const jsonData: {
            ${jsonArrayType}
            getAll: () => any[];
          };
      



          declare namespace React {
            interface FC<P = {}> {
              (props: P): React.ReactElement | null;
            }
          }
        `;

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          typeDefinitions,
          "file:///types.d.ts"
        );
      };

      setupTypes(monaco);

      if (monacoRef.current) {
        monacoRef.current.dispose();
      }

      const current = editorRef.current;
      if (!current) return;

      const editor = monaco.editor.create(current, {
        model: model,
        ...editorSettings,
      });

      monaco.editor.defineTheme("arc-dark", { ...arcDark, base: "vs-dark" });

      monaco.editor.setTheme("arc-dark");

      monacoRef.current = editor;



      const handleEditorChange = () => {
        if(debounceTimeoutRef.current){
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          try{
            const code = monacoRef.current?.getValue();
            if(code){
              ts.transpileModule(code, {
                compilerOptions: {
                  target: ts.ScriptTarget.ES5,
                  module: ts.ModuleKind.CommonJS,
                }
              });

              localStorage.setItem("geometry-trainer-code", code);
              handleRunCode();
            }
          } catch (error){
            console.log("Error in real-time preview", error);
          }
        }, 300)
      };


      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        const formatAction = editor.getAction("editor.action.formatDocument");
        if (formatAction) {
          formatAction.run();
        }
      });

      const resizeEditor = () => {
        editor.layout();
      };

      window.addEventListener("resize", resizeEditor);

      const subscription = editor.onDidChangeModelContent(handleEditorChange);

      return () => {
        if(debounceTimeoutRef.current){
          clearTimeout(debounceTimeoutRef.current);
        }

        window.removeEventListener("resize", resizeEditor);
        subscription.dispose();
        model.dispose();
        editor.dispose();
      };
    });
  }, [initialCode, onRunCode]);

  const handleRunCode = () => {
    if (monacoRef.current) {
      const code = monacoRef.current.getValue();

      const jsonDataWrapper = `
        const jsonData = {
          ${jsonObjects
            .map((json, index) => `json${index}: ${json}`)
            .join(",\n")},
          getAll: function() { return [${jsonObjects
            .map((_, index) => `this.json${index}`)
            .join(", ")}]; }
        };

        const visualizer = new Visualizer(scene);
      `;

      const fullCode = jsonDataWrapper + "\n" + code;
      try {
        const result = ts.transpileModule(fullCode, {
          compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
          },
        });

        onRunCode(result.outputText);
      } catch (error) {
        console.error("Transpilation error", error);
      }
    }
  };

  const handleAddJson = () => {
    const json = prompt("Enter JSON:");
    if (!json) return;

    try {
      const parsedJson = JSON.stringify(JSON.parse(json), null, 2);
      const newJsonObjects = [...jsonObjects, parsedJson];
      setJsonObjects(newJsonObjects);
      localStorage.setItem(
        "geometry-trainer-json-data",
        JSON.stringify(newJsonObjects)
      );
    } catch (e) {
      alert("Invalid JSON format!");
      console.error("Error parsing JSON:", e);
    }
  };

  const handleClearJson = () => {
    if (confirm("Are you sure you want to clear all JSON data?")) {
      setJsonObjects([]);
      localStorage.removeItem("geometry-trainer-json-data");
    }
  };

  const showJsonObjects = () => {
    if (jsonObjects.length > 0) {
      alert(jsonObjects);
    }
  };

  return (
    <div className={styles.codeEditorPanel}>
      <div className={styles.editorHeader}>
        <div className={styles.jsonButtons}>
          <button onClick={handleAddJson} className={styles.jsonButton}>
            <Braces size={10} className={styles.buttonIcon} />
          </button>
          <button onClick={showJsonObjects} className={styles.jsonButton}>
            <Eye size={10} className={styles.buttonIcon} />
          </button>
          <button onClick={handleClearJson} className={styles.jsonButton}>
            <Trash2 size={10} className={styles.buttonIcon} />
          </button>
        </div>
        <button onClick={handleRunCode} className={styles.runButton}>
          <Play size={10} className={styles.buttonIcon} />
          Run
        </button>
      </div>
      <div ref={editorRef} className={styles.editor} />
    </div>
  );
};

const configureEditorOptions = () => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });
};

const arcDark = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "C792EA" },
    { token: "variable", foreground: "82AAFF" },
    { token: "constant", foreground: "C792EA" },
    { token: "string", foreground: "FDD835" },
    { token: "comment", foreground: "6A8B3D" },
    { token: "number", foreground: "FFCB6B" },
    { token: "type", foreground: "FF5370" },
    { token: "identifier", foreground: "EEFFFF" },
    { token: "function", foreground: "BB86FC" },
  ],
  colors: {
    "editor.background": "#2e3440",
    "editor.foreground": "#d8dee9",
    "editorCursor.foreground": "#ffffff",
    "editor.lineHighlightBackground": "#3B4252",
    "editor.selectionBackground": "#4C566A",
    "editor.selectionHighlightBackground": "#4C566A",
  },
};

const editorSettings = {
  cursorStyle: "line" as "line",
  cursorWidth: 2,
  cursorBlinking: "blink" as "blink",
  theme: "vs-dark",
  minimap: { enabled: true },
  fontSize: 12,
  fontFamily: 'Fira Code, Consolas, Monaco, "Courier New", monospace',
  lineNumbers: "on" as monaco.editor.LineNumbersType,
  lineHeight: 16,
  insertSpaces: true,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  renderLineHighlight: "line" as "line",
  lineNumbersMinChars: 3,
  automaticLayout: true,
  tabSize: 2,
  rulers: [80],
  bracketPairColorization: {
    enabled: true,
  },
  formatOnPaste: true,
  formatOnType: true,
  wordWrap: "on" as "on",
  glyphMargin: true,
};
