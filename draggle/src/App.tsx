import React, { useState } from "react";
import {
  DndContext,
  useDroppable,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define JetBrains-inspired colors
const theme = {
  background: "#2B2B2B",
  panel: "#3C3F41",
  border: "#555",
  text: "#FFFFFF",
  highlight: "#FFCC66",
  error: "#E06C75",
  accent: "#A9B7C6",
};

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

// Sortable block inside the Drop Zone
const SortableBlock = ({ block }: { block: Block }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    marginBottom: "5px",
    backgroundColor: theme.panel,
    borderRadius: "5px",
    cursor: "grab",
    color: theme.text,
    border: `1px solid ${theme.border}`,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {block.label}
    </div>
  );
};

// Drop Zone component where users can drop and reorder blocks
const DropZone = ({ droppedBlocks }: { droppedBlocks: Block[] }) => {
  const { setNodeRef } = useDroppable({ id: "dropzone" });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: "200px",
        padding: "10px",
        border: `2px dashed ${theme.highlight}`,
        backgroundColor: theme.background,
        borderRadius: "5px",
        color: theme.accent,
        position: "relative",
      }}
    >
      <SortableContext items={droppedBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        {droppedBlocks.length === 0 ? (
          <p style={{ textAlign: "center", color: theme.accent }}>Drop Blocks Here</p>
        ) : (
          droppedBlocks.map((block) => <SortableBlock key={block.id} block={block} />)
        )}
      </SortableContext>
    </div>
  );
};

// Trash Bin component
const TrashBin = () => {
  const { setNodeRef } = useDroppable({ id: "trash-bin" });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "150px",
        height: "150px",
        backgroundColor: theme.error,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: `2px solid ${theme.border}`,
        marginLeft: "20px",
      }}
    >
      🗑️ Trash Bin
    </div>
  );
};

// Main App component
const App = () => {
  const [droppedBlocks, setDroppedBlocks] = useState<Block[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDrop = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block) {
      const newBlock = { ...block, id: `${block.id}-${Date.now()}` }; // Unique ID
      setDroppedBlocks((prev) => [...prev, newBlock]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (over.id === "trash-bin") {
      // Block dragged into the trash bin, delete it
      setDroppedBlocks((prev) => prev.filter((block) => block.id !== active.id));
    } else if (droppedBlocks.some((block) => block.id === active.id)) {
      // Reorder blocks inside the Drop Zone
      const oldIndex = droppedBlocks.findIndex((block) => block.id === active.id);
      const newIndex = droppedBlocks.findIndex((block) => block.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setDroppedBlocks((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, height: "100vh", color: theme.text, padding: "20px" }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <h1 style={{ textAlign: "center", color: theme.highlight }}>Drag and Drop Coding</h1>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
          {/* Blocks that can be dragged */}
          <div
            style={{
              backgroundColor: theme.panel,
              padding: "10px",
              borderRadius: "5px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3 style={{ textAlign: "center", color: theme.accent }}>Available Blocks</h3>
            {blocks.map((block) => (
              <div
                key={block.id}
                onMouseDown={() => handleDrop(block.id)}
                style={{
                  padding: "10px",
                  margin: "5px",
                  backgroundColor: theme.panel,
                  color: theme.text,
                  cursor: "grab",
                  borderRadius: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: `1px solid ${theme.border}`,
                }}
              >
                {block.label}
              </div>
            ))}
          </div>

          {/* Drop Zone (Sortable) */}
          <DropZone droppedBlocks={droppedBlocks} />

          {/* Trash Bin */}
          <TrashBin />
        </div>

        {/* Code Output */}
        <pre
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: theme.panel,
            borderRadius: "5px",
            border: `1px solid ${theme.border}`,
            color: theme.highlight,
            fontSize: "16px",
            whiteSpace: "pre-wrap",
          }}
        >
          {droppedBlocks.map((block) => block.code).join("\n")}
        </pre>
      </DndContext>
    </div>
  );
};

export default App;
