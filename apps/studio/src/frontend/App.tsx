import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Loader2 } from 'lucide-react';

import { loadFileTree, $fileTree } from './stores/editor-store';
import { EditorLayout } from './components/editor/EditorLayout';

export function App() {
  const [loading, setLoading] = useState(true);
  const fileTree = useStore($fileTree);

  useEffect(() => {
    loadFileTree('.').finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading course structure...</p>
        </div>
      </div>
    );
  }

  return <EditorLayout />;
}
