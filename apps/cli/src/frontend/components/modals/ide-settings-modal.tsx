import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Code, Terminal, Zap } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $localSettings, updateLocalSettings } from '@/stores/user-store';

interface IdeSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [
  { id: 'code', name: 'VS Code', cmd: 'code', icon: Code },
  { id: 'cursor', name: 'Cursor', cmd: 'cursor', icon: Zap },
  { id: 'subl', name: 'Sublime Text', cmd: 'subl', icon: Terminal },
  { id: 'idea', name: 'IntelliJ IDEA', cmd: 'idea', icon: Code },
  { id: 'webstorm', name: 'WebStorm', cmd: 'webstorm', icon: Code },
  { id: 'pycharm', name: 'PyCharm', cmd: 'pycharm', icon: Code },
  { id: 'atom', name: 'Atom', cmd: 'atom', icon: Terminal },
  { id: 'vim', name: 'Vim (Terminal)', cmd: 'vim', icon: Terminal },
  { id: 'nvim', name: 'Neovim', cmd: 'nvim', icon: Terminal },
];

export function IdeSettingsModal({ open, onOpenChange }: IdeSettingsModalProps) {
  const settings = useStore($localSettings);
  const [selected, setSelected] = useState<string>('code');
  const [customCmd, setCustomCmd] = useState('');

  useEffect(() => {
    if (open) {
      const current = settings.ide || 'code';
      const preset = PRESETS.find(p => p.cmd === current);
      if (preset) {
        setSelected(preset.id);
        setCustomCmd('');
      } else {
        setSelected('custom');
        setCustomCmd(current);
      }
    }
  }, [open, settings.ide]);

  const handleSave = () => {
    const cmd = selected === 'custom' ? customCmd : PRESETS.find(p => p.id === selected)?.cmd || 'code';
    updateLocalSettings({ ide: cmd });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-orange-500" />
            Editor Preferences
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose which editor to open when you click "Open in IDE".
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selected} onValueChange={setSelected} className="grid grid-cols-2 gap-3">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <div key={preset.id}>
                  <RadioGroupItem value={preset.id} id={preset.id} className="peer sr-only" />
                  <Label
                    htmlFor={preset.id}
                    className="flex items-center justify-between rounded-md border-2 border-zinc-800 bg-zinc-900/50 p-3 hover:bg-zinc-800 hover:text-zinc-100 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 [&:has([data-state=checked])]:border-orange-500 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-zinc-400" />
                      <span className="font-semibold text-sm">{preset.name}</span>
                    </div>
                  </Label>
                </div>
              );
            })}

            <div className="col-span-2 mt-2">
              <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
              <Label
                htmlFor="custom"
                className="flex flex-col gap-2 rounded-md border-2 border-zinc-800 bg-zinc-900/50 p-3 hover:bg-zinc-800 hover:text-zinc-100 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="font-semibold text-sm">Custom Command</span>
                </div>
                <Input
                  value={customCmd}
                  onChange={(e) => {
                    setCustomCmd(e.target.value);
                    if (selected !== 'custom') setSelected('custom');
                  }}
                  placeholder="e.g. 'code-insiders' or 'subl'"
                  className="bg-zinc-950 border-zinc-800 h-8 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                />
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-800 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-500 text-white font-bold">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
