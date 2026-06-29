'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useStudioStorage } from '@repo/adaptive';
import { AuthGuard } from '@repo/auth';

const DEFAULT_FILES = [
  {
    name: 'App.tsx',
    content: `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{fontFamily:'system-ui', padding:'32px', textAlign:'center'}}>
      <h1>React Studio</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}`,
  },
  {
    name: 'styles.css',
    content: `body { margin: 0; background: #f8fafc; }`,
  },
];

function buildSrcdoc(files: { name: string; content: string }[]): string {
  const app = files.find((f) => f.name === 'App.tsx')?.content ?? '';
  const css = files.find((f) => f.name === 'styles.css')?.content ?? '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}<\/style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel">
${app}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
<\/script>
</body>
</html>`;
}

export default function StudioPage() {
  const { files: savedFiles, setFiles: persistFiles, loading } = useStudioStorage('react');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [preview, setPreview] = useState('');
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!loading && !bootstrapped.current) {
      bootstrapped.current = true;
      if (savedFiles.length > 0) setFiles(savedFiles);
    }
  }, [loading, savedFiles]);

  const activeContent = files.find((f) => f.name === activeFile)?.content ?? '';

  const handleChange = (value: string | undefined) => {
    const updated = files.map((f) =>
      f.name === activeFile ? { ...f, content: value ?? '' } : f
    );
    setFiles(updated);
  };

  const handleRun = () => {
    setPreview(buildSrcdoc(files));
    persistFiles(files);
  };

  const handleSave = () => persistFiles(files);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">Loading studio…</div>
    );
  }

  return (
    <AuthGuard>
    <div className="flex flex-col h-screen bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-white/10">
        <span className="text-white/70 text-sm font-semibold mr-4">React Studio</span>
        {files.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFile(f.name)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeFile === f.name
                ? 'bg-[var(--color-brand)] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {f.name}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded text-xs bg-white/10 text-white/70 hover:bg-white/20"
          >
            Save
          </button>
          <button
            onClick={handleRun}
            className="px-3 py-1 rounded text-xs bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-white/10">
          <Editor
            height="100%"
            language={activeFile.endsWith('.css') ? 'css' : 'typescript'}
            theme="vs-dark"
            value={activeContent}
            onChange={handleChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
            }}
          />
        </div>
        <div className="w-1/2 bg-white">
          {preview ? (
            <iframe
              sandbox="allow-scripts"
              srcDoc={preview}
              className="w-full h-full border-none"
              title="Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Press <kbd className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">▶ Run</kbd> to see your output
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
