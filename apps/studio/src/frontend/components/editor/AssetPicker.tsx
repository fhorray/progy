import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileImage, Loader2, Check } from 'lucide-react';

interface Asset {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

interface AssetPickerProps {
  onClose: () => void;
  onSelect: (path: string) => void;
  currentValue?: string;
}

function DialogBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function AssetPicker({ onClose, onSelect, currentValue }: AssetPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/instructor/fs?path=assets&type=dir');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.filter((a: Asset) => a.type === 'file'));
      }
    } catch (e) {
      console.error('[AssetPicker] Failed to load assets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File is too large (max 2MB)');
      return;
    }

    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/instructor/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onSelect(data.path);
        onClose();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DialogBackdrop onClose={onClose}>
      <div className="flex flex-col h-[500px]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <FileImage size={16} className="text-blue-400" />
              Select Asset
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Choose an existing file or upload a new one
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Upload
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-black/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs font-medium">Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 border-dashed">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-medium">No assets found</p>
                <p className="text-xs mt-1">Upload your first image to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {assets.map((asset) => {
                const isSelected = currentValue === asset.path;
                return (
                  <button
                    key={asset.path}
                    onClick={() => onSelect(asset.path)}
                    className={`group relative aspect-square rounded-xl border overflow-hidden transition-all text-left ${isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                      }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      {/* In Bun local server, these assets are served via the static path /instructor/fs?path=... handled by fsGetHandler */}
                      <img
                        src={`/instructor/fs?path=${encodeURIComponent(asset.path)}`}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>

                    {/* Overlay info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] text-zinc-100 truncate font-medium">
                        {asset.name}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1 shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>
    </DialogBackdrop>
  );
}
