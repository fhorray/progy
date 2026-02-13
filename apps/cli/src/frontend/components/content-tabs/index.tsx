'use client';

import { useStore } from '@nanostores/react';
import { Book, Brain, Loader2, Sparkles, Terminal } from 'lucide-react';
import {
  $aiResponse,
  $isRunning,
  $output,
  $selectedExercise,
  $showFriendly,
  setShowFriendly,
} from '../../stores/course-store';
import { Label } from '@progy/ui/label';
import { Switch } from '@progy/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@progy/ui/tabs';
import { $activeContentTab, setActiveContentTab } from '@/stores/ui-store';
import { DescriptionTab } from './description-tab';
import { OutputTab } from './output-tab';
import { QuizTab } from './quiz-tab';
import { AIMentorTab } from './ai-mentor-tab';
import { $hasUnread } from '@/stores/notification-store';

export type ContentTab = 'description' | 'output' | 'quiz' | 'ai';

export function ContentTabs() {
  const activeTab = useStore($activeContentTab);
  const output = useStore($output);
  const showFriendly = useStore($showFriendly);
  const aiResponse = useStore($aiResponse);
  const selectedExercise = useStore($selectedExercise);
  const isRunning = useStore($isRunning);
  const hasUnread = useStore($hasUnread);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveContentTab(v as ContentTab)}
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
    >
      {/* Tab Bar */}
      <div className="flex-none px-4 lg:px-6 py-0 border-b border-zinc-800/60 bg-zinc-950 flex items-center justify-between">
        <TabsList className="bg-transparent p-0 h-10 gap-0 rounded-none border-none">
          <TabsTrigger
            value="description"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
          >
            <Book className="w-3.5 h-3.5 mr-1.5" /> Description
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
          >
            <Terminal className="w-3.5 h-3.5 mr-1.5" /> Output
            {isRunning && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-rust animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none relative"
          >
            <Sparkles
              className={`w-3.5 h-3.5 mr-1.5 ${aiResponse ? 'text-rust' : ''}`}
            />
            AI Mentor
            {hasUnread && (
              <span className="absolute top-2 right-1 w-1.5 h-1.5 bg-rust rounded-full" />
            )}
          </TabsTrigger>
          {selectedExercise?.hasQuiz && (
            <TabsTrigger
              value="quiz"
              className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" /> Quiz
            </TabsTrigger>
          )}
        </TabsList>

        {/* Output Mode Switch */}
        {activeTab === 'output' && output && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
              <Label
                htmlFor="mode-switch-content"
                className="text-zinc-500 text-[10px] font-semibold uppercase tracking-tight cursor-pointer"
              >
                Raw
              </Label>
              <Switch
                id="mode-switch-content"
                checked={showFriendly}
                onCheckedChange={setShowFriendly}
                className="scale-75"
              />
              <Label
                htmlFor="mode-switch-content"
                className={`text-[10px] font-semibold uppercase tracking-tight cursor-pointer ${showFriendly ? 'text-rust' : 'text-zinc-500'}`}
              >
                Friendly
              </Label>
            </div>
            {isRunning && (
              <span className="text-[10px] font-bold text-rust animate-pulse flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Compiling...
              </span>
            )}
          </div>
        )}
      </div>

      <DescriptionTab />
      <OutputTab />
      <QuizTab />
      <AIMentorTab />
    </Tabs>
  );
}
