'use client';

import { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export default function CodeEditor({ value, onChange, language, onLanguageChange }: CodeEditorProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Code Editor</h3>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
        </select>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 bg-gray-900 border border-gray-600 rounded p-4 font-mono text-sm resize-none"
        placeholder="Write your solution here..."
        spellCheck={false}
      />
    </div>
  );
}