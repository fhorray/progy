import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Info, ListOrdered, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { updateTabContent, type EditorTab } from '../../stores/editor-store';

interface ModuleSettingsProps {
  tab: EditorTab;
}

export function ModuleSettings({ tab }: ModuleSettingsProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Simple TOML parser for info.toml
  useEffect(() => {
    const titleMatch = tab.content.match(/title\s*=\s*"([^"]+)"/);
    const messageMatch = tab.content.match(/message\s*=\s*"([^"]+)"/);

    setTitle(titleMatch ? titleMatch[1]! : '');
    setMessage(messageMatch ? messageMatch[1]! : '');

    // Extract exercises (very simple)
    const exercisesSection = tab.content.split('[exercises]')[1];
    if (exercisesSection) {
      const names = exercisesSection.split('\n')
        .map(line => line.match(/"([^"]+)"\s*=\s*"([^"]+)"/))
        .filter(m => !!m)
        .map(m => m![1]!);
      setExercises(names);
    }
  }, [tab.content]);

  const handleSave = () => {
    let newContent = tab.content;

    // Update title
    if (newContent.includes('title =')) {
      newContent = newContent.replace(/title\s*=\s*"[^"]*"/, `title = "${title}"`);
    } else if (newContent.includes('[module]')) {
      newContent = newContent.replace('[module]', `[module]\ntitle = "${title}"`);
    }

    // Update message
    if (newContent.includes('message =')) {
      newContent = newContent.replace(/message\s*=\s*"[^"]*"/, `message = "${message}"`);
    } else if (newContent.includes('[module]')) {
      newContent = newContent.replace('[module]', `[module]\nmessage = "${message}"`);
    }

    updateTabContent(tab.path, newContent);
    setIsDirty(false);
  };

  const handleChange = (type: 'title' | 'message', val: string) => {
    if (type === 'title') setTitle(val);
    if (type === 'message') setMessage(val);
    setIsDirty(true);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 py-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Module Settings</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Configure module metadata and ordering</p>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className={`gap-2 font-bold px-4 ${isDirty ? 'bg-orange-600 hover:bg-orange-500' : 'bg-zinc-800'}`}
            >
              <Save size={14} />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Info size={12} />
              Module Title
            </label>
            <Input
              value={title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Enter module title..."
              className="bg-zinc-900/50 border-zinc-800 text-sm h-11 focus:ring-orange-500/20"
            />
            <p className="text-[10px] text-zinc-600">The title shown in the sidebar and course dashboard.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={12} />
              Welcome Message
            </label>
            <textarea
              value={message}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Welcome student to this module..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zinc-700 transition-all text-zinc-300"
            />
            <p className="text-[10px] text-zinc-600">This message appears when the student enters the module.</p>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <ListOrdered size={12} />
              Exercise List
            </label>
            <div className="bg-zinc-900/30 rounded-xl border border-zinc-900 p-2 space-y-1">
              {exercises.length === 0 ? (
                <div className="p-4 text-center text-zinc-600 text-xs italic">
                  No exercises found in this module.
                </div>
              ) : (
                exercises.map((ex, i) => (
                  <div key={ex} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg group hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800 cursor-default">
                    <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 transition-colors">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{ex}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
              <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-500/70 leading-relaxed italic">
                Exercise ordering is currently determined by the folder name prefix (e.g. 01_intro).
                To reorder, rename the folders in the sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
