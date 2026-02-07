import React from "react";
import { SplitPane } from "@/editor/components/SplitPane";
import { YamlEditor } from "@/editor/components/YamlEditor";
import { PreviewPane } from "@/editor/components/PreviewPane";

export const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-gray-900">
      <SplitPane
        left={<YamlEditor />}
        right={<PreviewPane />}
        defaultSplit={45}
        minLeft={25}
        minRight={25}
      />
    </div>
  );
};
