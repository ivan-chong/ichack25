// src/components/Workspace.tsx
import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { BlockItem } from "../App";
import BlockDraggable from "./BlockDraggable";

interface WorkspaceProps {
  blocks: BlockItem[];
  onDelete: (blockId: string) => void;
}

function Workspace({ blocks, onDelete }: WorkspaceProps) {
  return (
    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-md p-4">
      <h2 className="text-lg font-bold mb-2">Workspace</h2>

      <Droppable droppableId="WORKSPACE">
        {(provided) => (
          <div
            className="flex flex-col gap-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {blocks.map((block, index) => (
              <BlockDraggable
                key={block.id}
                block={block}
                index={index}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Workspace;
