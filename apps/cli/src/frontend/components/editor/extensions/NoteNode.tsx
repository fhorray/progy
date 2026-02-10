import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2, ChevronDown } from 'lucide-react';

const NoteComponent = (props: any) => {
  const type = props.node.attrs.type || 'info';

  const iconMap: any = {
    info: Info,
    warn: AlertTriangle,
    error: AlertOctagon,
    success: CheckCircle2,
  };

  const colorMap: any = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    warn: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  const Icon = iconMap[type] || Info;
  const colors = colorMap[type] || colorMap.info;

  return (
    <NodeViewWrapper className={`my-4 rounded-lg border p-4 flex gap-4 ${colors} group relative overflow-hidden transition-colors`}>
      <div className="shrink-0 pt-0.5">
         <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
         {/* Title / Header */}
         <div className="flex items-center justify-between h-6">
             <span className="font-bold text-xs uppercase tracking-widest opacity-80 select-none">{type}</span>

             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex items-center gap-1.5">
                <div className="relative">
                    <select
                        value={type}
                        onChange={(e) => props.updateAttributes({ type: e.target.value })}
                        className="appearance-none bg-black/20 hover:bg-black/40 text-current text-[10px] font-bold py-1 pl-2 pr-6 rounded border border-current/20 focus:outline-none cursor-pointer"
                    >
                        <option value="info">INFO</option>
                        <option value="warn">WARN</option>
                        <option value="error">ERROR</option>
                        <option value="success">SUCCESS</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1.5 pointer-events-none opacity-70" />
                </div>
             </div>
         </div>

         <NodeViewContent className="prose prose-invert prose-sm max-w-none text-current/90 leading-relaxed" />
      </div>
    </NodeViewWrapper>
  );
};

export const NoteExtension = Node.create({
  name: 'note',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="note"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'note' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteComponent);
  },
});
