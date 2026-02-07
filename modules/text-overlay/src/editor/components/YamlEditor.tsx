import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useEditorStore } from "@/editor/stores/editorStore";
import { debounce } from "@/editor/lib/debounce";
import { errorsToMarkers } from "@/editor/lib/error-to-markers";

const PARSE_DEBOUNCE_MS = 300;

export const YamlEditor: React.FC = () => {
  const { yamlContent, setYamlContent, parseCurrentContent, parseErrors } =
    useEditorStore();

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  const debouncedParse = useMemo(
    () => debounce(parseCurrentContent, PARSE_DEBOUNCE_MS),
    [parseCurrentContent]
  );

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Initial parse on mount
      parseCurrentContent();
    },
    [parseCurrentContent]
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      setYamlContent(value ?? "");
      debouncedParse();
    },
    [setYamlContent, debouncedParse]
  );

  // Update markers when parseErrors change
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = errorsToMarkers(parseErrors, model);
    monaco.editor.setModelMarkers(model, "yaml-validator", markers);
  }, [parseErrors]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-300 font-medium">
        YAML Editor
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="yaml"
          theme="vs-dark"
          value={yamlContent}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "line",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
};
