// src/components/Workspace.tsx
import React from "react";
import Block from "./Block";

type WorkspaceProps = {
  blocks: string[];
};

function Workspace({ blocks }: WorkspaceProps) {
  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-2">Workspace</h2>
      <div className="flex flex-col gap-2">
        {blocks.map((content, index) => (
          <Block key={`${content}-${index}`} content={content} />
        ))}
      </div>
    </div>
  );
}

export default Workspace;