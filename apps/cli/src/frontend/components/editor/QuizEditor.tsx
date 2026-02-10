import React, { useState, useEffect } from 'react';
import { Trash2, Plus, GripVertical, CheckCircle2 } from 'lucide-react';
import { updateTabContent } from '../../stores/editor-store';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: QuizOption[];
}

interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

interface QuizEditorProps {
  initialContent: string;
  path: string;
}

export function QuizEditor({ initialContent, path }: QuizEditorProps) {
  const [data, setData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialContent);
      // Basic validation
      if (!parsed.questions) parsed.questions = [];
      setData(parsed);
      setError(null);
    } catch (e) {
      console.error('[QuizEditor] Failed to parse quiz JSON:', e);
      setError('Failed to parse quiz JSON. Please check if the file is a valid JSON.');
    }
  }, [initialContent]);

  const updateStore = (newData: QuizData) => {
    setData(newData);
    updateTabContent(path, JSON.stringify(newData, null, 2));
  };

  const handleTitleChange = (title: string) => {
    if (!data) return;
    updateStore({ ...data, title });
  };

  const handleAddQuestion = () => {
    if (!data) return;
    const newQuestion: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: '',
      options: [
        { id: 'a', text: '', isCorrect: true },
        { id: 'b', text: '', isCorrect: false },
      ],
    };
    updateStore({ ...data, questions: [...data.questions, newQuestion] });
  };

  const handleRemoveQuestion = (index: number) => {
    if (!data) return;
    const questions = [...data.questions];
    questions.splice(index, 1);
    updateStore({ ...data, questions });
  };

  const handleQuestionChange = (index: number, question: string) => {
    if (!data) return;
    const questions = [...data.questions];
    questions[index] = { ...questions[index]!, question };
    updateStore({ ...data, questions });
  };

  const handleAddOption = (qIndex: number) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex]!;
    const nextId = String.fromCharCode(97 + question.options.length); // a, b, c, ...
    question.options = [...question.options, { id: nextId, text: '', isCorrect: false }];
    updateStore({ ...data, questions });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex]!;
    question.options.splice(oIndex, 1);
    updateStore({ ...data, questions });
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex]!;
    question.options[oIndex] = { ...question.options[oIndex]!, text };
    updateStore({ ...data, questions });
  };

  const handleOptionCorrectChange = (qIndex: number, oIndex: number) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex]!;
    question.options = question.options.map((o, i) => ({
      ...o,
      isCorrect: i === oIndex,
    }));
    updateStore({ ...data, questions });
  };

  const handleOptionExplanationChange = (qIndex: number, oIndex: number, explanation: string) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex]!;
    question.options[oIndex] = { ...question.options[oIndex]!, explanation };
    updateStore({ ...data, questions });
  };

  if (error) {
    return (
      <div className="p-12 flex items-center justify-center text-red-400 text-sm bg-zinc-900 h-full">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-zinc-900 pb-20">
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quiz Title</label>
        <Input
          value={data.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter quiz title..."
          className="text-xl font-bold bg-zinc-800/50 border-zinc-700 focus:border-rust"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Questions</h2>
          <Button onClick={handleAddQuestion} variant="outline" size="sm" className="gap-2 border-zinc-700 hover:bg-zinc-800">
            <Plus size={14} /> Add Question
          </Button>
        </div>

        {data.questions.map((q, qIndex) => (
          <Card key={q.id} className="p-6 bg-zinc-800/30 border-zinc-700/50 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 cursor-grab text-zinc-600 hover:text-zinc-400">
                <GripVertical size={16} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600">QUESTION {qIndex + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-zinc-600 hover:text-red-400 h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-zinc-900/50 border-zinc-700 focus:border-rust resize-none"
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Options</span>
                    <Button onClick={() => handleAddOption(qIndex)} variant="ghost" size="sm" className="h-6 text-[10px] gap-1 hover:bg-zinc-800">
                      <Plus size={10} /> ADD OPTION
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <div key={option.id} className="space-y-2 group">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOptionCorrectChange(qIndex, oIndex)}
                            className={`p-1 rounded-full transition-colors ${option.isCorrect ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-700 hover:text-emerald-500/50'
                              }`}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${option.id.toUpperCase()}`}
                            className={`bg-zinc-900/50 border-zinc-700 focus:border-rust text-sm ${option.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : ''
                              }`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 h-8 w-8"
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        {option.isCorrect && (
                          <div className="pl-9 pr-11">
                            <Textarea
                              value={option.explanation || ''}
                              onChange={(e) => handleOptionExplanationChange(qIndex, oIndex, e.target.value)}
                              placeholder="Add an explanation for the correct answer (optional)..."
                              className="text-xs bg-zinc-900/20 border-emerald-500/20 focus:border-emerald-500/50 text-zinc-400 placeholder-zinc-700 min-h-[60px] p-2"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data.questions.length > 0 && (
        <Button
          onClick={handleAddQuestion}
          variant="outline"
          className="w-full py-8 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30 text-zinc-500 gap-2"
        >
          <Plus size={16} /> Add Another Question
        </Button>
      )}
    </div>
  );
}
