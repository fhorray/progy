import React, { useEffect, useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { useForm, InputField, SelectField, CheckboxField } from '@progy/form';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Button } from '@progy/ui';

// Define schema
const courseConfigSchema = z.object({
  id: z.string().min(1, 'Course ID is required'),
  name: z.string().min(1, 'Course name is required'),
  progression: z.object({
    mode: z.enum(['sequential', 'open']),
    strict_module_order: z.boolean(),
  }),
  runner: z.object({
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    type: z.string().optional(),
  }),
  content: z.object({
    exercises: z.string().optional(),
    root: z.string().optional(),
  }).optional(),
});

type CourseConfigData = z.infer<typeof courseConfigSchema>;

export function ConfigForm() {
  const [config, setConfig] = useState<CourseConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/instructor/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
           const cfg = data.config;
           if (!cfg.progression) cfg.progression = { mode: 'sequential', strict_module_order: true };
           if (!cfg.runner) cfg.runner = { command: '', type: 'process' };
           setConfig(cfg);
        } else {
          setError(data.error || 'Failed to load config');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm gap-2">
        <Loader2 className="animate-spin" size={16} />
        Loading configuration...
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {error || 'No configuration found'}
      </div>
    );
  }

  return <ConfigFormEditor initialData={config} />;
}

function ConfigFormEditor({ initialData }: { initialData: CourseConfigData }) {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const form = useForm({
        defaultValues: initialData,
        validatorAdapter: zodValidator(),
        onSubmit: async ({ value }) => {
            setSaveStatus('saving');
            setSaveMessage(null);
            try {
                const res = await fetch('/instructor/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(value),
                });
                const data = await res.json();
                if (data.success) {
                    setSaveStatus('success');
                    setSaveMessage('Configuration saved successfully!');
                    setTimeout(() => {
                        setSaveStatus('idle');
                        setSaveMessage(null);
                    }, 2000);
                } else {
                    setSaveStatus('error');
                    setSaveMessage(data.error || 'Save failed');
                }
            } catch (e: any) {
                setSaveStatus('error');
                setSaveMessage(e.message);
            }
        },
    });

    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              Course Configuration
            </h2>
          </div>

          {saveStatus === 'error' && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
              {saveMessage}
            </div>
          )}

          {saveStatus === 'success' && (
            <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs">
              {saveMessage}
            </div>
          )}

          <form
             onSubmit={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 form.handleSubmit();
             }}
             className="space-y-5"
          >
            {/* Course ID */}
            <form.Field name="id">
                <InputField label="Course ID" required />
            </form.Field>

            {/* Course Name */}
            <form.Field name="name">
                <InputField label="Course Name" required />
            </form.Field>

            {/* Progression Section */}
            <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Progression Rules
              </h3>

              <div className="space-y-4">
                  <form.Field name="progression.mode">
                      <SelectField
                        label="Mode"
                        options={[
                            { value: 'sequential', label: 'Sequential (Lock Next)' },
                            { value: 'open', label: 'Open Navigation' }
                        ]}
                      />
                  </form.Field>

                  <form.Field name="progression.strict_module_order">
                     <CheckboxField label="Enforce strict module order" />
                  </form.Field>
              </div>
            </div>

            {/* Runner Section */}
            <div className="p-4 border border-zinc-700/40 rounded-lg bg-zinc-800/20">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Runner Configuration
              </h3>

              <div className="space-y-4">
                  <form.Field name="runner.command">
                      <InputField label="Command" className="font-mono" />
                  </form.Field>

                  <form.Field name="runner.type">
                      <SelectField
                        label="Type"
                        options={[
                            { value: 'process', label: 'Process' },
                            { value: 'docker-local', label: 'Docker (Local)' },
                            { value: 'docker-compose', label: 'Docker Compose' }
                        ]}
                      />
                  </form.Field>
              </div>
            </div>

            {/* Save Button */}
            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <Button
                        type="submit"
                        disabled={isSubmitting || saveStatus === 'saving'}
                        className="w-full gap-2"
                    >
                        {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Configuration'}
                    </Button>
                )}
            />
          </form>
        </div>
      </div>
    );
}
