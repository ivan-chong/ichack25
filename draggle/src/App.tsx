import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./components/SortableItem";
type Item = {
  key: string;
  id: number;
  value: string;
};

export default function App() {
  const ogList = ["print hello world", "testing 123", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "16"]
  const [items, setItems] = useState<Item[]>([]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
  };

  useEffect(() => {
    const itemsWithIds = ogList.map((value, index) => ({
      id: index,
      key: `${index}-${value}`, // Unique ID by combining index and value
      value: value,
    }));
    setItems(shuffleArray(itemsWithIds)); // Shuffle and set the new state
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
  
    // Only proceed if the item has actually been moved
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
  
      // Create a copy of the items array
      const newItems = [...items];
  
      // Remove the dragged item from its old position
      const [movedItem] = newItems.splice(oldIndex, 1);
  
      // Insert the item into the new position
      newItems.splice(newIndex, 0, movedItem);
  
      // Update the state with the new items order
      setItems(newItems);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="bg-white p-4 rounded-lg shadow-lg w-256 flex flex-col max-h-240 overflow-y-auto">
            {items.map((item, index) => (
              <SortableItem id={item.id} key={item.key} value={item.value}/>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
