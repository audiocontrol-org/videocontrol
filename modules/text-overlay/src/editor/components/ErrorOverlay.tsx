import React from "react";
import type { EditorError } from "@/editor/stores/editorStore";

interface ErrorOverlayProps {
  errors: EditorError[];
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-red-900/95 rounded-lg shadow-lg p-4 text-white max-h-48 overflow-y-auto border border-red-700">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-5 h-5 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-semibold">Parse Error</span>
      </div>
      <div className="space-y-1">
        {errors.map((error, i) => (
          <div key={i} className="text-sm font-mono">
            {error.line !== undefined && (
              <span className="text-red-400">Line {error.line + 1}: </span>
            )}
            <span className="text-red-100 whitespace-pre-wrap">{error.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
