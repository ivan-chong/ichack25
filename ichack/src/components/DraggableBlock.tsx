// src/components/DraggableBlock.tsx
import { useDrag } from 'react-dnd';
import '../styles.css';

interface DraggableBlockProps {
  code: string;
  id: number;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ code, id }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BLOCK',
    item: { id },  // Pass the block's ID when it is dragged
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-block ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}  // Add opacity change on drag
    >
      <pre>{code}</pre>
    </div>
  );
};

export default DraggableBlock;
