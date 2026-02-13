'use client';

import { useStore } from '@nanostores/react';
import {
  $friendlyOutput,
  $output,
  $showFriendly,
} from '../../stores/course-store';
import { MarkdownRenderer } from '@progy/ui';
import { ScrollArea } from '@progy/ui/scroll-area';
import { TabsContent } from '@progy/ui/tabs';

// Helper to render raw output lines with colors
const renderRawLine = (line: string, i: number) => {
  let color = 'text-zinc-400';
  if (line.includes('error') || line.includes('failed')) color = 'text-red-400';
  else if (line.includes('warning')) color = 'text-amber-400';
  else if (
    line.includes('passed') ||
    line.includes('ok') ||
    line.includes('Great job')
  )
    color = 'text-emerald-400';
  else if (line.includes('help:') || line.includes('note:'))
    color = 'text-blue-400';

  return (
    <div key={i} className={color}>
      {line}
    </div>
  );
};

export function OutputTab() {
  const output = useStore($output);
  const friendlyOutput = useStore($friendlyOutput);
  const showFriendly = useStore($showFriendly);

  return (
    <TabsContent
      value="output"
      className="flex-1 min-h-0 m-0 outline-none bg-zinc-950"
    >
      <ScrollArea className="w-full h-full">
        <div className="p-6 lg:p-8 font-mono text-sm">
          {!output && (
            <pre className="text-zinc-600 italic text-xs">
              {'// Run tests to see output...'}
            </pre>
          )}

          {output && showFriendly && friendlyOutput ? (
            <div className="max-w-3xl">
              <MarkdownRenderer content={friendlyOutput} />
            </div>
          ) : (
            output && (
              <pre className="leading-relaxed whitespace-pre-wrap break-all text-xs">
                {output.split('\n').map(renderRawLine)}
              </pre>
            )
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
