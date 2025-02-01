import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define block structure
interface Block {
  id: string;
  label: string;
  code: string;
}

// Blocks that can be dragged
const blocks: Block[] = [
  { id: "print", label: "Print 'Hello, World!'", code: "print('Hello, World!')" },
  { id: "var", label: "Variable x = 5", code: "x = 5" },
  { id: "if", label: "If Condition", code: "if x > 0:\n    print('Positive')" },
];

// Individual draggable block from the block list
const BlockItem = ({ block }: { block: Block }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        padding: "10px",
        margin: "5px",
        backgroundColor: "#ddd",
        cursor: "grab",
        borderRadius: "5px",
      }}
    >
      {block.label}
    </div>
  );
};

// Sortable block inside the Drop Zone
const SortableBlock = ({ block, onRemove }: { block: Block; onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    marginBottom: "5px",
    backgroundColor: "#f0f0f0",
    borderRadius: "5px",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>{block.label}</span>
      <button
        onClick={() => onRemove(block.id)}
        style={{
          marginLeft: "10px",
          padding: "5px",
          cursor: "pointer",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "3px",
        }}
      >
        ❌
      </button>
    </div>
  );
};

// Drop Zone component where users can drop and reorder blocks
const DropZone = ({
  droppedBlocks,
  onRemove,
}: {
  droppedBlocks: Block[];
  onRemove: (id: string) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: "dropzone" });

  return (
    <SortableContext items={droppedBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        style={{
          minHeight: "200px",
          padding: "10px",
          border: "2px dashed #000",
          backgroundColor: "#fff",
          borderRadius: "5px",
        }}
      >
        {droppedBlocks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>Drop Blocks Here</p>
        ) : (
          droppedBlocks.map((block) => <SortableBlock key={block.id} block={block} onRemove={onRemove} />)
        )}
      </div>
    </SortableContext>
  );
};

// Main App component
const App = () => {
  const [droppedBlocks, setDroppedBlocks] = useState<Block[]>([]);
  
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDrop = (id: string) => {
    // Prevent adding duplicate blocks
    if (!droppedBlocks.some((block) => block.id === id)) {
      const block = blocks.find((b) => b.id === id);
      if (block) {
        setDroppedBlocks((prev) => [...prev, { ...block, id: `${block.id}-${prev.length}` }]); // Unique ID per drop
      }
    }
  };

  const handleRemove = (id: string) => {
    setDroppedBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = droppedBlocks.findIndex((block) => block.id === active.id);
    const newIndex = droppedBlocks.findIndex((block) => block.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setDroppedBlocks((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }) => handleDrop(active.id)} // Fix: Ensure drag starts correctly
    >
      <h1>Drag and Drop Coding</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Blocks that can be dragged */}
        <div>
          {blocks.map((block) => (
            <BlockItem key={block.id} block={block} />
          ))}
        </div>

        {/* Drop Zone (Sortable) */}
        <DropZone droppedBlocks={droppedBlocks} onRemove={handleRemove} />
      </div>

      {/* Code Output */}
      <pre
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      >
        {droppedBlocks.map((block) => block.code).join("\n")}
      </pre>
    </DndContext>
  );
};

export default App;
