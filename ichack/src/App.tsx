// src/App.tsx
import React, { useState } from 'react';
import DraggableBlock from './components/DraggableBlock';
import DropArea from './components/DropArea';
import './styles.css';

type Block = string;

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    'const x = 10;',
    'console.log(x);',
    'const y = 20;',
    'console.log(y);',
  ]);

  return (
    <div className="app-container">
      <div className="left-panel">
        <h3>Draggable Code Blocks</h3>
        {blocks.map((code, index) => (
          <DraggableBlock key={index} id={index} code={code} />
        ))}
      </div>
      <DropArea blocks={blocks} setBlocks={setBlocks} />
    </div>
  );
};

export default App;
