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

  const [items, setItems] = useState<Item[]>([]);
  const [correctItems, setCorrectItems] = useState<boolean[]>([]);
  const [ideValues, setIdeValues] = useState<string[]>([]);
  const [highlightedItems, setHighlightedItems] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(true);
  const [topic, setTopic] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedResponse>({challenge_id: "", task: "", code_lines: []});

  useEffect(() => {
    if (generatedData.code_lines.length > 0) {
      const itemsWithIds = generatedData.code_lines.map((value, index) => ({
        id: index,
        key: `${index}-${value}`,
        value: value,
      }));
      setItems(itemsWithIds);
      setIsTimerRunning(true); // Start the timer when new data is loaded
    }
  }, [generatedData.code_lines]);

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
    }
  };

  const highlightCorrectItems = (newCorrectItems) => {
    const updatedHighlightedItems = newCorrectItems.map(isCorrect => isCorrect ? true : false);
    setHighlightedItems(updatedHighlightedItems);

    setTimeout(() => {
      setHighlightedItems(new Array(generatedData.code_lines.length).fill(false));
    }, 1000);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code_lines: items.map(item => item.value), challenge_id: generatedData.challenge_id }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to check the response");
      }
  
      const result = await response.json();
      if (!Array.isArray(result.code_lines)) {
        throw new Error("Invalid response format from API");
      }
  
      // Update IDE values with correct lines immediately
      const newIdeValues = [...ideValues];
      result.code_lines.forEach((isCorrect, index) => {
        if (isCorrect === 1) {
          newIdeValues[index] = items[index].value;
        }
      });
      setIdeValues(newIdeValues);
  
      // Show highlight for a second
      setHighlightedItems(result.code_lines.map(val => val === 1));
      setTimeout(() => {
        setHighlightedItems(new Array(generatedData.code_lines.length).fill(false));
      }, 1000);
  
      // If all items are correct, stop timer and delay popup
      if (result.code_lines.every(val => val === 1)) {
        setIsTimerRunning(false);
  
        // Show congratulations message and delay the popup by 3 seconds
        setTopic(`Congratulations! You completed the challenge in ${timer} seconds.`);
        
        setTimeout(() => {
          setShowPopup(true);
          setTimer(0); // Reset timer
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
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

        // If you need to update state, do it here
        setGeneratedData({ challenge_id, task, code_lines });
        setIdeValues(new Array(generatedData.code_lines.length).fill(""))
        setHighlightedItems(new Array(generatedData.code_lines.length).fill(false))
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
            {/* Show the congratulatory message if present */}
            {topic.startsWith("Congratulations") && (
              <p className="text-green-600 font-bold mb-4">{topic}</p>
            )}

            <h2 className="text-lg font-bold mb-4">Enter a Topic</h2>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded"
              placeholder="Enter a topic"
              value={topic.startsWith("Congratulations") ? "" : topic}
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

      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg font-bold">Time: {timer} seconds</p>
      </div>

      <div className={`w-full max-w-full flex flex-col items-center ${showPopup ? 'blur-sm' : ''}`}>
        {/* Display Task */}
        {generatedData.task && (
          <div className="bg-white p-4 rounded-lg shadow-lg mb-4 text-center w-full max-w-3xl">
            <h2 className="text-lg font-bold">Task:</h2>
            <p className="text-gray-700">{generatedData.task}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 w-full max-w-full">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg col-span-1 flex flex-col overflow-y-auto h-full">
            {generatedData.code_lines.map((line, index) => (
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
