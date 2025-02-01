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
  border: "#4B4B4B",
  text: "#FFFFFF",
  highlight: "#FFC66D",
  error: "#E06C75",
  accent: "#A9B7C6",
  blockHover: "#4E5254",
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
    marginBottom: "8px",
    backgroundColor: theme.panel,
    borderRadius: "6px",
    cursor: "grab",
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    fontWeight: "bold",
    fontSize: "14px",
    userSelect: "none",
    transition: "background 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.blockHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.panel)}
    >
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
        minHeight: "250px",
        padding: "12px",
        border: `2px dashed ${theme.highlight}`,
        backgroundColor: theme.background,
        borderRadius: "8px",
        color: theme.accent,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <SortableContext items={droppedBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        {droppedBlocks.length === 0 ? (
          <p style={{ textAlign: "center", color: theme.accent, fontSize: "14px" }}>Drop Blocks Here</p>
        ) : (
          droppedBlocks.map((block) => <SortableBlock key={block.id} block={block} />)
        )}
      </SortableContext>
    </div>
  );
};

// Trash Bin component
// Trash Bin component
const TrashBin = () => {
  const { setNodeRef } = useDroppable({ id: "trash-bin" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        ref={setNodeRef}
        style={{
          width: "160px",
          height: "160px",
          backgroundColor: theme.error,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold",
          border: `2px solid ${theme.border}`,
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.4)",
          transition: "background 0.2s ease",
          cursor: "pointer",
          marginBottom: "10px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D64F5A")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.error)}
      >
        🗑️ Trash Bin
      </div>

      {/* Check Code Button */}
      <button
        style={{
          backgroundColor: theme.highlight,
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFB347")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.highlight)}
      >
        Check Code
      </button>
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
      setDroppedBlocks((prev) => prev.filter((block) => block.id !== active.id));
    } else if (droppedBlocks.some((block) => block.id === active.id)) {
      const oldIndex = droppedBlocks.findIndex((block) => block.id === active.id);
      const newIndex = droppedBlocks.findIndex((block) => block.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setDroppedBlocks((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, height: "100vh", color: theme.text, padding: "20px" }}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <h1 style={{ textAlign: "center", color: theme.highlight, fontSize: "22px", marginBottom: "15px" }}>
          JetBrains-Style Drag & Drop Coding
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "30px", alignItems: "start" }}>
          {/* Blocks that can be dragged */}
          <div
            style={{
              backgroundColor: theme.panel,
              padding: "12px",
              borderRadius: "8px",
              border: `2px solid ${theme.border}`,
            }}
          >
            <h3 style={{ textAlign: "center", color: theme.accent, fontSize: "16px", marginBottom: "10px" }}>
              Available Blocks
            </h3>
            {blocks.map((block) => (
              <div
                key={block.id}
                onMouseDown={() => handleDrop(block.id)}
                style={{
                  padding: "12px",
                  margin: "6px 0",
                  backgroundColor: theme.panel,
                  color: theme.text,
                  cursor: "grab",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: `1px solid ${theme.border}`,
                  transition: "background 0.2s ease",
                }}
              >
                {block.label}
              </div>
            ))}
          </div>

          {/* Drop Zone */}
          <DropZone droppedBlocks={droppedBlocks} />

          {/* Trash Bin */}
          <TrashBin />
        </div>

        {/* Code Output */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: theme.panel,
            borderRadius: "8px",
            border: `2px solid ${theme.border}`,
            color: theme.highlight,
            fontSize: "16px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ color: theme.accent, marginBottom: "10px" }}>Generated Code:</h3>
          {droppedBlocks.map((block) => block.code).join("\n")}
        </div>
      </DndContext>
    </div>
  );
};

export default App;
