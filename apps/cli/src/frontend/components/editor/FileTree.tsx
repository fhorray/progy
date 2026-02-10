import React, { useState, useEffect, useCallback } from 'react';
import { Folder, File, ChevronRight, ChevronDown, FolderPlus, BookPlus, Trash2, Search, Settings } from 'lucide-react';
import { openFile, loadFileTree, type FileNode, $fileTree, openModuleSettings } from '../../stores/editor-store';
import { useStore } from '@nanostores/react';
import { NewModuleDialog, NewExerciseDialog, DeleteDialog } from './ScaffoldDialogs';

// ─── Context Menu ───────────────────────────────────────────────────────────

type ContextMenuPos = { x: number; y: number; path: string; name: string } | null;

function ContextMenu({ pos, onClose, onDelete }: {
  pos: NonNullable<ContextMenuPos>;
  onClose: () => void;
  onDelete: (path: string) => void;
}) {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]"
      style={{ left: pos.x, top: pos.y }}
    >
      <button
        className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(pos.path);
          onClose();
        }}
      >
        <Trash2 size={12} /> Delete {pos.name}
      </button>
    </div>
  );
}

// ─── FileTreeNode (recursive) ───────────────────────────────────────────────

function FileTreeNode({ node, level = 0, onContextMenu }: {
  node: FileNode;
  level?: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileNode[]>([]);

  const handleClick = async () => {
    if (node.type === 'dir') {
      if (/^\d{2}_/.test(node.name)) {
        openModuleSettings(node.path, node.name);
      }

      if (!isOpen && children.length === 0) {
        try {
          const res = await fetch(
            `/instructor/fs?path=${encodeURIComponent(node.path)}&type=dir`
          );
          const data = await res.json();
          if (data.success) {
            setChildren(data.data);
          }
        } catch (e) {
          console.error('[FileTree] Load error:', e);
        }
      }
      setIsOpen(!isOpen);
    } else {
      openFile(node);
    }
  };

  return (
    <div>
      <div
        className="flex items-center py-1 hover:bg-white/5 cursor-pointer text-sm text-zinc-300 select-none transition-colors group"
        style={{ paddingLeft: `${level * 14 + 10}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <span className="mr-1 w-4 flex items-center justify-center shrink-0">
          {node.type === 'dir' &&
            (isOpen ? (
              <ChevronDown size={13} className="text-zinc-500" />
            ) : (
              <ChevronRight size={13} className="text-zinc-500" />
            ))}
        </span>
        {node.type === 'dir' ? (
          <Folder size={14} className="mr-2 text-blue-400 shrink-0" />
        ) : (
          <File size={14} className="mr-2 text-zinc-500 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen &&
        children.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            level={level + 1}
            onContextMenu={onContextMenu}
          />
        ))}
    </div>
  );
}

// ─── FileTree ───────────────────────────────────────────────────────────────

export function FileTree() {
  const rootFiles = useStore($fileTree);
  const [contextMenu, setContextMenu] = useState<ContextMenuPos>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showNewModule, setShowNewModule] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [treeVersion, setTreeVersion] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredFiles = rootFiles
    .filter(f => {
      const name = f.name.toLowerCase();
      if (name === 'course.json' || name === '.progy') return false;
      if (!searchFilter) return true;
      return name.includes(searchFilter.toLowerCase());
    });

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path: node.path, name: node.name });
  }, []);

  const handleCreated = useCallback(() => {
    loadFileTree();
    setTreeVersion(v => v + 1);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-800/80">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex-1">
          Explorer
        </span>
        <button
          onClick={() => openModuleSettings('.', 'Course Settings')}
          className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-orange-400 transition-colors"
          title="Course Settings"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => setShowNewModule(true)}
          className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-blue-400 transition-colors"
          title="New Module"
        >
          <FolderPlus size={14} />
        </button>
        <button
          onClick={() => setShowNewExercise(true)}
          className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-emerald-400 transition-colors"
          title="New Exercise"
        >
          <BookPlus size={14} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="px-2 py-1.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5 bg-zinc-800/60 rounded px-2 py-1">
          <Search size={12} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setSearchFilter(''); }}
            className="bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none w-full"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* File List — key forces re-mount when treeVersion changes */}
      <div className="flex-1 overflow-y-auto py-1" key={treeVersion}>
        {filteredFiles.length === 0 ? (
          <div className="px-4 py-4 text-xs text-zinc-600">
            {rootFiles.length === 0 ? 'Loading...' : 'No matching files'}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileTreeNode
              key={file.path}
              node={file}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          pos={contextMenu}
          onClose={() => setContextMenu(null)}
          onDelete={(path) => setDeleteTarget(path)}
        />
      )}

      {/* Dialogs */}
      {showNewModule && (
        <NewModuleDialog
          onClose={() => setShowNewModule(false)}
          onCreated={handleCreated}
        />
      )}
      {showNewExercise && (
        <NewExerciseDialog
          onClose={() => setShowNewExercise(false)}
          onCreated={handleCreated}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          path={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleCreated}
        />
      )}
    </div>
  );
}

