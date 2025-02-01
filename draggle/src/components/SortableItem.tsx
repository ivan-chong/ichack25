import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, key, value, isHighlighted }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Replace tabs with 4 spaces
  const formattedValue = value.replace(/\t/g, '    ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 my-2 rounded cursor-grab font-mono whitespace-pre-wrap ${isHighlighted ? 'bg-green-500' : 'bg-gray-500'} text-white`}
    >
      {formattedValue}
    </div>
  );
}
