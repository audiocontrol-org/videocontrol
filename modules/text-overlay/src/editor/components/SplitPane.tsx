import React, { useState, useCallback, useRef, useEffect } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
  minLeft?: number;
  minRight?: number;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  defaultSplit = 50,
  minLeft = 20,
  minRight = 20,
}) => {
  const [splitPercent, setSplitPercent] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;

      const clampedPercent = Math.max(minLeft, Math.min(100 - minRight, percent));
      setSplitPercent(clampedPercent);
    },
    [isDragging, minLeft, minRight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ cursor: isDragging ? "col-resize" : undefined }}
    >
      <div
        className="h-full overflow-hidden"
        style={{ width: `${splitPercent}%` }}
      >
        {left}
      </div>
      <div
        className="h-full w-1 cursor-col-resize bg-gray-700 hover:bg-blue-500 transition-colors flex-shrink-0"
        onMouseDown={handleMouseDown}
      />
      <div
        className="h-full overflow-hidden"
        style={{ width: `${100 - splitPercent}%` }}
      >
        {right}
      </div>
    </div>
  );
};
