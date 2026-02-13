'use client';

import { useStore } from '@nanostores/react';
import {
  Bot,
  Eraser,
  HistoryIcon,
  Loader2,
  LockIcon,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import {
  $aiHistory,
  $aiResponse,
  $isAiLoading,
  $isAiLocked,
  $progress,
  $selectedExercise,
  deleteAiHistoryItem,
  clearAiHistory,
  getAiHint,
  explainExercise,
} from '../../stores/course-store';
import { Button } from '@progy/ui/button';
import { MarkdownRenderer } from '@progy/ui';
import { ScrollArea } from '@progy/ui/scroll-area';
import { TabsContent } from '@progy/ui/tabs';
import { PremiumGateModal } from '../modals/premium-gate-modal';
import React, { useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@progy/ui/accordion';

export function AIMentorTab() {
  const aiResponse = useStore($aiResponse);
  const isAiLoading = useStore($isAiLoading);
  const isAiLocked = useStore($isAiLocked);
  const history = useStore($aiHistory);
  const progress = useStore($progress);
  const selectedExercise = useStore($selectedExercise);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, aiResponse, isAiLoading]);

  return (
    <TabsContent
      value="ai"
      className="flex-1 min-h-0 m-0 outline-none flex flex-col"
    >
      {/* LOCKED STATE */}
      {isAiLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-5 p-8 text-center bg-zinc-950/50">
          <div className="w-16 h-16 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-lg">
            <LockIcon className="w-8 h-8 text-zinc-600" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h3 className="text-zinc-100 font-bold text-lg">
              AI Mentor Locked
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Upgrade to Pro to unlock unlimited hints and code explanations.
            </p>
          </div>
          <PremiumGateModal>
            <Button className="font-bold bg-gradient-to-r from-rust to-orange-600 hover:from-rust/90 hover:to-orange-500/90 text-white shadow-lg shadow-orange-900/20">
              Unlock AI Mentor
            </Button>
          </PremiumGateModal>
        </div>
      ) : (
        <>
          {/* HEADER ACTIONS */}
          <div className="flex-none p-4 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rust" />
              <span className="text-xs font-bold text-zinc-300">AI Mentor</span>
            </div>
            {(() => {
              const exerciseHistory = (
                Array.isArray(history) ? history : []
              ).filter((h: any) => h.exerciseId === selectedExercise?.id);

              if (exerciseHistory.length === 0) return null;

              return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (
                      selectedExercise?.id &&
                      confirm('Clear all history for this exercise?')
                    ) {
                      clearAiHistory(selectedExercise.id);
                    }
                  }}
                  className="h-7 text-[10px] text-zinc-500 hover:text-red-400 hover:bg-zinc-900/50 -mr-2"
                >
                  <Eraser className="w-3 h-3 mr-1.5" />
                  Clear Chat
                </Button>
              );
            })()}
          </div>

          <ScrollArea className="flex-1 w-full bg-zinc-950">
            <div className="p-4 lg:p-6 space-y-6 min-h-full">
              {(() => {
                const exerciseHistory = (Array.isArray(history) ? history : [])
                  .filter((h: any) => h.exerciseId === selectedExercise?.id)
                  .sort((a: any, b: any) => a.timestamp - b.timestamp); // Oldest first

                const hasTutorSuggestion =
                  progress?.tutorSuggestion &&
                  progress.tutorSuggestion.exerciseId === selectedExercise?.id;
                const hasHistory = exerciseHistory.length > 0;
                const hasContent = hasTutorSuggestion || hasHistory;

                return (
                  <>
                    {/* WELCOME / EMPTY STATE */}
                    {!hasContent && !aiResponse && !isAiLoading && (
                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <Bot className="w-12 h-12 text-zinc-700 mb-4" />
                        <p className="text-sm text-zinc-500 max-w-[200px]">
                          Hello! I'm here to help. Ask for a hint or an
                          explanation below.
                        </p>
                      </div>
                    )}

                    {/* CONTENT ACCORDION (TUTOR + HISTORY) */}
                    {hasContent && (
                      <Accordion
                        type="multiple"
                        className="w-full space-y-2"
                        defaultValue={hasTutorSuggestion ? ['tutor'] : []}
                      >
                        {/* 1. TUTOR SUGGESTION */}
                        {hasTutorSuggestion && (
                          <AccordionItem
                            value="tutor"
                            className="border border-rust/20 bg-rust/5 rounded-lg px-2 overflow-hidden"
                          >
                            <AccordionTrigger className="hover:no-underline py-3 px-2">
                              <div className="flex items-center gap-2 text-rust font-bold uppercase tracking-wider text-[10px]">
                                <Bot className="w-3.5 h-3.5" /> Tutor Suggestion
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pb-3">
                              <div className="prose prose-invert prose-sm max-w-none">
                                <MarkdownRenderer
                                  content={progress!.tutorSuggestion!.lesson}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {/* 2. HISTORY ITEMS */}
                        {exerciseHistory.map((item: any) => (
                          <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="border border-zinc-800/50 bg-zinc-900/20 rounded-lg px-2 overflow-hidden"
                          >
                            <div className="flex items-center w-full relative">
                              <AccordionTrigger className="hover:no-underline py-3 px-2 flex-1">
                                <div className="flex items-center gap-3 text-left">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${item.type === 'hint' ? 'text-rust' : 'text-blue-400'}`}
                                  >
                                    {item.type === 'hint'
                                      ? 'Hint'
                                      : 'Explanation'}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-normal">
                                    {new Date(
                                      item.timestamp,
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this message?'))
                                    deleteAiHistoryItem(item.id);
                                }}
                                className="absolute right-8 top-1/2 -translate-y-1/2 p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-zinc-800/50 transition-colors z-10"
                                title="Delete message"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <AccordionContent className="px-2 pb-3">
                              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                                <MarkdownRenderer content={item.content} />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </>
                );
              })()}

              {/* LIVE STREAMING RESPONSE */}
              {(isAiLoading || (aiResponse && aiResponse.length > 0)) && (
                <div className="pl-4 border-l-2 border-rust/50 relative mt-4">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-rust animate-pulse" />

                  <div className="flex items-center gap-2 mb-2 pl-2">
                    <span className="text-[10px] font-bold text-rust uppercase tracking-wider">
                      AI Thinking...
                    </span>
                    {isAiLoading && (
                      <Loader2 className="w-3 h-3 animate-spin text-rust" />
                    )}
                  </div>

                  <div className="bg-rust/5 rounded-lg p-3 border border-rust/10 ml-2">
                    {aiResponse ? (
                      <div className="prose prose-invert prose-sm max-w-none text-zinc-200">
                        <MarkdownRenderer content={aiResponse} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing code context...
                      </div>
                    )}

                    {/* Streaming Indicator */}
                    {isAiLoading && aiResponse && (
                      <div className="mt-2 flex gap-1">
                        <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-rust rounded-full animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* FOOTER ACTIONS */}
          <div className="flex-none p-4 bg-zinc-950 border-t border-zinc-800/60">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={getAiHint}
                disabled={isAiLoading}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300"
              >
                <Sparkles className="w-4 h-4 mr-2 text-rust" />
                Get Hint
              </Button>
              <Button
                variant="outline"
                onClick={explainExercise}
                disabled={isAiLoading}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300"
              >
                <Bot className="w-4 h-4 mr-2 text-blue-400" />
                Explain Code
              </Button>
            </div>
          </div>
        </>
      )}
    </TabsContent>
  );
}
