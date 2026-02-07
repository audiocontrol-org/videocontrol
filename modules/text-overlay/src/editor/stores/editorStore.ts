import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseProject, type ParsedProject, ParseError } from "@/parser/parse";

const DEFAULT_YAML = `project:
  name: "Demo Project"
  resolution: [1920, 1080]
  framerate: 30
  duration: "0:15"

defaults:
  font: "Inter"
  transition:
    in: fade
    out: fade
    duration: 0.25

theme:
  primary: "#3B82F6"
  secondary: "#1E293B"
  text: "#F8FAFC"
  accent: "#F59E0B"

overlays:
  - id: intro
    type: title
    title: "Hello World"
    subtitle: "Welcome to Text Overlay"
    in: "0:01"
    out: "0:06"

  - id: presenter
    type: lower-third
    title: "Demo User"
    subtitle: "Text Overlay Editor"
    in: "0:07"
    out: "0:12"
    position: bottom-left
`;

export interface EditorError {
  message: string;
  line?: number;
  column?: number;
  path?: string[];
}

interface EditorState {
  yamlContent: string;
  parsedProject: ParsedProject | null;
  lastValidProject: ParsedProject | null;
  parseErrors: EditorError[];

  setYamlContent: (content: string) => void;
  parseCurrentContent: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      yamlContent: DEFAULT_YAML,
      parsedProject: null,
      lastValidProject: null,
      parseErrors: [],

      setYamlContent: (content: string) => {
        set({ yamlContent: content });
      },

      parseCurrentContent: () => {
        const { yamlContent, lastValidProject } = get();

        try {
          const parsed = parseProject(yamlContent);
          set({
            parsedProject: parsed,
            lastValidProject: parsed,
            parseErrors: [],
          });
        } catch (err) {
          const errors: EditorError[] = [];

          if (err instanceof ParseError) {
            errors.push({
              message: err.message,
              line: err.line,
              column: err.column,
              path: err.path,
            });
          } else if (err instanceof Error) {
            errors.push({ message: err.message });
          } else {
            errors.push({ message: String(err) });
          }

          set({
            parsedProject: null,
            parseErrors: errors,
            // Keep lastValidProject for graceful degradation
            lastValidProject,
          });
        }
      },
    }),
    {
      name: "text-overlay-editor",
      partialize: (state) => ({ yamlContent: state.yamlContent }),
    }
  )
);
