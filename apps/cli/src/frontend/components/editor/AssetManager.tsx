import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, File, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@nanostores/react';

export function AssetManager() {
  const [assets, setAssets] = useState<{ name: string; path: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/instructor/fs?path=assets&type=dir');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.map((f: any) => ({
          name: f.name,
          path: f.path,
          url: `/${f.path}` // served publicly
        })));
      } else {
        // Assets folder might not exist yet
        setAssets([]);
      }
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/instructor/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchAssets();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Upload error: ${e.message}`);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const copyMarkdown = (asset: { name: string; url: string }) => {
    const md = `![${asset.name}](${asset.url})`;
    navigator.clipboard.writeText(md);
    setCopied(asset.name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-64">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
          <ImageIcon size={16} className="text-orange-500" />
          Assets
        </h3>
        <div className="relative">
          <input
            type="file"
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            accept="image/*,video/*"
            disabled={uploading}
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-zinc-800" disabled={uploading}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-zinc-500">
            <Loader2 className="animate-spin w-5 h-5" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 text-xs">
            <div className="mb-2">No assets found</div>
            <div className="text-zinc-600">Upload images or videos to use in your course content.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div
                key={asset.path}
                className="group relative aspect-square bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden hover:border-zinc-600 transition-colors"
              >
                {asset.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <File size={24} className="text-zinc-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={() => copyMarkdown(asset)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-white shadow-sm transition-colors"
                        title="Copy Markdown Link"
                    >
                        {copied === asset.name ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1 text-[10px] truncate text-zinc-300 pointer-events-none">
                    {asset.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
