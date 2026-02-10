import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import React, { useState, useRef } from 'react';
import { Video, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VideoComponent = (props: any) => {
  const [isEditing, setIsEditing] = useState(!props.node.attrs.url);
  const [url, setUrl] = useState(props.node.attrs.url || '');

  const save = () => {
    if (url) {
      props.updateAttributes({ url });
      setIsEditing(false);
    }
  };

  const cancel = () => {
    if (props.node.attrs.url) {
      setUrl(props.node.attrs.url);
      setIsEditing(false);
    } else {
        // If it was new and cancelled, maybe delete the node?
        props.deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="my-4">
      {isEditing ? (
        <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg">
          <Video className="text-zinc-500" size={20} />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video URL (YouTube, Vimeo, mp4)..."
            className="flex-1 h-8 bg-zinc-950 border-zinc-800"
            autoFocus
            onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') cancel();
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-green-500/20 hover:text-green-400" onClick={save}>
            <Check size={16} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400" onClick={cancel}>
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden bg-black aspect-video border border-zinc-800">
           {url.includes('youtube.com') || url.includes('youtu.be') ? (
               <iframe
                   src={`https://www.youtube.com/embed/${getYouTubeID(url)}`}
                   className="w-full h-full"
                   allowFullScreen
                   frameBorder="0"
               />
           ) : (
               <video src={url} controls className="w-full h-full" />
           )}

           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0 rounded-full shadow-lg">
                   <Pencil size={14} />
               </Button>
           </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

function getYouTubeID(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video-embed',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video-embed', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
});
