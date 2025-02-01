// src/components/BlockPalette.tsx
import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

type BlockPaletteProps = {
  paletteBlocks: string[];
};

function BlockPalette({ paletteBlocks }: BlockPaletteProps) {
  return (
    <div className="w-1/4 bg-white rounded-md p-4 shadow-md h-fit">
      <h2 className="text-xl font-semibold mb-2">Block Palette</h2>

      <Droppable droppableId="PALETTE" isDropDisabled={true}>
        {(provided) => (
          <div
            className="flex flex-col gap-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {paletteBlocks.map((blockContent, index) => (
              <Draggable
                key={blockContent + index}
                draggableId={blockContent + index}
                index={index}
              >
                {(draggableProvided) => (
                  <div
                    className="bg-blue-400 text-white px-2 py-1 rounded-md cursor-move"
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    {blockContent}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default BlockPalette;
