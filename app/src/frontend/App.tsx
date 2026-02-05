import React, { useState, useEffect } from 'react';
import {
  Book,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Loader2,
  Menu,
  Circle,
  CheckCircle,
  XCircle,
  FileCode,
  Terminal,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Card } from './components/ui/card';
import { Switch, Label } from './components/ui/switch';

interface Exercise {
  id: string;
  module: string;
  cleanModule: string;
  name: string;
  exerciseName: string;
  path: string;
}

type GroupedExercises = Record<string, Exercise[]>;
type TestStatus = 'pass' | 'fail' | 'idle';

export function App() {
  const [exerciseGroups, setExerciseGroups] = useState<GroupedExercises>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [output, setOutput] = useState<string>('');
  const [friendlyOutput, setFriendlyOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFriendly, setShowFriendly] = useState(true); // Default to friendly mode
  const [results, setResults] = useState<Record<string, TestStatus>>(() => {
    const saved = localStorage.getItem('rustflow_results');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('rustflow_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        if (Array.isArray(data)) {
          setError('Invalid data format');
          return;
        }
        setExerciseGroups(data);
        const modules = Object.keys(data);
        if (modules.length > 0) {
          const firstModule = modules[0] || '';
          const exercises = data[firstModule];
          if (Array.isArray(exercises) && exercises.length > 0) {
            setSelectedExercise(exercises[0]);
          }
        }
      })
      .catch((err) => setError(`Connection failed: ${String(err)}`));
  }, []);

  const runTests = async () => {
    if (!selectedExercise) return;
    setIsRunning(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/exercises/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: selectedExercise.exerciseName }),
      });
      const data = await res.json();
      setOutput(data.output);
      setFriendlyOutput(data.friendlyOutput || '');
      const status: TestStatus = data.success ? 'pass' : 'fail';
      setResults((prev) => ({ ...prev, [selectedExercise.id]: status }));
    } catch (err) {
      setOutput('Failed to run tests.');
      setResults((prev) => ({ ...prev, [selectedExercise.id]: 'fail' }));
    } finally {
      setIsRunning(false);
    }
  };

  const getAiHint = async () => {
    if (!selectedExercise) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '', error: output }),
      });
      const data = await res.json();
      setAiResponse(data.hint);
    } catch (err) {
      setAiResponse('Failed to get AI hint.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Failed to load exercises</h1>
          <p className="text-zinc-500 font-mono">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalExercises = Object.values(exerciseGroups).reduce(
    (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
    0,
  );
  const completedCount = Object.values(results).filter(
    (s) => s === 'pass',
  ).length;
  const progressPercent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-rust/30">
      {/* Navbar */}
      <nav className="border-b border-zinc-800/50 p-4 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rust blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-rust via-orange-500 to-rust-dark p-2.5 rounded-xl shadow-2xl">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">
                Rust
                <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                  Flow
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium -mt-0.5">
                Learn Rust by Doing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-zinc-900/50 rounded-full px-4 py-2 border border-zinc-800/50">
              <div className="h-1.5 w-40 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rust to-orange-400 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-zinc-300 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <Badge
              variant="outline"
              className="gap-2 py-2 px-4 border-zinc-700/50 bg-zinc-900/30"
            >
              <Book className="w-3.5 h-3.5 text-rust" />
              <span className="text-zinc-400">Progress</span>
              <span className="text-white font-mono font-bold">
                {completedCount}/{totalExercises}
              </span>
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto w-full py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 h-full flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
          <div className="p-4 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-transparent">
            <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rust" />
              Learning Path
            </h2>
            <p className="text-[10px] text-zinc-500 mt-1">
              {Object.keys(exerciseGroups).length} modules available
            </p>
          </div>
          <ScrollArea className="flex-1 px-2">
            <Accordion type="single" collapsible className="w-full space-y-1">
              {Object.keys(exerciseGroups).map((moduleKey) => {
                const exercises = exerciseGroups[moduleKey];
                if (!Array.isArray(exercises)) return null;
                const modulePassCount = exercises.filter(
                  (ex) => results[ex.id] === 'pass',
                ).length;
                const isModuleComplete = modulePassCount === exercises.length;

                return (
                  <AccordionItem
                    key={moduleKey}
                    value={moduleKey}
                    className="border-none"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-xl hover:bg-zinc-800/30 text-zinc-300 text-sm transition-colors [&[data-state=open]]:bg-zinc-800/50">
                      <div className="flex items-center gap-3 truncate">
                        {isModuleComplete ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-zinc-500">
                              {modulePassCount}
                            </span>
                          </div>
                        )}
                        <span
                          className={`font-semibold capitalize truncate ${isModuleComplete ? 'text-zinc-500' : ''}`}
                        >
                          {moduleKey.replace(/^\d+_/, '').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <Badge
                        variant={isModuleComplete ? 'outline' : 'secondary'}
                        className={`ml-auto mr-2 text-[10px] h-5 px-2 ${isModuleComplete ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : ''}`}
                      >
                        {modulePassCount}/{exercises.length}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 pt-1 space-y-1">
                      {exercises.map((ex) => {
                        const status = results[ex.id];
                        const isSelected = selectedExercise?.id === ex.id;
                        return (
                          <button
                            key={ex.id}
                            onClick={() => setSelectedExercise(ex)}
                            className={`w-full text-left pl-10 pr-3 py-2.5 text-xs rounded-lg transition-all flex items-center gap-2 group
                            ${
                              isSelected
                                ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-l-2 border-transparent'
                            }`}
                          >
                            <FileCode
                              className={`w-3 h-3 ${isSelected ? 'text-rust' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                            />
                            <span className="truncate flex-1">
                              {ex.exerciseName}
                            </span>
                            {status === 'pass' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            {status === 'fail' && (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                          </button>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </aside>

        {/* Main Panel */}
        <section className="lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          {/* Header Card */}
          <Card className="flex-none p-5 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
            {selectedExercise ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {results[selectedExercise.id] === 'pass' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mastered
                      </Badge>
                    ) : (
                      <Badge className="bg-rust/20 text-rust border-rust/30 text-[10px]">
                        Active Challenge
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {selectedExercise?.exerciseName}
                  </h2>
                  <p className="text-zinc-500 text-xs flex items-center gap-2">
                    <span className="text-zinc-600">
                      {selectedExercise?.cleanModule.replace(/_/g, ' ')}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-400 text-[10px]">
                      {selectedExercise?.path.split('rustflow').pop()}
                    </code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="lg"
                    disabled={isRunning}
                    onClick={runTests}
                    className="font-bold shadow-xl shadow-rust/20 bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90"
                  >
                    {isRunning ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4 fill-white" />
                    )}
                    {isRunning ? 'Compiling...' : 'Run Tests'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={getAiHint}
                    disabled={isAiLoading || !output}
                    className="font-semibold bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-rust" />
                    AI Hint
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Terminal className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <p>Select an exercise to start coding</p>
              </div>
            )}
          </Card>

          {/* Output Console */}
          <div className="flex-1 rounded-xl border border-zinc-800/50 bg-[#0a0a0a] flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <Terminal className="w-4 h-4 text-zinc-600" />
                <span className="text-xs font-mono text-zinc-500">
                  rustc output
                </span>
              </div>
              <div className="flex items-center gap-3">
                {output && (
                  <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full">
                    <Label htmlFor="mode-switch" className="text-zinc-500">
                      Raw
                    </Label>
                    <Switch
                      id="mode-switch"
                      checked={showFriendly}
                      onCheckedChange={setShowFriendly}
                    />
                    <Label
                      htmlFor="mode-switch"
                      className={showFriendly ? 'text-rust' : 'text-zinc-500'}
                    >
                      Friendly
                    </Label>
                  </div>
                )}
                {isRunning && (
                  <span className="text-[10px] font-bold text-rust animate-pulse">
                    Compiling...
                  </span>
                )}
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {!output && (
                  <span className="text-zinc-600 italic">
                    // Run tests to see output...
                  </span>
                )}
                {output &&
                  (showFriendly && friendlyOutput ? friendlyOutput : output)
                    .split('\n')
                    .map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.includes('error') ||
                          line.includes('❌') ||
                          line.includes('failed')
                            ? 'text-red-400'
                            : line.includes('warning')
                              ? 'text-amber-400'
                              : line.includes('passed') ||
                                  line.includes('ok') ||
                                  line.includes('✅') ||
                                  line.includes('Great job')
                                ? 'text-emerald-400'
                                : line.includes('💡') ||
                                    line.includes('🔧') ||
                                    line.includes('📍') ||
                                    line.includes('📝')
                                  ? 'text-blue-300'
                                  : line.includes('help:') ||
                                      line.includes('note:')
                                    ? 'text-blue-400'
                                    : line.includes('💪')
                                      ? 'text-amber-300'
                                      : 'text-zinc-400'
                        }
                      >
                        {line}
                      </div>
                    ))}
              </pre>
            </ScrollArea>
          </div>

          {/* AI Hint Panel */}
          {aiResponse && (
            <div className="bg-gradient-to-r from-rust/10 via-transparent to-transparent border border-rust/20 rounded-xl p-4 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-rust" />
                <span className="text-xs font-bold text-rust">AI Mentor</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
