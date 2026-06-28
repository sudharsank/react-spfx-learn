'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useStudioStorage } from '@repo/adaptive';

const DEFAULT_FILES = [
  {
    name: 'HelloWorldWebPart.ts',
    content: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import HelloWorld from './components/HelloWorld';

export default class HelloWorldWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(HelloWorld, {
      description: this.properties.description,
      context: this.context,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
  },
  {
    name: 'components/HelloWorld.tsx',
    content: `import * as React from 'react';

interface IHelloWorldProps {
  description: string;
}

const HelloWorld: React.FC<IHelloWorldProps> = ({ description }) => {
  return (
    <div>
      <h2>Hello SPFx!</h2>
      <p>{description}</p>
    </div>
  );
};

export default HelloWorld;`,
  },
];

export default function StudioPage() {
  const { files: savedFiles, setFiles: persistFiles, loading } = useStudioStorage('spfx');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('HelloWorldWebPart.ts');
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

  const handleSave = () => persistFiles(files);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">Loading studio…</div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-white/10">
        <span className="text-white/70 text-sm font-semibold mr-4">SPFx Studio</span>
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
            {f.name.split('/').pop()}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded text-xs bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor — full width, no preview for SPFx */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full">
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={activeContent}
            onChange={handleChange}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
            }}
          />
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 bg-[#13131f] border-t border-white/10 text-white/40 text-xs">
        SPFx code cannot run in the browser — use this studio for practice. Run locally with <code className="font-mono">heft start</code>.
      </div>
    </div>
  );
}
