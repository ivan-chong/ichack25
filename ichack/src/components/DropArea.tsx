// src/components/DropArea.tsx
import { useDrop } from 'react-dnd';
import { useState } from 'react';
import '../styles.css';

interface DropAreaProps {
  blocks: string[];
  setBlocks: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropArea: React.FC<DropAreaProps> = ({ blocks, setBlocks }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // React DnD hook for handling drop logic
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BLOCK',
    drop: (item: { id: number }) => {
      if (hoveredIndex !== null && item.id !== hoveredIndex) {
        // Remove the block from its original position
        const draggedBlock = blocks[item.id];
        const newBlocks = [...blocks];
        newBlocks.splice(item.id, 1);  // Remove the block

        // Insert the block at the hovered position
        newBlocks.splice(hoveredIndex, 0, draggedBlock);
        setBlocks(newBlocks);  // Update the state with new blocks order
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);  // Set the index when hovering over a segment
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);  // Reset the index when the mouse leaves the segment
  };

  return (
    <div
      ref={drop}
      className={`drop-area-container ${isOver ? 'drop-area-hover' : ''}`}
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          className={`drop-area-segment ${
            hoveredIndex === index ? 'drop-area-hover-segment' : ''
          }`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          {block}
        </div>
      ))}
    </div>
  );
};

export default DropArea;
