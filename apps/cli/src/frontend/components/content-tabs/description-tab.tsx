'use client';

import { useStore } from '@nanostores/react';
import { Book, Loader2 } from 'lucide-react';
import { $description, $descriptionQuery } from '../../stores/course-store';
import { MarkdownRenderer } from '@progy/ui';
import { ScrollArea } from '@progy/ui/scroll-area';
import { TabsContent } from '@progy/ui/tabs';

export function DescriptionTab() {
  const description = useStore($description);
  const descriptionQuery = useStore($descriptionQuery);

  return (
    <TabsContent
      value="description"
      className="flex-1 min-h-0 m-0 outline-none"
    >
      <ScrollArea className="h-full">
        <div className="p-6 lg:p-8 w-full">
          {descriptionQuery.loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-600 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-rust" />
              <p className="text-xs font-medium">Loading instructions...</p>
            </div>
          ) : description ? (
            <MarkdownRenderer content={description} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-600 gap-3">
              <Book className="w-8 h-8 text-zinc-800" />
              <p className="text-xs font-medium">
                Select an exercise to view content
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
