import React, { useEffect, useRef } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

// Languages
import { rust } from '@codemirror/lang-rust';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

import { updateTabContent, saveActiveFile } from '../../stores/editor-store';

// ─── Language Detection ─────────────────────────────────────────────────────

function getLanguageExtension(path: string): Extension[] {
  const ext = path.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'rs': return [rust()];
    case 'py': return [python()];
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx': return [javascript({ jsx: true, typescript: true })];
    case 'json': return [json()];
    case 'sql': return [sql()];
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp': return [cpp()];
    case 'go': return [go()];
    case 'md': return [markdown()];
    case 'html': return [html()];
    case 'css': return [css()];
    case 'toml': return []; // No official toml lang for CM6 in core, usually uses stream parsing or nothing
    default: return [];
  }
}

// ─── CodeEditor ─────────────────────────────────────────────────────────────

export interface CodeEditorProps {
  initialContent: string;
  path: string;
}

export function CodeEditor({ initialContent, path }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create state
    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        basicSetup,
        oneDark,
        getLanguageExtension(path),
        keymap.of([
          indentWithTab,
          {
            key: 'Mod-s',
            run: () => {
              saveActiveFile();
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            updateTabContent(path, update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: '"JetBrains Mono", "Fira Code", monospace' },
          '.cm-gutters': { backgroundColor: '#18181b', color: '#52525b', border: 'none' },
        }),
      ],
    });

    // Create view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [path]); // Re-create on path change (new file open)

  // Update doc if initialContent changes externally (e.g. from tab switch)
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== initialContent) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: initialContent },
      });
    }
  }, [initialContent]);

  return (
    <div className="h-full bg-[#282c34] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden" ref={editorRef} />
    </div>
  );
}
