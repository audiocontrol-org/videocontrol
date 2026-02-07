import type * as Monaco from "monaco-editor";
import type { EditorError } from "@/editor/stores/editorStore";

/**
 * Convert EditorError to Monaco editor markers for inline error display
 */
export function errorsToMarkers(
  errors: EditorError[],
  model: Monaco.editor.ITextModel
): Monaco.editor.IMarkerData[] {
  return errors.map((error) => {
    // Default to line 1 if no line info available
    const line = error.line !== undefined ? error.line + 1 : 1;
    const column = error.column !== undefined ? error.column + 1 : 1;

    // Get the line content to determine the end column
    const lineContent = model.getLineContent(Math.min(line, model.getLineCount()));
    const endColumn = lineContent.length + 1;

    return {
      severity: 8, // MarkerSeverity.Error
      message: formatErrorMessage(error),
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn: endColumn,
    };
  });
}

/**
 * Format error message for display in Monaco
 */
function formatErrorMessage(error: EditorError): string {
  if (error.path && error.path.length > 0) {
    return `${error.path.join(".")}: ${error.message}`;
  }
  return error.message;
}

/**
 * Parse line number from validation error messages that include path info
 * e.g., "overlays.0.in: Expected a string" -> try to find line for overlays[0].in
 */
export function findLineForPath(
  yamlContent: string,
  path: string[]
): number | undefined {
  // Simple heuristic: search for keys in the path
  const lines = yamlContent.split("\n");

  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    // Skip numeric indices (array positions)
    if (/^\d+$/.test(key)) continue;

    // Find the last occurrence of this key as a YAML key
    for (let lineNum = lines.length - 1; lineNum >= 0; lineNum--) {
      const line = lines[lineNum];
      const keyPattern = new RegExp(`^\\s*${key}\\s*:`);
      if (keyPattern.test(line)) {
        return lineNum;
      }
    }
  }

  return undefined;
}
