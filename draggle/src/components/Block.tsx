// src/components/Block.tsx
import React from "react";

type BlockProps = {
  content: string;
};

function Block({ content }: BlockProps) {
  return (
    <div className="bg-green-500 text-white px-3 py-2 rounded-md shadow-md cursor-default">
      {content}
    </div>
  );
}

export default Block;
