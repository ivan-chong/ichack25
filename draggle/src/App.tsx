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

type GeneratedResponse = {
  challenge_id: string;
  task: string;
  code_lines: string[];
}

export default function App() {
  const ogList = [
    "function greet(name) {",
    "    console.log(`Hello, ${name}!`);",
    "}",
    "function add(a, b) {",
    "    return a + b;",
  ];

  const [items, setItems] = useState<Item[]>([]);
  const [correctItems, setCorrectItems] = useState<boolean[]>([]);
  const [ideValues, setIdeValues] = useState<string[]>(new Array(ogList.length).fill(""));
  const [highlightedItems, setHighlightedItems] = useState<boolean[]>(new Array(ogList.length).fill(false));
  const [showPopup, setShowPopup] = useState(true);
  const [topic, setTopic] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedResponse>();


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
    setIsTimerRunning(true); // Start the timer when the page loads
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

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

    highlightCorrectItems(newCorrectItems);

    // Stop the timer if all items are correct
    if (newCorrectItems.every(isCorrect => isCorrect)) {
      setIsTimerRunning(false);
    }
  };

  const handleTopicSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept: topic }), // Use topic state
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
  
        // Destructure the response to access individual fields
        const { challenge_id, task, code_lines } = data;
  
        console.log('Challenge ID:', challenge_id);
        console.log('Task:', task);
        console.log('Code Lines:', code_lines);
  
        // If you need to update state, do it here
        setGeneratedData({ challenge_id, task, code_lines }); 
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    } finally {
      setShowPopup(false);
    }
  };
  
  

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-200">
      {showPopup && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-bold mb-4">Enter a Topic</h2>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              onClick={handleTopicSubmit}
              className="mt-4 py-2 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Timer Container */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg font-bold">Time: {timer} seconds</p>
      </div>

      <div className={`w-full max-w-full flex flex-col items-center ${showPopup ? 'blur-sm' : ''}`}>
        <div className="grid grid-cols-2 gap-8 w-full max-w-full">
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

          <div className="col-span-1 flex flex-col items-start h-full">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="bg-white p-4 rounded-lg shadow-lg w-full flex flex-col overflow-y-auto max-h-[750px] mb-4">
                  {items.map((item, index) => (
                    <SortableItem
                      id={item.id}
                      key={item.key}
                      value={item.value}
                      isHighlighted={highlightedItems[index]}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleSubmit} className="py-2 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}