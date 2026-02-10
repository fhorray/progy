import React, { useState, useEffect } from 'react';
import { Terminal, X, Play, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RunOutputPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string | null;
}

export function RunOutputPanel({ isOpen, onClose, activePath }: RunOutputPanelProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Clear output when switching files
  useEffect(() => {
    setOutput('');
  }, [activePath]);

  if (!isOpen) return null;

  const handleRun = async () => {
    if (!activePath) return;
    setIsRunning(true);
    setOutput('');

    // Derive ID and entryPoint from activePath
    // activePath example: "content/01_intro/01_hello/main.rs"
    // ID should be: "01_intro/01_hello"
    // EntryPoint: "main.rs"

    // Check if it's in content/
    const contentIndex = activePath.indexOf('content/');
    if (contentIndex === -1) {
      setOutput('Error: Can only run files inside the content directory.');
      setIsRunning(false);
      return;
    }

    const relativePath = activePath.substring(contentIndex + 8); // remove "content/"
    const parts = relativePath.split('/');

    // Minimum parts: module/exercise/file
    if (parts.length < 3) {
       setOutput('Error: Invalid exercise file path structure.');
       setIsRunning(false);
       return;
    }

    const id = `${parts[0]}/${parts[1]}`;
    const entryPoint = parts.slice(2).join('/');
    const exerciseName = parts[1];

    try {
      const res = await fetch('/exercises/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            exerciseName,
            id,
            entryPoint
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOutput(data.output || data.friendlyOutput || 'Success (No output)');
      } else {
        setOutput(`Error:\n${data.output || data.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      setOutput(`Failed to run: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      className={`border-t border-zinc-800 bg-zinc-950 flex flex-col transition-all duration-300 ${
        isExpanded ? 'h-[80vh]' : 'h-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wider">
            <Terminal size={12} />
            Output
          </div>
          {activePath && (
             <span className="text-zinc-600 text-xs font-mono">{activePath}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRun}
            disabled={isRunning || !activePath}
            className="h-6 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            <span className="text-[10px] font-bold uppercase">Run</span>
          </Button>
          <div className="w-px h-3 bg-zinc-800 mx-1" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative font-mono text-sm">
        <ScrollArea className="h-full w-full">
            <div className="p-4 whitespace-pre-wrap text-zinc-300 selection:bg-zinc-700 selection:text-white">
                {output || <span className="text-zinc-600 italic">No output yet. Click "Run" to execute.</span>}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
