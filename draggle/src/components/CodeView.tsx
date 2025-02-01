// src/components/CodeView.tsx
import React from "react";

type CodeViewProps = {
  code: string;
};

function CodeView({ code }: CodeViewProps) {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-md mt-2">
      <h2 className="text-lg font-bold mb-2">Generated Code:</h2>
      <pre className="whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

export default CodeView;
