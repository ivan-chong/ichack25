import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SortableItem from "./components/SortableItem";

type Item = {
  key: string;
  id: number;
  value: string;
};

export default function App() {
  const ogList = [
    "print(\"hello world\")", "for i in range(0,10):", "\tprint(\"i\")"
  ];

  const [items, setItems] = useState<Item[]>([]);
  const [correctItems, setCorrectItems] = useState<boolean[]>([]);
  const [ideValues, setIdeValues] = useState<string[]>(new Array(ogList.length).fill(""));
  const [highlightedItems, setHighlightedItems] = useState<boolean[]>(new Array(ogList.length).fill(false));

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    const itemsWithIds = ogList.map((value, index) => ({
      id: index,
      key: `${index}-${value}`,
      value: value,
    }));
    setItems(shuffleArray(itemsWithIds));
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      setItems(newItems);

      const newCorrectItems = newItems.map((item, index) => item.value === ogList[index]);
      setCorrectItems(newCorrectItems);
    }
  };

  const highlightCorrectItems = (newCorrectItems) => {
    const updatedHighlightedItems = newCorrectItems.map(isCorrect => isCorrect ? true : false);
    setHighlightedItems(updatedHighlightedItems);

    // Reset highlighting after 2 seconds
    setTimeout(() => {
      setHighlightedItems(new Array(ogList.length).fill(false));
    }, 1000);
  };

  const handleSubmit = () => {
    const newCorrectItems = items.map((item, index) => item.value === ogList[index]);
    setCorrectItems(newCorrectItems);

    const newIdeValues = [...ideValues];
    newCorrectItems.forEach((isCorrect, index) => {
      if (isCorrect) {
        newIdeValues[index] = items[index].value;
      }
    });
    setIdeValues(newIdeValues);

    highlightCorrectItems(newCorrectItems); // Only highlight when submit is clicked
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-full flex flex-col items-center">
        <div className="grid grid-cols-2 gap-8 w-full max-w-full">
          {/* Fixed height for both the left IDE box and the right draggable box */}
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg col-span-1 flex flex-col overflow-y-auto h-full">
            {ogList.map((line, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <span className="text-gray-400">{index + 1}</span>
                <SyntaxHighlighter language="python" style={dracula} customStyle={{ width: '100%', borderRadius: '5px', padding: '10px' }}>
                  {ideValues[index] || ""}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>

          {/* Right draggable box with scrollable content */}
          <div className="col-span-1 flex flex-col items-start h-full">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="bg-white p-4 rounded-lg shadow-lg w-full flex flex-col overflow-y-auto mb-4 h-full">
                  {items.map((item, index) => (
                    <SortableItem
                      id={item.id}
                      key={item.key}
                      value={item.value}
                      isHighlighted={highlightedItems[index]} // Pass the highlighted state
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Centered submit button below both boxes */}
        <div className="mt-4">
          <button onClick={handleSubmit} className="py-2 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
