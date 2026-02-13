'use client';

import { useStore } from '@nanostores/react';
import { Brain, Loader2 } from 'lucide-react';
import {
  $quizData,
  $quizQuery,
  $selectedExercise,
  fetchExercises,
  fetchProgress,
} from '../../stores/course-store';
import { TabsContent } from '@progy/ui/tabs';
import { QuizView } from '../quiz-view';

export function QuizTab() {
  const quizData = useStore($quizData);
  const quizQuery = useStore($quizQuery);
  const selectedExercise = useStore($selectedExercise);

  const handleQuizComplete = async (score: number) => {
    if (!selectedExercise) return;
    const questions = quizData?.questions.length || 1;
    const passed = score / questions >= 0.7;

    if (passed) {
      try {
        await fetch('/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'quiz',
            id: selectedExercise.id,
            success: true,
          }),
        });
        fetchProgress();
        fetchExercises();
      } catch (err) {
        console.error('Failed to update quiz progress:', err);
      }
    }
  };

  return (
    <TabsContent value="quiz" className="flex-1 min-h-0 m-0 outline-none">
      {quizQuery.loading ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-rust" />
          <span className="text-xs font-medium">Loading Quiz...</span>
        </div>
      ) : quizData ? (
        <QuizView quiz={quizData} onComplete={handleQuizComplete} />
      ) : selectedExercise?.hasQuiz ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 p-8">
          <Brain className="w-8 h-8 text-zinc-800" />
          <p className="text-xs font-medium">
            Could not load quiz for this exercise.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3 p-8">
          <Brain className="w-8 h-8 text-zinc-800" />
          <p className="text-xs font-medium">This exercise has no quiz.</p>
        </div>
      )}
    </TabsContent>
  );
}
