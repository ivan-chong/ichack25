// src/components/BlockPalette.tsx
import React from "react";

const blockTypes = [
  "Move 10 steps",
  "Turn 90°",
  "Say 'Hello'",
];

function BlockPalette() {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, block: string) => {
    event.dataTransfer.setData("text/plain", block);
  };

  return (
    <div className="w-1/4 bg-white rounded-md p-4 shadow-md h-fit">
      <h2 className="text-xl font-semibold mb-2">Block Palette</h2>
      <div className="flex flex-col gap-2">
        {blockTypes.map((block) => (
          <div
            key={block}
            className="bg-blue-400 text-white px-2 py-1 rounded-md cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, block)}
          >
            {block}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlockPalette;
