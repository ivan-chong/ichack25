// src/components/BlockDraggable.tsx
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { BlockItem } from "../App";

interface BlockDraggableProps {
  block: BlockItem;
  index: number;
  onDelete: (blockId: string) => void;
}

function BlockDraggable({ block, index, onDelete }: BlockDraggableProps) {
  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided) => (
        <div
          className="bg-green-500 text-white px-3 py-2 rounded-md shadow-md flex items-center justify-between"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div>{block.content}</div>
          <button
            className="ml-4 text-xs bg-red-600 px-2 py-1 rounded"
            onClick={() => onDelete(block.id)}
          >
            Delete
          </button>
        </div>
      )}
    </Draggable>
  );
}

export default BlockDraggable;
