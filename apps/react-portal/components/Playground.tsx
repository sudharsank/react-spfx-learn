'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const DEFAULT_CODE = `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h2>Counter: {count}</h2>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        Increment
      </button>
    </div>
  );
}`;

const PREVIEW_TEMPLATE = (code: string) => `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`;

export function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [preview, setPreview] = useState(PREVIEW_TEMPLATE(DEFAULT_CODE));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreview(PREVIEW_TEMPLATE(code));
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [code]);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="flex-1 border-r border-gray-200">
        <div className="bg-gray-800 text-gray-300 text-xs px-4 py-2 font-mono flex justify-between items-center">
          <span>App.jsx</span>
          <span className="text-gray-500">Live preview updates after you stop typing</span>
        </div>
        <Editor
          height="calc(100% - 32px)"
          defaultLanguage="javascript"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
        />
      </div>
      <div className="flex-1 bg-white">
        <div className="bg-gray-100 text-gray-500 text-xs px-4 py-2 font-mono">Preview</div>
        <iframe
          title="React Playground Preview"
          srcDoc={preview}
          className="w-full h-[calc(100%-32px)] border-0"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
