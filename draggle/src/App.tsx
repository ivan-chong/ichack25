// src/App.tsx
import React, { useState } from "react";
import BlockPalette from "./components/BlockPalette";
import Workspace from "./components/Workspace";
import CodeView from "./components/CodeView";

/**
 * Main application component that handles block data flow:
 * 1. The user drags blocks from the BlockPalette.
 * 2. Dropped blocks appear in the Workspace.
 * 3. The arrangement generates code displayed in CodeView.
 */
function App() {
  const [blocks, setBlocks] = useState<string[]>([]);

  // When the user drops a block onto the workspace
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const blockData = event.dataTransfer.getData("text/plain");
    setBlocks((prev) => [...prev, blockData]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Generate a simple code representation from the blocks array
  const generateCode = (): string => {
    return blocks
      .map((block, i) => {
        // This is a naive approach. In a real scenario, each block might
        // have a type, parameters, etc. to produce more structured code.
        switch (block) {
          case "Move 10 steps":
            return `move(10);`;
          case "Turn 90°":
            return `turn(90);`;
          case "Say 'Hello'":
            return `say("Hello");`;
          default:
            return `// Unknown block: ${block}`;
        }
      })
      .join("\n");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Scratch-like Blocks (No-Code/Low-Code)</h1>
        <p className="text-gray-600">
          Drag blocks from the left palette into the workspace.  
          See the generated code below!
        </p>
      </header>

      <div className="flex flex-grow gap-4">
        {/* Block Palette */}
        <BlockPalette />

        {/* Workspace (drop zone) */}
        <div
          className="flex-1 border-2 border-dashed border-gray-300 rounded-md p-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Workspace blocks={blocks} />
        </div>
      </div>

      {/* Code Preview */}
      <div className="mt-4">
        <CodeView code={generateCode()} />
      </div>
    </div>
  );
}

export default App;
