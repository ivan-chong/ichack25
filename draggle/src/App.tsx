import React, { useState, useEffect } from "react";
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
  success: "#98C379",
};

// Define block structure
interface Block {
  id: string;
  code: string;
}

interface Challenge {
  challengeId: string;
  task: string;
  codeLines: Block[];
}

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
      {block.code}
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

// Modified TrashBin component with Check Code functionality
const TrashBin = ({ onCheckCode }: { onCheckCode: () => void }) => {
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

      <button
        onClick={onCheckCode}
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
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch initial challenge
  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: 'for loop'  // You can make this configurable
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate challenge');
      }

      const data = await response.json();
      setChallenge({
        challengeId: data.challenge_id,
        task: data.task,
        codeLines: data.code_lines.map((line: any) => ({
          id: line.id,
          code: line.code,
        })),
      });
      setDroppedBlocks([]);
      setFeedback(null);
    } catch (error) {
      console.error('Error generating challenge:', error);
      setFeedback({
        message: 'Failed to generate challenge. Please try again.',
        success: false,
      });
    }
  };

  const checkCode = async () => {
    if (!challenge) return;

    try {
      const response = await fetch('http://localhost:8000/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: challenge.challengeId,
          code_lines: droppedBlocks.map(block => ({
            id: block.id,
            code: block.code,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check code');
      }

      const data = await response.json();
      setFeedback({
        message: data.message,
        success: data.success,
      });
    } catch (error) {
      console.error('Error checking code:', error);
      setFeedback({
        message: 'Failed to check code. Please try again.',
        success: false,
      });
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

  const handleDrop = (block: Block) => {
    if (!droppedBlocks.some(b => b.id === block.id)) {
      setDroppedBlocks((prev) => [...prev, block]);
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, minHeight: "100vh", color: theme.text, padding: "20px" }}>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <h1 style={{ textAlign: "center", color: theme.highlight, fontSize: "22px", marginBottom: "15px" }}>
          Code Block Challenge
        </h1>

        {challenge && (
          <div style={{ 
            backgroundColor: theme.panel, 
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            border: `2px solid ${theme.border}`
          }}>
            <h2 style={{ color: theme.highlight, marginBottom: "10px", fontSize: "18px" }}>Task:</h2>
            <p style={{ color: theme.text }}>{challenge.task}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "30px", alignItems: "start" }}>
          {/* Available Blocks */}
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
            {challenge?.codeLines.map((block) => (
              <div
                key={block.id}
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
                onMouseDown={() => handleDrop(block)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.blockHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.panel)}
              >
                {block.code}
              </div>
            ))}
          </div>

          {/* Drop Zone */}
          <DropZone droppedBlocks={droppedBlocks} />

          {/* Trash Bin */}
          <TrashBin onCheckCode={checkCode} />
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: theme.panel,
              borderRadius: "8px",
              border: `2px solid ${feedback.success ? theme.success : theme.error}`,
              color: feedback.success ? theme.success : theme.error,
            }}
          >
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{feedback.message}</pre>
          </div>
        )}

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
          <h3 style={{ color: theme.accent, marginBottom: "10px" }}>Current Code:</h3>
          {droppedBlocks.map((block) => block.code).join("\n")}
        </div>

        {/* New Challenge Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={generateChallenge}
            style={{
              backgroundColor: theme.accent,
              border: "none",
              padding: "12px 24px",
              borderRadius: "5px",
              color: theme.background,
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#BEC9D4")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
          >
            Generate New Challenge
          </button>
        </div>
      </DndContext>
    </div>
  );
};

export default App;
