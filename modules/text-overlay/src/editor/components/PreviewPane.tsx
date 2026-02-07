import React from "react";
import { Player } from "@remotion/player";
import { OverlayComposition } from "@/composition/OverlayComposition";
import { useEditorStore } from "@/editor/stores/editorStore";
import { ErrorOverlay } from "@/editor/components/ErrorOverlay";

export const PreviewPane: React.FC = () => {
  const { parsedProject, lastValidProject, parseErrors } = useEditorStore();

  // Use current parsed project, or fall back to last valid one
  const project = parsedProject ?? lastValidProject;

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-300 font-medium">
        Preview
      </div>
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {project ? (
          <>
            <div className="w-full max-w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <Player
                component={OverlayComposition}
                inputProps={{ project }}
                durationInFrames={project.project.durationInFrames}
                fps={project.project.fps}
                compositionWidth={project.project.width}
                compositionHeight={project.project.height}
                controls
                loop
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            {parseErrors.length > 0 && <ErrorOverlay errors={parseErrors} />}
          </>
        ) : (
          <div className="text-gray-500 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p>Enter valid YAML to see preview</p>
            {parseErrors.length > 0 && <ErrorOverlay errors={parseErrors} />}
          </div>
        )}
      </div>
    </div>
  );
};
