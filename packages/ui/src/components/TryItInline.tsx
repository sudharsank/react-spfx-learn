'use client';

import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

export interface TryItInlineProps {
  defaultCode: string;
  height?: number;
}

const PREVIEW_WRAPPER = (code: string) => `<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>body{margin:8px;font-family:system-ui,sans-serif;font-size:14px}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const rootEl = document.getElementById('root');
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(rootEl).render(React.createElement(App));
    }
  <\/script>
</body>
</html>`;

export function TryItInline({ defaultCode, height = 200 }: TryItInlineProps) {
  const [code, setCode] = useState(defaultCode);
  const [preview, setPreview] = useState(PREVIEW_WRAPPER(defaultCode));
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    setPreview(PREVIEW_WRAPPER(code));
    setTimeout(() => setRunning(false), 300);
  }, [code]);

  return (
    <div className="my-6 rounded-[var(--radius-card)] border-2 border-[var(--color-brand)] overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-300 font-mono">Try It</span>
        <button
          onClick={run}
          disabled={running}
          className="text-xs px-3 py-1 bg-[var(--color-accent)] text-white rounded-full hover:opacity-90 disabled:opacity-50"
        >
          {running ? '⟳ Running…' : '▶ Run'}
        </button>
      </div>
      <div className="flex" style={{ height }}>
        <div className="w-1/2 border-r border-gray-800">
          <Editor
            height={height}
            defaultLanguage="javascript"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'off', scrollBeyondLastLine: false, wordWrap: 'on' }}
          />
        </div>
        <div className="w-1/2 bg-white">
          <iframe
            srcDoc={preview}
            title="preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            style={{ height }}
          />
        </div>
      </div>
    </div>
  );
}
